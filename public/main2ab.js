
// FLAMMEN-STREAK
var streakData={currentStreak:0,longestStreak:0,weeklyGoal:3,goalSet:false};
function lstreak(){try{var d=localStorage.getItem('cali_streak');if(d)streakData=JSON.parse(d);}catch(x){}}
function sstreak(){try{localStorage.setItem('cali_streak',JSON.stringify(streakData));}catch(x){}}
function calcStreak(){
  var have={};for(var i=0;i<ents.length;i++){if(ents[i].date)have[ents[i].date]=1;}
  // Eis-Tage (Streak auf Eis) überbrücken Lücken, zählen aber nicht als Trainingstag
  var ice={};try{ice=JSON.parse(localStorage.getItem('cali_ice_dates')||'{}');}catch(x){}
  if(!Object.keys(have).length){streakData.currentStreak=0;sstreak();return;}
  var cur=new Date();
  var curStr=cur.toISOString().slice(0,10);
  // Heute noch nicht trainiert (und nicht geschützt): Streak ab gestern prüfen
  if(!have[curStr]&&!ice[curStr]){cur=new Date(cur.getTime()-86400000);curStr=cur.toISOString().slice(0,10);}
  var streak=0;var guard=0;
  while(guard++<3650){
    if(have[curStr]){streak++;}
    else if(ice[curStr]){/* Eis-Tag: überbrücken */}
    else break;
    cur=new Date(cur.getTime()-86400000);
    curStr=cur.toISOString().slice(0,10);
  }
  streakData.currentStreak=streak;if(streak>streakData.longestStreak)streakData.longestStreak=streak;sstreak();
}
function getWeeklyProgress(){
  var today=new Date();var dow=today.getDay();var ws=new Date(today);ws.setDate(today.getDate()-(dow===0?6:dow-1));
  var wsStr=ws.toISOString().slice(0,10);var days={};
  for(var i=0;i<ents.length;i++){if(ents[i].date>=wsStr)days[ents[i].date]=1;}
  return Object.keys(days).length;
}
// Legacy-Helfer (Emoji-Flammen). Im Dark-Mono-UI nicht mehr gerendert, bleibt für Kompatibilität erhalten.
function getFlames(n){var f='';var c=Math.min(n,5);for(var i=0;i<c;i++)f+='🔥';if(n>5)f+=' x'+n;return f;}

function showWeeklyGoalModal(){
  var ex=document.getElementById('weekly-goal-modal');if(ex)ex.remove();
  var prevGoal=streakData.weeklyGoal||3;
  var modal=document.createElement('div');modal.id='weekly-goal-modal';
  modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px;';
  var box=document.createElement('div');box.style.cssText='background:var(--card);border:1px solid var(--line2);border-radius:var(--r-card);padding:24px 20px;width:100%;max-width:320px;text-align:center;';
  // Icon-Slot: Line-Icon im Ring statt Emoji-Flamme
  var flame=document.createElement('div');flame.style.cssText='display:flex;justify-content:center;margin-bottom:14px;';
  flame.innerHTML=(typeof iconWrap==='function')?iconWrap('flame',{size:20,box:44,color:'var(--accent)'}):'';
  var title=document.createElement('div');title.className='ttl';title.style.cssText='margin-bottom:6px;';title.textContent='Trainings-Streak';
  var sub=document.createElement('div');sub.className='row-sub';sub.style.cssText='margin-bottom:22px;';sub.textContent='Wie oft willst du diese Woche trainieren?';
  var lbl=document.createElement('div');lbl.className='lbl';lbl.style.cssText='margin-bottom:10px;';lbl.textContent='Wochenziel';
  var btnRow=document.createElement('div');btnRow.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:20px;';
  var goalBtns=[];
  // Aktiv = Fläche --line2 + --text (wie Segment-Control), inaktiv = --card2 + --muted
  function setGoalBtn(b,on){
    if(!b) return;
    b.style.background=on?'var(--line2)':'var(--card2)';
    b.style.borderColor=on?'var(--line2)':'var(--line)';
    b.style.color=on?'var(--text)':'var(--muted)';
    b.setAttribute('aria-pressed',on?'true':'false');
  }
  for(var i=1;i<=7;i++){
    (function(n){
      var btn=document.createElement('button');btn.type='button';btn.textContent=String(n);btn.className='pressable num';
      btn.style.cssText='background:var(--card2);border:1px solid var(--line);color:var(--muted);border-radius:var(--r-sm);padding:12px 0;min-height:44px;font-family:inherit;font-weight:600;font-size:15px;font-variant-numeric:tabular-nums;cursor:pointer;transition:background-color var(--dur-fast) ease,border-color var(--dur-fast) ease,color var(--dur-fast) ease,transform var(--dur-fast) var(--ease-out);';
      btn.setAttribute('aria-label',n+' Workouts pro Woche');
      btn.onclick=function(){for(var j=0;j<goalBtns.length;j++){setGoalBtn(goalBtns[j],false);}setGoalBtn(btn,true);streakData.weeklyGoal=n;};
      goalBtns.push(btn);btnRow.appendChild(btn);
    })(i);
  }
  var selIdx = (streakData.weeklyGoal||3) - 1;
  setGoalBtn(goalBtns[selIdx],true);
  var saveBtn=document.createElement('button');saveBtn.type='button';saveBtn.className='btn pressable';saveBtn.style.cssText='margin-top:0;';
  saveBtn.textContent='Los geht\'s!';
  saveBtn.onclick=function(){
  streakData.goalSet=true;
  sstreak();
  modal.remove();
  buildStreakWidget();
  goPage('pr');
  toast('Ziel: '+streakData.weeklyGoal+'x pro Woche!');
};
  var cancelBtn=document.createElement('button');
  cancelBtn.type='button';
  cancelBtn.className='btn-g pressable';
  cancelBtn.style.cssText='width:100%;min-height:44px;margin-top:8px;';
  cancelBtn.textContent='Abbrechen';
  cancelBtn.onclick=function(){
    streakData.weeklyGoal=prevGoal;
    streakData.goalSet=true;
    sstreak();
    modal.remove();
    buildStreakWidget();
  };
  box.appendChild(flame);box.appendChild(title);box.appendChild(sub);box.appendChild(lbl);box.appendChild(btnRow);box.appendChild(saveBtn);box.appendChild(cancelBtn);
  modal.appendChild(box);document.body.appendChild(modal);
  modal.onclick=function(e){
    if(e.target===modal){
      streakData.weeklyGoal=prevGoal;
      streakData.goalSet=true;
      sstreak();
      modal.remove();
      buildStreakWidget();
    }
  };
  if(window.caliMotion){ caliMotion.sheetIn(null, modal); caliMotion.overlayIn(box); }
}

// Level-Stufen nach Streak — Farben als Tokens (Text auf dunklem Grund, kein Hex)
function getLevel(){
  var streak = streakData.currentStreak || 0;
  if(streak >= 365) return {label:'Legend', color:'var(--amber)'};
  if(streak >= 180) return {label:'Elite', color:'var(--accent)'};
  if(streak >= 90)  return {label:'Pro', color:'var(--accent)'};
  if(streak >= 30)  return {label:'Fortgeschritten', color:'var(--success)'};
  if(streak >= 7)   return {label:'Beginner', color:'var(--blue)'};
  return {label:'Starter', color:'var(--muted)'};
}
