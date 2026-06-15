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

async function testInsert() {
  console.log('Testing insert into profiles...');
  try {
    const { data, error } = await supabase.from('profiles').insert({
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      full_name: 'Test User 2',
      role: 'customer'
    }).select();
    console.log('Insert Result:', { data, error });
    
    // Clean up
    if (!error) {
      await supabase.from('profiles').delete().eq('id', '00000000-0000-0000-0000-000000000000');
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testInsert();
