'use strict';
// Tests der Belohnungslogik ohne Emulator. Läuft als predeploy-Hook (firebase.json) und per `npm test`.
process.env.TZ = 'Europe/Berlin';
require('../sync-shared');
const R = require('./rewards');
const E = require('../shared/econ');

let pass = 0, fail = 0;
function eq(name, got, exp){ const ok = JSON.stringify(got) === JSON.stringify(exp); ok ? pass++ : fail++; console.log((ok ? 'OK   ' : 'FAIL ') + name + (ok ? '' : '  got ' + JSON.stringify(got) + ' expected ' + JSON.stringify(exp))); }
function ok(name, cond, info){ eq(name + (cond ? '' : ' [' + (info || '') + ']'), !!cond, true); }

const NOW = new Date(2026, 8, 22, 18, 30); // Di 22.09.2026, KW 39 → Wochen-Challenge w1 (Hundert Liegestütze)
const iso = d => R.localDate(d);
const today = iso(NOW), yesterday = iso(new Date(2026, 8, 21)), monday = '2026-09-21', lastWeek = '2026-09-12', tenDaysAgo = '2026-09-12';
const ents = [
  {id: 1, date: monday, name: 'Liegestutze', unit: 'Wdh', sets: [{n: '40'}, {n: '35'}], woId: 'a'},
  {id: 2, date: today, name: 'Liegestutze (eng)', unit: 'Wdh', sets: [{n: '30'}], woId: 'b'},
  {id: 3, date: today, name: 'Plank', unit: 'Sek', sets: [{n: '60'}, {n: '30'}], woId: 'b'},
  {id: 4, date: lastWeek, name: 'Liegestutze', unit: 'Wdh', sets: [{n: '99'}], woId: 'z'},
  {id: 5, date: tenDaysAgo, name: 'Kniebeugen', unit: 'Wdh', sets: [{n: '10'}], woId: 'z'}
];
const maxEntries = [
  {id: 100, date: lastWeek, name: 'Klimmzuge Max', unit: 'Wdh', val: '12'},
  {id: 101, date: today, name: 'Klimmzuge Max', unit: 'Wdh', val: '14'},
  {id: 102, date: today, name: 'Plank Max', unit: 'Min:Sek', val: '2:30'},
  {id: 103, date: today, name: 'Dips Max', unit: 'Wdh', val: '8'}
];
function ctx(over){
  return Object.assign({uid: 'u1', user: {ents, maxEntries, prData: {name: 'Mara'}}, wallet: R.normalizeWallet(null), xp: {totalXP: 0, monthlyXP: {}}, now: NOW}, over || {});
}
function earn(type, key, c){ c = c || ctx(); const r = R.evaluate(type, key, c); if(!r.ok) return r; const a = R.applyEarn(c, type, key, r); c.wallet = a.wallet; c.xp = a.xp; return Object.assign({applied: a}, r); }

// Workout
eq('Workout heute: +10 XP', earn('workout', today).xp, 10);
eq('Workout gestern (Eintrag vorhanden): +10 XP', earn('workout', yesterday).xp, 10);
eq('Workout morgen ohne Eintrag', earn('workout', '2026-09-23').code, 'nodata');
eq('Workout vor 10 Tagen: zu alt', earn('workout', tenDaysAgo).code, 'invalid');
eq('Workout kaputtes Datum', earn('workout', 'heute').code, 'invalid');
{ const c = ctx(); earn('workout', today, c); eq('Workout zweimal: schon gutgeschrieben', R.evaluate('workout', today, c).code, 'already'); }

// Rekord
eq('Rekord 12→14: +50 XP +1 Diamant', (r => [r.xp, r.diamonds])(earn('pr', 'Klimmzuge Max|' + today + '|14')), [50, 1]);
eq('Rekord Min:Sek ohne Vorwert: kein Rekord', earn('pr', 'Plank Max|' + today + '|2:30').code, 'notbetter');
eq('Rekord ohne Vorwert (Dips)', earn('pr', 'Dips Max|' + today + '|8').code, 'notbetter');
eq('Rekord unbekannt', earn('pr', 'Dips Max|' + today + '|99').code, 'nodata');
eq('Rekord Schlüssel kaputt', earn('pr', 'x').code, 'invalid');

// Challenge (aktive, gespeichert im users-Dokument)
{
  const user = {ents, maxEntries, challenge: {id: 'p5', title: 'Plank 5 Minuten', startDate: today, params: {metric: 'best_set', exName: 'Plank', target: 60}}};
  const c = ctx({user});
  const r = earn('challenge', 'p5|' + today, c);
  eq('Challenge geschafft: +100 XP', r.xp, 100);
  eq('Challenge in completed', c.wallet.completed.map(x => [x.kind, x.id, x.key]), [['challenge', 'p5', 'challenge|p5|' + today]]);
  eq('Challenge falscher Schlüssel', R.evaluate('challenge', 'p1|' + today, c).code, 'invalid');
  const hard = ctx({user: Object.assign({}, user, {challenge: Object.assign({}, user.challenge, {params: {metric: 'best_set', exName: 'Plank', target: 300}})})});
  eq('Challenge nicht geschafft', earn('challenge', 'p5|' + today, hard).code, 'notdone');
  eq('Keine Challenge gespeichert', earn('challenge', 'p5|' + today, ctx({user: {ents}})).code, 'nodata');
}

// Wochen-Challenge (KW 39 = w1: 100 Liegestütze, Wochensumme — 40+35+30 = 105, letzte Woche zählt nicht)
{
  const wk = R.weeklyChallengeFor(NOW, null);
  eq('KW 39 → w1', [wk.key, wk.ch.id], ['2026-W39', 'w1']);
  const c = ctx();
  const r = earn('weekly', '2026-W39', c);
  eq('Wochen-Challenge: +200 XP +3 Diamanten', [r.xp, r.diamonds], [200, 3]);
  eq('Wochen-Challenge in completed', c.wallet.completed[0].key, 'weekly|2026-W39');
  eq('Wochen-Challenge falsche Woche', R.evaluate('weekly', '2026-W38', ctx()).code, 'invalid');
  eq('Wochen-Challenge zweimal: schon gutgeschrieben', R.evaluate('weekly', '2026-W39', c).code, 'already');
  const few = ctx({user: {ents: ents.slice(0, 1)}});
  eq('Wochen-Challenge zu wenig (75 / 100)', earn('weekly', '2026-W39', few).code, 'notdone');
  // Getauscht: Ersatz für w1 ist "Langsam runter" (40 negative Klimmzüge) → nicht geschafft
  const swapped = ctx({user: {ents, wochen: {week: '2026-W39', swapped: true, checkins: []}}});
  eq('Getauschte Challenge wird geprüft', earn('weekly', '2026-W39', swapped).code, 'notdone');
  // Abhak-Challenge: KW 44 (26.10.2026) = w6 Treppenwoche, 5 Tage
  const nov = new Date(2026, 9, 27, 12);
  const w6 = R.weeklyChallengeFor(nov, null);
  eq('KW 44 → w6 (Abhaken)', [w6.key, w6.ch.id, w6.ch.metric], ['2026-W44', 'w6', 'manual']);
  const cks = ctx({now: nov, user: {ents: [], wochen: {week: '2026-W44', swapped: false, checkins: ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30']}}});
  eq('Abhaken 5 Tage: geschafft', earn('weekly', '2026-W44', cks).xp, 200);
  const cks4 = ctx({now: nov, user: {ents: [], wochen: {week: '2026-W44', swapped: false, checkins: ['2026-10-26', '2026-10-26', '2026-10-27', '2026-10-28']}}});
  eq('Abhaken doppelter Tag zählt einmal: nicht geschafft', earn('weekly', '2026-W44', cks4).code, 'notdone');
}

// Meilensteine (erstes Training vor 10 Tagen)
eq('Meilenstein 7 Tage: +4 Diamanten', earn('milestone', '7').diamonds, 4);
eq('Meilenstein 3 Tage: +2', earn('milestone', '3').diamonds, 2);
eq('Meilenstein 14 Tage: noch nicht', earn('milestone', '14').code, 'notdone');
eq('Meilenstein unbekannt', earn('milestone', '8').code, 'invalid');
eq('Meilenstein ohne Training, mit joinDate', earn('milestone', '7', ctx({user: {prData: {joinDate: '2026-08-01'}}})).diamonds, 4);
eq('Meilenstein ohne alles', earn('milestone', '7', ctx({user: {}})).code, 'nodata');

// Skill, Park King, Battle
eq('Skill: +200 XP', earn('skill', 'muscle_up').xp, 200);
eq('Skill kaputte ID', earn('skill', 'Muscle Up!').code, 'invalid');
eq('Park King 2 Parks: +40 XP', earn('parkking', today, ctx({parkKingCount: 2})).xp, 40);
eq('Park King ohne Park', earn('parkking', today, ctx({parkKingCount: 0})).code, 'nodata');
eq('Park King anderes Datum', earn('parkking', yesterday, ctx({parkKingCount: 2})).code, 'invalid');
const battle = {status: 'completed', winnerId: 'u1', challengerId: 'u1', challengedId: 'u2'};
eq('Battle gewonnen gegen Level+5: +400 XP', earn('battle', 'b1', ctx({battle, myLevel: 3, oppLevel: 8})).xp, 400);
eq('Battle verloren', earn('battle', 'b1', ctx({battle: Object.assign({}, battle, {winnerId: 'u2'})})).code, 'notdone');
eq('Battle schon verrechnet', earn('battle', 'b1', ctx({battle: Object.assign({}, battle, {xpAwardedTo: 'u1'})})).code, 'already');
eq('Battle fehlt', earn('battle', 'b1').code, 'nodata');

// Tageslimit
{
  const c = ctx({parkKingCount: 1});
  earn('skill', 'a1', c); earn('skill', 'a2', c);
  eq('Skill Tageslimit 2', R.evaluate('skill', 'a3', c).code, 'limit');
  eq('Tageszähler nur heute', Object.keys(c.wallet.daily), [today]);
}

// Level-Aufstieg: 490 XP + 10 → Level 2 → +50 Diamanten
{
  const c = ctx({xp: {totalXP: 490, monthlyXP: {}}});
  const r = earn('workout', today, c);
  eq('Level-Up erkannt', [r.applied.result.levelUp, r.applied.result.oldLevel, r.applied.result.newLevel, r.applied.result.diamondBonus], [true, 1, 2, 50]);
  eq('Diamanten im Wallet', c.wallet.diamonds, 50);
  eq('XP-Dokument', [c.xp.totalXP, c.xp.level, c.xp.monthlyXP['2026-09'], c.xp.diamonds], [500, 2, 10, 50]);
  eq('Log-Eintrag', [r.applied.log.amount, r.applied.log.reason, r.applied.log.total], [10, 'Workout abgeschlossen', 500]);
}
eq('Level-Diamanten 1→11', E.levelUpDiamonds(0, 18500), 550);

// Ausgeben
{
  const c = ctx(); c.wallet.diamonds = 2;
  eq('Streak-Eis (2) ok', R.evaluateSpend('ice', c).cost, 2);
  eq('Post (3) zu teuer', R.evaluateSpend('post', c).code, 'insufficient');
  eq('Unbekannt', R.evaluateSpend('gold', c).code, 'invalid');
  c.wallet = R.applySpend(c, 'ice', 2).wallet;
  eq('Nach dem Eis: 0', c.wallet.diamonds, 0);
}

// Abnahme: Schritt 1 Code ausgeben (nichts abbuchen, Challenge muss NICHT geschafft sein),
// Schritt 2 Video einreichen (abbuchen). Nur Challenges, die in einer Einheit gehen.
{
  const plank = {id: 'p5', title: 'Plank 5 Minuten', startDate: today, params: {metric: 'best_set', exName: 'Plank', target: 300}};
  const K = 'challenge|p5|' + today;
  eq('Start ohne gespeicherte Challenge', R.evaluateStart(ctx({user: {ents}}), K).code, 'nodata');
  eq('Start mit fremdem Schlüssel', R.evaluateStart(ctx({user: {ents, challenge: plank}}), 'challenge|p1|' + today).code, 'invalid');
  eq('Start unbekannter Schlüssel', R.evaluateStart(ctx({user: {ents, challenge: plank}}), 'x|y').code, 'invalid');
  const weekly = ctx({user: {ents}}); weekly.wallet.diamonds = 1500;
  eq('Start Wochen-Challenge KW 39 (Wochensumme): nicht aufnehmbar', R.evaluateStart(weekly, 'weekly|2026-W39').code, 'notrecordable');
  eq('Start falsche Woche', R.evaluateStart(weekly, 'weekly|2026-W38').code, 'invalid');
  const may = new Date(2027, 4, 3, 12); // Montag 03.05.2027 → w33 „Zehn am Stück" (bester Satz)
  const wk33 = R.weeklyChallengeFor(may, null);
  eq('KW im Mai 2027 → w33 bester Satz', [wk33.ch.id, wk33.ch.metric], ['w33', 'best_set']);
  const wkStart = R.evaluateStart(ctx({user: {ents}, now: may, wallet: Object.assign(R.normalizeWallet(null), {diamonds: 1500})}), 'weekly|' + wk33.key);
  eq('Start Wochen-Challenge mit bestem Satz: ok', [wkStart.ok, wkStart.item.kind, wkStart.item.id, wkStart.item.week], [true, 'weekly', 'w33', wk33.key]);
  const multi = ctx({user: {ents, challenge: Object.assign({}, plank, {params: {metric: 'volume_exercise', exName: 'Plank', target: 300}})}}); multi.wallet.diamonds = 1500;
  eq('Start Wochen-Metrik bei eigener Challenge: nicht aufnehmbar', R.evaluateStart(multi, K).code, 'notrecordable');
  const once = ctx({user: {ents, challenge: Object.assign({}, plank, {params: {metric: 'manual', target: 1}})}}); once.wallet.diamonds = 1500;
  eq('Start Abhaken einmalig: ok', R.evaluateStart(once, K).ok, true);
  const daily = ctx({user: {ents, challenge: Object.assign({}, plank, {params: {metric: 'manual', target: 5, perDay: true}})}}); daily.wallet.diamonds = 1500;
  eq('Start Abhaken über Tage: nicht aufnehmbar', R.evaluateStart(daily, K).code, 'notrecordable');
  const poor = ctx({user: {ents, challenge: plank}});
  eq('Start zu wenig Diamanten', R.evaluateStart(poor, K).code, 'insufficient');

  const c = ctx({user: {ents, challenge: plank, prData: {name: 'Mara'}}}); c.wallet.diamonds = 1503;
  const s = R.evaluateStart(c, K);
  eq('Start ok ohne geschaffte Challenge, nichts abgebucht', [s.ok, s.cost, s.prevId, c.wallet.diamonds, c.wallet.completed.length], [true, 1000, null, 1503, 0]);
  const a = R.applyStart(c, K, s.item, 'v1', 4821);
  c.wallet = a.wallet;
  eq('Start: Dokument mit Code und Frist', [a.doc.status, a.doc.code, a.doc.uid, a.doc.name, a.doc.kind, a.doc.title, a.doc.completedAt, a.doc.expiresAt - a.doc.issuedAt, a.doc.videoPath], ['recording', '4821', 'u1', 'Mara', 'challenge', 'Plank 5 Minuten', today, R.RECORD_WINDOW_MS, null]);
  eq('Start: Antwort an den Client', [a.result.id, a.result.code, a.result.expiresAt], ['v1', '4821', a.doc.expiresAt]);
  eq('Start: Wallet merkt Aufnahme, Diamanten bleiben', [c.wallet.verifications[K].status, c.wallet.diamonds], ['recording', 1503]);
  eq('Neustart erlaubt, alte Aufnahme wird verworfen', (r => [r.ok, r.prevId])(R.evaluateStart(c, K)), [true, 'v1']);
  const doc = Object.assign({id: 'v1'}, a.doc);
  eq('Einreichen fremdes Dokument', R.evaluateSubmit({uid: 'u2', wallet: c.wallet, now: NOW}, doc, 'verificationVideos/u2/v1.webm').code, 'nodata');
  eq('Einreichen falscher Pfad', R.evaluateSubmit(c, doc, 'verificationVideos/u1/anders.webm').code, 'invalid');
  eq('Einreichen fremder Ordner', R.evaluateSubmit(c, doc, 'verificationVideos/u2/v1.webm').code, 'invalid');
  eq('Einreichen abgelaufen (106 min)', R.evaluateSubmit(Object.assign({}, c, {now: new Date(NOW.getTime() + 106 * 60000)}), doc, 'verificationVideos/u1/v1.webm').code, 'expired');
  eq('Einreichen knapp vor Ablauf (104 min) ok', R.evaluateSubmit(Object.assign({}, c, {now: new Date(NOW.getTime() + 104 * 60000)}), doc, 'verificationVideos/u1/v1.webm').ok, true);
  const broke = Object.assign({}, c, {wallet: Object.assign(R.normalizeWallet(c.wallet), {diamonds: 999})});
  eq('Einreichen zu wenig Diamanten', R.evaluateSubmit(broke, doc, 'verificationVideos/u1/v1.webm').code, 'insufficient');
  const sub = R.evaluateSubmit(c, doc, 'verificationVideos/u1/v1.mp4');
  eq('Einreichen ok, kostet 1000', [sub.ok, sub.cost], [true, 1000]);
  const b = R.applySubmit(c, doc, sub.cost, 'verificationVideos/u1/v1.mp4', 95);
  c.wallet = b.wallet;
  eq('Einreichen abgebucht', c.wallet.diamonds, 503);
  eq('Einreichen: Update', [b.update.status, b.update.videoPath, b.update.recordSeconds, b.update.cost], ['pending', 'verificationVideos/u1/v1.mp4', 95, 1000]);
  eq('Einreichen: Wallet-Status', c.wallet.verifications[K].status, 'pending');
  eq('Einreichen zweimal: nicht mehr offen', R.evaluateSubmit(c, Object.assign({}, doc, {status: 'pending'}), 'verificationVideos/u1/v1.mp4').code, 'invalid');
  eq('Start während Prüfung: läuft schon', R.evaluateStart(c, K).code, 'already');
  // Entscheidung
  const v = Object.assign({}, doc, b.update);
  const ap = R.applyReview({uid: 'u1', wallet: c.wallet, now: NOW}, v, 'approved', 'Sauber', false);
  eq('Freigabe: Abzeichen', [ap.badge.kind, ap.badge.title, ap.badge.week, ap.update.status, ap.update.videoPath], ['challenge', 'Plank 5 Minuten', null, 'approved', null]);
  eq('Freigabe: Diamanten bleiben', ap.wallet.diamonds, 503);
  const rj = R.applyReview({uid: 'u1', wallet: c.wallet, now: NOW}, v, 'rejected', 'Video unscharf', true);
  eq('Ablehnung mit Rückgabe: +1000', [rj.wallet.diamonds, rj.badge, rj.update.refunded], [1503, null, true]);
  const rj2 = R.applyReview({uid: 'u1', wallet: c.wallet, now: NOW}, v, 'rejected', '', false);
  eq('Ablehnung ohne Rückgabe', rj2.wallet.diamonds, 503);
  eq('Entscheidung zweimal', R.applyReview({uid: 'u1', wallet: c.wallet, now: NOW}, Object.assign({}, v, {status: 'approved'}), 'approved', '', false).code, 'invalid');
}

// Import beim ersten Login
eq('Import gedeckelt auf 300', R.initialWallet(9999, NOW).diamonds, 300);
eq('Import negativ → 0', R.initialWallet(-5, NOW).diamonds, 0);
eq('Import 42', R.initialWallet('42', NOW).diamonds, 42);
eq('publicWallet ohne Zähler', Object.keys(R.publicWallet(R.normalizeWallet(null))), ['diamonds', 'completed', 'verifications']);

// Shop-Tabelle: kleinstes Paket deckt genau eine Abnahme, größere sind pro Diamant günstiger
eq('Kleinstes Paket = 1 Abnahme', E.CALI_ECON.packs[0].diamonds, E.CALI_ECON.verifyCost);
ok('Pakete pro Diamant fallend', E.CALI_ECON.packs[0].cents / E.CALI_ECON.packs[0].diamonds > E.CALI_ECON.packs[1].cents / E.CALI_ECON.packs[1].diamonds && E.CALI_ECON.packs[1].cents / E.CALI_ECON.packs[1].diamonds > E.CALI_ECON.packs[2].cents / E.CALI_ECON.packs[2].diamonds);
eq('Euro-Format', [E.econEuro(299), E.econEuro(1599), E.econDiamondsEuro(1000)], ['2,99 €', '15,99 €', '2,99 €']);

console.log('\n' + pass + ' ok, ' + fail + ' fail');
if (fail) process.exit(1);
