import React, { useState } from 'react';
import { X, Layers, Check, MapPin } from 'lucide-react';
import { Urbanization } from '../../types';

interface CrearManzanoModalProps {
  isOpen: boolean;
  onClose: () => void;
  urbanization: Urbanization;
  existingBlocks: string[];
  onSaveManzano: (blockName: string) => void;
}

export const CrearManzanoModal: React.FC<CrearManzanoModalProps> = ({
  isOpen,
  onClose,
  urbanization,
  existingBlocks,
  onSaveManzano,
}) => {
  const [blockName, setBlockName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = blockName.trim();
    if (!trimmed) {
      setError('Por favor escribe el nombre o número del manzano');
      return;
    }

    if (existingBlocks.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      setError('Este manzano ya existe en este condominio');
      return;
    }

    onSaveManzano(trimmed);
    setBlockName('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#072a1b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Agregar Manzano</h2>
              <p className="text-xs text-emerald-200/80">{urbanization.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nombre o Código del Manzano *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Manzano 6 o Manzano F"
              value={blockName}
              onChange={(e) => {
                setBlockName(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-bold text-slate-800 text-sm"
              autoFocus
            />
            {error && <p className="text-rose-600 mt-1.5 font-medium">{error}</p>}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-slate-600">
            <p className="font-semibold text-slate-700">Manzanos existentes en {urbanization.name}:</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {existingBlocks.filter(b => b !== 'Todos').length > 0 ? (
                existingBlocks
                  .filter(b => b !== 'Todos')
                  .map((b) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 bg-white border border-slate-200 rounded-md font-medium text-[11px] text-slate-700 shadow-2xs"
                    >
                      {b}
                    </span>
                  ))
              ) : (
                <span className="text-slate-400 italic">No hay manzanos registrados aún.</span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Guardar Manzano</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
