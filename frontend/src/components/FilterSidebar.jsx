import React from 'react';
import { createPortal } from 'react-dom';
import { Filter, RefreshCw, Check, X } from 'lucide-react';
import RatingStars from './RatingStars';

export default function FilterSidebar({
  filters,
  onFilterChange,
  onResetFilters,
  isOpen,
  onClose,
  categories = [],
  brands = []
}) {
  const defaultCategories = [
    "All Products",
    "Moulds & Patterns",
    "Core Materials",
    "Pultruded Products",
    "Cured Products",
    "Vacuum Bagging Consumables"
  ];

  const categoriesList = categories.length > 0
    ? ["All Products", ...categories.map(c => c.name)]
    : defaultCategories;

  const defaultBrands = ["Seval Drones Composites", "AeroCore Systems", "PolyForm Moulds", "TitanPultrusion", "VacuSeal Tech"];
  const brandsList = brands.length > 0
    ? brands.map(b => b.name)
    : defaultBrands;

  const availabilityList = [
    { label: "In Stock", value: "IN_STOCK" },
    { label: "Low Stock", value: "LOW_STOCK" },
    { label: "Out of Stock", value: "OUT_OF_STOCK" }
  ];

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-primary flex items-center justify-center shadow-xs shrink-0">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-navy text-sm sm:text-base leading-tight">Filters</h3>
            <span className="text-[10px] text-gray-400 font-medium">Refine catalogue</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-bold text-slate-500 hover:text-primary px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 transition-all flex items-center gap-1 border border-gray-200/80 hover:border-primary/30 cursor-pointer"
            title="Reset all filters"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1.5 text-gray-400 hover:text-navy rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Composite Category</h4>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {categoriesList.map((cat) => {
            const active = filters.category === cat || ((cat === "All Products" || cat === "All Motors") && !filters.category);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onFilterChange('category', (cat === "All Products" || cat === "All Motors") ? "" : cat)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  active
                    ? 'bg-blue-50 text-primary font-bold'
                    : 'text-slate-700 hover:bg-gray-100 hover:text-gray-900 font-semibold'
                }`}
              >
                <span>{cat}</span>
                {active && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Max Price</h4>
          <span className="text-xs font-bold text-primary">₹{filters.maxPrice ? filters.maxPrice.toLocaleString('en-IN') : '50,000'}</span>
        </div>
        <input
          type="range"
          min="0"
          max="50000"
          step="500"
          value={filters.maxPrice || 50000}
          onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono font-bold">
          <span>₹0</span>
          <span>₹50,000</span>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Availability</h4>
        <div className="space-y-2">
          {availabilityList.map((item) => (
            <label key={item.value} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availability ? filters.availability.includes(item.value) : false}
                onChange={(e) => {
                  const currentAvail = filters.availability || [];
                  const updated = e.target.checked
                    ? [...currentAvail, item.value]
                    : currentAvail.filter(v => v !== item.value);
                  onFilterChange('availability', updated);
                }}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-gray-300"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Brand</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {brandsList.map((brand) => (
            <label key={brand} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.brands ? filters.brands.includes(brand) : false}
                onChange={(e) => {
                  const currentBrands = filters.brands || [];
                  const updated = e.target.checked
                    ? [...currentBrands, brand]
                    : currentBrands.filter(b => b !== brand);
                  onFilterChange('brands', updated);
                }}
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-gray-300"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[5, 4, 3].map((stars) => (
            <label key={stars} className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="minRating"
                checked={filters.minRating === stars}
                onChange={() => onFilterChange('minRating', stars)}
                className="w-4 h-4 text-primary focus:ring-primary/20 border-gray-300"
              />
              <div className="flex items-center gap-1">
                <RatingStars rating={stars} showValue={false} size="xs" />
                <span className="text-gray-600">{stars === 5 ? '5 stars' : `${stars}+ stars`}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Action Mobile Apply */}
      {onClose && (
        <div className="pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-hover transition-colors shadow-md"
          >
            APPLY FILTERS
          </button>
        </div>
      )}
    </div>
  );

  // Mobile Drawer Overlay
  return (
    <>
      {/* Desktop Sidebar (Fixed within height on the right side) */}
      <div className="hidden lg:block w-64 shrink-0 bg-white p-5 rounded-2xl border border-gray-200 shadow-card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
        {content}
      </div>

      {/* Mobile Drawer (Mounted to document.body) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden flex">
            <div className="fixed inset-0 bg-navy-deep/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative ml-auto w-full max-w-xs bg-white h-full max-h-screen shadow-2xl p-6 overflow-y-auto z-10 flex flex-col justify-between animate-in slide-in-from-right duration-200">
              {content}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
