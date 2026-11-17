import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  ActivityItem,
  Client,
  Lot,
  Payment,
  Property,
  Sale,
  SystemUser,
  Urbanization,
} from '../types';
import {
  initialActivities,
  initialClients,
  initialLots,
  initialPayments,
  initialProperties,
  initialSales,
  initialUrbanizations,
} from '../data/initialData';
import { DEFAULT_SYSTEM_USERS } from '../data/initialUsers';

export interface HydratedAppData {
  users: SystemUser[];
  urbanizations: Urbanization[];
  lots: Lot[];
  properties: Property[];
  clients: Client[];
  sales: Sale[];
  payments: Payment[];
  activities: ActivityItem[];
  exchangeRate: number;
}

// ============================================================================
// Mappers (CamelCase TypeScript <-> SnakeCase PostgreSQL)
// ============================================================================

const toUserRow = (u: SystemUser) => ({
  id: u.id,
  full_name: u.fullName,
  username: u.username,
  password: u.password,
  role: u.role,
  position: u.position,
  active: u.active,
  created_at: u.createdAt,
  permissions: u.permissions,
});

const fromUserRow = (r: Record<string, unknown>): SystemUser => ({
  id: String(r.id),
  fullName: String(r.full_name || ''),
  username: String(r.username || ''),
  password: String(r.password || ''),
  role: (r.role as SystemUser['role']) || 'employee',
  position: String(r.position || 'Asesor Comercial'),
  active: Boolean(r.active ?? true),
  createdAt: String(r.created_at || '2025-05-01'),
  permissions: r.permissions as SystemUser['permissions'],
});

const toUrbRow = (u: Urbanization) => ({
  id: u.id,
  name: u.name,
  location: u.location,
  city: u.city,
  total_lots: u.totalLots,
  sold_lots: u.soldLots,
  available_lots: u.availableLots,
  reserved_lots: u.reservedLots ?? 0,
  image: u.image,
  images: u.images ?? [],
  price_per_m2: u.pricePerM2,
  base_price_per_m2: u.basePricePerM2 ?? null,
  amenities: u.amenities ?? [],
  features: u.features ?? [],
  description: u.description,
  latitude: u.latitude ?? null,
  longitude: u.longitude ?? null,
  main_avenue_name: u.mainAvenueName ?? null,
  internal_streets: u.internalStreets ?? [],
  avenue_lots_count: u.avenueLotsCount ?? null,
  corner_lots_count: u.cornerLotsCount ?? null,
  manzanos_count: u.manzanosCount ?? null,
  has_cadastral_plan: u.hasCadastralPlan ?? false,
  cadastral_plan_image: u.cadastralPlanImage ?? null,
  cadastral_plan_name: u.cadastralPlanName ?? null,
});

const fromUrbRow = (r: Record<string, unknown>): Urbanization => ({
  id: String(r.id),
  name: String(r.name || ''),
  location: String(r.location || ''),
  city: String(r.city || 'Cochabamba'),
  totalLots: Number(r.total_lots || 0),
  soldLots: Number(r.sold_lots || 0),
  availableLots: Number(r.available_lots || 0),
  reservedLots: r.reserved_lots != null ? Number(r.reserved_lots) : undefined,
  image: String(r.image || ''),
  images: Array.isArray(r.images) ? (r.images as string[]) : undefined,
  pricePerM2: Number(r.price_per_m2 || 0),
  basePricePerM2: r.base_price_per_m2 != null ? Number(r.base_price_per_m2) : undefined,
  amenities: Array.isArray(r.amenities) ? (r.amenities as string[]) : [],
  features: Array.isArray(r.features) ? (r.features as string[]) : undefined,
  description: String(r.description || ''),
  latitude: r.latitude != null ? Number(r.latitude) : undefined,
  longitude: r.longitude != null ? Number(r.longitude) : undefined,
  mainAvenueName: r.main_avenue_name ? String(r.main_avenue_name) : undefined,
  internalStreets: Array.isArray(r.internal_streets) ? (r.internal_streets as string[]) : undefined,
  avenueLotsCount: r.avenue_lots_count != null ? Number(r.avenue_lots_count) : undefined,
  cornerLotsCount: r.corner_lots_count != null ? Number(r.corner_lots_count) : undefined,
  manzanosCount: r.manzanos_count != null ? Number(r.manzanos_count) : undefined,
  hasCadastralPlan: Boolean(r.has_cadastral_plan),
  cadastralPlanImage: r.cadastral_plan_image ? String(r.cadastral_plan_image) : undefined,
  cadastralPlanName: r.cadastral_plan_name ? String(r.cadastral_plan_name) : undefined,
});

const toLotRow = (l: Lot) => ({
  id: l.id,
  lot_number: l.lotNumber,
  block: l.block,
  urbanization_id: l.urbanizationId,
  urbanization_name: l.urbanizationName ?? null,
  surface: l.surface,
  price_bs: l.priceBs,
  price_usd: l.priceUsd,
  status: l.status,
  buyer_name: l.buyerName ?? null,
  front: l.front,
  depth: l.depth,
  latitude: l.latitude ?? null,
  longitude: l.longitude ?? null,
  location_type: l.locationType ?? null,
  street_name: l.streetName ?? null,
  corner_streets: l.cornerStreets ?? null,
  has_avenue_access: l.hasAvenueAccess ?? true,
  cadastral_code: l.cadastralCode ?? null,
  observations: l.observations ?? null,
  zone: l.zone ?? null,
});

const fromLotRow = (r: Record<string, unknown>): Lot => ({
  id: String(r.id),
  lotNumber: String(r.lot_number || ''),
  block: String(r.block || ''),
  urbanizationId: String(r.urbanization_id || ''),
  urbanizationName: r.urbanization_name ? String(r.urbanization_name) : undefined,
  surface: Number(r.surface || 0),
  priceBs: Number(r.price_bs || 0),
  priceUsd: Number(r.price_usd || 0),
  status: (r.status as Lot['status']) || 'Disponible',
  buyerName: r.buyer_name ? String(r.buyer_name) : undefined,
  front: Number(r.front || 10),
  depth: Number(r.depth || 30),
  latitude: r.latitude != null ? Number(r.latitude) : undefined,
  longitude: r.longitude != null ? Number(r.longitude) : undefined,
  locationType: (r.location_type as Lot['locationType']) || undefined,
  streetName: r.street_name ? String(r.street_name) : undefined,
  cornerStreets: r.corner_streets ? String(r.corner_streets) : undefined,
  hasAvenueAccess: r.has_avenue_access != null ? Boolean(r.has_avenue_access) : undefined,
  cadastralCode: r.cadastral_code ? String(r.cadastral_code) : undefined,
  observations: r.observations ? String(r.observations) : undefined,
  zone: r.zone ? String(r.zone) : undefined,
});

const toPropertyRow = (p: Property) => ({
  id: p.id,
  title: p.title,
  property_name: p.propertyName ?? null,
  owner_names: p.ownerNames ?? [],
  owner_ci: p.ownerCI ?? null,
  owner_phone: p.ownerPhone ?? null,
  urbanization_name: p.urbanizationName ?? null,
  type: p.type,
  operation: p.operation,
  location: p.location,
  city: p.city,
  area: p.area,
  rooms: p.rooms ?? null,
  bathrooms: p.bathrooms ?? null,
  garage: p.garage ?? null,
  front_meters: p.frontMeters ?? null,
  depth_meters: p.depthMeters ?? null,
  price: p.price,
  currency: p.currency,
  period: p.period ?? null,
  status: p.status,
  image: p.image,
  images: p.images ?? [],
  featured: p.featured,
  description: p.description,
  features: p.features ?? [],
});

const fromPropertyRow = (r: Record<string, unknown>): Property => ({
  id: String(r.id),
  title: String(r.title || ''),
  propertyName: r.property_name ? String(r.property_name) : undefined,
  ownerNames: Array.isArray(r.owner_names) ? (r.owner_names as string[]) : undefined,
  ownerCI: r.owner_ci ? String(r.owner_ci) : undefined,
  ownerPhone: r.owner_phone ? String(r.owner_phone) : undefined,
  urbanizationName: r.urbanization_name ? String(r.urbanization_name) : undefined,
  type: (r.type as Property['type']) || 'Casa',
  operation: (r.operation as Property['operation']) || 'Venta',
  location: String(r.location || ''),
  city: String(r.city || 'Cochabamba'),
  area: Number(r.area || 0),
  rooms: r.rooms != null ? Number(r.rooms) : undefined,
  bathrooms: r.bathrooms != null ? Number(r.bathrooms) : undefined,
  garage: r.garage != null ? Boolean(r.garage) : undefined,
  frontMeters: r.front_meters != null ? Number(r.front_meters) : undefined,
  depthMeters: r.depth_meters != null ? Number(r.depth_meters) : undefined,
  price: Number(r.price || 0),
  currency: (r.currency as Property['currency']) || '$us.',
  period: r.period ? String(r.period) : undefined,
  status: (r.status as Property['status']) || 'Disponible',
  image: String(r.image || ''),
  images: Array.isArray(r.images) && r.images.length > 0 ? (r.images as string[]) : undefined,
  featured: Boolean(r.featured),
  description: String(r.description || ''),
  features: Array.isArray(r.features) ? (r.features as string[]) : undefined,
});

const toClientRow = (c: Client) => ({
  id: c.id,
  name: c.name,
  ci: c.ci,
  phone: c.phone,
  email: c.email,
  address: c.address,
  status: c.status,
  purchased_lots: c.purchasedLots ?? [],
  total_invested: c.totalInvested,
  birth_date: c.birthDate ?? null,
  occupation: c.occupation ?? null,
  civil_status: c.civilStatus ?? null,
  documents: c.documents ?? [],
  notes: c.notes ?? null,
});

const fromClientRow = (r: Record<string, unknown>): Client => ({
  id: String(r.id),
  name: String(r.name || ''),
  ci: String(r.ci || ''),
  phone: String(r.phone || ''),
  email: String(r.email || ''),
  address: String(r.address || ''),
  status: (r.status as Client['status']) || 'Activo',
  purchasedLots: Array.isArray(r.purchased_lots) ? (r.purchased_lots as string[]) : [],
  totalInvested: Number(r.total_invested || 0),
  birthDate: r.birth_date ? String(r.birth_date) : undefined,
  occupation: r.occupation ? String(r.occupation) : undefined,
  civilStatus: r.civil_status ? String(r.civil_status) : undefined,
  documents: Array.isArray(r.documents) ? (r.documents as Client['documents']) : undefined,
  notes: r.notes ? String(r.notes) : undefined,
});

const toSaleRow = (s: Sale) => ({
  id: s.id,
  date: s.date,
  client_id: s.clientId,
  client_name: s.clientName,
  client_ci: s.clientCI,
  client_phone: s.clientPhone,
  urbanization: s.urbanization,
  lot: s.lot,
  block: s.block,
  surface: s.surface,
  modality: s.modality,
  amount: s.amount,
  currency: s.currency,
  status: s.status,
  seller_id: s.sellerId,
  seller_name: s.sellerName,
  observations: s.observations,
  image: s.image,
  total_paid: s.totalPaid,
  pending_balance: s.pendingBalance,
  installments: s.installments ?? [],
  latitude: s.latitude ?? null,
  longitude: s.longitude ?? null,
});

const fromSaleRow = (r: Record<string, unknown>): Sale => ({
  id: String(r.id),
  date: String(r.date || ''),
  clientId: String(r.client_id || ''),
  clientName: String(r.client_name || ''),
  clientCI: String(r.client_ci || ''),
  clientPhone: String(r.client_phone || ''),
  urbanization: String(r.urbanization || ''),
  lot: String(r.lot || ''),
  block: String(r.block || ''),
  surface: String(r.surface || ''),
  modality: (r.modality as Sale['modality']) || 'Contado',
  amount: Number(r.amount || 0),
  currency: (r.currency as Sale['currency']) || 'Bs.',
  status: (r.status as Sale['status']) || 'En proceso',
  sellerId: String(r.seller_id || 'USR-ADMIN'),
  sellerName: String(r.seller_name || 'Administrador'),
  observations: String(r.observations || ''),
  image: String(r.image || ''),
  totalPaid: Number(r.total_paid || 0),
  pendingBalance: Number(r.pending_balance || 0),
  installments: Array.isArray(r.installments) ? (r.installments as Sale['installments']) : undefined,
  latitude: r.latitude != null ? Number(r.latitude) : undefined,
  longitude: r.longitude != null ? Number(r.longitude) : undefined,
});

const toPaymentRow = (p: Payment) => ({
  id: p.id,
  date: p.date,
  sale_id: p.saleId,
  client_name: p.clientName,
  client_ci: p.clientCI ?? null,
  urbanization: p.urbanization,
  lot: p.lot,
  amount: p.amount,
  currency: p.currency,
  payment_method: p.paymentMethod,
  status: p.status,
  installment_number: p.installmentNumber ?? null,
  type: p.type,
  provider_name: p.providerName ?? null,
  concept: p.concept ?? null,
  reference_number: p.referenceNumber ?? null,
});

const fromPaymentRow = (r: Record<string, unknown>): Payment => ({
  id: String(r.id),
  date: String(r.date || ''),
  saleId: String(r.sale_id || ''),
  clientName: String(r.client_name || ''),
  clientCI: r.client_ci ? String(r.client_ci) : undefined,
  urbanization: String(r.urbanization || ''),
  lot: String(r.lot || ''),
  amount: Number(r.amount || 0),
  currency: (r.currency as Payment['currency']) || 'Bs.',
  paymentMethod: (r.payment_method as Payment['paymentMethod']) || 'Transferencia',
  status: (r.status as Payment['status']) || 'Pagado',
  installmentNumber: r.installment_number != null ? Number(r.installment_number) : undefined,
  type: (r.type as Payment['type']) || 'cliente',
  providerName: r.provider_name ? String(r.provider_name) : undefined,
  concept: r.concept ? String(r.concept) : undefined,
  referenceNumber: r.reference_number ? String(r.reference_number) : undefined,
});

const toActivityRow = (a: ActivityItem) => ({
  id: a.id,
  type: a.type,
  title: a.title,
  description: a.description,
  time: a.time,
  icon_type: a.iconType,
});

const fromActivityRow = (r: Record<string, unknown>): ActivityItem => ({
  id: String(r.id),
  type: (r.type as ActivityItem['type']) || 'sale',
  title: String(r.title || ''),
  description: String(r.description || ''),
  time: String(r.time || 'Ahora'),
  iconType: String(r.icon_type || 'sale'),
});

// ============================================================================
// Initial Load & First-Run Auto-Seeding for Supabase
// ============================================================================

export async function loadAllDataFromSupabase(): Promise<HydratedAppData | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [
      usersRes,
      urbsRes,
      lotsRes,
      propsRes,
      clientsRes,
      salesRes,
      paymentsRes,
      activitiesRes,
      settingRes,
    ] = await Promise.all([
      supabase.from('system_users').select('*'),
      supabase.from('urbanizations').select('*'),
      supabase.from('lots').select('*'),
      supabase.from('properties').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('payments').select('*'),
      supabase.from('activities').select('*'),
      supabase.from('app_settings').select('*').eq('key', 'exchange_rate').maybeSingle(),
    ]);

    if (usersRes.error || urbsRes.error) {
      return null;
    }

    let users = (usersRes.data || []).map(fromUserRow);
    if (users.length === 0) {
      await supabase.from('system_users').upsert(DEFAULT_SYSTEM_USERS.map(toUserRow), { onConflict: 'id' });
      users = DEFAULT_SYSTEM_USERS;
    }

    let urbanizations = (urbsRes.data || []).map(fromUrbRow);
    let lots = (lotsRes.data || []).map(fromLotRow);
    let properties = (propsRes.data || []).map(fromPropertyRow);
    let clients = (clientsRes.data || []).map(fromClientRow);
    let sales = (salesRes.data || []).map(fromSaleRow);
    let payments = (paymentsRes.data || []).map(fromPaymentRow);
    let activities = (activitiesRes.data || []).map(fromActivityRow);

    // Seed initial real estate catalog if Supabase tables are brand new & empty
    if (urbanizations.length === 0 && lots.length === 0) {
      await Promise.all([
        supabase.from('urbanizations').upsert(initialUrbanizations.map(toUrbRow), { onConflict: 'id' }),
        supabase.from('lots').upsert(initialLots.map(toLotRow), { onConflict: 'id' }),
        supabase.from('properties').upsert(initialProperties.map(toPropertyRow), { onConflict: 'id' }),
        supabase.from('clients').upsert(initialClients.map(toClientRow), { onConflict: 'id' }),
        supabase.from('sales').upsert(initialSales.map(toSaleRow), { onConflict: 'id' }),
        supabase.from('payments').upsert(initialPayments.map(toPaymentRow), { onConflict: 'id' }),
        supabase.from('activities').upsert(initialActivities.map(toActivityRow), { onConflict: 'id' }),
      ]);
      urbanizations = initialUrbanizations;
      lots = initialLots;
      properties = initialProperties;
      clients = initialClients;
      sales = initialSales;
      payments = initialPayments;
      activities = initialActivities;
    }

    const rateVal = (settingRes.data?.value as { rate?: number } | undefined)?.rate;
    const exchangeRate = typeof rateVal === 'number' && rateVal > 0 ? rateVal : 6.96;

    return {
      users,
      urbanizations,
      lots,
      properties,
      clients,
      sales,
      payments,
      activities,
      exchangeRate,
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Sync Helpers (Fire-and-forget safe upserts so UI stays instant)
// ============================================================================

export async function syncUser(user: SystemUser) {
  if (!supabase) return;
  await supabase.from('system_users').upsert(toUserRow(user), { onConflict: 'id' });
}

export async function removeUserFromDb(userId: string) {
  if (!supabase) return;
  await supabase.from('system_users').delete().eq('id', userId);
}

export async function syncUrbanization(urb: Urbanization) {
  if (!supabase) return;
  await supabase.from('urbanizations').upsert(toUrbRow(urb), { onConflict: 'id' });
}

export async function syncUrbanizations(urbs: Urbanization[]) {
  if (!supabase || urbs.length === 0) return;
  await supabase.from('urbanizations').upsert(urbs.map(toUrbRow), { onConflict: 'id' });
}

export async function syncLot(lot: Lot) {
  if (!supabase) return;
  await supabase.from('lots').upsert(toLotRow(lot), { onConflict: 'id' });
}

export async function syncLots(lots: Lot[]) {
  if (!supabase || lots.length === 0) return;
  await supabase.from('lots').upsert(lots.map(toLotRow), { onConflict: 'id' });
}

export async function syncProperty(prop: Property) {
  if (!supabase) return;
  await supabase.from('properties').upsert(toPropertyRow(prop), { onConflict: 'id' });
}

export async function syncClient(client: Client) {
  if (!supabase) return;
  await supabase.from('clients').upsert(toClientRow(client), { onConflict: 'id' });
}

export async function syncClients(clients: Client[]) {
  if (!supabase || clients.length === 0) return;
  await supabase.from('clients').upsert(clients.map(toClientRow), { onConflict: 'id' });
}

export async function syncSale(sale: Sale) {
  if (!supabase) return;
  await supabase.from('sales').upsert(toSaleRow(sale), { onConflict: 'id' });
}

export async function syncPayment(payment: Payment) {
  if (!supabase) return;
  await supabase.from('payments').upsert(toPaymentRow(payment), { onConflict: 'id' });
}

export async function syncActivity(activity: ActivityItem) {
  if (!supabase) return;
  await supabase.from('activities').upsert(toActivityRow(activity), { onConflict: 'id' });
}

export async function syncExchangeRate(rate: number) {
  if (!supabase) return;
  await supabase
    .from('app_settings')
    .upsert({ key: 'exchange_rate', value: { rate } }, { onConflict: 'key' });
}
