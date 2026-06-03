
  // Best performances from maxEntries
  var bests=document.getElementById('pr-bests');
  if(bests){
    bests.innerHTML='';
    if(!maxEntries.length){
      bests.innerHTML='<div style="font-size:12px;color:var(--muted2);padding:8px 0;">Noch keine Max-Werte eingetragen.</div>';
    } else {
      var bestMap={};
      for(var i=0;i<maxEntries.length;i++){
        var me=maxEntries[i];
        var v=parseFloat(me.val)||0;
        if(!bestMap[me.name]||v>parseFloat(bestMap[me.name].val)) bestMap[me.name]=me;
      }
      for(var name in bestMap){
        var me=bestMap[name];
        var row=document.createElement('div');
        row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg2);border:1px solid #1e1e1e;border-radius:10px;margin-bottom:6px;';
        var left=document.createElement('div');
        left.style.cssText='font-size:13px;font-weight:500;color:var(--text);';
        left.textContent=name.replace(' Max','');
        var right=document.createElement('div');
        right.style.cssText='font-family:inherit;font-size:20px;color:var(--accent);';
        right.textContent=me.val+' '+me.unit;
        row.appendChild(left);row.appendChild(right);
        bests.appendChild(row);
      }
    }
  }

  // Total reps per exercise breakdown
  var repsEl = document.getElementById('pr-total-reps');
  if(repsEl){
    repsEl.innerHTML='';
    // Sort by total reps descending
    var sorted = [];
    for(var name in repsByEx){ sorted.push({name:name, total:repsByEx[name]}); }
    sorted.sort(function(a,b){return b.total-a.total;});
    for(var i=0;i<sorted.length&&i<10;i++){
      var row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:10px;padding:8px 14px;background:var(--bg2);border:1px solid #1e1e1e;border-radius:10px;margin-bottom:6px;';
      var rank=document.createElement('div');
      rank.style.cssText='font-family:inherit;font-size:13px;color:var(--muted);width:20px;text-align:center;';
      rank.textContent=String(i+1);
      var name2=document.createElement('div');
      name2.style.cssText='font-size:13px;color:var(--text);flex:1;';
      name2.textContent=sorted[i].name;
      var total=document.createElement('div');
      total.style.cssText='font-family:inherit;font-size:18px;color:var(--accent);';
      total.textContent=Math.round(sorted[i].total).toLocaleString()+' Wdh';
      row.appendChild(rank);row.appendChild(name2);row.appendChild(total);
      repsEl.appendChild(row);
    }
    if(!sorted.length){
      repsEl.innerHTML='<div style="font-size:12px;color:var(--muted2);padding:8px 0;">Noch keine Wdh eingetragen.</div>';
    }
  }
  // Always build streak section at end
  buildProfilStreakSection();
  buildProfilStatsDetail();
  buildPrivacyToggle();
  checkAndShowAdminBtn();
}

function hexToRgb(hex){
  var r=parseInt(hex.slice(1,3),16);
  var g=parseInt(hex.slice(3,5),16);
  var b=parseInt(hex.slice(5,7),16);
  return r+','+g+','+b;
}



// ── FIREBASE ──────────────────────────────────────────────
var firebaseConfig = {
  apiKey: "AIzaSyAzZLudHZd3ht7ASlrgghei-PW6qS9ClMM",
  authDomain: "cali-app-75cc9.firebaseapp.com",
  projectId: "cali-app-75cc9",
  storageBucket: "cali-app-75cc9.firebasestorage.app",
  messagingSenderId: "431823759191",
  appId: "1:431823759191:web:d2ccaa761109b2d883c012",
  measurementId: "G-KZQP7PCWYK"
};

firebase.initializeApp(firebaseConfig);
var fbTimeout = null;


var auth = firebase.auth();
var db   = firebase.firestore();
var currentUser = null;
var authMode = 'login';

function showAuthTab(mode){
  authMode = mode;
  var loginBtn    = document.getElementById('tab-login');
  var registerBtn = document.getElementById('tab-register');
  var submitBtn   = document.getElementById('auth-submit-btn');
  var nameRow     = document.getElementById('auth-name-row');
  if(mode==='login'){
    loginBtn.style.background    = 'var(--accent)';
    loginBtn.style.color         = '#000';
    registerBtn.style.background = 'none';
    registerBtn.style.color      = '#888';
    submitBtn.textContent        = 'EINLOGGEN';
    if(nameRow) nameRow.style.display = 'none';
  } else {
    registerBtn.style.background = 'var(--accent)';
    registerBtn.style.color      = '#000';
    loginBtn.style.background    = 'none';
    loginBtn.style.color         = '#888';
    submitBtn.textContent        = 'REGISTRIEREN';
    if(nameRow) nameRow.style.display = 'block';
  }
  var err = document.getElementById('auth-error');
  if(err) err.style.display = 'none';
}

function authSubmit(){
  var email    = document.getElementById('auth-email').value.trim();
  var password = document.getElementById('auth-password').value;
  var nameEl   = document.getElementById('auth-name');
  var name     = nameEl ? nameEl.value.trim() : '';
  var errEl    = document.getElementById('auth-error');

  if(!email || !password){
    if(errEl){errEl.textContent='E-Mail und Passwort eingeben!';errEl.style.display='block';}
    return;
  }

  if(authMode==='register'){
    auth.createUserWithEmailAndPassword(email, password)
      .then(function(cred){
        return cred.user.updateProfile({displayName: name||email.split('@')[0]});
      })
      .then(function(){
        // Force onboarding for new registrations
        try{ localStorage.removeItem('cali_onboarded'); }catch(x){}
        try{ localStorage.removeItem('cali_profile'); }catch(x){}
        prData = {};
        toast('Konto erstellt! Willkommen!');
        setTimeout(showOnboarding, 1500);
      })
      .catch(function(e){
        if(errEl){errEl.textContent=getAuthError(e.code);errEl.style.display='block';}
      });
  } else {
    auth.signInWithEmailAndPassword(email, password)
      .catch(function(e){
        if(errEl){errEl.textContent=getAuthError(e.code);errEl.style.display='block';}
      });
  }
}

function authGoogle(){
  var provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .catch(function(e){
      var errEl = document.getElementById('auth-error');
      if(errEl){errEl.textContent=getAuthError(e.code);errEl.style.display='block';}
    });
}

function authLogout(){
  auth.signOut();
}

function getAuthError(code){
  var errors = {
    'auth/email-already-in-use':   'E-Mail bereits registriert',
    'auth/invalid-email':          'Ungültige E-Mail Adresse',
    'auth/weak-password':          'Passwort zu schwach (min. 6 Zeichen)',
    'auth/user-not-found':         'Kein Konto mit dieser E-Mail',
    'auth/wrong-password':         'Falsches Passwort',
    'auth/too-many-requests':      'Zu viele Versuche. Bitte warten.',
    'auth/popup-closed-by-user':   'Anmeldung abgebrochen',
  };
  return errors[code] || 'Fehler: ' + code;
}

// Auth state listener
if(auth){
auth.onAuthStateChanged(function(user){
  clearTimeout(fbTimeout);
  if(user){
    currentUser = user;
    document.getElementById('login-screen').style.display = 'none';
    var nav = document.getElementById('main-nav');
    if(nav) nav.style.display = 'flex';
    document.getElementById('page-e').className = 'page on';
    // Load user data from Firestore
    loadUserData(user.uid);
    toast('Willkommen ' + (user.displayName||user.email) + '!');
    // Onboarding check happens inside loadUserData callback
  } else {
    currentUser = null;
    document.getElementById('login-screen').style.display = 'flex';
    var nav = document.getElementById('main-nav');
    if(nav) nav.style.display = 'none';
    // Hide all pages
    var pages = ['e','p','m','ch','v','pr','h'];
    for(var i=0;i<pages.length;i++){
      var pg = document.getElementById('page-'+pages[i]);
      if(pg) pg.className = 'page';
    }
  }
}); // end onAuthStateChanged
} else {
  // Firebase not available - show login
  var ls2=document.getElementById('login-screen');if(ls2)ls2.style.display='flex';
}

// ── FIRESTORE SYNC ────────────────────────────────────────
function getUserDoc(){
  if(!currentUser) return null;
  return db.collection('users').doc(currentUser.uid);
}

function saveUserData(){
  if(!currentUser) return;
  var doc = getUserDoc();
  doc.set({
    ents:       ents,
    maxEntries: maxEntries,
    plans:      plans,
    prData:     prData,
    challenge:  activeChallenge||null,
    updatedAt:  new Date().toISOString()
  }, {merge: true}).catch(function(e){ console.log('Save error:', e); });
}

function loadUserData(uid){
  db.collection('users').doc(uid).get()
    .then(function(doc){
      if(doc.exists){
        var d = doc.data();
        if(d.ents)       ents       = d.ents;
        if(d.maxEntries) maxEntries = d.maxEntries;
        if(d.plans)      plans      = d.plans;
        if(d.prData)     prData     = d.prData;
        if(d.challenge)  activeChallenge = d.challenge;
        try{
          localStorage.setItem('cali_v4', JSON.stringify(ents));
          localStorage.setItem('cali_max', JSON.stringify(maxEntries));
          localStorage.setItem('cali_plans', JSON.stringify(plans));
          localStorage.setItem('cali_profile', JSON.stringify(prData));
        }catch(x){}
        bb(); buildStartPlanBtns(); buildStartChallengeWidget();
      }
      // Check onboarding AFTER data loaded
      lstreak();
      var onboarded = false;
      try{ onboarded = !!localStorage.getItem('cali_onboarded'); }catch(x){}
      var isNew = !prData || !prData.name;
      if(isNew && !onboarded){
        setTimeout(showOnboarding, 1500);
      } else {
        if(!streakData.goalSet) showWeeklyGoalModal();
        buildStreakWidget();
      }
    })
    .catch(function(e){
      console.log('Load error:', e);
      // Even on error, check onboarding
      lstreak();
      var onboarded = false;
      try{ onboarded = !!localStorage.getItem('cali_onboarded'); }catch(x){}
      if(!prData || (!prData.name && !onboarded)){
        setTimeout(showOnboarding, 400);
      } else {
        buildStreakWidget();
      }
    });
}

// ld() wird direkt genutzt, kein Override nötig

// Auto-save to Firebase when data changes
function fbSave(){
  if(currentUser) saveUserData();
}


lmax();lpd();lpr();lstreak();ld();loadChallenges();loadCurrency();bb();bhr();buildStartPlanBtns();buildStartChallengeWidget();
setTimeout(function(){buildChallengeUI();},100);
var _md=document.getElementById('max-date'); if(_md) _md.valueAsDate=new Date();
document.getElementById('max-ex').onchange=function(){
  var u=this.value.split('|')[1];
  var lbl=document.getElementById('max-val-lbl');
  if(lbl)lbl.textContent=u==='Sek'?'ERGEBNIS (SEK)':u==='Min:Sek'?'ERGEBNIS (MIN:SEK)':'ERGEBNIS (WDH)';
}

lmax();lpd();ld();loadChallenges();bb();bhr();buildStartPlanBtns();buildStartChallengeWidget();
document.getElementById('max-date').valueAsDate=new Date();
document.getElementById('max-ex').onchange=function(){var u=this.value.split('|')[1];var lbl=document.getElementById('max-val-lbl');if(lbl)lbl.textContent=u==='Sek'?'ERGEBNIS (SEK)':u==='Min:Sek'?'ERGEBNIS (MIN:SEK)':'ERGEBNIS (WDH)';};
// Populate chart select
var cexEl=document.getElementById('cex');
if(cexEl){for(var xi=0;xi<EX_DB.length;xi++){var opt=document.createElement('option');opt.textContent=EX_DB[xi].name;cexEl.appendChild(opt);}}

// ── DEMO MODUS ────────────────────────────────────────────
function startDemo(){
  var loadEl = document.getElementById('loading-screen');
  if(loadEl) loadEl.style.display = 'none';
  var ls = document.getElementById('login-screen');
  if(ls) ls.style.display = 'none';
  document.getElementById('page-e').className = 'page on';
  var nav = document.getElementById('main-nav');
  if(nav) nav.style.display = '';
  // Show nav tabs
  var navEl = document.querySelector('nav');
  if(navEl) navEl.style.display = '';
  // Load local data
  lmax();lpd();lpr();lstreak();ld();loadChallenges();
  bb();bhr();buildStartPlanBtns();buildStartChallengeWidget();buildStreakWidget();
  setTimeout(function(){
    if(!streakData.goalSet) showWeeklyGoalModal();
  }, 500);
  toast('Demo Modus - Daten werden nur lokal gespeichert');
}

// FLAMMEN-STREAK
var streakData={currentStreak:0,longestStreak:0,weeklyGoal:3,goalSet:false};
function lstreak(){try{var d=localStorage.getItem('cali_streak');if(d)streakData=JSON.parse(d);}catch(x){}}
function sstreak(){try{localStorage.setItem('cali_streak',JSON.stringify(streakData));}catch(x){}}
function calcStreak(){
  var dates=[];for(var i=0;i<ents.length;i++){if(dates.indexOf(ents[i].date)===-1)dates.push(ents[i].date);}dates.sort();
  if(!dates.length){streakData.currentStreak=0;sstreak();return;}
  var today=new Date().toISOString().slice(0,10);
  var yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
  var lastDate=dates[dates.length-1];
  if(lastDate!==today&&lastDate!==yesterday){streakData.currentStreak=0;sstreak();return;}
  var streak=1;
  for(var i=dates.length-1;i>0;i--){var d1=new Date(dates[i-1]);var d2=new Date(dates[i]);if((d2-d1)/86400000===1){streak++;}else{break;}}
  streakData.currentStreak=streak;if(streak>streakData.longestStreak)streakData.longestStreak=streak;sstreak();
}
function getWeeklyProgress(){
  var today=new Date();var dow=today.getDay();var ws=new Date(today);ws.setDate(today.getDate()-(dow===0?6:dow-1));
  var wsStr=ws.toISOString().slice(0,10);var days={};
  for(var i=0;i<ents.length;i++){if(ents[i].date>=wsStr)days[ents[i].date]=1;}
  return Object.keys(days).length;
}
function getFlames(n){var f='';var c=Math.min(n,5);for(var i=0;i<c;i++)f+='\uD83D\uDD25';if(n>5)f+=' x'+n;return f;}

function showWeeklyGoalModal(){
  var ex=document.getElementById('weekly-goal-modal');if(ex)ex.remove();
  var modal=document.createElement('div');modal.id='weekly-goal-modal';
  modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:8888;display:flex;align-items:center;justify-content:center;padding:24px;';
  var box=document.createElement('div');box.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:28px 24px;width:100%;max-width:320px;text-align:center;';
  var flame=document.createElement('div');flame.style.cssText='font-size:48px;margin-bottom:12px;';flame.textContent='\uD83D\uDD25';
  var title=document.createElement('div');title.style.cssText='font-family:inherit;font-size:24px;letter-spacing:3px;color:var(--accent);margin-bottom:8px;';title.textContent='TRAININGS-STREAK';
  var sub=document.createElement('div');sub.style.cssText='font-size:13px;color:var(--muted);margin-bottom:24px;line-height:1.6;';sub.textContent='Wie oft willst du diese Woche trainieren?';
  var lbl=document.createElement('div');lbl.style.cssText='font-family:inherit;font-size:11px;letter-spacing:3px;color:var(--muted);margin-bottom:12px;';lbl.textContent='WOCHENZIEL';
  var btnRow=document.createElement('div');btnRow.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:20px;';
  var goalBtns=[];
  for(var i=1;i<=7;i++){
    (function(n){
      var btn=document.createElement('button');btn.textContent=String(n);
      btn.style.cssText='background:#161616;border:1px solid #2a2a2a;color:var(--muted);border-radius:8px;padding:10px 4px;font-family:inherit;font-size:16px;cursor:pointer;';
      btn.onclick=function(){for(var j=0;j<goalBtns.length;j++){goalBtns[j].style.background='#161616';goalBtns[j].style.borderColor='#2a2a2a';goalBtns[j].style.color='#888';}btn.style.background='rgba(255,85,0,0.1)';btn.style.borderColor='var(--accent)';btn.style.color='var(--accent)';streakData.weeklyGoal=n;};
      goalBtns.push(btn);btnRow.appendChild(btn);
    })(i);
  }
  var selIdx = (streakData.weeklyGoal||3) - 1;
  goalBtns[selIdx].style.background='rgba(200,240,74,0.15)';goalBtns[selIdx].style.borderColor='var(--accent)';goalBtns[selIdx].style.color='var(--accent)';
  var saveBtn=document.createElement('button');saveBtn.style.cssText='width:100%;background:var(--accent);color:#000;border:none;border-radius:10px;font-family:inherit;font-size:16px;letter-spacing:3px;padding:14px;cursor:pointer;';
  saveBtn.textContent='LOS GEHT\'S!';
  saveBtn.onclick=function(){
  streakData.goalSet=true;
  sstreak();
  modal.remove();
  buildStreakWidget();
  goPage('pr');
  toast('Ziel: '+streakData.weeklyGoal+'x pro Woche!');
};
  box.appendChild(flame);box.appendChild(title);box.appendChild(sub);box.appendChild(lbl);box.appendChild(btnRow);box.appendChild(saveBtn);
  modal.appendChild(box);document.body.appendChild(modal);
}


// Onboarding functions

function showOnboarding(){
  var existing = document.getElementById('ob-modal');
  if(existing) existing.remove();
  var m = document.createElement('div');
  m.id = 'ob-modal';
  m.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#f7f7f5;z-index:9998;overflow-y:auto;padding:24px;box-sizing:border-box;';
  document.body.appendChild(m);
  obStep = 0;
  renderObStep();
}

function renderObStep(){
  var m = document.getElementById('ob-modal');
  if(!m) return;
  // Guard against out of bounds
  if(obStep < 0) obStep = 0;
  if(!obData) obData = {name:'', age:'', weight:'', height:'', level:'beginner', goal:'strength', weeklyGoal:3};

  var steps = [
    {icon:'\uD83D\uDC4B', title:'WILLKOMMEN!',   sub:'Wie sollen wir dich nennen?'},
    {icon:'\uD83D\uDCAA', title:'DEIN K\u00D6RPER',    sub:'Damit wir Trainings anpassen k\u00F6nnen.'},
    {icon:'\uD83C\uDFCB', title:'DEIN LEVEL',     sub:'Wie erfahren bist du?'},
    {icon:'\uD83C\uDFAF', title:'DEIN ZIEL',      sub:'Was willst du erreichen?'},
    {icon:'\uD83D\uDD25', title:'WOCHENZIEL',      sub:'Wie oft pro Woche trainierst du?'}
  ];
  var totalSteps = steps.length;
  if(obStep >= totalSteps){ obFinish(); return; }
  var s = steps[obStep];

  // Progress bar
  var pct = Math.round((obStep / (totalSteps-1)) * 100);
  var dots = '<div style="background:var(--bg3);border-radius:4px;height:4px;margin-bottom:4px;overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:var(--accent);border-radius:4px;transition:width 0.3s;"></div></div>';
  dots += '<div style="font-size:10px;color:var(--muted);text-align:right;">'+(obStep+1)+' / '+totalSteps+'</div>';

  var content = '';

  if(obStep===0){
    content =
      '<div style="margin-bottom:14px;">'+
        '<div style="font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:6px;">DEIN NAME</div>'+
        '<input id="ob-name" type="text" value="'+(obData.name||'')+'" placeholder="Name" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px;font-family:inherit;font-size:15px;outline:none;box-sizing:border-box;">'+
      '</div>'+
      '<div>'+
        '<div style="font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:6px;">DEIN ALTER</div>'+
        '<input id="ob-age" type="number" value="'+(obData.age||'')+'" placeholder="" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px;font-family:inherit;font-size:15px;outline:none;box-sizing:border-box;">'+
      '</div>';
  } else if(obStep===1){
    content =
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">'+
        '<div>'+
          '<div style="font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:6px;">GEWICHT (KG)</div>'+
          '<input id="ob-weight" type="number" value="'+obData.weight+'" placeholder="z.B. 75" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px;font-family:inherit;font-size:15px;outline:none;box-sizing:border-box;">'+
        '</div>'+
        '<div>'+
          '<div style="font-size:9px;letter-spacing:2px;color:var(--muted);margin-bottom:6px;">GRÖSSE (CM)</div>'+
          '<input id="ob-height" type="number" value="'+obData.height+'" placeholder="z.B. 180" style="width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:13px;font-family:inherit;font-size:15px;outline:none;box-sizing:border-box;">'+
        '</div>'+
      '</div>'+
      '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;font-size:11px;color:var(--muted);line-height:1.6;">'+
        '&#128274; Deine Körperdaten sind privat und werden nur lokal gespeichert.'+
      '</div>';
  } else if(obStep===2){
    var lvls = [
      {v:'beginner',     l:'ANFÄNGER',       d:'Ich fange gerade an', icon:'&#127935;'},
      {v:'intermediate', l:'FORTGESCHRITTEN', d:'1-2 Jahre Erfahrung', icon:'&#128170;'},
      {v:'advanced',     l:'ERFAHREN',        d:'3+ Jahre, solide Basis', icon:'&#127937;'},
    ];
    for(var i=0;i<lvls.length;i++){
      var sel=obData.level===lvls[i].v;
      content+='<div onclick="obData.level=\''+lvls[i].v+'\';renderObStep()" style="display:flex;align-items:center;gap:12px;background:'+(sel?'rgba(255,85,0,0.08)':'var(--bg2)')+';border:1.5px solid '+(sel?'var(--accent)':'var(--border)')+';border-radius:12px;padding:14px 16px;margin-bottom:10px;cursor:pointer;">'+
        '<div style="font-size:24px;">'+lvls[i].icon+'</div>'+
        '<div><div style="font-size:14px;color:'+(sel?'var(--accent)':'var(--text)')+';font-weight:800;letter-spacing:1px;">'+lvls[i].l+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px;">'+lvls[i].d+'</div></div>'+
      '</div>';
    }
  } else if(obStep===3){
    var goals = [
      {v:'strength',   l:'KRAFT AUFBAUEN',    d:'Stärker & muskulöser werden',    icon:'&#128170;'},
      {v:'skills',     l:'SKILLS LERNEN',     d:'Muscle-Up, Handstand & co.',     icon:'&#127775;'},
      {v:'endurance',  l:'AUSDAUER',          d:'Länger & öfter trainieren',      icon:'&#127939;'},
      {v:'weight',     l:'ABNEHMEN',          d:'Kalorien verbrennen',            icon:'&#128293;'},
      {v:'challenges', l:'CHALLENGES',        d:'Challenges meistern & gewinnen', icon:'&#127942;'},
      {v:'compete',    l:'WETTKAMPF',         d:'Gegen andere antreten',          icon:'&#9876;&#65039;'},
      {v:'all',        l:'ALLES',             d:'Rundum fit werden',              icon:'&#127919;'},
    ];
    for(var i=0;i<goals.length;i++){
      var sel=obData.goal===goals[i].v;
      content+='<div onclick="obData.goal=\''+goals[i].v+'\';renderObStep()" style="display:flex;align-items:center;gap:12px;background:'+(sel?'rgba(255,85,0,0.08)':'var(--bg2)')+';border:1.5px solid '+(sel?'var(--accent)':'var(--border)')+';border-radius:12px;padding:12px 16px;margin-bottom:8px;cursor:pointer;">'+
        '<div style="font-size:20px;">'+goals[i].icon+'</div>'+
        '<div><div style="font-size:13px;color:'+(sel?'var(--accent)':'var(--text)')+';font-weight:800;letter-spacing:1px;">'+goals[i].l+'</div><div style="font-size:11px;color:var(--muted);margin-top:1px;">'+goals[i].d+'</div></div>'+
      '</div>';
    }
  } else if(obStep===4){
    var btns='';
    for(var i=1;i<=7;i++){
      var sel=obData.weeklyGoal===i;
      btns+='<button onclick="obData.weeklyGoal='+i+';renderObStep()" style="background:'+(sel?'var(--accent)':'var(--bg2)')+';border:1px solid '+(sel?'var(--accent)':'var(--border)')+';color:'+(sel?'#fff':'var(--muted)')+';border-radius:10px;padding:14px 4px;font-family:inherit;font-size:16px;font-weight:800;cursor:pointer;flex:1;transition:all 0.15s;">'+i+'</button>';
    }
    content =
      '<div style="display:flex;gap:6px;margin-bottom:16px;">'+btns+'</div>'+
      '<div style="text-align:center;font-size:13px;color:var(--muted);">'+
        obData.weeklyGoal+'x pro Woche'+
      '</div>';
  }

  // Last step = LOS GEHTS, other steps = WEITER
  var isLast = obStep >= totalSteps - 1;
  var nextBtn = isLast
    ? '<button onclick="obFinish()" style="width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:16px;font-weight:800;letter-spacing:2px;padding:15px;cursor:pointer;margin-top:16px;">LOS GEHTS! \uD83D\uDCAA</button>'
    : '<button onclick="obNext()" style="width:100%;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:inherit;font-size:16px;font-weight:800;letter-spacing:2px;padding:15px;cursor:pointer;margin-top:16px;">WEITER \u2192</button>';

  var backBtnHtml = obStep > 0
    ? '<button onclick="obStep--;renderObStep()" style="width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:10px;cursor:pointer;">\u2190 ZUR\u00DCCK</button>'
    : '';

  m.innerHTML =
    '<div style="max-width:380px;margin:0 auto;padding-top:20px;">'+
      dots+
      '<div style="font-size:44px;text-align:center;margin:20px 0 12px;">'+s.icon+'</div>'+
      '<div style="font-size:26px;font-weight:900;letter-spacing:3px;color:var(--accent);text-align:center;margin-bottom:6px;">'+s.title+'</div>'+
      '<div style="font-size:13px;color:var(--muted);text-align:center;margin-bottom:24px;">'+s.sub+'</div>'+
      content+
      nextBtn+
      backBtnHtml+
    '</div>';
}

function obNext(){
  if(obStep===0){
    var n=document.getElementById('ob-name'); var a=document.getElementById('ob-age');
    if(n) obData.name=n.value.trim();
    if(a) obData.age=a.value;
    if(!obData.name){ alert('Bitte Namen eingeben!'); return; }
  }
  if(obStep===1){
    var w=document.getElementById('ob-weight'); var h=document.getElementById('ob-height');
    if(w) obData.weight=w.value;
    if(h) obData.height=h.value;
  }
  obStep++;
  renderObStep();
}

function obFinish(){
  prData = prData || {};
  prData.name = obData.name;
  prData.age = obData.age;
  prData.weight = obData.weight;
function obFinish(){
  if(!prData) prData = {};
  prData.name = obData.name || '';
  prData.age = obData.age || '';
  prData.weight = obData.weight || '';
  prData.height = obData.height || '';
  prData.goal = obData.goal || 'strength';
  prData.level = obData.level || 'beginner';
  prData.joinDate = new Date().toISOString().slice(0,10);
  try{ spr(); }catch(x){}

  if(!streakData) streakData = {};
  streakData.weeklyGoal = obData.weeklyGoal || 3;
  streakData.goalSet = true;
  try{ sstreak(); }catch(x){}

  try{ localStorage.setItem('cali_onboarded','1'); }catch(x){}
  var m = document.getElementById('ob-modal'); if(m) m.remove();
  try{ fbSave(); }catch(x){}
  try{ buildStreakWidget(); }catch(x){}
  try{ buildStartChallengeWidget(); }catch(x){}
  toast('\uD83D\uDCAA Willkommen' + (obData.name?' '+obData.name:'') + '! Viel Erfolg!');
}