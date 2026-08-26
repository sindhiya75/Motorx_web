import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-24 h-24 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto shadow-inner">
        <Compass className="w-12 h-12 animate-spin-slow" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-extrabold text-primary uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
          ERROR 404
        </span>
        <h1 className="text-4xl font-extrabold text-navy tracking-tight">PAGE NOT FOUND</h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The page or motor specification you are looking for has been moved or doesn't exist.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/"
          className="px-6 py-3 bg-white border border-gray-300 text-navy font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> GO TO HOME
        </Link>
        <Link
          to="/motors"
          className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md"
        >
          <span>EXPLORE MOTORS</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
