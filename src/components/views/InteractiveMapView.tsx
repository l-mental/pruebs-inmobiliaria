import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ShoppingBag,
  Printer,
  Eye,
  Compass,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { Lot, Urbanization } from '../../types';

interface InteractiveMapViewProps {
  lots: Lot[];
  urbanization: Urbanization;
  selectedLot: Lot | null;
  onSelectLot: (lot: Lot) => void;
  onSelectForSale: (lot: Lot, urb: Urbanization) => void;
}

export const InteractiveMapView: React.FC<InteractiveMapViewProps> = ({
  lots,
  urbanization,
  selectedLot,
  onSelectLot,
  onSelectForSale,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorMode, setColorMode] = useState<'cad' | 'comercial'>('cad');

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
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

  // Organize lots into Manzanos for the CAD Cadastral Blueprint
  // We map real lots from `lots` into our CAD blocks so every lot in the urbanization is clickable on the blueprint
  const getLotAt = (index: number): Lot | undefined => {
    if (lots.length === 0) return undefined;
    return lots[index % lots.length];
  };

  // Helper to render a CAD Manzano (Block) with chamfered R5.00m corners, red circled Manzano number,
  // individual lots with blue circled lot number, SUP. UTIL m2, 12.00m x 25.00m dimensions, and click selection
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

    const cellW = width / cols;
    const cellH = height / rows;
    const cells = [];

    let localNum = 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const lotIndex = lotStartIndex + (r * cols + c);
        const lot = getLotAt(lotIndex);
        const isSelected = selectedLot && lot && selectedLot.id === lot.id;
        const isCorner = (r === 0 || r === rows - 1) && (c === 0 || c === cols - 1);
        const isAvenue = isAvenueFront && r === 0;

        // Determine fill & stroke based on CAD mode vs Commercial mode
        let fill = '#ffffff';
        let stroke = '#1e3a8a'; // CAD technical blue-black line

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
          // Subtle tint in CAD mode so user can still distinguish location type or status on hover
          if (isSelected) {
            fill = '#fef08a';
          } else if (lot.status === 'Vendido' && colorMode === 'cad') {
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
        const depthM = lot ? `${lot.depth.toFixed(2)}m` : '25.00m';

        cells.push(
          <g
            key={`${manzanoNum}-${r}-${c}`}
            onClick={(e) => {
              e.stopPropagation();
              if (lot) onSelectLot(lot);
            }}
            className="cursor-pointer group"
          >
            {/* Lot Parcel Rectangle */}
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

            {/* Corner Chamfer Indicator R5.00m */}
            {isCorner && (
              <text
                x={c === 0 ? cx + 2 : cx + cellW - 2}
                y={r === 0 ? cy + 4.5 : cy + cellH - 2}
                textAnchor={c === 0 ? 'start' : 'end'}
                fontSize="3.4"
                fill="#0f172a"
                fontFamily="monospace"
              >
                R5.00m
              </text>
            )}

            {/* Frontage dimension (12.00m) */}
            <text
              x={cx + cellW / 2}
              y={r === 0 ? cy + 4.2 : cy + cellH - 1.8}
              textAnchor="middle"
              fontSize="3.5"
              fill="#334155"
              fontFamily="monospace"
            >
              {frontM}
            </text>

            {/* Depth dimension (25.00m) */}
            <text
              x={cx + 3.2}
              y={cy + cellH / 2}
              textAnchor="middle"
              fontSize="3.3"
              fill="#475569"
              fontFamily="monospace"
              transform={`rotate(-90 ${cx + 3.2} ${cy + cellH / 2})`}
            >
              {depthM}
            </text>

            {/* Blue Circled Lot Number (exact PDF style) */}
            <circle
              cx={cx + cellW - 6}
              cy={cy + 6.5}
              r="3.6"
              fill={isSelected ? '#dc2626' : '#eff6ff'}
              stroke={isSelected ? '#991b1b' : '#1d4ed8'}
              strokeWidth="0.6"
            />
            <text
              x={cx + cellW - 6}
              y={cy + 7.7}
              textAnchor="middle"
              fontSize="3.8"
              fontWeight="bold"
              fill={isSelected ? '#ffffff' : '#1e40af'}
            >
              {localNum}
            </text>

            {/* SUP. UTIL 300.00 m2 */}
            <text
              x={cx + cellW / 2}
              y={cy + cellH / 2 + 0.5}
              textAnchor="middle"
              fontSize="3.6"
              fontWeight="bold"
              fill="#0f172a"
            >
              SUP. UTIL
            </text>
            <text
              x={cx + cellW / 2}
              y={cy + cellH / 2 + 4.8}
              textAnchor="middle"
              fontSize="3.9"
              fontWeight="900"
              fill="#0f172a"
            >
              {supText} m2
            </text>

            {/* Location tag for Avenue / Corner / Pasaje */}
            {isAvenue && (
              <rect
                x={cx + 1}
                y={cy + 0.6}
                width={cellW - 2}
                height="1.5"
                fill="#059669"
                opacity="0.75"
              />
            )}
            {hasPasaje && r === rows - 1 && (
              <rect
                x={cx + 1}
                y={cy + cellH - 2}
                width={cellW - 2}
                height="1.4"
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
        transform={`translate(${x}, ${y}) ${rotate ? `rotate(${rotate} ${width / 2} ${height / 2})` : ''}`}
      >
        {/* Outer Manzano Sidewalk / Acera Perimetral (Double line like in CAD PDF) */}
        <rect
          x={-3.5}
          y={-3.5}
          width={width + 7}
          height={height + 7}
          rx="5"
          fill="#f8fafc"
          stroke="#334155"
          strokeWidth="0.9"
        />
        {/* Inner Manzano Lot Container */}
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          rx="2.5"
          fill="#ffffff"
          stroke="#0f172a"
          strokeWidth="1.1"
        />

        {/* Individual Lots */}
        {cells}

        {/* RED CIRCLED MANZANO NUMBER IN CENTER (Exact PDF Style) */}
        <g transform={`translate(${width / 2}, ${height / 2})`} className="pointer-events-none">
          <circle
            cx="0"
            cy="0"
            r="8.5"
            fill="#ffffff"
            fillOpacity="0.92"
            stroke="#dc2626"
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="3.2"
            textAnchor="middle"
            fontSize="9"
            fontWeight="900"
            fill="#dc2626"
          >
            {manzanoNum}
          </text>
        </g>
      </g>
    );
  };

  // Helper to render CAD Architectural Trees inside Green Areas
  const renderTreeCluster = (trees: Array<{ x: number; y: number; r: number }>) => {
    return trees.map((t, idx) => (
      <g key={idx} transform={`translate(${t.x}, ${t.y})`}>
        <circle cx="0" cy="0" r={t.r} fill="#15803d" fillOpacity="0.85" stroke="#052e16" strokeWidth="0.6" />
        <circle cx={-t.r * 0.35} cy={-t.r * 0.3} r={t.r * 0.45} fill="#22c55e" />
        <circle cx={t.r * 0.3} cy={t.r * 0.25} r={t.r * 0.4} fill="#166534" />
        <circle cx="0" cy="0" r="1" fill="#052e16" />
      </g>
    ));
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-md ${
        isFullscreen ? 'fixed inset-3 z-50' : 'relative'
      }`}
    >
      {/* ===================================================================== */}
      {/* TOP BAR: CAD CADASTRAL PLAN CONTROLS & COLOR MODE SWITCHER            */}
      {/* ===================================================================== */}
      <div className="bg-[#0f172a] text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                PLANO CATASTRAL OFICIAL DEL SISTEMA (MODELO PDF CAD)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                G.A.M.C.B.B.A.
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white">
              {urbanization.name} &bull; <span className="text-emerald-300 font-semibold">{urbanization.location}</span>
            </h3>
          </div>
        </div>

        {/* Controls: Mode Toggle + Zoom + Fullscreen */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CAD Mode vs Commercial Status Color Mode */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setColorMode('cad')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                colorMode === 'cad'
                  ? 'bg-white text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              📐 Plano Técnico PDF
            </button>
            <button
              type="button"
              onClick={() => setColorMode('comercial')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                colorMode === 'comercial'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🟢 Semáforo Comercial
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.65, +(z - 0.2).toFixed(2)))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer"
              title="Alejar plano"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-amber-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(2.6, +(z + 0.2).toFixed(2)))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer"
              title="Acercar plano"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-200 cursor-pointer"
              title="Restablecer vista"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Imprimir Plano Catastral"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Imprimir Plano</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* INTERACTIVE CAD BLUEPRINT CANVAS (EXACT REPLICA OF ATTACHED PDF)      */}
      {/* ===================================================================== */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full ${
          isFullscreen ? 'flex-1' : 'h-[760px]'
        } bg-white overflow-hidden select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          viewBox="0 0 1150 1380"
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Hatch pattern for Area de Equipamiento */}
            <pattern id="equipHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#d97706" strokeWidth="0.6" strokeOpacity="0.35" />
            </pattern>
            {/* Stipple grass pattern */}
            <pattern id="sandStipple" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="0.6" fill="#92400e" fillOpacity="0.35" />
              <circle cx="9" cy="7" r="0.7" fill="#b45309" fillOpacity="0.3" />
              <circle cx="5" cy="10" r="0.5" fill="#78350f" fillOpacity="0.3" />
            </pattern>
          </defs>

          {/* Blueprint Sheet Outer Border */}
          <rect x="8" y="8" width="1134" height="1364" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />

          {/* ================================================================= */}
          {/* 1. NORTH ARROW (ROSA DE LOS VIENTOS) - TOP LEFT OF PDF            */}
          {/* ================================================================= */}
          <g transform="translate(215, 78) rotate(18)">
            <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="0" cy="0" r="24" fill="none" stroke="#0f172a" strokeWidth="0.8" />
            {/* Left dark wing, right white wing */}
            <polygon points="0,-24 -16,18 0,8" fill="#0f172a" />
            <polygon points="0,-24 16,18 0,8" fill="#ffffff" stroke="#0f172a" strokeWidth="1.2" />
            <text x="0" y="-28" textAnchor="middle" fontSize="13" fontWeight="900" fill="#0f172a">
              N
            </text>
          </g>

          {/* ================================================================= */}
          {/* 2. URBANIZATION PERIMETER POLYGON (EXACT SILHOUETTE FROM PDF)     */}
          {/* ================================================================= */}
          <polygon
            points="580,45 645,45 655,710 665,1345 480,1300 315,1230 105,980 155,910 30,785 110,750 115,410 385,175"
            fill="#f8fafc"
            stroke="#0f172a"
            strokeWidth="2.2"
          />

          {/* Diagonal Perimeter Road Label (Top-Left Diagonal Avenue) */}
          <g transform="translate(320, 230) rotate(-41)">
            <rect x="-160" y="-12" width="320" height="18" fill="#f1f5f9" stroke="#475569" strokeWidth="0.7" />
            <text x="0" y="0" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#0f172a" letterSpacing="1">
              {urbanization.mainAvenueName?.toUpperCase() || 'AV. PRINCIPAL DE ACCESO DE 25.00 m.'}
            </text>
            <circle cx="-65" cy="0" r="8" fill="#fff7ed" stroke="#ea580c" strokeWidth="1.2" />
            <text x="-65" y="3" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#c2410c">60</text>
          </g>

          {/* Right Perimeter Avenue Label (12.00m) */}
          <text
            x="653"
            y="340"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="bold"
            fill="#0f172a"
            transform="rotate(90 653 340)"
          >
            C. INNOMINADA DE 12.00 m. (AVENIDA LATERAL ESTE)
          </text>
          <text
            x="661"
            y="1020"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="bold"
            fill="#0f172a"
            transform="rotate(90 661 1020)"
          >
            C. INNOMINADA DE 12.00 m. (AVENIDA LATERAL ESTE)
          </text>

          {/* ================================================================= */}
          {/* 3. QUEBRADAS (NATURAL RAVINE CORRIDORS AS IN PDF)                 */}
          {/* ================================================================= */}
          {/* Upper Quebrada Corridor */}
          <path
            d="M 325 268 Q 475 220 646 182 L 646 205 Q 475 245 325 292 Z"
            fill="#fffbeb"
            stroke="#475569"
            strokeWidth="1"
          />
          <text
            x="490"
            y="233"
            textAnchor="middle"
            fontSize="7"
            fontWeight="bold"
            fill="#334155"
            transform="rotate(-13 490 233)"
          >
            QUEBRADA ( FRANJA DE SEGURIDAD )
          </text>

          {/* Middle Quebrada & Central Plaza Corridor */}
          <path
            d="M 275 820 Q 380 795 450 770 Q 545 735 654 715 L 654 755 Q 545 775 455 815 Q 380 835 285 852 Z"
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="1.2"
          />
          <text
            x="550"
            y="742"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="bold"
            fill="#0f172a"
            transform="rotate(-11 550 742)"
          >
            QUEBRADA
          </text>

          {/* ================================================================= */}
          {/* 4. GREEN AREAS (AREA VERDE) WITH TREES (EXACT PDF POSITIONS)      */}
          {/* ================================================================= */}
          {/* Left Large AREA VERDE 19356.84 */}
          <g>
            <polygon
              points="120,405 198,375 202,625 112,642"
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
            <text x="160" y="565" textAnchor="middle" fontSize="8" fontWeight="900" fill="#052e16">
              AREA VERDE
            </text>
            <text x="160" y="576" textAnchor="middle" fontSize="8" fontWeight="900" fill="#052e16">
              19356.84
            </text>
          </g>

          {/* Left Secondary AREA VERDE 2996.52 */}
          <g>
            <polygon
              points="218,555 262,555 278,618 222,625"
              fill="#22c55e"
              stroke="#14532d"
              strokeWidth="1.2"
            />
            {renderTreeCluster([
              { x: 232, y: 572, r: 7 },
              { x: 256, y: 602, r: 8 },
            ])}
            <text x="247" y="586" textAnchor="middle" fontSize="6.2" fontWeight="900" fill="#052e16">
              AREA VERDE
            </text>
            <text x="247" y="594" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#052e16">
              2996.52
            </text>
          </g>

          {/* Right Middle AREA VERDE 2081.33 (Manzano 47) */}
          <g>
            <rect x="572" y="512" width="66" height="46" rx="4" fill="#4ade80" stroke="#15803d" strokeWidth="1.2" />
            {renderTreeCluster([
              { x: 586, y: 526, r: 7 },
              { x: 622, y: 525, r: 8 },
              { x: 618, y: 546, r: 7 },
            ])}
            <circle cx="603" cy="535" r="7" fill="#ffffff" stroke="#dc2626" strokeWidth="1.2" />
            <text x="603" y="538" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#dc2626">47</text>
            <text x="605" y="553" textAnchor="middle" fontSize="5.2" fontWeight="900" fill="#052e16">
              AREA VERDE 2081.33
            </text>
          </g>

          {/* Center-Right Diagonal Green Strip (Manzano 28 / 49) */}
          <g>
            <polygon
              points="465,795 505,775 568,895 538,915"
              fill="#4ade80"
              stroke="#15803d"
              strokeWidth="1.2"
            />
            {renderTreeCluster([
              { x: 485, y: 805, r: 8 },
              { x: 515, y: 845, r: 9 },
              { x: 545, y: 885, r: 8 },
            ])}
            <circle cx="502" cy="825" r="7" fill="#ffffff" stroke="#dc2626" strokeWidth="1.2" />
            <text x="502" y="828" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#dc2626">28</text>
          </g>

          {/* Right-Lower Green Strip (Manzano 48 / 50) */}
          <g>
            <rect x="588" y="885" width="58" height="36" rx="4" fill="#4ade80" stroke="#15803d" strokeWidth="1.2" />
            {renderTreeCluster([
              { x: 602, y: 902, r: 7 },
              { x: 632, y: 904, r: 7 },
            ])}
            <circle cx="617" cy="902" r="6.5" fill="#ffffff" stroke="#dc2626" strokeWidth="1.2" />
            <text x="617" y="904.5" textAnchor="middle" fontSize="6" fontWeight="900" fill="#dc2626">50</text>
          </g>

          {/* Bottom-Right Large AREA VERDE 7720.82 */}
          <g>
            <polygon
              points="465,1235 588,1195 605,1125 648,1125 656,1332 470,1282"
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
            <text x="585" y="1285" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#052e16">
              AREA VERDE 7720.82 m2
            </text>
          </g>

          {/* ================================================================= */}
          {/* 5. CENTRAL AREA DE EQUIPAMIENTO & SPORTS COMPLEX (AS IN PDF)      */}
          {/* ================================================================= */}
          {/* Left Equipment Block (12622.65) */}
          <g>
            <polygon
              points="152,648 232,638 258,765 205,772 195,705 152,708"
              fill="#fde68a"
              fillOpacity="0.45"
              stroke="#92400e"
              strokeWidth="1.2"
            />
            <polygon
              points="152,648 232,638 258,765 205,772 195,705 152,708"
              fill="url(#equipHatch)"
            />
            <text x="205" y="685" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#78350f">
              AREA DE EQUIPAMIENTO
            </text>
            <text x="205" y="694" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#78350f">
              12622.65 m2
            </text>
          </g>

          {/* Central Equipment Block with Cancha Múltiple & Salón Múltiple (7992.03) */}
          <g>
            <polygon
              points="405,642 568,642 572,718 422,762"
              fill="#fef3c7"
              stroke="#b45309"
              strokeWidth="1.2"
            />
            <polygon
              points="405,642 568,642 572,718 422,762"
              fill="url(#sandStipple)"
            />
            {/* Miniature Architectural Cancha Polifuncional & Salón Múltiple (exact PDF center detail) */}
            <g transform="translate(475, 650)">
              <rect x="0" y="0" width="68" height="46" fill="#ffffff" stroke="#0f172a" strokeWidth="1" />
              {/* Futsal / Basketball court */}
              <rect x="5" y="5" width="28" height="36" fill="#ecfdf5" stroke="#dc2626" strokeWidth="0.9" />
              <line x1="5" y1="23" x2="33" y2="23" stroke="#1d4ed8" strokeWidth="0.7" />
              <circle cx="19" cy="23" r="4.5" fill="none" stroke="#dc2626" strokeWidth="0.7" />
              {/* Salón Múltiple & Módulo Policial */}
              <rect x="38" y="5" width="25" height="16" fill="#eff6ff" stroke="#1e40af" strokeWidth="0.8" />
              <text x="50.5" y="14" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#1e3a8a">
                SALON MULT.
              </text>
              <rect x="38" y="24" width="25" height="17" fill="#fef2f2" stroke="#b91c1c" strokeWidth="0.8" />
              <text x="50.5" y="34" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#991b1b">
                MOD. POLICIAL
              </text>
            </g>
            <text x="450" y="725" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#78350f">
              AREA DE EQUIPAMIENTO 7992.03 m2
            </text>
          </g>

          {/* ================================================================= */}
          {/* 6. ALL MANZANOS & LOTS (UPPER, MIDDLE, AND LOWER SECTORS)         */}
          {/* ================================================================= */}

          {/* --- SECTOR NORTE (TOP MANZANOS 1 TO 11) --- */}
          {renderCadManzano({ manzanoNum: '8', x: 500, y: 72, width: 52, height: 105, cols: 2, rows: 5, lotStartIndex: 0, isAvenueFront: true })}
          {renderCadManzano({ manzanoNum: '9', x: 572, y: 65, width: 65, height: 108, cols: 2, rows: 5, lotStartIndex: 2, isAvenueFront: true })}
          {renderCadManzano({ manzanoNum: '6', x: 432, y: 120, width: 52, height: 95, cols: 2, rows: 4, lotStartIndex: 4, isAvenueFront: true })}
          {renderCadManzano({ manzanoNum: '4', x: 365, y: 172, width: 52, height: 85, cols: 2, rows: 4, lotStartIndex: 6, isAvenueFront: true })}
          {renderCadManzano({ manzanoNum: '2', x: 282, y: 270, width: 65, height: 92, cols: 2, rows: 4, lotStartIndex: 8, isAvenueFront: true })}
          {renderCadManzano({ manzanoNum: '1', x: 212, y: 292, width: 55, height: 70, cols: 2, rows: 3, lotStartIndex: 10, isAvenueFront: true })}

          {/* Street Label: C. INNOMINADA DE 9.00 m. */}
          <text x="275" y="374" textAnchor="middle" fontSize="6.2" fontWeight="bold" fill="#0f172a">
            C. INNOMINADA DE 9.00 m.
          </text>
          <text x="485" y="366" textAnchor="middle" fontSize="6.2" fontWeight="bold" fill="#0f172a">
            C. INNOMINADA DE 9.00 m.
          </text>

          {/* --- SECTOR CENTRAL-NORTE (MANZANOS 3, 5, 7, 10, 11, 14, 15, 16, 17, 18) --- */}
          {renderCadManzano({ manzanoNum: '7', x: 436, y: 262, width: 56, height: 92, cols: 2, rows: 4, lotStartIndex: 12 })}
          {renderCadManzano({ manzanoNum: '10', x: 506, y: 238, width: 56, height: 116, cols: 2, rows: 5, lotStartIndex: 14 })}
          {renderCadManzano({ manzanoNum: '11', x: 576, y: 215, width: 64, height: 138, cols: 2, rows: 6, lotStartIndex: 16, isAvenueFront: true })}

          {renderCadManzano({ manzanoNum: '3', x: 214, y: 382, width: 56, height: 112, cols: 2, rows: 5, lotStartIndex: 0 })}
          {renderCadManzano({ manzanoNum: '5', x: 284, y: 382, width: 56, height: 112, cols: 2, rows: 5, lotStartIndex: 3 })}
          {renderCadManzano({ manzanoNum: '15', x: 356, y: 376, width: 72, height: 118, cols: 2, rows: 5, lotStartIndex: 6 })}
          {renderCadManzano({ manzanoNum: '16', x: 444, y: 376, width: 58, height: 118, cols: 2, rows: 5, lotStartIndex: 9 })}
          {renderCadManzano({ manzanoNum: '17', x: 516, y: 376, width: 46, height: 118, cols: 2, rows: 5, lotStartIndex: 12 })}
          {renderCadManzano({ manzanoNum: '18', x: 576, y: 376, width: 64, height: 118, cols: 2, rows: 5, lotStartIndex: 15, isAvenueFront: true })}

          <text x="275" y="506" textAnchor="middle" fontSize="6.2" fontWeight="bold" fill="#0f172a">
            C. INNOMINADA DE 9.00 m.
          </text>
          <text x="545" y="506" textAnchor="middle" fontSize="6.2" fontWeight="bold" fill="#0f172a">
            C. INNOMINADA DE 9.00 m.
          </text>

          {/* --- SECTOR MEDIO (MANZANOS 19, 20, 21, 22, 23, 24, 25, 26, 27) --- */}
          {renderCadManzano({ manzanoNum: '19', x: 286, y: 514, width: 56, height: 102, cols: 2, rows: 4, lotStartIndex: 2, hasPasaje: true })}
          {renderCadManzano({ manzanoNum: '20', x: 358, y: 514, width: 74, height: 110, cols: 2, rows: 5, lotStartIndex: 5 })}
          {renderCadManzano({ manzanoNum: '21', x: 448, y: 514, width: 56, height: 110, cols: 2, rows: 5, lotStartIndex: 8 })}
          {renderCadManzano({ manzanoNum: '22', x: 518, y: 514, width: 44, height: 110, cols: 2, rows: 5, lotStartIndex: 11, hasPasaje: true })}
          {renderCadManzano({ manzanoNum: '23', x: 584, y: 568, width: 56, height: 132, cols: 2, rows: 6, lotStartIndex: 14, isAvenueFront: true })}

          {/* Vertical Street Labels */}
          <text x="278" y="445" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a" transform="rotate(-90 278 445)">
            C. INNOMINADA DE 9.00 m.
          </text>
          <text x="349" y="445" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a" transform="rotate(-90 349 445)">
            C. INNOMINADA DE 12.00 m.
          </text>
          <text x="438" y="445" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a" transform="rotate(-90 438 445)">
            C. INNOMINADA DE 9.00 m.
          </text>
          <text x="570" y="445" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a" transform="rotate(-90 570 445)">
            PASAJE DE 6.00 m. (SIN SALIDA)
          </text>

          {/* --- SECTOR OESTE Y SUROESTE (MANZANOS 24, 25, 26, 27, 32, 33, 34, 35, 36) --- */}
          {renderCadManzano({ manzanoNum: '24', x: 332, y: 642, width: 62, height: 112, cols: 2, rows: 5, lotStartIndex: 1 })}
          {renderCadManzano({ manzanoNum: '25', x: 262, y: 642, width: 54, height: 112, cols: 2, rows: 5, lotStartIndex: 4 })}
          {renderCadManzano({ manzanoNum: '26', x: 152, y: 722, width: 56, height: 105, cols: 2, rows: 4, lotStartIndex: 7, rotate: -10 })}
          {renderCadManzano({ manzanoNum: '27', x: 88, y: 745, width: 52, height: 95, cols: 2, rows: 4, lotStartIndex: 10, rotate: -10, hasPasaje: true })}

          {/* --- SECTOR SUR (MANZANOS 29, 30, 31, 35, 36, 37, 38, 39, 40, 41, 42, 43) --- */}
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

          {/* ================================================================= */}
          {/* 7. BOTTOM-LEFT ROAD PROFILE DIAGRAMS (PERFIL DE VÍA 12m & 9m)     */}
          {/* ================================================================= */}
          {/* Diagram 1: PERFIL DE VIA DE 12 Mts. */}
          <g transform="translate(55, 1085)">
            <rect x="0" y="0" width="185" height="92" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" rx="4" />
            {/* Ground line */}
            <line x1="10" y1="58" x2="175" y2="58" stroke="#0f172a" strokeWidth="2" />
            {/* Left wall & Faja Jardín */}
            <rect x="12" y="26" width="6" height="32" fill="#dc2626" />
            {/* Left Tree */}
            <rect x="35" y="42" width="3" height="16" fill="#78350f" />
            <circle cx="36.5" cy="34" r="10" fill="#16a34a" stroke="#052e16" strokeWidth="0.8" />
            {/* Right Tree */}
            <rect x="132" y="42" width="3" height="16" fill="#78350f" />
            <circle cx="133.5" cy="34" r="10" fill="#16a34a" stroke="#052e16" strokeWidth="0.8" />
            {/* Center Red Vehicle on Calzada */}
            <rect x="76" y="44" width="22" height="11" rx="2" fill="#dc2626" />
            <rect x="79" y="46" width="16" height="5" fill="#bae6fd" />
            <circle cx="80" cy="56" r="2.5" fill="#0f172a" />
            <circle cx="94" cy="56" r="2.5" fill="#0f172a" />
            {/* Right Building Facade */}
            <polygon points="152,58 152,25 172,32 172,58" fill="#334155" />
            {/* Dimension labels */}
            <line x1="20" y1="68" x2="152" y2="68" stroke="#0f172a" strokeWidth="0.8" />
            <text x="35" y="65" textAnchor="middle" fontSize="4.8" fontWeight="bold" fill="#0f172a">ACERA 1.50</text>
            <text x="86" y="65" textAnchor="middle" fontSize="5" fontWeight="900" fill="#dc2626">CALZADA 9.00m</text>
            <text x="136" y="65" textAnchor="middle" fontSize="4.8" fontWeight="bold" fill="#0f172a">ACERA 1.50</text>
            <text x="92" y="83" textAnchor="middle" fontSize="6" fontWeight="900" fill="#0f172a">
              ---- PERFIL DE VIA DE 12 Mts. ----
            </text>
          </g>

          {/* Diagram 2: PERFIL DE VIA DE 9 Mts. */}
          <g transform="translate(65, 1195)">
            <rect x="0" y="0" width="175" height="92" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" rx="4" />
            <line x1="12" y1="58" x2="162" y2="58" stroke="#0f172a" strokeWidth="1.8" />
            {/* Utility Pole & Angles */}
            <line x1="48" y1="16" x2="48" y2="58" stroke="#0f172a" strokeWidth="2" />
            <line x1="48" y1="18" x2="22" y2="58" stroke="#d97706" strokeWidth="1" />
            <line x1="48" y1="18" x2="98" y2="58" stroke="#d97706" strokeWidth="1" />
            {/* Right Property Wall */}
            <polygon points="138,58 138,24 156,18 156,58" fill="#64748b" />
            <line x1="22" y1="68" x2="138" y2="68" stroke="#0f172a" strokeWidth="0.8" />
            <text x="82" y="65" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#0f172a">
              1.50 | CALZADA 6.00m | 1.50
            </text>
            <text x="87" y="83" textAnchor="middle" fontSize="6" fontWeight="900" fill="#0f172a">
              ---- PERFIL DE VIA DE 9 Mts. ----
            </text>
          </g>

          {/* ================================================================= */}
          {/* 8. RIGHT-SIDE OFFICIAL CAJETÍN / CARIMBO MUNICIPAL & LOT TABLES   */}
          {/* ================================================================= */}
          <g transform="translate(715, 50)">
            {/* Main Title Block Outer Box */}
            <rect x="0" y="0" width="405" height="395" fill="#fffbeb" fillOpacity="0.35" stroke="#0f172a" strokeWidth="2.2" />
            <line x1="175" y1="0" x2="175" y2="180" stroke="#0f172a" strokeWidth="1.6" />
            <line x1="0" y1="38" x2="175" y2="38" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="0" y1="76" x2="175" y2="76" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="0" y1="108" x2="405" y2="108" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="0" y1="180" x2="405" y2="180" stroke="#0f172a" strokeWidth="1.6" />
            <line x1="0" y1="305" x2="405" y2="305" stroke="#0f172a" strokeWidth="1.6" />
            <line x1="0" y1="342" x2="405" y2="342" stroke="#0f172a" strokeWidth="1.6" />

            {/* Box 1: ANTEPROYECTO / URBANIZACIÓN */}
            <text x="6" y="10" fontSize="5" fontWeight="bold" fill="#475569">URBANIZACIÓN / ANTEPROYECTO:</text>
            <text x="87" y="23" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#0f172a">
              JUNTA VECINAL
            </text>
            <text x="87" y="33" textAnchor="middle" fontSize="8" fontWeight="900" fill="#0f172a">
              {urbanization.name.toUpperCase().slice(0, 24)}
            </text>

            {/* Box 2: PROPIETARIOS */}
            <text x="6" y="48" fontSize="5" fontWeight="bold" fill="#475569">PROPIETARIOS:</text>
            <text x="87" y="65" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0f172a">
              SERAPIO MOLLO GUTIERREZ
            </text>

            {/* Box 3: ELABORADO POR */}
            <text x="6" y="86" fontSize="5" fontWeight="bold" fill="#475569">ELABORADO POR:</text>
            <text x="87" y="99" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#334155">
              DPTO. TÉCNICO CATASTRAL TERRANOVA
            </text>

            {/* Right Top Box: RELACIÓN DE SUPERFICIES (Exact PDF values) */}
            <text x="290" y="13" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#0f172a" textDecoration="underline">
              RELACIÓN DE SUPERFICIES
            </text>
            <g fontSize="5.2" fontFamily="monospace" fill="#0f172a">
              <text x="182" y="26">SUP. TOTAL DE LOTE</text>
              <text x="345" y="26" textAnchor="end" fontWeight="bold">473785.78 m2</text>

              <text x="182" y="36">SUP. QUEBRADAS</text>
              <text x="345" y="36" textAnchor="end" fontWeight="bold">16622.12 m2</text>

              <text x="182" y="46">SUP. A REGULARIZAR</text>
              <text x="345" y="46" textAnchor="end" fontWeight="bold">457163.66 m2</text>
              <text x="398" y="46" textAnchor="end" fontWeight="bold">100.00 %</text>

              <text x="182" y="58">SUP. RESIDENCIAL</text>
              <text x="345" y="58" textAnchor="end" fontWeight="bold">281237.05 m2</text>
              <text x="398" y="58" textAnchor="end" fontWeight="bold">61.52 %</text>

              <text x="182" y="68">SUP. DE VIAS (AV. Y CALLES)</text>
              <text x="345" y="68" textAnchor="end" fontWeight="bold">101215.41 m2</text>
              <text x="398" y="68" textAnchor="end" fontWeight="bold">22.14 %</text>

              <text x="182" y="80">SUP. AREA EQUIPAMIENTO</text>
              <text x="345" y="80" textAnchor="end" fontWeight="bold">21208.14 m2</text>
              <text x="398" y="80" textAnchor="end" fontWeight="bold">4.64 %</text>

              <text x="182" y="90">SUP. AREA VERDE</text>
              <text x="345" y="90" textAnchor="end" fontWeight="bold">53503.06 m2</text>
              <text x="398" y="90" textAnchor="end" fontWeight="bold">11.70 %</text>

              <text x="182" y="102" fontWeight="bold">SUP. Total Cesión Útil</text>
              <text x="345" y="102" textAnchor="end" fontWeight="bold">175926.61 m2</text>
              <text x="398" y="102" textAnchor="end" fontWeight="bold">38.48 %</text>
            </g>

            {/* Sello de Aprobación G.A.M.C.B.B.A & Revalidación */}
            <text x="87" y="122" textAnchor="middle" fontSize="6" fontWeight="900" fill="#0f172a" textDecoration="underline">
              SELLO DE APROBACIÓN G.A.M.C.B.B.A.
            </text>
            <text x="290" y="122" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a">
              REVALIDACIÓN:
            </text>

            {/* Escala & Unica */}
            <line x1="175" y1="155" x2="405" y2="155" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="335" y1="155" x2="335" y2="180" stroke="#0f172a" strokeWidth="1.2" />
            <text x="210" y="171" fontSize="6.5" fontWeight="900" fill="#0f172a">ESCALA:</text>
            <text x="370" y="165" textAnchor="middle" fontSize="5" fill="#475569">ESCALA</text>
            <text x="370" y="175" textAnchor="middle" fontSize="7" fontWeight="900" fill="#0f172a">UNICA</text>

            {/* Plano de Ubicación & Datos Municipales */}
            <text x="202" y="195" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0f172a" textDecoration="underline">
              PLANO DE UBICACIÓN
            </text>
            <g fontSize="6.5" fontWeight="900" fill="#0f172a">
              <text x="10" y="262">PROVINCIA: CERCADO</text>
              <text x="10" y="272">MUNICIPIO: {urbanization.city.toUpperCase() || 'COCHABAMBA'}</text>
              <text x="10" y="282">ZONA: HUASAHIGUERANI / {urbanization.location.toUpperCase().slice(0, 18)}</text>
              <text x="10" y="292">DISTRITO: MUNICIPAL</text>
            </g>

            {/* Fecha box */}
            <line x1="175" y1="342" x2="175" y2="395" stroke="#0f172a" strokeWidth="1.6" />
            <text x="185" y="355" fontSize="5.5" fontWeight="bold" fill="#475569">FECHA:</text>
            <text x="235" y="375" textAnchor="middle" fontSize="8" fontWeight="900" fill="#0f172a">
              AGOSTO 2025
            </text>

            {/* =============================================================== */}
            {/* 9. MULTI-COLUMN CADASTRAL LOT TABLE UNDER TITLE BLOCK (PDF)     */}
            {/* =============================================================== */}
            <g transform="translate(0, 412)">
              {[0, 1, 2, 3].map((colIdx) => {
                const colX = colIdx * 103;
                return (
                  <g key={colIdx} transform={`translate(${colX}, 0)`}>
                    <rect x="0" y="0" width="96" height="890" fill="#ffffff" stroke="#334155" strokeWidth="0.9" />
                    {/* Header */}
                    <rect x="0" y="0" width="96" height="16" fill="#e2e8f0" stroke="#334155" strokeWidth="0.8" />
                    <text x="48" y="10.5" textAnchor="middle" fontSize="5.2" fontWeight="900" fill="#0f172a">
                      MANZANO {colIdx * 10 + 1} AL {(colIdx + 1) * 10} - SUP. m2
                    </text>

                    {/* 52 rows per column */}
                    {Array.from({ length: 50 }, (_, rIdx) => {
                      const rowY = 16 + rIdx * 17.4;
                      const lotRef = getLotAt(colIdx * 50 + rIdx);
                      const isRowSelected = selectedLot && lotRef && selectedLot.id === lotRef.id;
                      return (
                        <g
                          key={rIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (lotRef) onSelectLot(lotRef);
                          }}
                          className="cursor-pointer"
                        >
                          <rect
                            x="0"
                            y={rowY}
                            width="96"
                            height="17.4"
                            fill={isRowSelected ? '#fde047' : rIdx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                            stroke="#cbd5e1"
                            strokeWidth="0.4"
                          />
                          <text x="5" y={rowY + 11} fontSize="4.8" fontFamily="monospace" fontWeight="bold" fill="#0f172a">
                            {`M-${(rIdx % 15) + 1} L-${(rIdx % 20) + 1}`}
                          </text>
                          <text x="50" y={rowY + 11} fontSize="4.6" fontFamily="monospace" fill="#334155">
                            {lotRef?.locationType === 'Avenida Principal'
                              ? 'AVENIDA'
                              : lotRef?.locationType === 'En Esquina'
                              ? 'ESQUINA'
                              : lotRef?.locationType === 'Sin Salida a Avenida'
                              ? 'PASAJE'
                              : 'INTERNO'}
                          </text>
                          <text x="92" y={rowY + 11} textAnchor="end" fontSize="4.8" fontFamily="monospace" fontWeight="bold" fill="#0f172a">
                            {lotRef ? `${lotRef.surface.toFixed(2)}` : '300.00'}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        {/* =================================================================== */}
        {/* FLOATING BOTTOM OVERLAY: SELECTED LOT QUICK BAR                     */}
        {/* =================================================================== */}
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
                    SUP. UTIL {selectedLot.surface.toFixed(2)} m2 ({selectedLot.front}m x {selectedLot.depth}m)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-600 text-[10px] font-bold">
                    {selectedLot.locationType || 'Calle Interna'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Vía: <strong className="text-white">{selectedLot.streetName || urbanization.mainAvenueName || 'C. Innominada de 9.00 m.'}</strong> &bull; Precio: <strong className="text-amber-300">Bs. {selectedLot.priceBs.toLocaleString('es-BO')}</strong> ($us. {selectedLot.priceUsd.toLocaleString('es-BO')})
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
    </div>
  );
};
