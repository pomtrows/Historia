require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const epochsData = [
  { order: 1, title: "La Préhistoire (Origines à -3000)", description: "L'évolution humaine, les chasseurs-cueilleurs et l'aube de l'agriculture." },
  { order: 2, title: "L'Antiquité Ancienne (-3000 à -500)", description: "Le berceau des premières grandes civilisations et l'invention de l'écriture." },
  { order: 3, title: "L'Antiquité Classique (-500 à 476)", description: "L'apogée de la Grèce, de Rome et des grands empires d'Asie." },
  { order: 4, title: "Le Haut Moyen Âge (476 à l'an 1000)", description: "La restructuration du monde, l'Islam, Byzance et l'Europe franque." },
  { order: 5, title: "Le Bas Moyen Âge (1000 à 1492)", description: "La féodalité, les croisades, l'Empire mongol et la grande peste." },
  { order: 6, title: "La Renaissance et les Découvertes (1492 - 1648)", description: "L'Humanisme, les Amériques et les guerres de religion." },
  { order: 7, title: "L'Ère des Lumières (1648 - 1789)", description: "L'Absolutisme, les philosophes et la remise en cause de l'ordre ancien." },
  { order: 8, title: "Le XIXe Siècle (1789 - 1914)", description: "Révolutions, industrialisation, empires coloniaux et essor des nations." },
  { order: 9, title: "Le XXe Siècle (1914 - 1991)", description: "L'ère des extrêmes : guerres mondiales, totalitarismes et guerre froide." },
  { order: 10, title: "Le Monde Contemporain (1991 à nos jours)", description: "De la chute de l'URSS à la mondialisation technologique." }
];

function generateChapterTitles(epochOrder) {
  const allTitles = {
    1: ["L'Aube de l'Humanité (Toumaï à Lucy)", "L'Émergence du genre Homo", "Homo erectus et la domestication du feu", "L'Homme de Néandertal, maître du froid", "Homo sapiens : l'expansion mondiale", "Les grandes glaciations", "La révolution du langage", "L'art pariétal et la spiritualité paléolithique", "Les chasseurs de la mégafaune", "La fin du Paléolithique", "Le réchauffement post-glaciaire", "La Révolution Néolithique au Moyen-Orient", "L'invention de l'agriculture", "La domestication des animaux", "Les premiers villages sédentaires", "L'invention de la poterie et du tissage", "L'Âge du Cuivre et la métallurgie", "L'Âge du Bronze", "Le mégalithisme européen", "La transition vers la Protohistoire"],
    2: ["La Mésopotamie et l'invention de l'écriture", "Sumer et les premières cités-États", "L'Empire d'Akkad", "L'Égypte archaïque", "L'Ancien Empire et les Pyramides", "Babylone et le code d'Hammurabi", "Le Nouvel Empire égyptien", "Les Pharaons bâtisseurs", "La civilisation de l'Indus", "La dynastie Shang en Chine", "Les Phéniciens, maîtres des mers", "Le royaume d'Israël", "Les Hittites et le secret du fer", "L'effondrement de l'âge du bronze tardif", "L'Empire assyrien", "La dynastie Zhou", "Le renouveau de Babylone", "Les Olmèques en Mésoamérique", "Les premiers royaumes celtes", "La genèse de l'Empire perse"],
    3: ["Cyrus le Grand et l'Empire achéménide", "La Crète minoenne", "Athènes et la naissance de la démocratie", "Sparte et le modèle militaire", "Les Guerres Médiques", "La Guerre du Péloponnèse", "Alexandre le Grand et l'hellénisme", "La fondation de Rome et la Royauté", "La République romaine", "Les Guerres Puniques", "César et la chute de la République", "Auguste et la Pax Romana", "L'apogée de l'Empire romain", "La dynastie Han en Chine", "L'Empire Maurya et Ashoka en Inde", "L'essor du christianisme", "La crise du troisième siècle", "Constantin et le basculement vers l'Est", "Les grandes invasions", "La chute de l'Empire romain d'Occident"],
    4: ["L'Empire romain d'Orient (Byzance)", "Justinien et la reconquête", "Clovis et le royaume franc", "La fondation de l'Islam", "L'expansion omeyyade", "L'âge d'or du califat abbasside", "Les Mérovingiens", "L'Empire carolingien et Charlemagne", "L'expansion viking", "L'Angleterre anglo-saxonne", "La dynastie Tang en Chine", "Le Japon de l'époque Heian", "L'essor du royaume de Silla (Corée)", "L'Empire khmer primitif", "La civilisation maya classique", "La fragmentation du monde carolingien", "L'installation des Magyars et des Slaves", "La Reconquista espagnole (débuts)", "L'Afrique subsaharienne : le royaume d'Aksum", "L'an mil : peurs et mutations"],
    5: ["La société féodale européenne", "Le renouveau urbain et commercial", "L'appel à la Première Croisade", "Les États latins d'Orient", "Saladin et la troisième croisade", "L'essor des universités", "L'architecture romane et gothique", "Gengis Khan et la création de l'Empire mongol", "La Pax Mongolica", "L'Empire du Mali et Kankan Moussa", "Marco Polo et la Route de la Soie", "La papauté d'Avignon", "La Guerre de Cent Ans (Origines)", "Jeanne d'Arc et la fin de la guerre", "La Peste Noire : un cataclysme démographique", "La chute de Constantinople (1453)", "La dynastie Ming en Chine", "L'Empire inca en expansion", "L'Empire aztèque", "L'imprimerie de Gutenberg"],
    6: ["La Renaissance italienne (Quattrocento)", "L'Art de la Haute Renaissance (Léonard, Michel-Ange)", "Christophe Colomb et la découverte des Amériques", "Vasco de Gama et la route des Indes", "La conquête du Mexique par Cortés", "La chute de l'Empire Inca", "Le traité de Tordesillas et le partage du monde", "La Révolution copernicienne", "L'Humanisme d'Érasme", "Martin Luther et la Réforme protestante", "Jean Calvin et l'expansion réformée", "Le Concile de Trente et la Contre-Réforme", "Les guerres de religion en France", "Charles Quint et l'Empire sur lequel le soleil ne se couche jamais", "L'Angleterre des Tudor (Henri VIII, Élisabeth)", "Le Siècle d'or espagnol", "L'apogée de l'Empire ottoman (Soliman le Magnifique)", "L'Empire moghol en Inde", "Le shogunat Tokugawa et la fermeture du Japon", "La guerre de Trente Ans et les traités de Westphalie"],
    7: ["Louis XIV et l'apogée de l'Absolutisme", "La monarchie constitutionnelle anglaise", "Pierre le Grand et la modernisation de la Russie", "L'émergence de la Prusse", "La dynastie Qing à son zénith", "Le commerce triangulaire et l'esclavage", "La révolution agricole en Europe", "La révolution scientifique (Newton)", "La France sous Louis XV", "Les Lumières : Diderot, Voltaire, Rousseau", "Le despotisme éclairé", "La guerre de Sept Ans (Première guerre mondiale ?)", "Les colonies américaines", "La guerre d'Indépendance des États-Unis", "La Constitution américaine", "La crise de l'Ancien Régime en France", "L'exploration du Pacifique (Cook, Bougainville)", "Les débuts de la Compagnie des Indes orientales", "L'Afrique au XVIIIe siècle", "La veille de la Révolution"],
    8: ["1789 : La Révolution française", "La Terreur et le Directoire", "Le Consulat et l'Empire de Napoléon", "Le Congrès de Vienne et la Restauration", "La Première Révolution Industrielle", "Le chemin de fer et la révolution des transports", "La Révolution de 1830", "Le Printemps des Peuples (1848)", "La guerre de Sécession américaine", "L'unification de l'Italie", "L'unification de l'Allemagne (Bismarck)", "La seconde révolution industrielle (Électricité, Pétrole)", "L'essor de la classe ouvrière et le marxisme", "L'ère Meiji : le réveil du Japon", "La guerre de l'Opium et le déclin de la Chine", "L'Empire britannique à l'ère victorienne", "Le partage de l'Afrique à la conférence de Berlin", "L'Amérique latine indépendante", "La Russie des tsars face à la modernité", "La Belle Époque et les tensions impérialistes"],
    9: ["L'attentat de Sarajevo et l'engrenage", "La Première Guerre mondiale : la guerre des tranchées", "La Révolution russe de 1917", "Le traité de Versailles et la SDN", "Les Années Folles", "Le Krach de 1929 et la Grande Dépression", "La montée du fascisme en Italie", "La montée du nazisme en Allemagne", "La guerre d'Espagne", "La Seconde Guerre mondiale : le front européen", "La Seconde Guerre mondiale : le front pacifique", "La Shoah et la barbarie", "Hiroshima et l'ère atomique", "La création de l'ONU", "Le début de la Guerre Froide (Le Mur, Berlin)", "La Révolution chinoise de Mao", "La guerre de Corée", "La Décolonisation (Inde, Afrique)", "La guerre du Vietnam", "L'effondrement de l'URSS (1989-1991)"],
    10: ["La fin de la Guerre Froide et le nouvel ordre mondial", "La création du World Wide Web", "Les guerres de Yougoslavie", "Le génocide au Rwanda", "L'attentat du 11 Septembre 2001", "La guerre contre le terrorisme (Afghanistan, Irak)", "Le miracle économique chinois", "L'Union européenne : de l'élargissement aux crises", "La révolution numérique et l'essor des GAFAM", "La crise des subprimes de 2008", "Le Printemps arabe et ses conséquences", "La guerre civile en Syrie", "La montée des populismes en Occident", "L'urgence climatique et l'Accord de Paris", "La pandémie de Covid-19", "La nouvelle course à l'espace", "L'essor de l'Intelligence Artificielle", "Les nouveaux équilibres géopolitiques", "L'exploration du système solaire", "Les défis de demain"]
  };

  return allTitles[epochOrder].map((title, index) => ({ title, order: index + 1 }));
}

async function run() {
  try {
    console.log("1. Nettoyage de la base de données actuelle (Époques et Chapitres)...");
    await supabase.from('chapters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('epochs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log("2. Insertion des 10 Époques majeures...");
    const { data: insertedEpochs, error: epochErr } = await supabase.from('epochs').insert(epochsData).select();
    if (epochErr) throw epochErr;

    console.log("3. Génération et insertion des 200 chapitres (20 par époque)...");
    let globalChapterCount = 0;

    for (const epoch of insertedEpochs) {
      const titles = generateChapterTitles(epoch.order);
      
      const chaptersToInsert = titles.map(t => ({
        epoch_id: epoch.id,
        title: `Chapitre ${t.order} : ${t.title}`,
        order: t.order,
        content: "<p><em>Contenu en attente de génération par l'IA... (Objectif : 30 000 caractères)</em></p>",
        map_url: "",
        timeline_data: []
      }));

      for (let i = 0; i < chaptersToInsert.length; i += 50) {
        const batch = chaptersToInsert.slice(i, i + 50);
        const { error: chapErr } = await supabase.from('chapters').insert(batch);
        if (chapErr) throw chapErr;
      }

      globalChapterCount += titles.length;
      console.log(`- ${titles.length} chapitres insérés pour l'époque : ${epoch.title}`);
    }

    console.log(`\n✅ SUCCÈS : Exactement 10 époques créées et ${globalChapterCount} chapitres répartis uniformément !`);

  } catch (err) {
    console.error("Erreur générale :", err);
  }
}

run();
