
function buildStreakWidget(){
  var el=document.getElementById('streak-widget');if(!el)return;
  calcStreak();
  var streak=streakData.currentStreak;var weekDone=getWeeklyProgress();var weekGoal=streakData.weeklyGoal||3;
  var lv=getLevel();el.innerHTML='';
  var card=document.createElement('div');card.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:10px;';
  var top=document.createElement('div');top.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;';
  var left=document.createElement('div');
  var flEl=document.createElement('div');flEl.style.cssText='font-size:24px;line-height:1;';flEl.textContent=streak>0?getFlames(streak):'\uD83D\uDD25';
  var snEl=document.createElement('div');snEl.style.cssText='font-family:inherit;font-size:12px;color:'+(streak>0?'var(--accent)':'#333')+';letter-spacing:1px;margin-top:2px;';snEl.textContent=streak>0?streak+' TAGE STREAK':'NOCH KEIN STREAK';
  left.appendChild(flEl);left.appendChild(snEl);
  var right=document.createElement('div');right.style.cssText='text-align:right;';
  var lvBadge=document.createElement('div');lvBadge.style.cssText='color:'+lv.color+';border:1px solid '+lv.color+';border-radius:20px;font-family:inherit;font-size:10px;letter-spacing:2px;padding:3px 10px;background:rgba(200,200,200,0.05);display:inline-block;';lvBadge.textContent=lv.label;
  right.appendChild(lvBadge);top.appendChild(left);top.appendChild(right);
  var wkLbl=document.createElement('div');wkLbl.style.cssText='font-size:10px;color:var(--muted);font-family:inherit;letter-spacing:1px;margin-bottom:6px;';wkLbl.textContent='DIESE WOCHE: '+weekDone+' / '+weekGoal;
  var dotRow=document.createElement('div');dotRow.style.cssText='display:flex;gap:5px;';
  for(var i=0;i<weekGoal;i++){var dot=document.createElement('div');dot.style.cssText='flex:1;height:5px;border-radius:3px;background:'+(i<weekDone?'var(--accent)':'var(--bg3)')+';';dotRow.appendChild(dot);}
  var changeBtn=document.createElement('button');changeBtn.style.cssText='background:none;border:none;color:var(--muted2);font-size:10px;font-family:inherit;cursor:pointer;margin-top:6px;';changeBtn.textContent='ZIEL ANDERN';changeBtn.onclick=function(){streakData.goalSet=false;sstreak();showWeeklyGoalModal();};
  card.appendChild(top);card.appendChild(wkLbl);card.appendChild(dotRow);card.appendChild(changeBtn);el.appendChild(card);
  buildProfilStreakSection();
}

function buildProfilStreakSection(){
  var strEl=document.getElementById('pr-streak-section');
  if(strEl){
    strEl.innerHTML='';
    var strCard=document.createElement('div');strCard.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;';
    var strRow=document.createElement('div');strRow.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
    var strL=document.createElement('div');
    var sfEl=document.createElement('div');sfEl.style.cssText='font-size:22px;';sfEl.textContent=streakData.currentStreak>0?getFlames(Math.min(streakData.currentStreak,5))+' '+streakData.currentStreak+' Tage':'Kein Streak';
    var sbEl=document.createElement('div');sbEl.style.cssText='font-size:11px;color:var(--muted2);margin-top:4px;';sbEl.textContent='Beste: '+streakData.longestStreak+' Tage';
    strL.appendChild(sfEl);strL.appendChild(sbEl);
    var strR=document.createElement('div');strR.style.cssText='text-align:right;';
    var gtEl=document.createElement('div');gtEl.style.cssText='font-family:inherit;font-size:26px;color:var(--accent);';gtEl.textContent=getWeeklyProgress()+' / '+streakData.weeklyGoal;
    var gsEl=document.createElement('div');gsEl.style.cssText='font-size:10px;color:var(--muted);font-family:inherit;';gsEl.textContent='DIESE WOCHE';
    strR.appendChild(gtEl);strR.appendChild(gsEl);strRow.appendChild(strL);strRow.appendChild(strR);
    var chBtn=document.createElement('button');chBtn.style.cssText='width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--muted);border-radius:8px;font-family:inherit;font-size:12px;font-weight:700;letter-spacing:1px;padding:10px;cursor:pointer;';chBtn.textContent='WOCHENZIEL ANDERN (aktuell: '+streakData.weeklyGoal+'x)';chBtn.onclick=function(){streakData.goalSet=false;sstreak();showWeeklyGoalModal();};
    strCard.appendChild(strRow);strCard.appendChild(chBtn);strEl.appendChild(strCard);
  }
  var calEl=document.getElementById('pr-streak-calendar');
  if(calEl){
    calEl.innerHTML='';

    // ── Meilensteine — viele kleine Schritte ──────────────
    var MILESTONES = [
      {days:3,   label:'3 TAGE',     diamonds:2,  badge:'ERSTER SCHRITT', icon:'\uD83D\uDC23'},
      {days:7,   label:'1 WOCHE',    diamonds:4,  badge:'STARTER',        icon:'\uD83D\uDC4B'},
      {days:14,  label:'2 WOCHEN',   diamonds:5,  badge:'IM RHYTHMUS',    icon:'\uD83C\uDFB5'},
      {days:21,  label:'3 WOCHEN',   diamonds:6,  badge:'GEWOHNHEIT',     icon:'\uD83D\uDD04'},
      {days:30,  label:'1 MONAT',    diamonds:8,  badge:'DEDICATED',      icon:'\uD83D\uDCAA'},
      {days:45,  label:'45 TAGE',    diamonds:10, badge:'HALFTIME',       icon:'\u26A1'},
      {days:60,  label:'2 MONATE',   diamonds:12, badge:'CONSISTENT',     icon:'\uD83D\uDCC8'},
      {days:90,  label:'3 MONATE',   diamonds:16, badge:'WARRIOR',        icon:'\u2694\uFE0F'},
      {days:120, label:'4 MONATE',   diamonds:18, badge:'GRINDER',        icon:'\u2699\uFE0F'},
      {days:150, label:'5 MONATE',   diamonds:20, badge:'MACHINE',        icon:'\uD83E\uDD16'},
      {days:180, label:'6 MONATE',   diamonds:25, badge:'VETERAN',        icon:'\uD83D\uDD25'},
      {days:240, label:'8 MONATE',   diamonds:28, badge:'RELENTLESS',     icon:'\uD83D\uDC7B'},
      {days:270, label:'9 MONATE',   diamonds:30, badge:'IRON WILL',      icon:'\uD83E\uDDB4'},
      {days:300, label:'10 MONATE',  diamonds:32, badge:'UNSTOPPABLE',    icon:'\uD83D\uDE80'},
      {days:365, label:'1 JAHR',     diamonds:50, badge:'ELITE',          icon:'\uD83D\uDC51'},
      {days:500, label:'500 TAGE',   diamonds:60, badge:'LEGEND',         icon:'\uD83C\uDF1F'},
      {days:730, label:'2 JAHRE',    diamonds:100,badge:'IMMORTAL',       icon:'\uD83D\uDC8E'},
    ];

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
    iceBox.style.cssText = 'background:linear-gradient(135deg,rgba(56,189,248,0.08),rgba(56,189,248,0.03));border:1px solid rgba(56,189,248,0.25);border-radius:12px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;';
    var iceLeft = document.createElement('div');
    iceLeft.style.cssText = 'flex:1;';
    iceLeft.innerHTML =
      '<div style="font-size:12px;font-weight:800;color:#38BDF8;letter-spacing:1px;margin-bottom:3px;">\u2744\uFE0F STREAK AUF EIS</div>'+
      '<div style="font-size:10px;color:var(--muted);line-height:1.5;">Schütze deinen Streak für 1 Tag — kostet 2 \uD83D\uDC8E</div>';
    var iceBtn = document.createElement('button');
    iceBtn.style.cssText = 'background:#38BDF8;color:#000;border:none;border-radius:8px;font-family:inherit;font-size:11px;font-weight:800;letter-spacing:1px;padding:8px 14px;cursor:pointer;white-space:nowrap;flex-shrink:0;';
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

    // Kompakter Header-Button
    var msBtn = document.createElement('div');
    msBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:12px;';
    msBtn.innerHTML =
      '<div style="font-size:24px;">\uD83D\uDC0E</div>'+
      '<div style="flex:1;">'+
        '<div style="font-size:9px;letter-spacing:3px;color:var(--accent);font-weight:700;margin-bottom:3px;">MEILENSTEINE</div>'+
        '<div style="font-size:11px;color:var(--text);font-weight:700;">'+reached_count+' / '+MILESTONES.length+' erreicht'+(nextMs?' &nbsp;\u00B7&nbsp; Nächster in '+(nextMs.days-daysSince)+'d':'')+'</div>'+
      '</div>'+
      '<div id="ms-chevron" style="font-size:16px;color:var(--muted);transition:transform 0.2s;">\u2039</div>';

    // Aufklappbare Liste
    var msList = document.createElement('div');
    msList.style.cssText = 'max-height:0;overflow:hidden;transition:max-height 0.35s ease;';

    var msInner = document.createElement('div');
    msInner.style.cssText = 'padding-top:8px;display:flex;flex-direction:column;gap:4px;';

    MILESTONES.forEach(function(m){
      var reached = daysSince >= m.days;
      var daysLeft = m.days - daysSince;
      var claimedKey = 'cali_ms_claimed_'+m.days;
      var claimed = false;
      try{ claimed = !!localStorage.getItem(claimedKey); }catch(x){}

      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;'+
        (reached && !claimed ? 'background:rgba(255,85,0,0.07);border:1px solid rgba(255,85,0,0.2);' : 'background:var(--bg3);border:1px solid transparent;');

      var iconEl = document.createElement('div');
      iconEl.style.cssText = 'font-size:16px;flex-shrink:0;'+(reached?'':'filter:grayscale(1);opacity:0.3;');
      iconEl.textContent = m.icon;

      var infoEl = document.createElement('div');
      infoEl.style.cssText = 'flex:1;min-width:0;';
      infoEl.innerHTML =
        '<div style="font-size:11px;font-weight:700;color:'+(reached?'var(--text)':'var(--muted)')+';">'+m.label+' &nbsp;<span style="font-size:9px;font-weight:400;color:var(--muted);">'+m.badge+'</span></div>'+
        '<div style="font-size:9px;color:var(--muted);margin-top:1px;">'+(reached && claimed ? '\u2713 Abgeholt' : reached ? 'Bereit!' : 'noch '+daysLeft+' Tage')+'</div>';

      if(reached && !claimed){
        var claimBtn2 = document.createElement('button');
        claimBtn2.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:7px;font-family:inherit;font-size:9px;font-weight:800;letter-spacing:1px;padding:5px 10px;cursor:pointer;white-space:nowrap;flex-shrink:0;';
        claimBtn2.textContent = '+'+m.diamonds+' \uD83D\uDC8E';
        claimBtn2.onclick = (function(ms3, key3){
          return function(e){
            e.stopPropagation();
            currency.diamonds += ms3.diamonds;
            saveCurrency();
            try{ localStorage.setItem(key3,'1'); }catch(x){}
            toast(ms3.icon+' '+ms3.badge+'! +'+ms3.diamonds+' \uD83D\uDC8E');
            buildProfilUI();
          };
        })(m, claimedKey);
        row.appendChild(iconEl); row.appendChild(infoEl); row.appendChild(claimBtn2);
      } else {
        var rewEl = document.createElement('div');
        rewEl.style.cssText = 'font-size:10px;color:'+(reached?'#bbb':'#ddd')+';flex-shrink:0;';
        rewEl.textContent = '+'+m.diamonds+' \uD83D\uDC8E';
        row.appendChild(iconEl); row.appendChild(infoEl); row.appendChild(rewEl);
      }
      msInner.appendChild(row);
    });

    msList.appendChild(msInner);
    msBtn.onclick = function(){
      msExpanded = !msExpanded;
      msList.style.maxHeight = msExpanded ? (MILESTONES.length * 54)+'px' : '0';
      var chev = document.getElementById('ms-chevron');
      if(chev) chev.style.transform = msExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
    };

    msBox.appendChild(msBtn);
    msBox.appendChild(msList);
    calEl.appendChild(msBox);

    // ── KALENDER ──────────────────────────────────────────
    var calSection = document.createElement('div');
    var calHdr = document.createElement('div');
    calHdr.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;';
    var calTitleEl = document.createElement('div');
    calTitleEl.style.cssText = 'font-size:9px;letter-spacing:3px;color:var(--accent);font-weight:700;';
    calTitleEl.textContent = 'TRAININGS-KALENDER';
    var expandBtn = document.createElement('button');
    expandBtn.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:6px;font-family:inherit;font-size:9px;letter-spacing:1px;color:var(--muted);padding:4px 10px;cursor:pointer;';
    expandBtn.textContent = 'ALLE MONATE';
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
        mLbl.style.cssText = 'font-size:10px;color:var(--muted);letter-spacing:2px;margin-bottom:6px;margin-top:12px;font-weight:600;';
        mLbl.textContent = cur.toLocaleString('de-DE',{month:'long',year:'numeric'}).toUpperCase();
        calBody.appendChild(mLbl);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:2px;';
        ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(function(d){
          var dh = document.createElement('div');
          dh.style.cssText = 'text-align:center;font-size:9px;color:var(--muted);padding-bottom:3px;';
          dh.textContent = d; grid.appendChild(dh);
        });
        var fday = new Date(yr,mo2,1).getDay(); fday=fday===0?6:fday-1;
        for(var fi=0;fi<fday;fi++) grid.appendChild(document.createElement('div'));

        var dim = new Date(yr,mo2+1,0).getDate();
        for(var day=1;day<=dim;day++){
          var moS=(mo2+1)<10?'0'+(mo2+1):''+(mo2+1);
          var ds2=yr+'-'+moS+'-'+(day<10?'0':'')+day;
          var cell=document.createElement('div');
          cell.style.cssText='border-radius:5px;padding:4px 0;text-align:center;font-size:9px;line-height:1.2;';

          if(ds2 > todayStr){ cell.style.color='#ddd'; cell.textContent=day; grid.appendChild(cell); continue; }

          var msNode=milestoneDates[ds2];
          var isWorkout=!!workoutDates[ds2];
          var isIce=!!iceDates[ds2];
          var isToday2=ds2===todayStr;

          if(isIce && !isWorkout){
            cell.style.background='rgba(56,189,248,0.15)';cell.style.color='#38BDF8';
            cell.innerHTML=day+'<div style="font-size:8px;">\u2744\uFE0F</div>';
          } else if(isWorkout && msNode){
            cell.style.background='var(--accent)';cell.style.color='#fff';
            cell.innerHTML=day+'<div style="font-size:7px;">'+msNode.icon+'</div>';
            cell.style.cursor='pointer';
            cell.onclick=(function(mn){ return function(){ showMilestoneDetail(mn,daysSince); }; })(msNode);
          } else if(msNode){
            cell.style.background='rgba(255,85,0,0.1)';cell.style.border='1px solid rgba(255,85,0,0.3)';cell.style.color='var(--accent)';
            cell.innerHTML=day+'<div style="font-size:7px;">'+msNode.icon+'</div>';
            cell.style.cursor='pointer';
            cell.onclick=(function(mn){ return function(){ showMilestoneDetail(mn,daysSince); }; })(msNode);
          } else if(isWorkout){
            cell.style.background='var(--accent)';cell.style.color='#fff';
            cell.innerHTML=day+'<div style="font-size:8px;">\uD83D\uDD25</div>';
          } else if(isToday2){
            cell.style.border='1px solid var(--accent)';cell.style.color='var(--accent)';cell.textContent=day;
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
      calExpanded=!calExpanded;
      expandBtn.textContent=calExpanded?'WENIGER':'ALLE MONATE';
      renderCalBody();
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
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9995;display:flex;align-items:center;justify-content:center;padding:24px;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg2);border-radius:20px;padding:32px 24px;width:100%;max-width:360px;text-align:center;border:1px solid var(--border);';

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
    '<div style="font-size:9px;letter-spacing:3px;color:var(--accent);font-weight:700;margin-bottom:8px;">MEILENSTEIN</div>'+
    '<div style="font-size:22px;font-weight:900;letter-spacing:2px;color:var(--text);margin-bottom:6px;">'+m.label+'</div>'+
    '<div style="font-size:14px;color:var(--muted);margin-bottom:20px;">Badge: <strong style="color:var(--text);">'+m.badge+'</strong></div>'+
    '<div style="background:var(--bg3);border-radius:12px;padding:14px;margin-bottom:20px;">'+
      '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">BELOHNUNG</div>'+
      '<div style="font-size:28px;font-weight:900;color:var(--accent);">'+m.reward+'</div>'+
    '</div>'+
    (reached2 && !claimed ?
      '<button onclick="claimMilestoneFromModal(\''+m.days+'\','+m.diamonds+',\''+m.badge+'\',\''+m.icon+'\')" style="width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;letter-spacing:2px;padding:16px;cursor:pointer;margin-bottom:10px;">JETZT ABHOLEN</button>' :
      reached2 ?
      '<div style="color:var(--accent);font-size:12px;font-weight:700;letter-spacing:1px;margin-bottom:12px;">\u2713 BEREITS ABGEHOLT</div>' :
      '<div style="color:var(--muted);font-size:12px;margin-bottom:12px;">Noch nicht erreicht</div>'
    );

  var closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:8px;cursor:pointer;width:100%;';
  closeBtn.textContent = 'Schließen';
  closeBtn.onclick = function(){ ov.remove(); };
  box.appendChild(closeBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
}

function claimMilestoneFromModal(days, diamonds, badge, icon){
  var key = 'cali_ms_claimed_'+days;
  currency.diamonds += diamonds;
  saveCurrency();
  try{ localStorage.setItem(key, '1'); }catch(x){}
  var ov = document.getElementById('ms-detail-modal');
  if(ov) ov.remove();
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
    if(isFirst){try{showOnboarding();}catch(e){alert('Fehler: '+e.message);}}
    else if(!streakData.goalSet){try{showWeeklyGoalModal();}catch(e){}}
  },300);
  toast('Demo Modus!');
}



// ── ONBOARDING ──────────────────────────────────────────
var obStep = 0;
var obData = {name:'', age:'', weight:'', height:'', level:'beginner', goal:'strength', weeklyGoal:3};
