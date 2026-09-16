// ── CHALLENGE DER WOCHE ───────────────────────────────────
// Jeder Community-Post sammelt ab dem Posten 7 Tage lang Likes (likedAt-Zeitstempel,
// ältere Likes ohne Zeitstempel zählen voll). Eine Kalenderwoche (Mo–So, lokale Zeit)
// wird wertbar, sobald alle ihre Posts ihre 7 Tage hinter sich haben, also ab dem Montag
// der übernächsten Woche. Im Admin-Panel (Tab "Woche") nimmt der Admin einen der drei
// meistgelikten Posts in den offiziellen Katalog auf oder überspringt die Woche.
// Aufgenommene Challenges liegen als fertige Katalog-Einträge in featuredChallenges/{KW}
// und werden nach dem Login an PRESET_CHALLENGES angehängt (Firestore-Regeln: nur der
// Admin schreibt, eingeloggte Nutzer lesen).

var WEEKLY_DAY_MS = 86400000;
var WEEKLY_LIKE_WINDOW_MS = 7 * WEEKLY_DAY_MS;
var WEEKLY_METRICS = ['manual', 'workouts_this_week', 'streak_days'];
var FEATURED_CHALLENGES = [];
var _featuredLoaded = false, _featuredLoading = false, _featuredWaiters = [];

// Montag 00:00 (lokal) der Woche von d
function weeklyMonday(d){
  var m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var dow = m.getDay();
  m.setDate(m.getDate() - (dow === 0 ? 6 : dow - 1));
  return m;
}
// ISO-Kalenderwoche als '2026-W38'
function weeklyKey(d){
  var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  var dn = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dn);
  var y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  var wk = Math.ceil(((t - y0) / WEEKLY_DAY_MS + 1) / 7);
  return t.getUTCFullYear() + '-W' + (wk < 10 ? '0' : '') + wk;
}
function weeklyLikes(n){ return n === 1 ? '1 Like' : n + ' Likes'; }
function weeklyNum(key){ return parseInt(String(key || '').split('-W')[1], 10) || 0; }
function weeklyAddDays(d, n){ var r = new Date(d); r.setDate(r.getDate() + n); return r; }
function weeklyFmt(d){ return (d.getDate() < 10 ? '0' : '') + d.getDate() + '.' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '.'; }

// Likes innerhalb der ersten 7 Tage nach dem Posten
function weeklyLikeScore(post){
  var likes = post.likes || [];
  var created = Date.parse(post.createdAt);
  if(isNaN(created)) return likes.length;
  var limit = created + WEEKLY_LIKE_WINDOW_MS;
  var at = post.likedAt || {};
  var n = 0;
  for(var i = 0; i < likes.length; i++){
    var t = at[likes[i]];
    if(!t){ n++; continue; }
    var ms = typeof t.toMillis === 'function' ? t.toMillis() : Date.parse(t);
    if(isNaN(ms) || ms <= limit) n++;
  }
  return n;
}

// ── Community-Post → Katalog-Eintrag ──
function weeklyLevel(stars){
  var s = parseInt(stars, 10) || 3;
  return s <= 2 ? 1 : (s === 3 ? 2 : (s === 4 ? 3 : 4));
}
function weeklyNorm(s){
  return typeof chCatalogNorm === 'function' ? chCatalogNorm(s) : String(s || '').toLowerCase();
}
function weeklyCats(exercises){
  var cats = [];
  if(typeof EX_DB === 'undefined') return cats;
  (exercises || []).forEach(function(ex){
    var name = weeklyNorm(ex && ex.name);
    if(!name) return;
    for(var i = 0; i < EX_DB.length; i++){
      var n = weeklyNorm(EX_DB[i].name);
      if(n === name || n.indexOf(name) === 0 || name.indexOf(n) === 0){
        var c = EX_DB[i].cat;
        if(['Pull', 'Push', 'Core', 'Legs', 'Skills'].indexOf(c) > -1 && cats.indexOf(c) < 0) cats.push(c);
        break;
      }
    }
  });
  return cats;
}
function weeklyMinutes(post){
  var tp = post.typeParams || {};
  if(post.type === 'timed' && tp.minutes > 0) return Math.max(1, Math.min(120, tp.minutes));
  var sec = 0;
  (post.exercises || []).forEach(function(ex){
    var sets = parseInt(ex && ex.sets, 10) || 1;
    var reps = parseInt(ex && ex.reps, 10) || 10;
    var rest = parseInt(ex && ex.rest, 10);
    if(isNaN(rest)) rest = 60;
    sec += sets * (reps * 3 + rest);
  });
  if(!sec) return 15;
  return Math.max(5, Math.min(90, Math.round(sec / 60)));
}
// Messbar, wo der Post-Typ es hergibt; sonst Abhaken wie beim "Ausprobieren" im Feed
function weeklyGoal(post){
  var tp = post.typeParams || {};
  if(post.type === 'weekly' && tp.days > 0) return {kind: 'week', metric: 'workouts_this_week', target: tp.days, unit: 'Einheiten'};
  if(post.type === 'streak' && tp.streakDays > 0) return {kind: 'streak', metric: 'streak_days', target: tp.streakDays, unit: 'Tage'};
  return {kind: 'manual', metric: 'manual', target: 1, unit: 'Mal'};
}
function weeklyExplanation(post){
  var parts = (post.exercises || []).filter(function(ex){ return ex && ex.name; }).map(function(ex){
    var s = (parseInt(ex.sets, 10) || 1) + ' × ' + (parseInt(ex.reps, 10) || 0) + ' ' + ex.name;
    var rest = parseInt(ex.rest, 10);
    if(rest > 0) s += ', ' + rest + ' s Pause';
    if(ex.notes) s += ' (' + String(ex.notes).slice(0, 60) + ')';
    return s;
  });
  var tp = post.typeParams || {};
  var head = (post.type === 'timed' && tp.minutes > 0) ? 'Zeitlimit ' + tp.minutes + ' Minuten. ' : '';
  return head + (parts.length ? parts.join(' · ') : 'Freie Challenge, Ablauf wie beschrieben.');
}
function weeklyFeaturedDoc(post, sourceId, weekKey, score){
  var goal = weeklyGoal(post);
  return {
    week: weekKey, status: 'approved', sourceId: sourceId,
    title: String(post.title || '').slice(0, 80),
    desc: String(post.desc || '').slice(0, 400),
    explanation: weeklyExplanation(post).slice(0, 500),
    level: weeklyLevel(post.difficulty), cats: weeklyCats(post.exercises),
    kind: goal.kind, minutes: weeklyMinutes(post),
    metric: goal.metric, target: goal.target, unit: goal.unit,
    exercises: (post.exercises || []).map(function(ex){ return String(ex && ex.name || ''); }).filter(Boolean).slice(0, 12),
    authorUid: post.uid || '', authorName: post.authorName || 'Athlet',
    likes: score,
    decidedAt: new Date().toISOString(),
    decidedBy: (currentUser && currentUser.uid) || ''
  };
}
function weeklyPresetFromDoc(id, d){
  var metric = WEEKLY_METRICS.indexOf(d.metric) > -1 ? d.metric : 'manual';
  return {
    id: 'feat_' + id, featured: true, week: d.week || id,
    author: d.authorName || 'Athlet', authorUid: d.authorUid || '', sourceId: d.sourceId || '',
    level: d.level || 2, cats: d.cats || [], kind: d.kind || 'manual', minutes: d.minutes || 15,
    icon: 'community',
    title: d.title || 'Challenge der Woche', desc: d.desc || '', explanation: d.explanation || '',
    target: metric === 'manual' ? 1 : (d.target || 1), metric: metric, unit: d.unit || 'Mal',
    exList: d.exercises || []
  };
}

// ── Laden und in den Katalog hängen ──
function weeklyFlush(changed){
  var w = _featuredWaiters; _featuredWaiters = [];
  w.forEach(function(f){ try{ f(changed); }catch(e){} });
}
function loadFeaturedChallenges(cb, force){
  if(cb) _featuredWaiters.push(cb);
  if(typeof db === 'undefined' || !db || !currentUser){ weeklyFlush(false); return; }
  if(_featuredLoaded && !force){ weeklyFlush(false); return; }
  if(_featuredLoading) return;
  _featuredLoading = true;
  db.collection('featuredChallenges').get().then(function(snap){
    var docs = [];
    snap.forEach(function(doc){ var d = doc.data(); if(d && d.status === 'approved') docs.push({id: doc.id, d: d}); });
    docs.sort(function(a, b){ return String(a.d.week || a.id) < String(b.d.week || b.id) ? -1 : 1; });
    for(var i = PRESET_CHALLENGES.length - 1; i >= 0; i--){ if(PRESET_CHALLENGES[i].featured) PRESET_CHALLENGES.splice(i, 1); }
    FEATURED_CHALLENGES = docs.map(function(x){ return weeklyPresetFromDoc(x.id, x.d); });
    FEATURED_CHALLENGES.forEach(function(p){ PRESET_CHALLENGES.push(p); });
    _featuredLoaded = true; _featuredLoading = false;
    weeklyFlush(true);
  }).catch(function(){ _featuredLoading = false; weeklyFlush(false); });
}
function newestFeaturedChallenge(){
  return FEATURED_CHALLENGES.length ? FEATURED_CHALLENGES[FEATURED_CHALLENGES.length - 1] : null;
}

// ── Admin-Tab "Woche" ──
function renderWeeklyAdmin(el){
  el.innerHTML = '<div class="empty">Lädt…</div>';
  if(typeof db === 'undefined' || !db || !currentUser){ el.innerHTML = '<div class="empty">Nur eingeloggt verfügbar</div>'; return; }
  var now = new Date();
  var since = weeklyAddDays(weeklyMonday(now), -56);
  Promise.all([
    db.collection('communityChallenges').where('createdAt', '>=', since.toISOString()).get(),
    db.collection('featuredChallenges').get()
  ]).then(function(res){
    var decided = {}, featuredSources = {}, approved = [];
    res[1].forEach(function(doc){
      var d = doc.data();
      decided[doc.id] = d;
      if(d.status === 'approved'){ approved.push({id: doc.id, d: d}); if(d.sourceId) featuredSources[d.sourceId] = true; }
    });
    var weeks = {};
    res[0].forEach(function(doc){
      var d = doc.data();
      var t = Date.parse(d.createdAt);
      if(isNaN(t) || t > now.getTime() + WEEKLY_DAY_MS) return;
      if(featuredSources[doc.id]) return;
      var mon = weeklyMonday(new Date(t)), key = weeklyKey(mon);
      if(!weeks[key]) weeks[key] = {key: key, monday: mon, posts: []};
      weeks[key].posts.push({id: doc.id, d: d, score: weeklyLikeScore(d)});
    });
    Object.keys(weeks).forEach(function(k){
      weeks[k].posts.sort(function(a, b){ return (b.score - a.score) || (Date.parse(a.d.createdAt) - Date.parse(b.d.createdAt)); });
    });
    var keys = Object.keys(weeks).sort().reverse();
    var ready = keys.filter(function(k){ return now >= weeklyAddDays(weeks[k].monday, 14) && !decided[k]; });
    var running = keys.filter(function(k){ return now < weeklyAddDays(weeks[k].monday, 14); });

    el.innerHTML = '';
    var rerender = function(){ renderWeeklyAdmin(el); };
    var intro = document.createElement('div');
    intro.className = 'row-sub';
    intro.style.cssText = 'margin:0 0 14px;line-height:1.5;';
    intro.textContent = 'Jeder Post sammelt 7 Tage Likes. Eine Woche kann gewertet werden, sobald alle ihre Posts diese 7 Tage hinter sich haben.';
    el.appendChild(intro);

    weeklySection(el, 'Zur Entscheidung');
    if(!ready.length) weeklyEmpty(el, 'Gerade keine Woche offen');
    ready.forEach(function(k){
      var wk = weeks[k];
      weeklyWeekHead(el, wk, wk.posts.length + ' Posts');
      wk.posts.slice(0, 3).forEach(function(p, i){
        el.appendChild(weeklyCandidateCard(p, i, function(btn){
          btn.disabled = true;
          db.collection('featuredChallenges').doc(k).set(weeklyFeaturedDoc(p.d, p.id, k, p.score)).then(function(){
            toast('In den Katalog aufgenommen');
            loadFeaturedChallenges(null, true);
            rerender();
          }).catch(function(){ btn.disabled = false; toast('Speichern fehlgeschlagen'); });
        }));
      });
      var skip = document.createElement('button');
      skip.type = 'button';
      skip.className = 'btn-g sm pressable';
      skip.style.cssText = 'margin:0 0 18px;';
      skip.textContent = 'Woche überspringen';
      skip.onclick = function(){
        skip.disabled = true;
        db.collection('featuredChallenges').doc(k).set({week: k, status: 'skipped', decidedAt: new Date().toISOString(), decidedBy: currentUser.uid})
          .then(rerender).catch(function(){ skip.disabled = false; toast('Speichern fehlgeschlagen'); });
      };
      el.appendChild(skip);
    });

    weeklySection(el, 'Läuft gerade');
    if(!running.length) weeklyEmpty(el, 'Noch keine Posts in den laufenden Wochen');
    running.forEach(function(k){
      var wk = weeks[k];
      weeklyWeekHead(el, wk, 'Wertung ab ' + weeklyFmt(weeklyAddDays(wk.monday, 14)));
      var lead = wk.posts[0];
      var row = document.createElement('div');
      row.className = 'row-sub';
      row.style.cssText = 'margin:0 0 14px;';
      row.textContent = 'Vorne: ' + (lead.d.title || '') + ' (' + weeklyLikes(lead.score) + ')';
      el.appendChild(row);
    });

    weeklySection(el, 'Aufgenommen');
    if(!approved.length) weeklyEmpty(el, 'Noch keine Challenge der Woche');
    approved.sort(function(a, b){ return a.id < b.id ? 1 : -1; }).forEach(function(x){
      var card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = 'margin-bottom:8px;';
      var lbl = document.createElement('div');
      lbl.className = 'lbl';
      lbl.textContent = 'KW ' + weeklyNum(x.id) + ' · ' + weeklyLikes(x.d.likes || 0);
      var t = document.createElement('div');
      t.className = 'row-title';
      t.style.cssText = 'white-space:normal;margin:4px 0 2px;';
      t.textContent = x.d.title || '';
      var a = document.createElement('div');
      a.className = 'row-sub';
      a.style.cssText = 'margin:0 0 10px;';
      a.textContent = 'von ' + (x.d.authorName || 'Athlet');
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'btn-g sm pressable';
      rm.textContent = 'Aus dem Katalog nehmen';
      rm.onclick = function(){
        var doRemove = function(){
          db.collection('featuredChallenges').doc(x.id).update({status: 'removed', decidedAt: new Date().toISOString()})
            .then(function(){ loadFeaturedChallenges(null, true); rerender(); })
            .catch(function(){ toast('Speichern fehlgeschlagen'); });
        };
        if(typeof confirmSheet === 'function'){
          confirmSheet({title: 'Aus dem Katalog nehmen?', desc: '„' + (x.d.title || '') + '“ verschwindet aus den Challenges. Wer sie gerade macht, kann sie zu Ende bringen.', confirmLabel: 'Entfernen', danger: true, onConfirm: doRemove});
        } else if(confirm('Aus dem Katalog nehmen?')){ doRemove(); }
      };
      card.appendChild(lbl); card.appendChild(t); card.appendChild(a); card.appendChild(rm);
      el.appendChild(card);
    });
  }).catch(function(){ el.innerHTML = '<div class="empty">Laden fehlgeschlagen</div>'; });
}
function weeklySection(el, text){
  var h = document.createElement('div');
  h.className = 'eyebrow';
  h.style.cssText = 'margin:6px 0 10px;';
  h.textContent = text;
  el.appendChild(h);
}
function weeklyEmpty(el, text){
  var e = document.createElement('div');
  e.className = 'row-sub';
  e.style.cssText = 'margin:0 0 18px;';
  e.textContent = text;
  el.appendChild(e);
}
function weeklyWeekHead(el, wk, right){
  var h = document.createElement('div');
  h.className = 'lbl';
  h.style.cssText = 'margin:0 0 8px;';
  h.textContent = 'KW ' + weeklyNum(wk.key) + ' · ' + weeklyFmt(wk.monday) + '–' + weeklyFmt(weeklyAddDays(wk.monday, 6)) + ' · ' + right;
  el.appendChild(h);
}
function weeklyCandidateCard(p, rank, onApprove){
  var card = document.createElement('div');
  card.className = 'card';
  card.style.cssText = 'margin-bottom:8px;';
  var lbl = document.createElement('div');
  lbl.className = 'lbl';
  var stars = parseInt(p.d.difficulty, 10) || 3;
  lbl.textContent = (rank + 1) + '. Platz · ' + weeklyLikes(p.score) + ' · ' + '★'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars));
  var t = document.createElement('div');
  t.className = 'row-title';
  t.style.cssText = 'white-space:normal;margin:4px 0 2px;';
  t.textContent = p.d.title || '';
  var a = document.createElement('div');
  a.className = 'row-sub';
  a.style.cssText = 'margin:0 0 6px;';
  a.textContent = 'von ' + (p.d.authorName || 'Athlet');
  var d = document.createElement('div');
  d.className = 'row-sub';
  d.style.cssText = 'margin:0 0 10px;line-height:1.5;color:var(--text);';
  d.textContent = String(p.d.desc || '').slice(0, 220);
  card.appendChild(lbl); card.appendChild(t); card.appendChild(a); card.appendChild(d);
  if(p.d.videoUrl){
    var v = document.createElement('a');
    v.href = p.d.videoUrl; v.target = '_blank'; v.rel = 'noopener';
    v.className = 'u';
    v.style.cssText = 'display:inline-block;font-size:10px;font-weight:600;color:var(--accent);margin:0 0 10px;';
    v.textContent = 'Video ansehen ›';
    card.appendChild(v);
  }
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn sec sm pressable';
  btn.style.cssText = 'display:block;margin:0;';
  btn.textContent = 'In den Katalog aufnehmen';
  btn.onclick = function(){ onApprove(btn); };
  card.appendChild(btn);
  return card;
}
