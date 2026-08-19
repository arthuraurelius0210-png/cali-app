// v2.0 - admin fix 2026-07-10

var parksMap = null;
var parksMarkers = [];
var clusterGroup = null;
var userLat = null;
var userLng = null;
var currentRadius = 2000;
var parksData = [];
var parksMapInitPending = false;

function initParksPage(){
  if(!parksMap){
    if(parksMapInitPending) return;
    parksMapInitPending = true;
    // Kleine Verzögerung damit das DOM-Element sichtbar ist
    setTimeout(function(){
      if(typeof L === 'undefined'){ parksMapInitPending = false; setTimeout(initParksPage, 300); return; }
      var cont = document.getElementById('parks-map');
      if(!cont || cont._leaflet_id){ parksMapInitPending = false; return; }
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
      document.getElementById('parks-status').textContent = 'Tippe auf "Standort" um Parks in deiner N\u00e4he zu finden.';
    }, 200);
  } else {
    parksMap.invalidateSize();
  }
}

function setRadius(r){
  currentRadius = r;
  // Update button styles
  [2000,5000,10000,20000].forEach(function(v){
    var btn = document.getElementById('rbtn-'+v/1000);
    if(btn){
      if(v===r){
        btn.style.background='var(--accent-deep)'; btn.style.color='#fff'; btn.style.fontWeight='700';
        btn.style.boxShadow='0 12px 30px rgba(255,85,0,0.22)';
      } else {
        btn.style.background='#fff'; btn.style.color='var(--muted)'; btn.style.fontWeight='600';
        btn.style.boxShadow='0 8px 20px rgba(0,0,0,0.05)';
      }
    }
  });
  if(userLat) loadParks();
}

function locateAndLoad(){
  var statusEl = document.getElementById('parks-status');
  statusEl.textContent = 'Standort wird ermittelt...';
  document.getElementById('parks-locate-btn').textContent = '…';

  if(!navigator.geolocation){
    statusEl.textContent = 'Geolocation wird nicht unterstützt.';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function(pos){
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      document.getElementById('parks-locate-btn').textContent = '\u2713 Standort';
      loadParks();
    },
    function(err){
      statusEl.textContent = 'Standort konnte nicht ermittelt werden. Bitte Berechtigung erlauben.';
      document.getElementById('parks-locate-btn').textContent = '\u25B7 Standort';
    },
    {enableHighAccuracy:true, timeout:10000}
  );
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

  // User marker
  var userIcon = L.divIcon({
    html: '<div style="background:var(--accent);width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
    className: '', iconAnchor:[7,7]
  });
  var userMarker = L.marker([userLat, userLng], {icon:userIcon}).addTo(parksMap);
  userMarker.bindPopup('<strong>Du bist hier</strong>').openPopup();
  parksMarkers.push(userMarker);

  // Overpass - mehrere Proxies versuchen
  var query = '[out:json][timeout:30];(node["leisure"="outdoor_gym"](around:'+currentRadius+','+userLat+','+userLng+');node["sport"="calisthenics"](around:'+currentRadius+','+userLat+','+userLng+');node["leisure"="fitness_station"](around:'+currentRadius+','+userLat+','+userLng+');node["amenity"="fitness_station"](around:'+currentRadius+','+userLat+','+userLng+');node["sport"="fitness"](around:'+currentRadius+','+userLat+','+userLng+');way["leisure"="outdoor_gym"](around:'+currentRadius+','+userLat+','+userLng+');way["sport"="calisthenics"](around:'+currentRadius+','+userLat+','+userLng+');relation["leisure"="outdoor_gym"](around:'+currentRadius+','+userLat+','+userLng+'););out center;';

  var proxies = ['/api/overpass', '/.netlify/functions/overpass'];

  function processParks(data){
    parksData = data.elements || [];
    if(parksData.length === 0){ statusEl.textContent = 'Keine Parks gefunden. Versuch einen größeren Radius.'; return; }
    statusEl.textContent = parksData.length + ' Parks gefunden im Umkreis von '+(currentRadius/1000)+' km';
    var parkIcon = L.divIcon({html:'<div style="background:var(--accent,#ff5500);color:#fff;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;border:3px solid #fff;box-shadow:0 8px 20px rgba(255,85,0,0.35);">&#128170;</div>',className:'',iconAnchor:[19,19]});
    var parkIconDim = L.divIcon({html:'<div style="background:#18140F;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;border:3px solid #fff;box-shadow:0 6px 16px rgba(0,0,0,0.22);">&#128170;</div>',className:'',iconAnchor:[16,16]});
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
      marker.bindPopup('<div style="font-family:system-ui;min-width:190px;padding:4px 0;"><div style="font-size:14px;font-weight:800;margin-bottom:2px;">'+name+'</div><div style="font-size:11px;color:var(--muted);margin-bottom:10px;">'+formatDist(park._dist)+' entfernt</div><button onclick="openParkDetail('+idx+')" style="background:var(--accent-deep);color:#fff;border:none;border-radius:10px;padding:10px;font-size:13px;font-weight:700;cursor:pointer;width:100%;margin-bottom:6px;">&#128170; Park ansehen</button><button onclick="openParkNav('+idx+')" style="background:none;border:1px solid var(--border2);border-radius:10px;padding:9px;font-size:12px;font-weight:600;cursor:pointer;width:100%;color:var(--muted);">&#128205; Navigation</button></div>');
      parksMarkers.push(marker);
    });
    buildParksList();
    document.getElementById('parks-locate-btn').textContent='✓ Standort';
  }

  function tryProxy(idx){
    if(idx>=proxies.length){
      statusEl.textContent='Fehler beim Laden. Bitte nochmal versuchen.';
      document.getElementById('parks-locate-btn').textContent='▷ Standort';
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
    link.style.cssText = 'background:none;border:none;color:var(--accent-ink);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;padding:6px 0;';
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

  items.forEach(function(park, idx){
    var name = park.tags && (park.tags.name || park.tags['name:de']) ? (park.tags.name || park.tags['name:de']) : 'Calisthenics Park';
    var parkId = getParkId(park);
    var locLabel = parkLocationLabel(park);
    var accessLabel = parkAccessLabel(park);
    var tags = parkRealTags(park);
    var saved = isParkSaved(parkId);

    var card = document.createElement('div');
    card.className = 'pk-card pressable';
    card.style.cssText = 'padding:20px 22px;margin-bottom:12px;cursor:pointer;content-visibility:auto;contain-intrinsic-size:auto 150px;';
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

    var topRow = document.createElement('div');
    topRow.style.cssText = 'display:flex;align-items:flex-start;gap:14px;';

    var icon = document.createElement('div');
    icon.style.cssText = 'width:56px;height:56px;border-radius:16px;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;';
    icon.innerHTML = '<div style="width:26px;height:26px;">'+ci('flex')+'</div>';

    var info = document.createElement('div');
    info.style.cssText = 'flex:1;min-width:0;padding-top:2px;';
    var nameRow = document.createElement('div');
    nameRow.style.cssText = 'font-size:15px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    nameRow.textContent = name;
    var locRow = document.createElement('div');
    locRow.style.cssText = 'font-size:12px;font-weight:400;color:var(--muted);margin-top:5px;';
    locRow.innerHTML = '&#128205; ' + (locLabel ? locLabel+' &middot; ' : '') + formatDist(park._dist);
    info.appendChild(nameRow); info.appendChild(locRow);
    if(accessLabel){
      var accessRow = document.createElement('div');
      accessRow.style.cssText = 'font-size:12px;font-weight:400;color:var(--muted);margin-top:4px;';
      accessRow.textContent = accessLabel;
      info.appendChild(accessRow);
    }

    var bookmarkBtn = document.createElement('button');
    bookmarkBtn.setAttribute('aria-label', saved ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen');
    bookmarkBtn.style.cssText = 'background:none;border:none;color:'+(saved?'var(--accent)':'var(--muted)')+';font-size:23px;cursor:pointer;flex-shrink:0;padding:6px;margin:-4px;line-height:1;';
    bookmarkBtn.innerHTML = '<div style="width:20px;height:20px;">'+ci('bookmark')+'</div>';
    bookmarkBtn.onclick = function(e){
      e.stopPropagation();
      var nowSaved = toggleParkSaved(parkId);
      bookmarkBtn.style.color = nowSaved ? 'var(--accent)' : 'var(--muted)';
      bookmarkBtn.setAttribute('aria-label', nowSaved ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen');
      if(bookmarkBtn.animate && !(window.caliMotion && caliMotion.reduced())){
        bookmarkBtn.animate([{transform:'scale(1)'},{transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:250,easing:'cubic-bezier(0.34,1.56,0.64,1)'});
      }
    };

    topRow.appendChild(icon); topRow.appendChild(info); topRow.appendChild(bookmarkBtn);
    card.appendChild(topRow);

    if(tags.length){
      var tagRow = document.createElement('div');
      tagRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;';
      tags.forEach(function(t){
        var chip = document.createElement('div');
        chip.style.cssText = 'background:var(--bg3);border-radius:20px;padding:7px 14px;font-size:11px;color:var(--muted);font-weight:500;';
        chip.textContent = t;
        tagRow.appendChild(chip);
      });
      card.appendChild(tagRow);
    }

    var detailRow = document.createElement('div');
    detailRow.style.cssText = 'display:flex;justify-content:flex-end;margin-top:14px;';
    var detailLink = document.createElement('button');
    detailLink.style.cssText = 'background:none;border:none;color:var(--accent-ink);font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;padding:6px 0;';
    detailLink.innerHTML = 'Details &#8250;';
    detailLink.onclick = function(){ openParkDetail(idx); };
    detailRow.appendChild(detailLink);
    card.appendChild(detailRow);

    listEl.appendChild(card);
  });
  if(window.caliMotion) caliMotion.stagger(listEl);
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

// ── PROFIL ÖFFENTLICH/PRIVAT ──────────────────────────────
function buildPrivacyToggle(){
  var el = document.getElementById('pr-privacy-toggle');
  if(!el) return;
  el.innerHTML = '';
  var isPublic = prData && prData.isPublic !== false; // default public

  var wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:#fff;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:14px 16px;margin-bottom:10px;';
  var txtWrap = document.createElement('div');
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:13px;font-weight:700;color:var(--text);';
  var subEl = document.createElement('div');
  subEl.style.cssText = 'font-size:11px;color:var(--muted);margin-top:2px;';
  function renderLabels(){
    titleEl.innerHTML = 'Profil ' + (isPublic?'&#127758; Öffentlich':'&#128274; Privat');
    subEl.textContent = isPublic?'Andere können dich in Bestenlisten sehen':'Dein Name bleibt anonym';
  }
  renderLabels();
  txtWrap.appendChild(titleEl); txtWrap.appendChild(subEl);
  wrap.appendChild(txtWrap);

  var toggle = document.createElement('button');
  toggle.setAttribute('role','switch');
  toggle.setAttribute('aria-checked', isPublic?'true':'false');
  toggle.setAttribute('aria-label','Profil öffentlich anzeigen');
  toggle.style.cssText = 'width:48px;height:26px;border-radius:13px;border:none;cursor:pointer;position:relative;background:'+(isPublic?'var(--accent)':'var(--border2)')+';transition:background var(--dur-med) var(--ease-out);flex-shrink:0;';
  var knob = document.createElement('div');
  knob.style.cssText = 'position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform var(--dur-med) var(--ease-out);transform:translateX('+(isPublic?'22px':'0')+');';
  toggle.appendChild(knob);
  toggle.onclick = function(){
    isPublic = !isPublic;
    if(typeof prData === 'undefined' || !prData) window.prData = {};
    prData.isPublic = isPublic;
    try{ localStorage.setItem('cali_profile', JSON.stringify(prData)); }catch(x){}
    if(typeof spr === 'function') spr();
    if(typeof fbSave === 'function') fbSave();
    toggle.style.background = isPublic?'var(--accent)':'var(--border2)';
    knob.style.transform = 'translateX('+(isPublic?'22px':'0')+')';
    toggle.setAttribute('aria-checked', isPublic?'true':'false');
    renderLabels();
    if(typeof toast === 'function') toast(isPublic ? '🌍 Profil öffentlich' : '🔒 Profil privat');
  };
  wrap.appendChild(toggle);
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

function openAdminPanel(){
  var ex = document.getElementById('admin-panel-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'admin-panel-ov';
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';

  var box = document.createElement('div');
  box.className = 'sheet-scroll';
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;padding:20px;';

  box.innerHTML =
    '<div style="font-size:17px;font-weight:800;color:var(--text);margin-bottom:12px;">&#128274; Admin-Panel</div>';

  // Tabs
  var tabWrap = document.createElement('div');
  tabWrap.style.cssText = 'display:flex;gap:6px;margin-bottom:14px;';
  var tabs2 = [{label:'&#8987; Ausstehend',id:'pending'},{label:'&#10003; Genehmigt',id:'approved'},{label:'&#10007; Abgelehnt',id:'rejected'},{label:'&#128170; Parks',id:'parks'}];
  var activeAdminTab = 'pending';
  var listEl = document.createElement('div');
  var approvedEl = document.createElement('div'); approvedEl.style.display='none';
  var rejectedEl = document.createElement('div'); rejectedEl.style.display='none';
  var suggestEl = document.createElement('div'); suggestEl.style.display='none';

  tabs2.forEach(function(t){
    var btn = document.createElement('button');
    btn.style.cssText = 'flex:1;padding:8px;border-radius:10px;border:1px solid '+(t.id===activeAdminTab?'var(--accent)':'var(--border)')+';background:'+(t.id===activeAdminTab?'rgba(255,85,0,0.1)':'none')+';color:'+(t.id===activeAdminTab?'var(--accent-ink)':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;min-height:36px;cursor:pointer;';
    btn.classList.add('pressable');
    btn.innerHTML = t.label;
    btn.onclick = function(){
      activeAdminTab = t.id;
      tabWrap.querySelectorAll('button').forEach(function(b,bi){
        var a = tabs2[bi].id===activeAdminTab;
        b.style.borderColor=a?'var(--accent)':'var(--border)';
        b.style.background=a?'rgba(255,85,0,0.1)':'none';
        b.style.color=a?'var(--accent-ink)':'var(--muted)';
      });
      listEl.style.display = t.id==='pending'?'block':'none';
      approvedEl.style.display = t.id==='approved'?'block':'none';
      rejectedEl.style.display = t.id==='rejected'?'block':'none';
      suggestEl.style.display = t.id==='parks'?'block':'none';
      if(t.id==='approved' && !approvedEl._loaded){ loadApprovedEntries(approvedEl); approvedEl._loaded=true; }
      if(t.id==='rejected' && !rejectedEl._loaded){ loadRejectedEntries(rejectedEl); rejectedEl._loaded=true; }
      if(t.id==='parks' && !suggestEl._loaded){ loadParkSuggestions(suggestEl); suggestEl._loaded=true; }
    };
    tabWrap.appendChild(btn);
  });
  box.appendChild(tabWrap);
  listEl.innerHTML = '<div style="text-align:center;padding:16px;font-size:12px;color:var(--muted);">Lädt...</div>';
  box.appendChild(listEl); box.appendChild(approvedEl); box.appendChild(rejectedEl); box.appendChild(suggestEl);

  // Load pending entries
  db.collection('globalLeaderboard').where('status','==','pending').get()
    .then(function(snap){
      listEl.innerHTML = '';
      if(snap.empty){
        listEl.innerHTML = '<div style="text-align:center;padding:20px;font-size:12px;color:var(--muted);">&#10003; Keine ausstehenden Einträge!</div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = document.createElement('div');
        card.style.cssText = 'background:#fff;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:14px;margin-bottom:10px;';
        card.innerHTML =
          '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px;">'+(d.name||d.userName||'Anonym')+' — '+(d.exerciseName||d.exercise||'')+'</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">'+(d.parkName||'Kein Park')+' &middot; '+(d.value||d.reps||0)+' '+(d.unit||'Wdh')+'</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:10px;">'+new Date(d.createdAt||d.date).toLocaleDateString('de-DE')+'</div>'+
          (d.videoUrl?'<a href="'+d.videoUrl+'" target="_blank" style="display:inline-block;font-size:11px;color:var(--accent-ink);margin-bottom:10px;">&#127909; Video ansehen</a><br>':'<div style="font-size:11px;color:var(--red);margin-bottom:10px;">Kein Video!</div>');

        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;';

        var approveBtn = document.createElement('button');
        approveBtn.style.cssText = 'flex:1;background:rgba(34,197,94,0.1);color:var(--success-ink);border:1px solid rgba(34,197,94,0.3);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px;min-height:36px;cursor:pointer;';
        approveBtn.classList.add('pressable');
        approveBtn.textContent = '✓ Genehmigen';
        approveBtn.onclick = function(){
          doc.ref.update({status:'approved'}).then(function(){
            card.remove();
            toast('✓ Genehmigt!');
          });
        };

        var rejectBtn = document.createElement('button');
        rejectBtn.style.cssText = 'flex:1;background:rgba(217,48,54,0.08);color:var(--red);border:1px solid rgba(217,48,54,0.25);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px;min-height:36px;cursor:pointer;';
        rejectBtn.classList.add('pressable');
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
    .catch(function(){ listEl.innerHTML = '<div style="font-size:12px;color:var(--muted);">Fehler beim Laden.</div>'; });

  var closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:12px;cursor:pointer;';
  closeBtn.textContent = 'Schlie\u00dfen';
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
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 40px;';
  var name = park.tags&&(park.tags.name||park.tags['name:de'])?(park.tags.name||park.tags['name:de']):'Calisthenics Park';
  var addr = '';
  if(park.tags){
    if(park.tags['addr:street']) addr = park.tags['addr:street']+(park.tags['addr:housenumber']?' '+park.tags['addr:housenumber']:'');
    if(park.tags['addr:city']) addr += (addr?', ':'')+park.tags['addr:city'];
  }
  box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 16px;"></div>'+
    '<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:4px;">'+name+'</div>'+
    (addr?'<div style="font-size:12px;color:var(--muted);margin-bottom:14px;">'+addr+'</div>':'')+
    '<div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:12px;">Navigation öffnen mit</div>';

  // Google Maps
  var gBtn = document.createElement('button');
  gBtn.style.cssText = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:16px;font-family:inherit;font-size:14px;font-weight:700;padding:14px;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text);';
  gBtn.classList.add('pressable');
  gBtn.innerHTML = '<span style="width:18px;height:18px;display:inline-block;flex-shrink:0;">'+(typeof ci==='function'?ci('pin'):'&#128205;')+'</span> Google Maps';
  gBtn.onclick = function(){ window.open('https://www.google.com/maps/dir/?api=1&destination='+park._lat+','+park._lng+'&travelmode=walking','_blank'); ov.remove(); };

  // Apple Maps
  var aBtn = document.createElement('button');
  aBtn.style.cssText = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:16px;font-family:inherit;font-size:14px;font-weight:700;padding:14px;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text);';
  aBtn.classList.add('pressable');
  aBtn.innerHTML = '<span style="font-size:20px;">&#63743;</span> Apple Maps';
  aBtn.onclick = function(){ window.location.href='maps://maps.apple.com/?daddr='+park._lat+','+park._lng+'&dirflg=w'; ov.remove(); };

  // Adresse kopieren
  var copyBtn = document.createElement('button');
  copyBtn.style.cssText = 'width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:16px;font-family:inherit;font-size:14px;font-weight:700;padding:14px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text);';
  copyBtn.classList.add('pressable');
  copyBtn.innerHTML = '<span style="font-size:18px;">&#128203;</span> Adresse kopieren';
  copyBtn.onclick = function(){
    var txt = (addr || (park._lat+', '+park._lng));
    navigator.clipboard ? navigator.clipboard.writeText(txt).then(function(){ copyBtn.innerHTML='<span style="font-size:18px;">&#10003;</span> Kopiert!'; setTimeout(function(){ ov.remove(); },800); }) : (function(){ var t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();copyBtn.innerHTML='<span>&#10003;</span> Kopiert!';setTimeout(function(){ov.remove();},800); })();
  };

  var cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:8px;cursor:pointer;';
  cancelBtn.textContent = 'Schließen';
  cancelBtn.onclick = function(){ ov.remove(); };

  box.appendChild(gBtn); box.appendChild(aBtn); box.appendChild(copyBtn); box.appendChild(cancelBtn);
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

  var ex = document.getElementById('park-detail-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'park-detail-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar — gleicher Look wie Rekorde
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-size:13px;font-weight:700;padding:10px 16px;cursor:pointer;color:var(--text);font-family:inherit;transition:transform var(--dur-fast) var(--ease-out);';
  backBtn.classList.add('pressable');
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;min-width:0;';
  titleEl.innerHTML = '<div style="font-size:16px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">&#128170; '+name+'</div>'+
    '<div style="font-size:11px;color:var(--accent-ink);font-weight:600;">&#128205; '+formatDist(park._dist)+' entfernt</div>';
  var recBtn2 = document.createElement('button');
  recBtn2.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:9px 12px;min-height:36px;cursor:pointer;flex-shrink:0;transition:transform var(--dur-fast) var(--ease-out);';
  recBtn2.classList.add('pressable');
  recBtn2.innerHTML = '&#127942; Rekord';
  recBtn2.onclick = function(){ openParkRecordSubmit(idx); };
  var navBtn = document.createElement('button');
  navBtn.style.cssText = 'background:var(--bg2);color:var(--text);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:9px 12px;min-height:36px;cursor:pointer;flex-shrink:0;transition:transform var(--dur-fast) var(--ease-out);';
  navBtn.classList.add('pressable');
  navBtn.innerHTML = '&#128205; Nav';
  navBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
    openParkNav(idx);
  };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(recBtn2); topBar.appendChild(navBtn);
  ov.appendChild(topBar);

  // Tabs horizontal — gleiches Muster wie die Battles-Übersicht
  var tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;border-bottom:1px solid var(--border);flex-shrink:0;';
  var tabDefs = [
    {label:'Bestenliste', id:'lb'},
    {label:'Meine Stats', id:'stats'},
    {label:'Community', id:'comm'},
  ];
  var bodies = [];
  tabDefs.forEach(function(t, ti){
    var btn = document.createElement('button');
    btn.style.cssText = 'flex:1;padding:12px 4px;min-height:44px;font-family:inherit;font-weight:700;font-size:13px;border:none;cursor:pointer;border-bottom:2px solid '+(ti===0?'var(--accent)':'transparent')+';background:none;color:'+(ti===0?'var(--accent-ink)':'var(--muted)')+';white-space:nowrap;transition:transform var(--dur-fast) var(--ease-out);';
    btn.classList.add('pressable');
    btn.textContent = t.label;
    var body = document.createElement('div');
    body.className = 'sheet-scroll';
    body.style.cssText = 'display:'+(ti===0?'block':'none')+';flex:1;padding:14px 16px 40px;overflow-y:auto;';
    bodies.push(body);
    btn.onclick = (function(tIdx){
      return function(){
        tabBar.querySelectorAll('button').forEach(function(b,bi){
          b.style.borderBottomColor = bi===tIdx?'var(--accent)':'transparent';
          b.style.color = bi===tIdx?'var(--accent-ink)':'var(--muted)';
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

function buildParkDetailLeaderboard(el, parkId, parkName){
  el.innerHTML = '';
  if(typeof db === 'undefined' || !db){
    el.innerHTML = '<div style="padding:20px;color:var(--muted);">Einloggen um Bestenliste zu sehen.</div>'; return;
  }

  // Eintrag einreichen Button
  var subBtn = document.createElement('button');
  subBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:12px;min-height:44px;cursor:pointer;margin-bottom:14px;transition:transform var(--dur-fast) var(--ease-out);';
  subBtn.classList.add('pressable');
  subBtn.innerHTML = '+ Eintrag einreichen';
  subBtn.onclick = function(){ openRecordSubmit(parkId, parkName); };
  el.appendChild(subBtn);

  // Übungs-Auswahl horizontal (wie globale Bestenliste)
  var exLabel = document.createElement('h2');
  exLabel.className = 'stitle';
  exLabel.style.cssText = 'margin:0 0 8px;';
  exLabel.textContent = 'Übung';
  el.appendChild(exLabel);

  var exWrap = document.createElement('div');
  exWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;margin-bottom:14px;scrollbar-width:none;';

  var PARK_CATS = [
    {id:'all',label:'Alle',icon:'&#127942;'},
    {id:'Pull',label:'Pull',icon:'&#11014;'},
    {id:'Push',label:'Push',icon:'&#128170;'},
    {id:'Core',label:'Core',icon:'&#128293;'},
    {id:'Legs',label:'Legs',icon:'&#129466;'},
    {id:'Skills',label:'Skills',icon:'&#11088;'},  ];
  var activeCat = 'all';

  // Kategorie-Filter
  var catWrap = document.createElement('div');
  catWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;margin-bottom:10px;scrollbar-width:none;';
  PARK_CATS.forEach(function(cat){
    var btn = document.createElement('button');
    btn.dataset.catId = cat.id;
    var isActive = cat.id === activeCat;
    btn.style.cssText = 'flex-shrink:0;padding:9px 14px;min-height:36px;border-radius:20px;border:1px solid '+(isActive?'var(--accent-deep)':'var(--border)')+';background:'+(isActive?'var(--accent-deep)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:transform var(--dur-fast) var(--ease-out);';
    btn.classList.add('pressable');
    btn.innerHTML = cat.icon+' '+cat.label;
    btn.onclick = function(){
      activeCat = cat.id;
      catWrap.querySelectorAll('button').forEach(function(b){
        var a = b.dataset.catId === activeCat;
        b.style.borderColor = a?'var(--accent-deep)':'var(--border)';
        b.style.background = a?'var(--accent-deep)':'none';
        b.style.color = a?'#fff':'var(--muted)';
      });
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
      btn.dataset.exId = ex.id;
      var isActive = selEx && ex.id === selEx.id;
      btn.style.cssText = 'flex-shrink:0;padding:9px 14px;min-height:36px;border-radius:20px;border:1px solid '+(isActive?'var(--accent-deep)':'var(--border)')+';background:'+(isActive?'var(--accent-deep)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:transform var(--dur-fast) var(--ease-out);';
      btn.classList.add('pressable');
      btn.textContent = ex.name;
      btn.onclick = function(){
        selEx = ex;
        exWrap2.querySelectorAll('button').forEach(function(b){
          var a = b.dataset.exId === selEx.id;
          b.style.borderColor = a?'var(--accent-deep)':'var(--border)';
          b.style.background = a?'var(--accent-deep)':'none';
          b.style.color = a?'#fff':'var(--muted)';
        });
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
  el.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:12px;">&#9203; Lade...</div>';
  db.collection('parkLeaderboard').doc(parkId).collection('entries')
    .where('exercise','==',ex.id)
    .orderBy('value','desc').limit(20)
    .get().then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div style="text-align:center;padding:30px 10px;"><div style="font-size:30px;margin-bottom:8px;">&#127942;</div><div style="font-size:12px;color:var(--muted);">Noch keine Einträge für '+ex.name+'.<br>Sei der Erste!</div></div>';
        return;
      }
      var uid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
      snap.docs.forEach(function(doc, i){
        var d = doc.data();
        var rank = i+1;
        var medal = rank===1?'&#129351;':rank===2?'&#129352;':rank===3?'&#129353;':'';
        var isMe = uid && d.uid === uid;
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);background:'+(isMe?'rgba(255,85,0,0.05)':'none')+';content-visibility:auto;contain-intrinsic-size:auto 64px;';
        var rankEl = document.createElement('div');
        rankEl.style.cssText = 'width:28px;text-align:center;flex-shrink:0;';
        rankEl.innerHTML = medal?'<span style="font-size:18px;">'+medal+'</span>':'<span class="num" style="font-family:inherit;font-weight:800;font-size:15px;color:var(--muted);">#'+rank+'</span>';
        var infoEl = document.createElement('div');
        infoEl.style.cssText = 'flex:1;min-width:0;';
        infoEl.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--text);">'+(d.name||'Anonym')+(isMe?' <span style="font-size:10px;color:var(--accent-ink);border:1px solid var(--accent-ink);border-radius:6px;padding:1px 5px;">Du</span>':'')+' </div>';
        var valEl = document.createElement('div');
        valEl.style.cssText = 'text-align:right;flex-shrink:0;';
        valEl.innerHTML = '<div class="num" style="font-family:inherit;font-weight:800;font-size:22px;color:var(--accent);line-height:1;">'+d.value+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">'+ex.unit+'</div>';
        row.appendChild(rankEl); row.appendChild(infoEl); row.appendChild(valEl);
        if(d.videoUrl){
          var vBtn = document.createElement('button');
          vBtn.style.cssText = 'background:none;border:1px solid var(--border);border-radius:10px;padding:8px 10px;font-size:14px;cursor:pointer;flex-shrink:0;';
          vBtn.classList.add('pressable');
          vBtn.innerHTML = '&#9654;';
          vBtn.setAttribute('aria-label', 'Video abspielen');
          vBtn.onclick = function(){ playVideo(d.videoUrl); };
          row.appendChild(vBtn);
        }
        el.appendChild(row);
      });
    }).catch(function(e){
      el.innerHTML = '<div style="padding:12px;color:var(--muted);font-size:11px;">Fehler: '+e.message+'</div>';
    });
}

function buildParkDetailStats(el, parkId){
  el.innerHTML = '<h2 class="stitle" style="margin:0 0 16px;">Meine Stats</h2>';
  if(typeof db === 'undefined' || !db || !firebase.auth().currentUser){
    el.innerHTML += '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px;">Einloggen um deine Stats zu sehen.</div>'; return;
  }
  var uid = firebase.auth().currentUser.uid;
  db.collection('parkStats').doc(parkId).collection('users').doc(uid).get().then(function(doc){
    if(!doc.exists){ el.innerHTML += '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px;">Noch keine Workouts in diesem Park.<br>Trainiere hier und deine Stats erscheinen!</div>'; return; }
    var d = doc.data();
    var stats = [
      {label:'Workouts', value: d.workoutCount||0, unit:''},
      {label:'Gesamte Wdh', value: d.totalReps||0, unit:'Wdh'},
      {label:'Letztes Training', value: d.lastWorkout?d.lastWorkout.slice(0,10):'—', unit:''},
    ];
    stats.forEach(function(s){
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid var(--border);';
      row.innerHTML = '<div style="font-size:13px;color:var(--muted);">'+s.label+'</div>'+
        '<div class="num" style="font-family:inherit;font-weight:800;font-size:22px;color:var(--text);">'+s.value+' <span style="font-family:var(--body);font-size:11px;color:var(--muted);">'+s.unit+'</span></div>';
      el.appendChild(row);
    });
  }).catch(function(){ el.innerHTML += '<div style="color:var(--muted);">Fehler.</div>'; });
}

function buildParkDetailCommunity(el, parkId, parkName){
  el.innerHTML = '<h2 class="stitle" style="margin:0 0 16px;">Community-Workouts</h2>';
  if(typeof db === 'undefined' || !db){ el.innerHTML += '<div style="color:var(--muted);font-size:13px;">Einloggen um Community zu sehen.</div>'; return; }
  db.collection('parkWorkouts').doc(parkId).collection('posts').orderBy('date','desc').limit(20).get().then(function(snap){
    if(snap.empty){ el.innerHTML += '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px;">Noch keine Community-Workouts hier.<br>Sei der Erste!</div>'; return; }
    snap.forEach(function(doc){
      var d = doc.data();
      var card = document.createElement('div');
      card.style.cssText = 'background:var(--bg2);border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:14px;margin-bottom:10px;';
      card.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">'+
        '<div style="font-size:13px;font-weight:700;color:var(--text);">'+(d.userName||'Anonym')+'</div>'+
        '<div style="font-size:11px;color:var(--muted);">'+(d.date?d.date.slice(0,10):'')+'</div>'+
        '</div>'+
        '<div style="font-size:12px;color:var(--muted);">'+(d.summary||'')+'</div>';
      el.appendChild(card);
    });
  }).catch(function(){ el.innerHTML += '<div style="color:var(--muted);">Fehler beim Laden.</div>'; });
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
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px;padding:24px;max-width:340px;width:100%;text-align:center;';
  box.innerHTML =
    '<div style="font-size:40px;margin-bottom:12px;">📍</div>'+
    '<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:8px;">'+parkName+'</div>'+
    '<div style="font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.5;white-space:pre-line;">'+msg+'</div>';
  var closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:14px;cursor:pointer;box-shadow:0 12px 30px rgba(255,85,0,0.22);transition:transform var(--dur-fast) var(--ease-out);';
  closeBtn.classList.add('pressable');
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
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';
  var box = document.createElement('div');
  box.className = 'sheet-scroll';
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 40px;max-height:90vh;overflow-y:auto;';
  box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 20px;"></div>'+
    '<div style="font-size:17px;font-weight:800;color:var(--text);margin-bottom:4px;">&#128170; Park vorschlagen</div>'+
    '<div style="font-size:12px;color:var(--muted);margin-bottom:20px;">Admin prüft deinen Vorschlag bevor er erscheint.</div>';

  // Name
  var nameInput = document.createElement('input');
  nameInput.type = 'text'; nameInput.placeholder = 'Park-Name';
  nameInput.style.cssText = 'width:100%;padding:13px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:var(--bg2);color:var(--text);margin-bottom:10px;box-sizing:border-box;';
  box.appendChild(nameInput);

  // Beschreibung
  var descInput = document.createElement('textarea');
  descInput.placeholder = 'Beschreibung (Adresse, Ausstattung...)';
  descInput.style.cssText = 'width:100%;padding:13px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:var(--bg2);color:var(--text);margin-bottom:10px;box-sizing:border-box;height:80px;resize:none;';
  box.appendChild(descInput);

  // GPS Status
  var gpsEl = document.createElement('div');
  gpsEl.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:12px;margin-bottom:10px;font-size:12px;color:var(--muted);display:flex;align-items:center;gap:10px;';
  gpsEl.innerHTML = '<span style="font-size:18px;">&#128205;</span><span id="suggest-gps-status">GPS wird ermittelt...</span>';
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
  var manualWrap = document.createElement('div');
  manualWrap.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;';
  var latInput = document.createElement('input');
  latInput.type = 'number'; latInput.placeholder = 'Latitude (z.B. 52.5200)'; latInput.step = '0.0001';
  latInput.style.cssText = 'flex:1;padding:11px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:var(--bg2);color:var(--text);';
  var lngInput = document.createElement('input');
  lngInput.type = 'number'; lngInput.placeholder = 'Longitude (z.B. 13.4050)'; lngInput.step = '0.0001';
  lngInput.style.cssText = 'flex:1;padding:11px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:var(--bg2);color:var(--text);';
  manualWrap.appendChild(latInput); manualWrap.appendChild(lngInput);
  box.appendChild(manualWrap);

  // Submit
  var submitBtn = document.createElement('button');
  submitBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:15px;cursor:pointer;margin-bottom:8px;box-shadow:0 12px 30px rgba(255,85,0,0.22);transition:transform var(--dur-fast) var(--ease-out);';
  submitBtn.classList.add('pressable');
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
      if(typeof toast==='function') toast('💪 Vorschlag gesendet! Admin prüft ihn.');
      else alert('Vorschlag gesendet!');
    }).catch(function(e){ if(typeof toast==='function') toast('Fehler: '+e.message); else alert('Fehler: '+e.message); submitBtn.disabled=false; submitBtn.textContent='Vorschlag senden'; });
  };
  box.appendChild(submitBtn);

  var cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:8px;cursor:pointer;';
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
  el.innerHTML = '<div style="text-align:center;padding:16px;font-size:12px;color:var(--muted);">Lädt...</div>';
  db.collection('globalLeaderboard').where('status','==','approved').get()
    .then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div style="text-align:center;padding:20px;font-size:12px;color:var(--muted);">Keine genehmigten Einträge.</div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = document.createElement('div');
        card.style.cssText = 'background:#fff;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:14px;margin-bottom:10px;';
        card.innerHTML =
          '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px;">'+(d.name||d.userName||'Anonym')+' — '+(d.exerciseName||d.exercise||'')+'</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">'+(d.parkName||'Kein Park')+' &middot; '+(d.value||d.reps||0)+' '+(d.unit||'Wdh')+'</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:10px;">'+new Date(d.createdAt||d.date).toLocaleDateString('de-DE')+'</div>'+
          (d.videoUrl?'<a href="'+d.videoUrl+'" target="_blank" style="display:inline-block;font-size:11px;color:var(--accent-ink);margin-bottom:10px;">&#127909; Video ansehen</a><br>':'');

        var undoBtn = document.createElement('button');
        undoBtn.style.cssText = 'width:100%;background:rgba(255,85,0,0.1);color:var(--accent-ink);border:1px solid rgba(255,85,0,0.3);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px;min-height:36px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
        undoBtn.classList.add('pressable');
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
    .catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>'; });
}

// ── ADMIN: ABGELEHNTE EINTRÄGE (mit Rückgängig) ───────────
function loadRejectedEntries(el){
  el.innerHTML = '<div style="text-align:center;padding:16px;font-size:12px;color:var(--muted);">Lädt...</div>';
  db.collection('globalLeaderboard').where('status','==','rejected').get()
    .then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div style="text-align:center;padding:20px;font-size:12px;color:var(--muted);">Keine abgelehnten Einträge.</div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = document.createElement('div');
        card.style.cssText = 'background:#fff;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:14px;margin-bottom:10px;';
        card.innerHTML =
          '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px;">'+(d.name||d.userName||'Anonym')+' — '+(d.exerciseName||d.exercise||'')+'</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">'+(d.parkName||'Kein Park')+' &middot; '+(d.value||d.reps||0)+' '+(d.unit||'Wdh')+'</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:10px;">'+new Date(d.createdAt||d.date).toLocaleDateString('de-DE')+'</div>'+
          (d.videoUrl?'<a href="'+d.videoUrl+'" target="_blank" style="display:inline-block;font-size:11px;color:var(--accent-ink);margin-bottom:10px;">&#127909; Video ansehen</a><br>':'');

        var undoBtn = document.createElement('button');
        undoBtn.style.cssText = 'width:100%;background:rgba(255,85,0,0.1);color:var(--accent-ink);border:1px solid rgba(255,85,0,0.3);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px;min-height:36px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
        undoBtn.classList.add('pressable');
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
    .catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>'; });
}

// ── ADMIN: PARK VORSCHLÄGE PRÜFEN ─────────────────────────
function loadParkSuggestions(el){
  el.innerHTML = '<div style="text-align:center;padding:16px;font-size:12px;color:var(--muted);">Lädt...</div>';
  db.collection('parkSuggestions').where('status','==','pending').orderBy('createdAt','desc').get()
    .then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div style="text-align:center;padding:20px;font-size:12px;color:var(--muted);">&#10003; Keine ausstehenden Vorschläge!</div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = document.createElement('div');
        card.style.cssText = 'background:#fff;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:14px;margin-bottom:10px;';
        card.innerHTML =
          '<div style="font-size:13px;font-weight:800;color:var(--text);margin-bottom:4px;">&#128170; '+d.name+'</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">Von: '+(d.submitterName||'Anonym')+'</div>'+
          (d.description?'<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">'+d.description+'</div>':'')+
          '<div style="font-size:11px;color:var(--accent-ink);margin-bottom:10px;">&#128205; '+d.lat.toFixed(5)+', '+d.lng.toFixed(5)+
          ' <a href="https://www.google.com/maps?q='+d.lat+','+d.lng+'" target="_blank" style="color:var(--accent-ink);">(Maps öffnen)</a></div>';

        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;';

        var approveBtn = document.createElement('button');
        approveBtn.style.cssText = 'flex:1;background:rgba(34,197,94,0.1);color:var(--success-ink);border:1px solid rgba(34,197,94,0.3);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px;min-height:36px;cursor:pointer;';
        approveBtn.classList.add('pressable');
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
            toast('✓ Park genehmigt und hinzugefügt!');
          });
        };

        var rejectBtn = document.createElement('button');
        rejectBtn.style.cssText = 'flex:1;background:rgba(217,48,54,0.08);color:var(--red);border:1px solid rgba(217,48,54,0.25);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px;min-height:36px;cursor:pointer;';
        rejectBtn.classList.add('pressable');
        rejectBtn.innerHTML = '&#10007; Ablehnen';
        rejectBtn.onclick = function(){
          doc.ref.update({status:'rejected'}).then(function(){ card.remove(); toast('Abgelehnt.'); });
        };

        btnRow.appendChild(approveBtn); btnRow.appendChild(rejectBtn);
        card.appendChild(btnRow);
        el.appendChild(card);
      });
      if(window.caliMotion) caliMotion.stagger(el);
    }).catch(function(e){ el.innerHTML='<div style="color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>'; });
}

// ── ADMIN: MONATSBONI BUTTON ──────────────────────────────
function addMonthlyBonusAdminBtn(box){
  var now = new Date();
  var prevMonth = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString().slice(0,7);
  var btn = document.createElement('button');
  btn.style.cssText = 'width:100%;background:rgba(255,85,0,0.1);border:1px solid var(--accent);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:12px;min-height:36px;cursor:pointer;color:var(--accent-ink);margin-bottom:14px;transition:transform var(--dur-fast) var(--ease-out);';
  btn.classList.add('pressable');
  btn.innerHTML = '🏆 Monatsboni vergeben ('+prevMonth+')';
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
