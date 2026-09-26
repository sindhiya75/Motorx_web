import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Zap } from 'lucide-react';
import { fetchProducts } from '../services/api';
import { formatINR } from '../utils/formatINR';
import { normalizeProductImageUrl, handleImageError } from '../utils/imageHelper';

export default function SearchBar({ placeholder = "Search 2306, 4500KV, brushless, FPV, SKU...", onClose }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetchProducts({ search: query.trim(), limit: 5 });
        if (isMounted) {
          setSuggestions(response.data || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.warn('Search suggestion fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      navigate(`/motors?search=${encodeURIComponent(query.trim())}`);
      if (onClose) onClose();
    }
  };

  const handleSelectSuggestion = (slug) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/products/${slug}`);
    if (onClose) onClose();
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-gray-100/90 focus:bg-white text-gray-900 placeholder:text-gray-500 text-sm font-medium pl-10 pr-10 py-2.5 rounded-xl border border-gray-200/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
        />
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 p-1 text-slate-500 hover:text-gray-700 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Auto-complete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
          <div className="px-3 py-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between border-b border-gray-100">
            <span>Matching Products</span>
            <span>{loading ? 'Searching...' : `${suggestions.length} results`}</span>
          </div>

          {suggestions.length > 0 ? (
            <div>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item.slug)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50/60 text-left transition-colors border-b border-gray-50 last:border-none"
                >
                  <img
                    src={normalizeProductImageUrl(item.image)}
                    onError={handleImageError}
                    alt={item.name}
                    className="w-10 h-10 object-contain bg-gray-50 rounded p-1 border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-primary font-bold">{item.sku}</div>
                    <div className="text-xs font-bold text-gray-900 truncate">{item.name}</div>
                    <div className="text-xs text-slate-600 font-medium">{item.category} • {item.brand}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-navy">
                      {item.salePrice ? formatINR(item.salePrice) : item.price ? formatINR(item.price) : 'Quote'}
                    </div>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={handleSearchSubmit}
                className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-primary text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors"
              >
                <span>View all results for "{query}"</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 text-center">
              <Zap className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-800">No matching motors found</p>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Try searching for "2306", "4500KV", "brushless", "FPV", or "AeroDrive"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
