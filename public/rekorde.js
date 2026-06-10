// ══════════════════════════════════════════════════════════
// REKORDE.JS
// ══════════════════════════════════════════════════════════

var REK_CATS = [
  {id:'all',       label:'Alle',      icon:'&#127942;'},
  {id:'Pull',      label:'Pull',      icon:'&#11014;'},
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

  // ── HEADER ──────────────────────────────────────────────
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:0 16px 14px;display:flex;align-items:center;justify-content:space-between;';
  hdr.innerHTML = '<div style="font-size:22px;font-weight:800;color:var(--text);">&#127942; REKORDE</div>';
  var subBtn = document.createElement('button');
  subBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 14px;cursor:pointer;letter-spacing:1px;';
  subBtn.textContent = '+ EINTRAG';
  subBtn.onclick = function(){ openRecordSubmit(null,null); };
  hdr.appendChild(subBtn);
  root.appendChild(hdr);

  // ── LAYOUT: links Übungen, rechts Liste ─────────────────
  var layout = document.createElement('div');
  layout.style.cssText = 'display:flex;gap:0;';

  // Linke Spalte — Kategorien + Übungen
  var leftCol = document.createElement('div');
  leftCol.style.cssText = 'width:140px;flex-shrink:0;border-right:1px solid var(--border);';

  // Kategorie-Tabs (vertikal)
  REK_CATS.forEach(function(cat){
    var btn = document.createElement('button');
    btn.dataset.catId = cat.id;
    var isActive = cat.id === rekState.cat;
    btn.style.cssText = 'width:100%;padding:10px 12px;border:none;border-bottom:1px solid var(--border);background:'+(isActive?'rgba(255,85,0,0.08)':'none')+';color:'+(isActive?'var(--accent)':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;text-align:left;border-left:3px solid '+(isActive?'var(--accent)':'transparent')+';';
    btn.innerHTML = cat.icon+' '+cat.label;
    btn.onclick = function(){
      rekState.cat = cat.id;
      rekState.exId = null;
      buildRekordeUI();
    };
    leftCol.appendChild(btn);
  });
  layout.appendChild(leftCol);

  // Rechte Spalte — Übungen + Region + Liste
  var rightCol = document.createElement('div');
  rightCol.style.cssText = 'flex:1;min-width:0;';

  // Übungen als vertikale Liste
  var exLabel = document.createElement('div');
  exLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;padding:12px 14px 6px;';
  exLabel.textContent = 'ÜBUNG';
  rightCol.appendChild(exLabel);

  var exList = document.createElement('div');
  exList.style.cssText = 'border-bottom:1px solid var(--border);max-height:200px;overflow-y:auto;';
  var allEx = getRekExercises();
  allEx.forEach(function(ex){
    var btn = document.createElement('button');
    btn.dataset.exId = ex.id;
    var isActive = ex.id === rekState.exId;
    btn.style.cssText = 'width:100%;padding:10px 14px;border:none;border-bottom:1px solid var(--border);background:'+(isActive?'rgba(255,85,0,0.08)':'none')+';color:'+(isActive?'var(--accent)':'var(--text)')+';font-family:inherit;font-size:12px;font-weight:'+(isActive?'700':'400')+';cursor:pointer;text-align:left;display:flex;align-items:center;justify-content:space-between;border-left:3px solid '+(isActive?'var(--accent)':'transparent')+';';
    btn.innerHTML = '<span>'+ex.name+'</span><span style="font-size:10px;color:var(--muted);">'+ex.unit+'</span>';
    btn.onclick = function(){
      rekState.exId = ex.id;
      rekState.exName = ex.name;
      rekState.exUnit = ex.unit;
      exList.querySelectorAll('button').forEach(function(b){
        var a = b.dataset.exId === rekState.exId;
        b.style.background = a?'rgba(255,85,0,0.08)':'none';
        b.style.color = a?'var(--accent)':'var(--text)';
        b.style.fontWeight = a?'700':'400';
        b.style.borderLeftColor = a?'var(--accent)':'transparent';
      });
      loadRekList(listEl);
    };
    exList.appendChild(btn);
  });
  rightCol.appendChild(exList);

  // Region-Filter
  var regWrap = document.createElement('div');
  regWrap.style.cssText = 'padding:10px 14px;border-bottom:1px solid var(--border);';
  var regLabel = document.createElement('div');
  regLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:8px;';
  regLabel.textContent = 'REGION';
  regWrap.appendChild(regLabel);
  var regBtns = document.createElement('div');
  regBtns.style.cssText = 'display:flex;gap:5px;flex-wrap:wrap;';
  REK_REGIONS.forEach(function(opt, oi){
    var btn = document.createElement('button');
    var isActive = opt.km === rekState.regionKm;
    btn.style.cssText = 'padding:5px 10px;border-radius:16px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'rgba(255,85,0,0.1)':'none')+';color:'+(isActive?'var(--accent)':'var(--muted)')+';font-family:inherit;font-size:10px;font-weight:700;cursor:pointer;';
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
  regWrap.appendChild(regBtns);
  rightCol.appendChild(regWrap);

  // Karte (nur wenn Standort bekannt)
  if(userLat && userLng){
    var mapEl = document.createElement('div');
    mapEl.id = 'rek-map';
    mapEl.style.cssText = 'height:130px;border-bottom:1px solid var(--border);';
    rightCol.appendChild(mapEl);
  }

  // Bestenliste
  var listEl = document.createElement('div');
  listEl.style.cssText = 'padding:12px 14px 80px;';
  rightCol.appendChild(listEl);

  layout.appendChild(rightCol);
  root.appendChild(layout);

  // Auto-select erste Übung
  if(!rekState.exId && allEx.length > 0){
    rekState.exId = allEx[0].id;
    rekState.exName = allEx[0].name;
    rekState.exUnit = allEx[0].unit;
    var firstBtn = exList.querySelector('button');
    if(firstBtn){
      firstBtn.style.background = 'rgba(255,85,0,0.08)';
      firstBtn.style.color = 'var(--accent)';
      firstBtn.style.fontWeight = '700';
      firstBtn.style.borderLeftColor = 'var(--accent)';
    }
  }

  loadRekList(listEl);
  if(userLat && userLng) setTimeout(function(){ initRekMap(); }, 150);
}

function initRekMap(){
  if(typeof L === 'undefined') return;
  var el = document.getElementById('rek-map');
  if(!el) return;
  if(rekMapObj){ try{ rekMapObj.remove(); }catch(e){} rekMapObj=null; }
  rekMapObj = L.map('rek-map',{zoomControl:false,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,touchZoom:false}).setView([userLat,userLng],11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:''}).addTo(rekMapObj);
  L.circleMarker([userLat,userLng],{radius:6,fillColor:'#ff5500',fillOpacity:1,color:'#fff',weight:2}).addTo(rekMapObj);
  updateRekMap();
}

function updateRekMap(){
  if(!rekMapObj||!userLat||!userLng) return;
  if(rekCircleObj){ try{ rekMapObj.removeLayer(rekCircleObj); }catch(e){} rekCircleObj=null; }
  var km = rekState.regionKm;
  if(km>=99999){ rekMapObj.setView([51.1657,10.4515],5); return; }
  rekCircleObj = L.circle([userLat,userLng],{radius:km*1000,color:'#ff5500',fillColor:'#ff5500',fillOpacity:0.08,weight:2}).addTo(rekMapObj);
  rekMapObj.fitBounds(rekCircleObj.getBounds(),{padding:[8,8]});
}

function getRekExercises(){
  var result=[], seen={};
  if(typeof EX_DB!=='undefined'){
    EX_DB.forEach(function(ex,i){
      if(rekState.cat==='all'||ex.cat===rekState.cat){
        var k=ex.name+'|'+ex.unit;
        if(!seen[k]){seen[k]=1;result.push({id:'ex_'+i,name:ex.name,unit:ex.unit,cat:ex.cat});}
      }
    });
  }
  var extras=[
    {id:'skill_backlever',name:'Back Lever',unit:'Sek',cat:'Skills'},
    {id:'skill_planche',name:'Planche',unit:'Sek',cat:'Skills'},
    {id:'skill_lsit',name:'L-Sit',unit:'Sek',cat:'Skills'},
    {id:'skill_humanflag',name:'Human Flag',unit:'Sek',cat:'Skills'},
    {id:'skill_rings',name:'Ring Muscle-Up',unit:'Wdh',cat:'Skills'},
    {id:'skill_360pu',name:'360 Pull-Up',unit:'Wdh',cat:'Skills'},
  ];
  if(rekState.cat==='all'||rekState.cat==='Skills'){
    extras.forEach(function(s){
      var k=s.name+'|'+s.unit;
      if(!seen[k]){seen[k]=1;result.push(s);}
    });
  }
  return result;
}

function loadRekList(el){
  if(!rekState.exId){el.innerHTML='<div style="padding:20px;color:var(--muted);font-size:13px;">Übung wählen</div>';return;}
  el.innerHTML='<div style="padding:16px;color:var(--muted);font-size:12px;">&#9203; Lade...</div>';
  if(typeof db==='undefined'||!db){el.innerHTML='<div style="padding:20px;color:var(--muted);">Einloggen um Rekorde zu sehen.</div>';return;}
  db.collection('globalLeaderboard')
    .where('exercise','==',rekState.exId)
    .where('status','==','approved')
    .orderBy('value','desc')
    .limit(100)
    .get()
    .then(function(snap){
      el.innerHTML='';
      var titleRow=document.createElement('div');
      titleRow.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border);';
      titleRow.innerHTML='<div style="font-size:13px;font-weight:800;color:var(--text);">'+rekState.exName+'</div><div style="font-size:10px;color:var(--muted);">'+rekState.exUnit+'</div>';
      el.appendChild(titleRow);
      if(snap.empty){
        el.innerHTML+='<div style="text-align:center;padding:30px 10px;"><div style="font-size:28px;margin-bottom:8px;">&#127942;</div><div style="font-size:12px;color:var(--muted);">Noch keine Einträge.<br>Sei der Erste!</div></div>';
        return;
      }
      var entries=[];
      snap.forEach(function(doc){entries.push(Object.assign({_id:doc.id},doc.data()));});
      if(rekState.regionKm<99999&&userLat&&userLng){
        entries=entries.filter(function(e){
          if(!e.lat||!e.lng)return false;
          return calcDist(userLat,userLng,e.lat,e.lng)<=rekState.regionKm*1000;
        });
      }
      if(entries.length===0){
        el.innerHTML+='<div style="text-align:center;padding:20px 10px;color:var(--muted);font-size:12px;">Keine Einträge in dieser Region.</div>';
        return;
      }
      var uid=firebase.auth().currentUser?firebase.auth().currentUser.uid:null;
      entries.forEach(function(d,i){
        var rank=i+1;
        var medal=rank===1?'&#129351;':rank===2?'&#129352;':rank===3?'&#129353;':'';
        var isMe=uid&&d.uid===uid;
        var row=document.createElement('div');
        row.style.cssText='display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--border);background:'+(isMe?'rgba(255,85,0,0.05)':'none')+';';
        var rankEl=document.createElement('div');
        rankEl.style.cssText='width:28px;text-align:center;flex-shrink:0;';
        rankEl.innerHTML=medal?'<span style="font-size:18px;">'+medal+'</span>':'<span style="font-size:11px;font-weight:700;color:var(--muted);">#'+rank+'</span>';
        var infoEl=document.createElement('div');
        infoEl.style.cssText='flex:1;min-width:0;';
        infoEl.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.name||'Anonym')+(isMe?' <span style="font-size:8px;color:var(--accent);border:1px solid var(--accent);border-radius:3px;padding:0 3px;">DU</span>':'')+' </div>'+
          '<div style="font-size:10px;color:var(--muted);">'+(d.location||'')+(d.parkName?' &#128205;'+d.parkName:'')+'</div>';
        var valEl=document.createElement('div');
        valEl.style.cssText='text-align:right;flex-shrink:0;';
        valEl.innerHTML='<div style="font-size:18px;font-weight:800;color:var(--accent);">'+d.value+'</div><div style="font-size:9px;color:var(--muted);">'+rekState.exUnit+'</div>';
        row.appendChild(rankEl);row.appendChild(infoEl);row.appendChild(valEl);
        if(d.videoUrl){
          var vBtn=document.createElement('button');
          vBtn.style.cssText='background:none;border:1px solid var(--border);border-radius:6px;padding:5px 7px;font-size:14px;cursor:pointer;flex-shrink:0;';
          vBtn.innerHTML='&#9654;';
          vBtn.onclick=function(){playVideo(d.videoUrl);};
          row.appendChild(vBtn);
        }
        el.appendChild(row);
      });
    })
    .catch(function(e){
      el.innerHTML='<div style="padding:16px;color:var(--muted);font-size:11px;">Fehler: '+e.message+'</div>';
    });
}
