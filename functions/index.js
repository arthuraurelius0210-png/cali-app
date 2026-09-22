'use strict';
// Alle Datumsrechnungen (Wochenstart, "heute") laufen in deutscher Zeit wie auf den Geräten der Nutzer.
process.env.TZ = 'Europe/Berlin';

const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const https = require('https');
const http = require('http');
const R = require('./lib/rewards');
const E = require('./shared/econ');

admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ── Overpass-Proxy (Parks-Karte) ──────────────────────────
const SERVERS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

function doRequest(url, postData) {
  return new Promise(function(resolve, reject) {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'CALI-App/1.0'
      }
    };
    const req = lib.request(options, function(res) {
      let data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        if (res.statusCode !== 200) {
          reject(new Error('HTTP ' + res.statusCode));
        } else {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, function() { req.destroy(new Error('Timeout')); });
    req.write(postData);
    req.end();
  });
}

exports.overpass = onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  let query = '';
  if (req.method === 'POST') {
    const raw = req.rawBody ? req.rawBody.toString('utf8') : '';
    query = raw.startsWith('data=') ? decodeURIComponent(raw.slice(5)) : raw;
  } else {
    query = req.query.data || '';
  }

  if (!query) {
    res.status(400).json({ error: 'No query' });
    return;
  }

  const postData = 'data=' + encodeURIComponent(query);
  let lastError = '';

  for (let i = 0; i < SERVERS.length; i++) {
    try {
      const result = await doRequest(SERVERS[i], postData);
      res.status(200).type('application/json').send(result);
      return;
    } catch (e) {
      lastError = SERVERS[i] + ': ' + e.message;
      console.log('Failed:', lastError);
    }
  }

  res.status(502).json({ error: 'All servers failed: ' + lastError });
});

// ── Geldbörse, XP, Abnahmen ───────────────────────────────
// Der Client darf wallets/xp nur lesen. Jede Gutschrift und jede Ausgabe läuft hier
// durch eine Transaktion; die Prüfregeln stehen in lib/rewards.js.

function requireUid(req) {
  if (!req.auth || !req.auth.uid) throw new HttpsError('unauthenticated', 'Bitte einloggen');
  return req.auth.uid;
}
function requireAdmin(req) {
  const uid = requireUid(req);
  if (uid !== R.ADMIN_UID) throw new HttpsError('permission-denied', 'Nur der Admin darf das');
  return uid;
}
function str(v, max) { return typeof v === 'string' ? v.slice(0, max || 200) : ''; }
const ERR = { already: 'already-exists', insufficient: 'failed-precondition', invalid: 'invalid-argument', nodata: 'failed-precondition', notdone: 'failed-precondition', notbetter: 'failed-precondition', limit: 'resource-exhausted' };
function toErr(res) { return new HttpsError(ERR[res.code] || 'failed-precondition', res.message); }
const walletRef = uid => db.collection('wallets').doc(uid);

// Erster Aufruf nach dem Login: legt die Geldbörse an (einmaliger Import der Geräte-Diamanten, gedeckelt)
exports.syncWallet = onCall(async (req) => {
  const uid = requireUid(req);
  const local = req.data && req.data.localDiamonds;
  const ref = walletRef(uid);
  const w = await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    if (snap.exists) return R.normalizeWallet(snap.data());
    const nw = R.initialWallet(local, new Date());
    tx.set(ref, nw);
    return nw;
  });
  return { wallet: R.publicWallet(w) };
});

// Belohnung gutschreiben: {type, key, label}
exports.earn = onCall(async (req) => {
  const uid = requireUid(req);
  const data = req.data || {};
  const type = str(data.type, 30), key = str(data.key, 120), label = str(data.label, 80);
  if (!E.CALI_ECON.earn[type]) throw new HttpsError('invalid-argument', 'Unbekannte Belohnung');

  let parkKingCount = 0;
  if (type === 'parkking') {
    const s = await db.collection('parkKings').where('uid', '==', uid).limit(20).get();
    parkKingCount = s.size;
  }
  const uRef = db.collection('users').doc(uid), wRef = walletRef(uid), xRef = db.collection('xp').doc(uid);
  return db.runTransaction(async tx => {
    const [uS, wS, xS] = await Promise.all([tx.get(uRef), tx.get(wRef), tx.get(xRef)]);
    const xpDoc = xS.exists ? xS.data() : { totalXP: 0, monthlyXP: {} };
    let battle = null, bRef = null, oppLevel = 1;
    if (type === 'battle') {
      bRef = db.collection('battles').doc(key);
      const bS = await tx.get(bRef);
      battle = bS.exists ? bS.data() : null;
      if (battle) {
        const opp = battle.challengerId === uid ? battle.challengedId : battle.challengerId;
        if (opp) {
          const oS = await tx.get(db.collection('xp').doc(opp));
          oppLevel = oS.exists ? R.levelOf(oS.data().totalXP) : 1;
        }
      }
    }
    const ctx = {
      uid, user: uS.exists ? uS.data() : {}, wallet: R.normalizeWallet(wS.exists ? wS.data() : null),
      xp: xpDoc, now: new Date(), parkKingCount, battle, myLevel: R.levelOf(xpDoc.totalXP), oppLevel
    };
    const res = R.evaluate(type, key, ctx);
    if (!res.ok) throw toErr(res);
    const out = R.applyEarn(ctx, type, key, res, label);
    tx.set(wRef, out.wallet);
    tx.set(xRef, out.xp, { merge: true });
    if (out.log) tx.set(db.collection('xpLog').doc(), out.log);
    if (bRef) tx.update(bRef, { xpAwardedTo: uid });
    return out.result;
  });
});

// Diamanten ausgeben: {what}
exports.spend = onCall(async (req) => {
  const uid = requireUid(req);
  const what = str(req.data && req.data.what, 20);
  const wRef = walletRef(uid);
  return db.runTransaction(async tx => {
    const wS = await tx.get(wRef);
    const ctx = { uid, wallet: R.normalizeWallet(wS.exists ? wS.data() : null), now: new Date() };
    const res = R.evaluateSpend(what, ctx);
    if (!res.ok) throw toErr(res);
    const out = R.applySpend(ctx, what, res.cost);
    tx.set(wRef, out.wallet);
    return out.result;
  });
});

// Abnahme beantragen: {key, videoPath} — Video muss schon im eigenen Storage-Ordner liegen
exports.requestVerification = onCall(async (req) => {
  const uid = requireUid(req);
  const key = str(req.data && req.data.key, 120), videoPath = str(req.data && req.data.videoPath, 300);
  if (videoPath.indexOf('verificationVideos/' + uid + '/') !== 0) throw new HttpsError('invalid-argument', 'Video liegt nicht im eigenen Ordner');
  const [exists] = await admin.storage().bucket().file(videoPath).exists();
  if (!exists) throw new HttpsError('failed-precondition', 'Video wurde nicht gefunden, bitte nochmal hochladen');
  const uRef = db.collection('users').doc(uid), wRef = walletRef(uid);
  const vRef = db.collection('verifications').doc();
  return db.runTransaction(async tx => {
    const [uS, wS] = await Promise.all([tx.get(uRef), tx.get(wRef)]);
    const ctx = { uid, user: uS.exists ? uS.data() : {}, wallet: R.normalizeWallet(wS.exists ? wS.data() : null), now: new Date() };
    const res = R.evaluateVerification(ctx, key, videoPath);
    if (!res.ok) throw toErr(res);
    const out = R.applyVerification(ctx, key, res.item, res.cost, videoPath, vRef.id);
    tx.set(wRef, out.wallet);
    tx.set(vRef, out.doc);
    return out.result;
  });
});

// Admin entscheidet: {id, decision:'approved'|'rejected', note, refund}
exports.reviewVerification = onCall(async (req) => {
  requireAdmin(req);
  const data = req.data || {};
  const id = str(data.id, 60), decision = str(data.decision, 10), note = str(data.note, 300), refund = !!data.refund;
  if (!id) throw new HttpsError('invalid-argument', 'Abnahme fehlt');
  const vRef = db.collection('verifications').doc(id);
  const done = await db.runTransaction(async tx => {
    const vS = await tx.get(vRef);
    if (!vS.exists) throw new HttpsError('not-found', 'Abnahme nicht gefunden');
    const v = Object.assign({ id: vS.id }, vS.data());
    const wRef = walletRef(v.uid);
    const wS = await tx.get(wRef);
    const ctx = { uid: v.uid, wallet: R.normalizeWallet(wS.exists ? wS.data() : null), now: new Date() };
    const res = R.applyReview(ctx, v, decision, note, refund);
    if (!res.ok) throw toErr(res);
    tx.set(wRef, res.wallet);
    tx.update(vRef, res.update);
    if (res.badge) tx.set(db.collection('verifiedBadges').doc(v.uid), { items: FieldValue.arrayUnion(res.badge), updatedAt: Date.now() }, { merge: true });
    return { videoPath: v.videoPath, decision };
  });
  // Video nach der Entscheidung löschen (Datenschutz); Fehler hier blockieren die Entscheidung nicht
  if (done.videoPath) {
    try { await admin.storage().bucket().file(done.videoPath).delete(); } catch (e) { console.log('video delete', e.message); }
  }
  return { ok: true, decision: done.decision };
});

// Admin schreibt Diamanten gut (Tests, Freunde, Entschädigung): {uid, diamonds, reason}
exports.adminGrant = onCall(async (req) => {
  const by = requireAdmin(req);
  const data = req.data || {};
  const uid = str(data.uid, 128), n = parseInt(data.diamonds, 10), reason = str(data.reason, 120);
  if (!uid || !(n > 0) || n > 100000) throw new HttpsError('invalid-argument', 'UID und Anzahl (1 bis 100000) angeben');
  const wRef = walletRef(uid);
  const w = await db.runTransaction(async tx => {
    const wS = await tx.get(wRef);
    const wallet = R.normalizeWallet(wS.exists ? wS.data() : null);
    wallet.diamonds += n;
    wallet.updatedAt = Date.now();
    if (!wallet.createdAt) wallet.createdAt = wallet.updatedAt;
    tx.set(wRef, wallet);
    tx.set(db.collection('walletLog').doc(), { uid, diamonds: n, reason, by, date: wallet.updatedAt });
    return wallet;
  });
  return { ok: true, diamonds: w.diamonds };
});
