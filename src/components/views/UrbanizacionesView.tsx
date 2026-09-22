import React, { useState } from 'react';
import { Trees, MapPin, CheckCircle, Plus, Search, Layers, ArrowRight } from 'lucide-react';
import { Urbanization } from '../../types';

interface UrbanizacionesViewProps {
  urbanizations: Urbanization[];
  onSelectUrbanization: (urb: Urbanization) => void;
  onExploreLots: (urbId: string) => void;
}

export const UrbanizacionesView: React.FC<UrbanizacionesViewProps> = ({
  urbanizations,
  onSelectUrbanization,
  onExploreLots,
}) => {
  const [search, setSearch] = useState('');

  const filtered = urbanizations.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0d3f2b] text-white flex items-center justify-center shadow-xs">
            <Trees className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Urbanizaciones
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Administración integral de macroproyectos urbanos, terrenos y lotizaciones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
          <button className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Nuevo proyecto</span>
          </button>
        </div>
      </div>

      {/* Urbanization Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((urb) => {
          const percentSold = Math.round((urb.soldLots / urb.totalLots) * 100);
          return (
            <div
              key={urb.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={urb.image}
                    alt={urb.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="text-lg font-bold drop-shadow-sm">{urb.name}</h3>
                    <p className="text-xs text-emerald-100/90 flex items-center gap-1 drop-shadow-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      {urb.location}
                    </p>
                  </div>
                  <span className="absolute top-3 right-3 px-2.5 py-1 bg-emerald-900/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-lg border border-emerald-700/50">
                    Bs. {urb.pricePerM2} / m²
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {urb.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Lotes vendidos</span>
                      <span className="font-bold text-slate-900">{urb.soldLots} de {urb.totalLots} ({percentSold}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full"
                        style={{ width: `${percentSold}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                      <span>{urb.availableLots} disponibles</span>
                      <span>Total: {urb.totalLots}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Servicios y Beneficios
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {urb.amenities.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10.5px] rounded-md border border-emerald-100 font-medium flex items-center gap-1"
                        >
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-3">
                <button
                  onClick={() => onExploreLots(urb.id)}
                  className="flex-1 py-2 px-3 bg-[#0d3f2b] hover:bg-[#082a1d] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Ver Plano de Lotes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
