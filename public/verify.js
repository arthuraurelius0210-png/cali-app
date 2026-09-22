// ══════════════════════════════════════════════════════════
// VERIFY.JS — Abnahme geschaffter Challenges per Video
// Ablauf: Challenge geschafft (Server hat sie in wallets/{uid}.completed eingetragen) →
// Nutzer lädt ein Video nach verificationVideos/{uid}/ hoch → requestVerification bucht
// 1000 Diamanten ab und legt verifications/{id} an → Admin entscheidet im Admin-Panel
// (Tab „Abnahme", reviewVerification) → Abzeichen in verifiedBadges/{uid}, Video wird gelöscht.
// ══════════════════════════════════════════════════════════

var VERIFY_RULES = [
  'Die Challenge ist komplett zu sehen, bei langen Challenges die entscheidenden Teile.',
  'Möglichst ohne Schnitt. Uhr oder Datum im Bild helfen.',
  'Höchstens 3 Minuten und unter 300 MB.',
  'Das Video sehen nur du und der Prüfer. Nach der Entscheidung wird es gelöscht.'
];
var VERIFY_STATUS = {pending:'Wird geprüft', approved:'Verifiziert', rejected:'Abgelehnt'};

function verifyKindLabel(item){
  if(item.kind === 'weekly') return 'Wochen-Challenge' + (item.week && typeof weeklyNum === 'function' ? ' · KW ' + weeklyNum(item.week) : '');
  return 'Challenge';
}
function verifyFmtDate(ms){
  var d = new Date(typeof ms === 'string' ? ms : (ms || 0));
  if(isNaN(d.getTime())) return '';
  return (d.getDate() < 10 ? '0' : '') + d.getDate() + '.' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '.' + d.getFullYear();
}
// Geschaffte Challenges, die noch eine Abnahme vertragen (keine offene, keine freigegebene)
function verifyOpenItems(){
  return walletState.completed.filter(function(c){
    var v = walletState.verifications[c.key];
    return !v || v.status === 'rejected';
  }).slice().reverse();
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

  var newBtn = document.createElement('button');
  newBtn.type = 'button';
  newBtn.className = 'btn sec pressable';
  newBtn.style.cssText = 'margin:0 0 10px;';
  newBtn.textContent = 'Abnahme beantragen (' + CALI_ECON.verifyCost + ' Diamanten)';
  newBtn.onclick = function(){ openVerifyPicker(); };
  card.appendChild(newBtn);

  var keys = Object.keys(walletState.verifications);
  if(!keys.length){
    var none = document.createElement('div');
    none.className = 'row-sub';
    none.style.cssText = 'margin:0;white-space:normal;';
    none.textContent = 'Noch keine Abnahme. Schaff eine Challenge, film sie und hol dir das Abzeichen „Verifiziert".';
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
        s.textContent = (item ? verifyKindLabel(item) + ' · ' : '') + verifyFmtDate(v.at) + (v.status === 'rejected' && v.note ? ' · ' + v.note : '') + (v.refunded ? ' · Diamanten zurück' : '');
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

// ── Auswahl: welche geschaffte Challenge soll verifiziert werden ──
function openVerifyPicker(){
  if(!currentUser){ toast('Bitte einloggen'); return; }
  var old = document.getElementById('verify-picker');
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'verify-picker';
  ov.style.cssText = PLAN_BACKDROP_CSS + 'z-index:2100;';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:85vh;overflow-y:auto;';
  box.appendChild(planSheetGrip());
  var title = document.createElement('div');
  title.className = 'ttl';
  title.style.cssText = 'margin-bottom:6px;';
  title.textContent = 'Abnahme beantragen';
  box.appendChild(title);
  var sub = document.createElement('div');
  sub.style.cssText = 'font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:14px;';
  sub.textContent = 'Wähle eine geschaffte Challenge. Eine Abnahme kostet ' + CALI_ECON.verifyCost + ' Diamanten (entspricht ' + econDiamondsEuro(CALI_ECON.verifyCost) + '). Du hast ' + (currency.diamonds || 0) + '.';
  box.appendChild(sub);

  var items = verifyOpenItems();
  if(!items.length){
    var none = document.createElement('div');
    none.className = 'empty';
    none.textContent = walletState.completed.length ? 'Alle geschafften Challenges sind schon eingereicht.' : 'Noch keine geschaffte Challenge. Erst schaffen, dann verifizieren.';
    box.appendChild(none);
  } else {
    var list = document.createElement('div');
    list.className = 'list';
    list.style.cssText = 'margin-bottom:8px;';
    items.forEach(function(item){
      var row = document.createElement('div');
      row.className = 'list-row pressable';
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      var main = document.createElement('div');
      main.className = 'row-main';
      var t = document.createElement('div');
      t.className = 'row-title';
      t.textContent = item.title;
      var s = document.createElement('div');
      s.className = 'row-sub';
      s.textContent = verifyKindLabel(item) + ' · geschafft am ' + verifyFmtDate(item.date);
      main.appendChild(t); main.appendChild(s);
      var chev = document.createElement('span');
      chev.className = 'row-chev';
      row.appendChild(main); row.appendChild(chev);
      row.onclick = function(){ sheetOut(ov, box); setTimeout(function(){ openVerifySheet(item); }, 250); };
      row.onkeydown = function(e){ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); row.click(); } };
      list.appendChild(row);
    });
    box.appendChild(list);
  }
  var close = document.createElement('button');
  close.type = 'button';
  close.className = 'pressable u';
  close.style.cssText = PLAN_TEXTBTN_CSS;
  close.textContent = 'Schließen';
  close.onclick = function(){ sheetOut(ov, box); };
  box.appendChild(close);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) sheetOut(ov, box); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}

// ── Einreichen: Regeln, Video wählen, hochladen, beantragen ──
function openVerifySheet(item){
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
  add('div', 'row-sub', 'margin:0 0 12px;', verifyKindLabel(item) + ' · geschafft am ' + verifyFmtDate(item.date));
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
  add('div', 'row-sub num', 'margin:0 0 14px;color:' + (enough ? 'var(--text)' : 'var(--red)') + ';', 'Kostet ' + cost + ' Diamanten (' + econDiamondsEuro(cost) + '). Du hast ' + have + '.' + (enough ? '' : ' Zu wenig.'));

  var file = null;
  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'video/*';
  inp.style.display = 'none';
  box.appendChild(inp);
  var pick = add('button', 'btn-g pressable', 'width:100%;min-height:44px;margin-bottom:8px;', 'Video auswählen');
  pick.type = 'button';
  var fileLine = add('div', 'row-sub num', 'margin:0 0 12px;min-height:14px;', '');
  inp.onchange = function(){
    file = inp.files && inp.files[0];
    if(!file){ fileLine.textContent = ''; submit.disabled = true; return; }
    if(file.size > 300 * 1024 * 1024){ toast('Video zu groß (max. 300 MB)'); file = null; fileLine.textContent = ''; submit.disabled = true; return; }
    fileLine.textContent = file.name + ' · ' + (file.size / 1048576).toFixed(1) + ' MB';
    submit.disabled = !enough;
  };
  pick.onclick = function(){ inp.click(); };

  var submit = add('button', 'btn pressable', 'margin:0 0 8px;', 'Abnahme beantragen');
  submit.type = 'button';
  submit.disabled = true;
  var status = add('div', 'row-sub num', 'margin:0 0 8px;min-height:14px;text-align:center;', '');
  submit.onclick = function(){
    if(!file || !currentUser) return;
    submit.disabled = true; pick.disabled = true;
    var ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'mp4';
    var path = 'verificationVideos/' + currentUser.uid + '/' + Date.now() + '_' + item.key.replace(/[^a-zA-Z0-9]/g, '_') + '.' + ext;
    var task = firebase.storage().ref(path).put(file, {contentType: file.type || 'video/mp4'});
    task.on('state_changed', function(snap){
      status.textContent = 'Hochladen ' + Math.round(snap.bytesTransferred / snap.totalBytes * 100) + ' %';
    }, function(e){
      status.textContent = '';
      toast('Upload fehlgeschlagen: ' + (e && e.message ? e.message : ''));
      submit.disabled = false; pick.disabled = false;
    }, function(){
      status.textContent = 'Wird beantragt …';
      walletCall('requestVerification', {key:item.key, videoPath:path}).then(function(d){
        walletApply(d.wallet);
        sheetOut(ov, box);
        if(window.caliMotion && caliMotion.celebrate) caliMotion.celebrate('burst');
        toast('Abnahme eingereicht. Du bekommst Bescheid im Profil.');
      }).catch(function(e){
        status.textContent = '';
        toast(walletErrorMessage(e));
        submit.disabled = false; pick.disabled = false;
      });
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
    snap.forEach(function(d){ var x = Object.assign({id:d.id}, d.data()); (x.status === 'pending' ? pending : done).push(x); });
    pending.sort(function(a, b){ return (a.createdAt || 0) - (b.createdAt || 0); });

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
  head.querySelector('.row-sub').textContent = (v.name || 'Athlet') + ' · ' + verifyKindLabel(v) + ' · eingereicht ' + verifyFmtDate(v.createdAt) + ' · geschafft ' + verifyFmtDate(v.completedAt) + ' · UID ' + v.uid;
  card.appendChild(head);

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

  function decide(decision, refund, btn){
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
  ok.onclick = function(){ decide('approved', false, ok); };
  var rjRefund = document.createElement('button');
  rjRefund.type = 'button';
  rjRefund.className = 'btn-g pressable';
  rjRefund.style.cssText = 'width:100%;min-height:44px;margin-bottom:8px;';
  rjRefund.textContent = 'Ablehnen, Diamanten zurück';
  rjRefund.onclick = function(){ decide('rejected', true, rjRefund); };
  var rj = document.createElement('button');
  rj.type = 'button';
  rj.className = 'btn-g danger pressable';
  rj.style.cssText = 'width:100%;min-height:44px;';
  rj.textContent = 'Ablehnen ohne Rückgabe';
  rj.onclick = function(){
    confirmSheet({title:'Ohne Rückgabe ablehnen?', desc:'Der Nutzer verliert die ' + (v.cost || CALI_ECON.verifyCost) + ' Diamanten. Nur bei Täuschung.', confirmLabel:'Ablehnen', onConfirm:function(){ decide('rejected', false, rj); }});
  };
  card.appendChild(ok); card.appendChild(rjRefund); card.appendChild(rj);
  return card;
}
