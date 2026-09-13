// ── TRAININGSPARTNER FINDEN ───────────────────────────────
// Öffentliche Anfragen: "Ich trainiere heute im Park X, wer ist dabei?"
// Antworten sind ein öffentlicher Reply-Thread (kein Chat/DM-System).
// Respektiert prData.isPublic: private Profile werden nirgendwo angezeigt.
// Anfragen laufen nach 7 Tagen ab (expiresAt) und werden dann gelöscht.

var buddyRequestsData = [];
var buddySelectedPark = null; // {name, lat, lng} während Anfrage-Erstellung

// ── FILTER ─────────────────────────────────────────────────
var buddyFilterDist = 0; // 0 = alle, sonst Meter
var buddyFilterLevel = 'all';
var buddyFilterTime = 'all';
var buddyFilterWeekday = null; // nur relevant wenn buddyFilterTime === 'wochentag'
var BUDDY_DIST_OPTIONS = [{id:0,label:'Alle'},{id:2000,label:'2 km'},{id:5000,label:'5 km'},{id:10000,label:'10 km'}];
var BUDDY_LEVEL_FILTER_OPTIONS = [{id:'all',label:'Alle'},{id:'anfaenger',label:'Anfänger'},{id:'fortgeschritten',label:'Fortgeschritten'},{id:'egal',label:'Egal'}];
var BUDDY_TIME_FILTER_OPTIONS = [{id:'all',label:'Alle'},{id:'jetzt',label:'Jetzt'},{id:'heute',label:'Heute'},{id:'woche',label:'Diese Woche'},{id:'wochentag',label:'Fester Tag'}];

// Kleiner Outline-Tag (uppercase per CSS, Quelltext bleibt Mixed Case)
var BUDDY_TAG_CSS = 'background:var(--card2);border:1px solid var(--line);border-radius:var(--r-sm);padding:2px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap;';

function buildBuddyFilterChipRow(container, options, getSelected, onSelect){
  container.innerHTML = '';
  options.forEach(function(opt){
    var btn = document.createElement('button');
    btn.type = 'button';
    var isActive = opt.id === getSelected();
    btn.className = 'chip' + (isActive ? ' on' : '');
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.style.cssText = 'flex-shrink:0;';
    btn.innerHTML = opt.label;
    btn.onclick = function(){
      onSelect(opt.id);
      buildBuddyFilterChipRow(container, options, getSelected, onSelect);
      renderBuddyList();
    };
    container.appendChild(btn);
  });
}

function openBuddyFinderPage(){
  if(!currentUser){ toast('Bitte erst einloggen!'); return; }
  var ex = document.getElementById('buddy-page-ov'); if(ex) ex.remove();
  buddyFilterDist = 0; buddyFilterLevel = 'all'; buddyFilterTime = 'all'; buddyFilterWeekday = null;

  var ov = document.createElement('div');
  ov.id = 'buddy-page-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar: ← | Titel | + Anfrage (die eine orange Aktion dieses Screens)
  var topBar = document.createElement('div');
  topBar.className = 'topbar';
  topBar.style.cssText = 'margin:0;padding:0 16px;flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'icon-btn sm';
  backBtn.setAttribute('aria-label','Zurück');
  backBtn.innerHTML = '&#8592;';
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var titleEl = document.createElement('div');
  titleEl.className = 'topbar-title';
  titleEl.textContent = 'Trainingspartner';
  var newBtn = document.createElement('button');
  newBtn.type = 'button';
  newBtn.className = 'btn sm';
  newBtn.style.cssText = 'flex-shrink:0;';
  newBtn.textContent = '+ Anfrage';
  newBtn.onclick = function(){ openCreateBuddyRequest(); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(newBtn);
  ov.appendChild(topBar);

  var scroll = document.createElement('div');
  scroll.className = 'sheet-scroll';
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:14px 16px 40px;';

  var subtitleEl = document.createElement('div');
  subtitleEl.className = 'row-sub';
  subtitleEl.style.cssText = 'margin:0 0 14px;';
  subtitleEl.textContent = 'Finde Leute in deiner Nähe zum Trainieren';
  scroll.appendChild(subtitleEl);

  // Safety-Hinweis
  var safety = document.createElement('div');
  safety.className = 'card';
  safety.style.cssText = 'margin-bottom:14px;';
  safety.innerHTML = '<span class="eyebrow">Sicherheitshinweis</span><div style="font-size:11px;color:var(--muted);line-height:1.6;">Trefft euch an öffentlichen, belebten Orten und teilt vorher jemandem eure Pläne mit.</div>';
  scroll.appendChild(safety);

  // Filter
  var filterToggleRow = document.createElement('div');
  filterToggleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;';
  var filterToggleBtn = document.createElement('button');
  filterToggleBtn.type = 'button';
  filterToggleBtn.setAttribute('aria-expanded','false');
  filterToggleBtn.className = 'btn-g';
  filterToggleBtn.textContent = 'Filter';
  var filterAcc = document.createElement('div');
  filterAcc.className = 'acc-body';
  var filterPanel = document.createElement('div');
  filterPanel.className = 'card';
  filterPanel.style.cssText = 'margin-bottom:14px;';
  filterAcc.appendChild(filterPanel);
  filterToggleBtn.onclick = function(){
    var open = filterAcc.classList.contains('open');
    if(open){ filterAcc.classList.remove('open'); } else { filterAcc.classList.add('open'); }
    filterToggleBtn.setAttribute('aria-expanded', open?'false':'true');
  };
  filterToggleRow.appendChild(filterToggleBtn);
  scroll.appendChild(filterToggleRow);

  function filterRow(labelText, options, getSelected, onSelect){
    var wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:12px;';
    var lbl = document.createElement('div');
    lbl.className = 'lbl';
    lbl.style.cssText = 'margin:0 0 8px;';
    lbl.textContent = labelText;
    wrap.appendChild(lbl);
    var chips = document.createElement('div');
    chips.style.cssText = 'display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;';
    wrap.appendChild(chips);
    buildBuddyFilterChipRow(chips, options, getSelected, onSelect);
    return wrap;
  }
  filterPanel.appendChild(filterRow('Entfernung', BUDDY_DIST_OPTIONS, function(){ return buddyFilterDist; }, function(v){ buddyFilterDist = v; }));
  filterPanel.appendChild(filterRow('Level', BUDDY_LEVEL_FILTER_OPTIONS, function(){ return buddyFilterLevel; }, function(v){ buddyFilterLevel = v; }));

  var timeFilterWrap = document.createElement('div');
  timeFilterWrap.style.cssText = 'margin-bottom:0;';
  var timeFilterLbl = document.createElement('div');
  timeFilterLbl.className = 'lbl';
  timeFilterLbl.style.cssText = 'margin:0 0 8px;';
  timeFilterLbl.textContent = 'Zeitpunkt';
  timeFilterWrap.appendChild(timeFilterLbl);
  var timeFilterChips = document.createElement('div');
  timeFilterChips.style.cssText = 'display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;';
  timeFilterWrap.appendChild(timeFilterChips);

  // Wochentag-Unterfilter — nur sichtbar wenn ZEITPUNKT="Fester Tag" gewählt ist.
  // Erst mit gewähltem Wochentag ergibt der Filter Sinn (zeigt nur Angebote an diesem Tag).
  var weekdayFilterWrap = document.createElement('div');
  weekdayFilterWrap.style.cssText = 'display:'+(buddyFilterTime==='wochentag'?'block':'none')+';margin-top:10px;';
  var weekdayFilterHint = document.createElement('div');
  weekdayFilterHint.className = 'lbl';
  weekdayFilterHint.style.cssText = 'margin-bottom:8px;';
  weekdayFilterHint.textContent = 'Welcher Wochentag?';
  weekdayFilterWrap.appendChild(weekdayFilterHint);
  var weekdayFilterChips = document.createElement('div');
  weekdayFilterChips.style.cssText = 'display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;';
  weekdayFilterWrap.appendChild(weekdayFilterChips);
  var weekdayFilterOptions = BUDDY_WEEKDAYS.map(function(d){ return {id:d, label:d}; });
  buildBuddyFilterChipRow(weekdayFilterChips, weekdayFilterOptions, function(){ return buddyFilterWeekday; }, function(v){ buddyFilterWeekday = v; });
  timeFilterWrap.appendChild(weekdayFilterWrap);

  buildBuddyFilterChipRow(timeFilterChips, BUDDY_TIME_FILTER_OPTIONS, function(){ return buddyFilterTime; }, function(v){
    buddyFilterTime = v;
    if(v === 'wochentag'){
      weekdayFilterWrap.style.display = 'block';
      if(!buddyFilterWeekday) buddyFilterWeekday = BUDDY_WEEKDAYS[0];
    } else {
      weekdayFilterWrap.style.display = 'none';
      buddyFilterWeekday = null;
    }
    buildBuddyFilterChipRow(weekdayFilterChips, weekdayFilterOptions, function(){ return buddyFilterWeekday; }, function(v2){ buddyFilterWeekday = v2; });
  });

  filterPanel.appendChild(timeFilterWrap);
  scroll.appendChild(filterAcc);

  var listWrap = document.createElement('div');
  listWrap.id = 'buddy-list';
  listWrap.innerHTML = '<div class="empty">Lädt…</div>';
  scroll.appendChild(listWrap);

  ov.appendChild(scroll);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);

  loadBuddyRequests();
}

function loadBuddyRequests(){
  var listWrap = document.getElementById('buddy-list');
  if(!listWrap) return;
  db.collection('trainingBuddies').orderBy('createdAt','desc').limit(50).get()
    .then(function(snap){
      var now = Date.now();
      var docs = [];
      snap.forEach(function(doc){
        var d = doc.data();
        // Anfragen sind höchstens 1 Woche live. expiresAt ist ein Firestore-Timestamp;
        // ältere Dokumente ohne das Feld fallen auf createdAt+7 Tage zurück.
        var expiresAtMs = (d.expiresAt && typeof d.expiresAt.toMillis === 'function')
          ? d.expiresAt.toMillis()
          : new Date(d.createdAt).getTime() + 7*24*60*60*1000;
        if(expiresAtMs < now){
          doc.ref.delete().catch(function(){});
          return;
        }
        docs.push({id: doc.id, data: d});
      });
      if(typeof userLat === 'number' && typeof userLng === 'number'){
        docs.forEach(function(item){
          item._dist = (item.data.parkLat && item.data.parkLng) ? calcDist(userLat, userLng, item.data.parkLat, item.data.parkLng) : null;
        });
        docs.sort(function(a,b){
          if(a._dist == null && b._dist == null) return 0;
          if(a._dist == null) return 1;
          if(b._dist == null) return -1;
          return a._dist - b._dist;
        });
      }
      buddyRequestsData = docs;
      renderBuddyList();
    })
    .catch(function(){ listWrap.innerHTML = '<div class="empty">Fehler beim Laden</div>'; });
}

function getFilteredBuddyRequests(){
  return buddyRequestsData.filter(function(item){
    if(buddyFilterDist > 0 && (item._dist == null || item._dist > buddyFilterDist)) return false;
    if(buddyFilterLevel !== 'all' && item.data.level !== buddyFilterLevel) return false;
    if(buddyFilterTime !== 'all'){
      if(item.data.timeLabel !== buddyFilterTime) return false;
      if(buddyFilterTime === 'wochentag' && buddyFilterWeekday && item.data.weekday !== buddyFilterWeekday) return false;
    }
    return true;
  });
}

function renderBuddyList(){
  var listWrap = document.getElementById('buddy-list');
  if(!listWrap) return;
  listWrap.innerHTML = '';

  if(buddyRequestsData.length === 0){
    listWrap.innerHTML = '<div style="text-align:center;padding:30px 0;font-size:11px;color:var(--muted);line-height:1.6;">Noch keine Anfragen.<br>Sei der Erste und finde einen Trainingspartner!</div>';
    return;
  }

  var filtered = getFilteredBuddyRequests();
  if(filtered.length === 0){
    listWrap.innerHTML = '<div style="text-align:center;padding:30px 0;font-size:11px;color:var(--muted);">Keine Anfragen passen zu deinem Filter.</div>';
    return;
  }

  filtered.forEach(function(item){
    var placeholder = document.createElement('div');
    listWrap.appendChild(placeholder);
    var isOwn = currentUser && item.data.uid === currentUser.uid;

    if(isOwn){
      placeholder.replaceWith(buildBuddyCard(item.id, item.data, item._dist));
      return;
    }

    // Live-Check: Profil des Autors noch öffentlich? Private Profile werden nirgendwo angezeigt.
    db.collection('users').doc(item.data.uid).get().then(function(doc){
      var isPublic = true;
      if(doc.exists){
        var pd = doc.data().prData;
        isPublic = !pd || pd.isPublic !== false;
      }
      if(!isPublic){ placeholder.remove(); return; }
      placeholder.replaceWith(buildBuddyCard(item.id, item.data, item._dist));
    }).catch(function(){ placeholder.remove(); });
  });
}

var BUDDY_TIME_LABELS = {jetzt:'Jetzt', heute:'Heute', woche:'Diese Woche', wochentag:'Fester Tag'};
var BUDDY_LEVEL_LABELS = {anfaenger:'Anfänger', fortgeschritten:'Fortgeschritten', egal:'Egal'};
var BUDDY_WEEKDAYS = ['Mo','Di','Mi','Do','Fr','Sa','So'];
var BUDDY_WEEKDAY_NAMES = {Mo:'Montag', Di:'Dienstag', Mi:'Mittwoch', Do:'Donnerstag', Fr:'Freitag', Sa:'Samstag', So:'Sonntag'};

function buddyTimeBadgeLabel(data){
  if(data.timeLabel === 'wochentag' && data.weekday){
    var dayName = BUDDY_WEEKDAY_NAMES[data.weekday] || data.weekday;
    return 'Jeden ' + dayName + (data.weekdayTime ? ', ' + data.weekdayTime + ' Uhr' : '');
  }
  return BUDDY_TIME_LABELS[data.timeLabel];
}

function buildBuddyCard(docId, data, dist){
  var card = document.createElement('div');
  card.className = 'card anim-in';
  card.style.cssText = 'margin-bottom:10px;';

  var hdRow = document.createElement('div');
  hdRow.style.cssText = 'display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;';

  // Avatar: 36px Ring, Foto in Graustufen
  var avatarEl = document.createElement('div');
  avatarEl.style.cssText = 'width:36px;height:36px;border-radius:50%;background:var(--card2);border:1px solid var(--line2);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;color:var(--muted);';
  avatarEl.innerHTML = '<div style="width:16px;height:16px;">'+(typeof ci === 'function' ? ci('people') : '')+'</div>';
  if(data.uid){
    db.collection('users').doc(data.uid).get().then(function(doc){
      if(!doc.exists) return;
      var pd = doc.data().prData;
      if(pd && pd.avatar){
        avatarEl.style.backgroundImage = 'url(' + pd.avatar + ')';
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.style.filter = 'grayscale(1) contrast(1.15) brightness(0.85)';
        avatarEl.innerHTML = '';
      }
    }).catch(function(){});
  }

  var left = document.createElement('div');
  left.className = 'row-main';
  var nameEl = document.createElement('div');
  nameEl.className = 'row-title';
  nameEl.textContent = data.authorName || 'Athlet';
  var parkEl = document.createElement('div');
  parkEl.className = 'row-sub';
  parkEl.textContent = (data.parkName || 'Park') + (dist != null ? ' · ' + formatDist(dist) : '');
  left.appendChild(nameEl); left.appendChild(parkEl);
  hdRow.appendChild(avatarEl); hdRow.appendChild(left);

  if(currentUser && data.uid === currentUser.uid){
    var moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.className = 'icon-btn sm';
    moreBtn.setAttribute('aria-label', 'Anfrage löschen');
    moreBtn.style.cssText = 'color:var(--muted);';
    moreBtn.textContent = '⋯';
    moreBtn.onclick = function(){
      var doDelete = function(){
        db.collection('trainingBuddies').doc(docId).delete().then(function(){
          toast('Anfrage gelöscht');
          loadBuddyRequests();
        }).catch(function(){ toast('Fehler beim Löschen.'); });
      };
      if(typeof confirmSheet === 'function'){
        confirmSheet({
          title: 'Anfrage löschen?',
          desc: 'Deine Anfrage wird für alle entfernt.',
          confirmLabel: 'Löschen',
          danger: true,
          onConfirm: doDelete
        });
      } else if(confirm('Diese Anfrage wirklich löschen?')){
        doDelete();
      }
    };
    hdRow.appendChild(moreBtn);
  }
  card.appendChild(hdRow);

  var badgeRow = document.createElement('div');
  badgeRow.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;';
  [data.timeLabel && buddyTimeBadgeLabel(data), data.level && BUDDY_LEVEL_LABELS[data.level]].forEach(function(label){
    if(!label) return;
    var b = document.createElement('span');
    b.style.cssText = BUDDY_TAG_CSS;
    b.innerHTML = label;
    badgeRow.appendChild(b);
  });
  card.appendChild(badgeRow);

  if(data.message){
    var msgEl = document.createElement('div');
    msgEl.style.cssText = 'font-size:12px;color:var(--text);line-height:1.6;margin-bottom:12px;';
    msgEl.textContent = data.message;
    card.appendChild(msgEl);
  }

  var actRow = document.createElement('div');
  actRow.style.cssText = 'display:flex;gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:10px;';

  var replyCount = (data.replies || []).length;
  var replyBtn = document.createElement('button');
  replyBtn.type = 'button';
  replyBtn.setAttribute('aria-expanded','false');
  replyBtn.className = 'btn-g';
  replyBtn.style.cssText = 'flex:1;min-height:40px;';
  replyBtn.innerHTML = 'Ich bin dabei <span class="num" style="color:var(--muted);">(' + replyCount + ')</span>';

  var replySection = document.createElement('div');
  replySection.className = 'acc-body';
  var replyInner = document.createElement('div');
  replyInner.style.cssText = 'margin-top:12px;';
  replySection.appendChild(replyInner);
  replyBtn.onclick = function(){
    var isOpen = replySection.classList.contains('open');
    if(isOpen){
      replySection.classList.remove('open');
    } else {
      buildBuddyReplySection(replyInner, docId, data);
      replySection.classList.add('open');
    }
    replyBtn.setAttribute('aria-expanded', isOpen?'false':'true');
  };

  actRow.appendChild(replyBtn);
  card.appendChild(actRow);
  card.appendChild(replySection);

  return card;
}

function buildBuddyReplySection(el, docId, data){
  el.innerHTML = '';
  var replies = data.replies || [];

  if(replies.length === 0){
    var empty = document.createElement('div');
    empty.className = 'empty';
    empty.style.cssText = 'padding:6px 0 10px;text-align:left;';
    empty.textContent = 'Noch keine Antworten';
    el.appendChild(empty);
  } else {
    replies.forEach(function(r){
      var row = document.createElement('div');
      row.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--line);';
      var rname = document.createElement('div');
      rname.style.cssText = 'font-size:11px;font-weight:600;color:var(--accent);margin-bottom:2px;';
      rname.textContent = r.authorName || 'Athlet';
      var rtxt = document.createElement('div');
      rtxt.style.cssText = 'font-size:12px;color:var(--text);line-height:1.6;';
      rtxt.textContent = r.text;
      row.appendChild(rname); row.appendChild(rtxt);
      el.appendChild(row);
    });
  }

  if(!currentUser) return;
  var inpRow = document.createElement('div');
  inpRow.style.cssText = 'display:flex;gap:8px;margin-top:10px;';
  var inp = document.createElement('input');
  inp.type = 'text';
  inp.maxLength = 200;
  inp.placeholder = 'Antworten...';
  inp.className = 'inp';
  inp.style.cssText = 'flex:1;min-width:0;width:auto;';
  var sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.setAttribute('aria-label','Antwort senden');
  sendBtn.className = 'btn sec sm';
  sendBtn.style.cssText = 'min-height:44px;flex-shrink:0;';
  sendBtn.textContent = 'OK';
  sendBtn.onclick = function(){
    var txt = inp.value.trim();
    if(txt.length < 2){ toast('Antwort zu kurz!'); return; }
    if(prData && prData.isPublic === false){ toast('Aktiviere ein öffentliches Profil, um zu antworten.'); return; }
    var newReply = {
      uid: currentUser.uid,
      authorName: (prData && prData.name) ? prData.name : 'Athlet',
      text: txt.slice(0,200),
      createdAt: new Date().toISOString()
    };
    db.collection('trainingBuddies').doc(docId).update({
      replies: firebase.firestore.FieldValue.arrayUnion(newReply)
    }).then(function(){
      inp.value = '';
      toast('Antwort gesendet.');
      loadBuddyRequests();
    }).catch(function(){ toast('Fehler beim Antworten.'); });
  };
  inpRow.appendChild(inp); inpRow.appendChild(sendBtn);
  el.appendChild(inpRow);
}

// Auswahl-Chips (Wann / Wochentag / Level): aktiv = .on
function buddySetActive(container, attr, value){
  container.querySelectorAll('button').forEach(function(b){
    var a = b.dataset[attr] === value;
    b.classList.toggle('on', a);
    b.setAttribute('aria-pressed', a ? 'true' : 'false');
  });
}

// ── ANFRAGE ERSTELLEN ─────────────────────────────────────
function openCreateBuddyRequest(){
  if(!currentUser){ toast('Bitte erst einloggen!'); return; }
  if(prData && prData.isPublic === false){
    toast('Mit privatem Profil kannst du keine Anfrage erstellen. Stelle dein Profil im Profil-Tab auf öffentlich.');
    return;
  }

  buddySelectedPark = null;
  var ex = document.getElementById('buddy-create-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'buddy-create-ov';
  ov.className = 'backdrop';

  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:88vh;overflow-y:auto;';
  box.innerHTML = '<div class="sheet-grip"></div>'+
    '<div class="ttl" style="margin-bottom:14px;">Trainingspartner-Anfrage</div>';

  // Park-Auswahl
  var parkLabel = document.createElement('div');
  parkLabel.className = 'lbl';
  parkLabel.style.cssText = 'margin:0 0 8px;';
  parkLabel.textContent = 'Park';
  box.appendChild(parkLabel);

  var parkPickWrap = document.createElement('div');
  parkPickWrap.id = 'buddy-park-pick';
  box.appendChild(parkPickWrap);

  function renderParkPicker(){
    parkPickWrap.innerHTML = '';
    if(!parksData || parksData.length === 0){
      var noParks = document.createElement('div');
      noParks.className = 'card';
      noParks.style.cssText = 'margin-bottom:12px;font-size:11px;color:var(--muted);line-height:1.6;';
      noParks.textContent = 'Noch keine Parks geladen.';
      var loadBtn = document.createElement('button');
      loadBtn.type = 'button';
      loadBtn.className = 'btn sec';
      loadBtn.style.cssText = 'margin:10px 0 0;min-height:44px;';
      loadBtn.textContent = 'Standort verwenden & Parks laden';
      loadBtn.onclick = function(){
        loadBtn.textContent = 'Lädt...';
        if(!navigator.geolocation){ toast('Geolocation nicht verfügbar.'); return; }
        navigator.geolocation.getCurrentPosition(function(pos){
          userLat = pos.coords.latitude; userLng = pos.coords.longitude;
          var origProcess = window.loadParks;
          if(typeof origProcess === 'function'){
            currentRadius = currentRadius || 5000;
            loadParks();
            var waitTimer = setInterval(function(){
              if(parksData && parksData.length){ clearInterval(waitTimer); renderParkPicker(); }
            }, 400);
            setTimeout(function(){ clearInterval(waitTimer); }, 8000);
          }
        }, function(){ toast('Standort konnte nicht ermittelt werden.'); });
      };
      noParks.appendChild(loadBtn);
      parkPickWrap.appendChild(noParks);
      return;
    }
    var list = document.createElement('div');
    list.className = 'list sheet-scroll';
    list.style.cssText = 'max-height:180px;overflow-y:auto;margin-bottom:12px;';
    parksData.slice(0,15).forEach(function(park, i){
      var name = park.tags && (park.tags.name || park.tags['name:de']) ? (park.tags.name || park.tags['name:de']) : 'Calisthenics Park';
      var row = document.createElement('button');
      row.type = 'button';
      var isSel = buddySelectedPark && buddySelectedPark.name === name && buddySelectedPark.lat === park._lat;
      row.className = 'list-row pressable';
      row.setAttribute('aria-pressed', isSel ? 'true' : 'false');
      row.style.cssText = 'box-sizing:border-box;'+(isSel?'background:var(--accent-soft);':'');
      var dp = (typeof formatDistParts === 'function') ? formatDistParts(park._dist) : {val: formatDist(park._dist), unit: ''};
      row.innerHTML = '<span class="row-index num"'+(isSel?' style="color:var(--accent);"':'')+'>'+('0'+(i+1)).slice(-2)+'</span>'+
        '<div class="row-main"><div class="row-title">'+name+'</div></div>'+
        '<div style="display:flex;align-items:baseline;gap:4px;flex-shrink:0;"><span class="row-val num">'+dp.val+'</span>'+(dp.unit?'<span class="unit">'+dp.unit+'</span>':'')+'</div>';
      row.onclick = function(){
        buddySelectedPark = {name: name, lat: park._lat, lng: park._lng};
        renderParkPicker();
      };
      list.appendChild(row);
    });
    parkPickWrap.appendChild(list);
    if(!buddySelectedPark && parksData[0]){
      var p0 = parksData[0];
      buddySelectedPark = {name: (p0.tags && (p0.tags.name||p0.tags['name:de'])) || 'Calisthenics Park', lat: p0._lat, lng: p0._lng};
      renderParkPicker();
    }
  }
  renderParkPicker();

  // Zeitpunkt
  var timeLabel = document.createElement('div');
  timeLabel.className = 'lbl';
  timeLabel.style.cssText = 'margin:6px 0 8px;';
  timeLabel.textContent = 'Wann';
  box.appendChild(timeLabel);
  var timeWrap = document.createElement('div');
  timeWrap.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;';
  var selectedTime = 'heute';

  // Wochentag-Unterauswahl (nur sichtbar bei "Fester Tag")
  var weekdayWrap = document.createElement('div');
  weekdayWrap.style.cssText = 'display:none;margin-bottom:14px;';
  var selectedWeekday = null;
  var wdChips = document.createElement('div');
  wdChips.style.cssText = 'display:flex;gap:5px;margin-bottom:8px;';
  BUDDY_WEEKDAYS.forEach(function(day){
    var wbtn = document.createElement('button');
    wbtn.type = 'button';
    wbtn.dataset.day = day;
    wbtn.className = 'chip';
    wbtn.setAttribute('aria-pressed','false');
    wbtn.style.cssText = 'flex:1;padding:8px 0;text-align:center;';
    wbtn.textContent = day;
    wbtn.onclick = function(){
      selectedWeekday = day;
      buddySetActive(wdChips, 'day', selectedWeekday);
    };
    wdChips.appendChild(wbtn);
  });
  weekdayWrap.appendChild(wdChips);
  var wdTimeInp = document.createElement('input');
  wdTimeInp.type = 'time';
  wdTimeInp.className = 'inp num';
  wdTimeInp.style.cssText = 'box-sizing:border-box;';
  weekdayWrap.appendChild(wdTimeInp);

  Object.keys(BUDDY_TIME_LABELS).forEach(function(key){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.key = key;
    var isActive = key === selectedTime;
    btn.className = 'chip' + (isActive ? ' on' : '');
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.style.cssText = 'flex:1;padding:8px 6px;text-align:center;';
    btn.innerHTML = BUDDY_TIME_LABELS[key];
    btn.onclick = function(){
      selectedTime = key;
      buddySetActive(timeWrap, 'key', selectedTime);
      weekdayWrap.style.display = (selectedTime === 'wochentag') ? 'block' : 'none';
    };
    timeWrap.appendChild(btn);
  });
  box.appendChild(timeWrap);
  box.appendChild(weekdayWrap);

  // Level
  var levelLabel = document.createElement('div');
  levelLabel.className = 'lbl';
  levelLabel.style.cssText = 'margin:0 0 8px;';
  levelLabel.textContent = 'Level';
  box.appendChild(levelLabel);
  var levelWrap = document.createElement('div');
  levelWrap.style.cssText = 'display:flex;gap:6px;margin-bottom:14px;';
  var selectedLevel = 'egal';
  Object.keys(BUDDY_LEVEL_LABELS).forEach(function(key){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.key = key;
    var isActive = key === selectedLevel;
    btn.className = 'chip' + (isActive ? ' on' : '');
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.style.cssText = 'flex:1;padding:8px 4px;text-align:center;';
    btn.innerHTML = BUDDY_LEVEL_LABELS[key];
    btn.onclick = function(){
      selectedLevel = key;
      buddySetActive(levelWrap, 'key', selectedLevel);
    };
    levelWrap.appendChild(btn);
  });
  box.appendChild(levelWrap);

  // Nachricht
  var msgLabel = document.createElement('div');
  msgLabel.className = 'lbl';
  msgLabel.style.cssText = 'margin:0 0 8px;';
  msgLabel.textContent = 'Nachricht (optional)';
  box.appendChild(msgLabel);
  var msgInp = document.createElement('textarea');
  msgInp.maxLength = 200;
  msgInp.placeholder = 'z.B. Suche jemanden für Klimmzüge und Dips...';
  msgInp.className = 'inp';
  msgInp.style.cssText = 'resize:none;height:64px;box-sizing:border-box;margin-bottom:16px;';
  box.appendChild(msgInp);

  var submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.className = 'btn';
  submitBtn.style.cssText = 'margin:0 0 6px;';
  submitBtn.textContent = 'Anfrage erstellen';
  submitBtn.onclick = function(){
    if(!buddySelectedPark){ toast('Bitte einen Park wählen!'); return; }
    if(selectedTime === 'wochentag' && !selectedWeekday){ toast('Bitte einen Wochentag wählen!'); return; }
    if(prData && prData.isPublic === false){ toast('Profil ist privat.'); return; }

    var entry = {
      uid: currentUser.uid,
      authorName: (prData && prData.name) ? prData.name : 'Athlet',
      parkName: buddySelectedPark.name,
      parkLat: buddySelectedPark.lat,
      parkLng: buddySelectedPark.lng,
      timeLabel: selectedTime,
      level: selectedLevel,
      message: msgInp.value.trim().slice(0,200),
      replies: [],
      createdAt: new Date().toISOString(),
      expiresAt: firebase.firestore.Timestamp.fromDate(new Date(Date.now() + 7*24*60*60*1000))
    };
    if(selectedTime === 'wochentag'){
      entry.weekday = selectedWeekday;
      if(wdTimeInp.value) entry.weekdayTime = wdTimeInp.value;
    }

    db.collection('trainingBuddies').add(entry)
      .then(function(){
        ov.remove();
        toast('Anfrage erstellt.');
        loadBuddyRequests();
      })
      .catch(function(){ toast('Fehler beim Erstellen.'); });
  };
  box.appendChild(submitBtn);

  var cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn-g';
  cancelBtn.style.cssText = 'width:100%;min-height:44px;';
  cancelBtn.textContent = 'Abbrechen';
  cancelBtn.onclick = function(){ ov.remove(); };
  box.appendChild(cancelBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}
