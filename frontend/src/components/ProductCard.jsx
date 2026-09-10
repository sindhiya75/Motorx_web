import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Check, AlertTriangle, XCircle, HelpCircle, Sparkles } from 'lucide-react';
import RatingStars from './RatingStars';
import PriceDisplay from './PriceDisplay';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const isPriceOnRequest = product.status === 'PRICE_ON_REQUEST';
  const isComingSoon = product.status === 'COMING_SOON';
  const isLowStock = product.status === 'LOW_STOCK';

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleWishlist(product);
    addToast(
      added ? `Added ${product.name} to wishlist` : `Removed from wishlist`,
      added ? 'success' : 'info'
    );
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isPriceOnRequest || isComingSoon) return;
    
    addToCart(product, 1);
    addToast(`Added ${product.name} to cart`, 'success', 'Cart Updated');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isPriceOnRequest || isComingSoon) return;
    
    addToCart(product, 1);
    openCart();
    navigate('/checkout');
  };

  const handleActionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) {
      addToast(`We will notify you when ${product.name} is back in stock!`, 'info', 'Notification Set');
    } else if (isPriceOnRequest) {
      addToast(`Quote request initiated for ${product.name}. Our sales team will contact you.`, 'info', 'Quote Requested');
    } else if (isComingSoon) {
      addToast(`${product.name} will launch soon! Added to your notify list.`, 'info', 'Coming Soon');
    }
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-xl border border-gray-200 hover:border-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
      {/* Product Image & Badges Container */}
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center p-4">
        <Link to={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 ${
            inWishlist
              ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm'
              : 'bg-white/90 text-slate-500 hover:text-rose-600 hover:bg-white border border-gray-300 shadow-sm'
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Stock status badge overlay top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.featured && (
            <span className="bg-navy text-white text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-sm inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="flex flex-col flex-1 p-4">
        {/* SKU */}
        <div className="text-xs font-mono text-slate-600 font-semibold mb-1 tracking-wider uppercase">
          {product.sku}
        </div>

        {/* Name */}
        <Link
          to={`/products/${product.slug}`}
          className="font-semibold text-gray-900 text-sm hover:text-primary transition-colors line-clamp-2 mb-2 min-h-[40px] leading-snug"
        >
          {product.name}
        </Link>

        {/* Rating */}
        <div className="mb-3">
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="xs" />
        </div>

        {/* Price Section */}
        <div className="mb-3 mt-auto">
          <PriceDisplay
            price={product.price}
            salePrice={product.salePrice}
            gstIncluded={product.gstIncluded}
            status={product.status}
          />
        </div>

        {/* Stock Status Badge */}
        <div className="mb-4">
          {product.status === 'IN_STOCK' && (
            <span className="badge-in-stock">
              <Check className="w-3 h-3" /> In Stock
            </span>
          )}
          {isLowStock && (
            <span className="badge-low-stock">
              <AlertTriangle className="w-3 h-3" /> Low Stock ({product.stock} left)
            </span>
          )}
          {isOutOfStock && (
            <span className="badge-out-of-stock">
              <XCircle className="w-3 h-3" /> Out of Stock
            </span>
          )}
          {isPriceOnRequest && (
            <span className="badge-price-on-request">
              <HelpCircle className="w-3 h-3" /> Price on Request
            </span>
          )}
          {isComingSoon && (
            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              Coming Soon
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-auto">
          {!isOutOfStock && !isPriceOnRequest && !isComingSoon ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-2 px-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                ADD TO CART
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-2 px-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                BUY NOW
              </button>
            </div>
          ) : isOutOfStock ? (
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-gray-300"
            >
              NOTIFY ME
            </button>
          ) : isPriceOnRequest ? (
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full py-2.5 px-3 bg-navy hover:bg-navy-light text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              REQUEST QUOTE
            </button>
          ) : (
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              PRE-REGISTER
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
