import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatINR';
import QuantitySelector from '../components/QuantitySelector';
import OrderSummary from '../components/OrderSummary';
import Breadcrumbs from '../components/Breadcrumbs';
import { useToast } from '../context/ToastContext';
import { normalizeProductImageUrl, handleImageError } from '../utils/imageHelper';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const clean = couponCode.trim().toUpperCase();
    if (clean === 'MOTORX10' || clean === 'FREESHIP' || clean === 'FIRST500') {
      setAppliedCoupon(clean);
      addToast(`Coupon "${clean}" applied successfully!`, 'success');
    } else {
      addToast('Invalid coupon code. Try MOTORX10 or FREESHIP', 'error');
    }
  };

  const breadcrumbItems = [
    { label: 'Shopping Cart', url: '/cart' }
  ];

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-24 h-24 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">YOUR CART IS EMPTY</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Looks like you haven't added any drone motors or components to your cart yet.
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Cart
        </button>
      </div>

      {/* Cart Layout: Left Products (8 cols), Right Summary (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white rounded-2xl border border-gray-200 shadow-card divide-y divide-gray-200 overflow-hidden">
            {cartItems.map((item) => {
              const itemPrice = item.salePrice || item.price;
              return (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
                  {/* Image */}
                  <img
                    src={normalizeProductImageUrl(item.image)}
                    onError={handleImageError}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain bg-gray-50 rounded-xl p-2 border border-gray-200 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                    <span className="text-xs font-mono text-slate-600 font-bold">{item.sku}</span>
                    <Link to={`/products/${item.slug}`} className="block font-bold text-gray-900 text-sm hover:text-primary transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <div className="text-xs text-slate-600 font-medium">{item.category} • {item.brand}</div>
                    <div className="text-sm font-bold text-navy pt-1">
                      {formatINR(itemPrice)}
                    </div>
                  </div>

                  {/* Quantity & Subtotal */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <QuantitySelector
                      quantity={item.quantity}
                      onChange={(newQty) => updateQuantity(item.id, newQty)}
                      size="sm"
                    />

                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-semibold">Total:</div>
                      <div className="text-base font-extrabold text-primary">
                        {formatINR(itemPrice * item.quantity)}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-rose-600 p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon Code Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-navy">
              <Tag className="w-4 h-4 text-primary" />
              <span>Have a promo coupon? Try MOTORX10 or FREESHIP</span>
            </div>

            <form onSubmit={handleApplyCoupon} className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter Code"
                className="px-3 py-2 text-xs font-semibold uppercase bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-primary w-full sm:w-36"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-navy hover:bg-navy-light text-white text-xs font-bold rounded-xl transition-colors shrink-0"
              >
                APPLY
              </button>
            </form>
          </div>

          {/* Continue Shopping Link */}
          <div className="pt-2">
            <Link to="/motors" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping Motors
            </Link>
          </div>

        </div>

        {/* Right Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <OrderSummary cartItems={cartItems} couponCode={appliedCoupon} />

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-primary hover:bg-primary-hover text-white text-sm font-extrabold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
          >
            PROCEED TO CHECKOUT <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
