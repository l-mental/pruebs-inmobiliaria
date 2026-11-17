import React, { useState } from 'react';
import {
  UserCog,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Search,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  Lock,
  Power,
  AlertCircle,
} from 'lucide-react';
import { SystemUser, SystemUserRole, UserPermissions } from '../../types';
import { ADMIN_PERMISSIONS, LIMITED_EMPLOYEE_PERMISSIONS } from '../../data/initialUsers';

interface UsuariosViewProps {
  users: SystemUser[];
  currentUser: SystemUser;
  onAddUser: (user: SystemUser) => void;
  onUpdateUser: (user: SystemUser) => void;
  onDeleteUser: (userId: string) => void;
}

const PERMISSION_LABELS: Array<{ key: keyof UserPermissions; label: string; desc: string }> = [
  { key: 'viewTerrenos', label: 'Ver Terrenos y Mapas', desc: 'Consultar lotes disponibles y planos' },
  { key: 'manageUrbanizations', label: 'Crear / Editar Urbanizaciones y Lotes', desc: 'Modificar precios, manzanos y planos' },
  { key: 'viewPropiedades', label: 'Ver Propiedades', desc: 'Consultar catálogo de inmuebles' },
  { key: 'manageProperties', label: 'Registrar Nuevas Propiedades', desc: 'Dar de alta propiedades nuevas' },
  { key: 'viewClientes', label: 'Ver Mis Clientes', desc: 'Consultar clientes y planes de pago' },
  { key: 'viewVentas', label: 'Ver Mis Ventas', desc: 'Consultar historial de ventas y contratos' },
  { key: 'createSales', label: 'Registrar Ventas / Reservas', desc: 'Realizar ventas o cotizaciones' },
  { key: 'viewPagos', label: 'Ver Mis Pagos', desc: 'Acceso a cobranzas y recaudación' },
  { key: 'createPayments', label: 'Registrar Pagos de Cuotas', desc: 'Cobrar cuotas de clientes' },
  { key: 'manageExchangeRate', label: 'Tipo de Cambio y Proveedores', desc: 'Modificar $us./Bs. y egresos' },
  { key: 'manageUsers', label: 'Administrar Usuarios', desc: 'Crear, editar y eliminar cuentas' },
];

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [position, setPosition] = useState('Asesor Comercial');
  const [role, setRole] = useState<SystemUserRole>('employee');
  const [active, setActive] = useState(true);
  const [permissions, setPermissions] = useState<UserPermissions>({ ...LIMITED_EMPLOYEE_PERMISSIONS });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetForm = () => {
    setEditingUserId(null);
    setFullName('');
    setUsername('');
    setPassword('');
    setPosition('Asesor Comercial');
    setRole('employee');
    setActive(true);
    setPermissions({ ...LIMITED_EMPLOYEE_PERMISSIONS });
    setErrorMsg('');
  };

  const handleSelectRole = (nextRole: SystemUserRole) => {
    setRole(nextRole);
    if (nextRole === 'admin') {
      setPermissions({ ...ADMIN_PERMISSIONS });
      if (position === 'Asesor Comercial' || position === 'Asesor Comercial (Uso Limitado)') {
        setPosition('Administrador del Sistema');
      }
    } else {
      setPermissions({ ...LIMITED_EMPLOYEE_PERMISSIONS });
      if (position === 'Administrador del Sistema') {
        setPosition('Asesor Comercial (Uso Limitado)');
      }
    }
  };

  const handleTogglePermission = (key: keyof UserPermissions) => {
    if (role === 'admin') return;
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStartEdit = (user: SystemUser) => {
    setEditingUserId(user.id);
    setFullName(user.fullName);
    setUsername(user.username);
    setPassword(user.password);
    setPosition(user.position);
    setRole(user.role);
    setActive(user.active);
    setPermissions({ ...user.permissions });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanUsername = username.trim();

    if (!cleanName || !cleanUsername || !password.trim()) {
      setErrorMsg('Completa el nombre completo, usuario y contraseña.');
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    const duplicate = users.some(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase() && u.id !== editingUserId
    );
    if (duplicate) {
      setErrorMsg(`El usuario "${cleanUsername}" ya existe. Elige otro nombre de usuario.`);
      return;
    }

    const finalPermissions = role === 'admin' ? { ...ADMIN_PERMISSIONS } : { ...permissions };

    if (editingUserId) {
      const existing = users.find((u) => u.id === editingUserId);
      if (!existing) return;
      const isPrimaryAdmin = existing.id === 'USR-ADMIN';

      onUpdateUser({
        ...existing,
        fullName: cleanName,
        username: isPrimaryAdmin ? 'admin' : cleanUsername,
        password: password.trim(),
        role: isPrimaryAdmin ? 'admin' : role,
        position: position.trim() || (role === 'admin' ? 'Administrador' : 'Empleado'),
        active: isPrimaryAdmin ? true : active,
        permissions: isPrimaryAdmin ? { ...ADMIN_PERMISSIONS } : finalPermissions,
      });
      setSuccessMsg(`Usuario "${cleanUsername}" actualizado correctamente.`);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const newUser: SystemUser = {
        id: `USR-${Date.now().toString().slice(-5)}`,
        fullName: cleanName,
        username: cleanUsername,
        password: password.trim(),
        role,
        position: position.trim() || (role === 'admin' ? 'Administrador' : 'Empleado (Uso Limitado)'),
        active,
        createdAt: today,
        permissions: finalPermissions,
      };
      onAddUser(newUser);
      setSuccessMsg(`Usuario "${cleanUsername}" creado exitosamente.`);
    }

    resetForm();
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.position.toLowerCase().includes(q)
    );
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const employeeCount = users.filter((u) => u.role === 'employee').length;
  const activeCount = users.filter((u) => u.active).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1700px] mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#072a1b] via-[#0d3f2b] to-[#155e40] text-white rounded-3xl p-6 shadow-lg border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300 flex items-center justify-center shadow-md shrink-0">
            <UserCog className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Gestión de Usuarios y Permisos
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase">
                Solo Administrador
              </span>
            </div>
            <p className="text-sm text-emerald-100/90 mt-1 font-medium">
              Crea cuentas de Administradores (acceso total) o Empleados (uso limitado por módulos y acciones).
            </p>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Total Usuarios</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{users.length}</p>
          <p className="text-xs text-emerald-700 font-semibold mt-0.5">{activeCount} cuentas activas</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Administradores</p>
          <p className="text-3xl font-black text-emerald-900 mt-1">{adminCount}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Acceso total al sistema</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase">Empleados</p>
          <p className="text-3xl font-black text-sky-700 mt-1">{employeeCount}</p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Uso limitado configurado</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 shadow-xs">
          <p className="text-xs font-bold text-emerald-800 uppercase">Sesión Actual</p>
          <p className="text-base font-black text-emerald-950 mt-1 truncate">{currentUser.fullName}</p>
          <p className="text-xs font-mono text-emerald-700 font-bold">@{currentUser.username}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Form: Crear / Editar Usuario */}
        <div className="xl:col-span-5 bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h2>
                <p className="text-xs text-slate-500">Define usuario, contraseña y nivel de acceso</p>
              </div>
            </div>
            {editingUserId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Cancelar edición</span>
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. María Elena Torrez"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Usuario de Ingreso *
                </label>
                <input
                  type="text"
                  required
                  disabled={editingUserId === 'USR-ADMIN'}
                  placeholder="Ej. maria.ventas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mín. 4 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Cargo / Puesto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Asesor Comercial"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                  Estado de la Cuenta
                </label>
                <select
                  value={active ? 'activo' : 'inactivo'}
                  disabled={editingUserId === 'USR-ADMIN'}
                  onChange={(e) => setActive(e.target.value === 'activo')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 disabled:opacity-60 cursor-pointer"
                >
                  <option value="activo">Activo (Puede ingresar)</option>
                  <option value="inactivo">Inactivo (Bloqueado)</option>
                </select>
              </div>
            </div>

            {/* Selector de Rol */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1.5">
                Tipo de Perfil / Rol *
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={editingUserId === 'USR-ADMIN'}
                  onClick={() => handleSelectRole('admin')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    role === 'admin'
                      ? 'border-emerald-700 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Administrador</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Acceso total sin restricciones</p>
                </button>

                <button
                  type="button"
                  disabled={editingUserId === 'USR-ADMIN'}
                  onClick={() => handleSelectRole('employee')}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer disabled:opacity-50 ${
                    role === 'employee'
                      ? 'border-sky-600 bg-sky-50 ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-slate-900 text-xs">
                    <UserCheck className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>Empleado</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Uso limitado por permisos</p>
                </button>
              </div>
            </div>

            {/* Panel de Permisos */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Permisos de Acceso ({role === 'admin' ? 'Totales' : 'Limitados'})</span>
                </span>
                {role === 'employee' && (
                  <button
                    type="button"
                    onClick={() => setPermissions({ ...LIMITED_EMPLOYEE_PERMISSIONS })}
                    className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
                  >
                    Restablecer estándar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto pr-1">
                {PERMISSION_LABELS.map((item) => {
                  const checked = role === 'admin' ? true : permissions[item.key];
                  return (
                    <label
                      key={item.key}
                      className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs transition-colors ${
                        role === 'admin'
                          ? 'bg-white/60 border-slate-200 opacity-80'
                          : checked
                          ? 'bg-white border-emerald-300 cursor-pointer'
                          : 'bg-slate-100/70 border-slate-200 opacity-75 cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={role === 'admin'}
                        onChange={() => handleTogglePermission(item.key)}
                        className="mt-0.5 w-4 h-4 accent-emerald-700 rounded-xs"
                      />
                      <div className="leading-tight">
                        <p className="font-extrabold text-slate-800">{item.label}</p>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#0d3f2b] hover:bg-[#072a1c] text-white font-black rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>{editingUserId ? 'Guardar Cambios del Usuario' : 'Crear Cuenta de Usuario'}</span>
            </button>
          </form>
        </div>

        {/* Lista de Usuarios */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar usuario por nombre, @usuario o cargo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>
            <span className="text-xs font-extrabold text-slate-500 px-2">
              {filteredUsers.length} de {users.length} cuentas
            </span>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const isSelf = u.id === currentUser.id;
              const isPrimaryAdmin = u.id === 'USR-ADMIN';
              const enabledPermsCount = Object.values(u.permissions).filter(Boolean).length;

              return (
                <div
                  key={u.id}
                  className={`bg-white rounded-2xl border-2 p-4 sm:p-5 shadow-xs transition-all ${
                    editingUserId === u.id
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : u.active
                      ? 'border-slate-200 hover:border-emerald-300'
                      : 'border-slate-200 bg-slate-50 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                          u.role === 'admin'
                            ? 'bg-emerald-900 text-amber-300'
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">{u.fullName}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                              u.role === 'admin'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-sky-100 text-sky-800 border border-sky-200'
                            }`}
                          >
                            {u.role === 'admin' ? 'Administrador' : 'Empleado • Uso Limitado'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              u.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {u.active ? 'Activo' : 'Inactivo'}
                          </span>
                          {isSelf && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-700 text-white">
                              Sesión Actual
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-semibold mt-0.5">
                          Usuario: <span className="font-mono font-bold text-slate-900">@{u.username}</span> &bull; Clave:{' '}
                          <span className="font-mono text-slate-700">{u.password}</span> &bull; {u.position}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(u)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      {!isPrimaryAdmin && !isSelf && (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdateUser({ ...u, active: !u.active })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                              u.active
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                            title={u.active ? 'Desactivar cuenta' : 'Activar cuenta'}
                          >
                            <Power className="w-3.5 h-3.5" />
                            <span>{u.active ? 'Bloquear' : 'Activar'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteUser(u.id)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Resumen de permisos */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">
                      Permisos ({enabledPermsCount}/{PERMISSION_LABELS.length}):
                    </span>
                    {u.role === 'admin' ? (
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-[11px] font-bold">
                        Control total de módulos, precios, pagos y usuarios
                      </span>
                    ) : (
                      PERMISSION_LABELS.filter((p) => u.permissions[p.key]).map((p) => (
                        <span
                          key={p.key}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold"
                        >
                          {p.label}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
