import React, { useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, Plus, FileText, ChevronRight } from 'lucide-react';
import { Client } from '../../types';

interface ClientesViewProps {
  clients: Client[];
  onOpenNewClient?: () => void;
  onSelectClient?: (client: Client) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clients,
  onOpenNewClient,
  onSelectClient,
}) => {
  const [search, setSearch] = useState('');

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.ci.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0d3f2b] text-white flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Directorio de Clientes
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión de expedientes, historial de compras, contratos y comunicación con compradores.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewClient}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo cliente</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, CI o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                    {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                    <p className="text-xs text-slate-500">CI: {client.ci}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{client.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Inmuebles Adquiridos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {client.purchasedLots.map((lot, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[11px] rounded-lg font-medium"
                    >
                      {lot}
                    </span>
                  ))}
                </div>
                <div className="pt-2 flex justify-between text-xs">
                  <span className="text-slate-500">Total invertido:</span>
                  <span className="font-extrabold text-emerald-800">
                    Bs. {client.totalInvested.toLocaleString('es-BO')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <a
                href={`https://wa.me/591${client.phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-200"
              >
                <span>Contactar WhatsApp</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
