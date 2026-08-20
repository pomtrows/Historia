require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// On va générer un texte extrêmement long (30 000+ caractères)
function generateMassiveContent() {
  let content = `
    <h1>Chapitre 1 : L'Aube de l'Humanité - Une Odyssée de 7 Millions d'Années</h1>
    <p class="intro">Bienvenue dans le premier chapitre de notre voyage. Nous allons plonger dans les profondeurs du temps...</p>
  `;

  const sections = [
    { title: "1. Le Berceau Africain et la Vallée du Grand Rift", subject: "l'environnement et les premiers hominidés" },
    { title: "2. Sahelanthropus tchadensis : Toumaï, le pionnier", subject: "la bipédie naissante et la divergence avec les grands singes" },
    { title: "3. Orrorin et Ardipithecus : Les marcheurs de l'aube", subject: "les adaptations forestières et la marche" },
    { title: "4. Les Australopithèques : La diversité d'Afar", subject: "Lucy, le dimorphisme sexuel et le climat" },
    { title: "5. Paranthropus : L'impasse de la spécialisation", subject: "les robustes mangeurs de racines" },
    { title: "6. Homo habilis : Le premier artisan", subject: "la culture oldowayenne et l'expansion cérébrale" },
    { title: "7. Homo rudolfensis : La diversité du genre Homo", subject: "la complexité de l'arbre généalogique" },
    { title: "8. Homo erectus : Le grand voyageur", subject: "la maîtrise du feu et la conquête de l'Eurasie" },
    { title: "9. L'Acheuléen : L'art du biface", subject: "la symétrie, l'esthétisme primitif et la chasse" },
    { title: "10. La domestication du feu : Une révolution énergétique", subject: "la cuisson, le foyer, et la sociabilité" },
    { title: "11. Homo heidelbergensis : L'ancêtre commun", subject: "les prémices de Sapiens et Néandertal" },
    { title: "12. L'Homme de Néandertal : Le maître du froid", subject: "la culture moustérienne, les sépultures et l'anatomie" },
    { title: "13. Les Dénisoviens : Les fantômes de l'Altaï", subject: "l'ADN ancien et les hybridations" },
    { title: "14. Homo floresiensis : Le Hobbit de l'île de Flores", subject: "le nanisme insulaire et les mystères de l'évolution" },
    { title: "15. Homo sapiens : L'émergence de notre espèce", subject: "l'anatomie moderne et la révolution cognitive" },
    { title: "16. La révolution cognitive : Langage et abstraction", subject: "la capacité de fiction et d'organisation à grande échelle" },
    { title: "17. L'Art Pariétal : Les premières chapelles Sixtines", subject: "Chauvet, Lascaux et l'expression symbolique" },
    { title: "18. L'Out of Africa 2 : La conquête de la planète", subject: "l'Australie, les Amériques et la traversée des océans" },
    { title: "19. La disparition de la mégafaune", subject: "l'impact écologique des premiers chasseurs-cueilleurs" },
    { title: "20. L'aube du Néolithique : Vers la sédentarisation", subject: "la fin de la Préhistoire et les prémices de l'agriculture" }
  ];

  // Génération de paragraphes très détaillés pour chaque section pour atteindre 30k caractères
  const generateLongParagraphs = (subject) => {
    let text = "";
    for(let i=0; i<10; i++) {
      text += `<p>L'étude de ${subject} est absolument fascinante lorsqu'on se penche sur les découvertes paléontologiques de ces dernières décennies. Les fouilles archéologiques ont permis de mettre au jour des fossiles incroyables qui remettent constamment en question nos modèles établis. L'analyse isotopique des sols, la datation au carbone 14 pour les périodes récentes, et les méthodes par argon-argon pour les couches volcaniques anciennes ont révolutionné notre compréhension. ${subject} ne s'explique pas par un seul facteur, mais par une convergence de pressions évolutives : changements climatiques, tectonique des plaques, variations de l'orbite terrestre (cycles de Milankovitch) et mutations génétiques aléatoires qui ont été sélectionnées par l'environnement impitoyable de l'époque. Chaque fragment d'os, chaque outil de pierre taillée découvert est une lettre d'un alphabet disparu qu'il nous faut déchiffrer. La complexité de ${subject} démontre que l'évolution humaine n'est pas une ligne droite vers la perfection, mais un buisson touffu fait d'essais, d'erreurs, d'impasses et d'hybridations complexes.</p>`;
    }
    return text;
  };

  sections.forEach(sec => {
    content += `<h2>${sec.title}</h2>`;
    content += generateLongParagraphs(sec.subject);
  });

  return content;
}

async function run() {
  console.log("Génération du contenu massifs (30 000+ caractères)...");
  const htmlContent = generateMassiveContent();
  console.log(`Longueur générée : ${htmlContent.length} caractères.`);

  // On s'assure qu'une époque existe
  const { data: epochs, error: epochErr } = await supabase.from('epochs').select('id').limit(1);
  if (epochErr) {
    console.error("Erreur Epochs:", epochErr);
    return;
  }
  
  let epochId = epochs.length > 0 ? epochs[0].id : null;

  if (!epochId) {
    console.log("Aucune époque trouvée, création d'une époque de test...");
    const { data: newEpoch } = await supabase.from('epochs').insert([{ title: "La Préhistoire", description: "Test", order: 1 }]).select().single();
    epochId = newEpoch.id;
  }

  console.log("Insertion dans Supabase...");
  const { data, error } = await supabase
    .from('chapters')
    .insert([
      { 
        title: "Chapitre 1 : L'Aube de l'Humanité (30k+ chars)", 
        content: htmlContent, 
        map_url: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200", 
        epoch_id: epochId,
        order: 1 
      }
    ])
    .select();

  if (error) {
    console.error("Erreur d'insertion :", error);
  } else {
    console.log("Succès ! Chapitre inséré avec l'ID:", data[0].id);
  }
}

run();
