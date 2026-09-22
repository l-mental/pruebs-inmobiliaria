import React, { useState } from 'react';
import { Settings, Building, DollarSign, Shield, Check, Save } from 'lucide-react';

export const ConfiguracionView: React.FC = () => {
  const [companyName, setCompanyName] = useState('Inmobiliaria Nuevas Raíces');
  const [slogan, setSlogan] = useState('Tu futuro, nuestro compromiso');
  const [phone, setPhone] = useState('+591 4 4123456');
  const [nit, setNit] = useState('1029384021');
  const [currency, setCurrency] = useState<'Bs.' | '$us.'>('Bs.');
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#0d3f2b] text-white flex items-center justify-center shadow-xs">
          <Settings className="w-6 h-6 text-emerald-200" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Configuración del Sistema
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Parámetros de la empresa, divisas, contratos y cuentas de usuario.
          </p>
        </div>
      </div>

      {savedAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Configuración guardada exitosamente.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building className="w-4 h-4 text-emerald-700" />
            Datos de la Inmobiliaria
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Razón Social / Nombre Comercial
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lema / Slogan
              </label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIT / Registro Tributario
              </label>
              <input
                type="text"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono de Contacto Central
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>
          </div>
        </div>

        {/* Currency Setting */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            Moneda Principal de Cotización
          </h2>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="currency"
                checked={currency === 'Bs.'}
                onChange={() => setCurrency('Bs.')}
                className="text-emerald-700 focus:ring-emerald-600"
              />
              <span className="text-xs font-semibold text-slate-700">Bolivianos (Bs.)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="currency"
                checked={currency === '$us.'}
                onChange={() => setCurrency('$us.')}
                className="text-emerald-700 focus:ring-emerald-600"
              />
              <span className="text-xs font-semibold text-slate-700">Dólares Estadounidenses ($us.)</span>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0d3f2b] hover:bg-[#072a1c] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-300" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
};
