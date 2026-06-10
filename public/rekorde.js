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
  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;';
  var parkBtn = document.createElement('button');
  parkBtn.style.cssText = 'background:var(--bg2);color:var(--text);border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 12px;cursor:pointer;';
  parkBtn.innerHTML = '&#128170; PARKS';
  parkBtn.onclick = function(){ openMyParksOverview(); };
  var subBtn = document.createElement('button');
  subBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 14px;cursor:pointer;letter-spacing:1px;';
  subBtn.textContent = '+ EINTRAG';
  subBtn.onclick = function(){ openRecordSubmit(null,null); };
  btnRow.appendChild(parkBtn); btnRow.appendChild(subBtn);
  hdr.appendChild(btnRow);
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
  rightCol.id = 'rek-right-col';
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
        var parkTxt = d.parkName ? '&#128170; '+d.parkName : (d.location ? '&#128205; '+d.location : '&#128205; Unbekannter Standort');
        infoEl.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.name||'Anonym')+(isMe?' <span style="font-size:8px;color:var(--accent);border:1px solid var(--accent);border-radius:3px;padding:0 3px;">DU</span>':'')+' </div>'+
          '<div style="font-size:10px;color:var(--muted);">'+parkTxt+'</div>';
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

// ── PARKS SEKTION IN REKORDE ───────────────────────────────
function buildRekParksSection(root){
  var sec = document.createElement('div');
  sec.id = 'rek-parks-section';
  sec.style.cssText = 'border-top:2px solid var(--accent);margin-top:0;';

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:14px 16px 10px;display:flex;align-items:center;justify-content:space-between;';
  hdr.innerHTML = '<div style="font-size:13px;font-weight:800;color:var(--accent);">&#128170; MEINE PARKS</div>';

  var allBtn = document.createElement('button');
  allBtn.style.cssText = 'background:none;border:1.5px solid var(--accent);color:var(--accent);border-radius:8px;font-family:inherit;font-size:10px;font-weight:700;padding:5px 10px;cursor:pointer;';
  allBtn.textContent = 'ALLE PARKS';
  allBtn.onclick = function(){ openAllMyParks(); };
  hdr.appendChild(allBtn);
  sec.appendChild(hdr);

  var listEl = document.createElement('div');
  listEl.style.cssText = 'padding:0 16px 16px;';
  listEl.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:12px 0;">&#9203; Lade deine Parks...</div>';
  sec.appendChild(listEl);

  // Insert after regWrap (region buttons), before map/list
  var mapEl2 = document.getElementById('rek-map');
  var rc = document.getElementById('rek-right-col');
  if(rc && mapEl2){
    rc.insertBefore(sec, mapEl2);
  } else if(rc){
    // insert before the list (last child)
    var children = rc.children;
    var insertBefore = null;
    for(var ci=0;ci<children.length;ci++){
      if(children[ci].style && children[ci].style.padding && children[ci].style.padding.indexOf('80px')!==-1){
        insertBefore = children[ci]; break;
      }
    }
    if(insertBefore) rc.insertBefore(sec, insertBefore);
    else rc.appendChild(sec);
  } else {
    root.appendChild(sec);
  }
  loadMyParks(listEl, 10);
}

function loadMyParks(el, limit){
  if(typeof db==='undefined'||!db||!firebase.auth().currentUser){
    el.innerHTML='<div style="padding:12px;color:var(--muted);font-size:13px;">Einloggen um deine Parks zu sehen.</div>'; return;
  }
  var uid = firebase.auth().currentUser.uid;
  el.innerHTML='<div style="padding:12px;color:var(--muted);font-size:12px;">&#9203; Lade...</div>';

  // Eigene Einträge in globalLeaderboard mit parkId != null
  db.collection('globalLeaderboard').where('uid','==',uid).limit(100).get()
    .then(function(snap){
      var parkMap = {};
      snap.forEach(function(doc){
        var d = doc.data();
        if(!d.parkId) return;
        if(!parkMap[d.parkId]){
          parkMap[d.parkId] = {parkId:d.parkId, parkName:d.parkName||'Calisthenics Park', count:0, lastDate:d.date||''};
        }
        parkMap[d.parkId].count++;
        if(d.date > parkMap[d.parkId].lastDate) parkMap[d.parkId].lastDate = d.date;
      });
      renderMyParks(el, Object.values(parkMap), limit);
    })
    .catch(function(e){ el.innerHTML='<div style="padding:12px;color:var(--muted);font-size:11px;">Fehler: '+e.message+'</div>'; });
}

function renderMyParks(el, myParks, limit){
  el.innerHTML = '';
  if(myParks.length===0){
    el.innerHTML='<div style="text-align:center;padding:20px;background:var(--bg2);border-radius:12px;"><div style="font-size:28px;margin-bottom:8px;">&#128170;</div><div style="font-size:13px;color:var(--muted);">Noch keine Park-Einträge.<br>Reiche einen Park-Rekord ein um hier zu erscheinen!</div></div>';
    return;
  }
  myParks.sort(function(a,b){ return b.count-a.count; });
  var shown = (limit && myParks.length>limit) ? myParks.slice(0,limit) : myParks;
  var topLabel = document.createElement('div');
  topLabel.style.cssText='font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:8px;';
  topLabel.textContent = shown.length<=3?'DEINE PARKS':'TOP '+shown.length+' PARKS';
  el.appendChild(topLabel);
  shown.forEach(function(p,i){
    var card=document.createElement('div');
    card.style.cssText='display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;margin-bottom:8px;background:var(--bg2);border:1px solid var(--border);cursor:pointer;';
    card.onmouseover=function(){this.style.borderColor='var(--accent)';};
    card.onmouseout=function(){this.style.borderColor='var(--border)';};
    var rankEl=document.createElement('div');
    rankEl.style.cssText='width:30px;height:30px;border-radius:50%;background:rgba(255,85,0,0.12);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--accent);flex-shrink:0;';
    rankEl.textContent='#'+(i+1);
    var infoEl=document.createElement('div');
    infoEl.style.cssText='flex:1;min-width:0;';
    infoEl.innerHTML='<div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
      '<div style="font-size:10px;color:var(--muted);">'+p.count+' Einträge</div>';
    var arrEl=document.createElement('div');
    arrEl.style.cssText='font-size:18px;color:var(--muted);flex-shrink:0;';
    arrEl.textContent='›';
    card.appendChild(rankEl); card.appendChild(infoEl); card.appendChild(arrEl);
    card.onclick=function(){ openParkLeaderboardById(p.parkId, p.parkName); };
    el.appendChild(card);
  });
  if(myParks.length>limit){
    var moreBtn=document.createElement('button');
    moreBtn.style.cssText='width:100%;background:none;border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:11px;cursor:pointer;color:var(--muted);margin-top:4px;';
    moreBtn.textContent='Alle '+myParks.length+' Parks anzeigen';
    moreBtn.onclick=function(){ openAllMyParks(); };
    el.appendChild(moreBtn);
  }
}

function openAllMyParks(){
  if(typeof db === 'undefined' || !db || !firebase.auth().currentUser) return;

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9950;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:16px;font-weight:800;color:var(--text);';
  titleEl.innerHTML = '&#128170; ALLE MEINE PARKS';
  topBar.appendChild(backBtn); topBar.appendChild(titleEl);
  ov.appendChild(topBar);

  var listEl = document.createElement('div');
  listEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
  listEl.innerHTML = '<div style="color:var(--muted);font-size:12px;">&#9203; Lade...</div>';
  ov.appendChild(listEl);

  document.body.appendChild(ov);
  loadMyParks(listEl, null);
}

function openParkLeaderboardById(parkId, parkName){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9960;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;min-width:0;';
  titleEl.innerHTML = '<div style="font-size:15px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">&#128170; '+parkName+'</div>'+
    '<div style="font-size:10px;color:var(--muted);">Park Bestenliste</div>';
  var subBtn = document.createElement('button');
  subBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:8px 12px;cursor:pointer;flex-shrink:0;';
  subBtn.innerHTML = '+ EINTRAG';
  subBtn.onclick = function(){ openRecordSubmit(parkId, parkName); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(subBtn);
  ov.appendChild(topBar);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
  ov.appendChild(content);

  document.body.appendChild(ov);

  // Baue Bestenliste direkt
  if(typeof buildParkDetailLeaderboard === 'function'){
    buildParkDetailLeaderboard(content, parkId, parkName);
  } else {
    content.innerHTML = '<div style="color:var(--muted);padding:20px;">Funktion nicht verfügbar.</div>';
  }
}

// ── PARKS SECTION IN REKORDE ───────────────────────────────

function loadMyParks(el){
  if(typeof db === 'undefined' || !db || !firebase.auth().currentUser){
    el.innerHTML = '<div style="padding:10px;color:var(--muted);font-size:12px;">Einloggen um deine Parks zu sehen.</div>';
    return;
  }
  var uid = firebase.auth().currentUser.uid;

  // Load from parkStats — parks where user has data
  db.collection('parkStats').get().then(function(snap){
    var myParks = [];
    var promises = [];

    // Check each park for user data
    snap.forEach(function(parkDoc){
      var p = promises.push(
        parkDoc.ref.collection('users').doc(uid).get().then(function(userDoc){
          if(userDoc.exists && userDoc.data().workoutCount > 0){
            myParks.push({
              parkId: parkDoc.id,
              parkName: userDoc.data().parkName || parkDoc.id,
              workoutCount: userDoc.data().workoutCount || 0,
              totalReps: userDoc.data().totalReps || 0,
              lastWorkout: userDoc.data().lastWorkout || '',
            });
          }
        })
      );
    });

    Promise.all(promises).then(function(){
      renderMyParks(el, myParks);
    });
  }).catch(function(){
    // Fallback: show parks from leaderboard entries
    db.collection('globalLeaderboard').where('uid','==',uid).get().then(function(snap){
      var parkMap = {};
      snap.forEach(function(doc){
        var d = doc.data();
        if(d.parkId && d.parkName){
          if(!parkMap[d.parkId]){ parkMap[d.parkId] = {parkId:d.parkId, parkName:d.parkName, workoutCount:0, totalReps:0}; }
          parkMap[d.parkId].workoutCount++;
          parkMap[d.parkId].totalReps += (d.value||0);
        }
      });
      renderMyParks(el, Object.values(parkMap));
    }).catch(function(){
      el.innerHTML = '<div style="padding:10px;color:var(--muted);font-size:12px;">Keine Park-Daten gefunden. Trainiere in einem Park und reiche einen Rekord ein!</div>';
    });
  });
}

function renderMyParks(el, parks){
  el.innerHTML = '';

  if(parks.length === 0){
    el.innerHTML = '<div style="text-align:center;padding:20px;"><div style="font-size:28px;margin-bottom:8px;">&#128170;</div><div style="font-size:12px;color:var(--muted);">Du hast noch in keinem Park trainiert.<br>Besuche einen Park und reiche einen Rekord ein!</div></div>';
    return;
  }

  // Sort by workout count
  parks.sort(function(a,b){ return b.workoutCount - a.workoutCount; });

  // Top 3
  var topLabel = document.createElement('div');
  topLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:8px;';
  topLabel.textContent = 'DEINE TOP PARKS';
  el.appendChild(topLabel);

  var top3 = parks.slice(0,3);
  top3.forEach(function(p, i){
    var card = document.createElement('div');
    card.style.cssText = 'display:flex;align-items:center;gap:10px;padding:12px;border-radius:12px;margin-bottom:8px;background:var(--bg2);border:1.5px solid var(--border);cursor:pointer;';
    var medal = i===0?'&#129351;':i===1?'&#129352;':'&#129353;';
    card.innerHTML =
      '<div style="font-size:20px;width:28px;text-align:center;">'+medal+'</div>'+
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
        '<div style="font-size:10px;color:var(--muted);">'+p.workoutCount+' Workouts · '+p.totalReps+' Wdh gesamt</div>'+
      '</div>'+
      '<div style="font-size:18px;color:var(--accent);">&#8250;</div>';
    card.onclick = (function(park){ return function(){ openParkLeaderboardById(park.parkId, park.parkName); }; })(p);
    el.appendChild(card);
  });

  // Top 10 list
  if(parks.length > 3){
    var moreLabel = document.createElement('div');
    moreLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin:14px 0 8px;';
    moreLabel.textContent = 'ALLE BESUCHTEN PARKS ('+parks.length+')';
    el.appendChild(moreLabel);

    parks.slice(3, 10).forEach(function(p){
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;';
      row.innerHTML =
        '<div style="font-size:20px;">&#128170;</div>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-size:12px;font-weight:600;color:var(--text);">'+p.parkName+'</div>'+
          '<div style="font-size:10px;color:var(--muted);">'+p.workoutCount+' Workouts</div>'+
        '</div>'+
        '<div style="font-size:16px;color:var(--accent);">&#8250;</div>';
      row.onclick = (function(park){ return function(){ openParkLeaderboardById(park.parkId, park.parkName); }; })(p);
      el.appendChild(row);
    });
  }
}

function showAllMyParks(){
  // Reload but show all 50
  var section = document.getElementById('rek-parks-section');
  if(!section) return;
  var body = section.querySelector('div[style*="padding:12px"]');
  if(!body) return;
  if(typeof db === 'undefined' || !db || !firebase.auth().currentUser) return;
  var uid = firebase.auth().currentUser.uid;
  db.collection('globalLeaderboard').where('uid','==',uid).get().then(function(snap){
    var parkMap = {};
    snap.forEach(function(doc){
      var d = doc.data();
      if(d.parkId && d.parkName){
        if(!parkMap[d.parkId]) parkMap[d.parkId] = {parkId:d.parkId, parkName:d.parkName, workoutCount:0, totalReps:0};
        parkMap[d.parkId].workoutCount++;
        parkMap[d.parkId].totalReps += (d.value||0);
      }
    });
    var parks = Object.values(parkMap);
    parks.sort(function(a,b){ return b.workoutCount-a.workoutCount; });
    body.innerHTML = '';
    if(parks.length===0){ body.innerHTML='<div style="padding:10px;color:var(--muted);font-size:12px;">Keine Parks gefunden.</div>'; return; }
    parks.forEach(function(p){
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;';
      row.innerHTML = '<div style="font-size:18px;">&#128170;</div><div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:600;color:var(--text);">'+p.parkName+'</div><div style="font-size:10px;color:var(--muted);">'+p.workoutCount+' Einträge</div></div><div style="font-size:16px;color:var(--accent);">&#8250;</div>';
      row.onclick = (function(park){ return function(){ openParkLeaderboardById(park.parkId, park.parkName); }; })(p);
      body.appendChild(row);
    });
  });
}

// Park-Bestenliste direkt per ID öffnen (ohne parksData)
function openParkLeaderboardById(parkId, parkName){
  var ex = document.getElementById('park-detail-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'park-detail-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9900;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;min-width:0;';
  titleEl.innerHTML = '<div style="font-size:15px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">&#128170; '+parkName+'</div>';
  var recBtn = document.createElement('button');
  recBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 12px;cursor:pointer;flex-shrink:0;';
  recBtn.innerHTML = '&#127942; REKORD';
  recBtn.onclick = function(){ openRecordSubmit(parkId, parkName); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(recBtn);
  ov.appendChild(topBar);

  // Bestenliste direkt
  var body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;padding:14px;';
  ov.appendChild(body);
  document.body.appendChild(ov);
  buildParkDetailLeaderboard(body, parkId, parkName);
}

// ── MEINE PARKS VOLLBILD ───────────────────────────────────
function openMyParksOverview(){
  var ex = document.getElementById('my-parks-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'my-parks-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9950;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;font-size:16px;font-weight:800;color:var(--text);';
  titleEl.innerHTML = '&#128170; PARK REKORDE';
  topBar.appendChild(backBtn); topBar.appendChild(titleEl);
  ov.appendChild(topBar);

  // Filter Tabs
  var filterBar = document.createElement('div');
  filterBar.style.cssText = 'display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid var(--border);flex-shrink:0;overflow-x:auto;scrollbar-width:none;';
  var filters = [
    {id:'mine',    label:'&#128170; Meine Parks'},
    {id:'top',     label:'&#127942; Meistbesucht'},
    {id:'rekorde', label:'&#127937; Meine Rekorde'},
    {id:'all',     label:'&#127758; Alle Parks'},
  ];
  var activeFilter = 'mine';
  var contentEl = document.createElement('div');
  contentEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';

  filters.forEach(function(f){
    var btn = document.createElement('button');
    btn.dataset.fid = f.id;
    var isActive = f.id === activeFilter;
    btn.style.cssText = 'flex-shrink:0;padding:7px 14px;border-radius:20px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'var(--accent)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;';
    btn.innerHTML = f.label;
    btn.onclick = function(){
      activeFilter = f.id;
      filterBar.querySelectorAll('button').forEach(function(b){
        var a = b.dataset.fid === activeFilter;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'var(--accent)':'none';
        b.style.color = a?'#fff':'var(--muted)';
      });
      loadParksFilter(contentEl, activeFilter);
    };
    filterBar.appendChild(btn);
  });
  ov.appendChild(filterBar);
  ov.appendChild(contentEl);
  document.body.appendChild(ov);
  loadParksFilter(contentEl, activeFilter);
}

function loadParksFilter(el, filter){
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:12px 0;">&#9203; Lade...</div>';
  if(typeof db==='undefined'||!db||!firebase.auth().currentUser){
    el.innerHTML='<div style="text-align:center;padding:40px;color:var(--muted);">Einloggen um Parks zu sehen.</div>'; return;
  }
  var uid = firebase.auth().currentUser.uid;

  if(filter === 'mine' || filter === 'rekorde'){
    // Eigene Einträge
    db.collection('globalLeaderboard').where('uid','==',uid).limit(200).get()
      .then(function(snap){
        var parkMap = {};
        snap.forEach(function(doc){
          var d = doc.data();
          var pid = d.parkId || null;
          if(!pid && filter === 'rekorde') pid = 'global';
          if(!pid) return;
          var pname = d.parkName || (d.location||'Unbekannter Standort');
          if(!parkMap[pid]) parkMap[pid]={parkId:pid, parkName:pname, count:0, myBest:{}, lastDate:''};
          parkMap[pid].count++;
          if(d.exerciseName){
            if(!parkMap[pid].myBest[d.exerciseName] || d.value > parkMap[pid].myBest[d.exerciseName]){
              parkMap[pid].myBest[d.exerciseName] = d.value;
            }
          }
          if(d.date > parkMap[pid].lastDate) parkMap[pid].lastDate = d.date;
        });
        var parks = Object.values(parkMap).sort(function(a,b){ return b.count-a.count; });
        renderParksOverview(el, parks, filter);
      }).catch(function(e){ el.innerHTML='<div style="padding:20px;color:var(--muted);">Fehler: '+e.message+'</div>'; });

  } else if(filter === 'top'){
    // Meistbesuchte Parks global — aus allen Einträgen
    db.collection('globalLeaderboard').where('status','==','approved').limit(500).get()
      .then(function(snap){
        var parkMap = {};
        snap.forEach(function(doc){
          var d = doc.data();
          if(!d.parkId) return;
          if(!parkMap[d.parkId]) parkMap[d.parkId]={parkId:d.parkId, parkName:d.parkName||'Park', count:0, users:{}};
          parkMap[d.parkId].count++;
          if(d.uid) parkMap[d.parkId].users[d.uid]=1;
        });
        var parks = Object.values(parkMap).sort(function(a,b){ return Object.keys(b.users).length - Object.keys(a.users).length; });
        renderParksOverview(el, parks, filter);
      }).catch(function(e){ el.innerHTML='<div style="padding:20px;color:var(--muted);">Fehler: '+e.message+'</div>'; });

  } else {
    // Alle Parks — aus Leaderboard
    db.collection('globalLeaderboard').limit(500).get()
      .then(function(snap){
        var parkMap = {};
        snap.forEach(function(doc){
          var d = doc.data();
          var pid = d.parkId || 'unbekannt';
          var pname = d.parkName || d.location || 'Unbekannter Standort';
          if(!parkMap[pid]) parkMap[pid]={parkId:pid, parkName:pname, count:0};
          parkMap[pid].count++;
        });
        var parks = Object.values(parkMap).sort(function(a,b){ return b.count-a.count; });
        renderParksOverview(el, parks, filter);
      }).catch(function(e){ el.innerHTML='<div style="padding:20px;color:var(--muted);">Fehler: '+e.message+'</div>'; });
  }
}

function renderParksOverview(el, parks, filter){
  el.innerHTML = '';
  if(parks.length === 0){
    el.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:40px;margin-bottom:12px;">&#128170;</div><div style="font-size:14px;color:var(--muted);">Keine Parks gefunden.</div></div>';
    return;
  }

  // Top 3
  var top3 = parks.slice(0,3);
  var topLabel = document.createElement('div');
  topLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:10px;';
  topLabel.textContent = filter==='mine'?'DEINE TOP PARKS':filter==='top'?'MEISTBESUCHTE PARKS':filter==='rekorde'?'DEINE REKORD-PARKS':'TOP PARKS';
  el.appendChild(topLabel);

  top3.forEach(function(p, i){
    var medals = ['&#129351;','&#129352;','&#129353;'];
    var card = document.createElement('div');
    card.style.cssText = 'display:flex;align-items:center;gap:14px;padding:16px;border-radius:14px;margin-bottom:10px;background:var(--bg2);border:1.5px solid var(--border);cursor:pointer;';
    card.onmouseover=function(){ this.style.borderColor='var(--accent)'; };
    card.onmouseout=function(){ this.style.borderColor='var(--border)'; };
    var sub = filter==='top' ? Object.keys(p.users||{}).length+' Athleten' : p.count+' Einträge';
    if(filter==='rekorde' && p.myBest){
      var bestEx = Object.keys(p.myBest).sort(function(a,b){ return p.myBest[b]-p.myBest[a]; })[0];
      if(bestEx) sub += ' · Best: '+bestEx+' '+p.myBest[bestEx];
    }
    card.innerHTML =
      '<div style="font-size:28px;flex-shrink:0;">'+medals[i]+'</div>'+
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:15px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
        '<div style="font-size:11px;color:var(--muted);margin-top:2px;">'+sub+'</div>'+
      '</div>'+
      '<div style="font-size:22px;color:var(--muted);">›</div>';
    card.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
    el.appendChild(card);
  });

  if(parks.length > 3){
    var restLabel = document.createElement('div');
    restLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin:16px 0 10px;';
    restLabel.textContent = 'WEITERE PARKS';
    el.appendChild(restLabel);

    parks.slice(3,13).forEach(function(p, i){
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;margin-bottom:8px;background:var(--bg2);border:1px solid var(--border);cursor:pointer;';
      row.onmouseover=function(){ this.style.borderColor='var(--accent)'; };
      row.onmouseout=function(){ this.style.borderColor='var(--border)'; };
      var sub2 = filter==='top' ? Object.keys(p.users||{}).length+' Athleten' : p.count+' Einträge';
      row.innerHTML =
        '<div style="width:30px;height:30px;border-radius:50%;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--accent);flex-shrink:0;">#'+(i+4)+'</div>'+
        '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
        '<div style="font-size:10px;color:var(--muted);">'+sub2+'</div></div>'+
        '<div style="font-size:18px;color:var(--muted);">›</div>';
      row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
      el.appendChild(row);
    });

    if(parks.length > 13){
      var moreBtn = document.createElement('button');
      moreBtn.style.cssText = 'width:100%;background:none;border:1.5px solid var(--border);border-radius:12px;font-family:inherit;font-size:13px;font-weight:700;padding:14px;cursor:pointer;color:var(--muted);margin-top:8px;';
      moreBtn.textContent = 'Alle '+parks.length+' Parks anzeigen';
      moreBtn.onclick = function(){
        moreBtn.remove();
        parks.slice(13).forEach(function(p, i){
          var row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;margin-bottom:8px;background:var(--bg2);border:1px solid var(--border);cursor:pointer;';
          row.onmouseover=function(){ this.style.borderColor='var(--accent)'; };
          row.onmouseout=function(){ this.style.borderColor='var(--border)'; };
          row.innerHTML = '<div style="width:28px;text-align:center;font-size:11px;font-weight:700;color:var(--muted);">#'+(i+14)+'</div>'+
            '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:700;color:var(--text);">'+p.parkName+'</div></div>'+
            '<div style="font-size:18px;color:var(--muted);">›</div>';
          row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
          el.appendChild(row);
        });
      };
      el.appendChild(moreBtn);
    }
  }
}

function loadMyParksOverview(el){
  el.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:12px 0;">&#9203; Lade deine Parks...</div>';

  if(typeof db==='undefined'||!db||!firebase.auth().currentUser){
    el.innerHTML='<div style="text-align:center;padding:40px;color:var(--muted);">Einloggen um deine Parks zu sehen.</div>'; return;
  }
  var uid = firebase.auth().currentUser.uid;

  db.collection('globalLeaderboard').where('uid','==',uid).limit(200).get()
    .then(function(snap){
      var parkMap = {};
      snap.forEach(function(doc){
        var d = doc.data();
        var pid = d.parkId || 'unbekannt';
        var pname = d.parkName || (d.location ? d.location : 'Unbekannter Standort');
        if(!parkMap[pid]){ parkMap[pid]={parkId:pid, parkName:pname, count:0, exercises:{}, lastDate:''}; }
        parkMap[pid].count++;
        if(d.exerciseName) parkMap[pid].exercises[d.exerciseName] = (parkMap[pid].exercises[d.exerciseName]||0)+1;
        if(d.date > parkMap[pid].lastDate) parkMap[pid].lastDate = d.date;
      });

      var parks = Object.values(parkMap).sort(function(a,b){ return b.count-a.count; });
      el.innerHTML = '';

      if(parks.length === 0){
        el.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:40px;margin-bottom:12px;">&#128170;</div><div style="font-size:14px;color:var(--muted);">Du hast noch keine Rekorde eingereicht.<br>Reiche deinen ersten Rekord ein!</div></div>';
        return;
      }

      // TOP 3
      var top3 = parks.slice(0,3);
      var top3Label = document.createElement('div');
      top3Label.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:10px;';
      top3Label.textContent = 'DEINE TOP PARKS';
      el.appendChild(top3Label);

      top3.forEach(function(p, i){
        var medals = ['&#129351;','&#129352;','&#129353;'];
        var card = document.createElement('div');
        card.style.cssText = 'display:flex;align-items:center;gap:14px;padding:16px;border-radius:14px;margin-bottom:10px;background:var(--bg2);border:1.5px solid var(--border);cursor:pointer;';
        card.onmouseover=function(){ this.style.borderColor='var(--accent)'; };
        card.onmouseout=function(){ this.style.borderColor='var(--border)'; };
        var topEx = Object.keys(p.exercises).sort(function(a,b){ return p.exercises[b]-p.exercises[a]; })[0] || '';
        card.innerHTML =
          '<div style="font-size:28px;flex-shrink:0;">'+medals[i]+'</div>'+
          '<div style="flex:1;min-width:0;">'+
            '<div style="font-size:15px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
            '<div style="font-size:11px;color:var(--muted);margin-top:2px;">'+p.count+' Einträge'+(topEx?' · Meist: '+topEx:'')+' </div>'+
          '</div>'+
          '<div style="font-size:22px;color:var(--muted);">›</div>';
        card.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
        el.appendChild(card);
      });

      if(parks.length > 3){
        // TOP 10 Rest
        var restLabel = document.createElement('div');
        restLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin:16px 0 10px;';
        restLabel.textContent = 'WEITERE PARKS';
        el.appendChild(restLabel);

        parks.slice(3, 10).forEach(function(p, i){
          var row = document.createElement('div');
          row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;margin-bottom:8px;background:var(--bg2);border:1px solid var(--border);cursor:pointer;';
          row.onmouseover=function(){ this.style.borderColor='var(--accent)'; };
          row.onmouseout=function(){ this.style.borderColor='var(--border)'; };
          var rankEl = document.createElement('div');
          rankEl.style.cssText = 'width:30px;height:30px;border-radius:50%;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--accent);flex-shrink:0;';
          rankEl.textContent = '#'+(i+4);
          var infoEl = document.createElement('div');
          infoEl.style.cssText = 'flex:1;min-width:0;';
          infoEl.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
            '<div style="font-size:10px;color:var(--muted);">'+p.count+' Einträge</div>';
          row.appendChild(rankEl); row.appendChild(infoEl);
          row.innerHTML += '<div style="font-size:18px;color:var(--muted);">›</div>';
          row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
          el.appendChild(row);
        });
      }

      // Alle Parks Button
      if(parks.length > 10){
        var allBtn = document.createElement('button');
        allBtn.style.cssText = 'width:100%;background:none;border:1.5px solid var(--border);border-radius:12px;font-family:inherit;font-size:13px;font-weight:700;padding:14px;cursor:pointer;color:var(--muted);margin-top:8px;';
        allBtn.textContent = 'Alle '+parks.length+' Parks anzeigen';
        allBtn.onclick = function(){
          allBtn.remove();
          parks.slice(10).forEach(function(p, i){
            var row = document.createElement('div');
            row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;margin-bottom:8px;background:var(--bg2);border:1px solid var(--border);cursor:pointer;';
            row.onmouseover=function(){ this.style.borderColor='var(--accent)'; };
            row.onmouseout=function(){ this.style.borderColor='var(--border)'; };
            row.innerHTML = '<div style="width:30px;height:30px;border-radius:50%;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:var(--accent);flex-shrink:0;">#'+(i+11)+'</div>'+
              '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:700;color:var(--text);">'+p.parkName+'</div><div style="font-size:10px;color:var(--muted);">'+p.count+' Einträge</div></div>'+
              '<div style="font-size:18px;color:var(--muted);">›</div>';
            row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
            el.appendChild(row);
          });
        };
        el.appendChild(allBtn);
      }
    })
    .catch(function(e){
      el.innerHTML='<div style="padding:20px;color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>';
    });
}
