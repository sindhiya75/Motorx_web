import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts, fetchCategories, fetchBrands } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import SortDropdown from '../components/SortDropdown';

export default function Motors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchCategory = searchParams.get('category') || '';
  const searchKeyword = searchParams.get('search') || '';

  // Filter States
  const [filters, setFilters] = useState({
    category: searchCategory,
    maxPrice: 50000,
    availability: [],
    motorTypes: [],
    kvRating: '',
    voltage: '',
    brands: [],
    minRating: 0,
    search: searchKeyword
  });

  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // API State
  const [productsList, setProductsList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categoriesData, setCategoriesData] = useState([]);
  const [brandsData, setBrandsData] = useState([]);

  const itemsPerPage = 8;

  // Sync filter state when URL query params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || ''
    }));
    setCurrentPage(1);
  }, [searchParams]);

  // Load Categories and Brands for Sidebar
  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      const [cats, brs] = await Promise.all([fetchCategories(), fetchBrands()]);
      if (isMounted) {
        setCategoriesData(cats);
        setBrandsData(brs);
      }
    }
    loadMetadata();
    return () => { isMounted = false; };
  }, []);

  // Fetch Products from REST API on filter, sort, or pagination change
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        category: filters.category,
        maxPrice: filters.maxPrice < 50000 ? filters.maxPrice : undefined,
        search: filters.search,
        status: filters.availability.length > 0 ? filters.availability[0] : undefined,
        motorType: filters.motorTypes.length > 0 ? filters.motorTypes[0] : undefined,
        kvRating: filters.kvRating || undefined,
        voltage: filters.voltage || undefined,
        brand: filters.brands.length > 0 ? filters.brands[0] : undefined,
        rating: filters.minRating > 0 ? filters.minRating : undefined
      };

      try {
        const response = await fetchProducts(params);
        if (isMounted) {
          setProductsList(response.data || []);
          setPagination(response.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load products');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();
    return () => { isMounted = false; };
  }, [filters, sortBy, currentPage]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      maxPrice: 50000,
      availability: [],
      motorTypes: [],
      kvRating: '',
      voltage: '',
      brands: [],
      minRating: 0,
      search: ''
    });
    setSearchParams({});
    setCurrentPage(1);
  };

  const breadcrumbItems = [
    { label: 'Motors', url: '/motors' },
    ...(filters.category ? [{ label: filters.category, url: '' }] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header Banner */}
      <div className="bg-surface-hero p-6 sm:p-8 rounded-2xl border border-blue-100 space-y-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-navy tracking-tight">
          {filters.category ? filters.category : 'All Motors & DIY Components'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-3xl leading-relaxed">
          High-performance motors for drones, FPV, robotics and DIY projects. Engineered with Japanese NMB bearings, temperature-resistant copper windings, and curved N52 magnets.
        </p>
      </div>

      {/* Main Grid & Filters Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Desktop & Mobile Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          categories={categoriesData}
          brands={brandsData}
        />

        {/* Product Listing Main Area */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Top Bar (Mobile filter toggle, results count, sorting) */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden px-3 py-2 bg-gray-100 hover:bg-gray-200 text-navy text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span>FILTERS</span>
              </button>

              <span className="text-xs font-semibold text-gray-600">
                Showing <strong className="text-navy font-bold">{pagination.total || productsList.length}</strong> Products
              </span>
            </div>

            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          {/* Active Filter Chips */}
          {(filters.category || filters.kvRating || filters.voltage || filters.brands.length > 0 || filters.motorTypes.length > 0 || filters.search) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-600">Active Filters:</span>

              {filters.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-primary border border-blue-300 shadow-sm">
                  Category: {filters.category}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('category', '')} />
                </span>
              )}

              {filters.kvRating && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-200">
                  KV: {filters.kvRating}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('kvRating', '')} />
                </span>
              )}

              {filters.voltage && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-200">
                  Voltage: {filters.voltage}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('voltage', '')} />
                </span>
              )}

              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-primary border border-blue-200">
                  Query: "{filters.search}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange('search', '')} />
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:underline ml-2"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-semibold">
              Error fetching products: {error}
            </div>
          )}

          {/* Product Grid */}
          <ProductGrid products={productsList} loading={loading} />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                <span>Page</span>
                <span className="px-2.5 py-1 bg-primary text-white font-bold rounded-md">
                  {currentPage}
                </span>
                <span>of {pagination.totalPages}</span>
              </div>

              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
