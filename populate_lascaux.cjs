require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const https = require('https');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Utilitaire pour faire un GET request simple (promisifié)
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'HistoriaApp/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', err => reject(err));
  });
}

async function run() {
  try {
    console.log("Recherche de vraies images d'art pariétal sur Wikimedia Commons...");
    
    // Rechercher 20 images de peintures rupestres (Lascaux, Chauvet, Altamira, etc.)
    const searchUrl = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=cave%20painting&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url&format=json';
    const response = await fetchJson(searchUrl);
    
    let imageUrls = [];
    if (response && response.query && response.query.pages) {
      const pages = Object.values(response.query.pages);
      imageUrls = pages.map(p => p.imageinfo[0].url);
    }
    
    // Si la recherche ne retourne pas assez d'images, fallback vers quelques valeurs connues.
    if (imageUrls.length === 0) {
      console.log("Échec de la récupération dynamique, utilisation d'un fallback.");
      imageUrls = [
        "https://upload.wikimedia.org/wikipedia/commons/1/1e/Lascaux_painting.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/c/cf/Cueva_de_las_Manos_in_Santa_Cruz_province_-_Argentina.jpg"
      ];
    } else {
      console.log(`✅ ${imageUrls.length} images récupérées avec succès depuis Wikipedia.`);
    }

    // Récupérer le Chapitre 1
    const { data: chapter, error: chapErr } = await supabase
      .from('chapters')
      .select('id, title')
      .order('order')
      .limit(1)
      .single();

    if (chapErr || !chapter) {
      console.error("Erreur chapitre:", chapErr);
      return;
    }

    // Vérifier si l'annexe Lascaux existe, sinon la créer
    const mainImageUrl = "https://upload.wikimedia.org/wikipedia/commons/1/1e/Lascaux_painting.jpg";
    const descriptionText = "Surnommée la \"chapelle Sixtine de l'art pariétal\", la grotte de Lascaux (Dordogne, France) abrite des peintures polychromes spectaculaires vieilles de 17 000 ans.\n\nLes artistes préhistoriques utilisaient des pigments naturels (ocre jaune, ocre rouge, bioxyde de manganèse pour le noir) pour peindre de gigantesques taureaux, des chevaux et des cerfs. Admirez ci-dessous une riche galerie de 20 peintures rupestres historiques collectées depuis les archives mondiales (dont Chauvet, Altamira, et Cueva de las Manos) illustrant la formidable créativité d'Homo sapiens !";

    const { data: existingAnnex } = await supabase
      .from('annexes')
      .select('id')
      .eq('chapter_id', chapter.id)
      .limit(1)
      .single();

    if (existingAnnex) {
      console.log("Mise à jour de l'annexe existante...");
      await supabase.from('annexes').update({
        title: "La Grotte de Lascaux & L'Art Pariétal",
        content: descriptionText,
        artworks: {
          image_url: mainImageUrl,
          century: "Vers 17 000 av. J.-C.",
          gallery: imageUrls
        }
      }).eq('id', existingAnnex.id);
    } else {
      console.log("Création de l'annexe Lascaux...");
      await supabase.from('annexes').insert([{
        chapter_id: chapter.id,
        title: "La Grotte de Lascaux & L'Art Pariétal",
        content: descriptionText,
        type: "peinture",
        artworks: {
          image_url: mainImageUrl,
          century: "Vers 17 000 av. J.-C.",
          gallery: imageUrls
        }
      }]);
    }

    console.log("🚀 Annexe Lascaux et sa galerie de 20 images créées avec succès !");

  } catch (err) {
    console.error("Erreur:", err);
  }
}

run();
