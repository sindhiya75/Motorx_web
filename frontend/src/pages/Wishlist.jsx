import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatINR';
import Breadcrumbs from '../components/Breadcrumbs';
import RatingStars from '../components/RatingStars';
import PriceDisplay from '../components/PriceDisplay';
import { useToast } from '../context/ToastContext';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();
  const { addToast } = useToast();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    addToast(`Moved ${product.name} to cart`, 'success');
  };

  const breadcrumbItems = [
    { label: 'Wishlist', url: '/wishlist' }
  ];

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Heart className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">YOUR WISHLIST IS EMPTY</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            You haven't saved any motors or DIY components to your wishlist yet.
          </p>
        </div>
        <Link
          to="/motors"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-colors"
        >
          <span>EXPLORE MOTORS</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">My Wishlist</h1>
          <p className="text-xs text-gray-500 mt-1">{wishlistItems.length} saved products</p>
        </div>

        <Link to="/motors" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Motors
        </Link>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlistItems.map((product) => {
          const isOutOfStock = product.status === 'OUT_OF_STOCK';
          const isPriceOnRequest = product.status === 'PRICE_ON_REQUEST';

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden flex flex-col justify-between p-4 space-y-3"
            >
              {/* Product Preview */}
              <div className="relative aspect-square bg-gray-50 rounded-xl p-4 flex items-center justify-center overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-full shadow-sm transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Product Info */}
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-600 font-bold">{product.sku}</span>
                <Link
                  to={`/products/${product.slug}`}
                  className="block text-xs font-bold text-gray-900 hover:text-primary line-clamp-2 leading-snug"
                >
                  {product.name}
                </Link>
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="xs" />
              </div>

              {/* Price */}
              <div>
                <PriceDisplay
                  price={product.price}
                  salePrice={product.salePrice}
                  status={product.status}
                  size="sm"
                />
              </div>

              {/* Actions */}
              {!isOutOfStock && !isPriceOnRequest ? (
                <button
                  type="button"
                  onClick={() => handleMoveToCart(product)}
                  className="w-full py-2.5 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" /> MOVE TO CART
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-3 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl cursor-not-allowed text-center"
                >
                  UNAVAILABLE
                </button>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
