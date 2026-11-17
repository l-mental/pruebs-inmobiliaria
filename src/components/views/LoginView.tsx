import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { SystemUser } from '../../types';
import { Logo } from '../Logo';

interface LoginViewProps {
  users: SystemUser[];
  onLoginSuccess: (user: SystemUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || !password) {
      setErrorMsg('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    const foundUser = users.find(
      (u) => u.username.trim().toLowerCase() === cleanUsername && u.password === password
    );

    if (!foundUser) {
      setErrorMsg('Usuario o contraseña incorrectos. Verifica tus credenciales.');
      return;
    }

    if (!foundUser.active) {
      setErrorMsg('Esta cuenta se encuentra desactivada. Contacta al administrador.');
      return;
    }

    setErrorMsg('');
    onLoginSuccess(foundUser);
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051e13] via-[#072a1b] to-[#114c33] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-emerald-700/30">
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#072a1b] via-[#0d3f2b] to-[#14583c] text-white p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <Logo subtitle="Crea tu origen y construye tu futuro..." />

            <div className="space-y-2.5 pt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                Sistema de Gestión Inmobiliaria
              </span>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight text-white">
                Control Integral de Urbanizaciones y Ventas
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
                Accede con tu cuenta de Administrador o Empleado para gestionar terrenos, propiedades, clientes y planes de pago.
              </p>
            </div>
          </div>

          {/* Quick reference card for default users */}
          <div className="relative z-10 mt-8 p-4 rounded-2xl bg-black/25 border border-emerald-400/25 space-y-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              Accesos Predeterminados del Sistema
            </p>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin123')}
                className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
                  <div>
                    <p className="font-extrabold text-white">Administrador (Total)</p>
                    <p className="text-[11px] text-emerald-200">
                      Usuario: <span className="font-mono font-bold text-white">admin</span> &bull; Clave: <span className="font-mono font-bold text-white">admin123</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-300 underline shrink-0">Usar</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('empleado', 'empleado123')}
                className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                  <div>
                    <p className="font-extrabold text-white">Empleado (Uso Limitado)</p>
                    <p className="text-[11px] text-emerald-200">
                      Usuario: <span className="font-mono font-bold text-white">empleado</span> &bull; Clave: <span className="font-mono font-bold text-white">empleado123</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 underline shrink-0">Usar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Iniciar Sesión
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Ingresa tus credenciales para acceder al panel de gestión.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Usuario
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Ej. admin o empleado"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg('');
                    }}
                    className="w-full pl-10 pr-11 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-700 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-5 bg-gradient-to-r from-[#072a1b] to-[#155e40] hover:from-[#051e13] hover:to-[#0d3f2b] text-white font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Ingresar al Sistema</span>
              </button>
            </form>

            <p className="text-[11px] text-slate-400 text-center pt-2">
              Inmobiliaria Nuevas Raíces &bull; Acceso controlado por perfil de usuario
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
