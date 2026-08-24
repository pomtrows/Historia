---
name: historien
description: >-
  Génère des chapitres d'histoire exclusivement au format Monumental (Roman-Fleuve de 50 000 à 70 000+ caractères en 4 Actes, frise de 10 dates, quiz de 20 questions, 10+ annexes d'art, et batch final de relecture/correction orthographique).
  À utiliser quand l'utilisateur demande de "générer le chapitre X" ou "historien rédige le chapitre Y".
---

# 🏛️ Compétence : Historien (Générateur Monumental de Chapitres)

## 💎 Les 4 Piliers Inviolables du Format Monumental

### 1. 📏 Volume et Immersion Roman-Fleuve (50 000 à 70 000+ caractères)
- Structuré en **4 Actes majeurs** rédigés avec la force dramatique d'une série HBO (*Rome*, *Shōgun*) et la richesse stylistique des grands maîtres (Marguerite Yourcenar, Victor Hugo).
- Alternance permanente entre la **haute stratégie politique/militaire** et la **vie intime et sensorielle des humbles** ("Show, don't tell").

### 2. ⏳ Concordance Absolue Frise <-> Leçon (Règle d'or)
- **Tout ce qui figure dans la frise chronologique (les 10 dates/événements clés) DOIT être développé dans la leçon**.
- Aucun événement ou personnage de la frise ne peut être passé sous silence dans le récit.
- **Noms de la frise en gras** : Les noms propres de personnages, souverains, généraux et cités clés figurant dans la frise doivent être mis en évidence en gras (`<strong>Nom</strong>`) dans les paragraphes normaux de la leçon, mais **JAMAIS à l'intérieur des encarts d'anecdotes (`<blockquote>`)** qui doivent rester en texte italique pur, fluide et continu.

### 3. 📅 Présence Obligatoire des Dates en Gras dans le Corps du Récit
- L'historien doit **explicitement intégrer les repères temporels et dates** au fil de la narration (ex: années de règnes, tournants d'alliances, jours de batailles, traités).
- **Format obligatoire des dates** : Toutes les dates doivent être mises en gras dans le texte HTML :
  - `<strong>508 av. J.-C.</strong>`, `<strong>vers 478 av. J.-C.</strong>`, `<strong>le 15 mars 44 av. J.-C.</strong>`, `<strong>en 31 av. J.-C.</strong>`, etc.

### 4. 🧠 Pédagogie et Culture Complètes
- **1 Frise chronologique** de 10 événements capitaux (`timeline_data`).
- **1 Quiz d'intrigue** de 20 questions scénarisées avec explications détaillées (`quizzes`).
- **1 Galerie de 10 à 12 Reliques d'Art et d'Archéologie** décortiquées (`annexes`).
- **1 Passe de Relecture Éditoriale Intégrale** (grammaire, orthographe, accords, élisions).

### 5. 🎯 Délimitation Stricte et Non-Redondance Inter-Chapitres
- L'historien reçoit systématiquement le **syllabus complet de l'époque**.
- **Chaque chapitre a ses frontières chronologiques et thématiques étanches** : il est formellement interdit de réécrire les scènes, personnages ou concepts majeurs qui font l'objet des chapitres précédents ou suivants (ex: la domestication du feu appartient au Chapitre 3, Néandertal au Chapitre 4, l'art pariétal au Chapitre 8, la révolution agricole au Chapitre 13).
- Seules de brèves transitions de liaison sont admises.

---

## 🚀 Utilisation en Ligne de Commande

```powershell
node generate_historien.cjs <CHAPTER_ID_OU_ORDER>
```

Exemple :
```powershell
node generate_historien.cjs 2
```
