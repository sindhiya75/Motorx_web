import React, { useState } from 'react';

export default function ProductGallery({ images = [], name = "Product" }) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
        No image available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image Container */}
      <div className="relative w-full aspect-square bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center p-6 group">
        <img
          src={images[selectedImage] || images[0]}
          alt={`${name} preview ${selectedImage + 1}`}
          className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
        />
      </div>

      {/* Thumbnails list */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(idx)}
              className={`relative w-20 h-20 rounded-xl border-2 bg-gray-50 p-1.5 shrink-0 overflow-hidden transition-all duration-200 ${
                selectedImage === idx
                  ? 'border-primary shadow-md scale-105'
                  : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${name} thumb ${idx}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
