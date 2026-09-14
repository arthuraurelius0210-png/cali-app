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
    id:'p1', level:3, cats:['Pull'], kind:'session', icon:'💯', title:'100 Klimmzüge Challenge', image:'/challenge-p1.jpg',
    desc:'Schaffe 100 Klimmzüge in einer einzigen Einheit. Pause erlaubt, aber kein Verlassen der Stange für mehr als 3 Minuten.',
    explanation:'Verteile die 100 Wdh. auf so viele Sätze wie du brauchst. Ziel: maximale Gesamtmenge. Starte mit deinen stärksten Sätzen.',
    // "in einer einzigen Einheit" → Session-Metrik statt Wochensumme
    target:100, metric:'volume_session_ex', exName:'Klimmzuge', unit:'Wdh'
  },
  {
    id:'p2', level:4, cats:['Pull','Push'], kind:'session', icon:'⏱', title:'1-Minuten Muscle-Up', image:'/challenge-p2.jpg',
    desc:'Schaffe so viele Muscle-Ups wie möglich in 60 Sekunden.',
    explanation:'Starte den Timer, gib alles. Technik ist zweitrangig - Tempo ist alles. Weltrekord liegt bei ~26.',
    target:5, metric:'best_set', exName:'Muscle-Ups'
  },
  {
    id:'p3', level:3, cats:['Pull'], kind:'session', icon:'🔺', title:'Klimmzug Pyramide bis 10', image:'/challenge-p3.jpg',
    desc:'1-2-3-4-5-6-7-8-9-10-9-8-7-6-5-4-3-2-1 Klimmzüge. Keine Pause über 90 Sekunden.',
    explanation:'Insgesamt 100 Wdh. in Pyramidenform. Eine der besten Methoden für Volumen und Ausdauer gleichzeitig.',
    target:100, metric:'volume_exercise', exName:'Klimmzuge'
  },
  {
    id:'p4', level:3, cats:['Push'], kind:'session', icon:'🏋️', title:'Weighted Dips 5x5', image:'/challenge-p4.jpg',
    desc:'5 Sätze je 5 Dips mit Gewichtsgürtel. Steigere das Gewicht jeden Satz.',
    explanation:'Klassisches Kraftprotokoll. Fange leicht an (z.B. 5 kg) und steigere um 2-5 kg pro Satz. Volle ROM!',
    target:25, metric:'volume_exercise', exName:'Dips'
  },
  {
    id:'p5', level:3, cats:['Core'], kind:'session', icon:'🕐', title:'Plank 5 Minuten', image:'/challenge-p5.jpg',
    desc:'Halte die Plank-Position für 5 Minuten am Stück.',
    explanation:'Erlaubt: kurze Positionskorrektur. Nicht erlaubt: Knie auf den Boden. Mentale Stärke ist hier 80% der Übung.',
    target:300, metric:'best_set', exName:'Plank'
  },
  {
    id:'p6', level:1, cats:['Push'], kind:'week', icon:'💥', title:'Explosive Push Week', image:'/challenge-p6.jpg',
    desc:'Mache diese Woche 200 Liegestütze gesamt - verteilt auf beliebig viele Workouts.',
    explanation:'Liegestütze in jedem Workout zählen. Geht schneller als du denkst, wenn du sie in jede Einheit packst.',
    target:200, metric:'volume_exercise', exName:'Liegestutze'
  },
  {
    id:'p7', level:3, cats:['Pull'], kind:'session', icon:'🌙', title:'Tuck Front Lever 30 Sek', image:'/challenge-p7.jpg',
    desc:'Halte den Tuck Front Lever für 30 Sekunden ohne Unterbrechung.',
    explanation:'Baue auf mit 3x10s, dann 2x15s, dann 1x20s. Wenn du 30s schaffst, bist du bereit für den Advanced Tuck.',
    target:30, metric:'best_set', exName:'Tuck Front Lever Hold'
  },
  {
    id:'p8', level:1, cats:[], kind:'streak', icon:'🔥', title:'7-Tage Streak', image:'/challenge-p8.jpg',
    desc:'Trainiere 7 Tage in Folge - jede Einheit zählt, auch kurze.',
    explanation:'Auch 15 Minuten zählen! Der Punkt ist die Gewohnheit. Nutze leichte Tage für Mobilität oder Skills.',
    target:7, metric:'streak_days', exName:''
  },
  // ── Session-, Runden- und Tages-Challenges (Metriken in calcChallengeProgress, app2.js) ──
  // icon ist nur ein Daten-Schlüssel (wird nicht gerendert). unit erscheint hinter der Fortschrittszahl.
  {
    id:'p9', level:2, cats:['Pull','Push','Legs'], kind:'session', icon:'rounds', title:'Zwanzig-Minuten-Zirkel', image:'/challenge-p9.jpg',
    desc:'So viele Runden wie möglich in 20 Minuten: 5 Klimmzüge, 10 Liegestütze, 15 Kniebeugen.',
    explanation:'Timer auf 20 Minuten, dann nur noch Runden zählen. Einsteiger schaffen 8 bis 12 Runden, Fortgeschrittene über 20. Skalieren ist erlaubt: Band-Klimmzüge oder Australian Rows, Liegestütze auf den Knien.',
    target:15, metric:'rounds_in_session', exName:'', unit:'Runden', maxDur:1500,
    parts:[{ex:'Klimmzuge',n:5},{ex:'Liegestutze',n:10},{ex:'Kniebeugen',n:15}]
  },
  {
    id:'p10', level:4, cats:['Pull','Push','Legs'], kind:'session', icon:'volume', title:'Sechshundert', image:'/challenge-p10.jpg',
    desc:'100 Klimmzüge, 200 Liegestütze, 300 Kniebeugen in einer Einheit. Reihenfolge frei, aufteilen erlaubt.',
    explanation:'Der Klassiker unter den Volumen-Tests, im Original noch mit zwei Läufen drumherum. Beliebte Aufteilung: 20 Runden à 5, 10, 15. Rechne mit 45 bis 70 Minuten.',
    target:600, metric:'multi_volume_session', exName:'', unit:'Wdh',
    parts:[{ex:'Klimmzuge',n:100},{ex:'Liegestutze',n:200},{ex:'Kniebeugen',n:300}]
  },
  {
    id:'p11', level:3, cats:['Pull','Push','Core','Legs'], kind:'session', icon:'volume', title:'Vierhundert', image:'/challenge-p11.jpg',
    desc:'100 Klimmzüge, 100 Liegestütze, 100 Sit-ups, 100 Kniebeugen in einer Einheit, Übung für Übung.',
    explanation:'Jede Übung wird komplett abgeschlossen, bevor die nächste beginnt. Die Klimmzüge sind der Flaschenhals, plane sie zuerst.',
    target:400, metric:'multi_volume_session', exName:'', unit:'Wdh',
    parts:[{ex:'Klimmzuge',n:100},{ex:'Liegestutze',n:100},{ex:'Sit-ups',n:100},{ex:'Kniebeugen',n:100}]
  },
  {
    id:'p12', level:4, cats:['Pull','Push','Core','Legs'], kind:'session', icon:'volume', title:'Fünf Runden', image:'/challenge-p12.jpg',
    desc:'5 Runden: 20 Klimmzüge, 30 Liegestütze, 40 Sit-ups, 50 Kniebeugen. Zwischen den Runden genau 3 Minuten Pause.',
    explanation:'Insgesamt 700 Wiederholungen. Die Pause ist Pflicht, nicht Option: sie hält die Qualität der späteren Runden.',
    target:700, metric:'multi_volume_session', exName:'', unit:'Wdh',
    parts:[{ex:'Klimmzuge',n:100},{ex:'Liegestutze',n:150},{ex:'Sit-ups',n:200},{ex:'Kniebeugen',n:250}]
  },
  {
    id:'p13', level:4, cats:['Pull','Push','Legs'], kind:'session', icon:'rounds', title:'Jede Minute, 30 Minuten', image:'/challenge-p13.jpg',
    desc:'Jede Minute auf die Minute: 5 Klimmzüge, 10 Liegestütze, 15 Kniebeugen. 30 Minuten lang.',
    explanation:'Was von der Minute übrig bleibt, ist Pause. Nutze den EMOM-Timer der App im Mix-Modus. Wer 30 Runden schafft, hat 900 Wiederholungen hinter sich.',
    target:30, metric:'rounds_in_session', exName:'', unit:'Runden', maxDur:2100,
    parts:[{ex:'Klimmzuge',n:5},{ex:'Liegestutze',n:10},{ex:'Kniebeugen',n:15}]
  },
  {
    id:'p14', level:2, cats:['Push'], kind:'session', icon:'tempo', title:'Auf und ab', image:'/challenge-p14.jpg',
    desc:'30 Liegestütze in einem Satz nach Tempo: runter auf Kommando, unten halten, hoch auf Kommando. Rund 3:30 Minuten.',
    explanation:'Die Zahl ist nicht der Gegner, die Pausen unten sind es. Ein Satz, kein Absetzen. Wer die Position unten verliert, fängt von vorn an.',
    target:30, metric:'best_set', exName:'Liegestutze', unit:'Wdh'
  },
  {
    id:'p15', level:3, cats:['Push'], kind:'days', icon:'days', title:'Hundert am Tag', image:'/challenge-p15.jpg',
    desc:'30 Tage lang jeden Tag 100 Liegestütze. Verteilen über den Tag ist erlaubt.',
    explanation:'Die bekannteste 30-Tage-Challenge. Trag jeden Tag ein, auch wenn es fünf Sätze à 20 sind. Ein verpasster Tag zählt nicht, die Challenge läuft aber weiter.',
    target:30, metric:'days_with_volume', exName:'Liegestutze', unit:'Tage', perDay:100
  },
  {
    id:'p16', level:2, cats:['Legs'], kind:'days', icon:'days', title:'Kniebeugen-Monat', image:'/challenge-p16.jpg',
    desc:'30 Tage lang jeden Tag 100 Kniebeugen.',
    explanation:'Beine und Ausdauer in einem. Tiefe Kniebeugen, Fersen am Boden. Am Anfang brennt es, ab Tag 10 wird es Routine.',
    target:30, metric:'days_with_volume', exName:'Kniebeugen', unit:'Tage', perDay:100
  },
  {
    id:'p17', level:1, cats:['Core'], kind:'days', icon:'days', title:'Plank-Monat', image:'/challenge-p17.jpg',
    desc:'30 Tage lang jeden Tag mindestens 60 Sekunden Plank, am Stück oder verteilt.',
    explanation:'Wer will, steigert: Woche 1 je 60 Sekunden, Woche 4 je 3 Minuten. Zählen tut die Gesamtzeit pro Tag.',
    target:30, metric:'days_with_volume', exName:'Plank', unit:'Tage', perDay:60
  },
  {
    id:'p18', level:3, cats:[], kind:'session', icon:'volume', title:'Tausend', image:'/challenge-p18.jpg',
    desc:'1000 Wiederholungen in einer Einheit. Alle Übungen mit Wiederholungen zählen, Halteübungen nicht.',
    explanation:'Klassische Aufteilung für eine Übung: 10 Sätze à 30, 10 à 25, 10 à 20, 10 à 15, 10 à 10. Oder mischen, bis die 1000 voll sind.',
    target:1000, metric:'volume_session_ex', exName:'', unit:'Wdh'
  },
  {
    id:'p19', level:2, cats:['Push'], kind:'session', icon:'ladder', title:'Die Leiter', image:'/challenge-p19.jpg',
    desc:'Minute 1: 1 Liegestütz. Minute 2: 2. Minute 3: 3. So weiter, bis die Minute nicht mehr reicht.',
    explanation:'Ziel sind 15 Sprossen, das sind 120 Liegestütze in 15 Minuten. Der EMOM-Timer der App zählt die Minuten für dich.',
    target:120, metric:'volume_session_ex', exName:'Liegestutze', unit:'Wdh'
  },
  {
    id:'p20', level:3, cats:['Push','Core','Legs'], kind:'session', icon:'cards', title:'Kartendeck', image:'/challenge-p20.jpg',
    desc:'52 Karten, vier Farben, vier Übungen: Liegestütze, Kniebeugen, Sit-ups, Burpees. Kartenwert = Wiederholungen.',
    explanation:'Bube 11, Dame 12, König 13, Ass 14. Pro Farbe 104 Wiederholungen, insgesamt 416 in einer Einheit. Karten mischen, ziehen, machen, nächste.',
    target:416, metric:'multi_volume_session', exName:'', unit:'Wdh',
    parts:[{ex:'Liegestutze',n:104},{ex:'Kniebeugen',n:104},{ex:'Sit-ups',n:104},{ex:'Burpees',n:104}]
  },
  {
    id:'p21', level:3, cats:['Push','Core','Legs'], kind:'session', icon:'volume', title:'Hundert Burpees', image:'/challenge-p21.jpg',
    desc:'100 Burpees in einer Einheit, auf Zeit.',
    explanation:'Unter 10 Minuten ist stark, unter 7 ist Elite. Aufteilen in 10er-Blöcke mit kurzem Durchatmen hält das Tempo.',
    target:100, metric:'volume_session_ex', exName:'Burpees', unit:'Wdh'
  },
  {
    id:'p22', level:2, cats:['Push'], kind:'session', icon:'hold', title:'Kopfüber', image:'/challenge-p22.jpg',
    desc:'Handstand an der Wand, 60 Sekunden am Stück.',
    explanation:'Fingerspitzen zur Wand, Körper eine Linie, aktiv aus den Schultern drücken. Baue mit 3 × 20 Sekunden auf, dann 2 × 30, dann eine Minute.',
    target:60, metric:'best_set', exName:'Wall Handstand Hold', unit:'Sek'
  },
];

// Alle Preset-Felder in activeChallenge.params übernehmen (unit, parts, perDay, maxDur) —
// wird von allen drei "Annehmen"-Stellen genutzt (app3.js, app2.js Drawer, main2aa.js).
function presetParams(ch){
  var p = {target:ch.target, metric:ch.metric, exName:ch.exName};
  if(ch.unit) p.unit = ch.unit;
  if(ch.parts) p.parts = ch.parts;
  if(ch.perDay !== undefined) p.perDay = ch.perDay;
  if(ch.maxDur !== undefined) p.maxDur = ch.maxDur;
  return p;
}

// ── Preset-Metadaten für den Challenge-Katalog (app2.js openChallengeCatalog) ──
// level 1–4, cats aus 'Pull','Push','Core','Legs' (leer = keine feste Übung),
// kind 'session' | 'days' | 'week' | 'streak'. Labels nur hier pflegen.
var PRESET_LEVEL_LABELS = {1:'Leicht', 2:'Mittel', 3:'Schwer', 4:'Extrem'};
var PRESET_KIND_LABELS = {session:'Einheit', days:'30 Tage', week:'Woche', streak:'Serie'};
var PRESET_CAT_LABELS = {Pull:'Pull', Push:'Push', Core:'Core', Legs:'Beine'};
var PRESET_CATS_EMPTY_LABEL = 'Alle Übungen';
// Anzeige-Namen der EX_DB-Schlüssel (nur fürs Rendern — die Schlüssel bleiben umlautlos)
var PRESET_EX_DISPLAY = {'Klimmzuge':'Klimmzüge', 'Liegestutze':'Liegestütze'};

// Rohe Übungs-Schlüssel eines Presets (exName + parts[].ex, ohne Duplikate).
function presetExerciseKeys(ch){
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
