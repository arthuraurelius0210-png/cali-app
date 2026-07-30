
function cancelPlanForm(){
  document.getElementById('plan-form').style.display='none';
  document.getElementById('plan-list').style.display='block';
  buildPlanList();
}

function pfExChanged(){
  var v=document.getElementById('pf-ex').value;
  var u=v.split('|')[1];
  document.getElementById('pf-lbl-n').textContent=u==='Sek'?'SEKUNDEN (ZIEL)':u==='Min:Sek'?'MIN:SEK (ZIEL)':'WDHS (ZIEL)';
  pfSets=[];
  buildPfSets();
}

function pfAddSet(){
  pfSets.push({n:''});
  buildPfSets();
}

function pfDelSet(i){
  if(pfSets.length<=1)return;
  pfSets.splice(i,1);
  buildPfSets();
}

function pfSetVal(i,v){if(pfSets[i])pfSets[i].n=v;}

function buildPfSets(){
  var box=document.getElementById('pf-sbox');
  if(!box)return;
  var ca=['var(--accent)','#FF6B35','#4ECDC4','#A78BFA'];
  var h='';
  for(var i=0;i<pfSets.length;i++){
    var co=ca[i<4?i:3];
    h+='<div class="sr">';
    h+='<div class="snum" style="color:'+co+'">'+(i+1)+'</div>';
    h+='<input class="sinp" type="number" placeholder="Ziel Wdh" value="'+(pfSets[i].n||'')+'" oninput="pfSetVal('+i+',this.value)">';
    h+='<div></div>';
    h+='<button class="sdel" aria-label="Satz entfernen" onclick="pfDelSet('+i+')">&#x2715;</button>';
    h+='</div>';
  }
  box.innerHTML=h;
}

function pfAddEx(){
  if(!selPfEx){alert('Bitte zuerst eine Ubung auswahlen!');return;}
  var ok=[];
  for(var i=0;i<pfSets.length;i++){if(pfSets[i].n.trim()!=='')ok.push({n:pfSets[i].n});}
  if(!ok.length){alert('Mindestens einen Satz mit Ziel eintragen!');return;}
  pfExercises.push({name:selPfEx.name,unit:selPfEx.unit,col:selPfEx.col,band:selPfEx.band===1,sets:ok});
  buildPfExList();
  pfSets=[];pfAddSet();
  toast(p[0]+' hinzugefugt!');
}

function pfDelEx(i){
  pfExercises.splice(i,1);
  buildPfExList();
}

function buildPfExList(){
  var el=document.getElementById('pf-ex-list');
  if(!pfExercises.length){el.innerHTML='';return;}
  var h='';
  for(var i=0;i<pfExercises.length;i++){
    var ex=pfExercises[i];
    var col=COLS[ex.col]||COLS.gr;
    var st='';
    for(var k=0;k<ex.sets.length;k++){if(k>0)st+=' · ';st+='S'+(k+1)+': '+ex.sets[k].n+' '+ex.unit;}
    h+='<div class="pf-ex-item">';
    h+='<div class="plan-dot" style="background:'+col+'"></div>';
    h+='<div class="pf-ex-col"><div class="pf-ex-name">'+ex.name+'</div><div class="pf-ex-sets">'+st+'</div></div>';
    h+='<button class="pf-ex-del" aria-label="Übung entfernen" onclick="pfDelEx('+i+')">&#x2715;</button>';
    h+='</div>';
  }
  el.innerHTML=h;
}

function savePlan(){
  var name=document.getElementById('pf-name').value.trim();
  if(!name){alert('Plan einen Namen geben!');return;}
  if(!pfExercises.length){alert('Mindestens eine Ubung hinzufugen!');return;}
  var plan={id:new Date().getTime(),name:name,exercises:pfExercises};
  plans.push(plan);
  spd();
  cancelPlanForm();
  buildPlanList();
  buildStartPlanBtns();
  toast(name+' gespeichert!');
  fbSave();
}

function deletePlan(id){
  if(!confirm('Plan loschen?'))return;
  var n=[];for(var i=0;i<plans.length;i++){if(plans[i].id!==id)n.push(plans[i]);}
  plans=n;spd();buildPlanList();buildStartPlanBtns();
}

function removePresetFromMyPlans(pi){
  var name=PRESET_PLANS[pi].name;
  var n=[];
  for(var i=0;i<plans.length;i++){if(plans[i].name!==name)n.push(plans[i]);}
  plans=n;spd();buildPlanList();buildStartPlanBtns();
  toast(name+' entfernt!');
}

function addPresetToMyPlans(pi){
  var pp=PRESET_PLANS[pi];
  // Check if already added
  for(var i=0;i<plans.length;i++){
    if(plans[i].name===pp.name){toast(pp.name+' bereits in deinen Planen!');return;}
  }
  var newPlan={id:new Date().getTime(),name:pp.name,exercises:pp.exercises};
  plans.push(newPlan);
  spd();
  buildPlanList();
  buildStartPlanBtns();
  toast(pp.name+' zu meinen Planen hinzugefugt!');
}

function buildPlanList(){
  var el=document.getElementById('plan-list');
  if(!el)return;
  var h='';

  // PRESETS section
  // WOCHENPLAN section
  h+='<div style="font-size:11px;color:var(--accent);font-family:inherit;font-weight:700;margin-bottom:8px;">Wochenplan</div>';
  h+='<div id="week-plan-section" style="margin-bottom:20px;"></div>';
  h+='<div style="font-size:11px;color:var(--accent);font-family:inherit;font-weight:700;margin-bottom:8px;">Vorlagen</div>';
  for(var pi=0;pi<PRESET_PLANS.length;pi++){
    var pl=PRESET_PLANS[pi];
    var alreadyAdded=false;
    for(var ai=0;ai<plans.length;ai++){if(plans[ai].name===pl.name){alreadyAdded=true;break;}}
    h+='<div class="plan-card" style="border-color:var(--border);opacity:'+(alreadyAdded?'0.5':'1')+';cursor:pointer;" onclick="togglePlanExpand(this)">';
    h+='<div class="plan-top"><div class="plan-name" style="color:var(--muted)">'+pl.name+'</div>';
    h+='<div style="display:flex;align-items:center;gap:8px;">';
    h+='<div style="font-size:10px;color:var(--muted);">'+pl.exercises.length+' Übungen</div>';
    h+='<div style="background:rgba(255,85,0,0.08);color:var(--accent);border-radius:20px;padding:2px 8px;font-family:inherit;font-size:10px;font-weight:700;">Vorlage</div>';
    h+='<div style="font-size:14px;color:var(--muted);">›</div></div></div>';
    // Exercises hidden by default
    h+='<div class="plan-ex-detail" style="display:none;margin-top:10px;">';
    for(var j=0;j<pl.exercises.length;j++){
      var pex=pl.exercises[j];var pcol=COLS[pex.col]||COLS.gr;
      var pst='';for(var k=0;k<pex.sets.length;k++){if(k>0)pst+=' · ';pst+='S'+(k+1)+': '+pex.sets[k].n+' '+pex.unit;}
      h+='<div class="plan-exrow"><div class="plan-dot" style="background:'+pcol+'"></div><div class="plan-exname">'+pex.name+'</div><div class="plan-exsets">'+pst+'</div></div>';
    }
    h+='<div class="plan-actions" style="margin-top:10px;">';
    if(alreadyAdded){
      h+='<button class="plan-del-btn" onclick="event.stopPropagation();removePresetFromMyPlans('+pi+')">ENTFERNEN</button>';
    } else {
      h+='<button class="plan-start-btn" onclick="event.stopPropagation();addPresetToMyPlans('+pi+')" style="background:rgba(255,85,0,0.08);color:var(--accent);border:1px solid rgba(255,85,0,0.3);">+ HINZUFUGEN</button>';
    }
    h+='</div></div></div>';
  }

  // MY PLANS section
  if(plans.length){
    h+='<div class="stitle">MEINE PLANE</div>';
    for(var i=0;i<plans.length;i++){
      var pl=plans[i];
      h+='<div class="plan-card" style="cursor:pointer;" onclick="togglePlanExpand(this)">';
      h+='<div class="plan-top"><div class="plan-name">'+pl.name+'</div>';
      h+='<div style="display:flex;align-items:center;gap:8px;"><div style="font-size:10px;color:var(--muted);">'+pl.exercises.length+' Übungen</div><div style="font-size:14px;color:var(--muted);">›</div></div></div>';
      h+='<div class="plan-ex-detail" style="display:none;margin-top:10px;">';
      for(var j=0;j<pl.exercises.length;j++){
        var ex=pl.exercises[j];var col=COLS[ex.col]||COLS.gr;
        var st='';for(var k=0;k<ex.sets.length;k++){if(k>0)st+=' · ';st+='S'+(k+1)+': '+ex.sets[k].n+' '+ex.unit;}
        h+='<div class="plan-exrow"><div class="plan-dot" style="background:'+col+'"></div><div class="plan-exname">'+ex.name+'</div><div class="plan-exsets">'+st+'</div></div>';
      }
      h+='<div class="plan-actions" style="margin-top:10px;">';
      h+='<button class="plan-start-btn" onclick="event.stopPropagation();startWorkout('+pl.id+')">STARTEN</button>';
      h+='<button class="plan-del-btn" onclick="event.stopPropagation();deletePlan('+pl.id+')">LOSCHEN</button>';
      h+='</div></div></div>';
    }
  } else {
    h+='<div class="empty" style="padding:20px 0;">Noch keine eigenen Plane.<br>Vorlage hinzufugen oder neuen Plan erstellen.</div>';
  }
  el.innerHTML=h;
  buildWeekPlan();
}

function startPreset(idx){
  var pl=PRESET_PLANS[idx];
  if(!pl)return;
  startWorkout(null);
  // Load preset exercises
  planBlocks=[];
  for(var j=0;j<pl.exercises.length;j++){
    var pex=pl.exercises[j];
    var blkSets=[];
    for(var k=0;k<pex.sets.length;k++){blkSets.push({target:pex.sets[k].n,actual:''});}
    planBlocks.push({name:pex.name,unit:pex.unit,col:pex.col,sets:blkSets,done:false,open:false});
  }
  buildPlanBlocks();
  document.getElementById('plan-add-form').style.display='none';
  document.getElementById('plan-add-label').style.display='none';
  toast('Preset "'+pl.name+'" geladen!');
}

function getPlanCategoryTags(pl){
  var tags=[];
  for(var i=0;i<pl.exercises.length;i++){
    var exName=pl.exercises[i].name;
    for(var j=0;j<EX_DB.length;j++){
      if(EX_DB[j].name===exName && EX_DB[j].cat){
        if(tags.indexOf(EX_DB[j].cat)===-1) tags.push(EX_DB[j].cat);
        break;
      }
    }
  }
  return tags.slice(0,3);
}

function buildStartPlanBtns(){
  var el=document.getElementById('plan-btns');
  if(!el)return;
  el.innerHTML='';
  if(!plans.length){
    var hint=document.createElement('div');
    hint.style.cssText='font-size:12px;color:var(--muted2);text-align:center;padding:8px 0;';
    hint.textContent='Geh zu Pläne um einen Plan hinzuzufügen';
    el.appendChild(hint);
    return;
  }
  for(var i=0;i<plans.length;i++){
    (function(pl){
      var totalSets=0;
      for(var s=0;s<pl.exercises.length;s++){ totalSets+=(pl.exercises[s].sets||[]).length; }
      var tags=getPlanCategoryTags(pl);

      var card=document.createElement('div');
      card.className='pk-card';
      card.style.cssText='display:flex;align-items:center;gap:14px;padding:16px;cursor:pointer;';
      card.onclick=function(){startWorkout(pl.id);};

      var icon=document.createElement('div');
      icon.style.cssText='width:44px;height:44px;border-radius:14px;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;color:var(--accent);';
      icon.innerHTML='&#128170;';

      var info=document.createElement('div');
      info.style.cssText='flex:1;min-width:0;';
      var nameRow=document.createElement('div');
      nameRow.style.cssText='font-size:14px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      nameRow.textContent=pl.name;
      var metaRow=document.createElement('div');
      metaRow.style.cssText='font-size:11px;color:var(--muted);margin-top:3px;';
      metaRow.textContent=pl.exercises.length+' Übungen · '+totalSets+' Sätze';
      info.appendChild(nameRow); info.appendChild(metaRow);
      if(tags.length){
        var tagRow=document.createElement('div');
        tagRow.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;';
        tags.forEach(function(t){
          var chip=document.createElement('div');
          chip.style.cssText='background:var(--bg3);border-radius:20px;padding:3px 10px;font-size:10px;color:var(--muted);font-weight:600;';
          chip.textContent=t;
          tagRow.appendChild(chip);
        });
        info.appendChild(tagRow);
      }

      var chevron=document.createElement('div');
      chevron.style.cssText='color:var(--muted);font-size:18px;flex-shrink:0;';
      chevron.innerHTML='&#8250;';

      card.appendChild(icon); card.appendChild(info); card.appendChild(chevron);
      el.appendChild(card);
    })(plans[i]);
  }
}

// ── CANCEL WORKOUT ────────────────────────────────────────
function cancelWorkout(){
  if(!confirm('Workout abbrechen? Alle Eintrage gehen verloren.')) return;
  clearInterval(woTimer);
  woTimer=null;
  woActive=false;
  woExercises=[];
  planBlocks=[];
  sets=[];sBand='';isBand=false;
  document.getElementById('active-workout').style.display='none';
  document.getElementById('start-screen').style.display='block';
  document.getElementById('wo-timer').textContent='00:00';
  document.getElementById('wo-ex-list').innerHTML='<div class="empty" id="wo-empty">Noch keine Ubungen hinzugefugt.</div>';
  document.getElementById('plan-blocks-wrap').style.display='none';
  if(document.getElementById('plan-add-form'))document.getElementById('plan-add-form').style.display='none';
  if(document.getElementById('plan-add-label'))document.getElementById('plan-add-label').style.display='none';
  document.getElementById('sbox').innerHTML='';
  document.getElementById('inp-note').value='';
  document.getElementById('b-cust').value='';
  toast('Workout abgebrochen');
}

// ── MAX TEST ──────────────────────────────────────────────
var maxEntries = [];
var maxChart2 = null;
var maxFilter = 'Alle';

function lmax(){try{var a=localStorage.getItem('cali_max');maxEntries=a?JSON.parse(a):[];}catch(x){maxEntries=[];}}
function smax(){try{localStorage.setItem('cali_max',JSON.stringify(maxEntries));}catch(x){}}

function saveMaxEntry(){
  var date = document.getElementById('max-date').value;
  var exRaw = document.getElementById('max-ex').value;
  var val = document.getElementById('max-val').value.trim();
  var genderEl = document.getElementById('max-gender');
  var gender = genderEl ? genderEl.value : 'm';
  if(!date){alert('Datum ausfullen!');return;}
  if(!val){alert('Ergebnis eintragen!');return;}
  var parts = exRaw.split('|');
  maxEntries.push({id:new Date().getTime(), date:date, name:parts[0], unit:parts[1], val:val, gender:gender});
  smax();
  document.getElementById('max-val').value='';
  showPercentile(parts[0], val, gender);
  buildMaxList();
  drawMaxChart();
  setTimeout(function(){
    var pb = document.getElementById('percentile-box');
    if(pb && pb.style.display!=='none') pb.scrollIntoView({behavior:'smooth',block:'center'});
  }, 150);
  toast('Max eingetragen!');
  fbSave();
}

function buildMaxList(){
  // Build filters
  var names=['Alle'];
  for(var i=0;i<maxEntries.length;i++){
    var n=maxEntries[i].name;
    var found=false;
    for(var j=0;j<names.length;j++){if(names[j]===n){found=true;break;}}
    if(!found)names.push(n);
  }
  var fel=document.getElementById('max-filters');
  if(fel){
    fel.innerHTML='';
    for(var i=0;i<names.length;i++){
      (function(n){
        var btn=document.createElement('button');
        btn.className='fp'+(n===maxFilter?' on':'');
        btn.textContent=n;
        btn.onclick=function(){maxFilter=n;buildMaxList();};
        fel.appendChild(btn);
      })(names[i]);
    }
  }

  var filtered=[];
  for(var i=0;i<maxEntries.length;i++){
    if(maxFilter==='Alle'||maxEntries[i].name===maxFilter)filtered.push(maxEntries[i]);
  }
  filtered.sort(function(a,b){return a.date<b.date?1:-1;});
  var el=document.getElementById('max-list');
  if(!el)return;
  if(!filtered.length){el.innerHTML='<div class="empty">Noch keine Maxwerte eingetragen.</div>';return;}
  var h='';
  for(var i=0;i<filtered.length;i++){
    var e=filtered[i];
    h+='<div class="ei"><div class="et">';
    h+='<div class="ed">'+e.date.slice(5).replace('-','.')+'</div>';
    h+='<div class="en">'+e.name+'</div>';
    h+='<div style="font-family:inherit;font-size:22px;font-weight:800;color:var(--accent);">'+e.val+' <span style="font-size:11px;font-weight:600;color:var(--muted)">'+e.unit+'</span></div>';
    h+='<button class="edel" aria-label="Eintrag löschen" onclick="delMaxEntry('+e.id+')">&#x2715;</button>';
    h+='</div></div>';
  }
  el.innerHTML=h;
}

function setMaxFilter(idx){}  // handled via event delegation above

function delMaxEntry(id){
  if(!confirm('Eintrag loschen?'))return;
  var n=[];for(var i=0;i<maxEntries.length;i++){if(maxEntries[i].id!==id)n.push(maxEntries[i]);}
  maxEntries=n;smax();buildMaxList();drawMaxChart();
}

function drawMaxChart(){
  var ex=document.getElementById('max-chart-ex').value;
  var data=[];
  for(var i=0;i<maxEntries.length;i++){if(maxEntries[i].name===ex)data.push(maxEntries[i]);}
  data.sort(function(a,b){return a.date>b.date?1:-1;});
  var cv=document.getElementById('max-chart');
  var ce=document.getElementById('max-chart-empty');
  if(!data.length){cv.style.display='none';ce.style.display='block';if(maxChart2){maxChart2.destroy();maxChart2=null;}return;}
  cv.style.display='block';ce.style.display='none';
  var vals=[];var lbls=[];
  for(var i=0;i<data.length;i++){
    var raw=data[i].val;var num=0;
    if(data[i].unit==='Min:Sek'&&raw.indexOf(':')>-1){var pts=raw.split(':');num=parseInt(pts[0],10)*60+parseInt(pts[1],10);}
    else{num=parseFloat(raw)||0;}
    vals.push(num);
    lbls.push(data[i].date.slice(5).replace('-','.'));
  }
  if(maxChart2)maxChart2.destroy();
  maxChart2=new Chart(cv,{
    type:'line',
    data:{labels:lbls,datasets:[{data:vals,borderColor:'#ff5500',backgroundColor:'rgba(255,85,0,0.1)',fill:true,tension:0.4,pointBackgroundColor:'#ff5500',pointRadius:6,borderWidth:2}]},
    options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#555',font:{size:10}},grid:{color:'#1a1a1a'}},y:{ticks:{color:'#555',font:{size:10}},grid:{color:'#1a1a1a'}}}}
  });
}

// ── INIT ──────────────────────────────────────────────────
var activeChallenge = null;
var challengeProgress = 0;


var CHALLENGE_TEMPLATES = [
  {
    id:'t1', icon:'\uD83E\uDDED', title:'Entdecker',
    desc:'Probiere {target} Ubungen aus, die du diese Woche noch nie gemacht hast!',
    calc: function(data){
      return {target:3, metric:'new_exercises_week'};
    }
  },
  {
    id:'t2', icon:'\uD83D\uDD04', title:'Kategorie-Wechsler',
    desc:'Trainiere diese Woche alle 3 Kategorien: Pull, Push UND Core!',
    calc: function(data){
      return {target:3, metric:'categories_this_week'};
    }
  },
  {
    id:'t3', icon:'\uD83D\uDCAA', title:'Satz-Maschine',
    desc:'Schaffe in einem einzigen Workout {target} Satze!',
    calc: function(data){
      var best=0;
      for(var i=0;i<data.ents.length;i++){if(data.ents[i].sets&&data.ents[i].sets.length>best)best=data.ents[i].sets.length;}
      var target=best>0?best+3:8;
      return {target:target, metric:'sets_in_one_workout'};
    }
  },
  {
    id:'t4', icon:'\u23F1', title:'Ausdauer-Held',
    desc:'Halte eine Ubung (Plank, L-Sit oder Hollow Body) fur insgesamt {target} Sekunden diese Woche!',
    calc: function(data){
      return {target:120, metric:'hold_total_week'};
    }
  },
  {
    id:'t5', icon:'\uD83D\uDCC8', title:'Volumen-Rekord',
    desc:'Erziele in einem Workout mehr Wdh als je zuvor — schlage deinen Rekord von {target}!',
    calc: function(data){
      var best=0;
      for(var i=0;i<data.ents.length;i++){
        var total=0;
        for(var k=0;k<data.ents[i].sets.length;k++)total+=parseFloat(data.ents[i].sets[k].n)||0;
        if(total>best)best=total;
      }
      var target=best>0?best+5:30;
      return {target:target, metric:'volume_one_workout'};
    }
  },
  {
    id:'t6', icon:'\uD83C\uDF1F', title:'Skill-Session',
    desc:'Mache diese Woche {target} Skills-Ubungen (Muscle-Up, Handstand, Front Lever, L-Sit)!',
    calc: function(data){
      return {target:3, metric:'skills_this_week'};
    }
  },
  {
    id:'t7', icon:'\uD83D\uDD3C', title:'Klimmzug-Pyramide',
    desc:'Schaffe eine vollstandige Klimmzug-Pyramide: 1-2-3-4-5-4-3-2-1 in einem Workout!',
    calc: function(data){
      return {target:25, metric:'pullup_pyramid'};
    }
  },
  {
    id:'t8', icon:'\uD83C\uDF05', title:'Morgen-Krieger',
    desc:'Mache diese Woche {target} Workouts vor 10 Uhr!',
    calc: function(data){
      return {target:2, metric:'early_workouts'};
    }
  },
  {
    id:'t9', icon:'\u2696\uFE0F', title:'Balance-Woche',
    desc:'Gleiche Anzahl Pull- und Push-Satze diese Woche — mindestens {target} von jedem!',
    calc: function(data){
      return {target:15, metric:'balance_week'};
    }
  },
  {
    id:'t10', icon:'\uD83C\uDFC6', title:'Persoenliche Bestleistung',
    desc:'Schlage deinen Max-Rekord bei einer Ubung deiner Wahl!',
    calc: function(data){
      return {target:1, metric:'new_personal_record'};
    }
  },
];

function generateChallenge(){
  var data = {ents:ents, maxEntries:maxEntries};
  // Pick 3 random templates and score them
  var shuffled = CHALLENGE_TEMPLATES.slice();
  for(var i=shuffled.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var tmp=shuffled[i];shuffled[i]=shuffled[j];shuffled[j]=tmp;
  }
  for(var i=0;i<shuffled.length;i++){
    var result = shuffled[i].calc(data);
    if(result){
      var desc = shuffled[i].desc;
      for(var key in result){
        desc = desc.replace('{'+key+'}', result[key]);
      }
      activeChallenge = {
        id: shuffled[i].id,
        title: shuffled[i].title,
        desc: desc,
        icon: shuffled[i].icon,
        type: shuffled[i].type,
        params: result,
        startDate: new Date().toISOString().slice(0,10),
        progress: 0
      };
      saveChallenges();
      buildChallengeUI();
      return;
    }
  }
}

function saveChallenges(){
  try{localStorage.setItem('cali_challenge', JSON.stringify(activeChallenge));}catch(x){}
}

function loadChallenges(){
  try{
    var c=localStorage.getItem('cali_challenge');
    if(c) activeChallenge=JSON.parse(c);
  }catch(x){}
}

function calcChallengeProgress(){
  if(!activeChallenge) return 0;
  var p = activeChallenge.params;
  var metric = p.metric;
  var now = new Date();
  var weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  var weekStr = weekStart.toISOString().slice(0,10);

  if(metric==='workouts_this_week'){
    var dates={};
    for(var i=0;i<ents.length;i++){if(ents[i].date>=weekStr)dates[ents[i].date]=true;}
    return Object.keys(dates).length;
  }
  if(metric==='volume_exercise'){
    var total=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && ents[i].name===p.exName){
        for(var k=0;k<ents[i].sets.length;k++){total+=parseFloat(ents[i].sets[k].n)||0;}
      }
    }
    return total;
  }
  if(metric==='best_set'){
    var best=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && ents[i].name===p.exName){
        for(var k=0;k<ents[i].sets.length;k++){var v=parseFloat(ents[i].sets[k].n)||0;if(v>best)best=v;}
      }
    }
    return best;
  }
  if(metric==='new_exercise'){
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && ents[i].name===p.exName) return 1;
    }
    return 0;
  }
  if(metric==='category_workouts'){
    var days={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<weekStr) continue;
      for(var k=0;k<EX_DB.length;k++){
        if(EX_DB[k].name===ents[i].name && EX_DB[k].cat===p.catName){
          days[ents[i].date]=true; break;
        }
      }
    }
    return Object.keys(days).length;
  }
  if(metric==='streak_days'){
    var dates2=[];
    for(var i=0;i<ents.length;i++){
      if(dates2.indexOf(ents[i].date)===-1) dates2.push(ents[i].date);
    }
    dates2.sort();
    var streak=1; var maxS=1;
    for(var i=1;i<dates2.length;i++){
      var prev=new Date(dates2[i-1]); var curr=new Date(dates2[i]);
      var diff=(curr-prev)/(1000*60*60*24);
      if(diff===1){streak++;if(streak>maxS)maxS=streak;}else{streak=1;}
    }
    return maxS;
  }
  if(metric==='pyramid_count'){
    var cnt=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && ents[i].name.indexOf('Pyramide')>-1) cnt++;
    }
    return cnt;
  }
  return 0;
}


// ── WAHRUNG SYSTEM ────────────────────────────────────────
var currency = {flames: 0, diamonds: 0};

function loadCurrency(){
  try{var c=localStorage.getItem('cali_currency');if(c)currency=JSON.parse(c);}catch(x){}
}
function saveCurrency(){
  try{localStorage.setItem('cali_currency',JSON.stringify(currency));}catch(x){}
}

// Called when workout ends — earn flames
function earnFlames(workoutDurSecs){
  var earned = 0;
  // 1 flame per 5 minutes of workout
  earned += Math.floor((workoutDurSecs||0) / 300);
  // Bonus for completing challenges
  if(earned < 1) earned = 1; // always at least 1
  currency.flames += earned;
  saveCurrency();
  return earned;
}

// Called when max record beaten — earn diamond
function earnDiamond(){
  currency.diamonds += 1;
  saveCurrency();
}

function skipChallenge(){
  if(currency.diamonds >= 1){
    showSkipModal();
  } else {
    toast('Nicht genug \uD83D\uDC8E Diamanten! Du brauchst 1 Diamant zum Skippen.');
  }
}

function showSkipModal(){
  var ex = document.getElementById('skip-currency-modal');
  if(ex) ex.remove();
  var modal = document.createElement('div');
  modal.id = 'skip-currency-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-end;justify-content:center;padding:16px;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg2);border-radius:20px 20px 16px 16px;padding:24px 20px 32px;width:100%;max-width:480px;';

  var title = document.createElement('div');
  title.style.cssText = 'font-size:18px;font-weight:800;color:var(--text);margin-bottom:6px;';
  title.textContent = 'Challenge skippen?';

  var sub = document.createElement('div');
  sub.style.cssText = 'font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.5;';
  sub.textContent = 'Kostet 1 \uD83D\uDC8E Diamant. Du hast: '+currency.diamonds;

  var canDiamond = currency.diamonds >= 1;
  var btn = document.createElement('button');
  btn.style.cssText = 'width:100%;background:'+(canDiamond?'rgba(56,189,248,0.1)':'var(--bg3)')+';border:1.5px solid '+(canDiamond?'#38BDF8':'var(--border)')+';border-radius:14px;padding:18px;cursor:'+(canDiamond?'pointer':'not-allowed')+';opacity:'+(canDiamond?'1':'0.4')+';font-family:inherit;font-size:15px;font-weight:800;color:'+(canDiamond?'#38BDF8':'var(--muted)')+';margin-bottom:10px;';
  btn.textContent = '\uD83D\uDC8E 1 Diamant — skippen';
  if(canDiamond) btn.onclick = function(){ modal.remove(); currency.diamonds -= 1; saveCurrency(); activeChallenge=null; saveChallenges(); buildChallengeUI(); toast('Challenge geskippt! -1 \uD83D\uDC8E'); };

  var cancel = document.createElement('button');
  cancel.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:14px;font-weight:700;padding:12px;cursor:pointer;';
  cancel.textContent = 'Abbrechen';
  cancel.onclick = function(){ modal.remove(); };

  box.appendChild(title);
  box.appendChild(sub);
  box.appendChild(btn);
  box.appendChild(cancel);
  modal.appendChild(box);
  document.body.appendChild(modal);
}

function getCurrencyDisplay(){
  return '\uD83D\uDD25 '+currency.flames + '  \uD83D\uDC8E '+currency.diamonds;
}

function buildChallengeUI(){
  var streakEl = document.getElementById('ch-streak-val');
  if(streakEl) streakEl.textContent = (streakData && streakData.currentStreak) || 0;
  var pointsEl = document.getElementById('ch-points-val');
  if(pointsEl) pointsEl.textContent = currency.diamonds || 0;
  buildChCards();
  buildStartChallengeWidget();
  buildTrendingChallenges();
}

// ── BUILD 3 CARD PREVIEWS ─────────────────────────────────
function buildChCards(){
  buildChCardPersonal();
  buildChCardPreset();
  buildChCardCommunity();
}

function buildChCardPersonal(){
  var el = document.getElementById('ch-card-personal-inner');
  if(!el) return;
  if(!activeChallenge){
    el.innerHTML =
      '<div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:5px;">Keine aktiv</div>'+
      '<div style="font-size:11px;color:var(--muted);line-height:1.5;">Tippe um eine Challenge zu generieren</div>';
  } else {
    var prog = calcChallengeProgress();
    var target = activeChallenge.params.target || 1;
    var pct = Math.min(100, Math.round((prog/target)*100));
    var done = pct >= 100;
    el.innerHTML =
      '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:12px;padding-right:28px;">'+
        '<div style="font-size:20px;font-weight:800;color:var(--text);line-height:1.3;">'+activeChallenge.title+'</div>'+
        '<div style="width:44px;height:44px;border-radius:50%;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 3h8v5a4 4 0 01-8 0V3z" fill="var(--accent)"/><rect x="11" y="11" width="2" height="4" fill="var(--accent)"/><rect x="8" y="18" width="8" height="2" rx="1" fill="var(--accent)"/><rect x="9" y="15" width="6" height="2" fill="var(--accent)"/></svg></div>'+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">'+
        '<div style="flex:1;background:var(--bg3);border-radius:20px;height:6px;overflow:hidden;">'+
          '<div style="height:100%;border-radius:20px;background:var(--accent);width:'+pct+'%;transition:width 0.5s;"></div>'+
        '</div>'+
        '<div style="font-size:13px;font-weight:800;color:var(--accent);flex-shrink:0;">'+pct+'%</div>'+
      '</div>'+
      '<div style="font-size:11px;color:var(--muted);">'+prog+' / '+target+' · '+pct+'% abgeschlossen'+(done?' &nbsp;<span style="color:var(--accent);font-weight:700;">Geschafft!</span>':'')+'</div>';
  }
}

function buildChCardPreset(){
  var el = document.getElementById('ch-card-preset-inner');
  if(!el) return;
  el.innerHTML =
    '<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:10px;">'+PRESET_CHALLENGES.length+' Challenges</div>'+
    '<div style="display:flex;flex-direction:column;gap:6px;">'+
      PRESET_CHALLENGES.slice(0,3).map(function(c){
        return '<div style="font-size:11px;color:var(--muted);display:flex;align-items:center;gap:7px;">'+
          '<div style="width:5px;height:5px;border-radius:50%;background:#38BDF8;flex-shrink:0;"></div>'+
          c.title+
        '</div>';
      }).join('')+
      '<div style="font-size:11px;color:#bbb;padding-left:12px;">+ '+(PRESET_CHALLENGES.length-3)+' weitere</div>'+
    '</div>';
}

function buildChCardCommunity(){
  var el = document.getElementById('ch-card-community-inner');
  if(!el) return;
  el.innerHTML =
    '<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:8px;">0 Challenges</div>'+
    '<div style="font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:10px;">Von Athleten erstellt & bewertet</div>'+
    '<div id="ch-community-creators" style="display:flex;align-items:center;margin-bottom:10px;min-height:24px;"></div>'+
    '<button onclick="event.stopPropagation();showCommPostModal();" style="background:none;border:1px solid rgba(78,205,196,0.4);color:#4ECDC4;border-radius:20px;font-family:inherit;font-size:11px;font-weight:700;padding:6px 14px;cursor:pointer;">+ Posten</button>';
  if(currentUser){
    db.collection('communityChallenges').get().then(function(snap){
      if(!el) return;
      var titleEl = el.querySelector('div');
      if(titleEl) titleEl.textContent = snap.size + ' Challenges';

      // Top-4 Ersteller nach Gesamt-Likes ihrer Challenges
      var likesByUid = {};
      snap.forEach(function(doc){
        var d = doc.data();
        if(!d.uid) return;
        likesByUid[d.uid] = (likesByUid[d.uid]||0) + (d.likes||[]).length;
      });
      var authors = Object.keys(likesByUid).map(function(uid){ return {uid:uid, likes:likesByUid[uid]}; });
      authors.sort(function(a,b){ return b.likes - a.likes; });
      var top = authors.slice(0,4);
      var overflow = authors.length - top.length;
      var stackEl = document.getElementById('ch-community-creators');
      if(stackEl && top.length){
        renderAvatarStack(stackEl, top.map(function(a){return a.uid;}), 4, overflow);
      }
    }).catch(function(){});
  }
}

// ── TRENDING CHALLENGES ───────────────────────────────────
function trackChallengeView(id){
  if(!currentUser || !id) return;
  db.collection('challengeStats').doc(id).set({
    views: firebase.firestore.FieldValue.increment(1)
  }, {merge:true}).catch(function(){});
}

function trackChallengeParticipant(id){
  if(!currentUser || !id) return;
  db.collection('challengeStats').doc(id).set({
    participantUids: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
  }, {merge:true}).catch(function(){});
}

function buildTrendingChallenges(){
  var el = document.getElementById('ch-trending');
  if(!el) return;
  if(!currentUser){
    el.innerHTML = '<div style="font-size:11px;color:var(--muted);padding:12px 0;">Einloggen um Trending Challenges zu sehen.</div>';
    return;
  }
  el.innerHTML = '<div style="font-size:11px;color:var(--muted);padding:12px 0;">Wird geladen…</div>';

  db.collection('challengeStats').orderBy('views','desc').limit(3).get().then(function(snap){
    if(!el) return;
    if(snap.empty){
      el.innerHTML = '<div style="background:var(--bg2);border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);padding:18px;text-align:center;font-size:12px;color:var(--muted);">Noch keine Trends — probiere Challenges aus, um sie hier zu sehen!</div>';
      return;
    }
    var docs = [];
    snap.forEach(function(d){ docs.push({id:d.id, data:d.data()}); });
    el.innerHTML = '';
    docs.forEach(function(entry){ renderTrendingCard(el, entry.id, entry.data); });
  }).catch(function(){
    el.innerHTML = '';
  });
}

function renderTrendingCard(container, id, stats){
  var meta = null;
  var iconBg = 'linear-gradient(135deg, var(--accent), #FF6B35)';
  var isCommunity = id.indexOf('comm_') === 0;
  var photoUrl = null;
  if(isCommunity){
    iconBg = 'linear-gradient(135deg, #4ECDC4, #38BDF8)';
    photoUrl = '/challenge-handstand.jpg';
  } else {
    for(var i=0;i<PRESET_CHALLENGES.length;i++){
      if(PRESET_CHALLENGES[i].id === id){ meta = PRESET_CHALLENGES[i]; break; }
    }
    if(!meta) return; // stats doc without resolvable metadata — skip silently
    iconBg = 'linear-gradient(135deg, #38BDF8, var(--accent))';
    photoUrl = meta.image || null;
  }

  var participantUids = stats.participantUids || [];
  var views = stats.views || 0;

  var card = document.createElement('div');
  card.style.cssText = 'background:#fff;border-radius:16px;overflow:hidden;flex:0 0 62%;min-width:190px;max-width:220px;box-shadow:0 2px 12px rgba(0,0,0,0.06);';

  var header = document.createElement('div');
  header.style.cssText = photoUrl
    ? 'height:130px;background:#000 url('+photoUrl+') center/cover no-repeat;position:relative;'
    : 'background:'+iconBg+';padding:20px;position:relative;';
  header.innerHTML =
    '<div style="position:absolute;top:10px;left:10px;background:rgba(255,255,255,0.9);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:800;color:var(--text);">🔥 '+views+'</div>'+
    (photoUrl ? '' : '<div style="font-size:40px;text-align:center;">'+(isCommunity ? '🌟' : (meta.icon||'🏆'))+'</div>');
  card.appendChild(header);

  var body = document.createElement('div');
  body.style.cssText = 'padding:14px 16px 16px;';
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:14px;font-weight:800;color:var(--text);margin-bottom:4px;';
  titleEl.textContent = isCommunity ? 'Wird geladen…' : meta.title;
  var descEl = document.createElement('div');
  descEl.style.cssText = 'font-size:11px;color:var(--muted);line-height:1.4;margin-bottom:10px;';
  descEl.textContent = isCommunity ? '' : (meta.desc||'');
  body.appendChild(titleEl);
  body.appendChild(descEl);

  var footer = document.createElement('div');
  footer.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';

  var countEl = document.createElement('div');
  countEl.style.cssText = 'font-size:11px;color:var(--muted);display:flex;align-items:center;gap:5px;';
  countEl.innerHTML = '👥 '+participantUids.length+' Teilnehmer';
  footer.appendChild(countEl);

  var avatarStack = document.createElement('div');
  avatarStack.style.cssText = 'display:flex;align-items:center;';
  footer.appendChild(avatarStack);
  body.appendChild(footer);
  card.appendChild(body);
  container.appendChild(card);

  renderAvatarStack(avatarStack, participantUids);

  if(isCommunity){
    var rawId = id.slice(5);
    db.collection('communityChallenges').doc(rawId).get().then(function(doc){
      if(!doc.exists){ titleEl.textContent = 'Challenge nicht mehr verfügbar'; return; }
      var d = doc.data();
      titleEl.textContent = d.title || 'Community Challenge';
      descEl.textContent = d.desc || '';
    }).catch(function(){ titleEl.textContent = 'Community Challenge'; });
  }
}

function renderAvatarStack(el, uids, maxShown, overflowOverride){
  maxShown = maxShown || 3;
  var shown = uids.slice(0,maxShown);
  var overflow = (typeof overflowOverride === 'number') ? overflowOverride : (uids.length - shown.length);
  el.innerHTML = '';
  shown.forEach(function(uid, i){
    var av = document.createElement('div');
    av.style.cssText = 'width:24px;height:24px;border-radius:50%;background:var(--bg3);border:2px solid #fff;margin-left:'+(i>0?'-8px':'0')+';display:flex;align-items:center;justify-content:center;font-size:11px;overflow:hidden;';
    av.textContent = '💪';
    el.appendChild(av);
    db.collection('users').doc(uid).get().then(function(doc){
      if(!doc.exists) return;
      var pd = doc.data().prData;
      if(pd && pd.avatar){
        av.style.cssText += 'background-image:url('+pd.avatar+');background-size:cover;background-position:center;';
        av.textContent = '';
      }
    }).catch(function(){});
  });
  if(overflow > 0){
    var more = document.createElement('div');
    more.style.cssText = 'width:24px;height:24px;border-radius:50%;background:var(--bg3);border:2px solid #fff;margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--muted);';
    more.textContent = '+'+overflow;
    el.appendChild(more);
  }
}

// ── DRAWER SYSTEM ─────────────────────────────────────────
function openChDrawer(type){
  var existing = document.getElementById('ch-drawer-overlay');
  if(existing) existing.remove();

  var ov = document.createElement('div');
  ov.id = 'ch-drawer-overlay';
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';

  var drawer = document.createElement('div');
  drawer.style.cssText = 'background:var(--bg);border-radius:22px 22px 0 0;width:100%;max-width:480px;max-height:85vh;overflow-y:auto;padding:0 0 40px;border-top:1px solid var(--border);transform:translateY(100%);transition:transform 0.3s cubic-bezier(0.32,0.72,0,1);';

  // Handle bar
  var handle = document.createElement('div');
  handle.style.cssText = 'display:flex;justify-content:center;padding:14px 0 10px;';
  var bar = document.createElement('div');
  bar.style.cssText = 'width:36px;height:4px;background:var(--border);border-radius:4px;';
  handle.appendChild(bar);
  drawer.appendChild(handle);

  // Content area
  var content = document.createElement('div');
  content.style.cssText = 'padding:0 20px;';

  if(type === 'personal'){
    buildDrawerPersonal(content);
  } else if(type === 'preset'){
    buildDrawerPreset(content);
  }

  drawer.appendChild(content);
  ov.appendChild(drawer);
  ov.onclick = function(e){ if(e.target===ov){ closeChDrawer(); } };
  document.body.appendChild(ov);

  // Animate in
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      drawer.style.transform = 'translateY(0)';
    });
  });
}

function closeChDrawer(){
  var ov = document.getElementById('ch-drawer-overlay');
  if(!ov) return;
  var drawer = ov.querySelector('div');
  if(drawer) drawer.style.transform = 'translateY(100%)';
  setTimeout(function(){ if(ov) ov.remove(); }, 300);
  buildChCards(); // refresh card previews
}

// ── PERSONAL DRAWER ───────────────────────────────────────
function buildDrawerPersonal(el){
  var hdr = document.createElement('div');
  hdr.style.cssText = 'font-size:11px;color:var(--accent);font-weight:700;margin-bottom:16px;';
  hdr.textContent = 'Meine Challenge';
  el.appendChild(hdr);

  if(!activeChallenge){
    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.6;text-align:center;padding:12px 0;';
    hint.textContent = 'Noch keine aktive Challenge.';
    var genBtn = document.createElement('button');
    genBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;padding:16px;cursor:pointer;width:100%;margin-bottom:12px;';
    genBtn.textContent = '\uD83C\uDFB2 Challenge generieren';
    genBtn.onclick = function(){ generateChallenge(); closeChDrawer(); setTimeout(function(){ openChDrawer('personal'); }, 350); };
    el.appendChild(hint);
    el.appendChild(genBtn);
  } else {
    var prog = calcChallengeProgress();
    var target = activeChallenge.params.target || 1;
    var pct = Math.min(100, Math.round((prog/target)*100));
    var done = pct >= 100;

    var card = document.createElement('div');
    card.style.cssText = 'background:var(--bg2);border:1px solid '+(done?'var(--accent)':'var(--border)')+';border-radius:16px;padding:18px;margin-bottom:14px;';
    card.innerHTML =
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">'+
        '<div style="font-size:32px;">'+activeChallenge.icon+'</div>'+
        '<div style="flex:1;">'+
          '<div style="font-size:17px;font-weight:800;color:var(--text);">'+activeChallenge.title+'</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-top:3px;line-height:1.5;">'+activeChallenge.desc+'</div>'+
        '</div>'+
        '<div style="font-size:10px;padding:3px 10px;border-radius:20px;background:'+(done?'rgba(255,85,0,0.12)':'rgba(255,255,255,0.05)')+';color:'+(done?'var(--accent)':'#555')+';">'+(done?'Geschafft!':'Aktiv')+'</div>'+
      '</div>'+
      '<div style="background:var(--bg3);border-radius:20px;height:8px;overflow:hidden;margin-bottom:6px;">'+
        '<div style="height:100%;border-radius:20px;background:'+(done?'var(--accent)':'rgba(255,85,0,0.6)')+';width:'+pct+'%;transition:width 0.5s;"></div>'+
      '</div>'+
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);">'+
        '<span>'+prog+' / '+target+'</span><span>'+pct+'%</span>'+
      '</div>';
    el.appendChild(card);

    var newBtn = document.createElement('button');
    newBtn.style.cssText = 'background:var(--bg3);color:var(--muted);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:12px;padding:12px;cursor:pointer;width:100%;margin-bottom:8px;';
    newBtn.textContent = 'Neue Challenge generieren';
    newBtn.onclick = function(){ activeChallenge=null; saveChallenges(); generateChallenge(); closeChDrawer(); setTimeout(function(){ openChDrawer('personal'); }, 350); };
    el.appendChild(newBtn);

    var skipBtn = document.createElement('button');
    skipBtn.style.cssText = 'background:none;color:var(--muted);border:none;font-family:inherit;font-size:11px;padding:8px;cursor:pointer;width:100%;';
    skipBtn.textContent = 'Challenge skippen (\uD83D\uDD25 50 oder \uD83D\uDC8E 1)';
    skipBtn.onclick = function(){ closeChDrawer(); setTimeout(skipChallenge, 300); };
    el.appendChild(skipBtn);
  }
}

// ── PRESET DRAWER ─────────────────────────────────────────
function buildDrawerPreset(el){
  var hdr = document.createElement('div');
  hdr.style.cssText = 'font-size:11px;color:#38BDF8;font-weight:700;margin-bottom:16px;';
  hdr.textContent = 'Voreingestellte Challenges';
  el.appendChild(hdr);

  for(var i=0;i<PRESET_CHALLENGES.length;i++){
    (function(ch){
      var card = document.createElement('div');
      card.style.cssText = 'background:#fff;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:14px 16px;margin-bottom:10px;';
      card.onclick = function(){ trackChallengeView(ch.id); };
      card.innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">'+
          '<span style="font-size:22px;">'+ch.icon+'</span>'+
          '<div style="flex:1;">'+
            '<div style="font-size:14px;font-weight:700;color:var(--text);">'+ch.title+'</div>'+
            '<div style="font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4;">'+ch.desc+'</div>'+
          '</div>'+
        '</div>'+
        '<div style="font-size:11px;color:var(--muted);border-top:1px solid var(--border);padding-top:8px;margin-top:4px;line-height:1.5;font-style:italic;">'+ch.explanation+'</div>';
      var btn = document.createElement('button');
      btn.style.cssText = 'background:rgba(56,189,248,0.08);color:#38BDF8;border:1px solid rgba(56,189,248,0.3);border-radius:8px;font-family:inherit;font-size:12px;font-weight:700;padding:10px;cursor:pointer;width:100%;margin-top:10px;';
      btn.textContent = 'Annehmen';
      btn.onclick = function(){
        activeChallenge = {
          id:ch.id, title:ch.title, desc:ch.desc,
          icon:ch.icon, type:'preset',
          params:{target:ch.target, metric:ch.metric, exName:ch.exName},
          startDate:new Date().toISOString().slice(0,10), progress:0
        };
        saveChallenges(); fbSave();
        trackChallengeParticipant(ch.id);
        closeChDrawer();
        toast(ch.title+' angenommen!');
      };
      card.appendChild(btn);
      el.appendChild(card);
    })(PRESET_CHALLENGES[i]);
  }
}
function togglePlanExpand(card){
  var detail = card.querySelector('.plan-ex-detail');
  var arrow = card.querySelector('.plan-top div:last-child div:last-child');
  if(!detail) return;
  var isOpen = detail.style.display !== 'none';
  detail.style.display = isOpen ? 'none' : 'block';
  if(arrow) arrow.textContent = isOpen ? '›' : '˅';
}

// ── WOCHENPLAN ────────────────────────────────────────────
var WEEK_DAYS = ['Mo','Di','Mi','Do','Fr','Sa','So'];
var WEEK_DAYS_FULL = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];

function getWeekPlan(){
  try{ return JSON.parse(localStorage.getItem('cali_weekplan')||'{}'); }catch(e){ return {}; }
}
function saveWeekPlan(wp){ localStorage.setItem('cali_weekplan', JSON.stringify(wp)); }

function buildWeekPlan(){
  var el = document.getElementById('week-plan-section');
  if(!el) return;
  var wp = getWeekPlan();
  var todayIdx = (new Date().getDay()+6)%7;
  var stats = computeWeekStats(wp);

  el.innerHTML = '';

  buildTodayHeroCard(el, wp, todayIdx);
  buildMonthCalendarCard(el, wp, buildWeekPlan);
  buildWeekSummaryCard(el, stats);
  buildWeekTipCard(el);
}

function computeWeekWorkoutsDone(){
  var dates = getWeekDates();
  var doneDates = {};
  for(var i=0;i<ents.length;i++){ doneDates[ents[i].date] = true; }
  var count = 0;
  dates.forEach(function(d){ if(doneDates[d.toISOString().slice(0,10)]) count++; });
  return count;
}

function buildTodayHeroCard(container, wp, todayIdx){
  var dayPlans = wp[todayIdx] || [];
  var hasWorkout = dayPlans.length > 0;
  var firstPlan = hasWorkout ? getPlanById(dayPlans[0]) : null;
  if(hasWorkout && !firstPlan) hasWorkout = false;

  var today = new Date();
  var dateStr = today.getDate()+'. '+MONTH_NAMES[today.getMonth()]+' '+today.getFullYear();

  var card = document.createElement('div');
  card.style.cssText = 'position:relative;overflow:hidden;background:#fff;border-radius:24px;box-shadow:0 12px 30px rgba(0,0,0,0.06);padding:22px;margin-bottom:20px;border-left:4px solid var(--accent);';

  var deco = document.createElement('div');
  deco.style.cssText = 'position:absolute;right:-6px;bottom:-6px;width:130px;height:130px;opacity:0.07;pointer-events:none;';
  deco.innerHTML = ci(hasWorkout ? 'flex' : 'moon');
  card.appendChild(deco);

  var content = document.createElement('div');
  content.style.cssText = 'position:relative;';

  var eyebrow = document.createElement('div');
  eyebrow.style.cssText = 'font-size:11px;font-weight:700;color:var(--accent);letter-spacing:0.5px;margin-bottom:6px;';
  eyebrow.textContent = 'HEUTE';
  content.appendChild(eyebrow);

  var dateRow = document.createElement('div');
  dateRow.style.cssText = 'font-size:19px;font-weight:700;color:var(--text);margin-bottom:14px;';
  dateRow.textContent = WEEK_DAYS_FULL[todayIdx]+' • '+dateStr;
  content.appendChild(dateRow);

  var statusRow = document.createElement('div');
  statusRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';
  statusRow.innerHTML = '<span style="display:inline-flex;width:22px;height:22px;vertical-align:middle;">'+ci(hasWorkout?'flex':'moon')+'</span>'+
    '<span style="font-size:16px;font-weight:700;color:var(--text);">'+(hasWorkout?firstPlan.name:'Ruhetag')+'</span>';
  content.appendChild(statusRow);

  var tipRow = document.createElement('div');
  tipRow.style.cssText = 'font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:16px;max-width:80%;';
  tipRow.textContent = hasWorkout
    ? (firstPlan.exercises.length+' Übungen warten auf dich. Bleib fokussiert und achte auf saubere Technik.')
    : 'Nutze heute die Zeit für Regeneration und Mobility.';
  content.appendChild(tipRow);

  var editBtn = document.createElement('button');
  editBtn.className = 'pk-btn';
  editBtn.style.cssText = 'background:'+(hasWorkout?'var(--accent)':'#fff')+';color:'+(hasWorkout?'#fff':'var(--text)')+';border:'+(hasWorkout?'none':'1.5px solid var(--border)')+';border-radius:14px;font-family:inherit;font-size:12.5px;font-weight:700;padding:11px 18px;cursor:pointer;';
  editBtn.innerHTML = hasWorkout ? '▶ Workout starten' : '✎ Plan bearbeiten';
  editBtn.onclick = function(){
    if(hasWorkout){ startWorkout(firstPlan.id); }
    else { openDayEditor(todayIdx, null); }
  };
  content.appendChild(editBtn);

  card.appendChild(content);
  container.appendChild(card);
}

var weekCalMonthOffset = 0;
var MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var WEEK_TIPS = [
  'Konsistenz schlägt Intensität. Bleib dran und vertraue dem Prozess.',
  'Kleine Fortschritte jeden Tag ergeben große Ergebnisse.',
  'Regeneration ist Teil des Trainings, nicht die Pause davon.',
  'Technik vor Tempo — saubere Wiederholungen zählen mehr.',
  'Dein zukünftiges Ich dankt dir für das heutige Workout.'
];

function openDayListModal(focusIdx){
  var ex = document.getElementById('week-cal-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'week-cal-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);flex-shrink:0;';
  backBtn.innerHTML = '← Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;font-size:16px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  titleEl.textContent = '📅 Wochenplan';
  var newPlanBtn = document.createElement('button');
  newPlanBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:9px 12px;cursor:pointer;flex-shrink:0;white-space:nowrap;';
  newPlanBtn.textContent = '+ Neuer Plan';
  newPlanBtn.onclick = function(){ ov.remove(); goPage('p'); showPlanForm(); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(newPlanBtn);
  ov.appendChild(topBar);

  // Scrollable content
  var scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
  ov.appendChild(scroll);
  document.body.appendChild(ov);

  renderDayList(scroll, focusIdx);
}

function getWeekDates(){
  var today = new Date();
  var todayIdx = (today.getDay()+6)%7;
  var monday = new Date(today);
  monday.setDate(today.getDate()-todayIdx);
  var dates = [];
  for(var i=0;i<7;i++){
    var d = new Date(monday);
    d.setDate(monday.getDate()+i);
    dates.push(d);
  }
  return dates;
}
function formatDayDate(d){
  var months = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
  return (d.getDate()<10?'0':'')+d.getDate()+'. '+months[d.getMonth()];
}

function computeWeekStats(wp){
  var workouts=0, restDays=0, totalEx=0;
  for(var i=0;i<7;i++){
    var dp = wp[i]||[];
    if(dp.length===0){ restDays++; }
    else {
      workouts++;
      dp.forEach(function(pid){ var p=getPlanById(pid); if(p) totalEx += p.exercises.length; });
    }
  }
  return {workouts:workouts, restDays:restDays, totalEx:totalEx};
}

function getWeekTip(){
  var dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  return WEEK_TIPS[dayOfYear % WEEK_TIPS.length];
}

function renderDayList(scroll, focusIdx){
  scroll.innerHTML = '';
  var wp = getWeekPlan();
  var todayIdx = (new Date().getDay()+6)%7;
  var weekDates = getWeekDates();
  var stats = computeWeekStats(wp);

  var left = document.createElement('div');

  // Stats bar
  var statsBar = document.createElement('div');
  statsBar.style.cssText = 'display:flex;gap:8px;background:var(--bg2);border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);padding:12px;margin-bottom:12px;flex-wrap:wrap;';
  [
    {icon:'flex', val:stats.workouts, label:'Workouts'},
    {icon:'moon', val:stats.restDays, label:'Ruhetage'},
    {icon:'flame', val:stats.totalEx, label:'Übungen'}
  ].forEach(function(s){
    var pill = document.createElement('div');
    pill.style.cssText = 'flex:1;min-width:90px;display:flex;align-items:center;gap:8px;';
    pill.innerHTML = '<div style="width:20px;height:20px;">'+ci(s.icon)+'</div><div><div style="font-size:16px;font-weight:800;color:var(--text);line-height:1.1;">'+s.val+'</div><div style="font-size:10px;color:var(--muted);">'+s.label+'</div></div>';
    statsBar.appendChild(pill);
  });
  left.appendChild(statsBar);

  // Day list
  WEEK_DAYS_FULL.forEach(function(dayName, i){
    var dayPlans = wp[i] || [];
    var isToday = i === todayIdx;
    var hasWorkout = dayPlans.length > 0;
    var firstPlan = hasWorkout ? getPlanById(dayPlans[0]) : null;
    if(hasWorkout && !firstPlan) hasWorkout = false;

    var dayBlock = document.createElement('div');
    dayBlock.style.cssText = 'margin-bottom:8px;border-radius:16px;overflow:hidden;background:var(--bg2);'+(isToday?'border:1.5px solid var(--accent);':'border:1px solid var(--border);');

    var expanded = i === focusIdx;

    var chevron = document.createElement('div');
    chevron.style.cssText = 'font-size:13px;color:var(--muted);flex-shrink:0;transition:transform 0.15s;transform:rotate('+(expanded?'180':'0')+'deg);';
    chevron.textContent = '⌄';

    var dayHdr = document.createElement('div');
    dayHdr.style.cssText = 'display:flex;align-items:center;gap:10px;padding:11px 12px;cursor:pointer;';
    dayHdr.innerHTML =
      iconWrap(hasWorkout?'flex':'moon',{size:16,box:34,radius:10,bg:hasWorkout?'rgba(255,85,0,0.12)':'rgba(150,150,150,0.15)'})+
      '<div style="flex-shrink:0;width:44px;">'+
        '<div style="font-size:10px;font-weight:800;color:'+(isToday?'var(--accent)':'var(--muted)')+';">'+WEEK_DAYS[i].toUpperCase()+'</div>'+
        '<div style="font-size:10px;color:var(--muted);">'+formatDayDate(weekDates[i])+'</div>'+
      '</div>'+
      '<div style="flex:1;min-width:0;">'+
        '<div style="display:flex;align-items:center;gap:6px;">'+
          '<div style="font-size:14px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(hasWorkout?firstPlan.name:'Ruhetag')+'</div>'+
          (isToday?'<div style="font-size:8px;background:var(--accent);color:#fff;padding:2px 7px;border-radius:20px;font-weight:700;flex-shrink:0;">Heute</div>':'')+
        '</div>'+
        '<div style="font-size:11px;color:var(--muted);">'+(hasWorkout?(firstPlan.exercises.length+' Übungen'+(dayPlans.length>1?' • +'+(dayPlans.length-1)+' weitere':'')):'Aktive Erholung')+'</div>'+
      '</div>';
    dayHdr.appendChild(chevron);
    dayBlock.appendChild(dayHdr);

    var detailWrap = document.createElement('div');
    detailWrap.style.cssText = 'display:'+(expanded?'block':'none')+';padding:0 12px 12px;';

    function renderDetail(){
      detailWrap.innerHTML = '';
      if(hasWorkout){
        var exScroll = document.createElement('div');
        exScroll.style.cssText = 'display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:10px;';
        firstPlan.exercises.slice(0,3).forEach(function(ex){
          var chip = document.createElement('div');
          chip.style.cssText = 'flex-shrink:0;width:118px;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:8px;';
          var col = (typeof COLS!=='undefined' && COLS[ex.col]) || 'var(--accent)';
          chip.innerHTML = '<div style="width:22px;height:22px;border-radius:7px;background:'+col+';margin-bottom:6px;"></div>'+
            '<div style="font-size:11px;font-weight:700;color:var(--text);line-height:1.2;margin-bottom:2px;">'+ex.name+'</div>'+
            '<div style="font-size:10px;color:var(--muted);">'+ex.sets.length+' Sätze'+(ex.sets[0]?' • '+ex.sets[0].n+' '+ex.unit:'')+'</div>';
          exScroll.appendChild(chip);
        });
        if(firstPlan.exercises.length > 3){
          var moreChip = document.createElement('div');
          moreChip.style.cssText = 'flex-shrink:0;width:90px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--accent);font-weight:700;text-align:center;';
          moreChip.textContent = '+'+(firstPlan.exercises.length-3)+' weitere ›';
          exScroll.appendChild(moreChip);
        }
        detailWrap.appendChild(exScroll);

        var startBtn = document.createElement('button');
        startBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:11px;cursor:pointer;margin-bottom:8px;';
        startBtn.textContent = '▶ Workout starten';
        startBtn.onclick = function(e){ e.stopPropagation(); startWorkout(firstPlan.id); document.getElementById('week-cal-ov').remove(); };
        detailWrap.appendChild(startBtn);
      } else {
        var tipBox = document.createElement('div');
        tipBox.style.cssText = 'background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:8px;';
        tipBox.innerHTML = '<div style="font-size:11px;font-weight:800;color:var(--accent);margin-bottom:4px;">☀️ Tipp für heute</div>'+
          '<div style="font-size:12px;color:var(--text);line-height:1.5;">Nutze den Tag für Mobilität, Stretching oder einen Spaziergang.</div>';
        detailWrap.appendChild(tipBox);
      }

      var editBtn = document.createElement('button');
      editBtn.style.cssText = 'width:100%;background:none;border:1px solid var(--border);color:var(--muted);border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:9px;cursor:pointer;';
      editBtn.textContent = hasWorkout ? '✎ Plan bearbeiten' : '+ Plan hinzufügen';
      editBtn.onclick = function(e){ e.stopPropagation(); openDayEditor(i, scroll); };
      detailWrap.appendChild(editBtn);
    }
    renderDetail();
    dayBlock.appendChild(detailWrap);

    dayHdr.onclick = function(){
      expanded = !expanded;
      detailWrap.style.display = expanded ? 'block' : 'none';
      chevron.style.transform = 'rotate('+(expanded?'180':'0')+'deg)';
    };

    left.appendChild(dayBlock);
  });

  scroll.appendChild(left);
}

var weekCalExpandedDay = null; // 0-6 oder null — welcher Wochentag ist inline aufgeklappt

function buildMonthCalendarCard(container, wp, rerenderFn){
  var now = new Date();
  var viewDate = new Date(now.getFullYear(), now.getMonth()+weekCalMonthOffset, 1);
  var year = viewDate.getFullYear(), month = viewDate.getMonth();
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var startOffset = (new Date(year, month, 1).getDay()+6)%7;
  var prevMonthDays = new Date(year, month, 0).getDate();

  var card = document.createElement('div');
  card.style.cssText = 'background:#fff;border-radius:24px;box-shadow:0 12px 30px rgba(0,0,0,0.06);padding:20px;margin-bottom:20px;';

  var sectionTitleRow = document.createElement('div');
  sectionTitleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;';
  var sectionTitle = document.createElement('div');
  sectionTitle.style.cssText = 'font-size:15px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:8px;';
  sectionTitle.innerHTML = '📅 Wochenplan';
  sectionTitleRow.appendChild(sectionTitle);
  var fullWeekBtn = document.createElement('button');
  fullWeekBtn.style.cssText = 'background:none;border:none;color:var(--accent);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;';
  fullWeekBtn.innerHTML = 'Ganze Woche →';
  fullWeekBtn.onclick = function(){ openDayListModal((new Date().getDay()+6)%7); };
  sectionTitleRow.appendChild(fullWeekBtn);
  card.appendChild(sectionTitleRow);

  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;';
  var prevBtn = document.createElement('button');
  prevBtn.style.cssText = 'background:var(--bg3);border:none;border-radius:12px;font-size:16px;color:var(--text);cursor:pointer;width:36px;height:36px;';
  prevBtn.textContent = '←';
  prevBtn.setAttribute('aria-label', 'Vorheriger Monat');
  prevBtn.onclick = function(){ weekCalMonthOffset--; rerenderFn(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:16px;font-weight:700;color:var(--text);';
  titleEl.textContent = MONTH_NAMES[month]+' '+year;
  var nextBtn = document.createElement('button');
  nextBtn.style.cssText = 'background:var(--bg3);border:none;border-radius:12px;font-size:16px;color:var(--text);cursor:pointer;width:36px;height:36px;';
  nextBtn.textContent = '→';
  nextBtn.setAttribute('aria-label', 'Nächster Monat');
  nextBtn.onclick = function(){ weekCalMonthOffset++; rerenderFn(); };
  hdr.appendChild(prevBtn); hdr.appendChild(titleEl); hdr.appendChild(nextBtn);
  card.appendChild(hdr);

  var weekHdrRow = document.createElement('div');
  weekHdrRow.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:10px;';
  WEEK_DAYS.forEach(function(d){
    var c = document.createElement('div');
    c.style.cssText = 'text-align:center;font-size:10px;font-weight:700;color:var(--muted);';
    c.textContent = d.toUpperCase();
    weekHdrRow.appendChild(c);
  });
  card.appendChild(weekHdrRow);

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:16px;';

  var totalCells = startOffset + daysInMonth;
  var trailingCells = (7 - (totalCells % 7)) % 7;
  var totalGridCells = totalCells + trailingCells;

  for(var c=0;c<totalGridCells;c++){
    var dateNum, inMonth;
    if(c < startOffset){ dateNum = prevMonthDays - startOffset + c + 1; inMonth = false; }
    else if(c < totalCells){ dateNum = c - startOffset + 1; inMonth = true; }
    else { dateNum = c - totalCells + 1; inMonth = false; }
    var dowIdx = c % 7;

    var isRealToday = inMonth && weekCalMonthOffset===0 && dateNum === now.getDate();
    var dayPlans = wp[dowIdx] || [];
    var hasW = dayPlans.length > 0;
    var isSkillDay = hasW && dayPlans.some(function(pid){ var p=getPlanById(pid); return p && /skill/i.test(p.name); });

    var cell = document.createElement('div');
    cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:6px 0;border-radius:12px;'+(inMonth?'cursor:pointer;':'')+(weekCalExpandedDay===dowIdx && inMonth?'background:rgba(255,85,0,0.08);':'');
    if(inMonth){
      cell.onclick = function(dIdx){ return function(){ weekCalExpandedDay = (weekCalExpandedDay===dIdx) ? null : dIdx; rerenderFn(); }; }(dowIdx);
    }

    var numEl = document.createElement('div');
    numEl.style.cssText = 'width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:'+(isRealToday?'700':'600')+';'+
      (isRealToday ? 'background:var(--accent);color:#fff;' : 'color:'+(inMonth?'var(--text)':'var(--muted)')+';opacity:'+(inMonth?'1':'0.4')+';');
    numEl.textContent = dateNum;
    cell.appendChild(numEl);

    var marker = document.createElement('div');
    marker.style.cssText = 'margin-top:4px;opacity:'+(inMonth?(hasW?'1':'0.5'):'0.25')+';';
    if(isSkillDay){
      marker.style.fontSize = '9px';
      marker.style.color = 'var(--accent)';
      marker.textContent = '★';
    } else {
      marker.style.cssText += 'width:5px;height:5px;border-radius:50%;background:'+(hasW?'var(--accent)':'var(--muted)')+';';
    }
    cell.appendChild(marker);

    grid.appendChild(cell);
  }
  card.appendChild(grid);

  var legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;padding-top:12px;border-top:1px solid var(--border);margin-bottom:'+(weekCalExpandedDay!=null?'14px':'0')+';';
  [{icon:'●',c:'var(--accent)',l:'Workout'},{icon:'★',c:'var(--accent)',l:'Skill'},{icon:'●',c:'var(--muted)',l:'Ruhetag'}].forEach(function(li){
    var item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:5px;font-size:10.5px;color:var(--muted);';
    item.innerHTML = '<span style="color:'+li.c+';font-size:9px;">'+li.icon+'</span>'+li.l;
    legend.appendChild(item);
  });
  card.appendChild(legend);

  var detailPanel = document.createElement('div');
  detailPanel.style.cssText = 'overflow:hidden;max-height:'+(weekCalExpandedDay!=null?'400px':'0')+';opacity:'+(weekCalExpandedDay!=null?'1':'0')+';transition:max-height 0.2s ease,opacity 0.2s ease;';
  if(weekCalExpandedDay!=null){
    buildInlineDayDetail(detailPanel, weekCalExpandedDay, wp);
  }
  card.appendChild(detailPanel);

  container.appendChild(card);
}

function buildInlineDayDetail(container, dayIdx, wp){
  var dayPlans = wp[dayIdx] || [];
  var hasWorkout = dayPlans.length > 0;
  var firstPlan = hasWorkout ? getPlanById(dayPlans[0]) : null;
  if(hasWorkout && !firstPlan) hasWorkout = false;

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg3);border-radius:16px;padding:16px;';

  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:12px;';
  hdr.innerHTML = '<span style="display:inline-flex;width:18px;height:18px;vertical-align:middle;">'+ci(hasWorkout?'flex':'moon')+'</span>'+
    '<span style="font-size:14px;font-weight:700;color:var(--text);">'+WEEK_DAYS_FULL[dayIdx]+'</span>'+
    '<span style="font-size:13px;color:var(--muted);">— '+(hasWorkout?firstPlan.name:'Ruhetag')+'</span>';
  box.appendChild(hdr);

  if(hasWorkout){
    var meta = document.createElement('div');
    meta.style.cssText = 'font-size:12px;color:var(--muted);margin-bottom:12px;';
    meta.textContent = firstPlan.exercises.length+' Übungen'+(dayPlans.length>1?' • +'+(dayPlans.length-1)+' weitere':'');
    box.appendChild(meta);

    var startBtn = document.createElement('button');
    startBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:700;padding:11px;cursor:pointer;margin-bottom:8px;';
    startBtn.innerHTML = '▶ Workout starten';
    startBtn.onclick = function(){ startWorkout(firstPlan.id); };
    box.appendChild(startBtn);
  }

  var editBtn = document.createElement('button');
  editBtn.style.cssText = 'width:100%;background:#fff;border:none;border-radius:12px;color:var(--muted);font-family:inherit;font-size:12px;font-weight:700;padding:10px;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.05);';
  editBtn.innerHTML = hasWorkout ? '✎ Plan bearbeiten' : '+ Plan hinzufügen';
  editBtn.onclick = function(){ openDayEditor(dayIdx, null); };
  box.appendChild(editBtn);

  container.appendChild(box);
}

function buildWeekSummaryCard(container, stats){
  var goal = (typeof streakData !== 'undefined' && streakData.weeklyGoal) ? streakData.weeklyGoal : 3;
  var done = computeWeekWorkoutsDone();
  var pct = Math.min(100, Math.round((done/goal)*100));

  var card = document.createElement('div');
  card.style.cssText = 'background:#fff;border-radius:24px;box-shadow:0 12px 30px rgba(0,0,0,0.06);padding:20px;margin-bottom:20px;';

  var title = document.createElement('div');
  title.style.cssText = 'font-size:15px;font-weight:700;color:var(--text);margin-bottom:14px;display:flex;align-items:center;gap:8px;';
  title.innerHTML = '📊 Diese Woche';
  card.appendChild(title);

  var progLbl = document.createElement('div');
  progLbl.style.cssText = 'display:flex;align-items:center;justify-content:space-between;font-size:11.5px;color:var(--muted);margin-bottom:8px;';
  progLbl.innerHTML = '<span>Fortschritt</span><span style="font-weight:700;color:var(--text);">'+done+' / '+goal+' Workouts &middot; '+pct+'%</span>';
  card.appendChild(progLbl);

  var track = document.createElement('div');
  track.style.cssText = 'height:8px;background:var(--bg3);border-radius:8px;overflow:hidden;margin-bottom:18px;';
  var bar = document.createElement('div');
  bar.style.cssText = 'height:100%;width:'+pct+'%;background:var(--accent);border-radius:8px;transition:width 0.3s ease;';
  track.appendChild(bar);
  card.appendChild(track);

  var tileRow = document.createElement('div');
  tileRow.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;';
  [
    {icon:'flex', val:stats.workouts, label:'Workout'+(stats.workouts===1?'':'s')},
    {icon:'moon', val:stats.restDays, label:'Ruhetage'},
    {icon:'flame', val:stats.totalEx, label:'Übungen'}
  ].forEach(function(s){
    var tile = document.createElement('div');
    tile.style.cssText = 'background:var(--bg3);border-radius:16px;padding:14px 8px;text-align:center;';
    tile.innerHTML = '<div style="width:36px;height:36px;border-radius:12px;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;"><div style="width:16px;height:16px;">'+ci(s.icon)+'</div></div>'+
      '<div style="font-size:18px;font-weight:700;color:var(--text);">'+s.val+'</div>'+
      '<div style="font-size:10px;color:var(--muted);margin-top:2px;">'+s.label+'</div>';
    tileRow.appendChild(tile);
  });
  card.appendChild(tileRow);

  container.appendChild(card);
}

var weekTipIdx = null;

function buildWeekTipCard(container){
  if(weekTipIdx === null){
    var dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000);
    weekTipIdx = dayOfYear % WEEK_TIPS.length;
  }
  var card = document.createElement('div');
  card.style.cssText = 'display:flex;align-items:center;gap:14px;background:rgba(255,85,0,0.07);border-radius:20px;padding:16px 18px;margin-bottom:20px;';

  var tipIconWrap = document.createElement('div');
  tipIconWrap.style.cssText = 'width:22px;height:22px;flex-shrink:0;';
  tipIconWrap.innerHTML = ci('lightbulb');
  card.appendChild(tipIconWrap);

  var textWrap = document.createElement('div');
  textWrap.style.cssText = 'flex:1;min-width:0;';
  textWrap.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:2px;">Tipp der Woche</div>'+
    '<div style="font-size:12.5px;color:var(--text);line-height:1.5;">'+WEEK_TIPS[weekTipIdx]+'</div>';
  card.appendChild(textWrap);

  var moreBtn = document.createElement('button');
  moreBtn.style.cssText = 'background:none;border:none;color:var(--accent);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;';
  moreBtn.innerHTML = 'Mehr Tipps →';
  moreBtn.onclick = function(){ weekTipIdx = (weekTipIdx+1) % WEEK_TIPS.length; buildWeekPlan(); };
  card.appendChild(moreBtn);

  container.appendChild(card);
}

function getPlanById(id){
  for(var i=0;i<plans.length;i++){ if(plans[i].id===id) return plans[i]; }
  for(var i=0;i<PRESET_PLANS.length;i++){ if('preset_'+i===id) return {id:'preset_'+i, name:PRESET_PLANS[i].name, exercises:PRESET_PLANS[i].exercises}; }
  return null;
}

function openDayEditor(dayIdx, calScroll){
  var wp = getWeekPlan();
  var dayPlans = wp[dayIdx] || [];

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:20px 20px 40px;max-height:80vh;overflow-y:auto;';

  function renderBox(){
    box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 16px;"></div>'+
      '<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:4px;">📅 '+WEEK_DAYS_FULL[dayIdx]+'</div>'+
      '<div style="font-size:11px;color:var(--muted);margin-bottom:14px;">Pläne für diesen Tag</div>';

    // Assigned plans
    if(dayPlans.length === 0){
      var emptyEl = document.createElement('div');
      emptyEl.style.cssText = 'text-align:center;padding:16px;color:var(--muted);font-size:12px;margin-bottom:12px;';
      emptyEl.innerHTML = '😴 Ruhetag — kein Plan zugewiesen';
      box.appendChild(emptyEl);
    } else {
      dayPlans.forEach(function(planId, i){
        var plan = getPlanById(planId);
        if(!plan) return;
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg2);border-radius:10px;margin-bottom:8px;border:1px solid var(--border);';
        row.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--text);">'+plan.name+'</div>';
        var delBtn = document.createElement('button');
        delBtn.style.cssText = 'background:rgba(255,50,50,0.1);color:#ff4444;border:1px solid rgba(255,50,50,0.2);border-radius:6px;font-size:11px;padding:5px 10px;cursor:pointer;font-family:inherit;';
        delBtn.textContent = '× Entfernen';
        delBtn.onclick = function(){
          dayPlans.splice(i,1);
          wp[dayIdx] = dayPlans;
          saveWeekPlan(wp);
          renderBox();
          buildWeekPlan();
          if(calScroll) renderDayList(calScroll, dayIdx);
        };
        row.appendChild(delBtn);
        box.appendChild(row);
      });
    }

    // Add plan dropdown
    var addLabel = document.createElement('div');
    addLabel.style.cssText = 'font-size:11px;color:var(--muted);font-weight:700;margin-bottom:8px;margin-top:4px;';
    addLabel.textContent = 'Plan hinzufügen';
    box.appendChild(addLabel);

    var sel = document.createElement('select');
    sel.style.cssText = 'width:100%;padding:12px;border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:var(--bg2);color:var(--text);margin-bottom:10px;box-sizing:border-box;';
    var defOpt = document.createElement('option'); defOpt.value=''; defOpt.textContent='— Plan auswählen —'; sel.appendChild(defOpt);

    // My plans
    plans.forEach(function(pl){
      var opt = document.createElement('option'); opt.value=pl.id; opt.textContent=pl.name;
      sel.appendChild(opt);
    });
    // Presets
    PRESET_PLANS.forEach(function(pl, i){
      var opt = document.createElement('option'); opt.value='preset_'+i; opt.textContent=pl.name+' (Vorlage)';
      sel.appendChild(opt);
    });
    box.appendChild(sel);

    var addBtn = document.createElement('button');
    addBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:13px;cursor:pointer;margin-bottom:12px;';
    addBtn.textContent = '+ Hinzufügen';
    addBtn.onclick = function(){
      if(!sel.value) return;
      dayPlans.push(sel.value);
      wp[dayIdx] = dayPlans;
      saveWeekPlan(wp);
      renderBox();
      buildWeekPlan();
      if(calScroll) renderDayList(calScroll, dayIdx);
    };
    box.appendChild(addBtn);

    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:8px;cursor:pointer;';
    closeBtn.textContent = 'Schließen';
    closeBtn.onclick = function(){ ov.remove(); };
    box.appendChild(closeBtn);
  }

  renderBox();
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
}
