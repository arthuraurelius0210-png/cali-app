
loadChallenges();

// Zweistelliger Index ("01") — auch jenseits von 99 stabil
function prPadIdx(n){ return n<10 ? '0'+n : String(n); }

function buildChallengePresets(){
  var el = document.getElementById('challenge-presets');
  if(!el) return;
  el.innerHTML = '';

  var title = document.createElement('h2');
  title.className = 'stitle';
  title.style.cssText = 'margin:0 0 10px;';
  title.textContent = 'Vorgefertigte Challenges';
  el.appendChild(title);

  for(var i=0;i<PRESET_CHALLENGES.length;i++){
    (function(ch){
      var card = document.createElement('div');
      card.className = 'card';

      // Foto (grayscale via .ch-photo in tracker.html) nur, wenn die Challenge eins hat
      if(ch.image){
        var ph = document.createElement('div');
        ph.className = 'ch-photo';
        var img = document.createElement('img');
        img.src = ch.image; img.alt = ''; img.loading = 'lazy';
        ph.appendChild(img);
        card.appendChild(ph);
      }

      var top = document.createElement('div');
      top.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:8px;';

      // Icon-Slot: Line-Icon im 44px-Ring statt Emoji (ch.icon bleibt als Datenfeld erhalten)
      var icon = document.createElement('div');
      icon.style.cssText = 'flex-shrink:0;';
      icon.innerHTML = (typeof iconWrap === 'function') ? iconWrap('target',{size:18,box:44}) : '';

      var info = document.createElement('div');
      info.style.cssText = 'flex:1;min-width:0;';

      var t = document.createElement('div');
      t.className = 'ttl';
      t.textContent = ch.title;

      var d = document.createElement('div');
      d.className = 'row-sub';
      d.textContent = ch.desc;

      info.appendChild(t);
      info.appendChild(d);
      top.appendChild(icon);
      top.appendChild(info);

      var exp = document.createElement('div');
      exp.style.cssText = 'font-size:11px;color:var(--muted);border-top:1px solid var(--line);padding-top:10px;margin-top:10px;line-height:1.6;';
      exp.textContent = ch.explanation;

      var btn = document.createElement('button');
      btn.className = 'btn-g pressable';
      btn.style.cssText = 'width:100%;min-height:44px;margin-top:12px;';
      btn.textContent = 'Challenge annehmen';
      btn.onclick = function(){
        activeChallenge = {
          id: ch.id, title: ch.title, desc: ch.desc,
          icon: ch.icon, type: 'preset', params: {target:ch.target, metric:ch.metric, exName:ch.exName},
          startDate: new Date().toISOString().slice(0,10), progress:0
        };
        saveChallenges();
        buildChallengeUI();
        showPresets = false;
        toast(ch.title + ' angenommen!');
      };

      card.appendChild(top);
      card.appendChild(exp);
      card.appendChild(btn);
      el.appendChild(card);
    })(PRESET_CHALLENGES[i]);
  }
  if(window.caliMotion) caliMotion.stagger(el);
}

loadChallenges();

// ---- INIT ----

// ── PERCENTILE DATA (Source: strengthlevel.com, 4.8M+ lifts) ──────────────
// Format: [reps, percentile] for males
var PERCENTILE_DATA = {
  'Klimmzuge Max': {
    male:   [[0,5],[1,15],[2,22],[3,30],[4,38],[5,45],[6,51],[7,57],[8,62],[9,67],[10,71],[11,75],[12,78],[13,81],[14,84],[15,86],[16,88],[17,90],[18,91],[19,92],[20,93],[21,94],[22,95],[23,96],[24,97],[25,97.5],[30,98.5],[35,99],[40,99.5],[50,99.9]],
    female: [[0,5],[1,20],[2,35],[3,48],[4,58],[5,67],[6,74],[7,80],[8,85],[9,88],[10,91],[12,94],[15,97],[20,99]]
  },
  'Liegestutze Max': {
    male:   [[0,5],[5,15],[10,28],[15,40],[20,52],[25,62],[30,70],[35,77],[40,82],[45,87],[50,91],[55,93],[60,95],[70,97],[80,98.5],[100,99.5]],
    female: [[0,5],[5,20],[10,40],[15,57],[20,70],[25,80],[30,87],[35,92],[40,95],[50,98]]
  },
  'Dips Max': {
    male:   [[0,5],[1,18],[2,28],[3,37],[5,50],[8,62],[10,70],[12,76],[15,83],[20,90],[25,94],[30,97],[35,98.5]],
    female: [[0,5],[1,25],[2,42],[3,55],[5,68],[8,80],[10,87],[12,92],[15,96]]
  },
  'Muscle-Ups Max': {
    male:   [[0,70],[1,80],[2,85],[3,88],[5,92],[8,95],[10,97],[15,99],[20,99.5]],
    female: [[0,85],[1,90],[2,93],[3,96],[5,98],[8,99.5]]
  },
  'Plank Max': {
    male:   [[30,10],[60,25],[90,45],[120,62],[150,74],[180,83],[210,89],[240,93],[300,97],[360,98.5]],
    female: [[30,15],[60,32],[90,52],[120,68],[150,79],[180,87],[210,92],[240,95],[300,98]]
  },
  'L-Sit Hold Max': {
    male:   [[5,30],[10,50],[15,65],[20,77],[30,88],[45,95],[60,98]],
    female: [[5,35],[10,55],[15,70],[20,82],[30,91],[45,97]]
  },
  };

function getPercentile(exName, val, gender){
  var data = PERCENTILE_DATA[exName];
  if(!data) return -1;
  var table = (gender==='f') ? data.female : data.male;
  if(!table) return -1;
  var num = parseFloat(val);
  if(isNaN(num)) return -1;

  var isTime = false;
  if(isTime){
    // Reverse: lower time = higher percentile
    for(var i=0;i<table.length;i++){
      if(num<=table[i][0]) return table[i][1];
    }
    return 1;
  }

  // Normal: higher = better
  if(num<=0) return table[0][1];
  for(var i=table.length-1;i>=0;i--){
    if(num>=table[i][0]) return table[i][1];
  }
  return table[0][1];
}

// color = Textfarbe, fill = Balkenfüllung — auf dunklem Grund identisch (Tokens aus tracker.html)
function getPercentileLabel(pct){
  if(pct>=99.5) return {text:'Legendär! Top 0.5%', color:'var(--amber)', fill:'var(--amber)'};
  if(pct>=99)   return {text:'Weltklasse! Top 1%', color:'var(--amber)', fill:'var(--amber)'};
  if(pct>=95)   return {text:'Elite! Top 5%', color:'var(--accent)', fill:'var(--accent)'};
  if(pct>=90)   return {text:'Stark! Top 10%', color:'var(--accent)', fill:'var(--accent)'};
  if(pct>=75)   return {text:'Gut! Top 25%', color:'var(--teal)', fill:'var(--teal)'};
  if(pct>=50)   return {text:'Solide! Besser als die Hälfte', color:'var(--teal)', fill:'var(--teal)'};
  if(pct>=25)   return {text:'Weiter so! Guter Start', color:'var(--muted)', fill:'var(--muted)'};
  return {text:'Bleib dran! Jeder fängt irgendwo an', color:'var(--muted)', fill:'var(--muted)'};
}

function showPercentile(exName, val, gender){
  var el = document.getElementById('percentile-box');
  if(!el) return;
  var pct = getPercentile(exName, val, gender);
  if(pct<0){el.style.display='none';return;}
  el.style.display='block';
  el.innerHTML='';
  var lbl = getPercentileLabel(pct);

  var card = document.createElement('div');
  card.className='card';
  card.style.cssText='margin-top:12px;';

  var title = document.createElement('span');
  title.className='eyebrow';
  title.textContent='Weltweiter Vergleich';

  var pctText = document.createElement('div');
  pctText.className='kpi num';
  pctText.style.cssText='font-size:22px;color:'+lbl.color+';margin-bottom:4px;';
  var displayPct = Math.min(99.9, Math.round(pct*10)/10);
  pctText.textContent='Besser als '+displayPct+'%';

  var sub = document.createElement('div');
  sub.className='row-sub';
  sub.style.cssText='margin-bottom:14px;';
  sub.textContent='aller Menschen weltweit';

  // Progress bar (3px-Linie) — startet bei 0 und füllt sich sichtbar
  var barWrap = document.createElement('div');
  barWrap.className='linebar';
  barWrap.style.cssText='margin-bottom:10px;';
  var bar = document.createElement('div');
  bar.style.cssText='width:0%;background:'+(lbl.fill||lbl.color)+';';
  barWrap.appendChild(bar);

  var labelDiv = document.createElement('div');
  labelDiv.style.cssText='font-size:11px;font-weight:600;color:'+lbl.color+';';
  labelDiv.textContent=lbl.text;

  var source = document.createElement('div');
  source.style.cssText='font-size:10px;color:var(--muted2);margin-top:8px;';
  source.textContent='Daten: strengthlevel.com (4.8M+ Einträge)';

  card.appendChild(title);
  card.appendChild(pctText);
  card.appendChild(sub);
  card.appendChild(barWrap);
  card.appendChild(labelDiv);
  card.appendChild(source);
  el.appendChild(card);
  if(window.caliMotion) caliMotion.animateBar(bar, displayPct);
  else bar.style.width = displayPct+'%';
}



// ── PROFIL ────────────────────────────────────────────────
var prData = {name:'',age:'',weight:'',height:'',gender:'m',goal:'strength',joinDate:'',avatar:''};

// icon = Name aus CALI_ICONS (Line-Icons), kein Emoji mehr
var BADGES = [
  {id:'first_workout', icon:'dumbbell', title:'Erstes Workout', desc:'Dein erstes Workout abgeschlossen', check:function(){return ents.length>0;}},
  {id:'10_workouts',   icon:'flame',    title:'10 Workouts',    desc:'10 Workouts abgeschlossen',        check:function(){var d={};for(var i=0;i<ents.length;i++)d[ents[i].date]=1;return Object.keys(d).length>=10;}},
  {id:'50_workouts',   icon:'trophy',   title:'50 Workouts',    desc:'50 Workouts abgeschlossen',        check:function(){var d={};for(var i=0;i<ents.length;i++)d[ents[i].date]=1;return Object.keys(d).length>=50;}},
  {id:'first_max',     icon:'trend',    title:'Max Getestet',   desc:'Ersten Max-Test eingetragen',      check:function(){return maxEntries.length>0;}},
  {id:'elite_pullup',  icon:'star',     title:'Klimmzug Elite', desc:'Mehr als 20 Klimmzüge Max',        check:function(){for(var i=0;i<maxEntries.length;i++){if(maxEntries[i].name==='Klimmzuge Max'&&parseFloat(maxEntries[i].val)>=20)return true;}return false;}},
  {id:'challenge_done',icon:'target',   title:'Challenge Held', desc:'Eine Challenge abgeschlossen',     check:function(){return activeChallenge&&activeChallenge.params&&calcChallengeProgress()>=activeChallenge.params.target;}},
  {id:'streak_7',      icon:'calendar', title:'7-Tage Streak',  desc:'7 Tage in Folge trainiert',        check:function(){var dates=[];for(var i=0;i<ents.length;i++){if(dates.indexOf(ents[i].date)===-1)dates.push(ents[i].date);}dates.sort();var streak=1;for(var i=1;i<dates.length;i++){var d1=new Date(dates[i-1]);var d2=new Date(dates[i]);if((d2-d1)/(86400000)===1){streak++;if(streak>=7)return true;}else{streak=1;}}return false;}},
  {id:'variety',       icon:'flex',     title:'Allrounder',     desc:'10 verschiedene Übungen trainiert',check:function(){var ex={};for(var i=0;i<ents.length;i++)ex[ents[i].name]=1;return Object.keys(ex).length>=10;}},
];

// ── ABZEICHEN-PERSISTENZ ──────────────────────────────────
// Einmal verdiente Abzeichen bleiben verdient (auch wenn z.B. die aktive
// Challenge wechselt). Neu verdiente werden mit Toast gefeiert.
// Auch aus endWorkout aufrufbar, damit der Unlock im Moment des Verdienens landet.
function checkBadgeUnlocks(){
  var earned={};
  try{ earned=JSON.parse(localStorage.getItem('cali_badges_earned')||'{}')||{}; }catch(x){ earned={}; }
  var newly=[];
  for(var i=0;i<BADGES.length;i++){
    var b=BADGES[i];
    if(earned[b.id]) continue;
    var has=false;
    try{ has=b.check(); }catch(e){}
    if(has){ earned[b.id]=1; newly.push(b); }
  }
  if(newly.length){
    try{ localStorage.setItem('cali_badges_earned',JSON.stringify(earned)); }catch(x){}
    if(typeof toast==='function'){
      if(newly.length===1) toast('Abzeichen freigeschaltet: '+newly[0].title);
      else toast(newly.length+' Abzeichen freigeschaltet!');
    }
  }
  return earned;
}

function lpr(){
  try{
    var d=localStorage.getItem('cali_profile');
    if(d) prData=JSON.parse(d);
    if(!prData.joinDate) prData.joinDate=new Date().toISOString().slice(0,10);
  }catch(x){prData.joinDate=new Date().toISOString().slice(0,10);}
}

function spr(){
  try{localStorage.setItem('cali_profile',JSON.stringify(prData));}catch(x){}
}

function prSave(){
  prData.name   = document.getElementById('pr-inp-name').value.trim();
  prData.age    = document.getElementById('pr-inp-age').value;
  prData.weight = document.getElementById('pr-inp-weight').value;
  prData.height = document.getElementById('pr-inp-height').value;
  prData.gender = document.getElementById('pr-inp-gender').value;
  prData.goal   = document.getElementById('pr-inp-goal').value;
  spr();
  fbSave();
  buildProfilUI();
}

// Kein natives prompt(): öffnet das Einstellungen-Sheet und fokussiert das Namensfeld
function prEditName(){
  if(typeof openSettings !== 'function') return;
  openSettings();
  setTimeout(function(){
    var inp = document.getElementById('pr-inp-name');
    if(!inp) return;
    try{ inp.focus(); if(inp.select) inp.select(); }catch(x){}
  }, 320);
}

function prSetAvatar(inp){
  if(!inp.files||!inp.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e){
    prData.avatar = e.target.result;
    spr();
    var av = document.getElementById('pr-avatar');
    if(av) av.style.backgroundImage='url('+e.target.result+')';
  };
  reader.readAsDataURL(inp.files[0]);
}

// Level-Stufen nach Trainingstagen — Farben als Tokens (auf dunklem Grund als Text lesbar)
function prGetLevel(){
  var d={};
  for(var i=0;i<ents.length;i++) d[ents[i].date]=1;
  var days = Object.keys(d).length;
  if(days>=100) return {label:'Elite',           color:'var(--amber)'};
  if(days>=50)  return {label:'Erfahren',        color:'var(--accent)'};
  if(days>=20)  return {label:'Fortgeschritten', color:'var(--teal)'};
  if(days>=5)   return {label:'Einsteiger',      color:'var(--purple)'};
  return        {label:'Starter',                color:'var(--muted)'};
}


function buildProfilStatsDetail(){
  var el = document.getElementById('pr-stats-detail');
  if(!el) return;
  el.innerHTML = '';

  // ── Calc all stats ──
  var totalWorkoutDays = 0;
  var uniqueDates = {};
  var totalDuration = 0; // seconds
  var maxDuration = 0;
  var minDuration = Infinity;
  var totalRepsAll = 0;
  var repsByEx = {};
  var totalSets = 0;
  var workoutDurations = [];

  for(var i=0;i<ents.length;i++){
    var e = ents[i];
    if(!uniqueDates[e.date]) uniqueDates[e.date] = 0;
    // Parse duration
    var durSecs = 0;
    if(e.dur && parseInt(e.dur)>0){
      durSecs = parseInt(e.dur);
    } else if(e.woDur){
      // Parse "4min 02sek" format
      var wdStr = String(e.woDur);
      var mMatch = wdStr.match(/(\d+)min/);
      var sMatch = wdStr.match(/(\d+)sek/);
      var cMatch = wdStr.match(/^(\d+):(\d+)$/);
      if(mMatch||sMatch){ durSecs=(parseInt(mMatch?mMatch[1]:0)||0)*60+(parseInt(sMatch?sMatch[1]:0)||0); }
      else if(cMatch){ durSecs=(parseInt(cMatch[1])||0)*60+(parseInt(cMatch[2])||0); }
    }
    uniqueDates[e.date] = (uniqueDates[e.date]||0) + durSecs;
    totalDuration += durSecs;
    if(durSecs>maxDuration) maxDuration=durSecs;
    totalSets += e.sets.length;
    if(!repsByEx[e.name]) repsByEx[e.name]=0;
    for(var k=0;k<e.sets.length;k++){
      var r=parseFloat(e.sets[k].n)||0;
      repsByEx[e.name]+=r;
      totalRepsAll+=r;
    }
  }

  var days = Object.keys(uniqueDates);
  totalWorkoutDays = days.length;

  // Per-day total duration
  var dayDurs = Object.values ? Object.values(uniqueDates) : days.map(function(d){return uniqueDates[d];});
  var avgDurSec = totalWorkoutDays>0 ? Math.round(totalDuration/totalWorkoutDays) : 0;
  var maxDurDay = 0;
  for(var d=0;d<dayDurs.length;d++) if(dayDurs[d]>maxDurDay) maxDurDay=dayDurs[d];

  function fmtTime(secs){
    if(!secs) return '0 Min';
    var h=Math.floor(secs/3600);
    var m=Math.floor((secs%3600)/60);
    if(h>0) return h+'h '+m+'min';
    return m+' Min';
  }

  // ── Big stat cards ──
  var bigStats = [
    {label:'Gesamte Trainingszeit', value:fmtTime(totalDuration), sub:'seit Beginn'},
    {label:'Durchschnitt pro Tag', value:fmtTime(avgDurSec), sub:'pro Trainingstag'},
    {label:'Längster Trainingstag', value:fmtTime(maxDurDay), sub:'an einem Tag'},
    {label:'Gesamte Wiederholungen', value:totalRepsAll.toLocaleString(), sub:'alle Übungen'},
    {label:'Gesamte Sätze', value:totalSets.toLocaleString(), sub:'alle Sätze'},
    {label:'Trainingstage', value:String(totalWorkoutDays), sub:'Tage trainiert'},
  ];

  var grid = document.createElement('div');
  grid.className = 'stat-grid';
  grid.style.cssText = 'margin-bottom:16px;';
  for(var i=0;i<bigStats.length;i++){
    var box=document.createElement('div');
    box.className='stat-tile';
    var lbl=document.createElement('span');
    lbl.className='lbl';
    lbl.textContent=bigStats[i].label;
    var val=document.createElement('div');
    val.className='kpi num';
    val.style.cssText='font-size:22px;';
    val.textContent=bigStats[i].value;
    var sub=document.createElement('div');
    sub.className='row-sub';
    sub.style.cssText='margin-top:0;';
    sub.textContent=bigStats[i].sub;
    box.appendChild(lbl);box.appendChild(val);box.appendChild(sub);
    grid.appendChild(box);
  }
  el.appendChild(grid);
  if(window.caliMotion) caliMotion.stagger(grid);

  // ── Wdh per exercise ranking ──
  var title2=document.createElement('div');
  title2.className='lbl';
  title2.style.cssText='margin:4px 0 8px;';
  title2.textContent='Alle Übungen · Wiederholungen gesamt';
  el.appendChild(title2);

  var sorted=[];
  for(var name in repsByEx) sorted.push({name:name,total:repsByEx[name]});
  sorted.sort(function(a,b){return b.total-a.total;});

  if(!sorted.length){
    var none=document.createElement('div');
    none.className='empty';
    none.textContent='Noch keine Workouts eingetragen.';
    el.appendChild(none);
    return;
  }

  var list=document.createElement('div');
  list.className='list';
  var maxVal = sorted[0].total;
  for(var i=0;i<sorted.length;i++){
    var row=document.createElement('div');
    row.className='list-row';
    row.style.cssText='cursor:default;';
    var idx=document.createElement('span');
    idx.className='row-index num';
    idx.textContent=prPadIdx(i+1);
    var main=document.createElement('div');
    main.className='row-main';
    var nm=document.createElement('div');
    nm.className='row-title';
    nm.textContent=sorted[i].name;
    // Bar (3px-Linie) — füllt sich von 0
    var barWrap=document.createElement('div');
    barWrap.className='linebar';
    barWrap.style.cssText='margin-top:6px;';
    var bar=document.createElement('div');
    var pct=maxVal>0?Math.round((sorted[i].total/maxVal)*100):0;
    bar.style.cssText='width:0%;';
    barWrap.appendChild(bar);
    if(window.caliMotion) caliMotion.animateBar(bar, pct);
    else bar.style.width = pct+'%';
    main.appendChild(nm);main.appendChild(barWrap);
    var right=document.createElement('div');
    right.style.cssText='display:flex;align-items:baseline;gap:4px;flex-shrink:0;';
    var vl=document.createElement('span');
    vl.className='row-val num';
    vl.textContent=Math.round(sorted[i].total).toLocaleString();
    var un=document.createElement('span');
    un.className='unit';
    un.textContent='Wdh';
    right.appendChild(vl);right.appendChild(un);
    row.appendChild(idx);row.appendChild(main);row.appendChild(right);
    list.appendChild(row);
  }
  el.appendChild(list);
}

function buildProfilUI(){
  setTimeout(function(){ try{ buildXPWidget(document.getElementById('xp-widget')); initXPSystem(); updateXPRing(); }catch(e){} },200);
  // Fill inputs
  var fields = {
    'pr-inp-name':   prData.name||'',
    'pr-inp-age':    prData.age||'',
    'pr-inp-weight': prData.weight||'',
    'pr-inp-height': prData.height||''
  };
  for(var id in fields){
    var el=document.getElementById(id);
    if(el&&(!document.activeElement||document.activeElement.id!==id)) el.value=fields[id];
  }
  var gEl=document.getElementById('pr-inp-gender');
  if(gEl) gEl.value=prData.gender||'m';
  var goEl=document.getElementById('pr-inp-goal');
  if(goEl) goEl.value=prData.goal||'strength';

  // Name display (Uppercase kommt per CSS-Klasse .ttl aus pages.html)
  var nd=document.getElementById('pr-name-display');
  if(nd) nd.textContent=prData.name||'Dein Name';

  // Level-Pille: Rahmen/Fläche kommen aus pages.html, nur Text + Textfarbe hier
  var lv=prGetLevel();
  var lb=document.getElementById('pr-level-badge');
  if(lb){lb.textContent=lv.label;lb.style.color=lv.color;}

  // Member since
  var ms=document.getElementById('pr-member-since');
  if(ms&&prData.joinDate) ms.textContent='Mitglied seit '+prData.joinDate.slice(5).replace('-','.')+'.'+prData.joinDate.slice(0,4);

  // Avatar (Grayscale-Filter sitzt auf #pr-avatar in pages.html)
  var av=document.getElementById('pr-avatar');
  if(av&&prData.avatar){
    av.style.cssText+='background-image:url('+prData.avatar+');background-size:cover;background-position:center;';
    var em=document.getElementById('pr-avatar-emoji');
    if(em) em.style.display='none';
  }

  // Stats
  var d={};for(var i=0;i<ents.length;i++)d[ents[i].date]=1;
  var totalWorkouts=Object.keys(d).length;
  var totalSets=0;for(var i=0;i<ents.length;i++)totalSets+=ents[i].sets.length;
  var exSet={};for(var i=0;i<ents.length;i++)exSet[ents[i].name]=1;
  // Count total reps per exercise
  var repsByEx = {};
  var totalReps = 0;
  for(var i=0;i<ents.length;i++){
    var exName = ents[i].name;
    if(!repsByEx[exName]) repsByEx[exName]=0;
    for(var k=0;k<ents[i].sets.length;k++){
      var v = parseFloat(ents[i].sets[k].n)||0;
      repsByEx[exName] += v;
      totalReps += v;
    }
  }
  var stats=[
    {label:'Workouts', value:totalWorkouts},
    {label:'Ges. Wdh', value:totalReps},
    {label:'Übungen', value:Object.keys(exSet).length}
  ];
  var sr=document.getElementById('pr-stats-row');
  if(sr){
    sr.innerHTML='';
    for(var i=0;i<stats.length;i++){
      var box=document.createElement('div');
      box.className='stat-tile';
      box.style.cssText='padding:12px 10px;gap:6px;';
      var lbl=document.createElement('span');
      lbl.className='lbl';
      lbl.style.cssText='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      lbl.textContent=stats[i].label;
      var val=document.createElement('div');
      val.className='kpi num';
      val.style.cssText='font-size:24px;';
      val.textContent=String(stats[i].value);
      box.appendChild(lbl);box.appendChild(val);
      sr.appendChild(box);
      if(window.caliMotion) caliMotion.countUp(val, Math.round(stats[i].value), {duration:600});
    }
    if(window.caliMotion) caliMotion.stagger(sr);
  }

  // Badges (persistiert — einmal verdient bleibt verdient)
  // Grid aus bordered Kacheln: verdient = Linie --line2 + Icon in Orange, gesperrt = gestrichelte Linie + --muted2
  var badgeEl=document.getElementById('pr-badges');
  if(badgeEl){
    badgeEl.innerHTML='';
    var earnedMap=checkBadgeUnlocks();
    var earned=0;
    for(var i=0;i<BADGES.length;i++){
      var b=BADGES[i];
      var has=!!earnedMap[b.id];
      var box=document.createElement('div');
      box.className='badge-item';
      box.style.cssText='margin:0;width:calc(50% - 4px);box-sizing:border-box;flex-direction:column;align-items:flex-start;gap:10px;padding:12px;'+(has?'border-color:var(--line2);':'border-style:dashed;background:transparent;');
      var icon=document.createElement('div');
      icon.style.cssText='flex-shrink:0;';
      icon.innerHTML=(typeof iconWrap==='function') ? iconWrap(b.icon,{size:18,box:36,color:(has?'var(--accent)':'var(--muted2)')}) : '';
      var info=document.createElement('div');
      info.style.cssText='min-width:0;width:100%;';
      var t=document.createElement('div');
      t.className='row-title';
      t.style.cssText='color:'+(has?'var(--text)':'var(--muted2)')+';';
      t.textContent=b.title;
      var d2=document.createElement('div');
      d2.className='row-sub';
      d2.style.cssText='white-space:normal;'+(has?'':'color:var(--muted2);');
      d2.textContent=b.desc;
      info.appendChild(t);info.appendChild(d2);
      box.appendChild(icon);box.appendChild(info);
      badgeEl.appendChild(box);
      if(has) earned++;
    }
    if(!earned){
      var hint=document.createElement('div');
      hint.className='empty';
      hint.style.cssText='width:100%;';
      hint.textContent='Noch keine Abzeichen. Fang an zu trainieren!';
      badgeEl.appendChild(hint);
    }
    if(window.caliMotion) caliMotion.stagger(badgeEl);
  }

  // Best performances from maxEntries
  var bests=document.getElementById('pr-bests');
  if(bests){
    bests.innerHTML='';
    if(!maxEntries.length){
      bests.innerHTML='<div class="empty">Noch keine Max-Werte eingetragen.</div>';
    } else {
      var bestMap={};
      for(var i=0;i<maxEntries.length;i++){
        var me=maxEntries[i];
        var v=parseFloat(me.val)||0;
        if(!bestMap[me.name]||v>parseFloat(bestMap[me.name].val)) bestMap[me.name]=me;
      }
      var bestList=document.createElement('div');
      bestList.className='list';
      for(var name in bestMap){
        var me=bestMap[name];
        // Records-Rezept (Spec §Records): Line-Icon links (44px bordered Quadrat),
        // Label uppercase 10px (per CSS-Klasse, String bleibt Mixed Case), Wert 22px + Einheit
        var row=document.createElement('div');
        row.className='list-row';
        row.style.cssText='cursor:default;';
        var icon=document.createElement('div');
        icon.className='row-icon';
        icon.innerHTML=(typeof ci==='function')?ci('trophy'):'';
        var main=document.createElement('div');
        main.className='row-main';
        var left=document.createElement('div');
        left.className='lbl';
        left.style.cssText='overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        left.textContent=name.replace(' Max','');
        main.appendChild(left);
        var right=document.createElement('div');
        right.style.cssText='display:flex;align-items:baseline;gap:4px;flex-shrink:0;';
        var rv=document.createElement('span');
        rv.className='kpi num';
        rv.style.cssText='font-size:22px;';
        rv.textContent=me.val;
        var ru=document.createElement('span');
        ru.className='unit';
        ru.textContent=me.unit||'';
        right.appendChild(rv);right.appendChild(ru);
        row.appendChild(icon);row.appendChild(main);row.appendChild(right);
        bestList.appendChild(row);
      }
      bests.appendChild(bestList);
    }
  }

  // Total reps per exercise breakdown
  var repsEl = document.getElementById('pr-total-reps');
  if(repsEl){
    repsEl.innerHTML='';
    // Sort by total reps descending
    var sorted = [];
    for(var name in repsByEx){ sorted.push({name:name, total:repsByEx[name]}); }
    sorted.sort(function(a,b){return b.total-a.total;});
    var repsList=document.createElement('div');
    repsList.className='list';
    for(var i=0;i<sorted.length&&i<10;i++){
      var row=document.createElement('div');
      row.className='list-row';
      row.style.cssText='cursor:default;';
      var rank=document.createElement('span');
      rank.className='row-index num';
      rank.textContent=prPadIdx(i+1);
      var main2=document.createElement('div');
      main2.className='row-main';
      var name2=document.createElement('div');
      name2.className='row-title';
      name2.textContent=sorted[i].name;
      main2.appendChild(name2);
      var right2=document.createElement('div');
      right2.style.cssText='display:flex;align-items:baseline;gap:4px;flex-shrink:0;';
      var total=document.createElement('span');
      total.className='row-val num';
      total.textContent=Math.round(sorted[i].total).toLocaleString();
      var tu=document.createElement('span');
      tu.className='unit';
      tu.textContent='Wdh';
      right2.appendChild(total);right2.appendChild(tu);
      row.appendChild(rank);row.appendChild(main2);row.appendChild(right2);
      repsList.appendChild(row);
    }
    if(!sorted.length){
      repsEl.innerHTML='<div class="empty">Noch keine Wdh eingetragen.</div>';
    } else {
      repsEl.appendChild(repsList);
    }
  }
  // Always build streak section at end
  buildProfilStreakSection();
  buildProfilStatsDetail();
  buildPrivacyToggle();
  checkAndShowAdminBtn();
}

function hexToRgb(hex){
  var r=parseInt(hex.slice(1,3),16);
  var g=parseInt(hex.slice(3,5),16);
  var b=parseInt(hex.slice(5,7),16);
  return r+','+g+','+b;
}



// ── FIREBASE ──────────────────────────────────────────────
var firebaseConfig = {
  apiKey: "AIzaSyAzZLudHZd3ht7ASlrgghei-PW6qS9ClMM",
  authDomain: "cali-app-75cc9.firebaseapp.com",
  projectId: "cali-app-75cc9",
  storageBucket: "cali-app-75cc9.firebasestorage.app",
  messagingSenderId: "431823759191",
  appId: "1:431823759191:web:d2ccaa761109b2d883c012",
  measurementId: "G-KZQP7PCWYK"
};

firebase.initializeApp(firebaseConfig);
var fbTimeout = null;


var auth = firebase.auth();
var db   = firebase.firestore();
var currentUser = null;
var authMode = 'login';

// Segment-Control-Zustand über die Klasse 'on' (.seg-ctl in tracker.html).
// Die alten Inline-Werte background/color werden dabei entfernt, damit die Klasse greift.
function segCtlSet(btn, on){
  if(!btn) return;
  btn.style.background = '';
  btn.style.color = '';
  if(on){ btn.classList.add('on'); btn.setAttribute('aria-selected','true'); }
  else { btn.classList.remove('on'); btn.setAttribute('aria-selected','false'); }
}

function showAuthTab(mode){
  authMode = mode;
  var loginBtn    = document.getElementById('tab-login');
  var registerBtn = document.getElementById('tab-register');
  var submitBtn   = document.getElementById('auth-submit-btn');
  var nameRow     = document.getElementById('auth-name-row');
  if(mode==='login'){
    segCtlSet(loginBtn, true);
    segCtlSet(registerBtn, false);
    submitBtn.textContent        = 'Einloggen';
    if(nameRow) nameRow.style.display = 'none';
  } else {
    segCtlSet(registerBtn, true);
    segCtlSet(loginBtn, false);
    submitBtn.textContent        = 'Registrieren';
    if(nameRow) nameRow.style.display = 'block';
  }
  var err = document.getElementById('auth-error');
  if(err) err.style.display = 'none';
}

function authSubmit(){
  var email    = document.getElementById('auth-email').value.trim();
  var password = document.getElementById('auth-password').value;
  var nameEl   = document.getElementById('auth-name');
  var name     = nameEl ? nameEl.value.trim() : '';
  var errEl    = document.getElementById('auth-error');

  if(!email || !password){
    if(errEl){errEl.textContent='E-Mail und Passwort eingeben!';errEl.style.display='block';}
    return;
  }

  if(authMode==='register'){
    auth.createUserWithEmailAndPassword(email, password)
      .then(function(cred){
        return cred.user.updateProfile({displayName: name||email.split('@')[0]});
      })
      .then(function(){
        // Force onboarding for new registrations
        try{ localStorage.removeItem('cali_onboarded'); }catch(x){}
        try{ localStorage.removeItem('cali_profile'); }catch(x){}
        prData = {};
        toast('Konto erstellt! Willkommen!');
        setTimeout(showOnboarding, 1500);
      })
      .catch(function(e){
        if(errEl){errEl.textContent=getAuthError(e.code);errEl.style.display='block';}
      });
  } else {
    auth.signInWithEmailAndPassword(email, password)
      .catch(function(e){
        if(errEl){errEl.textContent=getAuthError(e.code);errEl.style.display='block';}
      });
  }
}

function authGoogle(){
  var provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .catch(function(e){
      var errEl = document.getElementById('auth-error');
      if(errEl){errEl.textContent=getAuthError(e.code);errEl.style.display='block';}
    });
}

function authLogout(){
  auth.signOut();
}

// Logout-Bestätigung über das Sheet statt des nativen confirm() (Fallback bleibt)
function confirmLogout(){
  if(typeof confirmSheet === 'function'){
    confirmSheet({
      title:'Wirklich ausloggen?',
      confirmLabel:'Ausloggen',
      onConfirm:function(){ authLogout(); }
    });
  } else if(confirm('Wirklich ausloggen?')){
    authLogout();
  }
}

// ── EINSTELLUNGEN (Zahnrad im Profil) ─────────────────────
function openSettings(){
  var exOv = document.getElementById('settings-ov'); if(exOv) exOv.remove();
  var panel = document.getElementById('pr-settings-panel');
  if(!panel) return;

  var ov = document.createElement('div');
  ov.id = 'settings-ov';
  ov.className = 'backdrop';

  var box = document.createElement('div');
  box.id = 'settings-box';
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:88vh;overflow-y:auto;';
  box.innerHTML = '<div class="sheet-grip"></div><div class="ttl" style="margin-bottom:14px;">Einstellungen</div>';

  box.appendChild(panel);
  try{ buildPrivacyToggle(); }catch(e){}
  try{ checkAndShowAdminBtn(); }catch(e){}

  var closeBtn = document.createElement('button');
  closeBtn.className = 'btn-g pressable';
  closeBtn.style.cssText = 'width:100%;min-height:44px;margin-top:8px;';
  closeBtn.textContent = 'Schließen';
  closeBtn.onclick = function(){ closeSettings(); };
  box.appendChild(closeBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) closeSettings(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}

function closeSettings(){
  var panel = document.getElementById('pr-settings-panel');
  var home = document.getElementById('pr-settings-home');
  if(panel && home) home.appendChild(panel);
  var ov = document.getElementById('settings-ov');
  if(ov) ov.remove();
}

function settingsStub(label){
  if(typeof toast === 'function') toast(label+' — kommt bald!');
}

function checkForAppUpdate(){
  if(!('serviceWorker' in navigator)){ if(typeof toast==='function') toast('Nicht unterstützt.'); return; }
  // Laufendes Workout nicht durch den Reload zerstören
  if(typeof woActive!=='undefined' && woActive){
    if(typeof toast==='function') toast('Update nach dem Workout — Training läuft noch');
    return;
  }
  if(typeof toast === 'function') toast('Suche nach Updates...');
  navigator.serviceWorker.getRegistrations().then(function(regs){
    Promise.all(regs.map(function(r){ return r.update(); })).then(function(){
      setTimeout(function(){ location.reload(); }, 800);
    });
  }).catch(function(){});
}

function getAuthError(code){
  var errors = {
    'auth/email-already-in-use':   'E-Mail bereits registriert',
    'auth/invalid-email':          'Ungültige E-Mail Adresse',
    'auth/weak-password':          'Passwort zu schwach (min. 6 Zeichen)',
    'auth/user-not-found':         'Kein Konto mit dieser E-Mail',
    'auth/wrong-password':         'Falsches Passwort',
    'auth/too-many-requests':      'Zu viele Versuche. Bitte warten.',
    'auth/popup-closed-by-user':   'Anmeldung abgebrochen',
  };
  return errors[code] || 'Fehler: ' + code;
}

// Auth state listener
if(auth){
auth.onAuthStateChanged(function(user){
  clearTimeout(fbTimeout);
  if(user){
    currentUser = user;
    document.getElementById('login-screen').style.display = 'none';
    var nav = document.getElementById('main-nav');
    if(nav) nav.style.display = 'flex';
    document.getElementById('page-e').className = 'page on';
    // Load user data from Firestore
    loadUserData(user.uid);
    toast('Willkommen ' + (user.displayName||user.email) + '!');
    // Onboarding check happens inside loadUserData callback
  } else {
    currentUser = null;
    document.getElementById('login-screen').style.display = 'flex';
    var nav = document.getElementById('main-nav');
    if(nav) nav.style.display = 'none';
    // Hide all pages
    var pages = ['e','p','m','ch','v','pr','h'];
    for(var i=0;i<pages.length;i++){
      var pg = document.getElementById('page-'+pages[i]);
      if(pg) pg.className = 'page';
    }
  }
}); // end onAuthStateChanged
} else {
  // Firebase not available - show login
  var ls2=document.getElementById('login-screen');if(ls2)ls2.style.display='flex';
}

// ── FIRESTORE SYNC ────────────────────────────────────────
function getUserDoc(){
  if(!currentUser) return null;
  return db.collection('users').doc(currentUser.uid);
}

function saveUserData(){
  if(!currentUser) return;
  var doc = getUserDoc();
  doc.set({
    ents:       ents,
    maxEntries: maxEntries,
    plans:      plans,
    prData:     prData,
    challenge:  activeChallenge||null,
    updatedAt:  new Date().toISOString()
  }, {merge: true}).catch(function(e){ console.log('Save error:', e); });
}

function loadUserData(uid){
  db.collection('users').doc(uid).get()
    .then(function(doc){
      if(doc.exists){
        var d = doc.data();
        if(d.ents)       ents       = d.ents;
        if(d.maxEntries) maxEntries = d.maxEntries;
        if(d.plans)      plans      = d.plans;
        if(d.prData)     prData     = d.prData;
        if(d.challenge)  activeChallenge = d.challenge;
        try{
          localStorage.setItem('cali_v4', JSON.stringify(ents));
          localStorage.setItem('cali_max', JSON.stringify(maxEntries));
          localStorage.setItem('cali_plans', JSON.stringify(plans));
          localStorage.setItem('cali_profile', JSON.stringify(prData));
        }catch(x){}
        bb(); buildStartPlanBtns(); buildStartChallengeWidget();
      }
      // Check onboarding AFTER data loaded
      lstreak();
      var onboarded = false;
      try{ onboarded = !!localStorage.getItem('cali_onboarded'); }catch(x){}
      var isNew = !prData || !prData.name;
      if(isNew && !onboarded){
        setTimeout(showOnboarding, 1500);
      } else {
        if(!streakData.goalSet) showWeeklyGoalModal();
        buildStreakWidget();
      }
    })
    .catch(function(e){
      console.log('Load error:', e);
      // Even on error, check onboarding
      lstreak();
      var onboarded = false;
      try{ onboarded = !!localStorage.getItem('cali_onboarded'); }catch(x){}
      if(!prData || (!prData.name && !onboarded)){
        setTimeout(showOnboarding, 400);
      } else {
        buildStreakWidget();
      }
    });
}

// ld() wird direkt genutzt, kein Override nötig

// Auto-save to Firebase when data changes
function fbSave(){
  if(currentUser) saveUserData();
}


// Populate chart select
var cexEl=document.getElementById('cex');
if(cexEl){for(var xi=0;xi<EX_DB.length;xi++){var opt=document.createElement('option');opt.textContent=EX_DB[xi].name;cexEl.appendChild(opt);}}

// Demo-Modus: demoLogin() in main2ba.js (das frühere startDemo hier war unreferenziert)
