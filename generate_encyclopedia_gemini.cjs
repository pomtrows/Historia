require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Nécessite d'installer le SDK Gemini : npm install @google/generative-ai
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialisation de Gemini avec la clé de votre fichier .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `Tu es un historien de renommée mondiale, expert dans toutes les époques.
Ta mission est d'écrire le contenu d'un chapitre d'histoire pour une plateforme d'apprentissage.
Tu dois générer le texte historique LE PLUS LONG ET DÉTAILLÉ POSSIBLE (objectif : 30 000 caractères).
Le texte doit être retourné en HTML pur (sans balises <html> ou <body>) et formatté avec ces balises :
- <p> pour les paragraphes (très longs et développés).
- <h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4"> pour les titres de sections.
- <ul> et <li> pour les listes.
- <blockquote> pour les citations ou faits marquants.
- N'inclut pas le titre principal (H1) du chapitre.

Rédige un contenu académique, captivant, riche en anecdotes, en analyses géopolitiques et sociétales. Ne t'arrête pas avant d'avoir produit une analyse exhaustive.`;

async function generateChapterContent(chapterTitle, epochTitle) {
  try {
    // Utilisation du modèle gemini-3.1-pro-preview comme suggéré
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3.1-pro-preview",
        systemInstruction: SYSTEM_PROMPT
    });
    
    const prompt = `Rédige le chapitre intitulé "${chapterTitle}" qui appartient à l'époque "${epochTitle}".`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Erreur avec l'API Gemini pour le chapitre "${chapterTitle}":`, error.message);
    return null;
  }
}

async function run() {
  console.log("🚀 Démarrage du moteur de génération encyclopédique via GEMINI...");

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERREUR: La clé GEMINI_API_KEY est introuvable dans le fichier .env.");
    console.log("👉 Allez sur https://aistudio.google.com/app/apikey pour en créer une gratuitement.");
    return;
  }

  // 1. Récupérer les chapitres non générés
  const { data: chapters, error } = await supabase
    .from('chapters')
    .select('id, title, epoch_id, epochs(title)')
    .like('content', '%en attente%')
    .order('order');

  if (error) {
    console.error("Erreur récupération:", error);
    return;
  }

  console.log(`📌 Il reste ${chapters.length} chapitres à générer.`);

  for (let i = 0; i < chapters.length; i++) {
    const chap = chapters[i];
    const epochTitle = chap.epochs ? chap.epochs.title : "Époque Inconnue";
    
    console.log(`\n⏳ [${i+1}/${chapters.length}] Génération de : "${chap.title}" (${epochTitle})`);
    
    const generatedHtml = await generateChapterContent(chap.title, epochTitle);

    if (generatedHtml) {
      // Nettoyage des blocs markdown de code
      let cleanHtml = generatedHtml.replace(/^```html/gm, '').replace(/^```/gm, '').trim();

      const { error: updateErr } = await supabase
        .from('chapters')
        .update({ content: cleanHtml })
        .eq('id', chap.id);
        
      if (updateErr) {
        console.error("❌ Erreur de sauvegarde Supabase :", updateErr);
      } else {
        console.log("✅ Sauvegarde réussie dans la base de données !");
      }
      
      // Pause de 15 secondes pour respecter les quotas de l'API gratuite Gemini 3.1 Pro
      console.log("Pause de 15 secondes (Quotas API)...");
      await new Promise(resolve => setTimeout(resolve, 15000));
    } else {
      console.log("⚠️ Échec de génération, pause de 60 secondes avant le prochain...");
      await new Promise(resolve => setTimeout(resolve, 60000));
      // On décrémente i pour retenter ce chapitre
      i--;
    }
  }

  console.log("🎉 Terminé ! L'encyclopédie a été entièrement générée.");
}

run();
