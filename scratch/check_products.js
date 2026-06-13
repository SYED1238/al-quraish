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

async function checkProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(10);

  if (error) {
    console.error('Error fetching products:', error);
  } else {
    console.log('Total products returned:', data.length);
    if (data.length > 0) {
      console.log('Sample product fields:', Object.keys(data[0]));
      console.log('First product:', data[0]);
    }
  }
}

checkProducts();
