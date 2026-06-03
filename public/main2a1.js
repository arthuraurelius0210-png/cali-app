
loadChallenges();

function buildChallengePresets(){
  var el = document.getElementById('challenge-presets');
  if(!el) return;
  el.innerHTML = '';

  var title = document.createElement('div');
  title.style.cssText = 'font-size:9px;letter-spacing:3px;color:var(--accent);font-family:inherit;margin-bottom:10px;';
  title.textContent = 'VORGEFERTIGTE CHALLENGES';
  el.appendChild(title);

  for(var i=0;i<PRESET_CHALLENGES.length;i++){
    (function(ch){
      var card = document.createElement('div');
      card.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:8px;';

      var top = document.createElement('div');
      top.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:6px;';

      var icon = document.createElement('span');
      icon.style.cssText = 'font-size:22px;';
      icon.textContent = ch.icon;

      var info = document.createElement('div');
      info.style.cssText = 'flex:1;';

      var t = document.createElement('div');
      t.style.cssText = 'font-family:inherit;font-size:15px;letter-spacing:1px;color:var(--text);';
      t.textContent = ch.title;

      var d = document.createElement('div');
      d.style.cssText = 'font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4;';
      d.textContent = ch.desc;

      info.appendChild(t);
      info.appendChild(d);
      top.appendChild(icon);
      top.appendChild(info);

      var exp = document.createElement('div');
      exp.style.cssText = 'font-size:11px;color:var(--muted);border-top:1px solid var(--border);padding-top:8px;margin-top:8px;line-height:1.5;font-style:italic;';
      exp.textContent = ch.explanation;

      var btn = document.createElement('button');
      btn.style.cssText = 'background:rgba(255,85,0,0.08);color:var(--accent);border:1px solid rgba(255,85,0,0.3);border-radius:8px;font-family:inherit;font-size:12px;letter-spacing:2px;padding:9px;cursor:pointer;width:100%;margin-top:10px;';
      btn.textContent = 'CHALLENGE ANNEHMEN';
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
  'Sprint 100m Max': {
    male:   [[9,99.9],[10,99],[11,97],[12,92],[13,82],[14,68],[15,50],[16,32],[17,18],[18,8],[20,3]],
    female: [[10,99.9],[11,99],[12,97],[13,90],[14,75],[15,55],[16,35],[17,18],[18,8],[20,3]]
  }
};

function getPercentile(exName, val, gender){
  var data = PERCENTILE_DATA[exName];
  if(!data) return -1;
  var table = (gender==='f') ? data.female : data.male;
  if(!table) return -1;
  var num = parseFloat(val);
  if(isNaN(num)) return -1;

  // Special case: Sprint (lower = better)
  var isTime = exName.indexOf('Sprint')>-1 || exName.indexOf('100m')>-1;
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

function getPercentileLabel(pct){
  if(pct>=99.5) return {text:'Legendar! Top 0.5%', color:'#F59E0B'};
  if(pct>=99)   return {text:'Weltklasse! Top 1%', color:'#F59E0B'};
  if(pct>=95)   return {text:'Elite! Top 5%', color:'var(--accent)'};
  if(pct>=90)   return {text:'Stark! Top 10%', color:'var(--accent)'};
  if(pct>=75)   return {text:'Gut! Top 25%', color:'#4ECDC4'};
  if(pct>=50)   return {text:'Solide! Besser als die Halfte', color:'#4ECDC4'};
  if(pct>=25)   return {text:'Weiter so! Guter Start', color:'#888'};
  return {text:'Bleib dran! Jeder fangt irgendwo an', color:'#888'};
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
  card.style.cssText='background:rgba(255,85,0,0.05);border:2px solid var(--accent);border-radius:12px;padding:16px;margin-top:12px;box-shadow:0 0 20px rgba(200,240,74,0.1);';

  var title = document.createElement('div');
  title.style.cssText='font-family:inherit;font-size:11px;letter-spacing:3px;color:var(--muted);margin-bottom:10px;';
  title.textContent='WELTWEITER VERGLEICH';

  var pctText = document.createElement('div');
  pctText.style.cssText='font-family:inherit;font-size:32px;color:'+lbl.color+';line-height:1;margin-bottom:4px;';
  var displayPct = Math.min(99.9, Math.round(pct*10)/10);
  pctText.textContent='Besser als '+displayPct+'%';

  var sub = document.createElement('div');
  sub.style.cssText='font-size:12px;color:var(--muted);margin-bottom:14px;';
  sub.textContent='aller Menschen weltweit';

  // Progress bar
  var barWrap = document.createElement('div');
  barWrap.style.cssText='background:var(--bg3);border-radius:20px;height:10px;overflow:hidden;margin-bottom:8px;';
  var bar = document.createElement('div');
  bar.style.cssText='height:100%;border-radius:20px;background:'+lbl.color+';width:'+Math.min(99.9,Math.round(pct*10)/10)+'%;transition:width 0.8s;';
  barWrap.appendChild(bar);

  var labelDiv = document.createElement('div');
  labelDiv.style.cssText='font-family:inherit;font-size:14px;letter-spacing:1px;color:'+lbl.color+';';
  labelDiv.textContent=lbl.text;

  var source = document.createElement('div');
  source.style.cssText='font-size:10px;color:var(--muted2);margin-top:8px;';
  source.textContent='Daten: strengthlevel.com (4.8M+ Eintrage)';

  card.appendChild(title);
  card.appendChild(pctText);
  card.appendChild(sub);
  card.appendChild(barWrap);
  card.appendChild(labelDiv);
  card.appendChild(source);
  el.appendChild(card);
}



// ── PROFIL ────────────────────────────────────────────────
var prData = {name:'',age:'',weight:'',height:'',gender:'m',goal:'strength',joinDate:'',avatar:''};

var BADGES = [
  {id:'first_workout', icon:'&#x1F4AA;', title:'Erstes Workout', desc:'Dein erstes Workout abgeschlossen', check:function(){return ents.length>0;}},
  {id:'10_workouts',   icon:'&#x1F525;', title:'10 Workouts',    desc:'10 Workouts abgeschlossen',        check:function(){var d={};for(var i=0;i<ents.length;i++)d[ents[i].date]=1;return Object.keys(d).length>=10;}},
  {id:'50_workouts',   icon:'&#x1F3C6;', title:'50 Workouts',    desc:'50 Workouts abgeschlossen',        check:function(){var d={};for(var i=0;i<ents.length;i++)d[ents[i].date]=1;return Object.keys(d).length>=50;}},
  {id:'first_max',     icon:'&#x2B50;',  title:'Max Getestet',   desc:'Ersten Max-Test eingetragen',      check:function(){return maxEntries.length>0;}},
  {id:'elite_pullup',  icon:'&#x1F451;', title:'Klimmzug Elite', desc:'Mehr als 20 Klimmzuge Max',        check:function(){for(var i=0;i<maxEntries.length;i++){if(maxEntries[i].name==='Klimmzuge Max'&&parseFloat(maxEntries[i].val)>=20)return true;}return false;}},
  {id:'challenge_done',icon:'&#x1F3AF;', title:'Challenge Held', desc:'Eine Challenge abgeschlossen',     check:function(){return activeChallenge&&activeChallenge.params&&calcChallengeProgress()>=activeChallenge.params.target;}},
  {id:'streak_7',      icon:'&#x1F525;', title:'7-Tage Streak',  desc:'7 Tage in Folge trainiert',        check:function(){var dates=[];for(var i=0;i<ents.length;i++){if(dates.indexOf(ents[i].date)===-1)dates.push(ents[i].date);}dates.sort();var streak=1;for(var i=1;i<dates.length;i++){var d1=new Date(dates[i-1]);var d2=new Date(dates[i]);if((d2-d1)/(86400000)===1){streak++;if(streak>=7)return true;}else{streak=1;}}return false;}},
  {id:'variety',       icon:'&#x1F3CB;', title:'Allrounder',     desc:'10 verschiedene Ubungen trainiert',check:function(){var ex={};for(var i=0;i<ents.length;i++)ex[ents[i].name]=1;return Object.keys(ex).length>=10;}},
];

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

function prEditName(){
  var n = prompt('Dein Name:', prData.name||'');
  if(n!==null){ prData.name=n.trim(); spr(); buildProfilUI(); }
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

function prGetLevel(){
  var d={};
  for(var i=0;i<ents.length;i++) d[ents[i].date]=1;
  var days = Object.keys(d).length;
  if(days>=100) return {label:'ELITE',     color:'#F59E0B'};
  if(days>=50)  return {label:'ADVANCED',  color:'var(--accent)'};
  if(days>=20)  return {label:'INTERMEDIATE', color:'#4ECDC4'};
  if(days>=5)   return {label:'NOVICE',    color:'#A78BFA'};
  return        {label:'BEGINNER',         color:'#888'};
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
    {label:'GESAMT TRAININGSZEIT', value:fmtTime(totalDuration), sub:'seit Beginn'},
    {label:'DURCHSCHNITT PRO TAG', value:fmtTime(avgDurSec), sub:'pro Trainingstag'},
    {label:'LANGSTER TRAININGSTAG', value:fmtTime(maxDurDay), sub:'an einem Tag'},
    {label:'GESAMT WIEDERHOLUNGEN', value:totalRepsAll.toLocaleString(), sub:'alle Ubungen'},
    {label:'GESAMT SATZE', value:totalSets.toLocaleString(), sub:'alle Satze'},
    {label:'TRAININGSTAGE', value:String(totalWorkoutDays), sub:'Tage trainiert'},
  ];

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;';
  for(var i=0;i<bigStats.length;i++){
    var box=document.createElement('div');
    box.style.cssText='background:var(--bg2);border:1px solid #1e1e1e;border-radius:10px;padding:12px;';
    var val=document.createElement('div');
    val.style.cssText='font-family:inherit;font-size:22px;color:var(--accent);line-height:1;margin-bottom:3px;';
    val.textContent=bigStats[i].value;
    var lbl=document.createElement('div');
    lbl.style.cssText='font-size:9px;letter-spacing:2px;color:var(--muted);font-family:inherit;';
    lbl.textContent=bigStats[i].label;
    var sub=document.createElement('div');
    sub.style.cssText='font-size:10px;color:var(--muted2);margin-top:2px;';
    sub.textContent=bigStats[i].sub;
    box.appendChild(val);box.appendChild(lbl);box.appendChild(sub);
    grid.appendChild(box);
  }
  el.appendChild(grid);

  // ── Wdh per exercise ranking ──
  var title2=document.createElement('div');
  title2.style.cssText='font-size:9px;letter-spacing:3px;color:var(--muted);font-family:inherit;margin-bottom:8px;margin-top:4px;';
  title2.textContent='ALLE UBUNGEN — GESAMTE WIEDERHOLUNGEN';
  el.appendChild(title2);

  var sorted=[];
  for(var name in repsByEx) sorted.push({name:name,total:repsByEx[name]});
  sorted.sort(function(a,b){return b.total-a.total;});

  if(!sorted.length){
    var none=document.createElement('div');
    none.style.cssText='font-size:12px;color:var(--muted2);padding:8px 0;';
    none.textContent='Noch keine Workouts eingetragen.';
    el.appendChild(none);
    return;
  }

  var maxVal = sorted[0].total;
  for(var i=0;i<sorted.length;i++){
    var row=document.createElement('div');
    row.style.cssText='margin-bottom:8px;';
    // Name + value
    var top=document.createElement('div');
    top.style.cssText='display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;';
    var nm=document.createElement('div');
    nm.style.cssText='font-size:12px;color:var(--text);';
    nm.textContent=sorted[i].name;
    var vl=document.createElement('div');
    vl.style.cssText='font-family:inherit;font-size:14px;color:var(--accent);';
    vl.textContent=Math.round(sorted[i].total).toLocaleString()+' Wdh';
    top.appendChild(nm);top.appendChild(vl);
    // Bar
    var barWrap=document.createElement('div');
    barWrap.style.cssText='background:var(--bg3);border-radius:4px;height:4px;';
    var bar=document.createElement('div');
    var pct=maxVal>0?Math.round((sorted[i].total/maxVal)*100):0;
    bar.style.cssText='height:100%;border-radius:4px;background:var(--accent);width:'+pct+'%;';
    barWrap.appendChild(bar);
    row.appendChild(top);row.appendChild(barWrap);
    el.appendChild(row);
  }
}

function buildProfilUI(){
  // Fill inputs
  var fields = {
    'pr-inp-name':   prData.name||'',
    'pr-inp-age':    prData.age||'',
    'pr-inp-weight': prData.weight||'',
    'pr-inp-height': prData.height||''
  };
  for(var id in fields){
    var el=document.getElementById(id);
    if(el&&!document.activeElement||document.activeElement.id!==id) el.value=fields[id];
  }
  var gEl=document.getElementById('pr-inp-gender');
  if(gEl) gEl.value=prData.gender||'m';
  var goEl=document.getElementById('pr-inp-goal');
  if(goEl) goEl.value=prData.goal||'strength';

  // Name display
  var nd=document.getElementById('pr-name-display');
  if(nd) nd.textContent=(prData.name||'DEIN NAME').toUpperCase();

  // Level
  var lv=prGetLevel();
  var lb=document.getElementById('pr-level-badge');
  if(lb){lb.textContent=lv.label;lb.style.color=lv.color;lb.style.borderColor=lv.color;lb.style.background='rgba('+hexToRgb(lv.color)+',0.1)';}

  // Member since
  var ms=document.getElementById('pr-member-since');
  if(ms&&prData.joinDate) ms.textContent='Mitglied seit '+prData.joinDate.slice(5).replace('-','.')+'.'+prData.joinDate.slice(0,4);

  // Avatar
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
    {label:'Ubungen', value:Object.keys(exSet).length}
  ];
  var sr=document.getElementById('pr-stats-row');
  if(sr){
    sr.innerHTML='';
    for(var i=0;i<stats.length;i++){
      var box=document.createElement('div');
      box.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px 8px;text-align:center;';
      var val=document.createElement('div');
      val.style.cssText='font-family:inherit;font-size:26px;color:var(--accent);line-height:1;';
      val.textContent=String(stats[i].value);
      var lbl=document.createElement('div');
      lbl.style.cssText='font-size:9px;letter-spacing:2px;color:var(--muted);font-family:inherit;margin-top:3px;';
      lbl.textContent=stats[i].label;
      box.appendChild(val);box.appendChild(lbl);
      sr.appendChild(box);
    }
  }

  // Badges
  var badgeEl=document.getElementById('pr-badges');
  if(badgeEl){
    badgeEl.innerHTML='';
    var earned=0;
    for(var i=0;i<BADGES.length;i++){
      var b=BADGES[i];
      var has=false;
      try{has=b.check();}catch(e){}
      var box=document.createElement('div');
      box.style.cssText='background:'+(has?'rgba(255,85,0,0.06)':'var(--bg2)')+';border:1px solid '+(has?'rgba(255,85,0,0.3)':'var(--border)')+';border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:8px;opacity:'+(has?'1':'0.35')+';width:100%;';
      var icon=document.createElement('div');
      icon.style.cssText='font-size:22px;flex-shrink:0;';
      icon.innerHTML=b.icon;
      var info=document.createElement('div');
      var t=document.createElement('div');
      t.style.cssText='font-family:inherit;font-size:13px;letter-spacing:1px;color:'+(has?'var(--accent)':'#555')+';';
      t.textContent=b.title;
      var d2=document.createElement('div');
      d2.style.cssText='font-size:10px;color:var(--muted2);margin-top:1px;';
      d2.textContent=b.desc;
      info.appendChild(t);info.appendChild(d2);
      box.appendChild(icon);box.appendChild(info);
      badgeEl.appendChild(box);
      if(has) earned++;
    }
    if(!earned){
      var hint=document.createElement('div');
      hint.style.cssText='font-size:12px;color:var(--muted2);padding:8px 0;';
      hint.textContent='Noch keine Abzeichen. Fang an zu trainieren!';
      badgeEl.appendChild(hint);
    }
  }
