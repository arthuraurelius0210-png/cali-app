// ══════════════════════════════════════════════════════════
// BATTLE.JS — Park Battle System
// ══════════════════════════════════════════════════════════

// Line icons for icon slots (stroke currentColor, 1.5) — no emoji in the Dark-Mono design.
var BATTLE_ICONS = {
  swords: '<path d="M4 4l11 11M20 4L9 15M4 4h3M4 4v3M20 4h-3M20 4v3M15 15l3 3-1.5 1.5-3-3M9 15l-3 3 1.5 1.5 3-3"/>',
  crown:  '<path d="M4 18h16M4 18L3 8l5 4 4-7 4 7 5-4-1 10"/>',
  trophy: '<path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 5H4a3 3 0 003 3M17 5h3a3 3 0 01-3 3"/><path d="M12 13v3M9 20h6"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  user:   '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>'
};
function battleIcon(name, size){
  var s = size || 18;
  return '<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0;" aria-hidden="true">'+(BATTLE_ICONS[name]||'')+'</svg>';
}
// 56px bordered ring around a line icon (empty states, victory overlay)
function battleRing(name, color){
  return '<div style="width:56px;height:56px;border-radius:50%;border:1px solid var(--line2);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:'+(color||'var(--muted)')+';">'+battleIcon(name,24)+'</div>';
}
// Fullscreen overlay top bar: ← back (36px ring) + uppercase title + 36px spacer
function battleTopBar(ov, titleHtml){
  var topBar = document.createElement('div');
  topBar.className = 'topbar';
  topBar.style.cssText = 'padding:0 16px;margin:0;flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'icon-btn sm pressable';
  backBtn.innerHTML = '&#8592;';
  backBtn.setAttribute('aria-label','Zurück');
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var ttl = document.createElement('div');
  ttl.className = 'topbar-title';
  ttl.innerHTML = titleHtml;
  var slot = document.createElement('div');
  slot.className = 'topbar-slot';
  topBar.appendChild(backBtn); topBar.appendChild(ttl); topBar.appendChild(slot);
  return {bar: topBar, back: backBtn, title: ttl, slot: slot};
}
// "vs NAME" — the name keeps its mixed case inside the uppercase top bar
function battleVsTitle(name){
  return 'vs <span style="text-transform:none;letter-spacing:0;color:var(--accent);">'+name+'</span>';
}

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

  // Top bar: ← | BATTLES | + Herausfordern (ghost — the orange CTA belongs to the accept buttons)
  var tb = battleTopBar(ov, 'Battles');
  var newBtn = document.createElement('button');
  newBtn.type = 'button';
  newBtn.className = 'btn-g pressable';
  newBtn.style.cssText = 'min-height:36px;padding:0 12px;white-space:nowrap;';
  newBtn.textContent = '+ Herausfordern';
  newBtn.onclick = function(){ openChallengeSomeone(ov); };
  tb.bar.replaceChild(newBtn, tb.slot);
  ov.appendChild(tb.bar);

  // Tabs → segment control
  var segWrap = document.createElement('div');
  segWrap.style.cssText = 'padding:12px 16px 0;flex-shrink:0;';
  var tabBar = document.createElement('div');
  tabBar.className = 'seg-ctl';
  tabBar.setAttribute('role','tablist');
  var tabs = ['Offen','Meine Battles','Park Kings'];
  var bodies = [];
  tabs.forEach(function(t, ti){
    var tb2 = document.createElement('button');
    tb2.type = 'button';
    tb2.className = ti===0 ? 'on' : '';
    tb2.setAttribute('role','tab');
    tb2.setAttribute('aria-selected', ti===0 ? 'true' : 'false');
    tb2.textContent = t;
    var body = document.createElement('div');
    body.style.cssText = 'display:'+(ti===0?'flex':'none')+';flex-direction:column;padding:4px 16px 40px;gap:10px;overflow-y:auto;flex:1;';
    body.classList.add('sheet-scroll');
    body.setAttribute('role','tabpanel');
    bodies.push(body);
    tb2.onclick = (function(tIdx){
      return function(){
        tabBar.querySelectorAll('button').forEach(function(b,bi){
          b.classList.toggle('on', bi===tIdx);
          b.setAttribute('aria-selected', bi===tIdx ? 'true' : 'false');
        });
        bodies.forEach(function(b,bi){ b.style.display=bi===tIdx?'flex':'none'; });
        if(tIdx===0 && !bodies[0]._loaded){ loadOpenBattles(bodies[0]); bodies[0]._loaded=true; }
        if(tIdx===1 && !bodies[1]._loaded){ loadMyBattles(bodies[1]); bodies[1]._loaded=true; }
        if(tIdx===2 && !bodies[2]._loaded){ loadParkKings(bodies[2]); bodies[2]._loaded=true; }
      };
    })(ti);
    tabBar.appendChild(tb2);
  });
  segWrap.appendChild(tabBar);
  ov.appendChild(segWrap);
  bodies[0].id = 'battle-open-list';

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

function battleErrorHtml(msg){
  return '<div style="font-size:11px;color:var(--muted);padding:12px 0;">Fehler: '+msg+'</div>';
}

// ── OFFENE BATTLES (Herausforderungen die ich bekommen habe) ──
function loadOpenBattles(el){
  el.innerHTML = '<div class="empty">Wird geladen...</div>';
  if(!firebase.auth().currentUser){ el.innerHTML='<div class="empty">Einloggen erforderlich.</div>'; return; }
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
        el.innerHTML = '<div style="text-align:center;padding:40px 0;">'+battleRing('swords')+'<div class="empty" style="padding:0;">Keine offenen Herausforderungen.</div></div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = buildBattleCard(doc.id, d, 'pending', uid);
        el.appendChild(card);
      });
      if(window.caliMotion) caliMotion.stagger(el);
    }).catch(function(e){ el.innerHTML=battleErrorHtml(e.message); });
}

// ── MEINE BATTLES ─────────────────────────────────────────
function loadMyBattles(el){
  el.innerHTML = '<div class="empty">Wird geladen...</div>';
  if(!firebase.auth().currentUser){ el.innerHTML='<div class="empty">Einloggen erforderlich.</div>'; return; }
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
            el.innerHTML='<div style="text-align:center;padding:40px 0;">'+battleRing('swords')+'<div class="empty" style="padding:0;">Noch keine Battles.</div></div>'; return;
          }
          battles.forEach(function(b){
            var card = buildBattleCard(b.id, b.data, b.data.status, uid);
            el.appendChild(card);
          });
          if(window.caliMotion) caliMotion.stagger(el);
          maybeAwardBattleWins(battles, uid);
        });
    }).catch(function(e){ el.innerHTML=battleErrorHtml(e.message); });
}

// ── BATTLE-SIEG XP (idempotent, läuft nur auf dem Gerät des Gewinners) ──
// Der Server prüft Sieg und Gegner-Level, schreibt XP gut und markiert das Battle (xpAwardedTo).
function maybeAwardBattleWins(battles, uid){
  if(typeof earnReward !== 'function') return;
  battles.forEach(function(b){
    var d = b.data;
    if(!d || d.status !== 'completed' || d.winnerId !== uid || d.xpAwardedTo) return;
    var oppName = d.challengerId === uid ? (d.challengedName||'Gegner') : (d.challengerName||'Gegner');
    earnReward('battle', b.id, {label:'Battle gewonnen gegen '+oppName}, function(res){
      if(res && res.ok && res.xp) showBattleVictory(oppName, res.xp);
    });
  });
}

// ── SIEG-OVERLAY ──────────────────────────────────────────
function showBattleVictory(oppName, xpWon){
  var old = document.getElementById('battle-victory-ov'); if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'battle-victory-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:3000;display:flex;align-items:center;justify-content:center;padding:20px;';
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--card);border:1px solid var(--line2);border-radius:var(--r-card);padding:28px 20px 20px;max-width:320px;width:100%;text-align:center;';
  var trophy = document.createElement('div');
  trophy.innerHTML = battleRing('trophy','var(--accent)');
  var hd = document.createElement('div');
  hd.className = 'ttl';
  hd.style.cssText = 'margin-bottom:6px;';
  hd.textContent = 'Battle gewonnen!';
  var sub = document.createElement('div');
  sub.style.cssText = 'font-size:11px;color:var(--muted);margin-bottom:18px;';
  sub.textContent = 'Gegen ' + oppName;
  var xpEl = document.createElement('div');
  xpEl.className = 'dotnum num';
  xpEl.style.cssText = 'font-size:48px;color:var(--accent);margin-bottom:6px;';
  xpEl.textContent = '+' + xpWon + ' XP';
  var okBtn = document.createElement('button');
  okBtn.type = 'button';
  okBtn.className = 'btn pressable';
  okBtn.style.cssText = 'margin-top:16px;';
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
  // Status-Farben aus den Tokens (kategorische Farben sind auf dunklem Grund entsättigt)
  var statusColors = {pending:'var(--amber)', active:'var(--blue)', completed:'var(--success)', declined:'var(--red)'};
  var statusLabels = {pending:'Offen', active:'Läuft', completed:'Beendet', declined:'Abgelehnt'};
  var statusColor = statusColors[status]||'var(--muted)';

  card.className = 'card';
  card.style.cssText = 'margin-bottom:0;';
  card.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;">'+
      '<div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">'+
        '<span class="row-icon">'+battleIcon('swords')+'</span>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-size:13px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+opponentName+'</div>'+
          '<div class="row-sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.parkName||'Unbekannter Park')+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="background:var(--card2);border:1px solid var(--line);border-radius:var(--r-sm);padding:2px 8px;font-size:9px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;flex-shrink:0;color:'+statusColor+';">'+statusLabels[status]+'</div>'+
    '</div>';

  // Actions
  var actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:8px;';

  if(status === 'pending' && !isChallenger){
    // Herausgeforderter kann annehmen oder ablehnen
    var acceptBtn = document.createElement('button');
    acceptBtn.type = 'button';
    acceptBtn.className = 'btn pressable';
    acceptBtn.style.cssText = 'flex:1;margin:0;min-height:44px;';
    acceptBtn.textContent = 'Annehmen';
    acceptBtn.onclick = function(){ acceptBattle(battleId, d); };

    var declineBtn = document.createElement('button');
    declineBtn.type = 'button';
    declineBtn.className = 'btn-g pressable';
    declineBtn.style.cssText = 'flex:1;min-height:44px;';
    declineBtn.textContent = 'Ablehnen';
    declineBtn.onclick = function(){ declineBattle(battleId); card.remove(); };
    actions.appendChild(acceptBtn); actions.appendChild(declineBtn);
  } else if(status === 'active'){
    var goBtn = document.createElement('button');
    goBtn.type = 'button';
    goBtn.className = 'btn sec pressable';
    goBtn.style.cssText = 'flex:1;margin:0;min-height:44px;';
    goBtn.textContent = '▶ Battle fortsetzen';
    goBtn.onclick = function(){ openActiveBattle(battleId, d, myUid); };
    actions.appendChild(goBtn);
  } else if(status === 'completed'){
    var won = d.winnerId === myUid;
    var winner = won ? 'Du hast gewonnen!' : opponentName+' hat gewonnen';
    var resultEl = document.createElement('div');
    resultEl.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:'+(won?'var(--accent)':'var(--muted)')+';padding:4px 0;';
    resultEl.innerHTML = (won ? '<span class="live-dot"></span>' : '') + '<span>'+winner+'</span>';
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
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';
  var box = document.createElement('div');
  box.className = 'sheet';
  box.style.cssText = 'max-height:90vh;overflow-y:auto;';
  box.classList.add('sheet-scroll');
  box.innerHTML = '<div class="sheet-grip"></div>'+
    '<div class="ttl" style="margin-bottom:4px;">Jemanden herausfordern</div>'+
    '<div style="font-size:11px;color:var(--muted);margin-bottom:16px;">Gib den Namen oder die E-Mail deines Gegners ein</div>';

  // Search input
  var searchWrap = document.createElement('div');
  searchWrap.style.cssText = 'margin-bottom:12px;';
  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Name suchen...';
  searchInput.className = 'inp';
  searchInput.setAttribute('aria-label','Gegner suchen');
  var resultsList = document.createElement('div');
  resultsList.style.cssText = 'margin-top:10px;';

  searchInput.oninput = function(){
    var q = this.value.trim().toLowerCase();
    if(q.length < 2){ resultsList.innerHTML=''; return; }
    resultsList.innerHTML = '<div class="empty" style="padding:8px 0;">Suche...</div>';
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
      if(matches.length===0){ resultsList.innerHTML='<div class="empty" style="padding:8px 0;">Niemanden gefunden.</div>'; return; }
      var list = document.createElement('div');
      list.className = 'list';
      list.style.cssText = 'margin-bottom:0;';
      matches.slice(0,5).forEach(function(u, ui){
        var row = document.createElement('div');
        row.className = 'list-row';
        row.style.cssText = 'cursor:default;';
        row.innerHTML = '<span class="row-index num">'+('0'+(ui+1)).slice(-2)+'</span><span class="row-icon">'+battleIcon('user')+'</span><div class="row-main"><div class="row-title">'+u.name+'</div></div>';
        var selectBtn = document.createElement('button');
        selectBtn.type = 'button';
        selectBtn.className = 'btn sec sm pressable';
        selectBtn.textContent = 'Auswählen';
        selectBtn.onclick = function(){ ov.remove(); openChallengeSetup(u, parentOv); };
        row.appendChild(selectBtn);
        list.appendChild(row);
      });
      resultsList.appendChild(list);
    });
  };

  searchWrap.appendChild(searchInput);
  searchWrap.appendChild(resultsList);
  box.appendChild(searchWrap);

  var cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn-g pressable';
  cancelBtn.style.cssText = 'width:100%;min-height:44px;';
  cancelBtn.textContent = 'Abbrechen';
  cancelBtn.onclick = function(){ ov.remove(); };
  box.appendChild(cancelBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}

// Exercise picker tile (setup + accept): bordered card tile, selected = accent line + soft tint
var BATTLE_TILE_CSS = 'padding:10px 12px;min-height:52px;border-radius:var(--r-sm);border:1px solid var(--line);background:var(--card);font-family:inherit;font-size:12px;font-weight:500;cursor:pointer;color:var(--text);text-align:left;line-height:1.3;transition:transform var(--dur-fast) var(--ease-out),opacity var(--dur-fast) ease,border-color var(--dur-fast) ease,background-color var(--dur-fast) ease;';
function battleTileHtml(ex){
  return ex.name+'<div class="unit" style="margin-top:3px;">'+ex.unit+'</div>';
}
function battleTileSelect(btn, on){
  btn.style.borderColor = on ? 'var(--accent)' : 'var(--line)';
  btn.style.background = on ? 'var(--accent-soft)' : 'var(--card)';
  btn.style.color = 'var(--text)';
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
}

// ── CHALLENGE SETUP (Übungen wählen) ─────────────────────
function openChallengeSetup(opponent, parentOv){
  var myUser = firebase.auth().currentUser;
  var myName = (typeof prData !== 'undefined' && prData && prData.name) ? prData.name : 'Ich';

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  var tb = battleTopBar(ov, battleVsTitle(opponent.name));
  ov.appendChild(tb.bar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:16px 16px 40px;';
  content.classList.add('sheet-scroll');

  // Info
  var info = document.createElement('div');
  info.style.cssText = 'background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);padding:12px 14px;margin-bottom:16px;font-size:11px;color:var(--muted);line-height:1.7;';
  info.innerHTML = '<span class="eyebrow" style="margin-bottom:4px;color:var(--text);">Spielregeln</span>Du wählst 2 Übungen, '+opponent.name+' wählt 2 Übungen.<br>Reihenfolge: Du → Gegner → Gegner → Du.<br>Beide müssen im Park sein (GPS).';
  content.appendChild(info);

  var myChoices = [];
  var exercises = getBattleExercises();

  var label = document.createElement('h2');
  label.className = 'stitle';
  label.style.cssText = 'margin:0 0 12px;';
  label.textContent = 'Deine 2 Übungen wählen';
  content.appendChild(label);

  var selCount = document.createElement('div');
  selCount.className = 'lbl num';
  selCount.style.cssText = 'margin-bottom:10px;';
  selCount.textContent = '0 / 2 gewählt';

  var exGrid = document.createElement('div');
  exGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;';

  exercises.forEach(function(ex){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.exId = ex.id;
    btn.style.cssText = BATTLE_TILE_CSS;
    btn.innerHTML = battleTileHtml(ex);
    btn.classList.add('pressable');
    btn.setAttribute('aria-pressed','false');
    btn.onclick = function(){
      var idx = myChoices.findIndex(function(e){ return e.id===ex.id; });
      if(idx !== -1){
        myChoices.splice(idx,1);
        battleTileSelect(btn, false);
      } else if(myChoices.length < 2){
        myChoices.push(ex);
        battleTileSelect(btn, true);
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
  sendBtn.type = 'button';
  sendBtn.className = 'btn pressable';
  sendBtn.style.cssText = 'opacity:0.4;';
  sendBtn.textContent = 'Herausforderung senden';
  sendBtn.disabled = true;
  sendBtn.onclick = function(){
    if(myChoices.length !== 2) return;
    sendChallenge(myUser, myName, opponent, myChoices, ov);
  };
  ov._sendBtn = sendBtn;
  content.appendChild(sendBtn);
  ov.appendChild(content);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);
}

// ── CHALLENGE SENDEN ─────────────────────────────────────
function sendChallenge(myUser, myName, opponent, myExercises, ov){
  var btn = ov._sendBtn || ov.querySelector('button:last-child');
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
    if(typeof toast === 'function') toast('Herausforderung gesendet!');
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

  var tb = battleTopBar(ov, battleVsTitle(d.challengerName));
  ov.appendChild(tb.bar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:16px 16px 40px;';
  content.classList.add('sheet-scroll');

  // Gegner-Übungen anzeigen
  var info = document.createElement('div');
  info.style.cssText = 'background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);padding:12px 14px;margin-bottom:16px;';
  var chosenEx = (d.challengerExercises||[]).map(function(e){ return e.name; }).join(', ');
  info.innerHTML = '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">'+d.challengerName+' hat gewählt:</div>'+
    '<div style="font-size:13px;font-weight:600;color:var(--text);">'+chosenEx+'</div>';
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
  selCount.className = 'lbl num';
  selCount.style.cssText = 'margin-bottom:10px;';
  selCount.textContent = '0 / 2 gewählt';

  var exGrid = document.createElement('div');
  exGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;';

  exercises.forEach(function(ex){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.exId = ex.id;
    btn.style.cssText = BATTLE_TILE_CSS;
    btn.innerHTML = battleTileHtml(ex);
    btn.classList.add('pressable');
    btn.setAttribute('aria-pressed','false');
    btn.onclick = function(){
      var idx = myChoices.findIndex(function(e){ return e.id===ex.id; });
      if(idx !== -1){
        myChoices.splice(idx,1);
        battleTileSelect(btn, false);
      } else if(myChoices.length < 2){
        myChoices.push(ex);
        battleTileSelect(btn, true);
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
  confirmBtn.type = 'button';
  confirmBtn.className = 'btn pressable';
  confirmBtn.style.cssText = 'opacity:0.4;';
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
      if(typeof toast==='function') toast('Battle gestartet!');
      // Reload open battles (the "Offen" panel carries its own id; the old style-selector stays as fallback)
      var openEl = document.getElementById('battle-open-list') || document.querySelector('#battle-ov [style*="flex-direction:column"]');
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

  var opponentName = d.challengerId===myUid ? d.challengedName : d.challengerName;
  var tb = battleTopBar(ov, battleVsTitle(opponentName));
  ov.appendChild(tb.bar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:16px 16px 40px;';
  content.classList.add('sheet-scroll');

  var round = d.round || 0;
  var roundOrder = d.roundOrder || [];
  var currentRound = roundOrder[round];

  if(!currentRound){
    // Battle beendet
    content.innerHTML = '<div style="text-align:center;padding:40px 0;">'+battleRing('trophy','var(--accent)')+'<div class="ttl">Battle beendet!</div></div>';
    ov.appendChild(content);
    document.body.appendChild(ov);
    // Hardware-Zurück schließt das Overlay statt der App
    if(typeof overlayPush === 'function') overlayPush(ov);
    if(window.caliMotion) caliMotion.overlayIn(ov);
    return;
  }

  var isMyTurn = (currentRound.turn==='challenger' && d.challengerId===myUid) ||
                 (currentRound.turn==='challenged' && d.challengedId===myUid);

  // Scoreboard — the two Doto scores form the screen's one big live display
  var scoreEl = document.createElement('div');
  scoreEl.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-card);padding:16px 14px;margin-bottom:10px;';
  var myScore = 0, oppScore = 0;
  (d.rounds||[]).forEach(function(r){
    if(r.winner === myUid) myScore++;
    else if(r.winner && r.winner !== myUid) oppScore++;
  });
  scoreEl.innerHTML =
    '<div style="text-align:center;flex:1;min-width:0;"><div id="battle-score-me" class="dotnum num" style="font-size:40px;color:var(--accent);">'+myScore+'</div><div class="unit" style="margin-top:6px;display:block;">Du</div></div>'+
    '<div class="lbl num" style="flex-shrink:0;text-align:center;">Runde '+(round+1)+' / '+roundOrder.length+'</div>'+
    '<div style="text-align:center;flex:1;min-width:0;"><div id="battle-score-opp" class="dotnum num" style="font-size:40px;color:var(--text);">'+oppScore+'</div><div style="font-size:10px;color:var(--muted);margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+opponentName+'</div></div>';
  content.appendChild(scoreEl);

  // Aktuelle Übung
  var exCard = document.createElement('div');
  exCard.style.cssText = 'background:var(--card);border:1px solid var(--line2);border-radius:var(--r-card);padding:16px 14px;margin-bottom:10px;text-align:center;';
  exCard.innerHTML = '<h2 class="eyebrow" style="margin:0 0 8px;">Aktuelle Übung</h2>'+
    '<div class="ttl">'+(currentRound.exercise&&currentRound.exercise.name||'')+'</div>'+
    '<div class="unit" style="display:block;margin-top:4px;">'+(currentRound.exercise&&currentRound.exercise.unit||'')+'</div>';
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
    waitEl.style.cssText = 'text-align:center;padding:30px 0;';
    waitEl.innerHTML = '<div style="display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--text);"><span class="rec-dot"></span>Warte auf '+opponentName+'...</div>'+
      '<div style="font-size:11px;color:var(--muted);margin-top:8px;">'+opponentName+' macht gerade die Übung</div>';
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
  valInput.className = 'inp num';
  valInput.style.cssText = 'text-align:center;font-size:22px;font-weight:600;margin-bottom:12px;';
  valInput.setAttribute('aria-label','Ergebnis');
  submitSection.appendChild(valInput);

  // Video aufnehmen
  var videoBlob = null;
  var mediaRecorder = null;
  var recordedChunks = [];
  var stream = null;
  var isRecording = false;

  var camWrap = document.createElement('div');
  camWrap.style.cssText = 'border-radius:var(--r-card);border:1px solid var(--line);overflow:hidden;background:var(--bg);margin-bottom:10px;min-height:160px;display:flex;align-items:center;justify-content:center;';
  var preview = document.createElement('video');
  preview.style.cssText = 'width:100%;max-height:240px;display:none;';
  preview.autoplay = true; preview.muted = true; preview.playsinline = true;
  var resultVid = document.createElement('video');
  resultVid.style.cssText = 'width:100%;max-height:240px;display:none;';
  resultVid.controls = true; resultVid.playsinline = true;
  var camPlaceholder = document.createElement('div');
  camPlaceholder.style.cssText = 'color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.14em;text-align:center;padding:16px;display:flex;flex-direction:column;align-items:center;gap:10px;';
  camPlaceholder.innerHTML = battleIcon('camera',22)+'<span>Video aufnehmen (Pflicht)</span>';
  camWrap.appendChild(preview); camWrap.appendChild(resultVid); camWrap.appendChild(camPlaceholder);
  submitSection.appendChild(camWrap);

  var camRow = document.createElement('div');
  camRow.style.cssText = 'display:flex;gap:8px;margin-bottom:14px;';
  var startCamBtn = document.createElement('button');
  startCamBtn.type = 'button';
  startCamBtn.className = 'btn-g pressable';
  startCamBtn.style.cssText = 'flex:1;min-height:44px;';
  startCamBtn.textContent = 'Kamera';
  var recBtn = document.createElement('button');
  recBtn.type = 'button';
  recBtn.className = 'btn-g danger pressable';
  recBtn.style.cssText = 'flex:1;min-height:44px;display:none;';
  recBtn.innerHTML = '<span class="live-dot" style="background:var(--red);"></span>Aufnehmen';

  startCamBtn.onclick = function(){
    navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false}).then(function(s){
      stream=s; preview.srcObject=s; preview.style.display='block'; camPlaceholder.style.display='none';
      startCamBtn.style.display='none'; recBtn.style.display='inline-flex';
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
        recBtn.textContent='Neu aufnehmen';
        recBtn.style.background='transparent'; recBtn.style.color='var(--red)';
        submitBtn.disabled=false; submitBtn.style.opacity='1';
        if(stream) stream.getTracks().forEach(function(t){t.stop();});
      };
      mediaRecorder.start(); isRecording=true;
      recBtn.textContent='■ Stoppen'; recBtn.style.background='var(--red)'; recBtn.style.color='var(--text)';
    } else {
      mediaRecorder.stop(); isRecording=false;
    }
  };

  camRow.appendChild(startCamBtn); camRow.appendChild(recBtn);
  submitSection.appendChild(camRow);

  var submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.className = 'btn pressable';
  submitBtn.style.cssText = 'opacity:0.4;';
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
      if(typeof toast==='function') toast('Ergebnis eingereicht!');
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
  resultCard.className = 'card';
  resultCard.style.cssText = 'padding:16px 14px;text-align:center;';
  resultCard.innerHTML = '<div style="font-size:11px;color:var(--muted);margin-bottom:8px;">'+opponentName+' behauptet:</div>'+
    '<div class="kpi lg num" style="color:var(--accent);">'+roundData.value+'</div>'+
    '<div class="unit" style="display:block;margin-top:6px;">'+(d.roundOrder&&d.roundOrder[roundIdx]&&d.roundOrder[roundIdx].exercise&&d.roundOrder[roundIdx].exercise.unit||'Wdh')+'</div>';
  confirmSection.appendChild(resultCard);
  if(window.caliMotion){
    var claimEl = resultCard.querySelector('.num');
    if(claimEl) caliMotion.countUp(claimEl, roundData.value, {duration:600});
  }

  if(roundData.videoUrl){
    var vidBtn = document.createElement('button');
    vidBtn.type = 'button';
    vidBtn.className = 'btn-g pressable';
    vidBtn.style.cssText = 'width:100%;min-height:44px;margin-bottom:12px;';
    vidBtn.textContent = '▶ Video ansehen';
    vidBtn.onclick = function(){ playVideo(roundData.videoUrl); };
    confirmSection.appendChild(vidBtn);
  }

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;';

  var confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'btn pressable';
  confirmBtn.style.cssText = 'flex:1;margin:0;min-height:44px;';
  confirmBtn.textContent = '✓ Bestätigen';
  confirmBtn.onclick = function(){
    confirmRoundResult(battleId, d, roundIdx, myUid, true, roundData.value, ov);
  };

  var disputeBtn = document.createElement('button');
  disputeBtn.type = 'button';
  disputeBtn.className = 'btn-g danger pressable';
  disputeBtn.style.cssText = 'flex:1;min-height:44px;';
  disputeBtn.textContent = '✗ Anfechten';
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
      if(typeof toast==='function') toast('Gleichstand! Tiebreaker-Übung: '+tiebreakerEx.name);
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
    if(typeof toast==='function') toast(confirmed?'Bestätigt!':'Angefochten. Ein Admin prüft.');
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
  el.innerHTML = '<div class="empty">Wird geladen...</div>';
  db.collection('parkKings').limit(50).get().then(function(snap){
    el.innerHTML = '';
    if(snap.empty){
      el.innerHTML='<div style="text-align:center;padding:40px 0;">'+battleRing('crown')+'<div class="empty" style="padding:0;">Noch keine Park Kings.<br>Trainiere in einem Park um King zu werden!</div></div>';
      return;
    }
    var label = document.createElement('h2');
    label.className = 'stitle';
    label.style.cssText = 'margin:0;';
    label.textContent = 'Park Kings';
    el.appendChild(label);
    // Ranked list: explicit two-digit index per row
    var list = document.createElement('div');
    list.className = 'list';
    list.style.cssText = 'margin-bottom:0;flex-shrink:0;';
    var rank = 0;
    snap.forEach(function(doc){
      var d = doc.data();
      rank++;
      var isMe = firebase.auth().currentUser && d.uid===firebase.auth().currentUser.uid;
      var row = document.createElement('div');
      row.className = 'list-row';
      row.style.cssText = 'cursor:default;'+(isMe?'background:var(--accent-soft);':'');
      row.innerHTML =
        '<span class="row-index num">'+('0'+rank).slice(-2)+'</span>'+
        '<span class="row-icon" style="'+(isMe?'color:var(--accent);border-color:var(--accent);':'')+'">'+battleIcon('crown')+'</span>'+
        '<div class="row-main">'+
          '<div class="row-title">'+(d.name||'Anonym')+(isMe?' <span style="background:var(--card2);border:1px solid var(--line);border-radius:var(--r-sm);padding:1px 6px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--accent);vertical-align:middle;">Du</span>':'')+'</div>'+
          '<div class="row-sub" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.parkName||doc.id)+'</div>'+
        '</div>'+
        '<div style="text-align:right;flex-shrink:0;"><div class="row-val num" style="font-size:15px;">'+(d.defenses||0)+'</div><div class="unit">Siege</div></div>';
      list.appendChild(row);
    });
    el.appendChild(list);
    if(window.caliMotion) caliMotion.stagger(list);
  }).catch(function(e){ el.innerHTML=battleErrorHtml(e.message); });
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
      if(typeof toast==='function') toast('Du bist jetzt King von '+parkName+'!');
    }
  });
}
