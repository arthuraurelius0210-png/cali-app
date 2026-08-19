
// ── Meilensteine — viele kleine Schritte ──────────────────
// Auf Dateiebene, damit auch das Start-Dashboard (app1.js) via
// getUnclaimedMilestoneCount() darauf zugreifen kann.
var MILESTONES = [
  {days:3,   label:'3 Tage',     diamonds:2,  badge:'Erster Schritt', icon:'🐣'},
  {days:7,   label:'1 Woche',    diamonds:4,  badge:'Starter',        icon:'👋'},
  {days:14,  label:'2 Wochen',   diamonds:5,  badge:'Im Rhythmus',    icon:'🎵'},
  {days:21,  label:'3 Wochen',   diamonds:6,  badge:'Gewohnheit',     icon:'🔄'},
  {days:30,  label:'1 Monat',    diamonds:8,  badge:'Dedicated',      icon:'💪'},
  {days:45,  label:'45 Tage',    diamonds:10, badge:'Halftime',       icon:'⚡'},
  {days:60,  label:'2 Monate',   diamonds:12, badge:'Consistent',     icon:'📈'},
  {days:90,  label:'3 Monate',   diamonds:16, badge:'Warrior',        icon:'⚔️'},
  {days:120, label:'4 Monate',   diamonds:18, badge:'Grinder',        icon:'⚙️'},
  {days:150, label:'5 Monate',   diamonds:20, badge:'Machine',        icon:'🤖'},
  {days:180, label:'6 Monate',   diamonds:25, badge:'Veteran',        icon:'🔥'},
  {days:240, label:'8 Monate',   diamonds:28, badge:'Relentless',     icon:'👻'},
  {days:270, label:'9 Monate',   diamonds:30, badge:'Iron Will',      icon:'🦴'},
  {days:300, label:'10 Monate',  diamonds:32, badge:'Unstoppable',    icon:'🚀'},
  {days:365, label:'1 Jahr',     diamonds:50, badge:'Elite',          icon:'👑'},
  {days:500, label:'500 Tage',   diamonds:60, badge:'Legend',         icon:'🌟'},
  {days:730, label:'2 Jahre',    diamonds:100,badge:'Immortal',       icon:'💎'},
];

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

  var card=document.createElement('div');
  card.style.cssText='position:relative;border-radius:24px;padding:20px;margin-bottom:16px;min-height:250px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;background:#000 url(/hero-workout.jpg) center/cover no-repeat;box-shadow:0 12px 30px rgba(0,0,0,0.15);';

  var overlay=document.createElement('div');
  overlay.style.cssText='position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.3) 35%,rgba(0,0,0,0.85) 100%);';
  card.appendChild(overlay);

  var top=document.createElement('div');top.style.cssText='position:relative;display:flex;align-items:center;justify-content:space-between;gap:8px;';
  var flBadge=document.createElement('div');
  var flBg='rgba(0,0,0,0.4)';
  var flHtml;
  // Flammen bleiben schmal (max. 3), Text k\u00FCrzt statt umzubrechen \u2014 sonst kippt die Pillen-Reihe auf 360px
  var flIco='flex-shrink:0;';
  var flTxt='white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;';
  if(streak>0&&trainedToday){
    flHtml='<span class="flame-pulse" style="'+flIco+'">'+getFlames(Math.min(streak,3))+'</span><span style="'+flTxt+'">'+streak+' Tage Streak</span>';
  } else if(streak>0){
    // Streak lebt noch, ist aber heute in Gefahr
    flBg='rgba(245,158,11,0.5)';
    flHtml='<span class="flame-pulse" style="'+flIco+'">\uD83D\uDD25</span><span style="'+flTxt+'">'+streak+' Tage \u00B7 Heute trainieren!</span>';
  } else if(streakData.longestStreak>0){
    flHtml='<span style="'+flIco+'">\uD83D\uDD25</span><span style="'+flTxt+'">Neuer Anlauf \u00B7 Beste: '+streakData.longestStreak+' Tage</span>';
  } else {
    flHtml='<span style="'+flIco+'">\uD83D\uDD25</span><span style="'+flTxt+'">Noch kein Streak</span>';
  }
  flBadge.style.cssText='background:'+flBg+';backdrop-filter:blur(4px);border-radius:20px;padding:6px 12px;display:flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:#fff;min-width:0;overflow:hidden;white-space:nowrap;';
  flBadge.innerHTML=flHtml;
  var lvBadge=document.createElement('div');lvBadge.style.cssText='background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);color:'+lv.color+';border-radius:20px;font-family:inherit;font-size:11px;font-weight:700;padding:6px 10px;flex-shrink:0;';lvBadge.textContent=lv.label;
  top.appendChild(flBadge);
  // Flammen/Diamanten-Guthaben als Glas-Pille neben dem Streak-Badge
  if(typeof getCurrencyDisplay==='function'){
    var curBadge=document.createElement('div');
    curBadge.className='num';
    curBadge.style.cssText='background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);border-radius:20px;padding:6px 12px;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;white-space:nowrap;';
    try{ curBadge.textContent=getCurrencyDisplay(); }catch(e){}
    if(curBadge.textContent) top.appendChild(curBadge);
  }
  top.appendChild(lvBadge);
  card.appendChild(top);

  var uName=(typeof prData!=='undefined'&&prData&&prData.name)?prData.name:'Athlet';
  var mid=document.createElement('div');mid.style.cssText='position:relative;margin:14px 0;';
  // Helles Orange + Text-Shadow: Kontrast unabhängig vom Foto garantiert
  var hiLbl=document.createElement('div');hiLbl.style.cssText='font-size:12px;color:#FFB38C;font-weight:700;margin-bottom:5px;text-shadow:0 1px 3px rgba(0,0,0,0.5);';hiLbl.textContent='Hallo '+uName+' 👋';
  var qLbl=document.createElement('div');qLbl.style.cssText='font-size:23px;color:#fff;font-weight:800;line-height:1.3;text-shadow:0 1px 3px rgba(0,0,0,0.5);';qLbl.textContent='Bereit für dein nächstes Workout?';
  mid.appendChild(hiLbl);mid.appendChild(qLbl);
  card.appendChild(mid);

  var bottom=document.createElement('div');bottom.style.cssText='position:relative;';
  var weekHit=weekGoal>0&&weekDone>=weekGoal;
  var wkLbl=document.createElement('div');wkLbl.style.cssText='font-size:11px;color:rgba(255,255,255,0.75);font-weight:600;margin-bottom:2px;';wkLbl.textContent='Diese Woche';
  var wkVal=document.createElement('div');wkVal.className='num';wkVal.style.cssText='font-size:22px;color:#fff;font-weight:800;margin-bottom:10px;';
  wkVal.textContent=weekHit?weekDone+' / '+weekGoal+' — Wochenziel geschafft! 🎉':weekDone+' / '+weekGoal+' Workouts';
  if(weekHit)wkVal.style.color='#FFB38C';
  var dotRow=document.createElement('div');dotRow.style.cssText='display:flex;gap:5px;margin-bottom:8px;';
  for(var i=0;i<weekGoal;i++){var dot=document.createElement('div');dot.style.cssText='flex:1;height:5px;border-radius:3px;background:'+(i<weekDone?'var(--accent)':'rgba(255,255,255,0.3)')+';';dotRow.appendChild(dot);}
  // Einmalige Feier pro Woche, wenn das Wochenziel erreicht wird
  if(weekHit){
    var wgd=new Date();var wgDow=wgd.getDay();var wgs=new Date(wgd);wgs.setDate(wgd.getDate()-(wgDow===0?6:wgDow-1));
    var wgKey='cali_weekgoal_done_'+wgs.toISOString().slice(0,10);
    var wgDone=false;try{wgDone=!!localStorage.getItem(wgKey);}catch(x){}
    if(!wgDone){
      try{localStorage.setItem(wgKey,'1');}catch(x){}
      if(window.caliMotion){
        if(!caliMotion.reduced()&&typeof dotRow.animate==='function'){
          try{dotRow.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:400,easing:'cubic-bezier(0.34,1.56,0.64,1)'});}catch(e){}
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
  var actionRow=document.createElement('div');actionRow.style.cssText='display:flex;align-items:center;justify-content:space-between;';
  var changeBtn=document.createElement('button');changeBtn.className='pressable';changeBtn.style.cssText='background:none;border:none;color:rgba(255,255,255,0.85);font-size:12px;font-family:inherit;font-weight:600;cursor:pointer;padding:12px 0;margin:-12px 0;min-height:44px;display:flex;align-items:center;';changeBtn.textContent='Ziel \u00E4ndern \u203A';changeBtn.onclick=function(){showWeeklyGoalModal();};
  var goBtn=document.createElement('button');goBtn.className='pressable';goBtn.style.cssText='background:var(--accent-deep);color:#fff;border:none;border-radius:20px;font-family:inherit;font-size:13px;font-weight:800;padding:9px 18px;cursor:pointer;display:flex;align-items:center;gap:6px;';goBtn.innerHTML='Jetzt starten <span>&#9654;</span>';goBtn.onclick=function(){startWorkout(null);};
  actionRow.appendChild(changeBtn);actionRow.appendChild(goBtn);
  bottom.appendChild(wkLbl);bottom.appendChild(wkVal);bottom.appendChild(dotRow);bottom.appendChild(actionRow);
  card.appendChild(bottom);

  el.appendChild(card);
  buildProfilStreakSection();
  if(typeof buildStartDashboard==='function') buildStartDashboard();
}

function buildProfilStreakSection(){
  var strEl=document.getElementById('pr-streak-section');
  if(strEl){
    strEl.innerHTML='';
    var strCard=document.createElement('div');strCard.style.cssText='background:#fff;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:16px;';
    var strRow=document.createElement('div');strRow.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
    var strL=document.createElement('div');
    var sfEl=document.createElement('div');sfEl.style.cssText='font-size:22px;';
    if(streakData.currentStreak>0){
      sfEl.innerHTML='<span class="flame-pulse">'+getFlames(Math.min(streakData.currentStreak,5))+'</span> <span class="num">'+streakData.currentStreak+'</span> Tage';
    } else {
      sfEl.textContent='Kein Streak';
    }
    var sbEl=document.createElement('div');sbEl.className='num';sbEl.style.cssText='font-size:11px;color:var(--muted);margin-top:4px;';sbEl.textContent='Beste: '+streakData.longestStreak+' Tage';
    strL.appendChild(sfEl);strL.appendChild(sbEl);
    var strR=document.createElement('div');strR.style.cssText='text-align:right;';
    var gtEl=document.createElement('div');gtEl.className='num';gtEl.style.cssText='font-family:inherit;font-weight:800;font-size:28px;color:var(--accent);';gtEl.textContent=getWeeklyProgress()+' / '+streakData.weeklyGoal;
    var gsEl=document.createElement('div');gsEl.style.cssText='font-size:11px;font-weight:600;color:var(--muted);font-family:inherit;';gsEl.textContent='Diese Woche';
    strR.appendChild(gtEl);strR.appendChild(gsEl);strRow.appendChild(strL);strRow.appendChild(strR);
    var chBtn=document.createElement('button');chBtn.className='pressable';chBtn.style.cssText='width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--muted);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px;min-height:36px;cursor:pointer;';chBtn.textContent='Wochenziel ändern (aktuell: '+streakData.weeklyGoal+'x)';chBtn.onclick=function(){showWeeklyGoalModal();};
    strCard.appendChild(strRow);strCard.appendChild(chBtn);strEl.appendChild(strCard);
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

    // ── STREAK AUF EIS Button ─────────────────────────────
    var iceBox = document.createElement('div');
    iceBox.style.cssText = 'background:linear-gradient(135deg,rgba(56,189,248,0.08),rgba(56,189,248,0.03));border:1px solid rgba(56,189,248,0.25);border-radius:16px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;';
    var iceLeft = document.createElement('div');
    iceLeft.style.cssText = 'flex:1;';
    iceLeft.innerHTML =
      '<div style="font-size:12px;font-weight:700;color:var(--blue-ink);margin-bottom:3px;">\u2744\uFE0F Streak auf Eis</div>'+
      '<div style="font-size:11px;color:var(--muted);line-height:1.5;">Schütze deinen Streak für 1 Tag — kostet 2 \uD83D\uDC8E</div>';
    var iceBtn = document.createElement('button');
    iceBtn.className = 'pressable';
    iceBtn.style.cssText = 'background:var(--blue-ink);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:9px 14px;min-height:36px;cursor:pointer;white-space:nowrap;flex-shrink:0;';
    iceBtn.setAttribute('aria-label','Streak auf Eis kaufen — 2 Diamanten');
    iceBtn.textContent = '2 \uD83D\uDC8E';
    iceBtn.onclick = function(){ buyIceStreak(); };
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

    // Kompakter Header-Button
    var msBtn = document.createElement('div');
    msBtn.className = 'pressable';
    msBtn.setAttribute('role','button');
    msBtn.setAttribute('tabindex','0');
    msBtn.setAttribute('aria-expanded','false');
    msBtn.style.cssText = 'background:#fff;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;';
    // Icon-Slot aus dem CALI-Icon-Set statt Emoji (Fallback nur, falls app1.js fehlt)
    var msIconHtml = (typeof iconWrap === 'function')
      ? iconWrap('trophy',{size:20,box:40,radius:13})
      : (typeof ci === 'function'
          ? '<div style="width:24px;height:24px;flex-shrink:0;">'+ci('trophy')+'</div>'
          : '<div style="font-size:24px;">\uD83C\uDFC6</div>');
    msBtn.innerHTML =
      msIconHtml+
      '<div style="flex:1;">'+
        '<div style="font-size:12px;color:var(--accent-ink);font-weight:600;margin-bottom:3px;">Meilensteine'+(unclaimedCount>0?' <span class="num" style="background:rgba(255,85,0,0.1);color:var(--accent-ink);border-radius:10px;font-size:11px;font-weight:700;padding:2px 8px;margin-left:4px;">'+unclaimedCount+' '+(unclaimedCount===1?'Belohnung':'Belohnungen')+' bereit</span>':'')+'</div>'+
        '<div class="num" style="font-size:13px;color:var(--text);font-weight:700;">'+reached_count+' / '+MILESTONES.length+' erreicht'+(nextMs?' &nbsp;\u00B7&nbsp; Nächster in '+(nextMs.days-daysSince)+'d':'')+'</div>'+
      '</div>'+
      '<div id="ms-chevron" style="font-size:16px;color:var(--muted);transition:transform 0.2s;">\u2039</div>';

    // Aufklappbare Liste — Accordion-Physik über .acc-body (kein max-height-Clipping)
    var msList = document.createElement('div');
    msList.className = 'acc-body';

    var msInner = document.createElement('div');
    msInner.style.cssText = 'padding-top:8px;display:flex;flex-direction:column;gap:4px;';

    MILESTONES.forEach(function(m){
      var reached = daysSince >= m.days;
      var daysLeft = m.days - daysSince;
      var claimedKey = 'cali_ms_claimed_'+m.days;
      var claimed = false;
      try{ claimed = !!localStorage.getItem(claimedKey); }catch(x){}

      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:16px;'+
        (reached && !claimed ? 'background:rgba(255,85,0,0.07);border:1px solid rgba(255,85,0,0.2);' : 'background:var(--bg3);border:1px solid transparent;');

      var iconEl = document.createElement('div');
      iconEl.style.cssText = 'font-size:16px;flex-shrink:0;'+(reached?'':'filter:grayscale(1);opacity:0.3;');
      iconEl.textContent = m.icon;

      var infoEl = document.createElement('div');
      infoEl.style.cssText = 'flex:1;min-width:0;';
      infoEl.innerHTML =
        '<div style="font-size:12px;font-weight:700;color:'+(reached?'var(--text)':'var(--muted)')+';">'+m.label+' &nbsp;<span style="font-size:11px;font-weight:400;color:var(--muted);">'+m.badge+'</span></div>'+
        '<div style="font-size:11px;color:var(--muted);margin-top:1px;">'+(reached && claimed ? '\u2713 Abgeholt' : reached ? 'Bereit!' : 'noch '+daysLeft+' Tage')+'</div>';

      if(reached && !claimed){
        var claimBtn2 = document.createElement('button');
        claimBtn2.className = 'pressable num';
        claimBtn2.setAttribute('aria-label','Belohnung abholen: '+m.diamonds+' Diamanten');
        claimBtn2.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:7px 12px;cursor:pointer;white-space:nowrap;flex-shrink:0;';
        claimBtn2.textContent = '+'+m.diamonds+' \uD83D\uDC8E';
        claimBtn2.onclick = (function(ms3, key3){
          return function(e){
            e.stopPropagation();
            currency.diamonds += ms3.diamonds;
            saveCurrency();
            try{ localStorage.setItem(key3,'1'); }catch(x){}
            if(window.caliMotion){ caliMotion.floatUp(this, '+'+ms3.diamonds+' 💎'); caliMotion.celebrate('burst'); }
            toast(ms3.icon+' '+ms3.badge+'! +'+ms3.diamonds+' \uD83D\uDC8E');
            buildProfilUI();
          };
        })(m, claimedKey);
        row.appendChild(iconEl); row.appendChild(infoEl); row.appendChild(claimBtn2);
      } else {
        var rewEl = document.createElement('div');
        rewEl.className = 'num';
        rewEl.style.cssText = 'font-size:11px;color:var(--muted);flex-shrink:0;'+(reached?'':'opacity:0.6;');
        rewEl.textContent = '+'+m.diamonds+' \uD83D\uDC8E';
        row.appendChild(iconEl); row.appendChild(infoEl); row.appendChild(rewEl);
      }
      msInner.appendChild(row);
    });

    msList.appendChild(msInner);
    msBtn.onclick = function(){
      msExpanded = !msExpanded;
      if(msExpanded) msList.classList.add('open'); else msList.classList.remove('open');
      msBtn.setAttribute('aria-expanded', msExpanded ? 'true' : 'false');
      var chev = document.getElementById('ms-chevron');
      if(chev) chev.style.transform = msExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
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
    calHdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;';
    var calTitleEl = document.createElement('div');
    calTitleEl.style.cssText = 'font-size:12px;color:var(--accent-ink);font-weight:600;';
    calTitleEl.textContent = 'Trainings-Kalender';
    var expandBtn = document.createElement('button');
    expandBtn.className = 'pressable';
    expandBtn.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:11px;font-weight:600;color:var(--muted);padding:8px 12px;min-height:32px;cursor:pointer;';
    expandBtn.textContent = 'Alle Monate';
    var calExpanded = false;
    var calBody = document.createElement('div');

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
        mLbl.style.cssText = 'font-size:11px;color:var(--muted);margin-bottom:6px;margin-top:12px;font-weight:600;';
        mLbl.textContent = cur.toLocaleString('de-DE',{month:'long',year:'numeric'});
        calBody.appendChild(mLbl);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:2px;';
        ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(function(d){
          var dh = document.createElement('div');
          dh.style.cssText = 'text-align:center;font-size:11px;color:var(--muted);padding-bottom:3px;';
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
          cell.style.cssText='border-radius:5px;padding:4px 0;text-align:center;font-size:10px;line-height:1.2;';

          if(ds2 > todayStr){ cell.style.color='var(--muted2)'; cell.textContent=day; grid.appendChild(cell); continue; }

          var msNode=milestoneDates[ds2];
          var isWorkout=!!workoutDates[ds2];
          var isIce=!!iceDates[ds2];
          var isToday2=ds2===todayStr;

          if(isIce && !isWorkout){
            cell.style.background='rgba(56,189,248,0.15)';cell.style.color='var(--blue-ink)';
            cell.innerHTML=day+'<div style="font-size:10px;">\u2744\uFE0F</div>';
          } else if(isWorkout && msNode){
            cell.style.background='var(--accent-deep)';cell.style.color='#fff';
            cell.innerHTML=day+'<div style="font-size:10px;">'+msNode.icon+'</div>';
            cell.style.cursor='pointer';
            cell.onclick=(function(mn){ return function(){ showMilestoneDetail(mn,daysSince); }; })(msNode);
          } else if(msNode){
            cell.style.background='rgba(255,85,0,0.1)';cell.style.border='1px solid rgba(255,85,0,0.3)';cell.style.color='var(--accent-ink)';
            cell.innerHTML=day+'<div style="font-size:10px;">'+msNode.icon+'</div>';
            cell.style.cursor='pointer';
            cell.onclick=(function(mn){ return function(){ showMilestoneDetail(mn,daysSince); }; })(msNode);
          } else if(isWorkout){
            cell.style.background='var(--accent-deep)';cell.style.color='#fff';
            cell.innerHTML=day+'<div style="font-size:10px;">\uD83D\uDD25</div>';
          } else if(isToday2){
            cell.style.border='1px solid var(--accent)';cell.style.color='var(--accent-ink)';cell.textContent=day;
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
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow-y:auto;';
      var box = document.createElement('div');
      box.style.cssText = 'background:var(--bg);border-radius:20px;width:100%;max-width:440px;padding:20px;margin:auto;';
      var hdr = document.createElement('div');
      hdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;';
      var ttl = document.createElement('div');
      ttl.style.cssText = 'font-size:12px;font-weight:600;color:var(--accent-ink);';
      ttl.textContent = 'Trainings-Kalender';
      var closeBtn = document.createElement('button');
      closeBtn.className = 'pressable';
      closeBtn.setAttribute('aria-label','Schließen');
      closeBtn.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:15px;color:var(--muted);padding:6px 14px;min-height:36px;cursor:pointer;';
      closeBtn.textContent = '×';
      closeBtn.onclick = function(){ overlay.remove(); };
      hdr.appendChild(ttl); hdr.appendChild(closeBtn);
      box.appendChild(hdr);
      // Legende
      var leg = document.createElement('div');
      leg.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin:8px 0 14px;';
      [{color:'var(--accent-deep)',label:'Training'},{color:'rgba(255,85,0,0.15)',label:'Belohnung'},{color:'rgba(56,189,248,0.2)',label:'Eis-Tag'}].forEach(function(l){
        var li=document.createElement('div');li.style.cssText='display:flex;align-items:center;gap:4px;font-size:11px;color:var(--muted);';
        var dot=document.createElement('div');dot.style.cssText='width:9px;height:9px;border-radius:2px;background:'+l.color+';flex-shrink:0;';
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
      while(cur2 < stopD){
        var yr2=cur2.getFullYear(); var mo3=cur2.getMonth();
        var firstDayOfMonth=new Date(yr2,mo3,1);
        var dayNumStart=Math.floor((firstDayOfMonth-startD)/86400000)+1;
        var mHdr=document.createElement('div');
        mHdr.style.cssText='display:flex;align-items:baseline;gap:8px;margin:16px 0 6px;';
        var mName=document.createElement('div');mName.style.cssText='font-size:12px;color:var(--text);font-weight:700;';
        mName.textContent=cur2.toLocaleString('de-DE',{month:'long',year:'numeric'});
        var mDay=document.createElement('div');mDay.className='num';mDay.style.cssText='font-size:11px;color:var(--accent-ink);font-weight:600;';
        if(dayNumStart>=1) mDay.textContent='ab Tag '+Math.max(1,dayNumStart);
        mHdr.appendChild(mName);mHdr.appendChild(mDay);box.appendChild(mHdr);
        var grid2=document.createElement('div');
        grid2.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:3px;';
        ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(function(d){
          var dh=document.createElement('div');dh.style.cssText='text-align:center;font-size:11px;color:var(--muted);padding-bottom:3px;';
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
          cell2.style.cssText='border-radius:6px;padding:3px 1px;text-align:center;font-size:10px;line-height:1.3;min-height:32px;display:flex;flex-direction:column;align-items:center;justify-content:center;';
          if(isBeforeStart){
            cell2.style.opacity='0.15';cell2.textContent=day2;
          } else if(isFuture&&msNode2){
            cell2.style.cssText+='background:rgba(255,85,0,0.12);border:1px dashed rgba(255,85,0,0.5);cursor:pointer;';
            cell2.innerHTML='<div style="font-size:14px;">'+msNode2.icon+'</div><div style="font-size:10px;color:var(--accent-ink);font-weight:700;">'+dayNum+'</div>';
            cell2.onclick=(function(mn){return function(){showMilestoneDetail(mn,daysSince);};})(msNode2);
          } else if(isFuture){
            cell2.style.color='var(--muted2)';cell2.textContent=day2;
          } else if(isIce2&&!isWo2){
            cell2.style.cssText+='background:rgba(56,189,248,0.15);';
            cell2.innerHTML='<div style="font-size:12px;">&#10052;&#65039;</div><div style="font-size:10px;color:var(--blue-ink);">'+dayNum+'</div>';
          } else if(isWo2&&msNode2){
            cell2.style.cssText+='background:var(--accent-deep);cursor:pointer;';
            cell2.innerHTML='<div style="font-size:13px;">'+msNode2.icon+'</div><div style="font-size:10px;color:#fff;font-weight:700;">'+dayNum+'</div>';
            cell2.onclick=(function(mn){return function(){showMilestoneDetail(mn,daysSince);};})(msNode2);
          } else if(msNode2){
            cell2.style.cssText+='background:rgba(255,85,0,0.1);border:1px solid rgba(255,85,0,0.3);cursor:pointer;';
            cell2.innerHTML='<div style="font-size:13px;">'+msNode2.icon+'</div><div style="font-size:10px;color:var(--accent-ink);font-weight:700;">'+dayNum+'</div>';
            cell2.onclick=(function(mn){return function(){showMilestoneDetail(mn,daysSince);};})(msNode2);
          } else if(isWo2){
            cell2.style.cssText+='background:var(--accent-deep);';
            cell2.innerHTML='<div style="font-size:12px;">&#128293;</div><div style="font-size:10px;color:#fff;">'+dayNum+'</div>';
          } else if(isToday3){
            cell2.style.cssText+='border:2px solid var(--accent);';
            cell2.innerHTML='<div style="font-size:10px;color:var(--accent-ink);font-weight:700;">'+day2+'</div><div style="font-size:11px;color:var(--accent-ink);">Heute</div>';
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
  if(currency.diamonds < 2){ toast('Nicht genug \uD83D\uDC8E! Du brauchst 2 Diamanten.'); return; }
  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate()+1);
  var tStr = tomorrow.toISOString().slice(0,10);
  var iceDates2 = {};
  try{ iceDates2 = JSON.parse(localStorage.getItem('cali_ice_dates')||'{}'); }catch(x){}
  if(iceDates2[tStr]){ toast('Morgen ist bereits auf Eis geschützt!'); return; }
  iceDates2[tStr] = 1;
  try{ localStorage.setItem('cali_ice_dates', JSON.stringify(iceDates2)); }catch(x){}
  currency.diamonds -= 2;
  saveCurrency();
  toast('\u2744\uFE0F Streak geschützt für morgen! -2 \uD83D\uDC8E');
  buildProfilUI();
}

function showMilestoneDetail(m){
  var ex = document.getElementById('ms-detail-modal');
  if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'ms-detail-modal';
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg2);border:none;border-radius:20px;box-shadow:0 12px 30px rgba(0,0,0,0.06);padding:32px 24px;width:100%;max-width:360px;text-align:center;';

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
    '<div style="font-size:52px;margin-bottom:12px;">'+m.icon+'</div>'+
    '<div style="font-size:12px;color:var(--accent-ink);font-weight:600;margin-bottom:8px;">Meilenstein</div>'+
    '<div style="font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;">'+m.label+'</div>'+
    '<div style="font-size:14px;color:var(--muted);margin-bottom:20px;">Badge: <strong style="color:var(--text);">'+m.badge+'</strong></div>'+
    '<div style="background:var(--bg3);border-radius:16px;padding:14px;margin-bottom:20px;">'+
      '<div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:4px;">Belohnung</div>'+
      '<div class="num" style="font-size:28px;font-weight:800;color:var(--accent);">+'+m.diamonds+' &#128142;</div>'+
    '</div>'+
    (reached2 && !claimed ?
      '<button onclick="claimMilestoneFromModal(\''+m.days+'\','+m.diamonds+',\''+m.badge+'\',\''+m.icon+'\')" class="pressable" style="width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:16px;cursor:pointer;margin-bottom:10px;">Jetzt abholen</button>' :
      reached2 ?
      '<div style="color:var(--success-ink);font-size:12px;font-weight:700;margin-bottom:12px;">\u2713 Bereits abgeholt</div>' :
      '<div style="color:var(--muted);font-size:12px;margin-bottom:12px;">Noch nicht erreicht</div>'
    );

  var closeBtn = document.createElement('button');
  closeBtn.className = 'pressable';
  closeBtn.style.cssText = 'background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:8px;cursor:pointer;width:100%;';
  closeBtn.textContent = 'Schließen';
  closeBtn.onclick = function(){ ov.remove(); };
  box.appendChild(closeBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion){ caliMotion.sheetIn(null, ov); caliMotion.overlayIn(box); }
}

function claimMilestoneFromModal(days, diamonds, badge, icon){
  var key = 'cali_ms_claimed_'+days;
  currency.diamonds += diamonds;
  saveCurrency();
  try{ localStorage.setItem(key, '1'); }catch(x){}
  var ov = document.getElementById('ms-detail-modal');
  if(ov) ov.remove();
  if(window.caliMotion) caliMotion.celebrate('burst');
  toast(icon+' '+badge+' erreicht! +'+diamonds+' \uD83D\uDC8E');
  buildProfilUI();
}


// ── DEMO MODUS ────────────────────────────────────────────
function demoLogin(){
  var loadEl=document.getElementById('loading-screen');if(loadEl)loadEl.style.display='none';
  var ls=document.getElementById('login-screen');if(ls)ls.style.display='none';
  var db2=document.getElementById('demo-bar');if(db2)db2.style.display='none';
  var navEl=document.querySelector('nav');if(navEl)navEl.style.cssText='';
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
  m.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:var(--bg);z-index:1000;overflow-y:auto;padding:24px;box-sizing:border-box;';
  document.body.appendChild(m);
  if(window.caliMotion) caliMotion.overlayIn(m);
  obStep = 0;
  obAnimStep = -1;
  renderObStep();
}

function renderObStep(){
  var m = document.getElementById('ob-modal');
  if(!m) return;
  // Guard against out of bounds
  if(obStep < 0) obStep = 0;
  if(!obData) obData = {name:'', age:'', weight:'', height:'', level:'beginner', goal:'strength', weeklyGoal:3};

  var steps = [
    {icon:'\uD83D\uDC4B', title:'Willkommen!',   sub:'Wie sollen wir dich nennen?'},
    {icon:'\uD83D\uDCAA', title:'Dein K\u00F6rper',    sub:'Damit wir Trainings anpassen k\u00F6nnen.'},
    {icon:'\uD83C\uDFCB', title:'Dein Level',     sub:'Wie erfahren bist du?'},
    {icon:'\uD83C\uDFAF', title:'Dein Ziel',      sub:'Was willst du erreichen?'},
    {icon:'\uD83D\uDD25', title:'Wochenziel',      sub:'Wie oft pro Woche trainierst du?'}
  ];
  var totalSteps = steps.length;
  if(obStep >= totalSteps){ obFinish(); return; }
  var s = steps[obStep];

  // Progress bar — passend zum Label darunter: Schritt 1 von 5 = 20%
  var pct = Math.round(((obStep+1) / totalSteps) * 100);
  var dots = '<div style="background:var(--bg3);border-radius:4px;height:4px;margin-bottom:4px;overflow:hidden;"><div data-obfill style="height:100%;width:0%;background:var(--accent);border-radius:4px;transition:width var(--dur-slow) var(--ease-out);"></div></div>';
  dots += '<div class="num" style="font-size:10px;color:var(--muted);text-align:right;">'+(obStep+1)+' / '+totalSteps+'</div>';

  var content = '';

  if(obStep===0){
    content =
      '<div style="margin-bottom:14px;">'+
        '<div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:6px;">Dein Name</div>'+
        '<input id="ob-name" type="text" value="'+(obData.name||'')+'" placeholder="Name" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px;font-family:inherit;font-size:16px;outline:none;box-sizing:border-box;">'+
      '</div>'+
      '<div>'+
        '<div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:6px;">Dein Alter</div>'+
        '<input id="ob-age" type="number" value="'+(obData.age||'')+'" placeholder="" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px;font-family:inherit;font-size:16px;outline:none;box-sizing:border-box;">'+
      '</div>';
  } else if(obStep===1){
    content =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">'+
        '<div>'+
          '<div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:6px;">Gewicht (kg)</div>'+
          '<input id="ob-weight" type="number" value="'+obData.weight+'" placeholder="z.B. 75" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px;font-family:inherit;font-size:16px;outline:none;box-sizing:border-box;">'+
        '</div>'+
        '<div>'+
          '<div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:6px;">Größe (cm)</div>'+
          '<input id="ob-height" type="number" value="'+obData.height+'" placeholder="z.B. 180" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px;font-family:inherit;font-size:16px;outline:none;box-sizing:border-box;">'+
        '</div>'+
      '</div>'+
      '<div style="background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:12px;font-size:11px;color:var(--muted);line-height:1.6;">'+
        '&#128274; Deine Körperdaten sind privat und werden nur lokal gespeichert.'+
      '</div>';
  } else if(obStep===2){
    var lvls = [
      {v:'beginner',     l:'Anfänger',        d:'Ich fange gerade an', icon:'&#127935;'},
      {v:'intermediate', l:'Fortgeschritten', d:'1-2 Jahre Erfahrung', icon:'&#128170;'},
      {v:'advanced',     l:'Erfahren',        d:'3+ Jahre, solide Basis', icon:'&#127937;'},
    ];
    for(var i=0;i<lvls.length;i++){
      var sel=obData.level===lvls[i].v;
      content+='<div onclick="obData.level=\''+lvls[i].v+'\';renderObStep()" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();this.click();}" class="pressable" style="display:flex;align-items:center;gap:12px;background:'+(sel?'rgba(255,85,0,0.08)':'var(--bg2)')+';border:1px solid '+(sel?'var(--accent)':'var(--border)')+';border-radius:16px;padding:14px 16px;margin-bottom:10px;cursor:pointer;">'+
        '<div style="font-size:24px;">'+lvls[i].icon+'</div>'+
        '<div><div style="font-size:14px;color:'+(sel?'var(--accent-ink)':'var(--text)')+';font-weight:800;">'+lvls[i].l+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">'+lvls[i].d+'</div></div>'+
      '</div>';
    }
  } else if(obStep===3){
    var goals = [
      {v:'strength',   l:'Kraft aufbauen',    d:'Stärker & muskulöser werden',    icon:'&#128170;'},
      {v:'skills',     l:'Skills lernen',     d:'Muscle-Up, Handstand & co.',     icon:'&#127775;'},
      {v:'endurance',  l:'Ausdauer',          d:'Länger & öfter trainieren',      icon:'&#127939;'},
      {v:'weight',     l:'Abnehmen',          d:'Kalorien verbrennen',            icon:'&#128293;'},
      {v:'challenges', l:'Challenges',        d:'Challenges meistern & gewinnen', icon:'&#127942;'},
      {v:'compete',    l:'Wettkampf',         d:'Gegen andere antreten',          icon:'&#9876;&#65039;'},
      {v:'all',        l:'Alles',             d:'Rundum fit werden',              icon:'&#127919;'},
    ];
    for(var i=0;i<goals.length;i++){
      var sel=obData.goal===goals[i].v;
      content+='<div onclick="obData.goal=\''+goals[i].v+'\';renderObStep()" role="button" tabindex="0" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();this.click();}" class="pressable" style="display:flex;align-items:center;gap:12px;background:'+(sel?'rgba(255,85,0,0.08)':'var(--bg2)')+';border:1px solid '+(sel?'var(--accent)':'var(--border)')+';border-radius:16px;padding:12px 16px;margin-bottom:8px;cursor:pointer;">'+
        '<div style="font-size:20px;">'+goals[i].icon+'</div>'+
        '<div><div style="font-size:13px;color:'+(sel?'var(--accent-ink)':'var(--text)')+';font-weight:800;">'+goals[i].l+'</div><div style="font-size:11px;color:var(--muted);margin-top:1px;">'+goals[i].d+'</div></div>'+
      '</div>';
    }
  } else if(obStep===4){
    var btns='';
    for(var i=1;i<=7;i++){
      var sel=obData.weeklyGoal===i;
      btns+='<button onclick="obData.weeklyGoal='+i+';renderObStep()" aria-label="'+i+' Workouts pro Woche" class="num pressable" style="background:'+(sel?'var(--accent-deep)':'var(--bg2)')+';border:1px solid '+(sel?'var(--accent-deep)':'var(--border)')+';color:'+(sel?'#fff':'var(--muted)')+';border-radius:10px;padding:14px 4px;font-family:inherit;font-size:16px;font-weight:800;cursor:pointer;flex:1;transition:background-color var(--dur-fast) ease,border-color var(--dur-fast) ease,color var(--dur-fast) ease,transform var(--dur-fast) var(--ease-out);">'+i+'</button>';
    }
    content =
      '<div style="display:flex;gap:6px;margin-bottom:16px;">'+btns+'</div>'+
      '<div style="text-align:center;font-size:13px;color:var(--muted);">'+
        obData.weeklyGoal+'x pro Woche'+
      '</div>';
  }

  // Last step = LOS GEHTS, other steps = WEITER
  var isLast = obStep >= totalSteps - 1;
  var nextBtn = isLast
    ? '<button onclick="obFinish()" class="pressable" style="width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:15px;cursor:pointer;margin-top:16px;">Los geht\'s! \uD83D\uDCAA</button>'
    : '<button onclick="obNext()" class="pressable" style="width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:15px;cursor:pointer;margin-top:16px;">Weiter \u2192</button>';

  var backBtnHtml = obStep > 0
    ? '<button onclick="obStep--;renderObStep()" class="pressable" style="width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:10px;cursor:pointer;">\u2190 Zur\u00FCck</button>'
    : '';

  m.innerHTML =
    '<div style="max-width:380px;margin:0 auto;padding-top:20px;">'+
      dots+
      '<div style="font-size:44px;text-align:center;margin:20px 0 12px;">'+s.icon+'</div>'+
      '<div style="font-size:26px;font-weight:800;color:var(--accent);text-align:center;margin-bottom:6px;">'+s.title+'</div>'+
      '<div style="font-size:13px;color:var(--muted);text-align:center;margin-bottom:24px;">'+s.sub+'</div>'+
      content+
      nextBtn+
      backBtnHtml+
    '</div>';

  // Fortschrittsbalken wirklich füllen (reduced motion springt ans Ziel)
  var stepChanged = (obAnimStep !== obStep);
  var obFill = m.querySelector('[data-obfill]');
  if(obFill){
    if(window.caliMotion && stepChanged) caliMotion.animateBar(obFill, pct);
    else obFill.style.width = pct+'%';
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
  toast('\uD83D\uDCAA Willkommen' + (obData.name?' '+obData.name:'') + '! Viel Erfolg!');
}
