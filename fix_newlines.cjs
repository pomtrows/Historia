require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Fetch the chapter
  const { data, error } = await supabase
    .from('chapters')
    .select('id, content')
    .like('title', '%Pédagogique Avancée%')
    .single();

  if (error || !data) {
    console.error("Error fetching chapter:", error);
    return;
  }

  // Remove the literal \n\n
  const cleanedContent = data.content.replace(/\\n\\n/g, '');

  // Update in DB
  const { error: updateError } = await supabase
    .from('chapters')
    .update({ content: cleanedContent })
    .eq('id', data.id);

  if (updateError) {
    console.error("Error updating:", updateError);
  } else {
    console.log("Success! Cleaned the \\n\\n from the chapter.");
  }
}

run();
