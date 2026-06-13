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

async function testQuery() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('category', ['Chicken', 'Duck', 'Turkey', 'Poultry'])
      .order('name');
    
    if (error) {
      console.error('Error running query:', error);
      return;
    }
    
    console.log(`Query returned ${data.length} records.`);
    if (data.length > 0) {
      console.log('Sample record category:', data[0].category, 'Name:', data[0].name);
    }
  } catch (e) {
    console.error('Execution failed:', e);
  }
}

testQuery();
