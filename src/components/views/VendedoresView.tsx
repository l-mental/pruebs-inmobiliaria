import React from 'react';
import { UserCheck, Award, Phone, Mail, TrendingUp, Plus } from 'lucide-react';
import { Seller } from '../../types';

interface VendedoresViewProps {
  sellers: Seller[];
  onOpenNewSeller?: () => void;
}

export const VendedoresView: React.FC<VendedoresViewProps> = ({
  sellers,
  onOpenNewSeller,
}) => {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0d3f2b] text-white flex items-center justify-center shadow-xs">
            <UserCheck className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Equipo de Ventas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Rendimiento individual, urbanizaciones asignadas y comisiones generadas.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewSeller}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Asesor</span>
        </button>
      </div>

      {/* Sellers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller, index) => {
          const isTop = index === 0;
          return (
            <div
              key={seller.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs relative flex flex-col justify-between ${
                isTop ? 'border-amber-300 ring-2 ring-amber-300/30' : 'border-slate-200'
              }`}
            >
              {isTop && (
                <div className="absolute -top-3 right-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Award className="w-3.5 h-3.5" />
                  Top Vendedor del Mes
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-100 shadow-xs"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{seller.name}</h3>
                    <p className="text-xs text-emerald-700 font-semibold">{seller.role}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {seller.phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[11px] text-slate-500 font-medium">Ventas Cerradas</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">{seller.salesCount}</p>
                  </div>
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[11px] text-emerald-700 font-medium">Volumen Total</span>
                    <p className="text-base font-black text-emerald-900 mt-0.5">
                      Bs. {seller.totalVolumeBs.toLocaleString('es-BO')}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Urbanizaciones Asignadas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {seller.assignedUrbanizations.map((u, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium"
                      >
                        {u}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Comisión pactada:</span>
                <span className="font-bold text-slate-900">{seller.commissionRate}% por venta</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
