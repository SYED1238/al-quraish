const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
let envUrl = '';
let envKey = '';
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) envUrl = trimmed.split('=')[1].trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) envKey = trimmed.split('=')[1].trim();
}

const supabase = createClient(envUrl, envKey);

async function listImages() {
  try {
    const { data, error } = await supabase.from('products').select('id, name, image, category');
    if (error) {
      console.error(error);
      return;
    }
    data.forEach(p => {
      console.log(`ID: ${p.id} | Category: ${p.category} | Name: ${p.name} | Image: ${p.image}`);
    });
  } catch (err) {
    console.error(err);
  }
}

listImages();
