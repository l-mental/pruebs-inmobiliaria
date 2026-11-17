import React, { useState, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ShoppingBag,
  Printer,
  Compass,
  Upload,
  FileImage,
  Trash2,
  LayoutGrid,
} from 'lucide-react';
import { Lot, Urbanization } from '../../types';

interface InteractiveMapViewProps {
  lots: Lot[];
  urbanization: Urbanization;
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
  onSelectForSale: (lot: Lot, urb: Urbanization) => void;
  onUpdateUrbanization?: (urb: Urbanization) => void;
  exchangeRate?: number;
}

// Coordinate helpers to orient the blueprint horizontally (Landscape 1380 x 700)
const tx = (_x: number, y: number) => y;
const ty = (x: number, _y: number) => 695 - x;
const tp = (pts: Array<[number, number]>) =>
  pts.map(([x, y]) => `${tx(x, y)},${ty(x, y)}`).join(' ');

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  lots,
  urbanization,
  selectedLot,
  onSelectLot,
  onSelectForSale,
  onUpdateUrbanization,
  exchangeRate = 6.96,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorMode, setColorMode] = useState<'cad' | 'comercial'>('cad');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const hasPlan = Boolean(urbanization.hasCadastralPlan || urbanization.cadastralPlanImage);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('label')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleUploadPlanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateUrbanization) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) {
        onUpdateUrbanization({
          ...urbanization,
          hasCadastralPlan: true,
          cadastralPlanImage: result,
          cadastralPlanName: file.name,
        });
        resetView();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleLoadSystemPlan = () => {
    if (!onUpdateUrbanization) return;
    onUpdateUrbanization({
      ...urbanization,
      hasCadastralPlan: true,
      cadastralPlanImage: undefined,
      cadastralPlanName: undefined,
    });
    resetView();
  };

  const handleClearPlan = () => {
    if (!onUpdateUrbanization) return;
    onUpdateUrbanization({
      ...urbanization,
      hasCadastralPlan: false,
      cadastralPlanImage: undefined,
      cadastralPlanName: undefined,
    });
    resetView();
  };

  const getLotAt = (index: number): Lot | undefined => {
    if (lots.length === 0) return undefined;
    return lots[index % lots.length];
  };

  // Horizontal Manzano renderer: transforms original vertical coords -> landscape horizontal coords
  // while keeping all lot numbers, Manzano circles, and SUP. UTIL labels upright.
  const renderCadManzano = (config: {
    manzanoNum: string;
    x: number;
    y: number;
    width: number;
    height: number;
    cols: number;
    rows: number;
    lotStartIndex: number;
    rotate?: number;
    isAvenueFront?: boolean;
    hasPasaje?: boolean;
  }) => {
    const {
      manzanoNum,
      x,
      y,
      width,
      height,
      cols,
      rows,
      lotStartIndex,
      rotate = 0,
      isAvenueFront = false,
      hasPasaje = false,
    } = config;

    // Landscape transform: vertical length becomes horizontal width, width becomes vertical height
    const hx = y;
    const hy = 695 - (x + width);
    const hWidth = height;
    const hHeight = width;
    const hCols = rows;
    const hRows = cols;

    const cellW = hWidth / hCols;
    const cellH = hHeight / hRows;
    const cells = [];

    let localNum = 1;
    for (let r = 0; r < hRows; r++) {
      for (let c = 0; c < hCols; c++) {
        const lotIndex = lotStartIndex + (c * hRows + r);
        const lot = getLotAt(lotIndex);
        const isSelected = selectedLot && lot && selectedLot.id === lot.id;
        const isCorner = (r === 0 || r === hRows - 1) && (c === 0 || c === hCols - 1);
        const isAvenue = isAvenueFront && r === 0;

        let fill = '#ffffff';
        let stroke = '#1e3a8a';

        if (colorMode === 'comercial' && lot) {
          if (lot.status === 'Disponible') {
            fill = '#dcfce7';
            stroke = '#15803d';
          } else if (lot.status === 'Reservado') {
            fill = '#fef3c7';
            stroke = '#b45309';
          } else if (lot.status === 'Vendido') {
            fill = '#e2e8f0';
            stroke = '#475569';
          } else if (lot.status === 'En Moratoria') {
            fill = '#ffe4e6';
            stroke = '#be123c';
          }
        } else if (lot) {
          if (isSelected) {
            fill = '#fef08a';
          } else if (lot.status === 'Vendido') {
            fill = '#f8fafc';
          }
        }

        if (isSelected) {
          fill = '#fde047';
          stroke = '#dc2626';
        }

        const cx = c * cellW;
        const cy = r * cellH;
        const supText = lot ? `${lot.surface.toFixed(2)}` : isCorner ? '294.63' : '300.00';
        const frontM = lot ? `${lot.front.toFixed(2)}m` : '12.00m';

        cells.push(
          <g
            key={`${manzanoNum}-${r}-${c}`}
            onClick={(e) => {
              e.stopPropagation();
              if (lot) onSelectLot(lot);
            }}
            className="cursor-pointer group"
          >
            <rect
              x={cx}
              y={cy}
              width={cellW}
              height={cellH}
              fill={fill}
              stroke={stroke}
              strokeWidth={isSelected ? 1.8 : 0.65}
              className="transition-colors group-hover:fill-amber-100/90"
            />

            {isCorner && (
              <text
                x={c === 0 ? cx + 1.5 : cx + cellW - 1.5}
                y={r === 0 ? cy + 4 : cy + cellH - 1.5}
                textAnchor={c === 0 ? 'start' : 'end'}
                fontSize="2.8"
                fill="#0f172a"
                fontFamily="monospace"
              >
                R5.00m
              </text>
            )}

            <text
              x={cx + cellW / 2}
              y={r === 0 ? cy + 4 : cy + cellH - 1.5}
              textAnchor="middle"
              fontSize="3.1"
              fill="#334155"
              fontFamily="monospace"
            >
              {frontM}
            </text>

            {/* Blue circled lot number */}
            <circle
              cx={cx + cellW - 5}
              cy={cy + 5.5}
              r="3.2"
              fill={isSelected ? '#dc2626' : '#eff6ff'}
              stroke={isSelected ? '#991b1b' : '#1d4ed8'}
              strokeWidth="0.55"
            />
            <text
              x={cx + cellW - 5}
              y={cy + 6.6}
              textAnchor="middle"
              fontSize="3.4"
              fontWeight="bold"
              fill={isSelected ? '#ffffff' : '#1e40af'}
            >
              {localNum}
            </text>

            <text
              x={cx + cellW / 2}
              y={cy + cellH / 2 + 0.5}
              textAnchor="middle"
              fontSize="3.2"
              fontWeight="bold"
              fill="#0f172a"
            >
              SUP.
            </text>
            <text
              x={cx + cellW / 2}
              y={cy + cellH / 2 + 4.3}
              textAnchor="middle"
              fontSize="3.4"
              fontWeight="900"
              fill="#0f172a"
            >
              {supText} m²
            </text>

            {isAvenue && (
              <rect
                x={cx + 0.8}
                y={cy + 0.5}
                width={cellW - 1.6}
                height="1.4"
                fill="#059669"
                opacity="0.75"
              />
            )}
            {hasPasaje && r === hRows - 1 && (
              <rect
                x={cx + 0.8}
                y={cy + cellH - 1.8}
                width={cellW - 1.6}
                height="1.3"
                fill="#ea580c"
                opacity="0.75"
              />
            )}
          </g>
        );
        localNum++;
      }
    }

    return (
      <g
        key={`manzano-${manzanoNum}`}
        transform={`translate(${hx}, ${hy}) ${rotate ? `rotate(${rotate} ${hWidth / 2} ${hHeight / 2})` : ''}`}
      >
        <rect
          x={-3.5}
          y={-3.5}
          width={hWidth + 7}
          height={hHeight + 7}
          rx="5"
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth="0.9"
        />
        <rect
          x={0}
          y={0}
          width={hWidth}
          height={hHeight}
          rx="2.5"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth="1.1"
        />

        {cells}

        {/* Red circled Manzano number upright in center */}
        <g transform={`translate(${hWidth / 2}, ${hHeight / 2})`} className="pointer-events-none">
          <circle
            cx="0"
            cy="0"
            r="8.2"
            fill="#ffffff"
            fillOpacity="0.92"
            stroke="#dc2626"
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="900"
            fill="#dc2626"
          >
            {manzanoNum}
          </text>
        </g>
      </g>
    );
  };

  const renderTreeCluster = (trees: Array<{ x: number; y: number; r: number }>) => {
    return trees.map((t, idx) => (
      <g key={idx} transform={`translate(${tx(t.x, t.y)}, ${ty(t.x, t.y)})`}>
        <circle cx="0" cy="0" r={t.r} fill="#15803d" fillOpacity="0.85" stroke="#052e16" strokeWidth="0.6" />
        <circle cx={-t.r * 0.35} cy={-t.r * 0.3} r={t.r * 0.45} fill="#22c55e" />
        <circle cx={t.r * 0.3} cy={t.r * 0.25} r={t.r * 0.4} fill="#166534" />
        <circle cx="0" cy="0" r="1" fill="#052e16" />
      </g>
    ));
  };

  const selectedLotUsd = selectedLot
    ? (selectedLot.priceUsd || Math.round(selectedLot.priceBs / exchangeRate))
    : 0;

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-md ${
        isFullscreen ? 'fixed inset-0 sm:inset-2 z-50 rounded-none sm:rounded-2xl' : 'relative'
      }`}
    >
      {/* Hidden File Input for Uploading Cadastral Plan */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUploadPlanFile}
        className="hidden"
      />

      {/* TOP BAR */}
      <div className="bg-[#0f172a] text-white px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-300 font-bold truncate">
                PLANO CATASTRAL HORIZONTAL DEL SISTEMA
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold shrink-0">
                {hasPlan ? 'G.A.M.C.B.B.A.' : 'Sin Plano'}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm md:text-base font-black text-white truncate">
              {urbanization.name} &bull; <span className="text-emerald-300 font-semibold">{urbanization.location}</span>
            </h3>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {hasPlan && !urbanization.cadastralPlanImage && (
            <div className="flex items-center bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-700 text-[11px] sm:text-xs font-bold">
              <button
                type="button"
                onClick={() => setColorMode('cad')}
                className={`px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  colorMode === 'cad'
                    ? 'bg-white text-slate-950 font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Técnico CAD
              </button>
              <button
                type="button"
                onClick={() => setColorMode('comercial')}
                className={`px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  colorMode === 'comercial'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Comercial
              </button>
            </div>
          )}

          {onUpdateUrbanization && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] sm:text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Insertar plano catastral (imagen)"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{hasPlan ? 'Cambiar Plano' : 'Insertar Plano'}</span>
              </button>
              {hasPlan && (
                <button
                  type="button"
                  onClick={handleClearPlan}
                  className="p-1.5 sm:p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl border border-rose-500/40 cursor-pointer transition-colors"
                  title="Quitar plano (dejar en blanco)"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          )}

          {hasPlan && (
            <>
              <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.65, +(z - 0.2).toFixed(2)))}
                  className="p-1 sm:p-1.5 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer"
                  title="Alejar plano"
                >
                  <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="px-1.5 sm:px-2 text-[10px] sm:text-xs font-mono font-bold text-amber-300">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(2.6, +(z + 0.2).toFixed(2)))}
                  className="p-1 sm:p-1.5 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer"
                  title="Acercar plano"
                >
                  <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="p-1 sm:p-1.5 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer"
                  title="Restablecer vista"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] sm:text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Imprimir Plano Catastral"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </div>

      {/* CANVAS AREA */}
      {!hasPlan ? (
        /* BLANK CADASTRAL PLAN STATE WHEN NO PLAN HAS BEEN INSERTED FOR THIS URBANIZATION */
        <div
          className={`w-full ${
            isFullscreen ? 'flex-1' : 'h-[420px] sm:h-[520px]'
          } bg-slate-50 flex flex-col items-center justify-center p-6 text-center`}
        >
          <div className="max-w-md w-full bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
              <FileImage className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                Plano Catastral en Blanco
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                La urbanización <strong className="text-slate-800">{urbanization.name}</strong> aún no tiene un plano catastral insertado. Inserta una imagen del plano o carga el trazado base del sistema.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>Insertar Plano Catastral</span>
              </button>
              <button
                type="button"
                onClick={handleLoadSystemPlan}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LayoutGrid className="w-4 h-4 text-emerald-700" />
                <span>Cargar Plano CAD Base</span>
              </button>
            </div>
          </div>
        </div>
      ) : urbanization.cadastralPlanImage ? (
        /* USER-INSERTED CADASTRAL PLAN IMAGE IN HORIZONTAL LANDSCAPE CONTAINER */
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative w-full ${
            isFullscreen ? 'flex-1' : 'h-[420px] sm:h-[520px] lg:h-[600px]'
          } bg-white overflow-hidden select-none flex items-center justify-center ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <img
            src={urbanization.cadastralPlanImage}
            alt={`Plano Catastral de ${urbanization.name}`}
            draggable={false}
            className="max-w-full max-h-full object-contain pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          />
          {urbanization.cadastralPlanName && (
            <div className="absolute top-3 left-3 bg-[#0f172a]/85 text-white px-3 py-1 rounded-lg text-[11px] font-bold">
              Archivo: {urbanization.cadastralPlanName}
            </div>
          )}
        </div>
      ) : (
        /* HORIZONTAL LANDSCAPE SYSTEM CAD BLUEPRINT (RIGHT TABLE REMOVED) */
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`relative w-full ${
            isFullscreen ? 'flex-1' : 'h-[400px] sm:h-[520px] lg:h-[600px]'
          } bg-white overflow-hidden select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <svg
            viewBox="0 0 1380 700"
            className="w-full h-full"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <defs>
              <pattern id="equipHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#d97706" strokeWidth="0.6" strokeOpacity="0.35" />
              </pattern>
              <pattern id="sandStipple" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="0.6" fill="#92400e" fillOpacity="0.35" />
                <circle cx="9" cy="7" r="0.7" fill="#b45309" fillOpacity="0.3" />
                <circle cx="5" cy="10" r="0.5" fill="#78350f" fillOpacity="0.3" />
              </pattern>
            </defs>

            {/* Blueprint Sheet Outer Border (Horizontal Landscape) */}
            <rect x="8" y="8" width="1364" height="684" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />

            {/* 1. NORTH ARROW (Top Left open space) */}
            <g transform="translate(82, 495) rotate(-72)">
              <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#0f172a" strokeWidth="2.2" />
              <circle cx="0" cy="0" r="22" fill="none" stroke="#0f172a" strokeWidth="0.8" />
              <polygon points="0,-22 -14,16 0,7" fill="#0f172a" />
              <polygon points="0,-22 14,16 0,7" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
              <text x="0" y="-26" textAnchor="middle" fontSize="12" fontWeight="900" fill="#0f172a">
                N
              </text>
            </g>

            {/* 2. URBANIZATION PERIMETER POLYGON (HORIZONTALLY ORIENTED) */}
            <polygon
              points={tp([
                [580, 45],
                [645, 45],
                [655, 710],
                [665, 1345],
                [480, 1300],
                [315, 1230],
                [105, 980],
                [155, 910],
                [30, 785],
                [110, 750],
                [115, 410],
                [385, 175],
              ])}
              fill="#f8fafc"
              stroke="#0f172a"
              strokeWidth="2.2"
            />

            {/* Main Diagonal Access Avenue Label (Left Diagonal Side) */}
            <g transform={`translate(${tx(320, 230)}, ${ty(320, 230)}) rotate(49)`}>
              <rect x="-150" y="-11" width="300" height="17" fill="#f1f5f9" stroke="#475569" strokeWidth="0.7" />
              <text x="0" y="0" textAnchor="middle" fontSize="7.2" fontWeight="900" fill="#0f172a" letterSpacing="0.8">
                {urbanization.mainAvenueName?.toUpperCase() || 'AV. PRINCIPAL DE ACCESO DE 25.00 m.'}
              </text>
            </g>

            {/* Top Horizontal Perimeter Avenue Labels (12.00m) */}
            <text x="340" y="32" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0f172a">
              C. INNOMINADA DE 12.00 m. (AVENIDA LATERAL NORTE)
            </text>
            <text x="1020" y="26" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0f172a">
              C. INNOMINADA DE 12.00 m. (AVENIDA LATERAL NORTE)
            </text>

            {/* 3. QUEBRADAS (HORIZONTAL CORRIDORS) */}
            <path
              d={`M ${tx(325, 268)} ${ty(325, 268)} Q ${tx(475, 220)} ${ty(475, 220)} ${tx(646, 182)} ${ty(646, 182)} L ${tx(646, 205)} ${ty(646, 205)} Q ${tx(475, 245)} ${ty(475, 245)} ${tx(325, 292)} ${ty(325, 292)} Z`}
              fill="#fffbeb"
              stroke="#475569"
              strokeWidth="1"
            />
            <text
              x={tx(490, 233)}
              y={ty(490, 233)}
              textAnchor="middle"
              fontSize="6.5"
              fontWeight="bold"
              fill="#334155"
              transform={`rotate(74 ${tx(490, 233)} ${ty(490, 233)})`}
            >
              QUEBRADA (FRANJA SEG.)
            </text>

            <path
              d={`M ${tx(275, 820)} ${ty(275, 820)} Q ${tx(380, 795)} ${ty(380, 795)} ${tx(450, 770)} ${ty(450, 770)} Q ${tx(545, 735)} ${ty(545, 735)} ${tx(654, 715)} ${ty(654, 715)} L ${tx(654, 755)} ${ty(654, 755)} Q ${tx(545, 775)} ${ty(545, 775)} ${tx(455, 815)} ${ty(455, 815)} Q ${tx(380, 835)} ${ty(380, 835)} ${tx(285, 852)} ${ty(285, 852)} Z`}
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            <text
              x={tx(550, 738)}
              y={ty(550, 738)}
              textAnchor="middle"
              fontSize="7"
              fontWeight="bold"
              fill="#0f172a"
              transform={`rotate(75 ${tx(550, 738)} ${ty(550, 738)})`}
            >
              QUEBRADA
            </text>

            {/* 4. GREEN AREAS WITH TREES */}
            <g>
              <polygon
                points={tp([[120, 405], [198, 375], [202, 625], [112, 642]])}
                fill="#4ade80"
                stroke="#15803d"
                strokeWidth="1.5"
              />
              {renderTreeCluster([
                { x: 145, y: 405, r: 9 },
                { x: 175, y: 398, r: 11 },
                { x: 135, y: 440, r: 10 },
                { x: 182, y: 445, r: 8 },
                { x: 160, y: 485, r: 9 },
                { x: 140, y: 530, r: 11 },
                { x: 185, y: 540, r: 9 },
                { x: 138, y: 590, r: 12 },
                { x: 178, y: 605, r: 10 },
              ])}
              <text x={tx(160, 565)} y={ty(160, 565) - 3} textAnchor="middle" fontSize="8" fontWeight="900" fill="#052e16">
                AREA VERDE
              </text>
              <text x={tx(160, 565)} y={ty(160, 565) + 7} textAnchor="middle" fontSize="8" fontWeight="900" fill="#052e16">
                19356.84
              </text>
            </g>

            <g>
              <polygon
                points={tp([[218, 555], [262, 555], [278, 618], [222, 625]])}
                fill="#22c55e"
                stroke="#14532d"
                strokeWidth="1.2"
              />
              {renderTreeCluster([
                { x: 232, y: 572, r: 7 },
                { x: 256, y: 602, r: 8 },
              ])}
              <text x={tx(247, 588)} y={ty(247, 588) - 2} textAnchor="middle" fontSize="6" fontWeight="900" fill="#052e16">
                AREA VERDE
              </text>
              <text x={tx(247, 588)} y={ty(247, 588) + 6} textAnchor="middle" fontSize="5.8" fontWeight="bold" fill="#052e16">
                2996.52
              </text>
            </g>

            {/* Manzano 47 Green Area */}
            <g>
              <rect
                x={512}
                y={695 - (572 + 66)}
                width={46}
                height={66}
                rx="4"
                fill="#4ade80"
                stroke="#15803d"
                strokeWidth="1.2"
              />
              {renderTreeCluster([
                { x: 586, y: 526, r: 7 },
                { x: 622, y: 525, r: 8 },
                { x: 618, y: 546, r: 7 },
              ])}
              <circle cx={tx(603, 535)} cy={ty(603, 535)} r="7" fill="#ffffff" stroke="#dc2626" strokeWidth="1.2" />
              <text x={tx(603, 535)} y={ty(603, 535) + 2.5} textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#dc2626">47</text>
            </g>

            {/* Center Diagonal Green Strip (Manzano 28) */}
            <g>
              <polygon
                points={tp([[465, 795], [505, 775], [568, 895], [538, 915]])}
                fill="#4ade80"
                stroke="#15803d"
                strokeWidth="1.2"
              />
              {renderTreeCluster([
                { x: 485, y: 805, r: 8 },
                { x: 515, y: 845, r: 9 },
                { x: 545, y: 885, r: 8 },
              ])}
              <circle cx={tx(502, 825)} cy={ty(502, 825)} r="7" fill="#ffffff" stroke="#dc2626" strokeWidth="1.2" />
              <text x={tx(502, 825)} y={ty(502, 825) + 2.5} textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#dc2626">28</text>
            </g>

            {/* Manzano 50 Green Strip */}
            <g>
              <rect
                x={885}
                y={695 - (588 + 58)}
                width={36}
                height={58}
                rx="4"
                fill="#4ade80"
                stroke="#15803d"
                strokeWidth="1.2"
              />
              {renderTreeCluster([
                { x: 602, y: 902, r: 7 },
                { x: 632, y: 904, r: 7 },
              ])}
              <circle cx={tx(617, 902)} cy={ty(617, 902)} r="6.5" fill="#ffffff" stroke="#dc2626" strokeWidth="1.2" />
              <text x={tx(617, 902)} y={ty(617, 902) + 2.5} textAnchor="middle" fontSize="6" fontWeight="900" fill="#dc2626">50</text>
            </g>

            {/* Right-Top Large AREA VERDE 7720.82 */}
            <g>
              <polygon
                points={tp([[465, 1235], [588, 1195], [605, 1125], [648, 1125], [656, 1332], [470, 1282]])}
                fill="#4ade80"
                stroke="#15803d"
                strokeWidth="1.4"
              />
              {renderTreeCluster([
                { x: 618, y: 1155, r: 10 },
                { x: 625, y: 1205, r: 11 },
                { x: 595, y: 1245, r: 12 },
                { x: 632, y: 1268, r: 10 },
                { x: 540, y: 1255, r: 9 },
                { x: 495, y: 1252, r: 8 },
              ])}
              <text x={tx(560, 1275)} y={ty(560, 1275)} textAnchor="middle" fontSize="7.2" fontWeight="900" fill="#052e16">
                AREA VERDE 7720.82 m²
              </text>
            </g>

            {/* 5. AREA DE EQUIPAMIENTO & SPORTS COMPLEX */}
            <g>
              <polygon
                points={tp([[152, 648], [232, 638], [258, 765], [205, 772], [195, 705], [152, 708]])}
                fill="#fde68a"
                fillOpacity="0.45"
                stroke="#92400e"
                strokeWidth="1.2"
              />
              <polygon
                points={tp([[152, 648], [232, 638], [258, 765], [205, 772], [195, 705], [152, 708]])}
                fill="url(#equipHatch)"
              />
              <text x={tx(198, 695)} y={ty(198, 695) - 3} textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#78350f">
                AREA DE EQUIPAMIENTO
              </text>
              <text x={tx(198, 695)} y={ty(198, 695) + 6} textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#78350f">
                12622.65 m²
              </text>
            </g>

            {/* Central Equipment Block with Cancha Múltiple */}
            <g>
              <polygon
                points={tp([[405, 642], [568, 642], [572, 718], [422, 762]])}
                fill="#fef3c7"
                stroke="#b45309"
                strokeWidth="1.2"
              />
              <polygon
                points={tp([[405, 642], [568, 642], [572, 718], [422, 762]])}
                fill="url(#sandStipple)"
              />
              <g transform={`translate(646, ${695 - 540})`}>
                <rect x="0" y="0" width="66" height="46" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
                <rect x="5" y="5" width="26" height="36" fill="#ecfdf5" stroke="#dc2626" strokeWidth="0.9" />
                <line x1="5" y1="23" x2="31" y2="23" stroke="#1d4ed8" strokeWidth="0.7" />
                <circle cx="18" cy="23" r="4.5" fill="none" stroke="#dc2626" strokeWidth="0.7" />
                <rect x="36" y="5" width="25" height="16" fill="#eff6ff" stroke="#1e40af" strokeWidth="0.8" />
                <text x="48.5" y="14" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#1e3a8a">
                  SALON MULT.
                </text>
                <rect x="36" y="24" width="25" height="17" fill="#fef2f2" stroke="#b91c1c" strokeWidth="0.8" />
                <text x="48.5" y="34" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#991b1b">
                  MOD. POLICIAL
                </text>
              </g>
              <text x={tx(445, 700)} y={ty(445, 700)} textAnchor="middle" fontSize="6.2" fontWeight="900" fill="#78350f">
                EQUIPAMIENTO 7992.03 m²
              </text>
            </g>

            {/* 6. ALL MANZANOS & LOTS (HORIZONTAL LAYOUT) */}
            {renderCadManzano({ manzanoNum: '8', x: 500, y: 72, width: 52, height: 105, cols: 2, rows: 5, lotStartIndex: 0, isAvenueFront: true })}
            {renderCadManzano({ manzanoNum: '9', x: 572, y: 65, width: 65, height: 108, cols: 2, rows: 5, lotStartIndex: 2, isAvenueFront: true })}
            {renderCadManzano({ manzanoNum: '6', x: 432, y: 120, width: 52, height: 95, cols: 2, rows: 4, lotStartIndex: 4, isAvenueFront: true })}
            {renderCadManzano({ manzanoNum: '4', x: 365, y: 172, width: 52, height: 85, cols: 2, rows: 4, lotStartIndex: 6, isAvenueFront: true })}
            {renderCadManzano({ manzanoNum: '2', x: 282, y: 270, width: 65, height: 92, cols: 2, rows: 4, lotStartIndex: 8, isAvenueFront: true })}
            {renderCadManzano({ manzanoNum: '1', x: 212, y: 292, width: 55, height: 70, cols: 2, rows: 3, lotStartIndex: 10, isAvenueFront: true })}

            {renderCadManzano({ manzanoNum: '7', x: 436, y: 262, width: 56, height: 92, cols: 2, rows: 4, lotStartIndex: 12 })}
            {renderCadManzano({ manzanoNum: '10', x: 506, y: 238, width: 56, height: 116, cols: 2, rows: 5, lotStartIndex: 14 })}
            {renderCadManzano({ manzanoNum: '11', x: 576, y: 215, width: 64, height: 138, cols: 2, rows: 6, lotStartIndex: 16, isAvenueFront: true })}

            {renderCadManzano({ manzanoNum: '3', x: 214, y: 382, width: 56, height: 112, cols: 2, rows: 5, lotStartIndex: 0 })}
            {renderCadManzano({ manzanoNum: '5', x: 284, y: 382, width: 56, height: 112, cols: 2, rows: 5, lotStartIndex: 3 })}
            {renderCadManzano({ manzanoNum: '15', x: 356, y: 376, width: 72, height: 118, cols: 2, rows: 5, lotStartIndex: 6 })}
            {renderCadManzano({ manzanoNum: '16', x: 444, y: 376, width: 58, height: 118, cols: 2, rows: 5, lotStartIndex: 9 })}
            {renderCadManzano({ manzanoNum: '17', x: 516, y: 376, width: 46, height: 118, cols: 2, rows: 5, lotStartIndex: 12 })}
            {renderCadManzano({ manzanoNum: '18', x: 576, y: 376, width: 64, height: 118, cols: 2, rows: 5, lotStartIndex: 15, isAvenueFront: true })}

            {renderCadManzano({ manzanoNum: '19', x: 286, y: 514, width: 56, height: 102, cols: 2, rows: 4, lotStartIndex: 2, hasPasaje: true })}
            {renderCadManzano({ manzanoNum: '20', x: 358, y: 514, width: 74, height: 110, cols: 2, rows: 5, lotStartIndex: 5 })}
            {renderCadManzano({ manzanoNum: '21', x: 448, y: 514, width: 56, height: 110, cols: 2, rows: 5, lotStartIndex: 8 })}
            {renderCadManzano({ manzanoNum: '22', x: 518, y: 514, width: 44, height: 110, cols: 2, rows: 5, lotStartIndex: 11, hasPasaje: true })}
            {renderCadManzano({ manzanoNum: '23', x: 584, y: 568, width: 56, height: 132, cols: 2, rows: 6, lotStartIndex: 14, isAvenueFront: true })}

            {/* Horizontal Street Labels between Manzanos */}
            <text x="440" y={695 - 278 + 3} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a">
              C. INNOMINADA DE 9.00 m.
            </text>
            <text x="440" y={695 - 349 + 3} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a">
              C. INNOMINADA DE 12.00 m.
            </text>
            <text x="440" y={695 - 438 + 3} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a">
              C. INNOMINADA DE 9.00 m.
            </text>
            <text x="440" y={695 - 570 + 3} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a">
              PASAJE DE 6.00 m. (SIN SALIDA)
            </text>

            {/* West & Southwest Manzanos */}
            {renderCadManzano({ manzanoNum: '24', x: 332, y: 642, width: 62, height: 112, cols: 2, rows: 5, lotStartIndex: 1 })}
            {renderCadManzano({ manzanoNum: '25', x: 262, y: 642, width: 54, height: 112, cols: 2, rows: 5, lotStartIndex: 4 })}
            {renderCadManzano({ manzanoNum: '26', x: 152, y: 722, width: 56, height: 105, cols: 2, rows: 4, lotStartIndex: 7, rotate: -10 })}
            {renderCadManzano({ manzanoNum: '27', x: 88, y: 745, width: 52, height: 95, cols: 2, rows: 4, lotStartIndex: 10, rotate: -10, hasPasaje: true })}

            {/* East Sector Manzanos */}
            {renderCadManzano({ manzanoNum: '29', x: 522, y: 765, width: 52, height: 105, cols: 2, rows: 4, lotStartIndex: 13 })}
            {renderCadManzano({ manzanoNum: '30', x: 586, y: 765, width: 58, height: 105, cols: 2, rows: 4, lotStartIndex: 16, isAvenueFront: true })}

            {renderCadManzano({ manzanoNum: '35', x: 168, y: 865, width: 64, height: 95, cols: 2, rows: 4, lotStartIndex: 0, rotate: -22, isAvenueFront: true })}
            {renderCadManzano({ manzanoNum: '36', x: 245, y: 855, width: 62, height: 98, cols: 2, rows: 4, lotStartIndex: 3, rotate: -18 })}
            {renderCadManzano({ manzanoNum: '31', x: 405, y: 838, width: 58, height: 108, cols: 2, rows: 5, lotStartIndex: 6, rotate: -14 })}

            {renderCadManzano({ manzanoNum: '37', x: 235, y: 985, width: 64, height: 108, cols: 2, rows: 5, lotStartIndex: 9, rotate: -24, isAvenueFront: true })}
            {renderCadManzano({ manzanoNum: '38', x: 312, y: 970, width: 64, height: 112, cols: 2, rows: 5, lotStartIndex: 12, rotate: -20 })}
            {renderCadManzano({ manzanoNum: '39', x: 392, y: 965, width: 62, height: 112, cols: 2, rows: 5, lotStartIndex: 15, rotate: -16 })}
            {renderCadManzano({ manzanoNum: '40', x: 472, y: 945, width: 58, height: 115, cols: 2, rows: 5, lotStartIndex: 1, rotate: -12 })}
            {renderCadManzano({ manzanoNum: '44', x: 545, y: 935, width: 48, height: 145, cols: 2, rows: 6, lotStartIndex: 4, hasPasaje: true })}
            {renderCadManzano({ manzanoNum: '45', x: 604, y: 935, width: 46, height: 170, cols: 1, rows: 7, lotStartIndex: 7, isAvenueFront: true })}

            {renderCadManzano({ manzanoNum: '41', x: 315, y: 1108, width: 64, height: 105, cols: 2, rows: 4, lotStartIndex: 10, rotate: -22, isAvenueFront: true })}
            {renderCadManzano({ manzanoNum: '42', x: 396, y: 1098, width: 64, height: 108, cols: 2, rows: 5, lotStartIndex: 13, rotate: -16 })}
            {renderCadManzano({ manzanoNum: '43', x: 476, y: 1088, width: 58, height: 112, cols: 2, rows: 5, lotStartIndex: 16, rotate: -10 })}

            {/* 7. ROAD PROFILE DIAGRAMS (UPRIGHT AT BOTTOM LEFT) */}
            <g transform="translate(24, 582)">
              <rect x="0" y="0" width="185" height="92" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" rx="4" />
              <line x1="10" y1="58" x2="175" y2="58" stroke="#0f172a" strokeWidth="2" />
              <rect x="12" y="26" width="6" height="32" fill="#dc2626" />
              <rect x="35" y="42" width="3" height="16" fill="#78350f" />
              <circle cx="36.5" cy="34" r="10" fill="#16a34a" stroke="#052e16" strokeWidth="0.8" />
              <rect x="132" y="42" width="3" height="16" fill="#78350f" />
              <circle cx="133.5" cy="34" r="10" fill="#16a34a" stroke="#052e16" strokeWidth="0.8" />
              <rect x="76" y="44" width="22" height="11" rx="2" fill="#dc2626" />
              <rect x="79" y="46" width="16" height="5" fill="#bae6fd" />
              <circle cx="80" cy="56" r="2.5" fill="#0f172a" />
              <circle cx="94" cy="56" r="2.5" fill="#0f172a" />
              <polygon points="152,58 152,25 172,32 172,58" fill="#334155" />
              <line x1="20" y1="68" x2="152" y2="68" stroke="#0f172a" strokeWidth="0.8" />
              <text x="35" y="65" textAnchor="middle" fontSize="4.8" fontWeight="bold" fill="#0f172a">ACERA 1.50</text>
              <text x="86" y="65" textAnchor="middle" fontSize="5" fontWeight="900" fill="#dc2626">CALZADA 9.00m</text>
              <text x="136" y="65" textAnchor="middle" fontSize="4.8" fontWeight="bold" fill="#0f172a">ACERA 1.50</text>
              <text x="92" y="83" textAnchor="middle" fontSize="6" fontWeight="900" fill="#0f172a">
                ---- PERFIL DE VIA DE 12 Mts. ----
              </text>
            </g>

            <g transform="translate(222, 582)">
              <rect x="0" y="0" width="175" height="92" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" rx="4" />
              <line x1="12" y1="58" x2="162" y2="58" stroke="#0f172a" strokeWidth="1.8" />
              <line x1="48" y1="16" x2="48" y2="58" stroke="#0f172a" strokeWidth="2" />
              <line x1="48" y1="18" x2="22" y2="58" stroke="#d97706" strokeWidth="1" />
              <line x1="48" y1="18" x2="98" y2="58" stroke="#d97706" strokeWidth="1" />
              <polygon points="138,58 138,24 156,18 156,58" fill="#64748b" />
              <line x1="22" y1="68" x2="138" y2="68" stroke="#0f172a" strokeWidth="0.8" />
              <text x="82" y="65" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#0f172a">
                1.50 | CALZADA 6.00m | 1.50
              </text>
              <text x="87" y="83" textAnchor="middle" fontSize="6" fontWeight="900" fill="#0f172a">
                ---- PERFIL DE VIA DE 9 Mts. ----
              </text>
            </g>
          </svg>

          {/* FLOATING BOTTOM OVERLAY: SELECTED LOT QUICK BAR */}
          {selectedLot && (
            <div className="absolute bottom-3 left-3 right-3 bg-[#0f172a]/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-600 text-white font-black text-xs flex flex-col items-center justify-center border border-red-400 flex-shrink-0">
                  <span className="text-[9px] uppercase opacity-80">LOTE</span>
                  <span>{selectedLot.lotNumber.replace('Lote ', '')}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-sm text-white">
                      {selectedLot.lotNumber} &bull; {selectedLot.block}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                      SUP. UTIL {selectedLot.surface.toFixed(2)} m² ({selectedLot.front}m x {selectedLot.depth}m)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-600 text-[10px] font-bold">
                      {selectedLot.locationType || 'Calle Interna'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Vía: <strong className="text-white">{selectedLot.streetName || urbanization.mainAvenueName || 'C. Innominada de 9.00 m.'}</strong> &bull; Precio: <strong className="text-amber-300">Bs. {selectedLot.priceBs.toLocaleString('es-BO')}</strong> ($us. {selectedLotUsd.toLocaleString('es-BO')})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedLot.status === 'Disponible' && (
                  <button
                    type="button"
                    onClick={() => onSelectForSale(selectedLot, urbanization)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Vender este Terreno</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
