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
    const val = parseFloat(weight);
    return val * 2; // base price is for 500g
  }
  if (weight.includes('g') && !weight.includes('pieces')) {
    const val = parseFloat(weight);
    return val / 500; // base price is for 500g
  }
  if (weight.includes('pieces')) {
    const val = parseInt(weight);
    return val / 6; // base price is for 6 pieces
  }
  if (weight.includes('ml')) {
    const val = parseFloat(weight);
    return val / 200; // base price is for 200ml
  }
  if (weight.includes('L')) {
    const val = parseFloat(weight);
    return val * 5; // base price is for 200ml
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

      // 1. Local-first immediate load from localStorage
      const localCart = localStorage.getItem('al_quraish_cart');
      const localWish = localStorage.getItem('al_quraish_wishlist');

      let initialCart = [];
      if (localCart) {
        try {
          initialCart = JSON.parse(localCart);
          setCart(initialCart);
        } catch (e) {
          console.error('Failed to parse local cart:', e);
        }
      }

      let initialWish = [];
      if (localWish) {
        try {
          const parsedIds = JSON.parse(localWish);
          initialWish = parsedIds.map(id => typeof id === 'object' ? id : { id });
          setWishlist(initialWish);
        } catch (e) {
          console.error('Failed to parse local wishlist:', e);
        }
      }

      if (user) {
        // Logged-in: sync and merge with Supabase in the background
        try {
          // A. Fetch Cart Items from DB
          const { data: dbCart, error: cartErr } = await supabase
            .from('cart_items')
            .select('*, products(*)')
            .eq('user_id', user.id);

          // B. Fetch Wishlist Items from DB
          const { data: dbWishlist, error: wishErr } = await supabase
            .from('wishlist_items')
            .select('*, products(*)')
            .eq('user_id', user.id);

          let mergedCart = [...initialCart];
          if (!cartErr && dbCart) {
            // Filter out any items where joined product is null due to id mismatches or seeding lags
            const formattedCart = dbCart
              .filter(item => item.products !== null)
              .map(item => ({
                id: item.product_id,
                name: item.products.name,
                image: item.products.image,
                weight: item.weight,
                basePrice: Number(item.products.price),
                priceMultiplier: getPriceMultiplier(item.weight),
                quantity: item.quantity
              }));

            // Merge DB items into the local cart
            formattedCart.forEach(dbItem => {
              const idx = mergedCart.findIndex(
                localItem => localItem.id === dbItem.id && localItem.weight === dbItem.weight
              );
              if (idx > -1) {
                mergedCart[idx].quantity = Math.max(mergedCart[idx].quantity, dbItem.quantity);
              } else {
                mergedCart.push(dbItem);
              }
            });
            setCart(mergedCart);
            localStorage.setItem('al_quraish_cart', JSON.stringify(mergedCart));
          }

          let mergedWish = [...initialWish];
          if (!wishErr && dbWishlist) {
            const formattedWishlist = dbWishlist
              .filter(item => item.products !== null)
              .map(item => ({
                id: item.product_id,
                name: item.products.name,
                image: item.products.image,
                price: Number(item.products.price),
                category: item.products.category
              }));

            // Merge DB items into the local wishlist
            formattedWishlist.forEach(dbItem => {
              if (!mergedWish.some(localItem => localItem.id === dbItem.id)) {
                mergedWish.push(dbItem);
              }
            });
            setWishlist(mergedWish);
            localStorage.setItem('al_quraish_wishlist', JSON.stringify(mergedWish.map(i => i.id)));
          }

          // C. Push local items not in Supabase back to the database in background
          if (mergedCart.length > 0) {
            for (const item of mergedCart) {
              try {
                await supabase.from('cart_items').upsert({
                  user_id: user.id,
                  product_id: item.id,
                  quantity: item.quantity,
                  weight: item.weight
                }, { onConflict: 'user_id,product_id,weight' });
              } catch (err) {
                // If it fails (e.g. foreign key constraint for unseeded products), catch silently so local cart is unaffected
                console.warn(`Supabase background cart sync failed for product '${item.id}':`, err);
              }
            }
          }

          if (mergedWish.length > 0) {
            for (const item of mergedWish) {
              try {
                await supabase.from('wishlist_items').upsert({
                  user_id: user.id,
                  product_id: item.id
                }, { onConflict: 'user_id,product_id' });
              } catch (err) {
                console.warn(`Supabase background wishlist sync failed for product '${item.id}':`, err);
              }
            }
          }

        } catch (e) {
          console.error('Error syncing Supabase user cart:', e);
        }
      }
      setLoading(false);
    };

    loadInitialData();
  }, [user]);

  // Sync state modifications helper
  const saveCartToStorage = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem('al_quraish_cart', JSON.stringify(updatedCart));
  };

  const saveWishlistToStorage = (updatedWish) => {
    setWishlist(updatedWish);
    localStorage.setItem('al_quraish_wishlist', JSON.stringify(updatedWish.map(i => i.id)));
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
        try {
          await supabase
            .from('cart_items')
            .update({ quantity: updatedCart[existingIndex].quantity })
            .eq('user_id', user.id)
            .eq('product_id', product.id)
            .eq('weight', weight);
        } catch (e) {
          console.error('Failed to sync cart item update to Supabase:', e);
        }
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
        try {
          await supabase.from('cart_items').upsert({
            user_id: user.id,
            product_id: product.id,
            quantity: qty,
            weight: weight
          });
        } catch (e) {
          console.error('Failed to sync new cart item to Supabase:', e);
        }
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
        try {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .eq('weight', weight);
        } catch (e) {
          console.error('Failed to delete cart item from Supabase:', e);
        }
      }
    } else {
      saveCartToStorage(updatedCart);
      
      if (user) {
        try {
          await supabase
            .from('cart_items')
            .update({ quantity: updatedCart[idx].quantity })
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .eq('weight', weight);
        } catch (e) {
          console.error('Failed to update cart item quantity in Supabase:', e);
        }
      }
    }
  };

  const removeFromCart = async (productId, weight) => {
    const updatedCart = cart.filter(item => !(item.id === productId && item.weight === weight));
    saveCartToStorage(updatedCart);

    if (user) {
      try {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)
          .eq('weight', weight);
      } catch (e) {
        console.error('Failed to delete cart item from Supabase:', e);
      }
    }
  };

  const addToWishlist = async (product) => {
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
      try {
        await supabase.from('wishlist_items').upsert({
          user_id: user.id,
          product_id: product.id
        });
      } catch (e) {
        console.error('Failed to add wishlist item to Supabase:', e);
      }
    }
  };

  const removeFromWishlist = async (productId) => {
    const updatedWish = wishlist.filter(item => item.id !== productId);
    saveWishlistToStorage(updatedWish);

    if (user) {
      try {
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } catch (e) {
        console.error('Failed to delete wishlist item from Supabase:', e);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearCart = async () => {
    saveCartToStorage([]);
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } catch (e) {
        console.error('Failed to clear cart in Supabase:', e);
      }
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
