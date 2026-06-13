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

async function runUpdateTest() {
  const testEmail = `update-tester-${Date.now()}@al-quraish.com`;
  let testUserId = '';
  
  try {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: testEmail,
      password: 'SuperSecretPassword123!',
      options: { data: { full_name: 'Update Tester' } }
    });

    if (authErr) throw authErr;
    testUserId = authData.user?.id;
    await new Promise(resolve => setTimeout(resolve, 1500));

    const { data: address, error: addrErr } = await supabase
      .from('addresses')
      .insert({
        user_id: testUserId,
        address_line_1: 'Update Test Street 1',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        is_default: true
      })
      .select()
      .single();

    if (addrErr) throw addrErr;

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: testUserId,
        total: 1500,
        status: 'Pending | Cash on Delivery',
        address_id: address.id
      })
      .select()
      .single();

    if (orderErr) throw orderErr;
    console.log('Original status:', order.status);

    const orderId = order.id;
    const serializedStatus = 'Delivered | Cash on Delivery';

    // Update
    const { data, error } = await supabase
      .from('orders')
      .update({ status: serializedStatus })
      .eq('id', orderId);

    console.log('Update return error:', error);

    // Fetch back to verify
    const { data: fetchedBack, error: fetchErr } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (fetchErr) {
      console.log('Fetch back error:', fetchErr.message);
    } else {
      console.log('Status fetched back after update:', fetchedBack.status);
    }

    // Cleanup
    await supabase.from('orders').delete().eq('id', orderId);
    await supabase.from('addresses').delete().eq('user_id', testUserId);

  } catch (err) {
    console.error('Test failed:', err);
  }
}

runUpdateTest();
