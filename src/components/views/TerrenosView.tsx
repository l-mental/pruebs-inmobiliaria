import React, { useState, useMemo } from 'react';
import { MapPin, Filter, Search, Check, AlertCircle, ShoppingBag, Eye } from 'lucide-react';
import { Lot, Urbanization } from '../../types';

interface TerrenosViewProps {
  lots: Lot[];
  urbanizations: Urbanization[];
  onSelectLotForSale: (lot: Lot, urb: Urbanization) => void;
}

export const TerrenosView: React.FC<TerrenosViewProps> = ({
  lots,
  urbanizations,
  onSelectLotForSale,
}) => {
  const [selectedUrbId, setSelectedUrbId] = useState<string>(urbanizations[0]?.id || 'URB-01');
  const [selectedBlock, setSelectedBlock] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [selectedLot, setSelectedLot] = useState<Lot | null>(lots[0] || null);

  const currentUrb = urbanizations.find(u => u.id === selectedUrbId) || urbanizations[0];

  const urbLots = useMemo(() => {
    return lots.filter(l => l.urbanizationId === selectedUrbId);
  }, [lots, selectedUrbId]);

  const blocks = useMemo(() => {
    const list = Array.from(new Set(urbLots.map(l => l.block)));
    return ['Todos', ...list];
  }, [urbLots]);

  const filteredLots = useMemo(() => {
    return urbLots.filter(l => {
      const matchBlock = selectedBlock === 'Todos' || l.block === selectedBlock;
      const matchStatus = statusFilter === 'Todos' || l.status === statusFilter;
      return matchBlock && matchStatus;
    });
  }, [urbLots, selectedBlock, statusFilter]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0d3f2b] text-white flex items-center justify-center shadow-xs">
            <MapPin className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Terrenos y Lotes
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Plano interactivo de manzanos y lotes por urbanización.
            </p>
          </div>
        </div>

        {/* Urbanization selector tab pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {urbanizations.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setSelectedUrbId(u.id);
                setSelectedBlock('Todos');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedUrbId === u.id
                  ? 'bg-[#0d3f2b] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {u.name}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Block Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Manzano:</span>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              {blocks.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="Todos">Todos</option>
              <option value="Disponible">Disponibles</option>
              <option value="Reservado">Reservados</option>
              <option value="Vendido">Vendidos</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-emerald-500" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-amber-400" />
            <span>Reservado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md bg-slate-400" />
            <span>Vendido</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Lots Grid + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Lots Map / Grid View */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Plano de Distribución: {currentUrb.name}
              </h2>
              <p className="text-xs text-slate-500">
                Haz clic sobre cualquier lote para ver especificaciones y registrar venta.
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {filteredLots.length} lotes encontrados
            </span>
          </div>

          {/* Graphical Lot Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 min-h-[360px]">
            {filteredLots.map((lot) => {
              const isSelected = selectedLot?.id === lot.id;
              const statusBg = 
                lot.status === 'Disponible' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100' :
                lot.status === 'Reservado' ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100' :
                'bg-slate-100 border-slate-300 text-slate-600 opacity-80';

              const indicator =
                lot.status === 'Disponible' ? 'bg-emerald-500' :
                lot.status === 'Reservado' ? 'bg-amber-400' : 'bg-slate-400';

              return (
                <button
                  key={lot.id}
                  onClick={() => setSelectedLot(lot)}
                  className={`p-3 rounded-xl border-2 text-left transition-all relative flex flex-col justify-between h-28 cursor-pointer ${statusBg} ${
                    isSelected ? 'ring-2 ring-emerald-700 ring-offset-2 scale-102 shadow-sm' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-xs">{lot.lotNumber}</span>
                    <span className={`w-2 h-2 rounded-full ${indicator}`} />
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-500 font-medium">{lot.block}</p>
                    <p className="text-[11px] font-bold mt-0.5">{lot.surface} m²</p>
                  </div>

                  <div className="text-[11px] font-extrabold text-slate-900">
                    Bs. {lot.priceBs.toLocaleString('es-BO')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Selected Lot Card */}
        <div className="space-y-4">
          {selectedLot ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedLot.lotNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentUrb.name} - {selectedLot.block}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                    selectedLot.status === 'Disponible'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : selectedLot.status === 'Reservado'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {selectedLot.status}
                </span>
              </div>

              {/* Specs */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Superficie:</span>
                  <span className="font-bold text-slate-900">{selectedLot.surface} m²</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Frente:</span>
                  <span className="font-semibold text-slate-800">{selectedLot.front} metros</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Fondo:</span>
                  <span className="font-semibold text-slate-800">{selectedLot.depth} metros</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Precio en Bolivianos:</span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    Bs. {selectedLot.priceBs.toLocaleString('es-BO')}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Precio en Dólares:</span>
                  <span className="font-bold text-slate-900">
                    $us. {selectedLot.priceUsd.toLocaleString('es-BO')}
                  </span>
                </div>
                {selectedLot.buyerName && (
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Titular / Comprador:</span>
                    <span className="font-bold text-slate-900">{selectedLot.buyerName}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {selectedLot.status === 'Disponible' ? (
                <button
                  onClick={() => onSelectLotForSale(selectedLot, currentUrb)}
                  className="w-full py-2.5 px-4 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                  <span>Registrar Venta de este Lote</span>
                </button>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-200">
                  Este lote se encuentra {selectedLot.status.toLowerCase()}. Consulta con el asesor para ver reservas.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Selecciona un lote del plano para ver sus detalles.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
