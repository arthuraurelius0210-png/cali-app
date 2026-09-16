// v2.1 - dark mono restyle 2026-09-07

var parksMap = null;
var parksMarkers = [];
var clusterGroup = null;
var userLat = null;
var userLng = null;
var currentRadius = 2000;
var parksData = [];
var parksMapInitPending = false;

// ── DARK MAP (CSS-Filter auf der Tile-Pane, einmalig per Klasse am Container) ──
// Tokens statt Hex: alles über var(--…), damit das Theme tauschbar bleibt.
var PARKS_DARK_MAP_CSS =
  '.parks-dark .leaflet-tile-pane{filter:grayscale(1) invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(0.9);}' +
  '.parks-dark .leaflet-bar{border:1px solid var(--line2);border-radius:var(--r-sm);box-shadow:none;overflow:hidden;}' +
  '.parks-dark .leaflet-bar a{background:var(--card);color:var(--text);border-bottom:1px solid var(--line);font-family:inherit;font-weight:500;}' +
  '.parks-dark .leaflet-bar a:last-child{border-bottom:none;}' +
  '.parks-dark .leaflet-bar a:hover,.parks-dark .leaflet-bar a:focus{background:var(--card2);color:var(--text);}' +
  '.parks-dark .leaflet-bar a.leaflet-disabled{background:var(--card);color:var(--muted2);}' +
  '.parks-dark .leaflet-control-attribution{background:var(--card);color:var(--muted2);font-family:inherit;font-size:9px;letter-spacing:.04em;}' +
  '.parks-dark .leaflet-control-attribution a{color:var(--muted);}' +
  '.parks-dark .leaflet-popup-content-wrapper{background:var(--card);color:var(--text);border:1px solid var(--line2);border-radius:var(--r-card);box-shadow:none;font-family:inherit;}' +
  '.parks-dark .leaflet-popup-content{margin:12px 14px;font-size:11px;line-height:1.5;}' +
  '.parks-dark .leaflet-popup-tip{background:var(--card);box-shadow:none;}' +
  '.parks-dark .leaflet-popup-close-button{color:var(--muted) !important;font-family:inherit;}' +
  '.parks-dark .leaflet-popup-close-button:hover{color:var(--text) !important;}';

function applyParksDarkMap(cont){
  if(!cont || cont.classList.contains('parks-dark')) return;
  cont.classList.add('parks-dark');
  if(!document.getElementById('parks-dark-map-css')){
    var st = document.createElement('style');
    st.id = 'parks-dark-map-css';
    st.textContent = PARKS_DARK_MAP_CSS;
    document.head.appendChild(st);
  }
}

function initParksPage(){
  if(!parksMap){
    if(parksMapInitPending) return;
    parksMapInitPending = true;
    // Kleine Verzögerung damit das DOM-Element sichtbar ist
    setTimeout(function(){
      if(typeof L === 'undefined'){ parksMapInitPending = false; setTimeout(initParksPage, 300); return; }
      var cont = document.getElementById('parks-map');
      if(!cont || cont._leaflet_id){ parksMapInitPending = false; return; }
      applyParksDarkMap(cont);
      parksMap = L.map('parks-map', {zoomControl:true, preferCanvas:true}).setView([52.52, 13.40], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
        crossOrigin: true
      }).addTo(parksMap);
      if(typeof L.markerClusterGroup !== 'undefined'){
        clusterGroup = L.markerClusterGroup({maxClusterRadius:50, spiderfyOnMaxZoom:true, showCoverageOnHover:false, zoomToBoundsOnClick:true});
        parksMap.addLayer(clusterGroup);
      }
      parksMapInitPending = false;
      // Force redraw
      setTimeout(function(){ parksMap.invalidateSize(); }, 300);
      document.getElementById('parks-status').textContent = 'Tippe auf "Standort" um Parks in deiner Nähe zu finden.';
    }, 200);
  } else {
    parksMap.invalidateSize();
  }
}

function setRadius(r){
  currentRadius = r;
  // Segment-Control (.seg-ctl in pages.html): aktiv = Klasse .on + aria-selected; Farben kommen aus dem CSS.
  [2000,5000,10000,20000].forEach(function(v){
    var btn = document.getElementById('rbtn-'+v/1000);
    if(btn){
      var on = v===r;
      btn.classList.toggle('on', on);
      btn.setAttribute('aria-selected', on?'true':'false');
    }
  });
  if(userLat) loadParks();
}

// Text im Standort-Button tauschen, ohne das Line-Icon (SVG aus pages.html) zu verlieren.
function setLocateBtnLabel(txt){
  var btn = document.getElementById('parks-locate-btn');
  if(!btn) return;
  var svg = btn.querySelector('svg');
  btn.textContent = '';
  if(svg) btn.appendChild(svg);
  btn.appendChild(document.createTextNode(txt));
}

function locateAndLoad(){
  var statusEl = document.getElementById('parks-status');
  statusEl.textContent = 'Standort wird ermittelt...';
  setLocateBtnLabel('…');

  if(!navigator.geolocation){
    statusEl.textContent = 'Geolocation wird nicht unterstützt.';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function(pos){
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      setLocateBtnLabel('✓ Standort');
      loadParks();
    },
    function(err){
      statusEl.textContent = 'Standort konnte nicht ermittelt werden. Bitte Berechtigung erlauben.';
      setLocateBtnLabel('▷ Standort');
    },
    {enableHighAccuracy:true, timeout:10000}
  );
}

// Marker-HTML: schwarzer Kreis mit 1px --line2, nächster Park = --accent. Kein Schatten, kein Emoji.
function parkMarkerHtml(nearest){
  var ring = nearest ? 'var(--accent)' : 'var(--line2)';
  var dot  = nearest ? 'var(--accent)' : 'var(--muted)';
  return '<div style="width:18px;height:18px;border-radius:50%;background:var(--bg);border:1px solid '+ring+';display:flex;align-items:center;justify-content:center;box-sizing:border-box;">'+
    '<div style="width:6px;height:6px;border-radius:50%;background:'+dot+';"></div></div>';
}

function parkPopupHtml(name, dist, idx){
  var dp = formatDistParts(dist);
  return '<div style="min-width:180px;">'+
    '<div class="row-title" style="white-space:normal;">'+name+'</div>'+
    '<div style="display:flex;align-items:baseline;gap:4px;margin:2px 0 10px;"><span class="row-val num">'+dp.val+'</span><span class="unit">'+dp.unit+'</span><span class="row-sub" style="margin:0 0 0 4px;">entfernt</span></div>'+
    '<button type="button" class="btn sec" style="margin:0 0 6px;min-height:40px;font-size:10px;" onclick="openParkDetail('+idx+')">Park ansehen</button>'+
    '<button type="button" class="btn-g" style="width:100%;" onclick="openParkNav('+idx+')">Navigation</button>'+
    '</div>';
}

function loadParks(){
  var statusEl = document.getElementById('parks-status');
  statusEl.textContent = 'Parks werden geladen...';
  document.getElementById('parks-list').innerHTML = '';

  // Clear old markers
  if(clusterGroup){ clusterGroup.clearLayers(); } else { parksMarkers.forEach(function(m){ parksMap.removeLayer(m); }); }
  parksMarkers = [];

  // Center map on user
  parksMap.setView([userLat, userLng], currentRadius <= 2000 ? 14 : currentRadius <= 5000 ? 13 : currentRadius <= 10000 ? 12 : 11);

  // User marker: heller Punkt mit dunklem Ring
  var userIcon = L.divIcon({
    html: '<div style="width:12px;height:12px;border-radius:50%;background:var(--text);border:2px solid var(--bg);box-sizing:border-box;"></div>',
    className: '', iconAnchor:[6,6]
  });
  var userMarker = L.marker([userLat, userLng], {icon:userIcon}).addTo(parksMap);
  userMarker.bindPopup('<span class="lbl">Du bist hier</span>').openPopup();
  parksMarkers.push(userMarker);

  // Overpass - mehrere Proxies versuchen
  var query = '[out:json][timeout:30];(node["leisure"="outdoor_gym"](around:'+currentRadius+','+userLat+','+userLng+');node["sport"="calisthenics"](around:'+currentRadius+','+userLat+','+userLng+');node["leisure"="fitness_station"](around:'+currentRadius+','+userLat+','+userLng+');node["amenity"="fitness_station"](around:'+currentRadius+','+userLat+','+userLng+');node["sport"="fitness"](around:'+currentRadius+','+userLat+','+userLng+');way["leisure"="outdoor_gym"](around:'+currentRadius+','+userLat+','+userLng+');way["sport"="calisthenics"](around:'+currentRadius+','+userLat+','+userLng+');relation["leisure"="outdoor_gym"](around:'+currentRadius+','+userLat+','+userLng+'););out center;';

  var proxies = ['/api/overpass', '/.netlify/functions/overpass'];

  function processParks(data){
    parksData = data.elements || [];
    if(parksData.length === 0){ statusEl.textContent = 'Keine Parks gefunden. Versuch einen größeren Radius.'; return; }
    statusEl.textContent = parksData.length + ' Parks gefunden im Umkreis von '+(currentRadius/1000)+' km';
    var parkIcon = L.divIcon({html: parkMarkerHtml(true), className:'', iconAnchor:[9,9]});
    var parkIconDim = L.divIcon({html: parkMarkerHtml(false), className:'', iconAnchor:[9,9]});
    parksData.forEach(function(p){ var lat=p.lat||(p.center&&p.center.lat); var lng=p.lon||(p.center&&p.center.lon); if(!lat||!lng) return; p._lat=lat; p._lng=lng; p._dist=calcDist(userLat,userLng,lat,lng); });
    parksData=parksData.filter(function(p){return p._lat;});
    var unique=[];
    parksData.forEach(function(p){
      var isDup=unique.some(function(u){ return calcDist(u._lat,u._lng,p._lat,p._lng)<30; });
      if(!isDup) unique.push(p);
    });
    parksData=unique;
    parksData.sort(function(a,b){return a._dist-b._dist;});
    parksData.forEach(function(park,idx){
      var name=park.tags&&(park.tags.name||park.tags['name:de'])?(park.tags.name||park.tags['name:de']):'Calisthenics Park';
      var marker=L.marker([park._lat,park._lng],{icon: idx===0 ? parkIcon : parkIconDim});
      if(clusterGroup){ clusterGroup.addLayer(marker); } else { marker.addTo(parksMap); }
      marker.bindPopup(parkPopupHtml(name, park._dist, idx));
      parksMarkers.push(marker);
    });
    buildParksList();
    setLocateBtnLabel('✓ Standort');
  }

  function tryProxy(idx){
    if(idx>=proxies.length){
      statusEl.textContent='Fehler beim Laden. Bitte nochmal versuchen.';
      setLocateBtnLabel('▷ Standort');
      return;
    }
    statusEl.textContent='Parks werden geladen...';
    var controller = window.AbortController ? new AbortController() : null;
    var timer = controller ? setTimeout(function(){ controller.abort(); }, 25000) : null;
    fetch(proxies[idx], {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query,
      signal: controller ? controller.signal : undefined
    })
      .then(function(r){ if(timer) clearTimeout(timer); if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(data){ processParks(data); })
      .catch(function(e){ if(timer) clearTimeout(timer); console.log('Proxy '+idx+' failed:',e.message); tryProxy(idx+1); });
  }
  tryProxy(0);
}

// ── Gespeicherte Parks (real, lokal persistiert) ───────────
function getParkId(park){
  return 'park_'+(park.id || Math.round(park._lat*1000)+'_'+Math.round(park._lng*1000));
}
function getSavedParkIds(){
  try{ return JSON.parse(localStorage.getItem('cali_saved_parks')||'[]'); }catch(x){ return []; }
}
function isParkSaved(parkId){
  return getSavedParkIds().indexOf(parkId) > -1;
}
function toggleParkSaved(parkId){
  var saved = getSavedParkIds();
  var idx = saved.indexOf(parkId);
  if(idx>-1){ saved.splice(idx,1); } else { saved.push(parkId); }
  try{ localStorage.setItem('cali_saved_parks', JSON.stringify(saved)); }catch(x){}
  return idx===-1;
}

// Nur echte, aus OSM-Tags ableitbare Infos — keine erfundenen Bewertungen/Ausstattungslisten.
function parkLocationLabel(park){
  var t = park.tags || {};
  return t['addr:suburb'] || t['addr:city'] || t['addr:street'] || '';
}
function parkAccessLabel(park){
  var a = park.tags && park.tags.access;
  if(a === 'private' || a === 'no') return 'Privat';
  if(a === 'yes' || a === 'public' || a === 'permissive') return 'Öffentlich';
  return null;
}
function parkRealTags(park){
  var t = park.tags || {};
  var tags = [];
  function addTag(raw){
    if(!raw) return;
    String(raw).split(';').forEach(function(part){
      var label = part.trim().replace(/_/g,' ');
      if(!label) return;
      label = label.charAt(0).toUpperCase()+label.slice(1);
      if(tags.indexOf(label)===-1) tags.push(label);
    });
  }
  addTag(t.fitness_station);
  if(t.sport && t.sport !== 'calisthenics' && t.sport !== 'fitness') addTag(t.sport);
  return tags.slice(0,3);
}

// Kleiner Outline-Tag (uppercase per CSS, Quelltext bleibt Mixed Case)
var PARK_TAG_CSS = 'background:var(--card2);border:1px solid var(--line);border-radius:var(--r-sm);padding:2px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap;';

var parksListExpanded = false;

function buildParksList(){
  parksListExpanded = false;
  renderParksListHeader();
  renderParksListItems();
}

function renderParksListHeader(){
  var headerEl = document.getElementById('parks-list-header');
  if(!headerEl) return;
  headerEl.innerHTML = '';
  var title = document.createElement('h2');
  title.className = 'stitle';
  title.style.cssText = 'margin:0;';
  title.textContent = 'Parks in deiner Nähe';
  headerEl.appendChild(title);
  if(parksData.length > 5){
    var link = document.createElement('button');
    link.type = 'button';
    link.className = 'u pressable';
    link.style.cssText = 'background:none;border:none;color:var(--muted);font-family:inherit;font-size:10px;font-weight:500;cursor:pointer;padding:6px 0;';
    link.innerHTML = parksListExpanded ? 'Weniger' : 'Alle anzeigen &#8250;';
    link.onclick = function(){ parksListExpanded = !parksListExpanded; renderParksListHeader(); renderParksListItems(); };
    headerEl.appendChild(link);
  }
}

function renderParksListItems(){
  var listEl = document.getElementById('parks-list');
  if(!listEl) return;
  listEl.innerHTML = '';
  var items = parksListExpanded ? parksData : parksData.slice(0,5);
  if(!items.length) return;

  // Bordered Liste mit zweistelligem Rang (Liste ist nach Distanz sortiert)
  var list = document.createElement('div');
  list.className = 'list';

  items.forEach(function(park, idx){
    var name = park.tags && (park.tags.name || park.tags['name:de']) ? (park.tags.name || park.tags['name:de']) : 'Calisthenics Park';
    var parkId = getParkId(park);
    var locLabel = parkLocationLabel(park);
    var accessLabel = parkAccessLabel(park);
    var tags = parkRealTags(park);
    var saved = isParkSaved(parkId);
    var dp = formatDistParts(park._dist);

    var card = document.createElement('div');
    card.className = 'list-row pressable';
    card.style.cssText = 'align-items:center;content-visibility:auto;contain-intrinsic-size:auto 56px;';
    card.setAttribute('role','button');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label', name + ' öffnen');
    card.onclick = function(e){
      if(e.target && e.target.closest && e.target.closest('button')) return;
      openParkDetail(idx);
    };
    card.onkeydown = function(e){
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openParkDetail(idx); }
    };

    var rankEl = document.createElement('span');
    rankEl.className = 'row-index num';
    rankEl.textContent = ('0'+(idx+1)).slice(-2);

    var info = document.createElement('div');
    info.className = 'row-main';
    var nameRow = document.createElement('div');
    nameRow.className = 'row-title';
    nameRow.style.cssText = 'display:flex;align-items:center;gap:6px;';
    if(idx===0){
      // Nächster Park: orangener Dot vor dem Namen
      var near = document.createElement('span');
      near.className = 'live-dot';
      near.setAttribute('title','Nächster Park');
      nameRow.appendChild(near);
    }
    var nameTxt = document.createElement('span');
    nameTxt.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;';
    nameTxt.textContent = name;
    nameRow.appendChild(nameTxt);
    info.appendChild(nameRow);
    var subParts = [];
    if(locLabel) subParts.push(locLabel);
    if(accessLabel) subParts.push(accessLabel);
    if(subParts.length){
      var locRow = document.createElement('div');
      locRow.className = 'row-sub';
      locRow.textContent = subParts.join(' · ');
      info.appendChild(locRow);
    }
    if(tags.length){
      var tagRow = document.createElement('div');
      tagRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;';
      tags.forEach(function(t){
        var chip = document.createElement('span');
        chip.style.cssText = PARK_TAG_CSS;
        chip.textContent = t;
        tagRow.appendChild(chip);
      });
      info.appendChild(tagRow);
    }

    // Distanz als Mono-Wert + Einheit
    var distEl = document.createElement('div');
    distEl.style.cssText = 'display:flex;align-items:baseline;gap:4px;flex-shrink:0;';
    distEl.innerHTML = '<span class="row-val num">'+dp.val+'</span><span class="unit">'+dp.unit+'</span>';

    var bookmarkBtn = document.createElement('button');
    bookmarkBtn.type = 'button';
    bookmarkBtn.className = 'icon-btn sm';
    bookmarkBtn.setAttribute('aria-label', saved ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen');
    bookmarkBtn.setAttribute('aria-pressed', saved ? 'true' : 'false');
    bookmarkBtn.style.color = saved ? 'var(--accent)' : 'var(--muted)';
    if(saved) bookmarkBtn.style.borderColor = 'var(--accent)';
    bookmarkBtn.innerHTML = typeof ci === 'function' ? ci('bookmark') : '&#9633;';
    var bmSvg = bookmarkBtn.querySelector('svg');
    if(bmSvg) bmSvg.style.fill = saved ? 'currentColor' : 'none';
    bookmarkBtn.onclick = function(e){
      e.stopPropagation();
      var nowSaved = toggleParkSaved(parkId);
      bookmarkBtn.style.color = nowSaved ? 'var(--accent)' : 'var(--muted)';
      bookmarkBtn.style.borderColor = nowSaved ? 'var(--accent)' : '';
      bookmarkBtn.setAttribute('aria-label', nowSaved ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen');
      bookmarkBtn.setAttribute('aria-pressed', nowSaved ? 'true' : 'false');
      if(bmSvg) bmSvg.style.fill = nowSaved ? 'currentColor' : 'none';
      if(bookmarkBtn.animate && !(window.caliMotion && caliMotion.reduced())){
        bookmarkBtn.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:200,easing:'cubic-bezier(0.22,1,0.36,1)'});
      }
    };

    var chev = document.createElement('span');
    chev.className = 'row-chev';

    card.appendChild(rankEl); card.appendChild(info); card.appendChild(distEl); card.appendChild(bookmarkBtn); card.appendChild(chev);
    list.appendChild(card);
  });

  listEl.appendChild(list);
  if(window.caliMotion) caliMotion.stagger(list);
}

function calcDist(lat1, lon1, lat2, lon2){
  var R = 6371000;
  var dLat = (lat2-lat1)*Math.PI/180;
  var dLon = (lon2-lon1)*Math.PI/180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function formatDist(m){
  if(m < 1000) return Math.round(m)+' m';
  return (m/1000).toFixed(1)+' km';
}

// Wert und Einheit getrennt (Mono-Wert + .unit-Label)
function formatDistParts(m){
  if(m < 1000) return {val: String(Math.round(m)), unit: 'm'};
  return {val: (m/1000).toFixed(1), unit: 'km'};
}

// ── PROFIL ÖFFENTLICH/PRIVAT ──────────────────────────────
function buildPrivacyToggle(){
  var el = document.getElementById('pr-privacy-toggle');
  if(!el) return;
  el.innerHTML = '';
  var isPublic = prData && prData.isPublic !== false; // default public

  var wrap = document.createElement('div');
  wrap.className = 'list';
  wrap.style.cssText = 'margin-bottom:10px;';
  var row = document.createElement('div');
  row.className = 'list-row';
  row.style.cssText = 'cursor:default;';
  var txtWrap = document.createElement('div');
  txtWrap.className = 'row-main';
  var titleEl = document.createElement('div');
  titleEl.className = 'row-title';
  var subEl = document.createElement('div');
  subEl.className = 'row-sub';
  function renderLabels(){
    titleEl.textContent = isPublic ? 'Profil öffentlich' : 'Profil privat';
    subEl.textContent = isPublic ? 'Andere können dich in Bestenlisten sehen' : 'Dein Name bleibt anonym';
  }
  renderLabels();
  txtWrap.appendChild(titleEl); txtWrap.appendChild(subEl);
  row.appendChild(txtWrap);

  var toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'toggle' + (isPublic ? ' on' : '');
  toggle.setAttribute('role','switch');
  toggle.setAttribute('aria-checked', isPublic?'true':'false');
  toggle.setAttribute('aria-label','Profil öffentlich anzeigen');
  toggle.onclick = function(){
    isPublic = !isPublic;
    if(typeof prData === 'undefined' || !prData) window.prData = {};
    prData.isPublic = isPublic;
    try{ localStorage.setItem('cali_profile', JSON.stringify(prData)); }catch(x){}
    if(typeof spr === 'function') spr();
    if(typeof fbSave === 'function') fbSave();
    toggle.classList.toggle('on', isPublic);
    toggle.setAttribute('aria-checked', isPublic?'true':'false');
    renderLabels();
    if(typeof toast === 'function') toast(isPublic ? 'Profil öffentlich' : 'Profil privat');
  };
  row.appendChild(toggle);
  wrap.appendChild(row);
  el.appendChild(wrap);
}

// ── ADMIN PANEL ───────────────────────────────────────────
var ADMIN_UID = 'YOUR_UID_HERE'; // wird unten dynamisch gesetzt

function checkAndShowAdminBtn(){
  if(!currentUser) return;
  // Store your UID after first login
  var savedAdminUid = null;
  try{ savedAdminUid = localStorage.getItem('cali_admin_uid'); }catch(x){}
  if(!savedAdminUid){
    // First time: save current user's UID as admin
    // Only do this if no admin set yet
    try{ localStorage.setItem('cali_admin_uid', currentUser.uid); savedAdminUid = currentUser.uid; }catch(x){}
  }
  if(currentUser.uid === savedAdminUid){
    var adminBtn = document.getElementById('admin-panel-btn');
    if(adminBtn) adminBtn.style.display = 'block';
  }
}

// Gemeinsamer Karten-Inhalt für Bestenlisten-Einträge im Admin-Panel
function adminEntryHtml(d, showNoVideo){
  var dateStr = '';
  try{ dateStr = new Date(d.createdAt||d.date).toLocaleDateString('de-DE'); }catch(x){}
  return '<div class="row-title" style="white-space:normal;margin-bottom:2px;">'+(d.name||d.userName||'Anonym')+' — '+(d.exerciseName||d.exercise||'')+'</div>'+
    '<div class="row-sub">'+(d.parkName||'Kein Park')+' &middot; <span class="num">'+(d.value||d.reps||0)+'</span> '+(d.unit||'Wdh')+'</div>'+
    '<div class="lbl" style="margin:4px 0 10px;">'+dateStr+'</div>'+
    (d.videoUrl
      ? '<a href="'+d.videoUrl+'" target="_blank" rel="noopener" class="u" style="display:inline-block;font-size:10px;font-weight:600;color:var(--accent);margin-bottom:10px;">Video ansehen &#8250;</a>'
      : (showNoVideo ? '<div class="lbl" style="color:var(--red);margin-bottom:10px;">Kein Video</div>' : ''));
}

function openAdminPanel(){
  var ex = document.getElementById('admin-panel-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'admin-panel-ov';
  ov.className = 'backdrop';

  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:88vh;overflow-y:auto;';

  box.innerHTML =
    '<div class="sheet-grip"></div>'+
    '<div class="ttl" style="margin-bottom:12px;">Admin-Panel</div>';

  // Tabs als Segment-Control
  var tabWrap = document.createElement('div');
  tabWrap.className = 'seg-ctl';
  tabWrap.setAttribute('role','tablist');
  var tabs2 = [{label:'Ausstehend',id:'pending'},{label:'Genehmigt',id:'approved'},{label:'Abgelehnt',id:'rejected'},{label:'Parks',id:'parks'},{label:'Woche',id:'weekly'}];
  var activeAdminTab = 'pending';
  var listEl = document.createElement('div');
  var approvedEl = document.createElement('div'); approvedEl.style.display='none';
  var rejectedEl = document.createElement('div'); rejectedEl.style.display='none';
  var suggestEl = document.createElement('div'); suggestEl.style.display='none';
  var weeklyEl = document.createElement('div'); weeklyEl.style.display='none';

  tabs2.forEach(function(t){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role','tab');
    btn.className = t.id===activeAdminTab ? 'on' : '';
    btn.setAttribute('aria-selected', t.id===activeAdminTab ? 'true' : 'false');
    btn.textContent = t.label;
    btn.onclick = function(){
      activeAdminTab = t.id;
      tabWrap.querySelectorAll('button').forEach(function(b,bi){
        var a = tabs2[bi].id===activeAdminTab;
        b.classList.toggle('on', a);
        b.setAttribute('aria-selected', a ? 'true' : 'false');
      });
      listEl.style.display = t.id==='pending'?'block':'none';
      approvedEl.style.display = t.id==='approved'?'block':'none';
      rejectedEl.style.display = t.id==='rejected'?'block':'none';
      suggestEl.style.display = t.id==='parks'?'block':'none';
      weeklyEl.style.display = t.id==='weekly'?'block':'none';
      if(t.id==='approved' && !approvedEl._loaded){ loadApprovedEntries(approvedEl); approvedEl._loaded=true; }
      if(t.id==='rejected' && !rejectedEl._loaded){ loadRejectedEntries(rejectedEl); rejectedEl._loaded=true; }
      if(t.id==='parks' && !suggestEl._loaded){ loadParkSuggestions(suggestEl); suggestEl._loaded=true; }
      if(t.id==='weekly' && !weeklyEl._loaded && typeof renderWeeklyAdmin==='function'){ renderWeeklyAdmin(weeklyEl); weeklyEl._loaded=true; }
    };
    tabWrap.appendChild(btn);
  });
  box.appendChild(tabWrap);
  listEl.innerHTML = '<div class="empty">Lädt…</div>';
  box.appendChild(listEl); box.appendChild(approvedEl); box.appendChild(rejectedEl); box.appendChild(suggestEl); box.appendChild(weeklyEl);

  // Load pending entries
  db.collection('globalLeaderboard').where('status','==','pending').get()
    .then(function(snap){
      listEl.innerHTML = '';
      if(snap.empty){
        listEl.innerHTML = '<div class="empty">Keine ausstehenden Einträge</div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = adminEntryHtml(d, true);

        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;';

        var approveBtn = document.createElement('button');
        approveBtn.type = 'button';
        approveBtn.className = 'btn sec sm';
        approveBtn.style.cssText = 'flex:1;margin:0;min-height:40px;';
        approveBtn.textContent = '✓ Genehmigen';
        approveBtn.onclick = function(){
          doc.ref.update({status:'approved'}).then(function(){
            card.remove();
            toast('Genehmigt.');
          });
        };

        var rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.className = 'btn-g danger';
        rejectBtn.style.cssText = 'flex:1;min-height:40px;';
        rejectBtn.textContent = '✗ Ablehnen';
        rejectBtn.onclick = function(){
          doc.ref.update({status:'rejected'}).then(function(){
            card.remove();
            toast('Abgelehnt.');
          });
        };

        btnRow.appendChild(approveBtn);
        btnRow.appendChild(rejectBtn);
        card.appendChild(btnRow);
        listEl.appendChild(card);
      });
      if(window.caliMotion) caliMotion.stagger(listEl);
    })
    .catch(function(){ listEl.innerHTML = '<div class="empty">Fehler beim Laden</div>'; });

  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn-g';
  closeBtn.style.cssText = 'width:100%;min-height:44px;margin-top:6px;';
  closeBtn.textContent = 'Schließen';
  closeBtn.onclick = function(){ ov.remove(); };
  box.appendChild(closeBtn);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}
// ── PARK NAVIGATION (direkt) ───────────────────────────────
function openParkNav(idx){
  var park = parksData[idx];
  if(!park) return;
  var ex = document.getElementById('park-modal-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'park-modal-ov';
  ov.className = 'backdrop';
  var box = document.createElement('div');
  box.className = 'sheet';
  var name = park.tags&&(park.tags.name||park.tags['name:de'])?(park.tags.name||park.tags['name:de']):'Calisthenics Park';
  var addr = '';
  if(park.tags){
    if(park.tags['addr:street']) addr = park.tags['addr:street']+(park.tags['addr:housenumber']?' '+park.tags['addr:housenumber']:'');
    if(park.tags['addr:city']) addr += (addr?', ':'')+park.tags['addr:city'];
  }
  box.innerHTML = '<div class="sheet-grip"></div>'+
    '<div class="ttl" style="margin-bottom:4px;">'+name+'</div>'+
    (addr?'<div class="row-sub" style="margin-bottom:14px;">'+addr+'</div>':'')+
    '<div class="lbl" style="margin-bottom:10px;">Navigation öffnen mit</div>';

  // Optionen als bordered Liste
  var list = document.createElement('div');
  list.className = 'list';

  function navRow(idxNum, label){
    var r = document.createElement('button');
    r.type = 'button';
    r.className = 'list-row pressable';
    r.innerHTML = '<span class="row-index num">'+('0'+idxNum).slice(-2)+'</span><div class="row-main"><div class="row-title">'+label+'</div></div><span class="row-chev"></span>';
    return r;
  }

  // Google Maps
  var gBtn = navRow(1, 'Google Maps');
  gBtn.onclick = function(){ window.open('https://www.google.com/maps/dir/?api=1&destination='+park._lat+','+park._lng+'&travelmode=walking','_blank'); ov.remove(); };

  // Apple Maps
  var aBtn = navRow(2, 'Apple Maps');
  aBtn.onclick = function(){ window.location.href='maps://maps.apple.com/?daddr='+park._lat+','+park._lng+'&dirflg=w'; ov.remove(); };

  // Adresse kopieren
  var copyBtn = navRow(3, 'Adresse kopieren');
  copyBtn.onclick = function(){
    var txt = (addr || (park._lat+', '+park._lng));
    var done = function(){ var t = copyBtn.querySelector('.row-title'); if(t) t.textContent = 'Kopiert'; setTimeout(function(){ ov.remove(); },800); };
    navigator.clipboard ? navigator.clipboard.writeText(txt).then(done) : (function(){ var t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();done(); })();
  };

  list.appendChild(gBtn); list.appendChild(aBtn); list.appendChild(copyBtn);

  var cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn-g';
  cancelBtn.style.cssText = 'width:100%;min-height:44px;margin-top:6px;';
  cancelBtn.textContent = 'Schließen';
  cancelBtn.onclick = function(){ ov.remove(); };

  box.appendChild(list); box.appendChild(cancelBtn);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}

// ── PARK DETAIL VOLLBILD ───────────────────────────────────
function openParkDetail(idx){
  var park = parksData[idx];
  if(!park) return;
  var name = park.tags&&(park.tags.name||park.tags['name:de'])?(park.tags.name||park.tags['name:de']):'Calisthenics Park';
  var parkId = 'park_'+(park.id||Math.round(park._lat*1000)+'_'+Math.round(park._lng*1000));
  var dp = formatDistParts(park._dist);

  var ex = document.getElementById('park-detail-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'park-detail-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar: ← | Titel | Nav
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
  titleEl.textContent = name;
  var navBtn = document.createElement('button');
  navBtn.type = 'button';
  navBtn.className = 'btn-g';
  navBtn.style.cssText = 'flex-shrink:0;';
  navBtn.textContent = 'Nav';
  navBtn.setAttribute('aria-label','Navigation zum Park');
  navBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
    openParkNav(idx);
  };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(navBtn);
  ov.appendChild(topBar);

  // Kontextzeile: Distanz (Mono-Wert + Einheit) + Rekord-CTA (die eine orange Aktion dieses Screens)
  var ctxRow = document.createElement('div');
  ctxRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;border-bottom:1px solid var(--line);flex-shrink:0;';
  var distEl = document.createElement('div');
  distEl.style.cssText = 'display:flex;align-items:baseline;gap:4px;min-width:0;';
  distEl.innerHTML = '<span class="live-dot" style="align-self:center;margin-right:4px;"></span><span class="row-val num">'+dp.val+'</span><span class="unit">'+dp.unit+'</span><span class="lbl" style="margin-left:4px;">entfernt</span>';
  var recBtn2 = document.createElement('button');
  recBtn2.type = 'button';
  recBtn2.className = 'btn sm';
  recBtn2.textContent = 'Rekord';
  recBtn2.onclick = function(){ openParkRecordSubmit(idx); };
  ctxRow.appendChild(distEl); ctxRow.appendChild(recBtn2);
  ov.appendChild(ctxRow);

  // Tabs als Segment-Control
  var tabBar = document.createElement('div');
  tabBar.className = 'seg-ctl';
  tabBar.setAttribute('role','tablist');
  tabBar.style.cssText = 'margin:12px 16px 0;flex-shrink:0;';
  var tabDefs = [
    {label:'Bestenliste', id:'lb'},
    {label:'Meine Stats', id:'stats'},
    {label:'Community', id:'comm'},
  ];
  var bodies = [];
  tabDefs.forEach(function(t, ti){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role','tab');
    btn.className = ti===0 ? 'on' : '';
    btn.setAttribute('aria-selected', ti===0 ? 'true' : 'false');
    btn.textContent = t.label;
    var body = document.createElement('div');
    body.className = 'sheet-scroll';
    body.style.cssText = 'display:'+(ti===0?'block':'none')+';flex:1;padding:14px 16px 40px;overflow-y:auto;';
    bodies.push(body);
    btn.onclick = (function(tIdx){
      return function(){
        tabBar.querySelectorAll('button').forEach(function(b,bi){
          b.classList.toggle('on', bi===tIdx);
          b.setAttribute('aria-selected', bi===tIdx ? 'true' : 'false');
        });
        bodies.forEach(function(b,bi){ b.style.display=bi===tIdx?'block':'none'; });
        if(tIdx===0 && !bodies[0]._loaded){ buildParkDetailLeaderboard(bodies[0], parkId, name); bodies[0]._loaded=true; }
        if(tIdx===1 && !bodies[1]._loaded){ buildParkDetailStats(bodies[1], parkId); bodies[1]._loaded=true; }
        if(tIdx===2 && !bodies[2]._loaded){ buildParkDetailCommunity(bodies[2], parkId, name); bodies[2]._loaded=true; }
      };
    })(ti);
    tabBar.appendChild(btn);
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
  buildParkDetailLeaderboard(bodies[0], parkId, name);
  bodies[0]._loaded = true;
}

// Chip-Reihe (Filter): aktiv = .on, Umschalten per classList
function setChipActive(container, isActiveFn){
  container.querySelectorAll('button').forEach(function(b){
    var a = isActiveFn(b);
    b.classList.toggle('on', a);
    b.setAttribute('aria-pressed', a ? 'true' : 'false');
  });
}

function buildParkDetailLeaderboard(el, parkId, parkName){
  el.innerHTML = '';
  if(typeof db === 'undefined' || !db){
    el.innerHTML = '<div style="padding:20px 0;font-size:11px;color:var(--muted);">Einloggen um Bestenliste zu sehen.</div>'; return;
  }

  // Eintrag einreichen (helle Sekundär-CTA; die orange Primär-Aktion ist "Rekord" oben)
  var subBtn = document.createElement('button');
  subBtn.type = 'button';
  subBtn.className = 'btn sec';
  subBtn.style.cssText = 'margin:0 0 14px;min-height:44px;';
  subBtn.textContent = '+ Eintrag einreichen';
  subBtn.onclick = function(){ openRecordSubmit(parkId, parkName); };
  el.appendChild(subBtn);

  // Übungs-Auswahl horizontal (wie globale Bestenliste)
  var exLabel = document.createElement('h2');
  exLabel.className = 'stitle';
  exLabel.style.cssText = 'margin:0 0 8px;';
  exLabel.textContent = 'Übung';
  el.appendChild(exLabel);

  var PARK_CATS = [
    {id:'all',label:'Alle'},
    {id:'Pull',label:'Pull'},
    {id:'Push',label:'Push'},
    {id:'Core',label:'Core'},
    {id:'Legs',label:'Legs'},
    {id:'Skills',label:'Skills'},  ];
  var activeCat = 'all';

  // Kategorie-Filter
  var catWrap = document.createElement('div');
  catWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;margin-bottom:10px;scrollbar-width:none;';
  PARK_CATS.forEach(function(cat){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.catId = cat.id;
    var isActive = cat.id === activeCat;
    btn.className = 'chip' + (isActive ? ' on' : '');
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    btn.style.cssText = 'flex-shrink:0;';
    btn.textContent = cat.label;
    btn.onclick = function(){
      activeCat = cat.id;
      setChipActive(catWrap, function(b){ return b.dataset.catId === activeCat; });
      rebuildExWrap();
    };
    catWrap.appendChild(btn);
  });
  el.appendChild(catWrap);

  function getParkExercises(cat){
    var result=[], seen={};
    if(typeof EX_DB!=='undefined'){
      EX_DB.forEach(function(ex,i){
        if(cat==='all'||ex.cat===cat){
          var k=ex.name+'|'+ex.unit;
          if(!seen[k]){seen[k]=1;result.push({id:'ex_'+i,name:ex.name,unit:ex.unit,cat:ex.cat});}
        }
      });
    }
    if(cat==='all'||cat==='Skills'){
      [{id:'skill_lsit',name:'L-Sit',unit:'Sek'},{id:'skill_handstand',name:'Handstand (frei)',unit:'Sek'},
       {id:'skill_frontlever',name:'Front Lever Hold',unit:'Sek'},{id:'skill_backlever',name:'Back Lever Hold',unit:'Sek'},
       {id:'skill_planche',name:'Planche',unit:'Sek'},{id:'skill_humanflag',name:'Human Flag',unit:'Sek'},
       {id:'skill_360',name:'360 Pull-Up',unit:'Wdh'},{id:'skill_rings',name:'Ring Muscle-Up',unit:'Wdh'}
      ].forEach(function(s){ var k=s.name+'|'+s.unit; if(!seen[k]){seen[k]=1;result.push(s);} });
    }
    return result;
  }

  var selEx = null;
  var listEl2 = document.createElement('div');
  var exWrapOuter = document.createElement('div');
  exWrapOuter.style.cssText = 'margin-bottom:10px;';
  el.appendChild(exWrapOuter);
  el.appendChild(listEl2);

  function rebuildExWrap(){
    exWrapOuter.innerHTML = '';
    var exercises = getParkExercises(activeCat);
    if(!selEx || !exercises.find(function(e){ return e.id===selEx.id; })){
      selEx = exercises[0] || null;
    }
    var exWrap2 = document.createElement('div');
    exWrap2.style.cssText = 'display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;';
    exercises.forEach(function(ex){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.exId = ex.id;
      var isActive = selEx && ex.id === selEx.id;
      // Übungsnamen sind Content: Chip-Uppercase hier ausschalten
      btn.className = 'chip' + (isActive ? ' on' : '');
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.style.cssText = 'flex-shrink:0;text-transform:none;letter-spacing:0;font-size:11px;';
      btn.textContent = ex.name;
      btn.onclick = function(){
        selEx = ex;
        setChipActive(exWrap2, function(b){ return b.dataset.exId === selEx.id; });
        loadParkLb(listEl2, parkId, selEx);
      };
      exWrap2.appendChild(btn);
    });
    exWrapOuter.appendChild(exWrap2);
    if(selEx) loadParkLb(listEl2, parkId, selEx);
  }

  rebuildExWrap();
}

function loadParkLb(el, parkId, ex){
  el.innerHTML = '<div class="empty">Lädt…</div>';
  db.collection('parkLeaderboard').doc(parkId).collection('entries')
    .where('exercise','==',ex.id)
    .orderBy('value','desc').limit(20)
    .get().then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div style="text-align:center;padding:24px 10px;font-size:11px;color:var(--muted);line-height:1.6;">Noch keine Einträge für '+ex.name+'.<br>Sei der Erste!</div>';
        return;
      }
      var uid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
      var list = document.createElement('div');
      list.className = 'list';
      snap.docs.forEach(function(doc, i){
        var d = doc.data();
        var rank = i+1;
        var isMe = uid && d.uid === uid;
        var row = document.createElement('div');
        row.className = 'list-row';
        row.style.cssText = 'cursor:default;'+(isMe?'background:var(--accent-soft);':'')+'content-visibility:auto;contain-intrinsic-size:auto 56px;';
        var rankEl = document.createElement('span');
        rankEl.className = 'row-index num';
        if(rank===1) rankEl.style.color = 'var(--accent)';
        rankEl.textContent = ('0'+rank).slice(-2);
        var infoEl = document.createElement('div');
        infoEl.className = 'row-main';
        infoEl.innerHTML = '<div class="row-title">'+(d.name||'Anonym')+(isMe?' <span style="'+PARK_TAG_CSS+'margin-left:6px;color:var(--accent);border-color:var(--accent);">Du</span>':'')+'</div>';
        var valEl = document.createElement('div');
        valEl.style.cssText = 'display:flex;align-items:baseline;gap:4px;flex-shrink:0;';
        valEl.innerHTML = '<span class="kpi num" style="font-size:22px;color:'+(rank===1?'var(--accent)':'var(--text)')+';">'+d.value+'</span><span class="unit">'+ex.unit+'</span>';
        row.appendChild(rankEl); row.appendChild(infoEl); row.appendChild(valEl);
        if(d.videoUrl){
          var vBtn = document.createElement('button');
          vBtn.type = 'button';
          vBtn.className = 'icon-btn sm';
          vBtn.innerHTML = '&#9654;';
          vBtn.setAttribute('aria-label', 'Video abspielen');
          vBtn.onclick = function(){ playVideo(d.videoUrl); };
          row.appendChild(vBtn);
        }
        list.appendChild(row);
      });
      el.appendChild(list);
      if(window.caliMotion) caliMotion.stagger(list);
    }).catch(function(e){
      el.innerHTML = '<div style="padding:12px 0;color:var(--muted);font-size:11px;">Fehler: '+e.message+'</div>';
    });
}

function buildParkDetailStats(el, parkId){
  el.innerHTML = '<h2 class="stitle" style="margin:0 0 12px;">Meine Stats</h2>';
  if(typeof db === 'undefined' || !db || !firebase.auth().currentUser){
    el.innerHTML += '<div style="color:var(--muted);font-size:11px;text-align:center;padding:20px 0;">Einloggen um deine Stats zu sehen.</div>'; return;
  }
  var uid = firebase.auth().currentUser.uid;
  db.collection('parkStats').doc(parkId).collection('users').doc(uid).get().then(function(doc){
    if(!doc.exists){ el.innerHTML += '<div style="color:var(--muted);font-size:11px;text-align:center;padding:20px 0;line-height:1.6;">Noch keine Workouts in diesem Park.<br>Trainiere hier und deine Stats erscheinen!</div>'; return; }
    var d = doc.data();
    var stats = [
      {label:'Workouts', value: d.workoutCount||0, unit:''},
      {label:'Gesamte Wdh', value: d.totalReps||0, unit:'Wdh'},
      {label:'Letztes Training', value: d.lastWorkout?d.lastWorkout.slice(0,10):'—', unit:''},
    ];
    var list = document.createElement('div');
    list.className = 'list';
    stats.forEach(function(s, i){
      var row = document.createElement('div');
      row.className = 'list-row';
      row.style.cssText = 'cursor:default;';
      row.innerHTML = '<span class="row-index num">'+('0'+(i+1)).slice(-2)+'</span>'+
        '<div class="row-main"><div class="lbl">'+s.label+'</div></div>'+
        '<div style="display:flex;align-items:baseline;gap:4px;flex-shrink:0;"><span class="kpi num" style="font-size:22px;">'+s.value+'</span>'+(s.unit?'<span class="unit">'+s.unit+'</span>':'')+'</div>';
      list.appendChild(row);
    });
    el.appendChild(list);
  }).catch(function(){ el.innerHTML += '<div style="color:var(--muted);font-size:11px;">Fehler.</div>'; });
}

function buildParkDetailCommunity(el, parkId, parkName){
  el.innerHTML = '<h2 class="stitle" style="margin:0 0 12px;">Community-Workouts</h2>';
  if(typeof db === 'undefined' || !db){ el.innerHTML += '<div style="color:var(--muted);font-size:11px;">Einloggen um Community zu sehen.</div>'; return; }
  db.collection('parkWorkouts').doc(parkId).collection('posts').orderBy('date','desc').limit(20).get().then(function(snap){
    if(snap.empty){ el.innerHTML += '<div style="color:var(--muted);font-size:11px;text-align:center;padding:20px 0;line-height:1.6;">Noch keine Community-Workouts hier.<br>Sei der Erste!</div>'; return; }
    snap.forEach(function(doc){
      var d = doc.data();
      var card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:6px;">'+
        '<div class="row-title">'+(d.userName||'Anonym')+'</div>'+
        '<div class="lbl" style="color:var(--muted2);flex-shrink:0;">'+(d.date?d.date.slice(0,10):'')+'</div>'+
        '</div>'+
        '<div class="row-sub" style="margin:0;">'+(d.summary||'')+'</div>';
      el.appendChild(card);
    });
    if(window.caliMotion) caliMotion.stagger(el);
  }).catch(function(){ el.innerHTML += '<div style="color:var(--muted);font-size:11px;">Fehler beim Laden.</div>'; });
}

// ── PARK REKORD MIT GPS-PRÜFUNG ────────────────────────────
function openParkRecordSubmit(idx){
  var park = parksData[idx];
  if(!park) return;
  var name = park.tags&&(park.tags.name||park.tags['name:de'])?(park.tags.name||park.tags['name:de']):'Calisthenics Park';
  var parkId = 'park_'+(park.id||Math.round(park._lat*1000)+'_'+Math.round(park._lng*1000));

  // GPS check - must be within 150m of park
  if(!userLat || !userLng){
    showParkRecordGPSError(name, 'Standort nicht verfügbar. Bitte Standort aktivieren.');
    return;
  }
  var dist = calcDist(userLat, userLng, park._lat, park._lng);
  if(dist > 150){
    showParkRecordGPSError(name, 'Du bist '+Math.round(dist)+'m vom Park entfernt.\nDu musst im Park sein (max. 150m) um einen Park-Rekord aufzustellen!');
    return;
  }

  // User is in park - open record submit
  openRecordSubmit(parkId, name);
}

function showParkRecordGPSError(parkName, msg){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;';
  var box = document.createElement('div');
  box.className = 'card';
  box.style.cssText = 'max-width:340px;width:100%;text-align:center;padding:20px 16px;margin:0;';
  box.innerHTML =
    '<div class="lbl" style="margin-bottom:10px;">Standort-Prüfung</div>'+
    '<div class="ttl" style="margin-bottom:8px;">'+parkName+'</div>'+
    '<div style="font-size:11px;color:var(--muted);margin-bottom:16px;line-height:1.6;white-space:pre-line;">'+msg+'</div>';
  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn';
  closeBtn.style.cssText = 'margin:0;';
  closeBtn.textContent = 'OK, verstanden';
  closeBtn.onclick = function(){ ov.remove(); };
  box.appendChild(closeBtn);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);
}

// ── PARK VORSCHLAGEN ───────────────────────────────────────
function openSuggestPark(){
  if(!firebase.auth().currentUser){ if(typeof toast==='function') toast('Bitte erst einloggen!'); else alert('Bitte einloggen!'); return; }
  var ex = document.getElementById('suggest-park-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'suggest-park-ov';
  ov.className = 'backdrop';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:90vh;overflow-y:auto;';
  box.innerHTML = '<div class="sheet-grip"></div>'+
    '<div class="ttl" style="margin-bottom:4px;">Park vorschlagen</div>'+
    '<div class="row-sub" style="margin-bottom:16px;">Admin prüft deinen Vorschlag bevor er erscheint.</div>';

  // Name
  var nameLbl = document.createElement('div');
  nameLbl.className = 'lbl';
  nameLbl.style.cssText = 'margin-bottom:6px;';
  nameLbl.textContent = 'Park-Name';
  box.appendChild(nameLbl);
  var nameInput = document.createElement('input');
  nameInput.type = 'text'; nameInput.placeholder = 'Park-Name';
  nameInput.className = 'inp';
  nameInput.style.cssText = 'margin-bottom:10px;box-sizing:border-box;';
  box.appendChild(nameInput);

  // Beschreibung
  var descInput = document.createElement('textarea');
  descInput.placeholder = 'Beschreibung (Adresse, Ausstattung...)';
  descInput.className = 'inp';
  descInput.style.cssText = 'margin-bottom:10px;box-sizing:border-box;height:80px;resize:none;';
  box.appendChild(descInput);

  // GPS Status
  var gpsEl = document.createElement('div');
  gpsEl.className = 'card';
  gpsEl.style.cssText = 'padding:12px 14px;margin-bottom:10px;font-size:11px;color:var(--muted);display:flex;align-items:center;gap:10px;';
  gpsEl.innerHTML = '<span class="live-dot"></span><span id="suggest-gps-status">GPS wird ermittelt...</span>';
  box.appendChild(gpsEl);
  // Direkte Referenz statt getElementById: das Sheet hängt hier noch nicht im DOM.
  var gpsStatusEl = gpsEl.querySelector('#suggest-gps-status');

  var suggestLat = null, suggestLng = null;

  // Auto-GPS
  if(userLat && userLng){
    suggestLat = userLat; suggestLng = userLng;
    if(gpsStatusEl) gpsStatusEl.textContent = 'Aktueller Standort: '+userLat.toFixed(5)+', '+userLng.toFixed(5);
  } else {
    navigator.geolocation.getCurrentPosition(function(pos){
      suggestLat = pos.coords.latitude; suggestLng = pos.coords.longitude;
      if(gpsStatusEl) gpsStatusEl.textContent = 'Standort: '+suggestLat.toFixed(5)+', '+suggestLng.toFixed(5);
    }, function(){
      if(gpsStatusEl) gpsStatusEl.textContent = 'GPS nicht verfügbar — bitte manuell eingeben';
    });
  }

  // Manuelle Koordinaten
  var coordLbl = document.createElement('div');
  coordLbl.className = 'lbl';
  coordLbl.style.cssText = 'margin-bottom:6px;';
  coordLbl.textContent = 'Koordinaten (optional)';
  box.appendChild(coordLbl);
  var manualWrap = document.createElement('div');
  manualWrap.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;';
  var latInput = document.createElement('input');
  latInput.type = 'number'; latInput.placeholder = 'Latitude (z.B. 52.5200)'; latInput.step = '0.0001';
  latInput.className = 'inp num';
  latInput.style.cssText = 'flex:1;min-width:0;';
  var lngInput = document.createElement('input');
  lngInput.type = 'number'; lngInput.placeholder = 'Longitude (z.B. 13.4050)'; lngInput.step = '0.0001';
  lngInput.className = 'inp num';
  lngInput.style.cssText = 'flex:1;min-width:0;';
  manualWrap.appendChild(latInput); manualWrap.appendChild(lngInput);
  box.appendChild(manualWrap);

  // Submit
  var submitBtn = document.createElement('button');
  submitBtn.type = 'button';
  submitBtn.className = 'btn';
  submitBtn.style.cssText = 'margin:0 0 8px;';
  submitBtn.textContent = 'Vorschlag senden';
  submitBtn.onclick = function(){
    var name = nameInput.value.trim();
    if(!name){ if(typeof toast==='function') toast('Bitte Park-Namen eingeben!'); else alert('Bitte Park-Namen eingeben!'); return; }
    var lat = parseFloat(latInput.value) || suggestLat;
    var lng = parseFloat(lngInput.value) || suggestLng;
    if(!lat || !lng){ if(typeof toast==='function') toast('Bitte Standort angeben oder GPS aktivieren!'); else alert('Bitte Standort angeben oder GPS aktivieren!'); return; }
    submitBtn.textContent = 'Wird gesendet...'; submitBtn.disabled = true;
    var user = firebase.auth().currentUser;
    db.collection('parkSuggestions').add({
      name: name,
      description: descInput.value.trim(),
      lat: lat, lng: lng,
      submitterId: user.uid,
      submitterName: (typeof prData!=='undefined'&&prData&&prData.name)||user.email||'Anonym',
      status: 'pending',
      createdAt: Date.now(),
    }).then(function(){
      ov.remove();
      if(typeof toast==='function') toast('Vorschlag gesendet. Admin prüft ihn.');
      else alert('Vorschlag gesendet!');
    }).catch(function(e){ if(typeof toast==='function') toast('Fehler: '+e.message); else alert('Fehler: '+e.message); submitBtn.disabled=false; submitBtn.textContent='Vorschlag senden'; });
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

// ── ADMIN: GENEHMIGTE EINTRÄGE (mit Rückgängig) ───────────
function loadApprovedEntries(el){
  el.innerHTML = '<div class="empty">Lädt…</div>';
  db.collection('globalLeaderboard').where('status','==','approved').get()
    .then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div class="empty">Keine genehmigten Einträge</div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = adminEntryHtml(d, false);

        var undoBtn = document.createElement('button');
        undoBtn.type = 'button';
        undoBtn.className = 'btn-g';
        undoBtn.style.cssText = 'width:100%;min-height:40px;';
        undoBtn.innerHTML = '&#8617; Rückgängig';
        undoBtn.onclick = function(){
          doc.ref.update({status:'pending'}).then(function(){
            card.remove();
            toast('Rückgängig gemacht.');
          });
        };

        card.appendChild(undoBtn);
        el.appendChild(card);
      });
      if(window.caliMotion) caliMotion.stagger(el);
    })
    .catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:11px;">Fehler: '+e.message+'</div>'; });
}

// ── ADMIN: ABGELEHNTE EINTRÄGE (mit Rückgängig) ───────────
function loadRejectedEntries(el){
  el.innerHTML = '<div class="empty">Lädt…</div>';
  db.collection('globalLeaderboard').where('status','==','rejected').get()
    .then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div class="empty">Keine abgelehnten Einträge</div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = adminEntryHtml(d, false);

        var undoBtn = document.createElement('button');
        undoBtn.type = 'button';
        undoBtn.className = 'btn-g';
        undoBtn.style.cssText = 'width:100%;min-height:40px;';
        undoBtn.innerHTML = '&#8617; Rückgängig';
        undoBtn.onclick = function(){
          doc.ref.update({status:'pending'}).then(function(){
            card.remove();
            toast('Rückgängig gemacht.');
          });
        };

        card.appendChild(undoBtn);
        el.appendChild(card);
      });
      if(window.caliMotion) caliMotion.stagger(el);
    })
    .catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:11px;">Fehler: '+e.message+'</div>'; });
}

// ── ADMIN: PARK VORSCHLÄGE PRÜFEN ─────────────────────────
function loadParkSuggestions(el){
  el.innerHTML = '<div class="empty">Lädt…</div>';
  db.collection('parkSuggestions').where('status','==','pending').orderBy('createdAt','desc').get()
    .then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div class="empty">Keine ausstehenden Vorschläge</div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = document.createElement('div');
        card.className = 'card';
        card.innerHTML =
          '<div class="row-title" style="white-space:normal;margin-bottom:2px;">'+d.name+'</div>'+
          '<div class="row-sub">Von: '+(d.submitterName||'Anonym')+'</div>'+
          (d.description?'<div class="row-sub">'+d.description+'</div>':'')+
          '<div class="num" style="font-size:11px;color:var(--muted);margin:6px 0 10px;">'+d.lat.toFixed(5)+', '+d.lng.toFixed(5)+
          ' <a href="https://www.google.com/maps?q='+d.lat+','+d.lng+'" target="_blank" rel="noopener" class="u" style="font-size:10px;font-weight:600;color:var(--accent);margin-left:6px;">Maps öffnen &#8250;</a></div>';

        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;';

        var approveBtn = document.createElement('button');
        approveBtn.type = 'button';
        approveBtn.className = 'btn sec sm';
        approveBtn.style.cssText = 'flex:1;margin:0;min-height:40px;';
        approveBtn.innerHTML = '&#10003; Genehmigen';
        approveBtn.onclick = function(){
          // Park zu Overpass-ähnlicher Struktur hinzufügen (als custom park)
          db.collection('customParks').add({
            name: d.name, description: d.description,
            lat: d.lat, lng: d.lng,
            addedAt: Date.now(), addedBy: d.submitterId,
          }).then(function(){
            return doc.ref.update({status:'approved'});
          }).then(function(){
            card.remove();
            toast('Park genehmigt und hinzugefügt.');
          });
        };

        var rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.className = 'btn-g danger';
        rejectBtn.style.cssText = 'flex:1;min-height:40px;';
        rejectBtn.innerHTML = '&#10007; Ablehnen';
        rejectBtn.onclick = function(){
          doc.ref.update({status:'rejected'}).then(function(){ card.remove(); toast('Abgelehnt.'); });
        };

        btnRow.appendChild(approveBtn); btnRow.appendChild(rejectBtn);
        card.appendChild(btnRow);
        el.appendChild(card);
      });
      if(window.caliMotion) caliMotion.stagger(el);
    }).catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:11px;">Fehler: '+e.message+'</div>'; });
}

// ── ADMIN: MONATSBONI BUTTON ──────────────────────────────
function addMonthlyBonusAdminBtn(box){
  var now = new Date();
  var prevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString().slice(0,7);
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn-g';
  btn.style.cssText = 'width:100%;min-height:44px;margin-bottom:14px;';
  btn.textContent = 'Monatsboni vergeben ('+prevMonth+')';
  btn.onclick = function(){
    var doAward = function(){ awardMonthlyBonuses(prevMonth); };
    if(typeof confirmSheet === 'function'){
      confirmSheet({
        title: 'Monatsboni vergeben?',
        desc: 'Die Boni für '+prevMonth+' werden vergeben. Das kann nicht rückgängig gemacht werden.',
        confirmLabel: 'Vergeben',
        danger: true,
        onConfirm: doAward
      });
    } else if(confirm('Monatsboni für '+prevMonth+' vergeben? Das kann nicht rückgängig gemacht werden!')){
      doAward();
    }
  };
  box.insertBefore(btn, box.firstChild);
}
