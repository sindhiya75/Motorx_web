import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Cpu,
  Receipt,
  Headphones,
  MapPin,
  Sparkles,
  Layers,
  CheckCircle2,
  Zap,
  Gauge,
  Wrench,
  Award,
  Phone,
  Mail,
  Building,
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';
import { fetchProducts, fetchCategories } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { normalizeProductImageUrl, handleImageError } from '../utils/imageHelper';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      setLoading(true);
      try {
        const [featRes, popRes, catsRes] = await Promise.all([
          fetchProducts({ featured: true, limit: 8 }),
          fetchProducts({ sort: 'popularity', limit: 8 }),
          fetchCategories()
        ]);

        if (isMounted) {
          setFeaturedProducts(featRes.data || []);
          setPopularProducts(popRes.data || []);
          setCategoriesList(catsRes || []);
        }
      } catch (err) {
        console.warn('Failed loading home page data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHomeData();
    return () => { isMounted = false; };
  }, []);

  const whyMotorXHighlights = [
    {
      title: "High Torque Density Motors",
      desc: "Engineered with Japanese NMB bearings, oxygen-free copper windings, and curved N52 Neodymium magnets for peak efficiency.",
      icon: Gauge
    },
    {
      title: "Aircraft & Automotive Grade CNC",
      desc: "Precision CNC-machined 7075-T6 aluminum housings built for high thermal dissipation and intense rotational stability.",
      icon: Wrench
    },
    {
      title: "Extreme Thermal Endurance",
      desc: "Class H high-temperature wire insulation rated up to 220°C for demanding continuous automotive & aerial applications.",
      icon: Flame
    },
    {
      title: "Dynamic Balancing & QC",
      desc: "Every single rotor is factory dynamically balanced below 0.005g to eliminate vibration and extend bearing lifespan.",
      icon: ShieldCheck
    },
    {
      title: "Pan-India Express Dispatch",
      desc: "Instant dispatch from central warehouse with real-time courier tracking and GST tax invoices.",
      icon: Truck
    },
    {
      title: "Technical Engineering Support",
      desc: "Direct access to application engineers for KV matching, ESC selection, and custom motor design inquiries.",
      icon: Headphones
    }
  ];

  const trustBadges = [
    { title: "Certified Materials", desc: "100% Quality inspected stock", icon: Cpu },
    { title: "Secure Payments", desc: "Encrypted transactions & Razorpay", icon: ShieldCheck },
    { title: "Pan-India Delivery", desc: "Express courier shipping", icon: Truck },
    { title: "GST Invoicing", desc: "Input tax credit available", icon: Receipt },
    { title: "Technical Support", desc: "Material selection guidance", icon: Headphones },
    { title: "Real-time Tracking", desc: "Order status & dispatch updates", icon: MapPin },
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', phone: '', message: '' });
      setContactSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. PROFESSIONAL AUTOMOTIVE HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-deep via-navy to-navy-light text-white py-16 sm:py-24 border-b border-gray-800">
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Automotive Messaging */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-blue-300 text-xs font-extrabold uppercase tracking-wider shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>MOTORX AUTOMOTIVE & HIGH-PERFORMANCE MOTORS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white">
                PRECISION <span className="text-primary">AUTOMOTIVE &</span> <br />
                BRUSHLESS MOTORS
              </h1>

              <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Engineered for electric mobility, UAV drones, automotive robotics, and high-performance DIY systems. High torque density, N52 magnets & Japanese NMB bearings.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="px-8 py-4 bg-primary hover:bg-primary-hover text-white text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group uppercase tracking-wider"
                >
                  <span>SHOP PRODUCTS</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#categories"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-extrabold rounded-xl transition-colors shadow-sm uppercase tracking-wider backdrop-blur-md"
                >
                  EXPLORE CATEGORIES
                </a>
              </div>

              {/* Automotive Stat Badges */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-800 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-slate-300 font-medium">Dynamically Balanced</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">N52</div>
                  <div className="text-xs text-slate-300 font-medium">Neodymium Magnets</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-white">Pan-India</div>
                  <div className="text-xs text-slate-300 font-medium">Express Delivery</div>
                </div>
              </div>
            </div>

            {/* Right Automotive Hero Visual Graphic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-blue-400 rounded-3xl blur-2xl opacity-30 -z-10" />
                <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-gray-200 text-gray-900 shadow-2xl space-y-4">
                  <div className="relative aspect-square w-full rounded-2xl bg-gray-50 overflow-hidden flex items-center justify-center p-6 border border-gray-100">
                    <img
                      src={normalizeProductImageUrl('/products/cured_products/Carbon_Fiber_Sheet.jpeg')}
                      onError={handleImageError}
                      alt="MOTORX High Performance Composites"
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-navy text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      MX-2207 PRO
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h3 className="font-bold text-navy text-sm sm:text-base">MOTORX AeroDrive 2207 Motor</h3>
                      <p className="text-xs text-gray-500">2450KV • NMB Bearings • 4S-6S LiPo</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-primary">₹2,499</span>
                      <span className="block text-[10px] text-gray-400 line-through">₹2,899</span>
                    </div>
                  </div>

                  <Link
                    to="/products"
                    className="w-full py-3 bg-navy hover:bg-navy-light text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors uppercase tracking-wider"
                  >
                    <span>VIEW MOTOR SPECIFICATIONS</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. DYNAMIC PRODUCT CATEGORIES SECTION */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Catalogue Overview</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy mt-1">Explore Motor Categories</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Dynamic catalog fetched live from backend API. Choose your motor specialization below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesList.map((cat) => (
            <CategoryCard key={cat.id || cat.slug} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
          <div>
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">Handpicked Performance</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy mt-1">Featured Motors & Components</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-primary hover:text-navy transition-colors flex items-center gap-1"
          >
            VIEW ALL PRODUCTS <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. WHY MOTORX SECTION - AEROSPACE GRADE GLASSMORPHISM */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-deep via-navy to-navy-light text-white py-20 sm:py-24 border-y border-gray-800">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:28px_28px] opacity-5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-blue-300 text-xs font-extrabold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ENGINEERING & COMPOSITES EXCELLENCE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-primary-light">MOTORX</span>?
            </h2>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Engineered with aerospace-grade standards, continuous thermal endurance, and strict quality certification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyMotorXHighlights.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-7 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-primary/60 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-primary/25 overflow-hidden flex flex-col justify-between"
                >
                  {/* Subtle top-right radial glow on hover */}
                  <div className="absolute -right-12 -top-12 w-36 h-36 bg-gradient-to-br from-primary/30 to-sky-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                  {/* Monospace watermark number */}
                  <span className="absolute top-5 right-6 text-3xl font-mono font-black text-white/10 group-hover:text-primary/30 transition-colors duration-300 pointer-events-none select-none">
                    0{idx + 1}
                  </span>

                  <div className="space-y-4 relative z-10">
                    {/* Glowing Icon Container */}
                    <div className="w-13 h-13 w-fit p-3.5 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/10 border border-primary/40 text-sky-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-md">
                      <IconComp className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-extrabold text-white group-hover:text-sky-300 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>

                  {/* Animated bottom progress bar */}
                  <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
                    <div className="w-10 h-1 rounded-full bg-primary/40 group-hover:w-full group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-sky-400 transition-all duration-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-navy text-white overflow-hidden p-8 sm:p-12 shadow-2xl border border-navy-light">
          <div className="absolute right-0 top-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-widest inline-block">
              SPECIAL ENGINEERING OFFER
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Custom OEM Motor Design & Bulk Corporate Orders
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Need custom KV ratings, specialized shaft lengths, custom anodized colors, or bulk GST B2B billing? Our engineering team provides end-to-end prototyping and volume manufacturing support.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="px-6 py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-xl shadow-md transition-colors uppercase tracking-wider inline-flex items-center gap-2"
              >
                <span>REQUEST BULK QUOTE</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/products"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-extrabold rounded-xl transition-colors uppercase tracking-wider inline-flex items-center gap-2"
              >
                BROWSE ALL PRODUCTS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ABOUT MOTORX PREVIEW */}
      <section id="guide" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 sm:p-12 rounded-3xl border border-gray-200 shadow-card">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-extrabold text-primary uppercase tracking-wider">ABOUT MOTORX</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy">
              Pioneering High Performance Electric Motors & Powertrains
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              MotorX is a dedicated automotive and industrial motor platform delivering high torque brushless motors, ESC speed controllers, composite structural materials, and power accessories across India.
            </p>
            <div className="space-y-2 pt-2 text-xs font-semibold text-navy">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Over 50,000+ motors supplied to researchers, drone builders, and EV innovators</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Strict ISO quality controls and 100% full-throttle load testing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Instant dispatch with GST input tax credit invoices</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="p-6 bg-surface-hero rounded-2xl border border-blue-100 text-center space-y-1">
              <div className="text-3xl font-extrabold text-navy">25+</div>
              <div className="text-xs text-gray-500 font-semibold">Active Product SKUs</div>
            </div>
            <div className="p-6 bg-surface-hero rounded-2xl border border-blue-100 text-center space-y-1">
              <div className="text-3xl font-extrabold text-navy">99.8%</div>
              <div className="text-xs text-gray-500 font-semibold">Quality Pass Rate</div>
            </div>
            <div className="p-6 bg-surface-hero rounded-2xl border border-blue-100 text-center space-y-1">
              <div className="text-3xl font-extrabold text-navy">24h</div>
              <div className="text-xs text-gray-500 font-semibold">Fast Order Dispatch</div>
            </div>
            <div className="p-6 bg-surface-hero rounded-2xl border border-blue-100 text-center space-y-1">
              <div className="text-3xl font-extrabold text-navy">100%</div>
              <div className="text-xs text-gray-500 font-semibold">Original Warranty</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONTACT CTA SECTION */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 sm:p-12 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-extrabold text-primary uppercase tracking-wider">GET IN TOUCH</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-navy mt-1">Contact MotorX Team</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Have questions about motor compatibility, bulk pricing, or custom engineering specs? Reach out directly.
              </p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-bold uppercase">Phone Support</div>
                  <a href="tel:+918344660031" className="text-navy font-bold text-sm hover:text-primary transition-colors">+91 83446 60031</a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-bold uppercase">Email Support</div>
                  <a href="mailto:mjayakumaraero@gmail.com" className="text-navy font-bold text-sm hover:text-primary transition-colors">mjayakumaraero@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-slate-500 text-xs font-bold uppercase">Central Facility</div>
                  <div className="text-navy font-bold leading-relaxed">
                    Plot No. 3-898, Sri Swamy Ayyappa Cooperative Society,<br />
                    Road No. 1, Madhapur, Hyderabad,<br />
                    Telangana 500081, India
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-surface-hero p-6 sm:p-8 rounded-2xl border border-blue-100">
            {contactSubmitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-base">Inquiry Submitted Successfully!</h3>
                <p className="text-xs">Thank you for reaching out. Our engineering sales team will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <h3 className="font-bold text-navy text-sm uppercase tracking-wider border-b border-blue-200 pb-2">
                  Send Technical Inquiry
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-3 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase mb-1">Message / Requirements *</label>
                  <textarea
                    rows={3}
                    required
                    value={contactForm.message}
                    onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your motor specifications or bulk quantity requirements..."
                    className="w-full px-3 py-2.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-extrabold text-xs rounded-xl shadow-md transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>SUBMIT INQUIRY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* TRUST BADGES STRIP */}
      <section className="bg-navy-deep text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {trustBadges.map((badge, idx) => {
              const IconComp = badge.icon;
              return (
                <div key={idx} className="flex flex-col items-center text-center space-y-2 p-3">
                  <div className="w-12 h-12 rounded-xl bg-navy-light/40 text-blue-300 flex items-center justify-center border border-navy-light/60">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">{badge.title}</h4>
                  <p className="text-xs text-slate-300 font-medium">{badge.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
