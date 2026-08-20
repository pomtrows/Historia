require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const timelineData = [
    {
      id: "1",
      year_label: "~ 7 Millions d'années",
      title: "Séparation de la lignée humaine",
      description: "Toumaï (Sahelanthropus tchadensis) au Tchad, potentiellement le premier hominidé bipède."
    },
    {
      id: "2",
      year_label: "~ 3,2 Millions d'années",
      title: "Lucy et les Australopithèques",
      description: "Découverte de l'Australopithecus afarensis dans la région de l'Afar en Éthiopie, prouvant une bipédie assumée."
    },
    {
      id: "3",
      year_label: "~ 2,5 Millions d'années",
      title: "L'émergence d'Homo habilis",
      description: "Premier représentant du genre Homo et apparition des premiers outils en pierre taillée (Oldowayen)."
    },
    {
      id: "4",
      year_label: "~ 400 000 ans",
      title: "La maîtrise du feu",
      description: "Homo erectus domestique le feu, révolutionnant l'alimentation et la vie sociale."
    },
    {
      id: "5",
      year_label: "~ 300 000 ans",
      title: "Apparition d'Homo sapiens",
      description: "Les plus anciens restes de notre espèce (Jebel Irhoud, Maroc). Début de la grande migration."
    }
  ];

  const { data, error } = await supabase
    .from('chapters')
    .select('id, title')
    .order('order', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    console.error("Error fetching chapter:", error);
    return;
  }
  
  console.log(`Updating chapter: ${data.title}`);

  const { error: updateError } = await supabase
    .from('chapters')
    .update({ timeline_data: timelineData })
    .eq('id', data.id);

  if (updateError) {
    console.error("Error updating:", updateError);
  } else {
    console.log("Success! Timeline populated for Chapter 1.");
  }
}

run();
