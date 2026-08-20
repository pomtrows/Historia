require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const chapterId = '753816cb-c5d6-4a9e-a4dc-c468a462633f';

  // Find the quiz
  let { data: quiz } = await supabase.from('quizzes').select('id').eq('chapter_id', chapterId).single();
  if (!quiz) {
    const { data: newQuiz } = await supabase.from('quizzes').insert({ chapter_id: chapterId, title: 'Quiz : Démocratie Athénienne' }).select().single();
    quiz = newQuiz;
  }
  
  // Clean old questions
  await supabase.from('questions').delete().eq('quiz_id', quiz.id);

  // 20 Questions based on the chapter content
  const questions = [
    {
      question_text: "En quelle année le noble Cylon a-t-il tenté un coup d'État pour devenir tyran ?",
      option_a: "632 av. J.-C.", option_b: "594 av. J.-C.", option_c: "508 av. J.-C.", option_d: "480 av. J.-C.",
      correct_option: "A", explanation: "Cylon a tenté un coup d'État en 632 av. J.-C., ce qui a provoqué une prise de conscience chez les aristocrates."
    },
    {
      question_text: "Quelle était la principale caractéristique des lois de Dracon promulguées en 621 av. J.-C. ?",
      option_a: "Elles annulaient les dettes", option_b: "Elles étaient écrites et d'une sévérité inouïe", option_c: "Elles instauraient le tirage au sort", option_d: "Elles donnaient le droit de vote aux femmes",
      correct_option: "B", explanation: "Le code de Dracon, réputé écrit avec du sang, punissait presque tout de mort, mais avait le mérite d'être public et de mettre fin aux vendettas."
    },
    {
      question_text: "Comment se nomme la grande réforme de Solon qui abolit l'esclavage pour dettes ?",
      option_a: "L'Ostracisme", option_b: "L'Isonomie", option_c: "La Seisachtheia", option_d: "Le Misthos",
      correct_option: "C", explanation: "La Seisachtheia (ou levée du fardeau) a annulé les dettes et libéré les paysans asservis."
    },
    {
      question_text: "Dans le système timocratique de Solon, quelle classe sociale regroupe les citoyens les plus riches ?",
      option_a: "Les Thètes", option_b: "Les Hippeis", option_c: "Les Zeugites", option_d: "Les Pentacosiomédimnes",
      correct_option: "D", explanation: "Les Pentacosiomédimnes devaient produire plus de 500 mesures (médimnes) de céréales par an."
    },
    {
      question_text: "Quel nouveau tribunal populaire, ouvert à toutes les classes, a été créé par Solon ?",
      option_a: "L'Aréopage", option_b: "La Boulè", option_c: "L'Héliée", option_d: "La Pnyx",
      correct_option: "C", explanation: "L'Héliée était composée de citoyens tirés au sort, permettant un contrôle populaire sur les magistrats."
    },
    {
      question_text: "Quel tyran s'empare du pouvoir à Athènes par la ruse vers 561 av. J.-C. ?",
      option_a: "Périclès", option_b: "Clisthène", option_c: "Pisistrate", option_d: "Thémistocle",
      correct_option: "C", explanation: "Pisistrate s'est appuyé sur les classes pauvres pour instaurer sa tyrannie et développer l'économie."
    },
    {
      question_text: "Qui étaient Harmodios et Aristogiton dans l'histoire athénienne ?",
      option_a: "Des stratèges spartiates", option_b: "Les architectes du Parthénon", option_c: "Les inventeurs de la trière", option_d: "Les Tyrannoctones (tueurs de tyran)",
      correct_option: "D", explanation: "Ils ont assassiné Hipparque (le fils de Pisistrate) et sont devenus les symboles de la lutte pour la liberté."
    },
    {
      question_text: "Quelle est la cellule de base de l'organisation territoriale créée par Clisthène ?",
      option_a: "Le Dème", option_b: "La Tribu", option_c: "La Trittye", option_d: "L'Oikos",
      correct_option: "A", explanation: "Le dème (village ou quartier) est la cellule fondamentale. Le nom d'un citoyen incluait désormais celui de son dème."
    },
    {
      question_text: "Combien de nouvelles tribus artificielles Clisthène a-t-il créées pour mélanger la population ?",
      option_a: "4", option_b: "10", option_c: "30", option_d: "139",
      correct_option: "B", explanation: "Il a créé 10 tribus en tirant au sort une trittye de la côte, une de la ville et une de la campagne pour chacune."
    },
    {
      question_text: "Quel système politique, signifiant 'l'égalité devant la loi', est instauré par Clisthène ?",
      option_a: "L'Oligarchie", option_b: "L'Isonomie", option_c: "La Timocratie", option_d: "La Tyrannie",
      correct_option: "B", explanation: "L'Isonomie garantissait que chaque citoyen, riche ou pauvre, avait les mêmes droits politiques."
    },
    {
      question_text: "À quoi servait le mécanisme de l'Ostracisme ?",
      option_a: "À bannir un leader jugé dangereux pour la démocratie pendant 10 ans", option_b: "À élire les généraux (stratèges)", option_c: "À financer la construction de navires", option_d: "À déclarer la guerre",
      correct_option: "A", explanation: "Si plus de 6 000 citoyens votaient contre lui sur des tessons de poterie (ostrakon), il était exilé."
    },
    {
      question_text: "Lors de la bataille de Marathon (490 av. J.-C.), quelle classe de citoyens a repoussé les Perses ?",
      option_a: "Les cavaliers (Hippeis)", option_b: "Les rameurs (Thètes)", option_c: "L'infanterie lourde (Zeugites/Hoplites)", option_d: "Les mercenaires spartiates",
      correct_option: "C", explanation: "Les Zeugites, capables de payer leur armure de bronze (la panoplie), ont formé la phalange victorieuse."
    },
    {
      question_text: "Quelle nouvelle ressource Thémistocle a-t-il utilisée pour financer 200 trières de guerre ?",
      option_a: "Le trésor de la Ligue de Délos", option_b: "L'argent des mines du Laurion", option_c: "Les impôts des métèques", option_d: "Un prêt de Sparte",
      correct_option: "B", explanation: "Un nouveau filon d'argent a été découvert au Laurion, et Thémistocle a convaincu l'Assemblée de l'investir dans la flotte."
    },
    {
      question_text: "Quelle classe sociale a vu son prestige exploser après la victoire navale de Salamine ?",
      option_a: "Les Pentacosiomédimnes", option_b: "Les Thètes", option_c: "Les Eupatrides", option_d: "Les Zeugites",
      correct_option: "B", explanation: "Les Thètes étaient les rameurs des trières. Sans eux, Athènes aurait été détruite."
    },
    {
      question_text: "Quelle réforme d'Éphialtès (462 av. J.-C.) a marqué le passage à la démocratie radicale ?",
      option_a: "La création des dèmes", option_b: "La suppression des dettes", option_c: "Le transfert des pouvoirs de l'Aréopage vers le peuple", option_d: "La déclaration de guerre à Sparte",
      correct_option: "C", explanation: "L'Aréopage, dernier bastion de l'aristocratie, a perdu ses pouvoirs politiques au profit de la Boulè et de l'Héliée."
    },
    {
      question_text: "Quelle innovation de Périclès a permis aux citoyens pauvres de participer à la vie politique ?",
      option_a: "La création des Liturgies", option_b: "Le Misthos (une indemnité financière)", option_c: "Le Klérotèrion", option_d: "L'abolition de l'esclavage",
      correct_option: "B", explanation: "Le Misthos compensait la perte d'une journée de travail pour les artisans et paysans qui siégeaient."
    },
    {
      question_text: "Qu'est-ce qu'un 'Klérotèrion' ?",
      option_a: "Une taxe pour les étrangers", option_b: "Une machine en pierre servant au tirage au sort mécanique des jurés", option_c: "Un navire de commerce", option_d: "Un juge itinérant",
      correct_option: "B", explanation: "Le Klérotèrion assurait une égalité parfaite et évitait la corruption lors de la sélection des magistrats et jurés."
    },
    {
      question_text: "Comment appelait-on l'impôt forcé où un citoyen riche devait financer une trière ou une pièce de théâtre ?",
      option_a: "La Liturgie (Triérarchie / Chorégie)", option_b: "Le Metoikion", option_c: "Le Phoros", option_d: "L'Oikos",
      correct_option: "A", explanation: "Les Liturgies permettaient de financer les grands besoins de l'État grâce aux fortunes privées."
    },
    {
      question_text: "Qui étaient les 'Métèques' à Athènes ?",
      option_a: "Des esclaves affranchis", option_b: "Les magistrats élus", option_c: "Des étrangers résidents libres, artisans ou commerçants", option_d: "Les femmes mariées à des citoyens",
      correct_option: "C", explanation: "Les Métèques participaient activement à l'économie, payaient une taxe (metoikion), mais n'avaient aucun droit politique."
    },
    {
      question_text: "Quel événement désastreux en 415 av. J.-C., poussé par Alcibiade, a causé la perte d'Athènes ?",
      option_a: "L'invasion de la Crète", option_b: "L'expédition de Sicile", option_c: "La destruction des Longs Murs", option_d: "L'assassinat de Périclès",
      correct_option: "B", explanation: "L'expédition de Sicile fut une déroute totale qui anéantit la flotte et l'armée athénienne face à Syracuse et Sparte."
    }
  ].map(q => ({ ...q, quiz_id: quiz.id }));

  await supabase.from('questions').insert(questions);
  console.log(`Successfully created ${questions.length} questions for Quiz ID: ${quiz.id}`);
}
run();
