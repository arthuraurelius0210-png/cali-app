// ── SKILL LERNPFAD ────────────────────────────────────────
var SKILLS = [
  {id:'muscle_up',name:'Muscle-Up',icon:'\uD83D\uDD25',desc:'Die Konig der Calisthenics-Skills. Kombiniert Klimmzug und Dips.',color:'#ff5500',steps:[
    {id:'mu1',name:'10 saubere Klimmzuge',desc:'Basis. Schulterbreiter Griff, volle ROM.'},
    {id:'mu2',name:'5 explosive Klimmzuge',desc:'Zieh so hoch wie moglich, Brust an die Stange.'},
    {id:'mu3',name:'10 Dips volle ROM',desc:'Trizeps und Schultern starken.'},
    {id:'mu4',name:'Negative Muscle-Ups 5x',desc:'Von oben langsam runterlassen.'},
    {id:'mu5',name:'Band-gestutzter Muscle-Up',desc:'Leichtes Band, Koordination entwickeln.'},
    {id:'mu6',name:'Kipping Muscle-Up',desc:'Mit Schwung, Koordination der Transition lernen.'},
    {id:'mu7',name:'Strikter Muscle-Up',desc:'Ohne Schwung, kontrolliert. Das echte Ziel.'}
  ]},
  {id:'front_lever',name:'Front Lever',icon:'\uD83D\uDCAA',desc:'Core- und Zugkraft. Korper horizontal parallel zum Boden.',color:'#38BDF8',steps:[
    {id:'fl1',name:'Hanging Knee Raises 15 Wdh',desc:'Core aus der Hangeposition starken.'},
    {id:'fl2',name:'Tuck Front Lever 10 Sek',desc:'Knie zur Brust, Rucken gerade, halten.'},
    {id:'fl3',name:'Tuck Front Lever 30 Sek',desc:'Dieselbe Position langer halten.'},
    {id:'fl4',name:'Advanced Tuck 10 Sek',desc:'Knie weiter weg, Rucken flacher.'},
    {id:'fl5',name:'One Leg Extended 10 Sek',desc:'Ein Bein strecken, anderes eingezogen.'},
    {id:'fl6',name:'Straddle Front Lever 10 Sek',desc:'Beide Beine gestreckt, gegratschter Stand.'},
    {id:'fl7',name:'Full Front Lever 5 Sek',desc:'Beide Beine gestreckt. Ziel erreicht!'}
  ]},
  {id:'planche',name:'Planche',icon:'\u2605',desc:'Pure Druckkraft. Korper horizontal, nur durch Armkraft.',color:'#A78BFA',steps:[
    {id:'pl1',name:'Planche Lean 10 Sek',desc:'Schultern weit uber die Hande hinaus lehnen.'},
    {id:'pl2',name:'Tuck Planche 5 Sek',desc:'Knie nah an den Armen, Hufte hoch, balancieren.'},
    {id:'pl3',name:'Tuck Planche 15 Sek',desc:'Stabile Position, Korper angespannt.'},
    {id:'pl4',name:'Advanced Tuck Planche 5 Sek',desc:'Knie weiter hinten, Rucken flacher.'},
    {id:'pl5',name:'Straddle Planche 3 Sek',desc:'Beine gestreckt und gespreizt. Sehr schwer.'},
    {id:'pl6',name:'Full Planche 2 Sek',desc:'Beide Beine komplett gestreckt. Elite!'}
  ]},
  {id:'handstand',name:'Handstand',icon:'\uD83E\uDD38',desc:'Balance, Kraft und Korperbeherrschung.',color:'#F59E0B',steps:[
    {id:'hs1',name:'Wall Handstand 30 Sek',desc:'Bauch zur Wand, Gewicht auf Fingerkuppen.'},
    {id:'hs2',name:'Wall Handstand 60 Sek',desc:'Stabil und kontrolliert an der Wand.'},
    {id:'hs3',name:'Kick-up gegen Wand 10x',desc:'Anlauf uben, Gleichgewicht finden.'},
    {id:'hs4',name:'Wall Handstand Rucken weg',desc:'Kurz von der Wand ablosen.'},
    {id:'hs5',name:'Freier Handstand 3 Sek',desc:'Ohne Wand, ruhige Finger, aktive Schultern.'},
    {id:'hs6',name:'Freier Handstand 10 Sek',desc:'Konsistent halten, Korper gerade.'},
    {id:'hs7',name:'Handstand Walk 3 Schritte',desc:'Gleichgewicht durch Gewichtverlagerung.'}
  ]},
  {id:'human_flag',name:'Human Flag',icon:'\uD83D\uDEA9',desc:'Seitliche Planche am Pfosten. Absolute Seitkraft.',color:'#4ECDC4',steps:[
    {id:'hf1',name:'Hanging Side Raises 10 Wdh',desc:'An der Stange, Beine seitlich hochheben.'},
    {id:'hf2',name:'Tuck Human Flag 3 Sek',desc:'Beine eingezogen, seitlich am Pfosten.'},
    {id:'hf3',name:'Tuck Human Flag 10 Sek',desc:'Stabile Tuck-Position, Ellenbogen gestreckt.'},
    {id:'hf4',name:'Straddle Human Flag 3 Sek',desc:'Beine gestreckt und gespreizt.'},
    {id:'hf5',name:'Full Human Flag 2 Sek',desc:'Beide Beine komplett gestreckt. Ziel!'}
  ]},
  {id:'back_lever',name:'Back Lever',icon:'\uD83D\uDD04',desc:'Korper horizontal unter der Stange, Bauch nach unten.',color:'#FF6B35',steps:[
    {id:'bl1',name:'Skin the Cat 5x',desc:'Durch die Stange rollen, Schultern mobilisieren.'},
    {id:'bl2',name:'Tuck Back Lever 5 Sek',desc:'Knie eingezogen, unter der Stange halten.'},
    {id:'bl3',name:'Tuck Back Lever 15 Sek',desc:'Stabil, Arme gestreckt, Spannung halten.'},
    {id:'bl4',name:'Advanced Tuck 10 Sek',desc:'Knie weiter weg, Rucken flacher.'},
    {id:'bl5',name:'Straddle Back Lever 5 Sek',desc:'Beine gestreckt und gespreizt.'},
    {id:'bl6',name:'Full Back Lever 5 Sek',desc:'Beide Beine zusammen, komplett gestreckt.'}
  ]},
  {id:'dragon_flag',name:'Dragon Flag',icon:'\uD83D\uDC09',desc:'Extremes Core-Training. Korper gerade von der Bank gehoben.',color:'#FF4444',steps:[
    {id:'df1',name:'Hollow Body Hold 30 Sek',desc:'Flach auf Boden, Rucken flach, Beine angehoben.'},
    {id:'df2',name:'Tuck Dragon Flag 5 Wdh',desc:'Knie eingezogen, Rucken von der Bank heben.'},
    {id:'df3',name:'Negative Dragon Flag 3x',desc:'Langsam von oben runterlassen.'},
    {id:'df4',name:'Straddle Dragon Flag 3 Wdh',desc:'Beine gespreizt, kontrolliert.'},
    {id:'df5',name:'Full Dragon Flag 3 Wdh',desc:'Beide Beine gestreckt, volle Kontrolle.'}
  ]},
  {id:'lsit_vsit',name:'L-Sit bis V-Sit',icon:'\u26A1',desc:'Kompression und Trizepskraft.',color:'#A78BFA',steps:[
    {id:'ls1',name:'Tuck L-Sit 5 Sek',desc:'Knie eingezogen, Boden verlassen.'},
    {id:'ls2',name:'Tuck L-Sit 15 Sek',desc:'Stabile Tuck-Position.'},
    {id:'ls3',name:'L-Sit ein Bein 5 Sek',desc:'Ein Bein gestreckt, anderes eingezogen.'},
    {id:'ls4',name:'L-Sit 10 Sek',desc:'Beide Beine gestreckt, parallel zum Boden.'},
    {id:'ls5',name:'L-Sit 20 Sek',desc:'Konstant halten, Hufte nicht absacken.'},
    {id:'ls6',name:'V-Sit 3 Sek',desc:'Beine uber 45 Grad, maximale Kompression.'}
  ]},
  {id:'typewriter',name:'Typewriter Pull-Up',icon:'\u270D\uFE0F',desc:'Seitliche Kontrolle am Klimmzugstab.',color:'#F59E0B',steps:[
    {id:'tw1',name:'15 saubere Klimmzuge',desc:'Solide Basis, volle ROM, kein Schwung.'},
    {id:'tw2',name:'Archer Pull-Ups 5x pro Seite',desc:'Einen Arm gebeugt, anderen gestreckt.'},
    {id:'tw3',name:'Archer Pull-Ups 10x pro Seite',desc:'Kontrolliert und langsam.'},
    {id:'tw4',name:'Typewriter langsam 3 Wdh',desc:'Oben seitlich von links nach rechts gleiten.'},
    {id:'tw5',name:'Typewriter 5 Wdh sauber',desc:'Flussige Bewegung, volle Kontrolle.'}
  ]},
  {id:'ring_mu',name:'Ring Muscle-Up',icon:'\uD83D\uDD18',desc:'Schwieriger als Stangen-MU durch Instabilitat der Ringe.',color:'#38BDF8',steps:[
    {id:'rm1',name:'Strikter Stangen-Muscle-Up',desc:'Voraussetzung: sauberer MU an der Stange.'},
    {id:'rm2',name:'Ring-Dips 10 Wdh',desc:'An den Ringen, viel instabiler.'},
    {id:'rm3',name:'Ring-Klimmzuge 10 Wdh',desc:'Ringe drehen sich ein, Ellenbogen nah.'},
    {id:'rm4',name:'Negativer Ring MU 5x',desc:'Von oben langsam durch die Transition.'},
    {id:'rm5',name:'Ring MU kipping 3x',desc:'Mit Schwung, Koordination der Transition.'},
    {id:'rm6',name:'Strikter Ring Muscle-Up',desc:'Ohne Schwung. Absolutes Elite-Level.'}
  ]},
  {id:'elbow_lever',name:'Elbow Lever',icon:'\uD83E\uDDB5',desc:'Gleichgewicht auf den Ellenbogen.',color:'#4ECDC4',steps:[
    {id:'el1',name:'Crow Pose 5 Sek',desc:'Knie auf Oberarme stutzen, Gewicht nach vorne.'},
    {id:'el2',name:'Crow Pose 15 Sek',desc:'Stabil, Blick nach vorne.'},
    {id:'el3',name:'Elbow Lever schrag 3 Sek',desc:'Gewicht auf einen Ellenbogen, Korper schrag.'},
    {id:'el4',name:'Elbow Lever 5 Sek',desc:'Korper parallel zum Boden auf beiden Ellenbogen.'},
    {id:'el5',name:'Elbow Lever 15 Sek',desc:'Kontrolliert und stabil.'}
  ]},
  {id:'pullup360',name:'360 Pull-Up',icon:'\uD83D\uDD04',desc:'Explosiver Skill. Am hochsten Punkt um die Stange rotieren.',color:'#C8F04A',steps:[
    {id:'p361',name:'20 explosive Klimmzuge',desc:'Basis: maximale Explosivkraft.'},
    {id:'p362',name:'Chest-to-Bar Pull-Ups 10x',desc:'Brust beruht die Stange bei jedem Zug.'},
    {id:'p363',name:'Half-Turn 180 Grad 3x',desc:'Am hochsten Punkt eine halbe Drehung.'},
    {id:'p364',name:'360 Pull-Up mit Hilfe 3x',desc:'Partner sichert, volle Rotation uben.'},
    {id:'p365',name:'360 Pull-Up solo',desc:'Volle Rotation, sauber gefangen.'}
  ]}
];

var skillProgress = {};
var skOpenState = {};

function loadSkillProgress(){
  try{var d=localStorage.getItem('cali_skills');if(d)skillProgress=JSON.parse(d);}catch(x){}
}
function saveSkillProgress(){
  try{localStorage.setItem('cali_skills',JSON.stringify(skillProgress));}catch(x){}
}
function toggleSkillStep(stepId){
  skillProgress[stepId]=!skillProgress[stepId];
  saveSkillProgress();
  buildSkillUI();
}
function toggleSkillCard(skillId){
  skOpenState[skillId]=!skOpenState[skillId];
  buildSkillUI();
}
function hexToRgbInline(hex){
  try{var r=parseInt(hex.slice(1,3),16);var g=parseInt(hex.slice(3,5),16);var b=parseInt(hex.slice(5,7),16);return r+','+g+','+b;}catch(e){return '0,0,0';}
}

function buildSkillUI(){
  var el=document.getElementById('sk-list');
  if(!el)return;
  el.innerHTML='';
  for(var si=0;si<SKILLS.length;si++){
    var skill=SKILLS[si];
    var doneCount=0;
    for(var k=0;k<skill.steps.length;k++){if(skillProgress[skill.steps[k].id])doneCount++;}
    var pct=Math.round((doneCount/skill.steps.length)*100);
    var allDone=doneCount===skill.steps.length;

    var card=document.createElement('div');
    card.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:16px;margin-bottom:12px;overflow:hidden;';

    // Header
    var header=document.createElement('div');
    header.style.cssText='padding:16px 16px 12px;cursor:pointer;';
    header.onclick=(function(sid){return function(){toggleSkillCard(sid);};})(skill.id);

    var htop=document.createElement('div');
    htop.style.cssText='display:flex;align-items:center;gap:12px;margin-bottom:10px;';

    var ic=document.createElement('div');ic.style.cssText='font-size:28px;line-height:1;';ic.textContent=skill.icon;

    var tw=document.createElement('div');tw.style.cssText='flex:1;';
    var tn=document.createElement('div');tn.style.cssText='font-size:18px;font-weight:800;color:var(--text);';tn.textContent=skill.name;
    var td=document.createElement('div');td.style.cssText='font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4;';td.textContent=skill.desc;
    tw.appendChild(tn);tw.appendChild(td);

    var pe=document.createElement('div');
    pe.style.cssText='font-size:13px;font-weight:800;color:'+(allDone?skill.color:'var(--muted)')+';white-space:nowrap;text-align:right;';
    pe.textContent=allDone?'\u2713 DONE':doneCount+' / '+skill.steps.length;

    htop.appendChild(ic);htop.appendChild(tw);htop.appendChild(pe);

    var pw=document.createElement('div');pw.style.cssText='background:var(--bg3);border-radius:20px;height:5px;overflow:hidden;';
    var pf=document.createElement('div');pf.style.cssText='height:100%;border-radius:20px;background:'+skill.color+';width:'+pct+'%;transition:width 0.4s;';
    pw.appendChild(pf);

    header.appendChild(htop);header.appendChild(pw);
    card.appendChild(header);

    // Steps (collapsible)
    var sw=document.createElement('div');
    sw.style.cssText='display:'+(skOpenState[skill.id]?'block':'none')+';border-top:1px solid var(--border);';

    for(var k=0;k<skill.steps.length;k++){
      var step=skill.steps[k];
      var done=!!skillProgress[step.id];
      var isNext=!done&&(k===0||!!skillProgress[skill.steps[k-1].id]);

      var sr=document.createElement('div');
      sr.style.cssText='display:flex;align-items:flex-start;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;';
      if(isNext)sr.style.background='rgba('+hexToRgbInline(skill.color)+',0.05)';
      sr.onclick=(function(sid){return function(){toggleSkillStep(sid);};})(step.id);

      var circle=document.createElement('div');
      circle.style.cssText='width:26px;height:26px;border-radius:50%;flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;';
      if(done){circle.style.background=skill.color;circle.style.color='#fff';circle.textContent='\u2713';}
      else if(isNext){circle.style.cssText+=';background:none;border:2px solid '+skill.color+';color:'+skill.color;}
      else{circle.style.background='var(--bg3)';circle.style.border='1px solid var(--border2)';circle.style.color='var(--muted2)';}
      if(!done)circle.textContent=String(k+1);

      var si2=document.createElement('div');si2.style.cssText='flex:1;';
      var sn=document.createElement('div');
      sn.style.cssText='font-size:14px;font-weight:'+(done||isNext?'700':'500')+';color:'+(done?'var(--muted2)':'var(--text)')+';'+(done?'text-decoration:line-through;':'');
      sn.textContent=step.name;
      var sd2=document.createElement('div');sd2.style.cssText='font-size:11px;color:var(--muted);margin-top:3px;line-height:1.4;';sd2.textContent=step.desc;
      si2.appendChild(sn);si2.appendChild(sd2);

      if(isNext){
        var nb=document.createElement('span');
        nb.style.cssText='display:inline-block;background:'+skill.color+';color:#fff;font-size:9px;font-weight:800;letter-spacing:1px;padding:2px 8px;border-radius:20px;margin-top:5px;';
        nb.textContent='NACHSTER SCHRITT';
        si2.appendChild(nb);
      }

      sr.appendChild(circle);sr.appendChild(si2);
      sw.appendChild(sr);
    }
    if(sw.lastChild)sw.lastChild.style.borderBottom='none';
    card.appendChild(sw);
    el.appendChild(card);
  }
}

loadSkillProgress();