import React, { useState } from 'react';
import { X, FilePlus, Check } from 'lucide-react';
import { Sale, Urbanization, PaymentModality } from '../../types';

interface RegistrarVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  urbanizations: Urbanization[];
  onSaveSale: (sale: Sale) => void;
  initialLotData?: { lotNumber: string; urbanizationName: string; priceBs: number; surface: number };
}

export const RegistrarVentaModal: React.FC<RegistrarVentaModalProps> = ({
  isOpen,
  onClose,
  urbanizations,
  onSaveSale,
  initialLotData,
}) => {
  const [clientName, setClientName] = useState('');
  const [clientCI, setClientCI] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [urbanization, setUrbanization] = useState(initialLotData?.urbanizationName || urbanizations[0]?.name || 'Villa Bonita');
  const [lot, setLot] = useState(initialLotData?.lotNumber || 'Lote 15');
  const [block, setBlock] = useState('Manzano 3');
  const [surface, setSurface] = useState(initialLotData?.surface ? `${initialLotData.surface} m²` : '300 m²');
  const [modality, setModality] = useState<PaymentModality>('Contado');
  const [amount, setAmount] = useState<number>(initialLotData?.priceBs || 45000);
  const [initialPayment, setInitialPayment] = useState<number>(10000);
  const [installmentsCount, setInstallmentsCount] = useState<number>(12);
  const [sellerName, setSellerName] = useState('Carlos Ruiz');
  const [observations, setObservations] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientCI) {
      alert('Por favor completa el nombre y cédula del cliente');
      return;
    }

    const newSaleId = `V-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    const newSale: Sale = {
      id: newSaleId,
      date: formattedDate,
      clientId: `C-${Date.now().toString().slice(-4)}`,
      clientName,
      clientCI,
      clientPhone: clientPhone || '71234567',
      urbanization,
      lot,
      block,
      surface,
      modality,
      amount: Number(amount),
      currency: 'Bs.',
      status: modality === 'Contado' ? 'Concretada' : 'En proceso',
      sellerId: 'S-001',
      sellerName,
      observations: observations || `Venta registrada bajo modalidad ${modality}.`,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
      totalPaid: modality === 'Contado' ? Number(amount) : Number(initialPayment),
      pendingBalance: modality === 'Contado' ? 0 : Math.max(0, Number(amount) - Number(initialPayment)),
    };

    onSaveSale(newSale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-[#072a1b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Registrar Nueva Venta</h2>
              <p className="text-xs text-emerald-200/80">Generación de contrato y asignación de lote</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Cliente */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Datos del Comprador
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Cédula de Identidad (CI) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 1234567 LP"
                  value={clientCI}
                  onChange={(e) => setClientCI(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Teléfono / Celular</label>
                <input
                  type="text"
                  placeholder="Ej. 71234567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>
          </div>

          {/* Inmueble */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Datos del Terreno / Lote
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Urbanización</label>
                <select
                  value={urbanization}
                  onChange={(e) => setUrbanization(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                >
                  {urbanizations.map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Lote</label>
                <input
                  type="text"
                  value={lot}
                  onChange={(e) => setLot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Manzano</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Superficie</label>
                <input
                  type="text"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Condiciones Económicas */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Condiciones de Pago
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Modalidad</label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as PaymentModality)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="Contado">Contado</option>
                  <option value="Crédito">Crédito Directo</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Precio Total (Bs.)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Asesor Responsable</label>
                <select
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Carlos Ruiz">Carlos Ruiz</option>
                  <option value="Ana Morales">Ana Morales</option>
                  <option value="Roberto Gómez">Roberto Gómez</option>
                </select>
              </div>
            </div>

            {modality === 'Crédito' && (
              <div className="grid grid-cols-2 gap-3 mt-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Cuota Inicial (Bs.)</label>
                  <input
                    type="number"
                    value={initialPayment}
                    onChange={(e) => setInitialPayment(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Plazo (meses)</label>
                  <input
                    type="number"
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Observaciones</label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Notas adicionales o requerimientos del cliente..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
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
              <span>Guardar Venta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
