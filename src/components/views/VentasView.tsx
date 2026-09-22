import React, { useState, useMemo } from 'react';
import { 
  CircleDollarSign, 
  ChevronDown, 
  ShoppingCart, 
  Banknote, 
  Handshake, 
  Coins, 
  Search, 
  Filter, 
  Eye, 
  FileText, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Sale } from '../../types';

interface VentasViewProps {
  sales: Sale[];
  onOpenContract: (sale: Sale) => void;
  onOpenClientProfile: (clientId: string) => void;
  onOpenNewSale: () => void;
}

export const VentasView: React.FC<VentasViewProps> = ({
  sales,
  onOpenContract,
  onOpenClientProfile,
  onOpenNewSale,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Mayo 2025');
  const [periodFilter, setPeriodFilter] = useState<'mes' | 'semana' | 'año'>('mes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrbanization, setSelectedUrbanization] = useState('Todas las urbanizaciones');
  const [selectedModality, setSelectedModality] = useState('Todas las modalidades');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Currently inspected sale for right drawer
  const [activeSaleId, setActiveSaleId] = useState<string>('V-001');

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch = 
        s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lot.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.urbanization.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUrb = 
        selectedUrbanization === 'Todas las urbanizaciones' || 
        s.urbanization === selectedUrbanization;

      const matchesMod = 
        selectedModality === 'Todas las modalidades' || 
        s.modality === selectedModality;

      return matchesSearch && matchesUrb && matchesMod;
    });
  }, [sales, searchQuery, selectedUrbanization, selectedModality]);

  // Paginated
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSales.slice(startIndex, startIndex + pageSize);
  }, [filteredSales, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize));

  // Active sale object
  const activeSale = sales.find(s => s.id === activeSaleId) || sales[0];

  // Totals for the cards
  const totalSalesCount = sales.length;
  const contadoCount = sales.filter(s => s.modality === 'Contado').length;
  const creditoCount = sales.filter(s => s.modality === 'Crédito').length;
  const totalSoldAmount = sales.reduce((acc, s) => acc + s.amount, 0);

  // Urbanization counts for bar chart
  const urbStats = useMemo(() => {
    const counts: Record<string, number> = {
      'Villa Bonita': 0,
      'Los Pinos': 0,
      'Valle Verde': 0,
      'El Mirador': 0,
      'Otra': 0
    };
    sales.forEach(s => {
      if (counts[s.urbanization] !== undefined) {
        counts[s.urbanization] += 1;
      } else {
        counts['Otra'] += 1;
      }
    });
    return counts;
  }, [sales]);

  const maxUrbCount = Math.max(...Object.values(urbStats), 1);

  // SVG calculations for the donut chart (58% Contado, 42% Crédito)
  const contadoPercent = Math.round((contadoCount / totalSalesCount) * 100) || 58;
  const creditoPercent = 100 - contadoPercent;
  const strokeDashoffsetCredito = 2 * Math.PI * 40 * (1 - contadoPercent / 100);

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <span className="text-2xl font-bold font-mono">$</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Ventas
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Control de ventas por mes, semana y año. Separado por modalidad de pago y urbanización.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector dropdown */}
          <div className="relative">
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <button
            onClick={onOpenNewSale}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>+ Nueva venta</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de ventas */}
        <div className="bg-[#ebf6f1] rounded-2xl p-5 border border-emerald-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total de ventas</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{totalSalesCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">ventas en el mes</p>
          </div>
        </div>

        {/* Contado */}
        <div className="bg-[#e9f2fb] rounded-2xl p-5 border border-sky-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Contado</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{contadoCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">ventas</p>
          </div>
        </div>

        {/* Crédito */}
        <div className="bg-[#fcf5e7] rounded-2xl p-5 border border-amber-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Handshake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Crédito</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{creditoCount}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">ventas</p>
          </div>
        </div>

        {/* Monto total vendido */}
        <div className="bg-[#eef8f2] rounded-2xl p-5 border border-emerald-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Monto total vendido</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
              Bs. {totalSoldAmount.toLocaleString('es-BO')}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">en el mes</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left side (Charts + Table) & Right side (Detail Drawer) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Period Filter Toggle Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-xs">
            <button
              onClick={() => setPeriodFilter('mes')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                periodFilter === 'mes'
                  ? 'bg-[#083021] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Por mes
            </button>
            <button
              onClick={() => setPeriodFilter('semana')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                periodFilter === 'semana'
                  ? 'bg-[#083021] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Por semana
            </button>
            <button
              onClick={() => setPeriodFilter('año')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                periodFilter === 'año'
                  ? 'bg-[#083021] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Por año
            </button>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chart 1: Ventas por modalidad */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                Ventas por modalidad
              </h3>

              <div className="flex items-center justify-center gap-6 py-2">
                {/* Donut Chart SVG */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="16"
                    />
                    {/* Contado segment (Emerald Green) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#15803d"
                      strokeWidth="16"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - contadoPercent / 100)}
                      strokeLinecap="round"
                    />
                    {/* Crédito segment (Warm Amber) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth="16"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={strokeDashoffsetCredito}
                      strokeLinecap="round"
                      style={{
                        transformOrigin: 'center',
                        transform: `rotate(${(contadoPercent / 100) * 360}deg)`
                      }}
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-800 leading-none">
                      {totalSalesCount}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">total</span>
                  </div>
                </div>

                {/* Legends */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-700" />
                    <span className="text-xs text-slate-600">Contado</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">
                      {contadoCount} ({contadoPercent}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs text-slate-600">Crédito</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">
                      {creditoCount} ({creditoPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Ventas por urbanización */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 mb-2">
                Ventas por urbanización
              </h3>

              {/* Bar Chart Container */}
              <div className="flex items-end justify-between gap-3 h-40 pt-4 px-2">
                {Object.entries(urbStats).map(([name, count]) => {
                  const heightPercent = Math.max(15, (count / maxUrbCount) * 100);
                  const isHighest = count === maxUrbCount;
                  return (
                    <div key={name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      {/* Count number label on top */}
                      <span className="text-xs font-bold text-slate-700">
                        {count}
                      </span>
                      {/* Bar */}
                      <div 
                        className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                          isHighest 
                            ? 'bg-[#0f4e34]' 
                            : 'bg-emerald-600/80 hover:bg-emerald-700'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      {/* X label */}
                      <span className="text-[10px] text-slate-500 text-center font-medium truncate w-full" title={name}>
                        {name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, lote o código de venta..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            {/* Urbanization Filter */}
            <div className="relative w-full sm:w-52">
              <select
                value={selectedUrbanization}
                onChange={(e) => {
                  setSelectedUrbanization(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer"
              >
                <option value="Todas las urbanizaciones">Todas las urbanizaciones</option>
                <option value="Villa Bonita">Villa Bonita</option>
                <option value="Los Pinos">Los Pinos</option>
                <option value="Valle Verde">Valle Verde</option>
                <option value="El Mirador">El Mirador</option>
                <option value="Otra">Otra</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Modality Filter */}
            <div className="relative w-full sm:w-48">
              <select
                value={selectedModality}
                onChange={(e) => {
                  setSelectedModality(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer"
              >
                <option value="Todas las modalidades">Todas las modalidades</option>
                <option value="Contado">Contado</option>
                <option value="Crédito">Crédito</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setCurrentPage(1)}
              className="w-full sm:w-auto px-4 py-2 bg-[#0d3f2b] hover:bg-[#072a1c] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10.5px]">
                    <th className="py-3 px-4">Nº Venta</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Urbanización / Lote</th>
                    <th className="py-3 px-4">Modalidad</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedSales.length > 0 ? (
                    paginatedSales.map((sale) => {
                      const isSelected = sale.id === activeSaleId;
                      return (
                        <tr
                          key={sale.id}
                          onClick={() => setActiveSaleId(sale.id)}
                          className={`hover:bg-emerald-50/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-emerald-50/60 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {sale.id}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {sale.date}
                          </td>
                          <td className="py-3.5 px-4 text-slate-900">
                            {sale.clientName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {sale.urbanization} - {sale.lot}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                sale.modality === 'Contado'
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {sale.modality}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            Bs. {sale.amount.toLocaleString('es-BO')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                sale.status === 'Concretada'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-orange-50 text-orange-700 border border-orange-200'
                              }`}
                            >
                              {sale.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveSaleId(sale.id);
                              }}
                              className="w-7 h-7 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No se encontraron ventas con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination */}
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <p>
                Mostrando {paginatedSales.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
                {Math.min(currentPage * pageSize, filteredSales.length)} de {filteredSales.length} registros
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      currentPage === page
                        ? 'bg-[#093021] text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Detalle de venta (V-001) Drawer */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-800">
                  Detalle de venta
                </h2>
              </div>
              <span className="px-2.5 py-1 bg-emerald-800 text-white font-mono text-xs font-bold rounded-lg shadow-xs">
                {activeSale.id}
              </span>
            </div>

            {/* Información del cliente */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                Información del cliente
              </h3>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-base">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {activeSale.clientName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    CI: {activeSale.clientCI}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenClientProfile(activeSale.clientId)}
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-200/60"
              >
                <span>Ver cliente completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Información del inmueble */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Información del inmueble
              </h3>

              <div className="flex items-center gap-3.5">
                <img
                  src={activeSale.image}
                  alt={activeSale.urbanization}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeSale.urbanization}
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {activeSale.lot} - {activeSale.block}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Superficie: {activeSale.surface}
                  </p>
                </div>
              </div>
            </div>

            {/* Datos de la venta */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Datos de la venta
              </h3>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Precio:</span>
                <span className="font-bold text-slate-900">
                  Bs. {activeSale.amount.toLocaleString('es-BO')}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Modalidad:</span>
                <span className="font-semibold text-slate-800">
                  {activeSale.modality}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Fecha:</span>
                <span className="text-slate-800">{activeSale.date}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Estado:</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200 text-[11px]">
                  {activeSale.status}
                </span>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                Observaciones
              </h3>
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {activeSale.observations || 'Sin observaciones registradas.'}
              </p>
            </div>

            {/* Action Button: Ver contrato / documentos */}
            <button
              onClick={() => onOpenContract(activeSale)}
              className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Ver contrato / documentos</span>
              <ChevronRight className="w-4 h-4 ml-auto text-emerald-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
