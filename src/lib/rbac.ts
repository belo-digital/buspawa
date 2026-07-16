// Role-based access control model — the signed-in role determines visible modules.

export type ModuleId =
'home' |
'dashboard' |
'ticketing' |
'parcels' |
'till' |
'reconciliation' |
'expenses' |
'employees' |
'reports' |
'access' |
'conductor';

export type RoleId =
'super_admin' |
'booking_agent' |
'finance_officer' |
'hr_officer' |
'conductor' |
'auditor';

export interface Role {
  id: RoleId;
  label: string;
  modules: ModuleId[];
  landing: string;
  readOnly?: boolean;
  simplified?: boolean;
}

export const ROLES: Record<RoleId, Role> = {
  super_admin: {
    id: 'super_admin',
    label: 'Super Admin',
    modules: [
    'dashboard',
    'ticketing',
    'parcels',
    'employees',
    'reconciliation',
    'expenses',
    'reports',
    'access'],

    landing: '/app/dashboard'
  },
  booking_agent: {
    id: 'booking_agent',
    label: 'Booking Agent',
    modules: ['home', 'ticketing', 'parcels', 'till'],
    landing: '/app/home'
  },
  finance_officer: {
    id: 'finance_officer',
    label: 'Finance Officer',
    modules: ['reconciliation', 'expenses', 'reports'],
    landing: '/app/finance'
  },
  hr_officer: {
    id: 'hr_officer',
    label: 'HR Officer',
    modules: ['employees'],
    landing: '/app/employees'
  },
  conductor: {
    id: 'conductor',
    label: 'Conductor',
    modules: ['conductor'],
    landing: '/app/conductor',
    simplified: true
  },
  auditor: {
    id: 'auditor',
    label: 'Auditor',
    modules: ['dashboard', 'reconciliation', 'reports', 'employees'],
    landing: '/app/dashboard',
    readOnly: true
  }
};

export interface NavItem {
  module: ModuleId;
  label: string;
  path: string;
  group: string;
}

export const NAV_CATALOGUE: NavItem[] = [
{ module: 'home', label: 'Home', path: '/app/home', group: 'Overview' },
{
  module: 'dashboard',
  label: 'Dashboard',
  path: '/app/dashboard',
  group: 'Overview'
},
{
  module: 'ticketing',
  label: 'Ticketing',
  path: '/app/ticketing',
  group: 'Operations'
},
{
  module: 'parcels',
  label: 'Parcels',
  path: '/app/parcels',
  group: 'Operations'
},
{ module: 'till', label: 'My Till', path: '/app/till', group: 'Operations' },
{
  module: 'conductor',
  label: 'Trip Manifest',
  path: '/app/conductor',
  group: 'Operations'
},
{
  module: 'employees',
  label: 'Employees',
  path: '/app/employees',
  group: 'Management'
},
{
  module: 'reconciliation',
  label: 'Till Reconciliation',
  path: '/app/finance',
  group: 'Finance'
},
{
  module: 'expenses',
  label: 'Expenses',
  path: '/app/expenses',
  group: 'Finance'
},
{
  module: 'reports',
  label: 'Reports',
  path: '/app/reports',
  group: 'Finance'
},
{
  module: 'access',
  label: 'Administration',
  path: '/app/access',
  group: 'Settings'
}];


export function navForRole(role: Role): NavItem[] {
  const modules = new Set(role.modules);
  return NAV_CATALOGUE.filter((item) => modules.has(item.module));
}