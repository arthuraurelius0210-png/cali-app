// ══════════════════════════════════════════════════════════
// WOCHEN.JS — Wochen-Challenge
// Jede Kalenderwoche (Mo bis So) eine offizielle Challenge für alle aus einem Pool von 100.
// Feste Reihenfolge: KW 39/2026 = w1, jede Woche die nächste, nach 100 Wochen wieder von vorn.
// Fortschritt über calcChallengeProgress (app2.js), gemessen ab Montag dieser Woche.
// Belohnung einmal pro Woche: +200 XP und +3 Diamanten.
// Tauschen einmal pro Woche gegen 1 Diamant oder 50 Flammen (Ersatz: andere Muskelgruppe,
// bei schweren Challenges eine leichtere).
// Zustand pro Woche in localStorage 'cali_wochen' und im User-Dokument (Feld 'wochen', main2aa.js).
// Nutzt weeklyMonday/weeklyKey/weeklyNum/weeklyFmt aus weekly.js.
// ══════════════════════════════════════════════════════════

var WOCHEN_REWARD_XP = 200;
var WOCHEN_REWARD_DIAMONDS = 3;
var WOCHEN_SWAP_DIAMONDS = 1;
var WOCHEN_SWAP_FLAMES = 50;
var WOCHEN_EPOCH = new Date(2026, 8, 21); // Montag der KW 39/2026 → w1

// exName ohne Umlaute (muss die EX_DB-Namen per Präfix treffen, siehe nameMatches in app2.js).
// Metriken nur solche, die calcChallengeProgress wochenbezogen rechnet.
var WOCHEN_CHALLENGES = [
  {id:'w1', level:1, cats:['Push'], title:'Hundert Liegestütze',
    desc:'Sammle diese Woche 100 Liegestütze. Wie du sie verteilst, ist egal.',
    explanation:'Zum Beispiel vier Tage mit je 25. Alle Liegestütz-Varianten zählen mit, auch enge und weite.',
    metric:'volume_exercise', exName:'Liegestutze', target:100, unit:'Wdh'},
  {id:'w2', level:2, cats:['Pull'], title:'Fünfzig Klimmzüge',
    desc:'50 Klimmzüge in dieser Woche, verteilt auf so viele Einheiten, wie du willst.',
    explanation:'Alle Griffvarianten zählen. Wer noch keine fünf am Stück schafft, macht viele kleine Sätze mit ein bis zwei Wiederholungen.',
    metric:'volume_exercise', exName:'Klimmzuge', target:50, unit:'Wdh'},
  {id:'w3', level:1, cats:['Core'], title:'Fünf Minuten Plank',
    desc:'Halte diese Woche insgesamt fünf Minuten Plank.',
    explanation:'Die Sekunden aller Plank-Sätze werden zusammengezählt. Fünf Sätze à 60 Sekunden reichen, zehn à 30 auch.',
    metric:'volume_exercise', exName:'Plank', target:300, unit:'Sek'},
  {id:'w4', level:1, cats:['Legs'], title:'Zweihundert Kniebeugen',
    desc:'200 Kniebeugen in einer Woche.',
    explanation:'Ideal als Abschluss jeder Einheit: viermal 50 Stück. Tief runter, die Fersen bleiben am Boden.',
    metric:'volume_exercise', exName:'Kniebeugen', target:200, unit:'Wdh'},
  {id:'w5', level:1, cats:[], title:'Drei Trainingstage',
    desc:'Trainiere an drei verschiedenen Tagen dieser Woche.',
    explanation:'Jeder Tag mit mindestens einem eingetragenen Satz zählt. Zwei Einheiten am selben Tag zählen als ein Tag.',
    metric:'workouts_this_week', target:3, unit:'Tage'},
  {id:'w6', level:1, cats:[], title:'Treppenwoche',
    desc:'Fünf Tage lang Treppe statt Aufzug oder Rolltreppe. Hake jeden Tag ab, an dem du es durchgezogen hast.',
    explanation:'Klingt klein, summiert sich aber. Wer Lust hat, nimmt zwei Stufen auf einmal.',
    metric:'manual', perDay:true, target:5, unit:'Tage'},
  {id:'w7', level:2, cats:['Push'], title:'Dip-Woche',
    desc:'100 Dips in dieser Woche.',
    explanation:'Stange, Ringe oder Bank: Alle Dip-Varianten zählen. Schultern tief halten und unten kurz stoppen.',
    metric:'volume_exercise', exName:'Dips', target:100, unit:'Wdh'},
  {id:'w8', level:1, cats:['Pull'], title:'Hängen lernen',
    desc:'Hänge diese Woche insgesamt fünf Minuten an der Stange.',
    explanation:'Dead Hang stärkt Griff und Schultern. Die Sekunden aller Sätze werden addiert, 30 Sekunden pro Satz sind ein guter Start.',
    metric:'volume_exercise', exName:'Dead Hang', target:300, unit:'Sek'},
  {id:'w9', level:2, cats:['Core'], title:'Hollow-Woche',
    desc:'Sammle vier Minuten Hollow Body Hold.',
    explanation:'Der untere Rücken bleibt am Boden. Lieber 20 saubere Sekunden als 60 mit Hohlkreuz.',
    metric:'volume_exercise', exName:'Hollow Body Hold', target:240, unit:'Sek'},
  {id:'w10', level:2, cats:['Legs'], title:'Ausfallschritt-Woche',
    desc:'200 Ausfallschritte (Lunges) in dieser Woche.',
    explanation:'Jedes Bein zählt einzeln. Aufrecht bleiben, das hintere Knie geht knapp über den Boden.',
    metric:'volume_exercise', exName:'Lunges', target:200, unit:'Wdh'},
  {id:'w11', level:2, cats:['Push','Skills'], title:'Kopfüber',
    desc:'Halte diese Woche insgesamt fünf Minuten Handstand an der Wand.',
    explanation:'Bauch zur Wand ist schwerer, aber sauberer. Die Sekunden aller Sätze werden addiert.',
    metric:'volume_exercise', exName:'Wall Handstand Hold', target:300, unit:'Sek'},
  {id:'w12', level:2, cats:[], title:'Mittagspause',
    desc:'Zwei Einheiten zwischen 11 und 14 Uhr.',
    explanation:'Ein kurzes Training in der Mittagspause reicht. Es zählt die Uhrzeit, zu der du die Einheit speicherst.',
    metric:'sessions_by_hour', afterHour:11, beforeHour:14, target:2, unit:'Einheiten'},
  {id:'w13', level:2, cats:['Pull','Push'], title:'Gleichgewicht',
    desc:'Mindestens 12 Zug-Sätze und 12 Drück-Sätze in dieser Woche.',
    explanation:'Gezählt wird die kleinere der beiden Zahlen. Nur Liegestütze machen bringt hier also nichts.',
    metric:'balance_week', target:12, unit:'Sätze'},
  {id:'w14', level:3, cats:['Push'], title:'Diamant-Woche',
    desc:'100 Diamond Push-ups in einer Woche.',
    explanation:'Hände eng unter der Brust, Daumen und Zeigefinger bilden ein Dreieck. Trifft vor allem den Trizeps.',
    metric:'volume_exercise', exName:'Diamond Push-ups', target:100, unit:'Wdh'},
  {id:'w15', level:1, cats:['Pull'], title:'Rudern',
    desc:'150 Australian Rows in dieser Woche.',
    explanation:'Eine tiefe Stange oder ein stabiler Tisch reicht. Je flacher der Körper, desto schwerer.',
    metric:'volume_exercise', exName:'Australian Rows', target:150, unit:'Wdh'},
  {id:'w16', level:3, cats:['Legs'], title:'Pistol-Woche',
    desc:'30 Pistol Squats in einer Woche.',
    explanation:'Einbeinige Kniebeuge bis ganz unten, jedes Bein zählt einzeln. Box Pistols zählen hier nicht.',
    metric:'volume_exercise', exName:'Pistol Squat', target:30, unit:'Wdh'},
  {id:'w17', level:2, cats:['Core'], title:'Beine hoch',
    desc:'100 Leg Raises in dieser Woche.',
    explanation:'Im Liegen, Beine gestreckt, langsam wieder ablassen. Der untere Rücken bleibt am Boden.',
    metric:'volume_exercise', exName:'Leg Raises', target:100, unit:'Wdh'},
  {id:'w18', level:1, cats:[], title:'Wasserwoche',
    desc:'An fünf Tagen mindestens zwei Liter Wasser trinken. Hake jeden geschafften Tag ab.',
    explanation:'Eine volle Flasche auf dem Tisch hilft mehr als jede Erinnerung.',
    metric:'manual', perDay:true, target:5, unit:'Tage'},
  {id:'w19', level:2, cats:[], title:'Satzsammler',
    desc:'Sammle 60 Sätze in dieser Woche, egal mit welchen Übungen.',
    explanation:'Jeder eingetragene Satz zählt. Drei Einheiten mit je 20 Sätzen reichen.',
    metric:'sets_this_week', target:60, unit:'Sätze'},
  {id:'w20', level:4, cats:['Pull'], title:'Muscle-Up-Woche',
    desc:'20 Muscle-Ups in einer Woche.',
    explanation:'Nur für alle, die den Muscle-Up schon können. Lieber viele einzelne Wiederholungen mit sauberem Übergang als hektische Serien.',
    metric:'volume_exercise', exName:'Muscle-Ups', target:20, unit:'Wdh'},
  {id:'w21', level:2, cats:['Push'], title:'Pike-Woche',
    desc:'80 Pike Push-ups in dieser Woche.',
    explanation:'Hüfte hoch, der Kopf geht vor den Händen Richtung Boden. Die beste Vorstufe zum Handstand Push-up.',
    metric:'volume_exercise', exName:'Pike Push-ups', target:80, unit:'Wdh'},
  {id:'w22', level:1, cats:['Legs'], title:'Brückenbauer',
    desc:'150 Glute Bridges in dieser Woche.',
    explanation:'Oben zwei Sekunden halten und den Po fest anspannen. Gut für alle, die viel sitzen.',
    metric:'volume_exercise', exName:'Glute Bridge', target:150, unit:'Wdh'},
  {id:'w23', level:3, cats:['Core'], title:'L-Sit-Woche',
    desc:'Sammle 90 Sekunden L-Sit in dieser Woche.',
    explanation:'Am Boden, an Parallettes oder am Barren. Wer die Beine noch nicht gestreckt halten kann, zieht die Knie an und trägt es trotzdem als L-Sit ein.',
    metric:'volume_exercise', exName:'L-Sit Hold', target:90, unit:'Sek'},
  {id:'w24', level:1, cats:[], title:'Raus an die Stange',
    desc:'Zwei Einheiten draußen, im Park oder an einer Stange im Freien. Hake jede Einheit danach ab.',
    explanation:'Frische Luft, andere Geräte, oft andere Leute. Die Parks-Karte in der App zeigt dir Spots in der Nähe.',
    metric:'manual', perDay:true, target:2, unit:'Einheiten'},
  {id:'w25', level:1, cats:['Pull','Push','Core'], title:'Drei Welten',
    desc:'Trainiere diese Woche Pull, Push und Core.',
    explanation:'Je eine Übung aus jeder der drei Gruppen reicht. Die Gruppe steht in der Übungsliste bei jeder Übung.',
    metric:'categories_this_week', target:3, unit:'Gruppen'},
  {id:'w26', level:2, cats:['Pull'], title:'Chin-Up-Woche',
    desc:'60 Chin-Ups in einer Woche.',
    explanation:'Untergriff, Hände schulterbreit. Mehr Bizeps als beim normalen Klimmzug und für viele leichter.',
    metric:'volume_exercise', exName:'Chin-Ups', target:60, unit:'Wdh'},
  {id:'w27', level:2, cats:['Push'], title:'Fünfzig in zehn Minuten',
    desc:'50 Liegestütze in einer Einheit, die höchstens zehn Minuten dauert.',
    explanation:'Zählt, sobald eine Einheit mindestens 50 Liegestütze enthält und nicht länger als zehn Minuten läuft. Einheiten ohne gemessene Dauer zählen auch.',
    metric:'volume_session_ex', exName:'Liegestutze', maxDur:600, target:50, unit:'Wdh'},
  {id:'w28', level:2, cats:['Legs'], title:'Wandsitz',
    desc:'An vier Tagen jeweils 90 Sekunden Wall Sit.',
    explanation:'Rücken an die Wand, Oberschenkel waagerecht. Die 90 Sekunden dürfen auf mehrere Sätze am Tag verteilt sein.',
    metric:'days_with_volume', exName:'Wall Sit', perDay:90, target:4, unit:'Tage'},
  {id:'w29', level:1, cats:['Core'], title:'Seitenstütz',
    desc:'Sammle vier Minuten Side Plank.',
    explanation:'Beide Seiten zählen zusammen. Hüfte hoch, der Körper bildet eine Linie.',
    metric:'volume_exercise', exName:'Side Plank', target:240, unit:'Sek'},
  {id:'w30', level:1, cats:[], title:'Handy weg',
    desc:'An drei Abenden ab 22 Uhr kein Handy mehr. Hake jeden geschafften Abend ab.',
    explanation:'Besserer Schlaf ist die einfachste Form von Regeneration. Abhaken darfst du auch am nächsten Morgen.',
    metric:'manual', perDay:true, target:3, unit:'Tage'},
  {id:'w31', level:2, cats:['Skills'], title:'Froschstand',
    desc:'Sammle zwei Minuten Frog Stand.',
    explanation:'Knie auf die Ellbogen, Gewicht langsam nach vorne, bis die Füße abheben. Ein Kissen vor dem Kopf nimmt die Angst.',
    metric:'volume_exercise', exName:'Frog Stand', target:120, unit:'Sek'},
  {id:'w32', level:2, cats:[], title:'Vier Trainingstage',
    desc:'Trainiere an vier verschiedenen Tagen dieser Woche.',
    explanation:'Kurze Einheiten zählen genauso. Plane die Tage am Montag fest ein, dann klappt es.',
    metric:'workouts_this_week', target:4, unit:'Tage'},
  {id:'w33', level:3, cats:['Pull'], title:'Zehn am Stück',
    desc:'Schaffe diese Woche einen Satz mit zehn Klimmzügen.',
    explanation:'Gezählt wird dein bester Einzelsatz. Versuch es ausgeruht am Anfang der Einheit, nicht am Ende.',
    metric:'best_set', exName:'Klimmzuge', target:10, unit:'Wdh'},
  {id:'w34', level:2, cats:['Legs'], title:'Burpee-Woche',
    desc:'150 Burpees in einer Woche.',
    explanation:'Brust zum Boden, oben ein kleiner Sprung. 30 am Tag an fünf Tagen oder alles an zwei harten Abenden.',
    metric:'volume_exercise', exName:'Burpees', target:150, unit:'Wdh'},
  {id:'w35', level:2, cats:['Push'], title:'Hundert in einer Einheit',
    desc:'100 Liegestütze in einer einzigen Einheit.',
    explanation:'Pausen sind erlaubt, so viele Sätze wie nötig. Zählt, sobald eine Einheit mindestens 100 Liegestütze enthält.',
    metric:'volume_session_ex', exName:'Liegestutze', target:100, unit:'Wdh'},
  {id:'w36', level:1, cats:['Core'], title:'Russian Twists',
    desc:'300 Russian Twists in dieser Woche.',
    explanation:'Jede Seite zählt als eine Wiederholung. Füße am Boden ist leichter, Füße in der Luft schwerer.',
    metric:'volume_exercise', exName:'Russian Twists', target:300, unit:'Wdh'},
  {id:'w37', level:2, cats:[], title:'Kalt abduschen',
    desc:'An fünf Tagen die Dusche mit mindestens 30 Sekunden kaltem Wasser beenden. Hake jeden Tag ab.',
    explanation:'Erst die Beine, dann die Arme, zuletzt der Oberkörper. Ruhig atmen, die ersten zehn Sekunden sind die schlimmsten.',
    metric:'manual', perDay:true, target:5, unit:'Tage'},
  {id:'w38', level:1, cats:['Pull'], title:'Schulterblätter',
    desc:'100 Scapula Pull-ups in dieser Woche.',
    explanation:'Nur die Schulterblätter bewegen, die Arme bleiben gestreckt. Baut die Basis für saubere Klimmzüge.',
    metric:'volume_exercise', exName:'Scapula Pull-ups', target:100, unit:'Wdh'},
  {id:'w39', level:3, cats:[], title:'Dreihundert in einer Einheit',
    desc:'300 Wiederholungen in einer einzigen Einheit, egal mit welchen Übungen.',
    explanation:'Alle Übungen mit Wiederholungen zählen zusammen, Halteübungen nicht. Ein Zirkel aus Liegestützen, Kniebeugen und Rows bringt dich schnell hin.',
    metric:'volume_session_ex', target:300, unit:'Wdh'},
  {id:'w40', level:3, cats:['Legs'], title:'Bulgarische Woche',
    desc:'120 Bulgarian Split Squats in einer Woche.',
    explanation:'Der hintere Fuß liegt auf einer Bank oder einem Stuhl, jedes Bein zählt einzeln. Brennt länger, als man denkt.',
    metric:'volume_exercise', exName:'Bulgarian Split Squat', target:120, unit:'Wdh'},
  {id:'w41', level:3, cats:['Push'], title:'Bogenschütze',
    desc:'50 Archer Push-ups in dieser Woche.',
    explanation:'Ein Arm arbeitet, der andere bleibt gestreckt zur Seite. Jede Seite zählt einzeln. Der Weg zum einarmigen Liegestütz.',
    metric:'volume_exercise', exName:'Archer Push-ups', target:50, unit:'Wdh'},
  {id:'w42', level:1, cats:[], title:'Mobility-Woche',
    desc:'An vier Tagen je zehn Minuten dehnen oder Mobility. Hake jeden Tag ab.',
    explanation:'Hüfte, Schultern und Handgelenke brauchen es bei Calisthenics am meisten. Abends vor dem Fernseher zählt auch.',
    metric:'manual', perDay:true, target:4, unit:'Tage'},
  {id:'w43', level:3, cats:['Core'], title:'Drachenflagge',
    desc:'30 Dragon Flag Negatives in einer Woche.',
    explanation:'Oben an einer Bank festhalten und den gestreckten Körper so langsam wie möglich ablassen. Nur die Abwärtsbewegung zählt.',
    metric:'volume_exercise', exName:'Dragon Flag Negatives', target:30, unit:'Wdh'},
  {id:'w44', level:2, cats:['Pull','Core'], title:'Knie zur Brust',
    desc:'100 Hanging Knee Raises in dieser Woche.',
    explanation:'An der Stange hängen und die Knie zur Brust ziehen, ohne zu schwingen. Stärkt Bauch und Griff gleichzeitig.',
    metric:'volume_exercise', exName:'Hanging Knee Raises', target:100, unit:'Wdh'},
  {id:'w45', level:1, cats:[], title:'Etwas Neues',
    desc:'Trag diese Woche zwei Übungen ein, die du noch nie gemacht hast.',
    explanation:'Es zählt jede Übung, die in deinem Verlauf zum ersten Mal auftaucht. In der Übungsliste ist bestimmt etwas dabei.',
    metric:'new_exercises_week', target:2, unit:'Übungen'},
  {id:'w46', level:1, cats:['Legs'], title:'Waden',
    desc:'300 Calf Raises in dieser Woche.',
    explanation:'Auf eine Stufe stellen, ganz hoch und ganz tief. Geht nebenbei beim Zähneputzen.',
    metric:'volume_exercise', exName:'Calf Raises', target:300, unit:'Wdh'},
  {id:'w47', level:4, cats:['Push','Skills'], title:'Freier Handstand',
    desc:'Sammle 60 Sekunden freien Handstand.',
    explanation:'Nur Handstände ohne Wand zählen, jede Sekunde wird addiert. Auch drei Sekunden sind ein Satz.',
    metric:'volume_exercise', exName:'Handstand Hold (frei)', target:60, unit:'Sek'},
  {id:'w48', level:2, cats:[], title:'Zehntausend Schritte',
    desc:'An fünf Tagen mindestens 10.000 Schritte. Hake jeden Tag ab.',
    explanation:'Dein Handy zählt mit. Ein Spaziergang nach dem Essen bringt meist schon 3.000.',
    metric:'manual', perDay:true, target:5, unit:'Tage'},
  {id:'w49', level:4, cats:['Push'], title:'Kopfstand-Drücken',
    desc:'30 Handstand Push-ups in einer Woche.',
    explanation:'An der Wand, der Kopf geht bis kurz über den Boden und wieder hoch. Halbe Wiederholungen zählen nicht.',
    metric:'volume_exercise', exName:'Handstand Push-ups', target:30, unit:'Wdh'},
  {id:'w50', level:1, cats:[], title:'Abendschicht',
    desc:'Zwei Einheiten nach 19 Uhr.',
    explanation:'Für alle, die tagsüber keine Zeit haben. Es zählt die Uhrzeit, zu der du die Einheit speicherst.',
    metric:'sessions_by_hour', afterHour:19, target:2, unit:'Einheiten'},
  {id:'w51', level:1, cats:['Pull'], title:'Langsam runter',
    desc:'40 negative Klimmzüge in dieser Woche.',
    explanation:'Hochspringen oder hochsteigen und dann in drei bis fünf Sekunden ablassen. Der schnellste Weg zum ersten echten Klimmzug.',
    metric:'volume_exercise', exName:'Negative Klimmzuge', target:40, unit:'Wdh'},
  {id:'w52', level:1, cats:['Core'], title:'Superman',
    desc:'Sammle fünf Minuten Superman Hold.',
    explanation:'Bauchlage, Arme und Beine leicht anheben. Trainiert den unteren Rücken, den die meisten vergessen.',
    metric:'volume_exercise', exName:'Superman Hold', target:300, unit:'Sek'},
  {id:'w53', level:2, cats:['Legs'], title:'Sprungkraft',
    desc:'150 Jump Squats in einer Woche.',
    explanation:'Tief runter, explosiv hoch, weich landen. Lieber fünf saubere Sätze à zehn als drei hektische à 50.',
    metric:'volume_exercise', exName:'Jump Squats', target:150, unit:'Wdh'},
  {id:'w54', level:1, cats:['Push'], title:'Bank-Dips',
    desc:'150 Bank-Dips in dieser Woche.',
    explanation:'Hände hinter dir auf eine Bank oder einen Stuhl. Gestreckte Beine machen es schwerer, angewinkelte leichter.',
    metric:'volume_exercise', exName:'Dips (Bench)', target:150, unit:'Wdh'},
  {id:'w55', level:1, cats:[], title:'Zu zweit',
    desc:'Trainiere einmal zusammen mit einer anderen Person.',
    explanation:'Freund, Nachbarin oder jemand aus dem Park. Zu zweit hält man länger durch und schummelt weniger.',
    metric:'manual', target:1, unit:'Mal'},
  {id:'w56', level:3, cats:[], title:'Fünf Trainingstage',
    desc:'Trainiere an fünf verschiedenen Tagen dieser Woche.',
    explanation:'Nicht jeder Tag muss hart sein. Leichte Tage mit Technik oder Mobility zählen genauso, solange du sie einträgst.',
    metric:'workouts_this_week', target:5, unit:'Tage'},
  {id:'w57', level:2, cats:['Push','Skills'], title:'Planche Lean',
    desc:'Sammle drei Minuten Planche Lean.',
    explanation:'Liegestütz-Position, die Schultern weit vor die Hände schieben, Arme gestreckt. Die erste Stufe zur Planche.',
    metric:'volume_exercise', exName:'Planche Lean', target:180, unit:'Sek'},
  {id:'w58', level:3, cats:['Pull'], title:'Zug-Zirkel',
    desc:'In einer Einheit acht Runden aus 5 Klimmzügen und 10 Australian Rows, in höchstens 20 Minuten.',
    explanation:'Gezählt werden volle Runden aus beidem. Pausen sind erlaubt, aber die Uhr läuft.',
    metric:'rounds_in_session', maxDur:1200, target:8, unit:'Runden',
    parts:[{ex:'Klimmzuge', n:5}, {ex:'Australian Rows', n:10}]},
  {id:'w59', level:2, cats:['Core'], title:'V-Ups',
    desc:'150 V-Ups in dieser Woche.',
    explanation:'Hände und Füße treffen sich oben über der Hüfte. Wenn es nicht mehr geht, die Knie leicht beugen.',
    metric:'volume_exercise', exName:'V-Ups', target:150, unit:'Wdh'},
  {id:'w60', level:2, cats:[], title:'Zuckerpause',
    desc:'Fünf Tage ohne Süßigkeiten und Softdrinks. Hake jeden geschafften Tag ab.',
    explanation:'Obst ist erlaubt. Die ersten zwei Tage sind die schwersten, danach wird es leichter.',
    metric:'manual', perDay:true, target:5, unit:'Tage'},
  {id:'w61', level:3, cats:['Legs'], title:'Nordic-Woche',
    desc:'30 Nordic Curl Negatives in dieser Woche.',
    explanation:'Füße unter etwas Festem einhaken, aufrecht knien und so langsam wie möglich nach vorne kippen. Die Hände fangen dich ab.',
    metric:'volume_exercise', exName:'Nordic Curl Negatives', target:30, unit:'Wdh'},
  {id:'w62', level:2, cats:['Push'], title:'Dreißig am Stück',
    desc:'Schaffe einen Satz mit 30 Liegestützen.',
    explanation:'Gezählt wird dein bester Einzelsatz der Woche. Brust bis knapp über den Boden, oben die Arme ganz strecken.',
    metric:'best_set', exName:'Liegestutze', target:30, unit:'Wdh'},
  {id:'w63', level:1, cats:['Legs'], title:'Zwei Beintage',
    desc:'Trainiere an zwei Tagen dieser Woche Beine.',
    explanation:'Ein Tag zählt, sobald du mindestens eine Beinübung einträgst: Kniebeugen, Lunges, Waden oder alles andere aus der Gruppe Legs.',
    metric:'category_workouts', catName:'Legs', target:2, unit:'Tage'},
  {id:'w64', level:3, cats:['Pull','Skills'], title:'Tuck Front Lever',
    desc:'Sammle 90 Sekunden Tuck Front Lever.',
    explanation:'An der Stange hängen, Knie an die Brust, der Rücken waagerecht. Die Sekunden aller Sätze werden addiert.',
    metric:'volume_exercise', exName:'Tuck Front Lever Hold', target:90, unit:'Sek'},
  {id:'w65', level:2, cats:['Core'], title:'Rollout',
    desc:'80 Ab Wheel Rollouts in dieser Woche.',
    explanation:'Ohne Rad geht es mit einem Handtuch auf glattem Boden. Nur so weit rausrollen, wie der Rücken gerade bleibt.',
    metric:'volume_exercise', exName:'Ab Wheel Rollout', target:80, unit:'Wdh'},
  {id:'w66', level:1, cats:[], title:'Früh ins Bett',
    desc:'An fünf Abenden vor 23 Uhr schlafen gehen. Hake jeden Abend ab.',
    explanation:'Muskeln wachsen im Schlaf, nicht beim Training. Abhaken geht auch am nächsten Morgen.',
    metric:'manual', perDay:true, target:5, unit:'Tage'},
  {id:'w67', level:3, cats:['Legs'], title:'Shrimp-Woche',
    desc:'40 Shrimp Squats in dieser Woche.',
    explanation:'Einbeinige Kniebeuge, den Fuß des hinteren Beins hältst du mit der Hand fest. Jedes Bein zählt einzeln.',
    metric:'volume_exercise', exName:'Shrimp Squat', target:40, unit:'Wdh'},
  {id:'w68', level:3, cats:['Push'], title:'Pseudo-Planche',
    desc:'60 Pseudo Planche Push-ups in einer Woche.',
    explanation:'Hände auf Hüfthöhe, Finger zeigen nach hinten, Schultern weit vor den Händen. Schon fünf saubere Wiederholungen sind hart.',
    metric:'volume_exercise', exName:'Pseudo Planche Push-ups', target:60, unit:'Wdh'},
  {id:'w69', level:1, cats:[], title:'Sechs verschiedene',
    desc:'Eine Einheit mit mindestens sechs verschiedenen Übungen.',
    explanation:'Ein Satz pro Übung reicht. Gute Gelegenheit, mal alles durchzuprobieren.',
    metric:'distinct_exercises_session', target:6, unit:'Übungen'},
  {id:'w70', level:3, cats:['Skills'], title:'Zwei Skills',
    desc:'Trainiere diese Woche zwei verschiedene Skills.',
    explanation:'Alles aus der Gruppe Skills zählt: Back Lever, Human Flag, Frog Stand, Muscle-Up-Übergang und mehr.',
    metric:'skills_this_week', target:2, unit:'Skills'},
  {id:'w71', level:3, cats:['Pull'], title:'Weit gegriffen',
    desc:'40 weite Klimmzüge in dieser Woche.',
    explanation:'Hände deutlich breiter als die Schultern. Brust zur Stange, nicht nur das Kinn drüber. Nur die weite Variante zählt.',
    metric:'volume_exercise', exName:'Klimmzuge (weit)', target:40, unit:'Wdh'},
  {id:'w72', level:2, cats:[], title:'Laufwoche',
    desc:'Zwei Läufe von mindestens drei Kilometern. Hake jeden Lauf ab.',
    explanation:'Das Tempo ist egal, Gehpausen sind erlaubt. Gut für die Ausdauer, die bei Zirkeln oft fehlt.',
    metric:'manual', perDay:true, target:2, unit:'Läufe'},
  {id:'w73', level:3, cats:['Core','Pull'], title:'Füße zur Stange',
    desc:'50 Toes to Bar in einer Woche.',
    explanation:'Gestreckte Beine, bis die Füße die Stange berühren. Schwung aus der Hüfte ist okay, aus dem ganzen Körper nicht.',
    metric:'volume_exercise', exName:'Toes to Bar', target:50, unit:'Wdh'},
  {id:'w74', level:2, cats:['Legs'], title:'Kniebeugen-Viertelstunde',
    desc:'150 Kniebeugen in einer Einheit, die höchstens 15 Minuten dauert.',
    explanation:'Zum Beispiel sechs Sätze à 25 mit kurzen Pausen. Einheiten ohne gemessene Dauer zählen auch.',
    metric:'volume_session_ex', exName:'Kniebeugen', maxDur:900, target:150, unit:'Wdh'},
  {id:'w75', level:2, cats:['Push'], title:'Enge Liegestütze',
    desc:'80 enge Liegestütze in dieser Woche.',
    explanation:'Hände unter den Schultern, Ellbogen am Körper. Nur die enge Variante zählt.',
    metric:'volume_exercise', exName:'Liegestutze (eng)', target:80, unit:'Wdh'},
  {id:'w76', level:2, cats:[], title:'Lange Einheit',
    desc:'Eine Einheit von mindestens 45 Minuten.',
    explanation:'Zählt über die gemessene Trainingsdauer. Starte und beende die Einheit also mit dem Timer.',
    metric:'longest_session_min', target:45, unit:'Min'},
  {id:'w77', level:1, cats:[], title:'Grüne Woche',
    desc:'An fünf Tagen mindestens zwei Portionen Gemüse essen. Hake jeden Tag ab.',
    explanation:'Eine Portion ist ungefähr eine Handvoll. Tiefkühlgemüse zählt genauso.',
    metric:'manual', perDay:true, target:5, unit:'Tage'},
  {id:'w78', level:3, cats:['Pull'], title:'Archer-Klimmzüge',
    desc:'20 Archer Pull-ups in dieser Woche.',
    explanation:'Ein Arm zieht, der andere bleibt fast gestreckt auf der Stange. Jede Seite zählt einzeln.',
    metric:'volume_exercise', exName:'Archer Pull-ups', target:20, unit:'Wdh'},
  {id:'w79', level:1, cats:['Core'], title:'Bergsteiger',
    desc:'Sammle fünf Minuten Mountain Climbers.',
    explanation:'Hohes Tempo, die Hüfte bleibt unten. Sätze von 30 Sekunden sind ideal.',
    metric:'volume_exercise', exName:'Mountain Climbers', target:300, unit:'Sek'},
  {id:'w80', level:2, cats:['Legs'], title:'Box Pistols',
    desc:'60 Box Pistol Squats in dieser Woche.',
    explanation:'Auf einem Bein auf eine Bank oder einen Stuhl setzen und wieder aufstehen. Jedes Bein zählt einzeln.',
    metric:'volume_exercise', exName:'Box Pistol Squat', target:60, unit:'Wdh'},
  {id:'w81', level:4, cats:['Skills'], title:'Back Lever',
    desc:'Sammle 60 Sekunden Back Lever.',
    explanation:'Tuck oder Straddle zählen genauso, solange du es als Back Lever einträgst. Die Schultern vorher gut aufwärmen.',
    metric:'volume_exercise', exName:'Back Lever Hold', target:60, unit:'Sek'},
  {id:'w82', level:1, cats:[], title:'Jeden Tag raus',
    desc:'An sechs Tagen mindestens 20 Minuten draußen bewegen. Spazierengehen zählt. Hake jeden Tag ab.',
    explanation:'Tageslicht hilft beim Schlafen und bei der Laune.',
    metric:'manual', perDay:true, target:6, unit:'Tage'},
  {id:'w83', level:3, cats:['Push'], title:'Hundert Dips in einer Einheit',
    desc:'100 Dips in einer einzigen Einheit.',
    explanation:'So viele Sätze wie nötig. Stange, Ringe oder Bank: Alle Dip-Varianten zählen zusammen.',
    metric:'volume_session_ex', exName:'Dips', target:100, unit:'Wdh'},
  {id:'w84', level:2, cats:['Pull'], title:'Die Minute',
    desc:'Hänge einmal 60 Sekunden am Stück an der Stange.',
    explanation:'Gezählt wird dein bester Einzelsatz Dead Hang. Schultern leicht aktiv, nicht komplett durchhängen.',
    metric:'best_set', exName:'Dead Hang', target:60, unit:'Sek'},
  {id:'w85', level:1, cats:[], title:'Guten Morgen',
    desc:'An drei Tagen direkt nach dem Aufstehen 20 Liegestütze. Hake jeden Tag ab.',
    explanation:'Noch vor dem Kaffee. Macht wacher, als man denkt.',
    metric:'manual', perDay:true, target:3, unit:'Tage'},
  {id:'w86', level:3, cats:['Core'], title:'Drei Minuten Plank',
    desc:'Halte einmal drei Minuten Plank am Stück.',
    explanation:'Gezählt wird dein bester Einzelsatz. Unterarme unter den Schultern, der Po nicht zu hoch.',
    metric:'best_set', exName:'Plank', target:180, unit:'Sek'},
  {id:'w87', level:3, cats:['Legs'], title:'Beinzirkel',
    desc:'In einer Einheit acht Runden aus 20 Kniebeugen, 10 Lunges und 10 Jump Squats, in höchstens 20 Minuten.',
    explanation:'Gezählt werden volle Runden. Die Lunges zählen pro Bein.',
    metric:'rounds_in_session', maxDur:1200, target:8, unit:'Runden',
    parts:[{ex:'Kniebeugen', n:20}, {ex:'Lunges', n:10}, {ex:'Jump Squats', n:10}]},
  {id:'w88', level:2, cats:[], title:'Früher Vogel',
    desc:'Zwei Einheiten vor 8 Uhr morgens.',
    explanation:'Es zählt die Uhrzeit, zu der du die Einheit speicherst. Also vor acht fertig sein.',
    metric:'sessions_by_hour', beforeHour:8, target:2, unit:'Einheiten'},
  {id:'w89', level:2, cats:['Push'], title:'Drück-Zirkel',
    desc:'In einer Einheit sechs Runden aus 10 Liegestützen, 5 Pike Push-ups und 10 Dips, in höchstens 20 Minuten.',
    explanation:'Gezählt werden volle Runden. Bank-Dips zählen auch.',
    metric:'rounds_in_session', maxDur:1200, target:6, unit:'Runden',
    parts:[{ex:'Liegestutze', n:10}, {ex:'Pike Push-ups', n:5}, {ex:'Dips', n:10}]},
  {id:'w90', level:3, cats:['Pull'], title:'Zwölf Chin-Ups',
    desc:'Schaffe einen Satz mit zwölf Chin-Ups.',
    explanation:'Gezählt wird dein bester Einzelsatz der Woche. Ganz unten starten, das Kinn über die Stange.',
    metric:'best_set', exName:'Chin-Ups', target:12, unit:'Wdh'},
  {id:'w91', level:1, cats:[], title:'Neue Sportart',
    desc:'Probier einmal eine Sportart aus, die du noch nie gemacht hast.',
    explanation:'Klettern, Schwimmen, Tanzen, Boxen oder Skaten, Hauptsache neu. Hake es ab, wenn du es gemacht hast.',
    metric:'manual', target:1, unit:'Mal'},
  {id:'w92', level:3, cats:['Core'], title:'Scheibenwischer',
    desc:'60 Windshield Wipers in dieser Woche.',
    explanation:'Am Boden mit angewinkelten Beinen ist es leichter, hängend an der Stange die Königsklasse. Jede Seite zählt.',
    metric:'volume_exercise', exName:'Windshield Wipers', target:60, unit:'Wdh'},
  {id:'w93', level:3, cats:[], title:'Satzmarathon',
    desc:'30 Sätze in einer einzigen Einheit.',
    explanation:'Kurze Sätze, kurze Pausen. Ein EMOM über 30 Minuten bringt dich genau hin.',
    metric:'sets_in_one_workout', target:30, unit:'Sätze'},
  {id:'w94', level:3, cats:['Legs'], title:'Hundert Burpees',
    desc:'100 Burpees in einer Einheit, die höchstens 20 Minuten dauert.',
    explanation:'Zum Beispiel zehn Sätze à zehn. Einheiten ohne gemessene Dauer zählen auch.',
    metric:'volume_session_ex', exName:'Burpees', maxDur:1200, target:100, unit:'Wdh'},
  {id:'w95', level:4, cats:['Skills'], title:'Menschliche Fahne',
    desc:'Sammle 30 Sekunden Human Flag.',
    explanation:'Jede Variante zählt, auch mit angezogenen Beinen. Nur an einem stabilen senkrechten Pfosten, nie an wackligen Stangen.',
    metric:'volume_exercise', exName:'Human Flag Hold', target:30, unit:'Sek'},
  {id:'w96', level:1, cats:[], title:'Einbeinig',
    desc:'An vier Tagen je eine Minute pro Bein auf einem Bein stehen, mit geschlossenen Augen. Hake jeden Tag ab.',
    explanation:'Klingt lächerlich, bis man es probiert. Trainiert Gleichgewicht und Fußgelenke und hilft gegen Umknicken.',
    metric:'manual', perDay:true, target:4, unit:'Tage'},
  {id:'w97', level:3, cats:['Pull'], title:'Hundert Klimmzüge',
    desc:'100 Klimmzüge in einer Woche.',
    explanation:'Rund 20 pro Tag an fünf Tagen. Alle Griffvarianten zählen.',
    metric:'volume_exercise', exName:'Klimmzuge', target:100, unit:'Wdh'},
  {id:'w98', level:4, cats:['Push','Skills'], title:'Tuck Planche',
    desc:'Sammle 60 Sekunden Tuck Planche.',
    explanation:'Hände am Boden oder an Parallettes, Knie an die Brust, Füße in der Luft. Die Handgelenke vorher gut aufwärmen.',
    metric:'volume_exercise', exName:'Tuck Planche Hold', target:60, unit:'Sek'},
  {id:'w99', level:2, cats:[], title:'Vier Gruppen',
    desc:'Eine Einheit mit Übungen aus vier verschiedenen Gruppen.',
    explanation:'Zum Beispiel Pull, Push, Core und Legs in einem Ganzkörpertraining.',
    metric:'categories_in_session', target:4, unit:'Gruppen'},
  {id:'w100', level:4, cats:[], title:'Hundert Sätze',
    desc:'Sammle 100 Sätze in dieser Woche.',
    explanation:'Für alle, die viel trainieren: fünf Einheiten mit je 20 Sätzen oder vier mit je 25.',
    metric:'sets_this_week', target:100, unit:'Sätze'}
];

// Wie gezählt wird (Meta-Zeile unter dem Titel)
var WOCHEN_HOW = {
  volume_exercise:'Wochensumme', sets_this_week:'Wochensumme',
  workouts_this_week:'Trainingstage', category_workouts:'Trainingstage', days_with_volume:'Trainingstage',
  best_set:'Bester Satz',
  volume_session_ex:'Eine Einheit', rounds_in_session:'Eine Einheit', sets_in_one_workout:'Eine Einheit',
  distinct_exercises_session:'Eine Einheit', categories_in_session:'Eine Einheit', longest_session_min:'Eine Einheit',
  sessions_by_hour:'Uhrzeit', balance_week:'Ganze Woche', categories_this_week:'Ganze Woche',
  new_exercises_week:'Ganze Woche', skills_this_week:'Ganze Woche', manual:'Abhaken'
};

var wochenState = null; // {week:'2026-W39', swapped:false, checkins:[], claimed:false}

function wochenLoad(){
  try{
    var s = JSON.parse(localStorage.getItem('cali_wochen') || 'null');
    if(s && s.week) wochenState = s;
  }catch(e){}
}
function wochenSave(){
  try{ localStorage.setItem('cali_wochen', JSON.stringify(wochenState)); }catch(e){}
  if(typeof fbSave === 'function') fbSave();
}
// Zustand der laufenden Woche; beim Wochenwechsel frisch
function wochenCurrent(){
  var key = weeklyKey(new Date());
  if(!wochenState || wochenState.week !== key) wochenState = {week:key, swapped:false, checkins:[], claimed:false};
  if(!Array.isArray(wochenState.checkins)) wochenState.checkins = [];
  return wochenState;
}
// Stand vom Server (loadUserData) mit dem lokalen zusammenführen: neuere Woche gewinnt,
// gleiche Woche = Check-ins vereinigen, getauscht/abgeholt bleibt gesetzt.
function wochenMerge(remote){
  if(!remote || !remote.week) return;
  var local = wochenState;
  if(!local || !local.week || remote.week > local.week){
    wochenState = {week:remote.week, swapped:!!remote.swapped, checkins:Array.isArray(remote.checkins) ? remote.checkins.slice() : [], claimed:!!remote.claimed};
  } else if(remote.week === local.week){
    local.swapped = !!(local.swapped || remote.swapped);
    local.claimed = !!(local.claimed || remote.claimed);
    var cks = Array.isArray(local.checkins) ? local.checkins : [];
    (Array.isArray(remote.checkins) ? remote.checkins : []).forEach(function(d){ if(cks.indexOf(d) < 0) cks.push(d); });
    local.checkins = cks;
  }
  try{ localStorage.setItem('cali_wochen', JSON.stringify(wochenState)); }catch(e){}
  if(typeof buildWochenCard === 'function') buildWochenCard();
}

// Index im Pool für die Woche von d (KW 39/2026 = 0)
function wochenIndex(d){
  var n = Math.round((weeklyMonday(d || new Date()) - WOCHEN_EPOCH) / (7 * 86400000));
  var len = WOCHEN_CHALLENGES.length;
  return ((n % len) + len) % len;
}
// Ersatz beim Tauschen: ab der Gegenseite des Pools die erste mit anderer Hauptgruppe,
// bei schweren Challenges (ab Stufe 3) außerdem höchstens Stufe 2.
function wochenAltIndex(i){
  var len = WOCHEN_CHALLENGES.length, cur = WOCHEN_CHALLENGES[i];
  var key = cur.cats[0] || '';
  for(var k=0;k<len;k++){
    var j = (i + len/2 + k) % len, c = WOCHEN_CHALLENGES[j];
    if(j === i || (c.cats[0] || '') === key) continue;
    if(cur.level >= 3 && c.level > 2) continue;
    return j;
  }
  return (i + 1) % len;
}
function wochenChallenge(){
  var st = wochenCurrent(), i = wochenIndex();
  return WOCHEN_CHALLENGES[st.swapped ? wochenAltIndex(i) : i];
}
function wochenIsManual(ch){ return ch.metric === 'manual'; }

// Fortschritt über calcChallengeProgress: Wochen-Challenge kurz als activeChallenge einsetzen
// (ohne startDate → gezählt ab Montag dieser Woche), danach die eigene Challenge zurück.
function wochenProgress(){
  var ch = wochenChallenge(), st = wochenCurrent();
  var saved = activeChallenge;
  activeChallenge = {id:ch.id, title:ch.title, desc:ch.desc, params:presetParams(ch), checkins:st.checkins};
  try{ return calcChallengeProgress(); }
  catch(e){ return 0; }
  finally{ activeChallenge = saved; }
}

function wochenLocalDate(d){
  return d.getFullYear() + '-' + (d.getMonth() < 9 ? '0' : '') + (d.getMonth() + 1) + '-' + (d.getDate() < 10 ? '0' : '') + d.getDate();
}
// Tage bis Sonntag einschließlich heute (Montag 7, Sonntag 1)
function wochenDaysLeft(){ return 7 - ((new Date().getDay() + 6) % 7); }
function wochenDaysLeftLabel(){
  var n = wochenDaysLeft();
  return n === 1 ? 'heute letzter Tag' : 'noch ' + n + ' Tage';
}
function wochenRewardLabel(){ return '+' + WOCHEN_REWARD_XP + ' XP · +' + WOCHEN_REWARD_DIAMONDS + ' Diamanten'; }
function wochenMetaLabel(ch){
  var lvl = (typeof presetLevelLabel === 'function') ? presetLevelLabel(ch) : '';
  var how = WOCHEN_HOW[ch.metric] || '';
  return [lvl, how].filter(Boolean).join(' · ');
}

// ── Aktionen ──
function wochenCheckin(){
  var ch = wochenChallenge(), st = wochenCurrent();
  if(!wochenIsManual(ch)) return;
  var target = ch.target || 1;
  if(wochenProgress() >= target) return;
  var today = wochenLocalDate(new Date());
  if(ch.perDay && st.checkins.indexOf(today) >= 0){ toast('Heute schon eingetragen'); return; }
  st.checkins.push(today);
  wochenSave();
  var prog = wochenProgress();
  wochenRefresh();
  if(prog >= target){
    if(window.caliMotion && caliMotion.celebrate) caliMotion.celebrate('burst');
    toast('Geschafft! Hol dir deine Belohnung.');
  } else {
    toast('Eingetragen: ' + prog + ' / ' + target + ' ' + ch.unit);
  }
}

function wochenClaim(){
  var ch = wochenChallenge(), st = wochenCurrent();
  if(st.claimed || wochenProgress() < (ch.target || 1)) return;
  var key = 'cali_wochen_claimed_' + st.week;
  var already = false;
  try{ already = !!localStorage.getItem(key); }catch(e){}
  st.claimed = true;
  wochenSave();
  if(!already){
    try{ localStorage.setItem(key, '1'); }catch(e){}
    if(typeof awardXP === 'function'){ try{ awardXP(WOCHEN_REWARD_XP, 'Wochen-Challenge: ' + ch.title); }catch(e){} }
    currency.diamonds = (currency.diamonds || 0) + WOCHEN_REWARD_DIAMONDS;
    saveCurrency();
  }
  wochenCloseSheet();
  if(typeof buildChallengeUI === 'function') buildChallengeUI(); else buildWochenCard();
  showCelebrationOverlay({
    iconName: 'trophy',
    title: 'Wochen-Challenge geschafft',
    big: ch.title,
    sub: 'KW ' + weeklyNum(st.week),
    note: already ? '' : wochenRewardLabel()
  });
}

function wochenSwap(payWith){
  var st = wochenCurrent();
  if(st.swapped || st.claimed) return;
  if(payWith === 'diamonds'){
    if((currency.diamonds || 0) < WOCHEN_SWAP_DIAMONDS) return;
    currency.diamonds -= WOCHEN_SWAP_DIAMONDS;
  } else {
    if((currency.flames || 0) < WOCHEN_SWAP_FLAMES) return;
    currency.flames -= WOCHEN_SWAP_FLAMES;
  }
  saveCurrency();
  st.swapped = true;
  st.checkins = []; // Check-ins gehörten zur alten Challenge
  wochenSave();
  wochenCloseSheet();
  if(typeof buildChallengeUI === 'function') buildChallengeUI(); else buildWochenCard();
  toast('Getauscht: ' + wochenChallenge().title);
}

// ── Karte im Challenge-Tab (#ch-card-week, pages.html) ──
function buildWochenCard(){
  var el = document.getElementById('ch-card-week-inner');
  if(!el) return;
  var ch = wochenChallenge(), st = wochenCurrent();
  var target = ch.target || 1, prog = wochenProgress();
  var pct = Math.min(100, Math.round(prog / target * 100));
  var done = prog >= target;

  var eb = document.getElementById('ch-week-eyebrow');
  if(eb) eb.textContent = 'Wochen-Challenge · KW ' + weeklyNum(st.week);

  el.innerHTML = '';
  var head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px;';
  var title = document.createElement('div');
  title.className = 'ttl';
  title.style.cssText = 'min-width:0;';
  title.textContent = ch.title;
  head.appendChild(title);
  head.insertAdjacentHTML('beforeend', planIconRing(done ? 'trophy' : 'target', 44, 18, done ? 'var(--accent)' : 'var(--muted)'));
  el.appendChild(head);

  var desc = document.createElement('div');
  desc.className = 'row-sub';
  desc.style.cssText = 'margin:0 0 12px;line-height:1.5;';
  desc.textContent = ch.desc;
  el.appendChild(desc);

  var barRow = document.createElement('div');
  barRow.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:8px;';
  barRow.innerHTML = '<div style="flex:1;">' + planSegbarHTML('data-wkbar') + '</div>' +
    '<div class="num" style="font-size:11px;font-weight:600;color:var(--accent);flex-shrink:0;">' + pct + '%</div>';
  el.appendChild(barRow);

  var meta = document.createElement('div');
  meta.className = 'row-sub num';
  meta.style.cssText = 'margin:0;display:flex;justify-content:space-between;gap:10px;';
  var left = document.createElement('span');
  left.textContent = prog + ' / ' + target + ' ' + ch.unit;
  var right = document.createElement('span');
  right.style.cssText = st.claimed ? 'color:var(--accent);font-weight:600;' : '';
  right.textContent = st.claimed ? 'Belohnung abgeholt' : (done ? 'Geschafft!' : wochenDaysLeftLabel());
  meta.appendChild(left);
  meta.appendChild(right);
  el.appendChild(meta);

  if(!st.claimed){
    var reward = document.createElement('div');
    reward.className = 'lbl num';
    reward.style.cssText = 'margin-top:10px;color:var(--accent);';
    reward.textContent = 'Belohnung ' + wochenRewardLabel();
    el.appendChild(reward);
  }

  if(done && !st.claimed){
    var claim = document.createElement('button');
    claim.type = 'button';
    claim.className = 'btn sec pressable';
    claim.style.cssText = 'margin:12px 0 0;';
    claim.textContent = 'Belohnung abholen';
    claim.onclick = function(ev){ ev.stopPropagation(); wochenClaim(); };
    el.appendChild(claim);
  } else if(!done && wochenIsManual(ch)){
    el.appendChild(wochenCheckinButton('margin:12px 0 0;'));
  }

  var fill = el.querySelector('[data-wkbar]');
  if(fill){
    if(window.caliMotion) caliMotion.animateBar(fill, pct);
    else fill.style.width = pct + '%';
  }
}

function wochenCheckinButton(extraCss){
  var ch = wochenChallenge();
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'btn sec pressable';
  b.style.cssText = extraCss || '';
  b.textContent = (ch.target || 1) > 1 ? '+1 eintragen' : 'Erledigt';
  b.onclick = function(ev){ ev.stopPropagation(); wochenCheckin(); };
  return b;
}

// Karte und offenes Sheet neu zeichnen
function wochenRefresh(){
  buildWochenCard();
  if(document.getElementById('wochen-sheet')){ wochenCloseSheet(true); openWochenSheet(true); }
}

// ── Detail-Sheet ──
function wochenCloseSheet(instant){
  var ov = document.getElementById('wochen-sheet');
  if(!ov) return;
  if(instant) ov.remove();
  else sheetOut(ov, ov.querySelector('.sheet'));
}

function openWochenSheet(noAnim){
  wochenCloseSheet(true);
  var ch = wochenChallenge(), st = wochenCurrent();
  var target = ch.target || 1, prog = wochenProgress();
  var pct = Math.min(100, Math.round(prog / target * 100));
  var done = prog >= target;
  var monday = weeklyMonday(new Date());

  var ov = document.createElement('div');
  ov.id = 'wochen-sheet';
  ov.style.cssText = PLAN_BACKDROP_CSS + 'z-index:2000;';
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

  add('div', 'lbl num', 'margin-bottom:8px;', 'Wochen-Challenge · KW ' + weeklyNum(st.week) + ' · ' + weeklyFmt(monday) + ' bis ' + weeklyFmt(weeklyAddDays(monday, 6)));
  add('div', 'ttl', 'margin-bottom:4px;', ch.title);
  add('div', 'row-sub', 'margin:0 0 12px;', wochenMetaLabel(ch));
  add('div', '', 'font-size:13px;color:var(--text);line-height:1.5;margin-bottom:8px;', ch.desc);
  add('div', '', 'font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:16px;', ch.explanation);

  var card = add('div', 'card', 'background:var(--card2);border-color:' + (done ? 'var(--accent)' : 'var(--line)') + ';margin-bottom:14px;');
  card.innerHTML = planSegbarHTML('data-wkbar2') +
    '<div class="row-sub num" style="display:flex;justify-content:space-between;margin:8px 0 0;"><span></span><span></span></div>';
  var spans = card.querySelectorAll('span');
  spans[0].textContent = prog + ' / ' + target + ' ' + ch.unit + ' · ' + pct + '%';
  spans[1].textContent = st.claimed ? 'Belohnung abgeholt' : (done ? 'Geschafft!' : wochenDaysLeftLabel());

  add('div', 'row-sub num', 'margin:0 0 16px;color:' + (st.claimed ? 'var(--muted)' : 'var(--accent)') + ';',
    (st.claimed ? 'Abgeholt: ' : 'Belohnung: ') + wochenRewardLabel() + '. Einmal pro Woche.');

  if(done && !st.claimed){
    var claim = add('button', 'btn pressable', 'margin:0 0 8px;', 'Belohnung abholen');
    claim.type = 'button';
    claim.onclick = wochenClaim;
  } else if(!done && wochenIsManual(ch)){
    box.appendChild(wochenCheckinButton('margin:0 0 8px;'));
  }

  if(!done && !st.claimed){
    if(st.swapped){
      add('div', 'row-sub', 'margin:4px 0 0;text-align:center;', 'Diese Woche schon getauscht.');
    } else {
      var swap = add('button', 'pressable u', PLAN_TEXTBTN_CSS, 'Tauschen: ' + WOCHEN_SWAP_DIAMONDS + ' Diamant oder ' + WOCHEN_SWAP_FLAMES + ' Flammen');
      swap.type = 'button';
      swap.onclick = function(){ openWochenSwapSheet(); };
    }
  }

  var close = add('button', 'pressable u', PLAN_TEXTBTN_CSS, 'Schließen');
  close.type = 'button';
  close.onclick = function(){ wochenCloseSheet(); };

  ov.appendChild(box);
  ov.onclick = function(e){ if(e.target === ov) wochenCloseSheet(); };
  document.body.appendChild(ov);
  if(window.caliMotion && !noAnim) caliMotion.sheetIn(box, ov);
  else if(window.caliMotion){ box.classList.add('sheet-anim', 'sheet-in'); ov.classList.add('backdrop-anim', 'backdrop-in'); }

  var fill = box.querySelector('[data-wkbar2]');
  if(fill){
    if(window.caliMotion && !noAnim) caliMotion.animateBar(fill, pct);
    else fill.style.width = pct + '%';
  }
}

// Tauschen: zeigt die Ersatz-Challenge und beide Zahlwege (wie showSkipModal in app2.js)
function openWochenSwapSheet(){
  var st = wochenCurrent();
  if(st.swapped || st.claimed) return;
  var alt = WOCHEN_CHALLENGES[wochenAltIndex(wochenIndex())];
  var canDia = (currency.diamonds || 0) >= WOCHEN_SWAP_DIAMONDS;
  var canFl = (currency.flames || 0) >= WOCHEN_SWAP_FLAMES;
  if(!canDia && !canFl){
    toast('Zum Tauschen brauchst du ' + WOCHEN_SWAP_DIAMONDS + ' Diamant oder ' + WOCHEN_SWAP_FLAMES + ' Flammen.');
    return;
  }
  confirmSheet({
    title: 'Challenge tauschen?',
    desc: 'Stattdessen bekommst du diese Woche: ' + alt.title + '. ' + alt.desc + ' Tauschen geht einmal pro Woche. Du hast ' + (currency.diamonds || 0) + ' Diamanten und ' + (currency.flames || 0) + ' Flammen.',
    danger: false,
    confirmLabel: canDia ? 'Für ' + WOCHEN_SWAP_DIAMONDS + ' Diamant tauschen' : 'Für ' + WOCHEN_SWAP_FLAMES + ' Flammen tauschen',
    onConfirm: function(){ wochenSwap(canDia ? 'diamonds' : 'flames'); }
  });
  // Zweiter Zahlweg (Flammen), wenn beides geht: Ghost-Button unter dem Haupt-CTA
  var sheet = document.getElementById('cali-confirm-sheet');
  if(sheet && canDia && canFl){
    var box = sheet.querySelector('.sheet');
    var ok = box && box.querySelector('button');
    if(ok){
      var fl = document.createElement('button');
      fl.type = 'button';
      fl.className = 'btn-g pressable';
      fl.style.cssText = 'width:100%;min-height:44px;margin:0 0 4px;';
      fl.textContent = 'Für ' + WOCHEN_SWAP_FLAMES + ' Flammen tauschen';
      fl.onclick = function(){ sheetOut(sheet, box); wochenSwap('flames'); };
      ok.parentNode.insertBefore(fl, ok.nextSibling);
    }
  }
}

wochenLoad();
