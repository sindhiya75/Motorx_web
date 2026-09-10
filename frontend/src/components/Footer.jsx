import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="footer" className="bg-[#061B36] text-white py-12 border-t border-navy-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary text-white font-extrabold rounded-lg flex items-center justify-center text-xs">
                MX
              </div>
              <span className="font-extrabold text-lg text-white tracking-wider">MOTORX</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              High-performance brushless motors, ESC powertrains, and composite engineering materials across India.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300 mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-200 font-medium">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home Landing</Link></li>
              <li><Link to="/products" className="hover:text-blue-400 transition-colors">Products Catalog</Link></li>
              <li><Link to="/category/brushless-motors" className="hover:text-blue-400 transition-colors">Motor Categories</Link></li>
              <li><Link to="/cart" className="hover:text-blue-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/checkout" className="hover:text-blue-400 transition-colors">Checkout</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300 mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-xs text-slate-200 font-medium">
              <li><Link to="/category/brushless-motors" className="hover:text-blue-400 transition-colors">Brushless Drone Motors</Link></li>
              <li><Link to="/category/esc-controllers" className="hover:text-blue-400 transition-colors">Electronic Speed Controllers</Link></li>
              <li><Link to="/category/tooling-boards" className="hover:text-blue-400 transition-colors">Epoxy Tooling Boards</Link></li>
              <li><Link to="/category/carbon-profiles" className="hover:text-blue-400 transition-colors">Pultruded Carbon Fiber</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300 mb-3">Administration</h4>
            <ul className="space-y-2 text-xs text-slate-200 font-medium">
              <li><Link to="/admin/login" className="hover:text-blue-400 transition-colors font-bold text-blue-300">Admin Login Portal</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-blue-400 transition-colors">Protected Admin Dashboard</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-gray-800 text-center text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 MOTORX. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-slate-300 text-xs font-medium">
            <span>Automotive & UAV Powertrain Engineering</span>
            <span className="text-blue-300/60 font-bold">•</span>
            <span>GST B2B Invoicing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
