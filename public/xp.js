// ══════════════════════════════════════════════════════════
// XP.JS — XP & Level System
// ══════════════════════════════════════════════════════════

// ── LEVEL TABELLE (1-50) ──────────────────────────────────
var XP_LEVELS = (function(){
  var levels = [{level:1, xpRequired:0, diamonds:0}];
  var xp = 0;
  var increment = 500;
  for(var i=2; i<=50; i++){
    xp += increment;
    var diamonds = i<=10 ? 50 : i<=25 ? 100 : i<=40 ? 150 : 200;
    levels.push({level:i, xpRequired:xp, diamonds:diamonds});
    increment += 300;
  }
  return levels;
})();

// ── MONATLICHE RANGLISTE BONI ─────────────────────────────
var MONTHLY_RANK_BONUS = [
  {from:1,  to:1,   xp:2000},
  {from:2,  to:2,   xp:1500},
  {from:3,  to:3,   xp:1200},
  {from:4,  to:10,  xp:1000},
  {from:11, to:25,  xp:800},
  {from:26, to:50,  xp:500},
  {from:51, to:75,  xp:400},
  {from:76, to:100, xp:300},
];

// Zweistelliger Rang ("01") — ab 100 dreistellig
function xpPadRank(n){ return n<10 ? '0'+n : String(n); }

// XP-Stand lokal cachen — das Start-Dashboard (app1.js) zeigt daraus die Level-Kachel
function xpCacheTotal(totalXP){
  try{ localStorage.setItem('cali_xp_cache', String(parseInt(totalXP,10)||0)); }catch(e){}
}

// ── XP BERECHNUNG (ELO-basiert für Battles) ───────────────
function calcBattleXP(myLevel, opponentLevel, won){
  if(!won) return 0;
  var diff = opponentLevel - myLevel;
  var base = 100;
  if(diff >= 15) return 800;
  if(diff >= 10) return 600;
  if(diff >= 5)  return 400;
  if(diff >= 2)  return 250;
  if(diff >= 0)  return 100;
  if(diff >= -3) return 60;
  if(diff >= -7) return 40;
  return 20;
}

// ── AKTUELLES LEVEL ERMITTELN ─────────────────────────────
function getLevelFromXP(totalXP){
  var current = XP_LEVELS[0];
  for(var i=XP_LEVELS.length-1; i>=0; i--){
    if(totalXP >= XP_LEVELS[i].xpRequired){
      current = XP_LEVELS[i];
      break;
    }
  }
  var next = XP_LEVELS[Math.min(current.level, XP_LEVELS.length-1)];
  var xpForCurrent = current.xpRequired;
  var xpForNext = next ? next.xpRequired : current.xpRequired;
  var progress = xpForNext > xpForCurrent ?
    Math.round((totalXP - xpForCurrent) / (xpForNext - xpForCurrent) * 100) : 100;
  return {
    level: current.level,
    xp: totalXP,
    xpForNext: xpForNext,
    xpForCurrent: xpForCurrent,
    progress: Math.min(progress, 100),
    xpToNext: Math.max(0, xpForNext - totalXP),
  };
}

// ── XP VERGEBEN ───────────────────────────────────────────
function awardXP(amount, reason){
  if(!db || !firebase.auth().currentUser || amount <= 0) return;
  var uid = firebase.auth().currentUser.uid;
  var now = Date.now();
  var monthKey = new Date().toISOString().slice(0,7); // "2026-06"

  db.collection('xp').doc(uid).get().then(function(doc){
    var data = doc.exists ? doc.data() : {totalXP:0, monthlyXP:{}, level:1, diamonds:0};
    var oldXP = data.totalXP || 0;
    var newXP = oldXP + amount;
    var oldLevel = getLevelFromXP(oldXP);
    var newLevel = getLevelFromXP(newXP);

    // Monthly XP
    var monthly = data.monthlyXP || {};
    monthly[monthKey] = (monthly[monthKey] || 0) + amount;

    // Level up?
    var diamondBonus = 0;
    if(newLevel.level > oldLevel.level){
      for(var l=oldLevel.level+1; l<=newLevel.level; l++){
        var lvlData = XP_LEVELS[l-1];
        if(lvlData) diamondBonus += lvlData.diamonds;
      }
    }

    var updates = {
      totalXP: newXP,
      monthlyXP: monthly,
      level: newLevel.level,
      lastUpdated: now,
    };
    if(diamondBonus > 0){
      updates.diamonds = (data.diamonds||0) + diamondBonus;
    }

    return db.collection('xp').doc(uid).set(updates, {merge:true}).then(function(){
      xpCacheTotal(newXP);
      // XP Log
      db.collection('xpLog').add({
        uid: uid,
        amount: amount,
        reason: reason,
        total: newXP,
        date: now,
      });

      // Level-Up Toast
      if(newLevel.level > oldLevel.level){
        var msg = 'Level up! Level '+newLevel.level;
        if(diamondBonus > 0) msg += ' · +'+diamondBonus+' Diamanten';
        if(typeof toast==='function') toast(msg);
        showLevelUpAnimation(oldLevel.level, newLevel.level, diamondBonus);
        // Sync diamonds to main currency (spendable wallet: Streak-Eis, Challenge-Skip …)
        if(diamondBonus > 0 && typeof currency!=='undefined'){
          currency.diamonds = (currency.diamonds||0) + diamondBonus;
          if(typeof saveCurrency==='function') saveCurrency();
        }
      } else {
        showXPFloat(amount, reason);
      }
    });
  }).catch(function(e){ console.log('XP error:', e.message); });
}

// ── XP FLOAT (Mikro-Belohnung statt generischem Toast) ────
function showXPFloat(amount, reason){
  var canAnimate = window.caliMotion && !caliMotion.reduced() && document.body && typeof document.body.animate === 'function';
  if(!canAnimate){
    if(typeof toast==='function') toast('+'+amount+' XP — '+reason);
    return;
  }
  var el = document.createElement('div');
  el.setAttribute('aria-hidden','true');
  el.className = 'num u';
  el.style.cssText = 'position:fixed;bottom:150px;left:50%;transform:translate(-50%,0);background:var(--accent);color:#fff;font-family:inherit;font-weight:600;font-size:12px;padding:8px 14px;border-radius:var(--r-pill);box-shadow:none;z-index:3000;pointer-events:none;white-space:nowrap;';
  el.textContent = '+'+amount+' XP';
  document.body.appendChild(el);
  try{
    el.animate([
      {transform:'translate(-50%,16px) scale(0.98)',opacity:0},
      {transform:'translate(-50%,0) scale(1)',opacity:1,offset:0.15},
      {transform:'translate(-50%,-8px)',opacity:1,offset:0.75},
      {transform:'translate(-50%,-48px) scale(0.98)',opacity:0}
    ],{duration:1400,easing:'cubic-bezier(0.22,1,0.36,1)',fill:'forwards'});
  }catch(e){}
  setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 1500);
}

// ── LEVEL-UP ANIMATION ────────────────────────────────────
// Dunkles Overlay, Levelzahl in Punktmatrix (Doto), Burst in Orange/Weiß (Farben setzt tracker.html)
function showLevelUpAnimation(oldLevel, newLevel, diamonds){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:2000;display:flex;align-items:center;justify-content:center;cursor:pointer;';
  ov.innerHTML =
    '<div style="text-align:center;">'+
      '<div data-lvlup="emoji" class="lbl" style="color:var(--accent);margin-bottom:14px;display:inline-flex;align-items:center;gap:8px;"><span class="live-dot"></span>Level up</div>'+
      '<div data-lvlup="num" class="dotnum num" style="font-size:72px;color:var(--text);margin-bottom:10px;">'+newLevel+'</div>'+
      (diamonds>0?'<div data-lvlup="dia" style="display:flex;align-items:baseline;justify-content:center;gap:6px;margin-bottom:20px;"><span class="kpi num" style="font-size:22px;color:var(--accent);">+'+diamonds+'</span><span class="unit">Diamanten</span></div>':'')+
      '<div class="lbl" style="color:var(--muted2);">Tippen um fortzufahren</div>'+
    '</div>';
  ov.onclick = function(){ ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion){
    caliMotion.sheetIn(null, ov); // Backdrop-Fade
    caliMotion.celebrate('burst');
    if(!caliMotion.reduced()){
      // 3-Beat-Reveal: Label → Levelzahl → Diamanten (trocken, kein Overshoot)
      var beats = [['emoji',0],['num',150],['dia',350]];
      for(var i=0;i<beats.length;i++){
        var be = ov.querySelector('[data-lvlup="'+beats[i][0]+'"]');
        if(be && typeof be.animate==='function'){
          try{
            be.animate(
              [{transform:'translateY(8px)',opacity:0},{transform:'translateY(0)',opacity:1}],
              {duration:320,delay:beats[i][1],easing:'cubic-bezier(0.22,1,0.36,1)',fill:'backwards'}
            );
          }catch(e){}
        }
      }
      var numEl = ov.querySelector('[data-lvlup="num"]');
      if(numEl) caliMotion.countUp(numEl, newLevel, {duration:600, from:Math.max(0, oldLevel||0)});
    }
  }
  setTimeout(function(){ if(ov.parentNode) ov.remove(); }, 4000);
}

// ── XP WIDGET IM PROFIL ───────────────────────────────────
// LEVEL-Zeile: Label, Zahl 28px, rechts 3px-Balken + "<xp> / <next> XP"
function buildXPWidget(el){
  if(!el) return;
  if(!db || !firebase.auth().currentUser){
    el.innerHTML = '<div class="empty">Einloggen für XP.</div>';
    return;
  }
  var uid = firebase.auth().currentUser.uid;
  el.innerHTML = '<div class="empty">Lade…</div>';

  db.collection('xp').doc(uid).get().then(function(doc){
    var data = doc.exists ? doc.data() : {totalXP:0, level:1};
    var lv = getLevelFromXP(data.totalXP||0);
    var monthKey = new Date().toISOString().slice(0,7);
    var monthlyXP = (data.monthlyXP||{})[monthKey] || 0;
    xpCacheTotal(data.totalXP||0);

    el.innerHTML = '';

    var card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'margin-bottom:0;';

    // Level Badge + Name
    var levelLabel = lv.level<=5?'Starter':lv.level<=10?'Beginner':lv.level<=20?'Fortgeschritten':lv.level<=30?'Pro':lv.level<=40?'Elite':'Legend';
    card.innerHTML =
      '<div style="display:flex;align-items:flex-end;justify-content:space-between;gap:14px;">'+
        '<div style="flex-shrink:0;">'+
          '<span class="eyebrow">Level</span>'+
          '<div style="display:flex;align-items:baseline;gap:6px;"><span class="kpi num" data-xplvl>'+lv.level+'</span><span class="unit">'+levelLabel+'</span></div>'+
        '</div>'+
        '<div style="flex:1;min-width:0;padding-bottom:4px;">'+
          '<div class="linebar"><i data-xpfill style="width:0%;"></i></div>'+
          '<div class="lbl num" style="margin-top:6px;text-align:right;white-space:nowrap;">'+(lv.level<50 ? lv.xp.toLocaleString()+' / '+lv.xpForNext.toLocaleString()+' XP' : 'Max. Level')+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="row-sub num" style="margin-top:10px;">'+lv.xp.toLocaleString()+' XP gesamt · '+monthlyXP.toLocaleString()+' XP diesen Monat'+(lv.level<50?' · noch '+lv.xpToNext.toLocaleString()+' XP bis Level '+(lv.level+1):'')+'</div>';

    el.appendChild(card);

    // Bar von 0 auf Zielwert füllen (überlebt Re-Render, reduced-motion springt ans Ziel)
    var xpFill = card.querySelector('[data-xpfill]');
    if(xpFill){
      if(window.caliMotion) caliMotion.animateBar(xpFill, lv.progress);
      else xpFill.style.width = lv.progress+'%';
    }
    var lvlEl = card.querySelector('[data-xplvl]');
    if(lvlEl && window.caliMotion) caliMotion.countUp(lvlEl, lv.level, {duration:600});

    // XP-Verlauf Button (Ghost)
    var histBtn = document.createElement('button');
    histBtn.type = 'button';
    histBtn.className = 'btn-g pressable';
    histBtn.style.cssText = 'width:100%;min-height:44px;margin-top:8px;';
    histBtn.textContent = 'XP Verlauf';
    histBtn.onclick = function(){ openXPHistory(uid); };
    el.appendChild(histBtn);
  }).catch(function(e){ el.innerHTML='<div class="row-sub" style="color:var(--red);">Fehler: '+e.message+'</div>'; });
}

// ── XP VERLAUF ────────────────────────────────────────────
function openXPHistory(uid){
  var ov = document.createElement('div');
  ov.className = 'backdrop';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:80vh;overflow-y:auto;';
  box.innerHTML = '<div class="sheet-grip"></div>'+
    '<div class="ttl" style="margin-bottom:14px;">XP-Verlauf</div>'+
    '<div id="xp-hist-list"><div class="empty">Lädt…</div></div>';

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);

  db.collection('xpLog').where('uid','==',uid).orderBy('date','desc').limit(30).get()
    .then(function(snap){
      var el = document.getElementById('xp-hist-list');
      if(!el) return;
      el.innerHTML = '';
      if(snap.empty){ el.innerHTML='<div class="empty">Noch keine XP verdient.</div>'; return; }
      var list = document.createElement('div');
      list.className = 'list';
      snap.forEach(function(doc){
        var d = doc.data();
        var row = document.createElement('div');
        row.className = 'list-row';
        row.style.cssText = 'cursor:default;';
        var main = document.createElement('div');
        main.className = 'row-main';
        var reason = document.createElement('div');
        reason.className = 'row-title';
        reason.textContent = String(d.reason||'');
        var date = document.createElement('div');
        date.className = 'row-sub num';
        date.textContent = new Date(d.date).toLocaleDateString('de-DE');
        main.appendChild(reason); main.appendChild(date);
        var right = document.createElement('div');
        right.style.cssText = 'display:flex;align-items:baseline;gap:4px;flex-shrink:0;';
        right.innerHTML = '<span class="row-val num" style="color:var(--accent);">+'+(parseInt(d.amount,10)||0)+'</span><span class="unit">XP</span>';
        row.appendChild(main); row.appendChild(right);
        list.appendChild(row);
      });
      el.appendChild(list);
      if(window.caliMotion) caliMotion.stagger(list);
    });
}

// ── MONATLICHE RANGLISTE ──────────────────────────────────
function openMonthlyLeaderboard(){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  // Top-Bar: Zurück-Pfeil, zentrierter Titel, Platzhalter rechts
  var topBar = document.createElement('div');
  topBar.className = 'topbar';
  topBar.style.cssText = 'margin:0 16px;flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'icon-btn sm pressable';
  backBtn.setAttribute('aria-label','Zurück');
  backBtn.innerHTML = '&#8592;';
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var now2 = new Date();
  var monthName = now2.toLocaleString('de-DE',{month:'long',year:'numeric'});
  var titleEl = document.createElement('div');
  titleEl.className = 'topbar-title';
  titleEl.textContent = 'Monatsrangliste';
  var slot = document.createElement('div');
  slot.className = 'topbar-slot';
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(slot);
  ov.appendChild(topBar);

  var monthEl = document.createElement('div');
  monthEl.className = 'lbl';
  monthEl.style.cssText = 'padding:0 16px 10px;flex-shrink:0;';
  monthEl.textContent = monthName;
  ov.appendChild(monthEl);

  var listEl = document.createElement('div');
  listEl.className = 'sheet-scroll';
  listEl.style.cssText = 'flex:1;overflow-y:auto;padding:0 16px calc(var(--nav-h) + 24px + env(safe-area-inset-bottom,0px));';
  listEl.innerHTML = '<div class="empty">Lade…</div>';
  ov.appendChild(listEl);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);

  var monthKey = now2.toISOString().slice(0,7);
  var myUid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;

  db.collection('xp').limit(200).get().then(function(snap){
    var entries = [];
    snap.forEach(function(doc){
      var d = doc.data();
      var mxp = (d.monthlyXP||{})[monthKey]||0;
      if(mxp > 0) entries.push({uid:doc.id, level:d.level||1, monthlyXP:mxp, totalXP:d.totalXP||0});
    });
    entries.sort(function(a,b){ return b.monthlyXP-a.monthlyXP; });

    listEl.innerHTML = '';

    // XP-Bonus-Info (Werte aus MONTHLY_RANK_BONUS)
    var infoEl = document.createElement('div');
    infoEl.className = 'card';
    infoEl.innerHTML = '<span class="eyebrow">Monatsboni</span>'+
      '<div class="row-sub num">Am Monatsende erhalten die Top 100 XP-Boni. Platz 1: +'+MONTHLY_RANK_BONUS[0].xp+' XP · Platz 2: +'+MONTHLY_RANK_BONUS[1].xp+' XP · Platz 3: +'+MONTHLY_RANK_BONUS[2].xp+' XP …</div>';
    listEl.appendChild(infoEl);

    if(entries.length===0){
      listEl.innerHTML += '<div class="empty">Noch keine Einträge diesen Monat.</div>';
      return;
    }

    var list = document.createElement('div');
    list.className = 'list';
    var meTagHtml = '<span style="background:var(--card2);border:1px solid var(--line);border-radius:var(--r-sm);padding:2px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);margin-left:6px;vertical-align:middle;">Du</span>';

    entries.slice(0,100).forEach(function(e, i){
      var rank = i+1;
      var isMe = e.uid===myUid;
      var bonus = MONTHLY_RANK_BONUS.find(function(b){ return rank>=b.from&&rank<=b.to; });
      var row = document.createElement('div');
      row.className = 'list-row';
      row.style.cssText = 'cursor:default;content-visibility:auto;contain-intrinsic-size:auto 64px;'+(isMe?'background:var(--accent-soft);':'');

      // Rang als zweistelliger Index (Top 3 in Orange), Level im 32px-Ring, Name, Monats-XP
      row.innerHTML =
        '<span class="row-index num"'+(rank<=3?' style="color:var(--accent);"':'')+'>'+xpPadRank(rank)+'</span>'+
        '<span class="num" aria-label="Level '+e.level+'" style="width:32px;height:32px;border-radius:50%;border:1px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--text);flex-shrink:0;box-sizing:border-box;">'+e.level+'</span>'+
        '<div class="row-main">'+
          '<div class="row-title"></div>'+
          (bonus?'<div class="row-sub num" style="color:var(--accent);">+'+bonus.xp+' XP Bonus</div>':'')+
        '</div>'+
        '<div style="display:flex;align-items:baseline;gap:4px;flex-shrink:0;">'+
          '<span class="row-val num" style="font-size:16px;">'+e.monthlyXP.toLocaleString()+'</span>'+
          '<span class="unit">XP</span>'+
        '</div>';

      var nameEl = row.querySelector('.row-title');
      var setName = function(n){
        if(!nameEl) return;
        nameEl.textContent = n;
        if(isMe) nameEl.insertAdjacentHTML('beforeend', meTagHtml);
      };
      setName(isMe?'Du':'Spieler');

      // Load real name async
      db.collection('users').doc(e.uid).get().then(function(userDoc){
        if(userDoc.exists && userDoc.data().prData && userDoc.data().prData.name){
          setName(userDoc.data().prData.name);
        }
      });

      list.appendChild(row);
    });
    listEl.appendChild(list);
    if(window.caliMotion) caliMotion.stagger(list);
  }).catch(function(e){ listEl.innerHTML='<div class="row-sub" style="color:var(--red);">Fehler: '+e.message+'</div>'; });
}

// ── ADMIN: MONATSBONI VERGEBEN ────────────────────────────
function awardMonthlyBonuses(monthKey){
  if(!db) return;
  db.collection('xp').limit(200).get().then(function(snap){
    var entries = [];
    snap.forEach(function(doc){
      var d = doc.data();
      var mxp = (d.monthlyXP||{})[monthKey]||0;
      if(mxp>0) entries.push({uid:doc.id, monthlyXP:mxp});
    });
    entries.sort(function(a,b){ return b.monthlyXP-a.monthlyXP; });
    var top100 = entries.slice(0,100);
    var awarded = 0;
    top100.forEach(function(e, i){
      var rank = i+1;
      var bonus = MONTHLY_RANK_BONUS.find(function(b){ return rank>=b.from&&rank<=b.to; });
      if(bonus && bonus.xp > 0){
        // Award XP
        db.collection('xp').doc(e.uid).get().then(function(doc){
          if(!doc.exists) return;
          var d = doc.data();
          var newXP = (d.totalXP||0) + bonus.xp;
          var newLevel = getLevelFromXP(newXP);
          db.collection('xp').doc(e.uid).update({totalXP: newXP, level: newLevel.level});
          db.collection('xpLog').add({uid:e.uid, amount:bonus.xp, reason:'Monatsrangliste #'+rank+' ('+monthKey+')', total:newXP, date:Date.now()});
        });
        awarded++;
      }
    });
    toast(awarded+' Spieler haben Monatsboni erhalten!');
  });
}

// ── TÄGLICHE PARK KING XP ────────────────────────────────
function checkDailyKingXP(){
  if(!db || !firebase.auth().currentUser) return;
  var uid = firebase.auth().currentUser.uid;
  var today = new Date().toISOString().slice(0,10);
  var key = 'king_xp_'+today;
  if(localStorage.getItem(key)) return; // Already awarded today

  db.collection('parkKings').where('uid','==',uid).limit(10).get().then(function(snap){
    if(snap.empty) return;
    var count = snap.size;
    var xpAmount = count * 20; // 20 XP per park you're king of
    awardXP(xpAmount, 'Park King ('+count+' Park'+(count>1?'s':'')+')');
    localStorage.setItem(key, '1');
  });
}

// ── XP BEI APP START ─────────────────────────────────────
function initXPSystem(){
  if(!db || !firebase.auth().currentUser) return;
  checkDailyKingXP();
}

// ── XP RING UPDATE ────────────────────────────────────────
function updateXPRing(){
  if(!db || !firebase.auth().currentUser) return;
  var uid = firebase.auth().currentUser.uid;
  db.collection('xp').doc(uid).get().then(function(doc){
    var data = doc.exists ? doc.data() : {totalXP:0, level:1};
    var lv = getLevelFromXP(data.totalXP||0);
    xpCacheTotal(data.totalXP||0);

    // Update ring (Fortschritt in Orange — eine Akzentfarbe, wie im Design-Kontrakt)
    var ring = document.getElementById('xp-ring-progress');
    var badge = document.getElementById('xp-level-badge');
    if(ring){
      var circumference = 251.2; // 2 * PI * 40
      var offset = circumference - (lv.progress / 100 * circumference);
      ring.style.strokeDashoffset = offset;
      ring.style.stroke = 'var(--accent)';
    }
    if(badge){
      var wasHidden = badge.style.display !== 'block';
      badge.textContent = 'Lvl '+lv.level;
      badge.style.display = 'block';
      badge.style.background = 'var(--accent)';
      // Einblend-Pop ohne Overshoot — translateX(-50%) MUSS in den Keyframes bleiben (zentriert via transform)
      if(wasHidden && badge.animate && !(window.caliMotion && caliMotion.reduced())){
        try{
          badge.animate(
            [{transform:'translateX(-50%) scale(0.9)',opacity:0},{transform:'translateX(-50%) scale(1)',opacity:1}],
            {duration:200, easing:'cubic-bezier(0.22,1,0.36,1)'}
          );
        }catch(e){}
      }
    }
  }).catch(function(){});
}
