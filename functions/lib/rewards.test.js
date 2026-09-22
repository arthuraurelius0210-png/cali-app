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

// Abnahme
{
  const c = ctx(); c.wallet.diamonds = 1500;
  eq('Abnahme ohne geschaffte Challenge', R.evaluateVerification(c, 'challenge|p5|' + today, 'verificationVideos/u1/a.mp4').code, 'nodata');
  earn('weekly', '2026-W39', c);
  eq('Abnahme fremder Pfad', R.evaluateVerification(c, 'weekly|2026-W39', 'verificationVideos/u2/a.mp4').code, 'invalid');
  const r = R.evaluateVerification(c, 'weekly|2026-W39', 'verificationVideos/u1/a.mp4');
  eq('Abnahme ok, kostet 1000', [r.ok, r.cost], [true, 1000]);
  const a = R.applyVerification(c, 'weekly|2026-W39', r.item, r.cost, 'verificationVideos/u1/a.mp4', 'v1');
  c.wallet = a.wallet;
  eq('Abnahme abgebucht', c.wallet.diamonds, 503);
  eq('Abnahme-Dokument', [a.doc.uid, a.doc.name, a.doc.kind, a.doc.title, a.doc.status, a.doc.week], ['u1', 'Mara', 'weekly', 'Hundert Liegestütze', 'pending', '2026-W39']);
  eq('Abnahme zweimal: läuft schon', R.evaluateVerification(c, 'weekly|2026-W39', 'verificationVideos/u1/b.mp4').code, 'already');
  const poor = ctx(); earn('weekly', '2026-W39', poor);
  eq('Abnahme zu wenig Diamanten', R.evaluateVerification(poor, 'weekly|2026-W39', 'verificationVideos/u1/a.mp4').code, 'insufficient');
  // Entscheidung
  const v = Object.assign({id: 'v1'}, a.doc);
  const ap = R.applyReview({uid: 'u1', wallet: c.wallet, now: NOW}, v, 'approved', 'Sauber', false);
  eq('Freigabe: Abzeichen', [ap.badge.kind, ap.badge.title, ap.badge.week, ap.update.status, ap.update.videoPath], ['weekly', 'Hundert Liegestütze', '2026-W39', 'approved', null]);
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
