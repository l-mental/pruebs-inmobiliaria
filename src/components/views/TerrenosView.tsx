import React, { useState, useMemo } from 'react';
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
  Landmark
} from 'lucide-react';
import { Lot, Urbanization } from '../../types';
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
  const [viewMode, setViewMode] = useState<'map' | 'plan' | 'cards'>('map');
  const [planLayoutMode, setPlanLayoutMode] = useState<'vial' | 'manzanos'>('vial');
  const [selectedLotId, setSelectedLotId] = useState<string>(lots[0]?.id || '');
  const [customManzanosByUrb, setCustomManzanosByUrb] = useState<Record<string, string[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

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

  const showToast = (msg: string) => {
    setCopyFeedback(msg);
    setTimeout(() => setCopyFeedback(null), 3500);
  };

  const handleAddManzano = (manzanoName: string, generatedLots: Lot[]) => {
    setCustomManzanosByUrb(prev => ({
      ...prev,
      [selectedUrbId]: [...(prev[selectedUrbId] || []), manzanoName]
    }));

    generatedLots.forEach(lot => onAddLot(lot));
    setSelectedBlock(manzanoName);
    if (generatedLots.length > 0) {
      setSelectedLotId(generatedLots[0].id);
    }
    showToast(`Manzano "${manzanoName}" creado con ${generatedLots.length} lotes`);
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
      daysOverdue: undefined,
      overdueAmountBs: undefined,
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
    <div className="p-6 space-y-6 max-w-[1700px] mx-auto font-sans">
      {/* Floating feedback toast */}
      {copyFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#072a1b] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-600/40 flex items-center gap-2.5 text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCheck className="w-5 h-5 text-amber-300 flex-shrink-0" />
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. HEADER SECTION (EXACT PDF MODEL)                                 */}
      {/* =================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <Layers className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Lotes y Terrenos
            </h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">
              Control de terrenos por urbanización, manzano y ubicación vial (En Avenida, Esquina, En Medio y Sin Salida a Avenida).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Urbanización */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
            <Building2 className="w-4 h-4 text-emerald-800" />
            <span className="text-xs font-bold text-slate-500">Urbanización:</span>
            <select
              value={selectedUrbId}
              onChange={(e) => {
                setSelectedUrbId(e.target.value);
                setSelectedBlock('Todos');
                setCurrentPage(1);
                const firstLot = lots.find(l => l.urbanizationId === e.target.value);
                if (firstLot) setSelectedLotId(firstLot.id);
              }}
              className="text-xs font-black text-slate-900 bg-transparent focus:outline-none cursor-pointer"
            >
              {urbanizations.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsNewCondoOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#0d3f2b] border border-emerald-800/30 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>+ Nueva Urbanización</span>
          </button>

          <button
            onClick={() => setIsNewManzanoOpen(true)}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-emerald-800" />
            <span>+ Nuevo Manzano</span>
          </button>

          <button
            onClick={() => setIsNewLotOpen(true)}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Nuevo Terreno / Lote</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. 4 SUMMARY KPI CARDS (EXACT PDF PASTEL CARDS MODEL)               */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total de terrenos */}
        <div className="bg-[#ebf6f1] rounded-2xl p-5 border border-emerald-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">Total de terrenos</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">en {currentUrb.name}</p>
          </div>
        </div>

        {/* Card 2: Terrenos Disponibles */}
        <div className="bg-[#e9f2fb] rounded-2xl p-5 border border-sky-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">Disponibles</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">{stats.disponibles}</p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{stats.vendidos} vendidos &bull; {stats.reservados} reservados</p>
          </div>
        </div>

        {/* Card 3: En Avenida y Esquina */}
        <div className="bg-[#fcf5e7] rounded-2xl p-5 border border-amber-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">En Avenida y Esquina</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
              {locationStats.avenida + locationStats.esquina}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {locationStats.avenida} en Av. &bull; {locationStats.esquina} en Esquina
            </p>
          </div>
        </div>

        {/* Card 4: Valor total de terrenos */}
        <div className="bg-[#eef8f2] rounded-2xl p-5 border border-emerald-100/60 shadow-xs flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-600">Valor total terrenos</p>
            <p className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
              Bs. {stats.totalValueBs.toLocaleString('es-BO')}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {locationStats.enMedio} en medio &bull; {locationStats.sinSalida} sin salida Av.
            </p>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN 3-COLUMN PDF GRID: LEFT 2 COLS (MAP + TABLE) & RIGHT 1 COL  */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT 2 COLUMNS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Filter Tabs Bar (PDF Toggle Bar Style) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => { setLocationFilter('Todos'); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  locationFilter === 'Todos'
                    ? 'bg-[#083021] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Todos ({urbLots.length})
              </button>
              <button
                onClick={() => { setLocationFilter('Avenida Principal'); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  locationFilter === 'Avenida Principal'
                    ? 'bg-[#083021] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>🛣️ En Avenida ({locationStats.avenida})</span>
              </button>
              <button
                onClick={() => { setLocationFilter('En Esquina'); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  locationFilter === 'En Esquina'
                    ? 'bg-[#083021] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>📐 En Esquina ({locationStats.esquina})</span>
              </button>
              <button
                onClick={() => { setLocationFilter('En Medio (Calle Interna)'); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  locationFilter === 'En Medio (Calle Interna)'
                    ? 'bg-[#083021] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>🏘️ En Medio ({locationStats.enMedio})</span>
              </button>
              <button
                onClick={() => { setLocationFilter('Sin Salida a Avenida'); setCurrentPage(1); }}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  locationFilter === 'Sin Salida a Avenida'
                    ? 'bg-[#083021] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>🚶 Sin Salida a Av. ({locationStats.sinSalida})</span>
              </button>
            </div>

            {/* Mode Switcher: Mapa del Sistema vs Plano Vial vs Tarjetas */}
            <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-[#083021] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>Mapa del Sistema</span>
              </button>
              <button
                onClick={() => setViewMode('plan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'plan'
                    ? 'bg-[#083021] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Plano Vial</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-[#083021] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cuadrícula</span>
              </button>
            </div>
          </div>

          {/* CARD A: PLANO / MAPA DEL SISTEMA (DIBUJADO INTERNO, SIN GOOGLE MAPS) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    {viewMode === 'map'
                      ? `Mapa Catastral del Sistema — ${currentUrb.name}`
                      : viewMode === 'plan'
                      ? `Plano de Ubicación Vial sobre Avenida — ${currentUrb.name}`
                      : `Catálogo Visual de Terrenos — ${currentUrb.name}`}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Haz clic en cualquier terreno para inspeccionar su ubicación en la avenida, esquina, en medio o pasaje sin salida.
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
              viewMode === 'map' ? (
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
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Table Header & Filters */}
            <div className="p-5 border-b border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    Listado de Terrenos — {currentUrb.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Detalle por manzano, ubicación en avenida, esquina, en medio o sin salida.
                  </p>
                </div>
              </div>

              {/* Filter Controls Row */}
              <div className="flex flex-col md:flex-row items-center gap-3">
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
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select
                    value={selectedBlock}
                    onChange={(e) => {
                      setSelectedBlock(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    {blocks.map(b => (
                      <option key={b} value={b}>{b === 'Todos' ? 'Todos los manzanos' : b}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="Todos">Todos los estados ({urbLots.length})</option>
                    <option value="Disponible">Disponibles ({stats.disponibles})</option>
                    <option value="Reservado">Reservados ({stats.reservados})</option>
                    <option value="Vendido">Vendidos ({stats.vendidos})</option>
                    <option value="En Moratoria">En Moratoria ({stats.moratoria})</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Código</th>
                    <th className="py-3.5 px-4">Lote / Manzano</th>
                    <th className="py-3.5 px-4">Ubicación Vial (Avenida / Calle)</th>
                    <th className="py-3.5 px-4">Superficie</th>
                    <th className="py-3.5 px-4">Precio Contado</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 text-xs">
                  {paginatedLots.length > 0 ? (
                    paginatedLots.map((lot) => {
                      const isSelected = selectedLot?.id === lot.id;
                      const locBadge = getLocationBadge(lot);
                      return (
                        <tr
                          key={lot.id}
                          onClick={() => setSelectedLotId(lot.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-emerald-50/80' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                            {lot.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-black text-slate-900">{lot.lotNumber}</p>
                            <p className="text-[11px] text-slate-500 font-semibold">{lot.block}</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-black border ${locBadge.bg}`}>
                              {locBadge.label}
                            </span>
                            <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                              {lot.streetName || currentUrb.mainAvenueName || 'Vía interna'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {lot.surface} m²
                            <span className="block text-[10px] text-slate-500 font-medium">
                              {lot.front}m x {lot.depth}m
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-black text-slate-900">
                              Bs. {lot.priceBs.toLocaleString('es-BO')}
                            </span>
                            <span className="block text-[10px] text-slate-500 font-semibold">
                              $us. {lot.priceUsd.toLocaleString('es-BO')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                lot.status === 'Disponible'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : lot.status === 'Reservado'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : lot.status === 'En Moratoria'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {lot.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {lot.status === 'Disponible' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectLotForSale(lot, currentUrb);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#0d3f2b] hover:bg-[#072a1c] text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <ShoppingBag className="w-3 h-3 text-amber-300" />
                                  <span>Vender</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLotId(lot.id);
                                }}
                                className="w-7 h-7 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                                title="Ver detalle del terreno"
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
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No se encontraron terrenos con los filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination (Exact PDF Model) */}
            <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <p>
                Mostrando {paginatedLots.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
                {Math.min(currentPage * pageSize, filteredLots.length)} de {filteredLots.length} terrenos
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 cursor-pointer hover:bg-slate-50"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 cursor-pointer hover:bg-slate-50"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT 1 COLUMN: DETALLE DE TERRENO DRAWER (EXACT PDF MODEL)         */}
        {/* =================================================================== */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {selectedLot ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Header (Identical to Detalle de venta in PDF) */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-black text-slate-800">
                    Detalle de terreno
                  </h2>
                </div>
                <span className="px-2.5 py-1 bg-emerald-800 text-white font-mono text-xs font-bold rounded-lg shadow-xs">
                  {selectedLot.id}
                </span>
              </div>

              {/* Información de la Urbanización e Inmueble */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  Urbanización y Terreno
                </h3>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <img
                    src={currentUrb.image}
                    alt={currentUrb.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900">
                      {currentUrb.name}
                    </h4>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">
                      {selectedLot.lotNumber} &bull; {selectedLot.block}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Superficie: {selectedLot.surface} m² ({selectedLot.front}m x {selectedLot.depth}m)
                    </p>
                  </div>
                </div>
              </div>

              {/* Ubicación Vial Respecto a la Avenida */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                  Ubicación Vial en la Urbanización
                </h3>

                {(() => {
                  const badge = getLocationBadge(selectedLot);
                  return (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                          selectedLot.hasAvenueAccess
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-orange-100 text-orange-900 border border-orange-300'
                        }`}>
                          {selectedLot.hasAvenueAccess ? '✓ Con salida a Avenida' : 'Sin salida directa a Av.'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">
                        Vía: {selectedLot.streetName || currentUrb.mainAvenueName || 'Calle Interna'}
                      </p>
                      {selectedLot.cornerStreets && (
                        <p className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          📐 Intersección: {selectedLot.cornerStreets}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 font-medium">
                        {badge.desc}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* Croquis Catastral Dibujado en el Sistema (Sin Google Maps) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-700" />
                    Croquis del Terreno (Plano del Sistema)
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800">
                    {selectedLot.front}m x {selectedLot.depth}m
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex flex-col items-center">
                  <svg viewBox="0 0 300 155" className="w-full h-36">
                    {/* Top road representation */}
                    <rect
                      x="15"
                      y="6"
                      width="270"
                      height="26"
                      rx="5"
                      fill={selectedLot.hasAvenueAccess ? '#1e293b' : '#cbd5e1'}
                    />
                    {selectedLot.hasAvenueAccess && (
                      <line x1="25" y1="19" x2="275" y2="19" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 4" />
                    )}
                    <text
                      x="150"
                      y="22"
                      textAnchor="middle"
                      fill={selectedLot.hasAvenueAccess ? '#fde68a' : '#1e293b'}
                      fontSize="8.5"
                      fontWeight="bold"
                    >
                      {selectedLot.hasAvenueAccess
                        ? `🛣️ ${selectedLot.streetName || 'AVENIDA PRINCIPAL'}`
                        : `🏘️ ${selectedLot.streetName || 'PASAJE / CALLE INTERNA'}`}
                    </text>

                    {/* Parcel Polygon */}
                    <rect
                      x="55"
                      y="40"
                      width="190"
                      height="95"
                      rx="6"
                      fill="#ecfdf5"
                      stroke="#059669"
                      strokeWidth="2.5"
                    />
                    <text x="150" y="54" textAnchor="middle" fill="#065f46" fontSize="9.5" fontWeight="bold">
                      FRENTE: {selectedLot.front} METROS
                    </text>
                    <rect x="95" y="66" width="110" height="36" rx="6" fill="#ffffff" stroke="#10b981" strokeWidth="1.5" />
                    <text x="150" y="84" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="900">
                      {selectedLot.surface} m²
                    </text>
                    <text x="150" y="96" textAnchor="middle" fill="#059669" fontSize="8" fontWeight="bold">
                      {selectedLot.lotNumber.toUpperCase()}
                    </text>
                    <text x="45" y="90" textAnchor="middle" fill="#475569" fontSize="8.5" fontWeight="bold" transform="rotate(-90 45 90)">
                      FONDO {selectedLot.depth}m
                    </text>
                    <text x="257" y="90" textAnchor="middle" fill="#475569" fontSize="8.5" fontWeight="bold" transform="rotate(90 257 90)">
                      FONDO {selectedLot.depth}m
                    </text>
                    <text x="150" y="148" textAnchor="middle" fill="#64748b" fontSize="8.5" fontWeight="bold">
                      LINDERO POSTERIOR: {selectedLot.front}m
                    </text>
                  </svg>

                  <div className="grid grid-cols-3 gap-2 w-full pt-2 text-[11px]">
                    <div className="flex items-center justify-center gap-1 p-1.5 bg-white rounded-lg border border-slate-200 font-bold text-slate-700">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span>Agua</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 p-1.5 bg-white rounded-lg border border-slate-200 font-bold text-slate-700">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Luz</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 p-1.5 bg-white rounded-lg border border-slate-200 font-bold text-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Folio Real</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos Económicos del Terreno (PDF Key-Value List Style) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                  Datos económicos y financiamiento
                </h3>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Precio al contado:</span>
                  <span className="font-black text-slate-900 text-sm">
                    Bs. {selectedLot.priceBs.toLocaleString('es-BO')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Equivalente en dólares:</span>
                  <span className="font-bold text-slate-800">
                    $us. {selectedLot.priceUsd.toLocaleString('es-BO')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Cuota inicial sugerida (20%):</span>
                  <span className="font-bold text-emerald-800">
                    Bs. {Math.round(selectedLot.priceBs * 0.2).toLocaleString('es-BO')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Plazo 36 cuotas mensuales:</span>
                  <span className="font-bold text-slate-800">
                    Bs. {Math.round((selectedLot.priceBs * 0.8) / 36).toLocaleString('es-BO')} / mes
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-medium">Estado actual:</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-[11px]">
                    {selectedLot.status}
                  </span>
                </div>
              </div>

              {/* Botones de Acción (Venta / WhatsApp / Revertir) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                {selectedLot.status === 'Disponible' ? (
                  <button
                    onClick={() => onSelectLotForSale(selectedLot, currentUrb)}
                    className="w-full py-3 px-4 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-300" />
                    <span>Registrar Venta de {selectedLot.lotNumber}</span>
                  </button>
                ) : selectedLot.status === 'En Moratoria' ? (
                  <button
                    type="button"
                    onClick={() => handleRevertLot(selectedLot)}
                    className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-200" />
                    <span>Revertir Terreno a Disponible</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={shareViaWhatsApp}
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-200 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-700" />
                  <span>Compartir Ficha por WhatsApp</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-emerald-700" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              Selecciona un terreno del plano o tabla para ver su detalle completo.
            </div>
          )}
        </div>
      </div>

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
