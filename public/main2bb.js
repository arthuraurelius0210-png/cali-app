





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
      row.style.cssText = 'display:grid;grid-template-columns:40px 1fr 80px;gap:8px;margin-bottom:8px;align-items:center;';

      var minLabel = document.createElement('div');
      minLabel.style.cssText = 'font-family:inherit;font-size:14px;color:var(--accent);text-align:center;';
      minLabel.textContent = 'MIN ' + (idx+1);

      var sel = document.createElement('select');
      sel.style.cssText = 'background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:8px 10px;font-family:inherit;font-size:13px;outline:none;';
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
      repsInp.style.cssText = 'background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:8px 10px;font-family:inherit;font-size:13px;outline:none;width:100%;box-sizing:border-box;';
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

  [sb,mb,pb].forEach(function(b){ if(b){b.style.background='none';b.style.color='#888';} });

  if(mode === 'single'){
    if(sb){sb.style.background='var(--accent)';sb.style.color='#000';}
    if(ss) ss.style.display='block';
    if(ms) ms.style.display='none';
    if(desc) desc.textContent='Eine Ubung fur alle Minuten — jede Minute gleiche Ubung, Wdh selbst eintragen.';
    if(startBtn) startBtn.style.display='block';
    emomMixPlan = [];
  } else if(mode === 'mix'){
    if(mb){mb.style.background='var(--accent)';mb.style.color='#000';}
    if(ss) ss.style.display='none';
    if(ms) ms.style.display='block';
    if(desc) desc.textContent='Lege fur jede Minute eine eigene Ubung und Wdh-Ziel fest.';
    if(startBtn) startBtn.style.display='block';
    emomBuildMixGrid();
  } else if(mode === 'pure'){
    if(pb){pb.style.background='var(--accent)';pb.style.color='#000';}
    if(ss) ss.style.display='none';
    if(ms) ms.style.display='none';
    if(desc) desc.textContent='Reiner Intervall-Timer — kein Eintrag, nur Countdown.';
    if(startBtn) startBtn.textContent='TIMER STARTEN';
    if(startBtn) startBtn.style.display='block';
    emomMixPlan = [];
  }
}

// ── EMOM TIMER ────────────────────────────────────────────
var emomExList = [];
var emomInterval = null;
var emomSecondsLeft = 60;
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
      if(startScreen) startScreen.style.display = 'flex';
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
  if(emomExList.indexOf(name) > -1){ toast('Ubung bereits hinzugefugt!'); return; }
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
    el.innerHTML = '<div style="font-size:12px;color:var(--muted2);padding:8px 0;">Noch keine Ubungen. Fugg eine hinzu!</div>';
    return;
  }
  for(var i = 0; i < emomExList.length; i++){
    (function(idx){
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:1px solid #1e1e1e;border-radius:10px;padding:10px 14px;margin-bottom:6px;';
      var num = document.createElement('div');
      num.style.cssText = 'font-family:inherit;font-size:13px;color:var(--accent);margin-right:10px;';
      num.textContent = String(idx+1);
      var name = document.createElement('div');
      name.style.cssText = 'flex:1;font-size:13px;color:var(--text);';
      name.textContent = emomExList[idx];
      var del = document.createElement('button');
      del.style.cssText = 'background:none;border:none;color:#ff4444;font-size:16px;cursor:pointer;padding:0 4px;';
      del.textContent = '\u00D7';
      del.onclick = function(){ emomRemoveEx(idx); };
      row.appendChild(num);
      row.appendChild(name);
      row.appendChild(del);
      el.appendChild(row);
    })(i);
  }
}

function emomStart(){
  var minEl = document.getElementById('emom-minutes');
  emomTotalRounds = parseInt(minEl ? minEl.value : 10) || 10;
  emomCurrentRound = 0;
  emomSecondsLeft = 60;
  emomLog = [];
  emomExIdx = 0;
  if(emomMode === 'pure'){
    // Reiner Timer — keine Übungsauswahl nötig
    emomExList = [''];
    var secEl = document.getElementById('emom-secs');
    emomSecondsLeft = parseInt(secEl ? secEl.value : 60) || 60;
  } else if(emomMode === 'single'){
    var sel = document.getElementById('emom-ex-pick');
    if(sel && sel.value) emomExList = [sel.value];
    if(!emomExList.length){ toast('Bitte eine Ubung wahlen!'); return; }
  } else {
    // Mix mode - use emomMixPlan
    emomBuildMixGrid();
    emomExList = [];
    for(var pi=0; pi<emomMixPlan.length; pi++){
      emomExList.push(emomMixPlan[pi].exName);
    }
    if(!emomExList.length){ toast('Bitte Ubungen einstellen!'); return; }
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
    emomSecondsLeft = 60;
    // Next exercise (cycle through list)
    emomExIdx = emomCurrentRound % emomExList.length;
    emomUpdateDisplay();
    // Flash notification
    var targetReps = (emomMode==='mix' && emomMixPlan[emomCurrentRound]) ? emomMixPlan[emomCurrentRound].reps : '';
    var toastMsg = 'MIN '+(emomCurrentRound+1)+'! '+emomExList[emomExIdx];
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
  if(roundEl) roundEl.textContent = 'MIN ' + (emomCurrentRound+1) + ' / ' + emomTotalRounds;
  var tgtReps = (emomMode==='mix' && emomMixPlan[emomCurrentRound]) ? emomMixPlan[emomCurrentRound].reps : '';
  if(exEl) exEl.textContent = (emomExList[emomExIdx]||'') + (tgtReps ? ' — Ziel: '+tgtReps+' Wdh' : '');
  if(barEl) barEl.style.width = Math.round((emomSecondsLeft/60)*100) + '%';
  // Color warning when < 10 seconds
  if(timerEl) timerEl.style.color = emomSecondsLeft <= 10 ? '#ff4444' : 'var(--accent)';
  if(barEl) barEl.style.background = emomSecondsLeft <= 10 ? '#ff4444' : 'var(--accent)';

  // Show log
  if(logEl){
    if(!emomLog.length){
      logEl.innerHTML = '<div style="font-size:11px;color:var(--muted2);text-align:center;">Trag deine Wdh ein!</div>';
    } else {
      var html = '';
      for(var i = emomLog.length-1; i >= Math.max(0, emomLog.length-5); i--){
        html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #111;">'
          + '<div style="font-size:12px;color:var(--muted);">Rd '+emomLog[i].round+' — '+emomLog[i].exName+'</div>'
          + '<div style="font-family:inherit;font-size:14px;color:var(--accent);">'+emomLog[i].reps+' Wdh</div>'
          + '</div>';
      }
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
  emomSecondsLeft = 60;
  emomExIdx = (emomMode==='mix') ? emomCurrentRound : emomCurrentRound % emomExList.length;
  emomUpdateDisplay();
  var tgt = (emomMode==='mix'&&emomMixPlan[emomCurrentRound]) ? emomMixPlan[emomCurrentRound].reps : '';
  toast('Super! MIN '+(emomCurrentRound+1)+' - '+(emomExList[emomExIdx]||'')+(tgt?' Ziel: '+tgt+' Wdh':''));
}

function emomStop(){
  if(emomInterval){ clearInterval(emomInterval); emomInterval = null; }
  emomFinish();
}



function emomAdjustTime(secs){
  emomSecondsLeft = Math.max(1, Math.min(60, emomSecondsLeft + secs));
  emomUpdateDisplay();
}

function emomRoundDone(){
  emomCurrentRound++;
  if(emomCurrentRound>=emomTotalRounds){emomShowFinishModal();return;}
  emomSecondsLeft=60;
  emomExIdx=(emomMode==='mix')?emomCurrentRound:emomCurrentRound%emomExList.length;
  emomUpdateDisplay();
  var tgt=(emomMode==='mix'&&emomMixPlan[emomCurrentRound])?emomMixPlan[emomCurrentRound].reps:'';
  toast('MIN '+(emomCurrentRound+1)+'! '+emomExList[emomExIdx]+(tgt?' - Ziel: '+tgt+' Wdh':''));
}

function emomShowFinishModal(){
  if(emomInterval){clearInterval(emomInterval);emomInterval=null;}
  var active=document.getElementById('emom-active');if(active)active.style.display='none';
  var ex=document.getElementById('emom-finish-modal');if(ex)ex.remove();
  var modal=document.createElement('div');modal.id='emom-finish-modal';
  modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9990;display:flex;align-items:center;justify-content:center;padding:24px;';
  var box=document.createElement('div');box.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:28px 24px;width:100%;max-width:320px;text-align:center;';
  var ic=document.createElement('div');ic.style.cssText='font-size:52px;margin-bottom:12px;';ic.textContent='\uD83C\uDF89';
  var ti=document.createElement('div');ti.style.cssText='font-family:inherit;font-size:26px;letter-spacing:3px;color:var(--accent);margin-bottom:8px;';ti.textContent='EMOM FERTIG!';
  var st=document.createElement('div');st.style.cssText='font-size:13px;color:var(--muted);margin-bottom:24px;';
  var tr=0;for(var i=0;i<emomLog.length;i++)tr+=parseInt(emomLog[i].reps)||0;
  st.textContent=emomLog.length+' Satze  |  '+tr+' Wdh gesamt';
  var b1=document.createElement('button');b1.style.cssText='width:100%;background:var(--accent);color:#000;border:none;border-radius:10px;font-family:inherit;font-size:15px;letter-spacing:2px;padding:14px;cursor:pointer;margin-bottom:10px;';b1.textContent='NEUES EMOM STARTEN';b1.onclick=function(){modal.remove();emomSaveAndReset();showEmomSetup(true);};
  var b2=document.createElement('button');b2.style.cssText='width:100%;background:none;border:1px solid #2a2a2a;color:var(--text);border-radius:10px;font-family:inherit;font-size:15px;letter-spacing:2px;padding:14px;cursor:pointer;margin-bottom:10px;';b2.textContent='WORKOUT BEENDEN';b2.onclick=function(){modal.remove();emomSaveAndReset();var ss=document.getElementById('start-screen');if(ss)ss.style.display='flex';};
  var b3=document.createElement('button');b3.style.cssText='width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:10px;cursor:pointer;';b3.textContent='NORMALES WORKOUT FORTSETZEN';b3.onclick=function(){modal.remove();emomSaveAndReset();var ss=document.getElementById('start-screen');if(ss)ss.style.display='flex';};
  box.appendChild(ic);box.appendChild(ti);box.appendChild(st);box.appendChild(b1);box.appendChild(b2);box.appendChild(b3);
  modal.appendChild(box);document.body.appendChild(modal);
}

function emomSaveAndReset(){
  if(emomLog.length>0){
    var date=new Date().toISOString().slice(0,10);var time=new Date().toTimeString().slice(0,5);
    var byEx={};for(var i=0;i<emomLog.length;i++){var ex=emomLog[i].exName;if(!byEx[ex])byEx[ex]=[];byEx[ex].push(emomLog[i].reps);}
    var keys=Object.keys(byEx);
    for(var k=0;k<keys.length;k++){var sets=byEx[keys[k]].map(function(r){return{n:r,band:'',belt:0};});ents.push({id:new Date().getTime()+k,date:date,time:time,name:keys[k],sets:sets,dur:emomTotalRounds*60,emom:true});}
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
  var _mx = document.getElementById('max-ex');
  if(_mx){
    // Fill with all EX_DB exercises
    _mx.innerHTML = '';
    if(typeof EX_DB !== 'undefined'){
      EX_DB.forEach(function(ex, i){
        var opt = document.createElement('option');
        opt.value = ex.name+' Max|'+ex.unit;
        opt.textContent = ex.name+' (Max '+ex.unit+')';
        _mx.appendChild(opt);
      });
    }
    // Also fill the chart select in VERLAUF section
    var _mc = document.getElementById('max-chart-ex');
    if(_mc){
      _mc.innerHTML = '';
      if(typeof EX_DB !== 'undefined'){
        EX_DB.forEach(function(ex){
          var opt = document.createElement('option');
          opt.value = ex.name+' Max';
          opt.textContent = ex.name;
          _mc.appendChild(opt);
        });
      }
    }
    _mx.onchange = function(){
      var u = this.value.split('|')[1];
      var lbl = document.getElementById('max-val-lbl');
      if(lbl) lbl.textContent = u==='Sek'?'ERGEBNIS (SEK)':u==='Min:Sek'?'ERGEBNIS (MIN:SEK)':'ERGEBNIS (WDH)';
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
    emomSecondsLeft = parseInt(document.getElementById('emom-secs')?document.getElementById('emom-secs').value:60)||60;
  } else {
    // Skip rückwärts
    if(emomCurrentRound > 0) emomCurrentRound--;
    emomSecondsLeft = parseInt(document.getElementById('emom-secs')?document.getElementById('emom-secs').value:60)||60;
  }
  emomUpdateDisplay();
}
