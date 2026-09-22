'use strict';
// Reine Entscheidungslogik für Geldbörse, XP und Abnahmen. Keine Firestore-Aufrufe,
// damit alles in lib/rewards.test.js ohne Emulator prüfbar ist. index.js liest die
// Dokumente, ruft evaluate*/apply* auf und schreibt das Ergebnis in einer Transaktion.
// Die Regeln (Werte, Tabellen, Fortschrittsrechnung) kommen aus den geteilten Browser-
// Dateien in ../shared (Kopie von public/, siehe sync-shared.js).

const { caliCalcProgress, parseMaxVal, presetParams } = require('../shared/calc');
const { EX_DB } = require('../shared/exdb');
const E = require('../shared/econ');
const W = require('../shared/wochen');

const ADMIN_UID = 'u8PNuq4y2ahh2p7rukCa0vGD4su1';
const DAY_MS = 86400000;

function pad(n){ return (n < 10 ? '0' : '') + n; }
// Datum in der Zeitzone des Prozesses (index.js setzt TZ=Europe/Berlin)
function localDate(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function dayDiff(a, b){ return Math.round((Date.parse(a) - Date.parse(b)) / DAY_MS); }

function fail(code, message){ return {ok:false, code:code, message:message}; }

// Leeres bzw. bereinigtes Geldbörsen-Dokument
function normalizeWallet(w){
  w = w || {};
  return {
    diamonds: Math.max(0, parseInt(w.diamonds, 10) || 0),
    awarded: (w.awarded && typeof w.awarded === 'object') ? w.awarded : {},
    daily: (w.daily && typeof w.daily === 'object') ? w.daily : {},
    completed: Array.isArray(w.completed) ? w.completed : [],
    verifications: (w.verifications && typeof w.verifications === 'object') ? w.verifications : {},
    migrated: !!w.migrated,
    createdAt: w.createdAt || null
  };
}

// Tageszähler: nur der heutige Tag bleibt stehen
function dailyCount(wallet, today, type){
  const d = wallet.daily[today] || {};
  return d[type] || 0;
}
function bumpDaily(wallet, today, type){
  const d = Object.assign({}, wallet.daily[today] || {});
  d[type] = (d[type] || 0) + 1;
  wallet.daily = {}; wallet.daily[today] = d;
}

function userData(user){
  return {ents: Array.isArray(user.ents) ? user.ents : [], maxEntries: Array.isArray(user.maxEntries) ? user.maxEntries : [], exdb: EX_DB, savedParks: 0};
}

function firstActiveDate(user){
  const ents = Array.isArray(user.ents) ? user.ents : [];
  let first = null;
  for(const e of ents){ if(e && e.date && (!first || e.date < first)) first = e.date; }
  if(!first && user.prData && user.prData.joinDate) first = user.prData.joinDate;
  return first;
}

// Aktuelle Wochen-Challenge aus Sicht des Servers (gleiche Rotation wie wochen.js)
function weeklyChallengeFor(now, wochenState){
  const key = E.econWeekKey(now);
  const idx = W.wochenIndex(now);
  const swapped = !!(wochenState && wochenState.week === key && wochenState.swapped);
  return {key: key, ch: W.WOCHEN_CHALLENGES[swapped ? W.wochenAltIndex(idx) : idx]};
}

// ── Belohnung prüfen ──
// ctx = {uid, user, wallet, xp, now, parkKingCount, battle, myLevel, oppLevel}
// Ergebnis: {ok:true, xp, diamonds, completed?} oder {ok:false, code, message}
function evaluate(type, key, ctx){
  const rule = E.CALI_ECON.earn[type];
  if(!rule) return fail('invalid', 'Unbekannte Belohnung');
  if(typeof key !== 'string' || !key || key.length > 120) return fail('invalid', 'Ungültiger Schlüssel');
  const wallet = ctx.wallet, user = ctx.user || {}, now = ctx.now || new Date();
  const today = localDate(now);
  const awardKey = type + '|' + key;
  if(wallet.awarded[awardKey]) return fail('already', 'Schon gutgeschrieben');
  if(dailyCount(wallet, today, type) >= rule.perDay) return fail('limit', 'Tageslimit erreicht');

  let xp = rule.xp, diamonds = rule.diamonds, completed = null;

  if(type === 'workout'){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(key)) return fail('invalid', 'Datum erwartet');
    if(Math.abs(dayDiff(today, key)) > 1) return fail('invalid', 'Workout liegt nicht in den letzten Tagen');
    const ents = userData(user).ents;
    if(!ents.some(e => e && e.date === key && Array.isArray(e.sets) && e.sets.length)) return fail('nodata', 'Kein gespeichertes Workout an dem Tag');
  }
  else if(type === 'pr'){
    const parts = key.split('|');
    if(parts.length < 3) return fail('invalid', 'name|datum|wert erwartet');
    const name = parts[0], date = parts[1], val = parts.slice(2).join('|');
    const max = userData(user).maxEntries;
    const me = max.find(m => m && m.name === name && m.date === date && String(m.val) === val);
    if(!me) return fail('nodata', 'Max-Wert nicht gefunden');
    if(Math.abs(dayDiff(today, date)) > 1) return fail('invalid', 'Rekord liegt nicht in den letzten Tagen');
    const newV = parseMaxVal(me.val, me.unit);
    let prev = 0;
    for(const o of max){
      if(!o || o === me || o.name !== name) continue;
      const older = (o.date < me.date) || (o.date === me.date && (parseFloat(o.id) || 0) < (parseFloat(me.id) || 0));
      if(!older) continue;
      const v = parseMaxVal(o.val, o.unit);
      if(v > prev) prev = v;
    }
    if(!(prev > 0 && newV > prev)) return fail('notbetter', 'Kein neuer Rekord');
  }
  else if(type === 'challenge'){
    const ch = user.challenge;
    if(!ch || !ch.params) return fail('nodata', 'Keine aktive Challenge gespeichert');
    const expect = String(ch.id) + '|' + String(ch.startDate || '');
    if(key !== expect) return fail('invalid', 'Challenge passt nicht zur gespeicherten');
    const target = parseFloat(ch.params.target) || 1;
    const prog = caliCalcProgress(ch, userData(user), {now: now});
    if(prog < target) return fail('notdone', 'Challenge noch nicht geschafft (' + prog + ' / ' + target + ')');
    completed = {kind:'challenge', id:String(ch.id), title:String(ch.title || ch.id), date:today, key:'challenge|' + key};
  }
  else if(type === 'weekly'){
    const wk = weeklyChallengeFor(now, user.wochen);
    if(key !== wk.key) return fail('invalid', 'Nur die laufende Woche kann abgeholt werden');
    const st = user.wochen && user.wochen.week === wk.key ? user.wochen : {checkins: []};
    const ch = wk.ch;
    const pseudo = {id: ch.id, title: ch.title, params: presetParams(ch), checkins: Array.isArray(st.checkins) ? st.checkins : []};
    const target = ch.target || 1;
    const prog = caliCalcProgress(pseudo, userData(user), {now: now});
    if(prog < target) return fail('notdone', 'Wochen-Challenge noch nicht geschafft (' + prog + ' / ' + target + ')');
    completed = {kind:'weekly', id:ch.id, title:ch.title, week:wk.key, date:today, key:'weekly|' + wk.key};
  }
  else if(type === 'milestone'){
    const days = parseInt(key, 10);
    const m = E.MILESTONES.find(x => x.days === days);
    if(!m) return fail('invalid', 'Unbekannter Meilenstein');
    const first = firstActiveDate(user);
    if(!first) return fail('nodata', 'Noch kein Training gespeichert');
    if(dayDiff(today, first) < days) return fail('notdone', 'Meilenstein noch nicht erreicht');
    diamonds = m.diamonds;
  }
  else if(type === 'skill'){
    if(!/^[a-z0-9_]{2,40}$/.test(key)) return fail('invalid', 'Skill-ID erwartet');
  }
  else if(type === 'parkking'){
    if(key !== today) return fail('invalid', 'Nur für heute');
    const n = parseInt(ctx.parkKingCount, 10) || 0;
    if(n < 1) return fail('nodata', 'Kein Park King');
    xp = rule.xp * Math.min(n, 10);
  }
  else if(type === 'battle'){
    const b = ctx.battle;
    if(!b) return fail('nodata', 'Battle nicht gefunden');
    if(b.status !== 'completed' || b.winnerId !== ctx.uid) return fail('notdone', 'Battle nicht gewonnen');
    if(b.xpAwardedTo) return fail('already', 'Battle schon verrechnet');
    xp = E.calcBattleXP(ctx.myLevel || 1, ctx.oppLevel || 1, true);
  }
  return {ok:true, xp:xp, diamonds:diamonds, completed:completed};
}

// Ergebnis von evaluate auf Geldbörse und XP-Dokument anwenden (reine Objekte, kein I/O)
function applyEarn(ctx, type, key, res, reasonLabel){
  const wallet = normalizeWallet(ctx.wallet), xpDoc = Object.assign({}, ctx.xp || {});
  const now = ctx.now || new Date(), today = localDate(now), nowMs = now.getTime();
  const oldXP = parseInt(xpDoc.totalXP, 10) || 0;
  const newXP = oldXP + res.xp;
  const bonus = E.levelUpDiamonds(oldXP, newXP);
  const oldLevel = E.getLevelFromXP(oldXP).level, newLevel = E.getLevelFromXP(newXP).level;

  wallet.awarded[type + '|' + key] = nowMs;
  bumpDaily(wallet, today, type);
  wallet.diamonds += res.diamonds + bonus;
  if(res.completed){
    const list = wallet.completed.filter(c => c.key !== res.completed.key);
    list.push(res.completed);
    wallet.completed = list.slice(-200);
  }
  wallet.updatedAt = nowMs;
  if(!wallet.createdAt) wallet.createdAt = nowMs;
  wallet.migrated = true;

  const monthKey = today.slice(0, 7);
  const monthly = Object.assign({}, xpDoc.monthlyXP || {});
  if(res.xp > 0) monthly[monthKey] = (monthly[monthKey] || 0) + res.xp;
  const xpOut = {totalXP:newXP, monthlyXP:monthly, level:newLevel, lastUpdated:nowMs, diamonds:(parseInt(xpDoc.diamonds, 10) || 0) + bonus};

  const log = res.xp > 0 ? {uid:ctx.uid, amount:res.xp, reason:reasonLabel || E.CALI_ECON.earn[type].label, total:newXP, date:nowMs} : null;
  return {
    wallet: wallet, xp: xpOut, log: log,
    result: {ok:true, type:type, xp:res.xp, diamonds:res.diamonds, diamondBonus:bonus, levelUp:newLevel > oldLevel, oldLevel:oldLevel, newLevel:newLevel, totalXP:newXP, wallet:publicWallet(wallet)}
  };
}

// ── Ausgeben ──
function evaluateSpend(what, ctx){
  const cost = E.CALI_ECON.spend[what];
  if(!cost) return fail('invalid', 'Unbekannter Kauf');
  if(ctx.wallet.diamonds < cost) return fail('insufficient', 'Nicht genug Diamanten: ' + cost + ' nötig, ' + ctx.wallet.diamonds + ' da');
  return {ok:true, cost:cost};
}
function applySpend(ctx, what, cost){
  const wallet = normalizeWallet(ctx.wallet), nowMs = (ctx.now || new Date()).getTime();
  wallet.diamonds -= cost;
  wallet.updatedAt = nowMs;
  return {wallet: wallet, result: {ok:true, what:what, cost:cost, wallet:publicWallet(wallet)}};
}

// ── Abnahme beantragen ──
// key = completed.key ('challenge|p5|2026-09-22' oder 'weekly|2026-W39'), videoPath im eigenen Ordner
function evaluateVerification(ctx, key, videoPath){
  const wallet = ctx.wallet, cost = E.CALI_ECON.verifyCost;
  if(typeof key !== 'string' || !key) return fail('invalid', 'Challenge fehlt');
  const item = wallet.completed.find(c => c.key === key);
  if(!item) return fail('nodata', 'Diese Challenge ist bei dir nicht als geschafft eingetragen');
  const prev = wallet.verifications[key];
  if(prev && (prev.status === 'pending' || prev.status === 'approved')) return fail('already', prev.status === 'pending' ? 'Abnahme läuft schon' : 'Schon verifiziert');
  if(typeof videoPath !== 'string' || videoPath.indexOf('verificationVideos/' + ctx.uid + '/') !== 0 || videoPath.length > 300) return fail('invalid', 'Video liegt nicht im eigenen Ordner');
  if(wallet.diamonds < cost) return fail('insufficient', 'Nicht genug Diamanten: ' + cost + ' nötig, ' + wallet.diamonds + ' da');
  return {ok:true, item:item, cost:cost};
}
function applyVerification(ctx, key, item, cost, videoPath, docId){
  const wallet = normalizeWallet(ctx.wallet), nowMs = (ctx.now || new Date()).getTime();
  wallet.diamonds -= cost;
  wallet.verifications[key] = {status:'pending', id:docId, at:nowMs};
  wallet.updatedAt = nowMs;
  const name = (ctx.user && ctx.user.prData && ctx.user.prData.name) ? String(ctx.user.prData.name).slice(0, 60) : 'Athlet';
  const doc = {uid:ctx.uid, name:name, key:key, kind:item.kind, challengeId:item.id, title:item.title, week:item.week || null, completedAt:item.date || null, videoPath:videoPath, status:'pending', cost:cost, createdAt:nowMs};
  return {wallet: wallet, doc: doc, result: {ok:true, id:docId, wallet:publicWallet(wallet)}};
}

// ── Abnahme entscheiden (Admin) ──
function applyReview(ctx, verification, decision, note, refund){
  if(!verification || verification.status !== 'pending') return fail('invalid', 'Abnahme ist nicht mehr offen');
  if(decision !== 'approved' && decision !== 'rejected') return fail('invalid', 'Entscheidung fehlt');
  const wallet = normalizeWallet(ctx.wallet), nowMs = (ctx.now || new Date()).getTime();
  const cleanNote = typeof note === 'string' ? note.slice(0, 300) : '';
  const refunded = decision === 'rejected' && !!refund;
  if(refunded) wallet.diamonds += verification.cost || E.CALI_ECON.verifyCost;
  wallet.verifications[verification.key] = {status:decision, id:verification.id || null, at:nowMs, note:cleanNote, refunded:refunded};
  wallet.updatedAt = nowMs;
  const badge = decision === 'approved' ? {key:verification.key, kind:verification.kind, id:verification.challengeId, title:verification.title, week:verification.week || null, at:nowMs} : null;
  return {ok:true, wallet:wallet, update:{status:decision, note:cleanNote, refunded:refunded, decidedAt:nowMs, decidedBy:ADMIN_UID, videoPath:null}, badge:badge};
}

// ── Einmaliger Import der Geräte-Diamanten ──
function initialWallet(localDiamonds, now){
  const cap = E.CALI_ECON.migrateCap;
  const n = Math.max(0, Math.min(cap, parseInt(localDiamonds, 10) || 0));
  const w = normalizeWallet({diamonds:n, migrated:true, createdAt:now.getTime()});
  w.updatedAt = now.getTime();
  w.imported = n;
  return w;
}

// Was der Client sehen darf (ohne Tageszähler und Schlüssel-Historie)
function publicWallet(w){
  return {diamonds:w.diamonds, completed:w.completed, verifications:w.verifications};
}

module.exports = {
  ADMIN_UID, localDate, normalizeWallet, evaluate, applyEarn, evaluateSpend, applySpend,
  evaluateVerification, applyVerification, applyReview, initialWallet, publicWallet, weeklyChallengeFor,
  levelOf: xp => E.getLevelFromXP(parseInt(xp, 10) || 0).level
};
