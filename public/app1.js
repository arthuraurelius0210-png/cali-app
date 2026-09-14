// ── CUSTOM ICON SET (Dark Mono: reine Line-Icons, stroke 1.5, currentColor) ──
// Die Farbe kommt vom umgebenden Element (Standard --muted, betont --accent/--text) —
// deshalb kein fill und keine Farb-Variablen mehr in den SVGs selbst.
var _CI_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
var CALI_ICONS = {
  flame: '<svg '+_CI_ATTRS+'><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4.1 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 002.5 2.5z"/></svg>',
  trophy: '<svg '+_CI_ATTRS+'><path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 5H4a3 3 0 003 3M17 5h3a3 3 0 01-3 3"/><path d="M12 13v3M9 20h6M9.5 20c0-2 1-2.5 2.5-3s2.5-1 2.5-3"/></svg>',
  chart: '<svg '+_CI_ATTRS+'><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>',
  trend: '<svg '+_CI_ATTRS+'><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  calendar: '<svg '+_CI_ATTRS+'><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  star: '<svg '+_CI_ATTRS+'><path d="M12 3l2.7 5.8 6.3.6-4.8 4.3 1.4 6.3L12 16.9 6.4 20l1.4-6.3L3 9.4l6.3-.6z"/></svg>',
  target: '<svg '+_CI_ATTRS+'><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg>',
  pin: '<svg '+_CI_ATTRS+'><path d="M12 21s7-7.6 7-12a7 7 0 10-14 0c0 4.4 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  handshake: '<svg '+_CI_ATTRS+'><path d="M2 12l4-3 4 2 3-2 3 2 4-2 2 3-3 5-3-1-3 2-3-2-3 1-4-5z"/></svg>',
  search: '<svg '+_CI_ATTRS+'><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-5-5"/></svg>',
  bookmark: '<svg '+_CI_ATTRS+'><path d="M6 3h12v18l-6-4-6 4V3z"/></svg>',
  play: '<svg '+_CI_ATTRS+'><path d="M8 5.5v13l10-6.5z"/></svg>',
  lightbulb: '<svg '+_CI_ATTRS+'><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0012 3z"/></svg>',
  dumbbell: '<svg '+_CI_ATTRS+'><path d="M4 9v6M2 10v4M20 9v6M22 10v4M7 12h10"/><rect x="5" y="8" width="3" height="8" rx="1"/><rect x="16" y="8" width="3" height="8" rx="1"/></svg>',
  gear: '<svg '+_CI_ATTRS+'><circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 000-3l2-1.5-2-3.5-2.4 1a7.6 7.6 0 00-2.6-1.5L14 2h-4l-.4 2.5a7.6 7.6 0 00-2.6 1.5l-2.4-1-2 3.5 2 1.5a7.6 7.6 0 000 3l-2 1.5 2 3.5 2.4-1a7.6 7.6 0 002.6 1.5L10 22h4l.4-2.5a7.6 7.6 0 002.6-1.5l2.4 1 2-3.5z"/></svg>',
  bell: '<svg '+_CI_ATTRS+'><path d="M6 10a6 6 0 0112 0c0 4 1.5 5 1.5 5h-15S6 14 6 10z"/><path d="M10 19a2 2 0 004 0"/></svg>',
  pencil: '<svg '+_CI_ATTRS+'><path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/></svg>',
  check: '<svg '+_CI_ATTRS+'><path d="M5 13l5 5L20 6"/></svg>',
  moon: '<svg '+_CI_ATTRS+'><path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z"/></svg>',
  flex: '<svg '+_CI_ATTRS+'><path d="M4 14c0-2 1-3 2-3 0-2 1-3 2.5-3 .3-1.5 1.5-3 3.5-3 3 0 4.5 2 4.5 5 1.5 0 2.5 1.5 2.5 3 1 .3 1.5 1.3 1.5 2.5C20.5 18 18 20 15 20H8c-2.5 0-4-2-4-4v-2z"/></svg>',
  people: '<svg '+_CI_ATTRS+'><circle cx="8" cy="8" r="3"/><path d="M2 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20c.2-2.5 1.8-4 4-4"/></svg>',
  clock: '<svg '+_CI_ATTRS+'><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
};
// ci(name[, color]) — Icon-SVG, füllt seinen Container; color (optional, z.B. 'var(--accent)')
// setzt die Strichfarbe, sonst erbt sie vom Elternelement.
function ci(name, color){
  var svg = CALI_ICONS[name] || '';
  var st = 'display:block;' + (color ? 'color:'+color+';' : '');
  return svg.replace('<svg ', '<svg width="100%" height="100%" style="'+st+'" ');
}
// iconWrap(name, {size:18, box:44, color:'var(--muted)'}) — 44px-Ring (1px --line2, rund)
// mit Line-Icon in --muted. Legacy-Optionen bg/radius werden weiter angenommen; ohne sie
// entsteht der Kontrakt-Ring (§5.7). border:false → Icon ohne Ring.
function iconWrap(name, opts){
  opts = opts || {};
  var size = opts.size || 18;
  var box = opts.box || 44;
  var bg = opts.bg || 'transparent';
  var radius = opts.radius != null ? opts.radius+'px' : '50%';
  var color = opts.color || 'var(--muted)';
  var border = opts.border === false ? 'none' : '1px solid var(--line2)';
  return '<div style="width:'+box+'px;height:'+box+'px;border-radius:'+radius+';background:'+bg+';border:'+border+';color:'+color+';box-sizing:border-box;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+
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
// Kategorie-Dots (Dark Mono): ein Orange, sonst neutral — alle Kategorien auf --muted2 (inaktiver Dot)
var EX_CAT_COLORS = {Pull:'var(--muted2)',Push:'var(--muted2)',Core:'var(--muted2)',Legs:'var(--muted2)',Skills:'var(--muted2)',Alle:'var(--muted2)'};
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

// Schlüssel (gr/or/te/pu/am/bl) sind gespeicherte Daten — die Werte sind Tokens.
// Dark Mono: keine Kategorie-Palette mehr, alle Dots neutral (--muted2), Orange bleibt dem CTA vorbehalten.
var COLS = {gr:'var(--muted2)',or:'var(--muted2)',te:'var(--muted2)',pu:'var(--muted2)',am:'var(--muted2)',bl:'var(--muted2)'};
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
      // trockener Pop ohne Overshoot (Dark Mono: kein Spring)
      activeTab.animate(
        [{transform:'scale(0.92)'},{transform:'scale(1)'}],
        {duration:200, easing:'cubic-bezier(0.22,1,0.36,1)'}
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
        {duration:200, easing:'cubic-bezier(0.22,1,0.36,1)'}
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
  _woExListEl().innerHTML = '<div class="empty" id="wo-empty">Noch keine Übungen hinzugefügt.</div>';
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
        awardXP(10, 'Workout abgeschlossen');
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
  _woExListEl().innerHTML = '<div class="empty" id="wo-empty">Noch keine Übungen hinzugefügt.</div>';
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
// "12min 05sek" (Format aus finalizeEndWorkout) → "12:05"; null, wenn das Format nicht passt
function _woDurClock(durStr){
  var m = /^(\d+)min\s*(\d+)sek$/.exec(String(durStr||'').trim());
  if(!m) return null;
  var mm = parseInt(m[1],10), ss = parseInt(m[2],10);
  return (mm<10?'0'+mm:''+mm)+':'+(ss<10?'0'+ss:''+ss);
}
function showWorkoutDone(durStr, exCount, setCount, flames, autoCommitted){
  var skipCelebrate = _woSkipCelebrate;
  _woSkipCelebrate = false;
  var old = document.getElementById('wo-done-ov');
  if(old && old.parentNode) old.parentNode.removeChild(old);

  var ov = document.createElement('div');
  ov.id = 'wo-done-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2500;display:flex;align-items:center;justify-content:center;padding:20px;';

  var card = document.createElement('div');
  card.style.cssText = 'background:var(--card);border:1px solid var(--line2);border-radius:var(--r-card);box-shadow:none;padding:20px 16px;width:100%;max-width:340px;text-align:center;';

  function statRow(label, valHtml){
    return '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:44px;padding:6px 0;border-bottom:1px solid var(--line);">'+
      '<span class="lbl">'+label+'</span>'+
      '<span class="row-val num">'+valHtml+'</span>'+
    '</div>';
  }

  // Die eine große Display-Zahl der Karte: die Dauer als mm:ss in Punktmatrix
  var clock = _woDurClock(durStr);

  var h = '<div style="display:flex;justify-content:center;margin-bottom:12px;">'+iconWrap('trophy',{size:18,box:44,color:'var(--accent)'})+'</div>';
  h += '<div class="ttl">Workout geschafft</div>';
  h += '<div class="row-sub" style="margin-top:4px;">Stark! Dein Training ist gespeichert.</div>';
  if(clock){
    h += '<div class="dotnum num" style="font-size:64px;color:var(--accent);margin:18px 0 6px;">'+clock+'</div>';
    h += '<div class="unit" style="margin-bottom:10px;">Dauer</div>';
  } else {
    h += '<div style="height:12px;"></div>';
    h += statRow('Dauer', durStr);
  }
  h += statRow('Übungen', '<span id="wo-done-ex">'+exCount+'</span>');
  h += statRow('Sätze', '<span id="wo-done-sets">'+setCount+'</span>');
  if(flames > 0){
    h += statRow('Flames verdient', '<span id="wo-done-flames">'+flames+'</span>');
  }
  if(autoCommitted > 0){
    h += '<div class="row-sub" style="margin-top:10px;">'+autoCommitted+' offene Plan-Übung'+(autoCommitted>1?'en':'')+' automatisch übernommen.</div>';
  }
  h += '<button id="wo-done-btn" type="button" class="btn" style="margin-top:18px;">Weiter</button>';
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
        // kurze, trockene Scale-Entrance ohne Overshoot
        card.animate(
          [{transform:'scale(0.96)',opacity:0},{transform:'scale(1)',opacity:1}],
          {duration:200, easing:'cubic-bezier(0.22,1,0.36,1)'}
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

// Container der Session-Übungen als bordered .list-Karte (§5.2). Die Indizes
// "01, 02 …" kommen per CSS-Counter aus .numbered (tracker.html) — hier kein eigener Index.
function _woExListEl(){
  var el = document.getElementById('wo-ex-list');
  if(el && el.classList && !el.classList.contains('list')) el.classList.add('list');
  return el;
}
function buildWoExList(){
  var el = _woExListEl();
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
    // Nummerierte Listenzeile: [01] · Kategorie-Dot · Name + Sätze · ✕ (statt Chevron — die Zeile führt nirgendwohin)
    h+='<div class="list-row wo-ex-item" style="cursor:default;padding:10px 14px;align-items:center;">';
    h+='<div class="wo-ex-dot" style="background:'+col+';margin-top:0;"></div>';
    h+='<div class="wo-ex-col"><div class="wo-ex-name">'+ex.name+'</div><div class="wo-ex-sets num">'+setsTxt+'</div></div>';
    h+='<button type="button" class="pressable" aria-label="Übung entfernen" onclick="removeWoEx('+i+')" style="background:none;border:none;color:var(--muted2);cursor:pointer;font-family:inherit;font-size:14px;min-width:36px;min-height:36px;padding:6px;margin:0 -6px 0 0;flex-shrink:0;">&#x2715;</button>';
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
    btn.setAttribute('aria-pressed', beltEnabled ? 'true' : 'false');
    // Optik kommt allein aus .belt-toggle / .belt-toggle.on (tracker.html)
    if(beltEnabled) btn.classList.add('on'); else btn.classList.remove('on');
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

// Kompaktes Satz-Eingabefeld (Wdh / Band / kg) für die Zeilen der abgeschlossenen Sätze.
// Schreibt über sv(i,f,v) in dasselbe sets[]-Modell wie bisher.
function _woSetInput(i, field, val, accent){
  var inp = document.createElement('input');
  inp.type = 'number';
  inp.className = 'num';
  inp.placeholder = '0';
  inp.value = (val === undefined || val === null) ? '' : val;
  inp.style.cssText = 'background:var(--card2);border:1px solid '+(accent||'var(--line)')+';color:var(--text);border-radius:var(--r-input);padding:8px;font-family:inherit;font-size:16px;font-weight:500;outline:none;width:100%;min-height:40px;text-align:center;-webkit-appearance:none;appearance:none;';
  inp.setAttribute('data-i', String(i));
  inp.setAttribute('data-f', field);
  inp.setAttribute('aria-label', field==='b' ? 'Bandstärke Satz '+(i+1) : field==='kg' ? 'Gürtelgewicht Satz '+(i+1) : 'Wert Satz '+(i+1));
  inp.oninput = inp.onchange = function(){ sv(parseInt(this.getAttribute('data-i'),10), this.getAttribute('data-f'), this.value); };
  return inp;
}
// Beschriftetes Feld (Label + Input) für Band/kg in der Karte des aktuellen Satzes.
// accent ist optional: ohne Wert bleibt das Label .lbl (--muted) und der Input bekommt den Standardrahmen --line.
function _woSetField(i, field, val, label, accent){
  var wrap = document.createElement('div');
  var lbl = document.createElement('div');
  lbl.className = 'lbl';
  lbl.style.cssText = 'margin-bottom:6px;'+(accent ? 'color:'+accent+';' : '');
  lbl.textContent = label;
  wrap.appendChild(lbl);
  wrap.appendChild(_woSetInput(i, field, val, accent));
  return wrap;
}
// ±delta auf den Wert des aktuellen Satzes (Stepper-Buttons der Satz-Karte).
// Leere oder nicht-numerische Werte starten bei 0; nie unter 0.
function woStepSet(i, delta){
  if(!sets[i]) return;
  var cur = parseFloat(String(sets[i].n).replace(',','.'));
  if(isNaN(cur)) cur = 0;
  var v = Math.max(0, Math.round((cur + delta)*100)/100);
  sets[i].n = String(v);
  var inp = document.getElementById('wo-set-cur');
  if(inp) inp.value = sets[i].n; else bsets();
}

// Satz-Eingabe: abgeschlossene Sätze als kompakte, weiter editierbare Zeilen
// (Index · Wert · Band · kg · ✕), darunter der AKTUELLE Satz als Karte
// "Satz n / m" mit −/+-Stepper und "✓ Satz beenden" (= addSet, wie "+ Satz").
// Das Datenmodell sets[{n,b,kg}] und die Setter sv/ds/addSet bleiben unverändert.
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
  var last = sets.length-1;
  var hdr = document.getElementById('set-header');
  // Die Kopfzeile gehört zu den kompakten Zeilen — ohne abgeschlossene Sätze ausblenden
  if(hdr){
    hdr.style.gridTemplateColumns = cols;
    hdr.style.display = last > 0 ? 'grid' : 'none';
  }
  var lb = document.getElementById('lbl-b');
  if(lb) lb.style.display = showBand ? 'block' : 'none';
  var unit = (selWoEx && selWoEx.unit) ? selWoEx.unit : 'Wdh';
  var stepable = unit !== 'Min:Sek'; // "1:30" lässt sich nicht hochzählen

  for(var i=0;i<last;i++){
    var row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:'+cols+';gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line);';
    var num = document.createElement('div');
    num.className = 'snum num';
    num.textContent = ('0'+(i+1)).slice(-2);
    row.appendChild(num);
    row.appendChild(_woSetInput(i, 'n', sets[i].n, ''));
    if(showBand) row.appendChild(_woSetInput(i, 'b', sets[i].b, ''));
    if(showKg) row.appendChild(_woSetInput(i, 'kg', sets[i].kg || beltKgVal, ''));
    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'pressable';
    del.innerHTML = '&#x2715;';
    del.setAttribute('aria-label', 'Satz '+(i+1)+' entfernen');
    del.style.cssText = 'background:none;border:none;color:var(--muted2);cursor:pointer;font-family:inherit;font-size:14px;text-align:center;min-height:40px;padding:0;';
    del.setAttribute('data-i', String(i));
    del.onclick = function(){ ds(parseInt(this.getAttribute('data-i'),10)); };
    row.appendChild(del);
    box.appendChild(row);
  }

  // Karte des aktuellen Satzes
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);padding:14px;margin-top:'+(last>0?'12px':'0')+';text-align:center;';

  var head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:36px;';
  var spacer = document.createElement('span');
  spacer.style.cssText = 'width:36px;flex-shrink:0;';
  var title = document.createElement('span');
  title.className = 'lbl';
  title.innerHTML = 'Satz <span class="num">'+(last+1)+'</span> / <span class="num">'+sets.length+'</span>';
  var delCur = document.createElement('button');
  delCur.type = 'button';
  delCur.className = 'icon-btn sm';
  delCur.innerHTML = '&#x2715;';
  delCur.setAttribute('aria-label', 'Satz '+(last+1)+' entfernen');
  delCur.style.visibility = last > 0 ? 'visible' : 'hidden'; // ds() lässt den letzten Satz stehen
  delCur.onclick = function(){ ds(sets.length-1); };
  head.appendChild(spacer); head.appendChild(title); head.appendChild(delCur);
  card.appendChild(head);

  var stp = document.createElement('div');
  stp.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;margin-top:8px;';
  if(stepable){
    var minus = document.createElement('button');
    minus.type = 'button';
    minus.className = 'icon-btn num';
    minus.textContent = '−';
    minus.setAttribute('aria-label', 'Eins weniger');
    minus.onclick = function(){ woStepSet(sets.length-1, -1); };
    stp.appendChild(minus);
  }
  var cur = document.createElement('input');
  cur.type = stepable ? 'number' : 'text';
  cur.id = 'wo-set-cur';
  // Die eine große Live-Zahl des Screens: Punktmatrix (Doto via .dotnum), 64px zwischen den −/+ Kreisbuttons
  cur.className = 'dotnum num';
  cur.placeholder = '0';
  cur.value = sets[last].n || '';
  cur.setAttribute('aria-label', unit+' Satz '+(last+1));
  cur.style.cssText = 'flex:1;min-width:0;max-width:200px;background:transparent;border:none;border-bottom:1px solid var(--line2);border-radius:0;color:var(--text);font-size:64px;line-height:1.1;text-align:center;padding:4px 0;outline:none;-webkit-appearance:none;appearance:none;-moz-appearance:textfield;';
  cur.setAttribute('data-i', String(last));
  cur.oninput = cur.onchange = function(){ sv(parseInt(this.getAttribute('data-i'),10), 'n', this.value); };
  stp.appendChild(cur);
  if(stepable){
    var plus = document.createElement('button');
    plus.type = 'button';
    plus.className = 'icon-btn num';
    plus.textContent = '+';
    plus.setAttribute('aria-label', 'Eins mehr');
    plus.onclick = function(){ woStepSet(sets.length-1, 1); };
    stp.appendChild(plus);
  }
  card.appendChild(stp);

  var unitEl = document.createElement('div');
  unitEl.className = 'unit';
  unitEl.style.cssText = 'margin-top:8px;';
  unitEl.textContent = unit;
  card.appendChild(unitEl);

  if(showBand || showKg){
    var extra = document.createElement('div');
    extra.style.cssText = 'display:grid;grid-template-columns:'+((showBand&&showKg)?'1fr 1fr':'1fr')+';gap:8px;margin-top:14px;text-align:left;';
    if(showBand) extra.appendChild(_woSetField(last, 'b', sets[last].b, 'Mit Band', ''));
    if(showKg) extra.appendChild(_woSetField(last, 'kg', sets[last].kg || beltKgVal, 'Gürtel kg', ''));
    card.appendChild(extra);
  }

  // Sekundär-CTA (hell): schließt den Satz ab und öffnet den nächsten — identisch zu "+ Satz"
  var fin = document.createElement('button');
  fin.type = 'button';
  fin.className = 'btn sec';
  fin.style.cssText = 'margin-top:14px;';
  fin.textContent = '✓ Satz beenden';
  fin.onclick = function(){ addSet(); };
  card.appendChild(fin);

  box.appendChild(card);
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
  var idx=0;
  for(var i=0;i<nm.length;i++){
    var n=nm[i];var f=[];
    for(var j=0;j<ents.length;j++){if(ents[j].name===n)f.push(ents[j]);}
    if(!f.length)continue;
    f.sort(function(a,b){return a.date<b.date?1:-1;});
    var e=f[0];
    var st='';var best=0;
    for(var k=0;k<e.sets.length;k++){
      if(k>0)st+=' &middot; ';
      st+='S'+(k+1)+': '+e.sets[k].n;
      if(e.sets[k].b&&e.band)st+=' <span style="color:var(--muted)">(+'+e.sets[k].b+' Band)</span>';
      var v=parseFloat(e.sets[k].n);
      if(!isNaN(v)&&v>best)best=v;
    }
    idx++;
    // Nummerierte Listenzeile (§5.2): Index · Name + Datum/Sätze · bester Einzelsatz
    h+='<div class="list-row" style="cursor:default;">';
    h+='<span class="row-index num">'+('0'+idx).slice(-2)+'</span>';
    h+='<div class="row-main"><div class="row-title">'+n+'</div>';
    h+='<div class="row-sub num">'+e.date+(e.band?' &middot; '+e.band:'')+' &middot; '+st+'</div></div>';
    if(best>0)h+='<span class="row-val num">'+best+(e.unit?' <span class="unit">'+e.unit+'</span>':'')+'</span>';
    h+='</div>';
  }
  if(h){
    el.className='list';
    el.style.cssText='display:block;padding:0;';
    el.innerHTML=h;
    if(window.caliMotion)caliMotion.stagger(el);
  } else {
    el.className='pk-card';
    el.style.cssText='display:flex;align-items:center;gap:14px;padding:14px;';
    el.innerHTML=
      iconWrap('trophy',{size:18,box:44})+
      '<div style="flex:1;min-width:0;">'+
        '<div class="row-title">Noch keine Rekorde</div>'+
        '<div class="row-sub" style="margin-bottom:10px;">Schließe dein erstes Workout ab, um persönliche Bestleistungen zu speichern.</div>'+
        '<button type="button" class="btn-g" onclick="startWorkout(null)">Workout starten</button>'+
      '</div>';
  }
}

// ── START-SEITE: Mini-Balken + Level-Kachel ────────────────
// Mini-Balken der laufenden Woche (Mo–So) aus ECHTEN Einträgen: Höhe = geloggte
// Sätze pro Tag relativ zum Wochenmaximum, Tage mit Training in --accent.
// Wochenstart wie getWeeklyProgress (main2ab.js), damit beide Zahlen zusammenpassen.
// Wird von der Hero-Kachel DIESE WOCHE (buildStreakWidget, main2ba.js) gerendert.
function weekSetBars(){
  var today=new Date();var dow=today.getDay();
  var ws=new Date(today);ws.setDate(today.getDate()-(dow===0?6:dow-1));
  var days=[];var counts=[];var max=0;
  for(var d=0;d<7;d++){
    var dt=new Date(ws);dt.setDate(ws.getDate()+d);
    days.push(dt.toISOString().slice(0,10));counts.push(0);
  }
  for(var i=0;i<ents.length;i++){
    var ix=days.indexOf(ents[i].date);
    if(ix>-1)counts[ix]+=(ents[i].sets&&ents[i].sets.length)||1;
  }
  for(var m=0;m<7;m++){if(counts[m]>max)max=counts[m];}
  var h='<div class="minibars" aria-hidden="true">';
  for(var b=0;b<7;b++){
    var on=counts[b]>0;
    var pct=on?Math.max(30,Math.round(counts[b]/max*100)):20;
    h+='<i'+(on?' class="on"':'')+' style="--h:'+pct+'%"></i>';
  }
  return h+'</div>';
}

function buildStartDashboard(){
  var el=document.getElementById('start-dashboard');
  if(!el)return;

  // STREAK und DIESE WOCHE (inkl. Mini-Balken + Meilenstein-Hinweis) wohnen
  // ausschließlich in der Hero-Doppelkachel (buildStreakWidget, main2ba.js);
  // die Bestleistungen haben ihre eigene Sektion weiter unten. Hier bleibt nur
  // die Level-Kachel, sobald der XP-Cache existiert (wird von xp.js gepflegt).
  var tiles=[];
  var xpCache=null;
  try{ xpCache=localStorage.getItem('cali_xp_cache'); }catch(e){}
  if(xpCache!==null && typeof getLevelFromXP==='function'){
    var lv=getLevelFromXP(parseInt(xpCache,10)||0);
    tiles.push({
      lbl:'Level',
      kpi:'<span class="kpi num" data-cu="'+lv.level+'">'+lv.level+'</span>',
      unit:'',
      sub: lv.xpToNext>0 ? ('Noch '+lv.xpToNext+' XP bis Level '+(lv.level+1)) : 'Max. Level erreicht',
      pct: lv.progress
    });
  }
  if(!tiles.length){ el.innerHTML=''; el.style.display='none'; return; }
  el.style.display='';

  var grid=document.createElement('div');
  grid.className='stat-grid';
  tiles.forEach(function(t,ti){
    var tile=document.createElement('div');
    tile.className='stat-tile';
    // Ungerade Anzahl: die letzte Kachel läuft über beide Spalten
    if(tiles.length%2===1 && ti===tiles.length-1) tile.style.gridColumn='1 / -1';
    var inner='<span class="lbl">'+t.lbl+'</span>';
    inner+='<div class="kpi-row">'+t.kpi+(t.unit?'<span class="unit">'+t.unit+'</span>':'')+'</div>';
    if(t.sub) inner+='<div class="row-sub num">'+t.sub+'</div>';
    if(typeof t.pct==='number') inner+='<div class="segbar" data-pct="'+t.pct+'"></div>';
    tile.innerHTML=inner;
    grid.appendChild(tile);
  });
  el.innerHTML='';
  el.appendChild(grid);
  // Kacheln gestaffelt einblenden (wie Profil-, Badge- und Park-Grids)
  if(window.caliMotion) caliMotion.stagger(grid);

  // Zahlen hochzählen
  if(window.caliMotion){
    var cus=grid.querySelectorAll('[data-cu]');
    for(var ci2=0;ci2<cus.length;ci2++){
      caliMotion.countUp(cus[ci2], parseInt(cus[ci2].getAttribute('data-cu'),10)||0, {duration:600});
    }
  }
  // Segmentbalken füllen sich nach dem Einfügen (CSS-Transition auf --pct);
  // bei reduced motion springt der Wert direkt
  var sbs=grid.querySelectorAll('.segbar[data-pct]');
  for(var si2=0;si2<sbs.length;si2++){
    (function(sb){
      var v=parseFloat(sb.getAttribute('data-pct'))||0;
      if(window.caliMotion && !caliMotion.reduced()){
        requestAnimationFrame(function(){requestAnimationFrame(function(){
          if(sb.isConnected) sb.style.setProperty('--pct', String(v));
        });});
      } else {
        sb.style.setProperty('--pct', String(v));
      }
    })(sbs[si2]);
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
      h+='<div><div class="wh-exname">'+ex.name+(ex.band?' <span style="font-size:11px;color:var(--muted)">'+ex.band+'</span>':'')+'</div>';
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
  // Chart.js kann keine CSS-Variablen lesen: Akzent zur Laufzeit aus dem Token,
  // Grid/Ticks sind die Chart-Werte aus der Spec (§5.16) — nur hier, nie im DOM.
  var cs=getComputedStyle(document.documentElement);
  var ACC=(cs.getPropertyValue('--accent')||'').trim()||'#FF5A1F';
  var MONO={family:'JetBrains Mono',size:9};
  mc=new Chart(cv,{type:'line',
    data:{labels:lbls,datasets:[{data:vals,borderColor:ACC,pointBackgroundColor:ACC,pointBorderColor:ACC,pointRadius:3,pointHoverRadius:4,borderWidth:1.5,fill:false,tension:0}]},
    options:{responsive:true,
      plugins:{legend:{display:false},
        tooltip:{backgroundColor:'#1B1B1B',borderColor:'#333333',borderWidth:1,titleColor:'#F2F2F2',bodyColor:'#9A9A9A',titleFont:{family:'JetBrains Mono',size:10},bodyFont:{family:'JetBrains Mono',size:11},displayColors:false,
          callbacks:{label:function(ctx){var d=data[ctx.dataIndex];return ' Ø '+ctx.parsed.y+' ('+d.sets+' Sätze, '+d.entries+' Einträge)';}}}},
      scales:{
        x:{grid:{color:'#1E1E1E',borderColor:'#262626'},ticks:{color:'#6E6E6E',font:MONO}},
        y:{grid:{color:'#1E1E1E',borderColor:'#262626'},ticks:{color:'#6E6E6E',font:MONO},beginAtZero:false,
           title:{display:true,text:'Ø pro Workout',color:'#6E6E6E',font:MONO,padding:4}}}}});
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
  // Der Block-Index ("01", "02" …) kommt per CSS-Counter aus #plan-blocks-list.numbered
  // auf den .peb-header — hier keinen eigenen Index rendern.
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
    h+='<div class="peb-arrow'+(isOpen?' open':'')+'" aria-hidden="true">&#8250;</div>';
    h+='</div>';
    // Der Körper wird IMMER gerendert — allein .acc-body.open steuert auf/zu,
    // damit auch das Zuklappen animiert (statt den Inhalt hart zu löschen).
    h+='<div class="acc-body"><div class="peb-body open">';
    for(var k=0;k<b.sets.length;k++){
      h+='<div class="peb-setrow">';
      h+='<div class="peb-snum num">'+('0'+(k+1)).slice(-2)+'</div>';
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