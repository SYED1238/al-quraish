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

async function testColumns() {
  const { data, error } = await supabase
    .from('addresses')
    .select('id, latitude, longitude')
    .limit(1);

  if (error) {
    console.log('Error selecting latitude/longitude:', error.message, error.code);
  } else {
    console.log('Success! Columns exist. Data:', data);
  }
}

testColumns();
