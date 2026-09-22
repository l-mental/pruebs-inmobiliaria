import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  MapPin, 
  Maximize2, 
  BedDouble, 
  Bath, 
  Car, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { Property, PropertyType, PropertyOperation } from '../../types';

interface PropiedadesViewProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onOpenNewProperty?: () => void;
}

export const PropiedadesView: React.FC<PropiedadesViewProps> = ({
  properties,
  onSelectProperty,
  onOpenNewProperty,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedOperation, setSelectedOperation] = useState<string>('Todas');

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch = 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      const matchType = selectedType === 'Todos' || p.type === selectedType;
      const matchOp = selectedOperation === 'Todas' || p.operation === selectedOperation;
      return matchSearch && matchType && matchOp;
    });
  }, [properties, search, selectedType, selectedOperation]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0d3f2b] text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Cartera de Propiedades
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Casas residenciales, departamentos, terrenos urbanos y locales comerciales.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewProperty}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar inmueble</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por título, zona o ciudad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Tipo:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Casa">Casas</option>
              <option value="Departamento">Departamentos</option>
              <option value="Terreno">Terrenos</option>
              <option value="Local Comercial">Locales Comerciales</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Modalidad:</span>
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer"
            >
              <option value="Todas">Todas</option>
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Anticrético">Anticrético</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Properties */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prop) => {
          const operationBg = 
            prop.operation === 'Venta' ? 'bg-emerald-700' :
            prop.operation === 'Alquiler' ? 'bg-blue-600' : 'bg-amber-600';

          return (
            <div
              key={prop.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={prop.image}
                  alt={prop.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm ${operationBg}`}>
                  {prop.operation}
                </span>
                <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-bold rounded-lg border border-slate-200/80">
                  {prop.type}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {prop.location}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {prop.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 py-2.5 border-y border-slate-100">
                  <span className="flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                    {prop.area} m²
                  </span>
                  {prop.rooms && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                      {prop.rooms} hab.
                    </span>
                  )}
                  {prop.bathrooms && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-slate-400" />
                      {prop.bathrooms} baños
                    </span>
                  )}
                  {prop.garage && (
                    <span className="flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      Garaje
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Precio</span>
                    <p className="text-lg font-extrabold text-slate-900">
                      {prop.currency} {prop.price.toLocaleString('es-BO')}
                      {prop.period && <span className="text-xs font-normal text-slate-500">{prop.period}</span>}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                    {prop.status}
                  </span>
                </div>

                <button
                  onClick={() => onSelectProperty(prop)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Ver Ficha Técnica</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
