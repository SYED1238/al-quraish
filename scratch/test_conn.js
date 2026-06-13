const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env.local
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
let envUrl = '';
let envKey = '';
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) envUrl = trimmed.split('=')[1].trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) envKey = trimmed.split('=')[1].trim();
}

console.log('Testing connection to URL:', envUrl);
console.log('Using Key:', envKey);

const supabase = createClient(envUrl, envKey);

async function test() {
  try {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.error('Connection failed with error:', error);
    } else {
      console.log('Connection successful! Data:', data);
    }
  } catch (err) {
    console.error('Execution failed:', err);
  }
}

test();
