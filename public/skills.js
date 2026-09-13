// ── SKILL LERNPFAD ────────────────────────────────────────
var SKILLS = [
  {id:'muscle_up',name:'Muscle-Up',icon:'🔥',desc:'Der König der Calisthenics-Skills. Kombiniert Klimmzug und Dips.',color:'#ff5500',steps:[
    {id:'mu1',name:'10 saubere Klimmzüge',desc:'Basis. Schulterbreiter Griff, volle ROM.'},
    {id:'mu2',name:'5 explosive Klimmzüge',desc:'Zieh so hoch wie möglich, Brust an die Stange.'},
    {id:'mu3',name:'10 Dips volle ROM',desc:'Trizeps und Schultern stärken.'},
    {id:'mu4',name:'Negative Muscle-Ups 5x',desc:'Von oben langsam runterlassen.'},
    {id:'mu5',name:'Band-gestützter Muscle-Up',desc:'Leichtes Band, Koordination entwickeln.'},
    {id:'mu6',name:'Kipping Muscle-Up',desc:'Mit Schwung, Koordination der Transition lernen.'},
    {id:'mu7',name:'Strikter Muscle-Up',desc:'Ohne Schwung, kontrolliert. Das echte Ziel.'}
  ]},
  {id:'front_lever',name:'Front Lever',icon:'💪',desc:'Core- und Zugkraft. Körper horizontal parallel zum Boden.',color:'#38BDF8',steps:[
    {id:'fl1',name:'Hanging Knee Raises 15 Wdh.',desc:'Core aus der Hängeposition stärken.'},
    {id:'fl2',name:'Tuck Front Lever 10 Sek',desc:'Knie zur Brust, Rücken gerade, halten.'},
    {id:'fl3',name:'Tuck Front Lever 30 Sek',desc:'Dieselbe Position länger halten.'},
    {id:'fl4',name:'Advanced Tuck 10 Sek',desc:'Knie weiter weg, Rücken flacher.'},
    {id:'fl5',name:'One Leg Extended 10 Sek',desc:'Ein Bein strecken, anderes eingezogen.'},
    {id:'fl6',name:'Straddle Front Lever 10 Sek',desc:'Beide Beine gestreckt, gegrätschter Stand.'},
    {id:'fl7',name:'Full Front Lever 5 Sek',desc:'Beide Beine gestreckt. Ziel erreicht!'}
  ]},
  {id:'planche',name:'Planche',icon:'★',desc:'Pure Druckkraft. Körper horizontal, nur durch Armkraft.',color:'#A78BFA',steps:[
    {id:'pl1',name:'Planche Lean 10 Sek',desc:'Schultern weit über die Hände hinaus lehnen.'},
    {id:'pl2',name:'Tuck Planche 5 Sek',desc:'Knie nah an den Armen, Hüfte hoch, balancieren.'},
    {id:'pl3',name:'Tuck Planche 15 Sek',desc:'Stabile Position, Körper angespannt.'},
    {id:'pl4',name:'Advanced Tuck Planche 5 Sek',desc:'Knie weiter hinten, Rücken flacher.'},
    {id:'pl5',name:'Straddle Planche 3 Sek',desc:'Beine gestreckt und gespreizt. Sehr schwer.'},
    {id:'pl6',name:'Full Planche 2 Sek',desc:'Beide Beine komplett gestreckt. Elite!'}
  ]},
  {id:'handstand',name:'Handstand',icon:'🤸',desc:'Balance, Kraft und Körperbeherrschung.',color:'#F59E0B',steps:[
    {id:'hs1',name:'Wall Handstand 30 Sek',desc:'Bauch zur Wand, Gewicht auf Fingerkuppen.'},
    {id:'hs2',name:'Wall Handstand 60 Sek',desc:'Stabil und kontrolliert an der Wand.'},
    {id:'hs3',name:'Kick-up gegen Wand 10x',desc:'Anlauf üben, Gleichgewicht finden.'},
    {id:'hs4',name:'Wall Handstand Rücken weg',desc:'Kurz von der Wand ablösen.'},
    {id:'hs5',name:'Freier Handstand 3 Sek',desc:'Ohne Wand, ruhige Finger, aktive Schultern.'},
    {id:'hs6',name:'Freier Handstand 10 Sek',desc:'Konsistent halten, Körper gerade.'},
    {id:'hs7',name:'Handstand Walk 3 Schritte',desc:'Gleichgewicht durch Gewichtsverlagerung.'}
  ]},
  {id:'human_flag',name:'Human Flag',icon:'🚩',desc:'Seitliche Planche am Pfosten. Absolute Seitkraft.',color:'#4ECDC4',steps:[
    {id:'hf1',name:'Hanging Side Raises 10 Wdh.',desc:'An der Stange, Beine seitlich hochheben.'},
    {id:'hf2',name:'Tuck Human Flag 3 Sek',desc:'Beine eingezogen, seitlich am Pfosten.'},
    {id:'hf3',name:'Tuck Human Flag 10 Sek',desc:'Stabile Tuck-Position, Ellenbogen gestreckt.'},
    {id:'hf4',name:'Straddle Human Flag 3 Sek',desc:'Beine gestreckt und gespreizt.'},
    {id:'hf5',name:'Full Human Flag 2 Sek',desc:'Beide Beine komplett gestreckt. Ziel!'}
  ]},
  {id:'back_lever',name:'Back Lever',icon:'🔄',desc:'Körper horizontal unter der Stange, Bauch nach unten.',color:'#FF6B35',steps:[
    {id:'bl1',name:'Skin the Cat 5x',desc:'Durch die Stange rollen, Schultern mobilisieren.'},
    {id:'bl2',name:'Tuck Back Lever 5 Sek',desc:'Knie eingezogen, unter der Stange halten.'},
    {id:'bl3',name:'Tuck Back Lever 15 Sek',desc:'Stabil, Arme gestreckt, Spannung halten.'},
    {id:'bl4',name:'Advanced Tuck 10 Sek',desc:'Knie weiter weg, Rücken flacher.'},
    {id:'bl5',name:'Straddle Back Lever 5 Sek',desc:'Beine gestreckt und gespreizt.'},
    {id:'bl6',name:'Full Back Lever 5 Sek',desc:'Beide Beine zusammen, komplett gestreckt.'}
  ]},
  {id:'dragon_flag',name:'Dragon Flag',icon:'🐉',desc:'Extremes Core-Training. Körper gerade von der Bank gehoben.',color:'#FF4444',steps:[
    {id:'df1',name:'Hollow Body Hold 30 Sek',desc:'Flach auf Boden, Rücken flach, Beine angehoben.'},
    {id:'df2',name:'Tuck Dragon Flag 5 Wdh.',desc:'Knie eingezogen, Rücken von der Bank heben.'},
    {id:'df3',name:'Negative Dragon Flag 3x',desc:'Langsam von oben runterlassen.'},
    {id:'df4',name:'Straddle Dragon Flag 3 Wdh.',desc:'Beine gespreizt, kontrolliert.'},
    {id:'df5',name:'Full Dragon Flag 3 Wdh.',desc:'Beide Beine gestreckt, volle Kontrolle.'}
  ]},
  {id:'lsit_vsit',name:'L-Sit bis V-Sit',icon:'⚡',desc:'Kompression und Trizepskraft.',color:'#A78BFA',steps:[
    {id:'ls1',name:'Tuck L-Sit 5 Sek',desc:'Knie eingezogen, Boden verlassen.'},
    {id:'ls2',name:'Tuck L-Sit 15 Sek',desc:'Stabile Tuck-Position.'},
    {id:'ls3',name:'L-Sit ein Bein 5 Sek',desc:'Ein Bein gestreckt, anderes eingezogen.'},
    {id:'ls4',name:'L-Sit 10 Sek',desc:'Beide Beine gestreckt, parallel zum Boden.'},
    {id:'ls5',name:'L-Sit 20 Sek',desc:'Konstant halten, Hüfte nicht absacken.'},
    {id:'ls6',name:'V-Sit 3 Sek',desc:'Beine über 45 Grad, maximale Kompression.'}
  ]},
  {id:'typewriter',name:'Typewriter Pull-Up',icon:'✍️',desc:'Seitliche Kontrolle am Klimmzugstab.',color:'#F59E0B',steps:[
    {id:'tw1',name:'15 saubere Klimmzüge',desc:'Solide Basis, volle ROM, kein Schwung.'},
    {id:'tw2',name:'Archer Pull-Ups 5x pro Seite',desc:'Einen Arm gebeugt, anderen gestreckt.'},
    {id:'tw3',name:'Archer Pull-Ups 10x pro Seite',desc:'Kontrolliert und langsam.'},
    {id:'tw4',name:'Typewriter langsam 3 Wdh.',desc:'Oben seitlich von links nach rechts gleiten.'},
    {id:'tw5',name:'Typewriter 5 Wdh. sauber',desc:'Flüssige Bewegung, volle Kontrolle.'}
  ]},
  {id:'ring_mu',name:'Ring Muscle-Up',icon:'🔘',desc:'Schwieriger als Stangen-MU durch Instabilität der Ringe.',color:'#38BDF8',steps:[
    {id:'rm1',name:'Strikter Stangen-Muscle-Up',desc:'Voraussetzung: sauberer MU an der Stange.'},
    {id:'rm2',name:'Ring-Dips 10 Wdh.',desc:'An den Ringen, viel instabiler.'},
    {id:'rm3',name:'Ring-Klimmzüge 10 Wdh.',desc:'Ringe drehen sich ein, Ellenbogen nah.'},
    {id:'rm4',name:'Negativer Ring MU 5x',desc:'Von oben langsam durch die Transition.'},
    {id:'rm5',name:'Ring MU kipping 3x',desc:'Mit Schwung, Koordination der Transition.'},
    {id:'rm6',name:'Strikter Ring Muscle-Up',desc:'Ohne Schwung. Absolutes Elite-Level.'}
  ]},
  {id:'elbow_lever',name:'Elbow Lever',icon:'🦵',desc:'Gleichgewicht auf den Ellenbogen.',color:'#4ECDC4',steps:[
    {id:'el1',name:'Crow Pose 5 Sek',desc:'Knie auf Oberarme stützen, Gewicht nach vorne.'},
    {id:'el2',name:'Crow Pose 15 Sek',desc:'Stabil, Blick nach vorne.'},
    {id:'el3',name:'Elbow Lever schräg 3 Sek',desc:'Gewicht auf einen Ellenbogen, Körper schräg.'},
    {id:'el4',name:'Elbow Lever 5 Sek',desc:'Körper parallel zum Boden auf beiden Ellenbogen.'},
    {id:'el5',name:'Elbow Lever 15 Sek',desc:'Kontrolliert und stabil.'}
  ]},
  {id:'pullup360',name:'360 Pull-Up',icon:'🔄',desc:'Explosiver Skill. Am höchsten Punkt um die Stange rotieren.',color:'#C8F04A',steps:[
    {id:'p361',name:'20 explosive Klimmzüge',desc:'Basis: maximale Explosivkraft.'},
    {id:'p362',name:'Chest-to-Bar Pull-Ups 10x',desc:'Brust berührt die Stange bei jedem Zug.'},
    {id:'p363',name:'Half-Turn 180 Grad 3x',desc:'Am höchsten Punkt eine halbe Drehung.'},
    {id:'p364',name:'360 Pull-Up mit Hilfe 3x',desc:'Partner sichert, volle Rotation üben.'},
    {id:'p365',name:'360 Pull-Up solo',desc:'Volle Rotation, sauber gefangen.'}
  ]}
];

var skillProgress = {};
var skOpenState = {};

// Dark Mono: die kategorialen Skill-Farben laufen komplett über Tokens (entsättigt,
// lesbar auf Schwarz). Die Hex-Werte in SKILLS bleiben nur als Schlüssel — ins DOM
// geht ausschließlich skillInk(color), für Text, Ringe UND Balkenfüllung.
var SKILL_INK_MAP = {
  '#ff5500':'var(--accent)',
  '#FF6B35':'var(--accent)',
  '#38BDF8':'var(--blue)',
  '#A78BFA':'var(--purple)',
  '#F59E0B':'var(--amber)',
  '#4ECDC4':'var(--teal)',
  '#FF4444':'var(--red)',
  '#C8F04A':'var(--success)'
};
function skillInk(c){ return SKILL_INK_MAP[c] || 'var(--text)'; }
function skIdx(n){ return n < 10 ? '0'+n : String(n); }

function loadSkillProgress(){
  try{var d=localStorage.getItem('cali_skills');if(d)skillProgress=JSON.parse(d);}catch(x){}
}
function saveSkillProgress(){
  try{localStorage.setItem('cali_skills',JSON.stringify(skillProgress));}catch(x){}
}
function toggleSkillStep(stepId){
  var wasDone=!!skillProgress[stepId];
  skillProgress[stepId]=!skillProgress[stepId];
  saveSkillProgress();
  buildSkillUI();
  if(wasDone) return;
  // Feedback: Schritt erledigt bzw. Skill komplett gemeistert
  var skill=null;
  for(var i=0;i<SKILLS.length&&!skill;i++){
    for(var j=0;j<SKILLS[i].steps.length;j++){
      if(SKILLS[i].steps[j].id===stepId){skill=SKILLS[i];break;}
    }
  }
  if(!skill) return;
  var doneCount=0;
  for(var k=0;k<skill.steps.length;k++){if(skillProgress[skill.steps[k].id])doneCount++;}
  if(doneCount===skill.steps.length){
    var mKey='cali_skill_mastered_'+skill.id;
    var already=null;
    try{already=localStorage.getItem(mKey);}catch(x){}
    if(!already){
      try{localStorage.setItem(mKey,'1');}catch(x){}
      if(window.caliMotion) caliMotion.celebrate('burst');
      if(typeof toast==='function') toast('Skill gemeistert: '+skill.name+'!');
      try{ if(typeof awardXP==='function') awardXP(200,'Skill gemeistert: '+skill.name); }catch(x){}
    }
  } else {
    var next=null;
    for(var n=0;n<skill.steps.length;n++){if(!skillProgress[skill.steps[n].id]){next=skill.steps[n];break;}}
    if(typeof toast==='function') toast('Schritt '+doneCount+' / '+skill.steps.length+(next?' — als Nächstes: '+next.name:''));
  }
}
function toggleSkillCard(skillId){
  skOpenState[skillId]=!skOpenState[skillId];
  // Kein Re-Render: Accordion-Klasse am bestehenden Element togglen (animiert via .acc-body)
  var w=document.querySelector('[data-skill-acc="'+skillId+'"]');
  var h=document.querySelector('[data-skill-head="'+skillId+'"]');
  if(w){
    w.classList.toggle('open',!!skOpenState[skillId]);
    if(h) h.setAttribute('aria-expanded',skOpenState[skillId]?'true':'false');
  } else {
    buildSkillUI();
  }
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

    var col=skillInk(skill.color);
    var card=document.createElement('div');
    card.className='card';
    // Gemeistert: Akzent-Outline statt Farbfläche
    card.style.cssText='padding:0;overflow:hidden;margin-bottom:10px;'+(allDone?'border-color:var(--accent);':'');

    // Header
    var header=document.createElement('div');
    header.className='pressable';
    header.style.cssText='padding:14px;cursor:pointer;';
    header.setAttribute('role','button');
    header.tabIndex=0;
    header.setAttribute('aria-expanded',skOpenState[skill.id]?'true':'false');
    header.dataset.skillHead=skill.id;
    header.onclick=(function(sid){return function(){toggleSkillCard(sid);};})(skill.id);
    header.onkeydown=function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();if(this.onclick)this.onclick(ev);}};

    var htop=document.createElement('div');
    htop.style.cssText='display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;';

    // Zweistelliger Index statt Emoji-Icon
    var ic=document.createElement('span');ic.className='row-index num';ic.style.cssText='padding-top:3px;';ic.textContent=skIdx(si+1);ic.setAttribute('aria-hidden','true');

    var tw=document.createElement('div');tw.style.cssText='flex:1;min-width:0;';
    var tn=document.createElement('div');tn.style.cssText='font-size:15px;font-weight:600;color:var(--text);line-height:1.3;';tn.textContent=skill.name;
    var td=document.createElement('div');td.className='row-sub';td.textContent=skill.desc;
    tw.appendChild(tn);tw.appendChild(td);

    var pe=document.createElement('div');
    if(allDone){
      // Gemeistert-Badge: Akzent-Outline + Häkchen (Line-Icon)
      pe.className='u';
      pe.style.cssText='display:inline-flex;align-items:center;gap:6px;border:1px solid var(--accent);color:var(--accent);border-radius:var(--r-sm);padding:3px 8px;font-size:9px;font-weight:600;white-space:nowrap;flex-shrink:0;line-height:1.4;';
      pe.innerHTML=((typeof ci==='function')?'<span style="width:12px;height:12px;display:inline-block;flex-shrink:0;">'+ci('check')+'</span>':'')+'Gemeistert';
    } else {
      pe.className='row-val';
      pe.style.cssText='color:var(--muted);white-space:nowrap;padding-top:2px;';
      pe.textContent=doneCount+' / '+skill.steps.length;
    }

    htop.appendChild(ic);htop.appendChild(tw);htop.appendChild(pe);

    // Segmentierter Balken (§5.4a): Track = .segbar, Füllung als Kind, damit
    // caliMotion.animateBar weiterhin die Breite animiert.
    var pw=document.createElement('div');pw.className='segbar';pw.setAttribute('aria-hidden','true');
    var pf=document.createElement('div');pf.style.cssText='position:absolute;inset:0;width:0%;max-width:100%;background:repeating-linear-gradient(90deg,'+col+' 0 4px,transparent 4px 6px);transition:width var(--dur-slow) var(--ease-out);';
    pw.appendChild(pf);
    if(window.caliMotion){ caliMotion.animateBar(pf,pct); } else { pf.style.width=pct+'%'; }

    header.appendChild(htop);header.appendChild(pw);
    card.appendChild(header);

    // Steps (collapsible — .acc-body Accordion-Physik statt display:none-Snap)
    var accWrap=document.createElement('div');
    accWrap.className='acc-body'+(skOpenState[skill.id]?' open':'');
    accWrap.dataset.skillAcc=skill.id;
    var accClip=document.createElement('div');
    var sw=document.createElement('div');
    sw.style.cssText='border-top:1px solid var(--line);';

    for(var k=0;k<skill.steps.length;k++){
      var step=skill.steps[k];
      var done=!!skillProgress[step.id];
      var isNext=!done&&(k===0||!!skillProgress[skill.steps[k-1].id]);

      var sr=document.createElement('div');
      sr.className='list-row pressable';
      sr.style.cssText='align-items:flex-start;padding:12px 14px;'+(isNext?'background:var(--card2);':'');
      sr.setAttribute('role','button');
      sr.tabIndex=0;
      sr.setAttribute('aria-pressed',done?'true':'false');
      sr.onclick=(function(sid){return function(){toggleSkillStep(sid);};})(step.id);
      sr.onkeydown=function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();if(this.onclick)this.onclick(ev);}};

      // Schritt-Ring: 28px, 1px Linie; erledigt = Skill-Farbe + Häkchen, nächster = Skill-Farbe + Index
      var circle=document.createElement('div');
      circle.className='num';
      circle.style.cssText='width:28px;height:28px;border-radius:50%;flex-shrink:0;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-weight:500;font-size:11px;border:1px solid var(--line2);color:var(--muted2);';
      if(done){
        circle.style.borderColor=col;circle.style.color=col;
        circle.innerHTML=(typeof ci==='function')?'<span style="width:14px;height:14px;display:block;">'+ci('check')+'</span>':'&#10003;';
      }
      else if(isNext){circle.style.borderColor=col;circle.style.color=col;}
      if(!done)circle.textContent=skIdx(k+1);

      var si2=document.createElement('div');si2.className='row-main';
      var sn=document.createElement('div');
      sn.style.cssText='font-size:13px;font-weight:500;color:'+(done?'var(--muted)':'var(--text)')+';line-height:1.35;'+(done?'text-decoration:line-through;':'');
      sn.textContent=step.name;
      var sd2=document.createElement('div');sd2.className='row-sub';sd2.textContent=step.desc;
      si2.appendChild(sn);si2.appendChild(sd2);

      if(isNext){
        var nb=document.createElement('span');
        nb.className='u';
        nb.style.cssText='display:inline-block;margin-top:6px;border:1px solid '+col+';color:'+col+';border-radius:var(--r-sm);padding:1px 6px;font-size:9px;font-weight:600;line-height:1.5;';
        nb.textContent='Nächster Schritt';
        si2.appendChild(nb);
      }

      sr.appendChild(circle);sr.appendChild(si2);
      sw.appendChild(sr);
    }
    accClip.appendChild(sw);
    accWrap.appendChild(accClip);
    card.appendChild(accWrap);
    el.appendChild(card);
  }
  if(window.caliMotion) caliMotion.stagger(el);
}

loadSkillProgress();
