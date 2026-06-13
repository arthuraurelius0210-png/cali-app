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
        var msg = '🎉 LEVEL UP! Level '+newLevel.level;
        if(diamondBonus > 0) msg += ' +'+diamondBonus+' 💎';
        if(typeof toast==='function') toast(msg);
        showLevelUpAnimation(oldLevel.level, newLevel.level, diamondBonus);
        // Sync diamonds to main currency
        if(typeof currencyData!=='undefined'){
          currencyData.diamonds = (currencyData.diamonds||0) + diamondBonus;
          if(typeof saveCurrency==='function') saveCurrency();
        }
      } else {
        if(typeof toast==='function') toast('+'+amount+' XP — '+reason);
      }
    });
  }).catch(function(e){ console.log('XP error:', e.message); });
}

// ── LEVEL-UP ANIMATION ────────────────────────────────────
function showLevelUpAnimation(oldLevel, newLevel, diamonds){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;';
  ov.innerHTML =
    '<div style="text-align:center;animation:fadeIn 0.5s ease;">'+
      '<div style="font-size:60px;margin-bottom:8px;">🎉</div>'+
      '<div style="font-size:13px;letter-spacing:4px;color:#ff5500;font-weight:700;margin-bottom:8px;">LEVEL UP!</div>'+
      '<div style="font-size:64px;font-weight:900;color:#fff;margin-bottom:4px;">'+newLevel+'</div>'+
      (diamonds>0?'<div style="font-size:20px;color:#ffd700;margin-bottom:16px;">+'+diamonds+' 💎</div>':'')+
      '<div style="font-size:13px;color:#999;">Tippen um fortzufahren</div>'+
    '</div>';
  ov.onclick = function(){ ov.remove(); };
  document.body.appendChild(ov);
  setTimeout(function(){ if(ov.parentNode) ov.remove(); }, 4000);
}

// ── XP WIDGET IM PROFIL ───────────────────────────────────
function buildXPWidget(el){
  if(!el) return;
  if(!db || !firebase.auth().currentUser){
    el.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:8px;">Einloggen für XP.</div>';
    return;
  }
  var uid = firebase.auth().currentUser.uid;
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:8px;">⏳ Lade...</div>';

  db.collection('xp').doc(uid).get().then(function(doc){
    var data = doc.exists ? doc.data() : {totalXP:0, level:1};
    var lv = getLevelFromXP(data.totalXP||0);
    var monthKey = new Date().toISOString().slice(0,7);
    var monthlyXP = (data.monthlyXP||{})[monthKey] || 0;

    el.innerHTML = '';

    var card = document.createElement('div');
    card.style.cssText = 'background:var(--bg2);border-radius:16px;padding:16px;border:1px solid var(--border);';

    // Level Badge + Name
    var levelLabel = lv.level<=5?'Starter':lv.level<=10?'Beginner':lv.level<=20?'Fortgeschritten':lv.level<=30?'Pro':lv.level<=40?'Elite':'Legend';
    card.innerHTML =
      '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px;">'+
        '<div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#ff5500,#ff8c00);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:#fff;flex-shrink:0;">'+lv.level+'</div>'+
        '<div style="flex:1;">'+
          '<div style="font-size:16px;font-weight:800;color:var(--text);">Level '+lv.level+' — '+levelLabel+'</div>'+
          '<div style="font-size:11px;color:var(--muted);">'+lv.xp.toLocaleString()+' XP gesamt · '+monthlyXP.toLocaleString()+' XP diesen Monat</div>'+
        '</div>'+
      '</div>'+
      // Progress bar
      '<div style="font-size:10px;color:var(--muted);margin-bottom:6px;display:flex;justify-content:space-between;">'+
        '<span>Level '+lv.level+'</span>'+
        (lv.level<50?'<span>'+lv.xpToNext.toLocaleString()+' XP bis Level '+(lv.level+1)+'</span>':'<span>MAX LEVEL</span>')+
      '</div>'+
      '<div style="background:var(--bg3);border-radius:20px;height:10px;overflow:hidden;">'+
        '<div style="height:100%;width:'+lv.progress+'%;background:linear-gradient(90deg,#ff5500,#ff8c00);border-radius:20px;transition:width 0.5s;"></div>'+
      '</div>';

    el.appendChild(card);

    // XP verdienen Button
    var histBtn = document.createElement('button');
    histBtn.style.cssText = 'width:100%;background:none;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:10px;cursor:pointer;color:var(--muted);margin-top:8px;';
    histBtn.textContent = '📊 XP Verlauf';
    histBtn.onclick = function(){ openXPHistory(uid); };
    el.appendChild(histBtn);
  }).catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>'; });
}

// ── XP VERLAUF ────────────────────────────────────────────
function openXPHistory(uid){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:20px 20px 40px;max-height:80vh;overflow-y:auto;';
  box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 16px;"></div>'+
    '<div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:14px;">📊 XP VERLAUF</div>'+
    '<div id="xp-hist-list" style="color:var(--muted);font-size:12px;">Lädt...</div>';

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);

  db.collection('xpLog').where('uid','==',uid).orderBy('date','desc').limit(30).get()
    .then(function(snap){
      var el = document.getElementById('xp-hist-list');
      if(!el) return;
      el.innerHTML = '';
      if(snap.empty){ el.innerHTML='<div style="text-align:center;padding:20px;color:var(--muted);">Noch keine XP verdient.</div>'; return; }
      snap.forEach(function(doc){
        var d = doc.data();
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);';
        row.innerHTML =
          '<div>'+
            '<div style="font-size:12px;font-weight:700;color:var(--text);">'+d.reason+'</div>'+
            '<div style="font-size:10px;color:var(--muted);">'+new Date(d.date).toLocaleDateString('de-DE')+'</div>'+
          '</div>'+
          '<div style="font-size:15px;font-weight:800;color:var(--accent);">+'+d.amount+' XP</div>';
        el.appendChild(row);
      });
    });
}

// ── MONATLICHE RANGLISTE ──────────────────────────────────
function openMonthlyLeaderboard(){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9950;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '← Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var now2 = new Date();
  var monthName = now2.toLocaleString('de-DE',{month:'long',year:'numeric'}).toUpperCase();
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;';
  titleEl.innerHTML = '<div style="font-size:15px;font-weight:800;color:var(--text);">🏆 MONATSRANGLISTE</div><div style="font-size:10px;color:var(--muted);">'+monthName+'</div>';
  topBar.appendChild(backBtn); topBar.appendChild(titleEl);
  ov.appendChild(topBar);

  var listEl = document.createElement('div');
  listEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
  listEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">⏳ Lade...</div>';
  ov.appendChild(listEl);
  document.body.appendChild(ov);

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

    // XP Bonus Info
    var infoEl = document.createElement('div');
    infoEl.style.cssText = 'background:rgba(255,85,0,0.08);border:1px solid rgba(255,85,0,0.2);border-radius:12px;padding:12px;margin-bottom:16px;font-size:11px;color:var(--muted);line-height:1.6;';
    infoEl.innerHTML = '🏆 Am Monatsende erhalten die Top 100 XP-Boni!<br>Platz 1: +2000 XP · Platz 2: +1500 XP · Platz 3: +1200 XP ...';
    listEl.appendChild(infoEl);

    if(entries.length===0){
      listEl.innerHTML += '<div style="text-align:center;padding:40px;color:var(--muted);">Noch keine Einträge diesen Monat.</div>';
      return;
    }

    entries.slice(0,100).forEach(function(e, i){
      var rank = i+1;
      var medal = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'';
      var isMe = e.uid===myUid;
      var bonus = MONTHLY_RANK_BONUS.find(function(b){ return rank>=b.from&&rank<=b.to; });
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;margin-bottom:8px;background:'+(isMe?'rgba(255,85,0,0.08)':'var(--bg2)')+';border:1.5px solid '+(isMe?'var(--accent)':'var(--border)')+';';

      // Load name from users collection
      row.innerHTML =
        '<div style="width:28px;text-align:center;flex-shrink:0;">'+(medal?'<span style="font-size:20px;">'+medal+'</span>':'<span style="font-size:12px;font-weight:700;color:var(--muted);">#'+rank+'</span>')+'</div>'+
        '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#ff5500,#ff8c00);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#fff;flex-shrink:0;">'+e.level+'</div>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-size:13px;font-weight:700;color:var(--text);">'+(isMe?'Du':'Spieler')+(isMe?' <span style="font-size:9px;color:var(--accent);border:1px solid var(--accent);border-radius:3px;padding:0 3px;">DU</span>':'')+' </div>'+
          (bonus?'<div style="font-size:9px;color:var(--accent);">+'+bonus.xp+' XP Bonus</div>':'')+
        '</div>'+
        '<div style="text-align:right;flex-shrink:0;">'+
          '<div style="font-size:16px;font-weight:800;color:var(--accent);">'+e.monthlyXP.toLocaleString()+'</div>'+
          '<div style="font-size:9px;color:var(--muted);">XP</div>'+
        '</div>';

      // Load real name async
      db.collection('users').doc(e.uid).get().then(function(userDoc){
        if(userDoc.exists && userDoc.data().prData && userDoc.data().prData.name){
          var nameEl = row.querySelector('div[style*="font-size:13px"]');
          if(nameEl) nameEl.innerHTML = userDoc.data().prData.name+(isMe?' <span style="font-size:9px;color:var(--accent);border:1px solid var(--accent);border-radius:3px;padding:0 3px;">DU</span>':'');
        }
      });

      listEl.appendChild(row);
    });
  }).catch(function(e){ listEl.innerHTML='<div style="color:var(--muted);">Fehler: '+e.message+'</div>'; });
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
    toast('✅ '+awarded+' Spieler haben Monatsboni erhalten!');
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
    awardXP(xpAmount, '👑 Park King ('+count+' Park'+(count>1?'s':'')+')');
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

    // Update ring
    var ring = document.getElementById('xp-ring-progress');
    var badge = document.getElementById('xp-level-badge');
    if(ring){
      var circumference = 251.2; // 2 * PI * 40
      var offset = circumference - (lv.progress / 100 * circumference);
      ring.style.strokeDashoffset = offset;
      // Color by level
      var color = lv.level<=10?'#3b82f6':lv.level<=20?'#22c55e':lv.level<=35?'#f59e0b':'#ff5500';
      ring.style.stroke = color;
    }
    if(badge){
      badge.textContent = 'LVL '+lv.level;
      badge.style.display = 'block';
      badge.style.background = lv.level<=10?'#3b82f6':lv.level<=20?'#22c55e':lv.level<=35?'#f59e0b':'#ff5500';
    }
  }).catch(function(){});
}
