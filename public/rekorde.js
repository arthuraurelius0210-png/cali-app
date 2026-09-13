// ══════════════════════════════════════════════════════════
// REKORDE.JS
// ══════════════════════════════════════════════════════════

var REK_CATS = [
  {id:'all',       label:'Alle',      icon:'trophy'},
  {id:'Pull',      label:'Pull',      icon:'trend'},
  {id:'Push',      label:'Push',      icon:'flex'},
  {id:'Core',      label:'Core',      icon:'flame'},
  {id:'Legs',      label:'Legs',      icon:'dumbbell'},
  {id:'Skills',    label:'Skills',    icon:'star'},];

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

// Zweistelliger Index ("01") — ab 100 dreistellig, damit nichts abgeschnitten wird
function rekIdx(n){ return n < 10 ? '0'+n : String(n); }

// Chip-Optik kommt aus .chip/.chip.on (tracker.html); hier nur Layout-Rest.
function rekChipStyle(active){
  return 'flex-shrink:0;';
}
function rekChipSet(btn, active){
  btn.className = 'chip pressable'+(active?' on':'');
  btn.style.cssText = rekChipStyle(active);
  btn.setAttribute('aria-pressed', active?'true':'false');
}

// Bordered Listen-Container (§5.2) — Zeilen kommen aus rekRowCard()
function rekList(){
  var l = document.createElement('div');
  l.className = 'list';
  return l;
}

// Einheitliche Listen-Zeile (52px, 1px --line Trenner, Chevron rechts)
function rekRowCard(){
  var d = document.createElement('div');
  d.className = 'list-row pressable';
  d.setAttribute('role','button');
  d.tabIndex = 0;
  d.onkeydown = function(ev){ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); if(d.onclick) d.onclick(ev); } };
  return d;
}

// Leerzustand: kurze Zeile uppercase (.empty) + optionaler Hinweis in Mixed Case
function rekEmpty(title, hint){
  return '<div style="text-align:center;padding:24px 10px;"><div class="empty" style="padding:0'+(hint?' 0 6px':'')+';">'+title+'</div>'+
    (hint?'<div style="font-size:11px;color:var(--muted);line-height:1.5;">'+hint+'</div>':'')+'</div>';
}

// Top-Bar für Vollbild-Overlays (§5.9): Zurück-Kreis, Titel, rechter Slot
function rekTopbar(titleText, onBack){
  var topBar = document.createElement('div');
  topBar.className = 'topbar';
  topBar.style.cssText = 'flex-shrink:0;margin:0;padding:0 16px;';
  var backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'icon-btn sm pressable';
  backBtn.setAttribute('aria-label','Zurück');
  backBtn.innerHTML = '&#8592;';
  backBtn.onclick = onBack;
  var titleEl = document.createElement('div');
  titleEl.className = 'topbar-title';
  titleEl.textContent = titleText;
  var slot = document.createElement('div');
  slot.className = 'topbar-slot';
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(slot);
  topBar._title = titleEl;
  topBar._slot = slot;
  return topBar;
}

function buildRekordeUI(){
  var root = document.getElementById('rek-root');
  if(!root) return;
  root.innerHTML = '';

  // ── HEADER (Top-Bar-Titel + Aktionszeile) ────────────────
  var hdr = document.createElement('div');
  hdr.style.cssText = 'margin:0 0 14px;';
  var top = document.createElement('div');
  top.className = 'topbar';
  var slotL = document.createElement('div');
  slotL.className = 'topbar-slot';
  var pageTitle = document.createElement('h2');
  pageTitle.className = 'topbar-title';
  pageTitle.style.cssText = 'margin:0;';
  pageTitle.textContent = 'Rekorde';
  var slotR = document.createElement('div');
  slotR.className = 'topbar-slot';
  top.appendChild(slotL); top.appendChild(pageTitle); top.appendChild(slotR);
  hdr.appendChild(top);
  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;';
  var parkBtn = document.createElement('button');
  parkBtn.type = 'button';
  parkBtn.className = 'btn-g pressable';
  parkBtn.style.cssText = 'flex:1;padding:9px 8px;';
  parkBtn.textContent = 'Parks';
  parkBtn.onclick = function(){ openMyParksOverview(); };
  var suggestExBtn2 = document.createElement('button');
  suggestExBtn2.type = 'button';
  suggestExBtn2.className = 'btn-g pressable';
  suggestExBtn2.style.cssText = 'flex:1;padding:9px 8px;';
  suggestExBtn2.textContent = '+ Übung';
  suggestExBtn2.onclick = function(){ openSuggestExercise(); };
  var subBtn = document.createElement('button');
  subBtn.type = 'button';
  subBtn.className = 'btn sm pressable';
  subBtn.style.cssText = 'flex:1;padding:0 8px;';
  subBtn.textContent = '+ Eintrag';
  subBtn.onclick = function(){ openRecordSubmit(null,null); };
  btnRow.appendChild(parkBtn); btnRow.appendChild(suggestExBtn2); btnRow.appendChild(subBtn);
  hdr.appendChild(btnRow);
  root.appendChild(hdr);

  // ── FILTER (Accordion — eingeklappt nur eine Ghost-Pill mit Zusammenfassung) ──
  var filterWrap = document.createElement('div');
  filterWrap.style.cssText = 'margin:0 0 16px;';

  var summaryBtn = document.createElement('button');
  summaryBtn.type = 'button';
  summaryBtn.className = 'btn-g pressable';
  summaryBtn.style.cssText = 'width:100%;min-height:44px;justify-content:space-between;text-align:left;padding:9px 14px;';
  summaryBtn.setAttribute('aria-expanded','false');
  var summaryText = document.createElement('span');
  summaryText.style.cssText = 'flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  var summaryChevron = document.createElement('span');
  summaryChevron.className = 'row-chev';
  summaryChevron.style.cssText = 'display:inline-block;transform:rotate(90deg);transition:transform var(--dur-med) var(--ease-out);flex-shrink:0;';
  summaryChevron.setAttribute('aria-hidden','true');
  summaryBtn.appendChild(summaryText); summaryBtn.appendChild(summaryChevron);

  // Accordion-Physik: .acc-body Grid-Sizer statt display:none-Snap
  var accWrap = document.createElement('div');
  accWrap.className = 'acc-body';
  var accClip = document.createElement('div');
  var filterPanel = document.createElement('div');
  filterPanel.className = 'card';
  filterPanel.style.cssText = 'margin:8px 0 0;';
  accClip.appendChild(filterPanel);
  accWrap.appendChild(accClip);

  var panelOpen = false;
  summaryBtn.onclick = function(){
    panelOpen = !panelOpen;
    accWrap.classList.toggle('open', panelOpen);
    summaryBtn.setAttribute('aria-expanded', panelOpen ? 'true' : 'false');
    summaryChevron.style.transform = panelOpen ? 'rotate(-90deg)' : 'rotate(90deg)';
  };

  function updateSummary(){
    var catObj = REK_CATS.find(function(c){ return c.id===rekState.cat; });
    var regObj = REK_REGIONS.find(function(r){ return r.km===rekState.regionKm; }) || REK_REGIONS[REK_REGIONS.length-1];
    // Kategorie + Region erben das Uppercase der Pill; der Übungsname bleibt Mixed Case (Content)
    summaryText.innerHTML = '<span>'+(catObj?catObj.label:'Alle')+'</span>'+
      '<span style="color:var(--muted2);margin:0 6px;">&middot;</span>'+
      '<span style="text-transform:none;letter-spacing:0;color:var(--muted);font-weight:500;">'+(rekState.exName||'Übung wählen')+'</span>'+
      '<span style="color:var(--muted2);margin:0 6px;">&middot;</span>'+
      '<span>'+regObj.label+'</span>';
  }

  // Kategorie-Chips
  var catLabel = document.createElement('h2');
  catLabel.className = 'lbl';
  catLabel.style.cssText = 'margin:0 0 8px;';
  catLabel.textContent = 'Kategorie';
  var catRow = document.createElement('div');
  catRow.style.cssText = 'display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-bottom:14px;padding-bottom:2px;';
  REK_CATS.forEach(function(cat){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.catId = cat.id;
    rekChipSet(btn, cat.id===rekState.cat);
    btn.textContent = cat.label;
    btn.onclick = function(){
      rekState.cat = cat.id;
      rekState.exId = null;
      catRow.querySelectorAll('button').forEach(function(b){
        rekChipSet(b, b.dataset.catId===rekState.cat);
      });
      rebuildExList();
    };
    catRow.appendChild(btn);
  });

  // Übungs-Liste
  var exLabel = document.createElement('h2');
  exLabel.className = 'lbl';
  exLabel.style.cssText = 'margin:0 0 8px;';
  exLabel.textContent = 'Übung';
  var exListWrap = document.createElement('div');
  exListWrap.className = 'list sheet-scroll';
  exListWrap.style.cssText = 'max-height:220px;overflow-y:auto;margin-bottom:14px;';

  function rekExRowSet(btn, active){
    btn.style.background = active ? 'var(--accent-soft)' : '';
    var t = btn.querySelector('.row-title'); if(t) t.style.color = active ? 'var(--accent)' : '';
    var ix = btn.querySelector('.row-index'); if(ix) ix.style.color = active ? 'var(--accent)' : '';
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  }

  function rebuildExList(){
    exListWrap.innerHTML = '';
    var allEx = getRekExercises();
    allEx.forEach(function(ex, i){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'list-row pressable';
      btn.dataset.exId = ex.id;
      btn.innerHTML = '<span class="row-index num">'+rekIdx(i+1)+'</span>'+
        '<div class="row-main"><div class="row-title">'+ex.name+'</div></div>'+
        '<span class="unit">'+ex.unit+'</span>';
      rekExRowSet(btn, ex.id === rekState.exId);
      btn.onclick = function(){
        rekState.exId = ex.id;
        rekState.exName = ex.name;
        rekState.exUnit = ex.unit;
        exListWrap.querySelectorAll('button').forEach(function(b){
          rekExRowSet(b, b.dataset.exId === rekState.exId);
        });
        updateSummary();
        loadRekList(listEl);
      };
      exListWrap.appendChild(btn);
    });

    // Auto-select erste Übung wenn keine gewählt ist
    if(!rekState.exId && allEx.length > 0){
      rekState.exId = allEx[0].id;
      rekState.exName = allEx[0].name;
      rekState.exUnit = allEx[0].unit;
      var firstBtn = exListWrap.querySelector('button');
      if(firstBtn) rekExRowSet(firstBtn, true);
    }
    updateSummary();
    loadRekList(listEl);
  }

  // Region-Chips
  var regLabel = document.createElement('h2');
  regLabel.className = 'lbl';
  regLabel.style.cssText = 'margin:0 0 8px;';
  regLabel.textContent = 'Region';
  var regRow = document.createElement('div');
  regRow.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;';
  REK_REGIONS.forEach(function(opt){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.km = opt.km;
    rekChipSet(btn, opt.km===rekState.regionKm);
    btn.textContent = opt.label;
    btn.onclick = function(){
      rekState.regionKm = opt.km;
      regRow.querySelectorAll('button').forEach(function(b){
        rekChipSet(b, parseInt(b.dataset.km,10)===rekState.regionKm);
      });
      updateSummary();
      loadRekList(listEl);
    };
    regRow.appendChild(btn);
  });

  var doneBtn = document.createElement('button');
  doneBtn.type = 'button';
  doneBtn.className = 'btn-g pressable';
  doneBtn.style.cssText = 'width:100%;min-height:44px;';
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
  if(!rekState.exId){el.innerHTML='<div class="empty">Übung wählen</div>';return;}
  el.innerHTML='<div class="empty">Lade…</div>';
  if(typeof db==='undefined'||!db){el.innerHTML='<div class="empty">Einloggen um Rekorde zu sehen.</div>';return;}
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
        notice.className='card';
        notice.style.cssText='display:flex;align-items:center;gap:12px;margin-bottom:12px;';
        var noticeTxt=document.createElement('div');
        noticeTxt.style.cssText='flex:1;min-width:0;font-size:11px;color:var(--muted);line-height:1.5;';
        noticeTxt.textContent='Standort nötig für regionale Filter — es werden weltweite Einträge gezeigt.';
        var locBtn=document.createElement('button');
        locBtn.type='button';
        locBtn.className='btn-g pressable';
        locBtn.style.cssText='flex-shrink:0;';
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
      titleRow.style.cssText='display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:10px;';
      titleRow.innerHTML='<div style="min-width:0;"><span class="eyebrow">Bestenliste</span><div style="font-size:15px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+rekState.exName+'</div></div>'+
        '<span class="unit" style="flex-shrink:0;padding-bottom:2px;">'+rekState.exUnit+'</span>';
      el.appendChild(titleRow);
      if(snap.empty){
        var emptyEl=document.createElement('div');
        emptyEl.className='list';
        emptyEl.innerHTML='<div class="empty" style="padding:28px 10px;">Noch keine Einträge.<br>Sei der Erste!</div>';
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
        emptyReg.className='list';
        emptyReg.innerHTML='<div class="empty" style="padding:24px 10px;">Keine Einträge in dieser Region.</div>';
        el.appendChild(emptyReg);
        return;
      }
      var uid=firebase.auth().currentUser?firebase.auth().currentUser.uid:null;
      var listWrap=rekList();
      var frag=document.createDocumentFragment();
      entries.forEach(function(d,i){
        var rank=i+1;
        var isMe=uid&&d.uid===uid;
        var row=document.createElement('div');
        row.className='list-row';
        row.style.cssText='cursor:default;content-visibility:auto;contain-intrinsic-size:auto 52px;'+(isMe?'background:var(--accent-soft);':'');
        var rankEl=document.createElement('span');
        rankEl.className='row-index num';
        if(rank<=3) rankEl.style.color='var(--accent)';
        rankEl.textContent=rekIdx(rank);
        var infoEl=document.createElement('div');
        infoEl.className='row-main';
        var parkTxt = d.parkName ? d.parkName : (d.location ? d.location : 'Unbekannter Standort');
        if(rekState.regionKm<99999&&hasLoc&&(!d.lat||!d.lng)) parkTxt += ' &middot; ohne Standort';
        infoEl.innerHTML='<div class="row-title">'+(d.name||'Anonym')+(isMe?' <span class="u" style="display:inline-block;vertical-align:middle;margin-left:6px;border:1px solid var(--accent);color:var(--accent);border-radius:var(--r-sm);padding:1px 6px;font-size:9px;font-weight:600;line-height:1.4;">Du</span>':'')+'</div>'+
          '<div class="row-sub">'+parkTxt+'</div>';
        var valEl=document.createElement('div');
        valEl.style.cssText='text-align:right;flex-shrink:0;';
        valEl.innerHTML='<div class="num" style="font-size:15px;font-weight:600;color:var(--text);line-height:1;">'+d.value+'</div><div class="unit" style="display:block;margin-top:3px;">'+rekState.exUnit+'</div>';
        var vNum=Number(d.value);
        if(window.caliMotion&&i<8&&isFinite(vNum)&&vNum===Math.round(vNum)){
          caliMotion.countUp(valEl.firstChild,vNum,{duration:600});
        }
        row.appendChild(rankEl);row.appendChild(infoEl);row.appendChild(valEl);
        if(d.videoUrl){
          var vBtn=document.createElement('button');
          vBtn.type='button';
          vBtn.className='icon-btn sm pressable';
          vBtn.innerHTML=(typeof ci==='function')?ci('play'):'&#9654;';
          vBtn.setAttribute('aria-label','Video abspielen');
          vBtn.onclick=function(){playVideo(d.videoUrl);};
          row.appendChild(vBtn);
        }
        frag.appendChild(row);
      });
      listWrap.appendChild(frag);
      el.appendChild(listWrap);
      if(window.caliMotion) caliMotion.stagger(listWrap);
    })
    .catch(function(e){
      el.innerHTML='<div style="padding:16px;color:var(--red);font-size:11px;">Fehler: '+e.message+'</div>';
    });
}

// ── PARKS SEKTION IN REKORDE ───────────────────────────────
function buildRekParksSection(root){
  var sec = document.createElement('div');
  sec.id = 'rek-parks-section';
  sec.style.cssText = 'border-top:1px solid var(--line);margin-top:0;';

  // Header
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:14px 16px 10px;display:flex;align-items:center;justify-content:space-between;gap:12px;';
  hdr.innerHTML = '<h2 class="lbl" style="margin:0;">Meine Parks</h2>';

  var allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.className = 'btn-g pressable';
  allBtn.textContent = 'Alle Parks';
  allBtn.onclick = function(){ openAllMyParks(); };
  hdr.appendChild(allBtn);
  sec.appendChild(hdr);

  var listEl = document.createElement('div');
  listEl.style.cssText = 'padding:0 16px 16px;';
  listEl.innerHTML = '<div class="empty">Lade deine Parks…</div>';
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

  var topBar = rekTopbar('Alle meine Parks', function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  });
  ov.appendChild(topBar);

  var listEl = document.createElement('div');
  listEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
  listEl.classList.add('sheet-scroll');
  listEl.innerHTML = '<div class="empty">Lade…</div>';
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
    el.innerHTML = '<div class="empty">Einloggen um deine Parks zu sehen.</div>';
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
      el.innerHTML = rekEmpty('Keine Park-Daten', 'Trainiere in einem Park und reiche einen Rekord ein!');
    });
  });
}

function renderMyParks(el, parks){
  el.innerHTML = '';

  if(parks.length === 0){
    el.innerHTML = rekEmpty('Noch kein Park', 'Du hast noch in keinem Park trainiert.<br>Besuche einen Park und reiche einen Rekord ein!');
    return;
  }

  // Sort by workout count
  parks.sort(function(a,b){ return b.workoutCount - a.workoutCount; });

  // Top 3
  var topLabel = document.createElement('h2');
  topLabel.className = 'stitle';
  topLabel.style.cssText = 'margin:0 0 10px;';
  topLabel.textContent = 'Deine Top-Parks';
  el.appendChild(topLabel);

  var topList = rekList();
  var top3 = parks.slice(0,3);
  top3.forEach(function(p, i){
    var card = rekRowCard();
    card.innerHTML =
      '<span class="row-index num" style="color:var(--accent);">'+rekIdx(i+1)+'</span>'+
      '<div class="row-main">'+
        '<div class="row-title">'+p.parkName+'</div>'+
        '<div class="row-sub">'+p.workoutCount+' Workouts · '+p.totalReps+' Wdh. gesamt</div>'+
      '</div>'+
      '<span class="row-chev" aria-hidden="true"></span>';
    card.onclick = (function(park){ return function(){ openParkLeaderboardById(park.parkId, park.parkName); }; })(p);
    topList.appendChild(card);
  });
  el.appendChild(topList);
  if(window.caliMotion) caliMotion.stagger(topList);

  // Top 10 list
  if(parks.length > 3){
    var moreLabel = document.createElement('h2');
    moreLabel.className = 'stitle';
    moreLabel.style.cssText = 'margin:14px 0 10px;';
    moreLabel.textContent = 'Alle besuchten Parks ('+parks.length+')';
    el.appendChild(moreLabel);

    var moreList = rekList();
    parks.slice(3, 10).forEach(function(p, i){
      var row = rekRowCard();
      row.innerHTML =
        '<span class="row-index num">'+rekIdx(i+4)+'</span>'+
        '<div class="row-main">'+
          '<div class="row-title">'+p.parkName+'</div>'+
          '<div class="row-sub">'+p.workoutCount+' Workouts</div>'+
        '</div>'+
        '<span class="row-chev" aria-hidden="true"></span>';
      row.onclick = (function(park){ return function(){ openParkLeaderboardById(park.parkId, park.parkName); }; })(p);
      moreList.appendChild(row);
    });
    el.appendChild(moreList);
    if(window.caliMotion) caliMotion.stagger(moreList);
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
    if(parks.length===0){ body.innerHTML='<div class="empty">Keine Parks gefunden.</div>'; return; }
    var list = rekList();
    parks.forEach(function(p, i){
      var row = rekRowCard();
      row.innerHTML = '<span class="row-index num">'+rekIdx(i+1)+'</span><div class="row-main"><div class="row-title">'+p.parkName+'</div><div class="row-sub">'+p.workoutCount+' Einträge</div></div><span class="row-chev" aria-hidden="true"></span>';
      row.onclick = (function(park){ return function(){ openParkLeaderboardById(park.parkId, park.parkName); }; })(p);
      list.appendChild(row);
    });
    body.appendChild(list);
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

  // Top bar: Zurück · Parkname · "+ Eintrag" (einzige orangene CTA dieses Screens)
  var topBar = rekTopbar(parkName, function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  });
  var recBtn = document.createElement('button');
  recBtn.type = 'button';
  recBtn.className = 'btn sm pressable';
  recBtn.style.cssText = 'flex-shrink:0;';
  recBtn.textContent = '+ Eintrag';
  recBtn.onclick = function(){ openRecordSubmit(parkId, parkName); };
  topBar.replaceChild(recBtn, topBar._slot);
  ov.appendChild(topBar);

  // Bestenliste direkt
  var body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
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
  var topBar = rekTopbar('Park-Rekorde', function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); } else { ov.remove(); }
  });
  ov.appendChild(topBar);

  // Filter Tabs
  var filterBar = document.createElement('div');
  filterBar.style.cssText = 'display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid var(--line);flex-shrink:0;overflow-x:auto;scrollbar-width:none;';
  var filters = [
    {id:'mine',    label:'Meine Parks'},
    {id:'top',     label:'Meistbesucht'},
    {id:'rekorde', label:'Meine Rekorde'},
    {id:'all',     label:'Alle Parks'},
  ];
  var activeFilter = 'mine';
  var contentEl = document.createElement('div');
  contentEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';

  contentEl.classList.add('sheet-scroll');

  filters.forEach(function(f){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.fid = f.id;
    rekChipSet(btn, f.id === activeFilter);
    btn.textContent = f.label;
    btn.onclick = function(){
      activeFilter = f.id;
      filterBar.querySelectorAll('button').forEach(function(b){
        rekChipSet(b, b.dataset.fid === activeFilter);
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
  el.innerHTML = '<div class="empty">Lade…</div>';
  if(typeof db==='undefined'||!db||!firebase.auth().currentUser){
    el.innerHTML='<div class="empty" style="padding:40px 10px;">Einloggen um Parks zu sehen.</div>'; return;
  }
  var uid = firebase.auth().currentUser.uid;
  var errHtml = function(e){ return '<div style="padding:20px;color:var(--red);font-size:11px;">Fehler: '+e.message+'</div>'; };

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
      }).catch(function(e){ el.innerHTML=errHtml(e); });

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
      }).catch(function(e){ el.innerHTML=errHtml(e); });

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
      }).catch(function(e){ el.innerHTML=errHtml(e); });
  }
}

function renderParksOverview(el, parks, filter){
  el.innerHTML = '';
  if(parks.length === 0){
    el.innerHTML = '<div class="empty" style="padding:40px 10px;">Keine Parks gefunden.</div>';
    return;
  }

  // Top 3
  var top3 = parks.slice(0,3);
  var topLabel = document.createElement('h2');
  topLabel.className = 'stitle';
  topLabel.style.cssText = 'margin:0 0 10px;';
  topLabel.textContent = filter==='mine'?'Deine Top-Parks':filter==='top'?'Meistbesuchte Parks':filter==='rekorde'?'Deine Rekord-Parks':'Top-Parks';
  el.appendChild(topLabel);

  var topList = rekList();
  top3.forEach(function(p, i){
    var card = rekRowCard();
    var sub = filter==='top' ? Object.keys(p.users||{}).length+' Athleten' : p.count+' Einträge';
    if(filter==='rekorde' && p.myBest){
      var bestEx = Object.keys(p.myBest).sort(function(a,b){ return p.myBest[b]-p.myBest[a]; })[0];
      if(bestEx) sub += ' · Best: '+bestEx+' '+p.myBest[bestEx];
    }
    card.innerHTML =
      '<span class="row-index num" style="color:var(--accent);">'+rekIdx(i+1)+'</span>'+
      '<div class="row-main">'+
        '<div class="row-title">'+p.parkName+'</div>'+
        '<div class="row-sub">'+sub+'</div>'+
      '</div>'+
      '<span class="row-chev" aria-hidden="true"></span>';
    card.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
    topList.appendChild(card);
  });
  el.appendChild(topList);
  if(window.caliMotion) caliMotion.stagger(topList);

  if(parks.length > 3){
    var restLabel = document.createElement('h2');
    restLabel.className = 'stitle';
    restLabel.style.cssText = 'margin:16px 0 10px;';
    restLabel.textContent = 'Weitere Parks';
    el.appendChild(restLabel);

    var restList = rekList();
    parks.slice(3,13).forEach(function(p, i){
      var row = rekRowCard();
      var sub2 = filter==='top' ? Object.keys(p.users||{}).length+' Athleten' : p.count+' Einträge';
      row.innerHTML =
        '<span class="row-index num">'+rekIdx(i+4)+'</span>'+
        '<div class="row-main"><div class="row-title">'+p.parkName+'</div>'+
        '<div class="row-sub">'+sub2+'</div></div>'+
        '<span class="row-chev" aria-hidden="true"></span>';
      row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
      restList.appendChild(row);
    });
    el.appendChild(restList);
    if(window.caliMotion) caliMotion.stagger(restList);

    if(parks.length > 13){
      var moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'btn-g pressable';
      moreBtn.style.cssText = 'width:100%;min-height:44px;margin-top:8px;';
      moreBtn.textContent = 'Alle '+parks.length+' Parks anzeigen';
      moreBtn.onclick = function(){
        moreBtn.remove();
        var extraList = rekList();
        parks.slice(13).forEach(function(p, i){
          var row = rekRowCard();
          row.innerHTML = '<span class="row-index num">'+rekIdx(i+14)+'</span>'+
            '<div class="row-main"><div class="row-title">'+p.parkName+'</div></div>'+
            '<span class="row-chev" aria-hidden="true"></span>';
          row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
          extraList.appendChild(row);
        });
        el.appendChild(extraList);
        if(window.caliMotion) caliMotion.stagger(extraList);
      };
      el.appendChild(moreBtn);
    }
  }
}

function loadMyParksOverview(el){
  el.innerHTML = '<div class="empty">Lade deine Parks…</div>';

  if(typeof db==='undefined'||!db||!firebase.auth().currentUser){
    el.innerHTML='<div class="empty" style="padding:40px 10px;">Einloggen um deine Parks zu sehen.</div>'; return;
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
        el.innerHTML = rekEmpty('Noch keine Rekorde', 'Du hast noch keine Rekorde eingereicht.<br>Reiche deinen ersten Rekord ein!');
        return;
      }

      // TOP 3
      var top3 = parks.slice(0,3);
      var top3Label = document.createElement('div');
      top3Label.className = 'stitle';
      top3Label.style.cssText = 'margin:0 0 10px;';
      top3Label.textContent = 'Deine Top-Parks';
      el.appendChild(top3Label);

      var topList = rekList();
      top3.forEach(function(p, i){
        var card = rekRowCard();
        var topEx = Object.keys(p.exercises).sort(function(a,b){ return p.exercises[b]-p.exercises[a]; })[0] || '';
        card.innerHTML =
          '<span class="row-index num" style="color:var(--accent);">'+rekIdx(i+1)+'</span>'+
          '<div class="row-main">'+
            '<div class="row-title">'+p.parkName+'</div>'+
            '<div class="row-sub">'+p.count+' Einträge'+(topEx?' · Meist: '+topEx:'')+'</div>'+
          '</div>'+
          '<span class="row-chev" aria-hidden="true"></span>';
        card.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
        topList.appendChild(card);
      });
      el.appendChild(topList);

      if(parks.length > 3){
        // TOP 10 Rest
        var restLabel = document.createElement('div');
        restLabel.className = 'stitle';
        restLabel.style.cssText = 'margin:16px 0 10px;';
        restLabel.textContent = 'Weitere Parks';
        el.appendChild(restLabel);

        var restList = rekList();
        parks.slice(3, 10).forEach(function(p, i){
          var row = rekRowCard();
          var rankEl = document.createElement('span');
          rankEl.className = 'row-index num';
          rankEl.textContent = rekIdx(i+4);
          var infoEl = document.createElement('div');
          infoEl.className = 'row-main';
          infoEl.innerHTML = '<div class="row-title">'+p.parkName+'</div>'+
            '<div class="row-sub">'+p.count+' Einträge</div>';
          row.appendChild(rankEl); row.appendChild(infoEl);
          var chev = document.createElement('span');
          chev.className = 'row-chev';
          chev.setAttribute('aria-hidden','true');
          row.appendChild(chev);
          row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
          restList.appendChild(row);
        });
        el.appendChild(restList);
      }

      // Alle Parks Button
      if(parks.length > 10){
        var allBtn = document.createElement('button');
        allBtn.type = 'button';
        allBtn.className = 'btn-g pressable';
        allBtn.style.cssText = 'width:100%;min-height:44px;margin-top:8px;';
        allBtn.textContent = 'Alle '+parks.length+' Parks anzeigen';
        allBtn.onclick = function(){
          allBtn.remove();
          var extraList = rekList();
          parks.slice(10).forEach(function(p, i){
            var row = rekRowCard();
            row.innerHTML = '<span class="row-index num">'+rekIdx(i+11)+'</span>'+
              '<div class="row-main"><div class="row-title">'+p.parkName+'</div><div class="row-sub">'+p.count+' Einträge</div></div>'+
              '<span class="row-chev" aria-hidden="true"></span>';
            row.onclick = function(){ openParkLeaderboardById(p.parkId, p.parkName); };
            extraList.appendChild(row);
          });
          el.appendChild(extraList);
        };
        el.appendChild(allBtn);
      }
    })
    .catch(function(e){
      el.innerHTML='<div style="padding:20px;color:var(--red);font-size:11px;">Fehler: '+e.message+'</div>';
    });
}

// ── ÜBUNG VORSCHLAGEN ─────────────────────────────────────
function openSuggestExercise(){
  if(!firebase.auth().currentUser){ alert('Bitte einloggen!'); return; }
  var ex = document.getElementById('suggest-ex-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'suggest-ex-ov';
  ov.className = 'backdrop';
  var box = document.createElement('div');
  box.className = 'sheet';
  box.innerHTML = '<div class="sheet-grip"></div>'+
    '<div class="ttl">Übung vorschlagen</div>'+
    '<div style="font-size:11px;color:var(--muted);margin:4px 0 16px;">Fehlt eine Übung? Schlag sie vor!</div>';

  var nameInput = document.createElement('input');
  nameInput.type = 'text'; nameInput.placeholder = 'Übungsname (z.B. Typewriter Pull-Up)';
  nameInput.className = 'inp';
  nameInput.style.cssText = 'margin-bottom:10px;';

  // Kategorie
  var catSelect = document.createElement('select');
  catSelect.className = 'inp';
  catSelect.style.cssText = 'margin-bottom:10px;';
  ['Pull','Push','Core','Legs','Skills'].forEach(function(c){
    var opt = document.createElement('option'); opt.value=c; opt.textContent=c;
    catSelect.appendChild(opt);
  });

  var unitSelect = document.createElement('select');
  unitSelect.className = 'inp';
  unitSelect.style.cssText = 'margin-bottom:10px;';
  ['Wdh','Sek','Min'].forEach(function(u){
    var opt = document.createElement('option'); opt.value=u; opt.textContent=u;
    unitSelect.appendChild(opt);
  });

  var descInput = document.createElement('textarea');
  descInput.placeholder = 'Kurze Beschreibung (optional)';
  descInput.className = 'inp';
  descInput.style.cssText = 'margin-bottom:16px;height:70px;resize:none;';

  var sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.className = 'btn pressable';
  sendBtn.style.cssText = 'margin:0 0 8px;';
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
      if(typeof toast==='function') toast('Vorschlag gesendet. Admin prüft ihn.');
    }).catch(function(e){ alert('Fehler: '+e.message); sendBtn.disabled=false; sendBtn.textContent='Vorschlag senden'; });
  };

  box.appendChild(nameInput); box.appendChild(catSelect);
  box.appendChild(unitSelect); box.appendChild(descInput); box.appendChild(sendBtn);
  var cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn-g pressable';
  cancelBtn.style.cssText = 'width:100%;min-height:44px;';
  cancelBtn.textContent = 'Abbrechen';
  cancelBtn.onclick = function(){ ov.remove(); };
  box.appendChild(cancelBtn);
  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target===ov) ov.remove(); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}
