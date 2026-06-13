const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
let envUrl = '';
let envKey = '';
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) envUrl = trimmed.split('=')[1].trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) envKey = trimmed.split('=')[1].trim();
}

const supabase = createClient(envUrl, envKey);

async function runWriteTest() {
  console.log('--- STARTING DATABASE WRITE VALIDATION ---');
  const testEmail = `vip-tester-${Date.now()}@al-quraish.com`;
  let testUserId = '';
  
  try {
    // 1. Sign up a test user to create auth.users record
    console.log('1. Signing up a test user...');
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: testEmail,
      password: 'SuperSecretPassword123!',
      options: {
        data: {
          full_name: 'VIP Tester Profile'
        }
      }
    });

    if (authErr) throw authErr;
    testUserId = authData.user?.id;
    if (!testUserId) throw new Error('No user ID returned from signup');
    console.log('   Success! Created auth user UUID:', testUserId);

    // Wait a brief moment for trigger to run
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Fetch automatically created profile to verify trigger works
    console.log('2. Verifying public.profiles automatic sync trigger...');
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (profErr) throw profErr;
    console.log('   Success! Profile synced by trigger:', profile.full_name, 'Role:', profile.role);

    // 3. Insert Address
    console.log('3. Inserting Delivery Address...');
    const { data: address, error: addrErr } = await supabase
      .from('addresses')
      .insert({
        user_id: testUserId,
        address_line_1: 'Aman Reserves Luxury Suite 7',
        address_line_2: 'VIP Regency District',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        is_default: true
      })
      .select()
      .single();

    if (addrErr) throw addrErr;
    console.log('   Success! Address created ID:', address.id);

    // 4. Add Item to Cart
    console.log('4. Inserting Cart Item...');
    const { data: cartItem, error: cartErr } = await supabase
      .from('cart_items')
      .upsert({
        user_id: testUserId,
        product_id: 'premium-chicken-thigh-boneless',
        quantity: 3,
        weight: '1kg'
      })
      .select()
      .single();

    if (cartErr) throw cartErr;
    console.log('   Success! Cart Item created Product ID:', cartItem.product_id);

    // 5. Create Order
    console.log('5. Creating Order...');
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: testUserId,
        total: 6900,
        status: 'Processing',
        address_id: address.id
      })
      .select()
      .single();

    if (orderErr) throw orderErr;
    console.log('   Success! Order created ID:', order.id);

    // 6. Create Order Item
    console.log('6. Creating Order Item...');
    const { data: orderItem, error: itemErr } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: 'premium-chicken-thigh-boneless',
        quantity: 3,
        price: 2300,
        weight: '1kg'
      })
      .select()
      .single();

    if (itemErr) throw itemErr;
    console.log('   Success! Order Item created Product ID:', orderItem.product_id);

    // 7. Query all back to verify relations
    console.log('7. Querying full order details back...');
    const { data: fetchedOrders, error: fetchErr } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), addresses(*)')
      .eq('user_id', testUserId);

    if (fetchErr) throw fetchErr;
    console.log('   Success! Fetched orders count:', fetchedOrders.length);
    console.log('   First order items details:', fetchedOrders[0].order_items.map(i => `${i.products.name} - Qty: ${i.quantity}`));

    // 8. Cleanup
    console.log('8. Cleaning up test data...');
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('id', order.id);
    await supabase.from('cart_items').delete().eq('user_id', testUserId);
    await supabase.from('addresses').delete().eq('user_id', testUserId);
    console.log('   Cleanup complete (profile left intact for dashboard visibility).');
    console.log('🎉 DATABASE READ/WRITE TEST PASSED SUCCESSFULLY!');

  } catch (err) {
    console.error('❌ Database Write Test failed:', err);
  }
}

runWriteTest();
