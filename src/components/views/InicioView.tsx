import React, { useState } from 'react';
import { 
  ArrowRight, 
  Zap, 
  X,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Property, ActivityItem, NavTab } from '../../types';
import { Logo } from '../Logo';

interface InicioViewProps {
  properties: Property[];
  activities: ActivityItem[];
  onNavigate: (tab: NavTab) => void;
  onOpenNewSale: () => void;
  onOpenNewPayment: () => void;
  onSelectProperty: (property: Property) => void;
}

export const InicioView: React.FC<InicioViewProps> = ({
  onNavigate,
  onOpenNewSale,
  onOpenNewPayment,
}) => {
  const [showCommissionsModal, setShowCommissionsModal] = useState(false);
  const [showAllActivitiesModal, setShowAllActivitiesModal] = useState(false);

  // Activities shown in image.png
  const activitiesList = [
    {
      id: 'act-1',
      title: 'Se registró un nuevo cliente',
      subtitle: 'María López',
      time: '09:15 a.m.',
      type: 'client',
      color: 'bg-emerald-500 text-white',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )
    },
    {
      id: 'act-2',
      title: 'Se registró un pago',
      subtitle: 'Cliente: Juan Pérez - Bs. 5.000',
      time: '08:42 a.m.',
      type: 'payment',
      color: 'bg-[#0284c7] text-white',
      icon: (
        <span className="font-bold text-xs">$</span>
      )
    },
    {
      id: 'act-3',
      title: 'Se registró una nueva venta',
      subtitle: 'Lote M-04 / L-12 - Urbanización 1',
      time: '08:20 a.m.',
      type: 'sale',
      color: 'bg-[#ea580c] text-white',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      )
    },
    {
      id: 'act-4',
      title: 'Se consultó un terreno',
      subtitle: 'Lote 235 - Urbanización 2',
      time: '07:55 a.m.',
      type: 'lot',
      color: 'bg-[#7c3aed] text-white',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      )
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* 2-Column Responsive Layout matching image.png */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left & Center Main Dashboard Area (8 cols on large screens) */}
        <div className="lg:col-span-8 space-y-5">

          {/* 1. Hero Greeting Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-sky-100/80 shadow-xs min-h-[140px] flex items-center px-6 sm:px-8 py-6 bg-gradient-to-r from-[#e0f2fe]/90 via-[#f0f9ff] to-[#ecfdf5]">
            {/* Mountain & meadow background illustration overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-bottom opacity-35 mix-blend-multiply pointer-events-none"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')`
              }}
            />

            {/* Content left */}
            <div className="relative z-10 max-w-lg">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                ¡Buenos días, Juan!
              </h1>
              <p className="text-sm sm:text-base text-slate-700 mt-1 font-medium">
                Aquí tienes un resumen de tu actividad como vendedor.
              </p>
            </div>

            {/* Cartoon Smiling Sun on top right as in image.png */}
            <div className="absolute right-4 sm:right-10 top-3 sm:top-4 z-10 select-none">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center animate-spin-slow">
                {/* Sun rays */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                  {/* Rays */}
                  <g stroke="#f59e0b" strokeWidth="4" strokeLinecap="round">
                    <line x1="50" y1="6" x2="50" y2="18" />
                    <line x1="50" y1="82" x2="50" y2="94" />
                    <line x1="6" y1="50" x2="18" y2="50" />
                    <line x1="82" y1="50" x2="94" y2="50" />
                    <line x1="19" y1="19" x2="28" y2="28" />
                    <line x1="72" y1="72" x2="81" y2="81" />
                    <line x1="19" y1="81" x2="28" y2="72" />
                    <line x1="72" y1="28" x2="81" y2="19" />
                  </g>
                  {/* Sun body */}
                  <circle cx="50" cy="50" r="28" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2.5" />
                  {/* Smiling eyes */}
                  <ellipse cx="42" cy="45" rx="2.5" ry="3.5" fill="#78350f" />
                  <ellipse cx="58" cy="45" rx="2.5" ry="3.5" fill="#78350f" />
                  {/* Cute smile */}
                  <path d="M 40 55 Q 50 64 60 55" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  {/* Blushing cheeks */}
                  <circle cx="36" cy="53" r="3" fill="#f87171" opacity="0.6" />
                  <circle cx="64" cy="53" r="3" fill="#f87171" opacity="0.6" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. Row of 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Card 1: MIS CLIENTES */}
            <div 
              onClick={() => onNavigate('clientes')}
              className="bg-[#f0fdf4] border border-emerald-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  MIS CLIENTES
                </h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-0.5">
                  12
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Clientes registrados
                </p>
              </div>
              <div className="flex justify-end mt-2">
                <div className="w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card 2: MIS VENTAS */}
            <div 
              onClick={() => onNavigate('ventas')}
              className="bg-[#fffbeb] border border-amber-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  MIS VENTAS
                </h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-0.5">
                  5
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Ventas registradas
                </p>
              </div>
              <div className="flex justify-end mt-2">
                <div className="w-7 h-7 rounded-full bg-[#ea580c] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card 3: MIS PAGOS */}
            <div 
              onClick={() => onNavigate('pagos')}
              className="bg-[#f0f9ff] border border-sky-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                <div className="w-11 h-11 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  MIS PAGOS
                </h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-0.5">
                  8
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  Pagos registrados
                </p>
              </div>
              <div className="flex justify-end mt-2">
                <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card 4: COMISIONES */}
            <div 
              onClick={() => setShowCommissionsModal(true)}
              className="bg-[#faf5ff] border border-purple-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  COMISIONES
                </h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-0.5">
                  —
                </p>
                <p className="text-xs text-slate-400 italic">
                  (Información interna)
                </p>
              </div>
              <div className="flex justify-end mt-2">
                <div className="w-7 h-7 rounded-full bg-[#7c3aed] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. "Accesos rápidos" Section */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600 fill-emerald-500" />
              <h2 className="text-base font-bold text-slate-800">
                Accesos rápidos
              </h2>
            </div>

            {/* 6 Action Cards Grid matching image.png */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              
              {/* Card 1: Ver Terrenos (Green) */}
              <button
                onClick={() => onNavigate('terrenos')}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-150 text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Folded map with red pin graphic */}
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 64 64" className="w-12 h-12 drop-shadow-sm" fill="none">
                      <polygon points="12,18 26,10 38,18 52,10 52,48 38,56 26,48 12,56" fill="#86efac" stroke="#ffffff" strokeWidth="2" />
                      <polygon points="26,10 38,18 38,56 26,48" fill="#4ade80" />
                      {/* Red location pin */}
                      <path d="M 32 16 C 27 16 23 20 23 25 C 23 32 32 42 32 42 C 32 42 41 32 41 25 C 41 20 37 16 32 16 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      <circle cx="32" cy="24" r="3.5" fill="#ffffff" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      Ver Terrenos
                    </h3>
                    <p className="text-[11px] text-emerald-100/90 leading-tight mt-0.5">
                      Consulta los terrenos disponibles por urbanización.
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white text-[#16a34a] flex items-center justify-center flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Card 2: Ver Propiedades (Blue) */}
              <button
                onClick={() => onNavigate('propiedades')}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-150 text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* House illustration */}
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 64 64" className="w-12 h-12 drop-shadow-sm" fill="none">
                      {/* Chimney */}
                      <rect x="40" y="14" width="6" height="12" fill="#0369a1" />
                      {/* Roof */}
                      <polygon points="32,10 10,28 54,28" fill="#075985" stroke="#ffffff" strokeWidth="2" />
                      {/* House body */}
                      <rect x="16" y="28" width="32" height="26" fill="#e0f2fe" stroke="#ffffff" strokeWidth="2" rx="2" />
                      {/* Door */}
                      <path d="M 28 54 L 28 40 C 28 38 36 38 36 40 L 36 54 Z" fill="#0284c7" />
                      {/* Window */}
                      <rect x="20" y="34" width="6" height="6" fill="#38bdf8" />
                      <rect x="38" y="34" width="6" height="6" fill="#38bdf8" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      Ver Propiedades
                    </h3>
                    <p className="text-[11px] text-sky-100/90 leading-tight mt-0.5">
                      Casas, departamentos, terrenos y más.
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white text-[#0284c7] flex items-center justify-center flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Card 3: Nueva Venta (Orange) */}
              <button
                onClick={onOpenNewSale}
                className="bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-150 text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Plus badge */}
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white text-[#ea580c] flex items-center justify-center font-extrabold text-2xl shadow-sm">
                      +
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      Nueva Venta
                    </h3>
                    <p className="text-[11px] text-orange-100/90 leading-tight mt-0.5">
                      Registra una nueva venta o reserva.
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white text-[#ea580c] flex items-center justify-center flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Card 4: Mis Clientes (Purple) */}
              <button
                onClick={() => onNavigate('clientes')}
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-150 text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Two clients avatars */}
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 64 64" className="w-12 h-12 drop-shadow-sm" fill="none">
                      <circle cx="24" cy="22" r="10" fill="#ffffff" />
                      <circle cx="44" cy="24" r="8" fill="#ddd6fe" />
                      <path d="M 8 52 C 8 40 18 36 24 36 C 30 36 40 40 40 52 Z" fill="#ffffff" />
                      <path d="M 38 52 C 38 43 45 40 50 40 C 55 40 62 43 62 52 Z" fill="#ddd6fe" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      Mis Clientes
                    </h3>
                    <p className="text-[11px] text-purple-100/90 leading-tight mt-0.5">
                      Consulta y registra clientes interesados.
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white text-[#7c3aed] flex items-center justify-center flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Card 5: Registrar Pago (Teal) */}
              <button
                onClick={onOpenNewPayment}
                className="bg-[#0d9488] hover:bg-[#0f766e] text-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-150 text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Stacked coins with dollar */}
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 64 64" className="w-12 h-12 drop-shadow-sm" fill="none">
                      {/* Coins stack */}
                      <ellipse cx="32" cy="46" rx="18" ry="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                      <path d="M 14 46 L 14 38 A 18 7 0 0 0 50 38 L 50 46 A 18 7 0 0 1 14 46" fill="#f59e0b" />
                      <ellipse cx="32" cy="38" rx="18" ry="7" fill="#fde047" stroke="#d97706" strokeWidth="1.5" />
                      <path d="M 14 38 L 14 30 A 18 7 0 0 0 50 30 L 50 38 A 18 7 0 0 1 14 38" fill="#f59e0b" />
                      <ellipse cx="32" cy="30" rx="18" ry="7" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
                      {/* Dollar symbol on coin face */}
                      <text x="32" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#78350f">$</text>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      Registrar Pago
                    </h3>
                    <p className="text-[11px] text-teal-100/90 leading-tight mt-0.5">
                      Registra pagos, cuotas y cobranzas.
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white text-[#0d9488] flex items-center justify-center flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* Card 6: Historial (Red) */}
              <button
                onClick={() => onNavigate('ventas')}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-150 text-left flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Document with lines */}
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 64 64" className="w-12 h-12 drop-shadow-sm" fill="none">
                      <path d="M 18 10 L 38 10 L 48 20 L 48 54 C 48 56 46 58 44 58 L 18 58 C 16 58 14 56 14 54 L 14 14 C 14 12 16 10 18 10 Z" fill="#ffffff" />
                      <path d="M 38 10 L 48 20 L 38 20 Z" fill="#fee2e2" />
                      {/* Text lines */}
                      <line x1="20" y1="28" x2="42" y2="28" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="20" y1="36" x2="38" y2="36" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="20" y1="44" x2="34" y2="44" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      Historial
                    </h3>
                    <p className="text-[11px] text-rose-100/90 leading-tight mt-0.5">
                      Revisa tus registros y movimientos.
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-white text-[#ef4444] flex items-center justify-center flex-shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* 4. Bottom Landscape Banner matching image.png */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-900/20 min-h-[90px] flex items-center justify-between px-6 sm:px-8 py-3 bg-gradient-to-r from-[#dcfce7] via-[#f0fdf4] to-[#e0f2fe] shadow-xs">
            {/* Background scenic photo overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply pointer-events-none"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')`
              }}
            />

            {/* Left poetic text */}
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-8 h-8 flex-shrink-0">
                <svg viewBox="0 0 40 40" fill="currentColor" className="w-full h-full text-lime-600 drop-shadow-xs">
                  <path d="M12 28 C 10 20, 16 10, 28 6 C 26 14, 28 20, 22 25 C 18 28, 14 29, 12 28 Z" fill="#84cc16" />
                  <path d="M14 26 C 18 20, 24 16, 26 8" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
                </svg>
              </div>
              <p className="font-script text-xl sm:text-2xl text-emerald-950 font-normal tracking-wide drop-shadow-xs">
                Tu confianza <br className="sm:hidden" />
                <span className="sm:ml-1">es nuestro mayor compromiso</span>
              </p>
            </div>

            {/* Right Brand logo on light background */}
            <div className="relative z-10 hidden sm:block">
              <Logo theme="light" subtitle="Tu hogar, nuestro compromiso" />
            </div>
          </div>
        </div>

        {/* Right Sidebar Area (4 cols on large screens) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Resumen de hoy */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            {/* Title header */}
            <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                $
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Resumen de hoy
              </h2>
            </div>

            {/* List items */}
            <div className="divide-y divide-slate-100 mt-1">
              {/* Item 1 */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-700 font-medium">
                    Ventas realizadas
                  </span>
                </div>
                <span className="text-lg font-extrabold text-slate-900">
                  0
                </span>
              </div>

              {/* Item 2 */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0284c7] text-white flex items-center justify-center flex-shrink-0 shadow-xs font-bold text-sm">
                    $
                  </div>
                  <span className="text-sm text-slate-700 font-medium">
                    Pagos recibidos
                  </span>
                </div>
                <span className="text-lg font-extrabold text-[#0284c7]">
                  Bs. 0
                </span>
              </div>

              {/* Item 3 */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#7c3aed] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-700 font-medium">
                    Clientes atendidos
                  </span>
                </div>
                <span className="text-lg font-extrabold text-slate-900">
                  0
                </span>
              </div>

              {/* Item 4 */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ea580c] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-700 font-medium">
                    Terrenos mostrados
                  </span>
                </div>
                <span className="text-lg font-extrabold text-slate-900">
                  3
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Últimas actividades */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            {/* Title header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#16a34a] text-white flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Últimas actividades
                </h2>
              </div>
              <button
                onClick={() => setShowAllActivitiesModal(true)}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            {/* Activities list */}
            <div className="divide-y divide-slate-100 mt-1">
              {activitiesList.map((item) => (
                <div key={item.id} className="py-3 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5 font-normal">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono flex-shrink-0 mt-0.5">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Commissions Modal */}
      {showCommissionsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95">
            <button
              onClick={() => setShowCommissionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Comisiones de Vendedor
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              El módulo de comisiones está restringido para control administrativo interno. Tus ventas concretadas son procesadas y calculadas automáticamente para la liquidación mensual de honorarios.
            </p>
            <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
              <p className="font-semibold">Estado actual: Asesor Comercial Activo</p>
              <p>Ventas registradas: 5 | Comisión estimada: 3% sobre valor de contado</p>
            </div>
            <button
              onClick={() => setShowCommissionsModal(false)}
              className="mt-5 w-full py-2.5 bg-[#072a1b] text-white rounded-xl font-semibold hover:bg-emerald-900 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* View All Activities Modal */}
      {showAllActivitiesModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95">
            <button
              onClick={() => setShowAllActivitiesModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Historial de Actividades Recientes
            </h3>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {activitiesList.map((item) => (
                <div key={item.id} className="py-3 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAllActivitiesModal(false)}
              className="mt-4 w-full py-2.5 bg-slate-100 text-slate-800 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
