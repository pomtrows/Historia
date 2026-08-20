require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Pour utiliser ce script, vous devrez installer le SDK d'OpenAI : npm install openai
// et ajouter OPENAI_API_KEY=sk-xxxx dans votre fichier .env
const { OpenAI } = require('openai');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialisation d'OpenAI (Assurez-vous que la clé est dans le .env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Prompt système pour garantir un formatage HTML parfait et une longueur maximale
const SYSTEM_PROMPT = `Tu es un historien de renommée mondiale, expert dans toutes les époques.
Ta mission est d'écrire le contenu d'un chapitre d'histoire pour une plateforme d'apprentissage.
Tu dois générer le texte historique LE PLUS LONG ET DÉTAILLÉ POSSIBLE (objectif : 30 000 caractères).
Le texte doit être retourné en HTML pur (sans balises <html> ou <body>) et formatté avec ces balises :
- <p> pour les paragraphes (très longs et développés).
- <h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4"> pour les titres de sections.
- <ul> et <li> pour les listes.
- <blockquote> pour les citations ou faits marquants.
- N'inclut pas le titre principal (H1) du chapitre.

Rédige un contenu académique, captivant, riche en anecdotes, en analyses géopolitiques et sociétales.`;

async function generateChapterContent(chapterTitle, epochTitle) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // ou gpt-4o
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Rédige le chapitre intitulé "${chapterTitle}" qui appartient à l'époque "${epochTitle}".` }
      ],
      temperature: 0.7,
      max_tokens: 4096, // Maximum par appel (pour atteindre 30k caractères, il faudrait idéalement faire plusieurs requêtes consécutives)
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Erreur avec l'API OpenAI pour le chapitre "${chapterTitle}":`, error.message);
    return null;
  }
}

async function run() {
  console.log("🚀 Démarrage du moteur de génération encyclopédique...");

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ ERREUR: La clé OPENAI_API_KEY est introuvable dans le fichier .env.");
    console.log("Veuillez l'ajouter pour lancer la génération automatique.");
    return;
  }

  // 1. Récupérer les chapitres dont le contenu n'a pas encore été généré
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

  // 2. Boucle de génération (1 par 1 pour ne pas surcharger l'API)
  for (let i = 0; i < chapters.length; i++) {
    const chap = chapters[i];
    const epochTitle = chap.epochs ? chap.epochs.title : "Époque Inconnue";
    
    console.log(`\n⏳ [${i+1}/${chapters.length}] Génération de : "${chap.title}" (${epochTitle})`);
    
    const generatedHtml = await generateChapterContent(chap.title, epochTitle);

    if (generatedHtml) {
      // 3. Sauvegarde dans Supabase
      const { error: updateErr } = await supabase
        .from('chapters')
        .update({ content: generatedHtml })
        .eq('id', chap.id);
        
      if (updateErr) {
        console.error("Erreur de sauvegarde Supabase :", updateErr);
      } else {
        console.log("✅ Sauvegarde réussie !");
      }
    }

    // Pause de 5 secondes pour éviter le rate-limiting de l'API
    console.log("Pause de 5 secondes...");
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  console.log("🎉 Terminé ! L'encyclopédie a été entièrement générée.");
}

run();
