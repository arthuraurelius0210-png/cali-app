// ══════════════════════════════════════════════════════════
// ACCOUNT.JS — Rechtliches und Konto
// Rechtstexte liegen in legal.html (Impressum, Datenschutz, AGB, Widerruf) und werden hier
// als Vollbild-Overlay gezeigt (auch vor dem Login). Konto: Passwort ändern, E-Mail ändern,
// Daten exportieren (JSON), Account löschen (Cloud Function deleteAccount löscht alles).
// ══════════════════════════════════════════════════════════

var LEGAL_TITLES = {impressum:'Impressum', datenschutz:'Datenschutzerklärung', agb:'AGB', widerruf:'Widerrufsbelehrung'};
var _legalHtml = null;

function openLegal(section){
  section = LEGAL_TITLES[section] ? section : 'impressum';
  var old = document.getElementById('legal-ov');
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'legal-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:2400;display:flex;flex-direction:column;overflow:hidden;';
  var top = document.createElement('div');
  top.className = 'topbar';
  top.style.cssText = 'margin:0 16px;flex-shrink:0;';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'icon-btn sm pressable';
  back.setAttribute('aria-label', 'Zurück');
  back.innerHTML = '&#8592;';
  back.onclick = function(){ if(typeof overlayClose === 'function') overlayClose(ov); else ov.remove(); };
  var ttl = document.createElement('div');
  ttl.className = 'topbar-title';
  ttl.textContent = LEGAL_TITLES[section];
  var slot = document.createElement('div');
  slot.className = 'topbar-slot';
  top.appendChild(back); top.appendChild(ttl); top.appendChild(slot);
  ov.appendChild(top);

  // Sprungleiste zwischen den vier Texten
  var nav = document.createElement('div');
  nav.className = 'seg-ctl';
  nav.style.cssText = 'margin:0 16px 10px;flex-shrink:0;';
  nav.setAttribute('role', 'tablist');
  Object.keys(LEGAL_TITLES).forEach(function(k){
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = k === 'datenschutz' ? 'Datenschutz' : (k === 'widerruf' ? 'Widerruf' : LEGAL_TITLES[k]);
    b.setAttribute('role', 'tab');
    if(k === section){ b.className = 'on'; b.setAttribute('aria-selected', 'true'); }
    b.onclick = function(){ ov.remove(); openLegal(k); };
    nav.appendChild(b);
  });
  ov.appendChild(nav);

  var body = document.createElement('div');
  body.className = 'sheet-scroll legal-body';
  body.style.cssText = 'flex:1;overflow-y:auto;padding:0 16px calc(var(--nav-h, 60px) + 24px + env(safe-area-inset-bottom,0px));font-size:12px;line-height:1.7;color:var(--text);';
  body.innerHTML = '<div class="empty">Lädt …</div>';
  ov.appendChild(body);
  if(!document.getElementById('legal-css')){
    var css = document.createElement('style');
    css.id = 'legal-css';
    css.textContent = '.legal-body h1{font-size:16px;letter-spacing:.08em;text-transform:uppercase;margin:6px 0 12px}.legal-body h2{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text);margin:18px 0 6px}.legal-body h3{font-size:12px;margin:12px 0 4px}.legal-body p{margin:0 0 10px;color:var(--muted)}.legal-body ul,.legal-body ol{margin:0 0 10px 18px;color:var(--muted)}.legal-body a{color:var(--accent)}.legal-body .eyebrow{display:none}.legal-body .note{border-left:2px solid var(--accent);padding:8px 12px;margin:12px 0;background:var(--card2)}.legal-body .todo{border:1px dashed var(--accent);border-radius:8px;padding:8px 12px;margin:0 0 12px;color:var(--accent);font-size:11px}.legal-body .small{color:var(--muted2)}.legal-body strong{color:var(--text)}';
    document.head.appendChild(css);
  }
  document.body.appendChild(ov);
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);

  var render = function(){
    try{
      var doc = new DOMParser().parseFromString(_legalHtml, 'text/html');
      var sec = doc.getElementById('legal-' + section);
      body.innerHTML = sec ? sec.innerHTML : '<div class="empty">Text nicht gefunden.</div>';
      body.scrollTop = 0;
    }catch(e){ body.innerHTML = '<div class="empty">Text konnte nicht geladen werden.</div>'; }
  };
  if(_legalHtml){ render(); return; }
  fetch('legal.html', {cache:'no-cache'}).then(function(r){ return r.text(); }).then(function(t){ _legalHtml = t; render(); })
    .catch(function(){ body.innerHTML = '<div class="empty">Text konnte nicht geladen werden. Direkt öffnen: <a href="legal.html#' + section + '" target="_blank">legal.html</a></div>'; });
}

// ── Hilfen ──
function accountSheet(id, title){
  var old = document.getElementById(id);
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = id;
  ov.style.cssText = PLAN_BACKDROP_CSS + 'z-index:2500;';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:88vh;overflow-y:auto;';
  box.appendChild(planSheetGrip());
  var t = document.createElement('div');
  t.className = 'ttl';
  t.style.cssText = 'margin-bottom:6px;';
  t.textContent = title;
  box.appendChild(t);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) sheetOut(ov, box); };
  return {ov:ov, box:box, show:function(){ document.body.appendChild(ov); if(window.caliMotion) caliMotion.sheetIn(box, ov); }, close:function(){ sheetOut(ov, box); },
    add:function(tag, cls, css, text){ var n = document.createElement(tag); if(cls) n.className = cls; if(css) n.style.cssText = css; if(text !== undefined) n.textContent = text; box.appendChild(n); return n; },
    input:function(type, placeholder, label){ var l = document.createElement('div'); l.className = 'lbl'; l.style.cssText = 'margin:0 0 6px;'; l.textContent = label; box.appendChild(l); var i = document.createElement('input'); i.type = type; i.className = 'inp'; i.placeholder = placeholder || ''; i.style.cssText = 'margin-bottom:10px;'; i.autocomplete = type === 'password' ? 'current-password' : 'off'; box.appendChild(i); return i; },
    error:function(){ var e = document.createElement('div'); e.style.cssText = 'color:var(--red);font-size:11px;text-align:center;margin:0 0 8px;min-height:14px;'; box.appendChild(e); return e; },
    cancel:function(label){ var c = document.createElement('button'); c.type = 'button'; c.className = 'pressable u'; c.style.cssText = PLAN_TEXTBTN_CSS; c.textContent = label || 'Abbrechen'; c.onclick = function(){ sheetOut(ov, box); }; box.appendChild(c); return c; }
  };
}
function accountHasPassword(){
  var u = firebase.auth().currentUser;
  if(!u || !u.providerData) return false;
  for(var i=0;i<u.providerData.length;i++){ if(u.providerData[i] && u.providerData[i].providerId === 'password') return true; }
  return false;
}
function accountReauth(password){
  var u = firebase.auth().currentUser;
  var cred = firebase.auth.EmailAuthProvider.credential(u.email, password);
  return u.reauthenticateWithCredential(cred);
}
function accountErr(e){
  var code = (e && e.code) || '';
  if(code === 'auth/invalid-credential' || code === 'auth/wrong-password') return 'Aktuelles Passwort ist falsch';
  if(code === 'auth/requires-recent-login') return 'Bitte neu einloggen und nochmal versuchen';
  if(code === 'auth/email-already-in-use') return 'Diese E-Mail wird schon benutzt';
  if(typeof getAuthError === 'function' && code) return getAuthError(code);
  return (e && e.message) || 'Fehler';
}

// ── Passwort ändern ──
function openChangePassword(){
  if(!firebase.auth().currentUser){ toast('Bitte einloggen'); return; }
  if(!accountHasPassword()){ toast('Du bist mit Google angemeldet. Das Passwort verwaltest du bei Google.'); return; }
  var s = accountSheet('pw-sheet', 'Passwort ändern');
  s.add('div', 'row-sub', 'margin:0 0 14px;white-space:normal;', 'Zur Sicherheit erst das aktuelle Passwort, dann zweimal das neue (mindestens 6 Zeichen).');
  var cur = s.input('password', 'Aktuelles Passwort', 'Aktuell');
  var n1 = s.input('password', 'Neues Passwort', 'Neu'); n1.autocomplete = 'new-password';
  var n2 = s.input('password', 'Neues Passwort wiederholen', 'Wiederholen'); n2.autocomplete = 'new-password';
  var err = s.error();
  var ok = s.add('button', 'btn pressable', 'margin:0 0 4px;', 'Passwort speichern');
  ok.type = 'button';
  ok.onclick = function(){
    err.textContent = '';
    if(n1.value.length < 6){ err.textContent = 'Mindestens 6 Zeichen'; return; }
    if(n1.value !== n2.value){ err.textContent = 'Die neuen Passwörter sind nicht gleich'; return; }
    ok.disabled = true;
    accountReauth(cur.value).then(function(){ return firebase.auth().currentUser.updatePassword(n1.value); })
      .then(function(){ s.close(); toast('Passwort geändert'); })
      .catch(function(e){ err.textContent = accountErr(e); ok.disabled = false; });
  };
  s.cancel();
  s.show();
}

// ── E-Mail ändern (Bestätigung geht an die neue Adresse, erst dann gilt sie) ──
function openChangeEmail(){
  var u = firebase.auth().currentUser;
  if(!u){ toast('Bitte einloggen'); return; }
  if(!accountHasPassword()){ toast('Du bist mit Google angemeldet. Die E-Mail verwaltest du bei Google.'); return; }
  var s = accountSheet('mail-sheet', 'E-Mail ändern');
  s.add('div', 'row-sub', 'margin:0 0 14px;white-space:normal;', 'Aktuell: ' + (u.email || '') + '. Du bekommst eine Bestätigung an die neue Adresse; erst nach dem Klick darauf gilt sie.');
  var mail = s.input('email', 'neue@adresse.de', 'Neue E-Mail');
  var pw = s.input('password', 'Aktuelles Passwort', 'Passwort');
  var err = s.error();
  var ok = s.add('button', 'btn pressable', 'margin:0 0 4px;', 'Bestätigung senden');
  ok.type = 'button';
  ok.onclick = function(){
    err.textContent = '';
    var m = mail.value.trim();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)){ err.textContent = 'Bitte eine gültige E-Mail eingeben'; return; }
    ok.disabled = true;
    accountReauth(pw.value).then(function(){ return firebase.auth().currentUser.verifyBeforeUpdateEmail(m); })
      .then(function(){ s.close(); toast('Bestätigungsmail an ' + m + ' gesendet'); })
      .catch(function(e){ err.textContent = accountErr(e); ok.disabled = false; });
  };
  s.cancel();
  s.show();
}

// ── Daten exportieren (Art. 20 DSGVO): alles zu deinem Konto als JSON-Datei ──
function exportMyData(){
  var u = firebase.auth().currentUser;
  if(!u || typeof db === 'undefined'){ toast('Bitte einloggen'); return; }
  toast('Export wird erstellt …');
  var uid = u.uid;
  function one(col){ return db.collection(col).doc(uid).get().then(function(d){ return d.exists ? d.data() : null; }).catch(function(){ return null; }); }
  function many(col, field){ return db.collection(col).where(field, '==', uid).limit(500).get().then(function(s){ var a = []; s.forEach(function(d){ a.push(Object.assign({id:d.id}, d.data())); }); return a; }).catch(function(){ return []; }); }
  Promise.all([
    one('users'), one('profiles'), one('wallets'), one('xp'), one('verifiedBadges'), one('personalBests'),
    many('xpLog', 'uid'), many('verifications', 'uid'), many('communityChallenges', 'uid'), many('trainingBuddies', 'uid'), many('globalLeaderboard', 'uid'), many('purchases', 'uid'),
    db.collection('friendships').where('members', 'array-contains', uid).get().then(function(s){ var a = []; s.forEach(function(d){ a.push(Object.assign({id:d.id}, d.data())); }); return a; }).catch(function(){ return []; }),
    many('battles', 'challengerId'), many('battles', 'challengedId')
  ]).then(function(r){
    var data = {
      exportiertAm: new Date().toISOString(), konto: {uid:uid, email:u.email || null, name:u.displayName || null, erstellt:(u.metadata && u.metadata.creationTime) || null},
      trainingsdaten: r[0], oeffentlichesProfil: r[1], geldboerse: r[2], xp: r[3], verifizierteAbzeichen: r[4], bestwerte: r[5],
      xpVerlauf: r[6], abnahmen: r[7].map(function(v){ delete v.videoPath; return v; }), communityChallenges: r[8], trainingspartnerGesuche: r[9], ranglistenEintraege: r[10], kaeufe: r[11],
      freundschaften: r[12], battles: r[13].concat(r[14]),
      lokal: {}
    };
    try{ for(var i=0;i<localStorage.length;i++){ var k = localStorage.key(i); if(k && k.indexOf('cali_') === 0) data.lokal[k] = localStorage.getItem(k); } }catch(e){}
    var blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    var name = 'cali-daten-' + new Date().toISOString().slice(0, 10) + '.json';
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(function(){ a.remove(); URL.revokeObjectURL(url); }, 4000);
    toast('Export gespeichert: ' + name);
  }).catch(function(e){ toast('Export fehlgeschlagen: ' + (e && e.message ? e.message : '')); });
}

// ── Account löschen: Cloud Function löscht Konto und alle Daten, danach Gerät leeren ──
function openDeleteAccount(){
  var u = firebase.auth().currentUser;
  if(!u){ toast('Bitte einloggen'); return; }
  var s = accountSheet('del-sheet', 'Account löschen');
  s.add('div', 'row-sub', 'margin:0 0 10px;white-space:normal;line-height:1.5;', 'Das löscht dein Konto und alle Daten: Training, Max-Werte, Pläne, Challenges, XP, Diamanten, Abzeichen, Freundschaften, Community-Beiträge, Videos und dein öffentliches Profil. Zahlungsbelege behalten wir aus steuerlichen Gründen. Das lässt sich nicht rückgängig machen.');
  s.add('div', 'row-sub', 'margin:0 0 12px;white-space:normal;', 'Tipp: Vorher „Daten exportieren", wenn du etwas behalten willst.');
  var inp = s.input('text', 'LÖSCHEN', 'Zum Bestätigen LÖSCHEN eingeben');
  inp.autocapitalize = 'characters';
  var err = s.error();
  var ok = s.add('button', 'btn-g danger pressable', 'width:100%;min-height:48px;margin:0 0 4px;', 'Konto endgültig löschen');
  ok.type = 'button';
  ok.onclick = function(){
    err.textContent = '';
    if(inp.value.trim().toUpperCase() !== 'LÖSCHEN'){ err.textContent = 'Bitte LÖSCHEN eingeben'; return; }
    ok.disabled = true; ok.textContent = 'Wird gelöscht …';
    firebase.functions().httpsCallable('deleteAccount')({confirm:'LÖSCHEN'}).then(function(){
      try{ var keys = []; for(var i=0;i<localStorage.length;i++){ var k = localStorage.key(i); if(k && k.indexOf('cali_') === 0) keys.push(k); } keys.forEach(function(k){ localStorage.removeItem(k); }); }catch(e){}
      s.close();
      toast('Konto gelöscht');
      return firebase.auth().signOut().catch(function(){});
    }).then(function(){ setTimeout(function(){ location.reload(); }, 800); })
      .catch(function(e){ err.textContent = (e && e.message) || 'Löschen fehlgeschlagen'; ok.disabled = false; ok.textContent = 'Konto endgültig löschen'; });
  };
  s.cancel();
  s.show();
}
