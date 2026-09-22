// ══════════════════════════════════════════════════════════
// WALLET.JS — Diamanten-Geldbörse auf dem Server
// Seit dem Shop haben Diamanten einen Geldwert. Deshalb liegt der Kontostand in
// wallets/{uid} (nur lesbar) und jede Gutschrift/Ausgabe läuft über Cloud Functions
// (functions/index.js: syncWallet, earn, spend). currency.diamonds (app2.js) ist nur noch
// das Spiegelbild davon; Flammen bleiben wie bisher auf dem Gerät.
// Ohne Login (Demo) gelten die Werte aus econ.js lokal, damit die App weiter bedienbar ist.
// ══════════════════════════════════════════════════════════

var walletState = {diamonds:0, completed:[], verifications:{}, badges:[], loaded:false};
var _walletUnsub = null;

function walletReady(){
  return !!(typeof currentUser !== 'undefined' && currentUser && typeof firebase !== 'undefined' && firebase.functions);
}
function walletCall(name, data){
  return firebase.functions().httpsCallable(name)(data || {}).then(function(r){ return r.data; });
}
// Kontostand aus dem Server-Dokument übernehmen und alle Anzeigen nachziehen
function walletApply(w){
  if(!w) return;
  walletState.diamonds = parseInt(w.diamonds, 10) || 0;
  walletState.completed = Array.isArray(w.completed) ? w.completed : [];
  walletState.verifications = (w.verifications && typeof w.verifications === 'object') ? w.verifications : {};
  walletState.loaded = true;
  currency.diamonds = walletState.diamonds;
  saveCurrency();
  walletRefreshUI();
}
function walletRefreshUI(){
  var p = document.getElementById('ch-points-val');
  if(p) p.textContent = currency.diamonds || 0;
  var s = document.getElementById('shop-balance');
  if(s) s.textContent = currency.diamonds || 0;
  if(typeof buildVerifySection === 'function') buildVerifySection();
}
// Nach dem Login: Geldbörse anlegen/holen und live mitlesen
function walletSync(){
  if(!walletReady()) return;
  walletCall('syncWallet', {localDiamonds: currency.diamonds || 0})
    .then(function(d){ walletApply(d.wallet); })
    .catch(function(e){ console.log('wallet sync:', e.message); });
  if(_walletUnsub){ try{ _walletUnsub(); }catch(e){} }
  _walletUnsub = db.collection('wallets').doc(currentUser.uid).onSnapshot(function(snap){
    if(snap.exists) walletApply(snap.data());
  }, function(){});
  if(typeof loadVerifiedBadges === 'function') loadVerifiedBadges();
}
function walletErrorMessage(e){
  var code = (e && e.code) || '', msg = (e && e.message) || 'Fehler';
  if(code.indexOf('unauthenticated') > -1) return 'Bitte einloggen';
  if(code.indexOf('unavailable') > -1 || code.indexOf('internal') > -1) return 'Server gerade nicht erreichbar';
  return msg;
}

// Belohnung gutschreiben lassen. type/key wie in functions/lib/rewards.js, opts.label für den Verlauf.
// cb bekommt {ok, xp, diamonds, levelUp, already} — bei 'already' wurde es früher schon gutgeschrieben.
function earnReward(type, key, opts, cb){
  opts = opts || {};
  var rule = CALI_ECON.earn[type];
  if(!rule){ if(cb) cb({ok:false}); return; }
  if(!walletReady()){
    // Demo ohne Login: lokal anwenden, damit Feiermomente weiter funktionieren
    var d = opts.diamonds !== undefined ? opts.diamonds : rule.diamonds;
    currency.diamonds = (currency.diamonds || 0) + d;
    saveCurrency();
    walletRefreshUI();
    if(rule.xp && typeof showXPFloat === 'function') showXPFloat(rule.xp, opts.label || rule.label);
    if(cb) cb({ok:true, local:true, xp:rule.xp, diamonds:d});
    return;
  }
  // Erst den Stand speichern (der Server prüft gegen users/{uid}), dann gutschreiben lassen
  var saved = (typeof fbSave === 'function') ? fbSave() : null;
  Promise.resolve(saved).catch(function(){}).then(function(){
    return walletCall('earn', {type:type, key:String(key), label:opts.label || ''});
  }).then(function(d){
    walletApply(d.wallet);
    if(typeof xpCacheTotal === 'function') xpCacheTotal(d.totalXP);
    if(d.levelUp){
      if(typeof toast === 'function') toast('Level up! Level ' + d.newLevel + (d.diamondBonus ? ' · +' + d.diamondBonus + ' Diamanten' : ''));
      if(typeof showLevelUpAnimation === 'function') showLevelUpAnimation(d.oldLevel, d.newLevel, d.diamondBonus);
    } else if(d.xp && typeof showXPFloat === 'function'){
      showXPFloat(d.xp, opts.label || rule.label);
    }
    if(typeof updateXPRing === 'function') updateXPRing();
    if(cb) cb(d);
  }).catch(function(e){
    var code = (e && e.code) || '';
    if(code.indexOf('already-exists') > -1){ if(cb) cb({ok:false, already:true}); return; }
    if(typeof toast === 'function') toast(walletErrorMessage(e));
    if(cb) cb({ok:false, error:e});
  });
}

// Diamanten ausgeben (what aus CALI_ECON.spend). cb(true) nach erfolgreicher Buchung.
function spendDiamonds(what, cb){
  var cost = CALI_ECON.spend[what];
  if(!cost){ if(cb) cb(false); return; }
  if((currency.diamonds || 0) < cost){
    if(typeof toast === 'function') toast('Nicht genug Diamanten: ' + cost + ' nötig, ' + (currency.diamonds || 0) + ' da.');
    if(cb) cb(false);
    return;
  }
  if(!walletReady()){
    currency.diamonds -= cost;
    saveCurrency();
    walletRefreshUI();
    if(cb) cb(true);
    return;
  }
  walletCall('spend', {what:what}).then(function(d){
    walletApply(d.wallet);
    if(cb) cb(true);
  }).catch(function(e){
    if(typeof toast === 'function') toast(walletErrorMessage(e));
    if(cb) cb(false);
  });
}

// ── Shop-Sheet: Kontostand, Pakete mit Euro-Preis, wie man Diamanten verdient und ausgibt ──
// Der Kauf selbst kommt mit Stripe, sobald Gewerbe und Rechtsseiten stehen; bis dahin sind
// die Kaufknöpfe aus. Preise und Pakete: CALI_ECON (econ.js).
function openShopSheet(){
  var old = document.getElementById('shop-sheet');
  if(old) old.remove();
  var ov = document.createElement('div');
  ov.id = 'shop-sheet';
  ov.style.cssText = PLAN_BACKDROP_CSS + 'z-index:2100;';
  var box = document.createElement('div');
  box.className = 'sheet sheet-scroll';
  box.style.cssText = 'max-height:88vh;overflow-y:auto;';
  box.appendChild(planSheetGrip());

  function add(tag, cls, css, text){
    var n = document.createElement(tag);
    if(cls) n.className = cls;
    if(css) n.style.cssText = css;
    if(text !== undefined) n.textContent = text;
    box.appendChild(n);
    return n;
  }

  add('span', 'eyebrow', '', 'Diamanten');
  var kpi = add('div', '', 'display:flex;align-items:baseline;gap:8px;margin-bottom:4px;');
  kpi.innerHTML = '<span class="kpi num" id="shop-balance" style="font-size:32px;">' + (currency.diamonds || 0) + '</span><span class="unit">Diamanten</span>';
  add('div', 'row-sub', 'margin:0 0 16px;', 'Diamanten haben keinen Barwert und werden nicht ausgezahlt. Du verdienst sie beim Training oder kaufst sie hier.');

  // Abnahme-Preis, immer mit Euro daneben
  var verify = add('div', 'card', 'background:var(--card2);margin-bottom:14px;');
  verify.innerHTML = '<span class="eyebrow">Abnahme einer Challenge</span>' +
    '<div style="display:flex;align-items:baseline;gap:6px;"><span class="kpi num" style="font-size:22px;">' + CALI_ECON.verifyCost + '</span><span class="unit">Diamanten</span><span class="row-sub num" style="margin:0 0 0 auto;">entspricht ' + econDiamondsEuro(CALI_ECON.verifyCost) + '</span></div>' +
    '<div class="row-sub" style="margin:6px 0 0;white-space:normal;">Du schickst ein Video, wir prüfen es, du bekommst das Abzeichen „Verifiziert" fürs Profil.</div>';

  add('div', 'lbl', 'margin-bottom:8px;', 'Pakete');
  var list = add('div', 'list', 'margin-bottom:6px;');
  CALI_ECON.packs.forEach(function(p){
    var n = Math.floor(p.diamonds / CALI_ECON.verifyCost);
    var per = econEuro(Math.round(p.cents / n));
    var row = document.createElement('div');
    row.className = 'list-row';
    row.style.cssText = 'cursor:default;';
    row.innerHTML = '<div class="row-main"><div class="row-title num">' + p.diamonds.toLocaleString('de-DE') + ' Diamanten</div>' +
      '<div class="row-sub num">' + p.label + ' · ' + n + ' Abnahme' + (n === 1 ? '' : 'n') + ' · ' + per + ' je Abnahme</div></div>';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn sec sm num';
    btn.style.cssText = 'flex-shrink:0;white-space:nowrap;';
    btn.textContent = econEuro(p.cents);
    btn.disabled = true;
    btn.setAttribute('aria-label', p.diamonds + ' Diamanten für ' + econEuro(p.cents) + ', bald verfügbar');
    row.appendChild(btn);
    list.appendChild(row);
  });
  add('div', 'row-sub', 'margin:0 0 16px;white-space:normal;', 'Der Kauf startet in Kürze. Bis dahin verdienst du Diamanten nur im Training.');

  add('div', 'lbl', 'margin-bottom:8px;', 'So verdienst du Diamanten');
  var earnList = add('div', 'list', 'margin-bottom:14px;');
  [['Level-Aufstieg', '50 bis 200'], ['Meilensteine (Kontoalter)', '2 bis 100'], ['Wochen-Challenge geschafft', '+' + CALI_ECON.earn.weekly.diamonds], ['Neuer Rekord im Max-Test', '+' + CALI_ECON.earn.pr.diamonds]].forEach(function(x){
    var r = document.createElement('div');
    r.className = 'list-row';
    r.style.cssText = 'cursor:default;min-height:40px;';
    r.innerHTML = '<div class="row-main"><div class="row-title">' + x[0] + '</div></div><span class="row-val num" style="color:var(--accent);">' + x[1] + '</span>';
    earnList.appendChild(r);
  });

  add('div', 'lbl', 'margin-bottom:8px;', 'Was Diamanten kosten');
  var costList = add('div', 'list', 'margin-bottom:16px;');
  [['Abnahme per Video', CALI_ECON.verifyCost], ['Extra-Post in der Community', CALI_ECON.spend.post], ['Streak auf Eis', CALI_ECON.spend.ice], ['Challenge tauschen oder skippen', CALI_ECON.spend.swap]].forEach(function(x){
    var r = document.createElement('div');
    r.className = 'list-row';
    r.style.cssText = 'cursor:default;min-height:40px;';
    r.innerHTML = '<div class="row-main"><div class="row-title">' + x[0] + '</div></div><span class="row-val num">' + x[1] + '</span>';
    costList.appendChild(r);
  });

  var close = add('button', 'pressable u', PLAN_TEXTBTN_CSS, 'Schließen');
  close.type = 'button';
  close.onclick = function(){ sheetOut(ov, box); };

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) sheetOut(ov, box); };
  document.body.appendChild(ov);
  if(window.caliMotion) caliMotion.sheetIn(box, ov);
}
