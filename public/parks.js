
var parksMap = null;
var parksMarkers = [];
var clusterGroup = null;
var userLat = null;
var userLng = null;
var currentRadius = 2000;
var parksData = [];

function initParksPage(){
  if(!parksMap){
    // Kleine Verzögerung damit das DOM-Element sichtbar ist
    setTimeout(function(){
      if(typeof L === 'undefined'){ setTimeout(initParksPage, 300); return; }
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
        btn.style.background='var(--accent)'; btn.style.color='#fff'; btn.style.border='none';
      } else {
        btn.style.background='var(--bg3)'; btn.style.color='var(--muted)'; btn.style.border='1px solid var(--border)';
      }
    }
  });
  if(userLat) loadParks();
}

function locateAndLoad(){
  var statusEl = document.getElementById('parks-status');
  statusEl.textContent = 'Standort wird ermittelt...';
  document.getElementById('parks-locate-btn').textContent = '...';

  if(!navigator.geolocation){
    statusEl.textContent = 'Geolocation wird nicht unterstützt.';
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function(pos){
      userLat = pos.coords.latitude;
      userLng = pos.coords.longitude;
      document.getElementById('parks-locate-btn').textContent = '\u2713 STANDORT';
      loadParks();
    },
    function(err){
      statusEl.textContent = 'Standort konnte nicht ermittelt werden. Bitte Berechtigung erlauben.';
      document.getElementById('parks-locate-btn').textContent = '\u25B7 STANDORT';
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

  var proxies = ['/.netlify/functions/overpass'];

  function processParks(data){
    parksData = data.elements || [];
    if(parksData.length === 0){ statusEl.textContent = 'Keine Parks gefunden. Versuch einen groesseren Radius.'; return; }
    statusEl.textContent = parksData.length + ' Parks gefunden im Umkreis von '+(currentRadius/1000)+' km';
    var parkIcon = L.divIcon({html:'<div style="background:#ff5500;color:#fff;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.3);">&#128170;</div>',className:'',iconAnchor:[17,17]});
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
      var marker=L.marker([park._lat,park._lng],{icon:parkIcon});
      if(clusterGroup){ clusterGroup.addLayer(marker); } else { marker.addTo(parksMap); }
      marker.bindPopup('<div style="font-family:system-ui;min-width:190px;padding:4px 0;"><div style="font-size:14px;font-weight:800;margin-bottom:2px;">'+name+'</div><div style="font-size:11px;color:#999;margin-bottom:10px;">'+formatDist(park._dist)+' entfernt</div><button onclick="openParkDetail('+idx+')" style="background:#ff5500;color:#fff;border:none;border-radius:8px;padding:10px;font-size:12px;font-weight:700;cursor:pointer;width:100%;margin-bottom:6px;">&#128170; Park ansehen</button><button onclick="openParkNav('+idx+')" style="background:none;border:1.5px solid #ddd;border-radius:8px;padding:8px;font-size:11px;font-weight:600;cursor:pointer;width:100%;color:#555;">&#128205; Navigation</button></div>');
      parksMarkers.push(marker);
    });
    buildParksList();
    document.getElementById('parks-locate-btn').textContent='✓ STANDORT';
  }

  function tryProxy(idx){
    if(idx>=proxies.length){
      statusEl.textContent='Fehler beim Laden. Bitte nochmal versuchen.';
      document.getElementById('parks-locate-btn').textContent='▷ STANDORT';
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

function buildParksList(){
  var listEl = document.getElementById('parks-list');
  listEl.innerHTML = '<div style="font-size:9px;letter-spacing:3px;color:var(--accent);font-weight:700;margin-bottom:10px;">PARKS IN DER NÄHE</div>';

  parksData.slice(0,15).forEach(function(park, idx){
    var name = park.tags && (park.tags.name || park.tags['name:de']) ? (park.tags.name || park.tags['name:de']) : 'Calisthenics Park';
    var addr = '';
    if(park.tags){
      if(park.tags['addr:street']) addr = park.tags['addr:street'] + (park.tags['addr:housenumber']?' '+park.tags['addr:housenumber']:'');
      else if(park.tags['addr:city']) addr = park.tags['addr:city'];
    }

    var card = document.createElement('div');
    card.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:8px;display:flex;align-items:center;gap:12px;cursor:pointer;';
    card.onclick = function(){ openParkDetail(idx); };
    card.innerHTML =
      '<div style="font-size:22px;flex-shrink:0;">\uD83D\uDCAA</div>'+
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+name+'</div>'+
        (addr?'<div style="font-size:10px;color:var(--muted);margin-top:2px;">'+addr+'</div>':'')+
      '</div>'+
      '<div style="font-size:11px;font-weight:700;color:var(--accent);flex-shrink:0;">'+formatDist(park._dist)+'</div>';
    listEl.appendChild(card);
  });
}

function openParkDetail(idx){
  var park = parksData[idx];
  if(!park) return;
  var name = park.tags && (park.tags.name || park.tags['name:de']) ? (park.tags.name || park.tags['name:de']) : 'Calisthenics Park';
  var parkId = 'park_'+(park.id||Math.round(park._lat*1000)+'_'+Math.round(park._lng*1000));
  var addr = '';
  if(park.tags){
    if(park.tags['addr:street']) addr = park.tags['addr:street'] + (park.tags['addr:housenumber']?' '+park.tags['addr:housenumber']:'');
    if(park.tags['addr:city']) addr += (addr?', ':'')+park.tags['addr:city'];
  }

  var ex = document.getElementById('park-modal-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'park-modal-ov';
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.55);z-index:9800;display:flex;align-items:flex-end;justify-content:center;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;border-top:1px solid var(--border);';

  box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:16px auto 14px;"></div>';

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:0 20px 14px;';
  hdr.innerHTML =
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">'+
      '<div style="font-size:32px;">&#128170;</div>'+
      '<div style="flex:1;">'+
        '<div style="font-size:17px;font-weight:800;color:var(--text);">'+name+'</div>'+
        (addr?'<div style="font-size:10px;color:var(--muted);">'+addr+'</div>':'')+
        '<div style="font-size:11px;color:var(--accent);font-weight:700;">&#128205; '+formatDist(park._dist)+' entfernt</div>'+
      '</div>'+
    '</div>';
  box.appendChild(hdr);

  // Tab navigation
  var tabBar = document.createElement('div');
  tabBar.style.cssText = 'display:flex;border-top:1px solid var(--border);border-bottom:1px solid var(--border);';
  var tabs = ['NAVIGATION','MEINE STATS','BESTENLISTE'];
  var tabContents = [];
  var activeTab = 0;

  tabs.forEach(function(t, ti){
    var tb = document.createElement('button');
    tb.style.cssText = 'flex:1;padding:11px 4px;font-family:inherit;font-size:9px;letter-spacing:1px;font-weight:700;border:none;cursor:pointer;border-bottom:2px solid '+(ti===0?'var(--accent)':'transparent')+';background:none;color:'+(ti===0?'var(--accent)':'var(--muted)')+';';
    tb.textContent = t;
    var content = document.createElement('div');
    content.style.cssText = 'padding:16px 20px 32px;display:'+(ti===0?'block':'none')+';';
    tabContents.push(content);
    tb.onclick = (function(tIdx, tEl){
      return function(){
        activeTab = tIdx;
        tabBar.querySelectorAll('button').forEach(function(b,bi){
          b.style.borderBottomColor = bi===tIdx?'var(--accent)':'transparent';
          b.style.color = bi===tIdx?'var(--accent)':'var(--muted)';
        });
        tabContents.forEach(function(c,ci){ c.style.display=ci===tIdx?'block':'none'; });
        if(tIdx===1) buildParkStats(content, parkId);
        if(tIdx===2) buildParkLeaderboard(content, parkId, name);
      };
    })(ti, tb);
    tabBar.appendChild(tb);
    box.appendChild(tabBar);
  });

  // TAB 0: Navigation
  var navContent = tabContents[0];
  navContent.innerHTML =
    '<div style="font-size:9px;letter-spacing:3px;color:var(--muted);font-weight:700;margin-bottom:12px;">NAVIGATION &#214;FFNEN MIT</div>';

  var gBtn = document.createElement('button');
  gBtn.style.cssText = 'width:100%;background:var(--bg2);border:1.5px solid var(--border);border-radius:12px;font-family:inherit;font-size:14px;font-weight:700;padding:15px;cursor:pointer;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text);';
  gBtn.innerHTML = '<img src="https://www.google.com/favicon.ico" style="width:18px;height:18px;border-radius:3px;"> Google Maps';
  gBtn.onclick = function(){ window.open('https://www.google.com/maps/dir/?api=1&destination='+park._lat+','+park._lng+'&travelmode=walking','_blank'); ov.remove(); };

  var aBtn = document.createElement('button');
  aBtn.style.cssText = 'width:100%;background:var(--bg2);border:1.5px solid var(--border);border-radius:12px;font-family:inherit;font-size:14px;font-weight:700;padding:15px;cursor:pointer;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text);';
  aBtn.innerHTML = '<span style="font-size:18px;">&#128506;&#65039;</span> Apple Maps';
  aBtn.onclick = function(){ window.location.href='maps://maps.apple.com/?daddr='+park._lat+','+park._lng+'&dirflg=w'; ov.remove(); };

  var cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:10px;cursor:pointer;';
  cancelBtn.textContent = 'Schlie\u00dfen';
  cancelBtn.onclick = function(){ ov.remove(); };

  navContent.appendChild(gBtn);
  navContent.appendChild(aBtn);
  navContent.appendChild(cancelBtn);
  box.appendChild(navContent);
  box.appendChild(tabContents[1]);
  box.appendChild(tabContents[2]);

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(parksMap) parksMap.setView([park._lat, park._lng], 16);
}

// ── PARK STATS (meine Workouts dort) ─────────────────────
function buildParkStats(el, parkId){
  el.innerHTML = '<div style="text-align:center;padding:20px 0;font-size:12px;color:var(--muted);">Wird geladen...</div>';
  if(!currentUser){ el.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center;padding:16px;">Einloggen um Stats zu sehen.</div>'; return; }

  // Find workouts near this park
  var parkCoords = parkId.split('_');
  // We stored workouts with location? No — show general stats for now
  // Count workouts that match by checking ents
  var totalWorkouts = ents.length;
  var exCounts = {};
  ents.forEach(function(e){
    if(e.sets) e.sets.forEach(function(s){
      if(s.ex){ exCounts[s.ex] = (exCounts[s.ex]||0) + (parseInt(s.n)||0); }
    });
  });
  var topEx = Object.keys(exCounts).sort(function(a,b){ return exCounts[b]-exCounts[a]; }).slice(0,5);

  el.innerHTML = '';
  var note = document.createElement('div');
  note.style.cssText = 'background:rgba(255,85,0,0.07);border:1px solid rgba(255,85,0,0.2);border-radius:10px;padding:10px 12px;font-size:11px;color:var(--muted);margin-bottom:14px;line-height:1.5;';
  note.innerHTML = '&#128205; GPS-Tracking kommt in Phase 2. Hier siehst du jetzt deine gesamten Trainings-Stats.';
  el.appendChild(note);

  var stats = [
    {label:'Gesamt Workouts', val: totalWorkouts},
    {label:'Verschiedene Übungen', val: Object.keys(exCounts).length},
  ];
  stats.forEach(function(s){
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);font-size:13px;';
    row.innerHTML = '<span style="color:var(--muted);">'+s.label+'</span><span style="font-weight:800;color:var(--text);">'+s.val+'</span>';
    el.appendChild(row);
  });

  if(topEx.length > 0){
    var t = document.createElement('div');
    t.style.cssText = 'font-size:9px;letter-spacing:3px;color:var(--accent);font-weight:700;margin:14px 0 10px;';
    t.textContent = 'TOP ÜBUNGEN';
    el.appendChild(t);
    topEx.forEach(function(ex, i){
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;';
      row.innerHTML = '<span style="color:var(--text);">'+(i+1)+'. '+ex+'</span><span style="font-weight:700;color:var(--accent);">'+exCounts[ex]+' Wdh</span>';
      el.appendChild(row);
    });
  }
}

// ── PARK LEADERBOARD ──────────────────────────────────────
function buildParkLeaderboard(el, parkId, parkName){
  el.innerHTML = '<div style="text-align:center;padding:16px 0;font-size:12px;color:var(--muted);">Wird geladen...</div>';
  if(!currentUser){ el.innerHTML = '<div style="font-size:12px;color:var(--muted);text-align:center;padding:16px;">Einloggen um die Bestenliste zu sehen.</div>'; return; }

  // Load leaderboard from Firestore
  db.collection('parkLeaderboard').where('parkId','==',parkId).orderBy('reps','desc').limit(20).get()
    .then(function(snap){
      el.innerHTML = '';

      // Submit button
      var subBtn = document.createElement('button');
      subBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:800;letter-spacing:2px;padding:14px;cursor:pointer;margin-bottom:16px;';
      subBtn.textContent = '+ EINTRAG EINREICHEN';
      subBtn.onclick = function(){ showLeaderboardSubmit(parkId, parkName); };
      el.appendChild(subBtn);

      var title = document.createElement('div');
      title.style.cssText = 'font-size:9px;letter-spacing:3px;color:var(--accent);font-weight:700;margin-bottom:12px;';
      title.textContent = 'BESTENLISTE — '+parkName.toUpperCase();
      el.appendChild(title);

      if(snap.empty){
        var empty = document.createElement('div');
        empty.style.cssText = 'text-align:center;padding:20px 0;font-size:12px;color:var(--muted);';
        empty.innerHTML = '&#127942; Noch keine Einträge.<br>Sei der Erste!';
        el.appendChild(empty);
        return;
      }

      snap.forEach(function(doc, idx){
        var d = doc.data();
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:6px;background:'+(idx===0?'rgba(255,85,0,0.08)':'var(--bg2)')+';border:1px solid '+(idx===0?'rgba(255,85,0,0.25)':'var(--border)')+';';
        var medal = idx===0?'&#127947;':idx===1?'&#129352;':idx===2?'&#129353;':(idx+1)+'.';
        var statusBadge = d.status==='approved'?'<span style="font-size:8px;background:rgba(0,200,100,0.15);color:#00c864;border:1px solid rgba(0,200,100,0.3);border-radius:20px;padding:2px 7px;margin-left:6px;">&#10003; OK</span>':
                          d.status==='pending'?'<span style="font-size:8px;background:rgba(255,170,0,0.15);color:#ffaa00;border:1px solid rgba(255,170,0,0.3);border-radius:20px;padding:2px 7px;margin-left:6px;">&#9203; Prüfung</span>':
                          '<span style="font-size:8px;background:rgba(255,50,50,0.1);color:#ff4444;border:1px solid rgba(255,50,50,0.2);border-radius:20px;padding:2px 7px;margin-left:6px;">&#10007; Abgelehnt</span>';
        row.innerHTML =
          '<div style="font-size:18px;flex-shrink:0;width:28px;text-align:center;">'+medal+'</div>'+
          '<div style="flex:1;min-width:0;">'+
            '<div style="font-size:12px;font-weight:700;color:var(--text);">'+d.userName+'</div>'+
            '<div style="font-size:10px;color:var(--muted);">'+d.exercise+statusBadge+'</div>'+
          '</div>'+
          '<div style="font-size:15px;font-weight:900;color:var(--accent);">'+d.reps+' Wdh</div>';
        if(d.videoUrl){
          var vidBtn = document.createElement('a');
          vidBtn.href = d.videoUrl; vidBtn.target='_blank';
          vidBtn.style.cssText = 'font-size:18px;text-decoration:none;flex-shrink:0;';
          vidBtn.textContent = '&#127909;';
          row.appendChild(vidBtn);
        }
        el.appendChild(row);
      });
    })
    .catch(function(){ el.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:12px 0;">Fehler beim Laden.</div>'; });
}

// ── LEADERBOARD SUBMIT MODAL ──────────────────────────────
function showLeaderboardSubmit(parkId, parkName){
  var ex2 = document.getElementById('lb-submit-ov'); if(ex2) ex2.remove();
  var ov2 = document.createElement('div');
  ov2.id = 'lb-submit-ov';
  ov2.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9900;display:flex;align-items:flex-end;justify-content:center;';

  var box2 = document.createElement('div');
  box2.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 40px;';

  box2.innerHTML = '<div style="font-size:15px;font-weight:800;letter-spacing:2px;color:var(--text);margin-bottom:6px;">EINTRAG EINREICHEN</div>'+
    '<div style="font-size:11px;color:var(--muted);margin-bottom:18px;line-height:1.5;">'+parkName+' &middot; Video-Beweis Pflicht &middot; Ich prüfe deinen Eintrag</div>';

  function inpRow(lbl, id, ph, type){
    var w=document.createElement('div'); w.style.cssText='margin-bottom:12px;';
    var l=document.createElement('div'); l.style.cssText='font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:5px;'; l.textContent=lbl;
    var i=document.createElement('input'); i.id=id; i.type=type||'text'; i.placeholder=ph;
    i.style.cssText='width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-family:inherit;font-size:13px;color:var(--text);outline:none;';
    w.appendChild(l); w.appendChild(i); return w;
  }

  box2.appendChild(inpRow('ÜBUNG', 'lb-ex', 'z.B. Klimmzüge'));
  box2.appendChild(inpRow('WIEDERHOLUNGEN', 'lb-reps', 'z.B. 25', 'number'));
  box2.appendChild(inpRow('VIDEO-LINK (YouTube/Instagram)', 'lb-video', 'https://...'));

  var submitBtn = document.createElement('button');
  submitBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;letter-spacing:2px;padding:16px;cursor:pointer;margin-top:6px;';
  submitBtn.textContent = 'EINREICHEN';
  submitBtn.onclick = function(){
    var exVal = document.getElementById('lb-ex').value.trim();
    var repsVal = parseInt(document.getElementById('lb-reps').value);
    var videoVal = document.getElementById('lb-video').value.trim();
    if(!exVal){ toast('Übung eingeben!'); return; }
    if(!repsVal || repsVal < 1){ toast('Wiederholungen eingeben!'); return; }
    if(!videoVal || !videoVal.startsWith('http')){ toast('Video-Link eingeben!'); return; }

    var entry = {
      parkId: parkId,
      parkName: parkName,
      uid: currentUser.uid,
      userName: (prData&&prData.name) ? prData.name : 'Athlet',
      exercise: exVal,
      reps: repsVal,
      videoUrl: videoVal,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.collection('parkLeaderboard').add(entry)
      .then(function(){
        ov2.remove();
        toast('&#127942; Eingereicht! Ich prüfe deinen Eintrag.');
      })
      .catch(function(){ toast('Fehler beim Einreichen.'); });
  };

  var cancelBtn2 = document.createElement('button');
  cancelBtn2.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:10px;cursor:pointer;';
  cancelBtn2.textContent = 'Abbrechen';
  cancelBtn2.onclick = function(){ ov2.remove(); };

  box2.appendChild(submitBtn);
  box2.appendChild(cancelBtn2);
  ov2.appendChild(box2);
  ov2.onclick = function(e){ if(e.target===ov2) ov2.remove(); };
  document.body.appendChild(ov2);
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
  wrap.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:10px;';
  wrap.innerHTML =
    '<div>'+
      '<div style="font-size:13px;font-weight:700;color:var(--text);">Profil ' + (isPublic?'&#127758; Öffentlich':'&#128274; Privat') + '</div>'+
      '<div style="font-size:10px;color:var(--muted);margin-top:2px;">'+(isPublic?'Andere können dich in Bestenlisten sehen':'Dein Name bleibt anonym')+'</div>'+
    '</div>';

  var toggle = document.createElement('button');
  toggle.style.cssText = 'width:48px;height:26px;border-radius:13px;border:none;cursor:pointer;position:relative;background:'+(isPublic?'var(--accent)':'#ccc')+';transition:background 0.2s;flex-shrink:0;';
  toggle.innerHTML = '<div style="position:absolute;top:3px;'+(isPublic?'right:3px':'left:3px')+';width:20px;height:20px;border-radius:50%;background:#fff;transition:all 0.2s;"></div>';
  toggle.onclick = function(){
    isPublic = !isPublic;
    prData = prData || {};
    prData.isPublic = isPublic;
    spr();
    fbSave();
    buildPrivacyToggle();
    toast(isPublic ? '&#127758; Profil öffentlich' : '&#128274; Profil privat');
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
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:88vh;overflow-y:auto;padding:20px;';

  box.innerHTML =
    '<div style="font-size:15px;font-weight:800;letter-spacing:2px;color:var(--text);margin-bottom:4px;">&#128274; ADMIN PANEL</div>'+
    '<div style="font-size:10px;color:var(--muted);margin-bottom:16px;">Bestenlisten-Einträge prüfen</div>';

  var listEl = document.createElement('div');
  listEl.innerHTML = '<div style="text-align:center;padding:16px;font-size:12px;color:var(--muted);">Lädt...</div>';
  box.appendChild(listEl);

  // Load pending entries
  db.collection('parkLeaderboard').where('status','==','pending').orderBy('createdAt','desc').get()
    .then(function(snap){
      listEl.innerHTML = '';
      if(snap.empty){
        listEl.innerHTML = '<div style="text-align:center;padding:20px;font-size:12px;color:var(--muted);">&#10003; Keine ausstehenden Einträge!</div>';
        return;
      }
      snap.forEach(function(doc){
        var d = doc.data();
        var card = document.createElement('div');
        card.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:10px;';
        card.innerHTML =
          '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px;">'+d.userName+' — '+d.exercise+'</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:4px;">'+d.parkName+' &middot; '+d.reps+' Wdh</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:10px;">'+new Date(d.createdAt).toLocaleDateString('de-DE')+'</div>'+
          (d.videoUrl?'<a href="'+d.videoUrl+'" target="_blank" style="display:inline-block;font-size:11px;color:var(--accent);margin-bottom:10px;">&#127909; Video ansehen</a><br>':'<div style="font-size:11px;color:#ff4444;margin-bottom:10px;">Kein Video!</div>');

        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;';

        var approveBtn = document.createElement('button');
        approveBtn.style.cssText = 'flex:1;background:rgba(0,200,100,0.1);color:#00c864;border:1px solid rgba(0,200,100,0.3);border-radius:8px;font-family:inherit;font-size:12px;font-weight:800;padding:10px;cursor:pointer;';
        approveBtn.textContent = '&#10003; GENEHMIGEN';
        approveBtn.onclick = function(){
          doc.ref.update({status:'approved'}).then(function(){
            card.remove();
            toast('&#10003; Genehmigt!');
          });
        };

        var rejectBtn = document.createElement('button');
        rejectBtn.style.cssText = 'flex:1;background:rgba(255,50,50,0.1);color:#ff4444;border:1px solid rgba(255,50,50,0.2);border-radius:8px;font-family:inherit;font-size:12px;font-weight:800;padding:10px;cursor:pointer;';
        rejectBtn.textContent = '&#10007; ABLEHNEN';
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
}
// ── PARK NAVIGATION (direkt) ───────────────────────────────
function openParkNav(idx){
  var park = parksData[idx];
  if(!park) return;
  var ex = document.getElementById('park-modal-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'park-modal-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9800;display:flex;align-items:flex-end;justify-content:center;';
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
    '<div style="font-size:9px;letter-spacing:3px;color:var(--muted);font-weight:700;margin-bottom:12px;">NAVIGATION ÖFFNEN MIT</div>';

  // Google Maps
  var gBtn = document.createElement('button');
  gBtn.style.cssText = 'width:100%;background:var(--bg2);border:1.5px solid var(--border);border-radius:12px;font-family:inherit;font-size:14px;font-weight:700;padding:14px;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text);';
  gBtn.innerHTML = '<img src="https://www.google.com/favicon.ico" style="width:18px;height:18px;border-radius:3px;"> Google Maps';
  gBtn.onclick = function(){ window.open('https://www.google.com/maps/dir/?api=1&destination='+park._lat+','+park._lng+'&travelmode=walking','_blank'); ov.remove(); };

  // Apple Maps
  var aBtn = document.createElement('button');
  aBtn.style.cssText = 'width:100%;background:var(--bg2);border:1.5px solid var(--border);border-radius:12px;font-family:inherit;font-size:14px;font-weight:700;padding:14px;cursor:pointer;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text);';
  aBtn.innerHTML = '<span style="font-size:20px;">&#63743;</span> Apple Maps';
  aBtn.onclick = function(){ window.location.href='maps://maps.apple.com/?daddr='+park._lat+','+park._lng+'&dirflg=w'; ov.remove(); };

  // Adresse kopieren
  var copyBtn = document.createElement('button');
  copyBtn.style.cssText = 'width:100%;background:var(--bg2);border:1.5px solid var(--border);border-radius:12px;font-family:inherit;font-size:14px;font-weight:700;padding:14px;cursor:pointer;margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:10px;color:var(--text);';
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
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9900;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar — gleicher Look wie Rekorde
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;min-width:0;';
  titleEl.innerHTML = '<div style="font-size:16px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">&#128170; '+name+'</div>'+
    '<div style="font-size:11px;color:var(--accent);font-weight:600;">&#128205; '+formatDist(park._dist)+' entfernt</div>';
  var recBtn2 = document.createElement('button');
  recBtn2.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 12px;cursor:pointer;flex-shrink:0;';
  recBtn2.innerHTML = '&#127942; REKORD';
  recBtn2.onclick = function(){ openParkRecordSubmit(idx); };
  var navBtn = document.createElement('button');
  navBtn.style.cssText = 'background:var(--bg2);color:var(--text);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 12px;cursor:pointer;flex-shrink:0;';
  navBtn.innerHTML = '&#128205; NAV';
  navBtn.onclick = function(){ ov.remove(); openParkNav(idx); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(recBtn2); topBar.appendChild(navBtn);
  ov.appendChild(topBar);

  // Haupt-Layout: links Tabs, rechts Inhalt
  var layout = document.createElement('div');
  layout.style.cssText = 'display:flex;flex:1;overflow:hidden;';

  // Linke Spalte
  var leftCol = document.createElement('div');
  leftCol.style.cssText = 'width:120px;flex-shrink:0;border-right:1px solid var(--border);overflow-y:auto;';
  var tabDefs = [
    {label:'&#127942; Bestenliste', id:'lb'},
    {label:'&#128200; Meine Stats', id:'stats'},
    {label:'&#128101; Community', id:'comm'},
  ];
  var bodies = [];
  tabDefs.forEach(function(t, ti){
    var btn = document.createElement('button');
    btn.style.cssText = 'width:100%;padding:14px 10px;border:none;border-bottom:1px solid var(--border);background:'+(ti===0?'rgba(255,85,0,0.08)':'none')+';color:'+(ti===0?'var(--accent)':'var(--muted)')+';font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;text-align:left;border-left:3px solid '+(ti===0?'var(--accent)':'transparent')+';line-height:1.4;';
    btn.innerHTML = t.label;
    var body = document.createElement('div');
    body.style.cssText = 'display:'+(ti===0?'block':'none')+';padding:14px;overflow-y:auto;';
    bodies.push(body);
    btn.onclick = (function(tIdx, tBtn){
      return function(){
        leftCol.querySelectorAll('button').forEach(function(b,bi){
          b.style.background = bi===tIdx?'rgba(255,85,0,0.08)':'none';
          b.style.color = bi===tIdx?'var(--accent)':'var(--muted)';
          b.style.borderLeftColor = bi===tIdx?'var(--accent)':'transparent';
        });
        bodies.forEach(function(b,bi){ b.style.display=bi===tIdx?'block':'none'; });
        if(tIdx===0 && !bodies[0]._loaded){ buildParkDetailLeaderboard(bodies[0], parkId, name); bodies[0]._loaded=true; }
        if(tIdx===1 && !bodies[1]._loaded){ buildParkDetailStats(bodies[1], parkId); bodies[1]._loaded=true; }
        if(tIdx===2 && !bodies[2]._loaded){ buildParkDetailCommunity(bodies[2], parkId, name); bodies[2]._loaded=true; }
      };
    })(ti, btn);
    leftCol.appendChild(btn);
  });
  layout.appendChild(leftCol);

  // Rechte Spalte
  var rightCol = document.createElement('div');
  rightCol.style.cssText = 'flex:1;overflow-y:auto;';
  bodies.forEach(function(b){ rightCol.appendChild(b); });
  layout.appendChild(rightCol);
  ov.appendChild(layout);

  document.body.appendChild(ov);
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
  subBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:12px;cursor:pointer;margin-bottom:14px;';
  subBtn.innerHTML = '+ EINTRAG EINREICHEN';
  subBtn.onclick = function(){ openRecordSubmit(parkId, parkName); };
  el.appendChild(subBtn);

  // Übungs-Auswahl horizontal (wie globale Bestenliste)
  var exLabel = document.createElement('div');
  exLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:8px;';
  exLabel.textContent = 'ÜBUNG';
  el.appendChild(exLabel);

  var exWrap = document.createElement('div');
  exWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;margin-bottom:14px;scrollbar-width:none;';

  var PARK_CATS = [
    {id:'all',label:'Alle',icon:'&#127942;'},
    {id:'Pull',label:'Pull',icon:'&#11014;'},
    {id:'Push',label:'Push',icon:'&#128170;'},
    {id:'Core',label:'Core',icon:'&#128293;'},
    {id:'Legs',label:'Legs',icon:'&#129466;'},
    {id:'Skills',label:'Skills',icon:'&#11088;'},
    {id:'Schwimmen',label:'Schwimmen',icon:'&#127946;'},
    {id:'Laufen',label:'Laufen',icon:'&#127939;'},
  ];
  var activeCat = 'all';

  // Kategorie-Filter
  var catWrap = document.createElement('div');
  catWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;margin-bottom:10px;scrollbar-width:none;';
  PARK_CATS.forEach(function(cat){
    var btn = document.createElement('button');
    btn.dataset.catId = cat.id;
    var isActive = cat.id === activeCat;
    btn.style.cssText = 'flex-shrink:0;padding:6px 12px;border-radius:20px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'var(--accent)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;white-space:nowrap;';
    btn.innerHTML = cat.icon+' '+cat.label;
    btn.onclick = function(){
      activeCat = cat.id;
      catWrap.querySelectorAll('button').forEach(function(b){
        var a = b.dataset.catId === activeCat;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'var(--accent)':'none';
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
      btn.style.cssText = 'flex-shrink:0;padding:6px 12px;border-radius:20px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'var(--accent)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;';
      btn.textContent = ex.name;
      btn.onclick = function(){
        selEx = ex;
        exWrap2.querySelectorAll('button').forEach(function(b){
          var a = b.dataset.exId === selEx.id;
          b.style.borderColor = a?'var(--accent)':'var(--border)';
          b.style.background = a?'var(--accent)':'none';
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
      snap.forEach(function(doc, i){
        var d = doc.data();
        var rank = i+1;
        var medal = rank===1?'&#129351;':rank===2?'&#129352;':rank===3?'&#129353;':'';
        var isMe = uid && d.uid === uid;
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);background:'+(isMe?'rgba(255,85,0,0.05)':'none')+';';
        var rankEl = document.createElement('div');
        rankEl.style.cssText = 'width:28px;text-align:center;flex-shrink:0;';
        rankEl.innerHTML = medal?'<span style="font-size:18px;">'+medal+'</span>':'<span style="font-size:11px;font-weight:700;color:var(--muted);">#'+rank+'</span>';
        var infoEl = document.createElement('div');
        infoEl.style.cssText = 'flex:1;min-width:0;';
        infoEl.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--text);">'+(d.name||'Anonym')+(isMe?' <span style="font-size:9px;color:var(--accent);border:1px solid var(--accent);border-radius:3px;padding:0 3px;">DU</span>':'')+' </div>';
        var valEl = document.createElement('div');
        valEl.style.cssText = 'text-align:right;flex-shrink:0;';
        valEl.innerHTML = '<div style="font-size:18px;font-weight:800;color:var(--accent);">'+d.value+'</div><div style="font-size:9px;color:var(--muted);">'+ex.unit+'</div>';
        row.appendChild(rankEl); row.appendChild(infoEl); row.appendChild(valEl);
        if(d.videoUrl){
          var vBtn = document.createElement('button');
          vBtn.style.cssText = 'background:none;border:1px solid var(--border);border-radius:6px;padding:5px 7px;font-size:14px;cursor:pointer;flex-shrink:0;';
          vBtn.innerHTML = '&#9654;';
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
  el.innerHTML = '<div style="font-size:11px;letter-spacing:3px;color:var(--accent);font-weight:700;margin-bottom:16px;">&#128200; MEINE STATS</div>';
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
        '<div style="font-size:18px;font-weight:800;color:var(--text);">'+s.value+' <span style="font-size:11px;color:var(--muted);">'+s.unit+'</span></div>';
      el.appendChild(row);
    });
  }).catch(function(){ el.innerHTML += '<div style="color:var(--muted);">Fehler.</div>'; });
}

function buildParkDetailCommunity(el, parkId, parkName){
  el.innerHTML = '<div style="font-size:11px;letter-spacing:3px;color:var(--accent);font-weight:700;margin-bottom:16px;">&#128101; COMMUNITY WORKOUTS</div>';
  if(typeof db === 'undefined' || !db){ el.innerHTML += '<div style="color:var(--muted);font-size:13px;">Einloggen um Community zu sehen.</div>'; return; }
  db.collection('parkWorkouts').doc(parkId).collection('posts').orderBy('date','desc').limit(20).get().then(function(snap){
    if(snap.empty){ el.innerHTML += '<div style="color:var(--muted);font-size:13px;text-align:center;padding:20px;">Noch keine Community-Workouts hier.<br>Sei der Erste!</div>'; return; }
    snap.forEach(function(doc){
      var d = doc.data();
      var card = document.createElement('div');
      card.style.cssText = 'background:var(--bg2);border-radius:12px;padding:14px;margin-bottom:10px;';
      card.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:8px;">'+
        '<div style="font-size:13px;font-weight:700;color:var(--text);">'+(d.userName||'Anonym')+'</div>'+
        '<div style="font-size:10px;color:var(--muted);">'+(d.date?d.date.slice(0,10):'')+'</div>'+
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
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:18px;padding:24px;max-width:340px;width:100%;text-align:center;';
  box.innerHTML =
    '<div style="font-size:40px;margin-bottom:12px;">📍</div>'+
    '<div style="font-size:15px;font-weight:800;color:var(--text);margin-bottom:8px;">'+parkName+'</div>'+
    '<div style="font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.5;">'+msg+'</div>';
  var closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:13px;cursor:pointer;';
  closeBtn.textContent = 'OK, verstanden';
  closeBtn.onclick = function(){ ov.remove(); };
  box.appendChild(closeBtn);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
}
