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

var EX_CATS = ['Alle','Pull','Push','Core','Legs','Skills','Schwimmen','Laufen'];
var EX_CAT_COLORS = {Pull:'var(--accent)',Push:'#FF6B35',Core:'#A78BFA',Legs:'#4ECDC4',Skills:'#F59E0B',Schwimmen:'#38BDF8',Laufen:'var(--accent)',Alle:'#888'};
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
var CC = {'Klimmzuge':'gr','Dips':'or','Liegestutze':'te','Plank':'pu','Australian Rows':'gr','Pike Push-ups':'or','Muscle-Ups':'am','L-Sit Hold':'pu','Tuck Front Lever':'pu','Kraul 100m':'bl','Brust 100m':'bl','Sprint 100m':'am'};

function ld(){
  try{var a=localStorage.getItem(DB);ents=a?JSON.parse(a):[];}catch(x){ents=[];}
  try{var b=localStorage.getItem(DHR);hrs=b?JSON.parse(b):[];}catch(x){hrs=[];}
}
function sd(){try{localStorage.setItem(DB,JSON.stringify(ents));}catch(x){}}
function shr(){try{localStorage.setItem(DHR,JSON.stringify(hrs));}catch(x){}}

function goPage(p){
  var ps=['e','p','m','ch','v','pr','sk','h','parks','rek'];
  for(var i=0;i<ps.length;i++){
    var pg=document.getElementById('page-'+ps[i]);
    var tb=document.getElementById('tab-'+ps[i]);
    if(pg)pg.className='page'+(ps[i]===p?' on':'');
    if(tb)tb.className='tab'+(ps[i]===p?' on':'');
  }
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
}

// ── WORKOUT FLOW ──────────────────────────────────────────
function startWorkout(planId){
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
  document.getElementById('wo-ex-list').innerHTML = '<div class="empty" id="wo-empty">Noch keine Ubungen hinzugefugt.</div>';
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
    var plan=null;
    for(var i=0;i<plans.length;i++){if(plans[i].id===planId){plan=plans[i];break;}}
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
  try{ awardXP(10, '💪 Workout geloggt'); }catch(e){}
  if(!woExercises.length){
    if(!confirm('Workout ohne Übungen beenden?'))return;
  }
  clearInterval(woTimer);
  var dur = Math.floor((new Date() - woStart)/1000);
  var dm  = Math.floor(dur/60);
  var ds  = dur%60;
  var durStr = dm+'min '+(ds<10?'0':'')+ds+'sek';

  // Save each exercise as individual entry
  for(var i=0;i<woExercises.length;i++){
    var ex = woExercises[i];
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
  // Earn flames for workout
  var earned = earnFlames(dur);
  if(earned > 0) toast('Workout gespeichert! +'+earned+' ?? ('+durStr+')');

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
  document.getElementById('wo-ex-list').innerHTML = '<div class="empty" id="wo-empty">Noch keine Ubungen hinzugefugt.</div>';
  document.getElementById('sbox').innerHTML = '';
  document.getElementById('inp-note').value = '';
  document.getElementById('b-cust').value = '';
  bb();
  calcStreak();buildStreakWidget();
  toast('Workout gespeichert! Dauer: '+durStr);
  fbSave();
}

function addExToWorkout(){
  if(!selWoEx){alert('Bitte zuerst eine Ubung auswahlen!');return;}
  var cu = document.getElementById('b-cust').value.trim();
  var band = cu || sBand;
  var note = document.getElementById('inp-note').value.trim();

  var ok=[];
  for(var i=0;i<sets.length;i++){if(sets[i].n.trim()!=='')ok.push({n:sets[i].n,b:sets[i].b});}
  if(!ok.length){alert('Mindestens einen Satz eintragen!');return;}

  woExercises.push({name:selWoEx.name,unit:selWoEx.unit,col:selWoEx.col,band:band,sets:ok,note:note});
  buildWoExList();

  // Reset form
  document.getElementById('inp-note').value='';
  document.getElementById('b-cust').value='';
  sets=[];sBand='';
  exChanged();
  addSet();
  toast(p[0]+' hinzugefugt!');
}

function buildWoExList(){
  var el = document.getElementById('wo-ex-list');
  if(!woExercises.length){
    el.innerHTML='<div class="empty" id="wo-empty">Noch keine Ubungen hinzugefugt.</div>';
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
    h+='</div>';
  }
  el.innerHTML=h;
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
    btn.textContent = beltEnabled ? 'Gurtel: AN' : 'Gurtel: AUS';
    btn.style.borderColor = beltEnabled ? '#F59E0B' : '#2a2a2a';
    btn.style.color = beltEnabled ? '#F59E0B' : '#888';
    btn.style.background = beltEnabled ? 'rgba(245,158,11,0.1)' : '#161616';
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
  cols += ' 32px';
  var hdr = document.getElementById('set-header');
  if(hdr) hdr.style.gridTemplateColumns = cols;
  var lb = document.getElementById('lbl-b');
  if(lb) lb.style.display = showBand ? 'block' : 'none';
  var colors = ['var(--accent)','#FF6B35','#4ECDC4','#A78BFA'];
  for(var i=0;i<sets.length;i++){
    var row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:'+cols+';gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);';
    var num = document.createElement('div');
    num.style.cssText = 'font-family:inherit;font-size:16px;text-align:center;color:'+colors[i<4?i:3]+';';
    num.textContent = String(i+1);
    var inp = document.createElement('input');
    inp.type = 'number';
    inp.placeholder = '0';
    inp.value = sets[i].n || '';
    inp.style.cssText = 'background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:9px 8px;font-size:14px;font-family:inherit;outline:none;width:100%;text-align:center;';
    inp.setAttribute('data-i', String(i));
    inp.onchange = function(){sets[parseInt(this.getAttribute('data-i'),10)].n=this.value;};
    inp.oninput = function(){sets[parseInt(this.getAttribute('data-i'),10)].n=this.value;};
    var del = document.createElement('button');
    del.innerHTML = '&#x2715;';
    del.style.cssText = 'background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px;text-align:center;';
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
      binp.style.cssText = 'background:#161616;border:1px solid #F59E0B;color:#F59E0B;border-radius:8px;padding:9px 8px;font-size:14px;font-family:DM Sans,sans-serif;outline:none;width:100%;text-align:center;';
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
      kinp.style.cssText = 'background:#161616;border:1px solid #38BDF8;color:#38BDF8;border-radius:8px;padding:9px 8px;font-size:14px;font-family:DM Sans,sans-serif;outline:none;width:100%;text-align:center;';
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
function toast(m){
  var t=document.createElement('div');
  t.className='toast';t.textContent=m;
  document.body.appendChild(t);
  setTimeout(function(){
    t.style.opacity='0';t.style.transition='opacity 0.4s';
    setTimeout(function(){if(t.parentNode)t.parentNode.removeChild(t);},500);
  },1800);
}

// ── BESTS ─────────────────────────────────────────────────
function bb(){
  var el=document.getElementById('bests');
  if(!el)return;
  var nm=['Klimmzuge','Dips','Liegestutze','Plank','Muscle-Ups','L-Sit Hold','Tuck Front Lever','Kraul 100m','Brust 100m','Sprint 100m'];
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
      if(e.sets[k].b&&e.band)st+=' <span style="color:var(--amber)">('+e.sets[k].b+' Band)</span>';
    }
    h+='<div class="bb '+cl+'"><div class="bbn">'+n+'</div>';
    h+='<div style="font-size:11px;color:var(--muted2);margin-top:3px">'+e.date+(e.band?' &bull; '+e.band:'')+'</div>';
    h+='<div style="font-size:12px;color:var(--muted2);margin-top:5px">'+st+'</div></div>';
  }
  el.innerHTML=h||'<div class="empty">Noch keine Eintrage.</div>';
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
      h+='<div><div class="wh-exname">'+ex.name+(ex.band?' <span style="font-size:10px;color:var(--amber)">'+ex.band+'</span>':'')+'</div>';
      h+='<div class="wh-sets">'+st+'</div></div></div>';
    }
    h+='</div></div>';
  }
  el.innerHTML=h;
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
  mc=new Chart(cv,{type:'line',data:{labels:lbls,datasets:[{data:vals,borderColor:col,backgroundColor:col+'20',fill:true,tension:0.4,pointBackgroundColor:col,pointRadius:5,borderWidth:2}]},options:{responsive:true,plugins:{legend:{display:false},tooltip:{backgroundColor:'#1a1a1a',borderColor:col,borderWidth:1,titleColor:col,bodyColor:'#ccc',callbacks:{label:function(ctx){var d=data[ctx.dataIndex];return ' Ø '+ctx.parsed.y+' ('+d.sets+' Satze, '+d.entries+' Eintrage)';}}}},scales:{x:{ticks:{color:'#555',font:{size:10}},grid:{color:'#1a1a1a'}},y:{ticks:{color:'#555',font:{size:10}},grid:{color:'#1a1a1a'},title:{display:true,text:'Ø PRO WORKOUT',color:'#444',font:{size:9},padding:4}}}}});
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
  for(var i=0;i<rv.length;i++){var img=rv[i];h+='<div class="hi"><img src="'+img.src+'" alt="HF"><div class="hii"><div class="hd">'+img.date+'</div><button class="hdel" onclick="dhr('+img.id+')">&#x2715;</button></div></div>';}
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
        if(ln) ln.textContent=selWoEx.unit==='Sek'?'SEKUNDEN':selWoEx.unit==='Min:Sek'?'MIN:SEK':'WDHS';
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
  if(ln) ln.textContent = selWoEx.unit==='Sek'?'SEKUNDEN':selWoEx.unit==='Min:Sek'?'MIN:SEK':'WDHS';
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
  if(lbl) lbl.textContent = selPfEx.unit==='Sek'?'SEKUNDEN (ZIEL)':selPfEx.unit==='Min:Sek'?'MIN:SEK (ZIEL)':'WDHS (ZIEL)';
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
  var ca=['var(--accent)','#FF6B35','#4ECDC4','#A78BFA'];
  var h='';
  for(var i=0;i<planBlocks.length;i++){
    var b=planBlocks[i];
    var col=COLS[b.col]||COLS.gr;
    var isDone=b.done;
    var isOpen=b.open;
    h+='<div class="peb" id="peb-'+i+'">';
    h+='<div class="peb-header" onclick="togglePlanBlock('+i+')">';
    h+='<div class="peb-dot" style="background:'+col+'"></div>';
    h+='<div class="peb-name">'+b.name+'</div>';
    h+='<div class="peb-status '+(isDone?'done':'open')+'">'+(isDone?'ERLEDIGT':b.sets.length+' SATZE')+'</div>';
    h+='<div class="peb-arrow'+(isOpen?' open':'')+'">&#9654;</div>';
    h+='</div>';
    if(isOpen){
      h+='<div class="peb-body open">';
      for(var k=0;k<b.sets.length;k++){
        var sc=ca[k<4?k:3];
        h+='<div class="peb-setrow">';
        h+='<div class="peb-snum" style="color:'+sc+'">'+(k+1)+'</div>';
        h+='<input class="peb-inp" type="number" placeholder="Ziel: '+b.sets[k].target+' '+b.unit+'" value="'+(b.sets[k].actual||'')+'" oninput="pbSetVal('+i+','+k+',this.value)">';
        h+='</div>';
      }
      h+='<button class="peb-add-btn" onclick="pbDone('+i+')">SATZ FERTIG — ZUM WORKOUT</button>';
      h+='</div>';
    }
    h+='</div>';
  }
  el.innerHTML=h;
}

function togglePlanBlock(i){
  if(planBlocks[i].done)return; // already done
  planBlocks[i].open=!planBlocks[i].open;
  // Close others
  for(var j=0;j<planBlocks.length;j++){if(j!==i)planBlocks[j].open=false;}
  buildPlanBlocks();
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