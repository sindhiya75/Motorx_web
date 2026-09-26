import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchCategories, fetchProducts, fetchBrands } from '../services/api';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import SortDropdown from '../components/SortDropdown';
import { SlidersHorizontal, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();

  const [categoryInfo, setCategoryInfo] = useState(null);
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsData, setBrandsData] = useState([]);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('featured');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const itemsPerPage = 8;

  const [filters, setFilters] = useState({
    category: slug || '',
    maxPrice: 50000,
    availability: [],
    motorTypes: [],
    kvRating: '',
    voltage: '',
    brands: [],
    minRating: 0,
    search: ''
  });

  useEffect(() => {
    let isMounted = true;
    async function loadMetadata() {
      const [cats, brs] = await Promise.all([fetchCategories(), fetchBrands()]);
      if (isMounted) {
        setCategoriesList(cats || []);
        setBrandsData(brs || []);

        if (slug) {
          const match = (cats || []).find(c => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());
          if (match) {
            setCategoryInfo(match);
          } else {
            setCategoryInfo({
              name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              slug: slug,
              description: `Explore high-performance composite products in ${slug}.`
            });
          }
        }
      }
    }
    loadMetadata();
    return () => { isMounted = false; };
  }, [slug]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, category: slug || '' }));
    setCurrentPage(1);
  }, [slug]);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sort: sortBy,
        category: filters.category || slug,
        maxPrice: filters.maxPrice < 50000 ? filters.maxPrice : undefined,
        search: filters.search,
        status: filters.availability.length > 0 ? filters.availability[0] : undefined,
        brand: filters.brands.length > 0 ? filters.brands[0] : undefined,
        rating: filters.minRating > 0 ? filters.minRating : undefined
      };

      try {
        const response = await fetchProducts(params);
        if (isMounted) {
          setProducts(response.data || []);
          setPagination(response.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to fetch category products');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();
    return () => { isMounted = false; };
  }, [filters, sortBy, currentPage, slug]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: slug || '',
      maxPrice: 50000,
      availability: [],
      motorTypes: [],
      kvRating: '',
      voltage: '',
      brands: [],
      minRating: 0,
      search: ''
    });
    setCurrentPage(1);
  };

  const breadcrumbItems = [
    { label: 'Products', url: '/products' },
    { label: categoryInfo?.name || 'Category', url: '' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Category Banner Header */}
      <div className="bg-navy text-white p-6 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Product Category</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            {categoryInfo?.name || 'Composite Category'}
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            {categoryInfo?.description || 'Explore high performance materials engineered for aerospace, marine, tooling, and industrial composites.'}
          </p>
        </div>
      </div>

      {/* Main Filter & Grid Layout (Product Grid on Left, Filters on Right) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        <div className="flex-1 w-full space-y-6">
          
          {/* Controls Bar */}
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
                Found <strong className="text-navy font-bold">{pagination.total || products.length}</strong> products
              </span>
            </div>

            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-semibold">
              Notice: {error}
            </div>
          )}

          <ProductGrid products={products} loading={loading} />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="text-xs font-semibold text-gray-600">
                Page <span className="px-2 py-0.5 bg-primary text-white font-bold rounded">{currentPage}</span> of {pagination.totalPages}
              </div>

              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Filter Sidebar (Right) */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          categories={categoriesList}
          brands={brandsData}
        />

      </div>
    </div>
  );
}
