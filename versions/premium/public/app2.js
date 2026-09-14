
// ── SHARED SHEET / CELEBRATION HELPERS ────────────────────
// Gegenstück zu caliMotion.sheetIn: Sheet nach unten ausfahren, Backdrop
// ausblenden, danach Overlay entfernen. Fällt auf sofortiges remove zurück.
function sheetOut(ov, box){
  if(!ov) return;
  if(box && box.classList && box.classList.contains('sheet-in')){
    box.classList.remove('sheet-in');
    if(ov.classList) ov.classList.remove('backdrop-in');
    setTimeout(function(){ if(ov.parentNode) ov.remove(); }, 400);
  } else {
    ov.remove();
  }
}

// Ersetzt browser confirm() durch das Blingbling-Bottom-Sheet-Muster.
function confirmSheet(opts){
  opts = opts || {};
  var old = document.getElementById('cali-confirm-sheet');
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'cali-confirm-sheet';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2600;display:flex;align-items:flex-end;justify-content:center;padding:16px;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg2);border-radius:20px;padding:24px 20px 20px;width:100%;max-width:480px;';
  var title = document.createElement('div');
  title.style.cssText = 'font-size:17px;font-weight:700;color:var(--text);margin-bottom:6px;';
  title.textContent = opts.title || 'Bist du sicher?';
  box.appendChild(title);
  if(opts.desc){
    var sub = document.createElement('div');
    sub.style.cssText = 'font-size:13px;color:var(--muted);margin-bottom:18px;';
    sub.textContent = opts.desc;
    box.appendChild(sub);
  }
  var okBtn = document.createElement('button');
  okBtn.className = 'pressable';
  okBtn.style.cssText = 'width:100%;background:'+(opts.danger===false?'var(--accent-deep)':'var(--red)')+';color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:14px;cursor:pointer;margin-bottom:4px;transition:transform var(--dur-fast) var(--ease-out);';
  okBtn.textContent = opts.confirmLabel || 'Bestätigen';
  okBtn.onclick = function(){ sheetOut(ov, box); if(typeof opts.onConfirm==='function') opts.onConfirm(); };
  box.appendChild(okBtn);
  var cancelBtn = document.createElement('button');
  cancelBtn.className = 'pressable';
  cancelBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;font-weight:700;padding:12px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
  cancelBtn.textContent = opts.cancelLabel || 'Abbrechen';
  cancelBtn.onclick = function(){ sheetOut(ov, box); };
  box.appendChild(cancelBtn);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) sheetOut(ov, box); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}

// Vollbild-Feiermoment (PR geknackt, Challenge geschafft) — Muster wie showLevelUpAnimation.
function showCelebrationOverlay(opts){
  opts = opts || {};
  var old = document.getElementById('cali-celebrate-ov');
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'cali-celebrate-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:2600;display:flex;align-items:center;justify-content:center;cursor:pointer;';
  ov.innerHTML =
    '<div style="text-align:center;padding:0 24px;">'+
      (opts.icon?'<div style="font-size:56px;margin-bottom:10px;">'+opts.icon+'</div>':'')+
      '<div style="font-size:16px;font-weight:800;color:var(--accent);margin-bottom:8px;">'+(opts.title||'')+'</div>'+
      (opts.big?'<div class="num" style="font-size:44px;font-weight:800;color:#fff;line-height:1.1;margin-bottom:6px;">'+opts.big+'</div>':'')+
      (opts.sub?'<div style="font-size:13px;color:rgba(255,255,255,0.75);">'+opts.sub+'</div>':'')+
      (opts.note?'<div style="font-size:15px;font-weight:800;color:#ffd700;margin-top:10px;">'+opts.note+'</div>':'')+
      '<div style="font-size:12px;color:rgba(255,255,255,0.5);margin-top:16px;">Tippen um fortzufahren</div>'+
    '</div>';
  ov.onclick = function(){ ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion){
    caliMotion.overlayIn(ov.firstChild);
    caliMotion.celebrate('burst');
  }
  setTimeout(function(){ if(ov.parentNode) ov.remove(); }, 4000);
}

// Startet einen Plan egal ob eigener Plan (numerische id) oder Vorlage ('preset_N').
// Behebt: Vorlagen aus dem Wochenplan starteten ein LEERES Workout.
function startPlanById(id){
  if(typeof id==='string' && id.indexOf('preset_')===0){
    var idx = parseInt(id.slice(7),10);
    if(!isNaN(idx) && typeof PRESET_PLANS!=='undefined' && PRESET_PLANS[idx]){
      goPage('e');
      startPreset(idx);
      return;
    }
  }
  var nid = id;
  if(typeof id==='string' && id!=='' && !isNaN(parseInt(id,10))) nid = parseInt(id,10);
  goPage('e');
  startWorkout(nid);
}

// 'Min:Sek' → Sekunden, sonst parseFloat.
function parseMaxVal(raw, unit){
  if(unit==='Min:Sek' && String(raw).indexOf(':')>-1){
    var pts = String(raw).split(':');
    return (parseInt(pts[0],10)||0)*60 + (parseInt(pts[1],10)||0);
  }
  return parseFloat(raw)||0;
}

function cancelPlanForm(){
  document.getElementById('plan-form').style.display='none';
  document.getElementById('plan-list').style.display='block';
  buildPlanList();
}

function pfExChanged(){
  var v=document.getElementById('pf-ex').value;
  var u=v.split('|')[1];
  document.getElementById('pf-lbl-n').textContent=u==='Sek'?'Sekunden (Ziel)':u==='Min:Sek'?'Min:Sek (Ziel)':'Wdh. (Ziel)';
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
  // Satznummern als TEXT → Ink-Varianten (Kontrast), wie app1.js buildSets/buildPlanBlocks
  var ca=['var(--accent-ink)','var(--amber-ink)','var(--teal-ink)','var(--purple-ink)'];
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
  if(!selPfEx){toast('Bitte zuerst eine Übung auswählen');return;}
  var ok=[];
  for(var i=0;i<pfSets.length;i++){if(pfSets[i].n.trim()!=='')ok.push({n:pfSets[i].n});}
  if(!ok.length){toast('Mindestens einen Satz mit Ziel eintragen');return;}
  pfExercises.push({name:selPfEx.name,unit:selPfEx.unit,col:selPfEx.col,band:selPfEx.band===1,sets:ok});
  buildPfExList();
  pfSets=[];pfAddSet();
  toast(selPfEx.name+' hinzugefügt!');
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
  var nameInp=document.getElementById('pf-name');
  var name=nameInp.value.trim();
  if(!name){toast('Gib dem Plan einen Namen');nameInp.focus();return;}
  if(!pfExercises.length){toast('Mindestens eine Übung hinzufügen');return;}
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
  confirmSheet({
    title:'Plan löschen?',
    desc:'Der Plan wird dauerhaft entfernt.',
    confirmLabel:'Löschen',
    onConfirm:function(){
      var n=[];for(var i=0;i<plans.length;i++){if(plans[i].id!==id)n.push(plans[i]);}
      plans=n;spd();buildPlanList();buildStartPlanBtns();
      toast('Plan gelöscht');
    }
  });
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
    if(plans[i].name===pp.name){toast(pp.name+' bereits in deinen Plänen!');return;}
  }
  var newPlan={id:new Date().getTime(),name:pp.name,exercises:pp.exercises};
  plans.push(newPlan);
  spd();
  buildPlanList();
  buildStartPlanBtns();
  toast(pp.name+' zu meinen Plänen hinzugefügt!');
}

function buildPlanList(){
  var el=document.getElementById('plan-list');
  if(!el)return;
  var h='';

  // WOCHENPLAN section
  h+='<h2 class="stitle" style="margin:0 0 8px;">Wochenplan</h2>';
  h+='<div id="week-plan-section" style="margin-bottom:20px;"></div>';

  // MY PLANS section — eigene Pläne stehen vor den Vorlagen
  h+='<h2 class="stitle" style="margin:0 0 8px;">Meine Pläne</h2>';
  if(plans.length){
    for(var i=0;i<plans.length;i++){
      var pl=plans[i];
      h+='<div class="plan-card pressable" style="cursor:pointer;" role="button" tabindex="0" onclick="togglePlanExpand(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();togglePlanExpand(this);}">';
      h+='<div class="plan-top"><div class="plan-name">'+pl.name+'</div>';
      h+='<div style="display:flex;align-items:center;gap:8px;"><div style="font-size:11px;color:var(--muted);">'+pl.exercises.length+' Übungen</div><div style="font-size:14px;color:var(--muted);">›</div></div></div>';
      h+='<div class="plan-ex-detail acc-body"><div><div style="height:10px;"></div>';
      for(var j=0;j<pl.exercises.length;j++){
        var ex=pl.exercises[j];var col=COLS[ex.col]||COLS.gr;
        var st='';for(var k=0;k<ex.sets.length;k++){if(k>0)st+=' · ';st+='S'+(k+1)+': '+ex.sets[k].n+' '+ex.unit;}
        h+='<div class="plan-exrow"><div class="plan-dot" style="background:'+col+'"></div><div class="plan-exname">'+ex.name+'</div><div class="plan-exsets">'+st+'</div></div>';
      }
      h+='<div class="plan-actions" style="margin-top:10px;">';
      h+='<button class="plan-start-btn" onclick="event.stopPropagation();startPlanById('+pl.id+')">Starten</button>';
      h+='<button class="plan-del-btn" onclick="event.stopPropagation();deletePlan('+pl.id+')">Löschen</button>';
      h+='</div></div></div></div>';
    }
  } else {
    h+='<div class="empty" style="padding:20px 0;">Noch keine eigenen Pläne.<br>Vorlage hinzufügen oder neuen Plan erstellen.</div>';
  }

  // VORLAGEN section
  h+='<h2 class="stitle" style="margin:20px 0 8px;">Vorlagen</h2>';
  for(var pi=0;pi<PRESET_PLANS.length;pi++){
    var pl=PRESET_PLANS[pi];
    var alreadyAdded=false;
    for(var ai=0;ai<plans.length;ai++){if(plans[ai].name===pl.name){alreadyAdded=true;break;}}
    h+='<div class="plan-card pressable" style="border-color:var(--border);opacity:'+(alreadyAdded?'0.5':'1')+';cursor:pointer;" role="button" tabindex="0" onclick="togglePlanExpand(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();togglePlanExpand(this);}">';
    h+='<div class="plan-top"><div class="plan-name" style="color:var(--muted)">'+pl.name+'</div>';
    h+='<div style="display:flex;align-items:center;gap:8px;">';
    h+='<div style="font-size:11px;color:var(--muted);">'+pl.exercises.length+' Übungen</div>';
    h+='<div style="background:rgba(255,85,0,0.08);color:var(--accent-ink);border-radius:20px;padding:2px 8px;font-family:inherit;font-size:11px;font-weight:700;">Vorlage</div>';
    h+='<div style="font-size:14px;color:var(--muted);">›</div></div></div>';
    // Exercises hidden by default (accordion physics via .acc-body)
    h+='<div class="plan-ex-detail acc-body"><div><div style="height:10px;"></div>';
    for(var j=0;j<pl.exercises.length;j++){
      var pex=pl.exercises[j];var pcol=COLS[pex.col]||COLS.gr;
      var pst='';for(var k=0;k<pex.sets.length;k++){if(k>0)pst+=' · ';pst+='S'+(k+1)+': '+pex.sets[k].n+' '+pex.unit;}
      h+='<div class="plan-exrow"><div class="plan-dot" style="background:'+pcol+'"></div><div class="plan-exname">'+pex.name+'</div><div class="plan-exsets">'+pst+'</div></div>';
    }
    h+='<div class="plan-actions" style="margin-top:10px;">';
    if(alreadyAdded){
      h+='<button class="plan-del-btn" onclick="event.stopPropagation();removePresetFromMyPlans('+pi+')">Entfernen</button>';
    } else {
      h+='<button class="plan-start-btn" onclick="event.stopPropagation();addPresetToMyPlans('+pi+')" style="background:rgba(255,85,0,0.08);color:var(--accent-ink);border:1px solid rgba(255,85,0,0.3);">+ Hinzufügen</button>';
    }
    h+='</div></div></div></div>';
  }

  el.innerHTML=h;
  if(window.caliMotion)caliMotion.stagger(el);
  buildWeekPlan();
}

function startPreset(idx){
  var pl=PRESET_PLANS[idx];
  if(!pl)return;
  // startWorkout() startet bei laufender Session NICHT sofort, sondern zeigt selbst
  // ein Bestätigungs-Sheet und kehrt zurück. Ohne diese Abfrage würde der Rest
  // hier gegen die noch laufende Session laufen (Preset lädt in das alte Workout).
  if(typeof woActive!=='undefined' && woActive){
    confirmSheet({
      title:'Ein Workout läuft bereits',
      desc:'Verwerfen und neues starten?',
      confirmLabel:'Verwerfen und starten',
      onConfirm:function(){ woActive=false; startPreset(idx); }
    });
    return;
  }
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
    var emptyCard=document.createElement('div');
    emptyCard.className='pk-card';
    emptyCard.style.cssText='display:flex;align-items:center;gap:16px;padding:20px;';
    emptyCard.innerHTML=
      iconWrap('calendar',{size:24,box:52,radius:16})+
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:3px;">Noch keine Pläne</div>'+
        '<div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:10px;">Erstelle einen Plan oder nutze eine Vorlage.</div>'+
        '<button class="pressable" onclick="goPage(\'p\')" style="background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:9px 16px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);">Zu den Plänen</button>'+
      '</div>';
    el.appendChild(emptyCard);
    return;
  }
  for(var i=0;i<plans.length;i++){
    (function(pl){
      var totalSets=0;
      for(var s=0;s<pl.exercises.length;s++){ totalSets+=(pl.exercises[s].sets||[]).length; }
      var tags=getPlanCategoryTags(pl);

      var card=document.createElement('div');
      card.className='pk-card pressable';
      card.style.cssText='display:flex;align-items:center;gap:14px;padding:16px;cursor:pointer;';
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label',pl.name+' starten');
      card.onclick=function(){startPlanById(pl.id);};
      card.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();startPlanById(pl.id);}};

      var icon=document.createElement('div');
      icon.style.cssText='width:44px;height:44px;border-radius:14px;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;';
      icon.innerHTML='<div style="width:20px;height:20px;">'+ci('dumbbell')+'</div>';

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
          chip.style.cssText='background:var(--bg3);border-radius:20px;padding:3px 10px;font-size:11px;color:var(--muted);font-weight:600;';
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
  if(window.caliMotion)caliMotion.stagger(el);
}

// ── CANCEL WORKOUT ────────────────────────────────────────
function cancelWorkout(){
  confirmSheet({
    title:'Workout abbrechen?',
    desc:'Alle Einträge gehen verloren.',
    confirmLabel:'Workout verwerfen',
    cancelLabel:'Weiter trainieren',
    onConfirm:function(){
      clearInterval(woTimer);
      woTimer=null;
      woActive=false;
      woExercises=[];
      planBlocks=[];
      sets=[];sBand='';isBand=false;
      document.getElementById('active-workout').style.display='none';
      document.getElementById('start-screen').style.display='block';
      document.getElementById('wo-timer').textContent='00:00';
      document.getElementById('wo-ex-list').innerHTML='<div class="empty" id="wo-empty">Noch keine Übungen hinzugefügt.</div>';
      document.getElementById('plan-blocks-wrap').style.display='none';
      if(document.getElementById('plan-add-form'))document.getElementById('plan-add-form').style.display='none';
      if(document.getElementById('plan-add-label'))document.getElementById('plan-add-label').style.display='none';
      document.getElementById('sbox').innerHTML='';
      document.getElementById('inp-note').value='';
      document.getElementById('b-cust').value='';
      toast('Workout abgebrochen');
    }
  });
}

// ── MAX TEST ──────────────────────────────────────────────
var maxEntries = [];
var maxChart2 = null;
var maxFilter = 'Alle';

function lmax(){try{var a=localStorage.getItem('cali_max');maxEntries=a?JSON.parse(a):[];}catch(x){maxEntries=[];}}
function smax(){try{localStorage.setItem('cali_max',JSON.stringify(maxEntries));}catch(x){}}

function saveMaxEntry(){
  var dateInp = document.getElementById('max-date');
  var valInp = document.getElementById('max-val');
  var date = dateInp.value;
  var exRaw = document.getElementById('max-ex').value;
  var val = valInp.value.trim();
  var genderEl = document.getElementById('max-gender');
  var gender = genderEl ? genderEl.value : 'm';
  if(!date){toast('Datum ausfüllen');dateInp.focus();return;}
  if(!val){toast('Ergebnis eintragen');valInp.focus();return;}
  var parts = exRaw.split('|');
  // Bisherige Bestleistung für diese Übung ermitteln (vor dem Push)
  var prevBest = 0, prevBestRaw = '';
  for(var i=0;i<maxEntries.length;i++){
    if(maxEntries[i].name===parts[0]){
      var v0 = parseMaxVal(maxEntries[i].val, maxEntries[i].unit);
      if(v0>prevBest){ prevBest=v0; prevBestRaw=maxEntries[i].val; }
    }
  }
  var newNum = parseMaxVal(val, parts[1]);
  maxEntries.push({id:new Date().getTime(), date:date, name:parts[0], unit:parts[1], val:val, gender:gender});
  smax();
  valInp.value='';
  showPercentile(parts[0], val, gender);
  buildMaxList();
  drawMaxChart();
  setTimeout(function(){
    var pb = document.getElementById('percentile-box');
    if(pb && pb.style.display!=='none') pb.scrollIntoView({behavior:'smooth',block:'center'});
  }, 150);
  if(prevBest>0 && newNum>prevBest){
    // Neuer Rekord: Diamant gutschreiben + Feiermoment (earnDiamond war bislang toter Code)
    earnDiamond();
    try{ awardXP(50, 'Neuer Rekord: '+parts[0]); }catch(e){}
    showCelebrationOverlay({
      icon:'🏆',
      title:'Neuer Rekord!',
      big: val+' '+parts[1],
      sub: parts[0]+' · Vorher: '+prevBestRaw+' '+parts[1],
      note:'+1 💎'
    });
  } else {
    toast('Max eingetragen!');
  }
  fbSave();
}

// Merkt sich je Eintrag, welcher Wert schon einmal hochgezählt wurde. Ein
// Filter-Tap rendert die Liste komplett neu — die Zahlen sollen dabei aber
// stehen bleiben und nur bei echten Änderungen (neu/geändert) animieren.
var maxCountedVals = {};

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
    // Nur reine Zahlenwerte zählen hoch — 'Min:Sek'-Werte (z.B. 1:30) bleiben statisch
    var rawVal=String(e.val).trim();
    var countable=!(e.unit==='Min:Sek'&&rawVal.indexOf(':')>-1)&&/^[0-9]+(\.[0-9]+)?$/.test(rawVal);
    var dec=(countable&&rawVal.indexOf('.')>-1)?rawVal.split('.')[1].length:0;
    h+='<div class="ei"><div class="et">';
    h+='<div class="ed">'+e.date.slice(5).replace('-','.')+'</div>';
    h+='<div class="en">'+e.name+'</div>';
    h+='<div style="font-family:inherit;font-size:22px;font-weight:800;color:var(--accent);">'+(countable?'<span data-maxcu="'+rawVal+'" data-maxdec="'+dec+'" data-maxid="'+e.id+'">'+e.val+'</span>':e.val)+' <span style="font-size:11px;font-weight:600;color:var(--muted)">'+e.unit+'</span></div>';
    h+='<button class="edel" aria-label="Eintrag löschen" onclick="delMaxEntry('+e.id+')">&#x2715;</button>';
    h+='</div></div>';
  }
  el.innerHTML=h;
  // Maxwerte hochzählen lassen (Einheiten-Suffix bleibt unberührt im Nachbar-Span)
  if(window.caliMotion){
    var cuEls=el.querySelectorAll('[data-maxcu]');
    for(var cu=0;cu<cuEls.length;cu++){
      var cuEl=cuEls[cu];
      var cuKey=cuEl.getAttribute('data-maxid');
      var cuRaw=cuEl.getAttribute('data-maxcu');
      if(maxCountedVals[cuKey]===cuRaw)continue; // unverändert → nicht erneut hochzählen
      maxCountedVals[cuKey]=cuRaw;
      caliMotion.countUp(cuEl, parseFloat(cuRaw)||0, {duration:600, decimals:parseInt(cuEl.getAttribute('data-maxdec'),10)||0});
    }
  }
}

function setMaxFilter(idx){}  // handled via event delegation above

function delMaxEntry(id){
  confirmSheet({
    title:'Eintrag löschen?',
    desc:'Der Maxwert wird dauerhaft entfernt.',
    confirmLabel:'Löschen',
    onConfirm:function(){
      var n=[];for(var i=0;i<maxEntries.length;i++){if(maxEntries[i].id!==id)n.push(maxEntries[i]);}
      maxEntries=n;smax();buildMaxList();drawMaxChart();
      toast('Eintrag gelöscht');
    }
  });
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
    options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#6E6759',font:{size:10}},grid:{color:'rgba(0,0,0,0.06)'}},y:{ticks:{color:'#6E6759',font:{size:10}},grid:{color:'rgba(0,0,0,0.06)'}}}}
  });
}

// ── INIT ──────────────────────────────────────────────────
var activeChallenge = null;
var challengeProgress = 0;


var CHALLENGE_TEMPLATES = [
  {
    id:'t1', icon:'\uD83E\uDDED', title:'Entdecker',
    desc:'Probiere {target} Übungen aus, die du diese Woche noch nie gemacht hast!',
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
    desc:'Schaffe in einem einzigen Workout {target} Sätze!',
    calc: function(data){
      var best=0;
      for(var i=0;i<data.ents.length;i++){if(data.ents[i].sets&&data.ents[i].sets.length>best)best=data.ents[i].sets.length;}
      var target=best>0?best+3:8;
      return {target:target, metric:'sets_in_one_workout'};
    }
  },
  {
    id:'t4', icon:'\u23F1', title:'Ausdauer-Held',
    desc:'Halte eine Übung (Plank, L-Sit oder Hollow Body) für insgesamt {target} Sekunden diese Woche!',
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
    desc:'Mache diese Woche {target} Skills-Übungen (Muscle-Up, Handstand, Front Lever, L-Sit)!',
    calc: function(data){
      return {target:3, metric:'skills_this_week'};
    }
  },
  {
    id:'t7', icon:'\uD83D\uDD3C', title:'Klimmzug-Pyramide',
    desc:'Schaffe eine vollständige Klimmzug-Pyramide: 1-2-3-4-5-4-3-2-1 in einem Workout!',
    calc: function(data){
      return {target:25, metric:'pullup_pyramid'};
    }
  },
  // t8 'Morgen-Krieger' entfernt: Eintraege speichern keine Uhrzeit,
  // der Fortschritt ('early_workouts') waere fuer immer 0.
  {
    id:'t9', icon:'\u2696\uFE0F', title:'Balance-Woche',
    desc:'Gleiche Anzahl Pull- und Push-Sätze diese Woche — mindestens {target} von jedem!',
    calc: function(data){
      return {target:15, metric:'balance_week'};
    }
  },
  {
    id:'t10', icon:'\uD83C\uDFC6', title:'Pers\u00F6nliche Bestleistung',
    desc:'Schlage deinen Max-Rekord bei einer \u00DCbung deiner Wahl!',
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
  var p = activeChallenge.params || {};
  var metric = p.metric;
  var now = new Date();
  var weekStart = new Date(now);
  // Montags-Wochenstart — konsistent mit getWeeklyProgress (main2ab.js)
  var dow = now.getDay();
  weekStart.setDate(now.getDate() - (dow===0?6:dow-1));
  var weekStr = weekStart.toISOString().slice(0,10);
  var sinceStr = activeChallenge.startDate || weekStr;

  // Helfer für die Metrik-Berechnung
  function setSum(e){ var t=0,s=e.sets||[]; for(var k=0;k<s.length;k++){ t+=parseFloat(s[k].n)||0; } return t; }
  function nameMatches(n, exName){ if(!exName) return false; return n===exName || n.indexOf(exName)===0; }
  function exCat(n){ for(var k=0;k<EX_DB.length;k++){ if(EX_DB[k].name===n) return EX_DB[k].cat||''; } return ''; }
  function sessionKey(e){ return e.woId || (e.date+'_x'); }

  if(metric==='workouts_this_week'){
    var dates={};
    for(var i=0;i<ents.length;i++){if(ents[i].date>=weekStr)dates[ents[i].date]=true;}
    return Object.keys(dates).length;
  }
  if(metric==='volume_exercise'){
    // nameMatches statt ===: exName 'Klimmzuge' muss auch 'Klimmzuge (schulterbreit)' zählen
    var total=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && nameMatches(ents[i].name, p.exName)){
        total+=setSum(ents[i]);
      }
    }
    return Math.round(total);
  }
  if(metric==='best_set'){
    var best=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && nameMatches(ents[i].name, p.exName)){
        for(var k=0;k<ents[i].sets.length;k++){var v=parseFloat(ents[i].sets[k].n)||0;if(v>best)best=v;}
      }
    }
    return best;
  }
  if(metric==='new_exercise'){
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && nameMatches(ents[i].name, p.exName)) return 1;
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

  // ── Metriken der generierten CHALLENGE_TEMPLATES ──
  // (waren bislang unbehandelt → Fortschritt blieb dauerhaft 0)
  if(metric==='new_exercises_week'){
    // Übungen, deren allererstes Vorkommen in diese Woche fällt
    var firstSeen={};
    for(var i=0;i<ents.length;i++){
      var nm=ents[i].name;
      if(firstSeen[nm]===undefined || ents[i].date<firstSeen[nm]) firstSeen[nm]=ents[i].date;
    }
    var newCnt=0;
    for(var key1 in firstSeen){ if(firstSeen.hasOwnProperty(key1) && firstSeen[key1]>=weekStr) newCnt++; }
    return newCnt;
  }
  if(metric==='categories_this_week'){
    // Pull, Push und Core diese Woche trainiert
    var catsSeen={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<weekStr) continue;
      var c1=exCat(ents[i].name);
      if(c1==='Pull'||c1==='Push'||c1==='Core') catsSeen[c1]=true;
    }
    return Object.keys(catsSeen).length;
  }
  if(metric==='sets_in_one_workout'){
    var setsPerSess={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<sinceStr) continue;
      var sk1=sessionKey(ents[i]);
      setsPerSess[sk1]=(setsPerSess[sk1]||0)+((ents[i].sets||[]).length);
    }
    var bestSets=0;
    for(var key2 in setsPerSess){ if(setsPerSess[key2]>bestSets) bestSets=setsPerSess[key2]; }
    return bestSets;
  }
  if(metric==='hold_total_week'){
    // Beste Wochen-Gesamthaltezeit einer der drei Halteübungen
    var holdNames=['Plank','L-Sit Hold','Hollow Body Hold'];
    var perHold={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && holdNames.indexOf(ents[i].name)>-1){
        perHold[ents[i].name]=(perHold[ents[i].name]||0)+setSum(ents[i]);
      }
    }
    var bestHold=0;
    for(var key3 in perHold){ if(perHold[key3]>bestHold) bestHold=perHold[key3]; }
    return Math.round(bestHold);
  }
  if(metric==='volume_one_workout'){
    var volPerSess={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<sinceStr) continue;
      var sk2=sessionKey(ents[i]);
      volPerSess[sk2]=(volPerSess[sk2]||0)+setSum(ents[i]);
    }
    var bestVol=0;
    for(var key4 in volPerSess){ if(volPerSess[key4]>bestVol) bestVol=volPerSess[key4]; }
    return Math.round(bestVol);
  }
  if(metric==='skills_this_week'){
    var skillsSeen={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && exCat(ents[i].name)==='Skills') skillsSeen[ents[i].name]=true;
    }
    return Object.keys(skillsSeen).length;
  }
  if(metric==='pullup_pyramid'){
    var pyTarget=p.target||25;
    var pullPerSess={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<sinceStr) continue;
      // Geloggte Pyramide (Unit 'Runden') zählt als komplette Pyramide
      if(ents[i].name.indexOf('Pyramide')>-1) return pyTarget;
      if(nameMatches(ents[i].name,'Klimmzuge')){
        var sk3=sessionKey(ents[i]);
        pullPerSess[sk3]=(pullPerSess[sk3]||0)+setSum(ents[i]);
      }
    }
    var bestPull=0;
    for(var key5 in pullPerSess){ if(pullPerSess[key5]>bestPull) bestPull=pullPerSess[key5]; }
    return Math.min(Math.round(bestPull), pyTarget);
  }
  if(metric==='balance_week'){
    var pullSets=0, pushSets=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<weekStr) continue;
      var c2=exCat(ents[i].name);
      var sl=(ents[i].sets||[]).length;
      if(c2==='Pull') pullSets+=sl;
      else if(c2==='Push') pushSets+=sl;
    }
    return Math.min(pullSets, pushSets);
  }
  if(metric==='new_personal_record'){
    // Gibt es seit Challenge-Start einen Maxwert, der die alte Bestleistung schlägt?
    for(var i=0;i<maxEntries.length;i++){
      var me=maxEntries[i];
      if(!me.date || me.date<sinceStr) continue;
      var newV=parseMaxVal(me.val, me.unit);
      var prevV=0;
      for(var j=0;j<maxEntries.length;j++){
        var oe=maxEntries[j];
        if(oe.name===me.name && oe.date && oe.date<sinceStr){
          var ov2=parseMaxVal(oe.val, oe.unit);
          if(ov2>prevV) prevV=ov2;
        }
      }
      if(prevV>0 && newV>prevV) return 1;
    }
    return 0;
  }
  return 0;
}


// ── WÄHRUNG SYSTEM ────────────────────────────────────────
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
  if(currency.diamonds >= 1 || currency.flames >= 50){
    showSkipModal();
  } else {
    toast('Nicht genug! Du brauchst 1 \uD83D\uDC8E Diamant oder 50 \uD83D\uDD25 Flammen zum Skippen.');
  }
}

function showSkipModal(){
  var ex = document.getElementById('skip-currency-modal');
  if(ex) ex.remove();
  var modal = document.createElement('div');
  modal.id = 'skip-currency-modal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-end;justify-content:center;padding:16px;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg2);border-radius:20px;padding:24px 20px 32px;width:100%;max-width:480px;';

  var title = document.createElement('div');
  title.style.cssText = 'font-size:17px;font-weight:700;color:var(--text);margin-bottom:6px;';
  title.textContent = 'Challenge skippen?';

  var sub = document.createElement('div');
  sub.style.cssText = 'font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.5;';
  sub.textContent = 'Kostet 1 \uD83D\uDC8E Diamant oder 50 \uD83D\uDD25 Flammen. Du hast: '+currency.diamonds+' \uD83D\uDC8E \u00B7 '+currency.flames+' \uD83D\uDD25';

  function doSkip(costLabel){
    activeChallenge=null; saveChallenges(); buildChallengeUI();
    sheetOut(modal, box);
    toast('Challenge geskippt! '+costLabel);
  }

  var canDiamond = currency.diamonds >= 1;
  var btn = document.createElement('button');
  btn.style.cssText = 'width:100%;background:'+(canDiamond?'rgba(56,189,248,0.1)':'var(--bg3)')+';border:1px solid '+(canDiamond?'#38BDF8':'var(--border)')+';border-radius:16px;padding:16px;cursor:'+(canDiamond?'pointer':'not-allowed')+';opacity:'+(canDiamond?'1':'0.4')+';font-family:inherit;font-size:15px;font-weight:700;color:'+(canDiamond?'var(--blue-ink)':'var(--muted)')+';margin-bottom:10px;transition:transform var(--dur-fast) var(--ease-out);';
  btn.textContent = '\uD83D\uDC8E 1 Diamant — skippen';
  // Press-Feedback nur, wenn der Kauf auch m\u00F6glich ist
  if(canDiamond){ btn.className = 'pressable'; btn.onclick = function(){ currency.diamonds -= 1; saveCurrency(); doSkip('-1 \uD83D\uDC8E'); }; }

  // Flammen-Preis: der im Skip-Label versprochene zweite Zahlweg
  var canFlames = currency.flames >= 50;
  var flameBtn = document.createElement('button');
  flameBtn.style.cssText = 'width:100%;background:'+(canFlames?'rgba(255,85,0,0.08)':'var(--bg3)')+';border:1px solid '+(canFlames?'rgba(255,85,0,0.3)':'var(--border)')+';border-radius:16px;padding:16px;cursor:'+(canFlames?'pointer':'not-allowed')+';opacity:'+(canFlames?'1':'0.4')+';font-family:inherit;font-size:15px;font-weight:700;color:'+(canFlames?'var(--accent-ink)':'var(--muted)')+';margin-bottom:10px;transition:transform var(--dur-fast) var(--ease-out);';
  flameBtn.textContent = '\uD83D\uDD25 50 Flammen \u2014 skippen';
  if(canFlames){ flameBtn.className = 'pressable'; flameBtn.onclick = function(){ currency.flames -= 50; saveCurrency(); doSkip('-50 \uD83D\uDD25'); }; }

  var cancel = document.createElement('button');
  cancel.className = 'pressable';
  cancel.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;font-weight:700;padding:12px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
  cancel.textContent = 'Abbrechen';
  cancel.onclick = function(){ sheetOut(modal, box); };

  box.appendChild(title);
  box.appendChild(sub);
  box.appendChild(btn);
  box.appendChild(flameBtn);
  box.appendChild(cancel);
  modal.appendChild(box);
  modal.onclick = function(e){ if(e.target===modal) sheetOut(modal, box); };
  document.body.appendChild(modal);
  if(window.caliMotion) caliMotion.sheetIn(box, modal);
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
          '<div data-chbar style="height:100%;border-radius:20px;background:var(--accent);width:0%;transition:width var(--dur-slow) var(--ease-out);"></div>'+
        '</div>'+
        '<div class="num" style="font-size:13px;font-weight:800;color:var(--accent-ink);flex-shrink:0;">'+pct+'%</div>'+
      '</div>'+
      '<div style="font-size:11px;color:var(--muted);">'+prog+' / '+target+' · '+pct+'% abgeschlossen'+(done?' &nbsp;<span style="color:var(--accent-ink);font-weight:700;">Geschafft!</span>':'')+'</div>';
    var pFill = el.querySelector('[data-chbar]');
    if(pFill){
      if(window.caliMotion) caliMotion.animateBar(pFill, pct);
      else pFill.style.width = pct+'%';
    }
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
      '<div style="font-size:11px;color:var(--muted);padding-left:12px;">+ '+(PRESET_CHALLENGES.length-3)+' weitere</div>'+
    '</div>';
}

function buildChCardCommunity(){
  var el = document.getElementById('ch-card-community-inner');
  if(!el) return;
  // Kein hartes '0 Challenges' vor dem Firestore-Ergebnis — Ladezustand bzw. Login-Hinweis
  el.innerHTML =
    '<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:8px;">'+(currentUser?'… Challenges':'Community')+'</div>'+
    '<div style="font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:10px;">'+(currentUser?'Von Athleten erstellt & bewertet':'Einloggen um Challenges zu sehen')+'</div>'+
    '<div id="ch-community-creators" style="display:flex;align-items:center;margin-bottom:10px;min-height:24px;"></div>'+
    '<button class="pressable" onclick="event.stopPropagation();showCommPostModal();" style="background:none;border:1px solid rgba(78,205,196,0.4);color:var(--teal-ink);border-radius:20px;font-family:inherit;font-size:11px;font-weight:700;padding:6px 14px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);">+ Posten</button>';
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

// 5-Minuten-Cache: kein Lade-Flackern und kein Firestore-Read bei jedem Tab-Wechsel
var trendingCache = null;
var trendingCacheTime = 0;

function renderTrendingList(el, docs){
  if(!docs.length){
    el.innerHTML = '<div style="background:var(--bg2);border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:18px;text-align:center;font-size:12px;color:var(--muted);">Noch keine Trends — probiere Challenges aus, um sie hier zu sehen!</div>';
    return;
  }
  el.innerHTML = '';
  docs.forEach(function(entry){ renderTrendingCard(el, entry.id, entry.data); });
  if(window.caliMotion) caliMotion.stagger(el);
}

function buildTrendingChallenges(){
  var el = document.getElementById('ch-trending');
  if(!el) return;
  if(!currentUser){
    el.innerHTML = '<div style="font-size:11px;color:var(--muted);padding:12px 0;">Einloggen um Trending Challenges zu sehen.</div>';
    return;
  }
  if(trendingCache && (Date.now() - trendingCacheTime) < 300000){
    renderTrendingList(el, trendingCache);
    return;
  }
  el.innerHTML = '<div style="font-size:11px;color:var(--muted);padding:12px 0;">Wird geladen…</div>';

  db.collection('challengeStats').orderBy('views','desc').limit(3).get().then(function(snap){
    if(!el) return;
    var docs = [];
    snap.forEach(function(d){ docs.push({id:d.id, data:d.data()}); });
    trendingCache = docs;
    trendingCacheTime = Date.now();
    renderTrendingList(el, docs);
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
  card.className = 'pressable';
  card.style.cssText = 'background:#fff;border-radius:16px;overflow:hidden;width:100%;box-shadow:0 8px 20px rgba(0,0,0,0.05);cursor:pointer;';
  // Trending-Karten waren Sackgassen — jetzt führen sie zur passenden Ansicht
  card.setAttribute('role','button');
  card.setAttribute('tabindex','0');
  card.setAttribute('aria-label', isCommunity ? 'Community Challenges öffnen' : (meta.title+' öffnen'));
  var openTrending = function(){
    if(isCommunity){ if(typeof openCommunityPage==='function') openCommunityPage(); }
    else { trackChallengeView(id); openChDrawer('preset'); }
  };
  card.onclick = openTrending;
  card.onkeydown = function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openTrending(); } };

  var header = document.createElement('div');
  header.style.cssText = photoUrl
    ? 'height:130px;background:#000 url('+photoUrl+') center/cover no-repeat;position:relative;'
    : 'background:'+iconBg+';padding:20px;position:relative;';
  header.innerHTML =
    '<div style="position:absolute;top:10px;left:10px;background:rgba(255,255,255,0.9);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:800;color:var(--text);">🔥 '+views+'</div>'+
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
    more.style.cssText = 'width:24px;height:24px;border-radius:50%;background:var(--bg3);border:2px solid #fff;margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--muted);';
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
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';

  var drawer = document.createElement('div');
  // Endlayout ohne Inline-Transform — die Einfahranimation macht caliMotion.sheetIn
  drawer.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:85vh;overflow-y:auto;padding:0 0 40px;border-top:1px solid var(--border);';
  drawer.classList.add('sheet-scroll');

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

  if(window.caliMotion) caliMotion.sheetIn(drawer, ov);
}

function closeChDrawer(){
  var ov = document.getElementById('ch-drawer-overlay');
  if(!ov) return;
  var drawer = ov.querySelector('div');
  sheetOut(ov, drawer);
  buildChCards(); // refresh card previews
}

// ── PERSONAL DRAWER ───────────────────────────────────────
function buildDrawerPersonal(el){
  var hdr = document.createElement('div');
  hdr.style.cssText = 'font-size:11px;color:var(--accent-ink);font-weight:700;margin-bottom:16px;';
  hdr.textContent = 'Meine Challenge';
  el.appendChild(hdr);

  if(!activeChallenge){
    var hint = document.createElement('div');
    hint.style.cssText = 'font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.6;text-align:center;padding:12px 0;';
    hint.textContent = 'Noch keine aktive Challenge.';
    var genBtn = document.createElement('button');
    genBtn.className = 'pressable';
    genBtn.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:16px;cursor:pointer;width:100%;margin-bottom:12px;transition:transform var(--dur-fast) var(--ease-out);';
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
        '<div style="font-size:11px;padding:3px 10px;border-radius:20px;background:'+(done?'rgba(255,85,0,0.12)':'var(--bg3)')+';color:'+(done?'var(--accent-ink)':'var(--muted)')+';font-weight:700;">'+(done?'Geschafft!':'Aktiv')+'</div>'+
      '</div>'+
      '<div style="background:var(--bg3);border-radius:20px;height:8px;overflow:hidden;margin-bottom:6px;">'+
        '<div data-chbar style="height:100%;border-radius:20px;background:'+(done?'var(--accent)':'rgba(255,85,0,0.6)')+';width:0%;transition:width var(--dur-slow) var(--ease-out);"></div>'+
      '</div>'+
      '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);">'+
        '<span class="num">'+prog+' / '+target+'</span><span class="num">'+pct+'%</span>'+
      '</div>';
    el.appendChild(card);
    var chFill = card.querySelector('[data-chbar]');
    if(chFill){
      if(window.caliMotion) caliMotion.animateBar(chFill, pct);
      else chFill.style.width = pct+'%';
    }

    if(done){
      // Feiermoment statt Sackgasse: Challenge abschließen, XP kassieren
      var claimKey = 'cali_ch_claimed_'+activeChallenge.id+'_'+(activeChallenge.startDate||'');
      var claimBtn = document.createElement('button');
      claimBtn.className = 'pressable';
      claimBtn.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:16px;cursor:pointer;width:100%;margin-bottom:8px;transition:transform var(--dur-fast) var(--ease-out);';
      claimBtn.textContent = 'Challenge abschließen';
      claimBtn.onclick = function(){
        var claimed = false;
        try{ claimed = !!localStorage.getItem(claimKey); }catch(e){}
        if(!claimed){
          try{ localStorage.setItem(claimKey,'1'); }catch(e){}
          try{ awardXP(100, 'Challenge: '+activeChallenge.title); }catch(e){}
        }
        var ch = activeChallenge;
        activeChallenge = null;
        saveChallenges();
        closeChDrawer();
        buildChallengeUI();
        showCelebrationOverlay({
          icon: ch.icon,
          title: 'Challenge geschafft!',
          big: ch.title,
          sub: ch.desc,
          note: claimed ? '' : '+100 XP'
        });
      };
      el.appendChild(claimBtn);
    } else {
      var newBtn = document.createElement('button');
      newBtn.className = 'pressable';
      newBtn.style.cssText = 'background:var(--bg3);color:var(--muted);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:12px;cursor:pointer;width:100%;margin-bottom:8px;transition:transform var(--dur-fast) var(--ease-out);';
      newBtn.textContent = 'Neue Challenge generieren';
      newBtn.onclick = function(){ activeChallenge=null; saveChallenges(); generateChallenge(); closeChDrawer(); setTimeout(function(){ openChDrawer('personal'); }, 350); };
      el.appendChild(newBtn);

      var skipBtn = document.createElement('button');
      skipBtn.className = 'pressable';
      skipBtn.style.cssText = 'background:none;color:var(--muted);border:none;font-family:inherit;font-size:12px;padding:8px;cursor:pointer;width:100%;transition:transform var(--dur-fast) var(--ease-out);';
      skipBtn.textContent = 'Challenge skippen (\uD83D\uDD25 50 oder \uD83D\uDC8E 1)';
      skipBtn.onclick = function(){ closeChDrawer(); setTimeout(skipChallenge, 300); };
      el.appendChild(skipBtn);
    }
  }
}

// ── PRESET DRAWER ─────────────────────────────────────────
function buildDrawerPreset(el){
  var hdr = document.createElement('div');
  hdr.style.cssText = 'font-size:11px;color:var(--blue-ink);font-weight:700;margin-bottom:16px;';
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
      btn.className = 'pressable';
      btn.style.cssText = 'background:rgba(56,189,248,0.08);color:var(--blue-ink);border:1px solid rgba(56,189,248,0.3);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px;cursor:pointer;width:100%;margin-top:10px;transition:transform var(--dur-fast) var(--ease-out);';
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
  var isOpen = detail.classList.contains('open');
  detail.classList.toggle('open', !isOpen);
  if(arrow) arrow.textContent = isOpen ? '›' : '˅';
}

// ── WOCHENPLAN ────────────────────────────────────────────
var WEEK_DAYS = ['Mo','Di','Mi','Do','Fr','Sa','So'];
var WEEK_DAYS_FULL = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];

function getWeekPlan(){
  try{ return JSON.parse(localStorage.getItem('cali_weekplan')||'{}'); }catch(e){ return {}; }
}
function saveWeekPlan(wp){ localStorage.setItem('cali_weekplan', JSON.stringify(wp)); }

// Migriert alte Wochenplan-Daten: eigene Plan-IDs wurden als Strings gespeichert,
// Plan-IDs sind aber Zahlen — einmalig normalisieren.
function normalizeWeekPlanIds(wp){
  var changed = false;
  for(var d in wp){
    if(!wp.hasOwnProperty(d)) continue;
    var arr = wp[d];
    if(!arr || !arr.length) continue;
    for(var i=0;i<arr.length;i++){
      var v = arr[i];
      if(typeof v==='string' && v!=='' && v.indexOf('preset_')!==0 && !isNaN(parseInt(v,10))){
        arr[i] = parseInt(v,10);
        changed = true;
      }
    }
  }
  return changed;
}

function buildWeekPlan(){
  var el = document.getElementById('week-plan-section');
  if(!el) return;
  var wp = getWeekPlan();
  if(normalizeWeekPlanIds(wp)) saveWeekPlan(wp);
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
  eyebrow.style.cssText = 'font-size:11px;font-weight:700;color:var(--accent-ink);margin-bottom:6px;';
  eyebrow.textContent = 'Heute';
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
  editBtn.style.cssText = 'background:'+(hasWorkout?'var(--accent-deep)':'#fff')+';color:'+(hasWorkout?'#fff':'var(--text)')+';border:'+(hasWorkout?'none':'1px solid var(--border)')+';border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:11px 18px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
  editBtn.innerHTML = hasWorkout ? '▶ Workout starten' : '✎ Plan bearbeiten';
  editBtn.onclick = function(){
    // startPlanById wechselt zur Workout-Seite und kann auch 'preset_N' starten
    if(hasWorkout){ startPlanById(firstPlan.id); }
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
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;font-size:17px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  titleEl.textContent = '📅 Wochenplan';
  var newPlanBtn = document.createElement('button');
  newPlanBtn.className = 'pressable';
  newPlanBtn.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:9px 12px;cursor:pointer;flex-shrink:0;white-space:nowrap;transition:transform var(--dur-fast) var(--ease-out);';
  newPlanBtn.textContent = '+ Neuer Plan';
  newPlanBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
    goPage('p'); showPlanForm();
  };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(newPlanBtn);
  ov.appendChild(topBar);

  // Scrollable content
  var scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
  scroll.classList.add('sheet-scroll');
  ov.appendChild(scroll);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);

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
  statsBar.style.cssText = 'display:flex;gap:8px;background:var(--bg2);border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:12px;margin-bottom:12px;flex-wrap:wrap;';
  [
    {icon:'flex', val:stats.workouts, label:'Workouts'},
    {icon:'moon', val:stats.restDays, label:'Ruhetage'},
    {icon:'flame', val:stats.totalEx, label:'Übungen'}
  ].forEach(function(s){
    var pill = document.createElement('div');
    pill.style.cssText = 'flex:1;min-width:90px;display:flex;align-items:center;gap:8px;';
    pill.innerHTML = '<div style="width:20px;height:20px;">'+ci(s.icon)+'</div><div><div style="font-size:16px;font-weight:800;color:var(--text);line-height:1.1;">'+s.val+'</div><div style="font-size:11px;color:var(--muted);">'+s.label+'</div></div>';
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
    dayBlock.style.cssText = 'margin-bottom:8px;border-radius:16px;overflow:hidden;background:var(--bg2);box-shadow:0 8px 20px rgba(0,0,0,0.05);'+(isToday?'border:1.5px solid var(--accent);':'');

    var expanded = i === focusIdx;

    var chevron = document.createElement('div');
    chevron.style.cssText = 'font-size:13px;color:var(--muted);flex-shrink:0;transition:transform var(--dur-fast) var(--ease-out);transform:rotate('+(expanded?'180':'0')+'deg);';
    chevron.textContent = '⌄';

    var dayHdr = document.createElement('div');
    dayHdr.style.cssText = 'display:flex;align-items:center;gap:10px;padding:11px 12px;cursor:pointer;';
    dayHdr.innerHTML =
      iconWrap(hasWorkout?'flex':'moon',{size:16,box:34,radius:10,bg:hasWorkout?'rgba(255,85,0,0.12)':'rgba(150,150,150,0.15)'})+
      '<div style="flex-shrink:0;width:44px;">'+
        '<div style="font-size:11px;font-weight:800;color:'+(isToday?'var(--accent-ink)':'var(--muted)')+';">'+WEEK_DAYS[i]+'</div>'+
        '<div style="font-size:11px;color:var(--muted);">'+formatDayDate(weekDates[i])+'</div>'+
      '</div>'+
      '<div style="flex:1;min-width:0;">'+
        '<div style="display:flex;align-items:center;gap:6px;">'+
          '<div style="font-size:14px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(hasWorkout?firstPlan.name:'Ruhetag')+'</div>'+
          (isToday?'<div style="font-size:11px;background:var(--accent-deep);color:#fff;padding:2px 7px;border-radius:20px;font-weight:700;flex-shrink:0;">Heute</div>':'')+
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
            '<div style="font-size:11px;color:var(--muted);">'+ex.sets.length+' Sätze'+(ex.sets[0]?' • '+ex.sets[0].n+' '+ex.unit:'')+'</div>';
          exScroll.appendChild(chip);
        });
        if(firstPlan.exercises.length > 3){
          var moreChip = document.createElement('div');
          moreChip.style.cssText = 'flex-shrink:0;width:90px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--accent-ink);font-weight:700;text-align:center;';
          moreChip.textContent = '+'+(firstPlan.exercises.length-3)+' weitere ›';
          exScroll.appendChild(moreChip);
        }
        detailWrap.appendChild(exScroll);

        var startBtn = document.createElement('button');
        startBtn.className = 'pressable';
        startBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:11px;cursor:pointer;margin-bottom:8px;transition:transform var(--dur-fast) var(--ease-out);';
        startBtn.textContent = '▶ Workout starten';
        startBtn.onclick = function(e){
          e.stopPropagation();
          var wov = document.getElementById('week-cal-ov');
          if(wov){
            if(typeof overlayClose === 'function'){ overlayClose(wov); } else { wov.remove(); }
          }
          startPlanById(firstPlan.id);
        };
        detailWrap.appendChild(startBtn);
      } else {
        var tipBox = document.createElement('div');
        tipBox.style.cssText = 'background:var(--bg3);border-radius:16px;padding:12px;margin-bottom:8px;';
        tipBox.innerHTML = '<div style="font-size:11px;font-weight:800;color:var(--accent-ink);margin-bottom:4px;">☀️ Tipp für heute</div>'+
          '<div style="font-size:12px;color:var(--text);line-height:1.5;">Nutze den Tag für Mobilität, Stretching oder einen Spaziergang.</div>';
        detailWrap.appendChild(tipBox);
      }

      var editBtn = document.createElement('button');
      editBtn.className = 'pressable';
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
  if(window.caliMotion) caliMotion.stagger(left);
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
  fullWeekBtn.className = 'pressable';
  fullWeekBtn.style.cssText = 'background:none;border:none;color:var(--accent-ink);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:transform var(--dur-fast) var(--ease-out);';
  fullWeekBtn.innerHTML = 'Ganze Woche →';
  fullWeekBtn.onclick = function(){ openDayListModal((new Date().getDay()+6)%7); };
  sectionTitleRow.appendChild(fullWeekBtn);
  card.appendChild(sectionTitleRow);

  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;';
  var prevBtn = document.createElement('button');
  prevBtn.style.cssText = 'background:var(--bg3);border:none;border-radius:10px;font-size:16px;color:var(--text);cursor:pointer;width:36px;height:36px;';
  prevBtn.textContent = '←';
  prevBtn.setAttribute('aria-label', 'Vorheriger Monat');
  prevBtn.onclick = function(){ weekCalMonthOffset--; rerenderFn(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:16px;font-weight:700;color:var(--text);';
  titleEl.textContent = MONTH_NAMES[month]+' '+year;
  var nextBtn = document.createElement('button');
  nextBtn.style.cssText = 'background:var(--bg3);border:none;border-radius:10px;font-size:16px;color:var(--text);cursor:pointer;width:36px;height:36px;';
  nextBtn.textContent = '→';
  nextBtn.setAttribute('aria-label', 'Nächster Monat');
  nextBtn.onclick = function(){ weekCalMonthOffset++; rerenderFn(); };
  hdr.appendChild(prevBtn); hdr.appendChild(titleEl); hdr.appendChild(nextBtn);
  card.appendChild(hdr);

  var weekHdrRow = document.createElement('div');
  weekHdrRow.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:10px;';
  WEEK_DAYS.forEach(function(d){
    var c = document.createElement('div');
    c.style.cssText = 'text-align:center;font-size:11px;font-weight:700;color:var(--muted);';
    c.textContent = d;
    weekHdrRow.appendChild(c);
  });
  card.appendChild(weekHdrRow);

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:16px;';

  var totalCells = startOffset + daysInMonth;
  var trailingCells = (7 - (totalCells % 7)) % 7;
  var totalGridCells = totalCells + trailingCells;
  var dayCells = [];

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
    cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:6px 0;border-radius:12px;'+(inMonth?'cursor:pointer;':'');
    if(inMonth){
      dayCells.push({el:cell, dow:dowIdx});
      cell.onclick = function(dIdx){ return function(){ toggleCalDay(dIdx); }; }(dowIdx);
    }

    var numEl = document.createElement('div');
    numEl.style.cssText = 'width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:'+(isRealToday?'700':'600')+';'+
      (isRealToday ? 'background:var(--accent-deep);color:#fff;' : 'color:'+(inMonth?'var(--text)':'var(--muted)')+';opacity:'+(inMonth?'1':'0.4')+';');
    numEl.textContent = dateNum;
    cell.appendChild(numEl);

    var marker = document.createElement('div');
    marker.style.cssText = 'margin-top:4px;opacity:'+(inMonth?(hasW?'1':'0.5'):'0.25')+';';
    if(isSkillDay){
      marker.style.fontSize = '10px';
      marker.style.color = 'var(--accent-ink)';
      marker.textContent = '★';
    } else {
      marker.style.cssText += 'width:5px;height:5px;border-radius:50%;background:'+(hasW?'var(--accent)':'var(--muted)')+';';
    }
    cell.appendChild(marker);

    grid.appendChild(cell);
  }
  card.appendChild(grid);

  var legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;padding-top:12px;border-top:1px solid var(--border);';
  [{icon:'●',c:'var(--accent)',l:'Workout'},{icon:'★',c:'var(--accent-ink)',l:'Skill'},{icon:'●',c:'var(--muted)',l:'Ruhetag'}].forEach(function(li){
    var item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);';
    item.innerHTML = '<span style="color:'+li.c+';font-size:10px;">'+li.icon+'</span>'+li.l;
    legend.appendChild(item);
  });
  card.appendChild(legend);

  // Akkordeon-Physik (.acc-body): Der Körper bleibt IMMER im DOM — nur .open
  // schaltet auf/zu. Würde der Inhalt beim Schließen gelöscht, könnte die
  // Grid-Row nicht von 1fr auf 0fr fahren und das Panel schnappt hart zu.
  // Der Tag-Tap rendert die Karte deshalb auch nicht neu, sondern togglet am DOM.
  var detailPanel = document.createElement('div');
  detailPanel.className = 'acc-body';
  var detailInner = document.createElement('div');
  detailInner.style.cssText = 'padding-top:14px;';
  detailPanel.appendChild(detailInner);
  card.appendChild(detailPanel);

  function syncCalDayHighlight(){
    for(var q=0;q<dayCells.length;q++){
      dayCells[q].el.style.background = (weekCalExpandedDay===dayCells[q].dow) ? 'rgba(255,85,0,0.08)' : '';
    }
  }

  function openCalDetail(dIdx, animate){
    detailInner.innerHTML = '';
    buildInlineDayDetail(detailInner, dIdx, wp);
    try{ detailPanel.inert = false; }catch(e){}
    if(animate && window.caliMotion && !caliMotion.reduced()){
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        if(detailPanel.isConnected !== false) detailPanel.classList.add('open');
      }); });
    } else {
      detailPanel.classList.add('open');
    }
  }

  function toggleCalDay(dIdx){
    weekCalExpandedDay = (weekCalExpandedDay===dIdx) ? null : dIdx;
    syncCalDayHighlight();
    if(weekCalExpandedDay==null){
      // Inhalt stehen lassen — sonst gibt es nichts, was zusammenfahren könnte
      detailPanel.classList.remove('open');
      try{ detailPanel.inert = true; }catch(e){}
      return;
    }
    openCalDetail(weekCalExpandedDay, !detailPanel.classList.contains('open'));
  }

  syncCalDayHighlight();
  if(weekCalExpandedDay!=null){ openCalDetail(weekCalExpandedDay, true); }
  else { try{ detailPanel.inert = true; }catch(e){} }

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
    startBtn.className = 'pressable';
    startBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:11px;cursor:pointer;margin-bottom:8px;transition:transform var(--dur-fast) var(--ease-out);';
    startBtn.innerHTML = '▶ Workout starten';
    startBtn.onclick = function(){ startPlanById(firstPlan.id); };
    box.appendChild(startBtn);
  }

  var editBtn = document.createElement('button');
  editBtn.className = 'pressable';
  editBtn.style.cssText = 'width:100%;background:#fff;border:none;border-radius:10px;color:var(--muted);font-family:inherit;font-size:12px;font-weight:700;padding:10px;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.05);';
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
  progLbl.style.cssText = 'display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:8px;';
  progLbl.innerHTML = '<span>Fortschritt</span><span class="num" style="font-weight:700;color:var(--text);">'+done+' / '+goal+' Workouts &middot; '+pct+'%</span>';
  card.appendChild(progLbl);

  var track = document.createElement('div');
  track.style.cssText = 'height:8px;background:var(--bg3);border-radius:8px;overflow:hidden;margin-bottom:18px;';
  var bar = document.createElement('div');
  bar.style.cssText = 'height:100%;width:0%;background:var(--accent);border-radius:8px;transition:width var(--dur-slow) var(--ease-out);';
  track.appendChild(bar);
  card.appendChild(track);
  if(window.caliMotion) caliMotion.animateBar(bar, pct);
  else bar.style.width = pct+'%';

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
      '<div style="font-size:11px;color:var(--muted);margin-top:2px;">'+s.label+'</div>';
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
  textWrap.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--accent-ink);margin-bottom:2px;">Tipp der Woche</div>'+
    '<div style="font-size:13px;color:var(--text);line-height:1.5;">'+WEEK_TIPS[weekTipIdx]+'</div>';
  card.appendChild(textWrap);

  var moreBtn = document.createElement('button');
  moreBtn.className = 'pressable';
  moreBtn.style.cssText = 'background:none;border:none;color:var(--accent-ink);font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:transform var(--dur-fast) var(--ease-out);';
  moreBtn.innerHTML = 'Mehr Tipps →';
  moreBtn.onclick = function(){ weekTipIdx = (weekTipIdx+1) % WEEK_TIPS.length; buildWeekPlan(); };
  card.appendChild(moreBtn);

  container.appendChild(card);
}

function getPlanById(id){
  // String-Vergleich: Plan-IDs sind Zahlen, aber aus <select>/localStorage kommen Strings
  for(var i=0;i<plans.length;i++){ if(String(plans[i].id)===String(id)) return plans[i]; }
  for(var i=0;i<PRESET_PLANS.length;i++){ if('preset_'+i===String(id)) return {id:'preset_'+i, name:PRESET_PLANS[i].name, exercises:PRESET_PLANS[i].exercises}; }
  return null;
}

function openDayEditor(dayIdx, calScroll){
  var wp = getWeekPlan();
  var dayPlans = wp[dayIdx] || [];

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:20px 20px 40px;max-height:80vh;overflow-y:auto;';
  box.classList.add('sheet-scroll');

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
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg2);border-radius:10px;margin-bottom:8px;box-shadow:0 8px 20px rgba(0,0,0,0.05);';
        row.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--text);">'+plan.name+'</div>';
        var delBtn = document.createElement('button');
        delBtn.className = 'pressable';
        delBtn.style.cssText = 'background:rgba(217,48,54,0.08);color:var(--red);border:1px solid rgba(217,48,54,0.2);border-radius:10px;font-size:11px;font-weight:700;padding:6px 10px;cursor:pointer;font-family:inherit;transition:transform var(--dur-fast) var(--ease-out);';
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
    sel.style.cssText = 'width:100%;padding:12px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:var(--bg2);color:var(--text);margin-bottom:10px;box-sizing:border-box;';
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
    addBtn.className = 'pressable';
    addBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:13px;cursor:pointer;margin-bottom:12px;transition:transform var(--dur-fast) var(--ease-out);';
    addBtn.textContent = '+ Hinzufügen';
    addBtn.onclick = function(){
      if(!sel.value) return;
      // Eigene Plan-IDs sind Zahlen — den <select>-String vor dem Speichern zurückwandeln,
      // sonst findet getPlanById den Plan nie ('1723…' !== 1723…)
      var v = sel.value;
      if(v.indexOf('preset_')!==0 && !isNaN(parseInt(v,10))) v = parseInt(v,10);
      dayPlans.push(v);
      wp[dayIdx] = dayPlans;
      saveWeekPlan(wp);
      renderBox();
      buildWeekPlan();
      if(calScroll) renderDayList(calScroll, dayIdx);
    };
    box.appendChild(addBtn);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'pressable';
    closeBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;font-weight:700;padding:8px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
    closeBtn.textContent = 'Schließen';
    closeBtn.onclick = function(){ sheetOut(ov, box); };
    box.appendChild(closeBtn);
  }

  renderBox();
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) sheetOut(ov, box); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}
