export type NavTab = 
  | 'inicio'
  | 'terrenos'
  | 'propiedades'
  | 'clientes'
  | 'ventas'
  | 'pagos';

export type TabType = NavTab;
export type UserRole = 'admin' | 'seller';

export type PaymentModality = 'Contado' | 'Crédito';
export type SaleStatus = 'Concretada' | 'En proceso' | 'Cancelada' | 'En moratoria';
export type PaymentStatus = 'Pagado' | 'Pendiente' | 'Atrasado';
export type PaymentMethod = 'Contado' | 'Transferencia' | 'Tarjeta' | 'Efectivo' | 'Cheque';
export type PropertyType = 'Casa' | 'Departamento' | 'Terreno' | 'Local Comercial';
export type PropertyOperation = 'Venta' | 'Alquiler' | 'Anticrético';
export type PropertyStatus = 'Disponible' | 'Reservado' | 'Vendido';
export type LotStatus = 'Disponible' | 'Reservado' | 'Vendido' | 'En Moratoria';

export interface Installment {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  status: PaymentStatus;
  paidDate?: string;
  receiptNumber?: string;
}

export interface Sale {
  id: string; // e.g. "V-001"
  date: string; // "05/05/2025"
  clientId: string;
  clientName: string;
  clientCI: string;
  clientPhone: string;
  urbanization: string; // "Villa Bonita"
  lot: string; // "Lote 12"
  block: string; // "Manzano 3"
  surface: string; // "300 m²"
  modality: PaymentModality;
  amount: number; // 45000
  currency: 'Bs.' | '$us.';
  status: SaleStatus;
  sellerId: string;
  sellerName: string;
  observations: string;
  image: string;
  totalPaid: number;
  pendingBalance: number;
  installments?: Installment[];
  latitude?: number;
  longitude?: number;
}

export interface Payment {
  id: string; // "P-001"
  date: string; // "05/05/2025"
  saleId: string;
  clientName: string;
  clientCI?: string;
  urbanization: string;
  lot: string;
  amount: number;
  currency: 'Bs.' | '$us.';
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  installmentNumber?: number;
  type: 'cliente' | 'proveedor';
  providerName?: string;
  concept?: string;
  referenceNumber?: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc';
  fileUrl: string; // base64, data URL or link
  uploadDate: string;
  size?: string;
}

export interface Client {
  id: string;
  name: string;
  ci: string;
  phone: string;
  email: string;
  address: string;
  status: 'Activo' | 'Inactivo' | 'Potencial';
  purchasedLots: string[];
  totalInvested: number;
  birthDate?: string; // Fecha de nacimiento (ej. "1988-06-15")
  occupation?: string; // Ocupación / Profesión
  civilStatus?: string; // Estado civil: Soltero(a), Casado(a), etc.
  documents?: ClientDocument[]; // Documentos adjuntos (PDF o Imagen)
  notes?: string;
}

export type LotLocationType = 
  | 'Avenida Principal' 
  | 'En Esquina' 
  | 'En Medio (Calle Interna)' 
  | 'Sin Salida a Avenida' 
  | 'Pasaje';

export interface Lot {
  id: string;
  lotNumber: string;
  block: string;
  urbanizationId: string;
  urbanizationName?: string;
  surface: number; // m²
  priceBs: number;
  priceUsd: number;
  status: LotStatus;
  buyerName?: string;
  front: number; // meters
  depth: number; // meters
  latitude?: number;
  longitude?: number;
  locationType?: LotLocationType; // 'Avenida Principal' | 'En Esquina' | 'En Medio (Calle Interna)' | 'Sin Salida a Avenida'
  streetName?: string; // Nombre de la avenida o calle frente al lote
  cornerStreets?: string; // e.g. "Av. Principal y Calle 2" para lotes en esquina
  hasAvenueAccess?: boolean; // Indica si tiene salida directa a la avenida
}

export interface Urbanization {
  id: string;
  name: string;
  location: string;
  city: string;
  totalLots: number;
  soldLots: number;
  availableLots: number;
  image: string;
  pricePerM2: number;
  amenities: string[];
  description: string;
  latitude?: number;
  longitude?: number;
  mainAvenueName?: string; // e.g. "Avenida Principal Las Palmeras (25m de ancho)"
  internalStreets?: string[]; // Vías internas y secundarias
  avenueLotsCount?: number;
  cornerLotsCount?: number;
}

export interface Property {
  id: string;
  title: string;
  propertyName?: string; // Nombre específico de la propiedad / inmueble
  ownerNames?: string[]; // Nombres de propietarios / titulares añadidos
  urbanizationName?: string; // Nombre de la urbanización asociada
  type: PropertyType;
  operation: PropertyOperation;
  location: string;
  city: string;
  area: number; // m²
  rooms?: number;
  bathrooms?: number;
  garage?: boolean;
  frontMeters?: number;
  depthMeters?: number;
  price: number;
  currency: 'Bs.' | '$us.';
  period?: string; // e.g. "/ mes"
  status: PropertyStatus;
  image: string;
  featured: boolean;
  description: string;
  features?: string[];
}

export interface Seller {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  avatar: string;
  salesCount: number;
  totalVolumeBs: number;
  assignedUrbanizations: string[];
  commissionRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'sale' | 'payment' | 'reservation' | 'client';
  title: string;
  description: string;
  time: string;
  iconType: string;
}
