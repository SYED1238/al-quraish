const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
let envUrl = '';
let envKey = '';
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) envUrl = trimmed.split('=')[1].trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) envKey = trimmed.split('=')[1].trim();
}

const supabase = createClient(envUrl, envKey);

async function listProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.log('Profiles in database:');
    console.log(data);
  }
}

listProfiles();
