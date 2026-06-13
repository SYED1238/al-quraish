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

async function testUpdateProduct() {
  console.log('--- STARTING UPDATE PRODUCT TEST ---');

  // Let's get the first product
  const { data: prods, error: getErr } = await supabase.from('products').select('*').limit(1);
  if (getErr || !prods.length) {
    console.error('Failed to get product:', getErr);
    return;
  }

  const prod = prods[0];
  console.log('Target Product:', prod.name, 'ID:', prod.id, 'Price:', prod.price, 'Stock:', prod.stock);

  // Try updating price
  const { data: updated, error: updateErr } = await supabase
    .from('products')
    .update({ price: prod.price + 10, stock: prod.stock + 1 })
    .eq('id', prod.id)
    .select();

  console.log('Update result data:', updated);
  console.log('Update result error:', updateErr);

  if (!updateErr && updated && updated.length > 0) {
    console.log('SUCCESS! Updated database directly.');
    // Revert it back
    await supabase.from('products').update({ price: prod.price, stock: prod.stock }).eq('id', prod.id);
  } else {
    console.log('FAILED! Product could not be updated (possibly due to RLS).');
  }
}

testUpdateProduct();
