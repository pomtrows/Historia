require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  try {
    const epochId = "cc712fd8-8dcd-4045-b2c6-228d612f4f4a"; // La Préhistoire

    // 1. Supprimer le chapitre de test existant
    await supabase.from('chapters').delete().eq('title', 'Test1');

    // 2. Contenu du Chapitre 2
    const chap2Title = "Chapitre 2 : La Révolution Néolithique";
    const chap2Content = `
<p>Vers 10 000 avant J.-C., un radoucissement climatique majeur marque la fin de la dernière période glaciaire. L'environnement change radicalement, et avec lui, le mode de vie des groupes humains : c'est le début de la plus grande mutation de notre histoire, la Révolution Néolithique.</p>

<h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4">L'Invention de l'Agriculture et de l'Élevage</h2>
<p>Dans la région du <strong>Croissant fertile</strong> (Moyen-Orient actuel), les groupes de chasseurs-cueilleurs commencent à observer le cycle des plantes sauvages (blé, orge) et le comportement des animaux. Progressivement, ils apprennent à semer des graines et à domestiquer des espèces dociles (le chien d'abord, puis le mouton, la chèvre, le porc et le bœuf).</p>
<ul>
  <li><strong>La production alimentaire :</strong> Pour la première fois, l'Homme ne se contente plus de prélever dans la nature, il <em>produit</em> sa nourriture.</li>
  <li><strong>L'essor démographique :</strong> Une nourriture plus abondante et prévisible entraîne une explosion de la population mondiale.</li>
</ul>

<h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4">La Sédentarisation et les Premiers Villages</h2>
<p>Puisqu'il faut rester auprès des champs pour les surveiller et des récoltes pour les stocker, les humains abandonnent leur nomadisme. Ils construisent des habitations durables en brique de terre crue, en bois ou en torchis.</p>
<blockquote>C'est la naissance de la <strong>sédentarisation</strong>. Les campements temporaires laissent place aux premiers villages, comme <em>Jéricho</em> en Palestine ou <em>Çatal Höyük</em> en Anatolie, qui regroupent parfois plusieurs milliers d'habitants.</blockquote>

<h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4">Les Nouvelles Inventions Techniques</h2>
<p>Le terme <strong>Néolithique</strong> signifie "l'âge de la pierre nouvelle", en référence à la technique de la pierre <strong>polie</strong> (et non plus seulement taillée), permettant de fabriquer des haches solides pour défricher les forêts.</p>
<p>De nouveaux besoins apparaissent liés à la sédentarisation :</p>
<ul>
  <li><strong>La poterie :</strong> Fabriquée en argile cuite, elle permet de stocker les céréales à l'abri des rongeurs et de cuire les aliments dans l'eau.</li>
  <li><strong>Le tissage :</strong> Grâce à la domestication du mouton (laine) et à la culture du lin, les hommes tissent leurs premiers vêtements sur des métiers verticaux.</li>
</ul>

<h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4">Le Mégalithisme : Des Pierres vers le Ciel</h2>
<p>À la fin du Néolithique, particulièrement en Europe de l'Ouest, les sociétés érigent des monuments monumentaux appelés <strong>Mégalithes</strong> (du grec <em>mega</em> grand et <em>lithos</em> pierre) :</p>
<ul>
  <li>Les <strong>Menhirs</strong> : Pierres dressées verticalement, souvent alignées (comme à Carnac en Bretagne), qui avaient probablement une fonction rituelle ou de repère astronomique.</li>
  <li>Les <strong>Dolmens</strong> : Sépultures collectives recouvertes d'un tumulus de terre, témoignant de l'apparition d'un profond culte des ancêtres.</li>
</ul>
<p>Cette incroyable révolution économique, sociale et spirituelle pose les fondations directes des premières grandes civilisations qui apparaîtront quelques millénaires plus tard.</p>
`;
    const chap2Timeline = [
      { id: "ev1", year_label: "- 10 000", title: "Réchauffement climatique", description: "Fin de la dernière glaciation, apparition d'un climat tempéré." },
      { id: "ev2", year_label: "Vers - 9 000", title: "Débuts de l'agriculture", description: "Domestication du blé et de l'orge dans le Croissant fertile." },
      { id: "ev3", year_label: "Vers - 8 000", title: "Premiers villages", description: "Fondation de Jéricho, l'une des plus anciennes cités occupées en continu." },
      { id: "ev4", year_label: "Vers - 6 500", title: "Invention de la Poterie", description: "Utilisation de la céramique pour le stockage et la cuisson." },
      { id: "ev5", year_label: "Vers - 4 500", title: "Premiers Mégalithes", description: "Édification des premiers grands menhirs et dolmens en Europe." }
    ];

    // 3. Contenu du Chapitre 3
    const chap3Title = "Chapitre 3 : L'Âge des Métaux et la Protohistoire";
    const chap3Content = `
<p>Alors que la Révolution Néolithique s'achève, l'Homme fait une nouvelle découverte majeure : il réalise que certaines roches, chauffées à des températures extrêmes, fondent et se transforment en un matériau modelable à volonté. C'est l'invention de la métallurgie, qui va bouleverser les sociétés humaines et les faire entrer dans <strong>l'Âge des Métaux</strong>.</p>

<h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4">Le Cuivre et la Naissance de la Métallurgie (Chalcolithique)</h2>
<p>Le premier métal à être travaillé est le <strong>cuivre</strong>. Au départ martelé à froid, il est bientôt fondu (vers 5000 avant J.-C.) pour être coulé dans des moules. C'est une période de transition appelée le <em>Chalcolithique</em>.</p>
<p>Le témoignage le plus célèbre de cette époque est <strong>Ötzi l'homme des glaces</strong>, une momie naturelle vieille de 5300 ans découverte dans les Alpes, qui portait sur lui une remarquable hache en cuivre, symbole de richesse et de prestige.</p>

<h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4">L'Âge du Bronze : Les Premières Cités-États</h2>
<p>Le cuivre étant un métal assez mou, les forgerons ont l'idée de le mélanger avec de l'étain : ils obtiennent ainsi le <strong>bronze</strong>, un alliage beaucoup plus dur et résistant. Ce bond technologique s'opère vers -3000 dans le Moyen-Orient.</p>
<blockquote>
La métallurgie du bronze requiert de s'approvisionner en minerais rares (comme l'étain). Cela entraîne l'apparition de réseaux commerciaux à très longue distance.
</blockquote>
<p>Pour gérer cette économie complexe, la société se hiérarchise fortement :</p>
<ul>
  <li><strong>Spécialisation :</strong> Des artisans forgerons à plein temps apparaissent.</li>
  <li><strong>Guerriers et Élites :</strong> Les chefs accaparent les armes en bronze (épées, armures) et dominent les paysans.</li>
  <li><strong>Cités-États :</strong> Les villages grossissent et se fortifient, donnant naissance aux premières grandes villes ceinturées de murailles.</li>
</ul>

<h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4">L'Âge du Fer : La Démocratisation de l'Outil</h2>
<p>Vers -1200, les Hittites (en Anatolie) maîtrisent les fours atteignant 1500°C, température nécessaire pour fondre le <strong>fer</strong>. Le minerai de fer étant bien plus abondant que le cuivre et l'étain, les outils (socs de charrue, haches) et les armes deviennent accessibles au plus grand nombre.</p>
<p>En Europe, l'Âge du Fer est intimement lié aux <strong>Celtes</strong> (dont faisaient partie les Gaulois), de redoutables guerriers et de remarquables forgerons qui vont dominer une grande partie du continent.</p>

<h2 class="text-3xl font-serif text-historia-blue mt-8 mb-4">La Fin d'un Monde : L'Aube de l'Histoire</h2>
<p>Cette ultime période de la Préhistoire est souvent appelée la <strong>Protohistoire</strong> : c'est le moment où des sociétés qui ne possèdent pas encore l'écriture (comme les Gaulois) côtoient des peuples qui, eux, écrivent déjà (comme les Grecs ou les Romains).</p>
<p>Finalement, face au besoin grandissant de tenir des comptes marchands et administratifs dans les premières immenses cités de Mésopotamie et d'Égypte, un outil administratif finit par voir le jour vers -3300 : <strong>l'Écriture</strong>. Avec elle, l'humanité quitte la Préhistoire pour faire son entrée fracassante dans l'Histoire avec un grand H.</p>
`;
    const chap3Timeline = [
      { id: "ev6", year_label: "Vers - 5 000", title: "Âge du Cuivre", description: "Premiers objets en cuivre fondu et martelé." },
      { id: "ev7", year_label: "Vers - 3 300", title: "Ötzi", description: "Vie et mort d'Ötzi dans les Alpes, muni de sa hache en cuivre." },
      { id: "ev8", year_label: "Vers - 3 000", title: "Âge du Bronze", description: "Invention de l'alliage Cuivre+Étain, développement d'un vaste commerce." },
      { id: "ev9", year_label: "Vers - 1 200", title: "Âge du Fer", description: "Maîtrise de la sidérurgie par les Hittites et diffusion du Fer." },
      { id: "ev10", year_label: "Vers - 3 300", title: "Invention de l'Écriture", description: "Fin officielle de la Préhistoire avec l'apparition du cunéiforme et des hiéroglyphes." }
    ];

    // Insertion des 2 chapitres
    const chap2 = {
      epoch_id: epochId,
      title: chap2Title,
      order: 2,
      content: chap2Content,
      timeline_data: chap2Timeline,
      map_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Fertile_Crescent_map.png/800px-Fertile_Crescent_map.png"
    };

    const chap3 = {
      epoch_id: epochId,
      title: chap3Title,
      order: 3,
      content: chap3Content,
      timeline_data: chap3Timeline,
      map_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gallic_Empire.svg/800px-Gallic_Empire.svg.png" // Celtes / Protohistoire
    };

    console.log("Insertion du Chapitre 2...");
    const { error: err2 } = await supabase.from('chapters').insert([chap2]);
    if (err2) throw err2;

    console.log("Insertion du Chapitre 3...");
    const { error: err3 } = await supabase.from('chapters').insert([chap3]);
    if (err3) throw err3;

    console.log("Les chapitres de la Préhistoire ont été générés avec succès !");

  } catch (err) {
    console.error("Erreur :", err);
  }
}

run();
