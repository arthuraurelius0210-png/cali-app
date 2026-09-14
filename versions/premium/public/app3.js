// ── COMMUNITY PAGE (full screen) ──────────────────────────
function openCommunityPage(){
  var ex = document.getElementById('comm-page-ov'); if(ex) ex.remove();
  commFilterMode = 'newest';
  commSearchQuery = '';
  var ov = document.createElement('div');
  ov.id = 'comm-page-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  var topBar = document.createElement('div');
  topBar.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.className = 'pressable';
  backBtn.style.cssText = 'background:#fff;border:none;border-radius:16px;box-shadow:0 8px 20px rgba(0,0,0,0.05);font-family:inherit;font-size:13px;font-weight:700;padding:10px 16px;cursor:pointer;color:var(--text);flex-shrink:0;transition:transform var(--dur-fast) var(--ease-out);';
  backBtn.innerHTML = '← Zurück';
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); }
    else { ov.remove(); if(typeof buildChCards === 'function') buildChCards(); }
  };
  var titleWrap = document.createElement('div');
  titleWrap.style.cssText = 'flex:1;min-width:0;';
  var titleEl = document.createElement('div');
  titleEl.style.cssText = 'font-size:16px;font-weight:800;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
  titleEl.textContent = '🌟 Community Challenge';
  var subtitleEl = document.createElement('div');
  subtitleEl.style.cssText = 'font-size:11px;color:var(--muted);margin-top:1px;';
  subtitleEl.textContent = 'Trainiere. Teile. Wachse.';
  titleWrap.appendChild(titleEl); titleWrap.appendChild(subtitleEl);
  var postBtn = document.createElement('button');
  postBtn.className = 'pressable';
  postBtn.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:9px 12px;min-height:36px;cursor:pointer;flex-shrink:0;white-space:nowrap;transition:transform var(--dur-fast) var(--ease-out);';
  postBtn.textContent = '+ Posten';
  postBtn.onclick = function(){ showCommPostModal(); };
  topBar.appendChild(backBtn); topBar.appendChild(titleWrap); topBar.appendChild(postBtn);
  ov.appendChild(topBar);

  // Filter tabs
  var filterBar = document.createElement('div');
  filterBar.style.cssText = 'display:flex;gap:8px;padding:12px 16px 0;flex-shrink:0;overflow-x:auto;';
  var filterTabs = [
    {id:'newest', label:'Neueste'},
    {id:'popular', label:'Beliebt'},
    {id:'mine', label:'Meine Beiträge'}
  ];
  filterTabs.forEach(function(t){
    var tabBtn = document.createElement('button');
    tabBtn.dataset.filterId = t.id;
    tabBtn.textContent = t.label;
    tabBtn.onclick = function(){ commFilterMode = t.id; renderFilterTabs(filterBar); loadCommFeed(); };
    filterBar.appendChild(tabBtn);
  });
  ov.appendChild(filterBar);
  renderFilterTabs(filterBar);

  // Search
  var searchRow = document.createElement('div');
  searchRow.style.cssText = 'padding:10px 16px 4px;flex-shrink:0;';
  var searchInp = document.createElement('input');
  searchInp.type = 'text';
  searchInp.placeholder = 'Beiträge durchsuchen…';
  searchInp.style.cssText = 'width:100%;background:#fff;border:1px solid var(--border);border-radius:10px;padding:11px 14px;font-family:inherit;font-size:16px;color:var(--text);box-sizing:border-box;';
  searchInp.oninput = function(){ commSearchQuery = this.value; renderCommFeed(); };
  searchRow.appendChild(searchInp);
  ov.appendChild(searchRow);

  var scroll = document.createElement('div');
  scroll.className = 'sheet-scroll';
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:16px 20px;';
  var feedEl = document.createElement('div');
  feedEl.id = 'comm-feed';
  scroll.appendChild(feedEl);

  // Bottom CTA
  var ctaBanner = document.createElement('div');
  ctaBanner.style.cssText = 'background:rgba(255,85,0,0.06);border-radius:16px;padding:18px;margin-top:8px;display:flex;align-items:center;gap:14px;';
  ctaBanner.innerHTML =
    '<div style="width:44px;height:44px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">👥</div>'+
    '<div style="flex:1;"><div style="font-size:14px;font-weight:800;color:var(--text);margin-bottom:2px;">Teile deine Challenge</div><div style="font-size:11px;color:var(--muted);line-height:1.4;">Zeige der Community deine Fortschritte, stelle dich neuen Herausforderungen und motiviere andere!</div></div>';
  var ctaBtn = document.createElement('button');
  ctaBtn.className = 'pressable';
  ctaBtn.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:13px;font-weight:700;padding:10px 14px;min-height:36px;cursor:pointer;flex-shrink:0;white-space:nowrap;transition:transform var(--dur-fast) var(--ease-out);';
  ctaBtn.textContent = '+ Neuen Beitrag';
  ctaBtn.onclick = function(){ showCommPostModal(); };
  ctaBanner.appendChild(ctaBtn);
  scroll.appendChild(ctaBanner);

  ov.appendChild(scroll);
  document.body.appendChild(ov);
  // Hardware-Zurück schließt das Overlay statt der App
  if(typeof overlayPush === 'function'){
    overlayPush(ov, function(){ try{ if(typeof buildChCards === 'function') buildChCards(); }catch(e){} });
  }
  if(window.caliMotion) caliMotion.overlayIn(ov);

  loadCommFeed();
}

function renderFilterTabs(filterBar){
  Array.from(filterBar.children).forEach(function(btn){
    var active = btn.dataset.filterId === commFilterMode;
    btn.className = 'pressable';
    btn.style.cssText = 'flex-shrink:0;background:'+(active?'var(--accent-deep)':'var(--bg2)')+';color:'+(active?'#fff':'var(--muted)')+';border:1px solid '+(active?'var(--accent-deep)':'var(--border)')+';border-radius:20px;font-family:inherit;font-size:12px;font-weight:700;padding:9px 14px;min-height:36px;cursor:pointer;white-space:nowrap;';
  });
}

function buildStartChallengeWidget(){
  var el = document.getElementById('start-challenge-widget');
  if(!el) return;
  el.innerHTML = '';
  if(!activeChallenge) return;
  var prog = calcChallengeProgress();
  var target = activeChallenge.params.target||1;
  var pct = Math.min(100,Math.round((prog/target)*100));
  var done = pct>=100;

  var box = document.createElement('div');
  box.className = 'pressable';
  box.setAttribute('role','button');
  box.setAttribute('tabindex','0');
  box.setAttribute('aria-label','Aktive Challenge öffnen');
  box.style.cssText = 'background:'+(done?'rgba(255,85,0,0.08)':'var(--bg3)')+';border:1px solid '+(done?'rgba(255,85,0,0.3)':'var(--border)')+';border-radius:16px;padding:14px 16px;margin-bottom:12px;cursor:pointer;';
  box.onclick = function(){ goPage('ch'); };
  box.onkeydown = function(ev){
    if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); goPage('ch'); }
  };

  var row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px;';

  var icon = document.createElement('span');
  icon.style.cssText = 'font-size:20px;';
  icon.textContent = activeChallenge.icon;

  var txt = document.createElement('div');
  txt.style.cssText = 'flex:1;';
  var t1 = document.createElement('div');
  t1.style.cssText = 'font-family:inherit;font-size:14px;color:var(--text);';
  t1.textContent = activeChallenge.title;
  var t2 = document.createElement('div');
  t2.className = 'num';
  t2.style.cssText = 'font-family:inherit;font-weight:800;font-size:14px;color:var(--muted);margin-top:2px;';
  t2.textContent = prog+' / '+target+' ('+pct+'%)';
  txt.appendChild(t1);
  txt.appendChild(t2);

  // Fertige Challenge: gleicher Claim-Flow wie die Challenge-Karte in app2.js
  // (identischer claimKey, damit beide Einstiege denselben Zustand teilen)
  var claimKey = 'cali_ch_claimed_'+activeChallenge.id+'_'+(activeChallenge.startDate||'');
  var claimed = false;
  try{ claimed = !!localStorage.getItem(claimKey); }catch(e){}

  var arr;
  if(done && !claimed){
    arr = document.createElement('button');
    arr.className = 'pressable';
    arr.style.cssText = 'background:var(--accent-deep);color:#fff;border:none;border-radius:10px;font-family:inherit;font-size:11px;font-weight:700;padding:7px 10px;cursor:pointer;flex-shrink:0;white-space:nowrap;transition:transform var(--dur-fast) var(--ease-out);';
    arr.textContent = 'Belohnung abholen';
    arr.onclick = function(ev){
      ev.stopPropagation();
      var already = false;
      try{ already = !!localStorage.getItem(claimKey); }catch(e){}
      if(!already){
        try{ localStorage.setItem(claimKey,'1'); }catch(e){}
        if(typeof awardXP === 'function'){ try{ awardXP(100, 'Challenge: '+activeChallenge.title); }catch(e){} }
      }
      var ch = activeChallenge;
      activeChallenge = null;
      if(typeof saveChallenges === 'function') saveChallenges();
      if(typeof showCelebrationOverlay === 'function'){
        showCelebrationOverlay({
          icon: ch.icon,
          title: 'Challenge geschafft!',
          big: ch.title,
          sub: ch.desc,
          note: already ? '' : '+100 XP'
        });
      }
      if(typeof buildChallengeUI === 'function') buildChallengeUI();
      else buildStartChallengeWidget();
    };
  } else {
    arr = document.createElement('div');
    arr.style.cssText = 'color:var(--muted);font-size:14px;';
    arr.textContent = done ? '✓' : '›';
  }

  row.appendChild(icon);
  row.appendChild(txt);
  row.appendChild(arr);

  var bar = document.createElement('div');
  bar.style.cssText = 'background:var(--bg3);border-radius:20px;height:4px;overflow:hidden;';
  var fill = document.createElement('div');
  fill.style.cssText = 'height:100%;border-radius:20px;background:'+(done?'var(--accent)':'rgba(255,85,0,0.35)')+';width:0;transition:width var(--dur-slow) var(--ease-out);';
  bar.appendChild(fill);

  box.appendChild(row);
  box.appendChild(bar);
  el.appendChild(box);

  // Fortschrittsbalken einlaufen lassen (reduced-motion: springt ans Ende)
  if(window.caliMotion){ caliMotion.animateBar(fill, pct); }
  else { fill.style.width = pct+'%'; }
}


// ---- PRESET CHALLENGES ----
// WICHTIG: metric-Namen MÜSSEN von calcChallengeProgress (app2.js) verstanden
// werden — dort existieren u.a. 'volume_exercise' (Summe seit Wochenstart),
// 'best_set' (bester Einzelsatz seit Wochenstart) und 'streak_days'.
// Die früheren Namen (session_total/session_best/session_single/week_total)
// wurden nirgends berechnet → Fortschritt war dauerhaft 0.
// exName bleibt bewusst OHNE Umlaute — er muss die EX_DB-Namen matchen.
var PRESET_CHALLENGES = [
  {
    id:'p1', icon:'💯', title:'100 Klimmzüge Challenge', image:'/challenge-pullup.jpg',
    desc:'Schaffe 100 Klimmzüge in einer einzigen Einheit. Pause erlaubt, aber kein Verlassen der Stange für mehr als 3 Minuten.',
    explanation:'Verteile die 100 Wdh. auf so viele Sätze wie du brauchst. Ziel: maximale Gesamtmenge. Starte mit deinen stärksten Sätzen.',
    target:100, metric:'volume_exercise', exName:'Klimmzuge'
  },
  {
    id:'p2', icon:'⏱', title:'1-Minuten Muscle-Up',
    desc:'Schaffe so viele Muscle-Ups wie möglich in 60 Sekunden.',
    explanation:'Starte den Timer, gib alles. Technik ist zweitrangig - Tempo ist alles. Weltrekord liegt bei ~26.',
    target:5, metric:'best_set', exName:'Muscle-Ups'
  },
  {
    id:'p3', icon:'🔺', title:'Klimmzug Pyramide bis 10',
    desc:'1-2-3-4-5-6-7-8-9-10-9-8-7-6-5-4-3-2-1 Klimmzüge. Keine Pause über 90 Sekunden.',
    explanation:'Insgesamt 100 Wdh. in Pyramidenform. Eine der besten Methoden für Volumen und Ausdauer gleichzeitig.',
    target:100, metric:'volume_exercise', exName:'Klimmzuge'
  },
  {
    id:'p4', icon:'🏋️', title:'Weighted Dips 5x5', image:'/challenge-dip.jpg',
    desc:'5 Sätze je 5 Dips mit Gewichtsgürtel. Steigere das Gewicht jeden Satz.',
    explanation:'Klassisches Kraftprotokoll. Fange leicht an (z.B. 5 kg) und steigere um 2-5 kg pro Satz. Volle ROM!',
    target:25, metric:'volume_exercise', exName:'Dips'
  },
  {
    id:'p5', icon:'🕐', title:'Plank 5 Minuten',
    desc:'Halte die Plank-Position für 5 Minuten am Stück.',
    explanation:'Erlaubt: kurze Positionskorrektur. Nicht erlaubt: Knie auf den Boden. Mentale Stärke ist hier 80% der Übung.',
    target:300, metric:'best_set', exName:'Plank'
  },
  {
    id:'p6', icon:'💥', title:'Explosive Push Week',
    desc:'Mache diese Woche 200 Liegestütze gesamt - verteilt auf beliebig viele Workouts.',
    explanation:'Liegestütze in jedem Workout zählen. Geht schneller als du denkst, wenn du sie in jede Einheit packst.',
    target:200, metric:'volume_exercise', exName:'Liegestutze'
  },
  {
    id:'p7', icon:'🌙', title:'Tuck Front Lever 30 Sek',
    desc:'Halte den Tuck Front Lever für 30 Sekunden ohne Unterbrechung.',
    explanation:'Baue auf mit 3x10s, dann 2x15s, dann 1x20s. Wenn du 30s schaffst, bist du bereit für den Advanced Tuck.',
    target:30, metric:'best_set', exName:'Tuck Front Lever Hold'
  },
  {
    id:'p8', icon:'🔥', title:'7-Tage Streak',
    desc:'Trainiere 7 Tage in Folge - jede Einheit zählt, auch kurze.',
    explanation:'Auch 15 Minuten zählen! Der Punkt ist die Gewohnheit. Nutze leichte Tage für Mobilität oder Skills.',
    target:7, metric:'streak_days', exName:''
  },
];

var showPresets = false;

function buildChallengePresets(){
  var el = document.getElementById('challenge-presets');
  if(!el) return;
  el.innerHTML = '';

  var title = document.createElement('div');
  title.className = 'stitle';
  title.style.cssText = 'color:var(--accent-ink);margin:0 0 10px;';
  title.textContent = 'Vorgefertigte Challenges';
  el.appendChild(title);

  for(var i=0;i<PRESET_CHALLENGES.length;i++){
    (function(ch){
      var card = document.createElement('div');
      card.style.cssText = 'background:#fff;border:none;border-radius:20px;box-shadow:0 8px 20px rgba(0,0,0,0.05);padding:14px 16px;margin-bottom:8px;';

      var top = document.createElement('div');
      top.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:6px;';

      var icon = document.createElement('span');
      icon.style.cssText = 'font-size:22px;';
      icon.textContent = ch.icon;

      var info = document.createElement('div');
      info.style.cssText = 'flex:1;';

      var t = document.createElement('div');
      t.style.cssText = 'font-family:inherit;font-size:15px;color:var(--text);';
      t.textContent = ch.title;

      var d = document.createElement('div');
      d.style.cssText = 'font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4;';
      d.textContent = ch.desc;

      info.appendChild(t);
      info.appendChild(d);
      top.appendChild(icon);
      top.appendChild(info);

      var exp = document.createElement('div');
      exp.style.cssText = 'font-size:11px;color:var(--muted);border-top:1px solid var(--border);padding-top:8px;margin-top:8px;line-height:1.5;font-style:italic;';
      exp.textContent = ch.explanation;

      var btn = document.createElement('button');
      btn.style.cssText = 'background:rgba(255,85,0,0.08);color:var(--accent-ink);border:1px solid rgba(255,85,0,0.3);border-radius:16px;font-family:inherit;font-size:12px;padding:9px;cursor:pointer;width:100%;margin-top:10px;';
      btn.textContent = 'Challenge annehmen';
      btn.onclick = function(){
        activeChallenge = {
          id: ch.id, title: ch.title, desc: ch.desc,
          icon: ch.icon, type: 'preset', params: {target:ch.target, metric:ch.metric, exName:ch.exName},
          startDate: new Date().toISOString().slice(0,10), progress:0
        };
        saveChallenges();
        buildChallengeUI();
        showPresets = false;
        toast(ch.title + ' angenommen!');
      };

      card.appendChild(top);
      card.appendChild(exp);
      card.appendChild(btn);
      el.appendChild(card);
    })(PRESET_CHALLENGES[i]);
  }
}
