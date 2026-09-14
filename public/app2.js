
// ── SHARED SHEET / CELEBRATION HELPERS ────────────────────
// Dark-Mono-Bausteine (Design-Contract v2). Farben nur über var(--…).
// Line-Icon aus CALI_ICONS in fester Pixelgröße; der Inline-Style erzwingt
// currentColor/Stroke 1.5 und schlägt die im Icon-Sheet hinterlegten Farb-Attribute.
function planLineIcon(name, px){
  var svg = (typeof ci==='function') ? ci(name) : '';
  return svg.replace('style="display:block;"', 'style="display:block;width:'+px+'px;height:'+px+'px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;"');
}
// 44px-Ring (1px --line2) mit Line-Icon — ersetzt die alten getönten Icon-Kacheln.
function planIconRing(name, box, px, color){
  box = box || 44; px = px || 18;
  return '<span style="width:'+box+'px;height:'+box+'px;border-radius:50%;border:1px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;color:'+(color||'var(--muted)')+';">'+planLineIcon(name, px)+'</span>';
}
// Segmentierter Fortschrittsbalken (4px-Quadrate, 2px Lücke) mit echtem
// Füll-Element, damit caliMotion.animateBar (setzt style.width) weiter greift.
function planSegbarHTML(attr){
  return '<div style="position:relative;height:6px;background:repeating-linear-gradient(90deg,var(--line2) 0 4px,transparent 4px 6px);">'+
    '<div '+(attr||'')+' style="position:absolute;inset:0;width:0%;max-width:100%;background:repeating-linear-gradient(90deg,var(--accent) 0 4px,transparent 4px 6px);transition:width var(--dur-slow) var(--ease-out);"></div></div>';
}
// Backdrop (§5.15) — z-index je Aufrufer anhängen.
var PLAN_BACKDROP_CSS = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:flex-end;justify-content:center;';
// Kleiner Tag/Chip in Zeilen (§5.13).
var PLAN_TAG_CSS = 'background:var(--card2);border:1px solid var(--line);border-radius:var(--r-sm);padding:2px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap;';
// Text-Button ohne Fläche (Abbrechen/Schließen unter einem Sheet-CTA).
var PLAN_TEXTBTN_CSS = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:11px;font-weight:600;padding:12px;cursor:pointer;';
function planSheetGrip(){
  var g = document.createElement('div');
  g.className = 'sheet-grip';
  return g;
}

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
  ov.style.cssText = PLAN_BACKDROP_CSS+'z-index:2600;';
  var box = document.createElement('div');
  box.className = 'sheet';
  box.appendChild(planSheetGrip());
  var title = document.createElement('div');
  title.className = 'ttl';
  title.style.cssText = 'margin-bottom:'+(opts.desc?'6px':'18px')+';';
  title.textContent = opts.title || 'Bist du sicher?';
  box.appendChild(title);
  if(opts.desc){
    var sub = document.createElement('div');
    sub.style.cssText = 'font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:18px;';
    sub.textContent = opts.desc;
    box.appendChild(sub);
  }
  var okBtn = document.createElement('button');
  // Destruktiv (Standard) = roter Ghost-Button; danger:false = der eine orangene Primär-CTA
  okBtn.className = (opts.danger===false ? 'btn' : 'btn-g danger') + ' pressable';
  okBtn.style.cssText = 'width:100%;min-height:48px;margin:0 0 4px;';
  okBtn.textContent = opts.confirmLabel || 'Bestätigen';
  okBtn.onclick = function(){ sheetOut(ov, box); if(typeof opts.onConfirm==='function') opts.onConfirm(); };
  box.appendChild(okBtn);
  var cancelBtn = document.createElement('button');
  cancelBtn.className = 'pressable u';
  cancelBtn.style.cssText = PLAN_TEXTBTN_CSS;
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
  // Icon-Slot: Line-Icon statt Emoji. Aufrufer aus anderen Dateien übergeben noch
  // Emoji in opts.icon — die werden ignoriert; ein CALI_ICONS-Name (opts.iconName
  // oder opts.icon) wird gerendert, sonst der Pokal.
  var icoName = opts.iconName || ((typeof CALI_ICONS!=='undefined' && CALI_ICONS[opts.icon]) ? opts.icon : 'trophy');
  ov.innerHTML =
    '<div style="text-align:center;padding:0 24px;max-width:480px;">'+
      '<div style="display:flex;justify-content:center;margin-bottom:18px;">'+planIconRing(icoName, 64, 26, 'var(--accent)')+'</div>'+
      '<div class="lbl" style="color:var(--accent);margin-bottom:10px;">'+(opts.title||'')+'</div>'+
      (opts.big?'<div class="kpi lg num" style="line-height:1.15;margin-bottom:8px;word-break:break-word;">'+opts.big+'</div>':'')+
      (opts.sub?'<div style="font-size:11px;color:var(--muted);line-height:1.5;">'+opts.sub+'</div>':'')+
      (opts.note?'<div class="u num" style="font-size:11px;font-weight:600;color:var(--accent);margin-top:12px;">'+opts.note+'</div>':'')+
      '<div class="lbl" style="color:var(--muted2);margin-top:22px;">Tippen um fortzufahren</div>'+
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
  // Satznummern zweistellig in --muted2 (.snum) — keine Farbkodierung mehr
  var h='';
  for(var i=0;i<pfSets.length;i++){
    h+='<div class="sr">';
    h+='<div class="snum num">'+('0'+(i+1)).slice(-2)+'</div>';
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

  // Chevron rechts im Karten-Kopf: togglePlanExpand dreht ihn (Selektor
  // '.plan-top div:last-child div:last-child' — deshalb ein <div>, kein .row-chev-Span)
  var PLAN_CHEV='<div aria-hidden="true" style="color:var(--muted2);font-size:16px;line-height:1;transition:transform var(--dur-fast) var(--ease-out);">&#8250;</div>';
  // Zweistelliger Index je Sektion ("01", "02" …) wie auf Home (#plan-btns.numbered). Bewusst als
  // <span> direkt in .plan-top statt .numbered-Wrapper: der CSS-Counter würde auf dem Karten-Root
  // feuern (eigene Zeile über .plan-top), und ein <span> lässt den Chevron-Selektor oben unberührt.
  var planIdx=function(n){ return '<span class="idx num">'+('0'+(n+1)).slice(-2)+'</span>'; };

  // MY PLANS section — eigene Pläne stehen vor den Vorlagen
  h+='<h2 class="stitle" style="margin:0 0 8px;">Meine Pläne</h2>';
  if(plans.length){
    for(var i=0;i<plans.length;i++){
      var pl=plans[i];
      h+='<div class="plan-card pressable" style="cursor:pointer;" role="button" tabindex="0" onclick="togglePlanExpand(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();togglePlanExpand(this);}">';
      h+='<div class="plan-top">'+planIdx(i)+'<div class="plan-name" style="flex:1;min-width:0;">'+pl.name+'</div>';
      h+='<div style="display:flex;align-items:center;gap:10px;flex-shrink:0;"><div class="row-sub num" style="margin:0;">'+pl.exercises.length+' Übungen</div>'+PLAN_CHEV+'</div></div>';
      h+='<div class="plan-ex-detail acc-body"><div><div style="height:6px;"></div>';
      for(var j=0;j<pl.exercises.length;j++){
        var ex=pl.exercises[j];var col=COLS[ex.col]||COLS.gr;
        var st='';for(var k=0;k<ex.sets.length;k++){if(k>0)st+=' · ';st+='S'+(k+1)+': '+ex.sets[k].n+' '+ex.unit;}
        h+='<div class="plan-exrow"><div class="plan-dot" style="background:'+col+'"></div><div class="plan-exname">'+ex.name+'</div><div class="plan-exsets num">'+st+'</div></div>';
      }
      // Sekundär-CTA (hell): der eine orangene Primär-CTA der Pläne-Seite ist "Workout starten" in der Heute-Karte
      h+='<div class="plan-actions" style="margin-top:12px;">';
      h+='<button class="btn sec pressable" style="flex:1;margin:0;min-height:40px;font-size:11px;padding:0 14px;" onclick="event.stopPropagation();startPlanById('+pl.id+')">Starten</button>';
      h+='<button class="plan-del-btn pressable" onclick="event.stopPropagation();deletePlan('+pl.id+')">Löschen</button>';
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
    h+='<div class="plan-card pressable" style="opacity:'+(alreadyAdded?'0.5':'1')+';cursor:pointer;" role="button" tabindex="0" onclick="togglePlanExpand(this)" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();togglePlanExpand(this);}">';
    h+='<div class="plan-top">'+planIdx(pi)+'<div class="plan-name" style="color:var(--muted);flex:1;min-width:0;">'+pl.name+'</div>';
    h+='<div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">';
    h+='<div class="row-sub num" style="margin:0;">'+pl.exercises.length+' Übungen</div>';
    h+='<div style="'+PLAN_TAG_CSS+'">Vorlage</div>';
    h+=PLAN_CHEV+'</div></div>';
    // Exercises hidden by default (accordion physics via .acc-body)
    h+='<div class="plan-ex-detail acc-body"><div><div style="height:6px;"></div>';
    for(var j=0;j<pl.exercises.length;j++){
      var pex=pl.exercises[j];var pcol=COLS[pex.col]||COLS.gr;
      var pst='';for(var k=0;k<pex.sets.length;k++){if(k>0)pst+=' · ';pst+='S'+(k+1)+': '+pex.sets[k].n+' '+pex.unit;}
      h+='<div class="plan-exrow"><div class="plan-dot" style="background:'+pcol+'"></div><div class="plan-exname">'+pex.name+'</div><div class="plan-exsets num">'+pst+'</div></div>';
    }
    h+='<div class="plan-actions" style="margin-top:12px;">';
    if(alreadyAdded){
      h+='<button class="plan-del-btn pressable" onclick="event.stopPropagation();removePresetFromMyPlans('+pi+')">Entfernen</button>';
    } else {
      h+='<button class="btn-g pressable" style="flex:1;min-height:40px;" onclick="event.stopPropagation();addPresetToMyPlans('+pi+')">+ Hinzufügen</button>';
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
    // Leerzustand: .pk-card OHNE role="button" → von der CSS-Nummerierung ausgenommen
    var emptyCard=document.createElement('div');
    emptyCard.className='pk-card';
    emptyCard.style.cssText='display:flex;align-items:center;gap:14px;padding:14px;';
    emptyCard.innerHTML=
      iconWrap('calendar',{size:20,box:44})+
      '<div style="flex:1;min-width:0;">'+
        '<div class="row-title">Noch keine Pläne</div>'+
        '<div class="row-sub" style="margin-bottom:10px;">Erstelle einen Plan oder nutze eine Vorlage.</div>'+
        '<button class="btn-g pressable" onclick="goPage(\'p\')">Zu den Plänen</button>'+
      '</div>';
    el.appendChild(emptyCard);
    return;
  }
  // #plan-btns ist .numbered → jede Karte bekommt "01", "02" … per CSS-Counter (kein eigener Index)
  for(var i=0;i<plans.length;i++){
    (function(pl){
      var totalSets=0;
      for(var s=0;s<pl.exercises.length;s++){ totalSets+=(pl.exercises[s].sets||[]).length; }
      var tags=getPlanCategoryTags(pl);

      var card=document.createElement('div');
      card.className='pk-card pressable';
      card.style.cssText='display:flex;align-items:center;gap:12px;padding:12px 14px;min-height:52px;cursor:pointer;';
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      card.setAttribute('aria-label',pl.name+' starten');
      card.onclick=function(){startPlanById(pl.id);};
      card.onkeydown=function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();startPlanById(pl.id);}};

      var icon=document.createElement('div');
      icon.style.cssText='display:flex;flex-shrink:0;';
      icon.innerHTML=planIconRing('dumbbell');

      var info=document.createElement('div');
      info.className='row-main';
      var nameRow=document.createElement('div');
      nameRow.className='row-title';
      nameRow.textContent=pl.name;
      var metaRow=document.createElement('div');
      metaRow.className='row-sub num';
      metaRow.textContent=pl.exercises.length+' Übungen · '+totalSets+' Sätze';
      info.appendChild(nameRow); info.appendChild(metaRow);
      if(tags.length){
        var tagRow=document.createElement('div');
        tagRow.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;';
        tags.forEach(function(t){
          var chip=document.createElement('div');
          chip.style.cssText=PLAN_TAG_CSS;
          chip.textContent=t;
          tagRow.appendChild(chip);
        });
        info.appendChild(tagRow);
      }

      var chevron=document.createElement('span');
      chevron.className='row-chev';
      chevron.setAttribute('aria-hidden','true');

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
      var woList=(typeof _woExListEl==='function')?_woExListEl():document.getElementById('wo-ex-list');
      if(woList) woList.innerHTML='<div class="empty" id="wo-empty">Noch keine Übungen hinzugefügt.</div>';
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
      iconName:'trophy',
      title:'Neuer Rekord!',
      big: val+' '+parts[1],
      sub: parts[0]+' · Vorher: '+prevBestRaw+' '+parts[1],
      note:'+1 Diamant'
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
  // Nummerierte Zeilen (zweistelliger Index) innerhalb der #max-list-Karte:
  // Index · Übung + Datum · Wert 22px + Einheit · Löschen
  var h='';
  for(var i=0;i<filtered.length;i++){
    var e=filtered[i];
    // Nur reine Zahlenwerte zählen hoch — 'Min:Sek'-Werte (z.B. 1:30) bleiben statisch
    var rawVal=String(e.val).trim();
    var countable=!(e.unit==='Min:Sek'&&rawVal.indexOf(':')>-1)&&/^[0-9]+(\.[0-9]+)?$/.test(rawVal);
    var dec=(countable&&rawVal.indexOf('.')>-1)?rawVal.split('.')[1].length:0;
    var last=(i===filtered.length-1);
    h+='<div style="display:flex;align-items:center;gap:12px;min-height:52px;padding:'+(i===0?'0':'10px')+' 0 '+(last?'0':'10px')+';'+(last?'':'border-bottom:1px solid var(--line);')+'">';
    h+='<span class="row-index num">'+('0'+(i+1)).slice(-2)+'</span>';
    h+='<div class="row-main"><div class="row-title">'+e.name+'</div><div class="ed num" style="margin-top:2px;">'+e.date.slice(5).replace('-','.')+'</div></div>';
    h+='<div class="num" style="font-size:22px;font-weight:600;color:var(--text);line-height:1;flex-shrink:0;display:flex;align-items:baseline;gap:6px;">'+(countable?'<span data-maxcu="'+rawVal+'" data-maxdec="'+dec+'" data-maxid="'+e.id+'">'+e.val+'</span>':'<span>'+e.val+'</span>')+'<span class="unit">'+e.unit+'</span></div>';
    h+='<button class="edel pressable" aria-label="Eintrag löschen" style="align-self:center;flex-shrink:0;" onclick="delMaxEntry('+e.id+')">&#x2715;</button>';
    h+='</div>';
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
  // Dark-Mono-Chart (§5.16): Chart.js liest keine CSS-Variablen → --accent per getComputedStyle;
  // Grid-/Tick-Graus sind die Chart-Only-Werte der Spec (nur hier als Chart.js-Optionen erlaubt).
  var cs=getComputedStyle(document.documentElement);
  var ACC=(cs.getPropertyValue('--accent')||'').trim()||'#FF5A1F';
  var MONO='JetBrains Mono';
  // Kein maintainAspectRatio:false — das Canvas hat keinen Container mit fester Höhe
  // (pages.html), die Standard-Aspect-Ratio hält den Chart sichtbar.
  maxChart2=new Chart(cv,{
    type:'line',
    data:{labels:lbls,datasets:[{data:vals,borderColor:ACC,pointBackgroundColor:ACC,pointBorderColor:ACC,pointRadius:3,pointHoverRadius:4,borderWidth:1.5,fill:false,tension:0}]},
    options:{responsive:true,
      plugins:{legend:{display:false},tooltip:{backgroundColor:'#1B1B1B',borderColor:'#333333',borderWidth:1,titleColor:'#F2F2F2',bodyColor:'#9A9A9A',titleFont:{family:MONO,size:10},bodyFont:{family:MONO,size:11},displayColors:false}},
      scales:{
        x:{grid:{color:'#1E1E1E',borderColor:'#262626'},ticks:{color:'#6E6E6E',font:{family:MONO,size:9}}},
        y:{grid:{color:'#1E1E1E',borderColor:'#262626'},ticks:{color:'#6E6E6E',font:{family:MONO,size:9}},beginAtZero:false}
      }}
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

// Einheiten-Label hinter der Fortschrittszahl ("12 / 30 Tage") — kommt aus
// activeChallenge.params.unit (Preset-Feld). Ohne unit bleibt die Anzeige wie bisher.
function chUnitLabel(){
  var u = activeChallenge && activeChallenge.params && activeChallenge.params.unit;
  return u ? ' '+u : '';
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

  // ── Session-Metriken der Preset-Challenges (p9–p22) ──
  // Alle gruppieren nach sessionKey und zählen nur Einheiten ab Challenge-Start (sinceStr),
  // damit eine heute angenommene Challenge nicht durch alte Daten sofort erledigt ist.
  // Wdh-Einträge zählen als Wiederholungen, Sek-Einträge als Sekunden.
  // EMOM-Einträge (main2bb.js) haben kein unit-Feld → Einheit aus EX_DB, sonst 'Wdh'.
  function entUnit(e){ if(e.unit) return e.unit; for(var k=0;k<EX_DB.length;k++){ if(EX_DB[k].name===e.name) return EX_DB[k].unit||'Wdh'; } return 'Wdh'; }
  function partsOf(){ var arr=p.parts; if(!arr||!arr.length) return []; var out=[]; for(var k=0;k<arr.length;k++){ var pt=arr[k]||{}; var n=parseFloat(pt.n); if(!pt.ex||!(n>0)) continue; out.push({ex:pt.ex, n:n}); } return out; }
  // Pro Session: Volumen je Übung (Wdh) + bekannte Dauer (Sekunden)
  function sessionVolumes(onlyUnit){
    var sess={};
    for(var i=0;i<ents.length;i++){
      var e=ents[i];
      if(!e||!e.date||e.date<sinceStr) continue;
      if(onlyUnit && entUnit(e)!==onlyUnit) continue;
      var sk=sessionKey(e);
      var s=sess[sk]||(sess[sk]={vol:{}, all:0, dur:0});
      var v=setSum(e);
      s.vol[e.name]=(s.vol[e.name]||0)+v;
      s.all+=v;
      var d=parseFloat(e.dur);
      if(d>0 && d>s.dur) s.dur=d;
    }
    return sess;
  }
  function volMatching(s, exName){ var t=0; for(var nm in s.vol){ if(s.vol.hasOwnProperty(nm) && nameMatches(nm, exName)) t+=s.vol[nm]; } return t; }

  if(metric==='volume_session_ex'){
    // Wdh einer Übung (oder aller Wdh-Übungen ohne exName) in einer Einheit — Bestwert seit Start
    var sessA=sessionVolumes('Wdh');
    var bestA=0;
    for(var ka in sessA){
      if(!sessA.hasOwnProperty(ka)) continue;
      var vA=p.exName ? volMatching(sessA[ka], p.exName) : sessA[ka].all;
      if(vA>bestA) bestA=vA;
    }
    return Math.round(bestA);
  }
  if(metric==='multi_volume_session'){
    // Summe über parts von min(Volumen der Übung in der Einheit, Soll) — Bestwert seit Start
    var partsB=partsOf();
    if(!partsB.length) return 0;
    var sessB=sessionVolumes('Wdh');
    var bestB=0;
    for(var kb in sessB){
      if(!sessB.hasOwnProperty(kb)) continue;
      var sumB=0;
      for(var pb=0;pb<partsB.length;pb++){ sumB+=Math.min(volMatching(sessB[kb], partsB[pb].ex), partsB[pb].n); }
      if(sumB>bestB) bestB=sumB;
    }
    return Math.round(bestB);
  }
  if(metric==='rounds_in_session'){
    // Runden = min über parts von floor(Volumen / Soll); Sessions über maxDur (falls Dauer bekannt) zählen nicht
    var partsC=partsOf();
    if(!partsC.length) return 0;
    var sessC=sessionVolumes('Wdh');
    var maxDur=parseFloat(p.maxDur);
    var bestC=0;
    for(var kc in sessC){
      if(!sessC.hasOwnProperty(kc)) continue;
      if(maxDur>0 && sessC[kc].dur>0 && sessC[kc].dur>maxDur) continue;
      var rounds=Infinity;
      for(var pc=0;pc<partsC.length;pc++){
        var r=Math.floor(volMatching(sessC[kc], partsC[pc].ex)/partsC[pc].n);
        if(r<rounds) rounds=r;
      }
      if(rounds!==Infinity && rounds>bestC) bestC=rounds;
    }
    return bestC;
  }
  if(metric==='days_with_volume'){
    // Tage seit Start, an denen das Tagesvolumen der Übung (Wdh oder Sek je Eintrag) >= perDay liegt
    var perDay=parseFloat(p.perDay);
    if(!(perDay>0)||!p.exName) return 0;
    var perDate={};
    for(var i=0;i<ents.length;i++){
      var eD=ents[i];
      if(!eD||!eD.date||eD.date<sinceStr) continue;
      if(!nameMatches(eD.name, p.exName)) continue;
      var uD=entUnit(eD);
      if(uD!=='Wdh' && uD!=='Sek') continue;
      perDate[eD.date]=(perDate[eD.date]||0)+setSum(eD);
    }
    var daysCnt=0;
    for(var kd in perDate){ if(perDate.hasOwnProperty(kd) && perDate[kd]>=perDay) daysCnt++; }
    return daysCnt;
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
    toast('Nicht genug: du brauchst 1 Diamant oder 50 Flammen zum Skippen.');
  }
}

function showSkipModal(){
  var ex = document.getElementById('skip-currency-modal');
  if(ex) ex.remove();
  var modal = document.createElement('div');
  modal.id = 'skip-currency-modal';
  modal.style.cssText = PLAN_BACKDROP_CSS+'z-index:2000;';

  var box = document.createElement('div');
  box.className = 'sheet';
  box.appendChild(planSheetGrip());

  var title = document.createElement('div');
  title.className = 'ttl';
  title.style.cssText = 'margin-bottom:6px;';
  title.textContent = 'Challenge skippen?';

  var sub = document.createElement('div');
  sub.style.cssText = 'font-size:11px;color:var(--muted);margin-bottom:18px;line-height:1.5;';
  sub.textContent = 'Kostet 1 Diamant oder 50 Flammen. Du hast: '+currency.diamonds+' Diamanten \u00B7 '+currency.flames+' Flammen';

  function doSkip(costLabel){
    activeChallenge=null; saveChallenges(); buildChallengeUI();
    sheetOut(modal, box);
    toast('Challenge geskippt: '+costLabel);
  }

  // Zwei gleichwertige Zahlwege: heller Sekundär-CTA (Diamant) + Ghost (Flammen);
  // nicht bezahlbar → disabled (Opazität .5, kein onclick)
  var canDiamond = currency.diamonds >= 1;
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn sec pressable';
  btn.style.cssText = 'margin:0 0 8px;';
  btn.textContent = '1 Diamant \u2014 skippen';
  if(canDiamond){ btn.onclick = function(){ currency.diamonds -= 1; saveCurrency(); doSkip('-1 Diamant'); }; }
  else { btn.disabled = true; }

  // Flammen-Preis: der im Skip-Label versprochene zweite Zahlweg
  var canFlames = currency.flames >= 50;
  var flameBtn = document.createElement('button');
  flameBtn.type = 'button';
  flameBtn.className = 'btn-g pressable';
  flameBtn.style.cssText = 'width:100%;min-height:44px;margin-bottom:4px;'+(canFlames?'':'opacity:.5;cursor:default;');
  flameBtn.textContent = '50 Flammen \u2014 skippen';
  if(canFlames){ flameBtn.onclick = function(){ currency.flames -= 50; saveCurrency(); doSkip('-50 Flammen'); }; }
  else { flameBtn.disabled = true; }

  var cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'pressable u';
  cancel.style.cssText = PLAN_TEXTBTN_CSS;
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
  // Reiner Text ohne Emoji-Pr\u00E4fix (Badge im Profil, main2ba.js)
  return currency.flames+' Flammen \u00B7 '+currency.diamonds+' Diamanten';
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

// Foto für die Challenge-Hauptkarte (Grayscale + Verlauf per .ch-photo in tracker.html):
// Preset-Bild wenn vorhanden, sonst deterministisch aus den vorhandenen challenge-*.jpg
// (Community wie in renderTrendingCard → Handstand). Nur Deko, keine Inhalte.
function chPhotoFor(ch){
  if(!ch) return null;
  if(typeof PRESET_CHALLENGES !== 'undefined'){
    for(var i=0;i<PRESET_CHALLENGES.length;i++){
      if(PRESET_CHALLENGES[i].id === ch.id && PRESET_CHALLENGES[i].image) return PRESET_CHALLENGES[i].image;
    }
  }
  if(ch.type === 'community') return '/challenge-p22.jpg';
  var key = ((ch.params && ch.params.exName) || '')+' '+(ch.title || '');
  if(/dip/i.test(key)) return '/challenge-p4.jpg';
  if(/handstand|balance|skill/i.test(key)) return '/challenge-p22.jpg';
  return '/challenge-p1.jpg';
}

function buildChCardPersonal(){
  var el = document.getElementById('ch-card-personal-inner');
  if(!el) return;
  if(!activeChallenge){
    el.innerHTML =
      '<div class="ttl" style="margin-bottom:4px;">Keine aktiv</div>'+
      '<div class="row-sub">Tippe um eine Challenge zu generieren</div>';
  } else {
    var prog = calcChallengeProgress();
    var target = activeChallenge.params.target || 1;
    var pct = Math.min(100, Math.round((prog/target)*100));
    var done = pct >= 100;
    var photo = chPhotoFor(activeChallenge);
    // Grayscale-Foto oben (§Challenges), Titel + Ring-Icon (Line-Icon statt gefülltem Pokal),
    // darunter Segmentbalken + echte Zahlen
    el.innerHTML =
      (photo ? '<div class="ch-photo" style="height:120px;"><img src="'+photo+'" alt="" loading="lazy"></div>' : '')+
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;">'+
        '<div class="ttl" style="min-width:0;">'+activeChallenge.title+'</div>'+
        planIconRing('trophy', 44, 18, done?'var(--accent)':'var(--muted)')+
      '</div>'+
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">'+
        '<div style="flex:1;">'+planSegbarHTML('data-chbar')+'</div>'+
        '<div class="num" style="font-size:11px;font-weight:600;color:var(--accent);flex-shrink:0;">'+pct+'%</div>'+
      '</div>'+
      '<div class="row-sub num" style="margin:0;">'+prog+' / '+target+chUnitLabel()+' abgeschlossen'+(done?' &nbsp;<span style="color:var(--accent);font-weight:600;">Geschafft!</span>':'')+'</div>';
    var pFill = el.querySelector('[data-chbar]');
    if(pFill){
      if(window.caliMotion) caliMotion.animateBar(pFill, pct);
      else pFill.style.width = pct+'%';
    }
  }
}

// ---- Challenge-Kacheln (Katalog-Galerie, Detail-Hero, Übersichtsstreifen) ----
// Bildebene: Preset-Foto (Grayscale per .ch-tile-img) oder Fallback mit großem
// Index + Schraffur. Alle drei Verwendungen teilen sich die Klassen aus tracker.html,
// damit Kacheln mit und ohne Bild gleich "gewollt" aussehen.

// Zweistelliger Index des Presets in der Gesamtliste ('07'), '' für Unbekanntes.
function presetIndexLabel(ch){
  var i = PRESET_CHALLENGES.indexOf(ch);
  if(i < 0) return '';
  return (i + 1 < 10 ? '0' : '') + (i + 1);
}

// Schwierigkeit als 4 kleine Quadrate (bis ch.level gefüllt).
function chLevelDots(ch){
  var wrap = document.createElement('div');
  wrap.className = 'ch-lvl';
  wrap.setAttribute('aria-label', presetLevelLabel(ch));
  wrap.setAttribute('role', 'img');
  for(var i=1;i<=4;i++){
    var d = document.createElement('i');
    if(i <= (ch.level || 0)) d.className = 'on';
    wrap.appendChild(d);
  }
  return wrap;
}

// Bild- oder Fallback-Ebene + Verlauf in den Container hängen.
function chTileArt(container, ch){
  if(ch.image){
    var img = document.createElement('img');
    img.className = 'ch-tile-img';
    img.src = ch.image;
    img.alt = '';
    img.setAttribute('loading', 'lazy');
    container.appendChild(img);
  } else {
    var fb = document.createElement('div');
    fb.className = 'ch-tile-fallback';
    var idx = document.createElement('i');
    idx.className = 'dotnum';
    idx.textContent = presetIndexLabel(ch);
    fb.appendChild(idx);
    container.appendChild(fb);
  }
  var shade = document.createElement('div');
  shade.className = 'ch-tile-shade';
  container.appendChild(shade);
}

function buildChCardPreset(){
  var el = document.getElementById('ch-card-preset-inner');
  if(!el) return;
  el.innerHTML =
    '<div class="kpi-row" style="display:flex;align-items:baseline;gap:6px;margin-bottom:10px;"><span class="kpi num" style="font-size:22px;">'+PRESET_CHALLENGES.length+'</span><span class="unit">Challenges</span></div>';
  // Streifen aus 3 kleinen Kacheln (Foto oder Index-Fallback) statt Textzeilen
  var strip = document.createElement('div');
  strip.className = 'ch-strip';
  strip.setAttribute('aria-hidden', 'true');
  PRESET_CHALLENGES.slice(0,3).forEach(function(c){
    var t = document.createElement('div');
    t.className = 'ch-strip-tile';
    chTileArt(t, c);
    strip.appendChild(t);
  });
  el.appendChild(strip);
  var more = document.createElement('div');
  more.className = 'row-sub num';
  more.style.cssText = 'margin:0;';
  more.textContent = '+ '+(PRESET_CHALLENGES.length-3)+' weitere';
  el.appendChild(more);
}

function buildChCardCommunity(){
  var el = document.getElementById('ch-card-community-inner');
  if(!el) return;
  // Kein hartes '0 Challenges' vor dem Firestore-Ergebnis — Ladezustand bzw. Login-Hinweis
  // Erstes <div> bleibt der Titel — der Firestore-Callback unten schreibt per querySelector('div') hinein
  el.innerHTML =
    '<div class="num" style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:6px;">'+(currentUser?'… Challenges':'Community')+'</div>'+
    '<div class="row-sub" style="margin:0 0 10px;">'+(currentUser?'Von Athleten erstellt & bewertet':'Einloggen um Challenges zu sehen')+'</div>'+
    '<div id="ch-community-creators" style="display:flex;align-items:center;margin-bottom:10px;min-height:24px;"></div>'+
    '<button type="button" class="btn-g pressable" onclick="event.stopPropagation();showCommPostModal();" style="min-height:32px;padding:0 12px;font-size:10px;">+ Posten</button>';
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
    el.innerHTML = '<div class="card" style="margin:0;text-align:center;font-size:11px;color:var(--muted);line-height:1.5;">Noch keine Trends — probiere Challenges aus, um sie hier zu sehen!</div>';
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
    el.innerHTML = '<div class="row-sub" style="margin:0;padding:12px 0;">Einloggen um beliebte Challenges zu sehen.</div>';
    return;
  }
  if(trendingCache && (Date.now() - trendingCacheTime) < 300000){
    renderTrendingList(el, trendingCache);
    return;
  }
  el.innerHTML = '<div class="row-sub" style="margin:0;padding:12px 0;">Wird geladen…</div>';

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
  var isCommunity = id.indexOf('comm_') === 0;
  var photoUrl = null;
  if(isCommunity){
    photoUrl = '/challenge-p22.jpg';
  } else {
    for(var i=0;i<PRESET_CHALLENGES.length;i++){
      if(PRESET_CHALLENGES[i].id === id){ meta = PRESET_CHALLENGES[i]; break; }
    }
    if(!meta) return; // stats doc without resolvable metadata — skip silently
    photoUrl = meta.image || null;
  }

  var participantUids = stats.participantUids || [];
  var views = stats.views || 0;

  var card = document.createElement('div');
  card.className = 'ch-card pressable';
  card.style.cssText = 'padding:0;margin:0;width:100%;cursor:pointer;';
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

  // Foto-Kopf (.ch-photo → Grayscale + Verlauf per CSS); ohne Foto ein Ring-Icon auf --card2.
  // Aufruf-Tag oben links liegt über dem ::after-Verlauf (z-index).
  var header = document.createElement('div');
  if(photoUrl){
    header.className = 'ch-photo';
    header.style.cssText = 'height:130px;margin:0;border-radius:0;';
    header.innerHTML = '<img src="'+photoUrl+'" alt="" loading="lazy">';
  } else {
    header.style.cssText = 'background:var(--card2);border-bottom:1px solid var(--line);padding:20px;position:relative;display:flex;justify-content:center;';
    header.innerHTML = planIconRing(isCommunity ? 'star' : 'trophy', 44, 18, 'var(--muted)');
  }
  var viewsTag = document.createElement('div');
  viewsTag.className = 'num';
  viewsTag.style.cssText = PLAN_TAG_CSS+'position:absolute;top:10px;left:10px;z-index:1;background:var(--card);display:inline-flex;align-items:center;gap:5px;';
  viewsTag.innerHTML = '<span style="display:inline-flex;width:11px;height:11px;color:var(--accent);">'+planLineIcon('flame', 11)+'</span>'+views;
  header.appendChild(viewsTag);
  card.appendChild(header);

  var body = document.createElement('div');
  body.style.cssText = 'padding:14px;';
  var titleEl = document.createElement('div');
  titleEl.className = 'ttl';
  titleEl.style.cssText = 'margin-bottom:4px;';
  titleEl.textContent = isCommunity ? 'Wird geladen…' : meta.title;
  var descEl = document.createElement('div');
  descEl.className = 'row-sub';
  descEl.style.cssText = 'margin:0 0 10px;';
  descEl.textContent = isCommunity ? '' : (meta.desc||'');
  body.appendChild(titleEl);
  body.appendChild(descEl);

  var footer = document.createElement('div');
  footer.style.cssText = 'display:flex;align-items:center;justify-content:space-between;';

  var countEl = document.createElement('div');
  countEl.className = 'row-sub num';
  countEl.style.cssText = 'margin:0;display:flex;align-items:center;gap:6px;';
  countEl.innerHTML = '<span style="display:inline-flex;width:14px;height:14px;color:var(--muted);">'+planLineIcon('people', 14)+'</span>'+participantUids.length+' Teilnehmer';
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
  // Gestapelte 24px-Avatare: Ring 1px --line2, Trennung zum Nachbarn über --bg-Rand; Fotos grayscale (§6)
  shown.forEach(function(uid, i){
    var av = document.createElement('div');
    av.style.cssText = 'width:24px;height:24px;border-radius:50%;background:var(--card2);border:1px solid var(--line2);outline:2px solid var(--bg);margin-left:'+(i>0?'-8px':'0')+';display:flex;align-items:center;justify-content:center;color:var(--muted);overflow:hidden;flex-shrink:0;';
    av.innerHTML = '<span style="display:inline-flex;width:12px;height:12px;">'+planLineIcon('people', 12)+'</span>';
    el.appendChild(av);
    db.collection('users').doc(uid).get().then(function(doc){
      if(!doc.exists) return;
      var pd = doc.data().prData;
      if(pd && pd.avatar){
        av.style.cssText += 'background-image:url('+pd.avatar+');background-size:cover;background-position:center;filter:grayscale(1) contrast(1.15) brightness(0.85);';
        av.innerHTML = '';
      }
    }).catch(function(){});
  });
  if(overflow > 0){
    var more = document.createElement('div');
    more.className = 'num';
    more.style.cssText = 'width:24px;height:24px;border-radius:50%;background:var(--card2);border:1px solid var(--line2);outline:2px solid var(--bg);margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:var(--muted);flex-shrink:0;';
    more.textContent = '+'+overflow;
    el.appendChild(more);
  }
}

// ── DRAWER SYSTEM ─────────────────────────────────────────
function openChDrawer(type){
  var existing = document.getElementById('ch-drawer-overlay');
  if(existing) existing.remove();

  // Presets leben jetzt im Vollbild-Katalog (Suche + Filter) statt im gestapelten Sheet.
  if(type === 'preset'){ openChallengeCatalog(); return; }

  var ov = document.createElement('div');
  ov.id = 'ch-drawer-overlay';
  ov.style.cssText = PLAN_BACKDROP_CSS+'z-index:2000;';

  var drawer = document.createElement('div');
  // Endlayout ohne Inline-Transform — die Einfahranimation macht caliMotion.sheetIn.
  // .sheet (§5.15): --card, 1px --line2 oben, 10px-Radius; hier scrollbar mit 85vh-Deckel.
  drawer.className = 'sheet sheet-scroll';
  drawer.style.cssText = 'max-height:85vh;overflow-y:auto;padding:14px 0 calc(36px + env(safe-area-inset-bottom,0px));';

  // Handle bar
  drawer.appendChild(planSheetGrip());

  // Content area
  var content = document.createElement('div');
  content.style.cssText = 'padding:0 16px;';

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
  hdr.className = 'eyebrow';
  hdr.style.cssText = 'margin-bottom:14px;';
  hdr.textContent = 'Meine Challenge';
  el.appendChild(hdr);

  if(!activeChallenge){
    var hint = document.createElement('div');
    hint.className = 'empty';
    hint.style.cssText = 'margin-bottom:8px;';
    hint.textContent = 'Noch keine aktive Challenge.';
    // Der eine orangene Prim\u00E4r-CTA des Sheets
    var genBtn = document.createElement('button');
    genBtn.type = 'button';
    genBtn.className = 'btn pressable';
    genBtn.style.cssText = 'margin:0 0 12px;';
    genBtn.textContent = 'Challenge generieren';
    genBtn.onclick = function(){ generateChallenge(); closeChDrawer(); setTimeout(function(){ openChDrawer('personal'); }, 350); };
    el.appendChild(hint);
    el.appendChild(genBtn);
  } else {
    var prog = calcChallengeProgress();
    var target = activeChallenge.params.target || 1;
    var pct = Math.min(100, Math.round((prog/target)*100));
    var done = pct >= 100;

    // Karte-in-Sheet: --card2, Rahmen --line (fertig: --accent); Emoji-Icon \u2192 Ring mit Line-Icon
    var card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'background:var(--card2);border-color:'+(done?'var(--accent)':'var(--line)')+';margin-bottom:14px;';
    card.innerHTML =
      '<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">'+
        planIconRing(done?'trophy':'target', 44, 18, done?'var(--accent)':'var(--muted)')+
        '<div style="flex:1;min-width:0;">'+
          '<div class="ttl">'+activeChallenge.title+'</div>'+
          '<div class="row-sub" style="margin-top:4px;line-height:1.5;">'+activeChallenge.desc+'</div>'+
        '</div>'+
        '<div style="'+PLAN_TAG_CSS+(done?'color:var(--accent);border-color:var(--accent);':'')+'flex-shrink:0;">'+(done?'Geschafft':'Aktiv')+'</div>'+
      '</div>'+
      planSegbarHTML('data-chbar')+
      '<div class="row-sub num" style="display:flex;justify-content:space-between;margin:8px 0 0;">'+
        '<span>'+prog+' / '+target+chUnitLabel()+'</span><span>'+pct+'%</span>'+
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
      claimBtn.type = 'button';
      claimBtn.className = 'btn pressable';
      claimBtn.style.cssText = 'margin:0 0 8px;';
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
          iconName: 'trophy',
          title: 'Challenge geschafft!',
          big: ch.title,
          sub: ch.desc,
          note: claimed ? '' : '+100 XP'
        });
      };
      el.appendChild(claimBtn);
    } else {
      var newBtn = document.createElement('button');
      newBtn.type = 'button';
      newBtn.className = 'btn-g pressable';
      newBtn.style.cssText = 'width:100%;min-height:44px;margin-bottom:4px;';
      newBtn.textContent = 'Neue Challenge generieren';
      newBtn.onclick = function(){ activeChallenge=null; saveChallenges(); generateChallenge(); closeChDrawer(); setTimeout(function(){ openChDrawer('personal'); }, 350); };
      el.appendChild(newBtn);

      var skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.className = 'pressable u';
      skipBtn.style.cssText = PLAN_TEXTBTN_CSS;
      skipBtn.textContent = 'Challenge skippen (50 Flammen oder 1 Diamant)';
      skipBtn.onclick = function(){ closeChDrawer(); setTimeout(skipChallenge, 300); };
      el.appendChild(skipBtn);
    }
  }
}

// ── PRESET DRAWER ─────────────────────────────────────────
// Ehemals gestapelte Karten im Bottom-Sheet — heute nur noch Delegat auf den
// Vollbild-Katalog (openChDrawer('preset') routet bereits direkt dorthin).
function buildDrawerPreset(el){ openChallengeCatalog(); }

// ── CHALLENGE-KATALOG ─────────────────────────────────────
// Vollbild-Overlay mit Suche, zwei Filterreihen (Muskelgruppe, Schwierigkeit) und
// kompakter nummerierter Liste über alle PRESET_CHALLENGES. Tap auf eine Zeile öffnet
// das Detail-Sheet mit dem einen orangenen "Annehmen". Metadaten (level/cats/kind)
// und Labels kommen aus app3.js (presetExercises, presetCatLabels, …).

// Suchnormalisierung: klein, Diakritika weg (ü→u), ß→ss, Bindestrich→Leerzeichen.
function chCatalogNorm(s){
  s = String(s || '').toLowerCase();
  try{ s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }catch(e){}
  return s.replace(/ß/g, 'ss').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
}

// Synonyme: ein Suchwort (oder eine Phrase) trifft eine Challenge, wenn sie eine der
// Muskelgruppen (cats), eine der Übungen (ex) oder — bei full — ≥3 Muskelgruppen hat.
// Schlüssel stehen bereits normalisiert (ohne Umlaute), werden aber trotzdem durch
// chCatalogNorm gezogen.
var CH_CATALOG_SYNONYMS = [
  {k:['oberkorper','oberkoerper'],                          cats:['Pull','Push']},
  {k:['unterkorper','unterkoerper','beine','bein'],          cats:['Legs']},
  {k:['bauch','rumpf','core'],                              cats:['Core']},
  {k:['ganzkorper','ganzkoerper'],                          full:true},
  {k:['klimmzug','klimmzuge','pull up','pull ups','pullup','pullups'], ex:['Klimmzuge']},
  {k:['liegestutz','liegestutze','push up','push ups','pushup','pushups'], ex:['Liegestutze']},
  {k:['kniebeuge','kniebeugen','squat','squats'],           ex:['Kniebeugen']},
  {k:['dip','dips'],                                        ex:['Dips']},
  {k:['plank'],                                             ex:['Plank']},
  {k:['burpee','burpees'],                                  ex:['Burpees']},
  {k:['handstand'],                                         ex:['Wall Handstand Hold']},
  {k:['muscle up','muscle ups','muscleup','muscleups'],     ex:['Muscle-Ups']},
  {k:['front lever'],                                       ex:['Tuck Front Lever Hold']},
  {k:['sit up','sit ups','situp','situps'],                 ex:['Sit-ups']}
];

// Prüft, ob ein Synonym-Eintrag auf die (vorberechnete) Challenge passt.
function chCatalogSynHits(syn, item){
  var i;
  if(syn.full && item.cats.length >= 3) return true;
  if(syn.cats){
    for(i=0;i<syn.cats.length;i++){ if(item.cats.indexOf(syn.cats[i]) > -1) return true; }
  }
  if(syn.ex){
    for(i=0;i<syn.ex.length;i++){ if(item.exKeys.indexOf(syn.ex[i]) > -1) return true; }
  }
  return false;
}

// Vorberechnete Suchdaten je Preset: Haystack + Kategorien + Übungsschlüssel.
function chCatalogIndex(){
  return PRESET_CHALLENGES.map(function(ch){
    var cats = ch.cats || [];
    var exKeys = presetExerciseKeys(ch);
    var parts = [ch.title, ch.desc, ch.explanation]
      .concat(presetExercises(ch), exKeys, presetCatLabels(ch), cats,
              [presetLevelLabel(ch), presetKindLabel(ch)]);
    return {ch:ch, cats:cats, exKeys:exKeys, hay:' '+chCatalogNorm(parts.join(' '))+' '};
  });
}

// Query → Prädikat. Phrasen-Synonyme ('pull up', 'front lever') werden zuerst aus der
// Anfrage geschnitten, der Rest wortweise geprüft: jedes Wort muss im Haystack stehen
// oder ein Synonym (exakt oder als Präfix ab 3 Zeichen) treffen. Alle Bedingungen UND.
function chCatalogMatcher(query){
  var q = ' '+chCatalogNorm(query)+' ';
  if(q.trim() === '') return function(){ return true; };
  var conds = []; // Funktionen item → bool
  var i, j, key;
  for(i=0;i<CH_CATALOG_SYNONYMS.length;i++){
    var syn = CH_CATALOG_SYNONYMS[i];
    for(j=0;j<syn.k.length;j++){
      key = chCatalogNorm(syn.k[j]);
      if(key.indexOf(' ') < 0) continue;            // nur Phrasen hier
      if(q.indexOf(' '+key+' ') > -1){
        q = q.replace(' '+key+' ', ' ');
        (function(sy){ conds.push(function(item){ return chCatalogSynHits(sy, item); }); })(syn);
      }
    }
  }
  var words = q.trim().split(' ').filter(function(w){ return w; });
  words.forEach(function(w){
    // Synonyme, die dieses Wort exakt oder als Präfix (≥3 Zeichen) treffen
    var syns = [];
    for(i=0;i<CH_CATALOG_SYNONYMS.length;i++){
      for(j=0;j<CH_CATALOG_SYNONYMS[i].k.length;j++){
        key = chCatalogNorm(CH_CATALOG_SYNONYMS[i].k[j]);
        if(key === w || (w.length >= 3 && key.indexOf(w) === 0)){ syns.push(CH_CATALOG_SYNONYMS[i]); break; }
      }
    }
    conds.push(function(item){
      if(item.hay.indexOf(w) > -1) return true;
      for(var s=0;s<syns.length;s++){ if(chCatalogSynHits(syns[s], item)) return true; }
      return false;
    });
  });
  return function(item){
    for(var c=0;c<conds.length;c++){ if(!conds[c](item)) return false; }
    return true;
  };
}

// Kompakte Meta-Zeile einer Zeile: 'Pull · Schwer · 100 Wdh · Einheit'
function chCatalogMeta(ch){
  return presetCatLabels(ch).join(' · ')+' · '+presetLevelLabel(ch)+' · '+ch.target+' '+presetUnit(ch)+' · '+presetKindLabel(ch);
}

var CH_CATALOG_GROUPS = [
  {id:'all',  label:'Alle'},
  {id:'Pull', label:'Pull'},
  {id:'Push', label:'Push'},
  {id:'Core', label:'Core'},
  {id:'Legs', label:'Beine'},
  {id:'full', label:'Ganzkörper'}
];
var CH_CATALOG_LEVELS = [
  {id:0, label:'Alle'},
  {id:1, label:'Leicht'},
  {id:2, label:'Mittel'},
  {id:3, label:'Schwer'},
  {id:4, label:'Extrem'}
];

function openChallengeCatalog(opts){
  opts = opts || {};
  var old = document.getElementById('ch-catalog-ov');
  if(old) old.remove();
  var oldSheet = document.getElementById('ch-catalog-detail');
  if(oldSheet) oldSheet.remove();

  var state = {q: opts.prefill || '', group:'all', level:0};
  var index = chCatalogIndex();

  var ov = document.createElement('div');
  ov.id = 'ch-catalog-ov';
  ov.className = 'overlay';
  // .overlay ist fixed + --bg; hier Spaltenlayout mit eigenem Scrollbereich,
  // damit Suche und Filter oben stehen bleiben.
  ov.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;';

  var closeCatalog = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };

  // Top bar (§5.9): Zurück-Ring, zentrierter Titel, rechts Trefferzahl
  var topBar = document.createElement('div');
  topBar.className = 'topbar';
  topBar.style.cssText = 'padding:0 16px;margin:0;flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'icon-btn sm pressable';
  backBtn.setAttribute('aria-label', 'Zurück');
  backBtn.innerHTML = '&#8592;';
  backBtn.onclick = closeCatalog;
  var titleEl = document.createElement('h2');
  titleEl.className = 'topbar-title';
  titleEl.style.cssText = 'margin:0;';
  titleEl.textContent = 'Challenges';
  var slot = document.createElement('div');
  slot.className = 'topbar-slot';
  slot.style.cssText = 'display:flex;align-items:center;justify-content:flex-end;';
  var countEl = document.createElement('span');
  countEl.className = 'lbl num';
  countEl.setAttribute('aria-live', 'polite');
  slot.appendChild(countEl);
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(slot);
  ov.appendChild(topBar);

  // Kopf: Suche + zwei Chip-Reihen + Ergebniszeile (bleibt stehen, Liste scrollt)
  var head = document.createElement('div');
  head.style.cssText = 'flex-shrink:0;padding:12px 16px 0;';

  var searchWrap = document.createElement('div');
  searchWrap.style.cssText = 'position:relative;';
  var inp = document.createElement('input');
  inp.className = 'inp';
  inp.type = 'search';
  inp.placeholder = 'Übung, Muskelgruppe, Name …';
  inp.setAttribute('aria-label', 'Challenges durchsuchen');
  inp.setAttribute('autocomplete', 'off');
  inp.setAttribute('enterkeyhint', 'search');
  inp.style.cssText = 'padding-right:48px;';
  inp.value = state.q;
  var clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'icon-btn sm pressable';
  clearBtn.setAttribute('aria-label', 'Suche löschen');
  clearBtn.innerHTML = '&times;';
  clearBtn.style.cssText = 'position:absolute;right:4px;top:50%;transform:translateY(-50%);border-color:transparent;';
  clearBtn.style.display = state.q ? '' : 'none';
  clearBtn.onclick = function(){ inp.value = ''; state.q = ''; clearBtn.style.display = 'none'; renderList(); inp.focus(); };
  inp.oninput = function(){ state.q = inp.value; clearBtn.style.display = state.q ? '' : 'none'; renderList(); };
  inp.onkeydown = function(e){ if(e.key === 'Escape' && inp.value){ e.preventDefault(); clearBtn.onclick(); } };
  searchWrap.appendChild(inp); searchWrap.appendChild(clearBtn);
  head.appendChild(searchWrap);

  var CHIP_ROW_CSS = 'display:flex;gap:6px;overflow-x:auto;white-space:nowrap;scrollbar-width:none;margin-top:10px;';
  function chipRow(options, getSel, setSel){
    var row = document.createElement('div');
    row.style.cssText = CHIP_ROW_CSS;
    row.setAttribute('role', 'group');
    options.forEach(function(opt){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.style.cssText = 'flex-shrink:0;';
      b.textContent = opt.label;
      b._optId = opt.id;
      b.onclick = function(){ setSel(opt.id); paint(); renderList(); };
      row.appendChild(b);
    });
    function paint(){
      var sel = getSel();
      for(var i=0;i<row.children.length;i++){
        var on = row.children[i]._optId === sel;
        row.children[i].classList.toggle('on', on);
        row.children[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    }
    paint();
    row._paint = paint;
    return row;
  }
  var groupRow = chipRow(CH_CATALOG_GROUPS, function(){ return state.group; }, function(v){ state.group = v; });
  groupRow.setAttribute('aria-label', 'Muskelgruppe');
  var levelRow = chipRow(CH_CATALOG_LEVELS, function(){ return state.level; }, function(v){ state.level = v; });
  levelRow.setAttribute('aria-label', 'Schwierigkeit');
  head.appendChild(groupRow);
  head.appendChild(levelRow);

  var resultLbl = document.createElement('div');
  resultLbl.className = 'lbl num';
  resultLbl.style.cssText = 'margin:14px 0 8px;';
  head.appendChild(resultLbl);
  ov.appendChild(head);

  // Scrollbereich mit Kachel-Galerie (2 Spalten) + Leerzustand
  var scroll = document.createElement('div');
  scroll.className = 'sheet-scroll';
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:0 16px calc(24px + env(safe-area-inset-bottom,0px));';
  var list = document.createElement('div');
  list.className = 'ch-grid';
  var emptyBox = document.createElement('div');
  emptyBox.style.display = 'none';
  var emptyTxt = document.createElement('div');
  emptyTxt.className = 'empty';
  emptyTxt.textContent = 'Nichts gefunden';
  var resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn-g pressable';
  resetBtn.style.cssText = 'width:100%;';
  resetBtn.textContent = 'Filter zurücksetzen';
  resetBtn.onclick = function(){
    state.q = ''; state.group = 'all'; state.level = 0;
    inp.value = ''; clearBtn.style.display = 'none';
    groupRow._paint(); levelRow._paint();
    renderList();
  };
  emptyBox.appendChild(emptyTxt); emptyBox.appendChild(resetBtn);
  scroll.appendChild(list); scroll.appendChild(emptyBox);
  ov.appendChild(scroll);

  function passesFilters(item){
    if(state.group === 'full'){ if(item.cats.length < 3) return false; }
    else if(state.group !== 'all'){ if(item.cats.indexOf(state.group) < 0) return false; }
    if(state.level && item.ch.level !== state.level) return false;
    return true;
  }

  function renderList(){
    var match = chCatalogMatcher(state.q);
    var hits = index.filter(function(item){ return passesFilters(item) && match(item); });
    list.innerHTML = '';
    hits.forEach(function(item){
      var ch = item.ch;
      var running = !!(activeChallenge && activeChallenge.id === ch.id);
      var tile = document.createElement('div');
      tile.className = 'ch-tile pressable'+(running ? ' active' : '');
      tile.setAttribute('role', 'button');
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('aria-label', ch.title);
      chTileArt(tile, ch);

      // Kopfzeile: Schwierigkeit links, Art (oder 'Läuft') rechts
      var top = document.createElement('div');
      top.className = 'ch-tile-top';
      top.appendChild(chLevelDots(ch));
      var kind = document.createElement('span');
      kind.className = 'lbl'+(running ? ' live' : '');
      kind.textContent = running ? 'Läuft' : presetKindLabel(ch);
      top.appendChild(kind);
      tile.appendChild(top);

      // Fuß: Kategorien, Titel (max. 2 Zeilen), Ziel — liegt auf dem Verlauf
      var body = document.createElement('div');
      body.className = 'ch-tile-body';
      var cats = document.createElement('div');
      cats.className = 'lbl';
      cats.textContent = presetCatLabels(ch).join(' · ');
      var t = document.createElement('div');
      t.className = 'ttl';
      t.textContent = ch.title;
      var sub = document.createElement('div');
      sub.className = 'row-sub num';
      sub.textContent = 'Ziel '+ch.target+' '+presetUnit(ch);
      body.appendChild(cats); body.appendChild(t); body.appendChild(sub);
      tile.appendChild(body);

      var open = function(){ openChallengeDetail(ch, ov); };
      tile.onclick = open;
      tile.onkeydown = function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); } };
      list.appendChild(tile);
    });
    var n = hits.length, total = index.length;
    countEl.textContent = String(n);
    resultLbl.textContent = n+' von '+total+' Challenges';
    list.style.display = n === 0 ? 'none' : '';
    emptyBox.style.display = n === 0 ? '' : 'none';
    if(n && window.caliMotion) caliMotion.stagger(list, 12);
  }

  document.body.appendChild(ov);
  // Hardware-Zurück schließt den Katalog (und ein evtl. offenes Detail-Sheet) statt der App
  if(typeof overlayPush === 'function'){
    overlayPush(ov, function(){
      var d = document.getElementById('ch-catalog-detail');
      if(d) d.remove();
      buildChCards();
    });
  }
  if(window.caliMotion) caliMotion.overlayIn(ov);
  renderList();
}

// Detail-Sheet einer Katalog-Challenge (Markup/Animation wie confirmSheet + Drawer).
// catalogOv wird beim Annehmen mitgeschlossen; Backdrop/Schließen schließen nur das Sheet.
function openChallengeDetail(ch, catalogOv){
  var old = document.getElementById('ch-catalog-detail');
  if(old) old.remove();
  trackChallengeView(ch.id);

  var ov = document.createElement('div');
  ov.id = 'ch-catalog-detail';
  ov.style.cssText = PLAN_BACKDROP_CSS+'z-index:2100;';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:85vh;overflow-y:auto;';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', ch.title);
  box.appendChild(planSheetGrip());

  // Hero-Kopf: Foto (oder Index-Fallback) + Verlauf, Schwierigkeit oben links,
  // Titel unten links — ersetzt die frühere reine .ttl-Zeile.
  var hero = document.createElement('div');
  hero.className = 'ch-detail-hero';
  chTileArt(hero, ch);
  var heroTop = document.createElement('div');
  heroTop.className = 'ch-tile-top';
  heroTop.appendChild(chLevelDots(ch));
  hero.appendChild(heroTop);
  var heroBody = document.createElement('div');
  heroBody.className = 'ch-tile-body';
  var title = document.createElement('div');
  title.className = 'ttl';
  title.textContent = ch.title;
  heroBody.appendChild(title);
  hero.appendChild(heroBody);
  box.appendChild(hero);

  var meta = document.createElement('div');
  meta.className = 'lbl';
  meta.style.cssText = 'margin:0 0 12px;';
  meta.textContent = presetCatLabels(ch).join(' · ')+' · '+presetLevelLabel(ch)+' · '+presetKindLabel(ch);
  box.appendChild(meta);

  var desc = document.createElement('div');
  desc.className = 'row-sub';
  desc.style.cssText = 'margin:0;line-height:1.5;color:var(--text);';
  desc.textContent = ch.desc || '';
  box.appendChild(desc);

  if(ch.explanation){
    var divider = document.createElement('div');
    divider.style.cssText = 'border-top:1px solid var(--line);margin:12px 0;';
    box.appendChild(divider);
    var expl = document.createElement('div');
    expl.className = 'row-sub';
    expl.style.cssText = 'margin:0;line-height:1.5;';
    expl.textContent = ch.explanation;
    box.appendChild(expl);
  }

  var exNames = presetExercises(ch);
  var exLbl = document.createElement('div');
  exLbl.className = 'lbl';
  exLbl.style.cssText = 'margin:16px 0 8px;';
  exLbl.textContent = 'Übungen';
  box.appendChild(exLbl);
  var exWrap = document.createElement('div');
  exWrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
  (exNames.length ? exNames : [PRESET_CATS_EMPTY_LABEL]).forEach(function(name){
    var tag = document.createElement('span');
    // Outline-Chip: transparent, 1px --line2, Pill-Radius; mixed case (Umlaute bleiben)
    tag.style.cssText = 'border:1px solid var(--line2);border-radius:var(--r-pill);padding:6px 12px;font-size:11px;font-weight:500;color:var(--text);white-space:nowrap;';
    tag.textContent = name;
    exWrap.appendChild(tag);
  });
  box.appendChild(exWrap);

  var goal = document.createElement('div');
  goal.style.cssText = 'display:flex;align-items:baseline;gap:8px;margin:16px 0 18px;';
  goal.innerHTML = '<span class="lbl">Ziel</span>'+
    '<span class="kpi num" style="font-size:22px;">'+ch.target+'</span>'+
    '<span class="unit">'+presetUnit(ch)+'</span>';
  box.appendChild(goal);

  var closeSheet = function(){ sheetOut(ov, box); };

  // Exakt der bisherige Annehmen-Code des Preset-Drawers
  var accept = function(){
    activeChallenge = {
      id:ch.id, title:ch.title, desc:ch.desc,
      icon:ch.icon, type:'preset',
      params:presetParams(ch),
      startDate:new Date().toISOString().slice(0,10), progress:0
    };
    saveChallenges();
    if(typeof fbSave === 'function') fbSave();
    trackChallengeParticipant(ch.id);
    toast(ch.title+' angenommen!');
    closeSheet();
    if(catalogOv){
      if(typeof overlayClose === 'function'){ overlayClose(catalogOv); } else { catalogOv.remove(); }
    }
    buildChallengeUI();
  };

  var okBtn = document.createElement('button');
  okBtn.type = 'button';
  okBtn.className = 'btn pressable';
  okBtn.style.cssText = 'margin:0 0 8px;';
  okBtn.textContent = 'Annehmen';
  okBtn.onclick = function(){
    var running = activeChallenge && activeChallenge.id !== ch.id &&
                  calcChallengeProgress() < ((activeChallenge.params && activeChallenge.params.target) || 1);
    if(running){
      confirmSheet({
        title:'Aktive Challenge ersetzen?',
        desc:'Deine laufende Challenge „'+activeChallenge.title+'“ wird verworfen.',
        confirmLabel:'Ersetzen',
        onConfirm:accept
      });
    } else {
      accept();
    }
  };
  box.appendChild(okBtn);

  var cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn-g pressable';
  cancelBtn.style.cssText = 'width:100%;min-height:44px;';
  cancelBtn.textContent = 'Schließen';
  cancelBtn.onclick = closeSheet;
  box.appendChild(cancelBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) closeSheet(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}
function togglePlanExpand(card){
  var detail = card.querySelector('.plan-ex-detail');
  var arrow = card.querySelector('.plan-top div:last-child div:last-child');
  if(!detail) return;
  var isOpen = detail.classList.contains('open');
  detail.classList.toggle('open', !isOpen);
  // Chevron "›" dreht sich nach unten statt Zeichentausch (kein Layout-Sprung)
  if(arrow) arrow.style.transform = isOpen ? '' : 'rotate(90deg)';
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

  // Heute-Karte: hervorgehobener Rahmen --line2 + orangener Live-Dot vor dem Eyebrow (Kontrakt).
  // Eyebrow → Plan-Titel (uppercase) → Sub nur mit echten Werten (§5.10).
  var card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'border-color:var(--line2);padding:16px;margin-bottom:10px;';

  var head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;';

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;min-width:0;';

  var eyebrow = document.createElement('div');
  eyebrow.className = 'eyebrow';
  eyebrow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
  eyebrow.innerHTML = '<span class="live-dot"></span><span>Heute · '+WEEK_DAYS_FULL[todayIdx]+', '+dateStr+'</span>';
  content.appendChild(eyebrow);

  var titleEl = document.createElement('div');
  titleEl.className = 'ttl';
  titleEl.textContent = hasWorkout ? firstPlan.name : 'Ruhetag';
  content.appendChild(titleEl);

  var sub = document.createElement('div');
  sub.className = 'row-sub num';
  sub.style.cssText = 'margin-top:4px;';
  if(hasWorkout){
    var totalSets = 0;
    for(var s=0;s<firstPlan.exercises.length;s++){ totalSets += (firstPlan.exercises[s].sets||[]).length; }
    sub.textContent = firstPlan.exercises.length+' Übungen · '+totalSets+' Sätze'+(dayPlans.length>1?' · +'+(dayPlans.length-1)+' weitere':'');
  } else {
    sub.textContent = 'Nutze heute die Zeit für Regeneration und Mobility.';
  }
  content.appendChild(sub);
  head.appendChild(content);

  var ring = document.createElement('div');
  ring.style.cssText = 'display:flex;flex-shrink:0;';
  ring.innerHTML = planIconRing(hasWorkout?'flex':'moon', 44, 18, hasWorkout?'var(--accent)':'var(--muted)');
  head.appendChild(ring);
  card.appendChild(head);

  // Der eine orangene Primär-CTA der Pläne-Seite; ohne Workout ein Ghost-Button
  var editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = (hasWorkout ? 'btn' : 'btn-g') + ' pressable';
  editBtn.style.cssText = hasWorkout ? 'margin:0;' : 'width:100%;min-height:44px;';
  editBtn.textContent = hasWorkout ? '▶ Workout starten' : 'Plan bearbeiten';
  editBtn.onclick = function(){
    // startPlanById wechselt zur Workout-Seite und kann auch 'preset_N' starten
    if(hasWorkout){ startPlanById(firstPlan.id); }
    else { openDayEditor(todayIdx, null); }
  };
  card.appendChild(editBtn);

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

  // Top bar (§5.9): 36px-Zurück-Ring, zentrierter Uppercase-Titel, rechts Ghost "Neuer Plan"
  var topBar = document.createElement('div');
  topBar.className = 'topbar';
  topBar.style.cssText = 'padding:0 16px;margin:0;flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'icon-btn sm pressable';
  backBtn.setAttribute('aria-label', 'Zurück');
  backBtn.innerHTML = '&#8592;';
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var titleEl = document.createElement('div');
  titleEl.className = 'topbar-title';
  titleEl.textContent = 'Wochenplan';
  var newPlanBtn = document.createElement('button');
  newPlanBtn.type = 'button';
  newPlanBtn.className = 'btn-g pressable';
  newPlanBtn.style.cssText = 'min-height:32px;padding:0 12px;font-size:10px;flex-shrink:0;white-space:nowrap;';
  newPlanBtn.textContent = '+ Neuer Plan';
  newPlanBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
    goPage('p'); showPlanForm();
  };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(newPlanBtn);
  ov.appendChild(topBar);

  // Scrollable content
  var scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:16px 16px calc(24px + env(safe-area-inset-bottom,0px));';
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

  // Wochen-Kennzahlen als Stat-Kacheln (§5.3), dreispaltig — Werte aus dem gespeicherten Wochenplan
  var statsBar = document.createElement('div');
  statsBar.className = 'stat-grid';
  statsBar.style.cssText = 'grid-template-columns:repeat(3,1fr);margin-bottom:14px;';
  [
    {val:stats.workouts, label:'Workouts'},
    {val:stats.restDays, label:'Ruhetage'},
    {val:stats.totalEx, label:'Übungen'}
  ].forEach(function(s){
    var tile = document.createElement('div');
    tile.className = 'stat-tile';
    tile.style.cssText = 'padding:12px;gap:6px;';
    tile.innerHTML = '<span class="lbl">'+s.label+'</span><div class="kpi-row"><span class="kpi num" style="font-size:22px;">'+s.val+'</span></div>';
    statsBar.appendChild(tile);
  });
  left.appendChild(statsBar);

  // Tagesliste: eine .list-Karte, je Tag eine Zeile mit zweibuchstabigem Index (Mo, Di, …);
  // heute = orangener Index + Live-Dot + --card2-Fläche. Chevron dreht beim Aufklappen.
  var list = document.createElement('div');
  list.className = 'list';

  WEEK_DAYS_FULL.forEach(function(dayName, i){
    var dayPlans = wp[i] || [];
    var isToday = i === todayIdx;
    var hasWorkout = dayPlans.length > 0;
    var firstPlan = hasWorkout ? getPlanById(dayPlans[0]) : null;
    if(hasWorkout && !firstPlan) hasWorkout = false;

    var dayBlock = document.createElement('div');
    dayBlock.style.cssText = (i<6?'border-bottom:1px solid var(--line);':'')+(isToday?'background:var(--card2);':'');

    var expanded = i === focusIdx;

    var chevron = document.createElement('span');
    chevron.className = 'row-chev';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.style.cssText = 'transition:transform var(--dur-fast) var(--ease-out);transform:rotate('+(expanded?'90':'0')+'deg);';

    var dayHdr = document.createElement('div');
    dayHdr.className = 'list-row pressable';
    dayHdr.style.cssText = 'border-bottom:none;';
    dayHdr.setAttribute('role', 'button');
    dayHdr.setAttribute('tabindex', '0');
    dayHdr.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    dayHdr.innerHTML =
      '<span class="row-index" style="color:'+(isToday?'var(--accent)':'var(--muted2)')+';">'+WEEK_DAYS[i]+'</span>'+
      planIconRing(hasWorkout?'flex':'moon', 36, 16, hasWorkout?'var(--text)':'var(--muted)')+
      '<div class="row-main">'+
        '<div style="display:flex;align-items:center;gap:8px;min-width:0;">'+
          (isToday?'<span class="live-dot"></span>':'')+
          '<div class="row-title">'+(hasWorkout?firstPlan.name:'Ruhetag')+'</div>'+
        '</div>'+
        '<div class="row-sub num">'+formatDayDate(weekDates[i])+' · '+(hasWorkout?(firstPlan.exercises.length+' Übungen'+(dayPlans.length>1?' · +'+(dayPlans.length-1)+' weitere':'')):'Aktive Erholung')+'</div>'+
      '</div>';
    dayHdr.appendChild(chevron);
    dayBlock.appendChild(dayHdr);

    var detailWrap = document.createElement('div');
    detailWrap.style.cssText = 'display:'+(expanded?'block':'none')+';padding:0 14px 14px;';

    function renderDetail(){
      detailWrap.innerHTML = '';
      if(hasWorkout){
        // Erste drei Übungen als nummerierte Zeilen (Kategorie-Dot, echte Satz-/Zielwerte), Rest als "+n weitere"
        var exList = document.createElement('div');
        exList.style.cssText = 'margin-bottom:12px;';
        firstPlan.exercises.slice(0,3).forEach(function(ex, k){
          var row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line);';
          var col = (typeof COLS!=='undefined' && COLS[ex.col]) || 'var(--accent)';
          row.innerHTML = '<span class="row-index num">'+('0'+(k+1)).slice(-2)+'</span>'+
            '<span class="plan-dot" style="background:'+col+';"></span>'+
            '<div class="row-main"><div class="row-title">'+ex.name+'</div></div>'+
            '<span class="row-sub num" style="margin:0;flex-shrink:0;">'+ex.sets.length+' Sätze'+(ex.sets[0]?' · '+ex.sets[0].n+' '+ex.unit:'')+'</span>';
          exList.appendChild(row);
        });
        if(firstPlan.exercises.length > 3){
          var moreRow = document.createElement('div');
          moreRow.className = 'row-sub num';
          moreRow.style.cssText = 'margin:0;padding:8px 0 0 32px;border-top:1px solid var(--line);color:var(--muted2);';
          moreRow.textContent = '+'+(firstPlan.exercises.length-3)+' weitere';
          exList.appendChild(moreRow);
        }
        detailWrap.appendChild(exList);

        // Heller Sekundär-CTA — mehrere Tage können gleichzeitig offen sein, Orange bleibt der Heute-Karte
        var startBtn = document.createElement('button');
        startBtn.type = 'button';
        startBtn.className = 'btn sec pressable';
        startBtn.style.cssText = 'margin:0 0 8px;min-height:44px;font-size:11px;';
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
        tipBox.style.cssText = 'background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);padding:14px;margin-bottom:8px;';
        tipBox.innerHTML = '<span class="eyebrow">Tipp für heute</span>'+
          '<div style="font-size:12px;color:var(--text);line-height:1.5;">Nutze den Tag für Mobilität, Stretching oder einen Spaziergang.</div>';
        detailWrap.appendChild(tipBox);
      }

      var editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'btn-g pressable';
      editBtn.style.cssText = 'width:100%;min-height:40px;';
      editBtn.textContent = hasWorkout ? 'Plan bearbeiten' : '+ Plan hinzufügen';
      editBtn.onclick = function(e){ e.stopPropagation(); openDayEditor(i, scroll); };
      detailWrap.appendChild(editBtn);
    }
    renderDetail();
    dayBlock.appendChild(detailWrap);

    var toggleDay = function(){
      expanded = !expanded;
      detailWrap.style.display = expanded ? 'block' : 'none';
      chevron.style.transform = 'rotate('+(expanded?'90':'0')+'deg)';
      dayHdr.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    };
    dayHdr.onclick = toggleDay;
    dayHdr.onkeydown = function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toggleDay(); } };

    list.appendChild(dayBlock);
  });

  left.appendChild(list);
  scroll.appendChild(left);
  if(window.caliMotion) caliMotion.stagger(list);
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
  card.className = 'card';
  card.style.cssText = 'margin-bottom:10px;';

  // Kopf: Eyebrow mit Kalender-Line-Icon, rechts Text-Link "Ganze Woche →" in --accent
  var sectionTitleRow = document.createElement('div');
  sectionTitleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;';
  var sectionTitle = document.createElement('div');
  sectionTitle.className = 'eyebrow';
  sectionTitle.style.cssText = 'margin:0;display:flex;align-items:center;gap:8px;';
  sectionTitle.innerHTML = '<span style="display:inline-flex;width:14px;height:14px;color:var(--muted);">'+planLineIcon('calendar', 14)+'</span><span>Wochenplan</span>';
  sectionTitleRow.appendChild(sectionTitle);
  var fullWeekBtn = document.createElement('button');
  fullWeekBtn.type = 'button';
  fullWeekBtn.className = 'lbl pressable';
  fullWeekBtn.style.cssText = 'background:none;border:none;padding:0;cursor:pointer;font-family:inherit;color:var(--accent);white-space:nowrap;';
  fullWeekBtn.innerHTML = 'Ganze Woche &#8594;';
  fullWeekBtn.onclick = function(){ openDayListModal((new Date().getDay()+6)%7); };
  sectionTitleRow.appendChild(fullWeekBtn);
  card.appendChild(sectionTitleRow);

  // Monatsnavigation: 36px-Ring-Buttons (§5.7) um den Uppercase-Monatstitel
  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:14px;';
  var prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'icon-btn sm pressable';
  prevBtn.innerHTML = '&#8592;';
  prevBtn.setAttribute('aria-label', 'Vorheriger Monat');
  prevBtn.onclick = function(){ weekCalMonthOffset--; rerenderFn(); };
  var titleEl = document.createElement('div');
  titleEl.className = 'ttl num';
  titleEl.style.cssText = 'text-align:center;';
  titleEl.textContent = MONTH_NAMES[month]+' '+year;
  var nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'icon-btn sm pressable';
  nextBtn.innerHTML = '&#8594;';
  nextBtn.setAttribute('aria-label', 'Nächster Monat');
  nextBtn.onclick = function(){ weekCalMonthOffset++; rerenderFn(); };
  hdr.appendChild(prevBtn); hdr.appendChild(titleEl); hdr.appendChild(nextBtn);
  card.appendChild(hdr);

  var weekHdrRow = document.createElement('div');
  weekHdrRow.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:8px;';
  WEEK_DAYS.forEach(function(d){
    var c = document.createElement('div');
    c.className = 'lbl';
    c.style.cssText = 'text-align:center;color:var(--muted2);';
    c.textContent = d;
    weekHdrRow.appendChild(c);
  });
  card.appendChild(weekHdrRow);

  var grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:14px;';

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
    cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:6px 0;border-radius:var(--r-sm);'+(inMonth?'cursor:pointer;':'');
    if(inMonth){
      dayCells.push({el:cell, dow:dowIdx});
      cell.onclick = function(dIdx){ return function(){ toggleCalDay(dIdx); }; }(dowIdx);
    }

    // Tageszahl tabular; heute = orangener Kreis mit weißer Zahl; Fremdmonat in --muted2
    var numEl = document.createElement('div');
    numEl.className = 'num';
    numEl.style.cssText = 'width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:'+(isRealToday?'600':'500')+';'+
      (isRealToday ? 'background:var(--accent);color:#fff;' : 'color:'+(inMonth?'var(--text)':'var(--muted2)')+';');
    numEl.textContent = dateNum;
    cell.appendChild(numEl);

    // Marker: 6px-Dot (--accent Workout / --line2 Ruhetag), Skill-Tag als Stern-Line-Icon
    var marker = document.createElement('div');
    marker.style.cssText = 'margin-top:4px;height:10px;display:flex;align-items:center;justify-content:center;opacity:'+(inMonth?'1':'0.4')+';';
    if(isSkillDay){
      marker.innerHTML = '<span style="display:inline-flex;width:10px;height:10px;color:var(--accent);">'+planLineIcon('star', 10)+'</span>';
    } else {
      marker.innerHTML = '<span style="width:6px;height:6px;border-radius:50%;background:'+(hasW?'var(--accent)':'var(--line2)')+';"></span>';
    }
    cell.appendChild(marker);

    grid.appendChild(cell);
  }
  card.appendChild(grid);

  var legend = document.createElement('div');
  legend.style.cssText = 'display:flex;gap:16px;flex-wrap:wrap;padding-top:12px;border-top:1px solid var(--line);';
  [{kind:'dot',c:'var(--accent)',l:'Workout'},{kind:'star',c:'var(--accent)',l:'Skill'},{kind:'dot',c:'var(--line2)',l:'Ruhetag'}].forEach(function(li){
    var item = document.createElement('div');
    item.className = 'lbl';
    item.style.cssText = 'display:flex;align-items:center;gap:6px;';
    item.innerHTML = (li.kind==='star'
      ? '<span style="display:inline-flex;width:10px;height:10px;color:'+li.c+';">'+planLineIcon('star', 10)+'</span>'
      : '<span style="width:6px;height:6px;border-radius:50%;background:'+li.c+';flex-shrink:0;"></span>')+'<span>'+li.l+'</span>';
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
      dayCells[q].el.style.background = (weekCalExpandedDay===dayCells[q].dow) ? 'var(--card2)' : '';
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

  // Karte-in-Karte (--card2, 1px --line): Ring-Icon + Eyebrow (Wochentag) + Titel (Plan / Ruhetag)
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);padding:14px;';

  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:12px;';
  hdr.innerHTML = planIconRing(hasWorkout?'flex':'moon', 36, 16, hasWorkout?'var(--accent)':'var(--muted)')+
    '<div style="flex:1;min-width:0;"><span class="eyebrow" style="margin-bottom:2px;">'+WEEK_DAYS_FULL[dayIdx]+'</span>'+
    '<div class="ttl">'+(hasWorkout?firstPlan.name:'Ruhetag')+'</div></div>';
  box.appendChild(hdr);

  if(hasWorkout){
    var meta = document.createElement('div');
    meta.className = 'row-sub num';
    meta.style.cssText = 'margin:0 0 12px;';
    meta.textContent = firstPlan.exercises.length+' Übungen'+(dayPlans.length>1?' · +'+(dayPlans.length-1)+' weitere':'');
    box.appendChild(meta);

    // Heller Sekundär-CTA — der orangene Primär-CTA der Seite sitzt in der Heute-Karte
    var startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.className = 'btn sec pressable';
    startBtn.style.cssText = 'margin:0 0 8px;min-height:44px;font-size:11px;';
    startBtn.textContent = '▶ Workout starten';
    startBtn.onclick = function(){ startPlanById(firstPlan.id); };
    box.appendChild(startBtn);
  }

  var editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'btn-g pressable';
  editBtn.style.cssText = 'width:100%;min-height:40px;';
  editBtn.textContent = hasWorkout ? 'Plan bearbeiten' : '+ Plan hinzufügen';
  editBtn.onclick = function(){ openDayEditor(dayIdx, null); };
  box.appendChild(editBtn);

  container.appendChild(box);
}

function buildWeekSummaryCard(container, stats){
  var goal = (typeof streakData !== 'undefined' && streakData.weeklyGoal) ? streakData.weeklyGoal : 3;
  var done = computeWeekWorkoutsDone();
  var pct = Math.min(100, Math.round((done/goal)*100));

  // "Diese Woche": Eyebrow → Kennzahl x/y + Einheit (§5.12) → Segmentbalken → drei Stat-Kacheln
  var card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'margin-bottom:10px;';

  var title = document.createElement('span');
  title.className = 'eyebrow';
  title.textContent = 'Diese Woche';
  card.appendChild(title);

  var progLbl = document.createElement('div');
  progLbl.style.cssText = 'display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:10px;';
  progLbl.innerHTML = '<div class="kpi-row" style="display:flex;align-items:baseline;gap:6px;"><span class="kpi num">'+done+'<span style="color:var(--muted2);">/'+goal+'</span></span><span class="unit">Workouts</span></div>'+
    '<span class="num" style="font-size:11px;font-weight:600;color:var(--accent);flex-shrink:0;">'+pct+'%</span>';
  card.appendChild(progLbl);

  var track = document.createElement('div');
  track.style.cssText = 'margin-bottom:14px;';
  track.innerHTML = planSegbarHTML('data-weekbar');
  card.appendChild(track);
  var bar = track.querySelector('[data-weekbar]');
  if(window.caliMotion) caliMotion.animateBar(bar, pct);
  else bar.style.width = pct+'%';

  var tileRow = document.createElement('div');
  tileRow.className = 'stat-grid';
  tileRow.style.cssText = 'grid-template-columns:repeat(3,1fr);margin:0;';
  [
    {val:stats.workouts, label:'Workout'+(stats.workouts===1?'':'s')},
    {val:stats.restDays, label:'Ruhetage'},
    {val:stats.totalEx, label:'Übungen'}
  ].forEach(function(s){
    var tile = document.createElement('div');
    tile.className = 'stat-tile';
    tile.style.cssText = 'background:var(--card2);padding:12px;gap:6px;';
    tile.innerHTML = '<span class="lbl">'+s.label+'</span><div class="kpi-row"><span class="kpi num" style="font-size:22px;">'+s.val+'</span></div>';
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
  // Tipp-Karte: bordered Card mit Ring-Icon, Eyebrow und mixed-case Tipptext
  var card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:10px;';

  var tipIconWrap = document.createElement('div');
  tipIconWrap.style.cssText = 'display:flex;flex-shrink:0;';
  tipIconWrap.innerHTML = planIconRing('lightbulb', 44, 18, 'var(--accent)');
  card.appendChild(tipIconWrap);

  var textWrap = document.createElement('div');
  textWrap.style.cssText = 'flex:1;min-width:0;';
  textWrap.innerHTML = '<span class="eyebrow" style="margin-bottom:4px;">Tipp der Woche</span>'+
    '<div style="font-size:12px;color:var(--text);line-height:1.5;">'+WEEK_TIPS[weekTipIdx]+'</div>';
  card.appendChild(textWrap);

  var moreBtn = document.createElement('button');
  moreBtn.type = 'button';
  moreBtn.className = 'lbl pressable';
  moreBtn.style.cssText = 'background:none;border:none;padding:0;cursor:pointer;font-family:inherit;color:var(--accent);white-space:nowrap;flex-shrink:0;';
  moreBtn.innerHTML = 'Mehr Tipps &#8594;';
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
  ov.style.cssText = PLAN_BACKDROP_CSS+'z-index:2000;';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:80vh;overflow-y:auto;';

  function renderBox(){
    box.innerHTML = '<div class="sheet-grip"></div>'+
      '<div class="ttl" style="margin-bottom:4px;">'+WEEK_DAYS_FULL[dayIdx]+'</div>'+
      '<div class="row-sub" style="margin:0 0 14px;">Pläne für diesen Tag</div>';

    // Assigned plans — nummerierte Zeilen in einer .list-Karte (--card2 im Sheet)
    if(dayPlans.length === 0){
      var emptyEl = document.createElement('div');
      emptyEl.className = 'empty';
      emptyEl.style.cssText = 'margin-bottom:8px;';
      emptyEl.textContent = 'Ruhetag — kein Plan zugewiesen';
      box.appendChild(emptyEl);
    } else {
      var listEl = document.createElement('div');
      listEl.className = 'list';
      listEl.style.cssText = 'background:var(--card2);margin-bottom:12px;';
      var shown = 0;
      dayPlans.forEach(function(planId, i){
        var plan = getPlanById(planId);
        if(!plan) return;
        shown++;
        var row = document.createElement('div');
        row.className = 'list-row';
        row.style.cssText = 'cursor:default;';
        row.innerHTML = '<span class="row-index num">'+('0'+shown).slice(-2)+'</span><div class="row-main"><div class="row-title">'+plan.name+'</div></div>';
        var delBtn = document.createElement('button');
        delBtn.type = 'button';
        delBtn.className = 'btn-g danger pressable';
        delBtn.style.cssText = 'min-height:32px;padding:0 12px;font-size:10px;flex-shrink:0;';
        delBtn.textContent = 'Entfernen';
        delBtn.onclick = function(){
          dayPlans.splice(i,1);
          wp[dayIdx] = dayPlans;
          saveWeekPlan(wp);
          renderBox();
          buildWeekPlan();
          if(calScroll) renderDayList(calScroll, dayIdx);
        };
        row.appendChild(delBtn);
        listEl.appendChild(row);
      });
      box.appendChild(listEl);
    }

    // Add plan dropdown
    var addLabel = document.createElement('div');
    addLabel.className = 'lbl';
    addLabel.style.cssText = 'margin-bottom:6px;';
    addLabel.textContent = 'Plan hinzufügen';
    box.appendChild(addLabel);

    var sel = document.createElement('select');
    sel.className = 'inp';
    sel.style.cssText = 'margin-bottom:10px;';
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

    // Der eine orangene Primär-CTA des Sheets
    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn pressable';
    addBtn.style.cssText = 'margin:0 0 4px;';
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
    closeBtn.type = 'button';
    closeBtn.className = 'pressable u';
    closeBtn.style.cssText = PLAN_TEXTBTN_CSS;
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
