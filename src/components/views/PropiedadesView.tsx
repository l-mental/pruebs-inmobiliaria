import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  MapPin, 
  Maximize2, 
  BedDouble, 
  Bath, 
  Car, 
  ArrowRight,
  Plus,
  Users,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Property } from '../../types';

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
      const q = search.toLowerCase();
      const matchSearch = 
        p.title.toLowerCase().includes(q) ||
        (p.propertyName && p.propertyName.toLowerCase().includes(q)) ||
        (p.urbanizationName && p.urbanizationName.toLowerCase().includes(q)) ||
        (p.ownerNames && p.ownerNames.some(o => o.toLowerCase().includes(q))) ||
        p.location.toLowerCase().includes(q);
      const matchType = selectedType === 'Todos' || p.type === selectedType;
      const matchOp = selectedOperation === 'Todas' || p.operation === selectedOperation;
      return matchSearch && matchType && matchOp;
    });
  }, [properties, search, selectedType, selectedOperation]);

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#072a1b] via-[#0d3f2b] to-[#155e40] text-white rounded-3xl p-6 shadow-lg border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center shadow-md flex-shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Cartera de Propiedades e Inmuebles
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase">
                {properties.length} Registradas
              </span>
            </div>
            <p className="text-sm text-emerald-100/90 mt-1 font-medium">
              Casas residenciales, departamentos, terrenos en urbanización y locales comerciales con registro de propietarios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewProperty}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-black rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>+ Nueva Propiedad</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre de propiedad, nombre de propietario, urbanización o dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-extrabold text-slate-600">Tipo:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Casa">Casas</option>
              <option value="Departamento">Departamentos</option>
              <option value="Terreno">Terrenos</option>
              <option value="Local Comercial">Locales Comerciales</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-extrabold text-slate-600">Modalidad:</span>
            <select
              value={selectedOperation}
              onChange={(e) => setSelectedOperation(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 cursor-pointer"
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
              className="bg-white rounded-3xl border-2 border-slate-200 hover:border-emerald-400 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={prop.image}
                  alt={prop.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <span className={`absolute top-3.5 left-3.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md ${operationBg}`}>
                  {prop.operation}
                </span>
                <span className="absolute top-3.5 right-3.5 px-3 py-1 bg-white/95 backdrop-blur-xs text-slate-900 text-xs font-black rounded-xl border border-slate-200 shadow-xs">
                  {prop.type}
                </span>

                {prop.urbanizationName && (
                  <span className="absolute bottom-3 left-3.5 px-3 py-1 bg-[#072a1b]/90 text-amber-300 text-xs font-black rounded-xl border border-amber-400/40 shadow-sm">
                    Urbanización: {prop.urbanizationName}
                  </span>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  {prop.propertyName && prop.propertyName !== prop.title && (
                    <span className="inline-block text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {prop.propertyName}
                    </span>
                  )}
                  <h3 className="font-black text-slate-900 text-lg leading-snug">
                    {prop.title}
                  </h3>
                  <p className="text-sm text-slate-600 font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span>{prop.location}</span>
                  </p>

                  {/* NOMBRES DE PROPIETARIOS / TITULARES */}
                  {prop.ownerNames && prop.ownerNames.length > 0 && (
                    <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5 mt-2">
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <span>Propietario(s) / Titular(es):</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {prop.ownerNames.map((owner, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white text-slate-900 border border-emerald-300 rounded-lg text-xs font-extrabold shadow-2xs"
                          >
                            {owner}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-600 pt-1 line-clamp-2">
                    {prop.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700 py-3 border-y border-slate-100">
                  <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <Maximize2 className="w-4 h-4 text-emerald-700" />
                    {prop.area} m²
                  </span>
                  {prop.rooms && (
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <BedDouble className="w-4 h-4 text-emerald-700" />
                      {prop.rooms} hab.
                    </span>
                  )}
                  {prop.bathrooms && (
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Bath className="w-4 h-4 text-emerald-700" />
                      {prop.bathrooms} baños
                    </span>
                  )}
                  {prop.garage && (
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      <Car className="w-4 h-4 text-emerald-700" />
                      Garaje
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-slate-500 block font-bold uppercase">Precio Total</span>
                    <p className="text-2xl font-black text-emerald-950">
                      {prop.currency} {prop.price.toLocaleString('es-BO')}
                      {prop.period && <span className="text-sm font-bold text-slate-500">{prop.period}</span>}
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-900 text-xs font-black rounded-full border border-emerald-300">
                    {prop.status}
                  </span>
                </div>

                <button
                  onClick={() => onSelectProperty(prop)}
                  className="w-full py-3 px-4 rounded-xl bg-[#0d3f2b] hover:bg-[#072a1c] text-sm font-black text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Ver Ficha Técnica Completa</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
