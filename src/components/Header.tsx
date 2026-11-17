import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, User, ShieldCheck, Menu, LogOut, UserCog } from 'lucide-react';
import { Logo } from './Logo';
import { NavTab, SystemUser } from '../types';

interface HeaderProps {
  currentUser: SystemUser;
  onNavigate?: (tab: NavTab) => void;
  onLogout: () => void;
  onOpenMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser,
  onNavigate,
  onLogout,
  onOpenMenu,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('10:24 a.m.');
  const [currentDate] = useState('Lunes, 26 de mayo de 2025');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
      hours = hours % 12;
      hours = hours ? hours : 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="bg-[#072a1b] text-white border-b border-emerald-900/40 px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 shadow-md">
      {/* Brand Logo & Slogan */}
      <div className="flex items-center gap-3 sm:gap-6">
        {onOpenMenu && (
          <button
            onClick={onOpenMenu}
            className="md:hidden p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Logo subtitle="Crea tu origen y construye tu futuro..." />
      </div>

      {/* Central poetic motto with green leaf accents */}
      <div className="hidden lg:flex items-center gap-3">
        <span className="font-script text-2xl text-white tracking-wide select-none drop-shadow">
          Más que terrenos... <span className="block sm:inline">creamos tu futuro</span>
        </span>
        <div className="w-6 h-6 text-lime-400">
          <svg viewBox="0 0 40 40" fill="currentColor" className="w-full h-full">
            <path d="M12 28 C 10 20, 16 10, 28 6 C 26 14, 28 20, 22 25 C 18 28, 14 29, 12 28 Z" fill="#84cc16" />
            <path d="M14 26 C 18 20, 24 16, 26 8" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
          </svg>
        </div>
      </div>

      {/* User info & date/time widget */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-emerald-950/60 transition-colors cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
              isAdmin ? 'bg-amber-400 text-slate-950' : 'bg-white text-[#072a1b]'
            }`}>
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <p className="text-sm font-semibold text-white">
                {currentUser.fullName}
              </p>
              <p className="text-[11px] font-bold text-amber-300">
                {isAdmin ? 'Administrador • Acceso Total' : 'Empleado • Uso Limitado'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-emerald-200" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-900 truncate">{currentUser.fullName}</p>
                <p className="text-[11px] text-slate-500 font-semibold">
                  @{currentUser.username} &bull; {currentUser.position}
                </p>
              </div>

              {currentUser.permissions.manageUsers && onNavigate && (
                <button
                  onClick={() => {
                    onNavigate('usuarios');
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 font-semibold transition-colors cursor-pointer"
                >
                  <UserCog className="w-4 h-4 text-emerald-700" />
                  <span>Gestionar Usuarios</span>
                </button>
              )}

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left text-rose-700 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>

        {/* Date and Time chips */}
        <div className="hidden md:flex items-center gap-4 text-xs text-emerald-100/90 pl-3 border-l border-emerald-800/60">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentDate}</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-emerald-200">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>{currentTime}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
