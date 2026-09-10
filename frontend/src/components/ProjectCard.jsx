import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Wrench, Clock, ArrowRight, Layers } from 'lucide-react';

export default function ProjectCard({ project }) {
  if (!project) return null;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-primary/40 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden">
      {/* Image Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-navy-deep/90 backdrop-blur-md text-white text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-navy-light/40 shadow-sm">
          {project.difficulty}
        </div>
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 border border-gray-200">
          <Clock className="w-3.5 h-3.5 text-primary" /> {project.estimatedBuildTime}
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-navy group-hover:text-primary transition-colors mb-1.5">
          {project.name}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-normal">
          {project.shortDescription}
        </p>

        {/* Required Motors Section */}
        <div className="mb-3 p-2.5 bg-blue-50/70 rounded-xl border border-blue-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
            <Cpu className="w-3.5 h-3.5" /> Required Motors:
          </div>
          <ul className="text-xs font-medium text-slate-800 space-y-0.5 pl-5 list-disc">
            {project.requiredMotors.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </div>

        {/* Required Components Section */}
        <div className="mb-5 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
            <Wrench className="w-3.5 h-3.5 text-slate-500" /> Required Components:
          </div>
          <div className="flex flex-wrap gap-1">
            {project.requiredComponents.map((c, idx) => (
              <span key={idx} className="text-xs font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-gray-200">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Action button */}
        <Link
          to={`/motors`}
          className="mt-auto w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors text-center flex items-center justify-center gap-2 shadow-sm"
        >
          VIEW PROJECT MOTORS <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
