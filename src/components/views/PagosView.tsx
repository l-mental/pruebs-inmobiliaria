import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  ChevronDown, 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Coins, 
  Truck, 
  User, 
  X, 
  Plus, 
  ChevronRight, 
  Info,
  ChevronLeft,
  ArrowUpRight,
  Landmark,
  Layers,
  Building2,
  AlertTriangle,
  TrendingUp,
  Percent,
  Check,
  RefreshCw,
  Sparkles,
  DollarSign,
  Printer
} from 'lucide-react';
import { Payment, Sale, PaymentMethod, Lot, Urbanization } from '../../types';

interface PagosViewProps {
  payments: Payment[];
  sales: Sale[];
  lots?: Lot[];
  urbanizations?: Urbanization[];
  onOpenNewPayment: () => void;
  onOpenContract: (sale: Sale) => void;
  onOpenPaymentPlan?: (sale: Sale) => void;
}

export const PagosView: React.FC<PagosViewProps> = ({
  payments,
  sales,
  lots = [],
  urbanizations = [],
  onOpenNewPayment,
  onOpenContract,
  onOpenPaymentPlan,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Mayo 2025');
  const [paymentType, setPaymentType] = useState<'cliente' | 'proveedor'>('cliente');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrbanization, setSelectedUrbanization] = useState('Todas las urbanizaciones');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Todas las formas de pago');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCondoBreakdown, setShowCondoBreakdown] = useState(true);
  const pageSize = 8;

  // Selected client sale detail panel
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  // 1. CARTERA DE LOTES: Cálculos de Valor Total y Recaudación
  const relevantLots = useMemo(() => {
    if (selectedUrbanization === 'Todas las urbanizaciones') {
      return lots;
    }
    return lots.filter(
      l => l.urbanizationName === selectedUrbanization || 
           urbanizations.find(u => u.name === selectedUrbanization)?.id === l.urbanizationId
    );
  }, [lots, selectedUrbanization, urbanizations]);

  // Valor Total de Todos los Lotes / Terrenos
  const totalLotsValueBs = useMemo(() => {
    return relevantLots.reduce((acc, l) => acc + (l.priceBs || 0), 0);
  }, [relevantLots]);

  const totalLotsValueUsd = useMemo(() => {
    return relevantLots.reduce((acc, l) => acc + (l.priceUsd || 0), 0);
  }, [relevantLots]);

  const totalLotsCount = relevantLots.length;

  const totalSurfaceM2 = useMemo(() => {
    return relevantLots.reduce((acc, l) => acc + (l.surface || 0), 0);
  }, [relevantLots]);

  // Recaudación efectiva
  const relevantSales = useMemo(() => {
    if (selectedUrbanization === 'Todas las urbanizaciones') {
      return sales;
    }
    return sales.filter(s => s.urbanization.toLowerCase().includes(selectedUrbanization.toLowerCase()));
  }, [sales, selectedUrbanization]);

  const relevantPayments = useMemo(() => {
    if (selectedUrbanization === 'Todas las urbanizaciones') {
      return payments;
    }
    return payments.filter(p => p.urbanization.toLowerCase().includes(selectedUrbanization.toLowerCase()));
  }, [payments, selectedUrbanization]);

  // Total efectivamente recaudado
  const totalRecaudadoGeneralBs = useMemo(() => {
    const fromPayments = relevantPayments
      .filter(p => p.type === 'cliente' && p.status === 'Pagado')
      .reduce((sum, p) => sum + (p.currency === 'Bs.' ? p.amount : p.amount * 6.96), 0);
    const fromSales = relevantSales.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
    return Math.max(fromPayments, fromSales);
  }, [relevantPayments, relevantSales]);

  const totalRecaudadoUsd = Math.round(totalRecaudadoGeneralBs / 6.96);

  // Porcentaje recaudado sobre el valor total de los terrenos
  const porcentajeRecaudado = useMemo(() => {
    if (totalLotsValueBs === 0) return 0;
    return (totalRecaudadoGeneralBs / totalLotsValueBs) * 100;
  }, [totalRecaudadoGeneralBs, totalLotsValueBs]);

  // Saldo por cobrar
  const saldoPendientePorCobrarBs = useMemo(() => {
    return Math.max(0, relevantSales.reduce((acc, s) => acc + (s.pendingBalance || 0), 0));
  }, [relevantSales]);

  // Lotes en Moratoria (Falta de pago)
  const lotsInMoratoria = useMemo(() => {
    return relevantLots.filter(l => l.status === 'En Moratoria');
  }, [relevantLots]);

  const moratoriaLotsCount = lotsInMoratoria.length;
  const moratoriaValueBs = useMemo(() => {
    return lotsInMoratoria.reduce((acc, l) => acc + (l.priceBs || 0), 0);
  }, [lotsInMoratoria]);

  // Desglose por cada condominio / urbanización
  const condoBreakdown = useMemo(() => {
    return urbanizations.map(u => {
      const uLots = lots.filter(l => l.urbanizationId === u.id || l.urbanizationName === u.name);
      const uTotalBs = uLots.reduce((sum, l) => sum + (l.priceBs || 0), 0);
      const uTotalUsd = uLots.reduce((sum, l) => sum + (l.priceUsd || 0), 0);
      const uSales = sales.filter(s => s.urbanization.toLowerCase().includes(u.name.toLowerCase()));
      const uRecaudadoBs = uSales.reduce((sum, s) => sum + (s.totalPaid || 0), 0);
      const uPendingBs = Math.max(0, uSales.reduce((sum, s) => sum + (s.pendingBalance || 0), 0));
      const uMoratoria = uLots.filter(l => l.status === 'En Moratoria');
      const uPct = uTotalBs > 0 ? Math.min(100, Math.round((uRecaudadoBs / uTotalBs) * 100)) : 0;

      return {
        ...u,
        lotsCount: uLots.length,
        totalBs: uTotalBs,
        totalUsd: uTotalUsd,
        recaudadoBs: uRecaudadoBs,
        pendingBs: uPendingBs,
        moratoriaCount: uMoratoria.length,
        moratoriaBs: uMoratoria.reduce((sum, l) => sum + (l.priceBs || 0), 0),
        pct: uPct
      };
    });
  }, [urbanizations, lots, sales]);

  // Filter payments table
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesType = p.type === paymentType;
      const matchesSearch = 
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.lot.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.urbanization.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesUrb = 
        selectedUrbanization === 'Todas las urbanizaciones' || 
        p.urbanization === selectedUrbanization;

      const matchesMethod = 
        selectedPaymentMethod === 'Todas las formas de pago' || 
        p.paymentMethod === selectedPaymentMethod;

      return matchesType && matchesSearch && matchesUrb && matchesMethod;
    });
  }, [payments, paymentType, searchQuery, selectedUrbanization, selectedPaymentMethod]);

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));

  // Active sale for detail view
  const activeSale = useMemo(() => {
    if (!selectedSaleId) return null;
    return sales.find(s => s.id === selectedSaleId) || sales[0];
  }, [selectedSaleId, sales]);

  // Payment Breakdown Summary by Method
  const methodSummary = useMemo(() => {
    return [
      { name: 'Contado', amount: 45000, percent: 53, color: 'bg-emerald-700' },
      { name: 'Transferencia', amount: 22500, percent: 26, color: 'bg-amber-500' },
      { name: 'Tarjeta', amount: 10200, percent: 12, color: 'bg-teal-700' },
      { name: 'Efectivo', amount: 8000, percent: 9, color: 'bg-slate-400' },
    ];
  }, []);

  const urbPaymentSummary = [
    { name: 'Villa Bonita', amount: 28500, img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=150&q=80' },
    { name: 'Los Pinos', amount: 18700, img: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=150&q=80' },
    { name: 'Valle Verde', amount: 16300, img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80' },
    { name: 'El Mirador', amount: 12200, img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=150&q=80' },
    { name: 'La Florida', amount: 9000, img: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=150&q=80' },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1700px] mx-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#0d3f2b] to-[#175239] text-white flex items-center justify-center shadow-md flex-shrink-0 border border-emerald-700/50">
            <CreditCard className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Mis Pagos y Recaudación de Terrenos
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                Finanzas y Cobranzas
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Control de pagos, valor total de terrenos y lotes en cartera, recaudación efectiva y moratoria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector */}
          <div className="relative">
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <button
            onClick={onOpenNewPayment}
            className="px-4 py-2.5 bg-[#0d3f2b] hover:bg-[#072a1c] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN HERO: VALOR TOTAL DE TODOS LOS LOTES Y TOTAL RECAUDADO (REQUERIMIENTO PRINCIPAL) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#072a1b] via-[#0d3f2b] to-[#124b34] text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/80 space-y-5">
        {/* Top bar of the Hero Card: Filter & Context */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-emerald-800/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-extrabold uppercase tracking-wider border border-amber-400/30">
                Patrimonio & Recaudación Inmobiliaria
              </span>
              {selectedUrbanization !== 'Todas las urbanizaciones' && (
                <span className="text-xs text-emerald-200 font-semibold">
                  (Filtrado por: {selectedUrbanization})
                </span>
              )}
            </div>
            <h2 className="text-lg font-black text-white mt-1">
              Valor Total de Terrenos vs. Recaudación Efectiva
            </h2>
            <p className="text-xs text-emerald-200/80">
              Métricas consolidadas de la totalidad de lotes en inventario y el dinero recaudado a la fecha.
            </p>
          </div>

          {/* Quick Urbanization Filter Pill Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-200 hidden lg:inline">Urbanización:</span>
            <select
              value={selectedUrbanization}
              onChange={(e) => {
                setSelectedUrbanization(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-emerald-950/80 border border-emerald-600/50 rounded-xl text-xs font-bold text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-300/40"
            >
              <option value="Todas las urbanizaciones">Todas las urbanizaciones (Global)</option>
              {urbanizations.map((u) => (
                <option key={u.id} value={u.name}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Grand Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. VALOR TOTAL DE TODOS LOS LOTES */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
                  Valor Total de Terrenos y Lotes
                </span>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight tracking-tight">
                  Bs. {totalLotsValueBs.toLocaleString('es-BO')}
                </p>
                <p className="text-xs font-bold text-amber-200/90 mt-0.5">
                  ≈ $us. {totalLotsValueUsd.toLocaleString('es-BO')}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 border border-amber-400/30">
                <Landmark className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-100/90">
              <span className="font-semibold">{totalLotsCount} lotes en cartera</span>
              <span className="font-mono">{totalSurfaceM2.toLocaleString('es-BO')} m² totales</span>
            </div>
          </div>

          {/* 2. TOTAL RECAUDADO (COBRADO) */}
          <div className="bg-emerald-950/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-400/30 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Total Recaudado (Cobrado)
                </span>
                <p className="text-2xl sm:text-3xl font-black text-emerald-300 mt-1 leading-tight tracking-tight">
                  Bs. {totalRecaudadoGeneralBs.toLocaleString('es-BO')}
                </p>
                <p className="text-xs font-bold text-emerald-200 mt-0.5">
                  ≈ $us. {totalRecaudadoUsd.toLocaleString('es-BO')}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 border border-emerald-400/40">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            {/* Recaudado Progress Bar */}
            <div className="pt-3 mt-2 border-t border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-200 font-semibold">Tasa de Recaudación:</span>
                <span className="font-black text-white">{porcentajeRecaudado.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-emerald-400/20">
                <div 
                  className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, porcentajeRecaudado))}%` }}
                />
              </div>
            </div>
          </div>

          {/* 3. SALDO POR COBRAR / CUOTAS */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300 block">
                  Saldo por Recaudar / Cobrar
                </span>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight tracking-tight">
                  Bs. {saldoPendientePorCobrarBs.toLocaleString('es-BO')}
                </p>
                <p className="text-xs font-bold text-sky-200 mt-0.5">
                  ≈ $us. {Math.round(saldoPendientePorCobrarBs / 6.96).toLocaleString('es-BO')}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-sky-400/20 text-sky-300 flex items-center justify-center flex-shrink-0 border border-sky-400/30">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-sky-100/90">
              <span className="font-semibold">Ventas vigentes a crédito</span>
              <span className="text-[10px] text-sky-200">En cronograma</span>
            </div>
          </div>

          {/* 4. LOTES EN MORATORIA (ESTADO MORATORIA) */}
          <div className="bg-rose-950/50 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-rose-500/40 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 block">
                  Lotes en Moratoria (Impago)
                </span>
                <p className="text-2xl sm:text-3xl font-black text-rose-200 mt-1 leading-tight tracking-tight">
                  {moratoriaLotsCount} lotes
                </p>
                <p className="text-xs font-bold text-rose-300/90 mt-0.5">
                  Bs. {moratoriaValueBs.toLocaleString('es-BO')}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center flex-shrink-0 border border-rose-400/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-rose-200/90">
              <span className="font-semibold">Por falta de pago</span>
              <span className="text-[10px] bg-rose-900/80 px-2 py-0.5 rounded-md text-rose-100 font-bold">
                En reversión
              </span>
            </div>
          </div>
        </div>

        {/* Toggle para ver tabla detallada por condominio */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={() => setShowCondoBreakdown(!showCondoBreakdown)}
            className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 cursor-pointer underline-offset-4 hover:underline"
          >
            <span>{showCondoBreakdown ? 'Ocultar desglose por condominio' : 'Mostrar desglose de valor y recaudación por cada condominio'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCondoBreakdown ? 'rotate-180' : ''}`} />
          </button>
          <span className="text-[11px] text-emerald-200/70 hidden sm:inline">
            Datos actualizados automáticamente según inventario y pagos
          </span>
        </div>

        {/* TABLA DESGLOSE POR CONDOMINIO */}
        {showCondoBreakdown && (
          <div className="bg-black/30 rounded-2xl p-4 border border-white/10 space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Desglose de Valor Patrimonial y Recaudación por Condominio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {condoBreakdown.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedUrbanization(item.name);
                    setCurrentPage(1);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedUrbanization === item.name
                      ? 'bg-emerald-900/90 border-amber-300 shadow-md ring-2 ring-amber-300/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
                    <span className="font-black text-xs text-white truncate">{item.name}</span>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      {item.lotsCount} lotes
                    </span>
                  </div>

                  <div className="pt-2 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Valor Lotes:</span>
                      <span className="font-bold text-white">Bs. {(item.totalBs / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-300">Recaudado:</span>
                      <span className="font-bold text-emerald-300">Bs. {(item.recaudadoBs / 1000).toFixed(0)}k</span>
                    </div>
                    {item.moratoriaCount > 0 && (
                      <div className="flex justify-between text-rose-300">
                        <span>En Mora:</span>
                        <span className="font-bold">{item.moratoriaCount} lotes</span>
                      </div>
                    )}

                    {/* Progress bar */}
                    <div className="pt-1.5">
                      <div className="flex justify-between text-[10px] text-slate-300 mb-0.5">
                        <span>Cobrado</span>
                        <span>{item.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${Math.min(100, item.pct)}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN INFERIOR: TABLA DE PAGOS Y DETALLE (CLIENTES Y PROVEEDORES) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Table with Filters */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sub-tabs: Pagos de clientes vs Pagos a proveedores */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-xs">
            <button
              onClick={() => {
                setPaymentType('cliente');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                paymentType === 'cliente'
                  ? 'bg-[#0d3f2b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Pagos de clientes</span>
            </button>
            <button
              onClick={() => {
                setPaymentType('proveedor');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                paymentType === 'proveedor'
                  ? 'bg-[#0d3f2b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Pagos a proveedores</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={paymentType === 'cliente' ? "Buscar por cliente, lote..." : "Buscar proveedor, concepto..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Urbanization filter */}
              <select
                value={selectedUrbanization}
                onChange={(e) => {
                  setSelectedUrbanization(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="Todas las urbanizaciones">Todas las urbanizaciones</option>
                {urbanizations.map((u) => (
                  <option key={u.id} value={u.name}>{u.name}</option>
                ))}
              </select>

              {/* Payment Method filter */}
              <select
                value={selectedPaymentMethod}
                onChange={(e) => {
                  setSelectedPaymentMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="Todas las formas de pago">Todas las formas de pago</option>
                <option value="Contado">Contado</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10.5px]">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">
                      {paymentType === 'cliente' ? 'Cliente' : 'Proveedor'}
                    </th>
                    <th className="py-3 px-4">
                      {paymentType === 'cliente' ? 'Urbanización / Lote' : 'Concepto / Obra'}
                    </th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Forma de pago</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedPayments.length > 0 ? (
                    paginatedPayments.map((p) => {
                      const isSelected = selectedSaleId === p.saleId;
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 text-slate-600 font-semibold">{p.date}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{p.clientName}</div>
                            {p.clientCI && (
                              <div className="text-[10px] text-slate-400">CI: {p.clientCI}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="font-semibold text-slate-800">{p.urbanization}</span>
                            {p.lot && <span className="text-slate-400"> &bull; {p.lot}</span>}
                            {p.concept && <div className="text-[10px] text-slate-500">{p.concept}</div>}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900">
                              {p.currency} {p.amount.toLocaleString('es-BO')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-semibold">
                              {p.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold border ${
                                p.status === 'Pagado'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : p.status === 'Pendiente'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {onOpenPaymentPlan && p.type === 'cliente' && (
                                <button
                                  onClick={() => {
                                    const matchedSale = sales.find(s => s.id === p.saleId || s.clientName === p.clientName);
                                    if (matchedSale) {
                                      onOpenPaymentPlan(matchedSale);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#0d3f2b] hover:bg-[#072a1c] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                                  title="Ver e Imprimir Plan de Pagos estilo Banco"
                                >
                                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Plan de Pagos</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedSaleId(selectedSaleId === p.saleId ? null : p.saleId);
                                }}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0d3f2b] text-white border-[#0d3f2b]'
                                    : 'text-slate-400 hover:text-emerald-800 hover:bg-slate-100 border-slate-200'
                                }`}
                                title="Ver detalle del pago y plan de cuotas"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No se encontraron registros de pagos con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="py-3 px-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Mostrando {filteredPayments.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} a{' '}
                {Math.min(currentPage * pageSize, filteredPayments.length)} de {filteredPayments.length} pagos
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Dynamic Detail Drawer or Summary */}
        <div className="space-y-4">
          {activeSale && selectedSaleId ? (
            /* DETALLE DE VENTA SELECCIONADA & CRONOGRAMA DE CUOTAS */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeSale.clientName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeSale.urbanization} &bull; {activeSale.lot}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSaleId(null)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metric strip */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Contrato</span>
                  <span className="font-black text-slate-900 text-sm">
                    {activeSale.currency} {activeSale.amount.toLocaleString('es-BO')}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80">
                  <span className="text-[10px] text-emerald-700 block font-semibold">Total Pagado</span>
                  <span className="font-black text-emerald-900 text-sm">
                    {activeSale.currency} {activeSale.totalPaid.toLocaleString('es-BO')}
                  </span>
                </div>
              </div>

              {/* Installments Plan */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Cronograma de Pagos y Cuotas
                </h4>
                <div className="space-y-1.5">
                  {(activeSale.installments && activeSale.installments.length > 0
                    ? activeSale.installments
                    : [
                        { id: '1', number: 1, dueDate: '15/05/2025', amount: 5000, status: 'Pagado' as const },
                        { id: '2', number: 2, dueDate: '15/06/2025', amount: 5000, status: 'Pendiente' as const },
                      ]
                  ).map((inst) => (
                    <div
                      key={inst.id}
                      className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700">
                          {inst.number}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">{activeSale.currency} {inst.amount.toLocaleString('es-BO')}</p>
                          <p className="text-[10px] text-slate-400">Vence: {inst.dueDate}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inst.status === 'Pagado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inst.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imprimir Plan de Pagos & Ver Contrato */}
              <div className="space-y-2 pt-1">
                {onOpenPaymentPlan && (
                  <button
                    onClick={() => onOpenPaymentPlan(activeSale)}
                    className="w-full py-3 px-4 bg-[#0d3f2b] hover:bg-[#072a1c] text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    <span>Imprimir Plan de Pagos (Estilo Banco)</span>
                  </button>
                )}
                <button
                  onClick={() => onOpenContract(activeSale)}
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>Ver Contrato Inmobiliario</span>
                </button>
              </div>
            </div>
          ) : (
            /* RESUMEN POR FORMA DE PAGO & URBANIZACIONES */
            <div className="space-y-4">
              {/* Resumen por forma de pago */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-800" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Resumen por forma de pago
                    </h3>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {methodSummary.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-slate-600 font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          Bs. {item.amount.toLocaleString('es-BO')}
                        </span>
                        <span className="text-slate-400 text-[11px] w-8 text-right font-medium">
                          {item.percent}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagos por urbanización */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-800" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Recaudación por urbanización
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {urbPaymentSummary.map((urb) => (
                    <div
                      key={urb.name}
                      onClick={() => {
                        setSelectedUrbanization(urb.name);
                        setCurrentPage(1);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={urb.img}
                          alt={urb.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-xs"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{urb.name}</p>
                          <p className="text-[11px] text-slate-500">Bs. {urb.amount.toLocaleString('es-BO')}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Registrar nuevo pago Banner & Button */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
                  <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Registrar nuevo pago</h4>
                    <p className="text-[11px] text-slate-500">Ingresa un nuevo cobro o cuota.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                </div>

                <button
                  onClick={onOpenNewPayment}
                  className="w-full py-2.5 px-4 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Nuevo pago</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
