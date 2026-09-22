
// ── Meilensteine — viele kleine Schritte ──────────────────
// Auf Dateiebene, damit auch das Start-Dashboard (app1.js) via
// getUnclaimedMilestoneCount() darauf zugreifen kann.
// icon = Name aus CALI_ICONS (Line-Icons) — kein Emoji mehr im UI.
// Die Tabelle MILESTONES liegt in econ.js (geteilt mit dem Server, der die Diamanten gutschreibt).

// Meilenstein abholen: der Server prüft das Kontoalter und schreibt die Diamanten gut.
// Der lokale Schlüssel merkt sich nur, dass die Zeile als abgeholt gezeigt wird.
function claimMilestone(m, btn, done){
  if(btn) btn.disabled = true;
  earnReward('milestone', String(m.days), {label:m.badge}, function(res){
    if(!res || (res.ok === false && !res.already)){ if(btn) btn.disabled = false; return; }
    try{ localStorage.setItem('cali_ms_claimed_'+m.days, '1'); }catch(x){}
    if(res.ok){
      if(window.caliMotion){ if(btn) caliMotion.floatUp(btn, '+'+m.diamonds+' Diamanten'); caliMotion.celebrate('burst'); }
      toast(m.badge+'! +'+m.diamonds+' Diamanten');
    } else {
      toast(m.badge+' war schon abgeholt');
    }
    if(done) done();
    buildProfilUI();
  });
}

// Icon-Slot-HTML (44px-Ring mit Line-Icon) mit Fallbacks, falls app1.js noch nicht geladen ist
function prIconHtml(name, opts){
  opts = opts || {};
  if(typeof iconWrap === 'function') return iconWrap(name, opts);
  var s = opts.size || 18;
  if(typeof ci === 'function') return '<div style="width:'+s+'px;height:'+s+'px;color:'+(opts.color||'var(--muted)')+';flex-shrink:0;">'+ci(name)+'</div>';
  return '';
}

// Erreichte, aber noch nicht abgeholte Meilenstein-Belohnungen zählen
// (gleiche daysSince-Logik wie buildProfilStreakSection)
function getUnclaimedMilestoneCount(){
  var firstDate = null;
  try{
    if(typeof ents !== 'undefined' && ents.length > 0){
      var sorted = ents.map(function(e){ return e.date; }).filter(Boolean).sort();
      firstDate = sorted[0];
    }
  }catch(x){}
  if(!firstDate && typeof prData !== 'undefined' && prData && prData.joinDate) firstDate = prData.joinDate;
  if(!firstDate) return 0;
  var daysSince = Math.floor((new Date() - new Date(firstDate)) / 86400000);
  return MILESTONES.filter(function(m){
    var c = false; try{ c = !!localStorage.getItem('cali_ms_claimed_'+m.days); }catch(x){}
    return daysSince >= m.days && !c;
  }).length;
}

function buildStreakWidget(){
  var el=document.getElementById('streak-widget');if(!el)return;
  calcStreak();
  var streak=streakData.currentStreak;var weekDone=getWeeklyProgress();var weekGoal=streakData.weeklyGoal||3;
  var lv=getLevel();el.innerHTML='';

  var todayStr=new Date().toISOString().slice(0,10);
  var trainedToday=false;
  for(var ti=0;ti<ents.length;ti++){ if(ents[ti].date===todayStr){ trainedToday=true; break; } }

  // Begrüßung im Home-Header (#start-greeting gehört tracker.html, der Name kommt aus prData)
  var uName=(typeof prData!=='undefined'&&prData&&prData.name)?prData.name:'';
  var greet=document.getElementById('start-greeting');
  if(greet) greet.textContent=uName?'Schön dich zu sehen, '+uName+'.':'Schön dich zu sehen.';

  // Heutiger Plan aus dem Wochenplan (echte Daten aus cali_weekplan) — sonst "Freies Workout"
  var todayPlan=null, todayPlanCount=0;
  try{
    if(typeof getWeekPlan==='function'){
      var wp=getWeekPlan(); var dayIdx=(new Date().getDay()+6)%7; var dayPlans=wp[dayIdx]||[];
      todayPlanCount=dayPlans.length;
      if(dayPlans.length&&typeof getPlanById==='function') todayPlan=getPlanById(dayPlans[0]);
    }
  }catch(e){ todayPlan=null; }

  // ── HERO: Foto (grayscale über .hero-photo) + Verlauf + eingebettete Karte ──
  var hero=document.createElement('div');hero.className='hero';
  var photo=document.createElement('div');photo.className='hero-photo';photo.style.backgroundImage='url(/hero-workout.jpg)';
  var shade=document.createElement('div');shade.className='hero-shade';
  var body=document.createElement('div');body.className='hero-body';
  body.style.cssText='padding:16px;min-height:300px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;gap:16px;';

  // Oben: Streak-Status (Live-Dot) + Level als 1px-Chips
  var top=document.createElement('div');top.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:8px;';
  var chipCss='display:inline-flex;align-items:center;gap:6px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-pill);padding:6px 10px;min-width:0;overflow:hidden;';
  var stChip=document.createElement('div');stChip.style.cssText=chipCss;
  var stTxt, stColor='var(--muted)', dotMuted=false, dotPulse=false;
  if(streak>0&&trainedToday){ stTxt=streak+' Tage Streak'; dotPulse=true; }
  else if(streak>0){ stTxt=streak+' Tage · Heute trainieren!'; stColor='var(--accent)'; }
  else if(streakData.longestStreak>0){ stTxt='Neuer Anlauf · Beste: '+streakData.longestStreak+' Tage'; dotMuted=true; }
  else { stTxt='Noch kein Streak'; dotMuted=true; }
  var stDot=document.createElement('span');stDot.className='live-dot'+(dotPulse?' pulse':'');
  if(dotMuted) stDot.style.background='var(--muted2)';
  var stLbl=document.createElement('span');stLbl.className='lbl num';
  stLbl.style.cssText='color:'+stColor+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;';
  stLbl.textContent=stTxt;
  stChip.appendChild(stDot);stChip.appendChild(stLbl);
  var lvChip=document.createElement('div');lvChip.style.cssText=chipCss+'flex-shrink:0;';
  var lvLbl=document.createElement('span');lvLbl.className='lbl';lvLbl.style.color=lv.color;lvLbl.textContent=lv.label;
  lvChip.appendChild(lvLbl);
  top.appendChild(stChip);top.appendChild(lvChip);

  // Unten: Karte "Heutiges Workout" + oranger Kreis-Pfeil (die EINE Primäraktion des Screens)
  var hc=document.createElement('div');hc.className='hero-card';
  var hcTxt=document.createElement('div');hcTxt.style.cssText='flex:1;min-width:0;';
  var eyebrow=document.createElement('span');eyebrow.className='eyebrow';
  var ttl=document.createElement('div');ttl.className='ttl';ttl.style.cssText='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  var hsub=document.createElement('div');hsub.className='row-sub';
  var subTxt='';
  if(todayPlan){
    eyebrow.textContent='Heutiges Workout';
    ttl.textContent=todayPlan.name||'Plan';
    var exN=(todayPlan.exercises||[]).length;
    subTxt=exN+' '+(exN===1?'Übung':'Übungen');
    if(todayPlanCount>1) subTxt+=' · +'+(todayPlanCount-1)+' weitere';
    if(trainedToday) subTxt+=' · Heute trainiert';
  } else {
    eyebrow.textContent='Heute';
    ttl.textContent='Freies Workout';
    if(trainedToday) subTxt='Heute bereits trainiert';
    else if(typeof plans!=='undefined'&&plans&&plans.length) subTxt=plans.length+' '+(plans.length===1?'Plan':'Pläne')+' verfügbar';
  }
  hcTxt.appendChild(eyebrow);hcTxt.appendChild(ttl);
  if(subTxt){ hsub.textContent=subTxt; hcTxt.appendChild(hsub); }
  var goBtn=document.createElement('button');goBtn.type='button';goBtn.className='icon-btn acc pressable';
  goBtn.setAttribute('aria-label', todayPlan ? (todayPlan.name+' starten') : 'Workout starten');
  goBtn.innerHTML='&#8594;';
  goBtn.onclick=function(){
    if(todayPlan&&typeof startPlanById==='function') startPlanById(todayPlan.id);
    else startWorkout(null);
  };
  hc.appendChild(hcTxt);hc.appendChild(goBtn);

  body.appendChild(top);body.appendChild(hc);
  hero.appendChild(photo);hero.appendChild(shade);hero.appendChild(body);
  el.appendChild(hero);

  // ── Doppelkachel STREAK | DIESE WOCHE (nur echte Werte) ──
  var grid=document.createElement('div');grid.className='stat-grid';grid.style.cssText='margin:10px 0 0;';

  var t1=document.createElement('div');t1.className='stat-tile';
  var t1Lbl=document.createElement('span');t1Lbl.className='lbl';t1Lbl.textContent='Streak';
  var t1Row=document.createElement('div');t1Row.className='kpi-row';
  var t1Val=document.createElement('span');t1Val.className='kpi num';t1Val.textContent=String(streak);
  var t1Unit=document.createElement('span');t1Unit.className='unit';t1Unit.textContent=streak===1?'Tag':'Tage';
  t1Row.appendChild(t1Val);t1Row.appendChild(t1Unit);
  t1.appendChild(t1Lbl);t1.appendChild(t1Row);
  if(streakData.longestStreak>0){
    var t1Best=document.createElement('div');t1Best.className='row-sub num';t1Best.style.cssText='margin-top:0;';
    t1Best.textContent='Beste: '+streakData.longestStreak+' Tage';
    t1.appendChild(t1Best);
  }
  // Flammen/Diamanten-Guthaben (echte Werte, ohne Emoji)
  if(typeof currency!=='undefined'&&currency){
    var t1Cur=document.createElement('div');t1Cur.className='row-sub num';t1Cur.style.cssText='margin-top:0;';
    t1Cur.textContent=(currency.flames||0)+' Flammen · '+(currency.diamonds||0)+' Diamanten';
    t1.appendChild(t1Cur);
  }
  // Erreichte, aber noch nicht abgeholte Meilenstein-Belohnungen (gleiche Quelle wie das Profil)
  var unclaimedMs=(typeof getUnclaimedMilestoneCount==='function')?getUnclaimedMilestoneCount():0;
  if(unclaimedMs>0){
    var t1Ms=document.createElement('span');t1Ms.className='lbl';t1Ms.style.cssText='color:var(--accent);';
    t1Ms.textContent='Belohnung im Profil abholen';
    t1.appendChild(t1Ms);
  }

  var weekHit=weekGoal>0&&weekDone>=weekGoal;
  var t2=document.createElement('div');t2.className='stat-tile pressable';
  t2.style.cssText='cursor:pointer;';
  t2.setAttribute('role','button');t2.setAttribute('tabindex','0');
  t2.setAttribute('aria-label','Wochenziel ändern (aktuell '+weekGoal+' pro Woche)');
  t2.onclick=function(){showWeeklyGoalModal();};
  t2.onkeydown=function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); showWeeklyGoalModal(); } };
  var t2Lbl=document.createElement('span');t2Lbl.className='lbl';t2Lbl.textContent='Diese Woche';
  t2.appendChild(t2Lbl);
  if(weekHit){ var t2Delta=document.createElement('span');t2Delta.className='delta';t2Delta.textContent='Ziel erreicht';t2.appendChild(t2Delta); }
  var t2Row=document.createElement('div');t2Row.className='kpi-row';
  var t2Val=document.createElement('span');t2Val.className='kpi num';
  var t2Done=document.createElement('span');t2Done.textContent=String(weekDone);
  t2Val.appendChild(t2Done);t2Val.appendChild(document.createTextNode(' / '+weekGoal));
  var t2Unit=document.createElement('span');t2Unit.className='unit';t2Unit.textContent='Workouts';
  t2Row.appendChild(t2Val);t2Row.appendChild(t2Unit);
  t2.appendChild(t2Row);
  // Segmentbalken: ein Segment pro Ziel-Workout, füllt sich Segment für Segment (--k-Stagger aus tracker.html)
  var dotRow=document.createElement('div');dotRow.className='segbar-dots';
  var segs=[];
  for(var i=0;i<weekGoal;i++){var seg=document.createElement('i');seg.style.setProperty('--k',String(i));dotRow.appendChild(seg);segs.push(seg);}
  t2.appendChild(dotRow);
  // Mini-Balken Mo–So (Sätze pro Tag aus echten Einträgen, Helfer weekSetBars in app1.js —
  // gleiche Wochenbasis wie getWeeklyProgress). Ohne Training diese Woche: keine Balken.
  if(weekDone>0&&typeof weekSetBars==='function') t2.insertAdjacentHTML('beforeend', weekSetBars());
  var t2Hint=document.createElement('span');t2Hint.className='lbl';t2Hint.style.cssText='color:var(--muted2);';t2Hint.textContent='Ziel ändern ›';
  t2.appendChild(t2Hint);

  grid.appendChild(t1);grid.appendChild(t2);
  el.appendChild(grid);

  // Segmente + Zahlen animieren (reduced motion / Hintergrund-Tab: sofort)
  var segsFilled=false;
  var fillSegs=function(){ if(segsFilled) return; segsFilled=true; for(var s=0;s<segs.length;s++){ if(s<weekDone) segs[s].classList.add('on'); } };
  if(window.caliMotion&&!caliMotion.reduced()&&typeof requestAnimationFrame==='function'){
    requestAnimationFrame(function(){ requestAnimationFrame(fillSegs); });
    setTimeout(fillSegs, 400);
    caliMotion.countUp(t1Val, streak, {duration:600});
    caliMotion.countUp(t2Done, weekDone, {duration:600});
  } else { fillSegs(); }

  // Einmalige Feier pro Woche, wenn das Wochenziel erreicht wird
  if(weekHit){
    var wgd=new Date();var wgDow=wgd.getDay();var wgs=new Date(wgd);wgs.setDate(wgd.getDate()-(wgDow===0?6:wgDow-1));
    var wgKey='cali_weekgoal_done_'+wgs.toISOString().slice(0,10);
    var wgDone=false;try{wgDone=!!localStorage.getItem(wgKey);}catch(x){}
    if(!wgDone){
      try{localStorage.setItem(wgKey,'1');}catch(x){}
      if(window.caliMotion){
        if(!caliMotion.reduced()&&typeof dotRow.animate==='function'){
          try{dotRow.animate([{transform:'scale(1)'},{transform:'scale(1.04)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(0.22,1,0.36,1)'});}catch(e){}
        }
        // Genau EINE Feier: schließt ein Workout gerade das Wochenziel ab, feiert
        // der Workout-Abschluss in app1.js (endWorkout ruft buildStreakWidget VOR
        // showWorkoutDone auf). Wir feiern kurz verzögert und nur dann, wenn bis
        // dahin sonst niemand gefeiert hat — erkennbar an der lebenden
        // .cali-burst-Ebene aus motion.js. Läuft auch, wenn app1.js gar kein
        // Flag setzt; ist window.caliWorkoutCelebration gesetzt, warten wir
        // ein paar Beats länger und feiern nur, falls dort doch nichts kommt.
        var wgTries = 0;
        var wgBurst = function(){
          if(!window.caliMotion || caliMotion.reduced()) return;
          if(document.querySelector('.cali-burst')) return;
          var pending = window.caliWorkoutCelebration || document.getElementById('wo-done-ov');
          if(pending && ++wgTries < 4){ setTimeout(wgBurst, 300); return; }
          caliMotion.celebrate('burst');
        };
        setTimeout(wgBurst, 250);
      }
    }
  }

  buildProfilStreakSection();
  if(typeof buildStartDashboard==='function') buildStartDashboard();
}

function buildProfilStreakSection(){
  var strEl=document.getElementById('pr-streak-section');
  if(strEl){
    strEl.innerHTML='';
    var wd=getWeeklyProgress();var wg=streakData.weeklyGoal||3;
    var cs=streakData.currentStreak||0;
    var g=document.createElement('div');g.className='stat-grid';
    var a=document.createElement('div');a.className='stat-tile';
    a.innerHTML='<span class="lbl">Streak</span>'+
      '<div class="kpi-row"><span class="kpi num">'+cs+'</span><span class="unit">'+(cs===1?'Tag':'Tage')+'</span></div>'+
      '<div class="row-sub num" style="margin-top:0;">Beste: '+(streakData.longestStreak||0)+' Tage</div>';
    var b=document.createElement('div');b.className='stat-tile';
    b.innerHTML='<span class="lbl">Diese Woche</span>'+
      (wg>0&&wd>=wg?'<span class="delta">Ziel erreicht</span>':'')+
      '<div class="kpi-row"><span class="kpi num">'+wd+' / '+wg+'</span><span class="unit">Workouts</span></div>';
    var sb=document.createElement('div');sb.className='segbar';
    sb.style.setProperty('--pct', String(wg>0?Math.min(100,Math.round((wd/wg)*100)):0));
    b.appendChild(sb);
    g.appendChild(a);g.appendChild(b);
    var chBtn=document.createElement('button');chBtn.type='button';chBtn.className='btn-g pressable';
    chBtn.style.cssText='width:100%;min-height:44px;';
    chBtn.textContent='Wochenziel ändern (aktuell: '+wg+'x)';
    chBtn.onclick=function(){showWeeklyGoalModal();};
    strEl.appendChild(g);strEl.appendChild(chBtn);
  }
  var calEl=document.getElementById('pr-streak-calendar');
  if(calEl){
    calEl.innerHTML='';

    // MILESTONES ist auf Dateiebene definiert (oben), damit auch das
    // Start-Dashboard via getUnclaimedMilestoneCount() darauf zugreifen kann.

    var today = new Date();
    var todayStr = today.toISOString().slice(0,10);
    var workoutDates = {};
    for(var i=0;i<ents.length;i++) workoutDates[ents[i].date] = 1;

    // Ice streak dates
    var iceDates = {};
    try{
      var iceData = JSON.parse(localStorage.getItem('cali_ice_dates')||'{}');
      iceDates = iceData;
    }catch(x){}

    // First date
    var firstDate = null;
    if(ents.length > 0){
      var sorted = ents.map(function(e){ return e.date; }).filter(Boolean).sort();
      firstDate = sorted[0];
    }
    if(!firstDate) firstDate = (prData && prData.joinDate) ? prData.joinDate : todayStr;

    var fd3 = new Date(firstDate);
    var daysSince = Math.floor((today - fd3) / 86400000);

    // Build milestone date map
    var milestoneDates = {};
    var fd = new Date(firstDate);
    MILESTONES.forEach(function(m){
      var mDate = new Date(fd.getFullYear(), fd.getMonth(), fd.getDate() + m.days);
      milestoneDates[mDate.toISOString().slice(0,10)] = m;
    });

    // Marker unter der Tageszahl (Meilenstein) — 4px Punkt in Textfarbe
    var msDotHtml='<div style="width:4px;height:4px;border-radius:50%;background:currentColor;margin:3px auto 0;"></div>';

    // ── STREAK AUF EIS ─────────────────────────────────────
    var iceBox = document.createElement('div');
    iceBox.className = 'card';
    iceBox.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:10px;';
    var iceIco = document.createElement('div');
    iceIco.style.cssText = 'flex-shrink:0;';
    iceIco.innerHTML = prIconHtml('moon',{size:18,box:44,color:'var(--blue)'});
    var iceLeft = document.createElement('div');
    iceLeft.className = 'row-main';
    iceLeft.innerHTML =
      '<div class="row-title">Streak auf Eis</div>'+
      '<div class="row-sub">Schützt deinen Streak für 1 Tag — kostet 2 Diamanten</div>';
    var iceBtn = document.createElement('button');
    iceBtn.type = 'button';
    iceBtn.className = 'btn-g pressable';
    iceBtn.style.cssText = 'flex-shrink:0;white-space:nowrap;';
    iceBtn.setAttribute('aria-label','Streak auf Eis kaufen — 2 Diamanten');
    iceBtn.textContent = '2 Diamanten';
    iceBtn.onclick = function(){ buyIceStreak(); };
    iceBox.appendChild(iceIco);
    iceBox.appendChild(iceLeft);
    iceBox.appendChild(iceBtn);
    calEl.appendChild(iceBox);

    // ── MEILENSTEINE — kompakter Header + aufklappbare Liste ──
    var msBox = document.createElement('div');
    msBox.style.cssText = 'margin-bottom:18px;';

    var reached_count = MILESTONES.filter(function(m){ return daysSince >= m.days; }).length;
    var nextMs = null;
    for(var mi2=0; mi2<MILESTONES.length; mi2++){ if(daysSince < MILESTONES[mi2].days){ nextMs = MILESTONES[mi2]; break; } }
    var msExpanded = false;
    // Erreichte, aber noch nicht abgeholte Belohnungen sichtbar machen
    var unclaimedCount = MILESTONES.filter(function(m){
      var c=false; try{ c=!!localStorage.getItem('cali_ms_claimed_'+m.days); }catch(x){}
      return daysSince >= m.days && !c;
    }).length;

    // Kompakter Header-Button (Karte mit Icon-Ring, Label, Wert, Chevron)
    var msBtn = document.createElement('div');
    msBtn.className = 'card pressable';
    msBtn.setAttribute('role','button');
    msBtn.setAttribute('tabindex','0');
    msBtn.setAttribute('aria-expanded','false');
    msBtn.style.cssText = 'cursor:pointer;display:flex;align-items:center;gap:12px;margin-bottom:0;';
    var tagHtml = unclaimedCount>0
      ? '<span class="num" style="background:var(--accent-soft);border:1px solid var(--accent);border-radius:var(--r-sm);padding:2px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-left:8px;white-space:nowrap;">'+unclaimedCount+' '+(unclaimedCount===1?'Belohnung':'Belohnungen')+' bereit</span>'
      : '';
    msBtn.innerHTML =
      prIconHtml('trophy',{size:18,box:44})+
      '<div class="row-main">'+
        '<div class="lbl" style="margin-bottom:4px;display:flex;align-items:center;flex-wrap:wrap;gap:4px 0;">Meilensteine'+tagHtml+'</div>'+
        '<div class="row-title num">'+reached_count+' / '+MILESTONES.length+' erreicht'+(nextMs?' · Nächster in '+(nextMs.days-daysSince)+'d':'')+'</div>'+
      '</div>'+
      '<span id="ms-chevron" class="chev" aria-hidden="true" style="display:inline-block;transition:transform var(--dur-med) var(--ease-out);">›</span>';

    // Aufklappbare Liste — Accordion-Physik über .acc-body (kein max-height-Clipping)
    var msList = document.createElement('div');
    msList.className = 'acc-body';

    // Nummerierte Liste (CSS-Counter .numbered aus tracker.html liefert "01", "02", …)
    var msInner = document.createElement('div');
    msInner.className = 'list numbered';
    msInner.style.cssText = 'margin:8px 0 0;';

    MILESTONES.forEach(function(m){
      var reached = daysSince >= m.days;
      var daysLeft = m.days - daysSince;
      var claimedKey = 'cali_ms_claimed_'+m.days;
      var claimed = false;
      try{ claimed = !!localStorage.getItem(claimedKey); }catch(x){}

      var row = document.createElement('div');
      row.className = 'list-row';
      row.style.cssText = 'cursor:default;'+(reached && !claimed ? 'background:var(--accent-soft);' : '');

      var infoEl = document.createElement('div');
      infoEl.className = 'row-main';
      infoEl.innerHTML =
        '<div class="row-title" style="color:'+(reached?'var(--text)':'var(--muted)')+';">'+m.label+'</div>'+
        '<div class="row-sub">'+m.badge+' · '+(reached && claimed ? 'Abgeholt' : reached ? 'Bereit!' : 'noch '+daysLeft+' Tage')+'</div>';

      if(reached && !claimed){
        var claimBtn2 = document.createElement('button');
        claimBtn2.type = 'button';
        claimBtn2.className = 'btn sec sm pressable num';
        claimBtn2.style.cssText = 'flex-shrink:0;';
        claimBtn2.setAttribute('aria-label','Belohnung abholen: '+m.diamonds+' Diamanten');
        claimBtn2.textContent = '+'+m.diamonds+' abholen';
        claimBtn2.onclick = (function(ms3){
          return function(e){
            e.stopPropagation();
            claimMilestone(ms3, this);
          };
        })(m);
        row.appendChild(infoEl); row.appendChild(claimBtn2);
      } else {
        var rewEl = document.createElement('div');
        rewEl.style.cssText = 'display:flex;align-items:baseline;gap:4px;flex-shrink:0;'+(reached?'':'opacity:0.6;');
        rewEl.innerHTML = '<span class="row-val num" style="color:var(--muted);">+'+m.diamonds+'</span><span class="unit">Diamanten</span>';
        row.appendChild(infoEl); row.appendChild(rewEl);
      }
      msInner.appendChild(row);
    });

    msList.appendChild(msInner);
    msBtn.onclick = function(){
      msExpanded = !msExpanded;
      if(msExpanded) msList.classList.add('open'); else msList.classList.remove('open');
      msBtn.setAttribute('aria-expanded', msExpanded ? 'true' : 'false');
      var chev = document.getElementById('ms-chevron');
      if(chev) chev.style.transform = msExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
    };
    msBtn.onkeydown = function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); msBtn.onclick(); }
    };

    msBox.appendChild(msBtn);
    msBox.appendChild(msList);
    calEl.appendChild(msBox);

    // ── KALENDER ──────────────────────────────────────────
    var calSection = document.createElement('div');
    var calHdr = document.createElement('div');
    calHdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;';
    var calTitleEl = document.createElement('div');
    calTitleEl.className = 'lbl';
    calTitleEl.textContent = 'Trainings-Kalender';
    var expandBtn = document.createElement('button');
    expandBtn.type = 'button';
    expandBtn.className = 'btn-g pressable';
    expandBtn.textContent = 'Alle Monate';
    var calExpanded = false;
    var calBody = document.createElement('div');

    var dayHdrCss = 'text-align:center;font-size:9px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--muted2);padding-bottom:4px;';

    function renderCalBody(){
      calBody.innerHTML = '';

      var fd2b = new Date(firstDate);
      var startYr, startMo;
      if(calExpanded){
        // Wenn kein echtes erstes Workout (firstDate = heute), gehe 12 Monate zurück
        var hasRealHistory = ents.length > 0;
        if(hasRealHistory){
          startYr = fd2b.getFullYear();
          startMo = fd2b.getMonth();
        } else {
          // Fallback: 12 Monate zurück
          var fallback = new Date(today.getFullYear(), today.getMonth() - 11, 1);
          startYr = fallback.getFullYear();
          startMo = fallback.getMonth();
        }
      } else {
        startYr = today.getFullYear();
        startMo = today.getMonth();
      }

      var cur = new Date(startYr, startMo, 1);

      // Render alle Monate bis einschließlich aktuellem
      var safetyLimit = 0;
      while(safetyLimit++ < 60){
        var yr = cur.getFullYear();
        var mo2 = cur.getMonth();

        var mLbl = document.createElement('div');
        mLbl.className = 'lbl';
        mLbl.style.cssText = 'margin:12px 0 8px;';
        mLbl.textContent = cur.toLocaleString('de-DE',{month:'long',year:'numeric'});
        calBody.appendChild(mLbl);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:3px;';
        ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(function(d){
          var dh = document.createElement('div');
          dh.style.cssText = dayHdrCss;
          dh.textContent = d; grid.appendChild(dh);
        });
        var fday = new Date(yr,mo2,1).getDay(); fday=fday===0?6:fday-1;
        for(var fi=0;fi<fday;fi++) grid.appendChild(document.createElement('div'));

        var dim = new Date(yr,mo2+1,0).getDate();
        for(var day=1;day<=dim;day++){
          var moS=(mo2+1)<10?'0'+(mo2+1):''+(mo2+1);
          var ds2=yr+'-'+moS+'-'+(day<10?'0':'')+day;
          var cell=document.createElement('div');
          cell.className='num';
          cell.style.cssText='border-radius:var(--r-sm);padding:6px 0;text-align:center;font-size:10px;line-height:1.2;min-height:30px;box-sizing:border-box;';

          if(ds2 > todayStr){ cell.style.color='var(--muted2)'; cell.textContent=day; grid.appendChild(cell); continue; }

          var msNode=milestoneDates[ds2];
          var isWorkout=!!workoutDates[ds2];
          var isIce=!!iceDates[ds2];
          var isToday2=ds2===todayStr;

          if(isIce && !isWorkout){
            cell.style.border='1px solid var(--blue)';cell.style.color='var(--blue)';
            cell.textContent=day;
          } else if(isWorkout && msNode){
            cell.style.background='var(--accent)';cell.style.color='#fff';
            cell.innerHTML=day+msDotHtml;
            cell.style.cursor='pointer';
            cell.onclick=(function(mn){ return function(){ showMilestoneDetail(mn,daysSince); }; })(msNode);
          } else if(msNode){
            cell.style.border='1px solid var(--accent)';cell.style.color='var(--accent)';
            cell.innerHTML=day+msDotHtml;
            cell.style.cursor='pointer';
            cell.onclick=(function(mn){ return function(){ showMilestoneDetail(mn,daysSince); }; })(msNode);
          } else if(isWorkout){
            cell.style.background='var(--accent)';cell.style.color='#fff';
            cell.textContent=day;
          } else if(isToday2){
            cell.style.border='1px solid var(--line2)';cell.style.color='var(--text)';cell.textContent=day;
          } else {
            cell.style.color='var(--muted)';cell.textContent=day;
          }
          grid.appendChild(cell);
        }
        calBody.appendChild(grid);

        // Stop after current month
        if(yr === today.getFullYear() && mo2 === today.getMonth()) break;
        cur = new Date(yr, mo2+1, 1);
      }
    }

    expandBtn.onclick=function(){
      var overlay = document.createElement('div');
      overlay.className = 'sheet-scroll';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow-y:auto;';
      var box = document.createElement('div');
      box.className = 'card';
      box.style.cssText = 'width:100%;max-width:440px;margin:auto;border-color:var(--line2);padding:16px;';
      var hdr = document.createElement('div');
      hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;';
      var ttl = document.createElement('div');
      ttl.className = 'ttl';
      ttl.textContent = 'Trainings-Kalender';
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'icon-btn sm pressable';
      closeBtn.setAttribute('aria-label','Schließen');
      closeBtn.textContent = '×';
      closeBtn.onclick = function(){ overlay.remove(); };
      hdr.appendChild(ttl); hdr.appendChild(closeBtn);
      box.appendChild(hdr);
      // Legende
      var leg = document.createElement('div');
      leg.style.cssText = 'display:flex;gap:14px;flex-wrap:wrap;margin:8px 0 14px;';
      [{css:'background:var(--accent);',label:'Training'},{css:'border:1px solid var(--accent);',label:'Belohnung'},{css:'border:1px solid var(--blue);',label:'Eis-Tag'}].forEach(function(l){
        var li=document.createElement('div');li.className='lbl';li.style.cssText='display:flex;align-items:center;gap:6px;';
        var dot=document.createElement('div');dot.style.cssText='width:8px;height:8px;border-radius:2px;box-sizing:border-box;flex-shrink:0;'+l.css;
        li.appendChild(dot);li.appendChild(document.createTextNode(l.label));leg.appendChild(li);
      });
      box.appendChild(leg);
      // Start = firstDate = Tag 1
      var startD = new Date(firstDate);
      var startDateStr = firstDate;
      var cur2 = new Date(startD.getFullYear(), startD.getMonth(), 1);
      // Show until 12 months after start OR current month+3, whichever is later
      var stopD = new Date(Math.max(
        new Date(startD.getFullYear(), startD.getMonth()+13, 1).getTime(),
        new Date(today.getFullYear(), today.getMonth()+4, 1).getTime()
      ));
      var cellBase='border-radius:var(--r-sm);padding:3px 1px;text-align:center;font-size:10px;line-height:1.3;min-height:34px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box;';
      while(cur2 < stopD){
        var yr2=cur2.getFullYear(); var mo3=cur2.getMonth();
        var firstDayOfMonth=new Date(yr2,mo3,1);
        var dayNumStart=Math.floor((firstDayOfMonth-startD)/86400000)+1;
        var mHdr=document.createElement('div');
        mHdr.style.cssText='display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin:16px 0 8px;';
        var mName=document.createElement('div');mName.className='lbl';mName.style.cssText='color:var(--text);';
        mName.textContent=cur2.toLocaleString('de-DE',{month:'long',year:'numeric'});
        var mDay=document.createElement('div');mDay.className='lbl num';mDay.style.cssText='color:var(--accent);';
        if(dayNumStart>=1) mDay.textContent='ab Tag '+Math.max(1,dayNumStart);
        mHdr.appendChild(mName);mHdr.appendChild(mDay);box.appendChild(mHdr);
        var grid2=document.createElement('div');
        grid2.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:3px;';
        ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(function(d){
          var dh=document.createElement('div');dh.style.cssText=dayHdrCss;
          dh.textContent=d;grid2.appendChild(dh);
        });
        var fday2=new Date(yr2,mo3,1).getDay();fday2=fday2===0?6:fday2-1;
        for(var fi2=0;fi2<fday2;fi2++) grid2.appendChild(document.createElement('div'));
        var dim2=new Date(yr2,mo3+1,0).getDate();
        for(var day2=1;day2<=dim2;day2++){
          var moS2=(mo3+1)<10?'0'+(mo3+1):''+(mo3+1);
          var ds3=yr2+'-'+moS2+'-'+(day2<10?'0':'')+day2;
          var cell2=document.createElement('div');
          var cellDate=new Date(yr2,mo3,day2);
          var dayNum=Math.floor((cellDate-startD)/86400000)+1;
          var isFuture=ds3>todayStr;
          var msNode2=milestoneDates[ds3];
          var isWo2=!!workoutDates[ds3];
          var isIce2=!!iceDates[ds3];
          var isToday3=ds3===todayStr;
          var isBeforeStart=ds3<startDateStr;
          cell2.className='num';
          cell2.style.cssText=cellBase;
          if(isBeforeStart){
            cell2.style.opacity='0.15';cell2.textContent=day2;
          } else if(isFuture&&msNode2){
            cell2.style.cssText+='border:1px dashed var(--accent);color:var(--accent);cursor:pointer;';
            cell2.innerHTML='<div style="font-weight:600;">'+dayNum+'</div>'+msDotHtml;
            cell2.onclick=(function(mn){return function(){showMilestoneDetail(mn,daysSince);};})(msNode2);
          } else if(isFuture){
            cell2.style.color='var(--muted2)';cell2.textContent=day2;
          } else if(isIce2&&!isWo2){
            cell2.style.cssText+='border:1px solid var(--blue);color:var(--blue);';
            cell2.innerHTML='<div>'+dayNum+'</div>';
          } else if(isWo2&&msNode2){
            cell2.style.cssText+='background:var(--accent);color:#fff;cursor:pointer;';
            cell2.innerHTML='<div style="font-weight:600;">'+dayNum+'</div>'+msDotHtml;
            cell2.onclick=(function(mn){return function(){showMilestoneDetail(mn,daysSince);};})(msNode2);
          } else if(msNode2){
            cell2.style.cssText+='border:1px solid var(--accent);color:var(--accent);cursor:pointer;';
            cell2.innerHTML='<div style="font-weight:600;">'+dayNum+'</div>'+msDotHtml;
            cell2.onclick=(function(mn){return function(){showMilestoneDetail(mn,daysSince);};})(msNode2);
          } else if(isWo2){
            cell2.style.cssText+='background:var(--accent);color:#fff;';
            cell2.innerHTML='<div>'+dayNum+'</div>';
          } else if(isToday3){
            cell2.style.cssText+='border:1px solid var(--line2);color:var(--text);';
            cell2.innerHTML='<div style="font-weight:600;">'+day2+'</div><div class="unit" style="font-size:9px;">Heute</div>';
          } else {
            cell2.style.color='var(--muted)';cell2.textContent=day2;
          }
          grid2.appendChild(cell2);
        }
        box.appendChild(grid2);
        cur2=new Date(yr2,mo3+1,1);
      }
      overlay.appendChild(box);
      overlay.onclick=function(e){if(e.target===overlay)overlay.remove();};
      document.body.appendChild(overlay);
      if(window.caliMotion){ caliMotion.sheetIn(null, overlay); caliMotion.overlayIn(box); }
    };
    calHdr.appendChild(calTitleEl); calHdr.appendChild(expandBtn);
    calSection.appendChild(calHdr); renderCalBody(); calSection.appendChild(calBody);
    calEl.appendChild(calSection);
  }
}

// ── STREAK AUF EIS KAUFEN ─────────────────────────────────
function buyIceStreak(){
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
  var tStr = tomorrow.toISOString().slice(0,10);
  var iceDates2 = {};
  try{ iceDates2 = JSON.parse(localStorage.getItem('cali_ice_dates')||'{}'); }catch(x){}
  if(iceDates2[tStr]){ toast('Morgen ist bereits auf Eis geschützt!'); return; }
  // Abbuchung läuft über den Server (wallet.js), erst danach wird der Tag geschützt
  spendDiamonds('ice', function(ok){
    if(!ok) return;
    iceDates2[tStr] = 1;
    try{ localStorage.setItem('cali_ice_dates', JSON.stringify(iceDates2)); }catch(x){}
    toast('Streak geschützt für morgen! −'+CALI_ECON.spend.ice+' Diamanten');
    buildProfilUI();
  });
}

function showMilestoneDetail(m){
  var ex = document.getElementById('ms-detail-modal');
  if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'ms-detail-modal';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--card);border:1px solid var(--line2);border-radius:var(--r-card);padding:28px 20px 20px;width:100%;max-width:360px;text-align:center;';

  var claimedKey = 'cali_ms_claimed_'+m.days;
  var claimed = false;
  try{ claimed = !!localStorage.getItem(claimedKey); }catch(x){}

  var fd4 = null;
  if(ents.length > 0){
    var s2 = ents.map(function(e){ return e.date; }).filter(Boolean).sort();
    fd4 = new Date(s2[0]);
  }
  var today2 = new Date();
  var daysSince2 = fd4 ? Math.floor((today2 - fd4) / 86400000) : 0;
  var reached2 = daysSince2 >= m.days;

  box.innerHTML =
    '<div style="display:flex;justify-content:center;margin-bottom:14px;">'+prIconHtml(m.icon,{size:22,box:56,color:(reached2?'var(--accent)':'var(--muted2)')})+'</div>'+
    '<span class="eyebrow">Meilenstein</span>'+
    '<div class="ttl" style="margin-bottom:6px;">'+m.label+'</div>'+
    '<div class="row-sub" style="margin-bottom:18px;">Badge: <span style="color:var(--text);">'+m.badge+'</span></div>'+
    '<div style="background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);padding:14px;margin-bottom:18px;">'+
      '<span class="eyebrow">Belohnung</span>'+
      '<div style="display:flex;align-items:baseline;justify-content:center;gap:6px;"><span class="kpi num" style="color:var(--accent);">+'+m.diamonds+'</span><span class="unit">Diamanten</span></div>'+
    '</div>'+
    (reached2 && !claimed ?
      '<button type="button" onclick="claimMilestoneFromModal(\''+m.days+'\','+m.diamonds+',\''+m.badge+'\',\''+m.icon+'\')" class="btn pressable" style="margin:0 0 8px;">Jetzt abholen</button>' :
      reached2 ?
      '<div class="lbl" style="color:var(--success);margin-bottom:12px;">Bereits abgeholt</div>' :
      '<div class="lbl" style="margin-bottom:12px;">Noch nicht erreicht</div>'
    );

  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn-g pressable';
  closeBtn.style.cssText = 'width:100%;min-height:44px;';
  closeBtn.textContent = 'Schließen';
  closeBtn.onclick = function(){ ov.remove(); };
  box.appendChild(closeBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion){ caliMotion.sheetIn(null, ov); caliMotion.overlayIn(box); }
}

function claimMilestoneFromModal(days, diamonds, badge, icon){
  var m = null;
  for(var i=0;i<MILESTONES.length;i++){ if(String(MILESTONES[i].days) === String(days)) m = MILESTONES[i]; }
  if(!m) return;
  claimMilestone(m, null, function(){
    var ov = document.getElementById('ms-detail-modal');
    if(ov) ov.remove();
  });
}


// ── DEMO MODUS ────────────────────────────────────────────
function demoLogin(){
  var loadEl=document.getElementById('loading-screen');if(loadEl)loadEl.style.display='none';
  var ls=document.getElementById('login-screen');if(ls)ls.style.display='none';
  var db2=document.getElementById('demo-bar');if(db2)db2.style.display='none';
  // Nav wieder einblenden — nur display zurücksetzen, keine Inline-Styles wegwischen
  var navEl=document.querySelector('nav');if(navEl)navEl.style.display='';
  var pages=['e','p','m','ch','v','pr','sk'];
  for(var i=0;i<pages.length;i++){
    var pg=document.getElementById('page-'+pages[i]);
    if(pg)pg.className='page'+(pages[i]==='e'?' on':'');
    var tb=document.getElementById('tab-'+pages[i]);
    if(tb)tb.className='tab'+(pages[i]==='e'?' on':'');
  }
  try{lmax();}catch(e){}try{lpd();}catch(e){}try{lpr();}catch(e){}
  try{lstreak();}catch(e){}try{ld();}catch(e){}try{loadChallenges();}catch(e){}
  try{bb();}catch(e){}try{buildStartPlanBtns();}catch(e){}
  try{buildStartChallengeWidget();}catch(e){}try{buildStreakWidget();}catch(e){}
  var isFirst=!prData.name&&!streakData.goalSet;
  setTimeout(function(){
    if(isFirst){try{showOnboarding();}catch(e){if(typeof toast==='function') toast('Fehler: '+e.message);}}
    else if(!streakData.goalSet){try{showWeeklyGoalModal();}catch(e){}}
  },300);
  toast('Demo Modus!');
}



// ── ONBOARDING ──────────────────────────────────────────
var obStep = 0;
// Zuletzt animierter Schritt — verhindert, dass eine Auswahl im selben Schritt
// (die renderObStep erneut aufruft) die Einblendung nochmal abspielt.
var obAnimStep = -1;
var obData = {name:'', age:'', weight:'', height:'', level:'beginner', goal:'strength', weeklyGoal:3};

function showOnboarding(){
  var existing = document.getElementById('ob-modal');
  if(existing) existing.remove();
  var m = document.createElement('div');
  m.id = 'ob-modal';
  m.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg);z-index:1000;overflow-y:auto;padding:24px 16px;box-sizing:border-box;';
  document.body.appendChild(m);
  if(window.caliMotion) caliMotion.overlayIn(m);
  obStep = 0;
  obAnimStep = -1;
  renderObStep();
}

// Auswahl-Zeile (Level/Ziel): Liste mit Radio-Ring rechts, Auswahl = Ring in Orange gefüllt
function obOptionRow(onclickJs, selected, title, desc){
  return '<div onclick="'+onclickJs+'" role="button" tabindex="0" aria-pressed="'+(selected?'true':'false')+'" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();this.click();}" class="list-row pressable">'+
    '<div class="row-main"><div class="row-title" style="color:'+(selected?'var(--text)':'var(--muted)')+';">'+title+'</div><div class="row-sub">'+desc+'</div></div>'+
    '<span aria-hidden="true" style="width:16px;height:16px;border-radius:50%;box-sizing:border-box;border:1px solid '+(selected?'var(--accent)':'var(--line2)')+';background:'+(selected?'var(--accent)':'transparent')+';flex-shrink:0;"></span>'+
  '</div>';
}

function renderObStep(){
  var m = document.getElementById('ob-modal');
  if(!m) return;
  // Guard against out of bounds
  if(obStep < 0) obStep = 0;
  if(!obData) obData = {name:'', age:'', weight:'', height:'', level:'beginner', goal:'strength', weeklyGoal:3};

  var steps = [
    {title:'Willkommen!',   sub:'Wie sollen wir dich nennen?'},
    {title:'Dein Körper',    sub:'Damit wir Trainings anpassen können.'},
    {title:'Dein Level',     sub:'Wie erfahren bist du?'},
    {title:'Dein Ziel',      sub:'Was willst du erreichen?'},
    {title:'Wochenziel',      sub:'Wie oft pro Woche trainierst du?'}
  ];
  var totalSteps = steps.length;
  if(obStep >= totalSteps){ obFinish(); return; }
  var s = steps[obStep];

  // Fortschritt als Segmentbalken — passend zum Label: Schritt 1 von 5 = 20%
  var pct = Math.round(((obStep+1) / totalSteps) * 100);
  var dots = '<div class="lbl" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><span>Schritt '+(obStep+1)+' von '+totalSteps+'</span><span class="num">'+(obStep+1)+' / '+totalSteps+'</span></div>'+
    '<div class="segbar" data-obfill style="margin-bottom:28px;"></div>';

  var content = '';

  if(obStep===0){
    content =
      '<div style="margin-bottom:14px;">'+
        '<div class="lbl" style="margin-bottom:6px;">Dein Name</div>'+
        '<input id="ob-name" type="text" class="inp" value="'+(obData.name||'')+'" placeholder="Name">'+
      '</div>'+
      '<div>'+
        '<div class="lbl" style="margin-bottom:6px;">Dein Alter</div>'+
        '<input id="ob-age" type="number" class="inp num" value="'+(obData.age||'')+'" placeholder="">'+
      '</div>';
  } else if(obStep===1){
    content =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">'+
        '<div>'+
          '<div class="lbl" style="margin-bottom:6px;">Gewicht (kg)</div>'+
          '<input id="ob-weight" type="number" class="inp num" value="'+obData.weight+'" placeholder="z.B. 75">'+
        '</div>'+
        '<div>'+
          '<div class="lbl" style="margin-bottom:6px;">Größe (cm)</div>'+
          '<input id="ob-height" type="number" class="inp num" value="'+obData.height+'" placeholder="z.B. 180">'+
        '</div>'+
      '</div>'+
      '<div style="background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);padding:12px 14px;font-size:11px;color:var(--muted);line-height:1.6;">'+
        'Deine Körperdaten sind privat und werden nur lokal gespeichert.'+
      '</div>';
  } else if(obStep===2){
    var lvls = [
      {v:'beginner',     l:'Anfänger',        d:'Ich fange gerade an'},
      {v:'intermediate', l:'Fortgeschritten', d:'1-2 Jahre Erfahrung'},
      {v:'advanced',     l:'Erfahren',        d:'3+ Jahre, solide Basis'},
    ];
    content += '<div class="list">';
    for(var i=0;i<lvls.length;i++){
      var sel=obData.level===lvls[i].v;
      content += obOptionRow('obData.level=\''+lvls[i].v+'\';renderObStep()', sel, lvls[i].l, lvls[i].d);
    }
    content += '</div>';
  } else if(obStep===3){
    var goals = [
      {v:'strength',   l:'Kraft aufbauen',    d:'Stärker & muskulöser werden'},
      {v:'skills',     l:'Skills lernen',     d:'Muscle-Up, Handstand & co.'},
      {v:'endurance',  l:'Ausdauer',          d:'Länger & öfter trainieren'},
      {v:'weight',     l:'Abnehmen',          d:'Kalorien verbrennen'},
      {v:'challenges', l:'Challenges',        d:'Challenges meistern & gewinnen'},
      {v:'compete',    l:'Wettkampf',         d:'Gegen andere antreten'},
      {v:'all',        l:'Alles',             d:'Rundum fit werden'},
    ];
    content += '<div class="list">';
    for(var i=0;i<goals.length;i++){
      var sel=obData.goal===goals[i].v;
      content += obOptionRow('obData.goal=\''+goals[i].v+'\';renderObStep()', sel, goals[i].l, goals[i].d);
    }
    content += '</div>';
  } else if(obStep===4){
    var btns='';
    for(var i=1;i<=7;i++){
      var sel=obData.weeklyGoal===i;
      btns+='<button type="button" onclick="obData.weeklyGoal='+i+';renderObStep()" aria-label="'+i+' Workouts pro Woche" aria-pressed="'+(sel?'true':'false')+'" class="num pressable" style="flex:1;min-width:0;min-height:44px;background:'+(sel?'var(--line2)':'var(--card2)')+';border:1px solid '+(sel?'var(--line2)':'var(--line)')+';color:'+(sel?'var(--text)':'var(--muted)')+';border-radius:var(--r-sm);padding:12px 0;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:background-color var(--dur-fast) ease,border-color var(--dur-fast) ease,color var(--dur-fast) ease,transform var(--dur-fast) var(--ease-out);">'+i+'</button>';
    }
    content =
      '<div style="display:flex;gap:6px;margin-bottom:16px;">'+btns+'</div>'+
      '<div class="lbl num" style="text-align:center;">'+
        obData.weeklyGoal+'x pro Woche'+
      '</div>';
  }

  // Last step = LOS GEHTS, other steps = WEITER (die eine Primäraktion des Screens)
  var isLast = obStep >= totalSteps - 1;
  var nextBtn = isLast
    ? '<button type="button" onclick="obFinish()" class="btn pressable" style="margin-top:20px;">Los geht\'s!</button>'
    : '<button type="button" onclick="obNext()" class="btn pressable" style="margin-top:20px;">Weiter →</button>';

  var backBtnHtml = obStep > 0
    ? '<button type="button" onclick="obStep--;renderObStep()" class="btn-g pressable" style="width:100%;min-height:44px;margin-top:8px;">← Zurück</button>'
    : '';

  m.innerHTML =
    '<div style="max-width:380px;margin:0 auto;padding-top:12px;">'+
      '<div class="auth-wordmark" style="font-size:24px;text-align:center;margin-bottom:24px;">CALI</div>'+
      dots+
      '<div class="page-title" style="margin-bottom:6px;">'+s.title+'</div>'+
      '<div class="page-sub" style="margin:0 0 24px;">'+s.sub+'</div>'+
      content+
      nextBtn+
      backBtnHtml+
    '</div>';

  // Segmentbalken füllen: vom Stand des vorigen Schritts zum neuen (reduced motion springt ans Ziel)
  var stepChanged = (obAnimStep !== obStep);
  var obFill = m.querySelector('[data-obfill]');
  if(obFill){
    var animate = stepChanged && window.caliMotion && !caliMotion.reduced() && typeof requestAnimationFrame==='function';
    if(animate){
      var fromPct = obAnimStep < 0 ? 0 : Math.round(((obAnimStep+1) / totalSteps) * 100);
      obFill.style.setProperty('--pct', String(fromPct));
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ if(obFill.isConnected) obFill.style.setProperty('--pct', String(pct)); }); });
      setTimeout(function(){ if(obFill.isConnected) obFill.style.setProperty('--pct', String(pct)); }, 400);
    } else {
      obFill.style.setProperty('--pct', String(pct));
    }
  }
  // Einblendung nur beim Schrittwechsel, nicht bei jeder Auswahl im selben Schritt
  if(stepChanged){
    obAnimStep = obStep;
    if(window.caliMotion) caliMotion.stagger(m);
  }
}

function obNext(){
  if(obStep===0){
    var n=document.getElementById('ob-name'); var a=document.getElementById('ob-age');
    if(n) obData.name=n.value.trim();
    if(a) obData.age=a.value;
    if(!obData.name){
      if(typeof toast==='function') toast('Bitte gib deinen Namen ein.');
      if(n){ try{ n.focus(); }catch(x){} }
      return;
    }
  }
  if(obStep===1){
    var w=document.getElementById('ob-weight'); var h=document.getElementById('ob-height');
    if(w) obData.weight=w.value;
    if(h) obData.height=h.value;
  }
  obStep++;
  renderObStep();
}

function obFinish(){
  if(!prData) prData = {};
  prData.name = obData.name || '';
  prData.age = obData.age || '';
  prData.weight = obData.weight || '';
  prData.height = obData.height || '';
  prData.goal = obData.goal || 'strength';
  prData.level = obData.level || 'beginner';
  prData.joinDate = new Date().toISOString().slice(0,10);
  try{ spr(); }catch(x){}

  if(!streakData) streakData = {};
  streakData.weeklyGoal = obData.weeklyGoal || 3;
  streakData.goalSet = true;
  try{ sstreak(); }catch(x){}

  try{ localStorage.setItem('cali_onboarded','1'); }catch(x){}
  var m = document.getElementById('ob-modal'); if(m) m.remove();
  try{ fbSave(); }catch(x){}
  try{ buildStreakWidget(); }catch(x){}
  try{ buildStartChallengeWidget(); }catch(x){}
  toast('Willkommen' + (obData.name?' '+obData.name:'') + '! Viel Erfolg!');
}
