// ══════════════════════════════════════════════════════════
// REKORDE.JS
// ══════════════════════════════════════════════════════════

var REK_CATS = [
  {id:'all',       label:'Alle',      icon:'&#127942;'},
  {id:'Pull',      label:'Pull',      icon:'&#11014;&#65039;'},
  {id:'Push',      label:'Push',      icon:'&#128170;'},
  {id:'Core',      label:'Core',      icon:'&#128293;'},
  {id:'Legs',      label:'Legs',      icon:'&#129466;'},
  {id:'Skills',    label:'Skills',    icon:'&#11088;'},
  {id:'Schwimmen', label:'Schwimmen', icon:'&#127946;'},
  {id:'Laufen',    label:'Laufen',    icon:'&#127939;'},
];

var REK_REGIONS = [
  {label:'Bezirk',      km:10},
  {label:'Stadt',       km:25},
  {label:'Bundesland',  km:150},
  {label:'Deutschland', km:500},
  {label:'Weltweit',    km:99999},
];

var rekState = { cat:'all', exId:null, exName:'', exUnit:'Wdh', regionKm:99999 };
var rekMapObj = null;
var rekCircleObj = null;

function buildRekordeUI(){
  var root = document.getElementById('rek-root');
  if(!root) return;
  root.innerHTML = '';

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:0 16px 14px;display:flex;align-items:center;justify-content:space-between;';
  hdr.innerHTML = '<div style="font-size:22px;font-weight:800;color:var(--text);">&#127942; REKORDE</div>';
  var subBtn = document.createElement('button');
  subBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 14px;cursor:pointer;letter-spacing:1px;';
  subBtn.textContent = '+ EINTRAG';
  subBtn.onclick = function(){ openRecordSubmit(null,null); };
  hdr.appendChild(subBtn);
  root.appendChild(hdr);

  // Kategorie-Filter
  var catWrap = document.createElement('div');
  catWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;padding:0 16px 12px;scrollbar-width:none;';
  REK_CATS.forEach(function(cat){
    var btn = document.createElement('button');
    btn.dataset.catId = cat.id;
    var isActive = cat.id === rekState.cat;
    btn.style.cssText = 'flex-shrink:0;padding:7px 14px;border-radius:20px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'var(--accent)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;';
    btn.innerHTML = cat.icon+' '+cat.label;
    btn.onclick = function(){
      rekState.cat = cat.id;
      rekState.exId = null;
      buildRekordeUI();
    };
    catWrap.appendChild(btn);
  });
  root.appendChild(catWrap);

  // Übungen
  var allEx = getRekExercises();
  var exWrap = document.createElement('div');
  exWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;padding:0 16px 16px;scrollbar-width:none;';
  allEx.forEach(function(ex){
    var btn = document.createElement('button');
    btn.dataset.exId = ex.id;
    var isActive = ex.id === rekState.exId;
    btn.style.cssText = 'flex-shrink:0;padding:6px 13px;border-radius:20px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'rgba(255,85,0,0.12)':'none')+';color:'+(isActive?'var(--accent)':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;';
    btn.textContent = ex.name;
    btn.onclick = function(){
      rekState.exId = ex.id;
      rekState.exName = ex.name;
      rekState.exUnit = ex.unit;
      exWrap.querySelectorAll('button').forEach(function(b){
        var a = b.dataset.exId === rekState.exId;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'rgba(255,85,0,0.12)':'none';
        b.style.color = a?'var(--accent)':'var(--muted)';
      });
      loadRekList(listEl);
    };
    exWrap.appendChild(btn);
  });
  root.appendChild(exWrap);

  // Region-Filter
  var regSection = document.createElement('div');
  regSection.style.cssText = 'padding:0 16px 16px;';
  var regLabel = document.createElement('div');
  regLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:8px;';
  regLabel.textContent = 'REGION';
  regSection.appendChild(regLabel);

  var regBtns = document.createElement('div');
  regBtns.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;';
  REK_REGIONS.forEach(function(opt){
    var btn = document.createElement('button');
    var isActive = opt.km === rekState.regionKm;
    btn.style.cssText = 'padding:7px 14px;border-radius:20px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'rgba(255,85,0,0.1)':'none')+';color:'+(isActive?'var(--accent)':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;';
    btn.textContent = opt.label;
    btn.onclick = function(){
      rekState.regionKm = opt.km;
      regBtns.querySelectorAll('button').forEach(function(b,bi){
        var a = REK_REGIONS[bi].km === rekState.regionKm;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'rgba(255,85,0,0.1)':'none';
        b.style.color = a?'var(--accent)':'var(--muted)';
      });
      updateRekMap();
      loadRekList(listEl);
    };
    regBtns.appendChild(btn);
  });
  regSection.appendChild(regBtns);

  // Karte mit Radius-Kreis
  if(userLat && userLng){
    var mapContainer = document.createElement('div');
    mapContainer.id = 'rek-map';
    mapContainer.style.cssText = 'height:160px;border-radius:12px;overflow:hidden;margin-bottom:4px;border:1px solid var(--border);';
    regSection.appendChild(mapContainer);
    var mapNote = document.createElement('div');
    mapNote.style.cssText = 'font-size:10px;color:var(--muted);margin-bottom:8px;';
    mapNote.textContent = 'Zeigt Einträge aus dem markierten Bereich';
    regSection.appendChild(mapNote);
  }
  root.appendChild(regSection);

  // Bestenliste
  var listEl = document.createElement('div');
  listEl.style.cssText = 'padding:0 16px 80px;';
  root.appendChild(listEl);

  // Auto-select erste Übung
  if(!rekState.exId && allEx.length > 0){
    rekState.exId = allEx[0].id;
    rekState.exName = allEx[0].name;
    rekState.exUnit = allEx[0].unit;
    if(exWrap.children[0]){
      exWrap.children[0].style.borderColor = 'var(--accent)';
      exWrap.children[0].style.background = 'rgba(255,85,0,0.12)';
      exWrap.children[0].style.color = 'var(--accent)';
    }
  }

  loadRekList(listEl);

  // Karte initialisieren (nach DOM)
  if(userLat && userLng){
    setTimeout(function(){ initRekMap(); }, 100);
  }
}

function initRekMap(){
  if(typeof L === 'undefined') return;
  var el = document.getElementById('rek-map');
  if(!el) return;
  if(rekMapObj){ rekMapObj.remove(); rekMapObj = null; }
  rekMapObj = L.map('rek-map', {zoomControl:false, dragging:false, scrollWheelZoom:false, doubleClickZoom:false, touchZoom:false}).setView([userLat, userLng], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution:''}).addTo(rekMapObj);
  L.circleMarker([userLat, userLng], {radius:6, fillColor:'#ff5500', fillOpacity:1, color:'#fff', weight:2}).addTo(rekMapObj);
  updateRekMap();
}

function updateRekMap(){
  if(!rekMapObj || !userLat || !userLng) return;
  if(rekCircleObj){ rekMapObj.removeLayer(rekCircleObj); rekCircleObj = null; }
  var km = rekState.regionKm;
  if(km >= 99999){
    rekMapObj.setView([51.1657, 10.4515], 5);
    return;
  }
  var radiusM = km * 1000;
  rekCircleObj = L.circle([userLat, userLng], {
    radius: radiusM,
    color: '#ff5500',
    fillColor: '#ff5500',
    fillOpacity: 0.08,
    weight: 2
  }).addTo(rekMapObj);
  rekMapObj.fitBounds(rekCircleObj.getBounds(), {padding:[10,10]});
}

function getRekExercises(){
  var result = [];
  var seen = {};
  if(typeof EX_DB !== 'undefined'){
    EX_DB.forEach(function(ex, i){
      if(rekState.cat === 'all' || ex.cat === rekState.cat){
        var key = ex.name+'|'+ex.unit;
        if(!seen[key]){ seen[key]=true; result.push({id:'ex_'+i, name:ex.name, unit:ex.unit, cat:ex.cat}); }
      }
    });
  }
  var skillExtras = [
    {id:'skill_muscleup',   name:'Muscle-Up',         unit:'Wdh',  cat:'Skills'},
    {id:'skill_backlever',  name:'Back Lever',         unit:'Sek',  cat:'Skills'},
    {id:'skill_frontlever', name:'Front Lever',        unit:'Sek',  cat:'Skills'},
    {id:'skill_planche',    name:'Planche',            unit:'Sek',  cat:'Skills'},
    {id:'skill_lsit',       name:'L-Sit',             unit:'Sek',  cat:'Skills'},
    {id:'skill_handstand',  name:'Handstand (frei)',   unit:'Sek',  cat:'Skills'},
    {id:'skill_humanflag',  name:'Human Flag',         unit:'Sek',  cat:'Skills'},
    {id:'skill_360pu',      name:'360 Pull-Up',        unit:'Wdh',  cat:'Skills'},
    {id:'skill_rings',      name:'Ring Muscle-Up',     unit:'Wdh',  cat:'Skills'},
  ];
  if(rekState.cat === 'all' || rekState.cat === 'Skills'){
    skillExtras.forEach(function(s){
      if(!seen[s.name+'|'+s.unit]){ seen[s.name+'|'+s.unit]=true; result.push(s); }
    });
  }
  return result;
}

function loadRekList(el){
  if(!rekState.exId){ el.innerHTML='<div style="text-align:center;padding:30px;color:var(--muted);">Übung auswählen</div>'; return; }
  el.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px;">&#9203; Lade...</div>';
  if(typeof db === 'undefined' || !db){
    el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Einloggen um Rekorde zu sehen.</div>'; return;
  }
  db.collection('globalLeaderboard')
    .where('exercise','==',rekState.exId)
    .where('status','==','approved')
    .orderBy('value','desc')
    .limit(100)
    .get()
    .then(function(snap){
      el.innerHTML = '';
      var titleRow = document.createElement('div');
      titleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
      titleRow.innerHTML = '<div style="font-size:13px;font-weight:800;color:var(--text);">'+rekState.exName+'</div><div style="font-size:10px;color:var(--muted);">'+rekState.exUnit+'</div>';
      el.appendChild(titleRow);

      if(snap.empty){
        el.innerHTML += '<div style="text-align:center;padding:40px 20px;background:var(--bg2);border-radius:14px;"><div style="font-size:36px;margin-bottom:10px;">&#127942;</div><div style="font-size:13px;color:var(--muted);">Noch keine Einträge.<br>Sei der Erste!</div></div>';
        return;
      }
      var entries = [];
      snap.forEach(function(doc){ entries.push(Object.assign({_id:doc.id},doc.data())); });

      // Region filter
      if(rekState.regionKm < 99999 && userLat && userLng){
        entries = entries.filter(function(e){
          if(!e.lat||!e.lng) return false;
          return calcDist(userLat,userLng,e.lat,e.lng) <= rekState.regionKm*1000;
        });
      }

      if(entries.length===0){
        el.innerHTML += '<div style="text-align:center;padding:30px;background:var(--bg2);border-radius:14px;color:var(--muted);">Keine Einträge in dieser Region.<br>Wähle einen größeren Bereich.</div>';
        return;
      }

      var uid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;
      entries.forEach(function(d,i){
        var rank=i+1;
        var medal=rank===1?'&#129351;':rank===2?'&#129352;':rank===3?'&#129353;':'';
        var isMe=uid&&d.uid===uid;
        var card=document.createElement('div');
        card.style.cssText='display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;margin-bottom:8px;background:'+(isMe?'rgba(255,85,0,0.08)':'var(--bg2)')+';border:1.5px solid '+(isMe?'var(--accent)':'var(--border)')+';';
        var rankEl=document.createElement('div');
        rankEl.style.cssText='width:34px;text-align:center;flex-shrink:0;';
        rankEl.innerHTML=medal?'<span style="font-size:22px;">'+medal+'</span>':'<span style="font-size:13px;font-weight:700;color:var(--muted);">#'+rank+'</span>';
        var infoEl=document.createElement('div');
        infoEl.style.cssText='flex:1;min-width:0;';
        infoEl.innerHTML='<div style="font-size:14px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.name||'Anonym')+(isMe?' <span style="font-size:9px;color:var(--accent);border:1px solid var(--accent);border-radius:4px;padding:1px 4px;">DU</span>':'')+' </div>'+
          '<div style="font-size:10px;color:var(--muted);">'+(d.location||'')+(d.parkName?' · &#128205;'+d.parkName:'')+'</div>';
        var valEl=document.createElement('div');
        valEl.style.cssText='text-align:right;flex-shrink:0;';
        valEl.innerHTML='<div style="font-size:22px;font-weight:800;color:var(--accent);">'+d.value+'</div><div style="font-size:10px;color:var(--muted);">'+rekState.exUnit+'</div>';
        card.appendChild(rankEl); card.appendChild(infoEl); card.appendChild(valEl);
        if(d.videoUrl){
          var vBtn=document.createElement('button');
          vBtn.style.cssText='background:none;border:1.5px solid var(--border);border-radius:8px;padding:8px;font-size:18px;cursor:pointer;flex-shrink:0;';
          vBtn.innerHTML='&#9654;&#65039;';
          vBtn.onclick=function(){ playVideo(d.videoUrl); };
          card.appendChild(vBtn);
        }
        el.appendChild(card);
      });
    })
    .catch(function(e){
      el.innerHTML='<div style="padding:20px;color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>';
    });
}
