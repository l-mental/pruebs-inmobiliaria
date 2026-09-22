import React from 'react';
import { X, Printer, Download, ShieldCheck, FileText } from 'lucide-react';
import { Sale } from '../../types';

interface ContratoModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

export const ContratoModal: React.FC<ContratoModalProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header toolbar */}
        <div className="bg-[#072a1b] text-white p-4 px-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-amber-300" />
            <h2 className="text-sm font-bold">Contrato de Compraventa - {sale.id}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="p-8 overflow-y-auto bg-slate-50 text-slate-800 text-xs font-serif leading-relaxed">
          <div className="max-w-2xl mx-auto bg-white p-8 shadow-sm border border-slate-200 rounded-lg space-y-6">
            {/* Header Document */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
              <h1 className="text-sm font-bold tracking-wider uppercase font-sans text-slate-900">
                INMOBILIARIA NUEVAS RAÍCES S.R.L.
              </h1>
              <p className="text-[10px] text-slate-500 font-sans">
                NIT: 1029384021 • REGISTRO DE COMERCIO FUNDEMPRESA Nº 00392819
              </p>
              <p className="text-xs font-bold pt-2 uppercase font-sans text-emerald-900">
                CONTRATO PRIVADO DE PROMESA DE COMPRAVENTA DE BIEN INMUEBLE CON RESERVA DE PROPIEDAD
              </p>
              <p className="text-[11px] font-sans font-semibold text-slate-700">
                REGISTRO Nº: {sale.id}
              </p>
            </div>

            {/* Clauses */}
            <div className="space-y-4 text-justify font-sans text-[11.5px] leading-relaxed text-slate-700">
              <p>
                Conste por el presente documento privado de promesa de compraventa de bien inmueble, que podrá ser elevado a instrumento público previo reconocimiento de firmas y rúbricas ante Notario de Fe Pública, celebrado al tenor de las siguientes cláusulas:
              </p>

              <div>
                <span className="font-bold text-slate-900">PRIMERA.- (DE LAS PARTES):</span>
                <p className="mt-1">
                  Por una parte, la empresa <span className="font-semibold">INMOBILIARIA NUEVAS RAÍCES S.R.L.</span>, legalmente constituida, representada por su apoderado legal <span className="font-semibold">{sale.sellerName}</span>, que en adelante se denominará la PROMITENTE VENDEDORA; y por otra parte el/la Sr./Sra. <span className="font-bold text-slate-900">{sale.clientName}</span>, mayor de edad, hábil por derecho, con Cédula de Identidad Nº <span className="font-bold text-slate-900">{sale.clientCI}</span>, quien en adelante se denominará el/la PROMITENTE COMPRADOR(A).
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900">SEGUNDA.- (DEL OBJETO Y DERECHO PROPIETARIO):</span>
                <p className="mt-1">
                  La PROMITENTE VENDEDORA declara ser legítima propietaria del predio urbano denominado <span className="font-semibold">{sale.urbanization}</span>. Por el presente contrato, transfiere a favor del COMPRADOR el predio identificado como:
                </p>
                <div className="my-2 p-2.5 bg-slate-50 border border-slate-200 rounded font-mono text-[11px]">
                  • Lote: <span className="font-bold">{sale.lot}</span><br />
                  • Manzano: <span className="font-bold">{sale.block}</span><br />
                  • Superficie Total: <span className="font-bold">{sale.surface}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-900">TERCERA.- (DEL PRECIO Y FORMA DE PAGO):</span>
                <p className="mt-1">
                  El precio total convenido libre y voluntariamente asciende a la suma de <span className="font-bold text-slate-900">Bs. {sale.amount.toLocaleString('es-BO')} (BOLIVIANOS)</span>. El COMPRADOR suscribe la modalidad de pago <span className="font-bold text-emerald-800">{sale.modality.toUpperCase()}</span>.
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-900">CUARTA.- (CONFORMIDAD):</span>
                <p className="mt-1">
                  Ambas partes expresan su entera conformidad con todas y cada una de las cláusulas estipuladas en el presente contrato, obligándose a su fiel y estricto cumplimiento.
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-12 grid grid-cols-2 gap-8 text-center font-sans text-xs">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-900">{sale.clientName}</p>
                <p className="text-slate-500">PROMITENTE COMPRADOR</p>
                <p className="text-slate-500 text-[10px]">CI: {sale.clientCI}</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-900">Nuevas Raíces S.R.L.</p>
                <p className="text-slate-500">PROMITENTE VENDEDORA</p>
                <p className="text-slate-500 text-[10px]">Asesor: {sale.sellerName}</p>
              </div>
            </div>

            <div className="pt-4 text-center text-[10px] text-slate-400 font-sans">
              Fecha de emisión: {sale.date} • Cochabamba, Bolivia
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
