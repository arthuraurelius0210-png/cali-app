// ══════════════════════════════════════════════════════════
// REKORDE.JS
// ══════════════════════════════════════════════════════════

var REK_CATS = [
  {id:'all',       label:'Alle',      icon:'&#127942;'},
  {id:'Pull',      label:'Pull',      icon:'&#11014;'},
  {id:'Push',      label:'Push',      icon:'&#128170;'},
  {id:'Core',      label:'Core',      icon:'&#128293;'},
  {id:'Legs',      label:'Legs',      icon:'&#129466;'},
  {id:'Skills',    label:'Skills',    icon:'&#11088;'},];

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

function rekChipStyle(active){
  return 'flex-shrink:0;padding:9px 14px;min-height:36px;border-radius:20px;border:1px solid '+(active?'var(--accent-deep)':'var(--border)')+';background:'+(active?'var(--accent-deep)':'none')+';color:'+(active?'#fff':'var(--muted)')+';font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;transition:transform var(--dur-fast) var(--ease-out),background-color var(--dur-fast) ease;';
}

// Einheitliche Listen-Row-Karte (Zeilen-Tier: Radius 16, Schatten statt Border)
function rekRowCard(){
  var d = document.createElement('div');
  d.className = 'pressable';
  d.setAttribute('role','button');
  d.tabIndex = 0;
  d.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 14px;border:none;border-radius:16px;margin-bottom:8px;background:#fff;box-shadow:0 8px 20px rgba(0,0,0,0.05);cursor:pointer;';
  d.onkeydown = function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); if(d.onclick) d.onclick(ev); } };
  return d;
}

function buildRekordeUI(){
  var root = document.getElementById('rek-root');
  if(!root) return;
  root.innerHTML = '';

  // ── HEADER ──────────────────────────────────────────────
  var hdr = document.createElement('div');
  hdr.style.cssText = 'margin:0 0 16px;';
  var pageTitle = document.createElement('h2');
  pageTitle.className = 'page-title';
  pageTitle.style.cssText = 'margin:0;';
  pageTitle.textContent = 'Rekorde';
  hdr.appendChild(pageTitle);
  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;';
  var parkBtn = document.createElement('button');
  parkBtn.className = 'btn-g';
  parkBtn.textContent = 'Parks';
  parkBtn.onclick = function(){ openMyParksOverview(); };
  var suggestExBtn2 = document.createElement('button');
  suggestExBtn2.className = 'btn-g';
  suggestExBtn2.textContent = '+ Übung';
  suggestExBtn2.onclick = function(){ openSuggestExercise(); };
  var subBtn = document.createElement('button');
  subBtn.className = 'pressable';
  subBtn.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:20px;font-family:inherit;font-size:13px;font-weight:700;padding:9px 16px;min-height:36px;cursor:pointer;box-shadow:0 12px 30px rgba(255,85,0,0.22);';
  subBtn.textContent = '+ Eintrag';
  subBtn.onclick = function(){ openRecordSubmit(null,null); };
  btnRow.appendChild(parkBtn); btnRow.appendChild(suggestExBtn2); btnRow.appendChild(subBtn);
  hdr.appendChild(btnRow);
  root.appendChild(hdr);

  // ── FILTER (Accordion — eingeklappt zeigt nur eine Zusammenfassung) ──
  var filterWrap = document.createElement('div');
  filterWrap.style.cssText = 'margin:0 0 16px;border:none;border-radius:20px;overflow:hidden;background:var(--bg2);box-shadow:0 12px 30px rgba(0,0,0,0.06);';

  var summaryBtn = document.createElement('button');
  summaryBtn.style.cssText = 'width:100%;display:flex;align-items:center;gap:8px;padding:14px 16px;min-height:44px;background:none;border:none;cursor:pointer;text-align:left;';
  summaryBtn.setAttribute('aria-expanded','false');
  var summaryText = document.createElement('div');
  summaryText.style.cssText = 'flex:1;min-width:0;font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  var summaryChevron = document.createElement('div');
  summaryChevron.style.cssText = 'font-size:11px;color:var(--muted);transition:transform var(--dur-med) var(--ease-out);flex-shrink:0;';
  summaryChevron.innerHTML = '&#9660;';
  summaryChevron.setAttribute('aria-hidden','true');
  summaryBtn.appendChild(summaryText); summaryBtn.appendChild(summaryChevron);

  // Accordion-Physik: .acc-body Grid-Sizer statt display:none-Snap
  var accWrap = document.createElement('div');
  accWrap.className = 'acc-body';
  var accClip = document.createElement('div');
  var filterPanel = document.createElement('div');
  filterPanel.style.cssText = 'padding:2px 16px 16px;border-top:1px solid var(--border);';
  accClip.appendChild(filterPanel);
  accWrap.appendChild(accClip);

  var panelOpen = false;
  summaryBtn.onclick = function(){
    panelOpen = !panelOpen;
    accWrap.classList.toggle('open', panelOpen);
    summaryBtn.setAttribute('aria-expanded', panelOpen ? 'true' : 'false');
    summaryChevron.style.transform = panelOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  };

  function updateSummary(){
    var catObj = REK_CATS.find(function(c){ return c.id===rekState.cat; });
    var regObj = REK_REGIONS.find(function(r){ return r.km===rekState.regionKm; }) || REK_REGIONS[REK_REGIONS.length-1];
    summaryText.innerHTML = (catObj?catObj.icon+' '+catObj.label:'Alle')+' &middot; '+(rekState.exName||'Übung wählen')+' &middot; '+regObj.label;
  }

  // Kategorie-Chips
  var catLabel = document.createElement('h2');
  catLabel.className = 'stitle';
  catLabel.style.cssText = 'margin:14px 0 8px;';
  catLabel.textContent = 'Kategorie';
  var catRow = document.createElement('div');
  catRow.style.cssText = 'display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-bottom:16px;';
  REK_CATS.forEach(function(cat){
    var btn = document.createElement('button');
    btn.className = 'pressable';
    btn.dataset.catId = cat.id;
    btn.style.cssText = rekChipStyle(cat.id===rekState.cat);
    btn.innerHTML = cat.icon+' '+cat.label;
    btn.onclick = function(){
      rekState.cat = cat.id;
      rekState.exId = null;
      catRow.querySelectorAll('button').forEach(function(b){
        b.style.cssText = rekChipStyle(b.dataset.catId===rekState.cat);
      });
      rebuildExList();
    };
    catRow.appendChild(btn);
  });

  // Übungs-Liste
  var exLabel = document.createElement('h2');
  exLabel.className = 'stitle';
  exLabel.style.cssText = 'margin:0 0 8px;';
  exLabel.textContent = 'Übung';
  var exListWrap = document.createElement('div');
  exListWrap.style.cssText = 'border:1px solid var(--border);border-radius:10px;background:var(--bg2);max-height:220px;overflow-y:auto;margin-bottom:16px;';
  exListWrap.classList.add('sheet-scroll');

  function rebuildExList(){
    exListWrap.innerHTML = '';
    var allEx = getRekExercises();
    allEx.forEach(function(ex){
      var btn = document.createElement('button');
      btn.dataset.exId = ex.id;
      var isActive = ex.id === rekState.exId;
      btn.style.cssText = 'width:100%;padding:10px 12px;border:none;border-bottom:1px solid var(--border);background:'+(isActive?'rgba(255,85,0,0.08)':'none')+';color:'+(isActive?'var(--accent-ink)':'var(--text)')+';font-family:inherit;font-size:13px;font-weight:'+(isActive?'700':'400')+';cursor:pointer;text-align:left;display:flex;align-items:center;justify-content:space-between;';
      btn.innerHTML = '<span>'+ex.name+'</span><span style="font-size:11px;color:var(--muted);">'+ex.unit+'</span>';
      btn.onclick = function(){
        rekState.exId = ex.id;
        rekState.exName = ex.name;
        rekState.exUnit = ex.unit;
        exListWrap.querySelectorAll('button').forEach(function(b){
          var a = b.dataset.exId === rekState.exId;
          b.style.background = a?'rgba(255,85,0,0.08)':'none';
          b.style.color = a?'var(--accent-ink)':'var(--text)';
          b.style.fontWeight = a?'700':'400';
        });
        updateSummary();
        loadRekList(listEl);
      };
      exListWrap.appendChild(btn);
    });
    if(exListWrap.lastChild) exListWrap.lastChild.style.borderBottom = 'none';

    // Auto-select erste Übung wenn keine gewählt ist
    if(!rekState.exId && allEx.length > 0){
      rekState.exId = allEx[0].id;
      rekState.exName = allEx[0].name;
      rekState.exUnit = allEx[0].unit;
      var firstBtn = exListWrap.querySelector('button');
      if(firstBtn){
        firstBtn.style.background = 'rgba(255,85,0,0.08)';
        firstBtn.style.color = 'var(--accent-ink)';
        firstBtn.style.fontWeight = '700';
      }
    }
    updateSummary();
    loadRekList(listEl);
  }

  // Region-Chips
  var regLabel = document.createElement('h2');
  regLabel.className = 'stitle';
  regLabel.style.cssText = 'margin:0 0 8px;';
  regLabel.textContent = 'Region';
  var regRow = document.createElement('div');
  regRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;';
  REK_REGIONS.forEach(function(opt){
    var btn = document.createElement('button');
    btn.className = 'pressable';
    btn.dataset.km = opt.km;
    btn.style.cssText = rekChipStyle(opt.km===rekState.regionKm);
    btn.textContent = opt.label;
    btn.onclick = function(){
      rekState.regionKm = opt.km;
      regRow.querySelectorAll('button').forEach(function(b){
        b.style.cssText = rekChipStyle(parseInt(b.dataset.km,10)===rekState.regionKm);
      });
      updateSummary();
      loadRekList(listEl);
    };
    regRow.appendChild(btn);
  });

  var doneBtn = document.createElement('button');
  doneBtn.className = 'pressable';
  doneBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:12px;min-height:44px;cursor:pointer;';
  doneBtn.textContent = 'Fertig';
  doneBtn.onclick = function(){ summaryBtn.click(); };

  filterPanel.appendChild(catLabel); filterPanel.appendChild(catRow);
  filterPanel.appendChild(exLabel); filterPanel.appendChild(exListWrap);
  filterPanel.appendChild(regLabel); filterPanel.appendChild(regRow);
  filterPanel.appendChild(doneBtn);

  filterWrap.appendChild(summaryBtn);
  filterWrap.appendChild(accWrap);
  root.appendChild(filterWrap);

  // ── BESTENLISTE (volle Breite) ───────────────────────────
  var listEl = document.createElement('div');
  listEl.style.cssText = 'padding:0 0 40px;';
  root.appendChild(listEl);

  rebuildExList();
}


function getRekExercises(catOverride){
  var cat = catOverride || rekState.cat;
  var result=[], seen={};
  if(typeof EX_DB!=='undefined'){
    EX_DB.forEach(function(ex,i){
      if(cat==='all'||ex.cat===cat){
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
  if(cat==='all'||cat==='Skills'){
    extras.forEach(function(s){
      var k=s.name+'|'+s.unit;
      if(!seen[k]){seen[k]=1;result.push(s);}
    });
  }
  return result;
}

function loadRekList(el){
  if(!rekState.exId){el.innerHTML='<div style="padding:20px;color:var(--muted);font-size:13px;">Übung wählen</div>';return;}
  el.innerHTML='<div style="padding:16px;color:var(--muted);font-size:13px;">&#9203; Lade...</div>';
  if(typeof db==='undefined'||!db){el.innerHTML='<div style="padding:20px;color:var(--muted);">Einloggen um Rekorde zu sehen.</div>';return;}
  var hasLoc=(typeof userLat!=='undefined')&&!!userLat&&(typeof userLng!=='undefined')&&!!userLng;
  db.collection('globalLeaderboard')
    .where('exercise','==',rekState.exId)
    .where('status','==','approved')
    .orderBy('value','desc')
    .limit(100)
    .get()
    .then(function(snap){
      el.innerHTML='';
      // Regionaler Filter ohne Standort: ehrlich hinweisen statt still weltweit zu zeigen
      if(rekState.regionKm<99999&&!hasLoc){
        var notice=document.createElement('div');
        notice.style.cssText='display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;margin-bottom:12px;background:#fff;box-shadow:0 8px 20px rgba(0,0,0,0.05);';
        var noticeTxt=document.createElement('div');
        noticeTxt.style.cssText='flex:1;min-width:0;font-size:13px;color:var(--muted);line-height:1.5;';
        noticeTxt.textContent='Standort nötig für regionale Filter — es werden weltweite Einträge gezeigt.';
        var locBtn=document.createElement('button');
        locBtn.className='pressable';
        locBtn.style.cssText='flex-shrink:0;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:9px 14px;min-height:36px;cursor:pointer;';
        locBtn.textContent='Standort aktivieren';
        locBtn.onclick=function(){
          if(!navigator.geolocation){noticeTxt.textContent='Geolocation wird nicht unterstützt.';return;}
          locBtn.disabled=true;locBtn.textContent='Wird ermittelt…';
          navigator.geolocation.getCurrentPosition(function(pos){
            userLat=pos.coords.latitude;userLng=pos.coords.longitude;
            loadRekList(el);
          },function(){
            locBtn.disabled=false;locBtn.textContent='Standort aktivieren';
            noticeTxt.textContent='Standort konnte nicht ermittelt werden. Bitte Berechtigung erlauben.';
          },{enableHighAccuracy:true,timeout:10000});
        };
        notice.appendChild(noticeTxt);notice.appendChild(locBtn);
        el.appendChild(notice);
      }
      var titleRow=document.createElement('div');
      titleRow.style.cssText='display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border);';
      titleRow.innerHTML='<div style="font-size:15px;font-weight:700;color:var(--text);">'+rekState.exName+'</div><div style="font-size:11px;color:var(--muted);">'+rekState.exUnit+'</div>';
      el.appendChild(titleRow);
      if(snap.empty){
        var emptyEl=document.createElement('div');
        emptyEl.style.cssText='text-align:center;padding:30px 10px;';
        emptyEl.innerHTML='<div style="font-size:28px;margin-bottom:8px;">&#127942;</div><div style="font-size:13px;color:var(--muted);">Noch keine Einträge.<br>Sei der Erste!</div>';
        el.appendChild(emptyEl);
        return;
      }
      var entries=[];
      snap.forEach(function(doc){entries.push(Object.assign({_id:doc.id},doc.data()));});
      if(rekState.regionKm<99999&&hasLoc){
        entries=entries.filter(function(e){
          if(!e.lat||!e.lng)return true; // Einträge ohne Standort behalten (werden markiert)
          return calcDist(userLat,userLng,e.lat,e.lng)<=rekState.regionKm*1000;
        });
      }
      if(entries.length===0){
        var emptyReg=document.createElement('div');
        emptyReg.style.cssText='text-align:center;padding:20px 10px;color:var(--muted);font-size:13px;';
        emptyReg.textContent='Keine Einträge in dieser Region.';
        el.appendChild(emptyReg);
        return;
      }
      var uid=firebase.auth().currentUser?firebase.auth().currentUser.uid:null;
      var frag=document.createDocumentFragment();
      entries.forEach(function(d,i){
        var rank=i+1;
        var medal=rank===1?'&#129351;':rank===2?'&#129352;':rank===3?'&#129353;':'';
        var isMe=uid&&d.uid===uid;
        var row=document.createElement('div');
        row.style.cssText='display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;margin-bottom:8px;background:'+(isMe?'rgba(255,85,0,0.08)':'#fff')+';box-shadow:0 8px 20px rgba(0,0,0,0.05);content-visibility:auto;contain-intrinsic-size:auto 64px;';
        var rankEl=document.createElement('div');
        rankEl.style.cssText='width:28px;text-align:center;flex-shrink:0;';
        rankEl.innerHTML=medal?'<span style="font-size:18px;">'+medal+'</span>':'<span class="num" style="font-weight:800;font-size:15px;color:var(--muted);">#'+rank+'</span>';
        var infoEl=document.createElement('div');
        infoEl.style.cssText='flex:1;min-width:0;';
        var parkTxt = d.parkName ? '&#128170; '+d.parkName : (d.location ? '&#128205; '+d.location : '&#128205; Unbekannter Standort');
        if(rekState.regionKm<99999&&hasLoc&&(!d.lat||!d.lng)) parkTxt += ' &middot; ohne Standort';
        infoEl.innerHTML='<div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.name||'Anonym')+(isMe?' <span style="font-size:11px;font-weight:700;color:var(--accent-ink);background:rgba(255,85,0,0.12);border-radius:20px;padding:1px 8px;">Du</span>':'')+' </div>'+
          '<div style="font-size:11px;color:var(--muted);">'+parkTxt+'</div>';
        var valEl=document.createElement('div');
        valEl.style.cssText='text-align:right;flex-shrink:0;';
        valEl.innerHTML='<div class="num" style="font-weight:800;font-size:22px;color:var(--accent);line-height:1;">'+d.value+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">'+rekState.exUnit+'</div>';
        var vNum=Number(d.value);
        if(window.caliMotion&&i<8&&isFinite(vNum)&&vNum===Math.round(vNum)){
          caliMotion.countUp(valEl.firstChild,vNum,{duration:600});
        }
        row.appendChild(rankEl);row.appendChild(infoEl);row.appendChild(valEl);
        if(d.videoUrl){
          var vBtn=document.createElement('button');
          vBtn.style.cssText='background:none;border:1px solid var(--border);border-radius:10px;padding:8px 10px;min-height:36px;min-width:36px;font-size:14px;cursor:pointer;flex-shrink:0;transition:transform var(--dur-fast) var(--ease-out);';
          vBtn.classList.add('pressable');
          vBtn.innerHTML='&#9654;';
          vBtn.setAttribute('aria-label','Video abspielen');
          vBtn.onclick=function(){playVideo(d.videoUrl);};
          row.appendChild(vBtn);
        }
        frag.appendChild(row);
      });
      el.appendChild(frag);
      if(window.caliMotion) caliMotion.stagger(el);
    })
    .catch(function(e){
      el.innerHTML='<div style="padding:16px;color:var(--muted);font-size:13px;">Fehler: '+e.message+'</div>';
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
  hdr.innerHTML = '<div style="font-size:13px;font-weight:800;color:var(--accent-ink);">&#128170; Meine Parks</div>';

  var allBtn = document.createElement('button');
  allBtn.style.cssText = 'background:none;border:1.5px solid var(--accent);color:var(--accent-ink);border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:5px 10px;cursor:pointer;';
  allBtn.textContent = 'Alle Parks';
  allBtn.onclick = function(){ openAllMyParks(); };
  hdr.appendChild(allBtn);
  sec.appendChild(hdr);

  var listEl = document.createElement('div');
  listEl.style.cssText = 'padding:0 16px 16px;';
  listEl.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:12px 0;">&#9203; Lade deine Parks...</div>';
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
  loadMyParks(listEl);
}

function openAllMyParks(){
  if(typeof db === 'undefined' || !db || !firebase.auth().currentUser) return;

  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:17px;font-weight:700;color:var(--text);';
  titleEl.textContent = 'Alle meine Parks';
  topBar.appendChild(backBtn); topBar.appendChild(titleEl);
  ov.appendChild(topBar);

  var listEl = document.createElement('div');
  listEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px 20px;';
  listEl.classList.add('sheet-scroll');
  listEl.innerHTML = '<div style="color:var(--muted);font-size:13px;">&#9203; Lade...</div>';
  ov.appendChild(listEl);

  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);
  loadMyParks(listEl);
}

// ── PARKS SECTION IN REKORDE ───────────────────────────────

function loadMyParks(el){
  if(typeof db === 'undefined' || !db || !firebase.auth().currentUser){
    el.innerHTML = '<div style="padding:10px;color:var(--muted);font-size:13px;">Einloggen um deine Parks zu sehen.</div>';
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
      el.innerHTML = '<div style="padding:10px;color:var(--muted);font-size:13px;">Keine Park-Daten gefunden. Trainiere in einem Park und reiche einen Rekord ein!</div>';
    });
  });
}

function renderMyParks(el, parks){
  el.innerHTML = '';

  if(parks.length === 0){
    el.innerHTML = '<div style="text-align:center;padding:20px;"><div style="font-size:28px;margin-bottom:8px;">&#128170;</div><div style="font-size:13px;color:var(--muted);">Du hast noch in keinem Park trainiert.<br>Besuche einen Park und reiche einen Rekord ein!</div></div>';
    return;
  }

  // Sort by workout count
  parks.sort(function(a,b){ return b.workoutCount - a.workoutCount; });

  // Top 3
  var topLabel = document.createElement('h2');
  topLabel.className = 'stitle';
  topLabel.style.cssText = 'margin:0 0 8px;';
  topLabel.textContent = 'Deine Top-Parks';
  el.appendChild(topLabel);

  var top3 = parks.slice(0,3);
  top3.forEach(function(p, i){
    var card = rekRowCard();
    var medal = i===0?'&#129351;':i===1?'&#129352;':'&#129353;';
    card.innerHTML =
      '<div style="font-size:20px;width:28px;text-align:center;">'+medal+'</div>'+
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
        '<div style="font-size:11px;color:var(--muted);">'+p.workoutCount+' Workouts · '+p.totalReps+' Wdh. gesamt</div>'+
      '</div>'+
      '<div style="font-size:18px;color:var(--muted);" aria-hidden="true">&#8250;</div>';
    card.onclick = (function(park){ return function(){ openParkLeaderboardById(park.parkId, park.parkName); }; })(p);
    el.appendChild(card);
  });

  // Top 10 list
  if(parks.length > 3){
    var moreLabel = document.createElement('h2');
    moreLabel.className = 'stitle';
    moreLabel.style.cssText = 'margin:14px 0 8px;';
    moreLabel.textContent = 'Alle besuchten Parks ('+parks.length+')';
    el.appendChild(moreLabel);

    parks.slice(3, 10).forEach(function(p){
      var row = rekRowCard();
      row.innerHTML =
        '<div style="font-size:20px;">&#128170;</div>'+
        '<div style="flex:1;min-width:0;">'+
          '<div style="font-size:13px;font-weight:600;color:var(--text);">'+p.parkName+'</div>'+
          '<div style="font-size:11px;color:var(--muted);">'+p.workoutCount+' Workouts</div>'+
        '</div>'+
        '<div style="font-size:16px;color:var(--muted);" aria-hidden="true">&#8250;</div>';
      row.onclick = (function(park){ return function(){ openParkLeaderboardById(park.parkId, park.parkName); }; })(p);
      el.appendChild(row);
    });
  }
  if(window.caliMotion) caliMotion.stagger(el);
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
    if(parks.length===0){ body.innerHTML='<div style="padding:10px;color:var(--muted);font-size:13px;">Keine Parks gefunden.</div>'; return; }
    parks.forEach(function(p){
      var row = document.createElement('div');
      row.className = 'pressable';
      row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:12px 14px;border:none;border-radius:16px;margin-bottom:8px;background:#fff;box-shadow:0 8px 20px rgba(0,0,0,0.05);cursor:pointer;';
      row.innerHTML = '<div style="font-size:18px;">&#128170;</div><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:700;color:var(--text);">'+p.parkName+'</div><div style="font-size:11px;color:var(--muted);">'+p.workoutCount+' Einträge</div></div><div style="font-size:16px;color:var(--accent-ink);" aria-hidden="true">&#8250;</div>';
      row.onclick = (function(park){ return function(){ openParkLeaderboardById(park.parkId, park.parkName); }; })(p);
      body.appendChild(row);
    });
  });
}

// Park-Bestenliste direkt per ID öffnen (ohne parksData)
function openParkLeaderboardById(parkId, parkName){
  // Eigene Overlay-Id (nicht 'park-detail-ov' aus parks.js — sonst reißt das Aufräumen
  // hier den dort per overlayPush registrierten History-Eintrag mit)
  var ex = document.getElementById('park-lb-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'park-lb-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;min-width:0;';
  titleEl.innerHTML = '<div style="font-size:17px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">&#128170; '+parkName+'</div>';
  var recBtn = document.createElement('button');
  recBtn.className = 'pressable';
  recBtn.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:20px;font-family:inherit;font-size:13px;font-weight:700;padding:9px 16px;min-height:36px;cursor:pointer;flex-shrink:0;box-shadow:0 12px 30px rgba(255,85,0,0.22);';
  recBtn.textContent = '+ Eintrag';
  recBtn.onclick = function(){ openRecordSubmit(parkId, parkName); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(recBtn);
  ov.appendChild(topBar);

  // Bestenliste direkt
  var body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;padding:16px 20px;';
  body.classList.add('sheet-scroll');
  ov.appendChild(body);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);
  buildParkDetailLeaderboard(body, parkId, parkName);
}

// ── MEINE PARKS VOLLBILD ───────────────────────────────────
function openMyParksOverview(){
  var ex = document.getElementById('my-parks-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'my-parks-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;font-size:17px;font-weight:700;color:var(--text);';
  titleEl.textContent = 'Park-Rekorde';
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
  contentEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px 20px;';

  contentEl.classList.add('sheet-scroll');

  filters.forEach(function(f){
    var btn = document.createElement('button');
    btn.className = 'pressable';
    btn.dataset.fid = f.id;
    var isActive = f.id === activeFilter;
    btn.style.cssText = rekChipStyle(isActive);
    btn.innerHTML = f.label;
    btn.onclick = function(){
      activeFilter = f.id;
      filterBar.querySelectorAll('button').forEach(function(b){
        b.style.cssText = rekChipStyle(b.dataset.fid === activeFilter);
      });
      loadParksFilter(contentEl, activeFilter);
    };
    filterBar.appendChild(btn);
  });
  ov.appendChild(filterBar);
  ov.appendChild(contentEl);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function') overlayPush(ov);
  if(window.caliMotion) caliMotion.overlayIn(ov);
  loadParksFilter(contentEl, activeFilter);
}

function loadParksFilter(el, filter){
  el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:12px 0;">&#9203; Lade...</div>';
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
    el.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:40px;margin-bottom:12px;">&#128170;</div><div style="font-size:15px;color:var(--muted);">Keine Parks gefunden.</div></div>';
    return;
  }

  // Top 3
  var top3 = parks.slice(0,3);
  var topLabel = document.createElement('h2');
  topLabel.className = 'stitle';
  topLabel.style.cssText = 'margin:0 0 10px;';
  topLabel.textContent = filter==='mine'?'Deine Top-Parks':filter==='top'?'Meistbesuchte Parks':filter==='rekorde'?'Deine Rekord-Parks':'Top-Parks';
  el.appendChild(topLabel);

  top3.forEach(function(p, i){
    var medals = ['&#129351;','&#129352;','&#129353;'];
    var card = document.createElement('div');
    card.className = 'pressable';
    card.setAttribute('role','button');
    card.tabIndex = 0;
    card.style.cssText = 'display:flex;align-items:center;gap:14px;padding:16px;border-radius:20px;margin-bottom:10px;background:#fff;box-shadow:0 12px 30px rgba(0,0,0,0.06);cursor:pointer;';
    card.onkeydown = function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); if(card.onclick) card.onclick(ev); } };
    var sub = filter==='top' ? Object.keys(p.users||{}).length+' Athleten' : p.count+' Einträge';
    if(filter==='rekorde' && p.myBest){
      var bestEx = Object.keys(p.myBest).sort(function(a,b){ return p.myBest[b]-p.myBest[a]; })[0];
      if(bestEx) sub += ' · Best: '+bestEx+' '+p.myBest[bestEx];
    }
    card.innerHTML =
      '<div style="font-size:28px;flex-shrink:0;">'+medals[i]+'</div>'+
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:15px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
        '<div style="font-size:11px;color:var(--muted);margin-top:2px;">'+sub+'</div>'+
      '</div>'+
      '<div style="font-size:22px;color:var(--muted);" aria-hidden="true">›</div>';
    card.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
    el.appendChild(card);
  });

  if(parks.length > 3){
    var restLabel = document.createElement('h2');
    restLabel.className = 'stitle';
    restLabel.style.cssText = 'margin:16px 0 10px;';
    restLabel.textContent = 'Weitere Parks';
    el.appendChild(restLabel);

    parks.slice(3,13).forEach(function(p, i){
      var row = rekRowCard();
      var sub2 = filter==='top' ? Object.keys(p.users||{}).length+' Athleten' : p.count+' Einträge';
      row.innerHTML =
        '<div class="num" style="width:30px;height:30px;border-radius:50%;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:var(--accent-ink);flex-shrink:0;">#'+(i+4)+'</div>'+
        '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
        '<div style="font-size:11px;color:var(--muted);">'+sub2+'</div></div>'+
        '<div style="font-size:18px;color:var(--muted);" aria-hidden="true">›</div>';
      row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
      el.appendChild(row);
    });

    if(parks.length > 13){
      var moreBtn = document.createElement('button');
      moreBtn.className = 'pressable';
      moreBtn.style.cssText = 'width:100%;background:none;border:1px solid var(--border);border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:14px;min-height:44px;cursor:pointer;color:var(--muted);margin-top:8px;';
      moreBtn.textContent = 'Alle '+parks.length+' Parks anzeigen';
      moreBtn.onclick = function(){
        moreBtn.remove();
        var frag = document.createDocumentFragment();
        parks.slice(13).forEach(function(p, i){
          var row = rekRowCard();
          row.innerHTML = '<div class="num" style="width:28px;text-align:center;font-size:11px;font-weight:700;color:var(--muted);">#'+(i+14)+'</div>'+
            '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:700;color:var(--text);">'+p.parkName+'</div></div>'+
            '<div style="font-size:18px;color:var(--muted);" aria-hidden="true">›</div>';
          row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
          frag.appendChild(row);
        });
        el.appendChild(frag);
      };
      el.appendChild(moreBtn);
    }
  }
  if(window.caliMotion) caliMotion.stagger(el);
}

function loadMyParksOverview(el){
  el.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:12px 0;">&#9203; Lade deine Parks...</div>';

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
        el.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:40px;margin-bottom:12px;">&#128170;</div><div style="font-size:15px;color:var(--muted);">Du hast noch keine Rekorde eingereicht.<br>Reiche deinen ersten Rekord ein!</div></div>';
        return;
      }

      // TOP 3
      var top3 = parks.slice(0,3);
      var top3Label = document.createElement('div');
      top3Label.className = 'stitle';
      top3Label.style.cssText = 'margin:0 0 10px;';
      top3Label.textContent = 'Deine Top-Parks';
      el.appendChild(top3Label);

      top3.forEach(function(p, i){
        var medals = ['&#129351;','&#129352;','&#129353;'];
        var card = document.createElement('div');
        card.className = 'pressable';
        card.style.cssText = 'display:flex;align-items:center;gap:14px;padding:16px;border:none;border-radius:20px;margin-bottom:10px;background:#fff;box-shadow:0 12px 30px rgba(0,0,0,0.06);cursor:pointer;';
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
        restLabel.className = 'stitle';
        restLabel.style.cssText = 'margin:16px 0 10px;';
        restLabel.textContent = 'Weitere Parks';
        el.appendChild(restLabel);

        parks.slice(3, 10).forEach(function(p, i){
          var row = document.createElement('div');
          row.className = 'pressable';
          row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 14px;border:none;border-radius:16px;margin-bottom:8px;background:#fff;box-shadow:0 8px 20px rgba(0,0,0,0.05);cursor:pointer;';
          var rankEl = document.createElement('div');
          rankEl.style.cssText = 'width:30px;height:30px;border-radius:50%;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;font-family:inherit;font-weight:800;font-size:14px;color:var(--accent-ink);flex-shrink:0;';
          rankEl.textContent = '#'+(i+4);
          var infoEl = document.createElement('div');
          infoEl.style.cssText = 'flex:1;min-width:0;';
          infoEl.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.parkName+'</div>'+
            '<div style="font-size:11px;color:var(--muted);">'+p.count+' Einträge</div>';
          row.appendChild(rankEl); row.appendChild(infoEl);
          var chev = document.createElement('div');
          chev.style.cssText = 'font-size:18px;color:var(--muted);';
          chev.setAttribute('aria-hidden','true');
          chev.textContent = '›';
          row.appendChild(chev);
          row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
          el.appendChild(row);
        });
      }

      // Alle Parks Button
      if(parks.length > 10){
        var allBtn = document.createElement('button');
        allBtn.className = 'pressable';
        allBtn.style.cssText = 'width:100%;background:none;border:1px solid var(--border);border-radius:16px;font-family:inherit;font-size:13px;font-weight:700;padding:14px;min-height:44px;cursor:pointer;color:var(--muted);margin-top:8px;';
        allBtn.textContent = 'Alle '+parks.length+' Parks anzeigen';
        allBtn.onclick = function(){
          allBtn.remove();
          parks.slice(10).forEach(function(p, i){
            var row = document.createElement('div');
            row.className = 'pressable';
            row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px 14px;border:none;border-radius:16px;margin-bottom:8px;background:#fff;box-shadow:0 8px 20px rgba(0,0,0,0.05);cursor:pointer;';
            row.innerHTML = '<div style="width:30px;height:30px;border-radius:50%;background:rgba(255,85,0,0.1);display:flex;align-items:center;justify-content:center;font-family:inherit;font-weight:800;font-size:14px;color:var(--accent-ink);flex-shrink:0;">#'+(i+11)+'</div>'+
              '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:700;color:var(--text);">'+p.parkName+'</div><div style="font-size:11px;color:var(--muted);">'+p.count+' Einträge</div></div>'+
              '<div style="font-size:18px;color:var(--muted);">›</div>';
            row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
            el.appendChild(row);
          });
        };
        el.appendChild(allBtn);
      }
    })
    .catch(function(e){
      el.innerHTML='<div style="padding:20px;color:var(--muted);font-size:13px;">Fehler: '+e.message+'</div>';
    });
}

// ── ÜBUNG VORSCHLAGEN ─────────────────────────────────────
function openSuggestExercise(){
  if(!firebase.auth().currentUser){ alert('Bitte einloggen!'); return; }
  var ex = document.getElementById('suggest-ex-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'suggest-ex-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';
  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 40px;';
  box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 16px;"></div>'+
    '<div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:4px;">Übung vorschlagen</div>'+
    '<div style="font-size:13px;color:var(--muted);margin-bottom:20px;">Fehlt eine Übung? Schlag sie vor!</div>';

  var nameInput = document.createElement('input');
  nameInput.type = 'text'; nameInput.placeholder = 'Übungsname (z.B. Typewriter Pull-Up)';
  nameInput.style.cssText = 'width:100%;padding:11px 14px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:#fff;color:var(--text);margin-bottom:10px;box-sizing:border-box;';

  // Kategorie
  var catSelect = document.createElement('select');
  catSelect.style.cssText = 'width:100%;padding:11px 14px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:#fff;color:var(--text);margin-bottom:10px;box-sizing:border-box;';
  ['Pull','Push','Core','Legs','Skills'].forEach(function(c){
    var opt = document.createElement('option'); opt.value=c; opt.textContent=c;
    catSelect.appendChild(opt);
  });

  var unitSelect = document.createElement('select');
  unitSelect.style.cssText = 'width:100%;padding:11px 14px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:#fff;color:var(--text);margin-bottom:10px;box-sizing:border-box;';
  ['Wdh','Sek','Min'].forEach(function(u){
    var opt = document.createElement('option'); opt.value=u; opt.textContent=u;
    unitSelect.appendChild(opt);
  });

  var descInput = document.createElement('textarea');
  descInput.placeholder = 'Kurze Beschreibung (optional)';
  descInput.style.cssText = 'width:100%;padding:11px 14px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:16px;background:#fff;color:var(--text);margin-bottom:16px;box-sizing:border-box;height:70px;resize:none;';

  var sendBtn = document.createElement('button');
  sendBtn.className = 'pressable';
  sendBtn.style.cssText = 'width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:14px;min-height:48px;cursor:pointer;margin-bottom:8px;box-shadow:0 12px 30px rgba(255,85,0,0.22);';
  sendBtn.textContent = 'Vorschlag senden';
  sendBtn.onclick = function(){
    var name = nameInput.value.trim();
    if(!name){ alert('Bitte Übungsname eingeben!'); return; }
    sendBtn.disabled=true; sendBtn.textContent='Wird gesendet...';
    var user = firebase.auth().currentUser;
    db.collection('exerciseSuggestions').add({
      name: name,
      category: catSelect.value,
      unit: unitSelect.value,
      description: descInput.value.trim(),
      submitterId: user.uid,
      submitterName: (typeof prData!=='undefined'&&prData&&prData.name)||'Anonym',
      status: 'pending',
      createdAt: Date.now(),
    }).then(function(){
      ov.remove();
      if(typeof toast==='function') toast('✅ Vorschlag gesendet! Admin prüft ihn.');
    }).catch(function(e){ alert('Fehler: '+e.message); sendBtn.disabled=false; sendBtn.textContent='Vorschlag senden'; });
  };

  box.appendChild(nameInput); box.appendChild(catSelect);
  box.appendChild(unitSelect); box.appendChild(descInput); box.appendChild(sendBtn);
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
