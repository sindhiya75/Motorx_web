import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center text-xs font-medium text-gray-500 py-3 overflow-x-auto whitespace-nowrap">
      <Link
        to="/"
        className="inline-flex items-center gap-1 hover:text-primary transition-colors text-gray-600"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gray-400 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-navy truncate max-w-xs sm:max-w-md">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.url}
                className="hover:text-primary transition-colors text-gray-600 truncate max-w-xs"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
