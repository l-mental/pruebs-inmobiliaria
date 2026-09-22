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
  ArrowUpRight
} from 'lucide-react';
import { Payment, Sale, PaymentMethod } from '../../types';

interface PagosViewProps {
  payments: Payment[];
  sales: Sale[];
  onOpenNewPayment: () => void;
  onOpenContract: (sale: Sale) => void;
}

export const PagosView: React.FC<PagosViewProps> = ({
  payments,
  sales,
  onOpenNewPayment,
  onOpenContract,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('Mayo 2025');
  const [paymentType, setPaymentType] = useState<'cliente' | 'proveedor'>('cliente');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrbanization, setSelectedUrbanization] = useState('Todas las urbanizaciones');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Todas las formas de pago');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected client sale detail panel (if null, displays Image 2 summary; if set, displays Image 3 detail!)
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  // Filter payments
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

  // Active sale for Image 3 detail view
  const activeSale = useMemo(() => {
    if (!selectedSaleId) return null;
    return sales.find(s => s.id === selectedSaleId) || sales[0];
  }, [selectedSaleId, sales]);

  // Payment Breakdown Summary (Image 2)
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
    { name: 'Otras', amount: 9000, img: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=150&q=80' },
  ];

  // Specific planned installments for Juan Pérez (matching Image 3)
  const clientInstallments = [
    { number: 1, date: '15/05/2025', amount: 5000, status: 'Pagado' },
    { number: 2, date: '15/06/2025', amount: 5000, status: 'Pagado' },
    { number: 3, date: '15/07/2025', amount: 5000, status: 'Pendiente' },
    { number: 4, date: '15/08/2025', amount: 5000, status: 'Pendiente' },
    { number: 5, date: '15/09/2025', amount: 5000, status: 'Pendiente' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0d3f2b] text-white flex items-center justify-center shadow-xs">
            <CreditCard className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Pagos
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Controla los pagos de tus clientes, por venta, mes y forma de pago.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Month selector */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedMonth}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <button
            onClick={onOpenNewPayment}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo pago</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total recibido */}
        <div className="bg-[#ebf6f1] rounded-2xl p-5 border border-emerald-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {paymentType === 'cliente' ? 'Total recibido' : 'Total recibido (mes)'}
            </p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">Bs. 85.700</p>
            <p className="text-[11px] text-slate-500 mt-0.5">en el mes</p>
          </div>
        </div>

        {/* Pagos pendientes */}
        <div className="bg-[#e9f2fb] rounded-2xl p-5 border border-sky-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Pagos pendientes</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">Bs. 120.300</p>
            <p className="text-[11px] text-slate-500 mt-0.5">de 8 clientes</p>
          </div>
        </div>

        {/* Pagos de hoy / Pagos a proveedores */}
        <div className="bg-[#fcf5e7] rounded-2xl p-5 border border-amber-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            {paymentType === 'cliente' ? (
              <Calendar className="w-6 h-6" />
            ) : (
              <Truck className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {paymentType === 'cliente' ? 'Pagos de hoy' : 'Pagos a proveedores'}
            </p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
              {paymentType === 'cliente' ? 'Bs. 12.000' : 'Bs. 60.000'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {paymentType === 'cliente' ? '3 pagos' : 'en el mes'}
            </p>
          </div>
        </div>

        {/* Ventas con pagos / Próximos pagos */}
        <div className="bg-[#eef8f2] rounded-2xl p-5 border border-emerald-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            {paymentType === 'cliente' ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {paymentType === 'cliente' ? 'Ventas con pagos' : 'Próximos pagos (3 meses)'}
            </p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
              {paymentType === 'cliente' ? '18' : '3'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {paymentType === 'cliente' ? 'de 25 ventas' : 'programados'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Table Left (2 cols) & Side Panel Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Table with Filters */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sub-tabs: Pagos de clientes vs Pagos a proveedores (Image 3) */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit shadow-xs">
            <button
              onClick={() => {
                setPaymentType('cliente');
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                paymentType === 'cliente'
                  ? 'bg-[#083021] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Pagos de clientes
            </button>
            <button
              onClick={() => {
                setPaymentType('proveedor');
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                paymentType === 'proveedor'
                  ? 'bg-[#083021] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Pagos a proveedores
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
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
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative w-full sm:w-48">
              <select
                value={selectedPaymentMethod}
                onChange={(e) => {
                  setSelectedPaymentMethod(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none pl-3.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 cursor-pointer"
              >
                <option value="Todas las formas de pago">Todas las formas de pago</option>
                <option value="Contado">Contado</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo">Efectivo</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={() => setCurrentPage(1)}
              className="w-full sm:w-auto px-4 py-2 bg-[#0d3f2b] hover:bg-[#072a1c] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10.5px]">
                    <th className="py-3 px-4">Nº</th>
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">{paymentType === 'cliente' ? 'Cliente' : 'Proveedor'}</th>
                    <th className="py-3 px-4">{paymentType === 'cliente' ? 'Urbanización / Lote' : 'Proyecto / Concepto'}</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Forma de pago</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {paginatedPayments.map((payment) => {
                    const isSelected = selectedSaleId === payment.saleId;
                    return (
                      <tr
                        key={payment.id}
                        onClick={() => setSelectedSaleId(payment.saleId)}
                        className={`hover:bg-emerald-50/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50/60 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {payment.id}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {payment.date}
                        </td>
                        <td className="py-3.5 px-4 text-slate-900">
                          {payment.clientName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {payment.urbanization} - {payment.lot}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          Bs. {payment.amount.toLocaleString('es-BO')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {payment.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              payment.status === 'Pagado'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSaleId(payment.saleId);
                            }}
                            className="w-7 h-7 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors"
                            title="Ver detalles de cuotas"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <p>
                Mostrando {paginatedPayments.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
                {Math.min(currentPage * pageSize, filteredPayments.length)} de {filteredPayments.length} registros
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

          {/* Bottom Information Callout (Matching bottom banner in Image 2) */}
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/60 flex items-center gap-3 text-xs text-emerald-900">
            <Info className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <p>
              Los pagos se registran automáticamente en la venta seleccionada. Puedes ver el detalle completo de cada venta desde el módulo de Ventas.
            </p>
          </div>
        </div>

        {/* Right 1 Col: Panel Switcher between Image 2 (Resumen General) & Image 3 (Detalle del Cliente) */}
        <div className="space-y-4">
          {activeSale ? (
            /* Image 3: DETALLE DEL CLIENTE & CUOTAS */
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5 animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">
                    Detalle del cliente
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedSaleId(null)}
                  className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                  title="Cerrar detalle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Client Profile Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {activeSale.clientName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      CI: {activeSale.clientCI} | Tel: {activeSale.clientPhone}
                    </p>
                  </div>
                </div>
                <div className="pt-1 flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full border border-emerald-200">
                    Cliente activo
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Información de la venta */}
              <div className="space-y-2.5 pt-1 border-t border-slate-100 text-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Información de la venta
                </h4>

                <div className="flex items-center gap-3">
                  <img
                    src={activeSale.image}
                    alt={activeSale.urbanization}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-slate-900">
                      {activeSale.urbanization} - {activeSale.lot}
                    </h5>
                    <p className="text-xs text-slate-600">
                      Manzano: 3 | Superficie: {activeSale.surface}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Precio total:</span>
                    <span className="font-bold text-slate-900">Bs. {activeSale.amount.toLocaleString('es-BO')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modalidad:</span>
                    <span className="font-semibold text-slate-800">Crédito</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vendedor:</span>
                    <span className="text-slate-800">{activeSale.sellerName}</span>
                  </div>
                </div>
              </div>

              {/* Plan de pagos (3 mini-cards) */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  Plan de pagos
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                    <p className="text-[10px] text-slate-500 font-semibold">Total de la venta</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">Bs. 45.000</p>
                  </div>
                  <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200/60">
                    <p className="text-[10px] text-emerald-700 font-semibold">Pagado</p>
                    <p className="text-xs font-bold text-emerald-900 mt-1">Bs. 20.000</p>
                  </div>
                  <div className="bg-red-50/80 p-2.5 rounded-xl border border-red-200/60">
                    <p className="text-[10px] text-red-700 font-semibold">Saldo pendiente</p>
                    <p className="text-xs font-bold text-red-600 mt-1">Bs. 25.000</p>
                  </div>
                </div>
              </div>

              {/* Cuotas programadas table */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">Cuotas programadas</p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-2.5">Nº</th>
                        <th className="py-2 px-2.5">Fecha de pago</th>
                        <th className="py-2 px-2.5">Monto</th>
                        <th className="py-2 px-2.5 text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {clientInstallments.map((cuota) => (
                        <tr key={cuota.number} className="hover:bg-slate-50/60">
                          <td className="py-2 px-2.5 font-bold">{cuota.number}</td>
                          <td className="py-2 px-2.5">{cuota.date}</td>
                          <td className="py-2 px-2.5 font-bold">Bs. {cuota.amount.toLocaleString('es-BO')}</td>
                          <td className="py-2 px-2.5 text-right">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                cuota.status === 'Pagado'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {cuota.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Próxima cuota alert card */}
              <button
                onClick={onOpenNewPayment}
                className="w-full p-3 rounded-xl bg-sky-50/70 border border-sky-200 flex items-center justify-between text-xs text-sky-900 hover:bg-sky-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-700" />
                  <span className="font-semibold">Próxima cuota:</span>
                  <span className="font-bold">15/07/2025 - Bs. 5.000</span>
                </div>
                <ChevronRight className="w-4 h-4 text-sky-700" />
              </button>
            </div>
          ) : (
            /* Image 2: RESUMEN POR FORMA DE PAGO & PAGOS POR URBANIZACIÓN */
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
                      Pagos por urbanización
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

              {/* Registrar nuevo pago Banner & Button (Image 2) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/60">
                  <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Registrar nuevo pago</h4>
                    <p className="text-[11px] text-slate-500">Ingresa un nuevo pago de un cliente.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                </div>

                <button
                  onClick={onOpenNewPayment}
                  className="w-full py-2.5 px-4 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
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
