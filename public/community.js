
// ── COMMUNITY CHALLENGE SYSTEM ────────────────────────────

var COMM_POST_COST_DIAMONDS = 3; // extra posts beyond 1/day

// Line icons for icon slots (stroke currentColor, 1.5) — no emoji in the Dark-Mono design.
var COMM_ICONS = {
  once:     '<path d="M5 21V4M5 4h13l-2.5 4L18 12H5"/>',
  weekly:   '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  timed:    '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
  streak:   '<path d="M12 3c1 4-4 5-4 9a4 4 0 008 0c0-1.5-1-2-1-3.5 2 1 3 3 3 5.5a6 6 0 01-12 0C6 9 9 7 12 3z"/>',
  video:    '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
  camera:   '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  file:     '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  user:     '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/>',
  like:     '<path d="M7 11v9H4a1 1 0 01-1-1v-7a1 1 0 011-1h3zm0 0l4-8a2 2 0 012 2v4h5a2 2 0 012 2.3l-1.2 6a2 2 0 01-2 1.7H7"/>',
  comment:  '<path d="M4 5h16v11H9l-5 4V5z"/>',
  trophy:   '<path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 5H4a3 3 0 003 3M17 5h3a3 3 0 01-3 3"/><path d="M12 13v3M9 20h6"/>',
  dumbbell: '<path d="M4 9v6M2 10v4M20 9v6M22 10v4M7 12h10"/><rect x="5" y="8" width="3" height="8" rx="1"/><rect x="16" y="8" width="3" height="8" rx="1"/>'
};
function commIcon(name, size){
  var s = size || 18;
  return '<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0;" aria-hidden="true">'+(COMM_ICONS[name]||'')+'</svg>';
}

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
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:flex-end;justify-content:center;';

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--card);border-top:1px solid var(--line2);border-radius:var(--r-card) var(--r-card) 0 0;width:100%;max-width:480px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;';

  var header = document.createElement('div');
  header.style.cssText = 'padding:12px 16px;border-bottom:1px solid var(--line);flex-shrink:0;';
  var handleBar = document.createElement('div');
  handleBar.className = 'sheet-grip';
  var hdrRow = document.createElement('div');
  hdrRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;';
  var hdrTitle = document.createElement('div');
  hdrTitle.className = 'ttl';
  hdrTitle.textContent = 'Challenge erstellen';
  var closeX = document.createElement('button');
  closeX.type = 'button';
  closeX.className = 'icon-btn sm pressable';
  closeX.textContent = '×';
  closeX.setAttribute('aria-label', 'Schließen');
  closeX.onclick = function(){ ov.remove(); };
  hdrRow.appendChild(hdrTitle); hdrRow.appendChild(closeX);
  var stepLbl = document.createElement('div');
  stepLbl.className = 'eyebrow';
  stepLbl.style.cssText = 'margin-bottom:8px;';
  stepLbl.textContent = 'Schritt 1 von 4 — Info';
  var stepBar = document.createElement('div');
  stepBar.style.cssText = 'display:flex;gap:4px;';
  for(var si=1;si<=4;si++){
    var sd=document.createElement('div'); sd.id='step-dot-'+si;
    sd.style.cssText='flex:1;height:3px;background:'+(si===1?'var(--accent)':'var(--line2)')+';transition:background var(--dur-med) var(--ease-out);';
    stepBar.appendChild(sd);
  }
  header.appendChild(handleBar); header.appendChild(hdrRow); header.appendChild(stepLbl); header.appendChild(stepBar);
  box.appendChild(header);

  var content = document.createElement('div');
  content.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
  content.classList.add('sheet-scroll');
  box.appendChild(content);

  var footer = document.createElement('div');
  footer.style.cssText = 'padding:12px 16px calc(16px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);flex-shrink:0;display:flex;gap:10px;';
  var backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'btn-g pressable';
  backBtn.style.cssText = 'flex:1;min-height:48px;display:none;';
  backBtn.textContent = '← Zurück';
  var nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'btn pressable';
  nextBtn.style.cssText = 'flex:2;width:auto;margin:0;';
  nextBtn.textContent = 'Weiter →';
  footer.appendChild(backBtn); footer.appendChild(nextBtn);
  box.appendChild(footer);

  function updateStepDots(step){
    for(var i=1;i<=4;i++){
      var d=document.getElementById('step-dot-'+i);
      if(d) d.style.background=i<=step?'var(--accent)':'var(--line2)';
    }
  }

  function renderStep(step){
    content.innerHTML='';
    updateStepDots(step);
    backBtn.style.display=step>1?'inline-flex':'none';
    if(step===1) renderStep1();
    else if(step===2) renderStep2();
    else if(step===3) renderStep3();
    else if(step===4) renderStep4();
  }

  function lbl(t){ var d=document.createElement('div'); d.className='lbl'; d.style.cssText='margin:0 0 6px;'; d.textContent=t; return d; }
  function styledInp(id,ph,val){
    var i=document.createElement('input'); i.type='text'; i.id=id; i.placeholder=ph; i.value=val||'';
    i.className='inp';
    return i;
  }

  function renderStep1(){
    stepLbl.textContent='Schritt 1 von 4 — Info';
    nextBtn.textContent='Weiter →';
    var w1=document.createElement('div'); w1.style.marginBottom='14px';
    w1.appendChild(lbl('Titel')); w1.appendChild(styledInp('ch-title','z.B. 100 Klimmzüge Non-Stop',challengeData.title));
    var w2=document.createElement('div'); w2.style.marginBottom='14px';
    w2.appendChild(lbl('Beschreibung'));
    var ta=document.createElement('textarea'); ta.id='ch-desc'; ta.placeholder='Erkläre die Challenge genau...'; ta.value=challengeData.desc||'';
    ta.className='inp';
    ta.style.cssText='resize:none;height:90px;';
    w2.appendChild(ta);
    var w25=document.createElement('div'); w25.style.marginBottom='14px';
    w25.appendChild(lbl('Erklär-Video (optional)'));

    // Video file input (hidden, accepts camera or file)
    var vFileInp=document.createElement('input');
    vFileInp.type='file'; vFileInp.accept='video/*'; vFileInp.capture='environment';
    vFileInp.style.display='none'; vFileInp.id='ch-video-file';

    // Status display
    var vStatus=document.createElement('div'); vStatus.id='ch-video-status';
    vStatus.style.cssText='font-size:11px;color:var(--muted);margin-top:8px;min-height:16px;';
    if(challengeData.videoUrl){
      vStatus.innerHTML='<span style="color:var(--success);">✓ Video hochgeladen</span>';
    }

    // Buttons row
    var vBtnRow=document.createElement('div'); vBtnRow.style.cssText='display:flex;gap:8px;';

    var vCamBtn=document.createElement('button');
    vCamBtn.type='button';
    vCamBtn.className='btn-g pressable';
    vCamBtn.style.cssText='flex:1;min-height:44px;';
    vCamBtn.innerHTML=commIcon('camera',16)+'<span>Video aufnehmen</span>';
    vCamBtn.onclick=function(e){ e.preventDefault(); vFileInp.removeAttribute('capture'); vFileInp.setAttribute('capture','environment'); vFileInp.click(); };

    var vFileBtn=document.createElement('button');
    vFileBtn.type='button';
    vFileBtn.className='btn-g pressable';
    vFileBtn.style.cssText='flex:1;min-height:44px;';
    vFileBtn.innerHTML=commIcon('file',16)+'<span>Datei wählen</span>';
    vFileBtn.onclick=function(e){ e.preventDefault(); vFileInp.removeAttribute('capture'); vFileInp.click(); };

    vFileInp.onchange=function(){
      var file=this.files[0]; if(!file) return;
      if(file.size > 200*1024*1024){ toast('Video zu groß! Max 200MB.'); return; }
      vStatus.innerHTML='Wird hochgeladen...';
      vCamBtn.disabled=true; vFileBtn.disabled=true;
      vCamBtn.style.opacity='0.5'; vFileBtn.style.opacity='0.5';
      var uid=currentUser?currentUser.uid:'anon';
      var ts=Date.now();
      var storageRef=firebase.storage().ref('challengeVideos/'+uid+'/'+ts+'_'+file.name);
      var uploadTask=storageRef.put(file);
      uploadTask.on('state_changed',
        function(snapshot){
          var pct=Math.round((snapshot.bytesTransferred/snapshot.totalBytes)*100);
          vStatus.innerHTML='<span class="num">'+pct+'%</span> hochgeladen...';
        },
        function(err){
          vStatus.innerHTML='<span style="color:var(--red);">Fehler: '+err.message+'</span>';
          vCamBtn.disabled=false; vFileBtn.disabled=false;
          vCamBtn.style.opacity='1'; vFileBtn.style.opacity='1';
        },
        function(){
          uploadTask.snapshot.ref.getDownloadURL().then(function(url){
            challengeData.videoUrl=url;
            vStatus.innerHTML='<span style="color:var(--success);">✓ Video hochgeladen!</span>';
            vCamBtn.disabled=false; vFileBtn.disabled=false;
            vCamBtn.style.opacity='1'; vFileBtn.style.opacity='1';
            vCamBtn.innerHTML=commIcon('camera',16)+'<span>Neu aufnehmen</span>';
            vFileBtn.innerHTML=commIcon('file',16)+'<span>Andere Datei</span>';
          });
        }
      );
    };

    vBtnRow.appendChild(vCamBtn); vBtnRow.appendChild(vFileBtn);
    w25.appendChild(vBtnRow); w25.appendChild(vFileInp); w25.appendChild(vStatus);

    var w3=document.createElement('div');
    w3.appendChild(lbl('Schwierigkeit'));
    var dr=document.createElement('div'); dr.style.cssText='display:flex;gap:6px;';
    for(var d=1;d<=5;d++){
      (function(dv){
        var b=document.createElement('button'); b.id='diff-btn-'+dv; b.type='button';
        b.className='chip pressable'+(dv===challengeData.difficulty?' on':'');
        b.style.cssText='flex:1;min-width:0;padding:8px 0;text-align:center;letter-spacing:0;';
        b.setAttribute('aria-label','Schwierigkeit '+dv+' von 5');
        b.setAttribute('aria-pressed', dv===challengeData.difficulty?'true':'false');
        b.textContent='★'.repeat(dv);
        b.onclick=function(){
          challengeData.difficulty=dv;
          for(var i=1;i<=5;i++){var bb=document.getElementById('diff-btn-'+i);if(bb){bb.classList.toggle('on',i===dv);bb.setAttribute('aria-pressed',i===dv?'true':'false');}}
        };
        dr.appendChild(b);
      })(d);
    }
    w3.appendChild(dr);
    content.appendChild(w1); content.appendChild(w2); content.appendChild(w25); content.appendChild(w3);
  }

  function renderStep2(){
    stepLbl.textContent='Schritt 2 von 4 — Typ';
    nextBtn.textContent='Weiter →';
    var types=[
      {id:'once',icon:'once',label:'Einmalig',desc:'Einmal vollständig schaffen'},
      {id:'weekly',icon:'weekly',label:'Wöchentlich',desc:'X mal pro Woche trainieren'},
      {id:'timed',icon:'timed',label:'Zeitlimit',desc:'Alles in X Minuten schaffen'},
      {id:'streak',icon:'streak',label:'Streak',desc:'X Tage in Folge trainieren'},
    ];
    var list=document.createElement('div'); list.className='list'; list.setAttribute('role','radiogroup'); list.setAttribute('aria-label','Challenge-Typ');
    types.forEach(function(t){
      var card=document.createElement('button'); card.id='type-card-'+t.id; card.type='button';
      var sel=challengeData.type===t.id;
      card.className='list-row pressable';
      card.setAttribute('role','radio');
      card.setAttribute('aria-checked', sel?'true':'false');
      card.style.background=sel?'var(--card2)':'transparent';
      card.innerHTML='<span class="row-icon" style="color:'+(sel?'var(--accent)':'var(--muted)')+';">'+commIcon(t.icon)+'</span>'+
        '<div class="row-main"><div class="row-title">'+t.label+'</div><div class="row-sub">'+t.desc+'</div></div>'+
        '<span data-radio style="width:8px;height:8px;border-radius:50%;border:1px solid '+(sel?'var(--accent)':'var(--line2)')+';background:'+(sel?'var(--accent)':'transparent')+';flex-shrink:0;"></span>';
      card.onclick=function(){
        challengeData.type=t.id;
        types.forEach(function(tt){
          var c=document.getElementById('type-card-'+tt.id); if(!c) return;
          var on=tt.id===t.id;
          c.setAttribute('aria-checked', on?'true':'false');
          c.style.background=on?'var(--card2)':'transparent';
          var ic=c.querySelector('.row-icon'); if(ic) ic.style.color=on?'var(--accent)':'var(--muted)';
          var r=c.querySelector('[data-radio]'); if(r){ r.style.borderColor=on?'var(--accent)':'var(--line2)'; r.style.background=on?'var(--accent)':'transparent'; }
        });
        renderTypeParams(t.id);
      };
      list.appendChild(card);
    });
    content.appendChild(list);
    var pw=document.createElement('div'); pw.id='type-params-wrap'; content.appendChild(pw);
    renderTypeParams(challengeData.type);
  }

  function renderTypeParams(type){
    var wrap=document.getElementById('type-params-wrap'); if(!wrap) return; wrap.innerHTML='';
    function numI(id,l,ph,val){
      var w=document.createElement('div'); w.style.marginTop='12px';
      var lb=document.createElement('div'); lb.className='lbl'; lb.style.cssText='margin:0 0 6px;'; lb.textContent=l;
      var i=document.createElement('input'); i.type='number'; i.id=id; i.placeholder=ph; i.value=val||'';
      i.className='inp num';
      w.appendChild(lb); w.appendChild(i); return w;
    }
    if(type==='weekly') wrap.appendChild(numI('tp-days','Trainings pro Woche','z.B. 3',challengeData.typeParams.days));
    if(type==='timed')  wrap.appendChild(numI('tp-minutes','Zeitlimit (Minuten)','z.B. 20',challengeData.typeParams.minutes));
    if(type==='streak') wrap.appendChild(numI('tp-streak','Streak-Tage','z.B. 7',challengeData.typeParams.streakDays));
  }

  function renderStep3(){
    stepLbl.textContent='Schritt 3 von 4 — Übungen';
    nextBtn.textContent='Weiter →';
    content.innerHTML='';
    // Option: no exercises (free text challenge)
    var freeToggle=document.createElement('div');
    freeToggle.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;min-height:52px;background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);margin-bottom:12px;';
    freeToggle.innerHTML='<div class="row-title" style="white-space:normal;">Freie Challenge (ohne Übungen)</div>';
    var ftBtn=document.createElement('button');
    ftBtn.type='button';
    ftBtn.className='toggle'+(challengeData.freeChallenge?' on':'');
    ftBtn.setAttribute('role','switch');
    ftBtn.setAttribute('aria-checked', challengeData.freeChallenge?'true':'false');
    ftBtn.setAttribute('aria-label','Freie Challenge umschalten');
    ftBtn.onclick=function(){challengeData.freeChallenge=!challengeData.freeChallenge;renderStep3();};
    freeToggle.appendChild(ftBtn); content.appendChild(freeToggle);
    if(challengeData.freeChallenge){
      var freeDesc=document.createElement('div');
      freeDesc.style.cssText='background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);padding:12px 14px;margin-bottom:12px;font-size:11px;color:var(--muted);line-height:1.6;';
      freeDesc.textContent='Die Challenge hat keine festen Übungen. Beschreib sie in der Beschreibung (Schritt 1).';
      content.appendChild(freeDesc);
      return;
    }
    var addBtn=document.createElement('button');
    addBtn.type='button';
    addBtn.className='btn-g pressable';
    addBtn.style.cssText='width:100%;min-height:44px;margin-bottom:14px;';
    addBtn.textContent='+ Übung hinzufügen';
    addBtn.onclick=function(){
      challengeData.exercises.push({name:'',sets:3,reps:10,rest:60,notes:'',bandAllowed:false});
      renderStep3();
    };
    content.appendChild(addBtn);
    content._step3Built = true;
    var exList=document.createElement('div'); exList.id='ch-ex-list'; content.appendChild(exList);
    if(challengeData.exercises.length===0){
      var hint=document.createElement('div'); hint.className='empty';
      hint.textContent='Füge mindestens eine Übung hinzu'; exList.appendChild(hint);
    } else {
      challengeData.exercises.forEach(function(ex,idx){ renderExCard(ex,idx,exList); });
    }
  }

  function renderExCard(ex, idx, exList){
    var card=document.createElement('div'); card.className='card'; card.style.cssText='background:var(--card2);';
    var hRow=document.createElement('div'); hRow.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px;';
    var ht=document.createElement('div'); ht.style.cssText='display:flex;align-items:center;gap:8px;';
    var htIdx=document.createElement('span'); htIdx.className='row-index num'; htIdx.textContent=('0'+(idx+1)).slice(-2);
    var htLbl=document.createElement('span'); htLbl.className='lbl'; htLbl.textContent='Übung';
    ht.appendChild(htIdx); ht.appendChild(htLbl);
    var delBtn=document.createElement('button'); delBtn.type='button'; delBtn.className='btn-g danger pressable'; delBtn.style.cssText='min-height:32px;padding:6px 12px;font-size:10px;'; delBtn.textContent='× Entfernen';
    delBtn.onclick=function(){challengeData.exercises.splice(idx,1);renderStep3();};
    hRow.appendChild(ht); hRow.appendChild(delBtn); card.appendChild(hRow);

    var nw=document.createElement('div'); nw.style.marginBottom='10px';
    nw.appendChild(lbl('Übung'));
    var ni=document.createElement('input'); ni.type='text'; ni.value=ex.name||''; ni.placeholder='z.B. Klimmzüge'; ni.setAttribute('list','exdl-'+idx);
    ni.className='inp';
    ni.oninput=function(){challengeData.exercises[idx].name=this.value;};
    var dl=document.createElement('datalist'); dl.id='exdl-'+idx;
    ['Klimmzüge','Dips','Liegestütze','Muscle-Up','Plank','L-Sit','Handstand','Front Lever','Dragon Flag','Hollow Body','Push-Up','Trizeps-Dips','Kniebeugen','Burpees','Mountain Climbers'].forEach(function(n){var o=document.createElement('option');o.value=n;dl.appendChild(o);});
    nw.appendChild(ni); nw.appendChild(dl); card.appendChild(nw);

    var sr=document.createElement('div'); sr.style.cssText='display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;';
    function mi(fld,lb,val,ph){
      var w=document.createElement('div');
      var l=document.createElement('div'); l.className='lbl'; l.style.cssText='margin-bottom:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'; l.textContent=lb;
      var i=document.createElement('input'); i.type='number'; i.value=val||''; i.placeholder=ph||'';
      i.className='inp num';
      i.style.cssText='padding-left:10px;padding-right:10px;';
      i.oninput=(function(f){return function(){challengeData.exercises[idx][f]=parseInt(this.value)||0;};})(fld);
      w.appendChild(l); w.appendChild(i); return w;
    }
    sr.appendChild(mi('sets','Sätze',ex.sets,'3')); sr.appendChild(mi('reps','Wdh.',ex.reps,'10')); sr.appendChild(mi('rest','Pause (Sek)',ex.rest,'60'));
    card.appendChild(sr);

    var now=document.createElement('div'); now.style.marginBottom='10px';
    now.appendChild(lbl('Ausführung (optional)'));
    var nta=document.createElement('textarea'); nta.value=ex.notes||''; nta.placeholder='z.B. volle Streckung, kein Schwung...';
    nta.className='inp';
    nta.style.cssText='resize:none;height:64px;';
    nta.oninput=function(){challengeData.exercises[idx].notes=this.value;};
    now.appendChild(nta); card.appendChild(now);

    var br=document.createElement('div'); br.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;';
    var bl=document.createElement('div'); bl.className='row-sub'; bl.style.cssText='margin:0;'; bl.textContent='Gummiband erlaubt';
    var bt=document.createElement('button');
    bt.type='button';
    bt.className='toggle'+(ex.bandAllowed?' on':'');
    bt.setAttribute('role','switch');
    bt.setAttribute('aria-checked', ex.bandAllowed?'true':'false');
    bt.setAttribute('aria-label','Gummiband erlaubt umschalten');
    bt.onclick=function(){challengeData.exercises[idx].bandAllowed=!challengeData.exercises[idx].bandAllowed;renderStep3();};
    br.appendChild(bl); br.appendChild(bt); card.appendChild(br);
    exList.appendChild(card);
  }

  function renderStep4(){
    stepLbl.textContent='Schritt 4 von 4 — Vorschau';
    nextBtn.textContent=extraCost?'Posten (3 Diamanten)':'Posten (kostenlos)';
    var typeIcons={once:'once',weekly:'weekly',timed:'timed',streak:'streak'};
    var typeLabels={once:'Einmalig',weekly:'Wöchentlich',timed:'Zeitlimit',streak:'Streak'};
    var card=document.createElement('div');
    card.className='card';
    card.style.cssText='background:var(--card2);margin-bottom:14px;';
    card.innerHTML=
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">'+
      '<span class="row-icon" style="color:var(--accent);">'+commIcon(typeIcons[challengeData.type]||'once')+'</span>'+
      '<div style="flex:1;min-width:0;"><div class="ttl">'+challengeData.title+'</div>'+
      '<div class="row-sub">'+typeLabels[challengeData.type]+' · <span style="color:var(--accent);">'+'★'.repeat(challengeData.difficulty)+'</span>'+'☆'.repeat(5-challengeData.difficulty)+'</div></div></div>'+
      '<div style="font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:10px;">'+challengeData.desc+'</div>';
    if(challengeData.exercises.length>0){
      var et=document.createElement('div'); et.className='lbl'; et.style.cssText='margin:0 0 4px;'; et.innerHTML='<span class="num">'+challengeData.exercises.length+'</span> Übungen';
      card.appendChild(et);
      challengeData.exercises.forEach(function(ex,ei){
        var r=document.createElement('div'); r.style.cssText='display:flex;align-items:center;gap:10px;min-height:44px;padding:8px 0;border-bottom:1px solid var(--line);';
        r.innerHTML='<span class="row-index num">'+('0'+(ei+1)).slice(-2)+'</span><div class="row-title" style="flex:1;">'+ex.name+'</div><div class="row-val num">'+ex.sets+'×'+ex.reps+'</div><div class="num" style="color:var(--muted);font-size:11px;">'+ex.rest+'s</div>';
        if(ex.bandAllowed){var b=document.createElement('div');b.style.cssText='background:var(--card);border:1px solid var(--line);border-radius:var(--r-sm);padding:2px 8px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap;';b.textContent='Band erlaubt';r.appendChild(b);}
        card.appendChild(r);
        if(ex.notes){var n=document.createElement('div');n.style.cssText='font-size:11px;color:var(--muted);padding:4px 0 4px 32px;line-height:1.5;';n.textContent=ex.notes;card.appendChild(n);}
      });
    }
    content.appendChild(card);
    if(challengeData.videoUrl){
      var vPrev=document.createElement('div'); vPrev.style.cssText='background:var(--card2);border:1px solid var(--line);border-radius:var(--r-card);padding:12px 14px;margin-bottom:12px;display:flex;align-items:center;gap:12px;';
      var vIcon=document.createElement('span'); vIcon.className='row-icon'; vIcon.innerHTML=commIcon('video');
      var vInfo=document.createElement('div'); vInfo.style.cssText='flex:1;min-width:0;';
      var vLbl=document.createElement('div'); vLbl.className='lbl'; vLbl.style.cssText='margin:0 0 3px;'; vLbl.textContent='Erklär-Video';
      var vLink=document.createElement('a'); vLink.href=challengeData.videoUrl; vLink.target='_blank'; vLink.style.cssText='font-size:11px;color:var(--text);word-break:break-all;text-decoration:underline;'; vLink.textContent=challengeData.videoUrl;
      vInfo.appendChild(vLbl); vInfo.appendChild(vLink);
      vPrev.appendChild(vIcon); vPrev.appendChild(vInfo);
      content.appendChild(vPrev);
    }
    var cn=document.createElement('div'); cn.style.cssText='font-size:11px;color:var(--muted);text-align:center;';
    cn.textContent=extraCost?'Kostet 3 Diamanten (heute bereits gepostet)':'Heute kostenlos ✓';
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
      if(currency.diamonds<COMM_POST_COST_DIAMONDS){toast('Nicht genug Diamanten!');return;}
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
      .then(function(){ov.remove();toast('Challenge gepostet!');loadCommFeed();})
      .catch(function(){toast('Fehler. Bitte nochmal.');nextBtn.textContent='Posten';nextBtn.disabled=false;});
  }

  ov.appendChild(box);
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
  renderStep(1);
}


// ── LOAD & RENDER FEED ────────────────────────────────────
var commAllDocs = [];
var commFilterMode = 'newest';
var commSearchQuery = '';

function loadCommFeed(){
  var feedEl = document.getElementById('comm-feed');
  if(!feedEl) return;

  feedEl.innerHTML = '<div class="empty">Wird geladen...</div>';

  if(!currentUser){
    feedEl.innerHTML = '<div class="card" style="text-align:center;font-size:11px;color:var(--muted);">Einloggen, um Community Challenges zu sehen.</div>';
    return;
  }

  var query = (commFilterMode === 'mine')
    ? db.collection('communityChallenges').where('uid', '==', currentUser.uid).limit(50)
    : db.collection('communityChallenges').orderBy('createdAt', 'desc').limit(50);

  query.get()
    .then(function(snap){
      commAllDocs = [];
      snap.forEach(function(doc){ commAllDocs.push({id: doc.id, data: doc.data()}); });
      if(commFilterMode === 'mine'){
        commAllDocs.sort(function(a,b){ return (b.data.createdAt||0) - (a.data.createdAt||0); });
      } else if(commFilterMode === 'popular'){
        commAllDocs.sort(function(a,b){ return ((b.data.likes||[]).length) - ((a.data.likes||[]).length); });
      }
      renderCommFeed();
    })
    .catch(function(e){
      feedEl.innerHTML = '<div style="font-size:11px;color:var(--muted);padding:12px 0;">Fehler beim Laden.</div>';
      console.log('Feed error:', e);
    });
}

function renderCommFeed(){
  var feedEl = document.getElementById('comm-feed');
  if(!feedEl) return;
  var q = commSearchQuery.trim().toLowerCase();
  var filtered = commAllDocs.filter(function(d){
    if(!q) return true;
    var hay = ((d.data.title||'') + ' ' + (d.data.desc||'')).toLowerCase();
    return hay.indexOf(q) > -1;
  });
  feedEl.innerHTML = '';
  if(!filtered.length){
    feedEl.innerHTML = '<div class="card"><div class="empty">'+(q ? 'Keine Treffer.' : (commFilterMode==='mine' ? 'Du hast noch keine Challenge gepostet.' : 'Noch keine Community Challenges. Sei der Erste!'))+'</div></div>';
    return;
  }
  filtered.forEach(function(entry){ feedEl.appendChild(buildCommCard(entry.id, entry.data)); });
  if(window.caliMotion) caliMotion.stagger(feedEl);
}

var COMM_PHOTOS = ['/challenge-pullup.jpg', '/challenge-dip.jpg', '/challenge-handstand.jpg'];
function commPhotoFor(docId){
  var sum = 0;
  for(var i=0;i<docId.length;i++){ sum += docId.charCodeAt(i); }
  return COMM_PHOTOS[sum % COMM_PHOTOS.length];
}

function buildCommCard(docId, data){
  var card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'overflow:hidden;';
  card.onclick = function(){ trackChallengeView('comm_'+docId); };

  // Photo (grayscale via .ch-photo in tracker.html) — sits on top of the card
  var photoEl = document.createElement('div');
  photoEl.className = 'ch-photo';
  var photoImg = document.createElement('img');
  photoImg.src = commPhotoFor(docId);
  photoImg.alt = '';
  photoImg.loading = 'lazy';
  photoEl.appendChild(photoImg);
  card.appendChild(photoEl);

  // Header row
  var hdRow = document.createElement('div');
  hdRow.style.cssText = 'display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;';

  var avatarEl = document.createElement('div');
  avatarEl.style.cssText = 'width:36px;height:36px;border-radius:50%;background:var(--card2);border:1px solid var(--line2);display:flex;align-items:center;justify-content:center;color:var(--muted);flex-shrink:0;overflow:hidden;';
  avatarEl.innerHTML = commIcon('user',16);
  if(data.uid){
    db.collection('users').doc(data.uid).get().then(function(doc){
      if(!doc.exists) return;
      var pd = doc.data().prData;
      if(pd && pd.avatar){
        avatarEl.style.backgroundImage = 'url(' + pd.avatar + ')';
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.style.filter = 'grayscale(1) contrast(1.15) brightness(0.85)';
        avatarEl.innerHTML = '';
      }
    }).catch(function(){});
  }

  var left = document.createElement('div');
  left.style.cssText = 'flex:1;min-width:0;';
  var titleEl = document.createElement('div');
  titleEl.className = 'ttl';
  titleEl.textContent = data.title;

  var meta = document.createElement('div');
  meta.className = 'row-sub';
  meta.style.cssText = 'margin-top:3px;';
  var dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'}) : '';
  meta.textContent = (data.authorName || 'Athlet') + ' · ' + dateStr;

  left.appendChild(titleEl);
  left.appendChild(meta);

  // Difficulty stars
  var stars = document.createElement('div');
  stars.style.cssText = 'font-size:11px;color:var(--accent);flex-shrink:0;letter-spacing:.05em;padding-top:2px;';
  stars.textContent = '★'.repeat(data.difficulty || 3) + '☆'.repeat(5-(data.difficulty||3));

  hdRow.appendChild(avatarEl);
  hdRow.appendChild(left);
  hdRow.appendChild(stars);

  // Delete menu — only for the post's own author
  if(currentUser && data.uid === currentUser.uid){
    var moreBtn = document.createElement('button');
    moreBtn.type = 'button';
    moreBtn.setAttribute('aria-label', 'Optionen');
    moreBtn.className = 'icon-btn sm pressable';
    moreBtn.style.cssText = 'border-color:transparent;color:var(--muted);';
    moreBtn.textContent = '⋯';
    moreBtn.onclick = function(e){
      e.stopPropagation();
      var doDelete = function(){
        db.collection('communityChallenges').doc(docId).delete().then(function(){
          toast('Challenge gelöscht');
          loadCommFeed();
        }).catch(function(){ toast('Fehler beim Löschen.'); });
      };
      if(typeof confirmSheet === 'function'){
        confirmSheet({
          title: 'Challenge löschen?',
          desc: 'Die Challenge verschwindet für alle. Das lässt sich nicht rückgängig machen.',
          confirmLabel: 'Löschen',
          cancelLabel: 'Abbrechen',
          onConfirm: doDelete
        });
      } else if(confirm('Diese Challenge wirklich löschen?')){
        doDelete();
      }
    };
    hdRow.appendChild(moreBtn);
  }
  card.appendChild(hdRow);

  // Description
  if(data.desc){
    var descEl = document.createElement('div');
    descEl.style.cssText = 'font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:10px;';
    descEl.textContent = data.desc;
    card.appendChild(descEl);
  }

  // Exercises tags
  if(data.exercises && data.exercises.length){
    var exNames = data.exercises.map(function(e){ return (typeof e === 'string') ? e : e.name; }).filter(Boolean);
    if(exNames.length){
      var tagRow = document.createElement('div');
      tagRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;';
      exNames.forEach(function(name){
        var exTag = document.createElement('div');
        exTag.style.cssText = 'background:var(--card2);border:1px solid var(--line);border-radius:var(--r-sm);padding:3px 8px;font-size:10px;color:var(--muted);';
        exTag.textContent = name;
        tagRow.appendChild(exTag);
      });
      card.appendChild(tagRow);
    }
  }

  // Video link
  if(data.videoUrl){
    var vRow = document.createElement('a');
    vRow.href = data.videoUrl; vRow.target = '_blank';
    vRow.className = 'btn-g pressable';
    vRow.style.cssText = 'width:100%;min-height:40px;margin-bottom:10px;text-decoration:none;';
    var vIco = document.createElement('span'); vIco.style.cssText='display:inline-flex;color:var(--muted);'; vIco.innerHTML=commIcon('video',16);
    var vTxt = document.createElement('span'); vTxt.textContent='Erklär-Video ansehen';
    vRow.appendChild(vIco); vRow.appendChild(vTxt);
    card.appendChild(vRow);
  }

  // Action row: like, try, comment
  var actRow = document.createElement('div');
  actRow.style.cssText = 'display:flex;gap:8px;align-items:center;border-top:1px solid var(--line);padding-top:10px;margin-top:4px;flex-wrap:wrap;';

  // Like button
  var liked = currentUser && data.likes && data.likes.indexOf(currentUser.uid) > -1;
  var likeBtn = document.createElement('button');
  likeBtn.type = 'button';
  likeBtn.className = 'btn-g pressable';
  likeBtn.style.cssText = 'padding:0 12px;' + (liked ? 'border-color:var(--accent);color:var(--accent);' : '');
  likeBtn.setAttribute('aria-label','Gefällt mir');
  likeBtn.setAttribute('aria-pressed', liked ? 'true' : 'false');
  likeBtn.innerHTML = commIcon('like',14) + '<span class="num">' + ((data.likes||[]).length) + '</span>';
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

  // Try button (light secondary pill — the feed's single orange CTA is "+ Posten" in the top bar)
  var tryBtn = document.createElement('button');
  tryBtn.type = 'button';
  tryBtn.className = 'btn sec sm pressable';
  tryBtn.style.cssText = 'flex:1;';
  tryBtn.textContent = 'Ausprobieren';
  tryBtn.onclick = function(){
    activeChallenge = {
      id: 'comm_'+docId,
      title: data.title,
      desc: data.desc,
      icon: '🌟',
      type: 'community',
      params: { target: 1, metric: 'manual' },
      startDate: new Date().toISOString().slice(0,10),
      progress: 0
    };
    saveChallenges();
    trackChallengeParticipant('comm_'+docId);
    buildChallengeUI();
    toast('Challenge gestartet!');
    // Scroll up to active challenge
    document.getElementById('page-ch').scrollTop = 0;
  };

  // Comment toggle button
  var commBtn = document.createElement('button');
  commBtn.type = 'button';
  var commCount = (data.comments||[]).length;
  commBtn.className = 'btn-g pressable';
  commBtn.style.cssText = 'padding:0 12px;';
  commBtn.setAttribute('aria-label','Kommentare anzeigen');
  commBtn.setAttribute('aria-expanded','false');
  commBtn.innerHTML = commIcon('comment',14) + '<span class="num">' + commCount + '</span>';

  actRow.appendChild(likeBtn);
  actRow.appendChild(tryBtn);
  actRow.appendChild(commBtn);
  card.appendChild(actRow);

  // Comment section (collapsed by default, .acc-body accordion)
  var commSection = document.createElement('div');
  commSection.className = 'acc-body';
  var commInner = document.createElement('div');
  commInner.style.cssText = 'padding-top:12px;';
  commSection.appendChild(commInner);

  commBtn.onclick = function(){
    var isOpen = commSection.classList.contains('open');
    if(!isOpen) buildCommSection(commInner, docId, data);
    commSection.classList.toggle('open');
    commBtn.setAttribute('aria-expanded', commSection.classList.contains('open') ? 'true' : 'false');
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
    empty2.className = 'empty';
    empty2.style.cssText = 'padding:6px 0 10px;';
    empty2.textContent = 'Noch keine Kommentare.';
    el.appendChild(empty2);
  } else {
    for(var i=0;i<comments.length;i++){
      var c = comments[i];
      var row = document.createElement('div');
      row.style.cssText = 'padding:8px 0;border-bottom:1px solid var(--line);';
      var cname = document.createElement('div');
      cname.style.cssText = 'font-size:11px;font-weight:600;color:var(--accent);margin-bottom:2px;';
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
  inp2.style.cssText = 'display:flex;gap:8px;margin-top:10px;align-items:center;';
  var txta = document.createElement('input');
  txta.type = 'text';
  txta.maxLength = 200;
  txta.placeholder = 'Kommentar schreiben...';
  txta.className = 'inp';
  txta.style.cssText = 'flex:1;width:auto;';
  var sendBtn = document.createElement('button');
  sendBtn.type = 'button';
  sendBtn.className = 'btn sec sm pressable';
  sendBtn.style.cssText = 'min-height:44px;white-space:nowrap;';
  sendBtn.setAttribute('aria-label','Kommentar senden');
  sendBtn.textContent = 'Senden';
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
