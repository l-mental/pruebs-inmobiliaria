import React, { useState } from 'react';
import { X, Building2, Check, MapPin, Sparkles, UserPlus, Users, Trash2, Plus, Home } from 'lucide-react';
import { Property, PropertyType, PropertyOperation, PropertyStatus, Urbanization } from '../../types';

interface RegistrarPropiedadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProperty: (property: Property) => void;
  urbanizations?: Urbanization[];
}

const PRESET_IMAGES = [
  { label: 'Casa Moderna', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Departamento Lujo', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80' },
  { label: 'Chalet Campestre', url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80' },
  { label: 'Terreno Plano', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80' },
  { label: 'Local Comercial', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Residencial Verde', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80' },
];

export const RegistrarPropiedadModal: React.FC<RegistrarPropiedadModalProps> = ({
  isOpen,
  onClose,
  onSaveProperty,
  urbanizations = [],
}) => {
  const [title, setTitle] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [ownerNameInput, setOwnerNameInput] = useState('');
  const [ownerNames, setOwnerNames] = useState<string[]>(['Juan Carlos Morales']);
  const [urbanizationName, setUrbanizationName] = useState(urbanizations[0]?.name || 'Villa Bonita');
  const [type, setType] = useState<PropertyType>('Casa');
  const [operation, setOperation] = useState<PropertyOperation>('Venta');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Cochabamba');
  const [area, setArea] = useState<number>(300);
  const [rooms, setRooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [garage, setGarage] = useState<boolean>(true);
  const [price, setPrice] = useState<number>(95000);
  const [currency, setCurrency] = useState<'Bs.' | '$us.'>('$us.');
  const [period, setPeriod] = useState('');
  const [status, setStatus] = useState<PropertyStatus>('Disponible');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(true);
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>(['Papeles al día', 'Agua potable y Luz', 'Entrega inmediata']);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddOwnerName = () => {
    const trimmed = ownerNameInput.trim();
    if (!trimmed) return;
    if (!ownerNames.includes(trimmed)) {
      setOwnerNames(prev => [...prev, trimmed]);
    }
    setOwnerNameInput('');
  };

  const handleRemoveOwnerName = (index: number) => {
    setOwnerNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    if (!features.includes(trimmed)) {
      setFeatures(prev => [...prev, trimmed]);
    }
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || propertyName.trim();
    if (!finalTitle || !location.trim()) {
      setErrorMsg('Por favor ingresa el nombre/título de la propiedad y su ubicación.');
      return;
    }

    // Include any pending typed owner name
    const finalOwners = [...ownerNames];
    if (ownerNameInput.trim() && !finalOwners.includes(ownerNameInput.trim())) {
      finalOwners.push(ownerNameInput.trim());
    }

    const newProperty: Property = {
      id: `PROP-${Date.now().toString().slice(-4)}`,
      title: finalTitle,
      propertyName: propertyName.trim() || finalTitle,
      ownerNames: finalOwners.length > 0 ? finalOwners : ['Inmobiliaria Nuevas Raíces'],
      urbanizationName: urbanizationName || 'Villa Bonita',
      type,
      operation,
      location: location.trim(),
      city: city.trim() || 'Cochabamba',
      area: Number(area) || 100,
      rooms: type !== 'Terreno' && type !== 'Local Comercial' ? Number(rooms) : undefined,
      bathrooms: type !== 'Terreno' ? Number(bathrooms) : undefined,
      garage: type !== 'Terreno' ? garage : undefined,
      price: Number(price) || 0,
      currency,
      period: operation === 'Alquiler' ? (period || '/ mes') : undefined,
      status,
      image: image || PRESET_IMAGES[0].url,
      featured,
      features,
      description: description.trim() || `${type} en ${operation.toLowerCase()} en Urbanización ${urbanizationName}, ubicada en ${location}. Con ${area} m² de superficie total. Documentación saneada y entrega inmediata.`,
    };

    onSaveProperty(newProperty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-emerald-800/20 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#072a1b] via-[#0d3f2b] to-[#155e40] text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Registrar Nueva Propiedad</h2>
              <p className="text-sm text-emerald-100/90">
                Añade el nombre de la propiedad, nombres de propietarios/titulares, urbanización y detalles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-800 font-bold rounded-xl text-sm">
              {errorMsg}
            </div>
          )}

          {/* SECCIÓN 1: AÑADIR NOMBRES EN NUEVA PROPIEDAD (DESTACADO) */}
          <div className="p-5 bg-gradient-to-br from-emerald-50/90 to-teal-50/60 rounded-2xl border-2 border-emerald-200 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-base uppercase tracking-wide">
              <Users className="w-5 h-5 text-emerald-700" />
              <span>1. Nombres de la Propiedad y Propietarios / Titulares</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-800 font-extrabold mb-1.5 text-sm">
                  Nombre Específico de la Propiedad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Quinta Familiar Los Sauces / Residencia El Sol"
                  value={propertyName}
                  onChange={(e) => {
                    setPropertyName(e.target.value);
                    if (!title) setTitle(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full px-4 py-2.5 bg-white border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-slate-900 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-extrabold mb-1.5 text-sm">
                  Título Comercial de Publicación *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Casa Moderna de 2 Plantas con Jardín"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full px-4 py-2.5 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-slate-900 font-bold text-sm"
                />
              </div>
            </div>

            {/* AÑADIR NOMBRES DE PROPIETARIOS / TITULARES */}
            <div className="pt-2">
              <label className="block text-slate-800 font-extrabold mb-1.5 text-sm">
                Añadir Nombres (Propietarios, Copropietarios o Encargados de la Propiedad)
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Escribe un nombre completo (Ej. María Elena Torrez) y pulsa + Añadir Nombre..."
                  value={ownerNameInput}
                  onChange={(e) => setOwnerNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOwnerName();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-slate-900 font-semibold text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddOwnerName}
                  className="px-5 py-2.5 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-black rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm flex-shrink-0"
                >
                  <UserPlus className="w-4 h-4 text-amber-300" />
                  <span>+ Añadir Nombre</span>
                </button>
              </div>

              {/* Lista de Nombres Añadidos */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {ownerNames.map((nameItem, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white text-emerald-950 border-2 border-emerald-400 rounded-xl font-extrabold text-xs shadow-2xs"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{nameItem}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOwnerName(idx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                      title="Quitar nombre"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {ownerNames.length === 0 && (
                  <span className="text-xs text-slate-500 italic">
                    Ningún nombre añadido aún. Escribe arriba y haz clic en &ldquo;+ Añadir Nombre&rdquo;.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: TIPO, URBANIZACIÓN, MODALIDAD Y PRECIO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tipo de Propiedad</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 cursor-pointer"
              >
                <option value="Casa">Casa Residencial</option>
                <option value="Departamento">Departamento</option>
                <option value="Terreno">Terreno / Lote</option>
                <option value="Local Comercial">Local Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Urbanización</label>
              <select
                value={urbanizationName}
                onChange={(e) => setUrbanizationName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 cursor-pointer"
              >
                {urbanizations.length > 0 ? (
                  urbanizations.map((u) => (
                    <option key={u.id} value={u.name}>Urbanización {u.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Villa Bonita">Urbanización Villa Bonita</option>
                    <option value="Los Pinos">Urbanización Los Pinos</option>
                    <option value="Valle Verde">Urbanización Valle Verde</option>
                    <option value="El Mirador">Urbanización El Mirador</option>
                    <option value="La Florida">Urbanización La Florida</option>
                  </>
                )}
                <option value="Zona Residencial Central">Zona Residencial Central</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Modalidad / Operación</label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as PropertyOperation)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 cursor-pointer"
              >
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
                <option value="Anticrético">Anticrético</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Precio *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-black text-slate-900 text-base"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'Bs.' | '$us.')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 cursor-pointer"
              >
                <option value="$us.">$us. (Dólares)</option>
                <option value="Bs.">Bs. (Bolivianos)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold cursor-pointer"
              >
                <option value="Disponible">Disponible</option>
                <option value="Reservado">Reservado</option>
                <option value="Vendido">Vendido</option>
              </select>
            </div>
          </div>

          {/* Ubicación */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Ubicación y Dirección en la Urbanización</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Dirección / Avenida / Calle *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Av. Principal Simón Bolívar #125, Frente a Parque"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Ciudad / Municipio</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Características físicas y nombres de ambientes */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h3 className="font-black text-slate-800 uppercase tracking-wider">
              Dimensiones y Ambientes de la Propiedad
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Superficie (m²) *</label>
                <input
                  type="number"
                  required
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Habitaciones</label>
                <input
                  type="number"
                  disabled={type === 'Terreno'}
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Baños</label>
                <input
                  type="number"
                  disabled={type === 'Terreno'}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold disabled:opacity-50"
                />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={garage}
                    onChange={(e) => setGarage(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded-xs accent-emerald-800"
                  />
                  <span className="font-bold text-slate-800">Incluye Garaje</span>
                </label>
              </div>
            </div>

            {/* Añadir nombres de características / ambientes adicionales */}
            <div className="pt-2">
              <label className="block text-slate-700 font-bold mb-1">
                Añadir Nombres de Ambientes / Beneficios Extra
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej. Churrasquero, Jardín Posterior, Suite Principal..."
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold rounded-xl border border-emerald-300 cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {features.map((feat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold border border-slate-200"
                  >
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(i)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Galería / Imagen */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-bold mb-2">
              Imagen Principal de la Propiedad
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-2.5">
              {PRESET_IMAGES.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImage(img.url)}
                  className={`relative rounded-xl overflow-hidden border-2 h-20 transition-all cursor-pointer ${
                    image === img.url ? 'border-emerald-700 ring-2 ring-emerald-500/40 scale-102' : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/65 text-white text-[10px] font-bold py-0.5 text-center truncate px-1">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="url"
              placeholder="O pega aquí una URL personalizada de la fotografía..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-700 text-xs font-medium"
            />
          </div>

          {/* Descripción */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-slate-700 font-bold mb-1">Descripción y Detalles</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe las comodidades, cercanía a avenidas, estado de papelería, acabados..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-[#0d3f2b] to-[#166534] hover:from-[#072a1c] hover:to-[#0d3f2b] text-white font-black rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5 text-amber-300" />
              <span>Guardar Nueva Propiedad</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
