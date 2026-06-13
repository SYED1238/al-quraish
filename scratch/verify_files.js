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

async function verifyFiles() {
  try {
    const { data, error } = await supabase.from('products').select('id, name, image');
    if (error) {
      console.error(error);
      return;
    }
    
    console.log('Verifying files on disk...');
    data.forEach(p => {
      const relativePath = p.image;
      if (!relativePath.startsWith('/')) {
        console.log(`❌ Invalid path format: ${p.id} (${relativePath})`);
        return;
      }
      
      const fullPath = path.join(__dirname, '../public', relativePath);
      const exists = fs.existsSync(fullPath);
      if (exists) {
        const stats = fs.statSync(fullPath);
        console.log(`✅ Exists: ${p.id} -> ${relativePath} (Size: ${stats.size} bytes)`);
      } else {
        console.log(`❌ MISSING FILE: ${p.id} -> ${relativePath} (${fullPath})`);
      }
    });
  } catch (err) {
    console.error(err);
  }
}

verifyFiles();
