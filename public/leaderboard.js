// ══════════════════════════════════════════════════════════
// LEADERBOARD.JS — Globale & Park Bestenliste
// ══════════════════════════════════════════════════════════

var LB_EXERCISES = [
  {id:'pullups',    name:'Klimmzüge',      unit:'Wdh',  icon:'🏋️'},
  {id:'dips',       name:'Dips',           unit:'Wdh',  icon:'💪'},
  {id:'pushups',    name:'Liegestütze',    unit:'Wdh',  icon:'🤸'},
  {id:'muscleup',   name:'Muscle-Up',      unit:'Wdh',  icon:'⬆️'},
  {id:'l_sit',      name:'L-Sit',          unit:'Sek',  icon:'🪑'},
  {id:'handstand',  name:'Handstand',      unit:'Sek',  icon:'🙃'},
  {id:'frontlever', name:'Front Lever',    unit:'Sek',  icon:'🎯'},
  {id:'backlever',  name:'Back Lever',     unit:'Sek',  icon:'🎯'},
  {id:'planche',    name:'Planche',        unit:'Sek',  icon:'⭐'},
  {id:'pistol',     name:'Pistol Squat',   unit:'Wdh',  icon:'🦵'},
];

var LB_RADIUS_OPTIONS = [
  {label:'Mein Bezirk',  km:5},
  {label:'Meine Stadt',  km:25},
  {label:'Mein Bundesland', km:150},
  {label:'Deutschland',  km:500},
  {label:'Weltweit',     km:99999},
];

// ── HAUPTFENSTER GLOBALE BESTENLISTE ──────────────────────
function openGlobalLeaderboard(){
  var ex = document.getElementById('lb-global-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'lb-global-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9950;display:flex;flex-direction:column;overflow:hidden;';

  // Top bar
  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:center;gap:12px;padding:16px 20px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg);';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:8px 14px;cursor:pointer;color:var(--text);';
  backBtn.innerHTML = '&#8592; Zurück';
  backBtn.onclick = function(){ ov.remove(); };
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'flex:1;font-size:16px;font-weight:800;color:var(--text);';
  titleEl.innerHTML = '🏆 BESTENLISTE';
  var submitBtn = document.createElement('button');
  submitBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:8px 12px;cursor:pointer;letter-spacing:1px;';
  submitBtn.textContent = '+ EINTRAG';
  submitBtn.onclick = function(){ openRecordSubmit(null, null); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(submitBtn);
  ov.appendChild(topBar);

  // Filter bar
  var filterBar = document.createElement('div');
  filterBar.style.cssText = 'padding:12px 16px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--bg);';

  // Exercise selector
  var exWrap = document.createElement('div');
  exWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none;';
  var selectedEx = LB_EXERCISES[0].id;
  var selectedRadius = LB_RADIUS_OPTIONS[4]; // Weltweit default

  LB_EXERCISES.forEach(function(ex){
    var btn = document.createElement('button');
    btn.dataset.exId = ex.id;
    btn.style.cssText = 'flex-shrink:0;padding:6px 12px;border-radius:20px;border:1.5px solid '+(ex.id===selectedEx?'var(--accent)':'var(--border)')+';background:'+(ex.id===selectedEx?'var(--accent)':'none')+';color:'+(ex.id===selectedEx?'#fff':'var(--muted)')+';font-family:inherit;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;';
    btn.textContent = ex.icon+' '+ex.name;
    btn.onclick = function(){
      selectedEx = ex.id;
      exWrap.querySelectorAll('button').forEach(function(b){
        var active = b.dataset.exId === selectedEx;
        b.style.borderColor = active?'var(--accent)':'var(--border)';
        b.style.background = active?'var(--accent)':'none';
        b.style.color = active?'#fff':'var(--muted)';
      });
      loadLeaderboard(selectedEx, selectedRadius, listEl);
    };
    exWrap.appendChild(btn);
  });
  filterBar.appendChild(exWrap);

  // Radius selector
  var radWrap = document.createElement('div');
  radWrap.style.cssText = 'display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;';
  LB_RADIUS_OPTIONS.forEach(function(opt, oi){
    var btn = document.createElement('button');
    btn.dataset.ri = oi;
    var isActive = opt.label === selectedRadius.label;
    btn.style.cssText = 'flex-shrink:0;padding:4px 10px;border-radius:20px;border:1px solid '+(isActive?'var(--accent)':'var(--border)')+';background:'+(isActive?'rgba(255,85,0,0.1)':'none')+';color:'+(isActive?'var(--accent)':'var(--muted)')+';font-family:inherit;font-size:10px;font-weight:600;cursor:pointer;white-space:nowrap;';
    btn.textContent = opt.label;
    btn.onclick = function(){
      selectedRadius = opt;
      radWrap.querySelectorAll('button').forEach(function(b, bi){
        var a = bi===oi;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'rgba(255,85,0,0.1)':'none';
        b.style.color = a?'var(--accent)':'var(--muted)';
      });
      loadLeaderboard(selectedEx, selectedRadius, listEl);
    };
    radWrap.appendChild(btn);
  });
  filterBar.appendChild(radWrap);
  ov.appendChild(filterBar);

  // List
  var listEl = document.createElement('div');
  listEl.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
  ov.appendChild(listEl);

  document.body.appendChild(ov);
  loadLeaderboard(selectedEx, selectedRadius, listEl);
}

function loadLeaderboard(exId, radiusOpt, el){
  el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);font-size:13px;">Lade...</div>';
  if(typeof db === 'undefined' || !db){
    el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Einloggen um die Bestenliste zu sehen.</div>';
    return;
  }
  var exInfo = LB_EXERCISES.find(function(e){ return e.id===exId; }) || LB_EXERCISES[0];

  db.collection('globalLeaderboard')
    .where('exercise', '==', exId)
    .where('status', '==', 'approved')
    .orderBy('value', 'desc')
    .limit(50)
    .get()
    .then(function(snap){
      el.innerHTML = '';
      if(snap.empty){
        el.innerHTML = '<div style="text-align:center;padding:40px 20px;"><div style="font-size:40px;margin-bottom:12px;">🏆</div><div style="font-size:14px;color:var(--muted);">Noch keine Einträge für '+exInfo.name+'.<br>Sei der Erste!</div></div>';
        return;
      }
      var entries = [];
      snap.forEach(function(doc){ entries.push({id:doc.id, ...doc.data()}); });

      // Radius filter by distance
      if(radiusOpt.km < 99999 && userLat && userLng){
        entries = entries.filter(function(e){
          if(!e.lat || !e.lng) return true; // no location = show always
          return calcDist(userLat, userLng, e.lat, e.lng) <= radiusOpt.km * 1000;
        });
      }

      if(entries.length === 0){
        el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);">Keine Einträge in diesem Radius.</div>';
        return;
      }

      entries.forEach(function(d, i){
        var rank = i+1;
        var medal = rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'#'+rank;
        var isMe = firebase.auth().currentUser && d.uid === firebase.auth().currentUser.uid;
        var row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:14px 12px;border-radius:12px;margin-bottom:8px;background:'+(isMe?'rgba(255,85,0,0.08)':'var(--bg2)')+';border:1px solid '+(isMe?'var(--accent)':'var(--border)')+';';
        row.innerHTML =
          '<div style="font-size:22px;width:36px;text-align:center;">'+medal+'</div>'+
          '<div style="flex:1;">'+
            '<div style="font-size:14px;font-weight:700;color:var(--text);">'+(d.name||'Anonym')+(isMe?' <span style="font-size:10px;color:var(--accent);">(Du)</span>':'')+' </div>'+
            '<div style="font-size:10px;color:var(--muted);">'+(d.location||'')+(d.parkName?' · '+d.parkName:'')+'</div>'+
          '</div>'+
          '<div style="text-align:right;">'+
            '<div style="font-size:22px;font-weight:800;color:var(--accent);">'+d.value+'</div>'+
            '<div style="font-size:10px;color:var(--muted);">'+exInfo.unit+'</div>'+
          '</div>'+
          (d.videoUrl?'<button onclick="playVideo(\''+d.videoUrl+'\')" style="background:none;border:1.5px solid var(--border);border-radius:8px;padding:6px 10px;font-size:16px;cursor:pointer;">▶️</button>':'');
        el.appendChild(row);
      });
    })
    .catch(function(e){
      el.innerHTML = '<div style="color:var(--muted);padding:20px;">Fehler: '+e.message+'</div>';
    });
}

// ── VIDEO ABSPIELEN ────────────────────────────────────────
function playVideo(url){
  var ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;';
  var vid = document.createElement('video');
  vid.src = url;
  vid.controls = true;
  vid.autoplay = true;
  vid.style.cssText = 'width:100%;max-width:500px;max-height:80vh;border-radius:12px;';
  var closeBtn = document.createElement('button');
  closeBtn.style.cssText = 'margin-top:16px;background:rgba(255,255,255,0.2);border:none;color:#fff;font-family:inherit;font-size:14px;font-weight:700;padding:10px 24px;border-radius:10px;cursor:pointer;';
  closeBtn.textContent = '✕ Schließen';
  closeBtn.onclick = function(){ vid.pause(); ov.remove(); };
  ov.appendChild(vid); ov.appendChild(closeBtn);
  ov.onclick = function(e){ if(e.target===ov){ vid.pause(); ov.remove(); } };
  document.body.appendChild(ov);
}

// ── REKORD EINREICHEN ──────────────────────────────────────
function openRecordSubmit(parkId, parkName){
  if(!firebase.auth().currentUser){
    alert('Bitte zuerst einloggen!'); return;
  }

  var ex = document.getElementById('lb-submit-ov'); if(ex) ex.remove();
  var ov = document.createElement('div');
  ov.id = 'lb-submit-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:20px 20px 0 0;width:100%;max-width:480px;padding:24px 20px 40px;max-height:90vh;overflow-y:auto;';
  box.innerHTML = '<div style="width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 20px;"></div>'+
    '<div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:4px;">🏆 REKORD EINREICHEN</div>'+
    (parkName?'<div style="font-size:11px;color:var(--accent);margin-bottom:16px;">📍 '+parkName+'</div>':'<div style="font-size:11px;color:var(--muted);margin-bottom:16px;">Globale Bestenliste</div>');

  // Step 1: Übung wählen
  var s1 = document.createElement('div');
  s1.innerHTML = '<div style="font-size:10px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:10px;">SCHRITT 1 — ÜBUNG WÄHLEN</div>';
  var exGrid = document.createElement('div');
  exGrid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px;';
  var selectedExId = LB_EXERCISES[0].id;
  LB_EXERCISES.forEach(function(ex){
    var btn = document.createElement('button');
    btn.dataset.exId = ex.id;
    btn.style.cssText = 'padding:10px;border-radius:10px;border:1.5px solid '+(ex.id===selectedExId?'var(--accent)':'var(--border)')+';background:'+(ex.id===selectedExId?'rgba(255,85,0,0.1)':'none')+';font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;color:var(--text);text-align:left;';
    btn.innerHTML = ex.icon+' '+ex.name+'<div style="font-size:9px;color:var(--muted);font-weight:400;">'+ex.unit+'</div>';
    btn.onclick = function(){
      selectedExId = ex.id;
      exGrid.querySelectorAll('button').forEach(function(b){
        var a = b.dataset.exId === selectedExId;
        b.style.borderColor = a?'var(--accent)':'var(--border)';
        b.style.background = a?'rgba(255,85,0,0.1)':'none';
      });
      var exInfo = LB_EXERCISES.find(function(e){ return e.id===selectedExId; });
      valLabel.textContent = 'ERGEBNIS ('+exInfo.unit.toUpperCase()+')';
    };
    exGrid.appendChild(btn);
  });
  s1.appendChild(exGrid);
  box.appendChild(s1);

  // Step 2: Wert eingeben
  var s2 = document.createElement('div');
  var valLabel = document.createElement('div');
  valLabel.style.cssText = 'font-size:10px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:8px;';
  valLabel.textContent = 'SCHRITT 2 — ERGEBNIS (WDH)';
  var valInput = document.createElement('input');
  valInput.type = 'number';
  valInput.min = '1';
  valInput.placeholder = 'z.B. 20';
  valInput.style.cssText = 'width:100%;padding:14px;border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:18px;font-weight:800;text-align:center;background:var(--bg2);color:var(--text);margin-bottom:20px;box-sizing:border-box;';
  s2.appendChild(valLabel); s2.appendChild(valInput);
  box.appendChild(s2);

  // Step 3: Video aufnehmen
  var s3 = document.createElement('div');
  s3.innerHTML = '<div style="font-size:10px;letter-spacing:2px;color:var(--muted);font-weight:700;margin-bottom:10px;">SCHRITT 3 — VIDEOBEWEIS (PFLICHT)</div>';

  var videoBlob = null;
  var mediaRecorder = null;
  var recordedChunks = [];
  var stream = null;

  var camWrap = document.createElement('div');
  camWrap.style.cssText = 'border-radius:12px;overflow:hidden;background:#000;margin-bottom:12px;position:relative;min-height:200px;display:flex;align-items:center;justify-content:center;';

  var preview = document.createElement('video');
  preview.style.cssText = 'width:100%;max-height:300px;display:none;';
  preview.autoplay = true;
  preview.muted = true;
  preview.playsinline = true;

  var resultVid = document.createElement('video');
  resultVid.style.cssText = 'width:100%;max-height:300px;display:none;';
  resultVid.controls = true;
  resultVid.playsinline = true;

  var camPlaceholder = document.createElement('div');
  camPlaceholder.style.cssText = 'color:#fff;font-size:13px;text-align:center;padding:20px;';
  camPlaceholder.innerHTML = '📹<br>Kamera starten um Video aufzunehmen';

  camWrap.appendChild(preview); camWrap.appendChild(resultVid); camWrap.appendChild(camPlaceholder);

  var camBtnRow = document.createElement('div');
  camBtnRow.style.cssText = 'display:flex;gap:8px;margin-bottom:20px;';

  var startCamBtn = document.createElement('button');
  startCamBtn.style.cssText = 'flex:1;background:var(--bg2);border:1.5px solid var(--border);border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:12px;cursor:pointer;color:var(--text);';
  startCamBtn.textContent = '📷 Kamera starten';

  var recBtn = document.createElement('button');
  recBtn.style.cssText = 'flex:1;background:#e74c3c;border:none;border-radius:10px;font-family:inherit;font-size:12px;font-weight:700;padding:12px;cursor:pointer;color:#fff;display:none;';
  recBtn.textContent = '⏺ Aufnahme starten';

  var isRecording = false;

  startCamBtn.onclick = function(){
    navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}, audio:false})
      .then(function(s){
        stream = s;
        preview.srcObject = s;
        preview.style.display = 'block';
        camPlaceholder.style.display = 'none';
        startCamBtn.style.display = 'none';
        recBtn.style.display = 'block';
      })
      .catch(function(e){ alert('Kamera-Zugriff verweigert: '+e.message); });
  };

  recBtn.onclick = function(){
    if(!isRecording){
      recordedChunks = [];
      var options = {mimeType: 'video/webm;codecs=vp8'};
      try { mediaRecorder = new MediaRecorder(stream, options); }
      catch(e){ mediaRecorder = new MediaRecorder(stream); }
      mediaRecorder.ondataavailable = function(e){ if(e.data.size>0) recordedChunks.push(e.data); };
      mediaRecorder.onstop = function(){
        videoBlob = new Blob(recordedChunks, {type:'video/webm'});
        var url = URL.createObjectURL(videoBlob);
        resultVid.src = url;
        resultVid.style.display = 'block';
        preview.style.display = 'none';
        recBtn.textContent = '🔄 Neu aufnehmen';
        submitBtn2.disabled = false;
        submitBtn2.style.opacity = '1';
        if(stream){ stream.getTracks().forEach(function(t){ t.stop(); }); }
      };
      mediaRecorder.start();
      isRecording = true;
      recBtn.textContent = '⏹ Aufnahme stoppen';
      recBtn.style.background = '#e74c3c';
    } else {
      mediaRecorder.stop();
      isRecording = false;
    }
  };

  camBtnRow.appendChild(startCamBtn); camBtnRow.appendChild(recBtn);
  s3.appendChild(camWrap); s3.appendChild(camBtnRow);
  box.appendChild(s3);

  // Submit button
  var submitBtn2 = document.createElement('button');
  submitBtn2.style.cssText = 'width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:14px;font-weight:800;padding:16px;cursor:pointer;letter-spacing:2px;opacity:0.4;';
  submitBtn2.textContent = 'EINREICHEN';
  submitBtn2.disabled = true;

  submitBtn2.onclick = function(){
    if(!videoBlob){ alert('Bitte zuerst Video aufnehmen!'); return; }
    var val = parseInt(valInput.value);
    if(!val || val < 1){ alert('Bitte Ergebnis eingeben!'); return; }
    var exInfo = LB_EXERCISES.find(function(e){ return e.id===selectedExId; });
    var user = firebase.auth().currentUser;
    submitBtn2.textContent = 'WIRD HOCHGELADEN...';
    submitBtn2.disabled = true;

    // Upload video to Firebase Storage
    var fileName = 'leaderboard/'+user.uid+'_'+Date.now()+'.webm';
    var storageRef = firebase.storage().ref(fileName);
    storageRef.put(videoBlob).then(function(snap){
      return snap.ref.getDownloadURL();
    }).then(function(videoUrl){
      var entry = {
        uid: user.uid,
        name: prData.name || user.displayName || 'Anonym',
        exercise: selectedExId,
        exerciseName: exInfo.name,
        value: val,
        unit: exInfo.unit,
        videoUrl: videoUrl,
        status: 'pending', // Admin muss genehmigen
        date: new Date().toISOString(),
        lat: userLat || null,
        lng: userLng || null,
        location: '',
        parkId: parkId || null,
        parkName: parkName || null,
      };

      // Get location name
      if(userLat && userLng){
        fetch('https://nominatim.openstreetmap.org/reverse?lat='+userLat+'&lon='+userLng+'&format=json')
          .then(function(r){ return r.json(); })
          .then(function(geo){
            entry.location = (geo.address&&(geo.address.suburb||geo.address.city_district||geo.address.city)) || '';
            saveLeaderboardEntry(entry, parkId, ov);
          })
          .catch(function(){ saveLeaderboardEntry(entry, parkId, ov); });
      } else {
        saveLeaderboardEntry(entry, parkId, ov);
      }
    }).catch(function(e){
      submitBtn2.textContent = 'EINREICHEN';
      submitBtn2.disabled = false;
      alert('Upload Fehler: '+e.message);
    });
  };

  box.appendChild(submitBtn2);

  // Cancel
  var cancelBtn = document.createElement('button');
  cancelBtn.style.cssText = 'width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:12px;cursor:pointer;margin-top:4px;';
  cancelBtn.textContent = 'Abbrechen';
  cancelBtn.onclick = function(){
    if(stream) stream.getTracks().forEach(function(t){ t.stop(); });
    ov.remove();
  };
  box.appendChild(cancelBtn);

  ov.appendChild(box);
  ov.onclick = function(e){
    if(e.target===ov){
      if(stream) stream.getTracks().forEach(function(t){ t.stop(); });
      ov.remove();
    }
  };
  document.body.appendChild(ov);
}

function saveLeaderboardEntry(entry, parkId, ov){
  var batch = db.batch();

  // Global leaderboard entry (pending)
  var globalRef = db.collection('globalLeaderboard').doc();
  batch.set(globalRef, entry);

  // Park leaderboard entry if parkId given
  if(parkId){
    var parkRef = db.collection('parkLeaderboard').doc(parkId).collection('entries').doc();
    batch.set(parkRef, entry);
  }

  batch.commit().then(function(){
    if(ov) ov.remove();
    // Check if this beats personal best → also submit to global
    checkPersonalBest(entry);
    showToast('🏆 Eingereicht! Admin prüft deinen Eintrag.');
  }).catch(function(e){
    alert('Fehler: '+e.message);
  });
}

function checkPersonalBest(entry){
  if(!db || !firebase.auth().currentUser) return;
  var uid = firebase.auth().currentUser.uid;
  db.collection('personalBests').doc(uid).get().then(function(doc){
    var bests = doc.exists ? doc.data() : {};
    var current = bests[entry.exercise] || 0;
    if(entry.value > current){
      // New personal best!
      bests[entry.exercise] = entry.value;
      db.collection('personalBests').doc(uid).set(bests, {merge:true});
      showToast('🎉 Neuer persönlicher Rekord: '+entry.value+' '+entry.unit+'!');
    }
  });
}

function showToast(msg){
  try{ toast(msg); } catch(e){
    var t = document.createElement('div');
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:12px 20px;border-radius:10px;font-size:13px;font-weight:600;z-index:99999;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 3000);
  }
}
