require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const epochPrompts = {
  "La Préhistoire (Origines à -3000)": "A highly detailed classic oil painting of prehistoric humans gathering around a fire in a cave, warm light, epic historical style",
  "L'Antiquité Ancienne (-3000 à -500)": "A highly detailed classic oil painting of ancient Mesopotamia ziggurats and Egyptian pyramids at sunset, epic historical style",
  "L'Antiquité Classique (-500 à 476)": "A highly detailed classic oil painting of ancient Rome and Greece, marble temples, philosophers and legionaries, epic historical style",
  "Le Haut Moyen Âge (476 à l'an 1000)": "A highly detailed classic oil painting of the Early Middle Ages, Byzantine empire, knights and early castles, dark dramatic lighting, epic historical style",
  "Le Bas Moyen Âge (1000 à 1492)": "A highly detailed classic oil painting of the Late Middle Ages, towering gothic cathedrals, crusaders and crowded medieval cities, epic historical style",
  "La Renaissance et les Découvertes (1492 - 1648)": "A highly detailed classic oil painting of the Renaissance era, Leonardo da Vinci workshop, caravels sailing to new worlds, luminous colors, epic historical style",
  "L'Ère des Lumières (1648 - 1789)": "A highly detailed classic oil painting of the Enlightenment era, 18th century salons, wigs, scientific instruments, epic historical style",
  "Le XIXe Siècle (1789 - 1914)": "A highly detailed classic oil painting of the 19th Century, industrial revolution, steam trains, factories and revolutions, epic historical style",
  "Le XXe Siècle (1914 - 1991)": "A highly detailed classic oil painting of the 20th century, biplanes, trenches, and early modern cityscapes, dramatic historical style",
  "Le Monde Contemporain (1991 à nos jours)": "A highly detailed classic oil painting of the contemporary world, modern glass skyscrapers, global connectivity, space exploration, epic historical style"
};

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(fs.createWriteStream(filepath))
          .on('error', reject)
          .once('close', () => resolve(filepath));
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects if any
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        response.resume(); // Consume response data to free up memory
        reject(new Error("Request Failed With a Status Code: " + response.statusCode));
      }
    }).on('error', reject);
  });
};

const delay = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const { data: epochs, error } = await supabase.from('epochs').select('id, title, order').order('order');
  if (error) {
    console.error("Erreur fetching epochs:", error);
    return;
  }

  for (let i = 0; i < epochs.length; i++) {
    const epoch = epochs[i];
    const prompt = epochPrompts[epoch.title];
    if (prompt) {
      console.log("Downloading image for " + epoch.title + "...");
      const encodedPrompt = encodeURIComponent(prompt);
      // seed adds uniqueness, we can use the order number
      const url = "https://image.pollinations.ai/prompt/" + encodedPrompt + "?width=800&height=400&nologo=true&seed=" + (epoch.order * 100);
      
      const filename = "epoch_" + epoch.order + ".jpg";
      const filepath = path.join(__dirname, 'public', 'epochs', filename);
      
      try {
        await downloadImage(url, filepath);
        
        // Update DB to use local path
        const localUrl = "/epochs/" + filename;
        await supabase.from('epochs').update({ image_url: localUrl }).eq('id', epoch.id);
        
        console.log("✅ Saved to " + localUrl);
      } catch (err) {
        console.error("❌ Failed for " + epoch.title + ":", err.message);
      }
      
      // Wait 3 seconds to avoid rate limit
      await delay(3000);
    }
  }
  console.log("Terminé !");
}

run();
