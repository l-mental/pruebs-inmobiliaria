import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  FileText, 
  Calendar, 
  Briefcase, 
  Upload, 
  ExternalLink, 
  Trash2, 
  X, 
  Eye, 
  Heart,
  FileCheck,
  Edit3,
  Save,
  Printer,
  Landmark,
  Building2
} from 'lucide-react';
import { Client, ClientDocument } from '../../types';

interface ClientesViewProps {
  clients: Client[];
  onOpenNewClient?: () => void;
  onUpdateClient?: (client: Client) => void;
  onOpenPaymentPlan?: (client: Client) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  clients,
  onOpenNewClient,
  onUpdateClient,
  onOpenPaymentPlan,
}) => {
  const [search, setSearch] = useState('');
  const [selectedClientForDocs, setSelectedClientForDocs] = useState<Client | null>(null);
  const [docNameInput, setDocNameInput] = useState('');
  const [previewDoc, setPreviewDoc] = useState<ClientDocument | null>(null);

  // Edit client state
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editOccupation, setEditOccupation] = useState('');
  const [editCivilStatus, setEditCivilStatus] = useState('Soltero(a)');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');

  const handleOpenEdit = (client: Client) => {
    setClientToEdit(client);
    setEditBirthDate(client.birthDate || '');
    setEditOccupation(client.occupation || '');
    setEditCivilStatus(client.civilStatus || 'Soltero(a)');
    setEditPhone(client.phone || '');
    setEditEmail(client.email || '');
    setEditAddress(client.address || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientToEdit) return;

    const updated: Client = {
      ...clientToEdit,
      birthDate: editBirthDate || undefined,
      occupation: editOccupation.trim() || undefined,
      civilStatus: editCivilStatus || undefined,
      phone: editPhone.trim() || clientToEdit.phone,
      email: editEmail.trim() || clientToEdit.email,
      address: editAddress.trim() || clientToEdit.address,
    };

    if (onUpdateClient) {
      onUpdateClient(updated);
    }
    setClientToEdit(null);
  };

  const calculateAge = (birthDateString?: string) => {
    if (!birthDateString) return null;
    const birth = new Date(birthDateString);
    if (isNaN(birth.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.ci.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.occupation && c.occupation.toLowerCase().includes(search.toLowerCase()))
  );

  // Upload document handler
  const handleUploadDoc = (client: Client, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    const fileType: 'pdf' | 'image' | 'doc' = isPdf ? 'pdf' : isImage ? 'image' : 'doc';
    const docName = docNameInput.trim() || file.name;

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

      const updatedClient: Client = {
        ...client,
        documents: [...(client.documents || []), newDoc]
      };

      if (onUpdateClient) {
        onUpdateClient(updatedClient);
      }
      setSelectedClientForDocs(updatedClient);
      setDocNameInput('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (client: Client, docId: string) => {
    const updatedClient: Client = {
      ...client,
      documents: (client.documents || []).filter(d => d.id !== docId)
    };
    if (onUpdateClient) {
      onUpdateClient(updatedClient);
    }
    setSelectedClientForDocs(updatedClient);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1750px] mx-auto font-sans">
      {/* Header Vistoso */}
      <div className="bg-gradient-to-r from-[#072a1b] via-[#0d3f2b] to-[#115e3f] rounded-3xl p-6 text-white shadow-xl border border-emerald-800/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-15 h-15 rounded-2xl bg-amber-400/20 border-2 border-amber-300/40 text-amber-300 flex items-center justify-center shadow-lg flex-shrink-0">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Directorio y Expediente de Clientes
              </h1>
              <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-[#072a1b] uppercase tracking-wider shadow-xs">
                Planes de Pago Bancarios
              </span>
            </div>
            <p className="text-sm text-emerald-100/90 mt-1 font-medium">
              Gestión de titulares, documentos adjuntos, lotes por Urbanización e impresión de Plan de Pagos estilo banco.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewClient}
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#072a1b] text-sm font-black rounded-2xl shadow-lg transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>+ Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-xs flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, CI, teléfono, urbanización o profesión..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
          />
        </div>
        <span className="px-4 py-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-sm font-extrabold hidden sm:inline">
          {filtered.length} {filtered.length === 1 ? 'Cliente Registrado' : 'Clientes Registrados'}
        </span>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((client) => {
          const age = calculateAge(client.birthDate);
          const docsCount = client.documents?.length || 0;

          return (
            <div
              key={client.id}
              className="bg-white rounded-3xl border-2 border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-emerald-600/40 transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0d3f2b] to-emerald-700 text-amber-300 flex items-center justify-center font-black text-lg shadow-md border border-emerald-600">
                      {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-snug">{client.name}</h3>
                      <p className="text-sm text-slate-600 font-bold mt-0.5">CI: {client.ci}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-black rounded-full border border-emerald-300">
                    {client.status}
                  </span>
                </div>

                {/* Personal Details (Fecha de Nacimiento, Profesión, Estado Civil) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-sm">
                  {/* Fecha de Nacimiento */}
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                      <Calendar className="w-4 h-4 text-emerald-700" />
                      F. Nacimiento:
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {client.birthDate ? (
                        <>
                          {client.birthDate} {age !== null && <span className="text-emerald-700 font-bold">({age} años)</span>}
                        </>
                      ) : (
                        <span className="text-slate-400 italic font-normal">No especificada</span>
                      )}
                    </span>
                  </div>

                  {/* Ocupación / Profesión */}
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                      <Briefcase className="w-4 h-4 text-emerald-700" />
                      Profesión:
                    </span>
                    <span className="font-extrabold text-slate-900 truncate max-w-[190px]" title={client.occupation}>
                      {client.occupation || <span className="text-slate-400 italic font-normal">No especificada</span>}
                    </span>
                  </div>

                  {/* Estado Civil */}
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wide">
                      <Heart className="w-4 h-4 text-emerald-700" />
                      Estado Civil:
                    </span>
                    <span className="font-bold text-slate-800">
                      {client.civilStatus || 'No especificado'}
                    </span>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2 text-sm text-slate-700 px-1">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span className="font-extrabold text-slate-900">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-emerald-700" />
                    <span className="truncate font-medium text-slate-700">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span className="truncate font-medium text-slate-700">{client.address}</span>
                  </div>
                </div>

                {/* EXPEDIENTE DE DOCUMENTOS (PDF O IMAGEN) */}
                <div className="pt-3 border-t border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      Documentos ({docsCount})
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedClientForDocs(client)}
                      className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Subir / Ver</span>
                    </button>
                  </div>

                  {/* Document previews */}
                  {docsCount > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {client.documents?.slice(0, 3).map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => setPreviewDoc(doc)}
                          className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2 cursor-pointer transition-colors text-xs"
                          title={doc.name}
                        >
                          {doc.type === 'pdf' ? (
                            <span className="text-red-700 font-black text-[10px] bg-red-100 px-1.5 py-0.5 rounded-md border border-red-200">PDF</span>
                          ) : (
                            <span className="text-blue-700 font-black text-[10px] bg-blue-100 px-1.5 py-0.5 rounded-md border border-blue-200">IMG</span>
                          )}
                          <span className="truncate max-w-[140px] font-bold text-slate-800">{doc.name}</span>
                        </div>
                      ))}
                      {docsCount > 3 && (
                        <span className="text-xs font-bold text-slate-500 self-center">
                          +{docsCount - 3} más
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Sin documentos adjuntos todavía.</p>
                  )}
                </div>

                {/* Urbanización e Inmuebles Adquiridos (Sin Total Invertido) */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <p className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <span>Urbanización y Lotes Adquiridos</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {client.purchasedLots.length > 0 ? (
                      client.purchasedLots.map((lot, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-950 border border-emerald-300 text-xs rounded-xl font-extrabold shadow-2xs"
                        >
                          {lot}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Ninguna urbanización o lote asignado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 space-y-2.5">
                {/* Botón Principal: Plan de Pagos Estilo Banco */}
                {onOpenPaymentPlan && (
                  <button
                    type="button"
                    onClick={() => onOpenPaymentPlan(client)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#072a1b] to-[#0d3f2b] hover:from-[#0d3f2b] hover:to-[#145a3e] text-white font-black text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer border border-emerald-700"
                  >
                    <Landmark className="w-4 h-4 text-amber-300" />
                    <span>Ver / Imprimir Plan de Pagos</span>
                    <Printer className="w-4 h-4 text-emerald-200 ml-1" />
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/591${client.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-200 shadow-2xs"
                  >
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(client)}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Editar datos del cliente"
                  >
                    <Edit3 className="w-4 h-4 text-slate-600" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedClientForDocs(client)}
                    className="py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    title="Gestionar documentos del cliente"
                  >
                    <Upload className="w-4 h-4 text-amber-300" />
                    <span>Docs ({docsCount})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: GESTIÓN DE DOCUMENTOS DEL CLIENTE (PDF O IMAGEN) */}
      {selectedClientForDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#072a1b] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-300" />
                  <span>Expediente de Documentos</span>
                </h3>
                <p className="text-sm text-emerald-200/90 mt-0.5">
                  Cliente: <span className="font-bold text-white">{selectedClientForDocs.name}</span> (CI: {selectedClientForDocs.ci})
                </p>
              </div>
              <button
                onClick={() => setSelectedClientForDocs(null)}
                className="w-9 h-9 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 space-y-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Nombre o descripción del documento:</label>
                  <input
                    type="text"
                    placeholder="Ej. Cédula de Identidad Anverso, Certificado de Trabajo, Contrato..."
                    value={docNameInput}
                    onChange={(e) => setDocNameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                <div className="flex items-center justify-center">
                  <label className="w-full py-3 px-4 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-black rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-300" />
                    <span>Seleccionar y Subir Documento (PDF o Imagen)</span>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => handleUploadDoc(selectedClientForDocs, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-black text-slate-800 uppercase tracking-wider text-xs">
                  Documentos Registrados ({selectedClientForDocs.documents?.length || 0})
                </h4>

                {(selectedClientForDocs.documents && selectedClientForDocs.documents.length > 0) ? (
                  <div className="space-y-2">
                    {selectedClientForDocs.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-2xs hover:border-slate-300"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {doc.type === 'pdf' ? (
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0 font-black text-xs">
                              PDF
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-black text-xs">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{doc.name}</p>
                            <p className="text-xs text-slate-500">
                              Subido el: {doc.uploadDate} &bull; {doc.size || 'Archivo'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="px-3 py-1.5 rounded-xl text-emerald-800 hover:bg-emerald-50 border border-emerald-200 flex items-center gap-1 text-xs font-bold cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Ver</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveDoc(selectedClientForDocs, doc.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-medium">
                    No hay documentos subidos para este cliente todavía.
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClientForDocs(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#072a1b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-amber-300" />
                <span className="font-bold text-base truncate max-w-md">{previewDoc.name}</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100 min-h-[350px]">
              {previewDoc.type === 'pdf' ? (
                <div className="p-8 text-center space-y-3">
                  <FileText className="w-16 h-16 text-red-600 mx-auto" />
                  <p className="font-bold text-slate-800 text-base">{previewDoc.name}</p>
                  <p className="text-sm text-slate-500">Documento PDF cargado en el expediente.</p>
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={previewDoc.name}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d3f2b] text-white font-bold text-sm rounded-xl hover:bg-[#072a1c]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir / Descargar PDF</span>
                  </a>
                </div>
              ) : (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.name}
                  className="max-h-[500px] w-auto object-contain rounded-xl shadow-md border border-slate-200"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLIENT DATA MODAL */}
      {clientToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#072a1b] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black">Editar Datos del Cliente</h3>
                  <p className="text-xs text-emerald-200/80">
                    Cliente: <span className="font-bold text-white">{clientToEdit.name}</span> (CI: {clientToEdit.ci})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setClientToEdit(null)}
                className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-sm overflow-y-auto">
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Fecha de Nacimiento</span>
                </label>
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-700" />
                  <span>Ocupación / Profesión</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ingeniero Civil, Comerciante, Docente..."
                  value={editOccupation}
                  onChange={(e) => setEditOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-emerald-700" />
                  <span>Estado Civil</span>
                </label>
                <select
                  value={editCivilStatus}
                  onChange={(e) => setEditCivilStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="Soltero(a)">Soltero(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viudo(a)">Viudo(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>Teléfono / Celular</span>
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>Correo Electrónico</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>Dirección de Domicilio</span>
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setClientToEdit(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-black rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
