require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const questionsData = [
  {
    question_text: "Quel ouvrage fondateur de 1859 a posé le cadre scientifique de l'évolution par sélection naturelle ?",
    option_a: "Le Gène égoïste",
    option_b: "L'Origine des espèces",
    option_c: "De la nature des choses",
    option_d: "L'Histoire naturelle",
    correct_option: "B",
    explanation: "Charles Darwin publie L'Origine des espèces en 1859, révolutionnant la biologie."
  },
  {
    question_text: "Quel changement géologique majeur a bouleversé l'Est de l'Afrique à la fin du Miocène ?",
    option_a: "La création du désert du Sahara",
    option_b: "L'ouverture de la vallée du Grand Rift",
    option_c: "La formation de l'Himalaya",
    option_d: "La fermeture du détroit de Gibraltar",
    correct_option: "B",
    explanation: "Le Grand Rift a bloqué les vents humides, asséchant l'Afrique de l'Est et favorisant la savane."
  },
  {
    question_text: "Comment s'appelle la théorie d'Yves Coppens liant l'assèchement du climat à l'apparition de la bipédie ?",
    option_a: "West Side Story",
    option_b: "East Side Story",
    option_c: "La théorie de la savane primitive",
    option_d: "Le grand assèchement",
    correct_option: "B",
    explanation: "East Side Story postule que l'isolement à l'Est du Rift a forcé nos ancêtres à s'adapter à la savane."
  },
  {
    question_text: "Qui est surnommé 'Le Doyen' de l'humanité, daté de 7 millions d'années et découvert au Tchad ?",
    option_a: "Lucy",
    option_b: "Orrorin",
    option_c: "Toumaï",
    option_d: "Ardi",
    correct_option: "C",
    explanation: "Toumaï (Sahelanthropus tchadensis) est le plus ancien représentant potentiel de notre lignée."
  },
  {
    question_text: "Quel détail anatomique prouve que Toumaï pouvait probablement se tenir debout ?",
    option_a: "La longueur de ses fémurs",
    option_b: "La position avancée de son trou occipital",
    option_c: "La courbure de sa colonne vertébrale",
    option_d: "La forme de son bassin",
    correct_option: "B",
    explanation: "Le trou occipital centré sous le crâne indique une tête en équilibre sur un corps vertical."
  },
  {
    question_text: "L'hominidé Ardi (Ardipithecus ramidus) a bouleversé les certitudes car...",
    option_a: "Elle fabriquait des outils en fer",
    option_b: "Elle pratiquait l'agriculture",
    option_c: "Elle était bipède mais vivait en milieu boisé",
    option_d: "Elle chassait le mammouth",
    correct_option: "C",
    explanation: "Ardi prouve que la bipédie est née dans les forêts, et non dans la savane ouverte."
  },
  {
    question_text: "À quelle espèce appartient la célèbre Lucy, découverte en 1974 ?",
    option_a: "Homo habilis",
    option_b: "Australopithecus afarensis",
    option_c: "Paranthropus boisei",
    option_d: "Homo erectus",
    correct_option: "B",
    explanation: "Lucy est un spécimen d'Australopithecus afarensis, daté d'environ 3,2 millions d'années."
  },
  {
    question_text: "Que prouvent les empreintes de Laetoli figées dans la cendre volcanique il y a 3,6 millions d'années ?",
    option_a: "La domestication du loup",
    option_b: "L'utilisation de chaussures",
    option_c: "Une marche bipède définitive",
    option_d: "La maîtrise du feu",
    correct_option: "C",
    explanation: "Elles montrent une démarche chaloupée sans appui sur les mains, confirmant la bipédie des Australopithèques."
  },
  {
    question_text: "Quelle a été l'impasse évolutive des Paranthropes face au changement climatique ?",
    option_a: "L'hyper-spécialisation masticatoire (mâchoires massives)",
    option_b: "La perte de la bipédie",
    option_c: "Un cerveau trop volumineux",
    option_d: "Un régime exclusivement carnivore",
    correct_option: "A",
    explanation: "Leurs immenses mâchoires pour broyer des racines coriaces les ont rendus incapables de s'adapter quand la végétation a changé."
  },
  {
    question_text: "Quelle est la grande invention culturelle du genre Homo (comme Homo habilis) ?",
    option_a: "L'agriculture",
    option_b: "L'écriture",
    option_c: "L'outil taillé (industrie oldowayenne)",
    option_d: "La roue",
    correct_option: "C",
    explanation: "En taillant la pierre, ils ont pu découper la viande et briser les os pour extraire la moelle, boostant l'énergie de leur cerveau."
  },
  {
    question_text: "Quelle espèce d'hominine est associée à l'industrie acheuléenne (les bifaces) et à la première sortie d'Afrique ?",
    option_a: "Homo erectus / ergaster",
    option_b: "Homo neanderthalensis",
    option_c: "Australopithecus africanus",
    option_d: "Orrorin tugenensis",
    correct_option: "A",
    explanation: "Doté de longues jambes et d'un plus gros cerveau, Erectus est le grand voyageur qui conquiert l'Eurasie."
  },
  {
    question_text: "Vers quelle date estime-t-on la domestication du feu par Homo erectus ?",
    option_a: "- 2 millions d'années",
    option_b: "- 400 000 ans",
    option_c: "- 50 000 ans",
    option_d: "- 10 000 ans",
    correct_option: "B",
    explanation: "Le feu, maîtrisé vers -400 000 ans, a révolutionné l'alimentation (cuisson) et la vie sociale (sécurité nocturne)."
  },
  {
    question_text: "Quelle affirmation sur l'Homme de Néandertal est scientifiquement VRAIE ?",
    option_a: "Il était le seul ancêtre direct d'Homo sapiens",
    option_b: "Son cerveau était en moyenne plus petit que le nôtre",
    option_c: "Il enterrait ses morts et prenait soin des blessés",
    option_d: "Il ne vivait qu'en Afrique",
    correct_option: "C",
    explanation: "Loin du cliché de la brute, Néandertal inhumait ses morts et montrait une grande empathie sociale."
  },
  {
    question_text: "D'après les analyses génétiques, qu'est-il arrivé lors de la rencontre entre Sapiens et Néandertal ?",
    option_a: "Ils se sont ignorés totalement",
    option_b: "Un génocide instantané et total",
    option_c: "Une hybridation : nous portons 1,5 à 2% d'ADN néandertalien",
    option_d: "Néandertal a évolué pour devenir Sapiens",
    correct_option: "C",
    explanation: "Presque tous les humains non-africains portent des traces génétiques de Néandertal."
  },
  {
    question_text: "Quelle autre espèce humaine ancienne a été découverte récemment en Sibérie à partir d'une simple phalange ?",
    option_a: "L'Homme de Flores",
    option_b: "L'Homme de Denisova",
    option_c: "L'Homme de Pékin",
    option_d: "L'Homme de Tautavel",
    correct_option: "B",
    explanation: "Les Dénisoviens, cousins des Néandertaliens, ont également laissé des traces génétiques chez certaines populations actuelles."
  },
  {
    question_text: "Quel trait physique rend le crâne d'Homo sapiens unique parmi toutes les espèces humaines ?",
    option_a: "De gigantesques arcades sourcilières",
    option_b: "L'absence totale de dents de sagesse",
    option_c: "La présence d'un vrai menton",
    option_d: "Un os occipital pointu",
    correct_option: "C",
    explanation: "Le menton proéminent est une caractéristique anatomique exclusive à l'Homo sapiens."
  },
  {
    question_text: "Selon Yuval Noah Harari, quel fut l'atout majeur de la Révolution Cognitive de Sapiens ?",
    option_a: "La capacité de courir très vite",
    option_b: "La création d'outils en fer",
    option_c: "L'invention de fictions et mythes pour coopérer en masse",
    option_d: "La domestication du cheval",
    correct_option: "C",
    explanation: "Croire en des mythes communs a permis à des milliers d'inconnus de coopérer, un avantage décisif sur les autres espèces."
  },
  {
    question_text: "Par quel passage terrestre Homo sapiens a-t-il pu conquérir les Amériques durant l'ère glaciaire ?",
    option_a: "L'isthme de Panama",
    option_b: "Le détroit de Béring (Béringie)",
    option_c: "Le détroit de Gibraltar",
    option_d: "Le pont du Doggerland",
    correct_option: "B",
    explanation: "La baisse du niveau des mers a révélé un pont de terre reliant la Sibérie à l'Alaska."
  },
  {
    question_text: "Quelles célèbres grottes françaises ornées de peintures rupestres datent d'environ 36 000 et 17 000 ans ?",
    option_a: "Altamira et Niaux",
    option_b: "Chauvet et Lascaux",
    option_c: "Cosquer et Pech Merle",
    option_d: "Rouffignac et Font-de-Gaume",
    correct_option: "B",
    explanation: "Chauvet (-36 000) et Lascaux (-17 000) sont des chefs-d'œuvre absolus de l'art paléolithique."
  },
  {
    question_text: "Quel but ultime attribue-t-on le plus souvent à l'art pariétal paléolithique ?",
    option_a: "Uniquement de la décoration d'intérieur",
    option_b: "Des cartes géographiques",
    option_c: "Une signification symbolique, magique ou chamanique",
    option_d: "Des panneaux de signalisation pour les chasseurs",
    correct_option: "C",
    explanation: "L'art des cavernes, souvent situé dans des boyaux profonds et obscurs, témoigne d'une pensée spirituelle complexe."
  }
];

async function recreateQuiz() {
  console.log("Recherche du Chapitre 1...");
  const { data: chapters, error: errFetch } = await supabase
    .from('chapters')
    .select('id, title')
    .like('title', '%Aube de l%')
    .limit(1);

  if (errFetch || !chapters || chapters.length === 0) {
    console.log("Chapitre 1 introuvable.");
    return;
  }
  const chapId = chapters[0].id;
  console.log("Chapitre ciblé :", chapters[0].title);

  console.log("Suppression de l'ancien quiz pour ce chapitre...");
  const { error: delErr } = await supabase.from('quizzes').delete().eq('chapter_id', chapId);
  if (delErr) {
    console.error("Erreur de suppression:", delErr);
    return;
  }

  console.log("Création du nouveau quiz...");
  const { data: newQuiz, error: insErr } = await supabase
    .from('quizzes')
    .insert([{ chapter_id: chapId, title: "Évaluation : L'Aube de l'Humanité" }])
    .select()
    .single();

  if (insErr) {
    console.error("Erreur de création quiz:", insErr);
    return;
  }

  const quizId = newQuiz.id;
  console.log("Nouveau quiz ID:", quizId);

  const qsToInsert = questionsData.map(q => ({
    quiz_id: quizId,
    ...q
  }));

  const { error: qErr } = await supabase.from('questions').insert(qsToInsert);

  if (qErr) {
    console.error("Erreur insertion questions:", qErr);
  } else {
    console.log("✅ 20 questions insérées avec succès pour le nouveau quiz !");
  }
}

recreateQuiz();
