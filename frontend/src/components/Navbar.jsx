import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, Disc, ChevronRight } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';
import SearchBar from './SearchBar';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { cartCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/category/brushless-motors' },
    { name: 'Admin Portal', path: '/admin/login' },
  ];


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
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
                MOTOR<span className="text-primary">X</span>
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
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `hover:text-primary transition-colors py-1 relative ${
                    isActive ? 'text-primary font-extrabold' : ''
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2 text-gray-700 hover:text-primary rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Menu"
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

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">
                    MX
                  </div>
                  <span className="font-bold text-navy text-lg">MOTORX</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-navy rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl font-semibold text-gray-800 hover:bg-blue-50 hover:text-primary transition-colors text-sm"
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Mobile Account Shortcut */}
            <div className="pt-6 border-t border-gray-200 space-y-2">
              <Link
                to="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-navy font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <User className="w-4 h-4" /> MY ACCOUNT & ORDERS
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
