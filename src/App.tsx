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
  const [activities, setActivities] = useState(initialActivities);
  const [exchangeRate, setExchangeRate] = useState<number>(6.96);

  // Modals & Inspection States
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isNewPaymentModalOpen, setIsNewPaymentModalOpen] = useState(false);
  const [isNewPropertyModalOpen, setIsNewPropertyModalOpen] = useState(false);
  const [contractSale, setContractSale] = useState<Sale | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [paymentPlanClient, setPaymentPlanClient] = useState<Client | null>(null);
  const [paymentPlanSale, setPaymentPlanSale] = useState<Sale | null>(null);
  const [lotDataForSale, setLotDataForSale] = useState<{
    lotId?: string;
    clientName?: string;
    clientCI?: string;
    clientPhone?: string;
    lotNumber: string;
    block?: string;
    urbanizationName: string;
    priceBs: number;
    surface: number;
    latitude?: number;
    longitude?: number;
  } | undefined>(undefined);

  const syncUrbanizationsFromLots = (updatedLots: Lot[]) => {
    setUrbanizations(prevUrbs =>
      prevUrbs.map(u => {
        const uLots = updatedLots.filter(l => l.urbanizationId === u.id);
        if (uLots.length === 0) return u;
        return {
          ...u,
          totalLots: uLots.length,
          availableLots: uLots.filter(l => l.status === 'Disponible').length,
          soldLots: uLots.filter(l => l.status === 'Vendido').length,
          reservedLots: uLots.filter(l => l.status === 'Reservado').length,
        };
      })
    );
  };

  // Handlers
  const handleSaveSale = (newSale: Sale, matchedLotId?: string) => {
    setSales(prev => [newSale, ...prev]);

    // Update ONLY the exact sold lot (matched by ID, or urbanization + block + lotNumber)
    const targetUrb = urbanizations.find(
      u => u.name.toLowerCase() === newSale.urbanization.toLowerCase()
    );
    const normalizeNum = (val: string) =>
      val.trim().toLowerCase().replace(/^lote\s+/i, '');
    const targetLotNorm = normalizeNum(newSale.lot);
    const targetBlockNorm = (newSale.block || '').trim().toLowerCase();

    let updatedOnce = false;
    const nextLots = lots.map(l => {
      if (matchedLotId) {
        return l.id === matchedLotId
          ? { ...l, status: 'Vendido' as const, buyerName: newSale.clientName }
          : l;
      }
      if (updatedOnce) return l;
      const sameUrb =
        l.urbanizationId === targetUrb?.id ||
        (l.urbanizationName || '').toLowerCase() === newSale.urbanization.toLowerCase();
      const sameBlock = !targetBlockNorm || l.block.trim().toLowerCase() === targetBlockNorm;
      const sameNum = normalizeNum(l.lotNumber) === targetLotNorm;
      if (sameUrb && sameBlock && sameNum) {
        updatedOnce = true;
        return { ...l, status: 'Vendido' as const, buyerName: newSale.clientName };
      }
      return l;
    });
    setLots(nextLots);
    syncUrbanizationsFromLots(nextLots);

    // Auto-sync client record: create or update purchased lots & investment
    setClients(prev => {
      const exists = prev.some(c => c.ci === newSale.clientCI || c.name.toLowerCase() === newSale.clientName.toLowerCase());
      const lotEntry = `${newSale.urbanization} - ${newSale.lot}${newSale.block ? ` (${newSale.block})` : ''}`;
      if (exists) {
        return prev.map(c => {
          if (c.ci === newSale.clientCI || c.name.toLowerCase() === newSale.clientName.toLowerCase()) {
            const currentLots = c.purchasedLots || [];
            return {
              ...c,
              phone: newSale.clientPhone || c.phone,
              purchasedLots: currentLots.includes(lotEntry) ? currentLots : [...currentLots, lotEntry],
              totalInvested: (c.totalInvested || 0) + newSale.amount,
            };
          }
          return c;
        });
      } else {
        const emailSlug = newSale.clientName.toLowerCase().replace(/[^a-z0-9]/g, '.');
        const newClient: Client = {
          id: newSale.clientId || `C-${Date.now().toString().slice(-4)}`,
          name: newSale.clientName,
          ci: newSale.clientCI,
          phone: newSale.clientPhone || '71234567',
          email: `${emailSlug}@email.com`,
          address: 'Av. Circunvalación #104, Cochabamba',
          birthDate: '1988-03-24',
          occupation: 'Cliente / Propietario',
          civilStatus: 'Casado(a)',
          purchasedLots: [lotEntry],
          totalInvested: newSale.amount,
          status: 'Activo',
          documents: []
        };
        return [newClient, ...prev];
      }
    });

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

    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'sale',
        title: 'Se registró una nueva venta',
        description: `${newSale.lot} (${newSale.block}) - ${newSale.urbanization}`,
        time: 'Ahora',
        iconType: 'sale',
      },
      ...prev,
    ]);
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

    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'payment',
        title: 'Se registró un pago',
        description: `${newPayment.clientName} - ${newPayment.currency} ${newPayment.amount.toLocaleString('es-BO')}`,
        time: 'Ahora',
        iconType: 'payment',
      },
      ...prev,
    ]);
  };

  const handleSelectLotForSale = (lot: Lot, urb: Urbanization) => {
    setLotDataForSale({
      lotId: lot.id,
      lotNumber: lot.lotNumber,
      block: lot.block,
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
    setActivities(prev => [
      {
        id: `act-${Date.now()}`,
        type: 'reservation',
        title: 'Nueva urbanización registrada',
        description: `${newUrb.name} (${generatedLots?.length || newUrb.totalLots} terrenos)`,
        time: 'Ahora',
        iconType: 'lot',
      },
      ...prev,
    ]);
  };

  const handleUpdateUrbanization = (updatedUrb: Urbanization) => {
    setUrbanizations(prev => prev.map(u => u.id === updatedUrb.id ? updatedUrb : u));
  };

  const handleAddLot = (newLot: Lot) => {
    const nextLots = [newLot, ...lots];
    setLots(nextLots);
    syncUrbanizationsFromLots(nextLots);
  };

  const handleUpdateLot = (updatedLot: Lot) => {
    const nextLots = lots.map(l => l.id === updatedLot.id ? updatedLot : l);
    setLots(nextLots);
    syncUrbanizationsFromLots(nextLots);
  };

  const handleSaveProperty = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);

    // Automáticamente registrar a los propietarios como Clientes del sistema
    if (newProperty.ownerNames && newProperty.ownerNames.length > 0) {
      newProperty.ownerNames.forEach((ownerName, idx) => {
        const cleanName = ownerName.trim();
        if (!cleanName) return;

        setClients(prevClients => {
          const exists = prevClients.some(c => c.name.toLowerCase() === cleanName.toLowerCase());
          const lotEntry = `${newProperty.urbanizationName} - ${newProperty.propertyName || newProperty.title}`;
          const amountInBs = newProperty.currency === '$us.' ? Math.round(newProperty.price * exchangeRate) : newProperty.price;

          if (exists) {
            return prevClients.map(c => {
              if (c.name.toLowerCase() === cleanName.toLowerCase()) {
                const currentLots = c.purchasedLots || [];
                return {
                  ...c,
                  purchasedLots: currentLots.includes(lotEntry) ? currentLots : [...currentLots, lotEntry],
                  totalInvested: (c.totalInvested || 0) + amountInBs,
                };
              }
              return c;
            });
          }

          const fallbackCI = newProperty.ownerCI 
            ? (idx === 0 ? newProperty.ownerCI : `${Math.floor(2000000 + Math.random() * 7000000)} CB`) 
            : `${Math.floor(2000000 + Math.random() * 7000000)} CB`;
          const fallbackPhone = newProperty.ownerPhone || '71234567';
          const emailSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.');

          const newClient: Client = {
            id: `C-${Date.now().toString().slice(-4)}${idx}`,
            name: cleanName,
            ci: fallbackCI,
            phone: fallbackPhone,
            email: `${emailSlug}@email.com`,
            address: newProperty.location || `${newProperty.city || 'Cochabamba'}, Bolivia`,
            birthDate: '1984-06-15',
            occupation: 'Propietario / Inversionista',
            civilStatus: 'Casado(a)',
            status: 'Activo',
            purchasedLots: [lotEntry],
            totalInvested: amountInBs,
            documents: []
          };

          return [newClient, ...prevClients];
        });
      });
    }
  };

  const handleOpenSaleForProperty = (prop: Property) => {
    const primaryOwner = prop.ownerNames && prop.ownerNames.length > 0 ? prop.ownerNames[0].trim() : '';
    const lotLabel = `${prop.urbanizationName || 'Urbanización'} - ${prop.propertyName || prop.title}`;
    const totalBs = prop.currency === '$us.' ? Math.round(prop.price * exchangeRate) : prop.price;

    let targetCI = prop.ownerCI || `${Math.floor(3000000 + Math.random() * 6000000)} CB`;
    let targetPhone = prop.ownerPhone || '71234567';

    // Asegurar que el propietario aparezca en automático en Clientes
    if (primaryOwner) {
      setClients(prev => {
        const existing = prev.find(c => c.name.toLowerCase() === primaryOwner.toLowerCase());
        if (existing) {
          targetCI = existing.ci;
          targetPhone = existing.phone;
          const currentLots = existing.purchasedLots || [];
          return prev.map(c => c.id === existing.id ? {
            ...c,
            purchasedLots: currentLots.includes(lotLabel) ? currentLots : [...currentLots, lotLabel],
          } : c);
        }

        const emailSlug = primaryOwner.toLowerCase().replace(/[^a-z0-9]/g, '.');
        const autoClient: Client = {
          id: `C-${Date.now().toString().slice(-4)}`,
          name: primaryOwner,
          ci: targetCI,
          phone: targetPhone,
          email: `${emailSlug}@email.com`,
          address: prop.location || 'Cochabamba, Bolivia',
          birthDate: '1985-05-10',
          occupation: 'Propietario / Titular',
          civilStatus: 'Casado(a)',
          status: 'Activo',
          purchasedLots: [lotLabel],
          totalInvested: totalBs,
          documents: []
        };
        return [autoClient, ...prev];
      });
    }

    setLotDataForSale({
      clientName: primaryOwner,
      clientCI: targetCI,
      clientPhone: targetPhone,
      lotNumber: prop.propertyName || prop.title,
      urbanizationName: prop.urbanizationName || 'Villa Bonita',
      priceBs: totalBs,
      surface: prop.area,
      latitude: -17.543740,
      longitude: -65.986330,
    });
    setIsNewSaleModalOpen(true);
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
              clients={clients}
              sales={sales}
              payments={payments}
              lots={lots}
              urbanizations={urbanizations}
              exchangeRate={exchangeRate}
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
              exchangeRate={exchangeRate}
              onChangeExchangeRate={setExchangeRate}
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
              exchangeRate={exchangeRate}
              onSelectLotForSale={handleSelectLotForSale}
              onAddUrbanization={handleAddUrbanization}
              onUpdateUrbanization={handleUpdateUrbanization}
              onAddLot={handleAddLot}
              onUpdateLot={handleUpdateLot}
            />
          )}

          {currentTab === 'propiedades' && (
            <PropiedadesView
              properties={properties}
              onSelectProperty={setSelectedProperty}
              onOpenNewProperty={() => setIsNewPropertyModalOpen(true)}
              onSellProperty={handleOpenSaleForProperty}
            />
          )}

          {currentTab === 'clientes' && (
            <ClientesView
              clients={clients}
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
      <RegistrarVentaModal
        isOpen={isNewSaleModalOpen}
        onClose={() => {
          setIsNewSaleModalOpen(false);
          setLotDataForSale(undefined);
        }}
        urbanizations={urbanizations}
        clients={clients}
        properties={properties}
        lots={lots}
        exchangeRate={exchangeRate}
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
        exchangeRate={exchangeRate}
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
        onOpenSaleModal={(prop) => {
          if (prop) {
            handleOpenSaleForProperty(prop);
          } else {
            setLotDataForSale(undefined);
            setIsNewSaleModalOpen(true);
          }
        }}
      />
    </div>
  );
}
