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
import { RegistrarPropiedadModal } from './components/modals/RegistrarPropiedadModal';
import { RegistrarClienteModal } from './components/modals/RegistrarClienteModal';
import { PlanPagosModal } from './components/modals/PlanPagosModal';

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
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [contractSale, setContractSale] = useState<Sale | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [paymentPlanClient, setPaymentPlanClient] = useState<Client | null>(null);
  const [paymentPlanSale, setPaymentPlanSale] = useState<Sale | null>(null);
  const [lotDataForSale, setLotDataForSale] = useState<{
    lotNumber: string;
    urbanizationName: string;
    priceBs: number;
    surface: number;
    latitude?: number;
    longitude?: number;
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
      latitude: lot.latitude,
      longitude: lot.longitude,
    });
    setIsNewSaleModalOpen(true);
  };

  const handleAddUrbanization = (newUrb: Urbanization, generatedLots?: Lot[]) => {
    setUrbanizations(prev => [newUrb, ...prev]);
    if (generatedLots && generatedLots.length > 0) {
      setLots(prev => [...generatedLots, ...prev]);
    }
  };

  const handleAddLot = (newLot: Lot) => {
    setLots(prev => [newLot, ...prev]);
    // update urbanization counters
    setUrbanizations(prev => prev.map(u => {
      if (u.id === newLot.urbanizationId) {
        return {
          ...u,
          totalLots: u.totalLots + 1,
          availableLots: newLot.status === 'Disponible' ? u.availableLots + 1 : u.availableLots,
          soldLots: newLot.status === 'Vendido' ? u.soldLots + 1 : u.soldLots,
        };
      }
      return u;
    }));
  };

  const handleUpdateLot = (updatedLot: Lot) => {
    setLots(prev => prev.map(l => l.id === updatedLot.id ? updatedLot : l));
  };

  const handleSaveProperty = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
  };

  const handleSaveClient = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
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
              onOpenPaymentPlan={(sale) => {
                setPaymentPlanClient(null);
                setPaymentPlanSale(sale);
              }}
            />
          )}

          {currentTab === 'pagos' && (
            <PagosView
              payments={payments}
              sales={sales}
              lots={lots}
              urbanizations={urbanizations}
              onOpenNewPayment={() => setIsNewPaymentModalOpen(true)}
              onOpenContract={(sale) => setContractSale(sale)}
              onOpenPaymentPlan={(sale) => {
                setPaymentPlanClient(null);
                setPaymentPlanSale(sale);
              }}
            />
          )}

          {currentTab === 'terrenos' && (
            <TerrenosView
              lots={lots}
              urbanizations={urbanizations}
              onSelectLotForSale={handleSelectLotForSale}
              onAddUrbanization={handleAddUrbanization}
              onAddLot={handleAddLot}
              onUpdateLot={handleUpdateLot}
            />
          )}

          {currentTab === 'propiedades' && (
            <PropiedadesView
              properties={properties}
              onSelectProperty={setSelectedProperty}
              onOpenNewProperty={() => setIsNewPropertyModalOpen(true)}
            />
          )}

          {currentTab === 'clientes' && (
            <ClientesView
              clients={clients}
              onOpenNewClient={() => setIsNewClientModalOpen(true)}
              onUpdateClient={handleUpdateClient}
              onOpenPaymentPlan={(client) => {
                setPaymentPlanSale(null);
                setPaymentPlanClient(client);
              }}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <RegistrarClienteModal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        onSaveClient={handleSaveClient}
      />

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

      <RegistrarPropiedadModal
        isOpen={isNewPropertyModalOpen}
        onClose={() => setIsNewPropertyModalOpen(false)}
        onSaveProperty={handleSaveProperty}
        urbanizations={urbanizations}
      />

      <ContratoModal
        isOpen={!!contractSale}
        onClose={() => setContractSale(null)}
        sale={contractSale}
      />

      <PlanPagosModal
        isOpen={!!paymentPlanClient || !!paymentPlanSale}
        onClose={() => {
          setPaymentPlanClient(null);
          setPaymentPlanSale(null);
        }}
        client={paymentPlanClient}
        sale={paymentPlanSale}
        sales={sales}
        payments={payments}
        onRegisterInstallmentPayment={(saleId, installmentNumber, amount, clientName, urbanization, lot) => {
          const today = new Date();
          const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
          const newPayment: Payment = {
            id: `P-${Math.floor(100 + Math.random() * 900)}`,
            saleId,
            date: dateStr,
            clientName,
            urbanization,
            lot,
            amount,
            currency: 'Bs.',
            paymentMethod: 'Transferencia',
            type: 'cliente',
            status: 'Pagado',
            concept: `Pago de Cuota N° ${installmentNumber}`,
          };
          handleSavePayment(newPayment);
        }}
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
