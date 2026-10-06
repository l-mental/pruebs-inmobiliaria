import React, { useState, useEffect } from 'react';
import { X, MapPin, Check, Sparkles, ExternalLink, Compass, Navigation, Layers } from 'lucide-react';
import { Lot, LotStatus, Urbanization, LotLocationType } from '../../types';

interface CrearLoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  urbanizations: Urbanization[];
  currentUrbId: string;
  availableBlocks: string[];
  onSaveLot: (lot: Lot) => void;
}

export const CrearLoteModal: React.FC<CrearLoteModalProps> = ({
  isOpen,
  onClose,
  urbanizations,
  currentUrbId,
  availableBlocks,
  onSaveLot,
}) => {
  const [selectedUrbId, setSelectedUrbId] = useState(currentUrbId);
  const [block, setBlock] = useState(availableBlocks[0] || 'Manzano 1');
  const [isCustomBlock, setIsCustomBlock] = useState(false);
  const [customBlockName, setCustomBlockName] = useState('');
  const [lotNumber, setLotNumber] = useState('Lote ');
  const [surface, setSurface] = useState<number>(300);
  const [front, setFront] = useState<number>(10);
  const [depth, setDepth] = useState<number>(30);
  const [priceBs, setPriceBs] = useState<number>(45000);
  const [priceUsd, setPriceUsd] = useState<number>(6500);
  const [status, setStatus] = useState<LotStatus>('Disponible');
  const [buyerName, setBuyerName] = useState('');
  const [latitude, setLatitude] = useState<string>('-17.400000');
  const [longitude, setLongitude] = useState<string>('-66.150000');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Urban layout / location types
  const [locationType, setLocationType] = useState<LotLocationType>('Avenida Principal');
  const [hasAvenueAccess, setHasAvenueAccess] = useState<boolean>(true);
  const [streetName, setStreetName] = useState<string>('');
  const [cornerStreets, setCornerStreets] = useState<string>('');

  const currentUrb = urbanizations.find(u => u.id === selectedUrbId) || urbanizations[0];

  // Sync default coordinates and street names whenever urbanization changes
  useEffect(() => {
    setSelectedUrbId(currentUrbId);
    const urb = urbanizations.find(u => u.id === currentUrbId);
    if (urb?.latitude && urb?.longitude) {
      const offsetLat = (Math.random() - 0.5) * 0.003;
      const offsetLng = (Math.random() - 0.5) * 0.003;
      setLatitude((urb.latitude + offsetLat).toFixed(6));
      setLongitude((urb.longitude + offsetLng).toFixed(6));
    }
    if (urb?.mainAvenueName) {
      setStreetName(urb.mainAvenueName);
    }
  }, [currentUrbId, urbanizations, isOpen]);

  // Handle location type changes
  const handleLocationTypeChange = (type: LotLocationType) => {
    setLocationType(type);
    if (type === 'Avenida Principal') {
      setHasAvenueAccess(true);
      setStreetName(currentUrb?.mainAvenueName || 'Avenida Principal');
    } else if (type === 'En Esquina') {
      setHasAvenueAccess(true);
      const main = currentUrb?.mainAvenueName || 'Av. Principal';
      const sec = currentUrb?.internalStreets?.[0] || 'Calle 1';
      setCornerStreets(`${main} y ${sec}`);
      setStreetName(main);
    } else if (type === 'En Medio (Calle Interna)') {
      setHasAvenueAccess(false);
      setStreetName(currentUrb?.internalStreets?.[0] || 'Calle Interna');
    } else if (type === 'Sin Salida a Avenida' || type === 'Pasaje') {
      setHasAvenueAccess(false);
      setStreetName('Pasaje Interior (Cul-de-sac / Fondo)');
    }
  };

  if (!isOpen) return null;

  const handlePriceBsChange = (val: number) => {
    setPriceBs(val);
    setPriceUsd(Math.round(val / 6.96));
  };

  const handlePriceUsdChange = (val: number) => {
    setPriceUsd(val);
    setPriceBs(Math.round(val * 6.96));
  };

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
          if (currentUrb?.latitude && currentUrb?.longitude) {
            setLatitude(currentUrb.latitude.toFixed(6));
            setLongitude(currentUrb.longitude.toFixed(6));
          }
        },
        { timeout: 7000 }
      );
    }
  };

  const handleUseUrbCoords = () => {
    if (currentUrb?.latitude && currentUrb?.longitude) {
      const offsetLat = (Math.random() - 0.5) * 0.002;
      const offsetLng = (Math.random() - 0.5) * 0.002;
      setLatitude((currentUrb.latitude + offsetLat).toFixed(6));
      setLongitude((currentUrb.longitude + offsetLng).toFixed(6));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotNumber.trim()) {
      alert('Por favor indica el número o código de lote');
      return;
    }

    const finalBlock = isCustomBlock && customBlockName.trim() ? customBlockName.trim() : block;

    const newLot: Lot = {
      id: `L-${Date.now().toString().slice(-4)}`,
      lotNumber: lotNumber.trim(),
      block: finalBlock || 'Manzano 1',
      urbanizationId: selectedUrbId,
      urbanizationName: currentUrb?.name,
      surface: Number(surface) || 300,
      front: Number(front) || 10,
      depth: Number(depth) || 30,
      priceBs: Number(priceBs) || 45000,
      priceUsd: Number(priceUsd) || 6500,
      status,
      buyerName: status === 'Vendido' || status === 'Reservado' || status === 'En Moratoria' ? buyerName.trim() : undefined,
      latitude: Number(latitude) || -17.4000,
      longitude: Number(longitude) || -66.1500,
      locationType,
      hasAvenueAccess,
      streetName: streetName.trim() || undefined,
      cornerStreets: locationType === 'En Esquina' ? (cornerStreets.trim() || undefined) : undefined,
    };

    onSaveLot(newLot);
    onClose();
  };

  const testMapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#072a1b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Agregar Lote de Terreno</h2>
              <p className="text-xs text-emerald-200/80">
                Condominio: <span className="font-semibold text-white">{currentUrb?.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Condominio y Manzano */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Condominio / Urbanización *</label>
              <select
                value={selectedUrbId}
                onChange={(e) => setSelectedUrbId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              >
                {urbanizations.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.city})</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold">Manzano *</label>
                <button
                  type="button"
                  onClick={() => setIsCustomBlock(!isCustomBlock)}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  {isCustomBlock ? 'Seleccionar existente' : '+ Crear nuevo'}
                </button>
              </div>

              {isCustomBlock ? (
                <input
                  type="text"
                  placeholder="Ej. Manzano 7"
                  value={customBlockName}
                  onChange={(e) => setCustomBlockName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              ) : (
                <select
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  {availableBlocks.filter(b => b !== 'Todos').length > 0 ? (
                    availableBlocks.filter(b => b !== 'Todos').map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))
                  ) : (
                    <option value="Manzano 1">Manzano 1</option>
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Número de lote y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Número de Lote *</label>
              <input
                type="text"
                required
                placeholder="Ej. Lote 21 o Lote 4-B"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Estado del Lote</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LotStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
              >
                <option value="Disponible">Disponible (En venta)</option>
                <option value="Reservado">Reservado</option>
                <option value="Vendido">Vendido</option>
                <option value="En Moratoria">En Moratoria (Mora en cuotas / Por revertir)</option>
              </select>
            </div>
          </div>

          {status !== 'Disponible' && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <label className="block text-slate-700 font-semibold mb-1">
                {status === 'En Moratoria' ? 'Nombre del Titular en Mora' : 'Nombre del Titular / Comprador'}
              </label>
              <input
                type="text"
                placeholder="Ej. Patricia Mendoza"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-slate-800"
              />
            </div>
          )}

          {/* UBICACIÓN URBANÍSTICA Y SALIDA A LA AVENIDA (CRITICAL FOR USER) */}
          <div className="pt-2 border-t border-slate-100 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Navigation className="w-4 h-4 text-emerald-700" />
                <span>Ubicación Vial y Salida a la Avenida</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {hasAvenueAccess ? '🟢 Con salida directa a Avenida' : '🔴 Sin salida directa a Avenida'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleLocationTypeChange('Avenida Principal')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  locationType === 'Avenida Principal'
                    ? 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="block text-xs">🛣️ En Avenida</span>
                <span className="text-[9.5px] opacity-80 block">Frente principal</span>
              </button>

              <button
                type="button"
                onClick={() => handleLocationTypeChange('En Esquina')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  locationType === 'En Esquina'
                    ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="block text-xs">📐 En Esquina</span>
                <span className="text-[9.5px] opacity-80 block">Doble frente</span>
              </button>

              <button
                type="button"
                onClick={() => handleLocationTypeChange('En Medio (Calle Interna)')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  locationType === 'En Medio (Calle Interna)'
                    ? 'bg-blue-100 border-blue-600 text-blue-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="block text-xs">🏘️ Calle Interna</span>
                <span className="text-[9.5px] opacity-80 block">En medio</span>
              </button>

              <button
                type="button"
                onClick={() => handleLocationTypeChange('Sin Salida a Avenida')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  locationType === 'Sin Salida a Avenida' || locationType === 'Pasaje'
                    ? 'bg-orange-100 border-orange-600 text-orange-950 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="block text-xs">🚶 Sin Salida Av.</span>
                <span className="text-[9.5px] opacity-80 block">Pasaje / Cul-de-sac</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nombre de Vía o Avenida al frente
                </label>
                <input
                  type="text"
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  placeholder="Ej. Av. Principal Bicentenario o Calle 2"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800"
                />
              </div>

              {locationType === 'En Esquina' ? (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Calles de la Intersección (Esquina)
                  </label>
                  <input
                    type="text"
                    value={cornerStreets}
                    onChange={(e) => setCornerStreets(e.target.value)}
                    placeholder="Ej. Av. Principal y Calle 1 Los Sauces"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs">
                    <input
                      type="checkbox"
                      checked={hasAvenueAccess}
                      onChange={(e) => setHasAvenueAccess(e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded border-slate-300 cursor-pointer"
                    />
                    <span>¿Tiene salida vehicular directa a la Avenida?</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Medidas: Superficie, Frente, Fondo */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Dimensiones del Lote
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Superficie (m²) *</label>
                <input
                  type="number"
                  required
                  value={surface}
                  onChange={(e) => setSurface(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Frente (metros)</label>
                <input
                  type="number"
                  step="0.1"
                  value={front}
                  onChange={(e) => setFront(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Fondo (metros)</label>
                <input
                  type="number"
                  step="0.1"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Precios Bs y $us */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider mb-2">
              Precios de Venta
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Precio en Bolivianos (Bs.) *</label>
                <input
                  type="number"
                  required
                  value={priceBs}
                  onChange={(e) => handlePriceBsChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-emerald-800"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Precio en Dólares ($us.)</label>
                <input
                  type="number"
                  value={priceUsd}
                  onChange={(e) => handlePriceUsdChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Latitud y Longitud GPS */}
          <div className="pt-2 border-t border-slate-100 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Compass className="w-4 h-4 text-emerald-800" />
                  Geolocalización GPS (Google Maps) *
                </h3>
                <p className="text-[11px] text-slate-500">
                  Coordenadas exactas para ubicar este lote en Google Maps.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUseUrbCoords}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg border border-slate-200 text-[11px] shadow-2xs cursor-pointer"
                >
                  Usar centro del condominio
                </button>
                <button
                  type="button"
                  onClick={handleGetGps}
                  disabled={isDetectingGps}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>{isDetectingGps ? 'Detectando...' : 'Mi GPS actual'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Latitud (Ej. -17.543740) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="-17.543740"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Longitud (Ej. -65.986330) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="-65.986330"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-emerald-200/50">
              <span className="text-[11px] text-slate-600">
                Punto: <span className="font-mono font-bold text-slate-800">{latitude}, {longitude}</span>
              </span>
              <a
                href={testMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline"
              >
                <span>Probar enlace en Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
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
              <span>Guardar Lote</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
