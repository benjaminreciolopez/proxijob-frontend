import React, { useState } from "react";

export interface SolicitudFilters {
  categoria?: string;
  distanciaMax?: number;
  requiereProfesional?: boolean;
  ordenar?: string;
}

interface Props {
  onFilterChange: (filters: SolicitudFilters) => void;
  categories: string[];
}

const FilterPanel: React.FC<Props> = ({ onFilterChange, categories }) => {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<SolicitudFilters>({
    distanciaMax: 25,
    ordenar: "fecha",
  });

  const emitChange = (updated: SolicitudFilters) => {
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value || undefined;
    emitChange({ ...filters, categoria: val });
  };

  const handleDistanciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    emitChange({ ...filters, distanciaMax: val });
  };

  const handleProfesionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked || undefined;
    emitChange({ ...filters, requiereProfesional: val });
  };

  const handleOrdenarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    emitChange({ ...filters, ordenar: e.target.value });
  };

  const handleReset = () => {
    const defaults: SolicitudFilters = { distanciaMax: 25, ordenar: "fecha" };
    setFilters(defaults);
    onFilterChange(defaults);
  };

  return (
    <div className="bg-white rounded-xl border border-grey-200 overflow-hidden">
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-dark hover:bg-grey-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-grey-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Filtros</span>
          {(filters.categoria || filters.requiereProfesional) && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-primary rounded-full">
              {(filters.categoria ? 1 : 0) +
                (filters.requiereProfesional ? 1 : 0)}
            </span>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-grey-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Collapsible content */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-grey-100 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-grey-600 mb-1">
              Categor&iacute;a
            </label>
            <select
              value={filters.categoria ?? ""}
              onChange={handleCategoriaChange}
              className="w-full rounded-lg border border-grey-300 px-3 py-2 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              <option value="">Todas las categor&iacute;as</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Distance slider */}
          <div>
            <label className="block text-xs font-medium text-grey-600 mb-1">
              Distancia m&aacute;xima:{" "}
              <span className="text-primary font-semibold">
                {filters.distanciaMax ?? 25} km
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={filters.distanciaMax ?? 25}
              onChange={handleDistanciaChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-grey-200 accent-primary"
            />
            <div className="flex justify-between text-[10px] text-grey-400 mt-0.5">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Professional required */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.requiereProfesional ?? false}
              onChange={handleProfesionalChange}
              className="h-4 w-4 rounded border-grey-300 text-primary focus:ring-primary/30"
            />
            <span className="text-sm text-dark">
              Solo profesionales requeridos
            </span>
          </label>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-grey-600 mb-1">
              Ordenar por
            </label>
            <select
              value={filters.ordenar ?? "fecha"}
              onChange={handleOrdenarChange}
              className="w-full rounded-lg border border-grey-300 px-3 py-2 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            >
              <option value="fecha">M&aacute;s recientes</option>
              <option value="distancia">M&aacute;s cercanos</option>
            </select>
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="w-full text-center text-xs text-grey-500 hover:text-error font-medium py-1 transition-colors"
          >
            Restablecer filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
