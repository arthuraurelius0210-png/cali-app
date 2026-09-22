// ══════════════════════════════════════════════════════════
// FRIENDS.JS — Freunde
// Öffentliches Profil profiles/{uid} (Name, kleines Bild, Level, Streak, letztes Training,
// Einladungscode): jeder Eingeloggte liest, nur der Besitzer schreibt. Das große users-Dokument
// bleibt privat. Freundschaft = eine Datei friendships/{a_b} (UIDs sortiert) mit members [a, b],
// status pending|accepted, requestedBy. Anfrage per Namenssuche (Präfix auf nameLower) oder
// Einladungslink tracker.html?invite=<code> (invites/{code} → uid); über den Link ist die
// Freundschaft sofort angenommen, die Firestore-Regeln prüfen den Code.
// Private Profile (prData.isPublic === false) tauchen in der Suche nicht auf (Muster Buddy-Finder).
// ══════════════════════════════════════════════════════════

var friendsState = {friends:[], incoming:[], outgoing:[], loaded:false};
var friendProfiles = {};        // uid → profiles-Dokument
var friendProfilesAt = 0;
var _friendsUnsub = null;
var _profileSyncTimer = null;
var _profileLastJson = '';
var _myInviteCode = null;

function friendsReady(){ return !!(typeof currentUser !== 'undefined' && currentUser && typeof db !== 'undefined' && db); }
function friendPairId(a, b){ return a < b ? a + '_' + b : b + '_' + a; }
function friendOtherUid(f){ return f.members[0] === currentUser.uid ? f.members[1] : f.members[0]; }
function friendName(f, uid){ return (f.names && f.names[uid]) || (friendProfiles[uid] && friendProfiles[uid].name) || 'Athlet'; }
function friendsFmtDate(s){
  if(!s) return '';
  var p = String(s).slice(0, 10).split('-');
  return p.length === 3 ? p[2] + '.' + p[1] + '.' : '';
}
function friendsMyName(){ return (typeof prData !== 'undefined' && prData && prData.name) ? String(prData.name).slice(0, 40) : 'Athlet'; }
function friendsInviteLink(code){ return location.origin + '/tracker.html?invite=' + code; }

// ── Öffentliches Profil ──
function profileInviteCode(){
  if(_myInviteCode) return _myInviteCode;
  try{ _myInviteCode = localStorage.getItem('cali_invite_code') || null; }catch(e){}
  return _myInviteCode;
}
function profileNewCode(){
  var chars = 'abcdefghjkmnpqrstuvwxyz23456789', s = '';
  for(var i=0;i<8;i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
// Avatar auf 64 px verkleinern (Data-URL), damit das Profil klein bleibt
function profileSmallAvatar(dataUrl, cb){
  var img = new Image();
  img.onload = function(){
    try{
      var c = document.createElement('canvas'); c.width = 64; c.height = 64;
      var x = c.getContext('2d'), s = Math.min(img.width, img.height);
      x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 64, 64);
      cb(c.toDataURL('image/jpeg', 0.7));
    }catch(e){ cb(null); }
  };
  img.onerror = function(){ cb(null); };
  img.src = dataUrl;
}
function profileSnapshot(){
  var last = null, days = {};
  for(var i=0;i<ents.length;i++){ var d = ents[i] && ents[i].date; if(!d) continue; days[d] = 1; if(!last || d > last) last = d; }
  var xp = 0; try{ xp = parseInt(localStorage.getItem('cali_xp_cache'), 10) || 0; }catch(e){}
  var level = (typeof getLevelFromXP === 'function') ? getLevelFromXP(xp).level : 1;
  var name = friendsMyName();
  return {uid:currentUser.uid, name:name, nameLower:name.toLowerCase(), level:level, xp:xp,
    streak:(typeof streakData !== 'undefined' && streakData && streakData.currentStreak) || 0,
    workouts:Object.keys(days).length, lastWorkout:last, isPublic:!(prData && prData.isPublic === false), updatedAt:Date.now()};
}
function profileSync(){
  if(!friendsReady()) return;
  var p = profileSnapshot();
  var code = profileInviteCode();
  var ref = db.collection('profiles').doc(currentUser.uid);
  var finish = function(avatar){
    p.avatar = avatar || null;
    if(code) p.inviteCode = code;
    var json = JSON.stringify(p);
    if(json === _profileLastJson) return;
    _profileLastJson = json;
    ref.set(p, {merge:true}).catch(function(){ _profileLastJson = ''; });
  };
  // Einladungscode einmal anlegen (invites/{code} → uid) und auf dem Gerät merken
  var ensureCode = code ? Promise.resolve() : ref.get().then(function(doc){
    var existing = doc.exists && doc.data().inviteCode;
    if(existing){ code = existing; return; }
    code = profileNewCode();
    return db.collection('invites').doc(code).set({uid:currentUser.uid, createdAt:Date.now()});
  }).then(function(){ _myInviteCode = code; try{ localStorage.setItem('cali_invite_code', code); }catch(e){} })
    .catch(function(){ code = null; });
  ensureCode.then(function(){
    var av = prData && prData.avatar;
    if(!av){ finish(null); return; }
    if(av.length < 20000){ finish(av); return; }
    profileSmallAvatar(av, finish);
  });
}
function profileSyncSoon(){
  if(_profileSyncTimer) clearTimeout(_profileSyncTimer);
  _profileSyncTimer = setTimeout(profileSync, 1500);
}

// ── Freundschaften live laden ──
function loadFriendships(){
  if(!friendsReady()) return;
  if(_friendsUnsub){ try{ _friendsUnsub(); }catch(e){} }
  _friendsUnsub = db.collection('friendships').where('members', 'array-contains', currentUser.uid).onSnapshot(function(snap){
    var friends = [], incoming = [], outgoing = [], uids = [];
    snap.forEach(function(doc){
      var f = Object.assign({id:doc.id}, doc.data());
      if(!Array.isArray(f.members) || f.members.length !== 2) return;
      uids.push(friendOtherUid(f));
      if(f.status === 'accepted') friends.push(f);
      else if(f.status === 'pending'){ (f.requestedBy === currentUser.uid ? outgoing : incoming).push(f); }
    });
    var hadIncoming = friendsState.loaded ? friendsState.incoming.length : incoming.length;
    friendsState = {friends:friends, incoming:incoming, outgoing:outgoing, loaded:true};
    if(incoming.length > hadIncoming && typeof toast === 'function') toast('Neue Freundschaftsanfrage');
    loadFriendProfiles(uids, false, buildFriendsSection);
  }, function(){ friendsState.loaded = true; buildFriendsSection(); });
}
function loadFriendProfiles(uids, refresh, cb){
  var stale = refresh || (Date.now() - friendProfilesAt > 300000);
  var missing = uids.filter(function(u){ return stale || !friendProfiles[u]; });
  if(!missing.length){ if(cb) cb(); return; }
  Promise.all(missing.map(function(u){
    return db.collection('profiles').doc(u).get().then(function(d){ friendProfiles[u] = d.exists ? d.data() : {name:'Athlet'}; }).catch(function(){ if(!friendProfiles[u]) friendProfiles[u] = {name:'Athlet'}; });
  })).then(function(){ friendProfilesAt = Date.now(); if(cb) cb(); });
}

// ── Aktionen ──
function sendFriendRequest(uid, name, cb){
  if(!friendsReady() || !uid || uid === currentUser.uid) return;
  var id = friendPairId(currentUser.uid, uid);
  var all = friendsState.friends.concat(friendsState.incoming, friendsState.outgoing);
  for(var i=0;i<all.length;i++){
    if(all[i].id !== id) continue;
    toast(all[i].status === 'accepted' ? 'Ihr seid schon Freunde' : (all[i].requestedBy === currentUser.uid ? 'Anfrage läuft schon' : name + ' hat dich schon angefragt, schau ins Profil'));
    if(cb) cb(false);
    return;
  }
  var names = {}; names[currentUser.uid] = friendsMyName(); names[uid] = String(name || 'Athlet').slice(0, 40);
  db.collection('friendships').doc(id).set({members:[currentUser.uid, uid].sort(), requestedBy:currentUser.uid, status:'pending', names:names, createdAt:Date.now()})
    .then(function(){ toast('Anfrage an ' + names[uid] + ' gesendet'); if(cb) cb(true); })
    .catch(function(){ toast('Anfrage fehlgeschlagen'); if(cb) cb(false); });
}
function acceptFriendRequest(f){
  db.collection('friendships').doc(f.id).update({status:'accepted', acceptedAt:Date.now()})
    .then(function(){ toast('Ihr seid jetzt Freunde'); if(window.caliMotion && caliMotion.celebrate) caliMotion.celebrate('burst'); })
    .catch(function(){ toast('Annehmen fehlgeschlagen'); });
}
function deleteFriendship(f, msg){
  db.collection('friendships').doc(f.id).delete().then(function(){ if(msg) toast(msg); }).catch(function(){ toast('Fehlgeschlagen'); });
}

// ── Einladungslink ──
// ?invite=<code> beim Laden merken (auch vor dem Login) und aus der Adresse nehmen
function friendsCaptureInvite(){
  try{
    var q = new URLSearchParams(location.search), c = q.get('invite');
    if(c && /^[a-z0-9]{4,32}$/i.test(c)){
      localStorage.setItem('cali_pending_invite', c.toLowerCase());
      history.replaceState(null, '', location.pathname);
    }
  }catch(e){}
}
function friendsClearInvite(){ try{ localStorage.removeItem('cali_pending_invite'); }catch(e){} }
function handlePendingInvite(){
  if(!friendsReady()) return;
  var code = null; try{ code = localStorage.getItem('cali_pending_invite'); }catch(e){}
  if(!code) return;
  db.collection('invites').doc(code).get().then(function(doc){
    if(!doc.exists){ friendsClearInvite(); toast('Der Einladungslink ist ungültig'); return; }
    var uid = doc.data().uid;
    if(uid === currentUser.uid){ friendsClearInvite(); toast('Das ist dein eigener Einladungslink'); return; }
    return db.collection('profiles').doc(uid).get().then(function(p){ openInviteSheet(code, uid, p.exists ? p.data() : {name:'Athlet'}); });
  }).catch(function(){ friendsClearInvite(); });
}
function openInviteSheet(code, uid, prof){
  var old = document.getElementById('invite-sheet');
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'invite-sheet';
  ov.style.cssText = PLAN_BACKDROP_CSS + 'z-index:2300;';
  var box = document.createElement('div');
  box.className = 'sheet';
  box.appendChild(planSheetGrip());
  var eb = document.createElement('span'); eb.className = 'eyebrow'; eb.textContent = 'Einladung';
  var t = document.createElement('div'); t.className = 'ttl'; t.style.cssText = 'margin-bottom:6px;'; t.textContent = prof.name || 'Athlet';
  var s = document.createElement('div'); s.style.cssText = 'font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:18px;';
  s.textContent = 'möchte mit dir befreundet sein.' + (prof.level ? ' Level ' + prof.level : '') + (prof.streak ? ' · Streak ' + prof.streak : '');
  var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'btn pressable'; ok.style.cssText = 'margin:0 0 4px;'; ok.textContent = 'Freund werden';
  ok.onclick = function(){ ok.disabled = true; acceptInvite(code, uid, prof, function(){ sheetOut(ov, box); }); };
  var later = document.createElement('button'); later.type = 'button'; later.className = 'pressable u'; later.style.cssText = PLAN_TEXTBTN_CSS; later.textContent = 'Nein danke';
  later.onclick = function(){ friendsClearInvite(); sheetOut(ov, box); };
  box.appendChild(eb); box.appendChild(t); box.appendChild(s); box.appendChild(ok); box.appendChild(later);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) sheetOut(ov, box); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}
function acceptInvite(code, uid, prof, done){
  var id = friendPairId(currentUser.uid, uid);
  var all = friendsState.friends.concat(friendsState.incoming, friendsState.outgoing);
  for(var i=0;i<all.length;i++){
    if(all[i].id !== id) continue;
    if(all[i].status === 'accepted'){ toast('Ihr seid schon Freunde'); }
    else if(all[i].requestedBy !== currentUser.uid){ acceptFriendRequest(all[i]); }
    else { toast('Deine Anfrage läuft schon, ' + (prof.name || 'Athlet') + ' muss sie annehmen'); }
    friendsClearInvite(); if(done) done(); return;
  }
  var names = {}; names[currentUser.uid] = friendsMyName(); names[uid] = String(prof.name || 'Athlet').slice(0, 40);
  db.collection('friendships').doc(id).set({members:[currentUser.uid, uid].sort(), requestedBy:currentUser.uid, status:'accepted', inviteCode:code, names:names, createdAt:Date.now(), acceptedAt:Date.now()})
    .then(function(){ friendsClearInvite(); toast('Ihr seid jetzt Freunde'); if(window.caliMotion && caliMotion.celebrate) caliMotion.celebrate('burst'); if(done) done(); })
    .catch(function(){ toast('Einladung konnte nicht angenommen werden'); if(done) done(); });
}
function shareInviteLink(){
  var code = profileInviteCode();
  if(!code){ toast('Einladungslink wird noch erstellt, gleich nochmal'); profileSync(); return; }
  var link = friendsInviteLink(code);
  var text = 'Trainier mit mir in CALI: ' + link;
  if(navigator.share){
    navigator.share({title:'CALI', text:text, url:link}).catch(function(){});
    return;
  }
  copyInviteLink();
}
function copyInviteLink(){
  var code = profileInviteCode();
  if(!code){ toast('Einladungslink wird noch erstellt, gleich nochmal'); profileSync(); return; }
  var link = friendsInviteLink(code);
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(link).then(function(){ toast('Link kopiert'); }).catch(function(){ window.prompt('Link kopieren:', link); });
  } else {
    window.prompt('Link kopieren:', link);
  }
}

// ── Profil: Abschnitt „Freunde" (#pr-friends in pages.html) ──
function friendAvatarHtml(prof, size){
  size = size || 28;
  var base = 'width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:var(--card2);border:1px solid var(--line2);display:inline-flex;align-items:center;justify-content:center;color:var(--muted);overflow:hidden;flex-shrink:0;';
  if(prof && prof.avatar) return '<span style="' + base + 'background-image:url(' + prof.avatar + ');background-size:cover;background-position:center;filter:grayscale(1) contrast(1.15) brightness(0.85);"></span>';
  return '<span style="' + base + '"><span style="display:inline-flex;width:' + Math.round(size / 2) + 'px;height:' + Math.round(size / 2) + 'px;">' + (typeof planLineIcon === 'function' ? planLineIcon('people', Math.round(size / 2)) : '') + '</span></span>';
}
function friendSubline(prof){
  if(!prof) return '';
  var parts = [];
  if(prof.level) parts.push('Level ' + prof.level);
  if(prof.streak) parts.push('Streak ' + prof.streak);
  if(prof.lastWorkout) parts.push('zuletzt ' + friendsFmtDate(prof.lastWorkout));
  return parts.join(' · ');
}
function buildFriendsSection(){
  var el = document.getElementById('pr-friends');
  if(!el) return;
  el.innerHTML = '';
  var card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'margin-bottom:0;';
  var head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;';
  head.innerHTML = '<div style="display:flex;align-items:baseline;gap:6px;"><span class="kpi num" style="font-size:22px;">' + friendsState.friends.length + '</span><span class="unit">' + (friendsState.friends.length === 1 ? 'Freund' : 'Freunde') + '</span></div>';
  var addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn sec sm pressable';
  addBtn.textContent = '+ Freund';
  addBtn.onclick = function(){ openAddFriendSheet(); };
  head.appendChild(addBtn);
  card.appendChild(head);

  if(!friendsReady()){
    var hint = document.createElement('div'); hint.className = 'empty'; hint.textContent = 'Einloggen, um Freunde hinzuzufügen.';
    card.appendChild(hint); el.appendChild(card); return;
  }

  // Offene Anfragen an mich
  if(friendsState.incoming.length){
    var lbl = document.createElement('div'); lbl.className = 'lbl'; lbl.style.cssText = 'margin:0 0 6px;'; lbl.textContent = 'Anfragen';
    card.appendChild(lbl);
    var inList = document.createElement('div'); inList.className = 'list'; inList.style.cssText = 'margin-bottom:10px;';
    friendsState.incoming.forEach(function(f){
      var uid = friendOtherUid(f), prof = friendProfiles[uid];
      var row = document.createElement('div');
      row.className = 'list-row';
      row.style.cssText = 'cursor:default;background:var(--accent-soft);';
      row.innerHTML = friendAvatarHtml(prof) + '<div class="row-main"><div class="row-title"></div><div class="row-sub">möchte dein Freund sein</div></div>';
      row.querySelector('.row-title').textContent = friendName(f, uid);
      var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'btn sec sm pressable'; ok.style.cssText = 'flex-shrink:0;'; ok.textContent = 'Annehmen';
      ok.onclick = function(){ ok.disabled = true; acceptFriendRequest(f); };
      var no = document.createElement('button'); no.type = 'button'; no.className = 'pressable'; no.setAttribute('aria-label', 'Ablehnen');
      no.style.cssText = 'background:none;border:none;color:var(--muted2);cursor:pointer;font-family:inherit;font-size:14px;min-width:36px;min-height:36px;padding:6px;margin:0 -6px 0 0;flex-shrink:0;';
      no.innerHTML = '&#x2715;';
      no.onclick = function(){ deleteFriendship(f, 'Anfrage abgelehnt'); };
      row.appendChild(ok); row.appendChild(no);
      inList.appendChild(row);
    });
    card.appendChild(inList);
  }

  // Freundesliste
  if(!friendsState.friends.length){
    var none = document.createElement('div');
    none.className = 'row-sub';
    none.style.cssText = 'margin:0 0 ' + (friendsState.outgoing.length ? '10px' : '0') + ';white-space:normal;line-height:1.5;';
    none.textContent = friendsState.loaded ? 'Noch keine Freunde. Such nach einem Namen oder schick deinen Einladungslink.' : 'Lädt …';
    card.appendChild(none);
  } else {
    var list = document.createElement('div');
    list.className = 'list';
    list.style.cssText = 'margin-bottom:' + (friendsState.outgoing.length ? '10px' : '0') + ';';
    friendsState.friends.slice().sort(function(a, b){
      var pa = friendProfiles[friendOtherUid(a)] || {}, pb = friendProfiles[friendOtherUid(b)] || {};
      return String(pb.lastWorkout || '').localeCompare(String(pa.lastWorkout || ''));
    }).forEach(function(f){
      var uid = friendOtherUid(f), prof = friendProfiles[uid];
      var row = document.createElement('div');
      row.className = 'list-row pressable';
      row.setAttribute('role', 'button'); row.setAttribute('tabindex', '0');
      row.innerHTML = friendAvatarHtml(prof) + '<div class="row-main"><div class="row-title"></div><div class="row-sub"></div></div><span class="row-chev"></span>';
      row.querySelector('.row-title').textContent = (prof && prof.name) || friendName(f, uid);
      row.querySelector('.row-sub').textContent = friendSubline(prof) || 'Freunde seit ' + friendsFmtDate(new Date(f.acceptedAt || f.createdAt || 0).toISOString());
      row.onclick = function(){ openFriendSheet(f); };
      row.onkeydown = function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); row.click(); } };
      list.appendChild(row);
    });
    card.appendChild(list);
    if(friendsState.friends.length >= 1){
      var rank = document.createElement('button');
      rank.type = 'button';
      rank.className = 'btn-g pressable';
      rank.style.cssText = 'width:100%;min-height:44px;margin-top:10px;';
      rank.textContent = 'Freunde-Rangliste';
      rank.onclick = function(){ openFriendsRanking(); };
      card.appendChild(rank);
    }
  }

  // Gesendete Anfragen
  if(friendsState.outgoing.length){
    var lbl2 = document.createElement('div'); lbl2.className = 'lbl'; lbl2.style.cssText = 'margin:0 0 6px;'; lbl2.textContent = 'Gesendet';
    card.appendChild(lbl2);
    var outList = document.createElement('div'); outList.className = 'list';
    friendsState.outgoing.forEach(function(f){
      var uid = friendOtherUid(f);
      var row = document.createElement('div');
      row.className = 'list-row';
      row.style.cssText = 'cursor:default;';
      row.innerHTML = friendAvatarHtml(friendProfiles[uid]) + '<div class="row-main"><div class="row-title"></div><div class="row-sub">Anfrage gesendet, wartet</div></div>';
      row.querySelector('.row-title').textContent = friendName(f, uid);
      var back = document.createElement('button'); back.type = 'button'; back.className = 'btn-g sm pressable'; back.style.cssText = 'flex-shrink:0;'; back.textContent = 'Zurück';
      back.onclick = function(){ deleteFriendship(f, 'Anfrage zurückgezogen'); };
      row.appendChild(back);
      outList.appendChild(row);
    });
    card.appendChild(outList);
  }
  el.appendChild(card);
}

// ── Freund antippen: Herausfordern, Entfernen ──
function openFriendSheet(f){
  var uid = friendOtherUid(f), prof = friendProfiles[uid] || {}, name = prof.name || friendName(f, uid);
  var old = document.getElementById('friend-sheet');
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'friend-sheet';
  ov.style.cssText = PLAN_BACKDROP_CSS + 'z-index:2100;';
  var box = document.createElement('div');
  box.className = 'sheet';
  box.appendChild(planSheetGrip());
  var head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:16px;';
  head.innerHTML = friendAvatarHtml(prof, 44) + '<div style="min-width:0;"><div class="ttl"></div><div class="row-sub" style="margin-top:2px;"></div></div>';
  head.querySelector('.ttl').textContent = name;
  head.querySelector('.row-sub').textContent = friendSubline(prof) || 'Freund';
  box.appendChild(head);
  var stats = document.createElement('div');
  stats.className = 'row-sub num';
  stats.style.cssText = 'margin:0 0 16px;white-space:normal;line-height:1.6;';
  stats.textContent = (prof.workouts ? prof.workouts + ' Workouts' : 'Noch kein Workout') + (prof.xp ? ' · ' + prof.xp.toLocaleString('de-DE') + ' XP' : '') + ' · Freunde seit ' + friendsFmtDate(new Date(f.acceptedAt || f.createdAt || 0).toISOString());
  box.appendChild(stats);
  if(typeof openChallengeSetup === 'function'){
    var ch = document.createElement('button');
    ch.type = 'button'; ch.className = 'btn pressable'; ch.style.cssText = 'margin:0 0 8px;'; ch.textContent = 'Zum Battle herausfordern';
    ch.onclick = function(){ sheetOut(ov, box); setTimeout(function(){ openChallengeSetup({uid:uid, name:name}, null); }, 300); };
    box.appendChild(ch);
  }
  var rm = document.createElement('button');
  rm.type = 'button'; rm.className = 'pressable u'; rm.style.cssText = PLAN_TEXTBTN_CSS; rm.textContent = 'Freund entfernen';
  rm.onclick = function(){
    sheetOut(ov, box);
    confirmSheet({title:name + ' entfernen?', desc:'Ihr seid dann keine Freunde mehr. Eine neue Anfrage ist jederzeit möglich.', confirmLabel:'Entfernen', onConfirm:function(){ deleteFriendship(f, name + ' entfernt'); }});
  };
  box.appendChild(rm);
  var close = document.createElement('button');
  close.type = 'button'; close.className = 'pressable u'; close.style.cssText = PLAN_TEXTBTN_CSS; close.textContent = 'Schließen';
  close.onclick = function(){ sheetOut(ov, box); };
  box.appendChild(close);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) sheetOut(ov, box); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}

// ── Freund hinzufügen: Namenssuche + Einladungslink ──
function openAddFriendSheet(){
  if(!friendsReady()){ toast('Bitte einloggen'); return; }
  var old = document.getElementById('addfriend-sheet');
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'addfriend-sheet';
  ov.style.cssText = PLAN_BACKDROP_CSS + 'z-index:2100;';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:85vh;overflow-y:auto;';
  box.appendChild(planSheetGrip());
  var t = document.createElement('div'); t.className = 'ttl'; t.style.cssText = 'margin-bottom:12px;'; t.textContent = 'Freund hinzufügen';
  box.appendChild(t);

  var inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'inp'; inp.placeholder = 'Name suchen …'; inp.setAttribute('aria-label', 'Freund suchen'); inp.autocomplete = 'off';
  box.appendChild(inp);
  var results = document.createElement('div');
  results.style.cssText = 'margin:10px 0 16px;';
  box.appendChild(results);
  var searchTimer = null;
  inp.oninput = function(){
    var q = inp.value.trim().toLowerCase();
    if(searchTimer) clearTimeout(searchTimer);
    if(q.length < 2){ results.innerHTML = ''; return; }
    searchTimer = setTimeout(function(){ searchProfiles(q, results); }, 250);
  };

  var lbl = document.createElement('div'); lbl.className = 'lbl'; lbl.style.cssText = 'margin-bottom:6px;'; lbl.textContent = 'Dein Einladungslink';
  box.appendChild(lbl);
  var code = profileInviteCode();
  var linkEl = document.createElement('div');
  linkEl.className = 'row-sub num';
  linkEl.style.cssText = 'margin:0 0 10px;white-space:normal;word-break:break-all;color:var(--text);';
  linkEl.textContent = code ? friendsInviteLink(code) : 'wird erstellt …';
  if(!code){ profileSync(); setTimeout(function(){ var c = profileInviteCode(); if(c) linkEl.textContent = friendsInviteLink(c); }, 2500); }
  box.appendChild(linkEl);
  var hint = document.createElement('div');
  hint.className = 'row-sub';
  hint.style.cssText = 'margin:0 0 10px;white-space:normal;line-height:1.5;';
  hint.textContent = 'Wer den Link öffnet und sich einloggt, ist direkt mit dir befreundet.';
  box.appendChild(hint);
  var row = document.createElement('div');
  row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;';
  var share = document.createElement('button'); share.type = 'button'; share.className = 'btn sec pressable'; share.style.cssText = 'margin:0;'; share.textContent = navigator.share ? 'Teilen' : 'Link kopieren';
  share.onclick = function(){ shareInviteLink(); };
  var copy = document.createElement('button'); copy.type = 'button'; copy.className = 'btn-g pressable'; copy.style.cssText = 'min-height:44px;'; copy.textContent = 'Kopieren';
  copy.onclick = function(){ copyInviteLink(); };
  row.appendChild(share); row.appendChild(copy);
  box.appendChild(row);

  var close = document.createElement('button');
  close.type = 'button'; close.className = 'pressable u'; close.style.cssText = PLAN_TEXTBTN_CSS; close.textContent = 'Schließen';
  close.onclick = function(){ sheetOut(ov, box); };
  box.appendChild(close);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) sheetOut(ov, box); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
  setTimeout(function(){ try{ inp.focus(); }catch(e){} }, 350);
}
// Präfixsuche auf nameLower in profiles; private Profile und ich selbst fallen raus
function searchProfiles(q, results){
  results.innerHTML = '<div class="empty" style="padding:8px 0;">Suche …</div>';
  db.collection('profiles').where('nameLower', '>=', q).where('nameLower', '<=', q + '').limit(10).get().then(function(snap){
    results.innerHTML = '';
    var found = [];
    snap.forEach(function(doc){
      var d = doc.data();
      if(doc.id === currentUser.uid || d.isPublic === false) return;
      found.push(Object.assign({uid:doc.id}, d));
    });
    if(!found.length){ results.innerHTML = '<div class="empty" style="padding:8px 0;">Niemanden gefunden. Schick stattdessen deinen Einladungslink.</div>'; return; }
    var list = document.createElement('div');
    list.className = 'list';
    found.forEach(function(p){
      var row = document.createElement('div');
      row.className = 'list-row';
      row.style.cssText = 'cursor:default;';
      row.innerHTML = friendAvatarHtml(p) + '<div class="row-main"><div class="row-title"></div><div class="row-sub"></div></div>';
      row.querySelector('.row-title').textContent = p.name || 'Athlet';
      row.querySelector('.row-sub').textContent = friendSubline(p) || 'Athlet';
      var id = friendPairId(currentUser.uid, p.uid);
      var existing = friendsState.friends.concat(friendsState.incoming, friendsState.outgoing).filter(function(f){ return f.id === id; })[0];
      var btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'btn sec sm pressable'; btn.style.cssText = 'flex-shrink:0;white-space:nowrap;';
      if(existing){ btn.textContent = existing.status === 'accepted' ? 'Freund' : 'Angefragt'; btn.disabled = true; }
      else { btn.textContent = 'Anfragen'; btn.onclick = function(){ btn.disabled = true; sendFriendRequest(p.uid, p.name, function(ok){ if(ok){ btn.textContent = 'Angefragt'; } else btn.disabled = false; }); }; }
      row.appendChild(btn);
      list.appendChild(row);
    });
    results.appendChild(list);
  }).catch(function(){ results.innerHTML = '<div class="empty" style="padding:8px 0;">Suche gerade nicht möglich.</div>'; });
}

// ── Freunde-Rangliste (Monats-XP, aus den xp-Dokumenten) ──
function openFriendsRanking(){
  var uids = friendsState.friends.map(friendOtherUid).concat([currentUser.uid]);
  var ov = document.createElement('div');
  ov.style.cssText = PLAN_BACKDROP_CSS + 'z-index:2100;';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:85vh;overflow-y:auto;';
  box.appendChild(planSheetGrip());
  var t = document.createElement('div'); t.className = 'ttl'; t.style.cssText = 'margin-bottom:4px;'; t.textContent = 'Freunde-Rangliste';
  var sub = document.createElement('div'); sub.className = 'row-sub'; sub.style.cssText = 'margin:0 0 12px;'; sub.textContent = 'XP in ' + new Date().toLocaleString('de-DE', {month:'long'}) + ' · nur du und deine Freunde';
  var listEl = document.createElement('div'); listEl.innerHTML = '<div class="empty">Lädt …</div>';
  box.appendChild(t); box.appendChild(sub); box.appendChild(listEl);
  var close = document.createElement('button'); close.type = 'button'; close.className = 'pressable u'; close.style.cssText = PLAN_TEXTBTN_CSS; close.textContent = 'Schließen';
  close.onclick = function(){ sheetOut(ov, box); };
  box.appendChild(close);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) sheetOut(ov, box); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);

  var monthKey = new Date().toISOString().slice(0, 7);
  Promise.all(uids.map(function(u){
    return db.collection('xp').doc(u).get().then(function(d){ var x = d.exists ? d.data() : {}; return {uid:u, monthly:(x.monthlyXP || {})[monthKey] || 0, level:x.level || 1}; }).catch(function(){ return {uid:u, monthly:0, level:1}; });
  })).then(function(rows){
    rows.sort(function(a, b){ return b.monthly - a.monthly; });
    listEl.innerHTML = '';
    var list = document.createElement('div'); list.className = 'list';
    rows.forEach(function(r, i){
      var me = r.uid === currentUser.uid, prof = me ? null : friendProfiles[r.uid];
      var row = document.createElement('div');
      row.className = 'list-row';
      row.style.cssText = 'cursor:default;' + (me ? 'background:var(--accent-soft);' : '');
      row.innerHTML = '<span class="row-index num"' + (i < 3 ? ' style="color:var(--accent);"' : '') + '>' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' + friendAvatarHtml(prof) +
        '<div class="row-main"><div class="row-title"></div><div class="row-sub num">Level ' + r.level + '</div></div>' +
        '<div style="display:flex;align-items:baseline;gap:4px;flex-shrink:0;"><span class="row-val num">' + r.monthly.toLocaleString('de-DE') + '</span><span class="unit">XP</span></div>';
      row.querySelector('.row-title').textContent = me ? 'Du' : ((prof && prof.name) || 'Athlet');
      list.appendChild(row);
    });
    listEl.appendChild(list);
    if(window.caliMotion) caliMotion.stagger(list);
  });
}

friendsCaptureInvite();
