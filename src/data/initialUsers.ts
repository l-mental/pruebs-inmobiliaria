import { SystemUser, UserPermissions } from '../types';

export const ADMIN_PERMISSIONS: UserPermissions = {
  viewTerrenos: true,
  manageUrbanizations: true,
  viewPropiedades: true,
  manageProperties: true,
  viewClientes: true,
  viewVentas: true,
  createSales: true,
  viewPagos: true,
  createPayments: true,
  manageExchangeRate: true,
  manageUsers: true,
};

export const LIMITED_EMPLOYEE_PERMISSIONS: UserPermissions = {
  viewTerrenos: true,
  manageUrbanizations: false,
  viewPropiedades: true,
  manageProperties: false,
  viewClientes: true,
  viewVentas: true,
  createSales: true,
  viewPagos: false,
  createPayments: false,
  manageExchangeRate: false,
  manageUsers: false,
};

export const DEFAULT_SYSTEM_USERS: SystemUser[] = [
  {
    id: 'USR-ADMIN',
    fullName: 'Administrador General',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    position: 'Gestión Central',
    active: true,
    createdAt: '2025-05-01',
    permissions: { ...ADMIN_PERMISSIONS },
  },
  {
    id: 'USR-EMP-1',
    fullName: 'Juan Pérez',
    username: 'empleado',
    password: 'empleado123',
    role: 'employee',
    position: 'Asesor Comercial (Uso Limitado)',
    active: true,
    createdAt: '2025-05-10',
    permissions: { ...LIMITED_EMPLOYEE_PERMISSIONS },
  },
];
