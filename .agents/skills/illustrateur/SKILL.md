---
name: illustrateur
description: Génère et insère un ensemble de 8 à 10 illustrations en peinture à l'huile historique (2D plate, sans cadre, sans texte) parfaitement synchronisées avec le récit d'un chapitre d'histoire et hébergées sur Supabase Storage. À utiliser quand l'utilisateur demande d'"illustrer le chapitre X" ou "générer les illustrations pour le chapitre Y".
---

# 🎨 Skill Illustrateur : Direction Artistique & Narration Visuelle

Ce skill transforme un chapitre d'histoire en une expérience visuelle immersive digne des plus grands ouvrages d'art et des manuels de référence, en générant **8 à 10 illustrations en peinture à l'huile** et en les ancrant **chirurgicalement dans le texte**.

---

## 💎 Les 5 Règles d'Or de l'Illustrateur

### 1. 🖼️ Style Peinture à l'Huile Historique (Grands Maîtres)
- **Esthétique** : Texture de peinture à l'huile riche (touches de pinceau visibles, empâtements, clair-obscur dramatique, lumière naturelle cinématographique).
- **Inspirations artistiques selon l'époque** :
  - *Antiquité & Perse/Grèce/Rome* : Rembrandt, Jacques-Louis David, Jean-Léon Gérôme, Lawrence Alma-Tadema.
  - *Moyen Âge & Renaissance* : Pieter Brueghel, Rubens, Gustave Doré.
  - *Époques modernes & Révolutions* : Eugène Delacroix, Théodore Géricault.

### 2. 📐 Cadrage 2D Plat Strict (Zéro 3D / Zéro Mockup)
- **Format** : Plein cadre rectangulaire panoramique (**16:9** ou **4:3**) bord à bord.
- **Interdictions absolues** :
  - ❌ **JAMAIS d'effet de toile 3D** en perspective ou de tranche de tableau.
  - ❌ **JAMAIS d'encadrement en bois**, de moulure, de dorure ou de passe-partout.
  - ❌ **JAMAIS de fond de mur** de galerie ou de musée.
  - ❌ **JAMAIS de texte**, titre, cartouche ou fausse signature incrustée dans l'image.

### 3. 🎯 Ancrage Narratif Chirurgical
- L'IA analyse le texte du chapitre et identifie les **8 à 10 scènes narratives les plus poignantes et visuelles** réparties à travers les 4 Actes.
- Chaque illustration est insérée **immédiatement après le paragraphe exact qui décrit cette scène**, garantissant une concordance texte-image parfaite.

### 4. ☁️ Hébergement Cloud Supabase & Anti-Cache
- Les images générées sont automatiquement téléversées sur le bucket public **Supabase Storage** (`historia-images` sous `illustrations/chapitre_<ID>/`).
- Un identifiant timestampé unique est attribué à chaque image pour contourner immédiatement les caches de navigateur (Cache-Busting).

### 5. 🔍 Balisage HTML & Rendu Frontend
Chaque image est intégrée avec le balisage responsive officiel d'Historia :
```html
<figure class="my-12 overflow-hidden rounded-2xl shadow-2xl border border-amber-900/20 bg-slate-900/5 group">
  <img src="[URL_SUPABASE]" alt="[Description]" class="w-full h-auto max-h-[580px] object-cover object-center transform group-hover:scale-[1.01] transition-transform duration-500 cursor-zoom-in" />
  <figcaption class="p-3 text-center text-sm font-serif italic text-slate-600 border-t border-amber-900/10 bg-amber-50/40">🎨 [Légende historique de la scène]</figcaption>
</figure>
```
*Le clic sur l'image déclenche automatiquement la modale de zoom plein écran haute définition.*

---

## 🚀 Utilisation en Ligne de Commande

Pour générer l'ensemble des illustrations d'un chapitre :

```powershell
node generate_illustrations.cjs <CHAPTER_ID_OU_ORDER>
```

Exemple pour le chapitre 2 (Athènes) :
```powershell
node generate_illustrations.cjs 2
```
