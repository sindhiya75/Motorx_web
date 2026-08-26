import React from 'react';
import ProductCard from './ProductCard';

export default function ProductGrid({ products = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse p-4 flex flex-col justify-between">
            <div className="w-full h-40 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-9 bg-gray-200 rounded-lg mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
          0
        </div>
        <h3 className="text-lg font-bold text-navy mb-1">No Motors Found</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          We couldn't find any products matching your selected filter parameters or search term. Try resetting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
