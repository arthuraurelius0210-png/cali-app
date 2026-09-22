// Kopiert die geteilten Browser-Dateien (Übungsliste, Fortschrittsrechnung, Wochen-Challenges)
// nach functions/shared/, damit die Cloud Functions dieselbe Logik wie die App benutzen.
// Läuft als predeploy-Hook (firebase.json) und vor den Tests.
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '..', 'public');
const dst = path.join(__dirname, 'shared');
if (!fs.existsSync(dst)) fs.mkdirSync(dst);
['exdb.js', 'calc.js', 'econ.js', 'wochen.js'].forEach(f => {
  fs.copyFileSync(path.join(src, f), path.join(dst, f));
});
console.log('shared: exdb.js, calc.js, econ.js, wochen.js kopiert');
