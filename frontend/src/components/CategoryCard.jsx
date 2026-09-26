import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Navigation,
  Plane,
  Camera,
  ShieldAlert,
  Flame,
  Layers,
  Package,
  ShieldCheck,
  Wind,
  Cpu,
  Wrench,
  Disc,
  Sparkles,
  Box
} from 'lucide-react';

const iconMap = {
  Layers,
  Package,
  Zap,
  ShieldCheck,
  Wind,
  Cpu,
  Wrench,
  Disc,
  Sparkles,
  Box,
  Navigation,
  Plane,
  Camera,
  ShieldAlert,
  Flame
};

export default function CategoryCard({ category }) {
  if (!category) return null;

  const IconComponent = iconMap[category.icon] || Layers;
  const categoryLink = category.slug
    ? `/category/${category.slug}`
    : `/category/${encodeURIComponent(category.name.toLowerCase().replace(/ /g, '-'))}`;

  return (
    <Link
      to={categoryLink}
      className="group relative flex flex-col justify-between p-6 bg-white rounded-2xl border border-gray-200 hover:border-primary/50 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            {category.count} Models
          </span>
        </div>

        <h3 className="text-lg font-bold text-navy group-hover:text-primary transition-colors mb-2">
          {category.name}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {category.description}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform duration-200">
        <span>EXPLORE CATEGORY</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
