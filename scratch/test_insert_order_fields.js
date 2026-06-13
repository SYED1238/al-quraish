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
  try {
    // Try to insert a dummy order with a random user_id uuid (just for checking columns, it will fail on foreign key constraint, but if the column doesn't exist it will throw a column error first)
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        total: 100,
        status: 'Pending',
        payment_method: 'Cash on Delivery'
      });
    
    console.log('Error returned:', error);
  } catch (err) {
    console.error(err);
  }
}

testInsert();
