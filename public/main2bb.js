





// ── EMOM MIX GRID ─────────────────────────────────────────
var emomMixPlan = []; // [{exName, reps}] one per minute

function emomBuildMixGrid(){
  var grid = document.getElementById('emom-mix-grid');
  if(!grid) return;
  var minEl = document.getElementById('emom-minutes');
  var mins = parseInt(minEl ? minEl.value : 10) || 10;
  // Resize emomMixPlan
  while(emomMixPlan.length < mins) emomMixPlan.push({exName:'', reps:''});
  while(emomMixPlan.length > mins) emomMixPlan.pop();

  grid.innerHTML = '';
  for(var i = 0; i < mins; i++){
    (function(idx){
      var row = document.createElement('div');
      row.style.cssText = 'display:grid;grid-template-columns:44px 1fr 84px;gap:8px;margin-bottom:8px;align-items:center;';

      var minLabel = document.createElement('div');
      minLabel.className = 'lbl num';
      minLabel.style.cssText = 'text-align:center;';
      minLabel.textContent = 'Min ' + (idx+1);

      var sel = document.createElement('select');
      sel.className = 'inp';
      sel.style.cssText = 'min-width:0;';
      sel.setAttribute('aria-label','Übung für Minute '+(idx+1));
      // Fill options
      for(var j = 0; j < EX_DB.length; j++){
        var opt = document.createElement('option');
        opt.value = EX_DB[j].name;
        opt.textContent = EX_DB[j].name;
        if(emomMixPlan[idx].exName === EX_DB[j].name) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.onchange = function(){ emomMixPlan[idx].exName = sel.value; };
      if(!emomMixPlan[idx].exName) emomMixPlan[idx].exName = sel.value;

      var repsInp = document.createElement('input');
      repsInp.type = 'number';
      repsInp.placeholder = 'Wdh';
      repsInp.min = '1';
      repsInp.value = emomMixPlan[idx].reps || '';
      repsInp.className = 'inp num';
      repsInp.style.cssText = 'text-align:center;padding-left:8px;padding-right:8px;box-sizing:border-box;';
      repsInp.setAttribute('aria-label','Wdh-Ziel für Minute '+(idx+1));
      repsInp.oninput = function(){ emomMixPlan[idx].reps = repsInp.value; };

      row.appendChild(minLabel);
      row.appendChild(sel);
      row.appendChild(repsInp);
      grid.appendChild(row);
    })(i);
  }
}

// ── EMOM MODE ─────────────────────────────────────────────
var emomMode = 'single'; // 'single' or 'mix'

function emomSetMode(mode){
  emomMode = mode;
  var sb = document.getElementById('emom-mode-single');
  var mb = document.getElementById('emom-mode-mix');
  var pb = document.getElementById('emom-mode-pure');
  var ss = document.getElementById('emom-single-section');
  var ms = document.getElementById('emom-mix-section');
  var desc = document.getElementById('emom-mode-desc');
  var startBtn = document.getElementById('emom-start-btn');

  // Segment-Control: aktiver Zustand über Klasse 'on' (.seg-ctl in tracker.html);
  // die alten Inline-Werte background/color werden entfernt, damit die Klasse greift.
  [sb,mb,pb].forEach(function(b){ if(b){ b.style.background=''; b.style.color=''; b.classList.remove('on'); b.setAttribute('aria-selected','false'); } });
  function segOn(b){ if(b){ b.classList.add('on'); b.setAttribute('aria-selected','true'); } }

  if(mode === 'single'){
    segOn(sb);
    if(ss) ss.style.display='block';
    if(ms) ms.style.display='none';
    if(desc) desc.textContent='Eine Übung für alle Minuten — jede Minute gleiche Übung, Wdh. selbst eintragen.';
    if(startBtn){ startBtn.textContent='EMOM starten'; startBtn.style.display='block'; }
    emomMixPlan = [];
  } else if(mode === 'mix'){
    segOn(mb);
    if(ss) ss.style.display='none';
    if(ms) ms.style.display='block';
    if(desc) desc.textContent='Lege für jede Minute eine eigene Übung und ein Wdh.-Ziel fest.';
    if(startBtn){ startBtn.textContent='EMOM starten'; startBtn.style.display='block'; }
    emomBuildMixGrid();
  } else if(mode === 'pure'){
    segOn(pb);
    if(ss) ss.style.display='none';
    if(ms) ms.style.display='none';
    if(desc) desc.textContent='Reiner Intervall-Timer — kein Eintrag, nur Countdown.';
    if(startBtn) startBtn.textContent='Timer starten';
    if(startBtn) startBtn.style.display='block';
    emomMixPlan = [];
  }
}

// ── EMOM TIMER ────────────────────────────────────────────
var emomExList = [];
var emomInterval = null;
var emomSecondsLeft = 60;
var emomSecsPerRound = 60;
var emomCurrentRound = 0;
var emomTotalRounds = 10;
var emomSetsPerEx = 3;
var emomLog = []; // {exName, reps, round}
var emomExIdx = 0; // which exercise this round

function showEmomSetup(show){
  var setup = document.getElementById('emom-setup');
  var active = document.getElementById('emom-active');
  var startScreen = document.getElementById('start-screen');
  if(!setup || !active || !startScreen) return;
  if(show){
    if(startScreen) startScreen.style.display = 'none';
    active.style.display = 'none';
    setup.style.display = 'block';
    emomExList = [];
    emomMode = 'single';
    emomBuildExPicker();
    emomRenderExList();
    emomSetMode('single');
  } else {
    setup.style.display = 'none';
    active.style.display = 'none';
    if(woActive){
      // Return to active workout
      document.getElementById('active-workout').style.display='block';
    } else {
      if(startScreen) startScreen.style.display = 'block';
    }
  }
}

function emomBuildExPicker(){
  var ids = ['emom-ex-pick', 'emom-ex-pick-mix'];
  for(var si=0; si<ids.length; si++){
    var sel = document.getElementById(ids[si]);
    if(!sel) continue;
    sel.innerHTML = '';
    for(var i = 0; i < EX_DB.length; i++){
      var opt = document.createElement('option');
      opt.value = EX_DB[i].name;
      opt.textContent = EX_DB[i].name + ' (' + EX_DB[i].cat + ')';
      sel.appendChild(opt);
    }
  }
}

function emomAddEx(){
  var sel = document.getElementById('emom-ex-pick-mix');
  if(!sel) sel = document.getElementById('emom-ex-pick');
  if(!sel) return;
  var name = sel.value;
  if(!name) return;
  if(emomExList.indexOf(name) > -1){ toast('Übung bereits hinzugefügt!'); return; }
  emomExList.push(name);
  emomRenderExList();
  // Show start button if at least 1 exercise
  var btn = document.getElementById('emom-start-btn');
  if(btn) btn.style.display = emomExList.length > 0 ? 'block' : 'none';
}

function emomRemoveEx(idx){
  emomExList.splice(idx, 1);
  emomRenderExList();
  var btn = document.getElementById('emom-start-btn');
  if(btn) btn.style.display = emomExList.length > 0 ? 'block' : 'none';
}

function emomRenderExList(){
  var el = document.getElementById('emom-ex-list');
  if(!el) return;
  el.innerHTML = '';
  if(!emomExList.length){
    el.innerHTML = '<div class="empty">Noch keine Übungen. Füge eine hinzu!</div>';
    return;
  }
  // Nummerierte Liste (zweistelliger Index) in einer bordered Karte
  var list = document.createElement('div');
  list.className = 'list';
  for(var i = 0; i < emomExList.length; i++){
    (function(idx){
      var row = document.createElement('div');
      row.className = 'list-row';
      row.style.cssText = 'cursor:default;';
      var num = document.createElement('span');
      num.className = 'row-index num';
      num.textContent = (idx+1) < 10 ? '0'+(idx+1) : String(idx+1);
      var main = document.createElement('div');
      main.className = 'row-main';
      var name = document.createElement('div');
      name.className = 'row-title';
      name.textContent = emomExList[idx];
      main.appendChild(name);
      var del = document.createElement('button');
      del.type = 'button';
      del.className = 'icon-btn sm danger pressable';
      del.textContent = '×';
      del.setAttribute('aria-label','Übung entfernen');
      del.onclick = function(){ emomRemoveEx(idx); };
      row.appendChild(num);
      row.appendChild(main);
      row.appendChild(del);
      list.appendChild(row);
    })(i);
  }
  el.appendChild(list);
}

function emomStart(){
  // Guard: Doppel-Tap darf keinen zweiten Interval starten
  if(emomInterval){ clearInterval(emomInterval); emomInterval = null; }
  var minEl = document.getElementById('emom-minutes');
  emomTotalRounds = parseInt(minEl ? minEl.value : 10) || 10;
  emomCurrentRound = 0;
  var secEl = document.getElementById('emom-secs');
  emomSecsPerRound = parseInt(secEl ? secEl.value : 60) || 60;
  emomSecondsLeft = emomSecsPerRound;
  emomLog = [];
  emomExIdx = 0;
  if(emomMode === 'pure'){
    // Reiner Timer — keine Übungsauswahl nötig
    emomExList = [''];
  } else if(emomMode === 'single'){
    var sel = document.getElementById('emom-ex-pick');
    if(sel && sel.value) emomExList = [sel.value];
    if(!emomExList.length){ toast('Bitte eine Übung wählen!'); return; }
  } else {
    // Mix mode - use emomMixPlan
    emomBuildMixGrid();
    emomExList = [];
    for(var pi=0; pi<emomMixPlan.length; pi++){
      emomExList.push(emomMixPlan[pi].exName);
    }
    if(!emomExList.length){ toast('Bitte Übungen einstellen!'); return; }
  }

  // Show active screen
  var setup = document.getElementById('emom-setup');
  var active = document.getElementById('emom-active');
  if(setup) setup.style.display = 'none';
  if(active) active.style.display = 'block';
  // Pure timer: hide reps card
  var repsCard = document.getElementById('emom-reps-card');
  if(repsCard) repsCard.style.display = emomMode==='pure' ? 'none' : 'block';

  emomUpdateDisplay();
  emomInterval = setInterval(emomTick, 1000);
}

function emomTick(){
  emomSecondsLeft--;
  emomUpdateDisplay();
  if(emomSecondsLeft <= 0){
    emomCurrentRound++;
    if(emomCurrentRound >= emomTotalRounds){
      emomFinish();
      return;
    }
    emomSecondsLeft = emomSecsPerRound;
    // Next exercise (cycle through list)
    emomExIdx = emomCurrentRound % emomExList.length;
    emomUpdateDisplay();
    // Flash notification
    var targetReps = (emomMode==='mix' && emomMixPlan[emomCurrentRound]) ? emomMixPlan[emomCurrentRound].reps : '';
    var toastMsg = 'Min '+(emomCurrentRound+1)+'! '+emomExList[emomExIdx];
    if(targetReps) toastMsg += ' — Ziel: '+targetReps+' Wdh';
    toast(toastMsg);
  }
}

function emomUpdateDisplay(){
  var timerEl = document.getElementById('emom-timer-display');
  var roundEl = document.getElementById('emom-round-display');
  var exEl = document.getElementById('emom-ex-display');
  var barEl = document.getElementById('emom-progress-bar');
  var logEl = document.getElementById('emom-logged');

  if(timerEl) timerEl.textContent = String(emomSecondsLeft);
  if(roundEl) roundEl.textContent = 'Min ' + (emomCurrentRound+1) + ' / ' + emomTotalRounds;
  var tgtReps = (emomMode==='mix' && emomMixPlan[emomCurrentRound]) ? emomMixPlan[emomCurrentRound].reps : '';
  if(exEl) exEl.textContent = (emomExList[emomExIdx]||'') + (tgtReps ? ' — Ziel: '+tgtReps+' Wdh' : '');
  if(barEl) barEl.style.width = Math.round((emomSecondsLeft/(emomSecsPerRound||60))*100) + '%';
  // Color warning when < 10 seconds
  if(timerEl) timerEl.style.color = emomSecondsLeft <= 10 ? 'var(--red)' : 'var(--accent)';
  if(barEl) barEl.style.background = emomSecondsLeft <= 10 ? 'var(--red)' : 'var(--accent)';

  // Show log (letzte 5 Runden als Zeilen mit 1px-Trennlinie)
  if(logEl){
    if(!emomLog.length){
      logEl.innerHTML = '<div class="row-sub" style="text-align:center;padding:6px 0;">Trag deine Wdh ein!</div>';
    } else {
      var html = '<div class="list">';
      for(var i = emomLog.length-1; i >= Math.max(0, emomLog.length-5); i--){
        html += '<div class="list-row" style="cursor:default;min-height:44px;">'
          + '<span class="row-index num">'+(emomLog[i].round < 10 ? '0'+emomLog[i].round : emomLog[i].round)+'</span>'
          + '<div class="row-main"><div class="row-title">'+emomLog[i].exName+'</div></div>'
          + '<div style="display:flex;align-items:baseline;gap:4px;flex-shrink:0;"><span class="row-val num">'+emomLog[i].reps+'</span><span class="unit">Wdh</span></div>'
          + '</div>';
      }
      html += '</div>';
      logEl.innerHTML = html;
    }
  }
}

function emomLogRep(){
  var inp = document.getElementById('emom-reps-inp');
  if(!inp) return;
  var reps = parseInt(inp.value) || 0;
  if(reps <= 0) return;
  emomLog.push({round: emomCurrentRound+1, exName: emomExList[emomExIdx], reps: reps});
  inp.value = '';
  // Count how many rounds logged
  var roundsLogged = emomLog.length;
  // If we've logged as many rounds as total, ask to finish
  if(roundsLogged >= emomTotalRounds){
    emomUpdateDisplay();
    emomShowFinishModal();
    return;
  }
  // Advance to next round immediately
  emomCurrentRound++;
  emomSecondsLeft = emomSecsPerRound;
  emomExIdx = (emomMode==='mix') ? emomCurrentRound : emomCurrentRound % emomExList.length;
  emomUpdateDisplay();
  var tgt = (emomMode==='mix'&&emomMixPlan[emomCurrentRound]) ? emomMixPlan[emomCurrentRound].reps : '';
  toast('Super! Min '+(emomCurrentRound+1)+' - '+(emomExList[emomExIdx]||'')+(tgt?' Ziel: '+tgt+' Wdh':''));
}

function emomStop(){
  if(emomInterval){ clearInterval(emomInterval); emomInterval = null; }
  if(!emomLog.length){
    // Abbruch ohne geloggte Runden — keine Feier, sauber zurück
    var active = document.getElementById('emom-active');
    if(active) active.style.display = 'none';
    emomSaveAndReset();
    if(typeof woActive !== 'undefined' && woActive){
      var aw = document.getElementById('active-workout');
      if(aw) aw.style.display = 'block';
    } else {
      var ss = document.getElementById('start-screen');
      if(ss) ss.style.display = 'block';
    }
    toast('EMOM abgebrochen');
    return;
  }
  emomFinish();
}



function emomAdjustTime(secs){
  emomSecondsLeft = Math.max(1, Math.min(emomSecsPerRound||60, emomSecondsLeft + secs));
  emomUpdateDisplay();
}

function emomRoundDone(){
  emomCurrentRound++;
  if(emomCurrentRound>=emomTotalRounds){emomShowFinishModal();return;}
  emomSecondsLeft=emomSecsPerRound;
  emomExIdx=(emomMode==='mix')?emomCurrentRound:emomCurrentRound%emomExList.length;
  emomUpdateDisplay();
  var tgt=(emomMode==='mix'&&emomMixPlan[emomCurrentRound])?emomMixPlan[emomCurrentRound].reps:'';
  toast('Min '+(emomCurrentRound+1)+'! '+emomExList[emomExIdx]+(tgt?' - Ziel: '+tgt+' Wdh':''));
}

function emomShowFinishModal(){
  if(emomInterval){clearInterval(emomInterval);emomInterval=null;}
  var active=document.getElementById('emom-active');if(active)active.style.display='none';
  var ex=document.getElementById('emom-finish-modal');if(ex)ex.remove();
  var modal=document.createElement('div');modal.id='emom-finish-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px;';
  var box=document.createElement('div');box.style.cssText='background:var(--card);border:1px solid var(--line2);border-radius:var(--r-card);padding:24px 20px;width:100%;max-width:320px;text-align:center;';
  // Icon-Slot: Haken im Ring statt Emoji
  var ic=document.createElement('div');ic.style.cssText='display:flex;justify-content:center;margin-bottom:14px;';
  ic.innerHTML=(typeof iconWrap==='function')?iconWrap('check',{size:22,box:56,color:'var(--accent)'}):'';
  var ti=document.createElement('div');ti.className='ttl';ti.style.cssText='margin-bottom:6px;';ti.textContent='EMOM fertig!';
  var st=document.createElement('div');st.className='row-sub num';st.style.cssText='margin-bottom:22px;';
  var tr=0;for(var i=0;i<emomLog.length;i++)tr+=parseInt(emomLog[i].reps)||0;
  st.textContent=emomLog.length+' Sätze · '+tr+' Wdh gesamt';
  var b1=document.createElement('button');b1.type='button';b1.className='btn pressable';b1.style.cssText='margin:0 0 8px;';b1.textContent='Neues EMOM starten';b1.onclick=function(){modal.remove();emomSaveAndReset();showEmomSetup(true);};
  var b2=document.createElement('button');b2.type='button';b2.className='btn-g pressable';b2.style.cssText='width:100%;min-height:44px;margin-bottom:8px;';b2.textContent='Zum Startscreen';b2.onclick=function(){modal.remove();emomSaveAndReset();var ss=document.getElementById('start-screen');if(ss)ss.style.display='block';};
  var b3=document.createElement('button');b3.type='button';b3.className='pressable u';b3.style.cssText='width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:10px;font-weight:500;padding:12px;cursor:pointer;';b3.textContent='Normales Workout fortsetzen';b3.onclick=function(){
    modal.remove();emomSaveAndReset();
    if(typeof woActive!=='undefined'&&woActive){
      var aw=document.getElementById('active-workout');if(aw)aw.style.display='block';
    } else {
      var ss=document.getElementById('start-screen');if(ss)ss.style.display='block';
    }
  };
  box.appendChild(ic);box.appendChild(ti);box.appendChild(st);box.appendChild(b1);box.appendChild(b2);box.appendChild(b3);
  modal.appendChild(box);document.body.appendChild(modal);
  if(window.caliMotion){ caliMotion.sheetIn(null, modal); caliMotion.overlayIn(box); if(emomLog.length>0) caliMotion.celebrate('burst'); }
}

function emomSaveAndReset(){
  if(emomLog.length>0){
    var date=new Date().toISOString().slice(0,10);var time=new Date().toTimeString().slice(0,5);
    var byEx={};for(var i=0;i<emomLog.length;i++){var ex=emomLog[i].exName;if(!byEx[ex])byEx[ex]=[];byEx[ex].push(emomLog[i].reps);}
    var keys=Object.keys(byEx);
    for(var k=0;k<keys.length;k++){var sets=byEx[keys[k]].map(function(r){return{n:r,band:'',belt:0};});ents.push({id:new Date().getTime()+k,date:date,time:time,name:keys[k],sets:sets,dur:emomTotalRounds*(emomSecsPerRound||60),emom:true});}
    try{sd();}catch(e){}try{bb();}catch(e){}try{fbSave();}catch(e){}try{calcStreak();buildStreakWidget();}catch(e){}
    toast('EMOM gespeichert!');
  }
  emomExList=[];emomLog=[];emomMixPlan=[];
}

function emomFinish(){
  emomShowFinishModal();
}




// ── APP INIT (nach allen Scripts) ─────────────────────────
(function(){
  lmax(); lpd(); lpr(); lstreak(); ld(); loadChallenges(); loadCurrency();
  bb(); bhr(); buildStartPlanBtns(); buildStartChallengeWidget();
  setTimeout(function(){ buildChallengeUI(); }, 100);
  var _md = document.getElementById('max-date'); if(_md) _md.valueAsDate = new Date();
  // MAX dropdowns filled via populateMaxDropdowns() called on page switch
  var _mx = document.getElementById('max-ex');
  if(_mx){
    _mx.onchange = function(){
      var u = this.value.split('|')[1];
      var lbl = document.getElementById('max-val-lbl');
      if(lbl) lbl.textContent = u==='Sek'?'Ergebnis (Sek)':u==='Min:Sek'?'Ergebnis (Min:Sek)':'Ergebnis (Wdh.)';
    };
  }
})();

// ── EMOM SKIP ─────────────────────────────────────────────
function emomSkip(dir){
  if(!emomInterval) return;
  if(dir > 0){
    // Skip vorwärts
    emomCurrentRound++;
    if(emomCurrentRound >= emomTotalRounds){ emomFinish(); return; }
    emomSecondsLeft = emomSecsPerRound || 60;
  } else {
    // Skip rückwärts
    if(emomCurrentRound > 0) emomCurrentRound--;
    emomSecondsLeft = emomSecsPerRound || 60;
  }
  emomUpdateDisplay();
}
