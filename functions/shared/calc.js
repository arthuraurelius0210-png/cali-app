// ══════════════════════════════════════════════════════════
// CALC.JS — Challenge-Fortschritt (geteilt zwischen App und Cloud Functions)
// Reine Funktionen ohne DOM/Globals: caliCalcProgress(challenge, data, opts)
//   data = {ents, maxEntries, exdb, savedParks}, opts = {now}
// Der Browser ruft sie über calcChallengeProgress() (app2.js) mit den globalen Daten,
// der Server (functions/lib/rewards.js) mit dem users-Dokument, um Belohnungen zu prüfen.
// functions/sync-shared.js kopiert die Datei vor jedem Deploy nach functions/shared/.
// ══════════════════════════════════════════════════════════
// 'Min:Sek' → Sekunden, sonst parseFloat.
function parseMaxVal(raw, unit){
  if(unit==='Min:Sek' && String(raw).indexOf(':')>-1){
    var pts = String(raw).split(':');
    return (parseInt(pts[0],10)||0)*60 + (parseInt(pts[1],10)||0);
  }
  return parseFloat(raw)||0;
}

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

function caliCalcProgress(activeChallenge, data, opts){
  data = data || {}; opts = opts || {};
  var ents = data.ents || [], maxEntries = data.maxEntries || [], EX_DB = data.exdb || [];
  if(!activeChallenge) return 0;
  var p = activeChallenge.params || {};
  var metric = p.metric;
  var now = opts.now ? new Date(opts.now) : new Date();
  var weekStart = new Date(now);
  // Montags-Wochenstart — konsistent mit getWeeklyProgress (main2ab.js)
  var dow = now.getDay();
  weekStart.setDate(now.getDate() - (dow===0?6:dow-1));
  var weekStr = weekStart.toISOString().slice(0,10);
  var sinceStr = activeChallenge.startDate || weekStr;

  // Helfer für die Metrik-Berechnung
  function setSum(e){ var t=0,s=e.sets||[]; for(var k=0;k<s.length;k++){ t+=parseFloat(s[k].n)||0; } return t; }
  function nameMatches(n, exName){ if(!exName) return false; return n===exName || n.indexOf(exName)===0; }
  function exCat(n){ for(var k=0;k<EX_DB.length;k++){ if(EX_DB[k].name===n) return EX_DB[k].cat||''; } return ''; }
  function sessionKey(e){ return e.woId || (e.date+'_x'); }

  if(metric==='workouts_this_week'){
    var dates={};
    for(var i=0;i<ents.length;i++){if(ents[i].date>=weekStr)dates[ents[i].date]=true;}
    return Object.keys(dates).length;
  }
  if(metric==='volume_exercise'){
    // nameMatches statt ===: exName 'Klimmzuge' muss auch 'Klimmzuge (schulterbreit)' zählen
    var total=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && nameMatches(ents[i].name, p.exName)){
        total+=setSum(ents[i]);
      }
    }
    return Math.round(total);
  }
  if(metric==='best_set'){
    var best=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && nameMatches(ents[i].name, p.exName)){
        for(var k=0;k<ents[i].sets.length;k++){var v=parseFloat(ents[i].sets[k].n)||0;if(v>best)best=v;}
      }
    }
    return best;
  }
  if(metric==='new_exercise'){
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && nameMatches(ents[i].name, p.exName)) return 1;
    }
    return 0;
  }
  if(metric==='category_workouts'){
    var days={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<weekStr) continue;
      for(var k=0;k<EX_DB.length;k++){
        if(EX_DB[k].name===ents[i].name && EX_DB[k].cat===p.catName){
          days[ents[i].date]=true; break;
        }
      }
    }
    return Object.keys(days).length;
  }
  if(metric==='streak_days'){
    var dates2=[];
    for(var i=0;i<ents.length;i++){
      if(dates2.indexOf(ents[i].date)===-1) dates2.push(ents[i].date);
    }
    dates2.sort();
    var streak=1; var maxS=1;
    for(var i=1;i<dates2.length;i++){
      var prev=new Date(dates2[i-1]); var curr=new Date(dates2[i]);
      var diff=(curr-prev)/(1000*60*60*24);
      if(diff===1){streak++;if(streak>maxS)maxS=streak;}else{streak=1;}
    }
    return maxS;
  }
  if(metric==='pyramid_count'){
    var cnt=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && ents[i].name.indexOf('Pyramide')>-1) cnt++;
    }
    return cnt;
  }

  // ── Metriken der generierten CHALLENGE_TEMPLATES ──
  // (waren bislang unbehandelt → Fortschritt blieb dauerhaft 0)
  if(metric==='new_exercises_week'){
    // Übungen, deren allererstes Vorkommen in diese Woche fällt
    var firstSeen={};
    for(var i=0;i<ents.length;i++){
      var nm=ents[i].name;
      if(firstSeen[nm]===undefined || ents[i].date<firstSeen[nm]) firstSeen[nm]=ents[i].date;
    }
    var newCnt=0;
    for(var key1 in firstSeen){ if(firstSeen.hasOwnProperty(key1) && firstSeen[key1]>=weekStr) newCnt++; }
    return newCnt;
  }
  if(metric==='categories_this_week'){
    // Pull, Push und Core diese Woche trainiert
    var catsSeen={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<weekStr) continue;
      var c1=exCat(ents[i].name);
      if(c1==='Pull'||c1==='Push'||c1==='Core') catsSeen[c1]=true;
    }
    return Object.keys(catsSeen).length;
  }
  if(metric==='sets_in_one_workout'){
    var setsPerSess={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<sinceStr) continue;
      var sk1=sessionKey(ents[i]);
      setsPerSess[sk1]=(setsPerSess[sk1]||0)+((ents[i].sets||[]).length);
    }
    var bestSets=0;
    for(var key2 in setsPerSess){ if(setsPerSess[key2]>bestSets) bestSets=setsPerSess[key2]; }
    return bestSets;
  }
  if(metric==='hold_total_week'){
    // Gesamte Haltezeit dieser Woche: alle Sek-Einträge zusammen (Plank, L-Sit, Hollow Body,
    // Dead Hang, Wandsitz …) — Katalog-Semantik 'total hold time this week' (p51, Template t4)
    var holdSum=0;
    for(var i=0;i<ents.length;i++){
      var eH=ents[i];
      if(!eH||!eH.date||eH.date<weekStr) continue;
      if(entUnit(eH)!=='Sek') continue;
      holdSum+=setSum(eH);
    }
    return Math.round(holdSum);
  }
  if(metric==='volume_one_workout'){
    var volPerSess={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<sinceStr) continue;
      var sk2=sessionKey(ents[i]);
      volPerSess[sk2]=(volPerSess[sk2]||0)+setSum(ents[i]);
    }
    var bestVol=0;
    for(var key4 in volPerSess){ if(volPerSess[key4]>bestVol) bestVol=volPerSess[key4]; }
    return Math.round(bestVol);
  }

  // ── Session-Metriken der Preset-Challenges (p9–p22) ──
  // Alle gruppieren nach sessionKey und zählen nur Einheiten ab Challenge-Start (sinceStr),
  // damit eine heute angenommene Challenge nicht durch alte Daten sofort erledigt ist.
  // Wdh-Einträge zählen als Wiederholungen, Sek-Einträge als Sekunden.
  // EMOM-Einträge (main2bb.js) haben kein unit-Feld → Einheit aus EX_DB, sonst 'Wdh'.
  function entUnit(e){ if(e.unit) return e.unit; for(var k=0;k<EX_DB.length;k++){ if(EX_DB[k].name===e.name) return EX_DB[k].unit||'Wdh'; } return 'Wdh'; }
  function partsOf(){ var arr=p.parts; if(!arr||!arr.length) return []; var out=[]; for(var k=0;k<arr.length;k++){ var pt=arr[k]||{}; var n=parseFloat(pt.n); if(!pt.ex||!(n>0)) continue; out.push({ex:pt.ex, n:n}); } return out; }
  // Pro Session: Volumen je Übung (Wdh) + bekannte Dauer (Sekunden)
  function sessionVolumes(onlyUnit){
    var sess={};
    for(var i=0;i<ents.length;i++){
      var e=ents[i];
      if(!e||!e.date||e.date<sinceStr) continue;
      if(onlyUnit && entUnit(e)!==onlyUnit) continue;
      var sk=sessionKey(e);
      var s=sess[sk]||(sess[sk]={vol:{}, all:0, dur:0});
      var v=setSum(e);
      s.vol[e.name]=(s.vol[e.name]||0)+v;
      s.all+=v;
      var d=parseFloat(e.dur);
      if(d>0 && d>s.dur) s.dur=d;
    }
    return sess;
  }
  function volMatching(s, exName){ var t=0; for(var nm in s.vol){ if(s.vol.hasOwnProperty(nm) && nameMatches(nm, exName)) t+=s.vol[nm]; } return t; }

  if(metric==='volume_session_ex'){
    // Wdh einer Übung (oder aller Wdh-Übungen ohne exName) in einer Einheit — Bestwert seit Start.
    // Sessions über maxDur (falls Dauer bekannt) zählen nicht — gleiche Regel wie rounds_in_session (p23–p28, p87).
    var sessA=sessionVolumes('Wdh');
    var maxDurA=parseFloat(p.maxDur);
    var bestA=0;
    for(var ka in sessA){
      if(!sessA.hasOwnProperty(ka)) continue;
      if(maxDurA>0 && sessA[ka].dur>0 && sessA[ka].dur>maxDurA) continue;
      var vA=p.exName ? volMatching(sessA[ka], p.exName) : sessA[ka].all;
      if(vA>bestA) bestA=vA;
    }
    return Math.round(bestA);
  }
  if(metric==='multi_volume_session'){
    // Summe über parts von min(Volumen der Übung in der Einheit, Soll) — Bestwert seit Start
    var partsB=partsOf();
    if(!partsB.length) return 0;
    var sessB=sessionVolumes('Wdh');
    var bestB=0;
    for(var kb in sessB){
      if(!sessB.hasOwnProperty(kb)) continue;
      var sumB=0;
      for(var pb=0;pb<partsB.length;pb++){ sumB+=Math.min(volMatching(sessB[kb], partsB[pb].ex), partsB[pb].n); }
      if(sumB>bestB) bestB=sumB;
    }
    return Math.round(bestB);
  }
  if(metric==='rounds_in_session'){
    // Runden = min über parts von floor(Volumen / Soll); Sessions über maxDur (falls Dauer bekannt) zählen nicht
    var partsC=partsOf();
    if(!partsC.length) return 0;
    var sessC=sessionVolumes('Wdh');
    var maxDur=parseFloat(p.maxDur);
    var bestC=0;
    for(var kc in sessC){
      if(!sessC.hasOwnProperty(kc)) continue;
      if(maxDur>0 && sessC[kc].dur>0 && sessC[kc].dur>maxDur) continue;
      var rounds=Infinity;
      for(var pc=0;pc<partsC.length;pc++){
        var r=Math.floor(volMatching(sessC[kc], partsC[pc].ex)/partsC[pc].n);
        if(r<rounds) rounds=r;
      }
      if(rounds!==Infinity && rounds>bestC) bestC=rounds;
    }
    return bestC;
  }
  if(metric==='days_with_volume'){
    // Tage seit Start, an denen das Tagesvolumen der Übung (Wdh oder Sek je Eintrag) >= perDay liegt
    var perDay=parseFloat(p.perDay);
    if(!(perDay>0)||!p.exName) return 0;
    var perDate={};
    for(var i=0;i<ents.length;i++){
      var eD=ents[i];
      if(!eD||!eD.date||eD.date<sinceStr) continue;
      if(!nameMatches(eD.name, p.exName)) continue;
      var uD=entUnit(eD);
      if(uD!=='Wdh' && uD!=='Sek') continue;
      perDate[eD.date]=(perDate[eD.date]||0)+setSum(eD);
    }
    var daysCnt=0;
    for(var kd in perDate){ if(perDate.hasOwnProperty(kd) && perDate[kd]>=perDay) daysCnt++; }
    return daysCnt;
  }
  if(metric==='skills_this_week'){
    var skillsSeen={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date>=weekStr && exCat(ents[i].name)==='Skills') skillsSeen[ents[i].name]=true;
    }
    return Object.keys(skillsSeen).length;
  }
  if(metric==='pullup_pyramid'){
    var pyTarget=p.target||25;
    var pullPerSess={};
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<sinceStr) continue;
      // Geloggte Pyramide (Unit 'Runden') zählt als komplette Pyramide
      if(ents[i].name.indexOf('Pyramide')>-1) return pyTarget;
      if(nameMatches(ents[i].name,'Klimmzuge')){
        var sk3=sessionKey(ents[i]);
        pullPerSess[sk3]=(pullPerSess[sk3]||0)+setSum(ents[i]);
      }
    }
    var bestPull=0;
    for(var key5 in pullPerSess){ if(pullPerSess[key5]>bestPull) bestPull=pullPerSess[key5]; }
    return Math.min(Math.round(bestPull), pyTarget);
  }
  if(metric==='balance_week'){
    var pullSets=0, pushSets=0;
    for(var i=0;i<ents.length;i++){
      if(ents[i].date<weekStr) continue;
      var c2=exCat(ents[i].name);
      var sl=(ents[i].sets||[]).length;
      if(c2==='Pull') pullSets+=sl;
      else if(c2==='Push') pushSets+=sl;
    }
    return Math.min(pullSets, pushSets);
  }
  if(metric==='new_personal_record'){
    // Gibt es seit Challenge-Start einen Maxwert, der die alte Bestleistung schlägt?
    for(var i=0;i<maxEntries.length;i++){
      var me=maxEntries[i];
      if(!me.date || me.date<sinceStr) continue;
      var newV=parseMaxVal(me.val, me.unit);
      var prevV=0;
      for(var j=0;j<maxEntries.length;j++){
        var oe=maxEntries[j];
        if(oe.name===me.name && oe.date && oe.date<sinceStr){
          var ov2=parseMaxVal(oe.val, oe.unit);
          if(ov2>prevV) prevV=ov2;
        }
      }
      if(prevV>0 && newV>prevV) return 1;
    }
    return 0;
  }

  // ── Metriken der Presets p23–p100 (app3.js) ──
  // manual: Check-ins per Button (chManualCheckin) statt Trainingsdaten.
  if(metric==='manual'){
    var cks=activeChallenge.checkins;
    if(!Array.isArray(cks)) return 0;
    if(!p.perDay) return cks.length;
    var ckDays={};
    for(var i=0;i<cks.length;i++){ if(cks[i]) ckDays[String(cks[i]).slice(0,10)]=true; }
    return Object.keys(ckDays).length;
  }
  // Zeitstempel eines Eintrags: ts (finalizeEndWorkout, app1.js) oder die numerische id
  // (= Date.now()+i bei alten Einträgen). 0, wenn nichts Brauchbares da ist.
  function entTs(e){ var t=parseFloat(e.ts); if(!(t>1e11)) t=parseFloat(e.id); return t>1e11 ? t : 0; }
  // Alle Einheiten seit Challenge-Start: Datum, Übungsnamen, Kategorien, Satzzahl, Dauer, frühester Zeitstempel
  function sessionsSince(){
    var sess={};
    for(var i=0;i<ents.length;i++){
      var e=ents[i];
      if(!e||!e.date||e.date<sinceStr) continue;
      var sk=sessionKey(e);
      var s=sess[sk]||(sess[sk]={date:e.date, names:{}, cats:{}, sets:0, dur:0, ts:0});
      if(e.name){ s.names[e.name]=true; var c=exCat(e.name); if(c) s.cats[c]=true; }
      s.sets+=(e.sets||[]).length;
      var d=parseFloat(e.dur); if(d>0 && d>s.dur) s.dur=d;
      var t=entTs(e); if(t>0 && (!s.ts || t<s.ts)) s.ts=t;
    }
    return sess;
  }
  function dayNum(dateStr){ var t=Date.parse(dateStr); return isNaN(t) ? 0 : Math.floor(t/86400000); }
  if(metric==='sessions_in_window'){
    // Meiste verschiedene Einheiten in einem Fenster von p.days Tagen seit Start
    // (gleitend ab jedem Trainingstag — schließt das feste Fenster ab Start ein)
    var winDays=Math.max(1, Math.floor(parseFloat(p.days))||1);
    var sessW=sessionsSince(); var dayNums=[];
    for(var kw in sessW){ if(sessW.hasOwnProperty(kw)) dayNums.push(dayNum(sessW[kw].date)); }
    dayNums.sort(function(x,y){ return x-y; });
    var bestW=0;
    for(var iw=0;iw<dayNums.length;iw++){
      var cntW=0;
      for(var jw=iw;jw<dayNums.length && dayNums[jw]<dayNums[iw]+winDays;jw++) cntW++;
      if(cntW>bestW) bestW=cntW;
    }
    return bestW;
  }
  if(metric==='longest_session_min'){
    var sessL=sessionsSince(); var bestL=0;
    for(var kl in sessL){ if(sessL.hasOwnProperty(kl) && sessL[kl].dur>bestL) bestL=sessL[kl].dur; }
    return Math.floor(bestL/60);
  }
  if(metric==='distinct_exercises_session'){
    var sessD=sessionsSince(); var bestD=0;
    for(var kd2 in sessD){ if(!sessD.hasOwnProperty(kd2)) continue; var nD=Object.keys(sessD[kd2].names).length; if(nD>bestD) bestD=nD; }
    return bestD;
  }
  if(metric==='categories_in_session'){
    var sessK=sessionsSince(); var bestK=0;
    for(var kk in sessK){ if(!sessK.hasOwnProperty(kk)) continue; var nK=Object.keys(sessK[kk].cats).length; if(nK>bestK) bestK=nK; }
    return bestK;
  }
  if(metric==='sessions_by_hour'){
    // Einheiten nach Speicherzeitpunkt: vor beforeHour, ab afterHour, beide = Fenster
    // (afterHour > beforeHour = Fenster über Mitternacht). Ohne Zeitstempel zählt eine Einheit nicht.
    var bH=parseFloat(p.beforeHour), aH=parseFloat(p.afterHour);
    var hasB=!isNaN(bH), hasA=!isNaN(aH);
    if(!hasB && !hasA) return 0;
    var sessH=sessionsSince(); var cntH=0;
    for(var kh in sessH){
      if(!sessH.hasOwnProperty(kh) || !sessH[kh].ts) continue;
      var hr=new Date(sessH[kh].ts).getHours();
      var ok;
      if(hasB && hasA) ok = (aH<bH) ? (hr>=aH && hr<bH) : (hr>=aH || hr<bH);
      else if(hasB) ok = hr<bH;
      else ok = hr>=aH;
      if(ok) cntH++;
    }
    return cntH;
  }
  if(metric==='saved_parks'){
    // Gespeicherte Parks kennt nur das Gerät (data.savedParks aus app2.js)
    return parseInt(data.savedParks, 10) || 0;
  }
  if(metric==='sets_this_week'){
    var setsW=0;
    for(var i=0;i<ents.length;i++){ var eS=ents[i]; if(eS && eS.date && eS.date>=weekStr) setsW+=(eS.sets||[]).length; }
    return setsW;
  }
  if(metric==='hold_total_session'){
    // Sekunden aller Sek-Einträge (oder nur exName) in einer Einheit — Bestwert seit Start
    var sessT=sessionVolumes('Sek'); var bestT=0;
    for(var kt in sessT){
      if(!sessT.hasOwnProperty(kt)) continue;
      var vT=p.exName ? volMatching(sessT[kt], p.exName) : sessT[kt].all;
      if(vT>bestT) bestT=vT;
    }
    return Math.round(bestT);
  }
  return 0;
}

if(typeof module !== 'undefined' && module.exports){
  module.exports = {caliCalcProgress: caliCalcProgress, parseMaxVal: parseMaxVal, presetParams: presetParams};
}
