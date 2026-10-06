import React, { useState } from 'react';
import { X, Building2, Check, MapPin, Sparkles, Navigation, Layers, Compass, HelpCircle } from 'lucide-react';
import { Urbanization, Lot, LotLocationType } from '../../types';

interface CrearCondominioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUrbanization: (urb: Urbanization, generatedLots?: Lot[]) => void;
}

const PRESET_URB_IMAGES = [
  { label: 'Valle Verde', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80' },
  { label: 'Colinas & Pinos', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pradera Abierta', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Vista Panorámica', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Parque Campestre', url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80' },
];

const COMMON_AMENITIES = [
  'Agua potable',
  'Luz eléctrica',
  'Alcantarillado',
  'Vías pavimentadas / enripiadas',
  'Seguridad perimetral 24/7',
  'Parque infantil',
  'Club House',
  'Canchas polifuncionales',
  'Ciclovía',
  'Gas domiciliario'
];

export const CrearCondominioModal: React.FC<CrearCondominioModalProps> = ({
  isOpen,
  onClose,
  onSaveUrbanization,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Cochabamba');
  const [pricePerM2, setPricePerM2] = useState<number>(130);
  const [latitude, setLatitude] = useState<string>('-17.393500');
  const [longitude, setLongitude] = useState<string>('-66.157000');
  const [description, setDescription] = useState('');

  // Road network & Urban design configuration
  const [mainAvenueName, setMainAvenueName] = useState('Av. Principal Las Palmeras (25m de calzada)');
  const [internalStreetsInput, setInternalStreetsInput] = useState('Calle Los Álamos, Calle Los Pinos, Pasaje 1 (Interior)');
  
  // Auto-generate lots distribution
  const [autoGenerateLots, setAutoGenerateLots] = useState(true);
  const [avenueLotsCount, setAvenueLotsCount] = useState<number>(4);
  const [cornerLotsCount, setCornerLotsCount] = useState<number>(4);
  const [internalLotsCount, setInternalLotsCount] = useState<number>(6);
  const [noExitLotsCount, setNoExitLotsCount] = useState<number>(4);
  const [typicalSurface, setTypicalSurface] = useState<number>(300);

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Agua potable',
    'Luz eléctrica',
    'Vías pavimentadas / enripiadas',
    'Seguridad perimetral 24/7'
  ]);
  const [image, setImage] = useState(PRESET_URB_IMAGES[0].url);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  if (!isOpen) return null;

  const totalAutoLots = autoGenerateLots 
    ? (Number(avenueLotsCount) || 0) + (Number(cornerLotsCount) || 0) + (Number(internalLotsCount) || 0) + (Number(noExitLotsCount) || 0)
    : 0;

  const toggleAmenity = (item: string) => {
    setSelectedAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          setIsGettingLocation(false);
        },
        () => {
          setIsGettingLocation(false);
          setLatitude('-17.393520');
          setLongitude('-66.157010');
        },
        { timeout: 8000 }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      alert('Por favor completa el nombre y la ubicación del condominio / urbanización');
      return;
    }

    const urbId = `URB-${Date.now().toString().slice(-4)}`;
    const parsedLat = Number(latitude) || -17.3935;
    const parsedLng = Number(longitude) || -66.157;
    const baseM2 = Number(pricePerM2) || 120;

    const streetsList = internalStreetsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const generatedLots: Lot[] = [];

    if (autoGenerateLots && totalAutoLots > 0) {
      let lotIndex = 1;
      const baseSurface = Number(typicalSurface) || 300;

      // 1. Lotes en Avenida Principal
      for (let i = 0; i < avenueLotsCount; i++) {
        const surf = baseSurface;
        // Plusvalía comercial en avenida: +15%
        const priceBs = Math.round(surf * baseM2 * 1.15);
        const priceUsd = Math.round(priceBs / 6.96);
        const offsetLat = 0.0003 * (i + 1);
        const offsetLng = 0.00015 * (i + 1);

        generatedLots.push({
          id: `L-${urbId}-${lotIndex}`,
          lotNumber: `Lote ${lotIndex}`,
          block: 'Manzano 1 (Frente a Av.)',
          urbanizationId: urbId,
          urbanizationName: name.trim(),
          surface: surf,
          front: 10,
          depth: Math.round(surf / 10),
          priceBs,
          priceUsd,
          status: 'Disponible',
          locationType: 'Avenida Principal',
          hasAvenueAccess: true,
          streetName: mainAvenueName.trim() || 'Avenida Principal',
          latitude: parsedLat + offsetLat,
          longitude: parsedLng + offsetLng,
        });
        lotIndex++;
      }

      // 2. Lotes en Esquina
      for (let i = 0; i < cornerLotsCount; i++) {
        const surf = baseSurface + 20; // Corners slightly larger
        // Plusvalía por doble frente: +10%
        const priceBs = Math.round(surf * baseM2 * 1.10);
        const priceUsd = Math.round(priceBs / 6.96);
        const offsetLat = -0.0003 * (i + 1);
        const offsetLng = 0.00025 * (i + 1);
        const secStreet = streetsList[i % streetsList.length] || `Calle ${i + 1}`;

        generatedLots.push({
          id: `L-${urbId}-${lotIndex}`,
          lotNumber: `Lote ${lotIndex}`,
          block: i < 2 ? 'Manzano 1 (Frente a Av.)' : 'Manzano 2',
          urbanizationId: urbId,
          urbanizationName: name.trim(),
          surface: surf,
          front: 12,
          depth: Math.round(surf / 12),
          priceBs,
          priceUsd,
          status: 'Disponible',
          locationType: 'En Esquina',
          hasAvenueAccess: i < 2, // First corners face the avenue too
          streetName: i < 2 ? mainAvenueName.trim() || 'Avenida Principal' : secStreet,
          cornerStreets: `${mainAvenueName.trim() || 'Av. Principal'} y ${secStreet}`,
          latitude: parsedLat + offsetLat,
          longitude: parsedLng + offsetLng,
        });
        lotIndex++;
      }

      // 3. Lotes en Medio (Calle Interna)
      for (let i = 0; i < internalLotsCount; i++) {
        const surf = baseSurface;
        const priceBs = Math.round(surf * baseM2);
        const priceUsd = Math.round(priceBs / 6.96);
        const offsetLat = -0.0005 - 0.0002 * i;
        const offsetLng = -0.0002 * i;
        const street = streetsList[i % streetsList.length] || 'Calle Interna';

        generatedLots.push({
          id: `L-${urbId}-${lotIndex}`,
          lotNumber: `Lote ${lotIndex}`,
          block: 'Manzano 2 (Interno)',
          urbanizationId: urbId,
          urbanizationName: name.trim(),
          surface: surf,
          front: 10,
          depth: Math.round(surf / 10),
          priceBs,
          priceUsd,
          status: 'Disponible',
          locationType: 'En Medio (Calle Interna)',
          hasAvenueAccess: false,
          streetName: street,
          latitude: parsedLat + offsetLat,
          longitude: parsedLng + offsetLng,
        });
        lotIndex++;
      }

      // 4. Lotes Sin Salida a la Avenida (Pasaje Interior)
      for (let i = 0; i < noExitLotsCount; i++) {
        const surf = baseSurface;
        // Precio accesible por ser pasaje interior: -5%
        const priceBs = Math.round(surf * baseM2 * 0.95);
        const priceUsd = Math.round(priceBs / 6.96);
        const offsetLat = -0.0008 - 0.00015 * i;
        const offsetLng = 0.0003 + 0.0002 * i;

        generatedLots.push({
          id: `L-${urbId}-${lotIndex}`,
          lotNumber: `Lote ${lotIndex}`,
          block: 'Manzano 3 (Pasaje Interior)',
          urbanizationId: urbId,
          urbanizationName: name.trim(),
          surface: surf,
          front: 10,
          depth: Math.round(surf / 10),
          priceBs,
          priceUsd,
          status: 'Disponible',
          locationType: 'Sin Salida a Avenida',
          hasAvenueAccess: false,
          streetName: 'Pasaje Peatonal / Cul-de-sac (Fondo)',
          latitude: parsedLat + offsetLat,
          longitude: parsedLng + offsetLng,
        });
        lotIndex++;
      }
    }

    const newUrb: Urbanization = {
      id: urbId,
      name: name.trim(),
      location: location.trim(),
      city: city.trim() || 'Cochabamba',
      totalLots: generatedLots.length,
      soldLots: 0,
      availableLots: generatedLots.length,
      image: image || PRESET_URB_IMAGES[0].url,
      pricePerM2: baseM2,
      amenities: selectedAmenities,
      description: description.trim() || `Exclusivo condominio campestre ${name} ubicado en ${location}. Con alta plusvalía y diseño vial planificado sobre ${mainAvenueName}.`,
      latitude: parsedLat,
      longitude: parsedLng,
      mainAvenueName: mainAvenueName.trim() || 'Avenida Principal',
      internalStreets: streetsList,
      avenueLotsCount: avenueLotsCount,
      cornerLotsCount: cornerLotsCount,
    };

    onSaveUrbanization(newUrb, generatedLots);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#072a1b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Crear Nuevo Condominio / Urbanización</h2>
              <p className="text-xs text-emerald-200/80">
                Registra la urbanización y define su red vial (Avenida principal, esquinas, calles internas y pasajes)
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
          {/* Nombre y Precio m² */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Nombre de la Urbanización / Condominio *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Condominio Campestre Los Ceibos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-bold text-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Precio ref. por m² (Bs.) *
              </label>
              <input
                type="number"
                value={pricePerM2}
                onChange={(e) => setPricePerM2(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800"
              />
            </div>
          </div>

          {/* Ubicación y Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Ubicación / Dirección *</label>
              <input
                type="text"
                required
                placeholder="Ej. Sacaba - Curva San Lorenzo, Km 10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ciudad / Municipio</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          {/* DISEÑO VIAL Y TRAZADO URBANÍSTICO (CRITICAL FOR USER) */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-800" />
                <h3 className="font-extrabold text-emerald-950 text-xs uppercase tracking-wide">
                  Diseño Vial y Trazado de Avenida
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                Planificación Urbana
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  🛣️ Nombre de la Avenida Principal *
                </label>
                <input
                  type="text"
                  required
                  value={mainAvenueName}
                  onChange={(e) => setMainAvenueName(e.target.value)}
                  placeholder="Ej. Av. Bicentenario (25m de ancho con camellón)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Vía troncal de alto tránsito y plusvalía comercial/residencial.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  🏘️ Calles Secundarias e Internas
                </label>
                <input
                  type="text"
                  value={internalStreetsInput}
                  onChange={(e) => setInternalStreetsInput(e.target.value)}
                  placeholder="Ej. Calle 1, Calle 2, Pasaje Los Pinos"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Vías transversales internas separadas por comas.
                </p>
              </div>
            </div>

            {/* Generador de Lotes con Distribución Vial */}
            <div className="pt-2 border-t border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={autoGenerateLots}
                    onChange={(e) => setAutoGenerateLots(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                  />
                  <span>Generar loteamiento inicial con distribución vial automática</span>
                </label>
                {autoGenerateLots && (
                  <span className="text-xs font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                    Total: {totalAutoLots} lotes listos
                  </span>
                )}
              </div>

              {autoGenerateLots && (
                <div className="space-y-3 p-3 bg-white rounded-xl border border-emerald-200 text-xs">
                  <p className="text-[11px] text-slate-600 font-medium">
                    Configura la cantidad de lotes según su ubicación respecto a la avenida:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* 1. Lotes en Avenida */}
                    <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70">
                      <div className="flex items-center gap-1 font-bold text-emerald-900 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>En Avenida</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={avenueLotsCount}
                        onChange={(e) => setAvenueLotsCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-white border border-emerald-300 rounded-lg font-black text-emerald-950 text-center text-sm"
                      />
                      <span className="text-[9.5px] text-emerald-700 block mt-1 text-center font-medium">
                        Frente a Avenida (+15% plusvalía)
                      </span>
                    </div>

                    {/* 2. Lotes en Esquina */}
                    <div className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/70">
                      <div className="flex items-center gap-1 font-bold text-amber-900 mb-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <span>En Esquina</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={cornerLotsCount}
                        onChange={(e) => setCornerLotsCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-white border border-amber-300 rounded-lg font-black text-amber-950 text-center text-sm"
                      />
                      <span className="text-[9.5px] text-amber-800 block mt-1 text-center font-medium">
                        Doble frente (+10% plusvalía)
                      </span>
                    </div>

                    {/* 3. Lotes en Medio (Calle Interna) */}
                    <div className="p-2.5 rounded-xl border border-slate-300 bg-slate-50">
                      <div className="flex items-center gap-1 font-bold text-slate-800 mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>Calle Interna</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="40"
                        value={internalLotsCount}
                        onChange={(e) => setInternalLotsCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg font-black text-slate-900 text-center text-sm"
                      />
                      <span className="text-[9.5px] text-slate-600 block mt-1 text-center font-medium">
                        En medio de manzano
                      </span>
                    </div>

                    {/* 4. Lotes Sin Salida a la Avenida (Pasaje) */}
                    <div className="p-2.5 rounded-xl border border-orange-200 bg-orange-50/60">
                      <div className="flex items-center gap-1 font-bold text-orange-900 mb-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span>Sin Salida Av.</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={noExitLotsCount}
                        onChange={(e) => setNoExitLotsCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1 bg-white border border-orange-300 rounded-lg font-black text-orange-950 text-center text-sm"
                      />
                      <span className="text-[9.5px] text-orange-800 block mt-1 text-center font-medium">
                        Pasaje / Fondo de manzana
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-emerald-700" />
                      Superficie estándar:
                      <input
                        type="number"
                        value={typicalSurface}
                        onChange={(e) => setTypicalSurface(Number(e.target.value))}
                        className="w-16 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 text-center ml-1"
                      /> m²
                    </span>
                    <span>Los lotes se ubicarán geográficamente cerca de las coordenadas del condominio</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Latitud y Longitud de Referencia */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Coordenadas de Referencia de la Urbanización
              </h3>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-emerald-200 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isGettingLocation ? 'Detectando GPS...' : 'Obtener GPS actual'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Latitud</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="-17.393500"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Longitud</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-66.157000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Amenidades */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-semibold mb-1.5">Servicios y Amenidades</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COMMON_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{amenity}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Galería Preset */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-semibold mb-1.5">Imagen de Presentación</label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {PRESET_URB_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImage(img.url)}
                  className={`relative rounded-xl overflow-hidden border-2 h-14 transition-all ${
                    image === img.url ? 'border-emerald-700 ring-2 ring-emerald-500/40' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8.5px] py-0.5 text-center truncate px-0.5">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="O escribe una URL directa para la foto..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs"
            />
          </div>

          {/* Descripción */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-semibold mb-1">Descripción de la Urbanización</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre vías de acceso, ventajas, financiamiento..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-slate-800"
            />
          </div>

          {/* Botones */}
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
              className="px-5 py-2.5 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Guardar Urbanización {autoGenerateLots ? `y ${totalAutoLots} Lotes` : ''}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
