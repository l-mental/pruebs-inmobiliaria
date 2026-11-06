import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Check, 
  ShoppingBag, 
  Eye, 
  Plus, 
  Layers, 
  Navigation,
  Compass,
  Building2,
  CheckCheck,
  Maximize2,
  LayoutGrid,
  Zap,
  Droplets,
  FileText,
  Calculator,
  MessageCircle,
  Map,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Footprints,
  Trees,
  Car,
  ChevronLeft,
  ChevronRight,
  Coins,
  CheckCircle2,
  Landmark,
  Tag,
  Filter,
  Home,
  ArrowLeftRight,
  ArrowUpDown
} from 'lucide-react';
import { Lot, Urbanization, LotStatus } from '../../types';
import { CrearCondominioModal } from '../modals/CrearCondominioModal';
import { CrearManzanoModal } from '../modals/CrearManzanoModal';
import { CrearLoteModal } from '../modals/CrearLoteModal';
import { InteractiveMapView } from './InteractiveMapView';

interface TerrenosViewProps {
  lots: Lot[];
  urbanizations: Urbanization[];
  onSelectLotForSale: (lot: Lot, urb: Urbanization) => void;
  onAddUrbanization: (urb: Urbanization, generatedLots?: Lot[]) => void;
  onAddLot: (lot: Lot) => void;
  onUpdateLot?: (lot: Lot) => void;
}

export const TerrenosView: React.FC<TerrenosViewProps> = ({
  lots,
  urbanizations,
  onSelectLotForSale,
  onAddUrbanization,
  onAddLot,
  onUpdateLot,
}) => {
  const [selectedUrbId, setSelectedUrbId] = useState<string>(urbanizations[0]?.id || 'URB-01');
  const [selectedBlock, setSelectedBlock] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [locationFilter, setLocationFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'manzaneo' | 'map' | 'plan' | 'cards'>('manzaneo');
  const [planLayoutMode, setPlanLayoutMode] = useState<'vial' | 'manzanos'>('vial');
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || '');
  const [customManzanosByUrb, setCustomManzanosByUrb] = useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Manzaneo structure view state (from user screenshots)
  const [mzaViewTab, setMzaViewTab] = useState<'detalle' | 'general'>('detalle');
  const [activeMzaIndex, setActiveMzaIndex] = useState<number>(0);
  const [selectedLotInMza, setSelectedLotInMza] = useState<number>(1);
  const [mzaEditArea, setMzaEditArea] = useState<number>(200);
  const [mzaEditFront, setMzaEditFront] = useState<number>(5);
  const [mzaEditDepth, setMzaEditDepth] = useState<number>(40);
  const [mzaEditStatus, setMzaEditStatus] = useState<LotStatus>('Disponible');
  const [mzaSaveToast, setMzaSaveToast] = useState<string | null>(null);

  // Modals state
  const [isNewCondoOpen, setIsNewCondoOpen] = useState(false);
  const [isNewManzanoOpen, setIsNewManzanoOpen] = useState(false);
  const [isNewLotOpen, setIsNewLotOpen] = useState(false);

  // Toast notification feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const currentUrb = urbanizations.find(u => u.id === selectedUrbId) || urbanizations[0];

  const urbLots = useMemo(() => {
    return lots.filter(l => l.urbanizationId === selectedUrbId);
  }, [lots, selectedUrbId]);

  // Statistics for the active urbanization (PDF KPI model)
  const stats = useMemo(() => {
    const total = urbLots.length;
    const disponibles = urbLots.filter(l => l.status === 'Disponible').length;
    const reservados = urbLots.filter(l => l.status === 'Reservado').length;
    const vendidos = urbLots.filter(l => l.status === 'Vendido').length;
    const moratoria = urbLots.filter(l => l.status === 'En Moratoria').length;
    const totalValueBs = urbLots.reduce((acc, l) => acc + (l.priceBs || 0), 0);
    const pctDisp = total > 0 ? Math.round((disponibles / total) * 100) : 0;
    return { total, disponibles, reservados, vendidos, moratoria, totalValueBs, pctDisp };
  }, [urbLots]);

  // Location / Road distribution statistics
  const locationStats = useMemo(() => {
    const avenida = urbLots.filter(l => l.locationType === 'Avenida Principal').length;
    const esquina = urbLots.filter(l => l.locationType === 'En Esquina').length;
    const enMedio = urbLots.filter(l => l.locationType === 'En Medio (Calle Interna)').length;
    const sinSalida = urbLots.filter(l => l.locationType === 'Sin Salida a Avenida' || l.locationType === 'Pasaje').length;
    return { avenida, esquina, enMedio, sinSalida };
  }, [urbLots]);

  const blocks = useMemo(() => {
    const lotBlocks = Array.from(new Set(urbLots.map(l => l.block)));
    const extraBlocks = customManzanosByUrb[selectedUrbId] || [];
    const merged = Array.from(new Set([...lotBlocks, ...extraBlocks])).filter(Boolean);
    return ['Todos', ...merged];
  }, [urbLots, customManzanosByUrb, selectedUrbId]);

  const filteredLots = useMemo(() => {
    return urbLots.filter(l => {
      const matchBlock = selectedBlock === 'Todos' || l.block === selectedBlock;
      const matchStatus = statusFilter === 'Todos' || l.status === statusFilter;
      const matchLocation =
        locationFilter === 'Todos' ||
        (locationFilter === 'Sin Salida a Avenida'
          ? l.locationType === 'Sin Salida a Avenida' || l.locationType === 'Pasaje' || l.hasAvenueAccess === false
          : l.locationType === locationFilter);
      const matchSearch = 
        l.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.streetName && l.streetName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.buyerName && l.buyerName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchBlock && matchStatus && matchLocation && matchSearch;
    });
  }, [urbLots, selectedBlock, statusFilter, locationFilter, searchQuery]);

  // Paginated table rows (PDF table model)
  const paginatedLots = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLots.slice(startIndex, startIndex + pageSize);
  }, [filteredLots, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLots.length / pageSize));

  // Group lots by Manzano
  const lotsByManzano = useMemo(() => {
    const groups: Record<string, Lot[]> = {};
    filteredLots.forEach(lot => {
      if (!groups[lot.block]) {
        groups[lot.block] = [];
      }
      groups[lot.block].push(lot);
    });
    return groups;
  }, [filteredLots]);

  // Group lots by Road / Avenue Position
  const lotsByLocation = useMemo(() => {
    const avenueLots = filteredLots.filter(l => l.locationType === 'Avenida Principal');
    const cornerLots = filteredLots.filter(l => l.locationType === 'En Esquina');
    const middleLots = filteredLots.filter(l => l.locationType === 'En Medio (Calle Interna)');
    const noExitLots = filteredLots.filter(l => l.locationType === 'Sin Salida a Avenida' || l.locationType === 'Pasaje');
    const uncategorized = filteredLots.filter(l => !l.locationType);
    return { avenueLots, cornerLots, middleLots, noExitLots, uncategorized };
  }, [filteredLots]);

  const selectedLot = useMemo(() => {
    return lots.find(l => l.id === selectedLotId) || filteredLots[0] || urbLots[0] || lots[0];
  }, [lots, selectedLotId, filteredLots, urbLots]);

  // Manzaneo visualizer calculations and active lot sync
  const urbBlocksList = useMemo(() => {
    const raw = Array.from(new Set(urbLots.map(l => l.block))).filter(Boolean);
    if (raw.length > 0) return raw;
    const count = currentUrb?.manzanosCount || 30;
    return Array.from({ length: count }).map((_, i) => `MZA ${i + 1}`);
  }, [urbLots, currentUrb]);

  const activeMzaName = urbBlocksList[activeMzaIndex] || urbBlocksList[0] || 'MZA 1';

  const lotsInActiveMza = useMemo(() => {
    return urbLots.filter(l => l.block === activeMzaName);
  }, [urbLots, activeMzaName]);

  const activeMzaLotCount = lotsInActiveMza.length > 0 ? lotsInActiveMza.length : 10;

  useEffect(() => {
    const found = lotsInActiveMza.find(l => {
      const numOnly = l.lotNumber.replace(/\D/g, '');
      return numOnly === String(selectedLotInMza) || l.lotNumber === `Lote ${selectedLotInMza}` || l.lotNumber === `${selectedLotInMza}`;
    }) || lotsInActiveMza[selectedLotInMza - 1];

    if (found) {
      setMzaEditArea(found.surface || 200);
      setMzaEditFront(found.front || 5);
      setMzaEditDepth(found.depth || 40);
      setMzaEditStatus(found.status || 'Disponible');
    } else {
      setMzaEditArea(200);
      setMzaEditFront(5);
      setMzaEditDepth(40);
      setMzaEditStatus('Disponible');
    }
  }, [selectedLotInMza, activeMzaName, lotsInActiveMza]);

  const handleSaveMzaLotDetails = () => {
    const found = lotsInActiveMza.find(l => {
      const numOnly = l.lotNumber.replace(/\D/g, '');
      return numOnly === String(selectedLotInMza) || l.lotNumber === `Lote ${selectedLotInMza}` || l.lotNumber === `${selectedLotInMza}`;
    }) || lotsInActiveMza[selectedLotInMza - 1];

    if (found) {
      const updatedLot: Lot = {
        ...found,
        surface: Number(mzaEditArea) || found.surface,
        front: Number(mzaEditFront) || found.front,
        depth: Number(mzaEditDepth) || found.depth,
        status: mzaEditStatus,
        priceBs: Math.round((Number(mzaEditArea) || found.surface) * (currentUrb.basePricePerM2 || 130) * 6.96),
        priceUsd: Math.round((Number(mzaEditArea) || found.surface) * (currentUrb.basePricePerM2 || currentUrb.pricePerM2 || 130)),
      };
      if (onUpdateLot) {
        onUpdateLot(updatedLot);
      }
      setMzaSaveToast(`Detalles guardados para LOTE ${selectedLotInMza} (${activeMzaName})`);
      setTimeout(() => setMzaSaveToast(null), 3000);
    } else {
      setMzaSaveToast(`Detalles guardados para LOTE ${selectedLotInMza}`);
      setTimeout(() => setMzaSaveToast(null), 3000);
    }
  };

  const showToast = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  const handleAddManzano = (manzanoName: string, generatedLots: Lot[] = []) => {
    setCustomManzanosByUrb(prev => ({
      ...prev,
      [selectedUrbId]: [...(prev[selectedUrbId] || []), manzanoName]
    }));

    if (generatedLots && generatedLots.length > 0) {
      generatedLots.forEach(lot => onAddLot(lot));
      setSelectedLotId(generatedLots[0].id);
    }
    setSelectedBlock(manzanoName);
    showToast(`Manzano "${manzanoName}" creado con éxito`);
  };

  const shareViaWhatsApp = () => {
    if (!selectedLot) return;
    const text = `📍 *Ficha Técnica de Terreno - TerraNova*\n` +
      `🏡 *Urbanización:* ${currentUrb.name}\n` +
      `📐 *Terreno:* ${selectedLot.lotNumber} (${selectedLot.block})\n` +
      `🛣️ *Ubicación Vial:* ${selectedLot.locationType || 'En Medio'} - ${selectedLot.streetName || 'Vía interna'}\n` +
      `📏 *Superficie:* ${selectedLot.surface} m² (${selectedLot.front}m x ${selectedLot.depth}m)\n` +
      `💰 *Precio:* Bs. ${selectedLot.priceBs.toLocaleString('es-BO')} ($us. ${selectedLot.priceUsd.toLocaleString('es-BO')})`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Revertir lote en moratoria a Disponible
  const handleRevertLot = (lot: Lot) => {
    if (!onUpdateLot) return;
    const revertedLot: Lot = {
      ...lot,
      status: 'Disponible',
      buyerName: undefined,
    };
    onUpdateLot(revertedLot);
    showToast(`Lote "${lot.lotNumber}" revertido y habilitado nuevamente como DISPONIBLE.`);
  };

  // Helper to get Location Badge styling
  const getLocationBadge = (lot: Lot) => {
    switch (lot.locationType) {
      case 'Avenida Principal':
        return {
          label: '🛣️ SOBRE AVENIDA',
          shortLabel: 'AV. PRINCIPAL',
          bg: 'bg-emerald-900 text-amber-300 border-emerald-700',
          desc: 'Frente directo a Avenida Principal (Acceso vehicular + comercial)',
        };
      case 'En Esquina':
        return {
          label: '📐 EN ESQUINA',
          shortLabel: 'ESQUINA (2 FRENTES)',
          bg: 'bg-amber-500 text-slate-950 border-amber-600',
          desc: 'Terreno en Esquina con doble frente vial y mayor plusvalía',
        };
      case 'En Medio (Calle Interna)':
        return {
          label: '🏘️ EN MEDIO / CALLE INTERNA',
          shortLabel: 'EN MEDIO',
          bg: 'bg-blue-600 text-white border-blue-700',
          desc: 'Ubicado en medio del manzano sobre calle secundaria tranquila',
        };
      case 'Sin Salida a Avenida':
      case 'Pasaje':
        return {
          label: '🚶 SIN SALIDA A AVENIDA',
          shortLabel: 'SIN SALIDA AV.',
          bg: 'bg-orange-600 text-white border-orange-700',
          desc: 'Terreno interior en pasaje / cul-de-sac sin salida directa a la avenida',
        };
      default:
        return {
          label: '🏘️ CALLE INTERNA',
          shortLabel: 'INTERNO',
          bg: 'bg-slate-600 text-white border-slate-700',
          desc: 'Ubicación residencial estándar',
        };
    }
  };

  // Render parcel card inside the architectural blueprint
  const renderParcelButton = (lot: Lot) => {
    const isSelected = selectedLot?.id === lot.id;
    const pricePerM2Lot = Math.round(lot.priceBs / lot.surface);
    const locBadge = getLocationBadge(lot);
    const isCorner = lot.locationType === 'En Esquina';
    const isAvenue = lot.locationType === 'Avenida Principal';
    const isNoExit = lot.locationType === 'Sin Salida a Avenida' || lot.locationType === 'Pasaje';

    let bgClass = 'bg-emerald-50/90 hover:bg-emerald-100 border-emerald-400 text-emerald-950';
    let badgeDot = 'bg-emerald-500';

    if (lot.status === 'Reservado') {
      bgClass = 'bg-amber-50/90 hover:bg-amber-100 border-amber-400 text-amber-950';
      badgeDot = 'bg-amber-500';
    } else if (lot.status === 'Vendido') {
      bgClass = 'bg-slate-100 hover:bg-slate-200/70 border-slate-300 text-slate-500';
      badgeDot = 'bg-slate-400';
    } else if (lot.status === 'En Moratoria') {
      bgClass = 'bg-rose-50/95 hover:bg-rose-100 border-rose-500 text-rose-950';
      badgeDot = 'bg-rose-600 animate-pulse';
    }

    return (
      <button
        key={lot.id}
        onClick={() => setSelectedLotId(lot.id)}
        className={`group relative p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[138px] ${bgClass} ${
          isSelected
            ? 'ring-4 ring-[#0d3f2b]/30 border-[#0d3f2b] scale-[1.02] shadow-lg z-10'
            : 'shadow-2xs hover:shadow-md'
        }`}
      >
        {isCorner && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-xs border border-amber-600">
            📐 ESQUINA
          </div>
        )}
        {isAvenue && !isCorner && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-emerald-900 text-amber-300 font-black text-[9px] uppercase tracking-wider shadow-xs border border-emerald-700">
            🛣️ AVENIDA
          </div>
        )}
        {isNoExit && (
          <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-orange-600 text-white font-black text-[9px] uppercase tracking-wider shadow-xs border border-orange-700">
            🚶 SIN SALIDA AV.
          </div>
        )}

        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="font-black text-sm tracking-tight">{lot.lotNumber}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${badgeDot}`} />
          </div>
          <p className="text-[11px] font-bold opacity-85 mt-0.5">
            {lot.surface} m² <span className="opacity-70">({lot.front}x{lot.depth}m)</span>
          </p>
          {lot.streetName && (
            <p className="text-[10px] font-semibold opacity-75 truncate mt-0.5" title={lot.streetName}>
              📍 {lot.streetName}
            </p>
          )}
        </div>

        <div className="mt-2 pt-1.5 border-t border-black/10 w-full">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-black leading-tight">
              Bs. {lot.priceBs.toLocaleString('es-BO')}
            </p>
            <span className="text-[10px] font-bold opacity-75">
              {pricePerM2Lot} Bs/m²
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${locBadge.bg}`}>
              {locBadge.shortLabel}
            </span>
            <span className="text-[9px] font-bold opacity-75">
              {lot.hasAvenueAccess ? 'Salida a Av.' : 'Sin salida Av.'}
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-[1700px] mx-auto font-sans">
      {/* Floating feedback toast */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#072a1b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-600/40 flex items-center gap-2.5 text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCheck className="w-5 h-5 text-amber-300 flex-shrink-0" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. HEADER SECTION (RESPONSIVE)                                      */}
      {/* =================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-slate-200/60">
        <div className="flex items-center gap-3 sm:gap-3.5">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-[#0e3d2b] to-[#1c5d44] text-white flex items-center justify-center shadow-md shadow-emerald-950/10 flex-shrink-0 border border-emerald-700/40">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight truncate">
                Lotes y Terrenos
              </h1>
              <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-emerald-100/80 text-emerald-900 border border-emerald-300/60 shrink-0">
                {stats.total} Registrados
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium truncate">
              Gestión catastral, visualización de manzaneo flexible y control de vías para <span className="font-bold text-slate-700">{currentUrb.name}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Selector de Urbanización */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 sm:px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-emerald-800 shrink-0" />
            <span className="text-xs font-bold text-slate-500 shrink-0">Urbanización:</span>
            <select
              value={selectedUrbId}
              onChange={(e) => {
                setSelectedUrbId(e.target.value);
                setSelectedBlock('Todos');
                setCurrentPage(1);
                const firstLot = lots.find(l => l.urbanizationId === e.target.value);
                if (firstLot) setSelectedLotId(firstLot.id);
              }}
              className="text-xs font-black text-slate-900 bg-transparent focus:outline-none cursor-pointer pr-1 w-full sm:w-auto truncate"
            >
              {urbanizations.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setIsNewCondoOpen(true)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-emerald-50/70 text-[#0e3d2b] border border-emerald-700/30 hover:border-emerald-700/60 text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-98 whitespace-nowrap"
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700 shrink-0" />
              <span>+ Urbanización</span>
            </button>

            <button
              onClick={() => setIsNewManzanoOpen(true)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-950 border border-emerald-200 text-xs font-bold rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800 shrink-0" />
              <span>+ Manzano</span>
            </button>

            <button
              onClick={() => setIsNewLotOpen(true)}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0e3d2b] hover:bg-[#07241a] text-white text-xs font-black rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer active:scale-98 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 stroke-[3] shrink-0" />
              <span>+ Terreno</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. 4 SUMMARY KPI CARDS (RESPONSIVE GRID)                            */}
      {/* =================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: Total de terrenos */}
        <div className="bg-gradient-to-br from-white to-[#f4f9f6] rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 group">
          <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Total Terrenos</p>
            <p className="text-xl sm:text-3xl font-black text-slate-900 leading-tight mt-0.5">{stats.total}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">En {currentUrb.name}</p>
          </div>
        </div>

        {/* Card 2: Terrenos Disponibles */}
        <div className="bg-gradient-to-br from-white to-[#f0f7fc] rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 group">
          <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Disponibles</p>
            <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
              <span className="text-xl sm:text-3xl font-black text-emerald-700 leading-tight">{stats.disponibles}</span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-100/80 px-1.5 sm:px-2 py-0.5 rounded-md">
                {stats.pctDisp}%
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">
              {stats.vendidos} vend. &bull; {stats.reservados} res.
            </p>
          </div>
        </div>

        {/* Card 3: En Avenida y Esquina */}
        <div className="bg-gradient-to-br from-white to-[#fdf9f0] rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 group">
          <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-amber-100/90 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Car className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Av. y Esquina</p>
            <p className="text-xl sm:text-3xl font-black text-slate-900 leading-tight mt-0.5">
              {locationStats.avenida + locationStats.esquina}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">
              {locationStats.avenida} Av. &bull; {locationStats.esquina} Esq.
            </p>
          </div>
        </div>

        {/* Card 4: Valor total de terrenos */}
        <div className="bg-gradient-to-br from-white to-[#f2faf5] rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-4 group">
          <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Valor Total</p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 leading-tight mt-0.5 truncate">
              Bs. {stats.totalValueBs.toLocaleString('es-BO')}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 font-medium truncate">
              {locationStats.enMedio} medio &bull; {locationStats.sinSalida} s/salida
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN 3-COLUMN PDF GRID: LEFT 2 COLS (MAP + TABLE) & RIGHT 1 COL  */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* LEFT 2 COLUMNS */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Top Filter Tabs Bar & Mode Switcher (Horizontal scroll on phones) */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2.5 sm:gap-3">
            {/* Location Hierarchy Filter Bar */}
            <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto max-w-full scrollbar-none">
              <button
                onClick={() => { setLocationFilter('Todos'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  locationFilter === 'Todos'
                    ? 'bg-[#0e3d2b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                Todos ({urbLots.length})
              </button>
              <button
                onClick={() => { setLocationFilter('Avenida Principal'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  locationFilter === 'Avenida Principal'
                    ? 'bg-[#0e3d2b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <span>🛣️ En Avenida ({locationStats.avenida})</span>
              </button>
              <button
                onClick={() => { setLocationFilter('En Esquina'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  locationFilter === 'En Esquina'
                    ? 'bg-[#0e3d2b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <span>📐 En Esquina ({locationStats.esquina})</span>
              </button>
              <button
                onClick={() => { setLocationFilter('En Medio (Calle Interna)'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  locationFilter === 'En Medio (Calle Interna)'
                    ? 'bg-[#0e3d2b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <span>🏘️ En Medio ({locationStats.enMedio})</span>
              </button>
              <button
                onClick={() => { setLocationFilter('Sin Salida a Avenida'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  locationFilter === 'Sin Salida a Avenida'
                    ? 'bg-[#0e3d2b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <span>🚶 Sin Salida ({locationStats.sinSalida})</span>
              </button>
            </div>

            {/* Mode Switcher: Visualización de Manzaneo vs Mapa vs Plano vs Cuadrícula */}
            <div className="flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto max-w-full scrollbar-none">
              <button
                onClick={() => setViewMode('manzaneo')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === 'manzaneo'
                    ? 'bg-[#4d8f68] text-white shadow-xs ring-1 ring-emerald-700/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-300 stroke-[2.5]" />
                <span>Manzaneo</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === 'map'
                    ? 'bg-[#0e3d2b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-300 stroke-[2.2]" />
                <span>Mapa Catastral</span>
              </button>
              <button
                onClick={() => setViewMode('plan')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === 'plan'
                    ? 'bg-[#0e3d2b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Map className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Plano Vial</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === 'cards'
                    ? 'bg-[#0e3d2b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Cuadrícula</span>
              </button>
            </div>
          </div>

          {/* CARD A: PLANO / MAPA DEL SISTEMA / VISUALIZACIÓN DE MANZANEO */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    {viewMode === 'manzaneo'
                      ? `Visualización de Manzaneo y Lotes — ${currentUrb.name}`
                      : viewMode === 'map'
                      ? `Mapa Catastral del Sistema — ${currentUrb.name}`
                      : viewMode === 'plan'
                      ? `Plano de Ubicación Vial sobre Avenida — ${currentUrb.name}`
                      : `Catálogo Visual de Terrenos — ${currentUrb.name}`}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {viewMode === 'manzaneo'
                    ? 'Estructura flexible de manzaneo, asignación de lotes y editor cadastral en tiempo real.'
                    : 'Haz clic en cualquier terreno para inspeccionar su ubicación en la avenida, esquina, en medio o pasaje sin salida.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-emerald-500" />
                  <span>Disponible</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-amber-400" />
                  <span>Reservado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-slate-400" />
                  <span>Vendido</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-rose-500" />
                  <span className="text-rose-700">En Moratoria</span>
                </div>
              </div>
            </div>

            {filteredLots.length > 0 ? (
              viewMode === 'manzaneo' ? (
                /* MANZANEO VIEW CONTAINER (Matching User Screenshots) */
                <div className="bg-[#ece7de] rounded-3xl p-4 sm:p-6 border-4 border-[#dcd6ca] shadow-md space-y-4">
                  {/* Top Bar with window badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#dad2c3]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                      <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                      <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                      <span className="ml-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                        Estructura de Manzaneo — {currentUrb.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#4d8f68] text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-xs">
                      <Home className="w-4 h-4 text-white" />
                      <span>{currentUrb.name.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* 2-Column Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Left Column: Información Básica & Configuración */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      {/* Información Básica */}
                      <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-[#dad2c3]">
                        <h4 className="text-center font-black text-slate-800 text-xs tracking-wide uppercase mb-3">
                          INFORMACIÓN BÁSICA
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 shrink-0">
                              <Tag className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-semibold">Nombre:</div>
                              <div className="font-black text-slate-900 truncate">{currentUrb.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-semibold">Ubicación:</div>
                              <div className="font-black text-slate-900 truncate">{currentUrb.location}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-100/70 border border-amber-300 rounded-lg text-amber-900 shrink-0">
                              <Coins className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-semibold">Precio ref./m²:</div>
                              <div className="font-black text-slate-900">${currentUrb.basePricePerM2 || 130}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg text-sky-800 shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-semibold">Ciudad:</div>
                              <div className="font-black text-slate-900 truncate">{currentUrb.city || 'Cochabamba'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Configuración de Estructura Flexible */}
                      <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-[#dad2c3]">
                        <h4 className="text-center font-black text-slate-800 text-xs tracking-wide uppercase mb-3">
                          CONFIGURACIÓN DE ESTRUCTURA FLEXIBLE
                        </h4>
                        <div className="grid grid-cols-2 gap-3 items-start">
                          <div className="bg-[#f2efe9] rounded-xl p-2.5 border border-[#dfd9cd]">
                            <div className="text-[10px] font-black text-slate-700 uppercase mb-1">
                              SELECTOR DE MANZANOS
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-12 text-center text-lg font-black bg-white border border-slate-300 rounded-lg py-1 shadow-inner text-slate-900">
                                {urbBlocksList.length}
                              </div>
                              <div className="text-[10px] font-bold text-slate-700 leading-tight">
                                Manzanos Activos<br />
                                <span className="text-slate-500 font-semibold">(1-{urbBlocksList.length})</span>
                              </div>
                              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                            </div>
                            <div className="text-center text-[10px] font-black text-slate-700 uppercase mt-2">
                              TABLA DE ASIGNACIÓN
                            </div>
                          </div>

                          {/* Table of Manzanos */}
                          <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                            <div className="grid grid-cols-2 bg-[#f0eee9] text-[10px] font-black text-slate-700 py-1.5 px-3 border-b border-slate-300">
                              <span>Manzano</span>
                              <span className="text-right">Lotes</span>
                            </div>
                            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs">
                              {urbBlocksList.map((mza, idx) => {
                                const count = urbLots.filter(l => l.block === mza).length;
                                return (
                                  <div
                                    key={mza}
                                    onClick={() => {
                                      setActiveMzaIndex(idx);
                                      setSelectedLotInMza(1);
                                    }}
                                    className={`grid grid-cols-2 items-center py-1.5 px-3 cursor-pointer transition-colors ${
                                      idx === activeMzaIndex ? 'bg-amber-50 font-bold' : 'hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="text-slate-700 font-medium truncate">{mza}</span>
                                    <span className="text-right font-black text-slate-900">{count > 0 ? count : 10}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Total Lotes Asignados */}
                      <div className="bg-[#cddca8] border-2 border-[#b0c482] rounded-2xl p-3 text-center shadow-xs">
                        <div className="text-xs font-black tracking-wider text-slate-800 uppercase">
                          TOTAL LOTES ASIGNADOS:
                        </div>
                        <div className="text-4xl font-black text-[#2e573a] my-0.5">
                          {urbLots.length || currentUrb.totalLots}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-700 italic">
                          (Calculado: Suma de Lotes)
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Visualización de Manzaneo + Cadastral Block + Detalle de Lote */}
                    <div className="lg:col-span-7 flex flex-col justify-between">
                      <div>
                        <div className="text-center font-black text-slate-800 text-sm tracking-wide uppercase mb-2">
                          VISUALIZACIÓN DE MANZANEO
                        </div>

                        {/* Tabs & Selector bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setMzaViewTab('general')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                mzaViewTab === 'general'
                                  ? 'bg-white border-amber-600 text-slate-900 shadow-xs ring-2 ring-amber-500/30'
                                  : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white'
                              }`}
                            >
                              [Vista General ({urbBlocksList.length} MZA)]
                            </button>
                            <button
                              type="button"
                              onClick={() => setMzaViewTab('detalle')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                mzaViewTab === 'detalle'
                                  ? 'bg-white border-red-600 text-slate-900 shadow-xs ring-2 ring-red-500/50'
                                  : 'bg-white/80 border-slate-300 text-slate-700 hover:bg-white'
                              }`}
                            >
                              [Detalle Individual]
                            </button>
                          </div>

                          {/* Dropdown Ver MZA */}
                          <select
                            value={activeMzaIndex}
                            onChange={(e) => {
                              setActiveMzaIndex(Number(e.target.value));
                              setSelectedLotInMza(1);
                            }}
                            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4d8f68]"
                          >
                            {urbBlocksList.map((mza, idx) => (
                              <option key={mza} value={idx}>
                                Ver {mza}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Navigation Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMzaIndex(prev => (prev > 0 ? prev - 1 : urbBlocksList.length - 1));
                              setSelectedLotInMza(1);
                            }}
                            className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Anterior MZA</span>
                          </button>

                          <div className="text-sm font-black text-slate-900 tracking-wide uppercase">
                            {activeMzaName} - {activeMzaLotCount} LOTES
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMzaIndex(prev => (prev < urbBlocksList.length - 1 ? prev + 1 : 0));
                              setSelectedLotInMza(1);
                            }}
                            className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>Siguiente MZA</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* CADASTRAL BLOCK VISUALIZER */}
                        {mzaViewTab === 'general' ? (
                          <div className="bg-[#dfd8cc] rounded-2xl p-4 border-2 border-[#b8ae9c] max-h-60 overflow-y-auto shadow-inner">
                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                              {urbBlocksList.map((mza, idx) => {
                                const count = urbLots.filter(l => l.block === mza).length || 10;
                                return (
                                  <div
                                    key={mza}
                                    onClick={() => {
                                      setActiveMzaIndex(idx);
                                      setMzaViewTab('detalle');
                                      setSelectedLotInMza(1);
                                    }}
                                    className={`p-2.5 rounded-xl text-center cursor-pointer transition-all duration-150 border-2 ${
                                      idx === activeMzaIndex
                                        ? 'bg-[#c2d287] border-[#4a5823] shadow-md ring-3 ring-[#4a5823]/40 scale-105'
                                        : 'bg-white/95 border-slate-300 hover:bg-[#e4ebc5] hover:border-[#4a5823]/60 shadow-2xs'
                                    }`}
                                  >
                                    <div className="font-black text-xs sm:text-sm text-slate-800">{mza}</div>
                                    <div className="text-[10px] font-bold text-slate-600 mt-0.5">{count} lotes</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {/* Top Street Boundary Strip */}
                            <div className="flex items-center justify-between px-3 py-1 bg-[#4a5823]/15 rounded-lg border border-[#4a5823]/30 text-[10px] font-mono font-bold text-[#354019] tracking-wider uppercase select-none">
                              <span>🛣️ CALLE / AVENIDA NORTE (VÍA PRINCIPAL)</span>
                              <span>FRENTE NORTE</span>
                            </div>

                            {/* Main Cadastral Block Map */}
                            <div className="relative bg-[#c2d287] rounded-3xl p-3 sm:p-4 border-4 border-[#4a5823] shadow-inner overflow-x-auto">
                              <div className="min-w-fit flex flex-col gap-2 select-none">
                                {/* Top Row of Lots */}
                                <div className="flex items-stretch gap-2">
                                  {Array.from({ length: Math.ceil(activeMzaLotCount / 2) }).map((_, i) => {
                                    const lotNum = i + 1;
                                    const isSelected = selectedLotInMza === lotNum;
                                    const matchingLot = lotsInActiveMza.find(l => {
                                      const numOnly = l.lotNumber.replace(/\D/g, '');
                                      return numOnly === String(lotNum) || l.lotNumber === `Lote ${lotNum}` || l.lotNumber === `${lotNum}`;
                                    }) || lotsInActiveMza[i];
                                    const isSold = matchingLot?.status === 'Vendido';
                                    const isReserved = matchingLot?.status === 'Reservado';
                                    const surf = matchingLot?.surface || 200;

                                    return (
                                      <div
                                        key={lotNum}
                                        onClick={() => {
                                          setSelectedLotInMza(lotNum);
                                          if (matchingLot) setSelectedLotId(matchingLot.id);
                                        }}
                                        className={`relative flex-1 min-w-[78px] sm:min-w-[90px] min-h-[82px] sm:min-h-[92px] p-2.5 rounded-2xl cursor-pointer transition-all duration-150 border-2 flex flex-col justify-between items-center ${
                                          isSelected
                                            ? 'bg-[#b0c473] border-[#384518] shadow-md ring-4 ring-[#384518]/30 scale-[1.03] z-10'
                                            : isSold
                                            ? 'bg-[#d8a892] border-[#8a4b36] opacity-90 hover:opacity-100'
                                            : isReserved
                                            ? 'bg-[#edd88e] border-[#9a8028] hover:brightness-95'
                                            : 'bg-[#c2d287] border-[#4a5823]/80 hover:bg-[#b8c97b] hover:shadow-xs'
                                        }`}
                                      >
                                        <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-800/80">
                                          <span>L-{lotNum}</span>
                                          <span className={`w-2 h-2 rounded-full ${
                                            isSold ? 'bg-rose-600' : isReserved ? 'bg-amber-600' : 'bg-emerald-700'
                                          }`} />
                                        </div>

                                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight my-auto">
                                          {lotNum}
                                        </span>

                                        <span className="text-[10px] font-extrabold text-slate-800/80 leading-none">
                                          {surf} m²
                                        </span>

                                        {/* Checkmark Badge on Selected Lot */}
                                        {isSelected && (
                                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#384518] text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                                            ✓
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Bottom Row of Lots */}
                                <div className="flex items-stretch gap-2">
                                  {Array.from({ length: Math.floor(activeMzaLotCount / 2) }).map((_, i) => {
                                    const lotNum = Math.ceil(activeMzaLotCount / 2) + i + 1;
                                    const isSelected = selectedLotInMza === lotNum;
                                    const matchingLot = lotsInActiveMza.find(l => {
                                      const numOnly = l.lotNumber.replace(/\D/g, '');
                                      return numOnly === String(lotNum) || l.lotNumber === `Lote ${lotNum}` || l.lotNumber === `${lotNum}`;
                                    }) || lotsInActiveMza[Math.ceil(activeMzaLotCount / 2) + i];
                                    const isSold = matchingLot?.status === 'Vendido';
                                    const isReserved = matchingLot?.status === 'Reservado';
                                    const surf = matchingLot?.surface || 200;

                                    return (
                                      <div
                                        key={lotNum}
                                        onClick={() => {
                                          setSelectedLotInMza(lotNum);
                                          if (matchingLot) setSelectedLotId(matchingLot.id);
                                        }}
                                        className={`relative flex-1 min-w-[78px] sm:min-w-[90px] min-h-[82px] sm:min-h-[92px] p-2.5 rounded-2xl cursor-pointer transition-all duration-150 border-2 flex flex-col justify-between items-center ${
                                          isSelected
                                            ? 'bg-[#b0c473] border-[#384518] shadow-md ring-4 ring-[#384518]/30 scale-[1.03] z-10'
                                            : isSold
                                            ? 'bg-[#d8a892] border-[#8a4b36] opacity-90 hover:opacity-100'
                                            : isReserved
                                            ? 'bg-[#edd88e] border-[#9a8028] hover:brightness-95'
                                            : 'bg-[#c2d287] border-[#4a5823]/80 hover:bg-[#b8c97b] hover:shadow-xs'
                                        }`}
                                      >
                                        <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-800/80">
                                          <span>L-{lotNum}</span>
                                          <span className={`w-2 h-2 rounded-full ${
                                            isSold ? 'bg-rose-600' : isReserved ? 'bg-amber-600' : 'bg-emerald-700'
                                          }`} />
                                        </div>

                                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight my-auto">
                                          {lotNum}
                                        </span>

                                        <span className="text-[10px] font-extrabold text-slate-800/80 leading-none">
                                          {surf} m²
                                        </span>

                                        {/* Checkmark Badge on Selected Lot */}
                                        {isSelected && (
                                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#384518] text-white flex items-center justify-center text-[10px] font-black shadow-xs">
                                            ✓
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Bottom Street Boundary Strip */}
                            <div className="flex items-center justify-between px-3 py-1 bg-[#4a5823]/15 rounded-lg border border-[#4a5823]/30 text-[10px] font-mono font-bold text-[#354019] tracking-wider uppercase select-none">
                              <span>🏘️ CALLE SECUNDARIA / PASAJE INTERNO SUR</span>
                              <span>FRENTE SUR</span>
                            </div>
                          </div>
                        )}

                        {/* Sub-navigation bar under block */}
                        <div className="flex items-center justify-between gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMzaIndex(prev => (prev > 0 ? prev - 1 : urbBlocksList.length - 1));
                              setSelectedLotInMza(1);
                            }}
                            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Anterior MZA</span>
                          </button>

                          <div className="flex items-center gap-2 text-xs font-black text-slate-800 bg-white/80 px-3 py-1 rounded-xl border border-slate-200">
                            <div className="w-4 h-3 bg-[#b2c478] border border-[#4a5823] rounded-xs" />
                            <span>Lotes Asignados: {activeMzaLotCount}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveMzaIndex(prev => (prev < urbBlocksList.length - 1 ? prev + 1 : 0));
                              setSelectedLotInMza(1);
                            }}
                            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                          >
                            <span>Siguiente MZA</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        {/* CONFIGURACIÓN DETALLADA DE LOTE INDIVIDUAL */}
                        <div className="bg-white/95 rounded-2xl p-4 shadow-sm border border-[#dad2c3] mt-3.5">
                          <div className="text-center font-black text-slate-800 text-xs tracking-wider uppercase mb-1">
                            CONFIGURACIÓN DETALLADA DE LOTE INDIVIDUAL
                          </div>
                          <div className="text-center font-black text-emerald-800 text-sm tracking-wide uppercase mb-3.5">
                            DETALLES DEL LOTE SELECCIONADO: LOTE {selectedLotInMza} ({activeMzaName})
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Área (m²)
                              </label>
                              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/20 focus-within:border-emerald-600 transition-all">
                                <Maximize2 className="w-4 h-4 text-slate-500" />
                                <input
                                  type="number"
                                  step="0.1"
                                  value={mzaEditArea}
                                  onChange={(e) => setMzaEditArea(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Frente (m)
                              </label>
                              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/20 focus-within:border-emerald-600 transition-all">
                                <ArrowLeftRight className="w-4 h-4 text-slate-500" />
                                <input
                                  type="number"
                                  step="0.1"
                                  value={mzaEditFront}
                                  onChange={(e) => setMzaEditFront(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Fondo (m)
                              </label>
                              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/20 focus-within:border-emerald-600 transition-all">
                                <ArrowUpDown className="w-4 h-4 text-slate-500" />
                                <input
                                  type="number"
                                  step="0.1"
                                  value={mzaEditDepth}
                                  onChange={(e) => setMzaEditDepth(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-transparent text-xs font-black text-slate-900 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Estado
                              </label>
                              <select
                                value={mzaEditStatus}
                                onChange={(e) => setMzaEditStatus(e.target.value as LotStatus)}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                              >
                                <option value="Disponible">Disponible</option>
                                <option value="Reservado">Reservado</option>
                                <option value="Vendido">Vendido</option>
                              </select>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            {mzaSaveToast ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                                <CheckCheck className="w-4 h-4 text-emerald-600" />
                                <span>{mzaSaveToast}</span>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-600 font-semibold">
                                Valor estimado: <strong className="text-slate-900 font-black">${(mzaEditArea * (currentUrb.basePricePerM2 || currentUrb.pricePerM2 || 130)).toLocaleString()} USD</strong> <span className="text-slate-400">&bull;</span> Bs. {(mzaEditArea * (currentUrb.basePricePerM2 || currentUrb.pricePerM2 || 130) * 6.96).toLocaleString()}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={handleSaveMzaLotDetails}
                              className="px-5 py-2 bg-[#0e3d2b] hover:bg-[#07241a] text-white rounded-xl text-xs font-black transition-all shadow-xs hover:shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Check className="w-4 h-4 text-amber-300 stroke-[3]" />
                              <span>Guardar Detalles Lote</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : viewMode === 'map' ? (
                <InteractiveMapView
                  lots={filteredLots}
                  urbanization={currentUrb}
                  selectedLot={selectedLot}
                  onSelectLot={(lot) => setSelectedLotId(lot.id)}
                  onSelectForSale={onSelectLotForSale}
                />
              ) : viewMode === 'plan' ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Distribución de terrenos según acceso a la Avenida Principal:
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                      <button
                        onClick={() => setPlanLayoutMode('vial')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          planLayoutMode === 'vial'
                            ? 'bg-white text-emerald-900 shadow-2xs font-black'
                            : 'text-slate-600'
                        }`}
                      >
                        🛣️ Vista por Avenida y Calles
                      </button>
                      <button
                        onClick={() => setPlanLayoutMode('manzanos')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          planLayoutMode === 'manzanos'
                            ? 'bg-white text-emerald-900 shadow-2xs font-black'
                            : 'text-slate-600'
                        }`}
                      >
                        🏢 Por Manzanos
                      </button>
                    </div>
                  </div>

                  {planLayoutMode === 'vial' ? (
                    <div className="space-y-5">
                      {/* EJE AVENIDA PRINCIPAL */}
                      <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-slate-800 bg-[#1e293b] p-4 text-white">
                        <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-emerald-300 font-bold border-b border-slate-700">
                          <div className="flex items-center gap-2">
                            <Trees className="w-4 h-4 text-emerald-400" />
                            <span>AVENIDA PRINCIPAL ASFALTADA &bull; DOBLE CARRIL CON CAMELLÓN CENTRAL</span>
                          </div>
                          <span>ACCESO DIRECTO COMERCIAL Y RESIDENCIAL</span>
                        </div>
                        <div className="py-3 flex items-center justify-center">
                          <div className="bg-[#0f172a] px-4 py-2 rounded-xl border border-amber-400/80 shadow-md text-center">
                            <span className="text-[10px] text-amber-400 font-mono font-bold tracking-widest block uppercase">
                              🛣️ AVENIDA PRINCIPAL DE LA URBANIZACIÓN
                            </span>
                            <span className="text-sm font-black text-white">
                              {currentUrb.mainAvenueName || 'Avenida Principal (25m de ancho)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* FILA 1: SOBRE AVENIDA Y ESQUINAS */}
                      {(lotsByLocation.avenueLots.length > 0 || lotsByLocation.cornerLots.length > 0) && (
                        <div className="space-y-3 p-4 bg-emerald-50/50 rounded-2xl border-2 border-emerald-300">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-emerald-950 uppercase">
                              1. Terrenos en la Avenida Principal y en Esquina
                            </h3>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
                              {lotsByLocation.avenueLots.length} en Avenida &bull; {lotsByLocation.cornerLots.length} en Esquina
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {lotsByLocation.cornerLots.map(lot => renderParcelButton(lot))}
                            {lotsByLocation.avenueLots.map(lot => renderParcelButton(lot))}
                          </div>
                        </div>
                      )}

                      {/* FILA 2: EN MEDIO (CALLE INTERNA) */}
                      {lotsByLocation.middleLots.length > 0 && (
                        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-300">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-slate-900 uppercase">
                              2. Terrenos en Medio (Calle Interna Secundaria)
                            </h3>
                            <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                              {lotsByLocation.middleLots.length} terrenos en medio
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {lotsByLocation.middleLots.map(lot => renderParcelButton(lot))}
                          </div>
                        </div>
                      )}

                      {/* FILA 3: SIN SALIDA A LA AVENIDA (PASAJE INTERIOR) */}
                      {lotsByLocation.noExitLots.length > 0 && (
                        <div className="space-y-3 p-4 bg-orange-50/60 rounded-2xl border-2 border-orange-300">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-orange-950 uppercase">
                              3. Terrenos Sin Salida Directa a la Avenida (Pasaje / Cul-de-sac)
                            </h3>
                            <span className="text-xs font-bold text-orange-900 bg-white px-2.5 py-1 rounded-lg border border-orange-200">
                              {lotsByLocation.noExitLots.length} terrenos sin salida a Av.
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {lotsByLocation.noExitLots.map(lot => renderParcelButton(lot))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {Object.entries(lotsByManzano).map(([manzanoName, blockLots]) => (
                        <div key={manzanoName} className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-sm text-slate-900">{manzanoName}</span>
                            <span className="text-xs font-bold text-slate-500">{blockLots.length} lotes</span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {blockLots.map((lot) => renderParcelButton(lot))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredLots.map(lot => renderParcelButton(lot))}
                </div>
              )
            ) : (
              <div className="p-10 text-center text-slate-400 font-bold">
                No se encontraron terrenos con los filtros seleccionados.
              </div>
            )}
          </div>

          {/* CARD B: TABLA DE TERRENOS Y LOTES (EXACT PDF TABLE MODEL) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
            {/* Table Header & Filters */}
            <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0e3d2b] to-[#1c5d44] text-white flex items-center justify-center shadow-xs">
                    <Layers className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        Catálogo de Terrenos — {currentUrb.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200">
                        {filteredLots.length} lotes
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Control catastral por manzano, frente a vía, superficie y disponibilidad comercial.
                    </p>
                  </div>
                </div>

                {/* Quick Status Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'Todos', label: 'Todos', count: urbLots.length, color: 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-200' },
                    { id: 'Disponible', label: 'Disponibles', count: stats.disponibles, color: 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' },
                    { id: 'Reservado', label: 'Reservados', count: stats.reservados, color: 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200' },
                    { id: 'Vendido', label: 'Vendidos', count: stats.vendidos, color: 'text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200' },
                    { id: 'En Moratoria', label: 'Moratoria', count: stats.moratoria, color: 'text-rose-800 bg-rose-50 hover:bg-rose-100 border-rose-200' },
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        setStatusFilter(chip.id);
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === chip.id
                          ? 'bg-[#0e3d2b] text-white border-[#0e3d2b] shadow-2xs'
                          : chip.color
                      }`}
                    >
                      <span>{chip.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        statusFilter === chip.id ? 'bg-white/20 text-white' : 'bg-black/5 text-inherit'
                      }`}>
                        {chip.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Controls Row */}
              <div className="flex flex-col md:flex-row items-center gap-3 pt-1">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por número de lote, manzano o calle..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-600 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={selectedBlock}
                    onChange={(e) => {
                      setSelectedBlock(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-all"
                  >
                    {blocks.map(b => (
                      <option key={b} value={b}>{b === 'Todos' ? '🏢 Todos los manzanos' : `🏢 ${b}`}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-all"
                  >
                    <option value="Todos">Todos los estados ({urbLots.length})</option>
                    <option value="Disponible">🟢 Disponibles ({stats.disponibles})</option>
                    <option value="Reservado">🟡 Reservados ({stats.reservados})</option>
                    <option value="Vendido">⚫ Vendidos ({stats.vendidos})</option>
                    <option value="En Moratoria">🔴 En Moratoria ({stats.moratoria})</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-black">CÓDIGO</th>
                    <th className="py-3.5 px-4 font-black">LOTE / MANZANO</th>
                    <th className="py-3.5 px-4 font-black">UBICACIÓN VIAL</th>
                    <th className="py-3.5 px-4 font-black">SUPERFICIE & DIMENSIONES</th>
                    <th className="py-3.5 px-4 font-black">PRECIO CONTADO</th>
                    <th className="py-3.5 px-4 font-black">ESTADO</th>
                    <th className="py-3.5 px-4 text-center font-black">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedLots.length > 0 ? (
                    paginatedLots.map((lot) => {
                      const isSelected = selectedLot?.id === lot.id;
                      const locBadge = getLocationBadge(lot);
                      return (
                        <tr
                          key={lot.id}
                          onClick={() => setSelectedLotId(lot.id)}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50/80 border-l-4 border-l-[#0e3d2b]'
                              : 'hover:bg-slate-50/70 border-l-4 border-l-transparent'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-[11px] font-mono border border-slate-200">
                              {lot.id}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-black text-slate-900 text-sm">{lot.lotNumber}</p>
                            <span className="inline-block text-[11px] font-bold text-emerald-900 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                              {lot.block}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black border ${locBadge.bg}`}>
                              {locBadge.label}
                            </span>
                            <p className="text-[11px] text-slate-600 font-semibold mt-1 flex items-center gap-1">
                              <span className="text-slate-400">🛣️</span> {lot.streetName || currentUrb.mainAvenueName || 'Vía interna'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900 text-sm">
                              {lot.surface} m²
                            </span>
                            <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">
                              {lot.front}m frente × {lot.depth}m fondo
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-black text-emerald-950 text-sm">
                              Bs. {lot.priceBs.toLocaleString('es-BO')}
                            </span>
                            <span className="block text-[11px] text-slate-500 font-semibold mt-0.5">
                              $us. {lot.priceUsd.toLocaleString('es-BO')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                lot.status === 'Disponible'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : lot.status === 'Reservado'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : lot.status === 'En Moratoria'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                lot.status === 'Disponible'
                                  ? 'bg-emerald-600'
                                  : lot.status === 'Reservado'
                                  ? 'bg-amber-500'
                                  : lot.status === 'En Moratoria'
                                  ? 'bg-rose-600'
                                  : 'bg-slate-500'
                              }`} />
                              {lot.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {lot.status === 'Disponible' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectLotForSale(lot, currentUrb);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0e3d2b] to-[#1c5d44] hover:from-[#08281c] hover:to-[#134230] text-white text-xs font-black inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Vender</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLotId(lot.id);
                                }}
                                className={`w-8 h-8 inline-flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#0e3d2b] text-white'
                                    : 'hover:bg-slate-100 text-slate-500 hover:text-emerald-800'
                                }`}
                                title="Ver ficha técnica"
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
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No se encontraron terrenos con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination (Exact PDF Model, Responsive) */}
            <div className="p-3 sm:p-5 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <p className="font-semibold text-center sm:text-left">
                Mostrando <strong className="text-slate-900">{paginatedLots.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> a{' '}
                <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredLots.length)}</strong> de{' '}
                <strong className="text-slate-900">{filteredLots.length}</strong> terrenos
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-2.5 sm:px-0 sm:w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 disabled:opacity-30 cursor-pointer hover:bg-slate-100 transition-all shadow-2xs gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="sm:hidden font-bold text-xs">Ant.</span>
                </button>

                {/* Mobile Page indicator */}
                <span className="sm:hidden px-3 py-1 bg-white border border-slate-200 rounded-xl font-black text-xs text-slate-900 shadow-2xs">
                  {currentPage} / {totalPages || 1}
                </span>

                {/* Tablet and Desktop Full Numbered Page Buttons */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-[#0e3d2b] text-white shadow-xs'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="px-2.5 sm:px-0 sm:w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 disabled:opacity-30 cursor-pointer hover:bg-slate-100 transition-all shadow-2xs gap-1"
                >
                  <span className="sm:hidden font-bold text-xs">Sig.</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT 1 COLUMN: FICHA TÉCNICA DRAWER (MODERNO & ARQUITECTÓNICO)     */}
        {/* =================================================================== */}
        <div id="ficha-tecnica" className="space-y-4 lg:sticky lg:top-6 scroll-mt-6">
          {selectedLot ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0e3d2b] to-[#1c5d44] text-emerald-300 flex items-center justify-center shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900 tracking-tight">
                      Ficha Técnica del Terreno
                    </h2>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Plano catastral oficial y datos comerciales
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-[#0e3d2b] text-white font-mono text-xs font-black rounded-lg shadow-2xs">
                  {selectedLot.id}
                </span>
              </div>

              {/* Property Hero Card with image */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                <img
                  src={currentUrb.image}
                  alt={currentUrb.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3.5 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-300 font-bold block">
                        {currentUrb.location}, {currentUrb.city}
                      </span>
                      <h4 className="text-sm font-black text-white leading-tight">
                        {currentUrb.name} &bull; {selectedLot.lotNumber}
                      </h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                      selectedLot.status === 'Disponible'
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : selectedLot.status === 'Reservado'
                        ? 'bg-amber-500 text-white border-amber-400'
                        : selectedLot.status === 'En Moratoria'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-slate-700 text-white border-slate-600'
                    }`}>
                      {selectedLot.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4-Box Key Metric Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    SUPERFICIE TOTAL
                  </span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {selectedLot.surface.toFixed(2)} m²
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                    Área útil aprobada
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    FRENTE × FONDO
                  </span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {selectedLot.front}m × {selectedLot.depth}m
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                    Linderos regulares
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    MANZANO
                  </span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {selectedLot.block}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                    Ubicación en bloque
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    ACCESO VIAL
                  </span>
                  <span className="text-xs font-black text-slate-900 mt-1 block truncate">
                    {selectedLot.hasAvenueAccess ? 'Avenida Principal' : 'Calle Secundaria'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-0.5 truncate">
                    {selectedLot.streetName || currentUrb.mainAvenueName || 'Calle interna'}
                  </span>
                </div>
              </div>

              {/* Ubicación Vial Badge Banner */}
              {(() => {
                const badge = getLocationBadge(selectedLot);
                return (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        selectedLot.hasAvenueAccess
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-orange-100 text-orange-900 border border-orange-300'
                      }`}>
                        {selectedLot.hasAvenueAccess ? '✓ Salida directa a Av.' : 'Pasaje / Cul-de-sac'}
                      </span>
                    </div>
                    {selectedLot.cornerStreets && (
                      <p className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                        📐 Intersección: {selectedLot.cornerStreets}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 font-medium">
                      {badge.desc}
                    </p>
                  </div>
                );
              })()}

              {/* Croquis Catastral Dibujado en el Sistema (Warm Architectural Stone Palette #ece7de) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
                    Croquis Catastral (Sistema Propio)
                  </h3>
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {selectedLot.front}m × {selectedLot.depth}m
                  </span>
                </div>

                <div className="bg-[#ece7de] rounded-2xl border-2 border-[#d5cbba] p-3.5 flex flex-col items-center shadow-inner">
                  <svg viewBox="0 0 300 155" className="w-full h-36">
                    {/* Top road representation */}
                    <rect
                      x="15"
                      y="6"
                      width="270"
                      height="26"
                      rx="6"
                      fill={selectedLot.hasAvenueAccess ? '#1e293b' : '#94a3b8'}
                    />
                    {selectedLot.hasAvenueAccess && (
                      <line x1="25" y1="19" x2="275" y2="19" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 4" />
                    )}
                    <text
                      x="150"
                      y="22"
                      textAnchor="middle"
                      fill={selectedLot.hasAvenueAccess ? '#fde68a' : '#ffffff'}
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      {selectedLot.hasAvenueAccess
                        ? `🛣️ ${selectedLot.streetName || currentUrb.mainAvenueName || 'AVENIDA PRINCIPAL (25m)'}`
                        : `🏘️ ${selectedLot.streetName || 'CALLE INTERNA SECUNDARIA (12m)'}`}
                    </text>

                    {/* Parcel Polygon in Architectural Olive #c2d287 & #4a5823 */}
                    <rect
                      x="55"
                      y="40"
                      width="190"
                      height="95"
                      rx="8"
                      fill="#c2d287"
                      stroke="#4a5823"
                      strokeWidth="2.5"
                    />
                    <text x="150" y="53" textAnchor="middle" fill="#2d3714" fontSize="9" fontWeight="900">
                      FRENTE: {selectedLot.front} METROS
                    </text>
                    <rect x="95" y="64" width="110" height="38" rx="8" fill="#ffffff" stroke="#4a5823" strokeWidth="1.5" />
                    <text x="150" y="82" textAnchor="middle" fill="#1e293b" fontSize="13" fontWeight="900">
                      {selectedLot.surface} m²
                    </text>
                    <text x="150" y="95" textAnchor="middle" fill="#4a5823" fontSize="8.5" fontWeight="900">
                      {selectedLot.lotNumber.toUpperCase()} &bull; {selectedLot.block}
                    </text>
                    <text x="44" y="90" textAnchor="middle" fill="#4a5823" fontSize="8" fontWeight="bold" transform="rotate(-90 44 90)">
                      FONDO {selectedLot.depth}m
                    </text>
                    <text x="256" y="90" textAnchor="middle" fill="#4a5823" fontSize="8" fontWeight="bold" transform="rotate(90 256 90)">
                      FONDO {selectedLot.depth}m
                    </text>
                    <text x="150" y="148" textAnchor="middle" fill="#4a5823" fontSize="8.5" fontWeight="bold">
                      LINDERO POSTERIOR: {selectedLot.front}m
                    </text>
                  </svg>

                  <div className="grid grid-cols-3 gap-2 w-full pt-2.5 text-[11px]">
                    <div className="flex items-center justify-center gap-1.5 p-1.5 bg-white rounded-xl border border-[#d5cbba] font-bold text-slate-800 shadow-2xs">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      <span>Agua Potable</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 p-1.5 bg-white rounded-xl border border-[#d5cbba] font-bold text-slate-800 shadow-2xs">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Luz Eléctrica</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 p-1.5 bg-white rounded-xl border border-[#d5cbba] font-bold text-slate-800 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Folio Real</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos Económicos y Financiamiento */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Precios y Financiamiento</span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                    Sin Interés Bancario
                  </span>
                </h3>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600 font-medium">Precio al Contado:</span>
                  <span className="font-black text-emerald-950 text-base">
                    Bs. {selectedLot.priceBs.toLocaleString('es-BO')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600 font-medium">Equivalente en Dólares:</span>
                  <span className="font-bold text-slate-800">
                    $us. {selectedLot.priceUsd.toLocaleString('es-BO')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600 font-medium">Cuota Inicial Sugerida (20%):</span>
                  <span className="font-bold text-emerald-800">
                    Bs. {Math.round(selectedLot.priceBs * 0.2).toLocaleString('es-BO')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600 font-medium">Plazo 36 cuotas fijas:</span>
                  <span className="font-bold text-slate-800">
                    Bs. {Math.round((selectedLot.priceBs * 0.8) / 36).toLocaleString('es-BO')} / mes
                  </span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                {selectedLot.status === 'Disponible' ? (
                  <button
                    type="button"
                    onClick={() => onSelectLotForSale(selectedLot, currentUrb)}
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-[#0e3d2b] to-[#1c5d44] hover:from-[#072a1c] hover:to-[#134230] text-white font-black text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>Registrar Venta de {selectedLot.lotNumber}</span>
                  </button>
                ) : selectedLot.status === 'En Moratoria' ? (
                  <button
                    type="button"
                    onClick={() => handleRevertLot(selectedLot)}
                    className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                    <span>Revertir Terreno a Disponible</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={shareViaWhatsApp}
                  className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#1ea853] text-white font-black text-xs rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Compartir Ficha por WhatsApp</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-white/80" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center text-xs text-slate-400">
              Selecciona un terreno del plano o tabla para ver su detalle completo.
            </div>
          )}
        </div>
      </div>

      {/* Floating Mobile Bottom Bar when a lot is selected (for phones & tablets < lg) */}
      {selectedLot && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-[#072a1b]/95 backdrop-blur-md text-white p-3 rounded-2xl border border-emerald-600/40 shadow-2xl flex items-center justify-between gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-white truncate">
                {selectedLot.lotNumber} &bull; {selectedLot.block}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40 shrink-0">
                {selectedLot.surface} m²
              </span>
            </div>
            <p className="text-[11px] font-bold text-amber-300 truncate">
              Bs. {selectedLot.priceBs.toLocaleString('es-BO')} <span className="text-slate-300 font-normal">($us. {selectedLot.priceUsd.toLocaleString('es-BO')})</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('ficha-tecnica');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Ficha</span>
            </button>

            {selectedLot.status === 'Disponible' && (
              <button
                type="button"
                onClick={() => onSelectLotForSale(selectedLot, currentUrb)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Vender</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modales */}
      <CrearCondominioModal
        isOpen={isNewCondoOpen}
        onClose={() => setIsNewCondoOpen(false)}
        onSaveUrbanization={(newUrb, generatedLots) => {
          onAddUrbanization(newUrb, generatedLots);
          setSelectedUrbId(newUrb.id);
          const lotsCount = generatedLots?.length || 0;
          showToast(`Urbanización "${newUrb.name}" creada con éxito ${lotsCount > 0 ? `(${lotsCount} terrenos distribuidos sobre avenida y vías)` : ''}`);
        }}
      />

      <CrearManzanoModal
        isOpen={isNewManzanoOpen}
        onClose={() => setIsNewManzanoOpen(false)}
        urbanization={currentUrb}
        existingBlocks={blocks}
        onSaveManzano={handleAddManzano}
      />

      <CrearLoteModal
        isOpen={isNewLotOpen}
        onClose={() => setIsNewLotOpen(false)}
        urbanizations={urbanizations}
        currentUrbId={selectedUrbId}
        availableBlocks={blocks}
        onSaveLot={(newLot) => {
          onAddLot(newLot);
          setSelectedLotId(newLot.id);
          showToast(`Terreno "${newLot.lotNumber}" (${newLot.locationType || 'Lote'}) guardado exitosamente`);
        }}
      />
    </div>
  );
};
