// ── CALI MOTION HELPERS ──────────────────────────────────────
// Kleine ES5-Helferbibliothek für das Premium-Motion-System.
// Nur transform/opacity (Ausnahme: width auf kleinen Progress-Bars).
// Alle Funktionen sind null-sicher und respektieren prefers-reduced-motion.
// CSS-Gegenstücke (Klassen/Keyframes) liegen in tracker.html:
//   .anim-in, .sheet-anim/.sheet-in, .backdrop-anim/.backdrop-in,
//   .overlay-anim/.overlay-in, .float-up, .cali-burst/.burst-p, .acc-body
window.caliMotion = (function(){

  function reduced(){
    try{
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }catch(e){ return false; }
  }

  function raf2(fn){
    // Double-rAF: garantiert, dass der Startzustand gerendert wurde,
    // bevor der Zielzustand gesetzt wird (sonst keine Transition).
    // Timeout-Absicherung: in Hintergrund-Tabs (Handy gesperrt, App gewechselt)
    // feuert rAF nicht. Ohne Fallback bliebe ein Overlay im Startzustand
    // (opacity:0) hängen und würde trotzdem Taps abfangen. Der Fallback setzt
    // den Zielzustand dann ohne Animation — sichtbar schlägt animiert.
    var done = false;
    function run(){ if(done) return; done = true; fn(); }
    requestAnimationFrame(function(){ requestAnimationFrame(run); });
    setTimeout(run, 150);
  }

  function easeOutCubic(t){ var u=1-t; return 1-u*u*u; }

  // countUp(el, 128, {duration:600, decimals:0, suffix:' XP', prefix:''})
  // Zählt el.textContent von 0 (oder opts.from) bis to hoch.
  function countUp(el, to, opts){
    if(!el) return;
    opts = opts || {};
    var target = Number(to);
    if(isNaN(target)) target = 0;
    var decimals = opts.decimals || 0;
    var suffix = opts.suffix || '';
    var prefix = opts.prefix || '';
    var from = Number(opts.from) || 0;
    var duration = opts.duration || 600;
    function fmt(v){ return prefix + v.toFixed(decimals) + suffix; }
    // Im Hintergrund-Tab läuft rAF nicht — der Wert stünde bis zur Rückkehr
    // auf dem Startzustand. Dann lieber direkt den Endwert schreiben.
    if(reduced() || duration <= 0 || document.hidden){ el.textContent = fmt(target); return; }
    var start = null;
    function tick(ts){
      if(!el.isConnected){ return; } // Element wurde entfernt — sauber abbrechen
      if(start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var v = from + (target - from) * easeOutCubic(p);
      el.textContent = fmt(v);
      if(p < 1){ requestAnimationFrame(tick); }
      else { el.textContent = fmt(target); }
    }
    requestAnimationFrame(tick);
  }

  // stagger(container, max) — versieht die Kinder mit .anim-in + --i (Stagger-Delay).
  // Delay ist bei 8 Schritten gedeckelt, die Anzahl animierter Kinder bei max
  // (Standard 12, also gut anderthalb Viewports) — alles darunter erscheint sofort,
  // sonst würde eine 100-Zeilen-Liste als ein Block gleichzeitig aufploppen.
  // Bei reduced motion passiert nichts.
  function stagger(container, max){
    if(!container || !container.children) return;
    if(reduced()) return;
    var kids = container.children, i, k;
    var n = Math.min(kids.length, max || 12);
    // 1. Durchgang: Klasse überall entfernen (auch jenseits von n — Reste
    //    aus einem früheren Aufruf mit längerer Liste).
    for(i=0; i<kids.length; i++){
      if(kids[i] && kids[i].classList) kids[i].classList.remove('anim-in');
    }
    // Ein einziges erzwungenes Reflow für alle Kinder: ohne das sieht der
    // Browser das remove/add im selben Tick nie und die Animation startet
    // beim Re-Render nicht erneut.
    void container.offsetWidth;
    // 2. Durchgang: Klasse + Stagger-Index setzen.
    for(i=0; i<n; i++){
      k = kids[i];
      if(!k || !k.style) continue;
      k.style.setProperty('--i', String(Math.min(i, 8)));
      k.classList.add('anim-in');
    }
  }

  // animateBar(el, 62) — füllt eine Progress-Bar per width-Transition
  // vom Startzustand 0% auf targetWidthPct (Zahl oder '62%').
  // Voraussetzung: el hat eine transition auf width (z.B. .prog-fill).
  function animateBar(el, targetWidthPct){
    if(!el || !el.style) return;
    var target = typeof targetWidthPct === 'number' ? targetWidthPct + '%' : String(targetWidthPct || '0%');
    if(reduced()){ el.style.width = target; return; }
    el.style.width = '0%';
    raf2(function(){ if(el.isConnected) el.style.width = target; });
  }

  // celebrate('burst') — kurzer Konfetti-Burst über dem ganzen Viewport
  // (Workout beendet, PR geknackt). Räumt sich selbst wieder auf.
  // Jeder Aufruf bekommt eine eigene Ebene: zwei Feiern kurz hintereinander
  // (z.B. Wochenziel + Workout beendet) überlagern sich, statt dass die
  // zweite die erste nach einem Frame abräumt. Maximal 3 Ebenen gleichzeitig.
  var burstSeq = 0;
  function celebrate(kind){
    if(reduced()) return;
    try{
      var live = document.querySelectorAll('.cali-burst');
      for(var d=0; d<=live.length-3; d++){
        if(live[d] && live[d].parentNode) live[d].parentNode.removeChild(live[d]);
      }
      var layer = document.createElement('div');
      layer.id = 'cali-burst-layer-' + (++burstSeq);
      layer.className = 'cali-burst';
      layer.setAttribute('aria-hidden','true');
      var colors = ['#ff5500','#4ECDC4','#F59E0B','#A78BFA','#22C55E'];
      var n = 18;
      for(var i=0; i<n; i++){
        var p = document.createElement('span');
        p.className = 'burst-p';
        var ang = (i / n) * Math.PI * 2 + Math.random() * 0.6;
        var dist = 90 + Math.random() * 130;
        p.style.background = colors[i % colors.length];
        p.style.setProperty('--tx', Math.round(Math.cos(ang) * dist) + 'px');
        p.style.setProperty('--ty', Math.round(Math.sin(ang) * dist - 60) + 'px');
        p.style.setProperty('--rot', Math.round(120 + Math.random() * 300) + 'deg');
        p.style.setProperty('--bd', Math.round(700 + Math.random() * 400) + 'ms');
        if(i % 3 === 0){ p.style.borderRadius = '50%'; }
        layer.appendChild(p);
      }
      document.body.appendChild(layer);
      setTimeout(function(){ if(layer.parentNode) layer.parentNode.removeChild(layer); }, 1300);
    }catch(e){}
  }

  // sheetIn(sheetEl, backdropEl) — Bottom-Sheet von unten einfahren,
  // Backdrop einblenden. Direkt nach appendChild aufrufen.
  function sheetIn(sheetEl, backdropEl){
    if(backdropEl && backdropEl.classList){ backdropEl.classList.add('backdrop-anim'); }
    if(sheetEl && sheetEl.classList){ sheetEl.classList.add('sheet-anim'); }
    if(reduced()){
      if(sheetEl && sheetEl.classList) sheetEl.classList.add('sheet-in');
      if(backdropEl && backdropEl.classList) backdropEl.classList.add('backdrop-in');
      return;
    }
    raf2(function(){
      if(sheetEl && sheetEl.classList && sheetEl.isConnected) sheetEl.classList.add('sheet-in');
      if(backdropEl && backdropEl.classList && backdropEl.isConnected) backdropEl.classList.add('backdrop-in');
    });
  }

  // overlayIn(el) — Fullscreen-Overlay sanft einblenden (fade + rise).
  function overlayIn(el){
    if(!el || !el.classList) return;
    el.classList.add('overlay-anim');
    if(reduced()){ el.classList.add('overlay-in'); return; }
    raf2(function(){ if(el.isConnected) el.classList.add('overlay-in'); });
  }

  // floatUp(el, '+50 XP') — schwebendes Label über einem Element.
  function floatUp(el, text){
    if(!el || reduced()) return;
    try{
      var r = el.getBoundingClientRect();
      var lbl = document.createElement('div');
      lbl.className = 'float-up';
      lbl.setAttribute('aria-hidden','true');
      lbl.textContent = String(text || '');
      lbl.style.left = Math.round(r.left + r.width / 2) + 'px';
      lbl.style.top = Math.round(r.top) + 'px';
      document.body.appendChild(lbl);
      setTimeout(function(){ if(lbl.parentNode) lbl.parentNode.removeChild(lbl); }, 1300);
    }catch(e){}
  }

  return {
    reduced: reduced,
    countUp: countUp,
    stagger: stagger,
    animateBar: animateBar,
    celebrate: celebrate,
    sheetIn: sheetIn,
    overlayIn: overlayIn,
    floatUp: floatUp
  };
})();
