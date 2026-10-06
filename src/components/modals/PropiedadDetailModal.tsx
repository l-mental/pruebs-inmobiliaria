import React from 'react';
import { X, MapPin, Maximize2, BedDouble, Bath, Car, CheckCircle2, Phone, Users, Building2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with image */}
        <div className="relative h-64">
          <img
            src={property.image}
            alt={property.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/85 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-black rounded-lg uppercase tracking-wide">
                {property.operation} • {property.type}
              </span>
              {property.urbanizationName && (
                <span className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-lg uppercase">
                  Urbanización: {property.urbanizationName}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black mt-2 leading-snug">{property.title}</h2>
            {property.propertyName && property.propertyName !== property.title && (
              <p className="text-sm font-bold text-amber-300">{property.propertyName}</p>
            )}
            <p className="text-sm text-slate-200 flex items-center gap-1.5 mt-1 font-medium">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {property.location}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 text-sm text-slate-700">
          {/* Price & Status */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <span className="text-slate-500 font-bold text-xs uppercase">Precio de Oferta</span>
              <p className="text-3xl font-black text-slate-900">
                {property.currency} {property.price.toLocaleString('es-BO')}
                {property.period && <span className="text-sm font-normal text-slate-500">{property.period}</span>}
              </p>
            </div>
            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-900 font-black rounded-full border border-emerald-300 text-xs">
              Estado: {property.status}
            </span>
          </div>

          {/* Propietarios / Nombres Registrados */}
          {property.ownerNames && property.ownerNames.length > 0 && (
            <div className="p-4 bg-emerald-50/80 rounded-2xl border-2 border-emerald-200 space-y-2">
              <h4 className="font-black text-emerald-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Nombre(s) de Propietario(s) / Titular(es) Registrado(s)</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {property.ownerNames.map((owner, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 bg-white text-slate-900 font-black text-xs rounded-xl border border-emerald-300 shadow-2xs"
                  >
                    {owner}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-xs uppercase font-bold block">Superficie</span>
              <span className="font-black text-slate-900 text-base">{property.area} m²</span>
            </div>
            {property.rooms && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs uppercase font-bold block">Dormitorios</span>
                <span className="font-black text-slate-900 text-base">{property.rooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs uppercase font-bold block">Baños</span>
                <span className="font-black text-slate-900 text-base">{property.bathrooms}</span>
              </div>
            )}
            {property.garage && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-xs uppercase font-bold block">Garaje</span>
                <span className="font-black text-slate-900 text-base">Sí Incluye</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="font-black text-slate-900 uppercase tracking-wider mb-1 text-xs">Descripción</h4>
            <p className="text-slate-700 leading-relaxed font-medium">{property.description}</p>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-wider mb-2 text-xs">Ambientes y Comodidades</h4>
              <div className="grid grid-cols-2 gap-2">
                {property.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
            <a
              href="https://wa.me/59171234567"
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-black rounded-xl border border-emerald-300 transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Contactar Asesor</span>
            </a>

            {onOpenSaleModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSaleModal();
                }}
                className="flex-1 py-3 px-4 bg-[#0d3f2b] hover:bg-[#082b1d] text-white font-black rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
