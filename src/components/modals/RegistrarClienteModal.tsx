import React, { useState } from 'react';
import { X, UserPlus, Check, Calendar, Briefcase, Heart, Upload, FileText, Image as ImageIcon, FileCheck } from 'lucide-react';
import { Client, ClientDocument } from '../../types';

interface RegistrarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClient: (client: Client) => void;
}

export const RegistrarClienteModal: React.FC<RegistrarClienteModalProps> = ({
  isOpen,
  onClose,
  onSaveClient,
}) => {
  const [name, setName] = useState('');
  const [ci, setCi] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [occupation, setOccupation] = useState('');
  const [civilStatus, setCivilStatus] = useState<string>('Soltero(a)');
  const [status, setStatus] = useState<'Activo' | 'Inactivo' | 'Potencial'>('Activo');
  const [uploadedDocuments, setUploadedDocuments] = useState<ClientDocument[]>([]);
  const [fileNameInput, setFileNameInput] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    const fileType: 'pdf' | 'image' | 'doc' = isPdf ? 'pdf' : isImage ? 'image' : 'doc';
    const docName = fileNameInput.trim() || file.name;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      const newDoc: ClientDocument = {
        id: `DOC-${Date.now().toString().slice(-4)}`,
        name: docName,
        type: fileType,
        fileUrl: result,
        uploadDate: formattedDate,
        size: `${(file.size / 1024).toFixed(0)} KB`
      };
      setUploadedDocuments(prev => [...prev, newDoc]);
      setFileNameInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (id: string) => {
    setUploadedDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ci.trim() || !phone.trim()) {
      alert('Por favor completa al menos el nombre, cédula de identidad y teléfono');
      return;
    }

    const newClient: Client = {
      id: `C-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      ci: ci.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      address: address.trim() || 'Cochabamba, Bolivia',
      status,
      purchasedLots: [],
      totalInvested: 0,
      birthDate: birthDate || undefined,
      occupation: occupation.trim() || undefined,
      civilStatus: civilStatus || undefined,
      documents: uploadedDocuments.length > 0 ? uploadedDocuments : undefined,
    };

    onSaveClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#072a1b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Registrar Nuevo Cliente</h2>
              <p className="text-xs text-emerald-200/80">Crea el expediente de cliente con datos personales y documentos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Datos Básicos Obligatorios */}
          <div>
            <h3 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2.5">
              Datos Principales del Cliente *
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Roberto Morales"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cédula de Identidad (CI) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 5892134 CB"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Teléfono / Celular *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 71234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico (Opcional)</label>
                <input
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Dirección de Domicilio</label>
                <input
                  type="text"
                  placeholder="Zona, Calle y Número"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* DATOS OPCIONALES DEL CLIENTE: Fecha de Nacimiento, Profesión, Estado Civil */}
          <div className="pt-3 border-t border-slate-100">
            <h3 className="font-extrabold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              Datos Adicionales del Cliente (Opcionales)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Fecha de nacimiento */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              {/* Ocupación / Profesión */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Ocupación / Profesión
                </label>
                <input
                  type="text"
                  placeholder="Ej. Abogado, Comerciante..."
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              {/* Estado civil */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Estado Civil
                </label>
                <select
                  value={civilStatus}
                  onChange={(e) => setCivilStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                >
                  <option value="Soltero(a)">Soltero(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viudo(a)">Viudo(a)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SUBIDA DE DOCUMENTOS (PDF O IMAGEN) */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  Expediente de Documentos (PDF o Imagen)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Adjunta cédula de identidad, comprobante de ingresos, formularios o contratos escaneados.
                </p>
              </div>
            </div>

            {/* Input de archivo */}
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <ImageIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <label className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-300" />
                  <span>Seleccionar Archivo (PDF o Imagen)</span>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">Formatos admitidos: PDF, JPG, PNG, WEBP (Hasta 10MB)</p>
              </div>
            </div>

            {/* Lista de documentos agregados */}
            {uploadedDocuments.length > 0 && (
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-700 text-[11px]">Documentos listos para guardar ({uploadedDocuments.length}):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {uploadedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {doc.type === 'pdf' ? (
                          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                            PDF
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
                            IMG
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-[11px] truncate">{doc.name}</p>
                          <p className="text-[9.5px] text-slate-400">{doc.size || 'Archivo'} &bull; {doc.uploadDate}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="w-6 h-6 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Guardar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
