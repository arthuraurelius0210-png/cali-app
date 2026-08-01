// ── CALI ANIMATIONS (GSAP) ────────────────────────────────
// Zentrale Animations-Helfer. Respektieren prefers-reduced-motion
// und funktionieren auch ohne GSAP (dann passiert einfach nichts).

function caliAnimOK(){
  if(typeof gsap === 'undefined') return false;
  try{
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  }catch(x){}
  return true;
}

// Zahlen hochzählen: alle .cali-count[data-target] innerhalb von rootEl
function caliAnimateCounts(rootEl){
  if(!rootEl) return;
  var els = rootEl.querySelectorAll('.cali-count');
  for(var i=0;i<els.length;i++){
    (function(el){
      var target = parseFloat(el.getAttribute('data-target')) || 0;
      if(!caliAnimOK()){ el.textContent = String(target); return; }
      var obj = {v: 0};
      el.textContent = '0';
      gsap.to(obj, {
        v: target,
        duration: Math.min(1.2, 0.4 + target*0.02),
        ease: 'power2.out',
        onUpdate: function(){ el.textContent = String(Math.round(obj.v)); }
      });
    })(els[i]);
  }
}

// Fortschrittsbalken füllen: alle .cali-bar[data-pct] innerhalb von rootEl
function caliAnimateBars(rootEl){
  if(!rootEl) return;
  var els = rootEl.querySelectorAll('.cali-bar');
  for(var i=0;i<els.length;i++){
    (function(el){
      var pct = parseFloat(el.getAttribute('data-pct')) || 0;
      if(!caliAnimOK()){ el.style.width = pct+'%'; return; }
      gsap.fromTo(el, {width: '0%'}, {width: pct+'%', duration: 1.0, ease: 'power3.out', delay: 0.15});
    })(els[i]);
  }
}

// Karten einer Seite gestaffelt einfliegen lassen
function caliStaggerPage(pageEl){
  if(!caliAnimOK() || !pageEl) return;
  var kids = [];
  for(var i=0;i<pageEl.children.length && i<10;i++){ kids.push(pageEl.children[i]); }
  if(!kids.length) return;
  gsap.fromTo(kids,
    {autoAlpha: 0, y: 18},
    {autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out', stagger: 0.055, clearProps: 'all', overwrite: 'auto'}
  );
}

// Kalenderzellen nacheinander aufploppen lassen
function caliPopIn(els){
  if(!caliAnimOK() || !els || !els.length) return;
  gsap.fromTo(els,
    {autoAlpha: 0, scale: 0.5},
    {autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)', stagger: {each: 0.012, from: 'start'}, clearProps: 'all', overwrite: 'auto'}
  );
}

// Konfetti-Feier (Workout abgeschlossen, Ziel erreicht)
function caliConfetti(){
  if(!caliAnimOK()) return;
  var wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:3000;overflow:hidden;';
  document.body.appendChild(wrap);
  var colors = ['#ff5500', '#FFD700', '#4ECDC4', '#A78BFA', '#F59E0B', '#38BDF8'];
  var W = window.innerWidth, H = window.innerHeight;
  var pieces = [];
  for(var i=0;i<44;i++){
    var p = document.createElement('div');
    var size = 6 + Math.random()*8;
    var round = Math.random() > 0.5;
    p.style.cssText = 'position:absolute;width:'+size+'px;height:'+(round?size:size*0.5)+'px;background:'+colors[i%colors.length]+';border-radius:'+(round?'50%':'2px')+';top:'+(H*0.28)+'px;left:'+(W/2)+'px;';
    wrap.appendChild(p);
    pieces.push(p);
  }
  for(var j=0;j<pieces.length;j++){
    (function(p){
      var vx = (Math.random()-0.5) * W * 0.9;
      var vyUp = -(80 + Math.random()*220);
      var fall = H * (0.6 + Math.random()*0.5);
      var rot = (Math.random()-0.5) * 720;
      var dur = 1.3 + Math.random()*0.8;
      var tlp = gsap.timeline();
      tlp.to(p, {x: vx*0.4, y: vyUp, rotation: rot*0.4, duration: dur*0.3, ease: 'power2.out'});
      tlp.to(p, {x: vx, y: fall, rotation: rot, duration: dur*0.7, ease: 'power1.in'});
      tlp.to(p, {autoAlpha: 0, duration: 0.3}, '-=0.3');
    })(pieces[j]);
  }
  setTimeout(function(){ if(wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 2600);
}

// Dezentes Dauer-Pulsieren (z.B. Streak-Flamme)
function caliPulse(el, scaleTo){
  if(!caliAnimOK() || !el) return;
  gsap.to(el, {scale: scaleTo || 1.18, duration: 0.85, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '50% 80%'});
}

// Kurzer "Pop" auf einem Element (z.B. nach Klick / Wertänderung)
function caliPop(el){
  if(!caliAnimOK() || !el) return;
  gsap.fromTo(el, {scale: 0.92}, {scale: 1, duration: 0.35, ease: 'back.out(2.5)', clearProps: 'scale'});
}
