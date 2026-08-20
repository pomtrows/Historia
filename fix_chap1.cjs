require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixChap1() {
  // 1. Récupérer le bon Chapitre 1
  const { data: chapters, error: errFetch } = await supabase
    .from('chapters')
    .select('id, title')
    .like('title', '%Aube de l%')
    .limit(1);

  if (errFetch || !chapters || chapters.length === 0) {
    console.log("Chapitre introuvable.");
    return;
  }
  const chapId = chapters[0].id;
  console.log("Chapitre cible :", chapters[0].title, "(", chapId, ")");

  // 2. Mettre à jour le Quiz pour pointer vers ce chapitre
  // On récupère le quiz qui existe déjà (Les 20 questions)
  const { data: quizzes } = await supabase.from('quizzes').select('id').limit(1);
  if (quizzes && quizzes.length > 0) {
    await supabase.from('quizzes').update({ chapter_id: chapId }).eq('id', quizzes[0].id);
    console.log("✅ Quiz rattaché au chapitre 1.");
  } else {
    console.log("⚠️ Aucun quiz trouvé dans la base.");
  }

  // 3. Insérer la Frise Chronologique
  const timelineData = [
    { id: "t1", year_label: "~7 millions", title: "Toumaï", description: "Le plus ancien hominidé bipède connu (Tchad)." },
    { id: "t2", year_label: "~6 millions", title: "Orrorin", description: "Orrorin tugenensis (Kenya), confirme la bipédie précoce." },
    { id: "t3", year_label: "~4,4 millions", title: "Ardi", description: "Ardipithecus ramidus (Éthiopie), vit en milieu boisé." },
    { id: "t4", year_label: "~3,2 millions", title: "Lucy", description: "L'Australopithèque la plus célèbre, découverte en 1974." },
    { id: "t5", year_label: "~3,6 millions", title: "Laetoli", description: "Empreintes de pas prouvant la marche bipède définitive." },
    { id: "t6", year_label: "~2,5 millions", title: "Homo Habilis", description: "Invention des premiers outils taillés (Oldowayen)." },
    { id: "t7", year_label: "~1,9 million", title: "Homo Erectus", description: "Invention du biface et sortie d'Afrique." },
    { id: "t8", year_label: "~400 000", title: "Domestication du feu", description: "Bouleversement de l'alimentation et de la vie sociale." },
    { id: "t9", year_label: "~300 000", title: "Homo Sapiens", description: "Apparition de notre espèce au Maroc (Jebel Irhoud)." },
    { id: "t10", year_label: "~17 000", title: "Lascaux", description: "L'apogée de l'art pariétal paléolithique." }
  ];

  await supabase.from('chapters').update({ timeline_data: timelineData }).eq('id', chapId);
  console.log("✅ Frise chronologique (10 événements) ajoutée au chapitre 1.");

  // 4. Restaurer l'Annexe "Anecdote de Lascaux" et sa galerie de 20 images
  // On utilise le fetch natif
  const searchUrl = "https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=Lascaux&gimlimit=20&prop=imageinfo&iiprop=url&format=json";
  
  let gallery = [];
  try {
    const res = await fetch(searchUrl);
    const json = await res.json();
    const pages = json.query.pages;
    gallery = Object.values(pages)
      .filter(p => p.imageinfo && p.imageinfo.length > 0)
      .map(p => p.imageinfo[0].url)
      .filter(url => url.match(/\\.(jpe?g|png|gif)$/i))
      .slice(0, 20);
  } catch (e) {
    console.log("Erreur Wikimedia:", e.message);
  }

  // Si wikimedia échoue, on met des placeholders
  if (gallery.length === 0) {
    for (let i = 1; i <= 20; i++) {
      gallery.push("https://picsum.photos/seed/lascaux" + i + "/800/600");
    }
  }

  const lascauxContent = `
  <p>La grotte de Lascaux, découverte fortuitement en 1940 par quatre adolescents dans le Périgord, est surnommée la « chapelle Sixtine de l'art pariétal ». Elle abrite près de 1 900 représentations d'animaux (chevaux, aurochs, cerfs, bouquetins) peintes il y a environ 17 000 ans.</p>
  <p>Ce qui frappe à Lascaux, c'est l'extraordinaire maîtrise technique des artistes paléolithiques : utilisation des reliefs de la roche pour donner un effet 3D, technique de l'estompe, et représentation du mouvement. C'est le témoignage bouleversant d'une pensée symbolique complexe.</p>
  `;

  const artworks = {
    title: "Art Pariétal : Le bestiaire de Lascaux",
    description: "Découvrez les peintures rupestres paléolithiques.",
    gallery: gallery
  };

  await supabase.from('annexes').insert([{
    chapter_id: chapId,
    title: "Le chef-d'œuvre de Lascaux",
    content: lascauxContent,
    artworks: artworks
  }]);
  
  console.log("✅ Annexe 'Anecdote de Lascaux' recréée avec une galerie de " + gallery.length + " images.");
  console.log("Terminé !");
}

fixChap1();
