
// ── COMMUNITY CHALLENGE SYSTEM ────────────────────────────

var COMM_POST_COST_DIAMONDS = 3; // extra posts beyond 1/day

// ── POST MODAL ────────────────────────────────────────────
function showCommPostModal(){
  if(!currentUser){ toast('Bitte erst einloggen!'); return; }

  var today = new Date().toISOString().slice(0,10);
  var lastPost = null;
  try{ lastPost = localStorage.getItem('cali_comm_lastpost'); }catch(x){}
  var extraCost = (lastPost === today);

  var challengeData = {
    title:'', desc:'', difficulty:3,
    type:'once',
    typeParams:{},
    exercises:[],
    videoUrl:''
  };
  var currentStep = 1;

  var ov = document.createElement('div');
  ov.id = 'comm-post-overlay';
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--bg);border-radius:22px 22px 0 0;width:100%;max-width:480px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;';

  var header = document.createElement('div');
  header.style.cssText = 'padding:16px 20px 12px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var handleBar = document.createElement('div');
  handleBar.style.cssText = 'width:36px;height:4px;background:var(--border);border-radius:4px;margin:0 auto 14px;';
  var hdrRow = document.createElement('div');
  hdrRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;';
  var hdrTitle = document.createElement('div');
  hdrTitle.style.cssText = 'font-size:15px;font-weight:800;letter-spacing:2px;color:var(--text);';
  hdrTitle.textContent = 'CHALLENGE ERSTELLEN';
  var closeX = document.createElement('button');
  closeX.style.cssText = 'background:var(--bg3);border:none;border-radius:50%;width:28px;height:28px;font-size:16px;cursor:pointer;color:var(--muted);';
  closeX.textContent = '\u00D7';
  closeX.onclick = function(){ ov.remove(); };
  hdrRow.appendChild(hdrTitle); hdrRow.appendChild(closeX);
  var stepBar = document.createElement('div');
  stepBar.style.cssText = 'display:flex;gap:4px;';
  for(var si=1;si<=4;si++){
    var sd=document.createElement('div'); sd.id='step-dot-'+si;
    sd.style.cssText='flex:1;height:3px;border-radius:3px;background:'+(si===1?'var(--accent)':'var(--bg3)')+';transition:background 0.2s;';
    stepBar.appendChild(sd);
  }
  header.appendChild(handleBar); header.appendChild(hdrRow); header.appendChild(stepBar);
  box.appendChild(header);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:20px;';
  box.appendChild(content);

  var footer = document.createElement('div');
  footer.style.cssText = 'padding:12px 20px 24px;border-top:1px solid var(--border);flex-shrink:0;display:flex;gap:10px;';
  var backBtn = document.createElement('button');
  backBtn.style.cssText = 'flex:1;background:var(--bg3);color:var(--muted);border:1px solid var(--border);border-radius:12px;font-family:inherit;font-size:13px;font-weight:700;padding:14px;cursor:pointer;display:none;';
  backBtn.textContent = '\u2190 ZURÜCK';
  var nextBtn = document.createElement('button');
  nextBtn.style.cssText = 'flex:2;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:13px;font-weight:800;letter-spacing:2px;padding:14px;cursor:pointer;';
  nextBtn.textContent = 'WEITER \u2192';
  footer.appendChild(backBtn); footer.appendChild(nextBtn);
  box.appendChild(footer);

  function updateStepDots(step){
    for(var i=1;i<=4;i++){
      var d=document.getElementById('step-dot-'+i);
      if(d) d.style.background=i<=step?'var(--accent)':'var(--bg3)';
    }
  }

  function renderStep(step){
    content.innerHTML='';
    updateStepDots(step);
    backBtn.style.display=step>1?'block':'none';
    if(step===1) renderStep1();
    else if(step===2) renderStep2();
    else if(step===3) renderStep3();
    else if(step===4) renderStep4();
  }

  function lbl(t){ var d=document.createElement('div'); d.style.cssText='font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:6px;font-weight:700;'; d.textContent=t; return d; }
  function styledInp(id,ph,val){
    var i=document.createElement('input'); i.type='text'; i.id=id; i.placeholder=ph; i.value=val||'';
    i.style.cssText='width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 12px;font-family:inherit;font-size:13px;color:var(--text);outline:none;box-sizing:border-box;';
    return i;
  }

  function renderStep1(){
    hdrTitle.textContent='SCHRITT 1 \u2014 INFO';
    nextBtn.textContent='WEITER \u2192';
    var w1=document.createElement('div'); w1.style.marginBottom='14px';
    w1.appendChild(lbl('TITEL')); w1.appendChild(styledInp('ch-title','z.B. 100 Klimmzüge Non-Stop',challengeData.title));
    var w2=document.createElement('div'); w2.style.marginBottom='14px';
    w2.appendChild(lbl('BESCHREIBUNG'));
    var ta=document.createElement('textarea'); ta.id='ch-desc'; ta.placeholder='Erkläre die Challenge genau...'; ta.value=challengeData.desc||'';
    ta.style.cssText='width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 12px;font-family:inherit;font-size:13px;color:var(--text);outline:none;resize:none;height:90px;box-sizing:border-box;';
    w2.appendChild(ta);
    var w25=document.createElement('div'); w25.style.marginBottom='14px';
    w25.appendChild(lbl('ERKLÄR-VIDEO (optional)'));

    // Video file input (hidden, accepts camera or file)
    var vFileInp=document.createElement('input');
    vFileInp.type='file'; vFileInp.accept='video/*'; vFileInp.capture='environment';
    vFileInp.style.display='none'; vFileInp.id='ch-video-file';

    // Status display
    var vStatus=document.createElement('div'); vStatus.id='ch-video-status';
    vStatus.style.cssText='font-size:10px;color:var(--muted);margin-top:6px;min-height:16px;';
    if(challengeData.videoUrl){
      vStatus.innerHTML='<span style="color:var(--accent);">✓ Video hochgeladen</span>';
    }

    // Buttons row
    var vBtnRow=document.createElement('div'); vBtnRow.style.cssText='display:flex;gap:8px;';

    var vCamBtn=document.createElement('button');
    vCamBtn.type='button';
    vCamBtn.style.cssText='flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 8px;font-family:inherit;font-size:12px;font-weight:700;color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;';
    vCamBtn.innerHTML='<span style="font-size:16px;">📷</span> VIDEO AUFNEHMEN';
    vCamBtn.onclick=function(e){ e.preventDefault(); vFileInp.removeAttribute('capture'); vFileInp.setAttribute('capture','environment'); vFileInp.click(); };

    var vFileBtn=document.createElement('button');
    vFileBtn.type='button';
    vFileBtn.style.cssText='flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 8px;font-family:inherit;font-size:12px;font-weight:700;color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;';
    vFileBtn.innerHTML='<span style="font-size:16px;">📁</span> DATEI WÄHLEN';
    vFileBtn.onclick=function(e){ e.preventDefault(); vFileInp.removeAttribute('capture'); vFileInp.click(); };

    vFileInp.onchange=function(){
      var file=this.files[0]; if(!file) return;
      if(file.size > 200*1024*1024){ toast('Video zu groß! Max 200MB.'); return; }
      vStatus.innerHTML='⏳ Wird hochgeladen...';
      vCamBtn.disabled=true; vFileBtn.disabled=true;
      vCamBtn.style.opacity='0.5'; vFileBtn.style.opacity='0.5';
      var uid=currentUser?currentUser.uid:'anon';
      var ts=Date.now();
      var storageRef=firebase.storage().ref('challengeVideos/'+uid+'/'+ts+'_'+file.name);
      var uploadTask=storageRef.put(file);
      uploadTask.on('state_changed',
        function(snapshot){
          var pct=Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100);
          vStatus.innerHTML='⏳ '+pct+'% hochgeladen...';
        },
        function(err){
          vStatus.innerHTML='<span style="color:#ef4444;">Fehler: '+err.message+'</span>';
          vCamBtn.disabled=false; vFileBtn.disabled=false;
          vCamBtn.style.opacity='1'; vFileBtn.style.opacity='1';
        },
        function(){
          uploadTask.snapshot.ref.getDownloadURL().then(function(url){
            challengeData.videoUrl=url;
            vStatus.innerHTML='<span style="color:var(--accent);">✓ Video hochgeladen!</span>';
            vCamBtn.disabled=false; vFileBtn.disabled=false;
            vCamBtn.style.opacity='1'; vFileBtn.style.opacity='1';
            vCamBtn.innerHTML='<span style="font-size:16px;">📷</span> NEU AUFNEHMEN';
            vFileBtn.innerHTML='<span style="font-size:16px;">📁</span> ANDERE DATEI';
          });
        }
      );
    };

    vBtnRow.appendChild(vCamBtn); vBtnRow.appendChild(vFileBtn);
    w25.appendChild(vBtnRow); w25.appendChild(vFileInp); w25.appendChild(vStatus);

    var w3=document.createElement('div');
    w3.appendChild(lbl('SCHWIERIGKEIT'));
    var dr=document.createElement('div'); dr.style.cssText='display:flex;gap:6px;';
    for(var d=1;d<=5;d++){
      (function(dv){
        var b=document.createElement('button'); b.id='diff-btn-'+dv;
        b.style.cssText='flex:1;padding:9px 0;border-radius:8px;border:1px solid '+(dv===challengeData.difficulty?'rgba(255,85,0,0.4)':'var(--border)')+';background:'+(dv===challengeData.difficulty?'rgba(255,85,0,0.12)':'var(--bg3)')+';font-family:inherit;font-size:13px;cursor:pointer;color:'+(dv===challengeData.difficulty?'var(--accent)':'var(--muted)')+';';
        b.textContent='\u2605'.repeat(dv);
        b.onclick=function(){
          challengeData.difficulty=dv;
          for(var i=1;i<=5;i++){var bb=document.getElementById('diff-btn-'+i);if(bb){bb.style.background=i===dv?'rgba(255,85,0,0.12)':'var(--bg3)';bb.style.borderColor=i===dv?'rgba(255,85,0,0.4)':'var(--border)';bb.style.color=i===dv?'var(--accent)':'var(--muted)';}}
        };
        dr.appendChild(b);
      })(d);
    }
    w3.appendChild(dr);
    content.appendChild(w1); content.appendChild(w2); content.appendChild(w25); content.appendChild(w3);
  }

  function renderStep2(){
    hdrTitle.textContent='SCHRITT 2 \u2014 TYP';
    var types=[
      {id:'once',icon:'&#127937;',label:'EINMALIG',desc:'Einmal vollständig schaffen'},
      {id:'weekly',icon:'&#128197;',label:'WÖCHENTLICH',desc:'X mal pro Woche trainieren'},
      {id:'timed',icon:'&#9201;',label:'ZEITLIMIT',desc:'Alles in X Minuten schaffen'},
      {id:'streak',icon:'&#128293;',label:'STREAK',desc:'X Tage in Folge trainieren'},
    ];
    types.forEach(function(t){
      var card=document.createElement('div'); card.id='type-card-'+t.id;
      var sel=challengeData.type===t.id;
      card.style.cssText='display:flex;align-items:center;gap:12px;padding:14px;border-radius:12px;border:1.5px solid '+(sel?'var(--accent)':'var(--border)')+';background:'+(sel?'rgba(255,85,0,0.06)':'var(--bg2)')+';cursor:pointer;margin-bottom:8px;';
      card.innerHTML='<div style="font-size:24px;">'+t.icon+'</div><div><div style="font-size:13px;font-weight:800;color:var(--text);letter-spacing:1px;">'+t.label+'</div><div style="font-size:11px;color:var(--muted);">'+t.desc+'</div></div>';
      card.onclick=function(){
        challengeData.type=t.id;
        types.forEach(function(tt){var c=document.getElementById('type-card-'+tt.id);if(c){c.style.borderColor=tt.id===t.id?'var(--accent)':'var(--border)';c.style.background=tt.id===t.id?'rgba(255,85,0,0.06)':'var(--bg2)';}});
        renderTypeParams(t.id);
      };
      content.appendChild(card);
    });
    var pw=document.createElement('div'); pw.id='type-params-wrap'; content.appendChild(pw);
    renderTypeParams(challengeData.type);
  }

  function renderTypeParams(type){
    var wrap=document.getElementById('type-params-wrap'); if(!wrap) return; wrap.innerHTML='';
    function numI(id,l,ph,val){
      var w=document.createElement('div'); w.style.marginTop='12px';
      var lb=document.createElement('div'); lb.style.cssText='font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:6px;font-weight:700;'; lb.textContent=l;
      var i=document.createElement('input'); i.type='number'; i.id=id; i.placeholder=ph; i.value=val||'';
      i.style.cssText='width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:11px 12px;font-family:inherit;font-size:13px;color:var(--text);outline:none;box-sizing:border-box;';
      w.appendChild(lb); w.appendChild(i); return w;
    }
    if(type==='weekly') wrap.appendChild(numI('tp-days','TRAININGS PRO WOCHE','z.B. 3',challengeData.typeParams.days));
    if(type==='timed')  wrap.appendChild(numI('tp-minutes','ZEITLIMIT (MINUTEN)','z.B. 20',challengeData.typeParams.minutes));
    if(type==='streak') wrap.appendChild(numI('tp-streak','STREAK-TAGE','z.B. 7',challengeData.typeParams.streakDays));
  }

  function renderStep3(){
    hdrTitle.textContent='SCHRITT 3 \u2014 ÜBUNGEN';
    content.innerHTML='';
    // Option: no exercises (free text challenge)
    var freeToggle=document.createElement('div');
    freeToggle.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg2);border-radius:10px;margin-bottom:12px;';
    freeToggle.innerHTML='<div style="font-size:12px;font-weight:700;color:var(--text);">Freie Challenge (ohne Übungen)</div>';
    var ftBtn=document.createElement('button');
    ftBtn.style.cssText='width:40px;height:22px;border-radius:11px;border:none;cursor:pointer;background:'+(challengeData.freeChallenge?'var(--accent)':'#ccc')+';position:relative;';
    ftBtn.innerHTML='<div style="position:absolute;top:2px;'+(challengeData.freeChallenge?'right:2px':'left:2px')+';width:18px;height:18px;border-radius:50%;background:#fff;"></div>';
    ftBtn.onclick=function(){challengeData.freeChallenge=!challengeData.freeChallenge;renderStep3();};
    freeToggle.appendChild(ftBtn); content.appendChild(freeToggle);
    if(challengeData.freeChallenge){
      var freeDesc=document.createElement('div');
      freeDesc.style.cssText='background:rgba(255,85,0,0.08);border:1px solid rgba(255,85,0,0.2);border-radius:10px;padding:12px;margin-bottom:12px;font-size:12px;color:var(--muted);';
      freeDesc.innerHTML='&#128204; Die Challenge hat keine festen Übungen. Beschreib sie in Schritt 2.';
      content.appendChild(freeDesc);
      return;
    }
    var addBtn=document.createElement('button');
    addBtn.style.cssText='width:100%;background:rgba(255,85,0,0.08);color:var(--accent);border:1.5px dashed rgba(255,85,0,0.4);border-radius:12px;font-family:inherit;font-size:13px;font-weight:800;padding:13px;cursor:pointer;margin-bottom:14px;';
    addBtn.textContent='+ ÜBUNG HINZUFÜGEN';
    addBtn.onclick=function(){
      challengeData.exercises.push({name:'',sets:3,reps:10,rest:60,notes:'',bandAllowed:false});
      renderStep3();
    };
    content.appendChild(addBtn);
    content._step3Built = true;
    var exList=document.createElement('div'); exList.id='ch-ex-list'; content.appendChild(exList);
    if(challengeData.exercises.length===0){
      var hint=document.createElement('div'); hint.style.cssText='text-align:center;padding:20px 0;font-size:12px;color:var(--muted);';
      hint.innerHTML='&#128170; Füge mindestens eine Übung hinzu'; exList.appendChild(hint);
    } else {
      challengeData.exercises.forEach(function(ex,idx){ renderExCard(ex,idx,exList); });
    }
  }

  function renderExCard(ex, idx, exList){
    var card=document.createElement('div'); card.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px;';
    var hRow=document.createElement('div'); hRow.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
    var ht=document.createElement('div'); ht.style.cssText='font-size:11px;font-weight:800;color:var(--accent);letter-spacing:2px;'; ht.textContent='ÜBUNG '+(idx+1);
    var delBtn=document.createElement('button'); delBtn.style.cssText='background:rgba(255,50,50,0.1);color:#ff4444;border:1px solid rgba(255,50,50,0.2);border-radius:6px;font-size:11px;padding:4px 10px;cursor:pointer;font-family:inherit;'; delBtn.textContent='\u00D7 ENTFERNEN';
    delBtn.onclick=function(){challengeData.exercises.splice(idx,1);renderStep3();};
    hRow.appendChild(ht); hRow.appendChild(delBtn); card.appendChild(hRow);

    var nw=document.createElement('div'); nw.style.marginBottom='10px';
    nw.appendChild(lbl('ÜBUNG'));
    var ni=document.createElement('input'); ni.type='text'; ni.value=ex.name||''; ni.placeholder='z.B. Klimmzüge'; ni.setAttribute('list','exdl-'+idx);
    ni.style.cssText='width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 11px;font-family:inherit;font-size:12px;color:var(--text);outline:none;box-sizing:border-box;';
    ni.oninput=function(){challengeData.exercises[idx].name=this.value;};
    var dl=document.createElement('datalist'); dl.id='exdl-'+idx;
    ['Klimmzüge','Dips','Liegestütze','Muscle-Up','Plank','L-Sit','Handstand','Front Lever','Dragon Flag','Hollow Body','Push-Up','Trizeps-Dips','Kniebeugen','Burpees','Mountain Climbers'].forEach(function(n){var o=document.createElement('option');o.value=n;dl.appendChild(o);});
    nw.appendChild(ni); nw.appendChild(dl); card.appendChild(nw);

    var sr=document.createElement('div'); sr.style.cssText='display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;';
    function mi(fld,lb,val,ph){
      var w=document.createElement('div');
      var l=document.createElement('div'); l.style.cssText='font-size:8px;letter-spacing:1px;color:var(--muted);margin-bottom:4px;'; l.textContent=lb;
      var i=document.createElement('input'); i.type='number'; i.value=val||''; i.placeholder=ph||'';
      i.style.cssText='width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 10px;font-family:inherit;font-size:12px;color:var(--text);outline:none;box-sizing:border-box;';
      i.oninput=(function(f){return function(){challengeData.exercises[idx][f]=parseInt(this.value)||0;};})(fld);
      w.appendChild(l); w.appendChild(i); return w;
    }
    sr.appendChild(mi('sets','SÄTZE',ex.sets,'3')); sr.appendChild(mi('reps','WDHL.',ex.reps,'10')); sr.appendChild(mi('rest','PAUSE SEK',ex.rest,'60'));
    card.appendChild(sr);

    var now=document.createElement('div'); now.style.marginBottom='10px';
    now.appendChild(lbl('AUSFÜHRUNG (optional)'));
    var nta=document.createElement('textarea'); nta.value=ex.notes||''; nta.placeholder='z.B. volle Streckung, kein Schwung...';
    nta.style.cssText='width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 11px;font-family:inherit;font-size:12px;color:var(--text);outline:none;resize:none;height:55px;box-sizing:border-box;';
    nta.oninput=function(){challengeData.exercises[idx].notes=this.value;};
    now.appendChild(nta); card.appendChild(now);

    var br=document.createElement('div'); br.style.cssText='display:flex;align-items:center;justify-content:space-between;';
    var bl=document.createElement('div'); bl.style.cssText='font-size:11px;color:var(--muted);'; bl.textContent='Gummiband erlaubt';
    var bt=document.createElement('button');
    bt.style.cssText='width:40px;height:22px;border-radius:11px;border:none;cursor:pointer;background:'+(ex.bandAllowed?'var(--accent)':'#ccc')+';position:relative;transition:background 0.2s;';
    bt.innerHTML='<div style="position:absolute;top:2px;'+(ex.bandAllowed?'right:2px':'left:2px')+';width:18px;height:18px;border-radius:50%;background:#fff;"></div>';
    bt.onclick=function(){challengeData.exercises[idx].bandAllowed=!challengeData.exercises[idx].bandAllowed;renderStep3();};
    br.appendChild(bl); br.appendChild(bt); card.appendChild(br);
    exList.appendChild(card);
  }

  function renderStep4(){
    hdrTitle.textContent='SCHRITT 4 \u2014 VORSCHAU';
    nextBtn.textContent=extraCost?'POSTEN (3 \uD83D\uDC8E)':'POSTEN (KOSTENLOS)';
    var typeIcons={once:'&#127937;',weekly:'&#128197;',timed:'&#9201;',streak:'&#128293;'};
    var typeLabels={once:'Einmalig',weekly:'Wöchentlich',timed:'Zeitlimit',streak:'Streak'};
    var card=document.createElement('div');
    card.style.cssText='background:var(--bg2);border:1.5px solid var(--border);border-radius:16px;padding:18px;margin-bottom:14px;';
    card.innerHTML=
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">'+
      '<div style="font-size:28px;">'+typeIcons[challengeData.type]+'</div>'+
      '<div><div style="font-size:16px;font-weight:800;color:var(--text);">'+challengeData.title+'</div>'+
      '<div style="font-size:10px;color:var(--muted);">'+typeLabels[challengeData.type]+' \u00B7 '+'\u2605'.repeat(challengeData.difficulty)+'\u2606'.repeat(5-challengeData.difficulty)+'</div></div></div>'+
      '<div style="font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:10px;">'+challengeData.desc+'</div>';
    if(challengeData.exercises.length>0){
      var et=document.createElement('div'); et.style.cssText='font-size:9px;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:8px;'; et.textContent=challengeData.exercises.length+' ÜBUNGEN';
      card.appendChild(et);
      challengeData.exercises.forEach(function(ex){
        var r=document.createElement('div'); r.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;';
        r.innerHTML='<div style="font-weight:700;color:var(--text);flex:1;">'+ex.name+'</div><div style="color:var(--muted);">'+ex.sets+'\u00D7'+ex.reps+'</div><div style="color:var(--muted);font-size:10px;">'+ex.rest+'s</div>';
        if(ex.bandAllowed){var b=document.createElement('div');b.style.cssText='font-size:9px;background:rgba(255,85,0,0.1);color:var(--accent);border-radius:4px;padding:2px 6px;';b.textContent='Band OK';r.appendChild(b);}
        card.appendChild(r);
        if(ex.notes){var n=document.createElement('div');n.style.cssText='font-size:10px;color:var(--muted);font-style:italic;padding:3px 0;';n.textContent=ex.notes;card.appendChild(n);}
      });
    }
    content.appendChild(card);
    if(challengeData.videoUrl){
      var vPrev=document.createElement('div'); vPrev.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:12px;display:flex;align-items:center;gap:10px;';
      var vIcon=document.createElement('div'); vIcon.style.cssText='font-size:20px;flex-shrink:0;'; vIcon.textContent='\uD83C\uDFA5';
      var vInfo=document.createElement('div'); vInfo.style.cssText='flex:1;min-width:0;';
      var vLbl=document.createElement('div'); vLbl.style.cssText='font-size:9px;letter-spacing:2px;color:var(--accent);font-weight:700;margin-bottom:3px;'; vLbl.textContent='ERKLÄR-VIDEO';
      var vLink=document.createElement('a'); vLink.href=challengeData.videoUrl; vLink.target='_blank'; vLink.style.cssText='font-size:11px;color:var(--text);word-break:break-all;text-decoration:underline;'; vLink.textContent=challengeData.videoUrl;
      vInfo.appendChild(vLbl); vInfo.appendChild(vLink);
      vPrev.appendChild(vIcon); vPrev.appendChild(vInfo);
      content.appendChild(vPrev);
    }
    var cn=document.createElement('div'); cn.style.cssText='font-size:11px;color:var(--muted);text-align:center;';
    cn.innerHTML=extraCost?'Kostet 3 \uD83D\uDC8E (heute bereits gepostet)':'Heute kostenlos \u2713';
    content.appendChild(cn);
  }

  function saveCurrentStep(){
    if(currentStep===1){
      var t=document.getElementById('ch-title'); if(t) challengeData.title=t.value.trim();
      var d=document.getElementById('ch-desc');  if(d) challengeData.desc=d.value.trim();
      // videoUrl is saved directly via Firebase upload callback
    }
    if(currentStep===2){
      var days=document.getElementById('tp-days'); if(days) challengeData.typeParams.days=parseInt(days.value)||0;
      var mins=document.getElementById('tp-minutes'); if(mins) challengeData.typeParams.minutes=parseInt(mins.value)||0;
      var stk=document.getElementById('tp-streak'); if(stk) challengeData.typeParams.streakDays=parseInt(stk.value)||0;
    }
  }

  nextBtn.onclick=function(){
    saveCurrentStep();
    if(currentStep===1){
      if(!challengeData.title||challengeData.title.length<3){toast('Titel zu kurz!');return;}
      if(!challengeData.desc||challengeData.desc.length<10){toast('Beschreibung zu kurz!');return;}
    }
    if(currentStep===3&&challengeData.exercises.length===0&&!challengeData.freeChallenge){toast('Mindestens eine Übung oder Freie Challenge aktivieren!');return;}
    if(currentStep===4){postChallenge();return;}
    currentStep++;
    renderStep(currentStep);
  };

  backBtn.onclick=function(){
    saveCurrentStep();
    currentStep--;
    renderStep(currentStep);
  };

  function postChallenge(){
    if(extraCost){
      if(currency.diamonds<COMM_POST_COST_DIAMONDS){toast('Nicht genug \uD83D\uDC8E!');return;}
      currency.diamonds-=COMM_POST_COST_DIAMONDS; saveCurrency();
    }
    try{localStorage.setItem('cali_comm_lastpost',today);}catch(x){}
    var postData={
      uid:currentUser.uid, authorName:(prData&&prData.name)?prData.name:'Athlet',
      title:challengeData.title, desc:challengeData.desc,
      difficulty:challengeData.difficulty, type:challengeData.type,
      typeParams:challengeData.typeParams, exercises:challengeData.exercises,
      videoUrl:challengeData.videoUrl||'',
      likes:[], comments:[], createdAt:new Date().toISOString()
    };
    nextBtn.textContent='...'; nextBtn.disabled=true;
    db.collection('communityChallenges').add(postData)
      .then(function(){ov.remove();toast('\uD83C\uDF89 Challenge gepostet!');loadCommFeed();})
      .catch(function(){toast('Fehler. Bitte nochmal.');nextBtn.textContent='POSTEN';nextBtn.disabled=false;});
  }

  ov.appendChild(box);
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  document.body.appendChild(ov);
  renderStep(1);
}


// ── LOAD & RENDER FEED ────────────────────────────────────
function loadCommFeed(){
  var feedEl = document.getElementById('comm-feed');
  if(!feedEl) return;

  feedEl.innerHTML = '<div style="text-align:center;padding:20px 0;font-size:12px;color:var(--muted);">Wird geladen...</div>';

  if(!currentUser){
    feedEl.innerHTML = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;font-size:12px;color:var(--muted);">Einloggen um Community Challenges zu sehen.</div>';
    return;
  }

  db.collection('communityChallenges')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get()
    .then(function(snap){
      feedEl.innerHTML = '';
      if(snap.empty){
        feedEl.innerHTML = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center;"><div style="font-size:22px;margin-bottom:8px;">\uD83C\uDFC6</div><div style="font-size:12px;color:var(--muted);">Noch keine Community Challenges. Sei der Erste!</div></div>';
        return;
      }
      snap.forEach(function(doc){
        var data = doc.data();
        feedEl.appendChild(buildCommCard(doc.id, data));
      });
    })
    .catch(function(e){
      feedEl.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:12px 0;">Fehler beim Laden.</div>';
      console.log('Feed error:', e);
    });
}

function buildCommCard(docId, data){
  var card = document.createElement('div');
  card.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:10px;';

  // Header row
  var hdRow = document.createElement('div');
  hdRow.style.cssText = 'display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px;';

  var left = document.createElement('div');
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:15px;font-weight:800;letter-spacing:1px;color:var(--text);line-height:1.3;';
  titleEl.textContent = data.title;

  var meta = document.createElement('div');
  meta.style.cssText = 'font-size:10px;color:var(--muted);margin-top:3px;';
  var dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}) : '';
  meta.textContent = (data.authorName || 'Athlet') + ' \u00B7 ' + dateStr;

  left.appendChild(titleEl);
  left.appendChild(meta);

  // Difficulty stars
  var stars = document.createElement('div');
  stars.style.cssText = 'font-size:12px;color:var(--accent);flex-shrink:0;margin-left:8px;';
  stars.textContent = '\u2605'.repeat(data.difficulty || 3) + '\u2606'.repeat(5-(data.difficulty||3));

  hdRow.appendChild(left);
  hdRow.appendChild(stars);
  card.appendChild(hdRow);

  // Description
  if(data.desc){
    var descEl = document.createElement('div');
    descEl.style.cssText = 'font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:10px;';
    descEl.textContent = data.desc;
    card.appendChild(descEl);
  }

  // Video link
  if(data.videoUrl){
    var vRow = document.createElement('a');
    vRow.href = data.videoUrl; vRow.target = '_blank';
    vRow.style.cssText = 'display:flex;align-items:center;gap:8px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:8px 12px;margin-bottom:10px;text-decoration:none;';
    var vIco = document.createElement('span'); vIco.style.cssText='font-size:16px;flex-shrink:0;'; vIco.textContent='\uD83C\uDFA5';
    var vTxt = document.createElement('span'); vTxt.style.cssText='font-size:11px;color:var(--accent);font-weight:700;letter-spacing:1px;'; vTxt.textContent='ERKLÄR-VIDEO ANSEHEN';
    vRow.appendChild(vIco); vRow.appendChild(vTxt);
    card.appendChild(vRow);
  }

  // Exercises tag
  if(data.exercises){
    var exTag = document.createElement('div');
    exTag.style.cssText = 'display:inline-block;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:3px 10px;font-size:10px;color:var(--muted);margin-bottom:10px;';
    exTag.textContent = '\uD83D\uDCAA ' + data.exercises;
    card.appendChild(exTag);
  }

  // Action row: like, try, comment
  var actRow = document.createElement('div');
  actRow.style.cssText = 'display:flex;gap:8px;align-items:center;border-top:1px solid var(--border);padding-top:10px;margin-top:4px;flex-wrap:wrap;';

  // Like button
  var liked = currentUser && data.likes && data.likes.indexOf(currentUser.uid) > -1;
  var likeBtn = document.createElement('button');
  likeBtn.style.cssText = 'display:flex;align-items:center;gap:4px;background:' + (liked?'rgba(255,85,0,0.12)':'var(--bg3)') + ';border:1px solid ' + (liked?'rgba(255,85,0,0.35)':'var(--border)') + ';border-radius:8px;padding:7px 12px;font-family:inherit;font-size:12px;color:' + (liked?'var(--accent)':'var(--muted)') + ';cursor:pointer;';
  likeBtn.innerHTML = '\uD83D\uDC4D <span>' + ((data.likes||[]).length) + '</span>';
  likeBtn.onclick = function(){
    if(!currentUser){ toast('Einloggen zum Liken!'); return; }
    var ref = db.collection('communityChallenges').doc(docId);
    if(liked){
      ref.update({ likes: firebase.firestore.FieldValue.arrayRemove(currentUser.uid) })
        .then(function(){ loadCommFeed(); });
    } else {
      ref.update({ likes: firebase.firestore.FieldValue.arrayUnion(currentUser.uid) })
        .then(function(){ loadCommFeed(); });
    }
    liked = !liked;
  };

  // Try button
  var tryBtn = document.createElement('button');
  tryBtn.style.cssText = 'flex:1;background:rgba(255,85,0,0.08);color:var(--accent);border:1px solid rgba(255,85,0,0.3);border-radius:8px;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:7px 12px;cursor:pointer;';
  tryBtn.textContent = 'AUSPROBIEREN';
  tryBtn.onclick = function(){
    activeChallenge = {
      id: 'comm_'+docId,
      title: data.title,
      desc: data.desc,
      icon: '\uD83C\uDF1F',
      type: 'community',
      params: { target: 1, metric: 'manual' },
      startDate: new Date().toISOString().slice(0,10),
      progress: 0
    };
    saveChallenges();
    buildChallengeUI();
    toast('\uD83D\uDE80 Challenge gestartet!');
    // Scroll up to active challenge
    document.getElementById('page-ch').scrollTop = 0;
  };

  // Comment toggle button
  var commBtn = document.createElement('button');
  var commCount = (data.comments||[]).length;
  commBtn.style.cssText = 'display:flex;align-items:center;gap:4px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:7px 12px;font-family:inherit;font-size:12px;color:var(--muted);cursor:pointer;';
  commBtn.innerHTML = '\uD83D\uDCAC <span>' + commCount + '</span>';

  actRow.appendChild(likeBtn);
  actRow.appendChild(tryBtn);
  actRow.appendChild(commBtn);
  card.appendChild(actRow);

  // Comment section (hidden by default)
  var commSection = document.createElement('div');
  commSection.style.cssText = 'display:none;margin-top:12px;';

  commBtn.onclick = function(){
    var isOpen = commSection.style.display !== 'none';
    commSection.style.display = isOpen ? 'none' : 'block';
    if(!isOpen) buildCommSection(commSection, docId, data);
  };

  card.appendChild(commSection);
  return card;
}

function buildCommSection(el, docId, data){
  el.innerHTML = '';
  var comments = data.comments || [];

  // Existing comments
  if(comments.length === 0){
    var empty2 = document.createElement('div');
    empty2.style.cssText = 'font-size:11px;color:var(--muted);padding:6px 0 10px;';
    empty2.textContent = 'Noch keine Kommentare.';
    el.appendChild(empty2);
  } else {
    for(var i=0;i<comments.length;i++){
      var c = comments[i];
      var row = document.createElement('div');
      row.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--border);';
      var cname = document.createElement('div');
      cname.style.cssText = 'font-size:10px;font-weight:700;color:var(--accent);margin-bottom:2px;';
      cname.textContent = c.authorName || 'Athlet';
      var ctxt = document.createElement('div');
      ctxt.style.cssText = 'font-size:12px;color:var(--text);line-height:1.5;';
      ctxt.textContent = c.text;
      row.appendChild(cname);
      row.appendChild(ctxt);
      el.appendChild(row);
    }
  }

  // New comment input
  if(!currentUser) return;
  var inp2 = document.createElement('div');
  inp2.style.cssText = 'display:flex;gap:8px;margin-top:10px;';
  var txta = document.createElement('input');
  txta.type = 'text';
  txta.maxLength = 200;
  txta.placeholder = 'Kommentar schreiben...';
  txta.style.cssText = 'flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-family:inherit;font-size:12px;color:var(--text);outline:none;';
  var sendBtn = document.createElement('button');
  sendBtn.style.cssText = 'background:var(--accent);color:#000;border:none;border-radius:8px;font-family:inherit;font-size:11px;font-weight:800;padding:9px 14px;cursor:pointer;white-space:nowrap;';
  sendBtn.textContent = 'OK';
  sendBtn.onclick = function(){
    var txt = txta.value.trim();
    if(txt.length < 2){ toast('Kommentar zu kurz!'); return; }
    var newComment = {
      uid: currentUser.uid,
      authorName: (prData && prData.name) ? prData.name : 'Athlet',
      text: txt.slice(0,200),
      createdAt: new Date().toISOString()
    };
    db.collection('communityChallenges').doc(docId).update({
      comments: firebase.firestore.FieldValue.arrayUnion(newComment)
    }).then(function(){
      txta.value = '';
      toast('Kommentar gepostet!');
      loadCommFeed();
    }).catch(function(){ toast('Fehler beim Kommentieren.'); });
  };
  inp2.appendChild(txta);
  inp2.appendChild(sendBtn);
  el.appendChild(inp2);
}

// ── Auto-load cards when challenge page opens ──────────────
var _origGoPage = goPage;
goPage = function(p){
  _origGoPage(p);
  if(p === 'ch'){
    setTimeout(buildChCards, 100);
  }
};
