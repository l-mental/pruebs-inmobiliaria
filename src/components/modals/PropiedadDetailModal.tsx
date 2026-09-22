import React from 'react';
import { X, MapPin, Maximize2, BedDouble, Bath, Car, CheckCircle2, Phone, Calendar } from 'lucide-react';
import { Property } from '../../types';

interface PropiedadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onOpenSaleModal?: () => void;
}

export const PropiedadDetailModal: React.FC<PropiedadDetailModalProps> = ({
  isOpen,
  onClose,
  property,
  onOpenSaleModal,
}) => {
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with image */}
        <div className="relative h-60">
          <img
            src={property.image}
            alt={property.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 text-white">
            <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg uppercase tracking-wide">
              {property.operation} • {property.type}
            </span>
            <h2 className="text-xl font-bold mt-1.5 leading-snug">{property.title}</h2>
            <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {property.location}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Price & Status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-slate-400 font-medium">Precio de Oferta</span>
              <p className="text-2xl font-black text-slate-900">
                {property.currency} {property.price.toLocaleString('es-BO')}
                {property.period && <span className="text-xs font-normal text-slate-500">{property.period}</span>}
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full border border-emerald-200 text-xs">
              Estado: {property.status}
            </span>
          </div>

          {/* Quick specs */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Superficie</span>
              <span className="font-bold text-slate-900 text-sm">{property.area} m²</span>
            </div>
            {property.rooms && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Dormitorios</span>
                <span className="font-bold text-slate-900 text-sm">{property.rooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Baños</span>
                <span className="font-bold text-slate-900 text-sm">{property.bathrooms}</span>
              </div>
            )}
            {property.garage && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Garaje</span>
                <span className="font-bold text-slate-900 text-sm">Sí (1 vehículo)</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-1">Descripción</h4>
            <p className="text-slate-600 leading-relaxed">{property.description}</p>
          </div>

          {/* Features */}
          {property.features && (
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2">Comodidades</h4>
              <div className="grid grid-cols-2 gap-2">
                {property.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <a
              href="https://wa.me/59171234567"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Contactar Agente</span>
            </a>

            {onOpenSaleModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSaleModal();
                }}
                className="flex-1 py-2.5 px-4 bg-[#0d3f2b] hover:bg-[#082b1d] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Iniciar Venta</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
