import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Layers,
  Package,
  Zap,
  ShieldCheck,
  Wind,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';
import SearchBar from './SearchBar';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchCategories } from '../services/api';

const categoryIconMap = {
  Layers,
  Package,
  Zap,
  ShieldCheck,
  Wind,
  Sparkles
};

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);

  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    fetchCategories().then((cats) => {
      if (isMounted && Array.isArray(cats)) {
        setCategoriesList(cats);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Admin Portal', path: '/admin/login' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-md group-hover:bg-navy transition-colors duration-300">
              {/* Propeller inspired SVG Icon */}
              <svg className="w-5 h-5 animate-spin-slow group-hover:rotate-180 transition-transform duration-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path d="M12 9C12 9 10 3 14 3C18 3 15 9 12 9Z" fill="currentColor" opacity="0.8" />
                <path d="M12 15C12 15 14 21 10 21C6 21 9 15 12 15Z" fill="currentColor" opacity="0.8" />
                <path d="M15 12C15 12 21 14 21 10C21 6 15 9 15 12Z" fill="currentColor" opacity="0.8" />
                <path d="M9 12C9 12 3 10 3 14C3 18 9 15 9 12Z" fill="currentColor" opacity="0.8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-wider text-navy leading-none">
                SEVAL <span className="text-primary">DRONES</span>
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-600 uppercase tracking-widest leading-tight">
                POWER YOUR FLIGHT
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <SearchBar />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider text-slate-800">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:text-primary transition-colors py-1 relative ${
                  isActive ? 'text-primary font-extrabold' : ''
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `hover:text-primary transition-colors py-1 relative ${
                  isActive ? 'text-primary font-extrabold' : ''
                }`
              }
            >
              Products
            </NavLink>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
              onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 hover:text-primary transition-colors py-1 uppercase"
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {isCategoriesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    Product Categories
                  </div>
                  <div className="space-y-1 pt-1">
                    {categoriesList.map((cat) => {
                      const IconComp = categoryIconMap[cat.icon] || Layers;
                      return (
                        <Link
                          key={cat.id || cat.slug}
                          to={`/category/${cat.slug}`}
                          onClick={() => setIsCategoriesDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors capitalize"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                            <IconComp className="w-3.5 h-3.5" />
                          </div>
                          <span className="truncate">{cat.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <NavLink
              to="/admin/login"
              className={({ isActive }) =>
                `hover:text-primary transition-colors py-1 relative ${
                  isActive ? 'text-primary font-extrabold' : ''
                }`
              }
            >
              Admin Portal
            </NavLink>
          </nav>

          {/* Right User Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Search Toggle Mobile/Tablet */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-primary rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Icon */}
            <Link
              to="/account"
              className="p-2 text-gray-700 hover:text-primary rounded-xl hover:bg-gray-100 transition-colors hidden sm:flex items-center gap-1"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-gray-700 hover:text-rose-600 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="relative bg-primary hover:bg-primary-hover text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white text-primary text-[11px] font-extrabold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger Menu button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-gray-700 hover:text-primary rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Open Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Overlay */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4 pt-1 px-1">
            <SearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu mounted to document.body via Portal to prevent header backdrop-filter clipping */}
      {isMobileMenuOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="xl:hidden fixed inset-0 z-[100] flex justify-end">
            <div
              className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative ml-auto w-4/5 max-w-sm bg-white h-full max-h-screen shadow-2xl p-4 sm:p-5 flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200 overflow-hidden">
              <div className="flex-1 flex flex-col min-h-0">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
                      SD
                    </div>
                    <span className="font-bold text-navy text-base">SEVAL DRONES</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Navigation Links */}
                <div className="py-2 space-y-0.5 shrink-0">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl font-bold text-gray-800 hover:bg-blue-50 hover:text-primary transition-colors text-xs sm:text-sm"
                    >
                      <span>{link.name}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>

                {/* Composite Categories Section with Custom Icons */}
                <div className="pt-2 border-t border-gray-100 flex-1 min-h-0 flex flex-col">
                  <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider px-3 mb-1.5 shrink-0">
                    Shop By Category
                  </div>
                  <div className="space-y-0.5 flex-1 overflow-y-auto pr-1">
                    {categoriesList.map((cat) => {
                      const IconComp = categoryIconMap[cat.icon] || Layers;
                      return (
                        <Link
                          key={cat.id || cat.slug}
                          to={`/category/${cat.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <span className="truncate">{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full shrink-0">
                            {cat.count || 5}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Mobile Account Shortcut */}
              <div className="pt-3 border-t border-gray-100 shrink-0 mt-2">
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-navy font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" /> MY ACCOUNT & ORDERS
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
