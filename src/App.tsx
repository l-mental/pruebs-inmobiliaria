/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InicioView } from './components/views/InicioView';
import { VentasView } from './components/views/VentasView';
import { PagosView } from './components/views/PagosView';
import { TerrenosView } from './components/views/TerrenosView';
import { PropiedadesView } from './components/views/PropiedadesView';
import { ClientesView } from './components/views/ClientesView';

import { RegistrarVentaModal } from './components/modals/RegistrarVentaModal';
import { RegistrarPagoModal } from './components/modals/RegistrarPagoModal';
import { ContratoModal } from './components/modals/ContratoModal';
import { PropiedadDetailModal } from './components/modals/PropiedadDetailModal';

import { 
  initialSales, 
  initialPayments, 
  initialProperties, 
  initialUrbanizations, 
  initialLots, 
  initialClients, 
  initialSellers,
  initialActivities
} from './data/initialData';

import { TabType, UserRole, Sale, Payment, Property, Urbanization, Lot, Client } from './types';

export default function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data States
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [urbanizations, setUrbanizations] = useState<Urbanization[]>(initialUrbanizations);
  const [lots, setLots] = useState<Lot[]>(initialLots);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [sellers] = useState(initialSellers);
  const [activities] = useState(initialActivities);

  // Modals & Inspection States
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [contractSale, setContractSale] = useState<Sale | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [lotDataForSale, setLotDataForSale] = useState<{
    lotNumber: string;
    urbanizationName: string;
    priceBs: number;
    surface: number;
  } | undefined>(undefined);

  // Handlers
  const handleSaveSale = (newSale: Sale) => {
    setSales(prev => [newSale, ...prev]);

    // Update lot status if exists
    setLots(prevLots =>
      prevLots.map(l =>
        l.lotNumber === newSale.lot
          ? { ...l, status: 'Vendido', buyerName: newSale.clientName }
          : l
      )
    );

    // If client is new, create client entry
    if (!clients.some(c => c.ci === newSale.clientCI)) {
      const newClient: Client = {
        id: newSale.clientId,
        name: newSale.clientName,
        ci: newSale.clientCI,
        phone: newSale.clientPhone,
        email: `${newSale.clientName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        address: 'Av. Circunvalación #104, Cochabamba',
        purchasedLots: [`${newSale.urbanization} - ${newSale.lot}`],
        totalInvested: newSale.amount,
        status: 'Activo',
      };
      setClients(prev => [newClient, ...prev]);
    }

    // Auto-create initial payment if any
    if (newSale.totalPaid > 0) {
      const autoPayment: Payment = {
        id: `P-${Math.floor(100 + Math.random() * 900)}`,
        saleId: newSale.id,
        date: newSale.date,
        clientName: newSale.clientName,
        clientCI: newSale.clientCI,
        urbanization: newSale.urbanization,
        lot: newSale.lot,
        amount: newSale.totalPaid,
        currency: 'Bs.',
        paymentMethod: newSale.modality === 'Contado' ? 'Contado' : 'Transferencia',
        type: 'cliente',
        status: 'Pagado',
        concept: newSale.modality === 'Contado' ? 'Pago total de contado' : 'Cuota inicial de venta a crédito',
      };
      setPayments(prev => [autoPayment, ...prev]);
    }
  };

  const handleSavePayment = (newPayment: Payment) => {
    setPayments(prev => [newPayment, ...prev]);

    // Update sale remaining balances
    setSales(prevSales =>
      prevSales.map(s => {
        if (s.id === newPayment.saleId) {
          const newPaid = s.totalPaid + newPayment.amount;
          const newBalance = Math.max(0, s.amount - newPaid);
          return {
            ...s,
            totalPaid: newPaid,
            pendingBalance: newBalance,
            status: newBalance === 0 ? 'Concretada' : s.status,
          };
        }
        return s;
      })
    );
  };

  const handleSelectLotForSale = (lot: Lot, urb: Urbanization) => {
    setLotDataForSale({
      lotNumber: lot.lotNumber,
      urbanizationName: urb.name,
      priceBs: lot.priceBs,
      surface: lot.surface,
    });
    setIsNewSaleModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onChangeRole={setCurrentRole}
        onOpenMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onOpenNewSale={() => {
          setLotDataForSale(undefined);
          setIsNewSaleModalOpen(true);
        }}
        onOpenNewPayment={() => setIsNewPaymentModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileMenuOpen(false);
          }}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* View Routing Surface */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-68px)]">
          {currentTab === 'inicio' && (
            <InicioView
              onNavigate={setCurrentTab}
              properties={properties}
              activities={activities}
              onSelectProperty={setSelectedProperty}
              onOpenNewSale={() => {
                setLotDataForSale(undefined);
                setIsNewSaleModalOpen(true);
              }}
              onOpenNewPayment={() => setIsNewPaymentModalOpen(true)}
            />
          )}

          {currentTab === 'ventas' && (
            <VentasView
              sales={sales}
              onOpenContract={(sale) => setContractSale(sale)}
              onOpenClientProfile={(clientId) => {
                setCurrentTab('clientes');
              }}
              onOpenNewSale={() => {
                setLotDataForSale(undefined);
                setIsNewSaleModalOpen(true);
              }}
            />
          )}

          {currentTab === 'pagos' && (
            <PagosView
              payments={payments}
              sales={sales}
              onOpenNewPayment={() => setIsNewPaymentModalOpen(true)}
              onOpenContract={(sale) => setContractSale(sale)}
            />
          )}

          {currentTab === 'terrenos' && (
            <TerrenosView
              lots={lots}
              urbanizations={urbanizations}
              onSelectLotForSale={handleSelectLotForSale}
            />
          )}

          {currentTab === 'propiedades' && (
            <PropiedadesView
              properties={properties}
              onSelectProperty={setSelectedProperty}
              onOpenNewProperty={() => alert('Formulario de alta de nuevo inmueble disponible para administradores.')}
            />
          )}

          {currentTab === 'clientes' && (
            <ClientesView
              clients={clients}
              onOpenNewClient={() => alert('Para registrar un nuevo cliente, puedes iniciar una nueva venta desde el botón "+ Nueva Venta".')}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <RegistrarVentaModal
        isOpen={isNewSaleModalOpen}
        onClose={() => {
          setIsNewSaleModalOpen(false);
          setLotDataForSale(undefined);
        }}
        urbanizations={urbanizations}
        onSaveSale={handleSaveSale}
        initialLotData={lotDataForSale}
      />

      <RegistrarPagoModal
        isOpen={isNewPaymentModalOpen}
        onClose={() => setIsNewPaymentModalOpen(false)}
        sales={sales}
        onSavePayment={handleSavePayment}
      />

      <ContratoModal
        isOpen={!!contractSale}
        onClose={() => setContractSale(null)}
        sale={contractSale}
      />

      <PropiedadDetailModal
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        property={selectedProperty}
        onOpenSaleModal={() => {
          setLotDataForSale(undefined);
          setIsNewSaleModalOpen(true);
        }}
      />
    </div>
  );
}
