// ── COMMUNITY PAGE (full screen) ──────────────────────────
function openCommunityPage(){
  var ex = document.getElementById('comm-page-ov'); if(ex) ex.remove();
  commFilterMode = 'newest';
  commSearchQuery = '';
  var ov = document.createElement('div');
  ov.id = 'comm-page-ov';
  ov.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:1000;display:flex;flex-direction:column;overflow:hidden;';

  // Top-Bar (§5.9): Zurück-Ring · Titel uppercase · die EINE orange Aktion des Screens
  var topBar = document.createElement('div');
  topBar.className = 'topbar';
  topBar.style.cssText = 'margin:0 16px;flex-shrink:0;';
  var backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'icon-btn sm';
  backBtn.setAttribute('aria-label', 'Zurück');
  backBtn.innerHTML = '&#8592;';
  backBtn.onclick = function(){
    if(typeof overlayClose === 'function'){ overlayClose(ov); }
    else { ov.remove(); if(typeof buildChCards === 'function') buildChCards(); }
  };
  var titleEl = document.createElement('div');
  titleEl.className = 'topbar-title';
  titleEl.textContent = 'Community Challenge';
  var postBtn = document.createElement('button');
  postBtn.type = 'button';
  postBtn.className = 'btn sm';
  postBtn.textContent = '+ Posten';
  postBtn.onclick = function(){ showCommPostModal(); };
  topBar.appendChild(backBtn); topBar.appendChild(titleEl); topBar.appendChild(postBtn);
  ov.appendChild(topBar);
  var subtitleEl = document.createElement('div');
  subtitleEl.className = 'lbl';
  subtitleEl.style.cssText = 'padding:0 16px;flex-shrink:0;';
  subtitleEl.textContent = 'Trainiere. Teile. Wachse.';
  ov.appendChild(subtitleEl);

  // Filter als Segment-Control (§5.5), aktiver Zustand per Klasse .on
  var filterBar = document.createElement('div');
  filterBar.className = 'seg-ctl';
  filterBar.setAttribute('role', 'tablist');
  filterBar.style.cssText = 'margin:12px 16px 0;flex-shrink:0;';
  var filterTabs = [
    {id:'newest', label:'Neueste'},
    {id:'popular', label:'Beliebt'},
    {id:'mine', label:'Meine Beiträge'}
  ];
  filterTabs.forEach(function(t){
    var tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.setAttribute('role', 'tab');
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
  searchInp.className = 'inp';
  searchInp.placeholder = 'Beiträge durchsuchen…';
  searchInp.setAttribute('aria-label', 'Beiträge durchsuchen');
  searchInp.oninput = function(){ commSearchQuery = this.value; renderCommFeed(); };
  searchRow.appendChild(searchInp);
  ov.appendChild(searchRow);

  var scroll = document.createElement('div');
  scroll.className = 'sheet-scroll';
  scroll.style.cssText = 'flex:1;overflow-y:auto;padding:16px;';
  var feedEl = document.createElement('div');
  feedEl.id = 'comm-feed';
  scroll.appendChild(feedEl);

  // Bottom CTA — Karte mit Line-Icon-Ring, Ghost-Button (Orange sitzt schon in der Top-Bar)
  var ctaBanner = document.createElement('div');
  ctaBanner.className = 'card';
  ctaBanner.style.cssText = 'margin-top:8px;display:flex;align-items:center;gap:12px;';
  ctaBanner.innerHTML =
    iconWrap('people',{size:18,box:44})+
    '<div style="flex:1;min-width:0;"><div class="row-title">Teile deine Challenge</div><div class="row-sub">Zeige der Community deine Fortschritte, stelle dich neuen Herausforderungen und motiviere andere!</div></div>';
  var ctaBtn = document.createElement('button');
  ctaBtn.type = 'button';
  ctaBtn.className = 'btn-g';
  ctaBtn.style.cssText = 'flex-shrink:0;white-space:nowrap;';
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

// Aktives Segment nur per Klasse/aria — das Aussehen kommt aus .seg-ctl (tracker.html)
function renderFilterTabs(filterBar){
  Array.from(filterBar.children).forEach(function(btn){
    var active = btn.dataset.filterId === commFilterMode;
    btn.className = active ? 'on' : '';
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
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
  box.className = 'pk-card pressable';
  box.setAttribute('role','button');
  box.setAttribute('tabindex','0');
  box.setAttribute('aria-label','Aktive Challenge öffnen');
  // Karte (§5.1): fertige Challenge hebt sich nur über die Rahmenfarbe ab
  box.style.cssText = 'padding:14px;margin-bottom:12px;cursor:pointer;'+(done?'border-color:var(--accent);':'');
  box.onclick = function(){ goPage('ch'); };
  box.onkeydown = function(ev){
    if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); goPage('ch'); }
  };

  var row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:12px;';

  // Line-Icon-Ring statt Emoji im Icon-Slot (das Emoji bleibt als Daten-Feld erhalten)
  var icon = document.createElement('div');
  icon.style.cssText = 'flex-shrink:0;display:flex;';
  icon.innerHTML = iconWrap('target',{size:18,box:44,color:done?'var(--accent)':'var(--muted)'});

  var txt = document.createElement('div');
  txt.style.cssText = 'flex:1;min-width:0;';
  var t0 = document.createElement('span');
  t0.className = 'eyebrow';
  t0.style.cssText = 'margin-bottom:2px;';
  t0.textContent = 'Aktive Challenge';
  var t1 = document.createElement('div');
  t1.className = 'row-title';
  t1.textContent = activeChallenge.title;
  var t2 = document.createElement('div');
  t2.className = 'row-sub num';
  t2.textContent = prog+' / '+target+(typeof chUnitLabel==='function'?chUnitLabel():'')+' · '+pct+' %';
  txt.appendChild(t0);
  txt.appendChild(t1);
  txt.appendChild(t2);

  // Fertige Challenge: gleicher Claim-Flow wie die Challenge-Karte in app2.js
  // (identischer claimKey, damit beide Einstiege denselben Zustand teilen)
  var claimKey = 'cali_ch_claimed_'+activeChallenge.id+'_'+(activeChallenge.startDate||'');
  var claimed = false;
  try{ claimed = !!localStorage.getItem(claimKey); }catch(e){}

  var arr;
  if(done && !claimed){
    // helle Sekundär-Pille — die orange Primäraktion der Startseite sitzt im Hero
    arr = document.createElement('button');
    arr.type = 'button';
    arr.className = 'btn sec sm';
    arr.style.cssText = 'flex-shrink:0;white-space:nowrap;';
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
          iconName: 'trophy',
          title: 'Challenge geschafft!',
          big: ch.title,
          sub: ch.desc,
          note: already ? '' : '+100 XP'
        });
      }
      if(typeof buildChallengeUI === 'function') buildChallengeUI();
      else buildStartChallengeWidget();
    };
  } else if(done){
    arr = document.createElement('div');
    arr.style.cssText = 'width:18px;height:18px;color:var(--accent);flex-shrink:0;';
    arr.setAttribute('aria-hidden','true');
    arr.innerHTML = ci('check');
  } else {
    arr = document.createElement('span');
    arr.className = 'row-chev';
    arr.setAttribute('aria-hidden','true');
  }

  row.appendChild(icon);
  row.appendChild(txt);
  row.appendChild(arr);

  // 3px-Linie (§5.4c) — animateBar setzt die Breite
  var bar = document.createElement('div');
  bar.className = 'linebar';
  var fill = document.createElement('div');
  fill.style.cssText = 'height:100%;background:var(--accent);width:0;transition:width var(--dur-slow) var(--ease-out);';
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
    id:'p1', level:3, cats:['Pull'], kind:'session', minutes:25, icon:'💯', title:'100 Klimmzüge Challenge', image:'/challenge-p1.jpg',
    desc:'Schaffe 100 Klimmzüge in einer einzigen Einheit. Pause erlaubt, aber kein Verlassen der Stange für mehr als 3 Minuten.',
    explanation:'Verteile die 100 Wdh. auf so viele Sätze wie du brauchst. Ziel: maximale Gesamtmenge. Starte mit deinen stärksten Sätzen.',
    // "in einer einzigen Einheit" → Session-Metrik statt Wochensumme
    target:100, metric:'volume_session_ex', exName:'Klimmzuge', unit:'Wdh'
  },
  {
    id:'p2', level:4, cats:['Pull','Push'], kind:'session', minutes:5, icon:'⏱', title:'1-Minuten Muscle-Up', image:'/challenge-p2.jpg',
    desc:'Schaffe so viele Muscle-Ups wie möglich in 60 Sekunden.',
    explanation:'Starte den Timer, gib alles. Technik ist zweitrangig - Tempo ist alles. Weltrekord liegt bei ~26.',
    target:5, metric:'best_set', exName:'Muscle-Ups'
  },
  {
    id:'p3', level:3, cats:['Pull'], kind:'session', minutes:20, icon:'🔺', title:'Klimmzug Pyramide bis 10', image:'/challenge-p3.jpg',
    desc:'1-2-3-4-5-6-7-8-9-10-9-8-7-6-5-4-3-2-1 Klimmzüge. Keine Pause über 90 Sekunden.',
    explanation:'Insgesamt 100 Wdh. in Pyramidenform. Eine der besten Methoden für Volumen und Ausdauer gleichzeitig.',
    target:100, metric:'volume_exercise', exName:'Klimmzuge'
  },
  {
    id:'p4', level:3, cats:['Push'], kind:'session', minutes:15, icon:'🏋️', title:'Weighted Dips 5x5', image:'/challenge-p4.jpg',
    desc:'5 Sätze je 5 Dips mit Gewichtsgürtel. Steigere das Gewicht jeden Satz.',
    explanation:'Klassisches Kraftprotokoll. Fange leicht an (z.B. 5 kg) und steigere um 2-5 kg pro Satz. Volle ROM!',
    target:25, metric:'volume_exercise', exName:'Dips'
  },
  {
    id:'p5', level:3, cats:['Core'], kind:'session', minutes:6, icon:'🕐', title:'Plank 5 Minuten', image:'/challenge-p5.jpg',
    desc:'Halte die Plank-Position für 5 Minuten am Stück.',
    explanation:'Erlaubt: kurze Positionskorrektur. Nicht erlaubt: Knie auf den Boden. Mentale Stärke ist hier 80% der Übung.',
    target:300, metric:'best_set', exName:'Plank'
  },
  {
    id:'p6', level:1, cats:['Push'], kind:'week', minutes:10, icon:'💥', title:'Explosive Push Week', image:'/challenge-p6.jpg',
    desc:'Mache diese Woche 200 Liegestütze gesamt - verteilt auf beliebig viele Workouts.',
    explanation:'Liegestütze in jedem Workout zählen. Geht schneller als du denkst, wenn du sie in jede Einheit packst.',
    target:200, metric:'volume_exercise', exName:'Liegestutze'
  },
  {
    id:'p7', level:3, cats:['Pull'], kind:'session', minutes:5, icon:'🌙', title:'Tuck Front Lever 30 Sek', image:'/challenge-p7.jpg',
    desc:'Halte den Tuck Front Lever für 30 Sekunden ohne Unterbrechung.',
    explanation:'Baue auf mit 3x10s, dann 2x15s, dann 1x20s. Wenn du 30s schaffst, bist du bereit für den Advanced Tuck.',
    target:30, metric:'best_set', exName:'Tuck Front Lever Hold'
  },
  {
    id:'p8', level:1, cats:[], kind:'streak', minutes:20, icon:'🔥', title:'7-Tage Streak', image:'/challenge-p8.jpg',
    desc:'Trainiere 7 Tage in Folge - jede Einheit zählt, auch kurze.',
    explanation:'Auch 15 Minuten zählen! Der Punkt ist die Gewohnheit. Nutze leichte Tage für Mobilität oder Skills.',
    target:7, metric:'streak_days', exName:''
  },
  // ── Session-, Runden- und Tages-Challenges (Metriken in calcChallengeProgress, app2.js) ──
  // icon ist nur ein Daten-Schlüssel (wird nicht gerendert). unit erscheint hinter der Fortschrittszahl.
  {
    id:'p9', level:2, cats:['Pull','Push','Legs'], kind:'session', minutes:20, icon:'rounds', title:'Zwanzig-Minuten-Zirkel', image:'/challenge-p9.jpg',
    desc:'So viele Runden wie möglich in 20 Minuten: 5 Klimmzüge, 10 Liegestütze, 15 Kniebeugen.',
    explanation:'Timer auf 20 Minuten, dann nur noch Runden zählen. Einsteiger schaffen 8 bis 12 Runden, Fortgeschrittene über 20. Skalieren ist erlaubt: Band-Klimmzüge oder Australian Rows, Liegestütze auf den Knien.',
    target:15, metric:'rounds_in_session', exName:'', unit:'Runden', maxDur:1500,
    parts:[{ex:'Klimmzuge',n:5},{ex:'Liegestutze',n:10},{ex:'Kniebeugen',n:15}]
  },
  {
    id:'p10', level:4, cats:['Pull','Push','Legs'], kind:'session', minutes:60, icon:'volume', title:'Sechshundert', image:'/challenge-p10.jpg',
    desc:'100 Klimmzüge, 200 Liegestütze, 300 Kniebeugen in einer Einheit. Reihenfolge frei, aufteilen erlaubt.',
    explanation:'Der Klassiker unter den Volumen-Tests, im Original noch mit zwei Läufen drumherum. Beliebte Aufteilung: 20 Runden à 5, 10, 15. Rechne mit 45 bis 70 Minuten.',
    target:600, metric:'multi_volume_session', exName:'', unit:'Wdh',
    parts:[{ex:'Klimmzuge',n:100},{ex:'Liegestutze',n:200},{ex:'Kniebeugen',n:300}]
  },
  {
    id:'p11', level:3, cats:['Pull','Push','Core','Legs'], kind:'session', minutes:40, icon:'volume', title:'Vierhundert', image:'/challenge-p11.jpg',
    desc:'100 Klimmzüge, 100 Liegestütze, 100 Sit-ups, 100 Kniebeugen in einer Einheit, Übung für Übung.',
    explanation:'Jede Übung wird komplett abgeschlossen, bevor die nächste beginnt. Die Klimmzüge sind der Flaschenhals, plane sie zuerst.',
    target:400, metric:'multi_volume_session', exName:'', unit:'Wdh',
    parts:[{ex:'Klimmzuge',n:100},{ex:'Liegestutze',n:100},{ex:'Sit-ups',n:100},{ex:'Kniebeugen',n:100}]
  },
  {
    id:'p12', level:4, cats:['Pull','Push','Core','Legs'], kind:'session', minutes:45, icon:'volume', title:'Fünf Runden', image:'/challenge-p12.jpg',
    desc:'5 Runden: 20 Klimmzüge, 30 Liegestütze, 40 Sit-ups, 50 Kniebeugen. Zwischen den Runden genau 3 Minuten Pause.',
    explanation:'Insgesamt 700 Wiederholungen. Die Pause ist Pflicht, nicht Option: sie hält die Qualität der späteren Runden.',
    target:700, metric:'multi_volume_session', exName:'', unit:'Wdh',
    parts:[{ex:'Klimmzuge',n:100},{ex:'Liegestutze',n:150},{ex:'Sit-ups',n:200},{ex:'Kniebeugen',n:250}]
  },
  {
    id:'p13', level:4, cats:['Pull','Push','Legs'], kind:'session', minutes:30, icon:'rounds', title:'Jede Minute, 30 Minuten', image:'/challenge-p13.jpg',
    desc:'Jede Minute auf die Minute: 5 Klimmzüge, 10 Liegestütze, 15 Kniebeugen. 30 Minuten lang.',
    explanation:'Was von der Minute übrig bleibt, ist Pause. Nutze den EMOM-Timer der App im Mix-Modus. Wer 30 Runden schafft, hat 900 Wiederholungen hinter sich.',
    target:30, metric:'rounds_in_session', exName:'', unit:'Runden', maxDur:2100,
    parts:[{ex:'Klimmzuge',n:5},{ex:'Liegestutze',n:10},{ex:'Kniebeugen',n:15}]
  },
  {
    id:'p14', level:2, cats:['Push'], kind:'session', minutes:5, icon:'tempo', title:'Auf und ab', image:'/challenge-p14.jpg',
    desc:'30 Liegestütze in einem Satz nach Tempo: runter auf Kommando, unten halten, hoch auf Kommando. Rund 3:30 Minuten.',
    explanation:'Die Zahl ist nicht der Gegner, die Pausen unten sind es. Ein Satz, kein Absetzen. Wer die Position unten verliert, fängt von vorn an.',
    target:30, metric:'best_set', exName:'Liegestutze', unit:'Wdh'
  },
  {
    id:'p15', level:3, cats:['Push'], kind:'days', minutes:10, icon:'days', title:'Hundert am Tag', image:'/challenge-p15.jpg',
    desc:'30 Tage lang jeden Tag 100 Liegestütze. Verteilen über den Tag ist erlaubt.',
    explanation:'Die bekannteste 30-Tage-Challenge. Trag jeden Tag ein, auch wenn es fünf Sätze à 20 sind. Ein verpasster Tag zählt nicht, die Challenge läuft aber weiter.',
    target:30, metric:'days_with_volume', exName:'Liegestutze', unit:'Tage', perDay:100
  },
  {
    id:'p16', level:2, cats:['Legs'], kind:'days', minutes:10, icon:'days', title:'Kniebeugen-Monat', image:'/challenge-p16.jpg',
    desc:'30 Tage lang jeden Tag 100 Kniebeugen.',
    explanation:'Beine und Ausdauer in einem. Tiefe Kniebeugen, Fersen am Boden. Am Anfang brennt es, ab Tag 10 wird es Routine.',
    target:30, metric:'days_with_volume', exName:'Kniebeugen', unit:'Tage', perDay:100
  },
  {
    id:'p17', level:1, cats:['Core'], kind:'days', minutes:5, icon:'days', title:'Plank-Monat', image:'/challenge-p17.jpg',
    desc:'30 Tage lang jeden Tag mindestens 60 Sekunden Plank, am Stück oder verteilt.',
    explanation:'Wer will, steigert: Woche 1 je 60 Sekunden, Woche 4 je 3 Minuten. Zählen tut die Gesamtzeit pro Tag.',
    target:30, metric:'days_with_volume', exName:'Plank', unit:'Tage', perDay:60
  },
  {
    id:'p18', level:3, cats:[], kind:'session', minutes:60, icon:'volume', title:'Tausend', image:'/challenge-p18.jpg',
    desc:'1000 Wiederholungen in einer Einheit. Alle Übungen mit Wiederholungen zählen, Halteübungen nicht.',
    explanation:'Klassische Aufteilung für eine Übung: 10 Sätze à 30, 10 à 25, 10 à 20, 10 à 15, 10 à 10. Oder mischen, bis die 1000 voll sind.',
    target:1000, metric:'volume_session_ex', exName:'', unit:'Wdh'
  },
  {
    id:'p19', level:2, cats:['Push'], kind:'session', minutes:15, icon:'ladder', title:'Die Leiter', image:'/challenge-p19.jpg',
    desc:'Minute 1: 1 Liegestütz. Minute 2: 2. Minute 3: 3. So weiter, bis die Minute nicht mehr reicht.',
    explanation:'Ziel sind 15 Sprossen, das sind 120 Liegestütze in 15 Minuten. Der EMOM-Timer der App zählt die Minuten für dich.',
    target:120, metric:'volume_session_ex', exName:'Liegestutze', unit:'Wdh'
  },
  {
    id:'p20', level:3, cats:['Push','Core','Legs'], kind:'session', minutes:40, icon:'cards', title:'Kartendeck', image:'/challenge-p20.jpg',
    desc:'52 Karten, vier Farben, vier Übungen: Liegestütze, Kniebeugen, Sit-ups, Burpees. Kartenwert = Wiederholungen.',
    explanation:'Bube 11, Dame 12, König 13, Ass 14. Pro Farbe 104 Wiederholungen, insgesamt 416 in einer Einheit. Karten mischen, ziehen, machen, nächste.',
    target:416, metric:'multi_volume_session', exName:'', unit:'Wdh',
    parts:[{ex:'Liegestutze',n:104},{ex:'Kniebeugen',n:104},{ex:'Sit-ups',n:104},{ex:'Burpees',n:104}]
  },
  {
    id:'p21', level:3, cats:['Push','Core','Legs'], kind:'session', minutes:12, icon:'volume', title:'Hundert Burpees', image:'/challenge-p21.jpg',
    desc:'100 Burpees in einer Einheit, auf Zeit.',
    explanation:'Unter 10 Minuten ist stark, unter 7 ist Elite. Aufteilen in 10er-Blöcke mit kurzem Durchatmen hält das Tempo.',
    target:100, metric:'volume_session_ex', exName:'Burpees', unit:'Wdh'
  },
  {
    id:'p22', level:2, cats:['Push'], kind:'session', minutes:5, icon:'hold', title:'Kopfüber', image:'/challenge-p22.jpg',
    desc:'Handstand an der Wand, 60 Sekunden am Stück.',
    explanation:'Fingerspitzen zur Wand, Körper eine Linie, aktiv aus den Schultern drücken. Baue mit 3 × 20 Sekunden auf, dann 2 × 30, dann eine Minute.',
    target:60, metric:'best_set', exName:'Wall Handstand Hold', unit:'Sek'
  },
  // ── p23–p100: Zeitlimits, EMOMs, Halte, erste Skills, Wochen-/Tagesziele, Gewohnheiten (manual) ──
  // minutes = geschätzte Minuten pro Einheit (Dauer-Filter im Katalog). Kein image → Kachel-Fallback.
  // Neue Metriken (manual, sessions_in_window, longest_session_min, distinct_exercises_session,
  // categories_in_session, sessions_by_hour, saved_parks, sets_this_week, hold_total_session) in app2.js.
  {
    id:'p23', level:3, cats:['Pull'], kind:'session', minutes:10, icon:'time', title:'Fünfzig auf Zeit',
    desc:'Schaff 50 Klimmzüge in einer Einheit, bevor die Uhr 10 Minuten zeigt. Sätze und Pausen teilst du dir frei ein.',
    explanation:'Starte mit kurzen Sätzen von 5 bis 8 Wiederholungen und halte die Pausen unter 30 Sekunden. Wer 15 saubere Klimmzüge am Stück kann, hat eine reelle Chance, alle anderen kämpfen mit der Uhr.',
    target:50, metric:'volume_session_ex', unit:'Wdh', exName:'Klimmzuge', maxDur:600
  },
  {
    id:'p24', level:2, cats:['Push'], kind:'session', minutes:10, icon:'time', title:'Hundert in zehn',
    desc:'100 Liegestütze in einer Einheit, Zeitlimit 10 Minuten. Alle Varianten zählen, auch enge oder weite.',
    explanation:'Teil dir die 100 in Sätze von 15 bis 20 auf und starte jeden neuen Satz alle 90 Sekunden. So bleibt am Ende noch Luft für den Schluss.',
    target:100, metric:'volume_session_ex', unit:'Wdh', exName:'Liegestutze', maxDur:600
  },
  {
    id:'p25', level:3, cats:['Push'], kind:'session', minutes:5, icon:'time', title:'Dips gegen die Uhr',
    desc:'50 Dips in einer Einheit, und das innerhalb von 5 Minuten. Barren, Ringe oder Bank, alles zählt.',
    explanation:'Fünf Minuten sind knapp, also keine langen Pausen. Sätze von 10 mit je 30 Sekunden Pause gehen rechnerisch genau auf, wenn die Schultern mitspielen.',
    target:50, metric:'volume_session_ex', unit:'Wdh', exName:'Dips', maxDur:300
  },
  {
    id:'p26', level:2, cats:['Legs'], kind:'session', minutes:10, icon:'time', title:'Zweihundert Kniebeugen',
    desc:'200 Kniebeugen in einer Einheit, Zeitlimit 10 Minuten. Ohne Zusatzgewicht, dafür ganz tief.',
    explanation:'Halte ein gleichmäßiges Tempo statt am Anfang zu sprinten. Vier Sätze à 50 mit kurzen Atempausen dazwischen sind für die meisten machbar, die Oberschenkel brennen trotzdem.',
    target:200, metric:'volume_session_ex', unit:'Wdh', exName:'Kniebeugen', maxDur:600
  },
  {
    id:'p27', level:3, cats:['Legs'], kind:'session', minutes:5, icon:'time', title:'Burpee-Sprint',
    desc:'50 Burpees in einer Einheit, Zeitlimit 5 Minuten. Jede Wiederholung mit Liegestütz unten und Sprung oben.',
    explanation:'Das entspricht einem Burpee alle 6 Sekunden, also fast ohne Pause. Atme bewusst im Rhythmus und kürze die Bewegung nicht ab, sonst zählt es nur auf dem Papier.',
    target:50, metric:'volume_session_ex', unit:'Wdh', exName:'Burpees', maxDur:300
  },
  {
    id:'p28', level:1, cats:['Pull'], kind:'session', minutes:8, icon:'time', title:'Ruderregatta',
    desc:'60 Australian Rows in einer Einheit, Zeitlimit 8 Minuten. Brust bis zur Stange, Körper gerade wie ein Brett.',
    explanation:'Ein guter Einstieg, wenn Klimmzüge noch nicht klappen. Stell die Stange so hoch, dass 10 saubere Wiederholungen am Stück gehen, und mach dann sechs Sätze davon.',
    target:60, metric:'volume_session_ex', unit:'Wdh', exName:'Australian Rows', maxDur:480
  },
  {
    id:'p29', level:1, cats:['Push','Legs'], kind:'session', minutes:12, icon:'volume', title:'Abwärts von zehn',
    desc:'Eine absteigende Leiter aus Liegestützen und Kniebeugen in einer Einheit: 10 und 10, dann 9 und 9, bis runter auf 1 und 1. Macht 55 von jeder Übung.',
    explanation:'Die Leiter wird mit jeder Stufe leichter, deshalb ist sie ideal für den Anfang. Liegestütze auf den Knien sind völlig in Ordnung, trag sie einfach als Liegestütze ein.',
    target:110, metric:'multi_volume_session', unit:'Wdh',
    parts:[{ex:'Liegestutze',n:55},{ex:'Kniebeugen',n:55}]
  },
  {
    id:'p30', level:3, cats:['Core'], kind:'session', minutes:15, icon:'volume', title:'Aufwärts bis zwanzig',
    desc:'Eine aufsteigende Leiter aus Leg Raises in einer Einheit: 2, 4, 6 und so weiter bis 20. Zusammen 110 Wiederholungen mit gestreckten Beinen.',
    explanation:'Die letzten drei Stufen entscheiden. Häng ruhig, zieh die Beine ohne Schwung hoch und lass sie kontrolliert wieder ab. Wer Toes to Bar macht, darf die Stufen gern damit füllen.',
    target:110, metric:'volume_session_ex', unit:'Wdh', exName:'Leg Raises'
  },
  {
    id:'p31', level:3, cats:['Pull'], kind:'session', minutes:12, icon:'rounds', title:'Zwölf Minuten Zug',
    desc:'EMOM über 12 Minuten: Zu Beginn jeder Minute 5 Klimmzüge, die restliche Zeit ist Pause. 12 Runden, 60 Klimmzüge.',
    explanation:'Die ersten Minuten fühlen sich leicht an, ab Minute acht wird die Pause knapp. Wer die 5 nicht mehr am Stück schafft, teilt sie innerhalb der Minute auf.',
    target:12, metric:'rounds_in_session', unit:'Runden', maxDur:720,
    parts:[{ex:'Klimmzuge',n:5}]
  },
  {
    id:'p32', level:2, cats:['Legs'], kind:'session', minutes:10, icon:'rounds', title:'Zehn Minuten Sprung',
    desc:'EMOM über 10 Minuten: Jede Minute 10 Jump Squats, danach Pause bis zur nächsten Minute. 10 Runden.',
    explanation:'Lande weich und geh jedes Mal richtig tief, sonst ist die Übung nur Hüpfen. Die Pause reicht am Anfang für 40 Sekunden Luftholen, am Ende ist sie halb so lang.',
    target:10, metric:'rounds_in_session', unit:'Runden', maxDur:600,
    parts:[{ex:'Jump Squats',n:10}]
  },
  {
    id:'p33', level:2, cats:['Core'], kind:'session', minutes:10, icon:'rounds', title:'Zehn Minuten Rumpf',
    desc:'EMOM über 10 Minuten: Jede Minute 10 V-Ups und 20 Russian Twists, danach Pause bis zur nächsten Minute. 10 Runden.',
    explanation:'Die Kombination schafft man in etwa 35 Sekunden, dann bleiben 25 Sekunden Pause. Bei den Twists zählt jede Seite als eine Wiederholung.',
    target:10, metric:'rounds_in_session', unit:'Runden', maxDur:600,
    parts:[{ex:'V-Ups',n:10},{ex:'Russian Twists',n:20}]
  },
  {
    id:'p34', level:1, cats:['Pull'], kind:'session', minutes:5, icon:'hold', title:'Toter Hang',
    desc:'Häng dich 60 Sekunden am Stück an die Stange. Arme gestreckt, Griff geschlossen, Füße in der Luft.',
    explanation:'Reine Griffkraft und Geduld. Wer bei 30 Sekunden loslassen muss, trainiert zwei Wochen lang drei Hänge pro Einheit und probiert es dann erneut.',
    target:60, metric:'best_set', unit:'Sek', exName:'Dead Hang'
  },
  {
    id:'p35', level:3, cats:['Core'], kind:'session', minutes:8, icon:'hold', title:'L-Sitz Halbminute',
    desc:'Halte einen L-Sit 30 Sekunden am Stück. Beine gestreckt und waagerecht, auf Barren, Boden oder Ringen.',
    explanation:'Die Hüftbeuger geben meist vor den Armen auf. Übe mit kurzen Sätzen von 10 Sekunden und summiere sie, bevor du den langen Halt versuchst. Für die meisten ein echtes Brett.',
    target:30, metric:'best_set', unit:'Sek', exName:'L-Sit Hold'
  },
  {
    id:'p36', level:1, cats:['Core'], kind:'days', minutes:5, icon:'days', title:'Seitenplanke Woche',
    desc:'Sieben Tage lang jeden Tag mindestens 60 Sekunden Side Plank, beide Seiten zusammengerechnet.',
    explanation:'Zwei Mal 30 Sekunden pro Tag reichen aus. Hüfte oben halten, Schulter direkt über dem Ellbogen. Perfekt als kurze Ergänzung nach jeder Einheit.',
    target:7, metric:'days_with_volume', unit:'Tage', exName:'Side Plank', perDay:60
  },
  {
    id:'p37', level:2, cats:['Core'], kind:'session', minutes:8, icon:'hold', title:'Drei Minuten hohl',
    desc:'Sammle in einer Einheit insgesamt 180 Sekunden Hollow Body Hold, beliebig viele Sätze.',
    explanation:'Sechs Sätze à 30 Sekunden sind der klassische Weg. Unterer Rücken bleibt die ganze Zeit am Boden, sonst pausieren und neu ansetzen.',
    target:180, metric:'hold_total_session', unit:'Sek', exName:'Hollow Body Hold'
  },
  {
    id:'p38', level:1, cats:['Core'], kind:'session', minutes:5, icon:'hold', title:'Superman',
    desc:'Halte einen Superman Hold 90 Sekunden am Stück: Bauchlage, Arme und Beine gleichzeitig vom Boden abheben.',
    explanation:'Der Gegenspieler zur Planke, gut für den unteren Rücken. Blick zum Boden, Nacken lang. Die Sekunden vergehen langsamer, als du denkst.',
    target:90, metric:'best_set', unit:'Sek', exName:'Superman Hold'
  },
  {
    id:'p39', level:1, cats:['Legs'], kind:'session', minutes:5, icon:'hold', title:'Wandsitz',
    desc:'Halte einen Wall Sit 2 Minuten am Stück. Rücken an der Wand, Knie im rechten Winkel.',
    explanation:'Keine Technik, nur Wille. Hände nicht auf die Oberschenkel stützen. Ab Sekunde 90 fangen die Beine an zu zittern, das ist normal.',
    target:120, metric:'best_set', unit:'Sek', exName:'Wall Sit'
  },
  {
    id:'p40', level:2, cats:['Skills'], kind:'session', minutes:8, icon:'skill', title:'Froschstand',
    desc:'Halte einen Frog Stand 30 Sekunden am Stück: Knie auf den Ellbogen, Füße in der Luft.',
    explanation:'Die erste Stufe Richtung Planche. Schau leicht nach vorn, drück die Finger in den Boden und lehn dich langsam vor. Ein Kissen vor der Nase nimmt die Angst.',
    target:30, metric:'best_set', unit:'Sek', exName:'Frog Stand'
  },
  {
    id:'p41', level:1, cats:['Core'], kind:'session', minutes:5, icon:'hold', title:'Umgekehrte Planke',
    desc:'Halte einen Reverse Plank 60 Sekunden am Stück: Rücken zum Boden, Hände hinter dir, Hüfte durchgestreckt.',
    explanation:'Trainiert die Rückseite, die bei Liegestützen und Dips oft zu kurz kommt. Hüfte nach oben schieben, Schultern nach hinten, Blick zur Decke.',
    target:60, metric:'best_set', unit:'Sek', exName:'Reverse Plank'
  },
  {
    id:'p42', level:3, cats:['Pull','Skills'], kind:'week', minutes:10, icon:'skill', title:'Erster Muscle-Up',
    desc:'Schaff deinen ersten sauberen Muscle-Up an der Stange und trag ihn in einer Einheit ein. Ohne Kipp-Schwung, mit kontrolliertem Übergang.',
    explanation:'Voraussetzung sind etwa 10 explosive Klimmzüge bis zur Brust und stabile Dips. Übe den Übergang mit Band oder auf einer niedrigen Stange, dann kommt der Moment meist überraschend.',
    target:1, metric:'new_exercise', unit:'Mal', exName:'Muscle-Ups'
  },
  {
    id:'p43', level:3, cats:['Legs','Skills'], kind:'week', minutes:10, icon:'skill', title:'Erste Pistol',
    desc:'Schaff deine erste freie Pistol Squat auf jedem Bein und trag sie in einer Einheit ein. Ohne Festhalten, Ferse bleibt am Boden.',
    explanation:'Oft scheitert es an der Beweglichkeit, nicht an der Kraft. Übe mit Box Pistol Squats auf immer niedrigeren Kanten und halte das freie Bein aktiv gestreckt.',
    target:1, metric:'new_exercise', unit:'Mal', exName:'Pistol Squat'
  },
  {
    id:'p44', level:3, cats:['Pull'], kind:'week', minutes:10, icon:'skill', title:'Erster Archer',
    desc:'Schaff deinen ersten Archer Pull-up und trag ihn in einer Einheit ein: Ein Arm zieht, der andere bleibt gestreckt zur Seite.',
    explanation:'Der Schritt Richtung einarmiger Klimmzug. Fang mit weiten Klimmzügen und Typewriter Pull-ups an, bei denen du oben von Seite zu Seite fährst.',
    target:1, metric:'new_exercise', unit:'Mal', exName:'Archer Pull-ups'
  },
  {
    id:'p45', level:4, cats:['Push','Skills'], kind:'week', minutes:10, icon:'skill', title:'Kopfüber drücken',
    desc:'Schaff deinen ersten Handstand Push-up an der Wand und trag ihn in einer Einheit ein. Kopf berührt den Boden, Arme oben gestreckt.',
    explanation:'Braucht einen stabilen Wandhandstand von mindestens 30 Sekunden und kräftige Pike Push-ups mit erhöhten Füßen. Leg ein flaches Kissen unter den Kopf und starte mit Negativen. Für die meisten ein Projekt über Monate.',
    target:1, metric:'new_exercise', unit:'Mal', exName:'Handstand Push-ups'
  },
  {
    id:'p46', level:4, cats:['Skills'], kind:'session', minutes:10, icon:'skill', title:'Front Lever zehn Sekunden',
    desc:'Halte einen vollen Front Lever 10 Sekunden am Stück. Körper waagerecht, Beine gestreckt, Arme gerade.',
    explanation:'Der Sprung vom Tuck zum vollen Lever ist groß. Geh über Advanced Tuck und einbeinige Varianten, und trainiere die Zugkraft mit langsamen Negativen. Ehrlich gesagt: einer der schwersten Halte im Katalog.',
    target:10, metric:'best_set', unit:'Sek', exName:'Front Lever Hold'
  },
  {
    id:'p47', level:4, cats:['Skills'], kind:'session', minutes:10, icon:'skill', title:'Back Lever',
    desc:'Halte einen Back Lever 10 Sekunden am Stück: Bauch zum Boden, Körper waagerecht, Arme hinter dir gestreckt.',
    explanation:'Die Schultern brauchen dafür Beweglichkeit und Zeit, also die Skin-the-Cat-Bewegung vorher monatelang aufbauen. Erst mit Tuck, dann einbeinig, dann ganz gestreckt.',
    target:10, metric:'best_set', unit:'Sek', exName:'Back Lever Hold'
  },
  {
    id:'p48', level:4, cats:['Skills'], kind:'session', minutes:10, icon:'skill', title:'Fünf Sekunden Flagge',
    desc:'Halte eine Human Flag 5 Sekunden am Stück, Körper seitlich waagerecht an einer senkrechten Stange.',
    explanation:'Fünf Sekunden klingen kurz, sind aber für die seitliche Rumpfkraft brutal. Der untere Arm drückt, der obere zieht. Starte mit angewinkelten Beinen und einem Fuß am Boden.',
    target:5, metric:'best_set', unit:'Sek', exName:'Human Flag Hold'
  },
  {
    id:'p49', level:2, cats:[], kind:'session', minutes:35, icon:'sets', title:'Zwanzig Sätze',
    desc:'Trag in einer einzigen Einheit 20 Sätze ein. Welche Übungen und wie viele Wiederholungen, entscheidest du.',
    explanation:'Eine Einheit mit echter Substanz. Fünf Übungen mit je vier Sätzen sind der einfachste Plan, und mit 60 Sekunden Pause bist du in einer guten halben Stunde durch.',
    target:20, metric:'sets_in_one_workout', unit:'Sätze'
  },
  {
    id:'p50', level:2, cats:['Push'], kind:'session', minutes:8, icon:'volume', title:'Zwanzig am Stück',
    desc:'20 Dips in einem einzigen Satz, ohne Absetzen. Barren oder Ringe, volle Tiefe.',
    explanation:'Ein sauberer Kraftausdauer-Test. Wer bei 12 hängen bleibt, baut mit Sätzen von 8 bis 10 und 90 Sekunden Pause auf. Ellbogen unten mindestens im rechten Winkel, sonst zählt der Satz nicht.',
    target:20, metric:'best_set', unit:'Wdh', exName:'Dips'
  },
  {
    id:'p51', level:2, cats:['Core'], kind:'week', minutes:10, icon:'hold', title:'Viertelstunde halten',
    desc:'Sammle innerhalb einer Woche 900 Sekunden Haltezeit, also 15 Minuten. Planke, Hollow Body, L-Sit, Dead Hang und alle anderen Halteübungen zählen zusammen.',
    explanation:'Am leichtesten mit drei bis vier Halteübungen pro Einheit à 30 bis 60 Sekunden. Wer statische Skills wie Tuck Planche oder Front Lever übt, sammelt nebenbei.',
    target:900, metric:'hold_total_week', unit:'Sek'
  },
  {
    id:'p52', level:3, cats:[], kind:'week', minutes:30, icon:'sets', title:'Fünfzig Sätze',
    desc:'Trag innerhalb einer Woche 50 Sätze ein, egal welche Übungen und wie verteilt.',
    explanation:'Vier Einheiten mit 12 bis 13 Sätzen oder fünf mit 10. Das ist eine ordentliche Trainingswoche, also plan die Regeneration mit ein.',
    target:50, metric:'sets_this_week', unit:'Sätze'
  },
  {
    id:'p53', level:1, cats:['Legs'], kind:'week', minutes:10, icon:'week', title:'Ausfallschritt-Woche',
    desc:'300 Lunges innerhalb einer Woche, beide Beine zusammengerechnet. Verteilung ist dir überlassen.',
    explanation:'Ideal für Einsteiger, weil Lunges keinerlei Ausrüstung brauchen. Drei Einheiten mit je 100 oder jeden Tag 45 auf dem Weg zur Arbeit. Das hintere Knie berührt fast den Boden.',
    target:300, metric:'volume_exercise', unit:'Wdh', exName:'Lunges'
  },
  {
    id:'p54', level:2, cats:['Pull'], kind:'days', minutes:5, icon:'days', title:'Zehn am Tag',
    desc:'Zehn Tage lang jeden Tag mindestens 10 Klimmzüge. Auf mehrere Sätze verteilt ist erlaubt.',
    explanation:'Kurz, aber konsequent. Für die tägliche Dosis reichen zwei Sätze à 5 in fünf Minuten, an Trainingstagen zählt die Einheit sowieso mit.',
    target:10, metric:'days_with_volume', unit:'Tage', exName:'Klimmzuge', perDay:10
  },
  {
    id:'p55', level:1, cats:['Legs'], kind:'days', minutes:5, icon:'days', title:'Brücken-Woche',
    desc:'Sieben Tage lang jeden Tag mindestens 30 Glute Bridges. Oben kurz anspannen, dann langsam ab.',
    explanation:'Drei Minuten am Morgen reichen, keine Ausrede. Fersen nah am Gesäß, Hüfte ganz durchstrecken. Der beste Einstieg für alle, die sonst nur Oberkörper trainieren.',
    target:7, metric:'days_with_volume', unit:'Tage', exName:'Glute Bridge', perDay:30
  },
  {
    id:'p56', level:2, cats:['Core'], kind:'days', minutes:5, icon:'days', title:'Zwei Wochen Sit-ups',
    desc:'14 Tage lang jeden Tag mindestens 50 Sit-ups. Sätze frei aufteilen, nur die Tageszahl zählt.',
    explanation:'Zwei Wochen sind lang genug, dass eine Gewohnheit daraus wird. Wer mag, wechselt zwischen normalen Sit-ups und Varianten mit angezogenen Beinen.',
    target:14, metric:'days_with_volume', unit:'Tage', exName:'Sit-ups', perDay:50
  },
  {
    id:'p57', level:1, cats:['Pull'], kind:'days', minutes:5, icon:'days', title:'Negativ-Woche',
    desc:'Sieben Tage lang jeden Tag mindestens 5 negative Klimmzüge: Hochspringen oder hochsteigen, dann so langsam wie möglich ablassen.',
    explanation:'Der direkte Weg zum ersten Klimmzug. Zähle beim Ablassen bis fünf, notfalls bis drei. Nach einer Woche wirst du merken, dass der Weg nach oben kürzer geworden ist.',
    target:7, metric:'days_with_volume', unit:'Tage', exName:'Negative Klimmzuge', perDay:5
  },
  {
    id:'p58', level:3, cats:['Pull','Push','Legs'], kind:'session', minutes:15, icon:'volume', title:'Dreikampf',
    desc:'30 Klimmzüge, 60 Dips und 90 Kniebeugen in einer Einheit. Reihenfolge und Aufteilung frei.',
    explanation:'Die Zahlen sind so gewählt, dass alle drei ungefähr gleich anstrengend sind. Wechsle die Übungen im Kreis, damit die Muskeln zwischendurch Pause bekommen.',
    target:180, metric:'multi_volume_session', unit:'Wdh',
    parts:[{ex:'Klimmzuge',n:30},{ex:'Dips',n:60},{ex:'Kniebeugen',n:90}]
  },
  {
    id:'p59', level:2, cats:['Push','Core','Legs'], kind:'session', minutes:15, icon:'rounds', title:'Drei sechs neun',
    desc:'10 Runden aus 3 Dips, 6 Leg Raises und 9 Lunges in einer Einheit, Zeitlimit 15 Minuten.',
    explanation:'Kleine Zahlen, viele Runden: Am Ende stehen 30 Dips, 60 Leg Raises und 90 Lunges. Bei den Lunges zählt jeder Schritt, wechsle die Seite bei jeder Wiederholung. Kurze Übergänge, nach jeder Runde 20 Sekunden durchatmen.',
    target:10, metric:'rounds_in_session', unit:'Runden', maxDur:900,
    parts:[{ex:'Dips',n:3},{ex:'Leg Raises',n:6},{ex:'Lunges',n:9}]
  },
  {
    id:'p60', level:2, cats:[], kind:'session', minutes:30, icon:'variety', title:'Zehn Übungen',
    desc:'Trag in einer einzigen Einheit 10 verschiedene Übungen ein, jede mit mindestens einem Satz.',
    explanation:'Ein Zirkel durch den ganzen Katalog: zwei Zug, zwei Druck, zwei Beine, zwei Rumpf, zwei nach Wahl. Eine gute Gelegenheit, Übungen auszuprobieren, die du sonst nie machst.',
    target:10, metric:'distinct_exercises_session', unit:'Übungen'
  },
  {
    id:'p61', level:2, cats:[], kind:'session', minutes:25, icon:'variety', title:'Alle fünf',
    desc:'Deck in einer einzigen Einheit alle fünf Kategorien ab: Pull, Push, Core, Legs und Skills.',
    explanation:'Ein Ganzkörpertag, der auch die Skills nicht vergisst. Für die Skills-Kategorie reicht ein Frog Stand oder ein Handstand an der Wand, es muss kein Front Lever sein.',
    target:5, metric:'categories_in_session', unit:'Kategorien'
  },
  {
    id:'p62', level:2, cats:['Legs'], kind:'week', minutes:15, icon:'days', title:'Drei Beintage',
    desc:'Trainiere diese Woche an drei verschiedenen Tagen mindestens eine Beinübung.',
    explanation:'Beine kommen im Calisthenics oft zu kurz. Kniebeugen, Lunges, Pistol-Progressionen oder Calf Raises reichen, ein paar Sätze am Ende der Einheit genügen.',
    target:3, metric:'category_workouts', unit:'Tage', catName:'Legs'
  },
  {
    id:'p63', level:4, cats:[], kind:'days', minutes:15, icon:'days', title:'Zwölf in vierzehn',
    desc:'Zwölf Einheiten innerhalb von 14 Tagen nach dem Start. Nur zwei Ruhetage, der Rest wird trainiert.',
    explanation:'Das ist ein hohes Pensum. Plane leichte Tage mit Mobility oder Technik ein und schlaf ausreichend, sonst brennst du in der zweiten Woche aus.',
    target:12, metric:'sessions_in_window', unit:'Einheiten', days:14
  },
  {
    id:'p64', level:3, cats:[], kind:'week', minutes:15, icon:'days', title:'Sechs von sieben',
    desc:'Sechs Trainingstage in dieser Woche. Ein Ruhetag ist erlaubt.',
    explanation:'Verteile Pull, Push, Core und Beine so, dass keine Muskelgruppe zwei Tage hintereinander drankommt. Die Einheiten dürfen kurz sein.',
    target:6, metric:'workouts_this_week', unit:'Einheiten'
  },
  {
    id:'p65', level:2, cats:[], kind:'session', minutes:45, icon:'time', title:'Dreiviertelstunde',
    desc:'Eine einzelne Einheit, die mindestens 45 Minuten am Stück dauert.',
    explanation:'Nimm dir Zeit für längere Pausen und mehr Sätze statt mehr Tempo. Ein Ganzkörper-Plan mit fünf bis sechs Übungen füllt die Zeit gut.',
    target:45, metric:'longest_session_min', unit:'Min'
  },
  {
    id:'p66', level:3, cats:[], kind:'days', minutes:15, icon:'days', title:'Doppeltag',
    desc:'Zwei getrennte Trainingseinheiten an einem einzigen Tag, zum Beispiel morgens und abends.',
    explanation:'Trainiere morgens Zug und abends Druck, dann stören sich die Einheiten nicht. Iss und trink dazwischen ausreichend.',
    target:2, metric:'sessions_in_window', unit:'Einheiten', days:1
  },
  {
    id:'p67', level:3, cats:[], kind:'days', minutes:15, icon:'time', title:'Frühaufsteher',
    desc:'Fünf Einheiten, die vor 7 Uhr morgens gespeichert werden.',
    explanation:'Leg die Sachen am Abend vorher raus und starte mit einem längeren Aufwärmen, der Körper ist früh noch steif. Zählt nach dem Speicherzeitpunkt der Einheit.',
    target:5, metric:'sessions_by_hour', unit:'Einheiten', beforeHour:7
  },
  {
    id:'p68', level:2, cats:[], kind:'days', minutes:15, icon:'time', title:'Nachteule',
    desc:'Drei Einheiten, die nach 21 Uhr gespeichert werden.',
    explanation:'Spät trainieren geht gut, wenn du danach noch eine halbe Stunde runterkommst. Zählt nach dem Speicherzeitpunkt der Einheit.',
    target:3, metric:'sessions_by_hour', unit:'Einheiten', afterHour:21
  },
  {
    id:'p69', level:1, cats:[], kind:'days', minutes:12, icon:'time', title:'Mittagspause',
    desc:'Drei Einheiten zwischen 12 und 14 Uhr.',
    explanation:'Ein kurzer Zirkel mit drei Übungen passt in jede Pause. Zählt nach dem Speicherzeitpunkt der Einheit.',
    target:3, metric:'sessions_by_hour', unit:'Einheiten', beforeHour:14, afterHour:12
  },
  {
    id:'p70', level:1, cats:[], kind:'days', minutes:5, icon:'place', title:'Drei Parks',
    desc:'Speichere drei Trainingsparks in der App.',
    explanation:'Schau auf der Karte, was in deiner Nähe liegt. Ein zweiter oder dritter Park macht dich unabhängig davon, ob dein Stammplatz voll ist.',
    target:3, metric:'saved_parks', unit:'Parks'
  },
  {
    id:'p71', level:1, cats:[], kind:'manual', minutes:15, icon:'place', title:'Neuer Park',
    desc:'Trainiere einmal in einem Park, in dem du noch nie warst. Trag es ein, sobald du die Einheit dort gemacht hast.',
    explanation:'Andere Stangen, andere Höhen, andere Leute. Nimm dir ein lockeres Programm, damit du das Gerät erst mal kennenlernst.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p72', level:2, cats:[], kind:'manual', minutes:15, icon:'place', title:'Regentraining',
    desc:'Eine komplette Einheit draußen bei Regen. Trag ein, wenn du sie durchgezogen hast.',
    explanation:'Nasse Stangen sind rutschig, also Magnesium oder Handschuhe mitnehmen und auf Übungen mit sicherem Griff setzen. Danach sofort trockene Klamotten.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p73', level:3, cats:[], kind:'manual', minutes:15, icon:'place', title:'Minusgrade',
    desc:'Eine Einheit draußen bei Temperaturen unter null Grad. Trag ein, wenn du sie gemacht hast.',
    explanation:'Zieh Schichten an, wärm dich länger auf als sonst und schütze Hände und Ohren. Halte die Einheit kurz und knackig, Kälte zieht schnell Kraft.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p74', level:1, cats:[], kind:'manual', minutes:15, icon:'place', title:'Barfuß',
    desc:'Eine Einheit ohne Schuhe. Trag ein, wenn du sie gemacht hast.',
    explanation:'Kniebeugen, Ausfallschritte und Balance fühlen sich barfuß anders an, du spürst den Boden viel besser. Auf Wiese oder Matte, nicht auf Splitt.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p75', level:2, cats:[], kind:'manual', minutes:15, icon:'place', title:'Auf Reisen',
    desc:'Trainiere unterwegs an drei verschiedenen Orten, egal ob Hotelzimmer, Spielplatz oder Bahnhof. Trag jeden Tag ein, an dem du unterwegs trainiert hast.',
    explanation:'Liegestütze, Kniebeugen und Planks brauchen keine Geräte. Wenn du eine Stange findest, ist es ein Bonus.',
    target:3, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p76', level:2, cats:[], kind:'manual', minutes:15, icon:'place', title:'Stirnlampe',
    desc:'Eine Einheit im Dunkeln mit Stirnlampe oder Taschenlampe. Trag ein, wenn du sie gemacht hast.',
    explanation:'Im Winter geht die Sonne früh unter, das ist kein Grund auszusetzen. Nimm Übungen, bei denen du den Boden gut siehst, und lass Sprünge weg.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p77', level:2, cats:[], kind:'manual', minutes:15, icon:'habit', title:'Handy aus',
    desc:'Sieben Trainingseinheiten ohne Handy in der Hand, nur die App zum Eintragen am Ende. Trag jeden Tag ein, an dem du das geschafft hast.',
    explanation:'Flugmodus an, Musik vorher starten. Du wirst merken, wie viel kürzer die Pausen werden.',
    target:7, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p78', level:1, cats:[], kind:'manual', minutes:10, icon:'habit', title:'Dehnen danach',
    desc:'Nach fünf Einheiten jeweils zehn Minuten dehnen. Trag jeden Tag ein, an dem du nach dem Training gedehnt hast.',
    explanation:'Schultern, Brust, Hüftbeuger und Beinrückseite reichen als Programm. Nicht wippen, jede Position 30 bis 60 Sekunden halten.',
    target:5, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p79', level:3, cats:[], kind:'manual', minutes:2, icon:'habit', title:'Kalte Dusche',
    desc:'Sieben Tage in Folge kalt duschen, mindestens eine Minute. Trag jeden Tag ein, an dem du es gemacht hast.',
    explanation:'Fang warm an und dreh am Ende auf kalt. Atme dabei ruhig durch die Nase, das macht den größten Unterschied.',
    target:7, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p80', level:1, cats:[], kind:'manual', minutes:5, icon:'habit', title:'Atempause',
    desc:'An fünf Tagen vor dem Training fünf Minuten bewusst atmen. Trag jeden Tag ein, an dem du es gemacht hast.',
    explanation:'Vier Sekunden ein, sechs Sekunden aus, das genügt. Setz dich hin oder leg dich auf den Rücken, danach wärmst du dich normal auf.',
    target:5, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p81', level:2, cats:[], kind:'manual', minutes:3, icon:'habit', title:'Tagebuch',
    desc:'14 Tage lang jeden Tag drei Zeilen ins Trainingstagebuch: was du gemacht hast, wie es sich angefühlt hat, was morgen ansteht. Trag jeden Tag ein, an dem du geschrieben hast.',
    explanation:'Auch Ruhetage zählen, dann schreibst du eben, warum du pausierst. Notizen-App oder Papier ist egal.',
    target:14, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p82', level:1, cats:[], kind:'manual', minutes:1, icon:'habit', title:'Zwei Liter',
    desc:'Sieben Tage lang mindestens zwei Liter Wasser am Tag. Trag jeden Tag ein, an dem du die Menge geschafft hast.',
    explanation:'Eine Flasche mit bekanntem Volumen macht das Zählen leicht. Kaffee und Limo zählen nicht.',
    target:7, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p83', level:2, cats:[], kind:'manual', minutes:10, icon:'habit', title:'Zehntausend Schritte',
    desc:'An fünf Tagen jeweils 10.000 Schritte gehen. Trag jeden Tag ein, an dem dein Schrittzähler die Zahl zeigt.',
    explanation:'Der Weg zum Park zu Fuß statt mit dem Rad bringt schon einen großen Teil. Trainingstage sind erlaubt, Schritte sind Schritte.',
    target:5, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p84', level:3, cats:[], kind:'manual', minutes:1, icon:'habit', title:'Acht Stunden',
    desc:'Fünf Nächte mit mindestens acht Stunden Schlaf. Trag jeden Morgen ein, an dem du die acht Stunden voll hast.',
    explanation:'Schlaf ist die Zeit, in der Muskeln wachsen. Bildschirm eine Stunde vorher aus und die Schlafenszeit fest einplanen, sonst wird es knapp.',
    target:5, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p85', level:4, cats:[], kind:'manual', minutes:1, icon:'habit', title:'Zuckerfrei',
    desc:'14 Tage ohne zugesetzten Zucker: keine Süßigkeiten, keine Limo, kein Zucker im Kaffee. Trag jeden Tag ein, den du sauber durchgezogen hast.',
    explanation:'Obst ist erlaubt. Die ersten drei Tage sind am härtesten, danach lässt der Heißhunger deutlich nach. Ein Ausrutscher heißt: Tag nicht eintragen, aber weitermachen.',
    target:14, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p86', level:2, cats:['Legs'], kind:'manual', minutes:2, icon:'habit', title:'Flamingo',
    desc:'Zehn Tage lang jeden Tag eine Minute auf einem Bein balancieren, pro Seite. Trag jeden Tag ein, an dem du beide Seiten gemacht hast.',
    explanation:'Beim Zähneputzen oder beim Warten an der Ampel. Wird es zu leicht, schließ die Augen oder stell dich auf ein Kissen.',
    target:10, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p87', level:1, cats:['Legs'], kind:'session', minutes:3, icon:'volume', title:'Werbepause',
    desc:'100 Calf Raises in einer Einheit in unter drei Minuten.',
    explanation:'Perfekt für die Werbepause oder die Wartezeit auf den Kaffee. Oben kurz halten, unten die Ferse ganz absenken, am besten auf einer Stufe. Ab 60 brennt es, das ist der Sinn.',
    target:100, metric:'volume_session_ex', unit:'Wdh', exName:'Calf Raises', maxDur:180
  },
  {
    id:'p88', level:3, cats:['Legs'], kind:'manual', minutes:10, icon:'volume', title:'Treppenlauf',
    desc:'An fünf Tagen jeweils 20 Stockwerke Treppen steigen, am Stück oder verteilt über den Tag. Trag jeden Tag ein, an dem du die 20 voll hast.',
    explanation:'Aufzug ignorieren reicht oft schon. Wer es härter will, nimmt zwei Stufen auf einmal.',
    target:5, metric:'manual', unit:'Tage', perDay:true
  },
  {
    id:'p89', level:2, cats:['Legs'], kind:'days', minutes:2, icon:'hold', title:'Zahnputz-Wandsitz',
    desc:'Sieben Tage lang jeden Tag 60 Sekunden Wandsitz, am besten während du Zähne putzt.',
    explanation:'Rücken an die Wand, Knie im rechten Winkel, Hände nicht auf den Oberschenkeln abstützen. Zwei Minuten Zähneputzen sind eh Pflicht, die Minute Wandsitz kommt gratis dazu.',
    target:7, metric:'days_with_volume', unit:'Tage', exName:'Wall Sit', perDay:60
  },
  {
    id:'p90', level:2, cats:['Pull'], kind:'days', minutes:5, icon:'days', title:'Hänge-Woche',
    desc:'Sieben Tage lang jeden Tag mindestens 60 Sekunden Dead Hang gesamt, am Stück oder in mehreren Hängen.',
    explanation:'Griffkraft wächst mit Häufigkeit, nicht mit Heldentaten. Zwei Hänge à 30 Sekunden am Tag reichen, an Trainingstagen zählt die Einheit mit. Schultern dürfen locker bleiben.',
    target:7, metric:'days_with_volume', unit:'Tage', exName:'Dead Hang', perDay:60
  },
  {
    id:'p91', level:4, cats:['Legs'], kind:'session', minutes:25, icon:'hold', title:'Wand in Flammen',
    desc:'Zehn Minuten Wandsitz gesamt in einer Einheit, aufgeteilt in beliebig viele Sätze.',
    explanation:'Sätze von 60 bis 90 Sekunden mit kurzen Pausen funktionieren am besten. Die letzten Minuten brennen richtig, das ist der Sinn der Sache.',
    target:600, metric:'hold_total_session', unit:'Sek', exName:'Wall Sit'
  },
  {
    id:'p92', level:2, cats:[], kind:'week', minutes:20, icon:'variety', title:'Neuland',
    desc:'Trag diese Woche drei Übungen ein, die du in der App noch nie gemacht hast.',
    explanation:'Stöbere durch den Katalog: Archer Rows, Pike Push-ups, Shrimp Squats oder Windshield Wipers stehen bei den meisten noch aus. Ein Satz pro Übung genügt, es geht ums Ausprobieren.',
    target:3, metric:'new_exercises_week', unit:'Übungen'
  },
  {
    id:'p93', level:3, cats:['Core'], kind:'session', minutes:20, icon:'hold', title:'Zehn Minuten halten',
    desc:'Sammle in einer Einheit insgesamt 600 Sekunden Haltezeit. Alle Halteübungen zählen zusammen: Planke, Hollow Body, L-Sit, Dead Hang, Wandsitz, Handstand.',
    explanation:'Mische die Halte, damit nicht eine Muskelgruppe alles tragen muss: zum Beispiel 3 × 60 Sekunden Planke, 3 × 45 Hollow Body, 3 × 30 Dead Hang und den Rest Wandsitz. Kurze Pausen, saubere Positionen.',
    target:600, metric:'hold_total_session', unit:'Sek'
  },
  {
    id:'p94', level:2, cats:[], kind:'manual', minutes:15, icon:'social', title:'Bring einen mit',
    desc:'Nimm jemanden zum Training mit, der sonst nicht in den Park geht. Trag es ein, wenn ihr zusammen trainiert habt.',
    explanation:'Zeig ein einfaches Programm, mit dem die Person Erfolg hat: Australian Rows, Liegestütze an der Bank, Kniebeugen. Kein Klimmzug-Test am ersten Tag.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p95', level:1, cats:[], kind:'manual', minutes:10, icon:'social', title:'Lehrstunde',
    desc:'Bring jemandem eine Übung bei, die er oder sie vorher nicht konnte. Trag es ein, wenn die erste saubere Wiederholung geklappt hat.',
    explanation:'Erklären schult dein eigenes Verständnis. Fang mit der leichtesten Progression an und korrigiere nur eine Sache auf einmal.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p96', level:2, cats:[], kind:'manual', minutes:18, icon:'fun', title:'Würfelspiel',
    desc:'Eine Einheit nach Würfelregel: Jede Übung bekommt eine Zahl von 1 bis 6. Du würfelst, machst die Übung mit Augenzahl mal fünf Wiederholungen und würfelst neu, bis 20 Würfe voll sind. Trag ein, wenn du die 20 Würfe geschafft hast.',
    explanation:'Wähle vorher: 1 Klimmzüge, 2 Liegestütze, 3 Kniebeugen, 4 Dips, 5 Sit-ups, 6 Burpees, oder deine eigene Liste. Der Zufall verteilt die Last unfair, genau das macht es spannend.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p97', level:2, cats:[], kind:'manual', minutes:30, icon:'fun', title:'Songwechsel',
    desc:'Eine Einheit im Musik-Takt: Bei jedem neuen Song wechselt die Übung, ein Satz pro Song, mindestens 30 Minuten lang. Trag ein, wenn du die Einheit durchgezogen hast.',
    explanation:'Playlist auf Zufall stellen und nicht skippen. Lange Songs bedeuten lange Pausen, kurze Songs wenig Erholung, so wird jede Einheit anders.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p98', level:1, cats:[], kind:'manual', minutes:15, icon:'fun', title:'Stille',
    desc:'Eine komplette Einheit ohne Musik, ohne Podcast, ohne Kopfhörer. Trag ein, wenn du sie gemacht hast.',
    explanation:'Nur dein Atem und das Geräusch der Stange. Viele merken erst dann, wie sehr sie sich an Ablenkung gewöhnt haben.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p99', level:2, cats:[], kind:'manual', minutes:18, icon:'fun', title:'Rückwärts',
    desc:'Eine Einheit in umgekehrter Reihenfolge: Beginne mit der Übung, die du sonst zuletzt machst, und ende mit deiner Hauptübung. Trag ein, wenn du die Einheit so durchgezogen hast.',
    explanation:'Deine Hauptübung mit vorermüdeten Muskeln zu machen ist ein neuer Reiz. Erwarte weniger Wiederholungen und ärgere dich nicht darüber.',
    target:1, metric:'manual', unit:'Mal', perDay:false
  },
  {
    id:'p100', level:3, cats:['Core'], kind:'session', minutes:10, icon:'hold', title:'Blindflug',
    desc:'Fünf Minuten Plank gesamt in einer Einheit, jeder Satz mit geschlossenen Augen.',
    explanation:'Ohne Sicht kippt der Körper leichter, die Rumpfmuskulatur muss ständig nachkorrigieren. Sätze von 45 bis 60 Sekunden, Pausen kurz.',
    target:300, metric:'hold_total_session', unit:'Sek', exName:'Plank'
  },
];

// Alle Preset-Felder in activeChallenge.params übernehmen (unit, parts, perDay, maxDur,
// catName, days, beforeHour, afterHour) — wird von allen drei "Annehmen"-Stellen genutzt
// (app3.js, app2.js Katalog-Detail, main2aa.js). Neue Metrik-Parameter NUR hier ergänzen.
function presetParams(ch){
  var p = {target:ch.target, metric:ch.metric, exName:ch.exName};
  if(ch.unit) p.unit = ch.unit;
  if(ch.parts) p.parts = ch.parts;
  if(ch.perDay !== undefined) p.perDay = ch.perDay;
  if(ch.maxDur !== undefined) p.maxDur = ch.maxDur;
  if(ch.catName) p.catName = ch.catName;
  if(ch.days !== undefined) p.days = ch.days;
  if(ch.beforeHour !== undefined) p.beforeHour = ch.beforeHour;
  if(ch.afterHour !== undefined) p.afterHour = ch.afterHour;
  return p;
}

// Geschätzte Minuten pro Einheit (Dauer-Filter + Meta-Zeile im Katalog). Ohne Angabe: 20.
function presetMinutes(ch){
  var m = parseFloat(ch && ch.minutes);
  return m > 0 ? m : 20;
}
function presetMinutesLabel(ch){ return '~'+presetMinutes(ch)+' min'; }

// ── Preset-Metadaten für den Challenge-Katalog (app2.js openChallengeCatalog) ──
// level 1–4, cats aus 'Pull','Push','Core','Legs','Skills' (leer = keine feste Übung),
// kind 'session' | 'days' | 'week' | 'streak' | 'manual' (Check-in per Button). Labels nur hier pflegen.
var PRESET_LEVEL_LABELS = {1:'Leicht', 2:'Mittel', 3:'Schwer', 4:'Extrem'};
var PRESET_KIND_LABELS = {session:'Einheit', days:'Tage', week:'Woche', streak:'Serie', manual:'Check-in'};
var PRESET_CAT_LABELS = {Pull:'Pull', Push:'Push', Core:'Core', Legs:'Beine', Skills:'Skills'};
var PRESET_CATS_EMPTY_LABEL = 'Alle Übungen';
// Anzeige-Namen der EX_DB-Schlüssel (nur fürs Rendern — die Schlüssel bleiben umlautlos)
var PRESET_EX_DISPLAY = {'Klimmzuge':'Klimmzüge', 'Liegestutze':'Liegestütze'};

// Rohe Übungs-Schlüssel eines Presets (exName + parts[].ex, ohne Duplikate).
function presetExerciseKeys(ch){
  // Challenge der Woche: Übungsnamen aus dem Community-Post
  if(ch.exList && ch.exList.length) return ch.exList.slice();
  var keys = [];
  if(ch.exName) keys.push(ch.exName);
  if(ch.parts){
    for(var i=0;i<ch.parts.length;i++){
      var k = ch.parts[i] && ch.parts[i].ex;
      if(k && keys.indexOf(k) < 0) keys.push(k);
    }
  }
  return keys;
}
// Anzeige-Namen (mit Umlauten) der beteiligten Übungen.
function presetExercises(ch){
  return presetExerciseKeys(ch).map(function(k){ return PRESET_EX_DISPLAY[k] || k; });
}
// Einheit fürs Ziel — Presets ohne unit: Serie → Tage, Halteübungen → Sek, sonst Wdh.
function presetUnit(ch){
  if(ch.unit) return ch.unit;
  if(ch.metric === 'streak_days') return 'Tage';
  if(/Hold|Plank/i.test(ch.exName || '')) return 'Sek';
  return 'Wdh';
}
function presetCatLabels(ch){
  var cats = ch.cats || [];
  if(!cats.length) return [PRESET_CATS_EMPTY_LABEL];
  return cats.map(function(c){ return PRESET_CAT_LABELS[c] || c; });
}
function presetLevelLabel(ch){ return PRESET_LEVEL_LABELS[ch.level] || ''; }
function presetKindLabel(ch){ return PRESET_KIND_LABELS[ch.kind] || ''; }

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

      // Icon-Slot: Line-Icon statt Emoji (ch.icon bleibt als Daten-Feld erhalten)
      var icon = document.createElement('span');
      icon.className = 'row-icon';
      icon.innerHTML = (typeof ci === 'function') ? ci('target') : '';

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
          icon: ch.icon, type: 'preset', params: presetParams(ch),
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
