import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export default function SortDropdown({ sortBy, onSortChange }) {
  const options = [
    { value: 'featured', label: 'Featured' },
    { value: 'popularity', label: 'Popularity' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'discount', label: 'Discount %' }
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-gray-500 hidden sm:inline flex items-center gap-1">
        <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
        Sort By:
      </span>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-white border border-gray-300 hover:border-primary text-gray-800 text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
