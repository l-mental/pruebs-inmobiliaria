import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Tag, 
  MapPin, 
  Coins, 
  Building2, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Home, 
  Maximize2, 
  ArrowLeftRight, 
  ArrowUpDown
} from 'lucide-react';
import { Urbanization, Lot, LotStatus } from '../../types';

interface CrearCondominioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveUrbanization: (urb: Urbanization, generatedLots?: Lot[]) => void;
}

export interface ManzanoConfig {
  id: string;
  name: string;
  lotsCount: number;
}

export interface LotDetail {
  id: string;
  lotNumber: string;
  blockName: string;
  area: number;
  front: number;
  depth: number;
  status: LotStatus;
  priceBs?: number;
  priceUsd?: number;
}

export const CrearCondominioModal: React.FC<CrearCondominioModalProps> = ({
  isOpen,
  onClose,
  onSaveUrbanization,
}) => {
  // INFORMACIÓN BÁSICA (Matching Screenshot)
  const [name, setName] = useState('Los Ceibos');
  const [location, setLocation] = useState('Sacaba');
  const [priceM2, setPriceM2] = useState<number>(130);
  const [city, setCity] = useState('Cochabamba');

  // CONFIGURACIÓN DE ESTRUCTURA FLEXIBLE (SELECTOR DE MANZANOS)
  const [manzanosCount, setManzanosCount] = useState<number>(30);

  // Table of manzanos (defaulting to 30 manzanos, sum = 600 lots to match screenshot)
  const [manzanosList, setManzanosList] = useState<ManzanoConfig[]>(() => {
    const list: ManzanoConfig[] = [];
    for (let i = 1; i <= 30; i++) {
      let lots = 20;
      if (i === 1) lots = 10;
      else if (i === 2) lots = 15;
      else if (i === 3) lots = 12;
      else if (i === 4) lots = 18;
      else if (i === 5) lots = 25;
      else if (i === 30) lots = 20;
      else {
        lots = (i % 3 === 0) ? 22 : (i % 2 === 0) ? 20 : 18;
      }
      list.push({ id: `mza-${i}`, name: `MZA ${i}`, lotsCount: lots });
    }
    const sum = list.reduce((acc, m) => acc + m.lotsCount, 0);
    const diff = 600 - sum;
    if (diff !== 0 && list.length > 0) {
      list[list.length - 1].lotsCount = Math.max(1, list[list.length - 1].lotsCount + diff);
    }
    return list;
  });

  const handleManzanosCountChange = (newCount: number) => {
    const validCount = Math.max(1, Math.min(100, newCount));
    setManzanosCount(validCount);
    setManzanosList(prev => {
      const nextList: ManzanoConfig[] = [];
      for (let i = 1; i <= validCount; i++) {
        const existing = prev.find(m => m.name === `MZA ${i}`);
        if (existing) {
          nextList.push(existing);
        } else {
          nextList.push({ id: `mza-${i}`, name: `MZA ${i}`, lotsCount: 20 });
        }
      }
      return nextList;
    });
  };

  const handleUpdateLotCountForManzano = (mzaIndex: number, newLots: number) => {
    const validLots = Math.max(1, Math.min(60, newLots));
    setManzanosList(prev => prev.map((m, idx) => idx === mzaIndex ? { ...m, lotsCount: validLots } : m));
  };

  // Total Lotes Asignados (Calculado: Suma de Lotes)
  const totalLotesAsignados = useMemo(() => {
    return manzanosList.reduce((acc, m) => acc + m.lotsCount, 0);
  }, [manzanosList]);

  // VISUALIZACIÓN DE MANZANEO
  const [viewTab, setViewTab] = useState<'detalle' | 'general'>('detalle');
  const [currentMzaIndex, setCurrentMzaIndex] = useState<number>(0);
  const activeManzano = manzanosList[currentMzaIndex] || manzanosList[0] || { id: 'mza-1', name: 'MZA 1', lotsCount: 10 };

  // Individual Lots State Map
  const [lotDetailsMap, setLotDetailsMap] = useState<Record<string, LotDetail>>({});

  const getLotDetail = (blockName: string, lotNum: number): LotDetail => {
    const key = `${blockName}_Lote_${lotNum}`;
    if (lotDetailsMap[key]) {
      return lotDetailsMap[key];
    }
    return {
      id: key,
      lotNumber: `${lotNum}`,
      blockName: blockName,
      area: 200.0,
      front: 5.0,
      depth: 40.0,
      status: 'Disponible',
      priceBs: Math.round(200 * priceM2 * 6.96),
      priceUsd: Math.round(200 * priceM2),
    };
  };

  // Selected Lot in Detalle Individual
  const [selectedLotNum, setSelectedLotNum] = useState<number>(1);
  const currentLotDetail = useMemo(() => {
    return getLotDetail(activeManzano.name, selectedLotNum);
  }, [activeManzano.name, selectedLotNum, lotDetailsMap, priceM2]);

  // Form Inputs for Selected Lot (matching Image 2)
  const [editArea, setEditArea] = useState<number>(currentLotDetail.area);
  const [editFront, setEditFront] = useState<number>(currentLotDetail.front);
  const [editDepth, setEditDepth] = useState<number>(currentLotDetail.depth);
  const [editStatus, setEditStatus] = useState<LotStatus>(currentLotDetail.status);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  useEffect(() => {
    const detail = getLotDetail(activeManzano.name, selectedLotNum);
    setEditArea(detail.area);
    setEditFront(detail.front);
    setEditDepth(detail.depth);
    setEditStatus(detail.status);
  }, [selectedLotNum, activeManzano.name]);

  const handleSaveLotDetails = () => {
    const key = `${activeManzano.name}_Lote_${selectedLotNum}`;
    const updated: LotDetail = {
      id: key,
      lotNumber: `${selectedLotNum}`,
      blockName: activeManzano.name,
      area: Number(editArea) || 200,
      front: Number(editFront) || 5,
      depth: Number(editDepth) || 40,
      status: editStatus,
      priceBs: Math.round((Number(editArea) || 200) * priceM2 * 6.96),
      priceUsd: Math.round((Number(editArea) || 200) * priceM2),
    };

    setLotDetailsMap(prev => ({
      ...prev,
      [key]: updated,
    }));

    setSaveToast(`Detalles guardados para LOTE ${selectedLotNum} (${activeManzano.name})`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handlePrevMza = () => {
    setCurrentMzaIndex(prev => (prev > 0 ? prev - 1 : manzanosList.length - 1));
    setSelectedLotNum(1);
  };

  const handleNextMza = () => {
    setCurrentMzaIndex(prev => (prev < manzanosList.length - 1 ? prev + 1 : 0));
    setSelectedLotNum(1);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || !location.trim()) {
      alert('Por favor completa el nombre y la ubicación de la urbanización');
      return;
    }

    const urbId = `URB-${Date.now().toString().slice(-4)}`;
    const parsedPriceM2 = Number(priceM2) || 130;

    const newUrbanization: Urbanization = {
      id: urbId,
      name: name.trim(),
      city: city.trim() || 'Cochabamba',
      location: location.trim(),
      totalLots: totalLotesAsignados,
      availableLots: totalLotesAsignados,
      soldLots: 0,
      reservedLots: 0,
      pricePerM2: parsedPriceM2,
      basePricePerM2: parsedPriceM2,
      latitude: -17.3935,
      longitude: -66.1570,
      description: `Urbanización ${name.trim()} ubicada en ${location.trim()}, ${city.trim()}. Con ${manzanosList.length} manzanos y ${totalLotesAsignados} lotes asignados.`,
      amenities: ['Agua Potable', 'Energía Eléctrica', 'Vías Pavimentadas', 'Áreas Verdes'],
      features: ['Agua Potable', 'Energía Eléctrica', 'Vías Pavimentadas', 'Áreas Verdes'],
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      ],
      manzanosCount: manzanosList.length,
    };

    // Generate all lots for all manzanos according to flexible allocation
    const allGeneratedLots: Lot[] = [];

    manzanosList.forEach((mza, mzaIdx) => {
      for (let l = 1; l <= mza.lotsCount; l++) {
        const detail = getLotDetail(mza.name, l);
        const surf = detail.area;
        const priceBs = Math.round(surf * parsedPriceM2 * 6.96);
        const priceUsd = Math.round(surf * parsedPriceM2);

        const offsetLat = (mzaIdx * 0.00035) + (l * 0.00004);
        const offsetLng = (mzaIdx * 0.0002) + ((l % 5) * 0.00008);

        allGeneratedLots.push({
          id: `L-${urbId}-${mza.name.replace(/\s+/g, '')}-${l}`,
          lotNumber: `${l}`,
          block: mza.name,
          urbanizationId: urbId,
          urbanizationName: name.trim(),
          surface: surf,
          front: detail.front,
          depth: detail.depth,
          priceBs: detail.priceBs || priceBs,
          priceUsd: detail.priceUsd || priceUsd,
          status: detail.status,
          latitude: -17.3935 + offsetLat,
          longitude: -66.1570 + offsetLng,
          cadastralCode: `CAT-${mza.name.replace(/\s+/g, '')}-${String(l).padStart(3, '0')}`,
          zone: 'Residencial',
          observations: `Lote ${l} del ${mza.name}. Frente ${detail.front}m, Fondo ${detail.depth}m.`,
        });
      }
    });

    onSaveUrbanization(newUrbanization, allGeneratedLots);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Modal Window Container */}
      <div className="relative w-full max-w-5xl bg-[#ece7de] rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-[#dcd6ca] overflow-hidden my-auto text-slate-800 max-h-[96vh] flex flex-col">
        
        {/* Top Window Bar (macOS style dots + responsive centered green badge) */}
        <div className="relative flex items-center justify-between px-3 sm:px-5 pt-2.5 sm:pt-3 pb-2 select-none border-b border-[#dad2c3]/60 bg-[#e4ded3] shrink-0">
          {/* macOS 3 dots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onClose} 
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer hover:opacity-80 transition-opacity" 
              title="Cerrar" 
            />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-default" />
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-default" />
          </div>

          {/* Centered Green Badge: NUEVA URBANIZACIÓN */}
          <div className="flex items-center gap-2 sm:gap-3 bg-[#4d8f68] text-white px-3 sm:px-6 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-xs border border-[#3e7855]">
            <div className="p-0.5 sm:p-1 bg-white/20 rounded-md sm:rounded-lg">
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-lg md:text-xl font-black tracking-wider uppercase drop-shadow-xs">
              NUEVA URBANIZACIÓN
            </span>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-300/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body (2 Columns with inner scroll) */}
        <div className="p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 overflow-y-auto">
          
          {/* LEFT COLUMN: Información Básica + Configuración de Estructura Flexible */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* 1. INFORMACIÓN BÁSICA Card */}
            <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-[#dad2c3]">
              <h3 className="text-center font-black text-slate-800 text-sm tracking-wide mb-3">
                INFORMACIÓN BÁSICA
              </h3>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* Nombre */}
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 shrink-0">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-slate-500 leading-tight">Nombre:</div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Los Ceibos"
                      className="w-full font-black text-slate-900 text-base leading-tight bg-transparent focus:outline-none focus:bg-amber-50/50 rounded px-1 -mx-1"
                    />
                  </div>
                </div>

                {/* Ubicación */}
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-slate-500 leading-tight">Ubicación:</div>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ej. Sacaba"
                      className="w-full font-black text-slate-900 text-base leading-tight bg-transparent focus:outline-none focus:bg-rose-50/50 rounded px-1 -mx-1"
                    />
                  </div>
                </div>

                {/* Precio ref./m² */}
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-xl text-amber-900 shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-slate-500 leading-tight">Precio ref./m²:</div>
                    <input
                      type="number"
                      value={priceM2}
                      onChange={(e) => setPriceM2(Number(e.target.value) || 0)}
                      className="w-full font-black text-slate-900 text-base leading-tight bg-transparent focus:outline-none focus:bg-amber-50/50 rounded px-1 -mx-1"
                    />
                  </div>
                </div>

                {/* Ciudad */}
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-50 border border-sky-200/80 rounded-xl text-sky-800 shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-medium text-slate-500 leading-tight">Ciudad:</div>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Cochabamba"
                      className="w-full font-black text-slate-900 text-base leading-tight bg-transparent focus:outline-none focus:bg-sky-50/50 rounded px-1 -mx-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. CONFIGURACIÓN DE ESTRUCTURA FLEXIBLE Card */}
            <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-[#dad2c3]">
              <h3 className="text-center font-black text-slate-800 text-xs tracking-wide uppercase mb-3">
                CONFIGURACIÓN DE ESTRUCTURA FLEXIBLE
              </h3>

              <div className="grid grid-cols-2 gap-3 items-start">
                {/* Left side: Selector de Manzanos */}
                <div className="flex flex-col gap-2">
                  <div className="bg-[#f2efe9] rounded-xl p-2.5 border border-[#dfd9cd]">
                    <div className="text-[11px] font-black text-slate-700 uppercase mb-1.5 leading-tight">
                      SELECTOR DE MANZANOS
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={manzanosCount}
                        onChange={(e) => handleManzanosCountChange(parseInt(e.target.value) || 1)}
                        className="w-16 font-black text-center text-lg bg-white border border-slate-300 rounded-lg py-1 shadow-inner text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4d8f68]"
                      />
                      <div className="text-[11px] font-bold text-slate-700 leading-tight flex-1">
                        Seleccionar Manzanos<br />
                        <span className="text-slate-500 font-semibold">(1-{manzanosCount})</span>
                      </div>
                      <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  </div>

                  <div className="text-center text-[11px] font-black tracking-tight text-slate-700 uppercase mt-2 px-1">
                    TABLA DE ASIGNACIÓN DE LOTES POR MANZANO
                  </div>
                </div>

                {/* Right side: Table of Manzano & Lotes */}
                <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                  <div className="grid grid-cols-2 bg-[#f0eee9] text-[11px] font-black text-slate-700 py-1.5 px-3 border-b border-slate-300">
                    <span className="text-left">Manzano</span>
                    <span className="text-right">Lotes</span>
                  </div>
                  
                  {/* Scrollable list */}
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {manzanosList.map((mza, idx) => (
                      <div 
                        key={mza.id}
                        onClick={() => {
                          setCurrentMzaIndex(idx);
                          setSelectedLotNum(1);
                        }}
                        className={`grid grid-cols-2 items-center py-1 px-3 cursor-pointer transition-colors ${
                          idx === currentMzaIndex ? 'bg-amber-50 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-slate-700 font-medium">{mza.name}</span>
                        <div className="flex justify-end">
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={mza.lotsCount}
                            onChange={(e) => handleUpdateLotCountForManzano(idx, parseInt(e.target.value) || 1)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-14 text-right bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#4d8f68] rounded px-1 py-0.5 text-xs font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TOTAL LOTES ASIGNADOS Card */}
            <div className="bg-[#cddca8] border-2 border-[#b0c482] rounded-2xl p-3.5 text-center shadow-xs">
              <div className="text-xs font-black tracking-wider text-slate-800 uppercase">
                TOTAL LOTES ASIGNADOS:
              </div>
              <div className="text-5xl font-black text-[#2e573a] tracking-tight my-0.5">
                {totalLotesAsignados}
              </div>
              <div className="text-[11px] font-semibold text-slate-700 italic">
                (Calculado: Suma de Lotes)
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Visualización de Manzaneo + Detalle Individual */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            
            {/* Header + View Switcher Bar */}
            <div>
              <div className="text-center font-black text-slate-800 text-sm tracking-wide uppercase mb-2">
                VISUALIZACIÓN DE MANZANEO
              </div>

              {/* Tabs & Selector bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewTab('general')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      viewTab === 'general'
                        ? 'bg-white border-amber-600 text-slate-900 shadow-xs ring-2 ring-amber-500/30'
                        : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white'
                    }`}
                  >
                    [Vista General ({manzanosList.length} MZA)]
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewTab('detalle')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      viewTab === 'detalle'
                        ? 'bg-white border-red-600 text-slate-900 shadow-xs ring-2 ring-red-500/50'
                        : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white'
                    }`}
                  >
                    [Detalle Individual]
                  </button>
                </div>

                {/* Dropdown Ver MZA */}
                <div className="flex items-center gap-1">
                  <select
                    value={currentMzaIndex}
                    onChange={(e) => {
                      setCurrentMzaIndex(Number(e.target.value));
                      setSelectedLotNum(1);
                    }}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d8f68]"
                  >
                    {manzanosList.map((mza, idx) => (
                      <option key={mza.id} value={idx}>
                        Ver {mza.name} ({mza.lotsCount} lotes)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Navigation Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <button
                  type="button"
                  onClick={handlePrevMza}
                  className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior MZA</span>
                </button>

                <div className="text-sm font-black text-slate-900 tracking-wide uppercase">
                  {activeManzano.name} - {activeManzano.lotsCount} LOTES
                </div>

                <button
                  type="button"
                  onClick={handleNextMza}
                  className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Siguiente MZA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CADASTRAL BLOCK VISUALIZER (Sage / Olive Green Rounded Rectangle) */}
              {viewTab === 'general' ? (
                /* Vista General: Grid of all Manzanos */
                <div className="bg-[#dfd8cc] rounded-2xl p-3 border-2 border-[#b8ae9c] max-h-56 overflow-y-auto">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {manzanosList.map((mza, idx) => (
                      <div
                        key={mza.id}
                        onClick={() => {
                          setCurrentMzaIndex(idx);
                          setViewTab('detalle');
                          setSelectedLotNum(1);
                        }}
                        className={`p-2 rounded-xl text-center cursor-pointer transition-transform hover:scale-105 border ${
                          idx === currentMzaIndex
                            ? 'bg-[#c2d287] border-[#4a5823] shadow-md ring-2 ring-[#4a5823]'
                            : 'bg-white/90 border-slate-300 hover:bg-[#e4ebc5]'
                        }`}
                      >
                        <div className="font-black text-xs text-slate-800">{mza.name}</div>
                        <div className="text-[10px] font-semibold text-slate-600">{mza.lotsCount} lotes</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Detalle Individual: Exact Cadastral Block matching Image 1 & Image 2 */
                <div className="relative bg-[#c2d287] rounded-3xl p-3 sm:p-4 border-4 border-[#4a5823] shadow-inner">
                  {/* Dynamic parcel layout matching Cadastral Plan */}
                  <div className="w-full flex flex-col gap-1.5 select-none">
                    {/* Top Row */}
                    <div className="grid grid-flow-col auto-cols-fr gap-1.5 min-h-[64px]">
                      {Array.from({ length: Math.ceil(activeManzano.lotsCount / 2) }).map((_, i) => {
                        const lotNum = i + 1;
                        const isSelected = selectedLotNum === lotNum;
                        const detail = getLotDetail(activeManzano.name, lotNum);
                        const isSold = detail.status === 'Vendido';
                        const isReserved = detail.status === 'Reservado';

                        return (
                          <div
                            key={lotNum}
                            onClick={() => setSelectedLotNum(lotNum)}
                            className={`relative flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all border-2 ${
                              isSelected
                                ? 'bg-[#b0c473] border-[#384518] shadow-md ring-3 ring-[#384518]/40 scale-[1.02]'
                                : isSold
                                ? 'bg-[#d8a892] border-[#8a4b36] opacity-90'
                                : isReserved
                                ? 'bg-[#edd88e] border-[#9a8028]'
                                : 'bg-[#c2d287] border-[#4a5823]/80 hover:bg-[#b8c97b]'
                            }`}
                          >
                            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                              {lotNum}
                            </span>
                            {/* Checkmark badge when selected (Image 2) */}
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#384518] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Row */}
                    <div className="grid grid-flow-col auto-cols-fr gap-1.5 min-h-[64px]">
                      {Array.from({ length: Math.floor(activeManzano.lotsCount / 2) }).map((_, i) => {
                        const lotNum = Math.ceil(activeManzano.lotsCount / 2) + i + 1;
                        const isSelected = selectedLotNum === lotNum;
                        const detail = getLotDetail(activeManzano.name, lotNum);
                        const isSold = detail.status === 'Vendido';
                        const isReserved = detail.status === 'Reservado';

                        return (
                          <div
                            key={lotNum}
                            onClick={() => setSelectedLotNum(lotNum)}
                            className={`relative flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all border-2 ${
                              isSelected
                                ? 'bg-[#b0c473] border-[#384518] shadow-md ring-3 ring-[#384518]/40 scale-[1.02]'
                                : isSold
                                ? 'bg-[#d8a892] border-[#8a4b36] opacity-90'
                                : isReserved
                                ? 'bg-[#edd88e] border-[#9a8028]'
                                : 'bg-[#c2d287] border-[#4a5823]/80 hover:bg-[#b8c97b]'
                            }`}
                          >
                            <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                              {lotNum}
                            </span>
                            {/* Checkmark badge when selected */}
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#384518] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                                ✓
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-navigation bar under block */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <button
                  type="button"
                  onClick={handlePrevMza}
                  className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Anterior MZA</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <div className="w-4 h-3 bg-[#b2c478] border border-[#4a5823] rounded-xs" />
                  <span>Lotes (Total: {activeManzano.lotsCount})</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMza}
                  className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                >
                  <span>Siguiente MZA</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CONFIGURACIÓN DETALLADA DE LOTE INDIVIDUAL Card (Image 2) */}
              <div className="bg-white/95 rounded-2xl p-3.5 shadow-sm border border-[#dad2c3] mt-3">
                <div className="text-center font-black text-slate-800 text-xs tracking-wider uppercase mb-2">
                  CONFIGURACIÓN DETALLADA DE LOTE INDIVIDUAL
                </div>
                
                <div className="text-center font-black text-slate-900 text-xs tracking-wide uppercase mb-3 text-emerald-800">
                  DETALLES DEL LOTE SELECCIONADO: LOTE {selectedLotNum} ({activeManzano.name})
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-end">
                  {/* Área (m²) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Área (m²)
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
                      <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="number"
                        step="0.1"
                        value={editArea}
                        onChange={(e) => setEditArea(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-xs font-black text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Frente (m) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Frente (m)
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
                      <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="number"
                        step="0.1"
                        value={editFront}
                        onChange={(e) => setEditFront(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-xs font-black text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fondo (m) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Fondo (m)
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="number"
                        step="0.1"
                        value={editDepth}
                        onChange={(e) => setEditDepth(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-xs font-black text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as LotStatus)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d8f68]"
                    >
                      <option value="Disponible">Disponible</option>
                      <option value="Reservado">Reservado</option>
                      <option value="Vendido">Vendido</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {saveToast ? (
                    <span className="text-xs font-bold text-emerald-700">{saveToast}</span>
                  ) : (
                    <span className="text-[11px] text-slate-500">
                      Precio estimado: ${(editArea * priceM2).toLocaleString()} USD (Bs {(editArea * priceM2 * 6.96).toLocaleString()})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveLotDetails}
                    className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
                  >
                    Guardar Detalles Lote
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Modal Actions (Image 1 & 2) */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 select-none">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-black text-slate-700 tracking-wide text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-600 stroke-[3]" />
                <span>CANCELAR</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-[#4d8f68] hover:bg-[#f0f8f3] text-slate-900 font-black rounded-xl text-xs tracking-wide flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#4d8f68] stroke-[3]" />
                <span>GUARDAR ESTA ESTRUCTURA ({totalLotesAsignados} Lotes)</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
