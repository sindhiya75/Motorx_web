import React from 'react';
import { ShieldCheck, Truck, Cpu } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-navy-deep text-white text-xs font-medium py-2 px-4 border-b border-navy-light/30">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-6 mx-auto sm:mx-0">
          <span className="inline-flex items-center gap-1.5 text-blue-200">
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Pan India Delivery</span>
          </span>
          <span className="hidden sm:inline text-navy-light">•</span>
          <span className="inline-flex items-center gap-1.5 text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Secure Payments</span>
          </span>
          <span className="hidden sm:inline text-navy-light">•</span>
          <span className="inline-flex items-center gap-1.5 text-blue-200">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Genuine Components</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-gray-300 text-[11px]">
          <span>GST Invoicing Available</span>
          <span>•</span>
          <a href="tel:+919876543210" className="hover:text-white transition-colors">
            Support: +91 98765 43210
          </a>
        </div>
      </div>
    </div>
  );
}
