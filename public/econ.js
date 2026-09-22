// ══════════════════════════════════════════════════════════
// ECON.JS — Spielwirtschaft (geteilt zwischen App und Cloud Functions)
// Alles, was XP oder Diamanten wert ist, steht hier einmal: Leveltabelle, Meilensteine,
// Belohnungen, Preise, Diamanten-Pakete, Abnahme. Der Server (functions/lib/rewards.js)
// rechnet damit nach, der Browser zeigt damit an. Diamanten haben seit dem Shop einen
// Geldwert, deshalb entscheidet nur noch der Server, wer wie viele bekommt.
// ══════════════════════════════════════════════════════════

// ── Leveltabelle 1–50 (aus xp.js hierher gezogen) ──
var XP_LEVELS = (function(){
  var levels = [{level:1, xpRequired:0, diamonds:0}];
  var xp = 0;
  var increment = 500;
  for(var i=2; i<=50; i++){
    xp += increment;
    var diamonds = i<=10 ? 50 : i<=25 ? 100 : i<=40 ? 150 : 200;
    levels.push({level:i, xpRequired:xp, diamonds:diamonds});
    increment += 300;
  }
  return levels;
})();

function getLevelFromXP(totalXP){
  var current = XP_LEVELS[0];
  for(var i=XP_LEVELS.length-1; i>=0; i--){
    if(totalXP >= XP_LEVELS[i].xpRequired){ current = XP_LEVELS[i]; break; }
  }
  var next = XP_LEVELS[Math.min(current.level, XP_LEVELS.length-1)];
  var xpForCurrent = current.xpRequired;
  var xpForNext = next ? next.xpRequired : current.xpRequired;
  var progress = xpForNext > xpForCurrent ? Math.round((totalXP - xpForCurrent) / (xpForNext - xpForCurrent) * 100) : 100;
  return {
    level: current.level,
    xp: totalXP,
    xpForNext: xpForNext,
    xpForCurrent: xpForCurrent,
    progress: Math.min(progress, 100),
    xpToNext: Math.max(0, xpForNext - totalXP)
  };
}

// Diamanten für alle Level-Aufstiege zwischen zwei XP-Ständen
function levelUpDiamonds(oldXP, newXP){
  var o = getLevelFromXP(oldXP).level, n = getLevelFromXP(newXP).level, sum = 0;
  for(var l=o+1; l<=n; l++){ var d = XP_LEVELS[l-1]; if(d) sum += d.diamonds; }
  return sum;
}

// ── Battle-XP (ELO-artig, aus xp.js) ──
function calcBattleXP(myLevel, opponentLevel, won){
  if(!won) return 0;
  var diff = opponentLevel - myLevel;
  if(diff >= 15) return 800;
  if(diff >= 10) return 600;
  if(diff >= 5)  return 400;
  if(diff >= 2)  return 250;
  if(diff >= 0)  return 100;
  if(diff >= -3) return 60;
  if(diff >= -7) return 40;
  return 20;
}

// ── Meilensteine nach Kontoalter (aus main2ba.js), icon = CALI_ICONS-Name ──
var MILESTONES = [
  {days:3,   label:'3 Tage',     diamonds:2,  badge:'Erster Schritt', icon:'flame'},
  {days:7,   label:'1 Woche',    diamonds:4,  badge:'Starter',        icon:'calendar'},
  {days:14,  label:'2 Wochen',   diamonds:5,  badge:'Im Rhythmus',    icon:'clock'},
  {days:21,  label:'3 Wochen',   diamonds:6,  badge:'Gewohnheit',     icon:'check'},
  {days:30,  label:'1 Monat',    diamonds:8,  badge:'Dedicated',      icon:'dumbbell'},
  {days:45,  label:'45 Tage',    diamonds:10, badge:'Halftime',       icon:'trend'},
  {days:60,  label:'2 Monate',   diamonds:12, badge:'Consistent',     icon:'chart'},
  {days:90,  label:'3 Monate',   diamonds:16, badge:'Warrior',        icon:'target'},
  {days:120, label:'4 Monate',   diamonds:18, badge:'Grinder',        icon:'gear'},
  {days:150, label:'5 Monate',   diamonds:20, badge:'Machine',        icon:'flex'},
  {days:180, label:'6 Monate',   diamonds:25, badge:'Veteran',        icon:'flame'},
  {days:240, label:'8 Monate',   diamonds:28, badge:'Relentless',     icon:'moon'},
  {days:270, label:'9 Monate',   diamonds:30, badge:'Iron Will',      icon:'bookmark'},
  {days:300, label:'10 Monate',  diamonds:32, badge:'Unstoppable',    icon:'play'},
  {days:365, label:'1 Jahr',     diamonds:50, badge:'Elite',          icon:'trophy'},
  {days:500, label:'500 Tage',   diamonds:60, badge:'Legend',         icon:'star'},
  {days:730, label:'2 Jahre',    diamonds:100,badge:'Immortal',       icon:'lightbulb'}
];

// ── Belohnungen, Preise, Shop ──
var CALI_ECON = {
  // Was ein Ereignis bringt (der Server prüft jedes davon nach)
  earn: {
    workout:  {xp:10,  diamonds:0, perDay:1, label:'Workout abgeschlossen'},
    pr:       {xp:50,  diamonds:1, perDay:5, label:'Neuer Rekord'},
    challenge:{xp:100, diamonds:0, perDay:3, label:'Challenge geschafft'},
    weekly:   {xp:200, diamonds:3, perDay:1, label:'Wochen-Challenge geschafft'},
    skill:    {xp:200, diamonds:0, perDay:2, label:'Skill gemeistert'},
    parkking: {xp:20,  diamonds:0, perDay:1, label:'Park King (pro Park)'},
    battle:   {xp:0,   diamonds:0, perDay:10, label:'Battle gewonnen'},
    milestone:{xp:0,   diamonds:0, perDay:20, label:'Meilenstein'}
  },
  // Was etwas kostet (Diamanten). Die eigene Challenge wechseln oder beenden ist frei,
  // nur die Wochen-Challenge kostet beim Tauschen (swap).
  spend: {swap:1, ice:2, post:3},
  // Abnahme einer geschafften Challenge per Video
  verifyCost: 1000,
  // Diamanten-Pakete: Euro-Preis in Cent. Das kleinste Paket deckt genau eine Abnahme,
  // die größeren sind pro Diamant günstiger (Mengenrabatt statt Zwang zum Mehrkauf).
  packs: [
    {id:'s', diamonds:1000,  cents:299,  label:'Starter'},
    {id:'m', diamonds:8000,  cents:799,  label:'Athlet'},
    {id:'l', diamonds:19000, cents:1599, label:'Pro'}
  ],
  // Einmaliger Import der alten Geräte-Diamanten beim ersten Login nach dem Umstieg
  migrateCap: 300
};

// Metriken, die sich in einer einzigen Einheit zeigen lassen. Nur solche Challenges lassen sich
// beim Annehmen „mit Aufnahme" machen (Abnahme per Video); Wochen- und Tages-Challenges nicht.
var RECORDABLE_METRICS = ['best_set', 'volume_session_ex', 'multi_volume_session', 'rounds_in_session', 'longest_session_min', 'sets_in_one_workout', 'distinct_exercises_session', 'categories_in_session', 'hold_total_session', 'volume_one_workout', 'pullup_pyramid'];
function econRecordable(p){
  if(!p || !p.metric) return false;
  if(p.metric === 'manual') return !(parseFloat(p.target) > 1) && !p.perDay;
  return RECORDABLE_METRICS.indexOf(p.metric) > -1;
}

// Euro-Wert einer Diamantenzahl zum Preis des kleinsten Pakets ('2,99 €')
function econEuro(cents){
  var e = Math.floor(cents / 100), c = cents % 100;
  return e + ',' + (c < 10 ? '0' : '') + c + ' €';
}
function econDiamondsEuro(diamonds){
  var p = CALI_ECON.packs[0];
  return econEuro(Math.round(diamonds / p.diamonds * p.cents));
}

// ISO-Kalenderwoche '2026-W39' (gleiche Rechnung wie weeklyKey in weekly.js)
function econWeekKey(d){
  var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  var dn = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dn);
  var y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  var wk = Math.ceil(((t - y0) / 86400000 + 1) / 7);
  return t.getUTCFullYear() + '-W' + (wk < 10 ? '0' : '') + wk;
}

if(typeof module !== 'undefined' && module.exports){
  module.exports = {
    XP_LEVELS: XP_LEVELS, getLevelFromXP: getLevelFromXP, levelUpDiamonds: levelUpDiamonds,
    calcBattleXP: calcBattleXP, MILESTONES: MILESTONES, CALI_ECON: CALI_ECON,
    econEuro: econEuro, econDiamondsEuro: econDiamondsEuro, econWeekKey: econWeekKey,
    RECORDABLE_METRICS: RECORDABLE_METRICS, econRecordable: econRecordable
  };
}
