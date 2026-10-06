import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  Landmark, 
  User, 
  MapPin, 
  Calendar, 
  FileSpreadsheet, 
  Plus, 
  Check,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Client, Sale, Payment, Installment } from '../../types';

interface PlanPagosModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  sale?: Sale | null;
  sales: Sale[];
  payments: Payment[];
  onRegisterInstallmentPayment?: (saleId: string, installmentNumber: number, amount: number, clientName: string, urbanization: string, lot: string) => void;
}

export const PlanPagosModal: React.FC<PlanPagosModalProps> = ({
  isOpen,
  onClose,
  client,
  sale,
  sales,
  payments,
  onRegisterInstallmentPayment,
}) => {
  const [selectedPlazo, setSelectedPlazo] = useState<number>(12);
  const [paidOverrideIds, setPaidOverrideIds] = useState<Record<string, { paidDate: string; receipt: string }>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || (!client && !sale)) return null;

  // Find all sales matching this client or use the passed sale
  const clientSales = useMemo(() => {
    if (sale) return [sale];
    if (!client) return [];
    const matched = sales.filter(
      s =>
        s.clientId === client.id ||
        s.clientCI.toLowerCase() === client.ci.toLowerCase() ||
        s.clientName.toLowerCase() === client.name.toLowerCase()
    );
    return matched;
  }, [client, sale, sales]);

  const activeSale: Sale = useMemo(() => {
    if (clientSales.length > 0) return clientSales[0];
    // Fallback synthetic sale for clients registered without a sale record yet
    const lotText = client?.purchasedLots?.[0] || 'Villa Bonita - Lote 10';
    const parts = lotText.split(' - ');
    return {
      id: `CRED-${client?.id || '001'}`,
      date: '05/05/2025',
      clientId: client?.id || 'C-001',
      clientName: client?.name || 'Cliente Titular',
      clientCI: client?.ci || '0000000 CB',
      clientPhone: client?.phone || '70000000',
      urbanization: parts[0] || 'Villa Bonita',
      lot: parts[1] || 'Lote 10',
      block: 'Manzano 1',
      surface: '300 m²',
      modality: 'Crédito',
      amount: 45000,
      currency: 'Bs.',
      status: 'En proceso',
      sellerId: 'S-001',
      sellerName: 'Carlos Ruiz',
      observations: 'Plan de pagos bancario de amortización directa.',
      image: '',
      totalPaid: 15000,
      pendingBalance: 30000,
    };
  }, [clientSales, client]);

  // Client payments history
  const clientPayments = useMemo(() => {
    return payments.filter(
      p =>
        p.saleId === activeSale.id ||
        p.clientName.toLowerCase() === activeSale.clientName.toLowerCase()
    );
  }, [payments, activeSale]);

  // Build Bank Amortization Table Rows ("similar al banco")
  const bankSchedule = useMemo(() => {
    const totalPrice = activeSale.amount || 45000;
    const isContado = activeSale.modality === 'Contado';

    if (isContado) {
      return [
        {
          id: `${activeSale.id}-1`,
          number: 1,
          concept: 'Pago Único al Contado (Cancelación Total)',
          dueDate: activeSale.date,
          previousBalance: totalPrice,
          principal: totalPrice,
          interest: 0,
          insurance: 0,
          totalQuota: totalPrice,
          remainingBalance: 0,
          status: 'Pagado' as const,
          paidDate: activeSale.date,
          receiptNumber: `BAN-001-${activeSale.id}`,
        },
      ];
    }

    // For Credit or Multi-Installment Schedule
    const totalInstallments = activeSale.installments && activeSale.installments.length > 1
      ? Math.max(activeSale.installments.length, selectedPlazo)
      : selectedPlazo;

    const initialDownPayment = Math.round(totalPrice * 0.20); // 20% Cuota Inicial
    const financedCapital = totalPrice - initialDownPayment;
    const monthlyPrincipal = Math.round(financedCapital / totalInstallments);

    const rows: Array<{
      id: string;
      number: number;
      concept: string;
      dueDate: string;
      previousBalance: number;
      principal: number;
      interest: number;
      insurance: number;
      totalQuota: number;
      remainingBalance: number;
      status: 'Pagado' | 'Pendiente' | 'Atrasado';
      paidDate?: string;
      receiptNumber?: string;
    }> = [];

    // Row 0: Cuota Inicial / Anticipo
    rows.push({
      id: `${activeSale.id}-0`,
      number: 0,
      concept: 'Cuota Inicial / Apertura de Crédito',
      dueDate: activeSale.date || '05/05/2025',
      previousBalance: totalPrice,
      principal: initialDownPayment,
      interest: 0,
      insurance: 0,
      totalQuota: initialDownPayment,
      remainingBalance: financedCapital,
      status: 'Pagado',
      paidDate: activeSale.date || '05/05/2025',
      receiptNumber: `REC-INI-${activeSale.id}`,
    });

    let currentBalance = financedCapital;
    let accumulatedPaidAfterInitial = Math.max(0, activeSale.totalPaid - initialDownPayment);

    for (let i = 1; i <= totalInstallments; i++) {
      const rowId = `${activeSale.id}-${i}`;
      const isLast = i === totalInstallments;
      const principalPart = isLast ? currentBalance : monthlyPrincipal;
      const nextBalance = Math.max(0, currentBalance - principalPart);

      // Compute monthly due date starting May 2025
      const monthIndex = (4 + i) % 12; // May = 4
      const yearOffset = Math.floor((4 + i) / 12);
      const year = 2025 + yearOffset;
      const day = '10';
      const dueDate = `${day}/${(monthIndex + 1).toString().padStart(2, '0')}/${year}`;

      // Determine if paid from activeSale.installments, accumulatedPaid, or local override
      const existingInst = activeSale.installments?.find(inst => inst.number === i);
      const override = paidOverrideIds[rowId];

      let isPaid = false;
      let paidDateStr: string | undefined = undefined;
      let receiptStr: string | undefined = undefined;

      if (override) {
        isPaid = true;
        paidDateStr = override.paidDate;
        receiptStr = override.receipt;
      } else if (existingInst && existingInst.status === 'Pagado') {
        isPaid = true;
        paidDateStr = existingInst.paidDate || dueDate;
        receiptStr = existingInst.receiptNumber || `COMP-00${i}-${activeSale.id}`;
        accumulatedPaidAfterInitial = Math.max(0, accumulatedPaidAfterInitial - principalPart);
      } else if (accumulatedPaidAfterInitial >= principalPart * 0.8) {
        isPaid = true;
        paidDateStr = dueDate;
        receiptStr = `COMP-00${i}-${activeSale.id}`;
        accumulatedPaidAfterInitial = Math.max(0, accumulatedPaidAfterInitial - principalPart);
      }

      rows.push({
        id: rowId,
        number: i,
        concept: `Cuota Mensual Nº ${i.toString().padStart(2, '0')} / ${totalInstallments}`,
        dueDate,
        previousBalance: currentBalance,
        principal: principalPart,
        interest: 0,
        insurance: 0,
        totalQuota: principalPart,
        remainingBalance: nextBalance,
        status: isPaid ? 'Pagado' : 'Pendiente',
        paidDate: paidDateStr,
        receiptNumber: receiptStr,
      });

      currentBalance = nextBalance;
    }

    return rows;
  }, [activeSale, selectedPlazo, paidOverrideIds]);

  const summary = useMemo(() => {
    const totalContract = activeSale.amount || 45000;
    const totalPaid = bankSchedule
      .filter(r => r.status === 'Pagado')
      .reduce((acc, r) => acc + r.totalQuota, 0);
    const pendingBalance = Math.max(0, totalContract - totalPaid);
    const paidCount = bankSchedule.filter(r => r.status === 'Pagado').length;
    const pendingCount = bankSchedule.filter(r => r.status !== 'Pagado').length;
    const progressPct = totalContract > 0 ? Math.min(100, Math.round((totalPaid / totalContract) * 100)) : 0;

    return { totalContract, totalPaid, pendingBalance, paidCount, pendingCount, progressPct };
  }, [bankSchedule, activeSale]);

  const handleMarkInstallmentPaid = (row: typeof bankSchedule[0]) => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    const receipt = `BAN-${Math.floor(10000 + Math.random() * 90000)}`;

    setPaidOverrideIds(prev => ({
      ...prev,
      [row.id]: { paidDate: formattedDate, receipt }
    }));

    if (onRegisterInstallmentPayment) {
      onRegisterInstallmentPayment(
        activeSale.id,
        row.number,
        row.totalQuota,
        activeSale.clientName,
        activeSale.urbanization,
        activeSale.lot
      );
    }

    setToastMessage(`Cuota Nº ${row.number} registrada como PAGADA (Comprobante: ${receipt})`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Action Bar (Hidden when printing) */}
        <div className="bg-gradient-to-r from-[#072a1b] via-[#0d3f2b] to-[#145338] text-white p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-sm">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">
                  Plan de Pagos y Cronograma Bancario de Cliente
                </h2>
                <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-full text-xs font-black uppercase">
                  Formato Banco Oficial
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Estado de cuenta detallado cuota por cuota, amortización de capital, saldo restante e impresión directa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {activeSale.modality !== 'Contado' && (
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
                <span className="text-emerald-200 font-semibold">Plazo:</span>
                <select
                  value={selectedPlazo}
                  onChange={(e) => setSelectedPlazo(Number(e.target.value))}
                  className="bg-emerald-950 text-white font-bold px-2 py-1 rounded-lg border border-emerald-600 cursor-pointer"
                >
                  <option value={6}>6 Cuotas (Meses)</option>
                  <option value={12}>12 Cuotas (1 Año)</option>
                  <option value={18}>18 Cuotas</option>
                  <option value={24}>24 Cuotas (2 Años)</option>
                  <option value={36}>36 Cuotas (3 Años)</option>
                </select>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Plan de Pagos</span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 text-emerald-200 hover:text-white hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast notification when an installment is paid */}
        {toastMessage && (
          <div className="bg-emerald-700 text-white px-6 py-2.5 text-sm font-bold flex items-center justify-center gap-2 print:hidden">
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Printable Bank Payment Plan Document */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex-1">
          <div
            id="printable-bank-plan"
            className="max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-md border border-slate-300 space-y-6 text-slate-900"
          >
            {/* 1. BANK STYLE DOCUMENT HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-900">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[#072a1b] text-white flex items-center justify-center font-black text-xl shadow-xs border-2 border-amber-400">
                  NR
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#072a1b] uppercase">
                    INMOBILIARIA NUEVAS RAÍCES S.R.L.
                  </h1>
                  <p className="text-xs font-bold text-slate-600">
                    DEPARTAMENTO DE CRÉDITOS, CARTERA Y COBRANZAS • NIT: 1029384021
                  </p>
                  <p className="text-xs text-slate-500">
                    Oficina Central: Av. Ayacucho esq. Heroínas • Cochabamba, Bolivia
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border-2 border-slate-800 rounded-xl p-3 text-right font-mono text-xs space-y-0.5">
                <div className="text-[11px] font-black text-emerald-900 uppercase tracking-wider">
                  PLAN DE PAGOS Y AMORTIZACIÓN BANCARIA
                </div>
                <div className="text-sm font-black text-slate-900">
                  OPERACIÓN Nº: {activeSale.id}
                </div>
                <div className="text-slate-600">
                  Fecha Emisión: {new Date().toLocaleDateString('es-BO')}
                </div>
                <div className="text-slate-600 font-bold">
                  Moneda: BOLIVIANOS ({activeSale.currency})
                </div>
              </div>
            </div>

            {/* 2. DATOS DEL CLIENTE Y DATOS DE LA URBANIZACIÓN (2 TABLAS TIPO BANCO) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tabla Izquierda: Datos del Titular */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-[#072a1b] text-white px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-300" />
                  <span>1. Datos del Titular / Cliente Deudor</span>
                </div>
                <div className="p-3.5 space-y-2 text-xs bg-white">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-500">Nombre Completo del Titular:</span>
                    <span className="font-black text-slate-900 uppercase">{client?.name || activeSale.clientName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-500">Documento de Identidad (C.I.):</span>
                    <span className="font-bold text-slate-900">{client?.ci || activeSale.clientCI}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-500">Teléfono / Celular Registrado:</span>
                    <span className="font-bold text-slate-800">{client?.phone || activeSale.clientPhone}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-500">Ocupación / Actividad:</span>
                    <span className="font-semibold text-slate-800">{client?.occupation || 'Titular Acreditado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Domicilio Legal:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[230px]">
                      {client?.address || 'Cochabamba, Bolivia'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabla Derecha: Datos de la Urbanización y Terreno */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <div className="bg-[#072a1b] text-white px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-300" />
                  <span>2. Datos de la Urbanización y Terreno Adjudicado</span>
                </div>
                <div className="p-3.5 space-y-2 text-xs bg-white">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-500">Urbanización:</span>
                    <span className="font-black text-emerald-900 uppercase">{activeSale.urbanization}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-500">Ubicación / Manzano y Lote:</span>
                    <span className="font-black text-slate-900">{activeSale.block} • {activeSale.lot}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-500">Superficie Total del Lote:</span>
                    <span className="font-bold text-slate-900">{activeSale.surface}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-500">Modalidad de Financiamiento:</span>
                    <span className="font-black text-amber-800 uppercase">
                      {activeSale.modality === 'Contado' ? 'PAGO AL CONTADO' : `CRÉDITO DIRECTO (${selectedPlazo} CUOTAS)`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Tasa de Interés / Recargo:</span>
                    <span className="font-bold text-emerald-800">0.00% Anual (Sin Interés Bancario)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. RESUMEN FINANCIERO DE SALDOS (CUADRO EJECUTIVO BANCARIO) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-300">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase block">
                  Valor Total del Terreno
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 mt-0.5 block">
                  Bs. {summary.totalContract.toLocaleString('es-BO')}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Capital Total Contratado
                </span>
              </div>

              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-300">
                <span className="text-[11px] font-extrabold text-emerald-800 uppercase block">
                  Total Pagado / Amortizado
                </span>
                <span className="text-lg sm:text-xl font-black text-emerald-900 mt-0.5 block">
                  Bs. {summary.totalPaid.toLocaleString('es-BO')}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">
                  {summary.paidCount} cuotas canceladas ({summary.progressPct}%)
                </span>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-300">
                <span className="text-[11px] font-extrabold text-amber-900 uppercase block">
                  Saldo Capital Pendiente
                </span>
                <span className="text-lg sm:text-xl font-black text-amber-950 mt-0.5 block">
                  Bs. {summary.pendingBalance.toLocaleString('es-BO')}
                </span>
                <span className="text-[11px] text-amber-800 font-bold">
                  {summary.pendingCount} cuotas por pagar
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-slate-500 uppercase">
                    Avance del Plan
                  </span>
                  <span className="text-sm font-black text-emerald-800">{summary.progressPct}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden my-1.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${summary.progressPct}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-600">
                  {summary.pendingBalance === 0 ? '✅ CRÉDITO CANCELADO' : '⏳ CRÉDITO EN CURSO'}
                </span>
              </div>
            </div>

            {/* 4. TABLA DE AMORTIZACIÓN BANCARIA CUOTA POR CUOTA */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
                  <span>3. Cronograma Oficial de Pagos y Amortización de Capital</span>
                </h3>
                <span className="text-xs font-bold text-slate-500 print:hidden">
                  Haz clic en &ldquo;Cobrar Cuota&rdquo; para asentar cada pago realizado por el cliente
                </span>
              </div>

              <div className="border-2 border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white font-black uppercase text-[11px] tracking-wider">
                        <th className="py-3 px-3 border-r border-slate-700 text-center">Nº</th>
                        <th className="py-3 px-3 border-r border-slate-700">Concepto / Cuota</th>
                        <th className="py-3 px-3 border-r border-slate-700 text-center">Vencimiento</th>
                        <th className="py-3 px-3 border-r border-slate-700 text-right">Saldo Anterior</th>
                        <th className="py-3 px-3 border-r border-slate-700 text-right">Capital (Bs.)</th>
                        <th className="py-3 px-3 border-r border-slate-700 text-right">Interés</th>
                        <th className="py-3 px-3 border-r border-slate-700 text-right bg-emerald-950">Cuota Total</th>
                        <th className="py-3 px-3 border-r border-slate-700 text-right">Saldo Restante</th>
                        <th className="py-3 px-3 border-r border-slate-700 text-center">Fecha Pago / Recibo</th>
                        <th className="py-3 px-3 text-center">Estado</th>
                        <th className="py-3 px-3 text-center print:hidden">Registrar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {bankSchedule.map((row) => {
                        const isPaid = row.status === 'Pagado';
                        return (
                          <tr
                            key={row.id}
                            className={`${
                              isPaid ? 'bg-emerald-50/40' : 'bg-white hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-black text-slate-900">
                              {row.number}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-800">
                              {row.concept}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-slate-700">
                              {row.dueDate}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-slate-600">
                              Bs. {row.previousBalance.toLocaleString('es-BO')}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-900">
                              Bs. {row.principal.toLocaleString('es-BO')}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono text-slate-500">
                              Bs. 0
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-black text-emerald-950 bg-emerald-50/60">
                              Bs. {row.totalQuota.toLocaleString('es-BO')}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-right font-mono font-bold text-slate-800">
                              Bs. {row.remainingBalance.toLocaleString('es-BO')}
                            </td>
                            <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono text-[11px]">
                              {isPaid ? (
                                <div>
                                  <span className="font-bold text-emerald-800">{row.paidDate}</span>
                                  <span className="block text-[10px] text-slate-500">{row.receiptNumber}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                                  isPaid
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                                }`}
                              >
                                {isPaid ? 'PAGADO' : 'PENDIENTE'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center print:hidden">
                              {!isPaid ? (
                                <button
                                  type="button"
                                  onClick={() => handleMarkInstallmentPaid(row)}
                                  className="px-2.5 py-1 bg-[#0d3f2b] hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg shadow-2xs cursor-pointer transition-colors flex items-center gap-1 mx-auto"
                                >
                                  <Check className="w-3 h-3 text-amber-300" />
                                  <span>Cobrar Cuota</span>
                                </button>
                              ) : (
                                <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Cancelado
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-900 text-white font-black text-xs">
                        <td colSpan={4} className="py-3 px-4 text-right uppercase">
                          Totales del Plan de Pagos:
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          Bs. {summary.totalContract.toLocaleString('es-BO')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">Bs. 0</td>
                        <td className="py-3 px-3 text-right font-mono text-amber-300">
                          Bs. {summary.totalContract.toLocaleString('es-BO')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-emerald-300">
                          Saldo: Bs. {summary.pendingBalance.toLocaleString('es-BO')}
                        </td>
                        <td colSpan={3} className="py-3 px-3 text-center text-emerald-300">
                          Pagado: Bs. {summary.totalPaid.toLocaleString('es-BO')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* 5. HISTORIAL DE RECIBOS Y PAGOS EFECTUADOS */}
            {clientPayments.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>4. Registro de Abonos y Comprobantes Emitidos en Caja</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {clientPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-black text-slate-900 block">
                          Recibo {p.id} • {p.date}
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          {p.paymentMethod} • {p.concept || 'Abono de cuota'}
                        </span>
                      </div>
                      <span className="font-black text-emerald-800 text-sm">
                        {p.currency} {p.amount.toLocaleString('es-BO')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. NOTA BANCARIA Y FIRMAS DE CONFORMIDAD */}
            <div className="pt-4 space-y-8">
              <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                <strong className="text-slate-900">NOTA IMPORTANTE DE CAJA Y CRÉDITOS:</strong> El presente Plan de Pagos constituye el estado oficial de amortización del lote ubicado en la <strong>Urbanización {activeSale.urbanization} ({activeSale.block} - {activeSale.lot})</strong>. Todo pago de cuota debe realizarse en oficinas autorizadas de Inmobiliaria Nuevas Raíces S.R.L. o mediante transferencia bancaria adjuntando el comprobante respectivo.
              </div>

              <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs">
                <div className="border-t-2 border-slate-800 pt-2.5">
                  <p className="font-black text-slate-900 uppercase">{client?.name || activeSale.clientName}</p>
                  <p className="text-slate-600 font-bold">FIRMA DEL TITULAR / CLIENTE</p>
                  <p className="text-slate-500 text-[11px]">C.I.: {client?.ci || activeSale.clientCI}</p>
                </div>

                <div className="border-t-2 border-slate-800 pt-2.5">
                  <p className="font-black text-slate-900 uppercase">INMOBILIARIA NUEVAS RAÍCES S.R.L.</p>
                  <p className="text-slate-600 font-bold">SELLO Y FIRMA OFICIAL DE CRÉDITOS Y COBRANZAS</p>
                  <p className="text-slate-500 text-[11px]">Asesor / Caja: {activeSale.sellerName}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
