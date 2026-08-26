import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Tag, ArrowLeft, RefreshCw } from 'lucide-react';
import { fetchCategories, fetchBrands } from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, brs] = await Promise.all([fetchCategories(), fetchBrands()]);
      setCategories(cats || []);
      setBrands(brs || []);
    } catch (err) {
      console.warn('Failed to load categories/brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-navy">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-navy">Categories & Brands Management</h1>
            <p className="text-xs text-gray-500">View active store motor categories and brand classification listings</p>
          </div>
        </div>

        <button onClick={loadData} className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-navy text-xs font-bold rounded-xl flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> REFRESH
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Categories Box */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-navy text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> Active Categories ({categories.length})
            </h3>
          </div>

          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.id || c.slug} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <div>
                  <div className="font-bold text-navy">{c.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono">slug: {c.slug}</div>
                </div>
                <span className="px-2.5 py-1 bg-blue-50 text-primary font-bold rounded-full border border-blue-200 text-[11px]">
                  {c.count || 0} Products
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Brands Box */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-navy text-base flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" /> Active Brands ({brands.length})
            </h3>
          </div>

          <div className="space-y-3">
            {brands.map((b) => (
              <div key={b.id || b.slug} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <div>
                  <div className="font-bold text-navy">{b.name}</div>
                  <div className="text-[11px] text-gray-400 font-mono">slug: {b.slug}</div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-[11px]">
                  {b.count || 0} Products
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
