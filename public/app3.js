// ── COMMUNITY DRAWER ──────────────────────────────────────
function buildDrawerCommunity(el){
  var hdrRow = document.createElement('div');
  hdrRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;';
  var hdr = document.createElement('div');
  hdr.style.cssText = 'font-size:9px;letter-spacing:3px;color:#4ECDC4;font-weight:700;';
  hdr.textContent = 'COMMUNITY CHALLENGES';
  var postBtn = document.createElement('button');
  postBtn.style.cssText = 'background:rgba(78,205,196,0.1);color:#4ECDC4;border:1px solid rgba(78,205,196,0.3);border-radius:8px;font-family:inherit;font-size:10px;letter-spacing:2px;padding:7px 12px;cursor:pointer;';
  postBtn.textContent = '+ POSTEN';
  postBtn.onclick = function(){ closeChDrawer(); setTimeout(showCommPostModal, 300); };
  hdrRow.appendChild(hdr);
  hdrRow.appendChild(postBtn);
  el.appendChild(hdrRow);

  var feedWrap = document.createElement('div');
  feedWrap.id = 'comm-feed-drawer';
  feedWrap.innerHTML = '<div style="text-align:center;padding:20px 0;font-size:12px;color:var(--muted);">Wird geladen...</div>';
  el.appendChild(feedWrap);

  // Load feed into drawer
  if(!currentUser){
    feedWrap.innerHTML = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center;font-size:12px;color:var(--muted);">Einloggen um Community Challenges zu sehen.</div>';
    return;
  }
  db.collection('communityChallenges').orderBy('createdAt','desc').limit(20).get()
    .then(function(snap){
      feedWrap.innerHTML = '';
      if(snap.empty){
        feedWrap.innerHTML = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center;"><div style="font-size:22px;margin-bottom:8px;">\uD83C\uDFC6</div><div style="font-size:12px;color:var(--muted);">Noch keine Community Challenges. Sei der Erste!</div></div>';
        return;
      }
      snap.forEach(function(doc){ feedWrap.appendChild(buildCommCard(doc.id, doc.data())); });
    })
    .catch(function(){ feedWrap.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:12px 0;">Fehler beim Laden.</div>'; });
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
  box.style.cssText = 'background:'+(done?'rgba(200,240,74,0.08)':'#101010')+';border:1px solid '+(done?'rgba(200,240,74,0.3)':'#1e1e1e')+';border-radius:12px;padding:14px 16px;margin-bottom:12px;cursor:pointer;';
  box.onclick = function(){ goPage('ch'); };

  var row = document.createElement('div');
  row.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px;';

  var icon = document.createElement('span');
  icon.style.cssText = 'font-size:20px;';
  icon.textContent = activeChallenge.icon;

  var txt = document.createElement('div');
  txt.style.cssText = 'flex:1;';
  var t1 = document.createElement('div');
  t1.style.cssText = 'font-family:inherit;font-size:14px;letter-spacing:1px;color:var(--text);';
  t1.textContent = activeChallenge.title;
  var t2 = document.createElement('div');
  t2.style.cssText = 'font-size:11px;color:#666;margin-top:2px;';
  t2.textContent = prog+' / '+target+' ('+pct+'%)';
  txt.appendChild(t1);
  txt.appendChild(t2);

  var arr = document.createElement('div');
  arr.style.cssText = 'color:var(--muted);font-size:14px;';
  arr.textContent = done ? '\u2713' : '\u203A';

  row.appendChild(icon);
  row.appendChild(txt);
  row.appendChild(arr);

  var bar = document.createElement('div');
  bar.style.cssText = 'background:var(--bg3);border-radius:20px;height:4px;overflow:hidden;';
  var fill = document.createElement('div');
  fill.style.cssText = 'height:100%;border-radius:20px;background:'+(done?'var(--accent)':'#2a4a00')+';width:'+pct+'%;';
  bar.appendChild(fill);

  box.appendChild(row);
  box.appendChild(bar);
  el.appendChild(box);
}


// ---- PRESET CHALLENGES ----
var PRESET_CHALLENGES = [
  {
    id:'p1', icon:'\uD83D\uDCAF', title:'100 Klimmzuge Challenge',
    desc:'Schaffe 100 Klimmzuge in einer einzigen Einheit. Pause erlaubt, aber kein Verlassen der Stange fur mehr als 3 Minuten.',
    explanation:'Verteile die 100 Wdh auf so viele Satze wie du brauchst. Ziel: maximale Gesamtmenge. Starte mit deinen starksten Satzen.',
    target:100, metric:'session_total', exName:'Klimmzuge'
  },
  {
    id:'p2', icon:'\u23F1', title:'1-Minuten Muscle-Up',
    desc:'Schaffe so viele Muscle-Ups wie moglich in 60 Sekunden.',
    explanation:'Starte den Timer, gib alles. Technik ist zweitrangig - Tempo ist alles. Weltrekord liegt bei ~26.',
    target:5, metric:'session_best', exName:'Muscle-Ups'
  },
  {
    id:'p3', icon:'\uD83D\uDD3A', title:'Klimmzug Pyramide bis 10',
    desc:'1-2-3-4-5-6-7-8-9-10-9-8-7-6-5-4-3-2-1 Klimmzuge. Keine Pause uber 90 Sekunden.',
    explanation:'Insgesamt 100 Wdh in Pyramidenform. Eine der besten Methoden fur Volumen und Ausdauer gleichzeitig.',
    target:100, metric:'session_total', exName:'Klimmzuge'
  },
  {
    id:'p4', icon:'\uD83C\uDFCB?', title:'Weighted Dips 5x5',
    desc:'5 Satze je 5 Dips mit Gewichtsgurtel. Steigere das Gewicht jeden Satz.',
    explanation:'Klassisches Kraftprotokoll. Fange leicht an (z.B. 5kg) und steigere um 2-5kg pro Satz. Volle ROM!',
    target:25, metric:'session_total', exName:'Dips'
  },
  {
    id:'p5', icon:'\uD83D\uDD50', title:'Plank 5 Minuten',
    desc:'Halte die Plank-Position fur 5 Minuten am Stuck.',
    explanation:'Erlaubt: kurze Positionskorrektur. Nicht erlaubt: Knie auf den Boden. Mentale Starke ist hier 80% der Ubung.',
    target:300, metric:'session_single', exName:'Plank'
  },
  {
    id:'p6', icon:'\uD83D\uDCA5', title:'Explosive Push Week',
    desc:'Mache diese Woche 200 Liegestutze gesamt - verteilt auf beliebig viele Workouts.',
    explanation:'Liegestutze in jedem Workout zahlen. Geht schneller als du denkst wenn du sie in jede Einheit packst.',
    target:200, metric:'week_total', exName:'Liegestutze'
  },
  {
    id:'p7', icon:'\uD83C\uDF19', title:'Tuck Front Lever 30 Sek',
    desc:'Halte den Tuck Front Lever fur 30 Sekunden ohne Unterbrechung.',
    explanation:'Baue auf mit 3x10s, dann 2x15s, dann 1x20s. Wenn du 30s schaffst, bist du bereit fur den Advanced Tuck.',
    target:30, metric:'session_single', exName:'Tuck Front Lever Hold'
  },
  {
    id:'p8', icon:'\uD83D\uDD25', title:'7-Tage Streak',
    desc:'Trainiere 7 Tage in Folge - jede Einheit zahlt, auch kurze.',
    explanation:'Auch 15 Minuten zahlen! Der Punkt ist die Gewohnheit. Nutze leichte Tage fur Mobilitat oder Skills.',
    target:7, metric:'streak_days', exName:''
  },
];

var showPresets = false;

// ---- PRESET CHALLENGES ----
var PRESET_CHALLENGES = [
  {
    id:'p1', icon:'\uD83D\uDCAF', title:'100 Klimmzuge Challenge',
    desc:'Schaffe 100 Klimmzuge in einer einzigen Einheit. Pause erlaubt, aber kein Verlassen der Stange fur mehr als 3 Minuten.',
    explanation:'Verteile die 100 Wdh auf so viele Satze wie du brauchst. Ziel: maximale Gesamtmenge. Starte mit deinen starksten Satzen.',
    target:100, metric:'session_total', exName:'Klimmzuge'
  },
  {
    id:'p2', icon:'\u23F1', title:'1-Minuten Muscle-Up',
    desc:'Schaffe so viele Muscle-Ups wie moglich in 60 Sekunden.',
    explanation:'Starte den Timer, gib alles. Technik ist zweitrangig - Tempo ist alles. Weltrekord liegt bei ~26.',
    target:5, metric:'session_best', exName:'Muscle-Ups'
  },
  {
    id:'p3', icon:'\uD83D\uDD3A', title:'Klimmzug Pyramide bis 10',
    desc:'1-2-3-4-5-6-7-8-9-10-9-8-7-6-5-4-3-2-1 Klimmzuge. Keine Pause uber 90 Sekunden.',
    explanation:'Insgesamt 100 Wdh in Pyramidenform. Eine der besten Methoden fur Volumen und Ausdauer gleichzeitig.',
    target:100, metric:'session_total', exName:'Klimmzuge'
  },
  {
    id:'p4', icon:'\uD83C\uDFCB?', title:'Weighted Dips 5x5',
    desc:'5 Satze je 5 Dips mit Gewichtsgurtel. Steigere das Gewicht jeden Satz.',
    explanation:'Klassisches Kraftprotokoll. Fange leicht an (z.B. 5kg) und steigere um 2-5kg pro Satz. Volle ROM!',
    target:25, metric:'session_total', exName:'Dips'
  },
  {
    id:'p5', icon:'\uD83D\uDD50', title:'Plank 5 Minuten',
    desc:'Halte die Plank-Position fur 5 Minuten am Stuck.',
    explanation:'Erlaubt: kurze Positionskorrektur. Nicht erlaubt: Knie auf den Boden. Mentale Starke ist hier 80% der Ubung.',
    target:300, metric:'session_single', exName:'Plank'
  },
  {
    id:'p6', icon:'\uD83D\uDCA5', title:'Explosive Push Week',
    desc:'Mache diese Woche 200 Liegestutze gesamt - verteilt auf beliebig viele Workouts.',
    explanation:'Liegestutze in jedem Workout zahlen. Geht schneller als du denkst wenn du sie in jede Einheit packst.',
    target:200, metric:'week_total', exName:'Liegestutze'
  },
  {
    id:'p7', icon:'\uD83C\uDF19', title:'Tuck Front Lever 30 Sek',
    desc:'Halte den Tuck Front Lever fur 30 Sekunden ohne Unterbrechung.',
    explanation:'Baue auf mit 3x10s, dann 2x15s, dann 1x20s. Wenn du 30s schaffst, bist du bereit fur den Advanced Tuck.',
    target:30, metric:'session_single', exName:'Tuck Front Lever Hold'
  },
  {
    id:'p8', icon:'\uD83D\uDD25', title:'7-Tage Streak',
    desc:'Trainiere 7 Tage in Folge - jede Einheit zahlt, auch kurze.',
    explanation:'Auch 15 Minuten zahlen! Der Punkt ist die Gewohnheit. Nutze leichte Tage fur Mobilitat oder Skills.',
    target:7, metric:'streak_days', exName:''
  },
];

var showPresets = false;

function buildChallengePresets(){
  var el = document.getElementById('challenge-presets');
  if(!el) return;
  el.innerHTML = '';

  var title = document.createElement('div');
  title.style.cssText = 'font-size:9px;letter-spacing:3px;color:var(--accent);font-family:inherit;margin-bottom:10px;';
  title.textContent = 'VORGEFERTIGTE CHALLENGES';
  el.appendChild(title);

  for(var i=0;i<PRESET_CHALLENGES.length;i++){
    (function(ch){
      var card = document.createElement('div');
      card.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:8px;';

      var top = document.createElement('div');
      top.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:6px;';

      var icon = document.createElement('span');
      icon.style.cssText = 'font-size:22px;';
      icon.textContent = ch.icon;

      var info = document.createElement('div');
      info.style.cssText = 'flex:1;';

      var t = document.createElement('div');
      t.style.cssText = 'font-family:inherit;font-size:15px;letter-spacing:1px;color:var(--text);';
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
      btn.style.cssText = 'background:rgba(255,85,0,0.08);color:var(--accent);border:1px solid rgba(255,85,0,0.3);border-radius:8px;font-family:inherit;font-size:12px;letter-spacing:2px;padding:9px;cursor:pointer;width:100%;margin-top:10px;';
      btn.textContent = 'CHALLENGE ANNEHMEN';
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