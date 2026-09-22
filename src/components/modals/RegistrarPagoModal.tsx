import React, { useState } from 'react';
import { X, CreditCard, Check } from 'lucide-react';
import { Payment, Sale, PaymentMethod } from '../../types';

interface RegistrarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: Sale[];
  onSavePayment: (payment: Payment) => void;
}

export const RegistrarPagoModal: React.FC<RegistrarPagoModalProps> = ({
  isOpen,
  onClose,
  sales,
  onSavePayment,
}) => {
  const [selectedSaleId, setSelectedSaleId] = useState(sales[0]?.id || 'V-001');
  const [amount, setAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia');
  const [reference, setReference] = useState('');
  const [concept, setConcept] = useState('Cuota Nº 3 mensual');
  const [paymentType, setPaymentType] = useState<'cliente' | 'proveedor'>('cliente');

  if (!isOpen) return null;

  const currentSale = sales.find(s => s.id === selectedSaleId) || sales[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    const newPaymentId = `P-00${Math.floor(10 + Math.random() * 90)}`;

    const newPayment: Payment = {
      id: newPaymentId,
      saleId: currentSale.id,
      date: formattedDate,
      clientName: currentSale.clientName,
      urbanization: currentSale.urbanization,
      lot: currentSale.lot,
      amount: Number(amount),
      currency: 'Bs.',
      paymentMethod,
      type: paymentType,
      status: 'Pagado',
      concept,
      referenceNumber: reference || `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    onSavePayment(newPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#072a1b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Registrar Nuevo Pago</h2>
              <p className="text-xs text-emerald-200/80">Recibo de caja y amortización de cuota</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Sale selector */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Venta Asignada / Cliente
            </label>
            <select
              value={selectedSaleId}
              onChange={(e) => setSelectedSaleId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
            >
              {sales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} - {s.clientName} ({s.urbanization} - {s.lot})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Monto (Bs.)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Forma de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Contado">Contado</option>
                <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                <option value="Efectivo">Efectivo en Caja</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Concepto</label>
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Ej. Cuota mensual 3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Nº Comprobante / Ref.</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. TRF-982314"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Confirmar Pago</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
