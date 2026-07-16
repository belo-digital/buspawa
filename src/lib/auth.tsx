import React, { useCallback, useMemo, useState, createContext, useContext } from 'react';
import { CashDeposit, CashDepositDraft, DEPOSIT_BANK_ACCOUNT, INITIAL_CASH_DEPOSITS } from './cashDeposits';
import { vehicles } from './mockData';
import { ROLES, RoleId, Role } from './rbac';
export interface Station {
  id: string;
  name: string;
  town: string;
  code: string;
  status: 'Active' | 'Inactive';
  agents: number;
  operations: string;
}
export interface ServiceRoute {
  id: string;
  origin: string;
  destination: string;
  intermediateStops: string[];
  createdAt: string;
}
export interface FleetBus {
  id: string;
  reg: string;
  make: string;
  model: string;
  capacity: number;
  routeId: string;
  homeStation: string;
  driver: string;
  conductor: string;
  nextService: string;
  insuranceExpiry: string;
  ntsaExpiry: string;
  tlbExpiry: string;
}
const INITIAL_STATIONS: Station[] = [{
  id: 'st-nbo',
  name: 'Nairobi CBD',
  town: 'Nairobi',
  code: 'NBO-CBD',
  status: 'Active',
  agents: 6,
  operations: 'Tickets · Parcels'
}, {
  id: 'st-mba',
  name: 'Mombasa',
  town: 'Mombasa',
  code: 'MBA-CTR',
  status: 'Active',
  agents: 4,
  operations: 'Tickets · Parcels'
}, {
  id: 'st-ksm',
  name: 'Kisumu',
  town: 'Kisumu',
  code: 'KSM-CTR',
  status: 'Active',
  agents: 3,
  operations: 'Tickets · Parcels'
}, {
  id: 'st-nkr',
  name: 'Nakuru',
  town: 'Nakuru',
  code: 'NKR-CTR',
  status: 'Active',
  agents: 2,
  operations: 'Tickets · Parcels'
}, {
  id: 'st-eld',
  name: 'Eldoret',
  town: 'Eldoret',
  code: 'ELD-CTR',
  status: 'Active',
  agents: 2,
  operations: 'Tickets · Parcels'
}];
const INITIAL_ROUTES: ServiceRoute[] = [{
  id: 'rt-nbo-mba',
  origin: 'Nairobi CBD',
  destination: 'Mombasa',
  intermediateStops: ['Athi River', 'Voi', 'Mariakani'],
  createdAt: '12 Jul 2026'
}, {
  id: 'rt-nbo-ksm',
  origin: 'Nairobi CBD',
  destination: 'Kisumu',
  intermediateStops: ['Naivasha', 'Nakuru', 'Kericho'],
  createdAt: '12 Jul 2026'
}, {
  id: 'rt-nbo-eld',
  origin: 'Nairobi CBD',
  destination: 'Eldoret',
  intermediateStops: ['Naivasha', 'Nakuru'],
  createdAt: '12 Jul 2026'
}, {
  id: 'rt-nbo-nkr',
  origin: 'Nairobi CBD',
  destination: 'Nakuru',
  intermediateStops: ['Limuru', 'Naivasha'],
  createdAt: '12 Jul 2026'
}];
const INITIAL_FLEET: FleetBus[] = vehicles.map((vehicle, index) => ({
  id: vehicle.id,
  reg: vehicle.reg,
  make: ['Scania', 'Isuzu', 'Yutong', 'Higer'][index],
  model: vehicle.model,
  capacity: vehicle.capacity,
  routeId: ['rt-nbo-mba', 'rt-nbo-ksm', 'rt-nbo-eld', 'rt-nbo-nkr'][index],
  homeStation: 'Nairobi CBD',
  driver: ['John Otieno', 'David Mwangi', 'Samuel Kiptoo', 'Paul Njoroge'][index],
  conductor: ['Peter Kamau', 'Mary Achieng', 'Naomi Wafula', 'Faith Chebet'][index],
  nextService: vehicle.nextService,
  insuranceExpiry: `2026-${String(9 + index).padStart(2, '0')}-30`,
  ntsaExpiry: `2026-${String(8 + index).padStart(2, '0')}-15`,
  tlbExpiry: `2026-${String(10 + index).padStart(2, '0')}-20`
}));
interface AuthState {
  role: Role | null;
  branch: string;
  assignedStation: string | null;
  stations: Station[];
  routes: ServiceRoute[];
  fleet: FleetBus[];
  canChangeBranch: boolean;
  signIn: (roleId: RoleId) => void;
  signOut: () => void;
  setBranch: (branch: string) => void;
  switchRole: (roleId: RoleId) => void;
  addStation: (station: Omit<Station, 'id' | 'agents'>) => void;
  addRoute: (route: Omit<ServiceRoute, 'id' | 'createdAt'>) => void;
  addFleetBus: (bus: Omit<FleetBus, 'id'>) => void;
  cashDeposits: CashDeposit[];
  submitCashDeposit: (draft: CashDepositDraft) => void;
  verifyCashDeposit: (depositId: string, statementAmount: number, verifiedBy: string) => boolean;
}
const AuthContext = createContext<AuthState | null>(null);
function stationForRole(roleId: RoleId): string | null {
  return roleId === 'booking_agent' ? 'Nairobi CBD' : null;
}
export function AuthProvider({
  children


}: {children: React.ReactNode;}) {
  const [role, setRole] = useState<Role | null>(null);
  const [branch, setBranchState] = useState('Nairobi CBD');
  const [stations, setStations] = useState<Station[]>(INITIAL_STATIONS);
  const [routes, setRoutes] = useState<ServiceRoute[]>(INITIAL_ROUTES);
  const [fleet, setFleet] = useState<FleetBus[]>(INITIAL_FLEET);
  const [cashDeposits, setCashDeposits] = useState<CashDeposit[]>(INITIAL_CASH_DEPOSITS);
  const assignedStation = role ? stationForRole(role.id) : null;
  const canChangeBranch = role?.id === 'super_admin';
  const signIn = useCallback((roleId: RoleId) => {
    const lockedStation = stationForRole(roleId);
    if (lockedStation) setBranchState(lockedStation);
    setRole(ROLES[roleId]);
  }, []);
  const switchRole = useCallback((roleId: RoleId) => {
    const lockedStation = stationForRole(roleId);
    if (lockedStation) setBranchState(lockedStation);
    setRole(ROLES[roleId]);
  }, []);
  const setBranch = useCallback((nextBranch: string) => {
    if (role?.id === 'super_admin') setBranchState(nextBranch);
  }, [role]);
  const addStation = useCallback((station: Omit<Station, 'id' | 'agents'>) => {
    setStations((current) => [...current, {
      ...station,
      id: `st-${Date.now()}`,
      agents: 0
    }]);
  }, []);
  const addRoute = useCallback((route: Omit<ServiceRoute, 'id' | 'createdAt'>) => {
    setRoutes((current) => [...current, {
      ...route,
      id: `rt-${Date.now()}`,
      createdAt: '15 Jul 2026'
    }]);
  }, []);
  const addFleetBus = useCallback((bus: Omit<FleetBus, 'id'>) => {
    setFleet((current) => [...current, {
      ...bus,
      id: `bus-${Date.now()}`
    }]);
  }, []);
  const submitCashDeposit = useCallback((draft: CashDepositDraft) => {
    const record: CashDeposit = {
      id: `dep-${Date.now()}`,
      agent: 'Grace Wanjiru',
      branch: 'Nairobi CBD',
      session: '15 Jul · Morning',
      ...DEPOSIT_BANK_ACCOUNT,
      amount: draft.amount,
      depositDate: draft.depositDate,
      bankReference: draft.bankReference,
      receiptName: draft.receiptName,
      status: 'Pending verification'
    };
    setCashDeposits((current) => [record, ...current]);
  }, []);
  const verifyCashDeposit = useCallback((depositId: string, statementAmount: number, verifiedBy: string) => {
    const deposit = cashDeposits.find((record) => record.id === depositId);
    if (!deposit || deposit.status === 'Verified' || deposit.amount !== statementAmount) return false;
    setCashDeposits((current) => current.map((record) => record.id === depositId ? {
      ...record,
      status: 'Verified',
      statementAmount,
      verifiedBy,
      verifiedAt: '15 Jul 2026 · 08:24'
    } : record));
    return true;
  }, [cashDeposits]);
  const signOut = useCallback(() => setRole(null), []);
  const state = useMemo(() => ({
    role,
    branch: assignedStation ?? branch,
    assignedStation,
    stations,
    routes,
    fleet,
    canChangeBranch,
    signIn,
    signOut,
    setBranch,
    switchRole,
    addStation,
    addRoute,
    addFleetBus,
    cashDeposits,
    submitCashDeposit,
    verifyCashDeposit
  }), [role, branch, assignedStation, stations, routes, fleet, canChangeBranch, signIn, signOut, setBranch, switchRole, addStation, addRoute, addFleetBus, cashDeposits, submitCashDeposit, verifyCashDeposit]);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}