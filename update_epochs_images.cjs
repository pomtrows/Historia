require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const epochPrompts = {
  "La Préhistoire (Origines à -3000)": "A beautiful classic oil painting of prehistoric humans gathering around a fire in a cave, warm light, epic historical style",
  "L'Antiquité Ancienne (-3000 à -500)": "A beautiful classic oil painting of ancient Mesopotamia ziggurats and Egyptian pyramids at sunset, epic historical style",
  "L'Antiquité Classique (-500 à 476)": "A beautiful classic oil painting of ancient Rome and Greece, marble temples, philosophers and legionaries, epic historical style",
  "Le Haut Moyen Âge (476 à l'an 1000)": "A beautiful classic oil painting of the Early Middle Ages, Byzantine empire, knights and early castles, dark dramatic lighting, epic historical style",
  "Le Bas Moyen Âge (1000 à 1492)": "A beautiful classic oil painting of the Late Middle Ages, towering gothic cathedrals, crusaders and crowded medieval cities, epic historical style",
  "La Renaissance et les Découvertes (1492 - 1648)": "A beautiful classic oil painting of the Renaissance era, Leonardo da Vinci workshop, caravels sailing to new worlds, luminous colors, epic historical style",
  "L'Ère des Lumières (1648 - 1789)": "A beautiful classic oil painting of the Enlightenment era, 18th century salons, wigs, scientific instruments, epic historical style",
  "Le XIXe Siècle (1789 - 1914)": "A beautiful classic oil painting of the 19th Century, industrial revolution, steam trains, factories and revolutions, epic historical style",
  "Le XXe Siècle (1914 - 1991)": "A beautiful classic oil painting of the 20th century, biplanes, trenches, and early modern cityscapes, dramatic historical style",
  "Le Monde Contemporain (1991 à nos jours)": "A beautiful classic oil painting of the contemporary world, modern glass skyscrapers, global connectivity, space exploration, epic historical style"
};

async function updateImages() {
  const { data: epochs, error } = await supabase.from('epochs').select('id, title');
  if (error) {
    console.error("Error fetching epochs:", error);
    return;
  }

  for (const epoch of epochs) {
    const prompt = epochPrompts[epoch.title];
    if (prompt) {
      // Create a URL-safe prompt for pollinations.ai
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = "https://image.pollinations.ai/prompt/" + encodedPrompt + "?width=800&height=400&nologo=true&seed=42";
      
      const { error: updateError } = await supabase
        .from('epochs')
        .update({ image_url: imageUrl })
        .eq('id', epoch.id);
        
      if (updateError) {
        console.error("Error updating epoch", epoch.title, updateError);
      } else {
        console.log("Updated", epoch.title, "with image URL.");
      }
    }
  }
}

updateImages();
