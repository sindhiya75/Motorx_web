import React from 'react';
import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ quantity = 1, onChange, max = 99, min = 1, size = "md" }) {
  const btnSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const inputSize = size === "sm" ? "w-10 h-7 text-xs" : "w-12 h-9 text-sm";

  const handleDecrease = () => {
    if (quantity > min) {
      onChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onChange(quantity + 1);
    }
  };

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val);
    }
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white p-0.5 shadow-sm">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={quantity <= min}
        className={`${btnSize} flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <input
        type="text"
        value={quantity}
        onChange={handleInputChange}
        className={`${inputSize} text-center font-semibold text-gray-800 focus:outline-none bg-transparent`}
        aria-label="Quantity"
      />

      <button
        type="button"
        onClick={handleIncrease}
        disabled={quantity >= max}
        className={`${btnSize} flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
