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

async function countProducts() {
  try {
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('Failed to retrieve products:', error);
      return;
    }
    
    console.log(`Total Products in Database: ${count || data.length}`);
    console.log('Categories represented:');
    const categories = {};
    data.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + 1;
    });
    console.log(categories);
    
    console.log('\nList of products:');
    data.forEach(p => {
      console.log(`- [${p.category}] ${p.name} (ID: ${p.id}, Price: ${p.price})`);
    });
  } catch (err) {
    console.error('Execution failed:', err);
  }
}

countProducts();
