require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const chapterId = '753816cb-c5d6-4a9e-a4dc-c468a462633f';

  // 1. UPDATE TIMELINE
  const timelineData = [
    { id: '1', year_label: '621 av. J.-C.', title: 'Les lois de Dracon', description: 'Premier code de lois écrit, très sévère, qui met fin aux vendettas privées.' },
    { id: '2', year_label: '594 av. J.-C.', title: 'Réformes de Solon', description: 'Annulation des dettes (Seisachtheia) et création de la Timocratie basée sur la richesse.' },
    { id: '3', year_label: '561 av. J.-C.', title: 'Tyrannie de Pisistrate', description: 'Prise de pouvoir par la ruse, marquant une période de développement économique et d\'affaiblissement des seigneurs.' },
    { id: '4', year_label: '514 av. J.-C.', title: 'Les Tyrannoctones', description: 'Assassinat du tyran Hipparque par Harmodios et Aristogiton, symboles de la liberté.' },
    { id: '5', year_label: '508 av. J.-C.', title: 'Réformes de Clisthène', description: 'Création de l\'Isonomie, redécoupage du territoire en 139 dèmes et 10 tribus artificielles.' },
    { id: '6', year_label: '490 av. J.-C.', title: 'Bataille de Marathon', description: 'Victoire des hoplites (Zeugites) contre les Perses.' },
    { id: '7', year_label: '480 av. J.-C.', title: 'Bataille de Salamine', description: 'Victoire navale grecque qui donne un immense prestige politique aux Thètes (les rameurs).' },
    { id: '8', year_label: '462 av. J.-C.', title: 'Réformes d\'Éphialtès', description: 'Passage à la démocratie radicale en retirant les pouvoirs de l\'ancienne aristocratie.' },
    { id: '9', year_label: '443-429 av. J.-C.', title: 'L\'Âge d\'Or de Périclès', description: 'Instauration du Misthos (indemnité politique) et apogée de la puissance athénienne.' },
    { id: '10', year_label: '399 av. J.-C.', title: 'Mort de Socrate', description: 'Le philosophe est condamné à boire la ciguë par la démocratie restaurée.' }
  ];
  
  await supabase.from('chapters').update({ timeline_data: timelineData }).eq('id', chapterId);
  console.log('Timeline updated!');

  // 2. CREATE QUIZ
  let { data: quiz } = await supabase.from('quizzes').select('id').eq('chapter_id', chapterId).single();
  if (!quiz) {
    const { data: newQuiz } = await supabase.from('quizzes').insert({ chapter_id: chapterId, title: 'Quiz : Démocratie Athénienne' }).select().single();
    quiz = newQuiz;
  }
  
  // Clean old questions
  await supabase.from('questions').delete().eq('quiz_id', quiz.id);

  // 3. INSERT QUESTIONS
  const questions = [
    {
      quiz_id: quiz.id,
      question_text: "Qui a mis par écrit le premier code de lois d'Athènes (réputé écrit avec du sang) ?",
      option_a: "Solon", option_b: "Dracon", option_c: "Périclès", option_d: "Clisthène",
      correct_option: "B", explanation: "En 621 av. J.-C., Dracon a créé ce code extrêmement sévère pour mettre fin aux vengeances privées."
    },
    {
      quiz_id: quiz.id,
      question_text: "Comment s'appelle l'annulation totale des dettes décidée par Solon ?",
      option_a: "L'Ostracisme", option_b: "Le Misthos", option_c: "La Seisachtheia", option_d: "La Timocratie",
      correct_option: "C", explanation: "La Seisachtheia (ou levée du fardeau) a interdit l'esclavage pour dettes."
    },
    {
      quiz_id: quiz.id,
      question_text: "Sur quelle base Clisthène a-t-il réorganisé l'Attique pour briser l'aristocratie ?",
      option_a: "En divisant la population selon la richesse",
      option_b: "En créant 10 tribus artificielles mélangeant toutes les régions",
      option_c: "En exilant tous les Eupatrides",
      option_d: "En confiant le pouvoir aux métèques",
      correct_option: "B", explanation: "Clisthène a mélangé des dèmes de la ville, de la côte et des terres pour casser les anciens clans."
    },
    {
      quiz_id: quiz.id,
      question_text: "Quel événement a donné aux 'Thètes' (les plus pauvres) la légitimité d'exiger le pouvoir politique ?",
      option_a: "La victoire terrestre de Marathon",
      option_b: "L'invention du Klérotèrion",
      option_c: "La victoire navale de Salamine où ils étaient rameurs",
      option_d: "L'expédition de Sicile",
      correct_option: "C", explanation: "En 480 av. J.-C., les rameurs de la flotte à Salamine ont sauvé Athènes, gagnant un prestige décisif."
    },
    {
      quiz_id: quiz.id,
      question_text: "Qu'était le 'Misthos' instauré par Périclès ?",
      option_a: "Une indemnité versée aux citoyens pour leur participation politique",
      option_b: "Une machine en pierre pour tirer au sort les magistrats",
      option_c: "Une taxe payée par les métèques",
      option_d: "Le nom du conseil des 500",
      correct_option: "A", explanation: "Le Misthos permettait même aux plus pauvres de perdre une journée de travail pour assister à l'Assemblée."
    }
  ];

  await supabase.from('questions').insert(questions);
  console.log('Quiz and questions created!');
}
run();
