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

async function checkProfiles() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error reading profiles:', error);
  } else {
    console.log('Profiles currently in public.profiles table:');
    console.log(data);
  }
}

checkProfiles();
