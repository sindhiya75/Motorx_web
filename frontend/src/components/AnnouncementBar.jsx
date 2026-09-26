import React from 'react';
import { ShieldCheck, Truck, Cpu } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-navy-deep text-white text-xs font-medium py-2 px-4 border-b border-navy-light/30">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-6 mx-auto sm:mx-0">
          <span className="inline-flex items-center gap-1.5 text-blue-100 font-semibold">
            <Truck className="w-4 h-4 text-blue-300" />
            <span>Pan India Delivery</span>
          </span>
          <span className="hidden sm:inline text-blue-300/60 font-bold">•</span>
          <span className="inline-flex items-center gap-1.5 text-blue-100 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-300" />
            <span>Secure Payments</span>
          </span>
          <span className="hidden sm:inline text-blue-300/60 font-bold">•</span>
          <span className="inline-flex items-center gap-1.5 text-blue-100 font-semibold">
            <Cpu className="w-4 h-4 text-blue-300" />
            <span>Genuine Components</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-4 text-blue-100 text-xs font-medium">
          <span>GST Invoicing Available</span>
          <span className="text-blue-300/60 font-bold">•</span>
          <a href="tel:+918344660031" className="hover:text-white font-semibold transition-colors">
            Support: +91 8344660031
          </a>
        </div>
      </div>
    </div>
  );
}
