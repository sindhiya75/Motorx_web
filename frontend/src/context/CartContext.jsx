import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

/**
 * Normalizes and sanitizes product item object to store minimal attributes in localStorage.
 * Handles backward compatibility with older full product objects gracefully.
 */
function sanitizeCartItem(product, quantity = 1) {
  if (!product) return null;
  const existingQuantity = product.quantity !== undefined ? product.quantity : quantity;
  return {
    id: product.id,
    sku: product.sku || '',
    name: product.name || '',
    slug: product.slug || '',
    price: product.price !== undefined ? product.price : null,
    salePrice: product.salePrice !== undefined ? product.salePrice : null,
    image: product.image || (Array.isArray(product.images) && product.images[0]) || '',
    quantity: existingQuantity,
    stock: product.stock !== undefined ? product.stock : 0,
    status: product.status || 'IN_STOCK'
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('motorx_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(item => sanitizeCartItem(item))
        .filter(item => item !== null && item.id !== undefined);
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('motorx_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product || product.status === 'OUT_OF_STOCK' || product.status === 'PRICE_ON_REQUEST' || product.status === 'COMING_SOON') {
      return false;
    }

    setCartItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const currentQty = updated[existingIndex].quantity || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + quantity
        };
        return updated;
      } else {
        const newItem = sanitizeCartItem(product, quantity);
        return [...prevItems, newItem];
      }
    });

    return true;
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
