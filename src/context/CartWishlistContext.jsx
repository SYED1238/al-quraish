'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CartWishlistContext = createContext({
  cart: [],
  wishlist: [],
  cartOpen: false,
  setCartOpen: () => {},
  addToCart: async (product, weight, qty) => {},
  updateCartQty: async (productId, weight, delta) => {},
  removeFromCart: async (productId, weight) => {},
  addToWishlist: async (productId) => {},
  removeFromWishlist: async (productId) => {},
  isInWishlist: (productId) => false,
  clearCart: async () => {},
  getCartSubtotal: () => 0
});

const getPriceMultiplier = (weight) => {
  if (!weight) return 1;
  if (weight.includes('kg')) {
    return parseFloat(weight);
  }
  if (weight.includes('g') && !weight.includes('pieces')) {
    return parseFloat(weight) / 1000;
  }
  return 1;
};

export function CartWishlistProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load cart and wishlist from DB (or localStorage)
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      if (user) {
        // Logged-in: fetch from Supabase
        try {
          // 1. Fetch Cart Items from DB
          const { data: dbCart, error: cartErr } = await supabase
            .from('cart_items')
            .select('*, products(*)')
            .eq('user_id', user.id);

          // 2. Fetch Wishlist Items from DB
          const { data: dbWishlist, error: wishErr } = await supabase
            .from('wishlist_items')
            .select('*, products(*)')
            .eq('user_id', user.id);

          if (!cartErr && dbCart) {
            const formattedCart = dbCart.map(item => ({
              id: item.product_id,
              name: item.products.name,
              image: item.products.image,
              weight: item.weight,
              basePrice: Number(item.products.price),
              priceMultiplier: getPriceMultiplier(item.weight),
              quantity: item.quantity
            }));
            setCart(formattedCart);
          }

          if (!wishErr && dbWishlist) {
            const formattedWishlist = dbWishlist.map(item => ({
              id: item.product_id,
              name: item.products.name,
              image: item.products.image,
              price: Number(item.products.price),
              category: item.products.category
            }));
            setWishlist(formattedWishlist);
          }

          // 3. Check for any leftover local guest cart to merge
          const localCart = localStorage.getItem('al_quraish_cart');
          if (localCart) {
            try {
              const parsedLocal = JSON.parse(localCart);
              if (parsedLocal && parsedLocal.length > 0) {
                // Merge guest items into DB
                for (const item of parsedLocal) {
                  await supabase.from('cart_items').upsert({
                    user_id: user.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    weight: item.weight
                  }, { onConflict: 'user_id,product_id,weight' });
                }
                localStorage.removeItem('al_quraish_cart');
                // Reload db cart
                const { data: reloadedCart } = await supabase
                  .from('cart_items')
                  .select('*, products(*)')
                  .eq('user_id', user.id);
                if (reloadedCart) {
                  setCart(reloadedCart.map(item => ({
                    id: item.product_id,
                    name: item.products.name,
                    image: item.products.image,
                    weight: item.weight,
                    basePrice: Number(item.products.price),
                    priceMultiplier: getPriceMultiplier(item.weight),
                    quantity: item.quantity
                  })));
                }
              }
            } catch (e) {
              console.error('Failed to merge local cart:', e);
            }
          }

          // 4. Merge guest wishlist
          const localWish = localStorage.getItem('al_quraish_wishlist');
          if (localWish) {
            try {
              const parsedWish = JSON.parse(localWish);
              if (parsedWish && parsedWish.length > 0) {
                for (const prodId of parsedWish) {
                  await supabase.from('wishlist_items').upsert({
                    user_id: user.id,
                    product_id: prodId
                  }, { onConflict: 'user_id,product_id' });
                }
                localStorage.removeItem('al_quraish_wishlist');
                // Reload DB wishlist
                const { data: reloadedWish } = await supabase
                  .from('wishlist_items')
                  .select('*, products(*)')
                  .eq('user_id', user.id);
                if (reloadedWish) {
                  setWishlist(reloadedWish.map(item => ({
                    id: item.product_id,
                    name: item.products.name,
                    image: item.products.image,
                    price: Number(item.products.price),
                    category: item.products.category
                  })));
                }
              }
            } catch (e) {
              console.error('Failed to merge wishlist:', e);
            }
          }

        } catch (e) {
          console.error('Error loading Supabase user cart:', e);
        }
      } else {
        // Logged-out: fetch from localStorage
        const localCart = localStorage.getItem('al_quraish_cart');
        const localWish = localStorage.getItem('al_quraish_wishlist');
        
        if (localCart) {
          try {
            setCart(JSON.parse(localCart));
          } catch {
            setCart([]);
          }
        } else {
          setCart([]);
        }

        if (localWish) {
          try {
            const parsedIds = JSON.parse(localWish);
            // Fetch standard product static cards mapping since user is offline
            // We can resolve objects later or store simple IDs. To be consistent,
            // we will fetch actual data objects if we seed it, or fallback.
            // Let's store direct ID strings in the local wishlist.
            setWishlist(parsedIds.map(id => ({ id })));
          } catch {
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
      }
      setLoading(false);
    };

    loadInitialData();
  }, [user]);

  // Sync state modifications helper
  const saveCartToStorage = (updatedCart) => {
    setCart(updatedCart);
    if (!user) {
      localStorage.setItem('al_quraish_cart', JSON.stringify(updatedCart));
    }
  };

  const saveWishlistToStorage = (updatedWish) => {
    setWishlist(updatedWish);
    if (!user) {
      localStorage.setItem('al_quraish_wishlist', JSON.stringify(updatedWish.map(i => i.id)));
    }
  };

  const addToCart = async (product, weight, qty = 1) => {
    const existingIndex = cart.findIndex(
      item => item.id === product.id && item.weight === weight
    );

    let updatedCart = [...cart];
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += qty;
      saveCartToStorage(updatedCart);
      
      if (user) {
        await supabase
          .from('cart_items')
          .update({ quantity: updatedCart[existingIndex].quantity })
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .eq('weight', weight);
      }
    } else {
      const newItem = {
        id: product.id,
        name: product.name,
        image: product.image || product.heroImage,
        weight: weight,
        basePrice: Number(product.price || product.basePrice),
        priceMultiplier: getPriceMultiplier(weight),
        quantity: qty
      };
      updatedCart.push(newItem);
      saveCartToStorage(updatedCart);

      if (user) {
        await supabase.from('cart_items').upsert({
          user_id: user.id,
          product_id: product.id,
          quantity: qty,
          weight: weight
        });
      }
    }
  };

  const updateCartQty = async (productId, weight, delta) => {
    const idx = cart.findIndex(item => item.id === productId && item.weight === weight);
    if (idx === -1) return;

    let updatedCart = [...cart];
    updatedCart[idx].quantity += delta;

    if (updatedCart[idx].quantity <= 0) {
      updatedCart.splice(idx, 1);
      saveCartToStorage(updatedCart);
      
      if (user) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .eq('weight', weight);
      }
    } else {
      saveCartToStorage(updatedCart);
      
      if (user) {
        await supabase
          .from('cart_items')
          .update({ quantity: updatedCart[idx].quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .eq('weight', weight);
      }
    }
  };

  const removeFromCart = async (productId, weight) => {
    const updatedCart = cart.filter(item => !(item.id === productId && item.weight === weight));
    saveCartToStorage(updatedCart);

    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('weight', weight);
    }
  };

  const addToWishlist = async (product) => {
    // Check if already in wishlist
    if (wishlist.some(item => item.id === product.id)) return;

    const updatedWish = [...wishlist, {
      id: product.id,
      name: product.name,
      image: product.image || product.heroImage,
      price: Number(product.price || product.basePrice),
      category: product.category
    }];
    saveWishlistToStorage(updatedWish);

    if (user) {
      await supabase.from('wishlist_items').upsert({
        user_id: user.id,
        product_id: product.id
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    const updatedWish = wishlist.filter(item => item.id !== productId);
    saveWishlistToStorage(updatedWish);

    if (user) {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearCart = async () => {
    saveCartToStorage([]);
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.basePrice * item.priceMultiplier * item.quantity);
    }, 0);
  };

  return (
    <CartWishlistContext.Provider value={{
      cart,
      wishlist,
      cartOpen,
      setCartOpen,
      addToCart,
      updateCartQty,
      removeFromCart,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearCart,
      getCartSubtotal
    }}>
      {children}
    </CartWishlistContext.Provider>
  );
}

export const useCartWishlist = () => useContext(CartWishlistContext);
