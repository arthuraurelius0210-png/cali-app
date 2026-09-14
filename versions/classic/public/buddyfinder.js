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
var BUDDY_LEVEL_FILTER_OPTIONS = [{id:'all',label:'Alle'},{id:'anfaenger',label:'&#127793; Anfänger'},{id:'fortgeschritten',label:'&#128293; Fortgeschritten'},{id:'egal',label:'&#129309; Egal'}];
var BUDDY_TIME_FILTER_OPTIONS = [{id:'all',label:'Alle'},{id:'jetzt',label:'&#9889; Jetzt'},{id:'heute',label:'&#128197; Heute'},{id:'woche',label:'&#128198; Diese Woche'},{id:'wochentag',label:'&#128260; Fester Tag'}];

function buildBuddyFilterChipRow(container, options, getSelected, onSelect){
  container.innerHTML = '';
  options.forEach(function(opt){
    var btn = document.createElement('button');
    var isActive = opt.id === getSelected();
    btn.style.cssText = 'flex-shrink:0;padding:6px 12px;border-radius:20px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'var(--accent)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;';
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

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);flex-shrink:0;';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var titleWrap = document.createElement('div');
  titleWrap.style.cssText = 'flex:1;min-width:0;';
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:16px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  titleEl.innerHTML = '&#129309; Trainingspartner';
  var subtitleEl = document.createElement('div');
  subtitleEl.style.cssText = 'font-size:11px;color:var(--muted);margin-top:1px;';
  subtitleEl.textContent = 'Finde Leute in deiner Nähe zum Trainieren';
  titleWrap.appendChild(titleEl); titleWrap.appendChild(subtitleEl);
  var newBtn = document.createElement('button');
  newBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:9px 12px;cursor:pointer;flex-shrink:0;white-space:nowrap;';
  newBtn.textContent = '+ Anfrage';
  newBtn.onclick = function(){ openCreateBuddyRequest(); };
  topBar.appendChild(backBtn); topBar.appendChild(titleWrap); topBar.appendChild(newBtn);
  ov.appendChild(topBar);

  var scroll = document.createElement('div');
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';

  // Safety-Hinweis
  var safety = document.createElement('div');
  safety.style.cssText = 'background:rgba(255,85,0,0.07);border:1px solid rgba(255,85,0,0.2);border-radius:12px;padding:12px 14px;font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:14px;';
  safety.innerHTML = '&#128737;&#65039; <b style="color:var(--text);">Sicherheitshinweis:</b> Trefft euch an öffentlichen, belebten Orten und teilt vorher jemandem eure Pläne mit.';
  scroll.appendChild(safety);

  // Filter
  var filterToggleRow = document.createElement('div');
  filterToggleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;cursor:pointer;';
  var filterToggleBtn = document.createElement('button');
  filterToggleBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:11px;font-weight:700;padding:8px 12px;cursor:pointer;color:var(--text);';
  filterToggleBtn.innerHTML = '&#128269; Filter';
  var filterPanel = document.createElement('div');
  filterPanel.style.cssText = 'display:none;background:var(--bg2);border-radius:14px;padding:14px;margin-bottom:14px;';
  filterToggleBtn.onclick = function(){
    var open = filterPanel.style.display !== 'none';
    filterPanel.style.display = open ? 'none' : 'block';
  };
  filterToggleRow.appendChild(filterToggleBtn);
  scroll.appendChild(filterToggleRow);

  function filterRow(labelText, options, getSelected, onSelect){
    var wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:12px;';
    var lbl = document.createElement('div');
    lbl.className = 'stitle'; lbl.style.cssText = 'margin:0 0 6px;';
    lbl.textContent = labelText;
    wrap.appendChild(lbl);
    var chips = document.createElement('div');
    chips.style.cssText = 'display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;';
    wrap.appendChild(chips);
    buildBuddyFilterChipRow(chips, options, getSelected, onSelect);
    return wrap;
  }
  filterPanel.appendChild(filterRow('ENTFERNUNG', BUDDY_DIST_OPTIONS, function(){ return buddyFilterDist; }, function(v){ buddyFilterDist = v; }));
  filterPanel.appendChild(filterRow('LEVEL', BUDDY_LEVEL_FILTER_OPTIONS, function(){ return buddyFilterLevel; }, function(v){ buddyFilterLevel = v; }));

  var timeFilterWrap = document.createElement('div');
  timeFilterWrap.style.cssText = 'margin-bottom:0;';
  var timeFilterLbl = document.createElement('div');
  timeFilterLbl.className = 'stitle'; timeFilterLbl.style.cssText = 'margin:0 0 6px;';
  timeFilterLbl.textContent = 'ZEITPUNKT';
  timeFilterWrap.appendChild(timeFilterLbl);
  var timeFilterChips = document.createElement('div');
  timeFilterChips.style.cssText = 'display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;';
  timeFilterWrap.appendChild(timeFilterChips);

  // Wochentag-Unterfilter — nur sichtbar wenn ZEITPUNKT="Fester Tag" gewählt ist.
  // Erst mit gewähltem Wochentag ergibt der Filter Sinn (zeigt nur Angebote an diesem Tag).
  var weekdayFilterWrap = document.createElement('div');
  weekdayFilterWrap.style.cssText = 'display:'+(buddyFilterTime==='wochentag'?'block':'none')+';margin-top:8px;';
  var weekdayFilterHint = document.createElement('div');
  weekdayFilterHint.style.cssText = 'font-size:10px;color:var(--muted);margin-bottom:6px;';
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
  scroll.appendChild(filterPanel);

  var listWrap = document.createElement('div');
  listWrap.id = 'buddy-list';
  listWrap.innerHTML = '<div style="text-align:center;padding:24px 0;font-size:12px;color:var(--muted);">Lädt...</div>';
  scroll.appendChild(listWrap);

  ov.appendChild(scroll);
  document.body.appendChild(ov);

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
    .catch(function(){ listWrap.innerHTML = '<div style="text-align:center;padding:20px 0;font-size:12px;color:var(--muted);">Fehler beim Laden.</div>'; });
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
    listWrap.innerHTML = '<div style="text-align:center;padding:30px 0;font-size:12px;color:var(--muted);">&#129309; Noch keine Anfragen.<br>Sei der Erste und finde einen Trainingspartner!</div>';
    return;
  }

  var filtered = getFilteredBuddyRequests();
  if(filtered.length === 0){
    listWrap.innerHTML = '<div style="text-align:center;padding:30px 0;font-size:12px;color:var(--muted);">Keine Anfragen passen zu deinem Filter.</div>';
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

var BUDDY_TIME_LABELS = {jetzt:'&#9889; Jetzt', heute:'&#128197; Heute', woche:'&#128198; Diese Woche', wochentag:'&#128260; Fester Tag'};
var BUDDY_LEVEL_LABELS = {anfaenger:'&#127793; Anfänger', fortgeschritten:'&#128293; Fortgeschritten', egal:'&#129309; Egal'};
var BUDDY_WEEKDAYS = ['Mo','Di','Mi','Do','Fr','Sa','So'];
var BUDDY_WEEKDAY_NAMES = {Mo:'Montag', Di:'Dienstag', Mi:'Mittwoch', Do:'Donnerstag', Fr:'Freitag', Sa:'Samstag', So:'Sonntag'};

function buddyTimeBadgeLabel(data){
  if(data.timeLabel === 'wochentag' && data.weekday){
    var dayName = BUDDY_WEEKDAY_NAMES[data.weekday] || data.weekday;
    return '&#128260; Jeden ' + dayName + (data.weekdayTime ? ', ' + data.weekdayTime + ' Uhr' : '');
  }
  return BUDDY_TIME_LABELS[data.timeLabel];
}

function buildBuddyCard(docId, data, dist){
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--bg2);border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.06);padding:16px;margin-bottom:10px;';

  var hdRow = document.createElement('div');
  hdRow.style.cssText = 'display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;';

  var avatarEl = document.createElement('div');
  avatarEl.style.cssText = 'width:36px;height:36px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;';
  avatarEl.innerHTML = '<div style="width:16px;height:16px;">'+ci('flex')+'</div>';
  if(data.uid){
    db.collection('users').doc(data.uid).get().then(function(doc){
      if(!doc.exists) return;
      var pd = doc.data().prData;
      if(pd && pd.avatar){
        avatarEl.style.backgroundImage = 'url(' + pd.avatar + ')';
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.innerHTML = '';
      }
    }).catch(function(){});
  }

  var left = document.createElement('div');
  left.style.cssText = 'flex:1;min-width:0;';
  var nameEl = document.createElement('div');
  nameEl.style.cssText = 'font-size:14px;font-weight:800;color:var(--text);';
  nameEl.textContent = data.authorName || 'Athlet';
  var parkEl = document.createElement('div');
  parkEl.style.cssText = 'font-size:11px;color:var(--muted);margin-top:2px;';
  parkEl.innerHTML = '&#128205; ' + (data.parkName || 'Park') + (dist != null ? ' &middot; ' + formatDist(dist) : '');
  left.appendChild(nameEl); left.appendChild(parkEl);
  hdRow.appendChild(avatarEl); hdRow.appendChild(left);

  if(currentUser && data.uid === currentUser.uid){
    var moreBtn = document.createElement('button');
    moreBtn.setAttribute('aria-label', 'Optionen');
    moreBtn.style.cssText = 'background:none;border:none;color:var(--muted);font-size:16px;font-weight:800;cursor:pointer;padding:0 4px;flex-shrink:0;';
    moreBtn.textContent = '⋯';
    moreBtn.onclick = function(){
      if(confirm('Diese Anfrage wirklich löschen?')){
        db.collection('trainingBuddies').doc(docId).delete().then(function(){
          toast('Anfrage gelöscht');
          loadBuddyRequests();
        }).catch(function(){ toast('Fehler beim Löschen.'); });
      }
    };
    hdRow.appendChild(moreBtn);
  }
  card.appendChild(hdRow);

  var badgeRow = document.createElement('div');
  badgeRow.style.cssText = 'display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;';
  [data.timeLabel && buddyTimeBadgeLabel(data), data.level && BUDDY_LEVEL_LABELS[data.level]].forEach(function(label){
    if(!label) return;
    var b = document.createElement('div');
    b.style.cssText = 'background:var(--bg3);border-radius:20px;padding:4px 10px;font-size:10px;color:var(--muted);font-weight:700;';
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
  actRow.style.cssText = 'display:flex;gap:8px;align-items:center;border-top:1px solid var(--border);padding-top:10px;';

  var replyCount = (data.replies || []).length;
  var replyBtn = document.createElement('button');
  replyBtn.style.cssText = 'flex:1;background:rgba(255,85,0,0.08);color:var(--accent);border:1px solid rgba(255,85,0,0.3);border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 12px;cursor:pointer;';
  replyBtn.innerHTML = '&#128170; ICH BIN DABEI (' + replyCount + ')';

  var replySection = document.createElement('div');
  replySection.style.cssText = 'display:none;margin-top:12px;';
  replyBtn.onclick = function(){
    var isOpen = replySection.style.display !== 'none';
    replySection.style.display = isOpen ? 'none' : 'block';
    if(!isOpen) buildBuddyReplySection(replySection, docId, data);
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
    empty.style.cssText = 'font-size:11px;color:var(--muted);padding:6px 0 10px;';
    empty.textContent = 'Noch keine Antworten.';
    el.appendChild(empty);
  } else {
    replies.forEach(function(r){
      var row = document.createElement('div');
      row.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--border);';
      var rname = document.createElement('div');
      rname.style.cssText = 'font-size:10px;font-weight:700;color:var(--accent);margin-bottom:2px;';
      rname.textContent = r.authorName || 'Athlet';
      var rtxt = document.createElement('div');
      rtxt.style.cssText = 'font-size:12px;color:var(--text);line-height:1.5;';
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
  inp.style.cssText = 'flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-family:inherit;font-size:16px;color:var(--text);outline:none;';
  var sendBtn = document.createElement('button');
  sendBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:8px;font-family:inherit;font-size:11px;font-weight:800;padding:9px 14px;cursor:pointer;white-space:nowrap;';
  sendBtn.textContent = 'OK';
  sendBtn.onclick = function(){
    var txt = inp.value.trim();
    if(txt.length < 2){ toast('Antwort zu kurz!'); return; }
    if(prData && prData.isPublic === false){ toast('&#128274; Aktiviere ein öffentliches Profil, um zu antworten.'); return; }
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
      toast('&#128170; Antwort gesendet!');
      loadBuddyRequests();
    }).catch(function(){ toast('Fehler beim Antworten.'); });
  };
  inpRow.appendChild(inp); inpRow.appendChild(sendBtn);
  el.appendChild(inpRow);
}

// ── ANFRAGE ERSTELLEN ─────────────────────────────────────
function openCreateBuddyRequest(){
  if(!currentUser){ toast('Bitte erst einloggen!'); return; }
  if(prData && prData.isPublic === false){
    toast('&#128274; Mit privatem Profil kannst du keine Anfrage erstellen. Stelle dein Profil im Profil-Tab auf öffentlich.');
    return;
  }

  buddySelectedPark = null;
  var ex = document.getElementById('buddy-create-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'buddy-create-ov';
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;padding:20px 20px 32px;';
  box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 16px;"></div>'+
    '<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:14px;">&#129309; Trainingspartner-Anfrage</div>';

  // Park-Auswahl
  var parkLabel = document.createElement('div');
  parkLabel.className = 'stitle'; parkLabel.style.cssText = 'margin:0 0 6px;';
  parkLabel.textContent = 'PARK';
  box.appendChild(parkLabel);

  var parkPickWrap = document.createElement('div');
  parkPickWrap.id = 'buddy-park-pick';
  box.appendChild(parkPickWrap);

  function renderParkPicker(){
    parkPickWrap.innerHTML = '';
    if(!parksData || parksData.length === 0){
      var noParks = document.createElement('div');
      noParks.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:12px;font-size:11px;color:var(--muted);margin-bottom:12px;line-height:1.5;';
      noParks.textContent = 'Noch keine Parks geladen.';
      var loadBtn = document.createElement('button');
      loadBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:11px;cursor:pointer;margin-top:8px;';
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
    list.style.cssText = 'max-height:180px;overflow-y:auto;margin-bottom:12px;';
    parksData.slice(0,15).forEach(function(park){
      var name = park.tags && (park.tags.name || park.tags['name:de']) ? (park.tags.name || park.tags['name:de']) : 'Calisthenics Park';
      var row = document.createElement('div');
      var isSel = buddySelectedPark && buddySelectedPark.name === name && buddySelectedPark.lat === park._lat;
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:6px;cursor:pointer;background:'+(isSel?'rgba(255,85,0,0.1)':'var(--bg2)')+';border:1.5px solid '+(isSel?'var(--accent)':'var(--border)')+';';
      row.innerHTML = '<div style="font-size:16px;flex-shrink:0;">&#128170;</div>'+
        '<div style="flex:1;min-width:0;font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+name+'</div>'+
        '<div style="font-size:11px;color:var(--accent);font-weight:800;flex-shrink:0;">'+formatDist(park._dist)+'</div>';
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
  timeLabel.className = 'stitle'; timeLabel.style.cssText = 'margin:6px 0 6px;';
  timeLabel.textContent = 'WANN';
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
    wbtn.dataset.day = day;
    wbtn.style.cssText = 'flex:1;padding:9px 2px;border-radius:10px;border:1.5px solid var(--border);background:none;color:var(--muted);font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;';
    wbtn.textContent = day;
    wbtn.onclick = function(){
      selectedWeekday = day;
      wdChips.querySelectorAll('button').forEach(function(b){
        var a = b.dataset.day === selectedWeekday;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'var(--accent)':'none';
        b.style.color = a?'#fff':'var(--muted)';
      });
    };
    wdChips.appendChild(wbtn);
  });
  weekdayWrap.appendChild(wdChips);
  var wdTimeInp = document.createElement('input');
  wdTimeInp.type = 'time';
  wdTimeInp.style.cssText = 'width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:16px;color:var(--text);outline:none;box-sizing:border-box;';
  weekdayWrap.appendChild(wdTimeInp);

  Object.keys(BUDDY_TIME_LABELS).forEach(function(key){
    var btn = document.createElement('button');
    btn.dataset.key = key;
    var isActive = key === selectedTime;
    btn.style.cssText = 'flex:1;padding:9px 4px;border-radius:10px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'var(--accent)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;';
    btn.innerHTML = BUDDY_TIME_LABELS[key];
    btn.onclick = function(){
      selectedTime = key;
      timeWrap.querySelectorAll('button').forEach(function(b){
        var a = b.dataset.key === selectedTime;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'var(--accent)':'none';
        b.style.color = a?'#fff':'var(--muted)';
      });
      weekdayWrap.style.display = (selectedTime === 'wochentag') ? 'block' : 'none';
    };
    timeWrap.appendChild(btn);
  });
  box.appendChild(timeWrap);
  box.appendChild(weekdayWrap);

  // Level
  var levelLabel = document.createElement('div');
  levelLabel.className = 'stitle'; levelLabel.style.cssText = 'margin:0 0 6px;';
  levelLabel.textContent = 'LEVEL';
  box.appendChild(levelLabel);
  var levelWrap = document.createElement('div');
  levelWrap.style.cssText = 'display:flex;gap:6px;margin-bottom:14px;';
  var selectedLevel = 'egal';
  Object.keys(BUDDY_LEVEL_LABELS).forEach(function(key){
    var btn = document.createElement('button');
    btn.dataset.key = key;
    var isActive = key === selectedLevel;
    btn.style.cssText = 'flex:1;padding:9px 4px;border-radius:10px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'var(--accent)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;';
    btn.innerHTML = BUDDY_LEVEL_LABELS[key];
    btn.onclick = function(){
      selectedLevel = key;
      levelWrap.querySelectorAll('button').forEach(function(b){
        var a = b.dataset.key === selectedLevel;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'var(--accent)':'none';
        b.style.color = a?'#fff':'var(--muted)';
      });
    };
    levelWrap.appendChild(btn);
  });
  box.appendChild(levelWrap);

  // Nachricht
  var msgLabel = document.createElement('div');
  msgLabel.className = 'stitle'; msgLabel.style.cssText = 'margin:0 0 6px;';
  msgLabel.textContent = 'NACHRICHT (OPTIONAL)';
  box.appendChild(msgLabel);
  var msgInp = document.createElement('textarea');
  msgInp.maxLength = 200;
  msgInp.placeholder = 'z.B. Suche jemanden für Klimmzüge und Dips...';
  msgInp.style.cssText = 'width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:16px;color:var(--text);outline:none;resize:none;height:64px;box-sizing:border-box;margin-bottom:16px;';
  box.appendChild(msgInp);

  var submitBtn = document.createElement('button');
  submitBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;padding:16px;cursor:pointer;margin-bottom:6px;';
  submitBtn.textContent = 'ANFRAGE ERSTELLEN';
  submitBtn.onclick = function(){
    if(!buddySelectedPark){ toast('Bitte einen Park wählen!'); return; }
    if(selectedTime === 'wochentag' && !selectedWeekday){ toast('Bitte einen Wochentag wählen!'); return; }
    if(prData && prData.isPublic === false){ toast('&#128274; Profil ist privat.'); return; }

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
        toast('&#129309; Anfrage erstellt!');
        loadBuddyRequests();
      })
      .catch(function(){ toast('Fehler beim Erstellen.'); });
  };
  box.appendChild(submitBtn);

  var cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:10px;cursor:pointer;';
  cancelBtn.textContent = 'Abbrechen';
  cancelBtn.onclick = function(){ ov.remove(); };
  box.appendChild(cancelBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
}
