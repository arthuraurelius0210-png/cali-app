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
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9950;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;font-size:17px;font-weight:800;color:var(--text);';
  titleEl.innerHTML = '&#9876;&#65039; BATTLES';
  var newBtn = document.createElement('button');
  newBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 14px;cursor:pointer;';
  newBtn.textContent = '+ CHALLENGE';
  newBtn.onclick = function(){ openChallengeSomeone(ov); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(newBtn);
  ov.appendChild(topBar);

  // Tabs
  var tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;border-bottom:1px solid var(--border);flex-shrink:0;';
  var tabs = ['OFFEN','MEINE BATTLES','PARK KINGS'];
  var bodies = [];
  tabs.forEach(function(t, ti){
    var tb = document.createElement('button');
    tb.style.cssText = 'flex:1;padding:12px 4px;font-family:inherit;font-size:9px;letter-spacing:1.5px;font-weight:700;border:none;cursor:pointer;border-bottom:2px solid '+(ti===0?'var(--accent)':'transparent')+';background:none;color:'+(ti===0?'var(--accent)':'var(--muted)')+';';
    tb.textContent = t;
    var body = document.createElement('div');
    body.style.cssText = 'display:'+(ti===0?'flex':'none')+';flex-direction:column;padding:16px;gap:10px;overflow-y:auto;flex:1;';
    bodies.push(body);
    tb.onclick = (function(tIdx){
      return function(){
        tabBar.querySelectorAll('button').forEach(function(b,bi){
          b.style.borderBottomColor = bi===tIdx?'var(--accent)':'transparent';
          b.style.color = bi===tIdx?'var(--accent)':'var(--muted)';
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
  loadOpenBattles(bodies[0]);
  bodies[0]._loaded = true;
}

// ── OFFENE BATTLES (Herausforderungen die ich bekommen habe) ──
function loadOpenBattles(el){
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;">&#9203; Lade...</div>';
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
    }).catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>'; });
}

// ── MEINE BATTLES ─────────────────────────────────────────
function loadMyBattles(el){
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;">&#9203; Lade...</div>';
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
        });
    }).catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>'; });
}

// ── BATTLE CARD ───────────────────────────────────────────
function buildBattleCard(battleId, d, status, myUid){
  var card = document.createElement('div');
  var isChallenger = d.challengerId === myUid;
  var opponentName = isChallenger ? (d.challengedName||'Gegner') : (d.challengerName||'Herausforderer');
  var statusColors = {pending:'#f59e0b', active:'#3b82f6', completed:'#22c55e', declined:'#ef4444'};
  var statusLabels = {pending:'Offen', active:'Läuft', completed:'Beendet', declined:'Abgelehnt'};
  var statusColor = statusColors[status]||'#999';

  card.style.cssText = 'background:var(--bg2);border-radius:14px;padding:14px;border:1.5px solid var(--border);';
  card.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">'+
      '<div style="display:flex;align-items:center;gap:10px;">'+
        '<div style="font-size:28px;">&#9876;&#65039;</div>'+
        '<div>'+
          '<div style="font-size:14px;font-weight:800;color:var(--text);">'+opponentName+'</div>'+
          '<div style="font-size:10px;color:var(--muted);">'+(d.parkName||'Unbekannter Park')+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;background:'+statusColor+'22;color:'+statusColor+';">'+statusLabels[status]+'</div>'+
    '</div>';

  // Actions
  var actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:8px;';

  if(status === 'pending' && !isChallenger){
    // Herausgeforderter kann annehmen oder ablehnen
    var acceptBtn = document.createElement('button');
    acceptBtn.style.cssText = 'flex:1;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:11px;cursor:pointer;';
    acceptBtn.textContent = '&#9876; Annehmen';
    acceptBtn.onclick = function(){ acceptBattle(battleId, d); };

    var declineBtn = document.createElement('button');
    declineBtn.style.cssText = 'flex:1;background:none;border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:11px;cursor:pointer;color:var(--muted);';
    declineBtn.textContent = 'Ablehnen';
    declineBtn.onclick = function(){ declineBattle(battleId); card.remove(); };
    actions.appendChild(acceptBtn); actions.appendChild(declineBtn);
  } else if(status === 'active'){
    var goBtn = document.createElement('button');
    goBtn.style.cssText = 'flex:1;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:11px;cursor:pointer;';
    goBtn.textContent = '&#9654; Battle fortsetzen';
    goBtn.onclick = function(){ openActiveBattle(battleId, d, myUid); };
    actions.appendChild(goBtn);
  } else if(status === 'completed'){
    var winner = d.winnerId === myUid ? '&#127942; Du hast gewonnen!' : '&#128577; '+opponentName+' hat gewonnen';
    var resultEl = document.createElement('div');
    resultEl.style.cssText = 'font-size:13px;font-weight:700;color:'+(d.winnerId===myUid?'var(--accent)':'var(--muted)')+';padding:8px 0;';
    resultEl.innerHTML = winner;
    actions.appendChild(resultEl);
  }

  card.appendChild(actions);
  return card;
}

// ── JEMANDEN HERAUSFORDERN ────────────────────────────────
function openChallengeSomeone(parentOv){
  if(!firebase.auth().currentUser){ alert('Einloggen erforderlich!'); return; }
  if(!userLat || !userLng){ alert('Bitte zuerst Standort aktivieren!'); return; }

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 40px;max-height:90vh;overflow-y:auto;';
  box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 16px;"></div>'+
    '<div style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px;">&#9876;&#65039; HERAUSFORDERN</div>'+
    '<div style="font-size:12px;color:var(--muted);margin-bottom:20px;">Gib den Namen oder die E-Mail deines Gegners ein</div>';

  // Search input
  var searchWrap = document.createElement('div');
  searchWrap.style.cssText = 'margin-bottom:16px;';
  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Name suchen...';
  searchInput.style.cssText = 'width:100%;padding:13px;border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:14px;background:var(--bg2);color:var(--text);box-sizing:border-box;';
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
        row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px;border-radius:10px;background:var(--bg2);margin-bottom:6px;cursor:pointer;border:1px solid var(--border);';
        row.innerHTML = '<div style="font-weight:700;color:var(--text);">'+u.name+'</div>';
        var selectBtn = document.createElement('button');
        selectBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;padding:7px 14px;cursor:pointer;';
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
  cancelBtn.onclick = function(){ ov.remove(); };
  box.appendChild(cancelBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
}

// ── CHALLENGE SETUP (Übungen wählen) ─────────────────────
function openChallengeSetup(opponent, parentOv){
  var myUser = firebase.auth().currentUser;
  var myName = (typeof prData !== 'undefined' && prData && prData.name) ? prData.name : 'Ich';

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9999;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592;';
  backBtn.onclick = function(){ ov.remove(); };
  topBar.innerHTML = '';
  topBar.appendChild(backBtn);
  var ttl = document.createElement('div');
  ttl.style.cssText = 'flex:1;font-size:15px;font-weight:800;color:var(--text);';
  ttl.innerHTML = '&#9876;&#65039; vs <span style="color:var(--accent);">'+opponent.name+'</span>';
  topBar.appendChild(ttl);
  ov.appendChild(topBar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';

  // Info
  var info = document.createElement('div');
  info.style.cssText = 'background:rgba(255,85,0,0.08);border:1px solid rgba(255,85,0,0.2);border-radius:12px;padding:14px;margin-bottom:20px;font-size:12px;color:var(--muted);line-height:1.6;';
  info.innerHTML = '&#128204; <strong style="color:var(--text);">Spielregeln:</strong><br>Du wählst 2 Übungen, '+opponent.name+' wählt 2 Übungen.<br>Reihenfolge: Du→Gegner→Gegner→Du.<br>Beide müssen im Park sein (GPS).';
  content.appendChild(info);

  var myChoices = [];
  var exercises = getBattleExercises();

  var label = document.createElement('div');
  label.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:12px;';
  label.textContent = 'DEINE 2 ÜBUNGEN WÄHLEN';
  content.appendChild(label);

  var selCount = document.createElement('div');
  selCount.style.cssText = 'font-size:12px;color:var(--muted);margin-bottom:10px;';
  selCount.textContent = '0 / 2 gewählt';

  var exGrid = document.createElement('div');
  exGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;';

  exercises.forEach(function(ex){
    var btn = document.createElement('button');
    btn.dataset.exId = ex.id;
    btn.style.cssText = 'padding:10px;border-radius:10px;border:1.5px solid var(--border);background:none;font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;color:var(--text);text-align:left;line-height:1.3;';
    btn.innerHTML = ex.name+'<div style="font-size:9px;color:var(--muted);">'+ex.unit+'</div>';
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
        btn.style.color = 'var(--accent)';
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
  sendBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;padding:16px;cursor:pointer;letter-spacing:1px;opacity:0.4;';
  sendBtn.textContent = 'HERAUSFORDERUNG SENDEN';
  sendBtn.disabled = true;
  sendBtn.onclick = function(){
    if(myChoices.length !== 2) return;
    sendChallenge(myUser, myName, opponent, myChoices, ov);
  };
  content.appendChild(sendBtn);
  ov.appendChild(content);
  document.body.appendChild(ov);
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
    ov.remove();
    if(typeof toast === 'function') toast('&#9876;&#65039; Herausforderung gesendet!');
    else alert('Herausforderung gesendet!');
  }).catch(function(e){ alert('Fehler: '+e.message); });
}

// ── BATTLE ANNEHMEN ───────────────────────────────────────
function acceptBattle(battleId, d){
  var myUser = firebase.auth().currentUser;
  if(!myUser) return;

  // Gegner wählt seine 2 Übungen
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9999;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592;';
  backBtn.onclick = function(){ ov.remove(); };
  topBar.appendChild(backBtn);
  var ttl = document.createElement('div');
  ttl.style.cssText = 'flex:1;font-size:15px;font-weight:800;color:var(--text);';
  ttl.innerHTML = '&#9876;&#65039; vs <span style="color:var(--accent);">'+d.challengerName+'</span>';
  topBar.appendChild(ttl);
  ov.appendChild(topBar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';

  // Gegner-Übungen anzeigen
  var info = document.createElement('div');
  info.style.cssText = 'background:rgba(255,85,0,0.08);border:1px solid rgba(255,85,0,0.2);border-radius:12px;padding:14px;margin-bottom:20px;';
  var chosenEx = (d.challengerExercises||[]).map(function(e){ return e.name; }).join(', ');
  info.innerHTML = '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">'+d.challengerName+' hat gewählt:</div>'+
    '<div style="font-size:14px;font-weight:700;color:var(--text);">'+chosenEx+'</div>';
  content.appendChild(info);

  var myChoices = [];
  var challengerIds = (d.challengerExercises||[]).map(function(e){ return e.id; });
  var exercises = getBattleExercises().filter(function(e){ return !challengerIds.includes(e.id); });

  var label = document.createElement('div');
  label.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:12px;';
  label.textContent = 'DEINE 2 ÜBUNGEN WÄHLEN (keine Dopplungen)';
  content.appendChild(label);

  var selCount = document.createElement('div');
  selCount.style.cssText = 'font-size:12px;color:var(--muted);margin-bottom:10px;';
  selCount.textContent = '0 / 2 gewählt';

  var exGrid = document.createElement('div');
  exGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;';

  exercises.forEach(function(ex){
    var btn = document.createElement('button');
    btn.dataset.exId = ex.id;
    btn.style.cssText = 'padding:10px;border-radius:10px;border:1.5px solid var(--border);background:none;font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;color:var(--text);text-align:left;line-height:1.3;';
    btn.innerHTML = ex.name+'<div style="font-size:9px;color:var(--muted);">'+ex.unit+'</div>';
    btn.onclick = function(){
      var idx = myChoices.findIndex(function(e){ return e.id===ex.id; });
      if(idx !== -1){
        myChoices.splice(idx,1);
        btn.style.borderColor='var(--border)'; btn.style.background='none'; btn.style.color='var(--text)';
      } else if(myChoices.length < 2){
        myChoices.push(ex);
        btn.style.borderColor='var(--accent)'; btn.style.background='rgba(255,85,0,0.1)'; btn.style.color='var(--accent)';
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
  confirmBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;padding:16px;cursor:pointer;opacity:0.4;';
  confirmBtn.textContent = 'ANNEHMEN & STARTEN';
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
      ov.remove();
      if(typeof toast==='function') toast('&#9876;&#65039; Battle gestartet!');
      // Reload open battles
      var openEl = document.querySelector('#battle-ov [style*="flex-direction:column"]');
      if(openEl) loadOpenBattles(openEl);
    });
  };

  content.appendChild(confirmBtn);
  ov.appendChild(content);
  document.body.appendChild(ov);
}

// ── BATTLE ABLEHNEN ───────────────────────────────────────
function declineBattle(battleId){
  db.collection('battles').doc(battleId).update({status:'declined'})
    .then(function(){ if(typeof toast==='function') toast('Herausforderung abgelehnt.'); });
}

// ── AKTIVES BATTLE ────────────────────────────────────────
function openActiveBattle(battleId, d, myUid){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9999;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592;';
  backBtn.onclick = function(){ ov.remove(); };
  topBar.appendChild(backBtn);
  var opponentName = d.challengerId===myUid ? d.challengedName : d.challengerName;
  var ttl = document.createElement('div');
  ttl.style.cssText = 'flex:1;font-size:15px;font-weight:800;color:var(--text);';
  ttl.innerHTML = '&#9876;&#65039; vs '+opponentName;
  topBar.appendChild(ttl);
  ov.appendChild(topBar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';

  var round = d.round || 0;
  var roundOrder = d.roundOrder || [];
  var currentRound = roundOrder[round];

  if(!currentRound){
    // Battle beendet
    content.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:40px;margin-bottom:12px;">&#127942;</div><div style="font-size:16px;font-weight:800;color:var(--text);">Battle beendet!</div></div>';
    ov.appendChild(content);
    document.body.appendChild(ov);
    return;
  }

  var isMyTurn = (currentRound.turn==='challenger' && d.challengerId===myUid) ||
                 (currentRound.turn==='challenged' && d.challengedId===myUid);

  // Scoreboard
  var scoreEl = document.createElement('div');
  scoreEl.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border-radius:14px;padding:16px;margin-bottom:16px;';
  var myScore = 0, oppScore = 0;
  (d.rounds||[]).forEach(function(r){
    if(r.winner === myUid) myScore++;
    else if(r.winner && r.winner !== myUid) oppScore++;
  });
  scoreEl.innerHTML =
    '<div style="text-align:center;"><div style="font-size:28px;font-weight:800;color:var(--accent);">'+myScore+'</div><div style="font-size:10px;color:var(--muted);">Du</div></div>'+
    '<div style="font-size:14px;font-weight:700;color:var(--muted);">RUNDE '+(round+1)+' / '+roundOrder.length+'</div>'+
    '<div style="text-align:center;"><div style="font-size:28px;font-weight:800;color:var(--text);">'+oppScore+'</div><div style="font-size:10px;color:var(--muted);">'+opponentName+'</div></div>';
  content.appendChild(scoreEl);

  // Aktuelle Übung
  var exCard = document.createElement('div');
  exCard.style.cssText = 'background:rgba(255,85,0,0.08);border:1.5px solid rgba(255,85,0,0.3);border-radius:14px;padding:16px;margin-bottom:16px;text-align:center;';
  exCard.innerHTML = '<div style="font-size:10px;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:6px;">AKTUELLE ÜBUNG</div>'+
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
}

// ── ERGEBNIS EINREICHEN ───────────────────────────────────
function buildSubmitUI(content, battleId, d, roundIdx, myUid, currentRound, ov){
  var submitSection = document.createElement('div');

  var label = document.createElement('div');
  label.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:12px;';
  label.textContent = 'DEIN ERGEBNIS EINREICHEN';
  submitSection.appendChild(label);

  // Wdh eingeben
  var valInput = document.createElement('input');
  valInput.type = 'number'; valInput.min = '1';
  valInput.placeholder = 'Wiederholungen / Sekunden';
  valInput.style.cssText = 'width:100%;padding:14px;border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:18px;font-weight:800;text-align:center;background:var(--bg2);color:var(--text);margin-bottom:12px;box-sizing:border-box;';
  submitSection.appendChild(valInput);

  // Video aufnehmen
  var videoBlob = null;
  var mediaRecorder = null;
  var recordedChunks = [];
  var stream = null;
  var isRecording = false;

  var camWrap = document.createElement('div');
  camWrap.style.cssText = 'border-radius:12px;overflow:hidden;background:#000;margin-bottom:10px;min-height:160px;display:flex;align-items:center;justify-content:center;';
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
  startCamBtn.style.cssText = 'flex:1;background:var(--bg2);border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:12px;cursor:pointer;color:var(--text);';
  startCamBtn.textContent = '&#128247; Kamera';
  var recBtn = document.createElement('button');
  recBtn.style.cssText = 'flex:1;background:#e74c3c;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:12px;cursor:pointer;color:#fff;display:none;';
  recBtn.textContent = '&#9210; Aufnehmen';

  startCamBtn.onclick = function(){
    navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false}).then(function(s){
      stream=s; preview.srcObject=s; preview.style.display='block'; camPlaceholder.style.display='none';
      startCamBtn.style.display='none'; recBtn.style.display='block';
    }).catch(function(e){ alert('Kamera: '+e.message); });
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
        recBtn.textContent='&#128260; Neu aufnehmen';
        submitBtn.disabled=false; submitBtn.style.opacity='1';
        if(stream) stream.getTracks().forEach(function(t){t.stop();});
      };
      mediaRecorder.start(); isRecording=true;
      recBtn.textContent='&#9209; Stoppen'; recBtn.style.background='#e74c3c';
    } else {
      mediaRecorder.stop(); isRecording=false;
    }
  };

  camRow.appendChild(startCamBtn); camRow.appendChild(recBtn);
  submitSection.appendChild(camRow);

  var submitBtn = document.createElement('button');
  submitBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;padding:16px;cursor:pointer;opacity:0.4;';
  submitBtn.textContent = 'ERGEBNIS EINREICHEN';
  submitBtn.disabled = true;
  submitBtn.onclick = function(){
    var val = parseInt(valInput.value);
    if(!val||val<1){ alert('Bitte Ergebnis eingeben!'); return; }
    if(!videoBlob){ alert('Video erforderlich!'); return; }
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
      ov.remove();
      if(typeof toast==='function') toast('&#9876;&#65039; Ergebnis eingereicht!');
    }).catch(function(e){ alert('Fehler: '+e.message); submitBtn.disabled=false; submitBtn.textContent='ERGEBNIS EINREICHEN'; });
  };
  submitSection.appendChild(submitBtn);
  content.appendChild(submitSection);
}

// ── ERGEBNIS BESTÄTIGEN ───────────────────────────────────
function buildConfirmUI(content, battleId, d, roundIdx, myUid, opponentName, roundData, ov){
  var confirmSection = document.createElement('div');

  var label = document.createElement('div');
  label.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:12px;';
  label.textContent = 'ERGEBNIS BESTÄTIGEN';
  confirmSection.appendChild(label);

  var resultCard = document.createElement('div');
  resultCard.style.cssText = 'background:var(--bg2);border-radius:14px;padding:16px;margin-bottom:14px;text-align:center;';
  resultCard.innerHTML = '<div style="font-size:13px;color:var(--muted);margin-bottom:6px;">'+opponentName+' behauptet:</div>'+
    '<div style="font-size:32px;font-weight:800;color:var(--accent);">'+roundData.value+'</div>'+
    '<div style="font-size:12px;color:var(--muted);">'+(d.roundOrder&&d.roundOrder[roundIdx]&&d.roundOrder[roundIdx].exercise&&d.roundOrder[roundIdx].exercise.unit||'Wdh')+'</div>';
  confirmSection.appendChild(resultCard);

  if(roundData.videoUrl){
    var vidBtn = document.createElement('button');
    vidBtn.style.cssText = 'width:100%;background:var(--bg2);border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:13px;cursor:pointer;color:var(--text);margin-bottom:12px;';
    vidBtn.innerHTML = '&#9654;&#65039; Video ansehen';
    vidBtn.onclick = function(){ playVideo(roundData.videoUrl); };
    confirmSection.appendChild(vidBtn);
  }

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;';

  var confirmBtn = document.createElement('button');
  confirmBtn.style.cssText = 'flex:1;background:#22c55e;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:13px;cursor:pointer;';
  confirmBtn.innerHTML = '&#10003; Bestätigen';
  confirmBtn.onclick = function(){
    confirmRoundResult(battleId, d, roundIdx, myUid, true, roundData.value, ov);
  };

  var disputeBtn = document.createElement('button');
  disputeBtn.style.cssText = 'flex:1;background:#ef4444;color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:13px;cursor:pointer;';
  disputeBtn.innerHTML = '&#10007; Anfechten';
  disputeBtn.onclick = function(){
    if(confirm('Ergebnis anfechten? Admin wird das Video prüfen.')){ confirmRoundResult(battleId, d, roundIdx, myUid, false, roundData.value, ov); }
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
      if(typeof toast==='function') toast('&#127922; Gleichstand! Tiebreaker-Übung: '+tiebreakerEx.name);
    } else {
      updates.status = 'completed';
      updates.winnerId = winnerId;
      updates.completedAt = Date.now();
      updates.scores = scores;
      // King-Update
      updateParkKingAfterBattle(d, winnerId);
    }
  } else {
    updates.round = nextRound;
  }

  db.collection('battles').doc(battleId).update(updates).then(function(){
    ov.remove();
    if(typeof toast==='function') toast(confirmed?'&#10003; Bestätigt!':'&#9888; Angefochten — Admin prüft');
  }).catch(function(e){ alert('Fehler: '+e.message); });
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
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;">&#9203; Lade...</div>';
  db.collection('parkKings').limit(50).get().then(function(snap){
    el.innerHTML = '';
    if(snap.empty){
      el.innerHTML='<div style="text-align:center;padding:40px;"><div style="font-size:36px;margin-bottom:10px;">&#128081;</div><div style="font-size:13px;color:var(--muted);">Noch keine Park Kings.<br>Trainiere in einem Park um King zu werden!</div></div>';
      return;
    }
    var label = document.createElement('div');
    label.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:12px;';
    label.textContent = 'PARK KINGS';
    el.appendChild(label);
    snap.forEach(function(doc){
      var d = doc.data();
      var isMe = firebase.auth().currentUser && d.uid===firebase.auth().currentUser.uid;
      var card = document.createElement('div');
      card.style.cssText = 'background:'+(isMe?'rgba(255,85,0,0.08)':'var(--bg2)')+';border-radius:14px;padding:14px;margin-bottom:10px;border:1.5px solid '+(isMe?'var(--accent)':'var(--border)')+';display:flex;align-items:center;gap:12px;';
      card.innerHTML =
        '<div style="font-size:28px;">&#128081;</div>'+
        '<div style="flex:1;">'+
          '<div style="font-size:14px;font-weight:800;color:var(--text);">'+(d.name||'Anonym')+(isMe?' <span style="font-size:9px;color:var(--accent);border:1px solid var(--accent);border-radius:3px;padding:0 3px;">DU</span>':'')+'</div>'+
          '<div style="font-size:11px;color:var(--muted);">'+(d.parkName||doc.id)+'</div>'+
        '</div>'+
        '<div style="text-align:right;"><div style="font-size:16px;font-weight:800;color:var(--accent);">'+(d.defenses||0)+'</div><div style="font-size:9px;color:var(--muted);">Siege</div></div>';
      el.appendChild(card);
    });
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
      if(typeof toast==='function') toast('&#128081; Du bist jetzt King von '+parkName+'!');
    }
  });
}
