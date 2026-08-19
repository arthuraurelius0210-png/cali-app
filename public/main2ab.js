
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
function getFlames(n){var f='';var c=Math.min(n,5);for(var i=0;i<c;i++)f+='\uD83D\uDD25';if(n>5)f+=' x'+n;return f;}

function showWeeklyGoalModal(){
  var ex=document.getElementById('weekly-goal-modal');if(ex)ex.remove();
  var prevGoal=streakData.weeklyGoal||3;
  var modal=document.createElement('div');modal.id='weekly-goal-modal';
  modal.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:24px;';
  var box=document.createElement('div');box.style.cssText='background:var(--bg2);border:none;border-radius:20px;box-shadow:0 12px 30px rgba(0,0,0,0.06);padding:28px 24px;width:100%;max-width:320px;text-align:center;';
  var flame=document.createElement('div');flame.style.cssText='font-size:48px;margin-bottom:12px;';flame.innerHTML='<span class="flame-pulse">\uD83D\uDD25</span>';
  var title=document.createElement('div');title.style.cssText='font-family:inherit;font-weight:800;font-size:22px;color:var(--text);margin-bottom:8px;';title.textContent='Trainings-Streak';
  var sub=document.createElement('div');sub.style.cssText='font-size:13px;color:var(--muted);margin-bottom:24px;';sub.textContent='Wie oft willst du diese Woche trainieren?';
  var lbl=document.createElement('div');lbl.style.cssText='font-family:inherit;font-weight:600;font-size:12px;color:var(--muted);margin-bottom:12px;';lbl.textContent='Wochenziel';
  var btnRow=document.createElement('div');btnRow.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:20px;';
  var goalBtns=[];
  for(var i=1;i<=7;i++){
    (function(n){
      var btn=document.createElement('button');btn.textContent=String(n);btn.className='pressable';
      btn.style.cssText='background:var(--bg3);border:1px solid var(--border);color:var(--muted);border-radius:10px;padding:12px 4px;font-family:inherit;font-weight:800;font-size:18px;font-variant-numeric:tabular-nums;cursor:pointer;transition:background-color var(--dur-fast) ease,border-color var(--dur-fast) ease,color var(--dur-fast) ease,transform var(--dur-fast) var(--ease-out);';
      btn.setAttribute('aria-label',n+' Workouts pro Woche');
      btn.onclick=function(){for(var j=0;j<goalBtns.length;j++){goalBtns[j].style.background='var(--bg3)';goalBtns[j].style.borderColor='var(--border)';goalBtns[j].style.color='var(--muted)';}btn.style.background='rgba(255,85,0,0.1)';btn.style.borderColor='var(--accent)';btn.style.color='var(--accent-ink)';streakData.weeklyGoal=n;};
      goalBtns.push(btn);btnRow.appendChild(btn);
    })(i);
  }
  var selIdx = (streakData.weeklyGoal||3) - 1;
  goalBtns[selIdx].style.background='rgba(255,85,0,0.1)';goalBtns[selIdx].style.borderColor='var(--accent)';goalBtns[selIdx].style.color='var(--accent-ink)';
  var saveBtn=document.createElement('button');saveBtn.className='pk-btn';saveBtn.style.cssText='width:100%;background:var(--accent-deep);color:#fff;border:none;border-radius:16px;font-family:inherit;font-size:15px;font-weight:700;padding:14px;cursor:pointer;transition:transform var(--dur-fast) var(--ease-out);';
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
  cancelBtn.className='pressable';
  cancelBtn.style.cssText='width:100%;background:none;border:none;color:var(--muted);font-family:inherit;font-size:13px;padding:12px;margin-top:4px;cursor:pointer;';
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

// Labels sitzen auf dunklem Blur-Chip im Hero — helle Originalfarben sind hier richtig
function getLevel(){
  var streak = streakData.currentStreak || 0;
  if(streak >= 365) return {label:'Legend', color:'#FFD700'};
  if(streak >= 180) return {label:'Elite', color:'#FF5500'};
  if(streak >= 90)  return {label:'Pro', color:'#FF8C00'};
  if(streak >= 30)  return {label:'Fortgeschritten', color:'#22C55E'};
  if(streak >= 7)   return {label:'Beginner', color:'#38BDF8'};
  return {label:'Starter', color:'#CFC7B0'};
}
