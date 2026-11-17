-- ============================================================================
-- INMOBILIARIA NUEVAS RAÍCES - ESQUEMA COMPLETO PARA SUPABASE (POSTGRESQL)
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase.
-- ============================================================================

-- 1. USUARIOS DEL SISTEMA (Login y Control de Acceso Admin / Empleado)
CREATE TABLE IF NOT EXISTS public.system_users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  position TEXT NOT NULL DEFAULT 'Asesor Comercial',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. URBANIZACIONES
CREATE TABLE IF NOT EXISTS public.urbanizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Cochabamba',
  total_lots INTEGER NOT NULL DEFAULT 0,
  sold_lots INTEGER NOT NULL DEFAULT 0,
  available_lots INTEGER NOT NULL DEFAULT 0,
  reserved_lots INTEGER NOT NULL DEFAULT 0,
  image TEXT NOT NULL DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  price_per_m2 NUMERIC NOT NULL DEFAULT 0,
  base_price_per_m2 NUMERIC,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  description TEXT NOT NULL DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  main_avenue_name TEXT,
  internal_streets JSONB DEFAULT '[]'::jsonb,
  avenue_lots_count INTEGER,
  corner_lots_count INTEGER,
  manzanos_count INTEGER,
  has_cadastral_plan BOOLEAN DEFAULT FALSE,
  cadastral_plan_image TEXT,
  cadastral_plan_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TERRENOS / LOTES
CREATE TABLE IF NOT EXISTS public.lots (
  id TEXT PRIMARY KEY,
  lot_number TEXT NOT NULL,
  block TEXT NOT NULL,
  urbanization_id TEXT NOT NULL,
  urbanization_name TEXT,
  surface NUMERIC NOT NULL DEFAULT 0,
  price_bs NUMERIC NOT NULL DEFAULT 0,
  price_usd NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Disponible',
  buyer_name TEXT,
  front NUMERIC NOT NULL DEFAULT 10,
  depth NUMERIC NOT NULL DEFAULT 30,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location_type TEXT,
  street_name TEXT,
  corner_streets TEXT,
  has_avenue_access BOOLEAN DEFAULT TRUE,
  cadastral_code TEXT,
  observations TEXT,
  zone TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROPIEDADES E INMUEBLES
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  property_name TEXT,
  owner_names JSONB DEFAULT '[]'::jsonb,
  owner_ci TEXT,
  owner_phone TEXT,
  urbanization_name TEXT,
  type TEXT NOT NULL,
  operation TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Cochabamba',
  area NUMERIC NOT NULL DEFAULT 0,
  rooms INTEGER,
  bathrooms INTEGER,
  garage BOOLEAN,
  front_meters NUMERIC,
  depth_meters NUMERIC,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT '$us.',
  period TEXT,
  status TEXT NOT NULL DEFAULT 'Disponible',
  image TEXT NOT NULL DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT NOT NULL DEFAULT '',
  features JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CLIENTES Y EXPEDIENTES
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ci TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Activo',
  purchased_lots JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_invested NUMERIC NOT NULL DEFAULT 0,
  birth_date TEXT,
  occupation TEXT,
  civil_status TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. VENTAS Y PLANES DE PAGO
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_ci TEXT NOT NULL DEFAULT '',
  client_phone TEXT NOT NULL DEFAULT '',
  urbanization TEXT NOT NULL,
  lot TEXT NOT NULL,
  block TEXT NOT NULL DEFAULT '',
  surface TEXT NOT NULL DEFAULT '',
  modality TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'Bs.',
  status TEXT NOT NULL DEFAULT 'En proceso',
  seller_id TEXT NOT NULL DEFAULT 'USR-ADMIN',
  seller_name TEXT NOT NULL DEFAULT 'Administrador',
  observations TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  total_paid NUMERIC NOT NULL DEFAULT 0,
  pending_balance NUMERIC NOT NULL DEFAULT 0,
  installments JSONB DEFAULT '[]'::jsonb,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. PAGOS Y RECAUDACIÓN
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  sale_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_ci TEXT,
  urbanization TEXT NOT NULL,
  lot TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'Bs.',
  payment_method TEXT NOT NULL DEFAULT 'Transferencia',
  status TEXT NOT NULL DEFAULT 'Pagado',
  installment_number INTEGER,
  type TEXT NOT NULL DEFAULT 'cliente',
  provider_name TEXT,
  concept TEXT,
  reference_number TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ACTIVIDAD RECIENTE
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  time TEXT NOT NULL,
  icon_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CONFIGURACIÓN GENERAL (Tipo de cambio, etc.)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- DATOS SEMILLA INICIALES (Usuarios por defecto y Tipo de Cambio)
-- ============================================================================
INSERT INTO public.system_users (id, full_name, username, password, role, position, active, created_at, permissions)
VALUES
  (
    'USR-ADMIN',
    'Administrador General',
    'admin',
    'admin123',
    'admin',
    'Gestión Central',
    TRUE,
    '2025-05-01',
    '{"viewTerrenos":true,"manageUrbanizations":true,"viewPropiedades":true,"manageProperties":true,"viewClientes":true,"viewVentas":true,"createSales":true,"viewPagos":true,"createPayments":true,"manageExchangeRate":true,"manageUsers":true}'::jsonb
  ),
  (
    'USR-EMP-1',
    'Juan Pérez',
    'empleado',
    'empleado123',
    'employee',
    'Asesor Comercial (Uso Limitado)',
    TRUE,
    '2025-05-10',
    '{"viewTerrenos":true,"manageUrbanizations":false,"viewPropiedades":true,"manageProperties":false,"viewClientes":true,"viewVentas":true,"createSales":true,"viewPagos":false,"createPayments":false,"manageExchangeRate":false,"manageUsers":false}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.app_settings (key, value)
VALUES ('exchange_rate', '{"rate": 6.96}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) CON POLÍTICAS DE ACCESO PARA LA APP
-- Nota: Para entornos de producción con Supabase Auth nativo, restringe estas
-- políticas a auth.uid(). Esta configuración permite operar inmediatamente
-- desde Vercel usando el sistema de login propio del aplicativo.
-- ============================================================================
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urbanizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'system_users',
    'urbanizations',
    'lots',
    'properties',
    'clients',
    'sales',
    'payments',
    'activities',
    'app_settings'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "allow_all_%s" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "allow_all_%s" ON public.%I FOR ALL USING (true) WITH CHECK (true);', t, t);
  END LOOP;
END $$;
