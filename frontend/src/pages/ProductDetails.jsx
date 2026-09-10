import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Check,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Truck,
  ShieldCheck,
  Cpu,
  Share2,
  FileText,
  Boxes,
  MessageSquare
} from 'lucide-react';
import { fetchProductBySlug, fetchProducts } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductGallery from '../components/ProductGallery';
import RatingStars from '../components/RatingStars';
import PriceDisplay from '../components/PriceDisplay';
import QuantitySelector from '../components/QuantitySelector';
import ProductCard from '../components/ProductCard';
import FAQ from '../components/FAQ';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');

  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProductBySlug(slug);
        if (isMounted) {
          setProduct(data);
          if (data && data.category) {
            const relResponse = await fetchProducts({ category: data.category, limit: 4 });
            if (isMounted) {
              setRelatedProducts((relResponse.data || []).filter(p => p.id !== data.id).slice(0, 4));
            }
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch product details');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 aspect-square bg-gray-100 rounded-2xl"></div>
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy">Product Not Found</h2>
        <p className="text-sm text-gray-500">{error || 'The product you are looking for does not exist or has been removed.'}</p>
        <Link to="/motors" className="inline-block px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl">
          BACK TO CATALOGUE
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.status === 'OUT_OF_STOCK';
  const isPriceOnRequest = product.status === 'PRICE_ON_REQUEST';
  const isComingSoon = product.status === 'COMING_SOON';

  const handleAddToCart = () => {
    if (isOutOfStock || isPriceOnRequest || isComingSoon) return;
    addToCart(product, quantity);
    addToast(`Added ${quantity}x ${product.name} to cart`, 'success', 'Added to Cart');
  };

  const handleBuyNow = () => {
    if (isOutOfStock || isPriceOnRequest || isComingSoon) return;
    addToCart(product, quantity);
    openCart();
    navigate('/checkout');
  };

  const handleWishlist = () => {
    const added = toggleWishlist(product);
    addToast(added ? `Added to wishlist` : `Removed from wishlist`, added ? 'success' : 'info');
  };

  const breadcrumbItems = [
    { label: 'Products', url: '/motors' },
    { label: product.category, url: `/motors?category=${encodeURIComponent(product.category)}` },
    { label: product.name, url: '' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Main Product Info Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Gallery (6 cols) */}
        <div className="lg:col-span-6">
          <ProductGallery images={product.images || [product.image]} name={product.name} />
        </div>

        {/* Right Product Summary (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header & Badges */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-mono font-bold">
              <span>SKU: {product.sku}</span>
              <span className="text-primary font-bold">{product.brand}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 pt-1">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />
              <span className="text-xs text-slate-400 font-bold">•</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                100% Certified Material
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-surface-hero rounded-2xl border border-blue-100 space-y-1">
            <PriceDisplay
              price={product.price}
              salePrice={product.salePrice}
              gstIncluded={product.gstIncluded}
              status={product.status}
              size="lg"
            />
            <p className="text-xs text-gray-500 pt-1">
              {product.gstIncluded
                ? "Tax inclusive. GST invoice generated at checkout."
                : "Standard 18% GST added at checkout. Pan India Delivery."}
            </p>
          </div>

          {/* Stock Status Badge */}
          <div className="flex items-center gap-2">
            {product.status === 'IN_STOCK' && (
              <span className="badge-in-stock">
                <Check className="w-4 h-4" /> In Stock — Ready to ship from warehouse
              </span>
            )}
            {product.status === 'LOW_STOCK' && (
              <span className="badge-low-stock">
                <AlertTriangle className="w-4 h-4" /> Low Stock — Only {product.stock} left in stock
              </span>
            )}
            {isOutOfStock && (
              <span className="badge-out-of-stock">
                <XCircle className="w-4 h-4" /> Out of Stock
              </span>
            )}
            {isPriceOnRequest && (
              <span className="badge-price-on-request">
                <HelpCircle className="w-4 h-4" /> Price on Request
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Quantity & Action Buttons */}
          {!isOutOfStock && !isPriceOnRequest && !isComingSoon ? (
            <div className="space-y-4 pt-2 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity:</span>
                <QuantitySelector quantity={quantity} onChange={setQuantity} max={product.stock || 99} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-3.5 px-4 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" /> ADD TO CART
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  BUY NOW
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={() => addToast(`Notification request logged for ${product.name}`, 'info')}
                className="w-full py-3.5 px-4 bg-navy text-white font-bold text-sm rounded-xl hover:bg-navy-light transition-colors"
              >
                {isOutOfStock ? "NOTIFY ME WHEN IN STOCK" : "REQUEST BULK QUOTE"}
              </button>
            </div>
          )}

          {/* Wishlist & Share buttons */}
          <div className="flex items-center gap-4 pt-2 text-xs">
            <button
              onClick={handleWishlist}
              className={`flex items-center gap-1.5 font-semibold transition-colors ${
                inWishlist ? 'text-rose-600' : 'text-gray-600 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
              <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </button>

            <span className="text-gray-300">•</span>

            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                addToast("Product link copied to clipboard", "success");
              }}
              className="flex items-center gap-1.5 font-semibold text-gray-600 hover:text-primary transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Product</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200 text-xs text-slate-700 font-semibold">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-primary shrink-0" />
              <span>Pan-India Shipping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span>Lab Certified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-primary shrink-0" />
              <span>GST Tax Invoice</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Below: Specifications, Applications, Package Contents, Reviews */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/70">
          {[
            { id: 'specs', label: 'Technical Specifications', icon: FileText },
            { id: 'applications', label: 'Applications', icon: Cpu },
            { id: 'package', label: 'Package Contents', icon: Boxes },
            { id: 'reviews', label: `Reviews (${product.reviewCount || 0})`, icon: MessageSquare }
          ].map(tab => {
            const IconComp = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-xs font-extrabold uppercase tracking-wider whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors ${
                  active
                    ? 'border-primary text-primary bg-white font-extrabold shadow-sm'
                    : 'border-transparent text-slate-700 hover:text-navy hover:bg-gray-100/70 font-bold'
                }`}
              >
                <IconComp className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 sm:p-8">
          {/* Tab 1: Dynamic Specs Table */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-navy mb-3">Material Technical Specifications</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-200 text-xs sm:text-sm">
                {Object.entries(product.specifications || {}).map(([key, val], idx) => (
                  <div key={key} className={`flex flex-col sm:flex-row p-3.5 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}`}>
                    <span className="w-full sm:w-1/3 font-bold text-navy">{key}</span>
                    <span className="w-full sm:w-2/3 text-gray-700 font-mono mt-1 sm:mt-0">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Applications */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-navy mb-3">Industrial Composite Applications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(product.applications || ["Aerospace & Defense", "Automotive Composite Tooling", "Marine & Wind Energy"]).map((app, idx) => (
                  <div key={idx} className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 font-bold text-xs text-navy flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Package Contents */}
          {activeTab === 'package' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-navy mb-3">Package Contents & Documentation</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-700 pl-5 list-disc">
                {(product.packageContents || [`1x ${product.name}`, "Quality Certificate", "MSDS Document"]).map((item, idx) => (
                  <li key={idx} className="font-medium">{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab 4: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-navy">Customer Reviews</h3>
                  <div className="mt-1">
                    <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => addToast("Review submission is enabled for verified purchasers.", "info")}
                  className="px-4 py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navy-light transition-colors"
                >
                  WRITE A REVIEW
                </button>
              </div>

              <div className="space-y-4 divide-y divide-gray-100">
                <div className="pt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-900">Composite Engineer (Verified Purchaser)</span>
                    <span className="text-gray-400">1 week ago</span>
                  </div>
                  <RatingStars rating={5} showValue={false} size="xs" />
                  <p className="text-xs text-gray-600 pt-1">
                    Excellent thermal resistance and surface finish. Perfect for high-temperature tooling and vacuum bagging procedures.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Specific FAQ */}
      <FAQ />

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-xl font-bold text-navy">Related Composite Products</h2>
            <Link to="/motors" className="text-xs font-bold text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
