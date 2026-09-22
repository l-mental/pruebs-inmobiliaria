import React, { useState } from 'react';
import { BarChart2, Download, TrendingUp, Calendar, ArrowUpRight, DollarSign, Building } from 'lucide-react';
import { Sale, Payment } from '../../types';

interface ReportesViewProps {
  sales: Sale[];
  payments: Payment[];
}

export const ReportesView: React.FC<ReportesViewProps> = ({ sales, payments }) => {
  const [selectedRange, setSelectedRange] = useState<'mes' | 'trimestre' | 'año'>('mes');

  const totalVendido = sales.reduce((acc, s) => acc + s.amount, 0);
  const totalCobrado = payments.filter(p => p.status === 'Pagado').reduce((acc, p) => acc + p.amount, 0);
  const totalPendiente = totalVendido - totalCobrado;

  const monthlyHistory = [
    { month: 'Ene', amount: 320000 },
    { month: 'Feb', amount: 380000 },
    { month: 'Mar', amount: 410000 },
    { month: 'Abr', amount: 450000 },
    { month: 'May', amount: 482750 },
  ];

  const maxHistory = Math.max(...monthlyHistory.map(m => m.amount));

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0d3f2b] text-white flex items-center justify-center shadow-xs">
            <BarChart2 className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Reportes y Estadísticas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidado de ingresos, recaudación de cuotas y proyección de ventas.
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Generando reporte PDF consolidado...')}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Informe PDF</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Contratado</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            Bs. {totalVendido.toLocaleString('es-BO')}
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14% vs mes anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recaudación Efectiva</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            Bs. {totalCobrado.toLocaleString('es-BO')}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Cobrado en caja y bancos
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cartera por Cobrar</p>
          <p className="text-2xl font-black text-amber-700 mt-1">
            Bs. {totalPendiente.toLocaleString('es-BO')}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Cuotas programadas en curso
          </p>
        </div>
      </div>

      {/* Monthly Sales Evolution Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Evolución de Ventas 2025</h2>
            <p className="text-xs text-slate-500">Crecimiento mensual acumulado en Bolivianos.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              Mayo 2025: Bs. 482.750
            </span>
          </div>
        </div>

        <div className="h-56 flex items-end justify-between gap-6 pt-6 px-4">
          {monthlyHistory.map((item) => {
            const heightPercent = Math.round((item.amount / maxHistory) * 100);
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-xs font-bold text-slate-800">
                  Bs. {(item.amount / 1000).toFixed(0)}k
                </span>
                <div
                  className="w-full max-w-[50px] bg-gradient-to-t from-[#093322] to-emerald-600 rounded-t-lg transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-xs font-bold text-slate-600">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
