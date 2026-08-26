import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

/**
 * Normalizes and sanitizes product item object to store minimal attributes in localStorage.
 * Handles backward compatibility with older full product objects gracefully.
 */
function sanitizeWishlistItem(product) {
  if (!product) return null;
  return {
    id: product.id,
    sku: product.sku || '',
    name: product.name || '',
    slug: product.slug || '',
    price: product.price !== undefined ? product.price : null,
    salePrice: product.salePrice !== undefined ? product.salePrice : null,
    image: product.image || (Array.isArray(product.images) && product.images[0]) || '',
    stock: product.stock !== undefined ? product.stock : 0,
    status: product.status || 'IN_STOCK',
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0
  };
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem('motorx_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(item => sanitizeWishlistItem(item))
        .filter(item => item !== null && item.id !== undefined);
    } catch (e) {
      console.error('Failed to load wishlist from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('motorx_wishlist', JSON.stringify(wishlistItems));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage:', e);
    }
  }, [wishlistItems]);

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const toggleWishlist = (product) => {
    if (!product) return false;
    let added = false;
    setWishlistItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        added = false;
        return prev.filter(item => item.id !== product.id);
      } else {
        added = true;
        const newItem = sanitizeWishlistItem(product);
        return [...prev, newItem];
      }
    });
    return added;
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      wishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
