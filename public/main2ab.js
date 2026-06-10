
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
