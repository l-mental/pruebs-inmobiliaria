import React, { useState, useEffect } from 'react';
import { X, FilePlus, Check, MapPin, Sparkles, Compass } from 'lucide-react';
import { Sale, Urbanization, PaymentModality, Client, Property } from '../../types';

interface RegistrarVentaModalProps {
  isOpen: boolean;
  onClose: () => void;
  urbanizations: Urbanization[];
  onSaveSale: (sale: Sale) => void;
  clients?: Client[];
  properties?: Property[];
  initialLotData?: { 
    clientName?: string;
    clientCI?: string;
    clientPhone?: string;
    lotNumber: string; 
    urbanizationName: string; 
    priceBs: number; 
    surface: number;
    latitude?: number;
    longitude?: number;
  };
}

export const RegistrarVentaModal: React.FC<RegistrarVentaModalProps> = ({
  isOpen,
  onClose,
  urbanizations,
  onSaveSale,
  clients = [],
  properties = [],
  initialLotData,
}) => {
  const [clientName, setClientName] = useState(initialLotData?.clientName || '');
  const [clientCI, setClientCI] = useState(initialLotData?.clientCI || '');
  const [clientPhone, setClientPhone] = useState(initialLotData?.clientPhone || '');
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
  const [latitude, setLatitude] = useState<string>(initialLotData?.latitude?.toString() || '-17.543740');
  const [longitude, setLongitude] = useState<string>(initialLotData?.longitude?.toString() || '-65.986330');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  useEffect(() => {
    if (initialLotData) {
      if (initialLotData.clientName) setClientName(initialLotData.clientName);
      if (initialLotData.clientCI) setClientCI(initialLotData.clientCI);
      if (initialLotData.clientPhone) setClientPhone(initialLotData.clientPhone);
      if (initialLotData.urbanizationName) setUrbanization(initialLotData.urbanizationName);
      if (initialLotData.lotNumber) setLot(initialLotData.lotNumber);
      if (initialLotData.priceBs) setAmount(initialLotData.priceBs);
      if (initialLotData.surface) setSurface(`${initialLotData.surface} m²`);
      if (initialLotData.latitude) setLatitude(initialLotData.latitude.toString());
      if (initialLotData.longitude) setLongitude(initialLotData.longitude.toString());
    } else {
      const currentU = urbanizations.find(u => u.name === urbanization) || urbanizations[0];
      if (currentU?.latitude && currentU?.longitude) {
        setLatitude(currentU.latitude.toString());
        setLongitude(currentU.longitude.toString());
      }
    }
  }, [initialLotData, isOpen, urbanization, urbanizations]);

  if (!isOpen) return null;

  const handleGetGps = () => {
    if ('geolocation' in navigator) {
      setIsDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          setIsDetectingGps(false);
        },
        () => {
          setIsDetectingGps(false);
          const currentU = urbanizations.find(u => u.name === urbanization) || urbanizations[0];
          if (currentU?.latitude && currentU?.longitude) {
            setLatitude(currentU.latitude.toString());
            setLongitude(currentU.longitude.toString());
          }
        },
        { timeout: 7000 }
      );
    }
  };

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
      latitude: parseFloat(latitude) || -17.543740,
      longitude: parseFloat(longitude) || -65.986330,
    };

    onSaveSale(newSale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#072a1b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Registrar Nueva Venta</h2>
              <p className="text-xs text-emerald-200/80">Generación de contrato, asignación de lote y coordenadas GPS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* AUTOCOMPLETAR DATOS DEL PROPIETARIO / CLIENTE */}
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-950 flex items-center gap-1.5 text-xs">
                <span>⚡ Carga Automática de Datos de Propietario / Cliente:</span>
              </span>
              <span className="text-[10.5px] text-emerald-700 font-bold">
                (Datos sincronizados automáticamente)
              </span>
            </div>

            {clientName && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 font-extrabold text-[11px]">
                <Check className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                <span>Datos cargados en automático para: <strong>{clientName}</strong> {clientCI ? `(CI: ${clientCI})` : ''}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {clients.length > 0 && (
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                    Seleccionar Propietario / Titular Registrado:
                  </label>
                  <select
                    onChange={(e) => {
                      const selected = clients.find(c => c.id === e.target.value);
                      if (selected) {
                        setClientName(selected.name);
                        setClientCI(selected.ci);
                        setClientPhone(selected.phone);
                        if (selected.purchasedLots && selected.purchasedLots.length > 0) {
                          const parts = selected.purchasedLots[0].split(' - ');
                          if (parts[0]) setUrbanization(parts[0]);
                          if (parts[1]) setLot(parts[1]);
                        }
                      }
                    }}
                    defaultValue=""
                    className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-bold text-slate-800 text-xs cursor-pointer"
                  >
                    <option value="" disabled>-- Elegir Propietario para autocompletar --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (CI: {c.ci})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {properties.length > 0 && (
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                    O Cargar desde Propiedad en Venta:
                  </label>
                  <select
                    onChange={(e) => {
                      const selected = properties.find(p => p.id === e.target.value);
                      if (selected) {
                        if (selected.ownerNames && selected.ownerNames.length > 0) {
                          const firstOwner = selected.ownerNames[0];
                          setClientName(firstOwner);
                          const matchingClient = clients.find(c => c.name.toLowerCase() === firstOwner.toLowerCase());
                          if (matchingClient) {
                            setClientCI(matchingClient.ci);
                            setClientPhone(matchingClient.phone);
                          } else {
                            if (selected.ownerCI) setClientCI(selected.ownerCI);
                            if (selected.ownerPhone) setClientPhone(selected.ownerPhone);
                          }
                        }
                        if (selected.urbanizationName) setUrbanization(selected.urbanizationName);
                        if (selected.propertyName || selected.title) setLot(selected.propertyName || selected.title);
                        if (selected.price) {
                          setAmount(selected.currency === '$us.' ? Math.round(selected.price * 6.96) : selected.price);
                        }
                        if (selected.area) setSurface(`${selected.area} m²`);
                      }
                    }}
                    defaultValue=""
                    className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg font-bold text-slate-800 text-xs cursor-pointer"
                  >
                    <option value="" disabled>-- Cargar Propiedad en Venta --</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.propertyName || p.title} ({p.ownerNames?.join(', ') || 'Sin propietario'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Cliente */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Datos del Propietario / Comprador
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
                <label className="block text-slate-600 font-semibold mb-1">Condominio / Urbanización</label>
                <select
                  value={urbanization}
                  onChange={(e) => {
                    setUrbanization(e.target.value);
                    const found = urbanizations.find(u => u.name === e.target.value);
                    if (found?.latitude && found?.longitude) {
                      setLatitude(found.latitude.toString());
                      setLongitude(found.longitude.toString());
                    }
                  }}
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Manzano</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
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

          {/* Coordenadas GPS (Latitud y Longitud) */}
          <div className="pt-2 border-t border-slate-100 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-700" />
                Coordenadas de Ubicación en el Plano del Sistema
              </h3>
              <button
                type="button"
                onClick={handleGetGps}
                disabled={isDetectingGps}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isDetectingGps ? 'Detectando...' : 'Detectar GPS actual'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Latitud</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="-17.543740"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Longitud</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-65.986330"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900"
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
