// ══════════════════════════════════════════════════════════
// REKORDE.JS — Separate Rekorde-Seite
// ══════════════════════════════════════════════════════════

var REK_SKILLS = [
  {id:'skill_pullup',     name:'Klimmzug',         unit:'Wdh',    cat:'Skills', icon:'⬆️'},
  {id:'skill_muscleup',   name:'Muscle-Up',         unit:'Wdh',    cat:'Skills', icon:'🔄'},
  {id:'skill_dip',        name:'Dip',               unit:'Wdh',    cat:'Skills', icon:'💪'},
  {id:'skill_hspu',       name:'Handstand Push-Up', unit:'Wdh',    cat:'Skills', icon:'🙃'},
  {id:'skill_frontlever', name:'Front Lever',        unit:'Sek',    cat:'Skills', icon:'🎯'},
  {id:'skill_backlever',  name:'Back Lever',         unit:'Sek',    cat:'Skills', icon:'🎯'},
  {id:'skill_planche',    name:'Planche',            unit:'Sek',    cat:'Skills', icon:'⭐'},
  {id:'skill_lsit',       name:'L-Sit',             unit:'Sek',    cat:'Skills', icon:'🪑'},
  {id:'skill_handstand',  name:'Handstand',          unit:'Sek',    cat:'Skills', icon:'🤸'},
  {id:'skill_humanflag',  name:'Human Flag',         unit:'Sek',    cat:'Skills', icon:'🚩'},
  {id:'skill_pistol',     name:'Pistol Squat',       unit:'Wdh',    cat:'Skills', icon:'🦵'},
  {id:'skill_360pu',      name:'360° Pull-Up',       unit:'Wdh',    cat:'Skills', icon:'🌀'},
  {id:'skill_rings',      name:'Ring Muscle-Up',     unit:'Wdh',    cat:'Skills', icon:'⭕'},
];

var REK_CATEGORIES = [
  {id:'all',       label:'Alle',      icon:'🏆'},
  {id:'Pull',      label:'Pull',      icon:'⬆️'},
  {id:'Push',      label:'Push',      icon:'💪'},
  {id:'Core',      label:'Core',      icon:'🔥'},
  {id:'Legs',      label:'Legs',      icon:'🦵'},
  {id:'Skills',    label:'Skills',    icon:'⭐'},
  {id:'Schwimmen', label:'Schwimmen', icon:'🏊'},
  {id:'Laufen',    label:'Laufen',    icon:'🏃'},
];

var REK_RADIUS_OPTIONS = [
  {label:'1 km',        km:1},
  {label:'5 km',        km:5},
  {label:'Bezirk',      km:10},
  {label:'Stadt',       km:25},
  {label:'Bundesland',  km:150},
  {label:'Deutschland', km:500},
  {label:'Weltweit',    km:99999},
];

var rekState = {
  cat: 'all',
  exId: null,
  exName: '',
  exUnit: 'Wdh',
  radiusKm: 99999,
};

function buildRekordeUI(){
  var root = document.getElementById('rek-root');
  if(!root) return;
  root.innerHTML = '';

  // ── HEADER ──────────────────────────────────────────────
  var hdr = document.createElement('div');
  hdr.style.cssText = 'padding:0 16px 12px;display:flex;align-items:center;justify-content:space-between;';
  hdr.innerHTML = '<div style="font-size:22px;font-weight:800;color:var(--text);">🏆 REKORDE</div>';
  var submitBtn = document.createElement('button');
  submitBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:9px 14px;cursor:pointer;letter-spacing:1px;';
  submitBtn.textContent = '+ EINTRAG';
  submitBtn.onclick = function(){ openRecordSubmit(null, null); };
  hdr.appendChild(submitBtn);
  root.appendChild(hdr);

  // ── KATEGORIE TABS ───────────────────────────────────────
  var catWrap = document.createElement('div');
  catWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;padding:0 16px 12px;scrollbar-width:none;';
  REK_CATEGORIES.forEach(function(cat){
    var btn = document.createElement('button');
    btn.dataset.catId = cat.id;
    var isActive = cat.id === rekState.cat;
    btn.style.cssText = 'flex-shrink:0;padding:7px 14px;border-radius:20px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'var(--accent)':'none')+';color:'+(isActive?'#fff':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;';
    btn.textContent = cat.icon+' '+cat.label;
    btn.onclick = function(){
      rekState.cat = cat.id;
      rekState.exId = null;
      buildRekordeUI();
    };
    catWrap.appendChild(btn);
  });
  root.appendChild(catWrap);

  // ── ÜBUNGEN LISTE ────────────────────────────────────────
  var allEx = getFilteredExercises();
  var exWrap = document.createElement('div');
  exWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;padding:0 16px 14px;scrollbar-width:none;';
  allEx.forEach(function(ex){
    var btn = document.createElement('button');
    btn.dataset.exId = ex.id;
    var isActive = ex.id === rekState.exId;
    btn.style.cssText = 'flex-shrink:0;padding:6px 12px;border-radius:20px;border:1.5px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'rgba(255,85,0,0.12)':'none')+';color:'+(isActive?'var(--accent)':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;';
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
      loadRekList(listWrap);
    };
    exWrap.appendChild(btn);
  });
  root.appendChild(exWrap);

  // ── RADIUS FILTER ────────────────────────────────────────
  var radSection = document.createElement('div');
  radSection.style.cssText = 'padding:0 16px 14px;';

  // Radius label
  var radLabel = document.createElement('div');
  radLabel.style.cssText = 'font-size:9px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:8px;';
  radLabel.textContent = 'RADIUS';
  radSection.appendChild(radLabel);

  // Radius buttons
  var radBtnWrap = document.createElement('div');
  radBtnWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin-bottom:12px;';
  REK_RADIUS_OPTIONS.forEach(function(opt, oi){
    var btn = document.createElement('button');
    btn.dataset.ri = oi;
    var isActive = opt.km === rekState.radiusKm;
    btn.style.cssText = 'flex-shrink:0;padding:5px 12px;border-radius:20px;border:1px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'rgba(255,85,0,0.1)':'none')+';color:'+(isActive?'var(--accent)':'var(--muted)')+';font-family:inherit;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;';
    btn.textContent = opt.label;
    btn.onclick = function(){
      rekState.radiusKm = opt.km;
      radBtnWrap.querySelectorAll('button').forEach(function(b, bi){
        var a = bi===oi;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'rgba(255,85,0,0.1)':'none';
        b.style.color = a?'var(--accent)':'var(--muted)';
      });
      // Update slider
      var sliderVal = radiusToSlider(opt.km);
      radSlider.value = sliderVal;
      radValueLabel.textContent = opt.km >= 99999 ? 'Weltweit' : opt.km+' km';
      loadRekList(listWrap);
    };
    radBtnWrap.appendChild(btn);
  });
  radSection.appendChild(radBtnWrap);

  // Radius slider
  var sliderWrap = document.createElement('div');
  sliderWrap.style.cssText = 'display:flex;align-items:center;gap:10px;';
  var radSlider = document.createElement('input');
  radSlider.type = 'range';
  radSlider.min = '0';
  radSlider.max = '100';
  radSlider.value = radiusToSlider(rekState.radiusKm);
  radSlider.style.cssText = 'flex:1;accent-color:var(--accent);';
  var radValueLabel = document.createElement('div');
  radValueLabel.style.cssText = 'font-size:12px;font-weight:700;color:var(--accent);min-width:60px;text-align:right;';
  radValueLabel.textContent = rekState.radiusKm >= 99999 ? 'Weltweit' : rekState.radiusKm+' km';

  radSlider.oninput = function(){
    var km = sliderToRadius(parseInt(this.value));
    rekState.radiusKm = km;
    radValueLabel.textContent = km >= 99999 ? 'Weltweit' : km+' km';
    // Update buttons
    radBtnWrap.querySelectorAll('button').forEach(function(b, bi){
      var opt = REK_RADIUS_OPTIONS[bi];
      var a = opt && opt.km === km;
      b.style.borderColor = a?'var(--accent)':'var(--border)';
      b.style.background = a?'rgba(255,85,0,0.1)':'none';
      b.style.color = a?'var(--accent)':'var(--muted)';
    });
  };
  radSlider.onchange = function(){
    loadRekList(listWrap);
  };

  sliderWrap.appendChild(radSlider);
  sliderWrap.appendChild(radValueLabel);
  radSection.appendChild(sliderWrap);
  root.appendChild(radSection);

  // ── LISTE ────────────────────────────────────────────────
  var listWrap = document.createElement('div');
  listWrap.style.cssText = 'padding:0 16px 80px;';
  root.appendChild(listWrap);

  // Auto-select first exercise
  if(!rekState.exId && allEx.length > 0){
    rekState.exId = allEx[0].id;
    rekState.exName = allEx[0].name;
    rekState.exUnit = allEx[0].unit;
    exWrap.querySelectorAll('button')[0].style.borderColor = 'var(--accent)';
    exWrap.querySelectorAll('button')[0].style.background = 'rgba(255,85,0,0.12)';
    exWrap.querySelectorAll('button')[0].style.color = 'var(--accent)';
  }

  loadRekList(listWrap);
}

function radiusToSlider(km){
  if(km >= 99999) return 100;
  if(km >= 500) return 95;
  if(km >= 150) return 80;
  if(km >= 25) return 60;
  if(km >= 10) return 45;
  if(km >= 5) return 30;
  return 10;
}

function sliderToRadius(v){
  if(v >= 95) return 99999;
  if(v >= 80) return 500;
  if(v >= 60) return 150;
  if(v >= 45) return 25;
  if(v >= 30) return 10;
  if(v >= 15) return 5;
  return 1;
}

function getFilteredExercises(){
  var result = [];
  // From EX_DB
  if(typeof EX_DB !== 'undefined'){
    EX_DB.forEach(function(ex, i){
      if(rekState.cat === 'all' || ex.cat === rekState.cat){
        result.push({id:'ex_'+i, name:ex.name, unit:ex.unit, cat:ex.cat});
      }
    });
  }
  // Skills
  if(rekState.cat === 'all' || rekState.cat === 'Skills'){
    REK_SKILLS.forEach(function(s){
      if(!result.find(function(r){ return r.name===s.name; })){
        result.push(s);
      }
    });
  }
  return result;
}

function loadRekList(el){
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);font-size:13px;">⏳ Lade...</div>';
  if(!rekState.exId){ el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Übung auswählen</div>'; return; }
  if(typeof db === 'undefined' || !db){
    el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Einloggen um Rekorde zu sehen.</div>'; return;
  }

  db.collection('globalLeaderboard')
    .where('exercise', '==', rekState.exId)
    .where('status', '==', 'approved')
    .orderBy('value', 'desc')
    .limit(100)
    .get()
    .then(function(snap){
      el.innerHTML = '';

      // Title
      var titleRow = document.createElement('div');
      titleRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;';
      titleRow.innerHTML = '<div style="font-size:13px;font-weight:800;color:var(--text);">'+rekState.exName+'</div>'+
        '<div style="font-size:10px;color:var(--muted);">'+rekState.exUnit+'</div>';
      el.appendChild(titleRow);

      if(snap.empty){
        el.innerHTML += '<div style="text-align:center;padding:40px 20px;background:var(--bg2);border-radius:14px;">'+
          '<div style="font-size:36px;margin-bottom:10px;">🏆</div>'+
          '<div style="font-size:13px;color:var(--muted);">Noch keine Einträge.<br>Sei der Erste!</div></div>';
        return;
      }

      var entries = [];
      snap.forEach(function(doc){ entries.push(Object.assign({id:doc.id}, doc.data())); });

      // Radius filter
      if(rekState.radiusKm < 99999 && userLat && userLng){
        entries = entries.filter(function(e){
          if(!e.lat || !e.lng) return false;
          return calcDist(userLat, userLng, e.lat, e.lng) <= rekState.radiusKm * 1000;
        });
      }

      if(entries.length === 0){
        el.innerHTML += '<div style="text-align:center;padding:30px;background:var(--bg2);border-radius:14px;color:var(--muted);">Keine Einträge in diesem Radius.</div>';
        return;
      }

      var currentUid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null;

      entries.forEach(function(d, i){
        var rank = i+1;
        var medal = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'';
        var isMe = currentUid && d.uid === currentUid;
        var card = document.createElement('div');
        card.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;margin-bottom:8px;background:'+(isMe?'rgba(255,85,0,0.08)':'var(--bg2)')+';border:1.5px solid '+(isMe?'var(--accent)':'var(--border)')+';';

        var rankEl = document.createElement('div');
        rankEl.style.cssText = 'width:36px;text-align:center;flex-shrink:0;';
        rankEl.innerHTML = medal ? '<span style="font-size:22px;">'+medal+'</span>' :
          '<span style="font-size:13px;font-weight:700;color:var(--muted);">#'+rank+'</span>';

        var infoEl = document.createElement('div');
        infoEl.style.cssText = 'flex:1;min-width:0;';
        infoEl.innerHTML =
          '<div style="font-size:14px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(d.name||'Anonym')+(isMe?' <span style="font-size:9px;color:var(--accent);border:1px solid var(--accent);border-radius:4px;padding:1px 4px;">DU</span>':'')+' </div>'+
          '<div style="font-size:10px;color:var(--muted);">'+(d.location||'')+(d.parkName?' · 📍'+d.parkName:'')+'</div>';

        var valEl = document.createElement('div');
        valEl.style.cssText = 'text-align:right;flex-shrink:0;';
        valEl.innerHTML = '<div style="font-size:22px;font-weight:800;color:var(--accent);">'+d.value+'</div>'+
          '<div style="font-size:10px;color:var(--muted);">'+rekState.exUnit+'</div>';

        card.appendChild(rankEl);
        card.appendChild(infoEl);
        card.appendChild(valEl);

        if(d.videoUrl){
          var vidBtn = document.createElement('button');
          vidBtn.style.cssText = 'background:none;border:1.5px solid var(--border);border-radius:8px;padding:8px;font-size:18px;cursor:pointer;flex-shrink:0;';
          vidBtn.textContent = '▶️';
          vidBtn.onclick = function(){ playVideo(d.videoUrl); };
          card.appendChild(vidBtn);
        }

        el.appendChild(card);
      });
    })
    .catch(function(e){
      el.innerHTML = '<div style="padding:20px;color:var(--muted);font-size:12px;">Fehler: '+e.message+'</div>';
    });
}
