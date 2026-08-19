// ══════════════════════════════════════════════════════════
// BATTLE.JS — Park Battle System
// ══════════════════════════════════════════════════════════

var BATTLE_EXERCISES = [];
function getBattleExercises(){
  if(BATTLE_EXERCISES.length > 0) return BATTLE_EXERCISES;
  var seen = {};
  if(typeof EX_DB !== 'undefined'){
    EX_DB.forEach(function(ex, i){
      var k = ex.name+'|'+ex.unit;
      if(!seen[k]){ seen[k]=1; BATTLE_EXERCISES.push({id:'ex_'+i, name:ex.name, unit:ex.unit, cat:ex.cat}); }
    });
  }
  var extras = [
    {id:'sk_muscleup',name:'Muscle-Up',unit:'Wdh',cat:'Skills'},
    {id:'sk_lsit',name:'L-Sit',unit:'Sek',cat:'Skills'},
    {id:'sk_handstand',name:'Handstand',unit:'Sek',cat:'Skills'},
    {id:'sk_frontlever',name:'Front Lever',unit:'Sek',cat:'Skills'},
    {id:'sk_planche',name:'Planche',unit:'Sek',cat:'Skills'},
    {id:'sk_humanflag',name:'Human Flag',unit:'Sek',cat:'Skills'},
  ];
  extras.forEach(function(s){ var k=s.name+'|'+s.unit; if(!seen[k]){seen[k]=1;BATTLE_EXERCISES.push(s);} });
  return BATTLE_EXERCISES;
}

// ── BATTLE ÜBERSICHT ───────────────────────────────────────
function openBattleOverview(){
  var ex = document.getElementById('battle-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'battle-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.classList.add('pressable');
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;font-size:17px;font-weight:700;color:var(--text);';
  titleEl.innerHTML = '&#9876;&#65039; Battles';
  var newBtn = document.createElement('button');
  newBtn.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:9px 14px;min-height:36px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
  newBtn.classList.add('pressable');
  newBtn.textContent = '+ Herausfordern';
  newBtn.onclick = function(){ openChallengeSomeone(ov); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(newBtn);
  ov.appendChild(topBar);

  // Tabs
  var tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;border-bottom:1px solid var(--border);flex-shrink:0;';
  var tabs = ['Offen','Meine Battles','Park Kings'];
  var bodies = [];
  tabs.forEach(function(t, ti){
    var tb = document.createElement('button');
    tb.style.cssText = 'flex:1;padding:12px 4px;min-height:44px;font-family:inherit;font-weight:700;font-size:13px;border:none;cursor:pointer;border-bottom:2px solid '+(ti===0?'var(--accent)':'transparent')+';background:none;color:'+(ti===0?'var(--accent-ink)':'var(--muted)')+';transition:transform var(--dur-fast) var(--ease-out);';
    tb.textContent = t;
    tb.classList.add('pressable');
    var body = document.createElement('div');
    body.style.cssText = 'display:'+(ti===0?'flex':'none')+';flex-direction:column;padding:20px 20px 40px;gap:10px;overflow-y:auto;flex:1;';
    body.classList.add('sheet-scroll');
    bodies.push(body);
    tb.onclick = (function(tIdx){
      return function(){
        tabBar.querySelectorAll('button').forEach(function(b,bi){
          b.style.borderBottomColor = bi===tIdx?'var(--accent)':'transparent';
          b.style.color = bi===tIdx?'var(--accent-ink)':'var(--muted)';
        });
        bodies.forEach(function(b,bi){ b.style.display=bi===tIdx?'flex':'none'; });
        if(tIdx===0 && !bodies[0]._loaded){ loadOpenBattles(bodies[0]); bodies[0]._loaded=true; }
        if(tIdx===1 && !bodies[1]._loaded){ loadMyBattles(bodies[1]); bodies[1]._loaded=true; }
        if(tIdx===2 && !bodies[2]._loaded){ loadParkKings(bodies[2]); bodies[2]._loaded=true; }
      };
    })(ti);
    tabBar.appendChild(tb);
  });
  ov.appendChild(tabBar);

  var contentWrap = document.createElement('div');
  contentWrap.style.cssText = 'flex:1;overflow:hidden;display:flex;flex-direction:column;';
  bodies.forEach(function(b){ contentWrap.appendChild(b); });
  ov.appendChild(contentWrap);

  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);
  loadOpenBattles(bodies[0]);
  bodies[0]._loaded = true;
}

// ── OFFENE BATTLES (Herausforderungen die ich bekommen habe) ──
function loadOpenBattles(el){
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;">Wird geladen...</div>';
  if(!firebase.auth().currentUser){ el.innerHTML='<div style="color:var(--muted);">Einloggen erforderlich.</div>'; return; }
  var uid = firebase.auth().currentUser.uid;

  db.collection('battles')
    .where('challengedId','==',uid)
    .where('status','==','pending')
    .orderBy('createdAt','desc')
    .limit(20)
    .get()
    .then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:36px;margin-bottom:10px;">&#9876;&#65039;</div><div style="font-size:13px;color:var(--muted);">Keine offenen Herausforderungen.</div></div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = buildBattleCard(doc.id, d, 'pending', uid);
        el.appendChild(card);
      });
      if(window.caliMotion) caliMotion.stagger(el);
    }).catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>'; });
}

// ── MEINE BATTLES ─────────────────────────────────────────
function loadMyBattles(el){
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;">Wird geladen...</div>';
  if(!firebase.auth().currentUser){ el.innerHTML='<div style="color:var(--muted);">Einloggen erforderlich.</div>'; return; }
  var uid = firebase.auth().currentUser.uid;

  // Alle Battles wo ich beteiligt bin
  db.collection('battles')
    .where('challengerId','==',uid)
    .orderBy('createdAt','desc')
    .limit(30)
    .get()
    .then(function(snap1){
      var battles = [];
      snap1.forEach(function(doc){ battles.push({id:doc.id, data:doc.data()}); });
      return db.collection('battles').where('challengedId','==',uid).orderBy('createdAt','desc').limit(30).get()
        .then(function(snap2){
          snap2.forEach(function(doc){ battles.push({id:doc.id, data:doc.data()}); });
          battles.sort(function(a,b){ return (b.data.createdAt||0)-(a.data.createdAt||0); });
          el.innerHTML = '';
          if(battles.length===0){
            el.innerHTML='<div style="text-align:center;padding:40px;color:var(--muted);">Noch keine Battles.</div>'; return;
          }
          battles.forEach(function(b){
            var card = buildBattleCard(b.id, b.data, b.data.status, uid);
            el.appendChild(card);
          });
          if(window.caliMotion) caliMotion.stagger(el);
          maybeAwardBattleWins(battles, uid);
        });
    }).catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>'; });
}

// ── BATTLE-SIEG XP (idempotent, läuft nur auf dem Gerät des Gewinners) ──
function maybeAwardBattleWins(battles, uid){
  if(typeof calcBattleXP !== 'function' || typeof awardXP !== 'function') return;
  battles.forEach(function(b){
    var d = b.data;
    if(!d || d.status !== 'completed' || d.winnerId !== uid || d.xpAwardedTo) return;
    var ref = db.collection('battles').doc(b.id);
    db.runTransaction(function(tx){
      return tx.get(ref).then(function(doc){
        if(!doc.exists) return false;
        var fd = doc.data();
        if(fd.status === 'completed' && fd.winnerId === uid && !fd.xpAwardedTo){
          tx.update(ref, {xpAwardedTo: uid});
          return true;
        }
        return false;
      });
    }).then(function(shouldAward){
      if(!shouldAward) return;
      var oppId = d.challengerId === uid ? d.challengedId : d.challengerId;
      var oppName = d.challengerId === uid ? (d.challengedName||'Gegner') : (d.challengerName||'Gegner');
      db.collection('xp').doc(uid).get().then(function(xdoc){
        var myLv = xdoc.exists ? (xdoc.data().level||1) : 1;
        db.collection('xp').doc(oppId).get().then(function(xdoc2){
          var oppLv = xdoc2.exists ? (xdoc2.data().level||1) : 1;
          var xpWon = calcBattleXP(myLv, oppLv, true);
          awardXP(xpWon, '⚔️ Battle gewonnen (Level '+oppLv+' Gegner)');
          showBattleVictory(oppName, xpWon);
        }).catch(function(){});
      }).catch(function(){});
    }).catch(function(){});
  });
}

// ── SIEG-OVERLAY ──────────────────────────────────────────
function showBattleVictory(oppName, xpWon){
  var old = document.getElementById('battle-victory-ov'); if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'battle-victory-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px;';
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--bg2);border-radius:24px;box-shadow:0 12px 30px rgba(0,0,0,0.10);padding:32px 24px;max-width:320px;width:100%;text-align:center;';
  var trophy = document.createElement('div');
  trophy.style.cssText = 'font-size:44px;margin-bottom:12px;';
  trophy.textContent = '🏆';
  var hd = document.createElement('div');
  hd.style.cssText = 'font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;';
  hd.textContent = 'Battle gewonnen!';
  var sub = document.createElement('div');
  sub.style.cssText = 'font-size:13px;color:var(--muted);margin-bottom:16px;';
  sub.textContent = 'Gegen ' + oppName;
  var xpEl = document.createElement('div');
  xpEl.className = 'num';
  xpEl.style.cssText = 'font-size:28px;font-weight:800;color:var(--accent-ink);margin-bottom:20px;';
  xpEl.textContent = '+' + xpWon + ' XP';
  var okBtn = document.createElement('button');
  okBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:14px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
  okBtn.classList.add('pressable');
  okBtn.textContent = 'Stark!';
  okBtn.onclick = function(){ ov.remove(); };
  card.appendChild(trophy); card.appendChild(hd); card.appendChild(sub); card.appendChild(xpEl); card.appendChild(okBtn);
  ov.appendChild(card);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion){
    caliMotion.overlayIn(ov);
    caliMotion.celebrate('burst');
    caliMotion.countUp(xpEl, xpWon, {duration:800, prefix:'+', suffix:' XP'});
  }
}

// ── BATTLE CARD ───────────────────────────────────────────
function buildBattleCard(battleId, d, status, myUid){
  var card = document.createElement('div');
  var isChallenger = d.challengerId === myUid;
  var opponentName = isChallenger ? (d.challengedName||'Gegner') : (d.challengerName||'Herausforderer');
  // Ink-Varianten (Text auf hellem Tint — AA-Kontrast): amber/blue/success/red
  var statusColors = {pending:'#B45309', active:'#0369A1', completed:'#0F7A3F', declined:'#D93036'};
  var statusLabels = {pending:'Offen', active:'Läuft', completed:'Beendet', declined:'Abgelehnt'};
  var statusColor = statusColors[status]||'#6E6759';

  card.style.cssText = 'background:var(--bg2);border-radius:20px;padding:14px;box-shadow:0 8px 20px rgba(0,0,0,0.05);';
  card.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">'+
      '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0;">'+
        '<div style="font-size:28px;flex-shrink:0;">&#9876;&#65039;</div>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-size:14px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+opponentName+'</div>'+
          '<div style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.parkName||'Unbekannter Park')+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;flex-shrink:0;background:'+statusColor+'22;color:'+statusColor+';">'+statusLabels[status]+'</div>'+
    '</div>';

  // Actions
  var actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:8px;';

  if(status === 'pending' && !isChallenger){
    // Herausgeforderter kann annehmen oder ablehnen
    var acceptBtn = document.createElement('button');
    acceptBtn.style.cssText = 'flex:1;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:11px;min-height:44px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
    acceptBtn.classList.add('pressable');
    acceptBtn.textContent = '⚔️ Annehmen';
    acceptBtn.onclick = function(){ acceptBattle(battleId, d); };

    var declineBtn = document.createElement('button');
    declineBtn.style.cssText = 'flex:1;background:none;border:1px solid var(--border);border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:11px;min-height:44px;cursor:pointer;color:var(--muted);transition:transform var(--dur-fast) var(--ease-out);';
    declineBtn.classList.add('pressable');
    declineBtn.textContent = 'Ablehnen';
    declineBtn.onclick = function(){ declineBattle(battleId); card.remove(); };
    actions.appendChild(acceptBtn); actions.appendChild(declineBtn);
  } else if(status === 'active'){
    var goBtn = document.createElement('button');
    goBtn.style.cssText = 'flex:1;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:11px;min-height:44px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
    goBtn.classList.add('pressable');
    goBtn.textContent = '▶ Battle fortsetzen';
    goBtn.onclick = function(){ openActiveBattle(battleId, d, myUid); };
    actions.appendChild(goBtn);
  } else if(status === 'completed'){
    var winner = d.winnerId === myUid ? '&#127942; Du hast gewonnen!' : '&#128577; '+opponentName+' hat gewonnen';
    var resultEl = document.createElement('div');
    resultEl.style.cssText = 'font-size:13px;font-weight:700;color:'+(d.winnerId===myUid?'var(--accent-ink)':'var(--muted)')+';padding:8px 0;';
    resultEl.innerHTML = winner;
    actions.appendChild(resultEl);
  }

  card.appendChild(actions);
  return card;
}

// ── JEMANDEN HERAUSFORDERN ────────────────────────────────
function openChallengeSomeone(parentOv){
  if(!firebase.auth().currentUser){ if(typeof toast==='function') toast('Einloggen erforderlich!'); else alert('Einloggen erforderlich!'); return; }
  if(!userLat || !userLng){ if(typeof toast==='function') toast('Bitte zuerst Standort aktivieren!'); else alert('Bitte zuerst Standort aktivieren!'); return; }

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 40px;max-height:90vh;overflow-y:auto;';
  box.classList.add('sheet-scroll');
  box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 16px;"></div>'+
    '<div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:4px;">Jemanden herausfordern</div>'+
    '<div style="font-size:12px;color:var(--muted);margin-bottom:20px;">Gib den Namen oder die E-Mail deines Gegners ein</div>';

  // Search input
  var searchWrap = document.createElement('div');
  searchWrap.style.cssText = 'margin-bottom:16px;';
  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Name suchen...';
  searchInput.style.cssText = 'width:100%;padding:11px 14px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:#fff;color:var(--text);box-sizing:border-box;';
  var resultsList = document.createElement('div');
  resultsList.style.cssText = 'margin-top:8px;';

  searchInput.oninput = function(){
    var q = this.value.trim().toLowerCase();
    if(q.length < 2){ resultsList.innerHTML=''; return; }
    resultsList.innerHTML = '<div style="color:var(--muted);font-size:12px;">&#9203; Suche...</div>';
    db.collection('users').limit(100).get().then(function(snap){
      resultsList.innerHTML = '';
      var matches = [];
      snap.forEach(function(doc){
        var d = doc.data();
        var name = (d.prData&&d.prData.name||'').toLowerCase();
        if(name.includes(q) && doc.id !== firebase.auth().currentUser.uid){
          matches.push({uid:doc.id, name:d.prData&&d.prData.name||'Anonym'});
        }
      });
      if(matches.length===0){ resultsList.innerHTML='<div style="color:var(--muted);font-size:12px;">Niemanden gefunden.</div>'; return; }
      matches.slice(0,5).forEach(function(u){
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px;border-radius:16px;background:var(--bg2);margin-bottom:6px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,0.05);';
        row.innerHTML = '<div style="font-weight:700;color:var(--text);">'+u.name+'</div>';
        var selectBtn = document.createElement('button');
        selectBtn.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;min-height:36px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
        selectBtn.classList.add('pressable');
        selectBtn.textContent = 'Auswählen';
        selectBtn.onclick = function(){ ov.remove(); openChallengeSetup(u, parentOv); };
        row.appendChild(selectBtn);
        resultsList.appendChild(row);
      });
    });
  };

  searchWrap.appendChild(searchInput);
  searchWrap.appendChild(resultsList);
  box.appendChild(searchWrap);

  var cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:10px;cursor:pointer;';
  cancelBtn.textContent = 'Abbrechen';
  cancelBtn.classList.add('pressable');
  cancelBtn.onclick = function(){ ov.remove(); };
  box.appendChild(cancelBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}

// ── CHALLENGE SETUP (Übungen wählen) ─────────────────────
function openChallengeSetup(opponent, parentOv){
  var myUser = firebase.auth().currentUser;
  var myName = (typeof prData !== 'undefined' && prData && prData.name) ? prData.name : 'Ich';

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.classList.add('pressable');
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  topBar.innerHTML = '';
  topBar.appendChild(backBtn);
  var ttl = document.createElement('div');
  ttl.style.cssText = 'flex:1;font-size:17px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  ttl.innerHTML = '&#9876;&#65039; vs <span style="color:var(--accent-ink);">'+opponent.name+'</span>';
  topBar.appendChild(ttl);
  ov.appendChild(topBar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:20px 20px 40px;';
  content.classList.add('sheet-scroll');

  // Info
  var info = document.createElement('div');
  info.style.cssText = 'background:rgba(255,85,0,0.08);border:1px solid rgba(255,85,0,0.2);border-radius:16px;padding:14px;margin-bottom:20px;font-size:12px;color:var(--muted);line-height:1.6;';
  info.innerHTML = '&#128204; <strong style="color:var(--text);">Spielregeln:</strong><br>Du wählst 2 Übungen, '+opponent.name+' wählt 2 Übungen.<br>Reihenfolge: Du→Gegner→Gegner→Du.<br>Beide müssen im Park sein (GPS).';
  content.appendChild(info);

  var myChoices = [];
  var exercises = getBattleExercises();

  var label = document.createElement('h2');
  label.className = 'stitle';
  label.style.cssText = 'margin:0 0 12px;';
  label.textContent = 'Deine 2 Übungen wählen';
  content.appendChild(label);

  var selCount = document.createElement('div');
  selCount.style.cssText = 'font-size:12px;color:var(--muted);margin-bottom:10px;';
  selCount.textContent = '0 / 2 gewählt';

  var exGrid = document.createElement('div');
  exGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;';

  exercises.forEach(function(ex){
    var btn = document.createElement('button');
    btn.dataset.exId = ex.id;
    btn.style.cssText = 'padding:10px;min-height:44px;border-radius:10px;border:1px solid var(--border);background:var(--bg2);font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;color:var(--text);text-align:left;line-height:1.3;transition:transform var(--dur-fast) var(--ease-out);';
    btn.innerHTML = ex.name+'<div style="font-size:11px;color:var(--muted);">'+ex.unit+'</div>';
    btn.classList.add('pressable');
    btn.onclick = function(){
      var idx = myChoices.findIndex(function(e){ return e.id===ex.id; });
      if(idx !== -1){
        myChoices.splice(idx,1);
        btn.style.borderColor = 'var(--border)';
        btn.style.background = 'none';
        btn.style.color = 'var(--text)';
      } else if(myChoices.length < 2){
        myChoices.push(ex);
        btn.style.borderColor = 'var(--accent)';
        btn.style.background = 'rgba(255,85,0,0.1)';
        btn.style.color = 'var(--accent-ink)';
      }
      selCount.textContent = myChoices.length+' / 2 gewählt';
      sendBtn.disabled = myChoices.length !== 2;
      sendBtn.style.opacity = myChoices.length === 2 ? '1' : '0.4';
    };
    exGrid.appendChild(btn);
  });

  content.appendChild(selCount);
  content.appendChild(exGrid);

  var sendBtn = document.createElement('button');
  sendBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:16px;cursor:pointer;opacity:0.4;transition:transform var(--dur-fast) var(--ease-out);';
  sendBtn.classList.add('pressable');
  sendBtn.textContent = 'Herausforderung senden';
  sendBtn.disabled = true;
  sendBtn.onclick = function(){
    if(myChoices.length !== 2) return;
    sendChallenge(myUser, myName, opponent, myChoices, ov);
  };
  content.appendChild(sendBtn);
  ov.appendChild(content);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);
}

// ── CHALLENGE SENDEN ─────────────────────────────────────
function sendChallenge(myUser, myName, opponent, myExercises, ov){
  var btn = ov.querySelector('button:last-child');
  if(btn){ btn.textContent='Wird gesendet...'; btn.disabled=true; }

  // Finde nächsten Park
  var parkId = null, parkName = null;
  if(typeof parksData !== 'undefined' && parksData.length > 0 && userLat && userLng){
    var nearest = parksData[0];
    parkId = 'park_'+(nearest.id||Math.round(nearest._lat*1000)+'_'+Math.round(nearest._lng*1000));
    parkName = nearest.tags&&(nearest.tags.name||nearest.tags['name:de'])?(nearest.tags.name||nearest.tags['name:de']):'Calisthenics Park';
  }

  var battle = {
    challengerId: myUser.uid,
    challengerName: myName,
    challengedId: opponent.uid,
    challengedName: opponent.name,
    parkId: parkId,
    parkName: parkName,
    challengerExercises: myExercises,
    challengedExercises: null, // Gegner wählt noch
    status: 'pending',
    round: 0,
    scores: {},
    rounds: [],
    createdAt: Date.now(),
    expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 1 Monat
  };

  db.collection('battles').add(battle).then(function(ref){
    // Prüfe ob Gegner Park-King ist
    if(parkId){
      db.collection('parkKings').doc(parkId).get().then(function(kingDoc){
        if(kingDoc.exists && kingDoc.data().uid === opponent.uid){
          // King muss annehmen! Setze Flag
          ref.update({kingChallenge: true});
        }
      });
    }
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
    if(typeof toast === 'function') toast('⚔️ Herausforderung gesendet!');
    else alert('Herausforderung gesendet!');
  }).catch(function(e){ if(typeof toast==='function') toast('Fehler: '+e.message); else alert('Fehler: '+e.message); });
}

// ── BATTLE ANNEHMEN ───────────────────────────────────────
function acceptBattle(battleId, d){
  var myUser = firebase.auth().currentUser;
  if(!myUser) return;

  // Gegner wählt seine 2 Übungen
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.classList.add('pressable');
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  topBar.appendChild(backBtn);
  var ttl = document.createElement('div');
  ttl.style.cssText = 'flex:1;font-size:17px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  ttl.innerHTML = '&#9876;&#65039; vs <span style="color:var(--accent-ink);">'+d.challengerName+'</span>';
  topBar.appendChild(ttl);
  ov.appendChild(topBar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:20px 20px 40px;';
  content.classList.add('sheet-scroll');

  // Gegner-Übungen anzeigen
  var info = document.createElement('div');
  info.style.cssText = 'background:rgba(255,85,0,0.08);border:1px solid rgba(255,85,0,0.2);border-radius:16px;padding:14px;margin-bottom:20px;';
  var chosenEx = (d.challengerExercises||[]).map(function(e){ return e.name; }).join(', ');
  info.innerHTML = '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">'+d.challengerName+' hat gewählt:</div>'+
    '<div style="font-size:14px;font-weight:700;color:var(--text);">'+chosenEx+'</div>';
  content.appendChild(info);

  var myChoices = [];
  var challengerIds = (d.challengerExercises||[]).map(function(e){ return e.id; });
  var exercises = getBattleExercises().filter(function(e){ return !challengerIds.includes(e.id); });

  var label = document.createElement('h2');
  label.className = 'stitle';
  label.style.cssText = 'margin:0 0 12px;';
  label.textContent = 'Deine 2 Übungen wählen (keine Dopplungen)';
  content.appendChild(label);

  var selCount = document.createElement('div');
  selCount.style.cssText = 'font-size:12px;color:var(--muted);margin-bottom:10px;';
  selCount.textContent = '0 / 2 gewählt';

  var exGrid = document.createElement('div');
  exGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;';

  exercises.forEach(function(ex){
    var btn = document.createElement('button');
    btn.dataset.exId = ex.id;
    btn.style.cssText = 'padding:10px;min-height:44px;border-radius:10px;border:1px solid var(--border);background:var(--bg2);font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;color:var(--text);text-align:left;line-height:1.3;transition:transform var(--dur-fast) var(--ease-out);';
    btn.innerHTML = ex.name+'<div style="font-size:11px;color:var(--muted);">'+ex.unit+'</div>';
    btn.classList.add('pressable');
    btn.onclick = function(){
      var idx = myChoices.findIndex(function(e){ return e.id===ex.id; });
      if(idx !== -1){
        myChoices.splice(idx,1);
        btn.style.borderColor='var(--border)'; btn.style.background='none'; btn.style.color='var(--text)';
      } else if(myChoices.length < 2){
        myChoices.push(ex);
        btn.style.borderColor='var(--accent)'; btn.style.background='rgba(255,85,0,0.1)'; btn.style.color='var(--accent-ink)';
      }
      selCount.textContent = myChoices.length+' / 2 gewählt';
      confirmBtn.disabled = myChoices.length !== 2;
      confirmBtn.style.opacity = myChoices.length === 2 ? '1' : '0.4';
    };
    exGrid.appendChild(btn);
  });

  content.appendChild(selCount);
  content.appendChild(exGrid);

  var confirmBtn = document.createElement('button');
  confirmBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:16px;cursor:pointer;opacity:0.4;transition:transform var(--dur-fast) var(--ease-out);';
  confirmBtn.classList.add('pressable');
  confirmBtn.textContent = 'Annehmen & starten';
  confirmBtn.disabled = true;
  confirmBtn.onclick = function(){
    if(myChoices.length !== 2) return;
    // Reihenfolge: A1, B1, B2, A2
    var allRounds = [
      {exercise: d.challengerExercises[0], turn: 'challenger'},
      {exercise: myChoices[0], turn: 'challenged'},
      {exercise: myChoices[1], turn: 'challenged'},
      {exercise: d.challengerExercises[1], turn: 'challenger'},
    ];
    db.collection('battles').doc(battleId).update({
      challengedExercises: myChoices,
      status: 'active',
      round: 0,
      roundOrder: allRounds,
      acceptedAt: Date.now(),
    }).then(function(){
      if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
      if(typeof toast==='function') toast('⚔️ Battle gestartet!');
      // Reload open battles
      var openEl = document.querySelector('#battle-ov [style*="flex-direction:column"]');
      if(openEl) loadOpenBattles(openEl);
    });
  };

  content.appendChild(confirmBtn);
  ov.appendChild(content);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);
}

// ── BATTLE ABLEHNEN ───────────────────────────────────────
function declineBattle(battleId){
  db.collection('battles').doc(battleId).update({status:'declined'})
    .then(function(){ if(typeof toast==='function') toast('Herausforderung abgelehnt.'); });
}

// ── AKTIVES BATTLE ────────────────────────────────────────
function openActiveBattle(battleId, d, myUid){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.classList.add('pressable');
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  topBar.appendChild(backBtn);
  var opponentName = d.challengerId===myUid ? d.challengedName : d.challengerName;
  var ttl = document.createElement('div');
  ttl.style.cssText = 'flex:1;font-size:17px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  ttl.innerHTML = '&#9876;&#65039; vs '+opponentName;
  topBar.appendChild(ttl);
  ov.appendChild(topBar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:20px 20px 40px;';
  content.classList.add('sheet-scroll');

  var round = d.round || 0;
  var roundOrder = d.roundOrder || [];
  var currentRound = roundOrder[round];

  if(!currentRound){
    // Battle beendet
    content.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:40px;margin-bottom:12px;">&#127942;</div><div style="font-size:17px;font-weight:700;color:var(--text);">Battle beendet!</div></div>';
    ov.appendChild(content);
    document.body.appendChild(ov);
    // Hardware-Zurück schließt das Overlay statt der App
    if(typeof overlayPush === 'function') overlayPush(ov);
    if(window.caliMotion) caliMotion.overlayIn(ov);
    return;
  }

  var isMyTurn = (currentRound.turn==='challenger' && d.challengerId===myUid) ||
                 (currentRound.turn==='challenged' && d.challengedId===myUid);

  // Scoreboard
  var scoreEl = document.createElement('div');
  scoreEl.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--bg2);border-radius:20px;box-shadow:0 12px 30px rgba(0,0,0,0.06);padding:16px;margin-bottom:16px;';
  var myScore = 0, oppScore = 0;
  (d.rounds||[]).forEach(function(r){
    if(r.winner === myUid) myScore++;
    else if(r.winner && r.winner !== myUid) oppScore++;
  });
  scoreEl.innerHTML =
    '<div style="text-align:center;"><div id="battle-score-me" class="num" style="font-weight:800;font-size:32px;color:var(--accent);line-height:1;">'+myScore+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">Du</div></div>'+
    '<div class="num" style="font-weight:700;font-size:13px;color:var(--muted);flex-shrink:0;">Runde '+(round+1)+' / '+roundOrder.length+'</div>'+
    '<div style="text-align:center;min-width:0;"><div id="battle-score-opp" class="num" style="font-weight:800;font-size:32px;color:var(--text);line-height:1;">'+oppScore+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+opponentName+'</div></div>';
  content.appendChild(scoreEl);

  // Aktuelle Übung
  var exCard = document.createElement('div');
  exCard.style.cssText = 'background:rgba(255,85,0,0.08);border:1px solid rgba(255,85,0,0.3);border-radius:16px;padding:16px;margin-bottom:16px;text-align:center;';
  exCard.innerHTML = '<h2 class="stitle" style="margin:0 0 6px;">Aktuelle Übung</h2>'+
    '<div style="font-size:22px;font-weight:800;color:var(--text);">'+(currentRound.exercise&&currentRound.exercise.name||'')+'</div>'+
    '<div style="font-size:12px;color:var(--muted);">'+(currentRound.exercise&&currentRound.exercise.unit||'')+'</div>';
  content.appendChild(exCard);

  if(isMyTurn){
    // Warte auf vorherige Runde oder mache jetzt
    var prevRound = d.rounds && d.rounds[round];
    if(prevRound && prevRound.pendingConfirm && prevRound.submitterId !== myUid){
      // Ich muss bestätigen
      buildConfirmUI(content, battleId, d, round, myUid, opponentName, prevRound, ov);
    } else if(!prevRound || prevRound.submitterId){
      // Mein Zug — Video aufnehmen
      buildSubmitUI(content, battleId, d, round, myUid, currentRound, ov);
    }
  } else {
    // Warten auf Gegner
    var waitEl = document.createElement('div');
    waitEl.style.cssText = 'text-align:center;padding:30px;';
    waitEl.innerHTML = '<div style="font-size:36px;margin-bottom:12px;">&#9203;</div>'+
      '<div style="font-size:14px;font-weight:700;color:var(--text);">Warte auf '+opponentName+'...</div>'+
      '<div style="font-size:12px;color:var(--muted);margin-top:8px;">'+opponentName+' macht gerade die Übung</div>';
    content.appendChild(waitEl);
  }

  ov.appendChild(content);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion){
    caliMotion.overlayIn(ov);
    var msEl = document.getElementById('battle-score-me');
    var osEl = document.getElementById('battle-score-opp');
    if(msEl) caliMotion.countUp(msEl, myScore, {duration:600});
    if(osEl) caliMotion.countUp(osEl, oppScore, {duration:600});
  }
}

// ── ERGEBNIS EINREICHEN ───────────────────────────────────
function buildSubmitUI(content, battleId, d, roundIdx, myUid, currentRound, ov){
  var submitSection = document.createElement('div');

  var label = document.createElement('h2');
  label.className = 'stitle';
  label.style.cssText = 'margin:0 0 12px;';
  label.textContent = 'Dein Ergebnis einreichen';
  submitSection.appendChild(label);

  // Wdh eingeben
  var valInput = document.createElement('input');
  valInput.type = 'number'; valInput.min = '1';
  valInput.placeholder = 'Wiederholungen / Sekunden';
  valInput.className = 'num';
  valInput.style.cssText = 'width:100%;padding:14px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:18px;font-weight:800;text-align:center;background:var(--bg3);color:var(--text);margin-bottom:12px;box-sizing:border-box;';
  submitSection.appendChild(valInput);

  // Video aufnehmen
  var videoBlob = null;
  var mediaRecorder = null;
  var recordedChunks = [];
  var stream = null;
  var isRecording = false;

  var camWrap = document.createElement('div');
  camWrap.style.cssText = 'border-radius:16px;overflow:hidden;background:#000;margin-bottom:10px;min-height:160px;display:flex;align-items:center;justify-content:center;';
  var preview = document.createElement('video');
  preview.style.cssText = 'width:100%;max-height:240px;display:none;';
  preview.autoplay = true; preview.muted = true; preview.playsinline = true;
  var resultVid = document.createElement('video');
  resultVid.style.cssText = 'width:100%;max-height:240px;display:none;';
  resultVid.controls = true; resultVid.playsinline = true;
  var camPlaceholder = document.createElement('div');
  camPlaceholder.style.cssText = 'color:#fff;font-size:12px;text-align:center;padding:16px;';
  camPlaceholder.innerHTML = '&#128247;<br>Video aufnehmen (Pflicht)';
  camWrap.appendChild(preview); camWrap.appendChild(resultVid); camWrap.appendChild(camPlaceholder);
  submitSection.appendChild(camWrap);

  var camRow = document.createElement('div');
  camRow.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;';
  var startCamBtn = document.createElement('button');
  startCamBtn.style.cssText = 'flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:12px;min-height:44px;cursor:pointer;color:var(--text);transition:transform var(--dur-fast) var(--ease-out);';
  startCamBtn.textContent = '📷 Kamera';
  startCamBtn.classList.add('pressable');
  var recBtn = document.createElement('button');
  recBtn.style.cssText = 'flex:1;background:var(--red);border:none;border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:12px;min-height:44px;cursor:pointer;color:#fff;display:none;transition:transform var(--dur-fast) var(--ease-out);';
  recBtn.textContent = '⏺ Aufnehmen';
  recBtn.classList.add('pressable');

  startCamBtn.onclick = function(){
    navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false}).then(function(s){
      stream=s; preview.srcObject=s; preview.style.display='block'; camPlaceholder.style.display='none';
      startCamBtn.style.display='none'; recBtn.style.display='block';
    }).catch(function(e){ if(typeof toast==='function') toast('Kamera: '+e.message); else alert('Kamera: '+e.message); });
  };

  recBtn.onclick = function(){
    if(!isRecording){
      recordedChunks=[];
      try{ mediaRecorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'}); }
      catch(e){ mediaRecorder=new MediaRecorder(stream); }
      mediaRecorder.ondataavailable=function(e){ if(e.data.size>0) recordedChunks.push(e.data); };
      mediaRecorder.onstop=function(){
        videoBlob=new Blob(recordedChunks,{type:'video/webm'});
        var url=URL.createObjectURL(videoBlob);
        resultVid.src=url; resultVid.style.display='block'; preview.style.display='none';
        recBtn.textContent='🔄 Neu aufnehmen';
        submitBtn.disabled=false; submitBtn.style.opacity='1';
        if(stream) stream.getTracks().forEach(function(t){t.stop();});
      };
      mediaRecorder.start(); isRecording=true;
      recBtn.textContent='⏹ Stoppen'; recBtn.style.background='var(--red)';
    } else {
      mediaRecorder.stop(); isRecording=false;
    }
  };

  camRow.appendChild(startCamBtn); camRow.appendChild(recBtn);
  submitSection.appendChild(camRow);

  var submitBtn = document.createElement('button');
  submitBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:16px;cursor:pointer;opacity:0.4;transition:transform var(--dur-fast) var(--ease-out);';
  submitBtn.classList.add('pressable');
  submitBtn.textContent = 'Ergebnis einreichen';
  submitBtn.disabled = true;
  submitBtn.onclick = function(){
    var val = parseInt(valInput.value);
    if(!val||val<1){ if(typeof toast==='function') toast('Bitte Ergebnis eingeben!'); else alert('Bitte Ergebnis eingeben!'); return; }
    if(!videoBlob){ if(typeof toast==='function') toast('Video erforderlich!'); else alert('Video erforderlich!'); return; }
    submitBtn.textContent='Wird hochgeladen...'; submitBtn.disabled=true;
    var fileName='battles/'+battleId+'_round'+roundIdx+'_'+myUid+'_'+Date.now()+'.webm';
    firebase.storage().ref(fileName).put(videoBlob).then(function(snap){
      return snap.ref.getDownloadURL();
    }).then(function(videoUrl){
      var roundData = {
        roundIndex: roundIdx,
        submitterId: myUid,
        value: val,
        videoUrl: videoUrl,
        pendingConfirm: true,
        confirmedBy: null,
        winner: null,
      };
      var rounds = d.rounds || [];
      rounds[roundIdx] = roundData;
      return db.collection('battles').doc(battleId).update({
        rounds: rounds,
        round: roundIdx, // Gegner muss jetzt bestätigen
      });
    }).then(function(){
      if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
      if(typeof toast==='function') toast('⚔️ Ergebnis eingereicht!');
    }).catch(function(e){ if(typeof toast==='function') toast('Fehler: '+e.message); else alert('Fehler: '+e.message); submitBtn.disabled=false; submitBtn.textContent='Ergebnis einreichen'; });
  };
  submitSection.appendChild(submitBtn);
  content.appendChild(submitSection);
}

// ── ERGEBNIS BESTÄTIGEN ───────────────────────────────────
function buildConfirmUI(content, battleId, d, roundIdx, myUid, opponentName, roundData, ov){
  var confirmSection = document.createElement('div');

  var label = document.createElement('h2');
  label.className = 'stitle';
  label.style.cssText = 'margin:0 0 12px;';
  label.textContent = 'Ergebnis bestätigen';
  confirmSection.appendChild(label);

  var resultCard = document.createElement('div');
  resultCard.style.cssText = 'background:var(--bg2);border-radius:20px;box-shadow:0 12px 30px rgba(0,0,0,0.06);padding:16px;margin-bottom:14px;text-align:center;';
  resultCard.innerHTML = '<div style="font-size:13px;color:var(--muted);margin-bottom:6px;">'+opponentName+' behauptet:</div>'+
    '<div class="num" style="font-weight:800;font-size:32px;color:var(--accent);line-height:1;">'+roundData.value+'</div>'+
    '<div style="font-size:12px;color:var(--muted);">'+(d.roundOrder&&d.roundOrder[roundIdx]&&d.roundOrder[roundIdx].exercise&&d.roundOrder[roundIdx].exercise.unit||'Wdh')+'</div>';
  confirmSection.appendChild(resultCard);
  if(window.caliMotion){
    var claimEl = resultCard.querySelector('.num');
    if(claimEl) caliMotion.countUp(claimEl, roundData.value, {duration:600});
  }

  if(roundData.videoUrl){
    var vidBtn = document.createElement('button');
    vidBtn.style.cssText = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:13px;min-height:44px;cursor:pointer;color:var(--text);transition:transform var(--dur-fast) var(--ease-out);margin-bottom:12px;';
    vidBtn.classList.add('pressable');
    vidBtn.innerHTML = '&#9654;&#65039; Video ansehen';
    vidBtn.onclick = function(){ playVideo(roundData.videoUrl); };
    confirmSection.appendChild(vidBtn);
  }

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;';

  var confirmBtn = document.createElement('button');
  confirmBtn.style.cssText = 'flex:1;background:var(--success-ink);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:13px;min-height:44px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
  confirmBtn.classList.add('pressable');
  confirmBtn.innerHTML = '&#10003; Bestätigen';
  confirmBtn.onclick = function(){
    confirmRoundResult(battleId, d, roundIdx, myUid, true, roundData.value, ov);
  };

  var disputeBtn = document.createElement('button');
  disputeBtn.style.cssText = 'flex:1;background:var(--red);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:13px;min-height:44px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
  disputeBtn.classList.add('pressable');
  disputeBtn.innerHTML = '&#10007; Anfechten';
  disputeBtn.onclick = function(){
    var doDispute = function(){ confirmRoundResult(battleId, d, roundIdx, myUid, false, roundData.value, ov); };
    if(typeof confirmSheet === 'function'){
      confirmSheet({
        title: 'Ergebnis anfechten?',
        desc: 'Ein Admin prüft das Video und entscheidet über die Runde.',
        confirmLabel: 'Anfechten',
        cancelLabel: 'Abbrechen',
        onConfirm: doDispute
      });
    } else if(confirm('Ergebnis anfechten? Admin wird das Video prüfen.')){
      doDispute();
    }
  };

  btnRow.appendChild(confirmBtn); btnRow.appendChild(disputeBtn);
  confirmSection.appendChild(btnRow);
  content.appendChild(confirmSection);
}

// ── RUNDE BESTÄTIGEN ─────────────────────────────────────
function confirmRoundResult(battleId, d, roundIdx, myUid, confirmed, value, ov){
  var rounds = d.rounds || [];
  var currentRoundOrder = d.roundOrder || [];
  var currentRound = rounds[roundIdx] || {};
  var submitterId = currentRound.submitterId;

  if(confirmed){
    // Gewinner dieser Runde = Einreicher (hat die Wdh gemacht)
    rounds[roundIdx] = Object.assign({}, currentRound, {
      pendingConfirm: false,
      confirmedBy: myUid,
      winner: submitterId,
    });
  } else {
    // Dispute → Admin entscheidet
    rounds[roundIdx] = Object.assign({}, currentRound, {
      pendingConfirm: false,
      disputed: true,
      disputedBy: myUid,
    });
  }

  var nextRound = roundIdx + 1;
  var updates = { rounds: rounds };

  // Prüfe ob alle Runden gespielt
  if(nextRound >= currentRoundOrder.length){
    // Alle Runden fertig → Gewinner ermitteln
    var scores = {};
    rounds.forEach(function(r){
      if(r.winner){ scores[r.winner] = (scores[r.winner]||0)+1; }
    });
    var winnerId = null;
    var maxScore = 0;
    Object.keys(scores).forEach(function(uid){
      if(scores[uid] > maxScore){ maxScore=scores[uid]; winnerId=uid; }
    });
    var tie = Object.values(scores).filter(function(s){ return s===maxScore; }).length > 1;

    if(tie){
      // Tiebreaker!
      var allUsedIds = (d.challengerExercises||[]).concat(d.challengedExercises||[]).map(function(e){ return e.id; });
      var available = getBattleExercises().filter(function(e){ return !allUsedIds.includes(e.id); });
      var tiebreakerEx = available[Math.floor(Math.random()*available.length)];
      updates.status = 'tiebreaker';
      updates.tiebreakerExercise = tiebreakerEx;
      updates.round = nextRound;
      if(typeof toast==='function') toast('🎲 Gleichstand! Tiebreaker-Übung: '+tiebreakerEx.name);
    } else {
      updates.status = 'completed';
      updates.winnerId = winnerId;
      updates.completedAt = Date.now();
      updates.scores = scores;
      // XP vergibt jetzt das Gerät des Gewinners (maybeAwardBattleWins in loadMyBattles) —
      // idempotent über das xpAwardedTo-Flag, damit der Sieger sein XP sicher bekommt.
      // King-Update
      updateParkKingAfterBattle(d, winnerId);
    }
  } else {
    updates.round = nextRound;
  }

  db.collection('battles').doc(battleId).update(updates).then(function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
    if(typeof toast==='function') toast(confirmed?'✓ Bestätigt!':'⚠️ Angefochten — Admin prüft');
  }).catch(function(e){ if(typeof toast==='function') toast('Fehler: '+e.message); else alert('Fehler: '+e.message); });
}

// ── PARK KING UPDATE ──────────────────────────────────────
function updateParkKingAfterBattle(battleData, winnerId){
  if(!battleData.parkId) return;
  var winnerName = winnerId===battleData.challengerId ? battleData.challengerName : battleData.challengedName;
  db.collection('parkKings').doc(battleData.parkId).set({
    uid: winnerId,
    name: winnerName,
    parkName: battleData.parkName,
    since: Date.now(),
    defenses: 0,
  }, {merge:true}).then(function(){
    // Increment defenses if same king
    db.collection('parkKings').doc(battleData.parkId).get().then(function(doc){
      if(doc.exists && doc.data().uid === winnerId){
        db.collection('parkKings').doc(battleData.parkId).update({defenses: (doc.data().defenses||0)+1});
      }
    });
  });
}

// ── PARK KINGS LISTE ──────────────────────────────────────
function loadParkKings(el){
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;">Wird geladen...</div>';
  db.collection('parkKings').limit(50).get().then(function(snap){
    el.innerHTML = '';
    if(snap.empty){
      el.innerHTML='<div style="text-align:center;padding:40px;"><div style="font-size:36px;margin-bottom:10px;">&#128081;</div><div style="font-size:13px;color:var(--muted);">Noch keine Park Kings.<br>Trainiere in einem Park um King zu werden!</div></div>';
      return;
    }
    var label = document.createElement('h2');
    label.className = 'stitle';
    label.style.cssText = 'margin:0 0 12px;';
    label.textContent = 'Park Kings';
    el.appendChild(label);
    snap.forEach(function(doc){
      var d = doc.data();
      var isMe = firebase.auth().currentUser && d.uid===firebase.auth().currentUser.uid;
      var card = document.createElement('div');
      card.style.cssText = 'background:'+(isMe?'rgba(255,85,0,0.08)':'var(--bg2)')+';border-radius:20px;padding:14px;margin-bottom:10px;box-shadow:0 8px 20px rgba(0,0,0,0.05);'+(isMe?'border:1px solid var(--accent);':'')+'display:flex;align-items:center;gap:12px;';
      card.innerHTML =
        '<div style="font-size:28px;flex-shrink:0;">&#128081;</div>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-size:14px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.name||'Anonym')+(isMe?' <span style="font-size:11px;font-weight:700;color:var(--accent-ink);background:rgba(255,85,0,0.12);border-radius:20px;padding:1px 8px;">Du</span>':'')+'</div>'+
          '<div style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.parkName||doc.id)+'</div>'+
        '</div>'+
        '<div style="text-align:right;flex-shrink:0;"><div class="num" style="font-weight:800;font-size:22px;color:var(--accent-ink);">'+(d.defenses||0)+'</div><div style="font-size:11px;color:var(--muted);">Siege</div></div>';
      el.appendChild(card);
    });
    if(window.caliMotion) caliMotion.stagger(el);
  }).catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>'; });
}

// ── AUTO-KING BEIM ERSTEN PARK-BESUCH ────────────────────
function checkAndSetParkKing(parkId, parkName){
  if(!firebase.auth().currentUser || !parkId) return;
  var uid = firebase.auth().currentUser.uid;
  var myName = (typeof prData!=='undefined'&&prData&&prData.name)?prData.name:'Anonym';
  db.collection('parkKings').doc(parkId).get().then(function(doc){
    if(!doc.exists){
      db.collection('parkKings').doc(parkId).set({
        uid: uid, name: myName, parkName: parkName,
        since: Date.now(), defenses: 0,
      });
      if(typeof toast==='function') toast('👑 Du bist jetzt King von '+parkName+'!');
    }
  });
}
