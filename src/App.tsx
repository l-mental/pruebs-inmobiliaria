/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { InicioView } from './components/views/InicioView';
import { VentasView } from './components/views/VentasView';
import { PagosView } from './components/views/PagosView';
import { TerrenosView } from './components/views/TerrenosView';
import { PropiedadesView } from './components/views/PropiedadesView';
import { ClientesView } from './components/views/ClientesView';
import { LoginView } from './components/views/LoginView';
import { UsuariosView } from './components/views/UsuariosView';

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
  initialActivities 
} from './data/initialData';
import { DEFAULT_SYSTEM_USERS } from './data/initialUsers';
import { isSupabaseConfigured } from './lib/supabase';
import {
  loadAllDataFromSupabase,
  syncUser,
  removeUserFromDb,
  syncUrbanization,
  syncUrbanizations,
  syncLot,
  syncLots,
  syncProperty,
  syncClient,
  syncSale,
  syncPayment,
  syncActivity,
  syncExchangeRate,
} from './services/database';

import { TabType, Sale, Payment, Property, Urbanization, Lot, Client, SystemUser, ActivityItem } from './types';

const USERS_STORAGE_KEY = 'nr_system_users_v1';
const SESSION_STORAGE_KEY = 'nr_active_user_id_v1';
const DATA_STORAGE_PREFIX = 'nr_data_v1_';

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${DATA_STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(`${DATA_STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

const loadInitialUsers = (): SystemUser[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return DEFAULT_SYSTEM_USERS;
    const parsed = JSON.parse(raw) as SystemUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SYSTEM_USERS;
    const hasAdmin = parsed.some((u) => u.id === 'USR-ADMIN' || u.username.toLowerCase() === 'admin');
    return hasAdmin ? parsed : [DEFAULT_SYSTEM_USERS[0], ...parsed];
  } catch {
    return DEFAULT_SYSTEM_USERS;
  }
};

const loadInitialSessionUserId = (): string | null => {
  try {
    return localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
};

export default function App() {
  // Authentication & Users State
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(loadInitialUsers);
  const [activeUserId, setActiveUserId] = useState<string | null>(loadInitialSessionUserId);

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(systemUsers));
    } catch {
      // Ignore storage quota errors
    }
  }, [systemUsers]);

  const currentUser = systemUsers.find((u) => u.id === activeUserId && u.active) || null;

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data States (con respaldo automático local + sincronización Supabase opcional)
  const [sales, setSales] = useState<Sale[]>(() => loadLocal('sales', initialSales));
  const [payments, setPayments] = useState<Payment[]>(() => loadLocal('payments', initialPayments));
  const [properties, setProperties] = useState<Property[]>(() => loadLocal('properties', initialProperties));
  const [urbanizations, setUrbanizations] = useState<Urbanization[]>(() => loadLocal('urbanizations', initialUrbanizations));
  const [lots, setLots] = useState<Lot[]>(() => loadLocal('lots', initialLots));
  const [clients, setClients] = useState<Client[]>(() => loadLocal('clients', initialClients));
  const [activities, setActivities] = useState<ActivityItem[]>(() => loadLocal('activities', initialActivities));
  const [exchangeRate, setExchangeRate] = useState<number>(() => loadLocal('exchangeRate', 6.96));

  useEffect(() => { saveLocal('sales', sales); }, [sales]);
  useEffect(() => { saveLocal('payments', payments); }, [payments]);
  useEffect(() => { saveLocal('properties', properties); }, [properties]);
  useEffect(() => { saveLocal('urbanizations', urbanizations); }, [urbanizations]);
  useEffect(() => { saveLocal('lots', lots); }, [lots]);
  useEffect(() => { saveLocal('clients', clients); }, [clients]);
  useEffect(() => { saveLocal('activities', activities); }, [activities]);
  useEffect(() => { saveLocal('exchangeRate', exchangeRate); }, [exchangeRate]);

  // Hydrate from Supabase automatically when configured (Vercel / Production)
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let isMounted = true;
    loadAllDataFromSupabase().then((data) => {
      if (!isMounted || !data) return;
      setSystemUsers(data.users);
      setUrbanizations(data.urbanizations);
      setLots(data.lots);
      setProperties(data.properties);
      setClients(data.clients);
      setSales(data.sales);
      setPayments(data.payments);
      setActivities(data.activities);
      setExchangeRate(data.exchangeRate);
    });
    return () => {
      isMounted = false;
    };
  }, []);

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
    const nextUrbs = urbanizations.map(u => {
      const uLots = updatedLots.filter(l => l.urbanizationId === u.id);
      if (uLots.length === 0) return u;
      return {
        ...u,
        totalLots: uLots.length,
        availableLots: uLots.filter(l => l.status === 'Disponible').length,
        soldLots: uLots.filter(l => l.status === 'Vendido').length,
        reservedLots: uLots.filter(l => l.status === 'Reservado').length,
      };
    });
    setUrbanizations(nextUrbs);
    void syncUrbanizations(nextUrbs);
  };

  // Handlers
  const handleSaveSale = (newSale: Sale, matchedLotId?: string) => {
    setSales(prev => [newSale, ...prev]);
    void syncSale(newSale);

    // Update ONLY the exact sold lot (matched by ID, or urbanization + block + lotNumber)
    const targetUrb = urbanizations.find(
      u => u.name.toLowerCase() === newSale.urbanization.toLowerCase()
    );
    const normalizeNum = (val: string) =>
      val.trim().toLowerCase().replace(/^lote\s+/i, '');
    const targetLotNorm = normalizeNum(newSale.lot);
    const targetBlockNorm = (newSale.block || '').trim().toLowerCase();

    let updatedOnce = false;
    let changedLot: Lot | null = null;
    const nextLots = lots.map(l => {
      if (matchedLotId) {
        if (l.id === matchedLotId) {
          changedLot = { ...l, status: 'Vendido' as const, buyerName: newSale.clientName };
          return changedLot;
        }
        return l;
      }
      if (updatedOnce) return l;
      const sameUrb =
        l.urbanizationId === targetUrb?.id ||
        (l.urbanizationName || '').toLowerCase() === newSale.urbanization.toLowerCase();
      const sameBlock = !targetBlockNorm || l.block.trim().toLowerCase() === targetBlockNorm;
      const sameNum = normalizeNum(l.lotNumber) === targetLotNorm;
      if (sameUrb && sameBlock && sameNum) {
        updatedOnce = true;
        changedLot = { ...l, status: 'Vendido' as const, buyerName: newSale.clientName };
        return changedLot;
      }
      return l;
    });
    setLots(nextLots);
    if (changedLot) void syncLot(changedLot);
    syncUrbanizationsFromLots(nextLots);

    // Auto-sync client record: create or update purchased lots & investment
    const lotEntry = `${newSale.urbanization} - ${newSale.lot}${newSale.block ? ` (${newSale.block})` : ''}`;
    const existingClient = clients.find(
      c => c.ci === newSale.clientCI || c.name.toLowerCase() === newSale.clientName.toLowerCase()
    );
    if (existingClient) {
      const currentLots = existingClient.purchasedLots || [];
      const updatedClient: Client = {
        ...existingClient,
        phone: newSale.clientPhone || existingClient.phone,
        purchasedLots: currentLots.includes(lotEntry) ? currentLots : [...currentLots, lotEntry],
        totalInvested: (existingClient.totalInvested || 0) + newSale.amount,
      };
      setClients(prev => prev.map(c => (c.id === existingClient.id ? updatedClient : c)));
      void syncClient(updatedClient);
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
      setClients(prev => [newClient, ...prev]);
      void syncClient(newClient);
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
      void syncPayment(autoPayment);
    }

    const newAct = {
      id: `act-${Date.now()}`,
      type: 'sale' as const,
      title: 'Se registró una nueva venta',
      description: `${newSale.lot} (${newSale.block}) - ${newSale.urbanization}`,
      time: 'Ahora',
      iconType: 'sale',
    };
    setActivities(prev => [newAct, ...prev]);
    void syncActivity(newAct);
  };

  const handleSavePayment = (newPayment: Payment) => {
    setPayments(prev => [newPayment, ...prev]);
    void syncPayment(newPayment);

    // Update sale remaining balances
    const matchedSale = sales.find(s => s.id === newPayment.saleId);
    if (matchedSale) {
      const newPaid = matchedSale.totalPaid + newPayment.amount;
      const newBalance = Math.max(0, matchedSale.amount - newPaid);
      const updatedSale: Sale = {
        ...matchedSale,
        totalPaid: newPaid,
        pendingBalance: newBalance,
        status: newBalance === 0 ? 'Concretada' : matchedSale.status,
      };
      setSales(prevSales => prevSales.map(s => (s.id === updatedSale.id ? updatedSale : s)));
      void syncSale(updatedSale);
    }

    const newAct = {
      id: `act-${Date.now()}`,
      type: 'payment' as const,
      title: 'Se registró un pago',
      description: `${newPayment.clientName} - ${newPayment.currency} ${newPayment.amount.toLocaleString('es-BO')}`,
      time: 'Ahora',
      iconType: 'payment',
    };
    setActivities(prev => [newAct, ...prev]);
    void syncActivity(newAct);
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
    void syncUrbanization(newUrb);
    if (generatedLots && generatedLots.length > 0) {
      setLots(prev => [...generatedLots, ...prev]);
      void syncLots(generatedLots);
    }
    const newAct = {
      id: `act-${Date.now()}`,
      type: 'reservation' as const,
      title: 'Nueva urbanización registrada',
      description: `${newUrb.name} (${generatedLots?.length || newUrb.totalLots} terrenos)`,
      time: 'Ahora',
      iconType: 'lot',
    };
    setActivities(prev => [newAct, ...prev]);
    void syncActivity(newAct);
  };

  const handleUpdateUrbanization = (updatedUrb: Urbanization) => {
    setUrbanizations(prev => prev.map(u => u.id === updatedUrb.id ? updatedUrb : u));
    void syncUrbanization(updatedUrb);
  };

  const handleAddLot = (newLot: Lot) => {
    const nextLots = [newLot, ...lots];
    setLots(nextLots);
    void syncLot(newLot);
    syncUrbanizationsFromLots(nextLots);
  };

  const handleUpdateLot = (updatedLot: Lot) => {
    const nextLots = lots.map(l => l.id === updatedLot.id ? updatedLot : l);
    setLots(nextLots);
    void syncLot(updatedLot);
    syncUrbanizationsFromLots(nextLots);
  };

  const handleSaveProperty = (newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
    void syncProperty(newProperty);

    // Automáticamente registrar a los propietarios como Clientes del sistema
    if (newProperty.ownerNames && newProperty.ownerNames.length > 0) {
      const lotEntry = `${newProperty.urbanizationName} - ${newProperty.propertyName || newProperty.title}`;
      const amountInBs = newProperty.currency === '$us.' ? Math.round(newProperty.price * exchangeRate) : newProperty.price;

      newProperty.ownerNames.forEach((ownerName, idx) => {
        const cleanName = ownerName.trim();
        if (!cleanName) return;

        const existing = clients.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
        if (existing) {
          const currentLots = existing.purchasedLots || [];
          const updatedClient: Client = {
            ...existing,
            purchasedLots: currentLots.includes(lotEntry) ? currentLots : [...currentLots, lotEntry],
            totalInvested: (existing.totalInvested || 0) + amountInBs,
          };
          setClients(prevClients => prevClients.map(c => (c.id === existing.id ? updatedClient : c)));
          void syncClient(updatedClient);
          return;
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

        setClients(prevClients => [newClient, ...prevClients]);
        void syncClient(newClient);
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
      const existing = clients.find(c => c.name.toLowerCase() === primaryOwner.toLowerCase());
      if (existing) {
        targetCI = existing.ci;
        targetPhone = existing.phone;
        const currentLots = existing.purchasedLots || [];
        const updatedClient: Client = {
          ...existing,
          purchasedLots: currentLots.includes(lotLabel) ? currentLots : [...currentLots, lotLabel],
        };
        setClients(prev => prev.map(c => (c.id === existing.id ? updatedClient : c)));
        void syncClient(updatedClient);
      } else {
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
        setClients(prev => [autoClient, ...prev]);
        void syncClient(autoClient);
      }
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
    void syncClient(updatedClient);
  };

  const handleChangeExchangeRate = (nextRate: number) => {
    setExchangeRate(nextRate);
    void syncExchangeRate(nextRate);
  };

  const handleLoginSuccess = (user: SystemUser) => {
    setActiveUserId(user.id);
    setCurrentTab('inicio');
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, user.id);
    } catch {
      // Ignore storage error
    }
  };

  const handleLogout = () => {
    setActiveUserId(null);
    setCurrentTab('inicio');
    setIsMobileMenuOpen(false);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
  };

  const handleAddUser = (newUser: SystemUser) => {
    setSystemUsers((prev) => [newUser, ...prev]);
    void syncUser(newUser);
  };

  const handleUpdateUser = (updatedUser: SystemUser) => {
    setSystemUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    void syncUser(updatedUser);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === 'USR-ADMIN' || userId === activeUserId) return;
    setSystemUsers((prev) => prev.filter((u) => u.id !== userId));
    void removeUserFromDb(userId);
  };

  const canAccessTab = (tab: TabType, user: SystemUser): boolean => {
    const p = user.permissions;
    switch (tab) {
      case 'inicio':
        return true;
      case 'terrenos':
        return p.viewTerrenos;
      case 'propiedades':
        return p.viewPropiedades;
      case 'clientes':
        return p.viewClientes;
      case 'ventas':
        return p.viewVentas;
      case 'pagos':
        return p.viewPagos;
      case 'usuarios':
        return p.manageUsers;
      default:
        return false;
    }
  };

  const handleSelectTab = (tab: TabType) => {
    if (!currentUser) return;
    if (canAccessTab(tab, currentUser)) {
      setCurrentTab(tab);
    } else {
      setCurrentTab('inicio');
    }
  };

  if (!currentUser) {
    return <LoginView users={systemUsers} onLoginSuccess={handleLoginSuccess} />;
  }

  const perms = currentUser.permissions;
  const effectiveTab: TabType = canAccessTab(currentTab, currentUser) ? currentTab : 'inicio';

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onNavigate={handleSelectTab}
        onLogout={handleLogout}
        onOpenMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={effectiveTab}
          onSelectTab={(tab) => {
            handleSelectTab(tab);
            setIsMobileMenuOpen(false);
          }}
          onLogout={handleLogout}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          permissions={perms}
          userRole={currentUser.role}
        />

        {/* View Routing Surface */}
        <main className="flex-1 overflow-y-auto min-h-[calc(100vh-68px)]">
          {effectiveTab === 'inicio' && (
            <InicioView
              onNavigate={handleSelectTab}
              properties={properties}
              activities={activities}
              clients={clients}
              sales={sales}
              payments={payments}
              lots={lots}
              urbanizations={urbanizations}
              exchangeRate={exchangeRate}
              currentUser={currentUser}
              onSelectProperty={setSelectedProperty}
              onOpenNewSale={() => {
                if (!perms.createSales) return;
                setLotDataForSale(undefined);
                setIsNewSaleModalOpen(true);
              }}
              onOpenNewPayment={() => {
                if (!perms.createPayments) return;
                setIsNewPaymentModalOpen(true);
              }}
            />
          )}

          {effectiveTab === 'ventas' && (
            <VentasView
              sales={sales}
              onOpenContract={(sale) => setContractSale(sale)}
              onOpenClientProfile={() => {
                handleSelectTab('clientes');
              }}
              onOpenNewSale={() => {
                if (!perms.createSales) return;
                setLotDataForSale(undefined);
                setIsNewSaleModalOpen(true);
              }}
              onOpenPaymentPlan={(sale) => {
                setPaymentPlanClient(null);
                setPaymentPlanSale(sale);
              }}
              canCreateSales={perms.createSales}
            />
          )}

          {effectiveTab === 'pagos' && (
            <PagosView
              payments={payments}
              sales={sales}
              lots={lots}
              urbanizations={urbanizations}
              exchangeRate={exchangeRate}
              onChangeExchangeRate={perms.manageExchangeRate ? handleChangeExchangeRate : undefined}
              onOpenNewPayment={() => {
                if (!perms.createPayments) return;
                setIsNewPaymentModalOpen(true);
              }}
              onOpenContract={(sale) => setContractSale(sale)}
              onOpenPaymentPlan={(sale) => {
                setPaymentPlanClient(null);
                setPaymentPlanSale(sale);
              }}
              canCreatePayments={perms.createPayments}
              canManageExchangeRate={perms.manageExchangeRate}
            />
          )}

          {effectiveTab === 'terrenos' && (
            <TerrenosView
              lots={lots}
              urbanizations={urbanizations}
              exchangeRate={exchangeRate}
              onSelectLotForSale={handleSelectLotForSale}
              onAddUrbanization={handleAddUrbanization}
              onUpdateUrbanization={handleUpdateUrbanization}
              onAddLot={handleAddLot}
              onUpdateLot={handleUpdateLot}
              canManageUrbanizations={perms.manageUrbanizations}
              canCreateSales={perms.createSales}
            />
          )}

          {effectiveTab === 'propiedades' && (
            <PropiedadesView
              properties={properties}
              onSelectProperty={setSelectedProperty}
              onOpenNewProperty={() => setIsNewPropertyModalOpen(true)}
              onSellProperty={handleOpenSaleForProperty}
              canManageProperties={perms.manageProperties}
              canCreateSales={perms.createSales}
            />
          )}

          {effectiveTab === 'clientes' && (
            <ClientesView
              clients={clients}
              onUpdateClient={handleUpdateClient}
              onOpenPaymentPlan={(client) => {
                setPaymentPlanSale(null);
                setPaymentPlanClient(client);
              }}
            />
          )}

          {effectiveTab === 'usuarios' && perms.manageUsers && (
            <UsuariosView
              users={systemUsers}
              currentUser={currentUser}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
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
        onOpenSaleModal={
          perms.createSales
            ? (prop) => {
                if (prop) {
                  handleOpenSaleForProperty(prop);
                } else {
                  setLotDataForSale(undefined);
                  setIsNewSaleModalOpen(true);
                }
              }
            : undefined
        }
      />
    </div>
  );
}
