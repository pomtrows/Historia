require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const epochImages = {
  1: "https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?q=80&w=2000&auto=format&fit=crop", // Prehistory (cave/nature)
  2: "https://images.unsplash.com/photo-1539650116574-8efeb43e2b00?q=80&w=2000&auto=format&fit=crop", // Pyramids/Egypt
  3: "https://images.unsplash.com/photo-1552832233-4f939db26c11?q=80&w=2000&auto=format&fit=crop", // Rome Colosseum
  4: "https://images.unsplash.com/photo-1582236592237-77eb571e2285?q=80&w=2000&auto=format&fit=crop", // Early middle ages (dark castle)
  5: "https://images.unsplash.com/photo-1548625361-ec2e09ff7b5a?q=80&w=2000&auto=format&fit=crop", // Late Middle ages (Gothic cathedral)
  6: "https://images.unsplash.com/photo-1583017255964-1629853900dc?q=80&w=2000&auto=format&fit=crop", // Renaissance (Florence)
  7: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop", // Enlightenment (Old library)
  8: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2000&auto=format&fit=crop", // 19th Century (Steam/coffee/vintage)
  9: "https://images.unsplash.com/photo-1500057850239-160868f764a5?q=80&w=2000&auto=format&fit=crop", // 20th Century (vintage WW plane/trenches feel)
  10: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2000&auto=format&fit=crop" // Contemporary (Modern skyscrapers)
};

async function run() {
  const { data: epochs, error } = await supabase.from('epochs').select('id, order').order('order');
  if (error) {
    console.error("Erreur fetching epochs:", error);
    return;
  }

  for (const epoch of epochs) {
    const img = epochImages[epoch.order];
    if (img) {
      await supabase.from('epochs').update({ image_url: img }).eq('id', epoch.id);
      console.log("Updated Epoch", epoch.order);
    }
  }
}
run();
