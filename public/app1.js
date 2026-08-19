// ── CUSTOM ICON SET (matches the CALI icon-sheet: line-art, orange accents) ──
var CALI_ICONS = {
  flame: '<svg viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 2c1 4-4 5-4 9a4 4 0 008 0c0-1.5-1-2-1-3.5 2 1 3 3 3 5.5a6 6 0 01-12 0C6 8 9 6 12 2z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 5H4a3 3 0 003 3M17 5h3a3 3 0 01-3 3"/><path d="M12 13v3M9 20h6M9.5 20c0-2 1-2.5 2.5-3s2.5-1 2.5-3"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>',
  trend: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.2l7.1-.6z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4" fill="var(--accent)"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="var(--accent)"><path d="M12 2a7 7 0 00-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 00-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>',
  handshake: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12l4-3 4 2 3-2 3 2 4-2 2 3-3 5-3-1-3 2-3-2-3 1-4-5z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-5-5"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="var(--accent)"><path d="M8 5v14l11-7z"/></svg>',
  lightbulb: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0012 3z"/></svg>',
  dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6M2 10v4M20 9v6M22 10v4M7 12h10"/><rect x="5" y="8" width="3" height="8" rx="1"/><rect x="16" y="8" width="3" height="8" rx="1"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 000-3l2-1.5-2-3.5-2.4 1a7.6 7.6 0 00-2.6-1.5L14 2h-4l-.4 2.5a7.6 7.6 0 00-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.6 7.6 0 000 3l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 002.6 1.5L10 22h4l.4-2.5a7.6 7.6 0 002.6-1.5l2.4 1 2-3.5z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10a6 6 0 0112 0c0 4 1.5 5 1.5 5h-15S6 14 6 10z"/><path d="M10 19a2 2 0 004 0"/></svg>',
  pencil: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l5 5L20 6"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--muted)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z"/></svg>',
  flex: '<svg viewBox="0 0 24 24" fill="var(--accent)"><path d="M4 14c0-2 1-3 2-3 0-2 1-3 2.5-3 .3-1.5 1.5-3 3.5-3 3 0 4.5 2 4.5 5 1.5 0 2.5 1.5 2.5 3 1 .3 1.5 1.3 1.5 2.5C20.5 18 18 20 15 20H8c-2.5 0-4-2-4-4v-2z"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M2 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20c.2-2.5 1.8-4 4-4"/></svg>'
};
function ci(name){
  var svg = CALI_ICONS[name] || '';
  return svg.replace('<svg ', '<svg width="100%" height="100%" style="display:block;" ');
}
function iconWrap(name, opts){
  opts = opts || {};
  var size = opts.size || 20;
  var box = opts.box || 44;
  var bg = opts.bg || 'rgba(255,85,0,0.1)';
  var radius = opts.radius != null ? opts.radius : Math.round(box*0.32);
  return '<div style="width:'+box+'px;height:'+box+'px;border-radius:'+radius+'px;background:'+bg+';display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+
    '<div style="width:'+size+'px;height:'+size+'px;">'+ci(name)+'</div></div>';
}

var DB   = 'cali_v4';
var DHR  = 'cali_hr';
var ents = [];
var hrs  = [];
var sets = [];
var sBand = '';
var isBand = false;
var mc = null;
var af = 'Alle';

// Workout session state
var woActive = false;
var woStart  = null;
var woTimer  = null;
var woExercises = []; // [{name,unit,col,band,sets,note}]
var woDate   = '';
var woId     = '';
// true, wenn buildStreakWidget (main2ba.js) gerade die Wochenziel-Feier
// gezündet hat — der Abschluss-Screen lässt sein Konfetti dann aus
var _woSkipCelebrate = false;
var planBlocks = []; // [{name,unit,col,sets:[{target,actual}],done}]


var EX_DB = [
  // PULL
  {name:'Klimmzuge (schulterbreit)',    cat:'Pull', unit:'Wdh', col:'gr', band:1},
  {name:'Klimmzuge (eng)',              cat:'Pull', unit:'Wdh', col:'gr', band:1},
  {name:'Klimmzuge (weit)',             cat:'Pull', unit:'Wdh', col:'gr', band:1},
  {name:'Klimmzuge (neutral)',          cat:'Pull', unit:'Wdh', col:'gr', band:1},
  {name:'Chin-Ups',                     cat:'Pull', unit:'Wdh', col:'gr', band:1},
  {name:'Archer Pull-ups',              cat:'Pull', unit:'Wdh', col:'gr', band:1},
  {name:'Commando Pull-ups',            cat:'Pull', unit:'Wdh', col:'gr', band:0},
  {name:'Typewriter Pull-ups',          cat:'Pull', unit:'Wdh', col:'gr', band:0},
  {name:'Negative Klimmzuge',           cat:'Pull', unit:'Wdh', col:'gr', band:1},
  {name:'Muscle-Ups',                   cat:'Pull', unit:'Wdh', col:'gr', band:1},
  {name:'Australian Rows',              cat:'Pull', unit:'Wdh', col:'gr', band:0},
  {name:'Archer Rows',                  cat:'Pull', unit:'Wdh', col:'gr', band:0},
  {name:'Einarm Row (Handtuch)',        cat:'Pull', unit:'Wdh', col:'gr', band:0},
  {name:'Face Pulls (Band)',            cat:'Pull', unit:'Wdh', col:'gr', band:0},
  {name:'Towel Curl',                   cat:'Pull', unit:'Wdh', col:'gr', band:0},
  {name:'Tuck Front Lever Hold',        cat:'Pull', unit:'Sek', col:'gr', band:0},
  {name:'Front Lever Hold',             cat:'Pull', unit:'Sek', col:'gr', band:0},
  {name:'Scapula Pull-ups',             cat:'Pull', unit:'Wdh', col:'gr', band:0},
  {name:'Hanging Knee Raises',          cat:'Pull', unit:'Wdh', col:'gr', band:0},
  {name:'Toes to Bar',                  cat:'Pull', unit:'Wdh', col:'gr', band:0},
  // PUSH
  {name:'Liegestutze',                  cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Liegestutze (eng)',            cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Liegestutze (weit)',           cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Archer Push-ups',             cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Diamond Push-ups',            cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Pike Push-ups',               cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Pseudo Planche Push-ups',     cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Handstand Push-ups',          cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Wall Handstand Hold',         cat:'Push', unit:'Sek', col:'or', band:0},
  {name:'Handstand Hold (frei)',       cat:'Push', unit:'Sek', col:'or', band:0},
  {name:'Dips (Stange)',               cat:'Push', unit:'Wdh', col:'or', band:1},
  {name:'Dips (Ring)',                 cat:'Push', unit:'Wdh', col:'or', band:1},
  {name:'Dips (Bench)',                cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Dips (eng)',                  cat:'Push', unit:'Wdh', col:'or', band:0},
  {name:'Tuck Planche Hold',          cat:'Push', unit:'Sek', col:'or', band:0},
  {name:'Planche Lean',               cat:'Push', unit:'Sek', col:'or', band:0},
  // CORE
  {name:'Plank',                       cat:'Core', unit:'Sek', col:'pu', band:0},
  {name:'Side Plank',                  cat:'Core', unit:'Sek', col:'pu', band:0},
  {name:'Hollow Body Hold',            cat:'Core', unit:'Sek', col:'pu', band:0},
  {name:'L-Sit Hold',                  cat:'Core', unit:'Sek', col:'pu', band:0},
  {name:'Leg Raises',                  cat:'Core', unit:'Wdh', col:'pu', band:0},
  {name:'Dragon Flag Negatives',       cat:'Core', unit:'Wdh', col:'pu', band:0},
  {name:'Ab Wheel Rollout',            cat:'Core', unit:'Wdh', col:'pu', band:0},
  {name:'V-Ups',                       cat:'Core', unit:'Wdh', col:'pu', band:0},
  {name:'Mountain Climbers',           cat:'Core', unit:'Sek', col:'pu', band:0},
  {name:'Windshield Wipers',           cat:'Core', unit:'Wdh', col:'pu', band:0},
  // LEGS
  {name:'Pistol Squat',                cat:'Legs', unit:'Wdh', col:'te', band:0},
  {name:'Box Pistol Squat',            cat:'Legs', unit:'Wdh', col:'te', band:0},
  {name:'Jump Squats',                 cat:'Legs', unit:'Wdh', col:'te', band:0},
  {name:'Bulgarian Split Squat',       cat:'Legs', unit:'Wdh', col:'te', band:0},
  {name:'Shrimp Squat',                cat:'Legs', unit:'Wdh', col:'te', band:0},
  {name:'Nordic Curl Negatives',       cat:'Legs', unit:'Wdh', col:'te', band:0},
  {name:'Calf Raises',                 cat:'Legs', unit:'Wdh', col:'te', band:0},
  {name:'Burpees',                     cat:'Legs', unit:'Wdh', col:'te', band:0},
  // SKILLS
  {name:'Klimmzug Pyramide',          cat:'Skills', unit:'Runden', col:'am', band:1},
  {name:'Muscle-Up Transition',       cat:'Skills', unit:'Wdh',    col:'am', band:1},
  {name:'Back Lever Hold',            cat:'Skills', unit:'Sek',    col:'am', band:0},
  {name:'Human Flag Hold',            cat:'Skills', unit:'Sek',    col:'am', band:0},
  {name:'Ring Muscle-Up',             cat:'Skills', unit:'Wdh',    col:'am', band:0},
  {name:'Handstand Walk',             cat:'Skills', unit:'Meter',  col:'am', band:0},
  {name:'360 Pull-up',                cat:'Skills', unit:'Wdh',    col:'am', band:0},
  // SCHWIMMEN
            // LAUFEN
        ];

var EX_CATS = ['Alle','Pull','Push','Core','Legs','Skills',];
var EX_CAT_COLORS = {Pull:'var(--accent)',Push:'#FF6B35',Core:'#A78BFA',Legs:'#4ECDC4',Skills:'#F59E0B',Alle:'#888'};
var activeExCat = 'Alle';

var PRESET_PLANS = [
  {name:'Pull Tag', exercises:[
    {name:'Klimmzuge (schulterbreit)',unit:'Wdh',col:'gr',band:true,sets:[{n:'6'},{n:'5'},{n:'4'}]},
    {name:'Klimmzug Pyramide',unit:'Runden',col:'am',band:true,sets:[{n:'1 Runde'}]},
    {name:'Australian Rows',unit:'Wdh',col:'gr',band:false,sets:[{n:'10'},{n:'10'},{n:'10'}]},
    {name:'Archer Rows',unit:'Wdh',col:'gr',band:false,sets:[{n:'8'},{n:'8'},{n:'8'}]},
    {name:'Tuck Front Lever Hold',unit:'Sek',col:'gr',band:false,sets:[{n:'12'},{n:'12'},{n:'12'},{n:'12'}]}
  ]},
  {name:'Push Tag', exercises:[
    {name:'Pike Push-ups',unit:'Wdh',col:'or',band:false,sets:[{n:'8'},{n:'8'},{n:'8'},{n:'8'}]},
    {name:'Dips (Stange)',unit:'Wdh',col:'or',band:true,sets:[{n:'8'},{n:'8'},{n:'8'},{n:'8'}]},
    {name:'Archer Push-ups',unit:'Wdh',col:'or',band:false,sets:[{n:'6'},{n:'6'},{n:'6'}]},
    {name:'Wall Handstand Hold',unit:'Sek',col:'or',band:false,sets:[{n:'25'},{n:'25'},{n:'25'},{n:'25'}]},
    {name:'Planche Lean',unit:'Sek',col:'or',band:false,sets:[{n:'20'},{n:'20'},{n:'20'}]}
  ]},
  {name:'Core & Skills', exercises:[
    {name:'Hollow Body Hold',unit:'Sek',col:'pu',band:false,sets:[{n:'35'},{n:'35'},{n:'35'},{n:'35'}]},
    {name:'L-Sit Hold',unit:'Sek',col:'pu',band:false,sets:[{n:'12'},{n:'12'},{n:'12'},{n:'12'}]},
    {name:'Leg Raises',unit:'Wdh',col:'pu',band:false,sets:[{n:'12'},{n:'12'},{n:'12'}]},
    {name:'Tuck Planche Hold',unit:'Sek',col:'or',band:false,sets:[{n:'18'},{n:'18'},{n:'18'},{n:'18'}]},
    {name:'Muscle-Ups',unit:'Wdh',col:'am',band:true,sets:[{n:'4'},{n:'4'},{n:'4'},{n:'4'}]}
  ]},
  {name:'Kraftausdauer', exercises:[
    {name:'Klimmzuge (schulterbreit)',unit:'Wdh',col:'gr',band:true,sets:[{n:'Max'},{n:'Max'},{n:'Max'}]},
    {name:'Dips (Stange)',unit:'Wdh',col:'or',band:false,sets:[{n:'Max'},{n:'Max'},{n:'Max'}]},
    {name:'Liegestutze',unit:'Wdh',col:'or',band:false,sets:[{n:'20'},{n:'20'},{n:'20'}]},
    {name:'Pistol Squat',unit:'Wdh',col:'te',band:false,sets:[{n:'8'},{n:'8'},{n:'8'}]},
    {name:'Burpees',unit:'Wdh',col:'te',band:false,sets:[{n:'10'},{n:'10'},{n:'10'}]}
  ]}
];

var activePfCat = 'Alle';

var COLS = {gr:'var(--accent)',or:'#FF6B35',te:'#4ECDC4',pu:'#A78BFA',am:'#F59E0B',bl:'#38BDF8'};
var CC = {'Klimmzuge':'gr','Dips':'or','Liegestutze':'te','Plank':'pu','Australian Rows':'gr','Pike Push-ups':'or','Muscle-Ups':'am','L-Sit Hold':'pu','Tuck Front Lever':'pu'};

function ld(){
  try{var a=localStorage.getItem(DB);ents=a?JSON.parse(a):[];}catch(x){ents=[];}
  try{var b=localStorage.getItem(DHR);hrs=b?JSON.parse(b):[];}catch(x){hrs=[];}
}
function sd(){try{localStorage.setItem(DB,JSON.stringify(ents));}catch(x){}}
function shr(){try{localStorage.setItem(DHR,JSON.stringify(hrs));}catch(x){}}

function populateMaxDropdowns(){
  var _mx = document.getElementById('max-ex');
  if(_mx && _mx.options.length <= 1 && typeof EX_DB !== 'undefined'){
    _mx.innerHTML = '';
    EX_DB.forEach(function(ex){
      var opt = document.createElement('option');
      opt.value = ex.name+' Max|'+ex.unit;
      opt.textContent = ex.name+' (Max '+ex.unit+')';
      _mx.appendChild(opt);
    });
  }
  var _mc = document.getElementById('max-chart-ex');
  if(_mc && _mc.options.length <= 1 && typeof EX_DB !== 'undefined'){
    _mc.innerHTML = '';
    EX_DB.forEach(function(ex){
      var opt = document.createElement('option');
      opt.value = ex.name+' Max';
      opt.textContent = ex.name;
      _mc.appendChild(opt);
    });
  }
  // Geschlecht aus dem Profil vorbelegen — der stille m-Default würde sonst
  // die Perzentil-Vergleiche verfälschen ('x'/leer bleibt beim Default)
  var _mg = document.getElementById('max-gender');
  if(_mg && typeof prData !== 'undefined' && prData && (prData.gender === 'm' || prData.gender === 'f')){
    _mg.value = prData.gender;
  }
  if(typeof drawMaxChart === 'function') drawMaxChart();
}

var _lastGoPage = null;
// dir (optional): 'down' = Seite kommt von oben herein (Swipe-down → nächster Tab)
function goPage(p, dir){
  if(p==='m') setTimeout(populateMaxDropdowns, 100);
  var ps=['e','p','m','ch','v','pr','sk','h','parks','rek'];
  for(var i=0;i<ps.length;i++){
    var pg=document.getElementById('page-'+ps[i]);
    var tb=document.getElementById('tab-'+ps[i]);
    if(pg)pg.className='page'+(ps[i]===p?' on':'');
    if(tb)tb.className='tab'+(ps[i]===p?' on':'');
  }
  // Versteckte Seiten ohne eigenen Tab: den logisch zugehörigen Tab markieren
  var ghostTab = null;
  if(p==='v') ghostTab = document.getElementById('tab-pr');
  if(p==='sk') ghostTab = document.getElementById('tab-ch');
  if(ghostTab) ghostTab.className = 'tab on';
  // Aktiven Tab in die sichtbare Tab-Leiste scrollen + Spring-Pop
  var activeTab = ghostTab || document.getElementById('tab-'+p);
  if(activeTab){
    if(activeTab.scrollIntoView){
      try{ activeTab.scrollIntoView({inline:'center', block:'nearest'}); }catch(e){}
    }
    if(p!==_lastGoPage && activeTab.animate && !(window.caliMotion && caliMotion.reduced())){
      activeTab.animate(
        [{transform:'scale(0.9)'},{transform:'scale(1)'}],
        {duration:250, easing:'cubic-bezier(0.34,1.56,0.64,1)'}
      );
    }
  }
  // Scroll-Position pro Tabwechsel zurücksetzen
  if(p!==_lastGoPage) window.scrollTo(0,0);
  _lastGoPage = p;
  if(p==='v'){buildHistory();drawChart();}
  if(p==='m'){buildMaxList();drawMaxChart();}
  if(p==='e'){bb();buildStartPlanBtns();}
  if(p==='p'){
    document.getElementById('plan-form').style.display='none';
    document.getElementById('plan-list').style.display='block';
    buildPlanList();
  }
  if(p==='ch'){buildChallengeUI();}
  if(p==='rek'){buildRekordeUI();}
  if(p==='pr'){lpr();calcStreak();buildProfilUI();}
  if(p==='sk'){buildSkillUI();}
  if(p==='h')bhr();
  if(p==='parks'){initParksPage();}
  // Gestaffelte Karten-Entrance auf der frisch aufgebauten Seite
  if(window.caliMotion){
    var stTarget = document.getElementById('page-'+p);
    if(p==='e'){
      stTarget = woActive ? document.getElementById('active-workout') : document.getElementById('start-screen');
    }
    if(stTarget) caliMotion.stagger(stTarget);
  }
  // Richtungs-Entrance: beim Swipe-down (nächster Tab) kommt die Seite von OBEN
  // herein statt der Standard-pageIn von unten (WAAPI überstimmt die CSS-Animation)
  if(dir==='down' && !(window.caliMotion && caliMotion.reduced())){
    var dirPg = document.getElementById('page-'+p);
    if(dirPg && dirPg.animate){
      dirPg.animate(
        [{opacity:0,transform:'translateY(-10px)'},{opacity:1,transform:'translateY(0)'}],
        {duration:250, easing:'cubic-bezier(0.22,1,0.36,1)'}
      );
    }
  }
}

// ── SWIPE NAVIGATION (TikTok-style: swipe down at top = next tab, swipe up at bottom = previous tab) ──
(function(){
  var NAV_ORDER = ['e','p','m','ch','pr','parks','rek'];
  var startY = 0, startX = 0, startScrollTop = 0, swiping = false;

  document.addEventListener('touchstart', function(e){
    var pageEl = e.target.closest('.page.on') || e.target.closest('nav');
    if(!pageEl || e.touches.length !== 1){ swiping = false; return; }
    swiping = true;
    startY = e.touches[0].clientY;
    startX = e.touches[0].clientX;
    startScrollTop = window.scrollY || document.documentElement.scrollTop;
  }, {passive:true});

  document.addEventListener('touchend', function(e){
    if(!swiping) return;
    swiping = false;
    var endY = e.changedTouches[0].clientY;
    var endX = e.changedTouches[0].clientX;
    var deltaY = endY - startY;
    var deltaX = endX - startX;
    // Höhere Schwelle + strengere Richtungsprüfung, damit die Geste nicht mit
    // Pull-to-Refresh oder normalem Scrollen kollidiert
    if(Math.abs(deltaY) < 90 || Math.abs(deltaX) > 0.5 * Math.abs(deltaY)) return;
    // Während eines aktiven Workouts nie per Swipe wegnavigieren
    if(woActive) return;

    var currentPage = document.querySelector('.page.on');
    if(!currentPage) return;
    var idx = NAV_ORDER.indexOf(currentPage.id.replace('page-',''));
    if(idx === -1) return;

    var atTop = startScrollTop <= 4;
    var atBottom = (window.scrollY + window.innerHeight) >= (document.documentElement.scrollHeight - 4);

    // Kein Wrap-Around — an den Enden der Tab-Leiste stoppen
    if(deltaY > 0 && atTop){
      if(idx + 1 < NAV_ORDER.length) goPage(NAV_ORDER[idx + 1], 'down');
    } else if(deltaY < 0 && atBottom){
      if(idx - 1 >= 0) goPage(NAV_ORDER[idx - 1]);
    }
  }, {passive:true});
})();

// ── OVERLAY-HISTORY (Hardware-Zurück schließt Overlays statt der App) ──
// overlayPush(ov, onClose) nach document.body.appendChild(ov) aufrufen;
// eigene Zurück-Buttons rufen overlayClose(ov) statt ov.remove().
// Entfernt ein Fullscreen-Overlay — mit Exit-Animation, falls es per
// caliMotion.overlayIn eingeblendet wurde (Gegenstück zu .overlay-in).
function _caliRemoveOverlay(ov, done){
  if(!ov) return;
  function fin(){
    if(ov.parentNode) ov.parentNode.removeChild(ov);
    if(typeof done === 'function'){ try{ done(); }catch(e){} }
  }
  var fades = ov.classList && ov.classList.contains('overlay-in') &&
              !(window.caliMotion && caliMotion.reduced());
  if(!fades){ fin(); return; }
  ov.style.pointerEvents = 'none'; // während des Ausblendens nicht mehr antippbar
  ov.classList.remove('overlay-in');
  setTimeout(fin, 250); // == --dur-med, die Dauer aus .overlay-anim
}
// EIN einziger popstate-Listener bedient einen Stapel offener Overlays.
// Früher registrierte jedes Overlay seinen eigenen Listener — die sammelten
// sich über eine Session hinweg an, wenn ein Overlay ohne overlayClose
// verschwand (z.B. per ov.remove()).
var _caliOvStack = [];      // offene, per overlayPush registrierte Overlays
var _caliOvBound = false;   // popstate-Listener nur einmal registrieren
var _caliOvSelfBack = 0;    // von overlayClose selbst ausgelöste history.back()
var _caliOvSelfBackAt = 0;  // Zeitstempel dazu — alte Marker verfallen

// true, wenn dieser popstate von overlayClose selbst ausgelöst wurde
function _caliOvConsumeSelfBack(){
  if(_caliOvSelfBack <= 0) return false;
  // Ein nie eingetroffener popstate darf kein echtes Hardware-Zurück schlucken
  if(Date.now() - _caliOvSelfBackAt > 1000){ _caliOvSelfBack = 0; return false; }
  _caliOvSelfBack--;
  return true;
}
// Hardware-Zurück: schließt genau das oberste Overlay des Stapels
function _caliOvOnPop(){
  if(_caliOvConsumeSelfBack()) return;
  var ov = _caliOvStack.pop();
  if(!ov) return;
  ov._caliPushed = false;    // History-Eintrag ist weg
  if(ov._caliClosing) return; // wird bereits geschlossen
  ov._caliClosing = true;     // weitere Close-Aufrufe sind No-Ops
  _caliRemoveOverlay(ov, ov._caliOnClose);
}
function overlayPush(ov, onClose){
  if(!ov) return;
  // Frisch aufsetzen, falls derselbe Knoten wiederverwendet wird
  ov._caliPushed = false;
  ov._caliClosing = false;
  ov._caliOnClose = onClose;
  var ix = _caliOvStack.indexOf(ov);
  if(ix > -1) _caliOvStack.splice(ix, 1);
  if(!_caliOvBound){
    window.addEventListener('popstate', _caliOvOnPop);
    _caliOvBound = true;
  }
  try{
    history.pushState({caliOverlay:true}, '');
    ov._caliPushed = true;
    _caliOvStack.push(ov);
  }catch(e){
    ov._caliPushed = false;
  }
}
// Idempotent: ein zweiter Tap auf "Zurück" darf kein zweites history.back()
// auslösen, sonst wird auch der Basis-Eintrag der App gepoppt (PWA schließt sich).
function overlayClose(ov){
  if(!ov || ov._caliClosing) return;
  ov._caliClosing = true;
  var ix = _caliOvStack.indexOf(ov);
  if(ix > -1) _caliOvStack.splice(ix, 1);
  if(ov._caliPushed){
    ov._caliPushed = false;
    _caliOvSelfBack++;
    _caliOvSelfBackAt = Date.now();
    try{ history.back(); }catch(e){ if(_caliOvSelfBack > 0) _caliOvSelfBack--; }
  }
  _caliRemoveOverlay(ov, ov._caliOnClose);
}

// ── VERLUST-SCHUTZ: Seite nicht unbemerkt verlassen, solange ein Workout läuft ──
window.addEventListener('beforeunload', function(e){
  if(woActive){
    e.preventDefault();
    e.returnValue = '';
  }
});

// ── WORKOUT FLOW ──────────────────────────────────────────
function startWorkout(planId){
  // Laufende Session nie stillschweigend verwerfen
  if(woActive){
    if(typeof confirmSheet === 'function'){
      confirmSheet({
        title:'Ein Workout läuft bereits',
        desc:'Verwerfen und neues starten?',
        confirmLabel:'Verwerfen und starten',
        onConfirm:function(){ woActive = false; startWorkout(planId); }
      });
      return;
    }
    if(!confirm('Ein Workout läuft bereits. Verwerfen und neues starten?')) return;
  }
  woActive = true;
  woStart  = new Date();
  woDate   = woStart.toISOString().slice(0,10);
  woId     = 'wo_' + woStart.getTime();
  woExercises = [];
  planBlocks = [];
  sets = [];
  sBand = '';
  isBand = false;
  document.getElementById('start-screen').style.display = 'none';

  var emomWrap=document.getElementById('wo-emom-btn-wrap');if(emomWrap)emomWrap.style.display='block';  document.getElementById('active-workout').style.display = 'block';
  document.getElementById('wo-date').textContent = woDate;
  document.getElementById('wo-ex-list').innerHTML = '<div class="empty" id="wo-empty">Noch keine Übungen hinzugefügt.</div>';
  document.getElementById('sbox').innerHTML = '';
  document.getElementById('plan-blocks-wrap').style.display='none';
  if(document.getElementById('plan-add-form'))document.getElementById('plan-add-form').style.display='block';
  if(document.getElementById('plan-add-label'))document.getElementById('plan-add-label').style.display='block';
  document.getElementById('inp-note').value = '';
  document.getElementById('b-cust').value = '';
  // Init exercise selects
  fillWoExSelect();
  if(!sets.length) addSet();
  startTimer();

  // If plan selected, pre-fill exercises
  if(planId){
    // getPlanById löst eigene Pläne UND 'preset_N'-IDs aus dem Wochenplan auf
    var plan=(typeof getPlanById==='function')?getPlanById(planId):null;
    if(!plan){
      for(var i=0;i<plans.length;i++){if(plans[i].id===planId){plan=plans[i];break;}}
    }
    if(plan){
      planBlocks=[];
      for(var j=0;j<plan.exercises.length;j++){
        var pex=plan.exercises[j];
        var blkSets=[];
        for(var k=0;k<pex.sets.length;k++){blkSets.push({target:pex.sets[k].n,actual:''});}
        planBlocks.push({name:pex.name,unit:pex.unit,col:pex.col,sets:blkSets,done:false,open:false});
      }
      buildPlanBlocks();
      // Hide the "add exercise" form — user uses plan blocks instead
      document.getElementById('plan-add-form').style.display='none';
      document.getElementById('plan-add-label').style.display='none';
      toast('Plan "'+plan.name+'" geladen!');
      return;
    }
  }
}

function startTimer(){
  if(woTimer) clearInterval(woTimer);
  woTimer = setInterval(function(){
    try {
      if(!woStart) return;
      var now  = new Date();
      var diff = Math.floor((now - woStart) / 1000);
      var m    = Math.floor(diff/60);
      var s    = diff % 60;
      var ms   = m < 10 ? '0'+m : ''+m;
      var ss   = s < 10 ? '0'+s : ''+s;
      var el = document.getElementById('wo-timer');
      if(el) el.textContent = ms+':'+ss;
    } catch(e){}
  }, 1000);
}

function endWorkout(){
  // Offene Plan-Blöcke mit bereits eingetragenen Werten automatisch übernehmen,
  // damit getippte Sätze nicht stillschweigend verloren gehen
  var autoCommitted = 0;
  for(var pi=0;pi<planBlocks.length;pi++){
    var pb = planBlocks[pi];
    if(pb.done) continue;
    var hasTyped = false;
    for(var pk=0;pk<pb.sets.length;pk++){
      if(pb.sets[pk].actual !== '' && pb.sets[pk].actual != null){ hasTyped = true; break; }
    }
    if(!hasTyped) continue;
    var okSets = [];
    for(var pk2=0;pk2<pb.sets.length;pk2++){
      okSets.push({n: pb.sets[pk2].actual || pb.sets[pk2].target, b:''});
    }
    woExercises.push({name:pb.name,unit:pb.unit,col:pb.col,band:'',sets:okSets,note:''});
    pb.done = true; pb.open = false;
    autoCommitted++;
  }
  if(!woExercises.length){
    if(typeof confirmSheet === 'function'){
      confirmSheet({
        title:'Workout ohne Übungen beenden?',
        confirmLabel:'Beenden',
        onConfirm:function(){ finalizeEndWorkout(autoCommitted); }
      });
      return;
    }
    if(!confirm('Workout ohne Übungen beenden?'))return;
  }
  finalizeEndWorkout(autoCommitted);
}

// Eigentlicher Abschluss — von endWorkout direkt oder aus dem confirmSheet-Callback aufgerufen
function finalizeEndWorkout(autoCommitted){
  clearInterval(woTimer);
  var dur = Math.floor((new Date() - woStart)/1000);
  var dm  = Math.floor(dur/60);
  var ds  = dur%60;
  var durStr = dm+'min '+(ds<10?'0':'')+ds+'sek';

  // Save each exercise as individual entry
  var setCount = 0;
  for(var i=0;i<woExercises.length;i++){
    var ex = woExercises[i];
    setCount += ex.sets.length;
    ents.push({
      id: new Date().getTime()+i,
      date: woDate,
      woId: woId,
      name: ex.name,
      unit: ex.unit,
      col:  ex.col,
      band: ex.band,
      sets: ex.sets,
      note: ex.note,
      woDur: durStr,
      dur: dur
    });
  }
  sd();
  // Abzeichen im Moment des Verdienens freischalten (idempotent, toastet bei Unlock)
  if(typeof checkBadgeUnlocks === 'function'){ try{ checkBadgeUnlocks(); }catch(e){} }
  // Earn flames for workout
  var earned = earnFlames(dur);
  var exCount = woExercises.length;
  // XP erst NACH dem Speichern, nur für echte Workouts, max. 1x pro Tag
  if(exCount > 0){
    try{
      var xpKey = 'cali_woxp_' + woDate;
      if(!localStorage.getItem(xpKey)){
        awardXP(10, '💪 Workout abgeschlossen');
        localStorage.setItem(xpKey, '1');
      }
    }catch(e){}
  }

  woActive = false;
  woExercises = [];
  clearInterval(woTimer);
  woTimer = null;
  sets = [];
  sBand = '';
  isBand = false;
  document.getElementById('active-workout').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
  document.getElementById('wo-timer').textContent = '00:00';
  document.getElementById('wo-ex-list').innerHTML = '<div class="empty" id="wo-empty">Noch keine Übungen hinzugefügt.</div>';
  document.getElementById('sbox').innerHTML = '';
  document.getElementById('inp-note').value = '';
  document.getElementById('b-cust').value = '';
  bb();
  // Die Wochenziel-Feier gehört buildStreakWidget (main2ba.js). Zündet sie
  // gerade, darf der Abschluss-Screen kein zweites Konfetti darüberlegen.
  // main2ba.js setzt seinen Wochen-Marker unmittelbar vor dem celebrate() —
  // ein neuer Marker während des Aufrufs heißt also: dort lief die Feier.
  var _wgBefore = countWeekGoalMarkers();
  calcStreak();buildStreakWidget();
  _woSkipCelebrate = countWeekGoalMarkers() > _wgBefore;
  if(exCount > 0){
    showWorkoutDone(durStr, exCount, setCount, earned, autoCommitted);
  } else {
    toast('Workout gespeichert! '+durStr);
  }
  fbSave();
}

// Zählt die 'cali_weekgoal_done_<Wochenstart>'-Marker aus main2ba.js.
// Steigt der Wert während buildStreakWidget(), hat dort eine Feier gezündet.
// Sicher, wenn main2ba.js nie gelaufen ist: der Wert bleibt einfach gleich.
function countWeekGoalMarkers(){
  var n = 0;
  try{
    for(var i=0;i<localStorage.length;i++){
      var k = localStorage.key(i);
      if(k && k.indexOf('cali_weekgoal_done_') === 0) n++;
    }
  }catch(e){}
  return n;
}

// ── WORKOUT-ABSCHLUSS-MOMENT ──────────────────────────────
function showWorkoutDone(durStr, exCount, setCount, flames, autoCommitted){
  var skipCelebrate = _woSkipCelebrate;
  _woSkipCelebrate = false;
  var old = document.getElementById('wo-done-ov');
  if(old && old.parentNode) old.parentNode.removeChild(old);

  var ov = document.createElement('div');
  ov.id = 'wo-done-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2500;display:flex;align-items:center;justify-content:center;padding:20px;';

  var card = document.createElement('div');
  card.style.cssText = 'background:#fff;border-radius:24px;box-shadow:0 12px 30px rgba(0,0,0,0.06);padding:24px;width:100%;max-width:340px;text-align:center;';

  function statRow(label, valHtml){
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);">'+
      '<div style="font-size:13px;color:var(--muted);">'+label+'</div>'+
      '<div class="num" style="font-size:15px;font-weight:700;color:var(--text);">'+valHtml+'</div>'+
    '</div>';
  }

  var h = '<div style="display:flex;justify-content:center;margin-bottom:12px;">'+iconWrap('trophy',{size:26,box:56,radius:18})+'</div>';
  h += '<div style="font-size:17px;font-weight:800;color:var(--text);margin-bottom:4px;">Workout geschafft!</div>';
  h += '<div style="font-size:13px;color:var(--muted);margin-bottom:16px;">Stark! Dein Training ist gespeichert.</div>';
  h += statRow('Dauer', durStr);
  h += statRow('Übungen', '<span id="wo-done-ex">'+exCount+'</span>');
  h += statRow('Sätze', '<span id="wo-done-sets">'+setCount+'</span>');
  if(flames > 0){
    h += statRow('Flames verdient', '<span id="wo-done-flames">'+flames+'</span> 🔥');
  }
  if(autoCommitted > 0){
    h += '<div style="font-size:12px;color:var(--muted);margin-top:10px;">'+autoCommitted+' offene Plan-Übung'+(autoCommitted>1?'en':'')+' automatisch übernommen.</div>';
  }
  h += '<button id="wo-done-btn" class="pressable" style="width:100%;margin-top:18px;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:14px;cursor:pointer;box-shadow:0 12px 30px rgba(255,85,0,0.22);transition:transform var(--dur-fast) var(--ease-out);">Weiter</button>';
  card.innerHTML = h;
  ov.appendChild(card);
  document.body.appendChild(ov);

  // Ausblenden spiegelt das Einblenden: der Scrim blendet weg statt hart zu verschwinden
  function close(){
    if(ov._caliDone) return;
    ov._caliDone = true;
    var fades = ov.classList.contains('backdrop-in') && !(window.caliMotion && caliMotion.reduced());
    if(!fades){ if(ov.parentNode) ov.parentNode.removeChild(ov); return; }
    ov.style.pointerEvents = 'none';
    ov.classList.remove('backdrop-in');
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 250);
  }
  var btn = document.getElementById('wo-done-btn');
  if(btn) btn.onclick = close;
  ov.onclick = function(e){ if(e.target === ov) close(); };

  if(window.caliMotion){
    // Nur der Scrim blendet ein (reines Opacity) — die Karte hat unten ihre eigene
    // Scale-Entrance. overlayIn würde den ganzen Scrim um 16px verschieben.
    caliMotion.sheetIn(null, ov);
    // Kein zweites Konfetti, wenn gerade schon die Wochenziel-Feier lief
    if(!skipCelebrate) caliMotion.celebrate('burst');
    if(!caliMotion.reduced()){
      if(card.animate){
        card.animate(
          [{transform:'scale(0.94)'},{transform:'scale(1)'}],
          {duration:250, easing:'cubic-bezier(0.34,1.56,0.64,1)'}
        );
      }
      var exEl = document.getElementById('wo-done-ex');
      var setsEl = document.getElementById('wo-done-sets');
      var flEl = document.getElementById('wo-done-flames');
      if(exEl) caliMotion.countUp(exEl, exCount, {duration:600});
      if(setsEl) caliMotion.countUp(setsEl, setCount, {duration:600});
      if(flEl) caliMotion.countUp(flEl, flames, {duration:600});
    }
  }
}

function addExToWorkout(){
  if(!selWoEx){toast('Bitte zuerst eine Übung auswählen!');return;}
  var cu = document.getElementById('b-cust').value.trim();
  var band = cu || sBand;
  var note = document.getElementById('inp-note').value.trim();

  var ok=[];
  for(var i=0;i<sets.length;i++){if(sets[i].n.trim()!=='')ok.push({n:sets[i].n,b:sets[i].b});}
  if(!ok.length){toast('Mindestens einen Satz eintragen!');return;}

  woExercises.push({name:selWoEx.name,unit:selWoEx.unit,col:selWoEx.col,band:band,sets:ok,note:note});
  buildWoExList();
  animateLastWoExItem();

  // Reset form
  document.getElementById('inp-note').value='';
  document.getElementById('b-cust').value='';
  sets=[];sBand='';
  exChanged();
  addSet();
  toast(selWoEx.name+' hinzugefügt!');
}

// Nur das zuletzt hinzugefügte Element sanft einblenden (statt die ganze Liste)
function animateLastWoExItem(){
  if(window.caliMotion && caliMotion.reduced()) return;
  var list = document.getElementById('wo-ex-list');
  if(!list) return;
  var items = list.querySelectorAll('.wo-ex-item');
  if(!items.length) return;
  var last = items[items.length-1];
  if(last && last.animate){
    last.animate(
      [{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:250, easing:'cubic-bezier(0.22,1,0.36,1)'}
    );
  }
}

function buildWoExList(){
  var el = document.getElementById('wo-ex-list');
  if(!woExercises.length){
    el.innerHTML='<div class="empty" id="wo-empty">Noch keine Übungen hinzugefügt.</div>';
    return;
  }
  var h='';
  for(var i=0;i<woExercises.length;i++){
    var ex  = woExercises[i];
    var col = COLS[ex.col]||COLS.gr;
    var setsTxt = '';
    for(var k=0;k<ex.sets.length;k++){
      if(k>0)setsTxt+=' · ';
      setsTxt+='S'+(k+1)+': '+ex.sets[k].n;
      if(ex.sets[k].b&&ex.band)setsTxt+=' (+'+ex.sets[k].b+' Band)';
    }
    h+='<div class="wo-ex-item">';
    h+='<div class="wo-ex-dot" style="background:'+col+'"></div>';
    h+='<div class="wo-ex-col"><div class="wo-ex-name">'+ex.name+'</div><div class="wo-ex-sets">'+setsTxt+'</div></div>';
    h+='<button aria-label="Übung entfernen" onclick="removeWoEx('+i+')" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:14px;padding:10px;margin:-6px -6px -6px 0;flex-shrink:0;align-self:center;">&#x2715;</button>';
    h+='</div>';
  }
  el.innerHTML=h;
}

// Falsch geloggte Übung aus der laufenden Session entfernen (rein in-memory)
function removeWoEx(i){
  if(i<0 || i>=woExercises.length) return;
  woExercises.splice(i,1);
  buildWoExList();
  toast('Übung entfernt');
}

// ── EXERCISE FORM ─────────────────────────────────────────
function exChanged(){}

function pickBand(v,idx){
  sBand=v;
  isBand=(v!=='');
  for(var i=0;i<6;i++){var c=document.getElementById('chip'+i);if(c)c.className='chip'+(i===idx?' on':'');}
  document.getElementById('b-cust').value='';
  bsets();
}

function custBand(v){
  sBand=v;
  isBand=(v!=='');
  for(var i=0;i<6;i++){var c=document.getElementById('chip'+i);if(c)c.className='chip';}
  bsets();
}


// ── GURTEL ────────────────────────────────────────────────
var beltEnabled = false;
var beltKgVal = '';

function toggleBelt(){
  beltEnabled = !beltEnabled;
  var btn = document.getElementById('belt-toggle-btn');
  var row = document.getElementById('belt-kg-row');
  if(btn){
    btn.textContent = beltEnabled ? 'Gürtel: an' : 'Gürtel: aus';
    btn.style.borderColor = beltEnabled ? 'var(--blue-ink)' : 'var(--border)';
    btn.style.color = beltEnabled ? '#fff' : 'var(--muted)';
    btn.style.background = beltEnabled ? 'var(--blue-ink)' : 'var(--bg3)';
  }
  if(row) row.style.display = beltEnabled ? 'block' : 'none';
  bsets();
}

function addSet(){
  try {
    sets.push({n:'',b:'',kg:''});
    bsets();
  } catch(e) { /* fail silently */ }
}

function ds(i){
  if(sets.length<=1)return;
  sets.splice(i,1);
  bsets();
}

function sv(i,f,v){
  if(sets[i])sets[i][f]=v;
}

function bsets(){
  var box = document.getElementById('sbox');
  if(!box) return;
  box.innerHTML = '';
  if(!sets.length) return;
  var isBandEx = selWoEx && selWoEx.band===1;
  var showBand = isBandEx && sBand;
  var showKg = beltEnabled;
  var cols = '28px 1fr';
  if(showBand) cols += ' 1fr';
  if(showKg) cols += ' 1fr';
  cols += ' 40px';
  var hdr = document.getElementById('set-header');
  if(hdr) hdr.style.gridTemplateColumns = cols;
  var lb = document.getElementById('lbl-b');
  if(lb) lb.style.display = showBand ? 'block' : 'none';
  // Satznummern als TEXT → Ink-Varianten (Kontrast), helle Originale bleiben Füllfarben
  var colors = ['var(--accent-ink)','var(--amber-ink)','var(--teal-ink)','var(--purple-ink)'];
  for(var i=0;i<sets.length;i++){
    var row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:'+cols+';gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);';
    var num = document.createElement('div');
    num.className = 'num';
    num.style.cssText = 'font-family:inherit;font-size:16px;text-align:center;color:'+colors[i<4?i:3]+';';
    num.textContent = String(i+1);
    var inp = document.createElement('input');
    inp.type = 'number';
    inp.placeholder = '0';
    inp.value = sets[i].n || '';
    inp.style.cssText = 'background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:9px 8px;font-size:16px;font-family:inherit;outline:none;width:100%;text-align:center;';
    inp.setAttribute('data-i', String(i));
    inp.onchange = function(){sets[parseInt(this.getAttribute('data-i'),10)].n=this.value;};
    inp.oninput = function(){sets[parseInt(this.getAttribute('data-i'),10)].n=this.value;};
    var del = document.createElement('button');
    del.innerHTML = '&#x2715;';
    del.setAttribute('aria-label', 'Satz entfernen');
    del.style.cssText = 'background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;text-align:center;padding:12px 10px;margin:-8px -2px;';
    del.setAttribute('data-i', String(i));
    del.onclick = function(){
      var idx2=parseInt(this.getAttribute('data-i'),10);
      if(sets.length>1){sets.splice(idx2,1);bsets();}
    };
    row.appendChild(num);
    row.appendChild(inp);
    if(showBand){
      var binp = document.createElement('input');
      binp.type = 'number';
      binp.placeholder = '0';
      binp.value = sets[i].b || '';
      binp.style.cssText = 'background:rgba(245,158,11,0.08);border:1px solid #F59E0B;color:var(--amber-ink);border-radius:10px;padding:9px 8px;font-size:16px;font-family:inherit;outline:none;width:100%;text-align:center;';
      binp.setAttribute('data-i', String(i));
      binp.onchange = function(){sets[parseInt(this.getAttribute('data-i'),10)].b=this.value;};
      binp.oninput = function(){sets[parseInt(this.getAttribute('data-i'),10)].b=this.value;};
      row.appendChild(binp);
    }
    if(showKg){
      var kinp = document.createElement('input');
      kinp.type = 'number';
      kinp.placeholder = '0';
      kinp.value = sets[i].kg || beltKgVal || '';
      kinp.style.cssText = 'background:rgba(56,189,248,0.08);border:1px solid #38BDF8;color:var(--blue-ink);border-radius:10px;padding:9px 8px;font-size:16px;font-family:inherit;outline:none;width:100%;text-align:center;';
      kinp.setAttribute('data-i', String(i));
      kinp.onchange = function(){sets[parseInt(this.getAttribute('data-i'),10)].kg=this.value;};
      kinp.oninput = function(){sets[parseInt(this.getAttribute('data-i'),10)].kg=this.value;};
      row.appendChild(kinp);
    }
    row.appendChild(del);
    box.appendChild(row);
  }
}

// ── TOAST ─────────────────────────────────────────────────
// Entrance kommt aus CSS (toastIn); dieser JS-Fade ist der EINZIGE Exit.
// Gleichzeitige Toasts stapeln sich nach oben statt sich zu überlagern.
var _activeToasts = [];
function toast(m){
  var t=document.createElement('div');
  t.className='toast';t.textContent=m;
  t.style.bottom=(120+_activeToasts.length*46)+'px';
  _activeToasts.push(t);
  document.body.appendChild(t);
  setTimeout(function(){
    t.style.opacity='0';t.style.transition='opacity 0.4s';
    setTimeout(function(){
      if(t.parentNode)t.parentNode.removeChild(t);
      var ix=_activeToasts.indexOf(t);
      if(ix>-1)_activeToasts.splice(ix,1);
    },500);
  },1800);
}

// ── BESTS ─────────────────────────────────────────────────
var BEST_TRACKED_NAMES=['Klimmzuge','Dips','Liegestutze','Plank','Muscle-Ups','L-Sit Hold','Tuck Front Lever'];
function countPersonalBests(){
  var count=0;
  for(var i=0;i<BEST_TRACKED_NAMES.length;i++){
    var n=BEST_TRACKED_NAMES[i];
    for(var j=0;j<ents.length;j++){ if(ents[j].name===n){ count++; break; } }
  }
  return count;
}
function bb(){
  var el=document.getElementById('bests');
  if(!el)return;
  var nm=BEST_TRACKED_NAMES;
  var h='';
  for(var i=0;i<nm.length;i++){
    var n=nm[i];var f=[];
    for(var j=0;j<ents.length;j++){if(ents[j].name===n)f.push(ents[j]);}
    if(!f.length)continue;
    f.sort(function(a,b){return a.date<b.date?1:-1;});
    var e=f[0];var cl=CC[n]||'gr';
    var st='';
    for(var k=0;k<e.sets.length;k++){
      if(k>0)st+=' &middot; ';
      st+='S'+(k+1)+': '+e.sets[k].n;
      if(e.sets[k].b&&e.band)st+=' <span style="color:var(--amber-ink)">('+e.sets[k].b+' Band)</span>';
    }
    h+='<div class="bb '+cl+'"><div class="bbn">'+n+'</div>';
    h+='<div style="font-size:11px;color:var(--muted);margin-top:3px">'+e.date+(e.band?' &bull; '+e.band:'')+'</div>';
    h+='<div style="font-size:12px;color:var(--muted);margin-top:5px">'+st+'</div></div>';
  }
  if(h){
    el.className='';
    el.style.cssText='';
    el.innerHTML=h;
    if(window.caliMotion)caliMotion.stagger(el);
  } else {
    el.className='pk-card';
    el.style.cssText='display:flex;align-items:center;gap:16px;padding:20px;';
    el.innerHTML=
      iconWrap('trophy',{size:24,box:52,radius:16})+
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:3px;">Noch keine Rekorde</div>'+
        '<div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:10px;">Schließe dein erstes Workout ab, um persönliche Bestleistungen zu speichern.</div>'+
        '<button class="pressable" onclick="startWorkout(null)" style="background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px 16px;cursor:pointer;">Workout starten</button>'+
      '</div>';
  }
}

// ── START-SEITE DASHBOARD (Wochenfortschritt) ──────────────
function buildStartDashboard(){
  var el=document.getElementById('start-dashboard');
  if(!el)return;

  var weekDone=(typeof getWeeklyProgress==='function')?getWeeklyProgress():0;
  var weekGoal=(typeof streakData!=='undefined'&&streakData.weeklyGoal)?streakData.weeklyGoal:3;
  var weekPct=weekGoal>0?Math.min(100,Math.round((weekDone/weekGoal)*100)):0;
  var streak=(typeof streakData!=='undefined')?(streakData.currentStreak||0):0;
  var bestsCount=countPersonalBests();
  // Erreichte, aber noch nicht abgeholte Meilenstein-Belohnungen (Helfer in main2ba.js)
  var unclaimedMs=(typeof getUnclaimedMilestoneCount==='function')?getUnclaimedMilestoneCount():0;

  var tiles=[
    {icon:'flame', val:'<span class="num" data-cu="'+weekDone+'">'+weekDone+'</span> / <span class="num">'+weekGoal+'</span>', label:'Workouts diese Woche', bar:weekPct},
    {icon:'trend', val:'<span class="num" data-cu="'+streak+'">'+streak+'</span> Tage', label:'Aktueller Streak', hint:streak===0?'Bleib dran und baue Kontinuität auf.':'', msHint:unclaimedMs>0?'Belohnung im Profil abholen':''},
    {icon:'trophy', val:'<span class="num" data-cu="'+bestsCount+'">'+bestsCount+'</span>', label:'Persönliche Bestleistungen', hint:bestsCount===0?'Schließe Workouts ab, um Bestleistungen zu erzielen.':''}
  ];

  // Level-Kachel, sobald der XP-Cache existiert (wird von xp.js gepflegt)
  var xpCache=null;
  try{ xpCache=localStorage.getItem('cali_xp_cache'); }catch(e){}
  if(xpCache!==null && typeof getLevelFromXP==='function'){
    var lv=getLevelFromXP(parseInt(xpCache,10)||0);
    tiles.push({
      icon:'star',
      val:'Level <span class="num" data-cu="'+lv.level+'">'+lv.level+'</span>',
      label: lv.xpToNext>0 ? ('Noch '+lv.xpToNext+' XP bis Level '+(lv.level+1)) : 'Max. Level erreicht',
      bar: lv.progress
    });
  }

  var grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat('+(tiles.length===4?'2':'3')+',1fr);gap:10px;';
  tiles.forEach(function(t){
    var tile=document.createElement('div');
    tile.className='pk-card';
    tile.style.cssText='padding:14px;';
    tile.innerHTML=
      '<div style="margin-bottom:10px;">'+iconWrap(t.icon,{size:16,box:34,radius:11})+'</div>'+
      '<div style="font-size:17px;font-weight:800;color:var(--text);line-height:1.2;">'+t.val+'</div>'+
      '<div style="font-size:11px;color:var(--muted);margin-top:2px;">'+t.label+'</div>'+
      (typeof t.bar==='number'?'<div style="height:5px;background:var(--bg3);border-radius:4px;overflow:hidden;margin-top:8px;"><div class="prog-fill" data-bar="'+t.bar+'" style="border-radius:4px;width:'+t.bar+'%;"></div></div>':'')+
      (t.hint?'<div style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.4;">'+t.hint+'</div>':'')+
      (t.msHint?'<div style="font-size:11px;color:var(--accent-ink);font-weight:600;margin-top:6px;line-height:1.4;">'+t.msHint+'</div>':'');
    grid.appendChild(tile);
  });
  el.innerHTML='';
  el.appendChild(grid);
  // Kacheln gestaffelt einblenden (wie Profil-, Badge- und Park-Grids)
  if(window.caliMotion) caliMotion.stagger(grid);

  // Zahlen hochzählen + Fortschrittsbalken einlaufen lassen
  if(window.caliMotion){
    var cus=grid.querySelectorAll('[data-cu]');
    for(var ci2=0;ci2<cus.length;ci2++){
      caliMotion.countUp(cus[ci2], parseInt(cus[ci2].getAttribute('data-cu'),10)||0, {duration:600});
    }
    var bars=grid.querySelectorAll('[data-bar]');
    for(var bi2=0;bi2<bars.length;bi2++){
      caliMotion.animateBar(bars[bi2], parseFloat(bars[bi2].getAttribute('data-bar'))||0);
    }
  }
}

// ── WORKOUT HISTORY ───────────────────────────────────────
function buildHistory(){
  var el=document.getElementById('wo-history');
  if(!ents.length){el.innerHTML='<div class="empty">Noch keine Workouts.</div>';return;}

  // Group by date
  var byDate={};
  var dateOrder=[];
  for(var i=0;i<ents.length;i++){
    var d=ents[i].date;
    if(!byDate[d]){byDate[d]=[];dateOrder.push(d);}
    byDate[d].push(ents[i]);
  }
  dateOrder.sort(function(a,b){return a<b?1:-1;});

  var h='';
  for(var di=0;di<dateOrder.length;di++){
    var d=dateOrder[di];
    var exs=byDate[d];
    var dur=exs[0].woDur||'';
    h+='<div class="wh-item">';
    h+='<div class="wh-top"><div class="wh-date">'+d.slice(5).replace('-','.')+'.'+(d.slice(0,4))+'</div>';
    if(dur)h+='<div class="wh-dur">'+dur+'</div>';
    h+='</div><div class="wh-exlist">';
    for(var j=0;j<exs.length;j++){
      var ex=exs[j];
      var col=COLS[ex.col]||COLS.gr;
      var st='';
      for(var k=0;k<ex.sets.length;k++){
        if(k>0)st+=' · ';
        st+='S'+(k+1)+': '+ex.sets[k].n+' '+ex.unit;
        if(ex.sets[k].b&&ex.band)st+=' (+'+ex.sets[k].b+')';
      }
      h+='<div class="wh-ex"><div class="wh-dot" style="background:'+col+'"></div>';
      h+='<div><div class="wh-exname">'+ex.name+(ex.band?' <span style="font-size:11px;color:var(--amber-ink)">'+ex.band+'</span>':'')+'</div>';
      h+='<div class="wh-sets">'+st+'</div></div></div>';
    }
    h+='</div></div>';
  }
  el.innerHTML=h;
  if(window.caliMotion)caliMotion.stagger(el);
}

// ── CHART ─────────────────────────────────────────────────
function drawChart(){
  var ex=document.getElementById('cex').value;
  var data=[];for(var i=0;i<ents.length;i++){if(ents[i].name===ex)data.push(ents[i]);}
  data.sort(function(a,b){return a.date>b.date?1:-1;});
  var cv=document.getElementById('mc');
  var ce=document.getElementById('ce');
  if(!data.length){cv.style.display='none';ce.style.display='block';if(mc){mc.destroy();mc=null;}return;}
  cv.style.display='block';ce.style.display='none';
  var col=COLS[CC[ex]]||COLS.gr;
  var vals=[];var lbls=[];var chartData=[];

  // Group by woId (one point per workout session)
  // Entries without woId get their own id as fallback
  var byWo={};var woArr=[];
  for(var i=0;i<data.length;i++){
    var wid=data[i].woId||('fallback_'+data[i].id);
    if(!byWo[wid]){byWo[wid]=[];woArr.push(wid);}
    byWo[wid].push(data[i]);
  }
  // Sort by date of first entry in each workout
  woArr.sort(function(a,b){
    var da=byWo[a][0].date;var db=byWo[b][0].date;
    return da>db?1:-1;
  });

  for(var wi=0;wi<woArr.length;wi++){
    var wid=woArr[wi];
    var woEnts=byWo[wid];
    var total=0;var count=0;
    for(var ei=0;ei<woEnts.length;ei++){
      var e=woEnts[ei];
      for(var k=0;k<e.sets.length;k++){
        var raw=e.sets[k].n;var num=0;
        if(e.unit==='Min:Sek'&&raw.indexOf(':')>-1){var pts=raw.split(':');num=parseInt(pts[0],10)*60+parseInt(pts[1],10);}
        else{num=parseFloat(raw)||0;}
        if(num>0){total+=num;count++;}
      }
    }
    var avg=count>0?Math.round((total/count)*10)/10:0;
    vals.push(avg);
    lbls.push(woEnts[0].date.slice(5).replace('-','.'));
    chartData.push({date:woEnts[0].date,avg:avg,sets:count,entries:woEnts.length});
  }
  data=chartData;
  if(mc)mc.destroy();
  // Chart.js kann keine CSS-Variablen lesen — Token-WERTE hier hart kodiert:
  // '#18140F' = var(--text), '#EDEAE1' = var(--bg3), '#6E6759' = var(--muted)
  mc=new Chart(cv,{type:'line',data:{labels:lbls,datasets:[{data:vals,borderColor:col,backgroundColor:col+'20',fill:true,tension:0.4,pointBackgroundColor:col,pointRadius:5,borderWidth:2}]},options:{responsive:true,plugins:{legend:{display:false},tooltip:{backgroundColor:'#18140F',borderColor:col,borderWidth:1,titleColor:col,bodyColor:'#EDEAE1',callbacks:{label:function(ctx){var d=data[ctx.dataIndex];return ' Ø '+ctx.parsed.y+' ('+d.sets+' Sätze, '+d.entries+' Einträge)';}}}},scales:{x:{ticks:{color:'#6E6759',font:{size:10}},grid:{color:'rgba(0,0,0,0.06)'}},y:{ticks:{color:'#6E6759',font:{size:10}},grid:{color:'rgba(0,0,0,0.06)'},title:{display:true,text:'Ø pro Workout',color:'#6E6759',font:{size:10},padding:4}}}}});
}

// ── HR ────────────────────────────────────────────────────
function uploadHF(inp){
  var files=inp.files;
  for(var i=0;i<files.length;i++){
    (function(f){
      var r=new FileReader();
      r.onload=function(ev){hrs.push({id:new Date().getTime()+Math.floor(Math.random()*9999),src:ev.target.result,date:new Date().toISOString().slice(0,10)});shr();bhr();};
      r.readAsDataURL(f);
    })(files[i]);
  }
}
function dhr(id){var n=[];for(var i=0;i<hrs.length;i++){if(hrs[i].id!==id)n.push(hrs[i]);}hrs=n;shr();bhr();}
function bhr(){
  var g=document.getElementById('hgal');var l=document.getElementById('hflbl');
  if(!hrs.length){g.innerHTML='';l.style.display='none';return;}
  l.style.display='block';
  var rv=hrs.slice().reverse();var h='';
  for(var i=0;i<rv.length;i++){var img=rv[i];h+='<div class="hi"><img src="'+img.src+'" alt="HF"><div class="hii"><div class="hd">'+img.date+'</div><button class="hdel" aria-label="Screenshot löschen" onclick="dhr('+img.id+')">&#x2715;</button></div></div>';}
  g.innerHTML=h;
}

// ── EXERCISE PICKER ──────────────────────────────────────
var selWoEx = null;
var selPfEx = null;

function fillWoExSelect(){
  try {
    var sel = document.getElementById('wo-ex-sel');
    var cat = document.getElementById('wo-cat-sel');
    if(!sel) return;
    var catVal = (cat && cat.value) ? cat.value : 'Alle';
    // Clear and rebuild
    while(sel.firstChild) sel.removeChild(sel.firstChild);
    var addedCount = 0;
    for(var i=0;i<EX_DB.length;i++){
      if(catVal!=='Alle' && EX_DB[i].cat!==catVal) continue;
      var opt = document.createElement('option');
      opt.value = String(i);
      opt.text = EX_DB[i].name + ' (' + EX_DB[i].unit + ')';
      sel.add(opt);
      addedCount++;
    }
    // Set first exercise as selected
    if(addedCount > 0){
      sel.selectedIndex = 0;
      var firstVal = parseInt(sel.options[0].value, 10);
      if(!isNaN(firstVal) && EX_DB[firstVal]){
        selWoEx = EX_DB[firstVal];
        isBand = selWoEx.band===1;
        var br=document.getElementById('band-row');
        if(br) br.style.display=isBand?'block':'none';
        var ln=document.getElementById('lbl-n');
        if(ln) ln.textContent=selWoEx.unit==='Sek'?'Sekunden':selWoEx.unit==='Min:Sek'?'Min:Sek':'Wdh.';
        var lb=document.getElementById('lbl-b');
        if(lb) lb.style.display=isBand?'inline':'none';
      }
    }
  } catch(e) { /* fail silently */ }
}

function woCatChanged(){
  fillWoExSelect();
}

function woExSelChanged(){
  var sel = document.getElementById('wo-ex-sel');
  if(!sel) return;
  var idx = parseInt(sel.value, 10);
  if(isNaN(idx)||!EX_DB[idx]) return;
  selWoEx = EX_DB[idx];
  isBand = selWoEx.band===1;
  var br = document.getElementById('band-row');
  if(br) br.style.display = isBand ? 'block' : 'none';
  var ln = document.getElementById('lbl-n');
  if(ln) ln.textContent = selWoEx.unit==='Sek'?'Sekunden':selWoEx.unit==='Min:Sek'?'Min:Sek':'Wdh.';
  var lb = document.getElementById('lbl-b');
  if(lb) lb.style.display = isBand ? 'inline' : 'none';
  // Reset sets
  sets = [];
  sBand = '';
  if(woActive) addSet();
}

function fillPfExSelect(){
  var cat = document.getElementById('pf-cat-sel');
  var sel = document.getElementById('pf-ex-sel');
  if(!cat||!sel) return;
  var catVal = cat.value;
  sel.innerHTML = '';
  for(var i=0;i<EX_DB.length;i++){
    var ex = EX_DB[i];
    if(catVal!=='Alle' && ex.cat!==catVal) continue;
    var opt = document.createElement('option');
    opt.value = i;
    opt.textContent = ex.name + ' (' + ex.unit + ')';
    sel.appendChild(opt);
  }
  pfExSelChanged();
}

function pfCatChanged(){
  fillPfExSelect();
}

function pfExSelChanged(){
  var sel = document.getElementById('pf-ex-sel');
  if(!sel||!sel.options.length) return;
  var idx = parseInt(sel.value, 10);
  if(isNaN(idx)) return;
  selPfEx = EX_DB[idx];
  var lbl = document.getElementById('pf-lbl-n');
  if(lbl) lbl.textContent = selPfEx.unit==='Sek'?'Sekunden (Ziel)':selPfEx.unit==='Min:Sek'?'Min:Sek (Ziel)':'Wdh. (Ziel)';
}

// Stubs for old functions that might be called
function initWoCatChips(){}
function buildWoExPicker(){}
function initPfCatChips(){}
function buildPfExPicker(){}
function selectWoExByFiltered(){}


// ── PLAN BLOCKS ───────────────────────────────────────────
function buildPlanBlocks(){
  var wrap = document.getElementById('plan-blocks-wrap');
  var el   = document.getElementById('plan-blocks-list');
  if(!planBlocks.length){wrap.style.display='none';return;}
  wrap.style.display='block';
  // Satznummern als TEXT → Ink-Varianten (Kontrast)
  var ca=['var(--accent-ink)','var(--amber-ink)','var(--teal-ink)','var(--purple-ink)'];
  var h='';
  for(var i=0;i<planBlocks.length;i++){
    var b=planBlocks[i];
    var col=COLS[b.col]||COLS.gr;
    var isDone=b.done;
    var isOpen=b.open;
    h+='<div class="peb" id="peb-'+i+'">';
    h+='<div class="peb-header" role="button" tabindex="0" aria-expanded="'+(isOpen?'true':'false')+'" onclick="togglePlanBlock('+i+')" onkeydown="pebKey(event,'+i+')">';
    h+='<div class="peb-dot" style="background:'+col+'"></div>';
    h+='<div class="peb-name">'+b.name+'</div>';
    h+='<div class="peb-status '+(isDone?'done':'open')+'">'+(isDone?'Erledigt':b.sets.length+' Sätze')+'</div>';
    h+='<div class="peb-arrow'+(isOpen?' open':'')+'">&#9654;</div>';
    h+='</div>';
    // Der Körper wird IMMER gerendert — allein .acc-body.open steuert auf/zu,
    // damit auch das Zuklappen animiert (statt den Inhalt hart zu löschen).
    h+='<div class="acc-body"><div class="peb-body open">';
    for(var k=0;k<b.sets.length;k++){
      var sc=ca[k<4?k:3];
      h+='<div class="peb-setrow">';
      h+='<div class="peb-snum num" style="color:'+sc+'">'+(k+1)+'</div>';
      h+='<input class="peb-inp" type="number" placeholder="Ziel: '+b.sets[k].target+' '+b.unit+'" value="'+(b.sets[k].actual||'')+'" oninput="pbSetVal('+i+','+k+',this.value)">';
      h+='</div>';
    }
    h+='<button class="peb-add-btn" onclick="pbDone('+i+')">Sätze ins Workout übernehmen</button>';
    h+='</div></div>';
    h+='</div>';
  }
  el.innerHTML=h;
  // Aufklapp-Physik: der offene Block startet bei 0fr und fährt auf — der
  // Double-rAF garantiert, dass der Startzustand gerendert wurde
  for(var n=0;n<planBlocks.length;n++){
    var pbEl=document.getElementById('peb-'+n);
    if(!pbEl)continue;
    var body=pbEl.querySelector('.acc-body');
    if(!body)continue;
    var nOpen=!!planBlocks[n].open;
    // Zugeklappte Körper aus Tab-Reihenfolge und Screenreader nehmen
    try{ body.inert=!nOpen; }catch(e){}
    if(!nOpen)continue;
    if(window.caliMotion && !caliMotion.reduced()){
      (function(bd){requestAnimationFrame(function(){requestAnimationFrame(function(){
        if(bd.isConnected)bd.classList.add('open');
      });});})(body);
    } else {
      body.classList.add('open');
    }
  }
}

function pebKey(ev,i){
  if(ev.key==='Enter'||ev.key===' '){
    ev.preventDefault();
    togglePlanBlock(i);
  }
}

// Klassen am lebenden DOM umschalten statt neu zu rendern — so animieren beide
// Richtungen, und eine gerade getippte Satz-Eingabe verliert nicht den Fokus.
function togglePlanBlock(i){
  if(!planBlocks[i]||planBlocks[i].done)return; // already done
  planBlocks[i].open=!planBlocks[i].open;
  for(var j=0;j<planBlocks.length;j++){
    if(j!==i)planBlocks[j].open=false; // Close others
    var pb=document.getElementById('peb-'+j);
    if(!pb)continue;
    var jOpen=!!planBlocks[j].open;
    var body=pb.querySelector('.acc-body');
    var arr=pb.querySelector('.peb-arrow');
    var hd=pb.querySelector('.peb-header');
    if(body){
      if(jOpen)body.classList.add('open');else body.classList.remove('open');
      try{ body.inert=!jOpen; }catch(e){}
    }
    if(arr){ if(jOpen)arr.classList.add('open');else arr.classList.remove('open'); }
    if(hd)hd.setAttribute('aria-expanded',jOpen?'true':'false');
  }
}

function pbSetVal(bi,si,v){
  if(planBlocks[bi]&&planBlocks[bi].sets[si])planBlocks[bi].sets[si].actual=v;
}

function pbDone(i){
  var b=planBlocks[i];
  var ok=[];
  for(var k=0;k<b.sets.length;k++){
    var v=b.sets[k].actual||b.sets[k].target; // use actual or fall back to target
    ok.push({n:v,b:''});
  }
  woExercises.push({name:b.name,unit:b.unit,col:b.col,band:'',sets:ok,note:''});
  planBlocks[i].done=true;
  planBlocks[i].open=false;
  buildPlanBlocks();
  buildWoExList();
  animateLastWoExItem();
  // Auto-open next undone block
  for(var j=i+1;j<planBlocks.length;j++){
    if(!planBlocks[j].done){planBlocks[j].open=true;break;}
  }
  buildPlanBlocks();
  toast(b.name+' gespeichert!');
}

// ── PLANS ──────────────────────────────────────────────────
var plans = [];
var pfExercises = []; // exercises being added to current plan form
var pfSets = [];      // sets for current exercise in plan form
var editPlanId = null;

function lpd(){try{var a=localStorage.getItem('cali_plans');plans=a?JSON.parse(a):[];}catch(x){plans=[];}}
function spd(){try{localStorage.setItem('cali_plans',JSON.stringify(plans));}catch(x){}}

function showPlanForm(){
  pfExercises=[];pfSets=[];editPlanId=null;
  document.getElementById('pf-name').value='';
  document.getElementById('pf-ex-list').innerHTML='';
  document.getElementById('plan-form').style.display='block';
  document.getElementById('plan-list').style.display='none';
  fillPfExSelect();
  pfAddSet();
}