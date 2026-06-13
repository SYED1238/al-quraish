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

async function checkColumns() {
  try {
    const { data, error } = await supabase.from('orders').select('*').limit(1);
    if (error) {
      console.error('Error fetching orders:', error);
      return;
    }
    console.log('Orders table record columns:', data.length > 0 ? Object.keys(data[0]) : 'No records exist to inspect columns.');
  } catch (err) {
    console.error(err);
  }
}

checkColumns();
