import React from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  LogOut 
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: NavTab;
  label: string;
  renderIcon: (isActive: boolean) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { 
    id: 'inicio', 
    label: 'Inicio', 
    renderIcon: (isActive) => (
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <Home className={`w-5 h-5 ${isActive ? 'text-slate-900 fill-slate-900' : 'text-emerald-200 fill-emerald-200/30'}`} />
      </div>
    )
  },
  { 
    id: 'terrenos', 
    label: 'Terrenos', 
    renderIcon: () => (
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        {/* Folded map with location pin icon matching image.png */}
        <svg viewBox="0 0 24 24" className="w-5 h-5 drop-shadow-xs" fill="none">
          <path d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3z" stroke="#4ade80" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="#15803d" fillOpacity="0.4" />
          <path d="M9 3v15M15 6v15" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="10" r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
        </svg>
      </div>
    )
  },
  { 
    id: 'propiedades', 
    label: 'Propiedades', 
    renderIcon: () => (
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 20v-9.5z" stroke="#f1f5f9" />
          <path d="M9 21.5V13h6v8.5" stroke="#f1f5f9" />
          <path d="M17 5v2.5" stroke="#f1f5f9" />
        </svg>
      </div>
    )
  },
  { 
    id: 'clientes', 
    label: 'Mis Clientes', 
    renderIcon: () => (
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <Users className="w-5 h-5 text-emerald-200" />
      </div>
    )
  },
  { 
    id: 'ventas', 
    label: 'Mis Ventas', 
    renderIcon: () => (
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-emerald-200" />
      </div>
    )
  },
  { 
    id: 'pagos', 
    label: 'Mis Pagos', 
    renderIcon: () => (
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        {/* Golden dollar coin badge matching image.png */}
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border border-amber-200 flex items-center justify-center shadow-xs">
          <span className="text-[11px] font-extrabold text-slate-900 leading-none">$</span>
        </div>
      </div>
    )
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab,
  onLogout,
  isMobileOpen,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-56 bg-[#072a1b] text-white flex flex-col justify-between border-r border-emerald-900/40 select-none flex-shrink-0 min-h-[calc(100vh-68px)] transition-transform duration-200 md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      {/* Navigation List */}
      <nav className="py-4 px-2 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 rounded-xl cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-emerald-100/90 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              {item.renderIcon(isActive)}
              <span className="tracking-wide">{item.label}</span>
            </button>
          );
        })}

        {/* Cerrar sesión option */}
        <div className="pt-3 mt-3 border-t border-emerald-900/50">
          <button
            onClick={() => onLogout?.()}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold text-emerald-200/90 hover:bg-emerald-900/50 hover:text-white transition-colors rounded-xl cursor-pointer"
          >
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-emerald-300" />
            </div>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Bottom decorative slogan with golden leaves */}
      <div className="p-4 pt-2">
        <div className="relative pt-3 pb-1 border-t border-emerald-800/40 text-center">
          {/* Stylized organic leaf icon */}
          <div className="w-9 h-9 mx-auto mb-1 text-emerald-400/90">
            <svg viewBox="0 0 40 40" fill="currentColor" className="w-full h-full drop-shadow">
              <path d="M12 28 C 10 20, 16 10, 28 6 C 26 14, 28 20, 22 25 C 18 28, 14 29, 12 28 Z" fill="#84cc16" opacity="0.9" />
              <path d="M14 26 C 18 20, 24 16, 26 8" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
              <path d="M8 32 C 6 25, 11 18, 20 15 C 18 21, 20 25, 16 29 C 13 32, 9 33, 8 32 Z" fill="#65a30d" opacity="0.8" />
            </svg>
          </div>
          <p className="font-script text-xl leading-snug text-amber-200/95 tracking-wide">
            Juntos <br />
            hacemos <br />
            realidad tus sueños
          </p>
        </div>
      </div>
    </aside>
    </>
  );
};

