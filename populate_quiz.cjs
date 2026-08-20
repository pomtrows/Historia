require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  try {
    // 1. Récupérer le chapitre 1
    const { data: chapter, error: chapErr } = await supabase
      .from('chapters')
      .select('id, title')
      .order('order')
      .limit(1)
      .single();

    if (chapErr || !chapter) {
      console.error("Erreur de récupération du chapitre 1:", chapErr);
      return;
    }
    console.log(`Ajout du quiz pour le chapitre: ${chapter.title}`);

    // 2. Chercher ou Créer le Quiz
    let { data: quiz, error: quizFetchErr } = await supabase
      .from('quizzes')
      .select('id')
      .eq('chapter_id', chapter.id)
      .single();

    if (quizFetchErr && quizFetchErr.code === 'PGRST116') {
      const { data: newQuiz, error: insertQuizErr } = await supabase
        .from('quizzes')
        .insert([{ chapter_id: chapter.id, title: "Grand Quiz de la Préhistoire" }])
        .select()
        .single();
      
      if (insertQuizErr) throw insertQuizErr;
      quiz = newQuiz;
    } else if (quizFetchErr) {
      throw quizFetchErr;
    }

    // 3. Supprimer les questions existantes pour éviter les doublons si on relance
    await supabase.from('questions').delete().eq('quiz_id', quiz.id);

    // 4. Générer 20 questions de qualité
    const questions = [
      {
        question_text: "Quelle région d'Afrique est surnommée le 'berceau de l'humanité' grâce à ses nombreuses découvertes ?",
        option_a: "Le désert du Sahara",
        option_b: "La vallée du Grand Rift",
        option_c: "Le delta du Nil",
        option_d: "La forêt équatoriale du Congo",
        correct_option: "B",
        explanation: "La vallée du Grand Rift, en Afrique de l'Est, concentre les plus importantes découvertes de fossiles de nos ancêtres."
      },
      {
        question_text: "Quel est le nom affectueux donné au Sahelanthropus tchadensis, découvert au Tchad en 2001 ?",
        option_a: "Lucy",
        option_b: "Orion",
        option_c: "Toumaï",
        option_d: "Abel",
        correct_option: "C",
        explanation: "Toumaï signifie 'espoir de vie' en langue gorane. Il est considéré comme un de nos plus anciens ancêtres (~7 millions d'années)."
      },
      {
        question_text: "Quelle particularité anatomique de Toumaï suggère qu'il était probablement bipède ?",
        option_a: "La forme de son bassin",
        option_b: "La longueur de ses fémurs",
        option_c: "La position avancée de son trou occipital",
        option_d: "La taille de son cerveau",
        correct_option: "C",
        explanation: "Le trou occipital, par lequel passe la moelle épinière, est très avancé sous le crâne, typique d'une posture redressée."
      },
      {
        question_text: "Quelle théorie d'Yves Coppens a été bouleversée par la découverte de Toumaï à 2500 km à l'Ouest du Rift ?",
        option_a: "L'Out of Africa",
        option_b: "L'East Side Story",
        option_c: "Le chaînon manquant",
        option_d: "L'Ère glaciaire",
        correct_option: "B",
        explanation: "L'East Side Story stipulait que nos ancêtres étaient nés exclusivement à l'Est du Rift. Toumaï a prouvé une origine plus panafricaine."
      },
      {
        question_text: "Qui est Lucy, découverte en 1974 en Éthiopie ?",
        option_a: "Un Homo habilis",
        option_b: "Un Paranthropus boisei",
        option_c: "Un Australopithecus afarensis",
        option_d: "Un Homo erectus",
        correct_option: "C",
        explanation: "Lucy est la plus célèbre représentante des Australopithèques. Son squelette a longtemps été considéré comme la 'grand-mère de l'humanité'."
      },
      {
        question_text: "Comment les australopithèques comme Lucy se déplaçaient-ils ?",
        option_a: "Exclusivement dans les arbres (arboricoles)",
        option_b: "À quatre pattes au sol",
        option_c: "Bipèdes au sol mais grimpeurs habiles",
        option_d: "Exclusivement bipèdes et coureurs",
        correct_option: "C",
        explanation: "Le bassin de Lucy prouve la bipédie, mais ses longs bras et ses phalanges courbées indiquent qu'elle grimpait encore aux arbres."
      },
      {
        question_text: "Quel changement climatique majeur a favorisé l'émergence du genre Homo vers 2,5 millions d'années ?",
        option_a: "Un réchauffement global et de vastes inondations",
        option_b: "Un refroidissement et l'extension des savanes",
        option_c: "Une glaciation transformant l'Afrique en banquise",
        option_d: "Une forte humidité transformant la savane en jungle",
        correct_option: "B",
        explanation: "Le refroidissement et l'assèchement du climat ont réduit les forêts, poussant nos ancêtres à s'adapter à la savane ouverte."
      },
      {
        question_text: "Que signifie le nom 'Homo habilis' ?",
        option_a: "L'homme sage",
        option_b: "L'homme dressé",
        option_c: "L'homme habile",
        option_d: "L'homme voyageur",
        correct_option: "C",
        explanation: "Homo habilis signifie 'l'homme habile', un nom choisi car on a retrouvé à côté de ses restes les premiers outils en pierre taillée."
      },
      {
        question_text: "Comment appelle-t-on la culture des premiers outils rudimentaires associés à Homo habilis ?",
        option_a: "L'Acheuléen",
        option_b: "Le Moustérien",
        option_c: "L'Oldowayen",
        option_d: "Le Magdalénien",
        correct_option: "C",
        explanation: "L'Oldowayen (du site des gorges d'Olduvai) désigne l'industrie des galets aménagés appelés choppers."
      },
      {
        question_text: "Pourquoi la consommation de viande (acquise grâce aux outils) fut-elle cruciale pour Homo habilis ?",
        option_a: "Elle lui permettait de résister au froid",
        option_b: "Elle lui fournissait l'énergie nécessaire au développement de son cerveau",
        option_c: "Elle repoussait les prédateurs de la savane",
        option_d: "Elle permettait de cicatriser plus vite",
        correct_option: "B",
        explanation: "Le cerveau humain est très énergivore. Les protéines et les graisses (la moelle) animales ont permis ce développement cérébral."
      },
      {
        question_text: "Quel représentant du genre Homo fut le premier à quitter le berceau africain ?",
        option_a: "Homo sapiens",
        option_b: "Homo neanderthalensis",
        option_c: "Homo habilis",
        option_d: "Homo erectus",
        correct_option: "D",
        explanation: "Grâce à ses longues jambes de marcheur et ses outils avancés, Homo erectus fut le premier à coloniser l'Eurasie."
      },
      {
        question_text: "Quel est l'outil emblématique fabriqué par Homo erectus, reconnaissable à sa symétrie parfaite ?",
        option_a: "Le biface",
        option_b: "Le propulseur",
        option_c: "L'arc",
        option_d: "Le harpon",
        correct_option: "A",
        explanation: "Le biface est un outil de pierre taillé sur deux faces, symbole de la culture acheuléenne."
      },
      {
        question_text: "Vers quelle époque Homo erectus a-t-il domestiqué le feu ?",
        option_a: "Vers -2 millions d'années",
        option_b: "Vers -400 000 ans",
        option_c: "Vers -100 000 ans",
        option_d: "Vers -10 000 ans",
        correct_option: "B",
        explanation: "Les premières traces irréfutables de foyers aménagés remontent à environ 400 000 ans."
      },
      {
        question_text: "Quelle conséquence la maîtrise du feu n'a-t-elle PAS eue sur la vie d'Homo erectus ?",
        option_a: "Cuire les aliments pour les rendre plus digestes",
        option_b: "Éloigner les prédateurs nocturnes",
        option_c: "Inventer la métallurgie du fer",
        option_d: "Rallonger la journée et favoriser les échanges sociaux",
        correct_option: "C",
        explanation: "La métallurgie n'apparaîtra que bien plus tard. Le feu permettait de cuire, protéger, éclairer et réchauffer."
      },
      {
        question_text: "Où ont été découverts les plus anciens restes identifiés d'Homo sapiens (notre espèce) ?",
        option_a: "À Cro-Magnon (France)",
        option_b: "Au Jebel Irhoud (Maroc)",
        option_c: "Dans la vallée de Neander (Allemagne)",
        option_d: "À Pékin (Chine)",
        correct_option: "B",
        explanation: "Découverts au Jebel Irhoud, au Maroc, ces restes vieux de 300 000 ans repoussent l'âge et la localisation des premiers Sapiens."
      },
      {
        question_text: "L'homme de Néandertal a cohabité avec Homo sapiens. Où s'est-il principalement développé ?",
        option_a: "Uniquement en Amérique",
        option_b: "En Afrique australe",
        option_c: "En Europe et au Proche-Orient",
        option_d: "En Asie du Sud-Est",
        correct_option: "C",
        explanation: "L'homme de Néandertal est un pur produit de l'évolution eurasiatique, adapté aux rudes climats de l'ère glaciaire européenne."
      },
      {
        question_text: "Comment appelle-t-on le processus où des espèces évoluent différemment en raison d'une séparation géographique ?",
        option_a: "La sélection artificielle",
        option_b: "La spéciation allopatrique",
        option_c: "La mutation spontanée",
        option_d: "Le goulot d'étranglement génétique",
        correct_option: "B",
        explanation: "La séparation par des barrières naturelles (montagnes, rivières) force les populations à évoluer différemment (spéciation allopatrique)."
      },
      {
        question_text: "Dans quelles grottes célèbres Homo sapiens a-t-il laissé certains des plus beaux exemples d'art pariétal ?",
        option_a: "Lascaux et Chauvet",
        option_b: "Pompéi et Herculanum",
        option_c: "Petra et Machu Picchu",
        option_d: "Carthage et Thèbes",
        correct_option: "A",
        explanation: "La France et l'Espagne abritent de sublimes grottes ornées par Homo sapiens (ex: Lascaux, Chauvet, Altamira)."
      },
      {
        question_text: "Quelle était l'organisation sociale principale de l'humanité durant toute la période paléolithique ?",
        option_a: "Des empires sédentaires centralisés",
        option_b: "De grandes cités-États commerçantes",
        option_c: "Des bandes nomades de chasseurs-cueilleurs",
        option_d: "Des royaumes agricoles florissants",
        correct_option: "C",
        explanation: "Jusqu'au Néolithique, les humains étaient des nomades vivant de la chasse, de la pêche et de la cueillette."
      },
      {
        question_text: "Quelle est la principale leçon que l'on peut tirer de l'évolution de la lignée humaine ?",
        option_a: "L'évolution est une ligne droite menant du chimpanzé à l'homme moderne",
        option_b: "Notre évolution est un arbre buissonnant avec de nombreuses branches éteintes",
        option_c: "Le cerveau humain n'a jamais changé de taille",
        option_d: "Nous sommes les seuls hominidés à avoir jamais quitté l'Afrique",
        correct_option: "B",
        explanation: "L'évolution humaine n'est pas linéaire mais ressemble à un buisson complexe où plusieurs espèces ont cohabité, comme Sapiens et Néandertal."
      }
    ].map(q => ({ quiz_id: quiz.id, ...q }));

    const { error: insertErr } = await supabase.from('questions').insert(questions);

    if (insertErr) throw insertErr;
    console.log("Les 20 questions ont été ajoutées avec succès au quiz !");

  } catch (e) {
    console.error("Erreur générale:", e);
  }
}

run();
