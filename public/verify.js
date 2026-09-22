// ══════════════════════════════════════════════════════════
// VERIFY.JS — Abnahme einer Challenge per Video
// Die Aufnahme ist der Versuch selbst: Beim Annehmen wählt man „Annehmen und aufnehmen" (oder im
// Challenge-Sheet „Aufnehmen für Abnahme"), nur bei Challenges, die in einer Einheit gehen
// (econRecordable). Ablauf: startVerification gibt einen vierstelligen Code aus → das Video wird
// IN DER APP mit der Handykamera aufgenommen (getUserMedia + MediaRecorder, kein Datei-Upload),
// der Code muss am Anfang zu sehen oder zu hören sein → Upload nach
// verificationVideos/{uid}/{id}.<ext> → requestVerification bucht 1000 Diamanten ab und setzt
// verifications/{id} auf „pending" → Admin entscheidet im Admin-Panel (Tab „Abnahme",
// reviewVerification) → Abzeichen in verifiedBadges/{uid}, Video wird gelöscht.
// ══════════════════════════════════════════════════════════

var VERIFY_RULES = [
  'Die Aufnahme ist dein Versuch: Du filmst die Challenge, während du sie machst, direkt hier in der App. Fertige Videos hochladen geht nicht.',
  'Du bekommst einen Code. Zeig ihn am Anfang in die Kamera oder sag ihn laut.',
  'Alles muss zu sehen sein. Pause zwischen den Sätzen ist erlaubt, die Aufnahme bleibt dabei in der App.',
  'Höchstens 20 Minuten. Das Video sehen nur du und der Prüfer, nach der Entscheidung wird es gelöscht.'
];
var VERIFY_STATUS = {recording:'Aufnahme offen', pending:'Wird geprüft', approved:'Verifiziert', rejected:'Abgelehnt'};
var VERIFY_MAX_SECONDS = 1200;

function verifyKindLabel(item){
  if(item.kind === 'weekly') return 'Wochen-Challenge' + (item.week && typeof weeklyNum === 'function' ? ' · KW ' + weeklyNum(item.week) : '');
  return 'Challenge';
}
function verifyFmtDate(ms){
  var d = new Date(typeof ms === 'string' ? ms : (ms || 0));
  if(isNaN(d.getTime())) return '';
  return (d.getDate() < 10 ? '0' : '') + d.getDate() + '.' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '.' + d.getFullYear();
}
function verifyFmtClock(sec){
  sec = Math.max(0, Math.floor(sec || 0));
  var m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
// Stand der Abnahme zu einem Schlüssel: null | 'recording' | 'pending' | 'approved' | 'rejected'
function verifyStatusFor(key){
  var v = walletState.verifications[key];
  return v ? v.status : null;
}
// Abnahme-Objekt für die aktive Challenge (Schlüssel wie im wallets-Dokument des Servers)
function verifyItemForActive(){
  if(typeof activeChallenge === 'undefined' || !activeChallenge) return null;
  return {key:'challenge|' + String(activeChallenge.id) + '|' + String(activeChallenge.startDate || ''), kind:'challenge', id:String(activeChallenge.id), title:activeChallenge.title, week:null, date:activeChallenge.startDate || null};
}
function verifyCanRecord(){
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof MediaRecorder !== 'undefined');
}
// Bestes Aufnahmeformat des Geräts: iOS liefert mp4, Android/Chrome webm
function verifyPickMime(){
  if(typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return '';
  var cands = ['video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  for(var i=0;i<cands.length;i++){ if(MediaRecorder.isTypeSupported(cands[i])) return cands[i]; }
  return '';
}

// ── Profil: Abschnitt „Abnahmen" (#pr-verify in pages.html) ──
function buildVerifySection(){
  var el = document.getElementById('pr-verify');
  if(!el) return;
  el.innerHTML = '';
  var card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'margin-bottom:0;';
  var head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;';
  head.innerHTML = '<div><span class="eyebrow" style="margin:0;">Abnahmen</span><div class="row-sub num" style="margin:2px 0 0;">' + (currency.diamonds || 0) + ' Diamanten</div></div>';
  var shopBtn = document.createElement('button');
  shopBtn.type = 'button';
  shopBtn.className = 'btn-g sm pressable';
  shopBtn.textContent = 'Diamanten';
  shopBtn.onclick = function(){ openShopSheet(); };
  head.appendChild(shopBtn);
  card.appendChild(head);

  if(!currentUser){
    var hint = document.createElement('div');
    hint.className = 'empty';
    hint.textContent = 'Einloggen, um Challenges verifizieren zu lassen.';
    card.appendChild(hint);
    el.appendChild(card);
    return;
  }

  var how = document.createElement('div');
  how.className = 'row-sub';
  how.style.cssText = 'margin:0 0 10px;white-space:normal;line-height:1.5;';
  how.textContent = 'Eine Abnahme startest du beim Annehmen einer Challenge mit „Annehmen und aufnehmen". Die Aufnahme ist dein Versuch, wir prüfen sie und du bekommst das Abzeichen „Verifiziert". Kostet ' + CALI_ECON.verifyCost + ' Diamanten.';
  card.appendChild(how);

  var keys = Object.keys(walletState.verifications);
  if(!keys.length){
    var none = document.createElement('div');
    none.className = 'row-sub';
    none.style.cssText = 'margin:0;white-space:normal;';
    none.textContent = 'Noch keine Abnahme.';
    card.appendChild(none);
  } else {
    var list = document.createElement('div');
    list.className = 'list';
    keys.map(function(k){ return Object.assign({key:k}, walletState.verifications[k]); })
      .sort(function(a, b){ return (b.at || 0) - (a.at || 0); })
      .forEach(function(v){
        var item = null;
        for(var i=0;i<walletState.completed.length;i++){ if(walletState.completed[i].key === v.key){ item = walletState.completed[i]; break; } }
        var row = document.createElement('div');
        row.className = 'list-row';
        row.style.cssText = 'cursor:default;';
        var main = document.createElement('div');
        main.className = 'row-main';
        var t = document.createElement('div');
        t.className = 'row-title';
        t.textContent = item ? item.title : v.key;
        var s = document.createElement('div');
        s.className = 'row-sub';
        s.style.cssText = 'white-space:normal;';
        s.textContent = (item ? verifyKindLabel(item) + ' · ' : '') + verifyFmtDate(v.at) + (v.status === 'rejected' && v.note ? ' · ' + v.note : '') + (v.refunded ? ' · Diamanten zurück' : '') + (v.status === 'recording' ? ' · noch nicht eingereicht' : '');
        main.appendChild(t); main.appendChild(s);
        var chip = document.createElement('span');
        chip.style.cssText = PLAN_TAG_CSS + 'flex-shrink:0;' + (v.status === 'approved' ? 'color:var(--accent);border-color:var(--accent);' : '');
        chip.textContent = VERIFY_STATUS[v.status] || v.status;
        row.appendChild(main); row.appendChild(chip);
        list.appendChild(row);
      });
    card.appendChild(list);
  }
  el.appendChild(card);
}

// ── Vorab-Sheet: Regeln, Preis, dann Code holen und Kamera öffnen ──
// item = {key, kind, id, title, week, date} (verifyItemForActive bzw. aus wochen.js)
function openVerifyStart(item){
  if(!item) return;
  if(!currentUser){ toast('Bitte einloggen'); return; }
  var st = verifyStatusFor(item.key);
  if(st === 'pending'){ toast('Die Abnahme läuft schon'); return; }
  if(st === 'approved'){ toast('Schon verifiziert'); return; }
  var old = document.getElementById('verify-sheet');
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'verify-sheet';
  ov.style.cssText = PLAN_BACKDROP_CSS + 'z-index:2100;';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:88vh;overflow-y:auto;';
  box.appendChild(planSheetGrip());

  function add(tag, cls, css, text){
    var n = document.createElement(tag);
    if(cls) n.className = cls;
    if(css) n.style.cssText = css;
    if(text !== undefined) n.textContent = text;
    box.appendChild(n);
    return n;
  }
  add('span', 'eyebrow', '', 'Abnahme');
  add('div', 'ttl', 'margin-bottom:4px;', item.title);
  add('div', 'row-sub', 'margin:0 0 12px;', verifyKindLabel(item));
  add('div', 'lbl', 'margin-bottom:6px;', 'So klappt die Abnahme');
  var ul = add('div', 'list numbered', 'margin-bottom:14px;');
  VERIFY_RULES.forEach(function(r){
    var row = document.createElement('div');
    row.className = 'list-row';
    row.style.cssText = 'cursor:default;min-height:40px;';
    row.innerHTML = '<div class="row-main"><div class="row-sub" style="white-space:normal;color:var(--text);"></div></div>';
    row.querySelector('.row-sub').textContent = r;
    ul.appendChild(row);
  });

  var cost = CALI_ECON.verifyCost, have = currency.diamonds || 0, enough = have >= cost;
  add('div', 'row-sub num', 'margin:0 0 14px;color:' + (enough ? 'var(--text)' : 'var(--red)') + ';', 'Kostet ' + cost + ' Diamanten (' + econDiamondsEuro(cost) + '), abgebucht erst beim Einreichen. Du hast ' + have + '.' + (enough ? '' : ' Zu wenig.'));

  var canRec = verifyCanRecord();
  if(!canRec) add('div', 'row-sub', 'margin:0 0 12px;white-space:normal;color:var(--red);', 'Dieses Gerät oder dieser Browser kann hier nicht aufnehmen. Öffne die App auf dem Handy (Safari oder Chrome).');

  var start = add('button', 'btn pressable', 'margin:0 0 8px;', 'Kamera öffnen und aufnehmen');
  start.type = 'button';
  start.disabled = !enough || !canRec;
  var status = add('div', 'row-sub num', 'margin:0 0 8px;min-height:14px;text-align:center;', '');
  start.onclick = function(){
    if(!currentUser){ toast('Bitte einloggen'); return; }
    start.disabled = true;
    status.textContent = 'Code wird geholt …';
    // Erst den Stand speichern: der Server liest die aktive Challenge aus users/{uid}
    var saved = (typeof fbSave === 'function') ? fbSave() : null;
    Promise.resolve(saved).catch(function(){}).then(function(){
      return walletCall('startVerification', {key:item.key});
    }).then(function(d){
      walletApply(d.wallet);
      sheetOut(ov, box);
      setTimeout(function(){ openVerifyRecorder(item, d); }, 250);
    }).catch(function(e){
      status.textContent = '';
      toast(walletErrorMessage(e));
      start.disabled = false;
    });
  };
  var close = add('button', 'pressable u', PLAN_TEXTBTN_CSS, 'Abbrechen');
  close.type = 'button';
  close.onclick = function(){ sheetOut(ov, box); };

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) sheetOut(ov, box); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}

// ── Aufnahme in der App ──
// Vollbild: Code oben, Kamerabild, Aufnahme/Pause/Stopp, danach Vorschau und Einreichen.
// session = {id, code, expiresAt} aus startVerification.
function openVerifyRecorder(item, session){
  var old = document.getElementById('verify-rec');
  if(old) old.remove();
  var stream = null, rec = null, chunks = [], blob = null, mime = verifyPickMime();
  var facing = 'environment', recording = false, paused = false, seconds = 0, tick = null, previewUrl = null;

  var ov = document.createElement('div');
  ov.id = 'verify-rec';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:2200;display:flex;flex-direction:column;overflow:hidden;';

  function stopStream(){
    if(stream){ try{ stream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} stream = null; }
  }
  function cleanup(){
    if(tick){ clearInterval(tick); tick = null; }
    if(rec && rec.state !== 'inactive'){ try{ rec.stop(); }catch(e){} }
    stopStream();
    if(previewUrl){ try{ URL.revokeObjectURL(previewUrl); }catch(e){} previewUrl = null; }
  }
  function close(){
    cleanup();
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
    buildVerifySection();
  }

  // Kopfzeile
  var top = document.createElement('div');
  top.className = 'topbar';
  top.style.cssText = 'margin:0 16px;flex-shrink:0;';
  var back = document.createElement('button');
  back.type = 'button';
  back.className = 'icon-btn sm pressable';
  back.setAttribute('aria-label', 'Abbrechen');
  back.innerHTML = '&#8592;';
  back.onclick = function(){
    if(recording || blob){
      confirmSheet({title:'Aufnahme verwerfen?', desc:'Der Code bleibt gültig, du kannst gleich neu starten.', confirmLabel:'Verwerfen', onConfirm:close});
    } else close();
  };
  var ttl = document.createElement('div');
  ttl.className = 'topbar-title';
  ttl.textContent = 'Abnahme';
  var slot = document.createElement('div');
  slot.className = 'topbar-slot';
  top.appendChild(back); top.appendChild(ttl); top.appendChild(slot);
  ov.appendChild(top);

  var body = document.createElement('div');
  body.className = 'sheet-scroll';
  body.style.cssText = 'flex:1;overflow-y:auto;padding:0 16px calc(24px + env(safe-area-inset-bottom,0px));';
  ov.appendChild(body);

  // Code-Karte
  var codeCard = document.createElement('div');
  codeCard.className = 'card';
  codeCard.style.cssText = 'display:flex;align-items:center;gap:14px;margin-bottom:10px;';
  codeCard.innerHTML = '<div><span class="eyebrow" style="margin:0 0 2px;">Dein Code</span><div class="kpi num" style="font-size:34px;letter-spacing:.12em;"></div></div>' +
    '<div class="row-sub" style="white-space:normal;line-height:1.5;margin:0;flex:1;">Zeig den Code am Anfang in die Kamera (auf Papier oder Hand) oder sag ihn laut. Ohne Code keine Abnahme.</div>';
  codeCard.querySelector('.kpi').textContent = session.code;
  body.appendChild(codeCard);

  var sub = document.createElement('div');
  sub.className = 'row-sub';
  sub.style.cssText = 'margin:0 0 10px;';
  sub.textContent = item.title + ' · ' + verifyKindLabel(item);
  body.appendChild(sub);

  // Kamerabild / Vorschau
  var frame = document.createElement('div');
  frame.style.cssText = 'position:relative;background:#000;border:1px solid var(--line);border-radius:var(--r-card);overflow:hidden;aspect-ratio:3/4;max-height:52vh;margin-bottom:10px;';
  var live = document.createElement('video');
  live.autoplay = true; live.muted = true; live.playsInline = true;
  live.setAttribute('playsinline', ''); live.setAttribute('muted', '');
  live.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
  var play = document.createElement('video');
  play.controls = true; play.playsInline = true;
  play.setAttribute('playsinline', '');
  play.style.cssText = 'width:100%;height:100%;object-fit:contain;display:none;background:#000;';
  var camMsg = document.createElement('div');
  camMsg.className = 'row-sub';
  camMsg.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;white-space:normal;line-height:1.5;';
  camMsg.textContent = 'Kamera wird geöffnet …';
  var clock = document.createElement('div');
  clock.className = 'num';
  clock.style.cssText = PLAN_TAG_CSS + 'position:absolute;top:10px;left:10px;background:var(--card);display:inline-flex;align-items:center;gap:6px;';
  clock.innerHTML = '<span class="live-dot" style="display:none;"></span><span>00:00</span>';
  frame.appendChild(live); frame.appendChild(play); frame.appendChild(camMsg); frame.appendChild(clock);
  body.appendChild(frame);

  var clockDot = clock.querySelector('.live-dot'), clockTxt = clock.querySelector('span:last-child');
  function setClock(){ clockTxt.textContent = verifyFmtClock(seconds) + ' / ' + verifyFmtClock(VERIFY_MAX_SECONDS); }
  setClock();

  // Bedienung
  var ctrl = document.createElement('div');
  ctrl.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;';
  var recBtn = document.createElement('button');
  recBtn.type = 'button';
  recBtn.className = 'btn pressable';
  recBtn.style.cssText = 'margin:0;grid-column:1 / -1;';
  recBtn.textContent = 'Aufnahme starten';
  recBtn.disabled = true;
  var pauseBtn = document.createElement('button');
  pauseBtn.type = 'button';
  pauseBtn.className = 'btn-g pressable';
  pauseBtn.style.cssText = 'min-height:44px;display:none;';
  pauseBtn.textContent = 'Pause';
  var flipBtn = document.createElement('button');
  flipBtn.type = 'button';
  flipBtn.className = 'btn-g pressable';
  flipBtn.style.cssText = 'min-height:44px;';
  flipBtn.textContent = 'Kamera wechseln';
  ctrl.appendChild(recBtn); ctrl.appendChild(pauseBtn); ctrl.appendChild(flipBtn);
  body.appendChild(ctrl);

  var status = document.createElement('div');
  status.className = 'row-sub num';
  status.style.cssText = 'margin:0 0 8px;min-height:14px;text-align:center;white-space:normal;';
  body.appendChild(status);

  var submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.className = 'btn pressable';
  submitBtn.style.cssText = 'margin:0 0 8px;display:none;';
  submitBtn.textContent = 'Einreichen (' + CALI_ECON.verifyCost + ' Diamanten)';
  var againBtn = document.createElement('button');
  againBtn.type = 'button';
  againBtn.className = 'btn-g pressable';
  againBtn.style.cssText = 'width:100%;min-height:44px;margin-bottom:8px;display:none;';
  againBtn.textContent = 'Neu aufnehmen';
  body.appendChild(submitBtn); body.appendChild(againBtn);

  function openCamera(){
    stopStream();
    camMsg.style.display = 'flex';
    camMsg.textContent = 'Kamera wird geöffnet …';
    recBtn.disabled = true;
    var constraints = {video:{facingMode:facing, width:{ideal:1280}, height:{ideal:720}}, audio:true};
    return navigator.mediaDevices.getUserMedia(constraints).catch(function(){
      // Ohne Mikrofon weiter (Code kann dann nur gezeigt werden)
      return navigator.mediaDevices.getUserMedia({video:{facingMode:facing}, audio:false});
    }).then(function(s){
      stream = s;
      live.srcObject = s;
      live.style.display = 'block';
      play.style.display = 'none';
      camMsg.style.display = 'none';
      recBtn.disabled = false;
      try{ live.play(); }catch(e){}
    }).catch(function(e){
      camMsg.textContent = 'Kamera nicht freigegeben. Erlaube der App den Zugriff auf Kamera und Mikrofon und versuch es nochmal.';
      recBtn.disabled = true;
    });
  }

  function startRec(){
    if(!stream) return;
    chunks = []; blob = null; seconds = 0; paused = false;
    var opts = {videoBitsPerSecond: 1200000};
    if(mime) opts.mimeType = mime;
    try{ rec = new MediaRecorder(stream, opts); }
    catch(e){ try{ rec = new MediaRecorder(stream); }catch(e2){ toast('Aufnahme auf diesem Gerät nicht möglich'); return; } }
    rec.ondataavailable = function(ev){ if(ev.data && ev.data.size) chunks.push(ev.data); };
    rec.onstop = function(){
      var type = (rec && rec.mimeType) || mime || 'video/webm';
      blob = new Blob(chunks, {type:type.split(';')[0]});
      stopStream();
      previewUrl = URL.createObjectURL(blob);
      play.src = previewUrl;
      live.style.display = 'none';
      play.style.display = 'block';
      recBtn.style.display = 'none'; pauseBtn.style.display = 'none'; flipBtn.style.display = 'none';
      submitBtn.style.display = 'block'; againBtn.style.display = 'block';
      status.textContent = verifyFmtClock(seconds) + ' aufgenommen · ' + (blob.size / 1048576).toFixed(1) + ' MB';
    };
    rec.start(1000);
    recording = true;
    clockDot.style.display = 'inline-block';
    recBtn.textContent = 'Stopp';
    recBtn.className = 'btn sec pressable';
    pauseBtn.style.display = 'block';
    flipBtn.style.display = 'none';
    setClock();
    tick = setInterval(function(){
      if(paused) return;
      seconds++;
      setClock();
      if(seconds >= VERIFY_MAX_SECONDS) stopRec();
    }, 1000);
  }
  function stopRec(){
    if(!rec || rec.state === 'inactive') return;
    if(tick){ clearInterval(tick); tick = null; }
    recording = false;
    clockDot.style.display = 'none';
    try{ if(rec.state === 'paused') rec.resume(); }catch(e){}
    try{ rec.stop(); }catch(e){}
  }
  recBtn.onclick = function(){ if(recording) stopRec(); else startRec(); };
  pauseBtn.onclick = function(){
    if(!rec) return;
    if(!paused){ try{ rec.pause(); }catch(e){ return; } paused = true; pauseBtn.textContent = 'Weiter'; clockDot.style.display = 'none'; }
    else { try{ rec.resume(); }catch(e){ return; } paused = false; pauseBtn.textContent = 'Pause'; clockDot.style.display = 'inline-block'; }
  };
  flipBtn.onclick = function(){ facing = facing === 'environment' ? 'user' : 'environment'; openCamera(); };
  againBtn.onclick = function(){
    blob = null; chunks = []; seconds = 0; setClock();
    if(previewUrl){ try{ URL.revokeObjectURL(previewUrl); }catch(e){} previewUrl = null; }
    play.removeAttribute('src'); play.load();
    submitBtn.style.display = 'none'; againBtn.style.display = 'none';
    recBtn.style.display = 'block'; recBtn.textContent = 'Aufnahme starten'; recBtn.className = 'btn pressable';
    flipBtn.style.display = 'block';
    status.textContent = '';
    openCamera();
  };
  submitBtn.onclick = function(){
    if(!blob || !currentUser) return;
    if(Date.now() > (session.expiresAt || 0)){ toast('Der Code ist abgelaufen, bitte neu starten'); return; }
    submitBtn.disabled = true; againBtn.disabled = true;
    var type = blob.type || (mime ? mime.split(';')[0] : 'video/webm');
    var ext = /mp4/.test(type) ? 'mp4' : 'webm';
    var path = 'verificationVideos/' + currentUser.uid + '/' + session.id + '.' + ext;
    var task = firebase.storage().ref(path).put(blob, {contentType:type});
    task.on('state_changed', function(snap){
      status.textContent = 'Hochladen ' + Math.round(snap.bytesTransferred / snap.totalBytes * 100) + ' %';
    }, function(e){
      status.textContent = '';
      toast('Upload fehlgeschlagen: ' + (e && e.message ? e.message : ''));
      submitBtn.disabled = false; againBtn.disabled = false;
    }, function(){
      status.textContent = 'Wird eingereicht …';
      walletCall('requestVerification', {id:session.id, videoPath:path, seconds:seconds}).then(function(d){
        walletApply(d.wallet);
        close();
        if(window.caliMotion && caliMotion.celebrate) caliMotion.celebrate('burst');
        toast('Abnahme eingereicht. Du bekommst Bescheid im Profil.');
      }).catch(function(e){
        status.textContent = '';
        toast(walletErrorMessage(e));
        submitBtn.disabled = false; againBtn.disabled = false;
      });
    });
  };

  document.body.appendChild(ov);
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);
  openCamera();
}

// ── Verifizierte Abzeichen im Profil (vor den normalen Abzeichen) ──
function loadVerifiedBadges(){
  if(!currentUser) return;
  db.collection('verifiedBadges').doc(currentUser.uid).get().then(function(doc){
    walletState.badges = (doc.exists && Array.isArray(doc.data().items)) ? doc.data().items : [];
    var pg = document.getElementById('page-pr');
    if(pg && pg.classList.contains('on') && typeof buildProfilUI === 'function') buildProfilUI();
  }).catch(function(){});
}
function renderVerifiedBadges(badgeEl){
  if(!badgeEl || !walletState.badges.length) return 0;
  walletState.badges.slice().sort(function(a, b){ return (b.at || 0) - (a.at || 0); }).forEach(function(b){
    var box = document.createElement('div');
    box.className = 'badge-item';
    box.style.cssText = 'margin:0;width:calc(50% - 4px);box-sizing:border-box;flex-direction:column;align-items:flex-start;gap:10px;padding:12px;border-color:var(--accent);';
    var icon = document.createElement('div');
    icon.style.cssText = 'flex-shrink:0;';
    icon.innerHTML = (typeof iconWrap === 'function') ? iconWrap('check', {size:18, box:36, color:'var(--accent)'}) : '';
    var info = document.createElement('div');
    info.style.cssText = 'min-width:0;width:100%;';
    var t = document.createElement('div');
    t.className = 'row-title';
    t.textContent = b.title || 'Challenge';
    var d = document.createElement('div');
    d.className = 'row-sub';
    d.style.cssText = 'white-space:normal;color:var(--accent);';
    d.textContent = 'Verifiziert · ' + verifyFmtDate(b.at);
    info.appendChild(t); info.appendChild(d);
    box.appendChild(icon); box.appendChild(info);
    badgeEl.appendChild(box);
  });
  return walletState.badges.length;
}

// ── Admin-Panel, Tab „Abnahme" (parks.js ruft renderVerifyAdmin(el)) ──
function renderVerifyAdmin(el){
  el.innerHTML = '<div class="empty">Lädt…</div>';
  function rerender(){ el._loaded = false; renderVerifyAdmin(el); }

  db.collection('verifications').orderBy('createdAt', 'desc').limit(60).get().then(function(snap){
    el.innerHTML = '';
    var pending = [], done = [];
    snap.forEach(function(d){
      var x = Object.assign({id:d.id}, d.data());
      if(x.status === 'pending') pending.push(x);
      else if(x.status === 'approved' || x.status === 'rejected') done.push(x);
    });
    pending.sort(function(a, b){ return (a.submittedAt || a.createdAt || 0) - (b.submittedAt || b.createdAt || 0); });

    // Diamanten gutschreiben
    var grant = document.createElement('div');
    grant.className = 'card';
    grant.innerHTML = '<span class="eyebrow">Diamanten gutschreiben</span>' +
      '<div style="display:grid;grid-template-columns:1fr 90px;gap:8px;margin-bottom:8px;"><input class="inp" id="adm-grant-uid" placeholder="UID des Nutzers"><input class="inp num" id="adm-grant-n" type="number" min="1" placeholder="Anzahl"></div>' +
      '<input class="inp" id="adm-grant-reason" placeholder="Grund (z. B. Test, Entschädigung)" style="margin-bottom:8px;">';
    var gBtn = document.createElement('button');
    gBtn.type = 'button';
    gBtn.className = 'btn sec pressable';
    gBtn.style.cssText = 'margin:0;';
    gBtn.textContent = 'Gutschreiben';
    gBtn.onclick = function(){
      var uid = (document.getElementById('adm-grant-uid').value || '').trim();
      var n = parseInt(document.getElementById('adm-grant-n').value, 10);
      var reason = (document.getElementById('adm-grant-reason').value || '').trim();
      if(!uid || !(n > 0)){ toast('UID und Anzahl angeben'); return; }
      gBtn.disabled = true;
      walletCall('adminGrant', {uid:uid, diamonds:n, reason:reason}).then(function(d){
        toast('Gutgeschrieben, neuer Stand: ' + d.diamonds);
        gBtn.disabled = false;
        document.getElementById('adm-grant-n').value = '';
      }).catch(function(e){ toast(walletErrorMessage(e)); gBtn.disabled = false; });
    };
    grant.appendChild(gBtn);
    el.appendChild(grant);

    var h = document.createElement('div');
    h.className = 'lbl';
    h.style.cssText = 'margin:14px 0 8px;';
    h.textContent = 'Offen (' + pending.length + ')';
    el.appendChild(h);
    if(!pending.length){
      var none = document.createElement('div');
      none.className = 'empty';
      none.textContent = 'Keine offene Abnahme';
      el.appendChild(none);
    }
    pending.forEach(function(v){ el.appendChild(verifyAdminCard(v, rerender)); });

    if(done.length){
      var h2 = document.createElement('div');
      h2.className = 'lbl';
      h2.style.cssText = 'margin:14px 0 8px;';
      h2.textContent = 'Entschieden';
      el.appendChild(h2);
      var list = document.createElement('div');
      list.className = 'list';
      done.slice(0, 20).forEach(function(v){
        var row = document.createElement('div');
        row.className = 'list-row';
        row.style.cssText = 'cursor:default;';
        var main = document.createElement('div');
        main.className = 'row-main';
        var t = document.createElement('div'); t.className = 'row-title'; t.textContent = (v.name || 'Athlet') + ' · ' + (v.title || '');
        var s = document.createElement('div'); s.className = 'row-sub'; s.style.cssText = 'white-space:normal;'; s.textContent = verifyFmtDate(v.decidedAt) + (v.note ? ' · ' + v.note : '') + (v.refunded ? ' · Diamanten zurück' : '');
        main.appendChild(t); main.appendChild(s);
        var chip = document.createElement('span');
        chip.style.cssText = PLAN_TAG_CSS + 'flex-shrink:0;' + (v.status === 'approved' ? 'color:var(--accent);border-color:var(--accent);' : '');
        chip.textContent = VERIFY_STATUS[v.status] || v.status;
        row.appendChild(main); row.appendChild(chip);
        list.appendChild(row);
      });
      el.appendChild(list);
    }
  }).catch(function(e){
    el.innerHTML = '<div class="row-sub" style="color:var(--red);">Fehler: ' + (e && e.message ? e.message : '') + '</div>';
  });
}

function verifyAdminCard(v, rerender){
  var card = document.createElement('div');
  card.className = 'card';
  var head = document.createElement('div');
  head.innerHTML = '<div class="ttl" style="margin-bottom:2px;"></div><div class="row-sub" style="white-space:normal;margin:0 0 10px;"></div>';
  head.querySelector('.ttl').textContent = v.title || 'Challenge';
  head.querySelector('.row-sub').textContent = (v.name || 'Athlet') + ' · ' + verifyKindLabel(v) + ' · eingereicht ' + verifyFmtDate(v.submittedAt || v.createdAt) + ' · geschafft ' + verifyFmtDate(v.completedAt) + ' · UID ' + v.uid;
  card.appendChild(head);

  // Prüfhinweis: Code und Zeit zwischen Code-Ausgabe und Einreichen
  var mins = (v.submittedAt && v.issuedAt) ? Math.round((v.submittedAt - v.issuedAt) / 60000) : null;
  var codeRow = document.createElement('div');
  codeRow.className = 'card';
  codeRow.style.cssText = 'background:var(--card2);display:flex;align-items:center;gap:14px;margin-bottom:10px;padding:12px 14px;';
  codeRow.innerHTML = '<div><span class="eyebrow" style="margin:0 0 2px;">Code</span><div class="kpi num" style="font-size:26px;letter-spacing:.12em;"></div></div><div class="row-sub" style="white-space:normal;line-height:1.5;margin:0;flex:1;"></div>';
  codeRow.querySelector('.kpi').textContent = v.code || '?';
  codeRow.querySelector('.row-sub').textContent = 'Ist der Code am Anfang zu sehen oder zu hören?' + (mins !== null ? ' Eingereicht ' + mins + ' min nach Code-Ausgabe.' : '') + (v.recordSeconds ? ' Aufnahme ' + verifyFmtClock(v.recordSeconds) + '.' : '');
  card.appendChild(codeRow);

  var vid = document.createElement('video');
  vid.controls = true;
  vid.setAttribute('playsinline', '');
  vid.preload = 'metadata';
  vid.style.cssText = 'width:100%;max-height:320px;background:#000;border-radius:var(--r-sm);margin-bottom:10px;display:block;';
  card.appendChild(vid);
  if(v.videoPath){
    firebase.storage().ref(v.videoPath).getDownloadURL().then(function(url){ vid.src = url; }).catch(function(){
      vid.replaceWith(Object.assign(document.createElement('div'), {className:'row-sub', textContent:'Video nicht mehr da'}));
    });
  }

  var note = document.createElement('input');
  note.className = 'inp';
  note.placeholder = 'Hinweis an den Nutzer (optional)';
  note.style.cssText = 'margin-bottom:8px;';
  card.appendChild(note);

  function decide(decision, refund){
    var btns = card.querySelectorAll('button');
    for(var i=0;i<btns.length;i++) btns[i].disabled = true;
    walletCall('reviewVerification', {id:v.id, decision:decision, note:note.value.trim(), refund:refund}).then(function(){
      toast(decision === 'approved' ? 'Verifiziert, Abzeichen vergeben' : 'Abgelehnt' + (refund ? ', Diamanten zurück' : ''));
      rerender();
    }).catch(function(e){
      toast(walletErrorMessage(e));
      for(var i=0;i<btns.length;i++) btns[i].disabled = false;
    });
  }
  var ok = document.createElement('button');
  ok.type = 'button';
  ok.className = 'btn pressable';
  ok.style.cssText = 'margin:0 0 8px;';
  ok.textContent = 'Verifizieren';
  ok.onclick = function(){ decide('approved', false); };
  var rjRefund = document.createElement('button');
  rjRefund.type = 'button';
  rjRefund.className = 'btn-g pressable';
  rjRefund.style.cssText = 'width:100%;min-height:44px;margin-bottom:8px;';
  rjRefund.textContent = 'Ablehnen, Diamanten zurück';
  rjRefund.onclick = function(){ decide('rejected', true); };
  var rj = document.createElement('button');
  rj.type = 'button';
  rj.className = 'btn-g danger pressable';
  rj.style.cssText = 'width:100%;min-height:44px;';
  rj.textContent = 'Ablehnen ohne Rückgabe';
  rj.onclick = function(){
    confirmSheet({title:'Ohne Rückgabe ablehnen?', desc:'Der Nutzer verliert die ' + (v.cost || CALI_ECON.verifyCost) + ' Diamanten. Nur bei Täuschung, zum Beispiel fehlendem Code.', confirmLabel:'Ablehnen', onConfirm:function(){ decide('rejected', false); }});
  };
  card.appendChild(ok); card.appendChild(rjRefund); card.appendChild(rj);
  return card;
}
