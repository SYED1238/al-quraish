import { supabase } from '../lib/supabase';

// Helper to deserialize address lines containing contact JSON
const mapDbAddressToUI = (addr) => {
  if (!addr) return null;
  let full_name = '';
  let phone = '';
  let email = '';
  let line2 = addr.address_line_2 || '';
  let latitude = null;
  let longitude = null;
  try {
    if (line2.startsWith('{')) {
      const parsed = JSON.parse(line2);
      full_name = parsed.recipient_name || '';
      phone = parsed.phone || '';
      email = parsed.email || '';
      line2 = parsed.line2 || '';
      latitude = parsed.latitude || null;
      longitude = parsed.longitude || null;
    }
  } catch (e) {
    // Fallback if not JSON
  }
  return {
    ...addr,
    full_name,
    phone,
    email,
    latitude,
    longitude,
    address_line_2_raw: addr.address_line_2,
    address_line_2: line2
  };
};

export const dbService = {
  // ─── ADDRESS OPERATIONS ──────────────────────────────────────────
  fetchAddresses: async (userId) => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapDbAddressToUI);
  },

  addAddress: async (userId, addressData) => {
    // If setting as default, mark others as false first
    if (addressData.is_default) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    // Serialize full_name, phone, email, and coordinates into address_line_2
    const serializedLine2 = JSON.stringify({
      recipient_name: addressData.full_name,
      phone: addressData.phone,
      email: addressData.email,
      line2: addressData.address_line_2 || '',
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null
    });

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        address_line_1: addressData.address_line_1,
        address_line_2: serializedLine2,
        city: addressData.city,
        state: addressData.state,
        pincode: addressData.pincode,
        is_default: addressData.is_default || false
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbAddressToUI(data);
  },

  deleteAddress: async (addressId) => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;
    return true;
  },


  // ─── ORDER & CHECKOUT OPERATIONS ─────────────────────────────────
  createOrder: async (userId, cartItems, totalAmount, addressId = null, paymentMethod = 'Cash on Delivery') => {
    try {
      // 1. Create main order record, serializing payment method inside status field
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total: totalAmount,
          status: `Pending | ${paymentMethod}`,
          address_id: addressId
        })
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Prepare order items bulk list
      const itemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.basePrice * item.priceMultiplier,
        weight: item.weight
      }));

      // 3. Insert order items
      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsErr) throw itemsErr;

      // 4. Clear cart after successful checkout
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      return order;
    } catch (err) {
      console.error('Checkout transaction failed:', err);
      throw err;
    }
  },

  fetchOrders: async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), addresses(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map database order fields to UI readable objects
    return data.map(order => {
      // Parse status and payment method
      let status = 'Pending';
      let paymentMethod = 'Cash on Delivery';
      if (order.status && order.status.includes(' | ')) {
        const parts = order.status.split(' | ');
        status = parts[0];
        paymentMethod = parts[1];
      } else if (order.status) {
        status = order.status;
      }

      // Generate customer friendly order number deterministically from UUID
      const createdDate = new Date(order.created_at);
      const year = createdDate.getFullYear() || 2026;
      let hash = 0;
      const uuid = order.id;
      for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const friendlyNum = `ORD-${year}-${(Math.abs(hash) % 1000000).toString().padStart(6, '0')}`;

      return {
        id: order.id,
        orderNumber: friendlyNum,
        total: Number(order.total),
        status,
        paymentMethod,
        createdAt: order.created_at,
        address: order.addresses ? mapDbAddressToUI(order.addresses) : null,
        items: order.order_items.map(item => ({
          id: item.id,
          productId: item.product_id,
          name: item.products?.name || 'Gourmet Selection Cut',
          image: item.products?.image || '',
          price: Number(item.price),
          quantity: item.quantity,
          weight: item.weight
        }))
      };
    });
  },

  fetchAllOrders: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*, products(*)), addresses(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(order => {
      // Parse status and payment method
      let status = 'Pending';
      let paymentMethod = 'Cash on Delivery';
      if (order.status && order.status.includes(' | ')) {
        const parts = order.status.split(' | ');
        status = parts[0];
        paymentMethod = parts[1];
      } else if (order.status) {
        status = order.status;
      }

      // Generate customer friendly order number
      const createdDate = new Date(order.created_at);
      const year = createdDate.getFullYear() || 2026;
      let hash = 0;
      const uuid = order.id;
      for (let i = 0; i < uuid.length; i++) {
        const char = uuid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      const friendlyNum = `ORD-${year}-${(Math.abs(hash) % 1000000).toString().padStart(6, '0')}`;

      return {
        id: order.id,
        orderNumber: friendlyNum,
        total: Number(order.total),
        status,
        paymentMethod,
        createdAt: order.created_at,
        address: order.addresses ? mapDbAddressToUI(order.addresses) : null,
        items: order.order_items.map(item => ({
          id: item.id,
          productId: item.product_id,
          name: item.products?.name || 'Gourmet Selection Cut',
          image: item.products?.image || '',
          price: Number(item.price),
          quantity: item.quantity,
          weight: item.weight
        }))
      };
    });
  },

  updateOrderStatus: async (orderId, statusText, paymentMethod = 'Cash on Delivery') => {
    const serializedStatus = `${statusText} | ${paymentMethod}`;
    console.log(`[dbService.updateOrderStatus] Inputs:`, { orderId, statusText, paymentMethod, serializedStatus });

    const { data, error } = await supabase
      .from('orders')
      .update({ status: serializedStatus })
      .eq('id', orderId)
      .select();

    console.log(`[dbService.updateOrderStatus] Supabase response data:`, data);
    console.log(`[dbService.updateOrderStatus] Supabase response error:`, error);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }
};
