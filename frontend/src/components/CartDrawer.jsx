import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatINR';
import { calculateCartSummary, FREE_SHIPPING_THRESHOLD } from '../utils/calculations';
import { normalizeProductImageUrl, handleImageError } from '../utils/imageHelper';
import QuantitySelector from './QuantitySelector';

export default function CartDrawer() {
  const { cartItems, isCartOpen, closeCart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const summary = calculateCartSummary(cartItems);

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-deep/60 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 bg-navy text-white flex items-center justify-between border-b border-navy-light">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-lg text-white">Your Cart ({summary.itemCount})</h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1 rounded-lg text-gray-300 hover:text-white hover:bg-navy-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          {cartItems.length > 0 && (
            <div className="bg-blue-50 p-3 px-5 border-b border-blue-100">
              <div className="flex items-center justify-between text-xs font-semibold text-primary mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-primary" />
                  {summary.isFreeShippingEligible ? (
                    <span className="text-emerald-700 font-bold">You qualify for FREE Shipping!</span>
                  ) : (
                    <span>Add {formatINR(summary.amountForFreeShipping)} more for FREE Shipping</span>
                  )}
                </span>
              </div>
              <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (summary.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg">YOUR CART IS EMPTY</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Looks like you haven't added any drone motors or components to your cart yet.
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/motors');
                  }}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  EXPLORE MOTORS
                </button>
              </div>
            ) : (
              cartItems.map((item) => {
                const itemPrice = item.salePrice || item.price;
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200/80 hover:border-gray-300 transition-all"
                  >
                    <img
                      src={normalizeProductImageUrl(item.image)}
                      onError={handleImageError}
                      alt={item.name}
                      className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-gray-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-1">
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-xs font-bold text-gray-900 hover:text-primary line-clamp-2 leading-snug"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-500 hover:text-rose-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-xs font-mono text-slate-600 font-semibold">
                        {item.sku}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <QuantitySelector
                          quantity={item.quantity}
                          onChange={(newQty) => updateQuantity(item.id, newQty)}
                          size="sm"
                        />
                        <span className="font-bold text-navy text-sm">
                          {formatINR(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 bg-gray-50 border-t border-gray-200 space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{formatINR(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. GST (18%)</span>
                  <span>{formatINR(summary.gst)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={summary.shipping === 0 ? "text-emerald-600 font-bold" : ""}>
                    {summary.shipping === 0 ? "FREE" : formatINR(summary.shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-navy pt-2 border-t border-gray-200">
                  <span>Grand Total</span>
                  <span className="text-primary text-base">{formatINR(summary.grandTotal)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    closeCart();
                    navigate('/cart');
                  }}
                  className="w-full py-2.5 px-3 bg-white border border-gray-300 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors text-center"
                >
                  VIEW CART
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-2.5 px-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors text-center flex items-center justify-center gap-1 shadow-md"
                >
                  CHECKOUT <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
