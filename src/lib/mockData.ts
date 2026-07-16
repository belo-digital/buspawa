// Mock domain data for the BusPawa prototype.

export const BRANCHES = [
'Nairobi CBD',
'Mombasa',
'Kisumu',
'Nakuru',
'Eldoret'];


export interface KPI {
  label: string;
  value: string;
  delta?: string;
  tone?: 'up' | 'down' | 'neutral';
}

export const revenueTrend = Array.from({ length: 30 }, (_, i) => {
  const base = 210000 + Math.sin(i / 3) * 40000 + i * 2200;
  const noise = (Math.sin(i * 5.3) + 1) * 18000;
  return {
    day: `Jun ${i + 1}`,
    revenue: Math.round(base + noise)
  };
});

export interface BranchPerf {
  branch: string;
  revenue: number;
  trips: number;
  compliance: 'compliant' | 'warning' | 'breach';
}

export const branchPerformance: BranchPerf[] = [
{
  branch: 'Nairobi CBD',
  revenue: 842000,
  trips: 48,
  compliance: 'compliant'
},
{ branch: 'Mombasa', revenue: 611500, trips: 33, compliance: 'compliant' },
{ branch: 'Kisumu', revenue: 398200, trips: 21, compliance: 'warning' },
{ branch: 'Nakuru', revenue: 287400, trips: 18, compliance: 'compliant' },
{ branch: 'Eldoret', revenue: 176900, trips: 12, compliance: 'breach' }];


export interface ComplianceAlert {
  id: string;
  vehicle: string;
  type: 'NTSA Inspection' | 'Insurance' | 'PSV Badge' | 'TLB License';
  detail: string;
  severity: 'warning' | 'danger';
  due: string;
}

export const complianceAlerts: ComplianceAlert[] = [
{
  id: 'c1',
  vehicle: 'KDA 221X',
  type: 'NTSA Inspection',
  detail: 'Inspection expires',
  severity: 'danger',
  due: 'Overdue 3 days'
},
{
  id: 'c2',
  vehicle: 'KCB 908M',
  type: 'Insurance',
  detail: 'Cover expiring',
  severity: 'warning',
  due: 'in 6 days'
},
{
  id: 'c3',
  vehicle: 'KDG 145Q',
  type: 'PSV Badge',
  detail: 'Driver J. Otieno badge',
  severity: 'warning',
  due: 'in 11 days'
},
{
  id: 'c4',
  vehicle: 'KBZ 774L',
  type: 'TLB License',
  detail: 'Route license',
  severity: 'danger',
  due: 'Overdue 1 day'
}];


// ---- Ticketing ----
export type TicketClass = 'Regular' | 'VIP';

export const TICKET_CLASS_DETAILS: Record<
  TicketClass,
  {multiplier: number;description: string;}> =
{
  Regular: { multiplier: 1, description: 'Standard coach seating' },
  VIP: { multiplier: 1.35, description: 'Priority VIP seating and service' }
};

export interface Trip {
  id: string;
  route: string;
  time: string;
  arrivalTime: string;
  vehicle: string;
  layout: '2+2' | '2+1';
  fare: number;
  availableSeats: number;
}
export const trips: Trip[] = [
{
  id: 't1',
  route: 'Nairobi → Mombasa',
  time: '08:00',
  arrivalTime: '15:30',
  vehicle: 'KDA 221X',
  layout: '2+2',
  fare: 1500,
  availableSeats: 24
},
{
  id: 't2',
  route: 'Nairobi → Kisumu',
  time: '09:30',
  arrivalTime: '16:45',
  vehicle: 'KCB 908M',
  layout: '2+1',
  fare: 1300,
  availableSeats: 17
},
{
  id: 't3',
  route: 'Nairobi → Eldoret',
  time: '11:00',
  arrivalTime: '17:20',
  vehicle: 'KDG 145Q',
  layout: '2+2',
  fare: 1200,
  availableSeats: 28
}];


// Seat statuses precomputed for a demo trip
export type SeatStatus = 'available' | 'booked' | 'held';
export function buildSeats(
count: number)
: {id: string;status: SeatStatus;}[] {
  const booked = new Set([2, 5, 8, 14, 19, 23, 30, 31]);
  const held = new Set([11, 12, 27]);
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    status: booked.has(i + 1) ?
    'booked' :
    held.has(i + 1) ?
    'held' :
    'available'
  }));
}

// ---- Till reconciliation ----
export interface TillSession {
  id: string;
  agent: string;
  branch: string;
  date: string;
  shift: string;
  expected: number;
  cash: number;
  mpesa: number;
}
export const tillSessions: TillSession[] = [
{
  id: 's1',
  agent: 'Grace Wanjiru',
  branch: 'Nairobi CBD',
  date: '15 Jul',
  shift: 'Morning',
  expected: 84500,
  cash: 40000,
  mpesa: 44500
},
{
  id: 's2',
  agent: 'Peter Kamau',
  branch: 'Nairobi CBD',
  date: '15 Jul',
  shift: 'Morning',
  expected: 61200,
  cash: 22000,
  mpesa: 36900
},
{
  id: 's3',
  agent: 'Aisha Noor',
  branch: 'Mombasa',
  date: '15 Jul',
  shift: 'Morning',
  expected: 52800,
  cash: 26000,
  mpesa: 26800
},
{
  id: 's4',
  agent: 'John Otieno',
  branch: 'Kisumu',
  date: '15 Jul',
  shift: 'Afternoon',
  expected: 39400,
  cash: 18000,
  mpesa: 18900
},
{
  id: 's5',
  agent: 'Mary Achieng',
  branch: 'Nakuru',
  date: '15 Jul',
  shift: 'Morning',
  expected: 28100,
  cash: 28100,
  mpesa: 0
}];


export function variance(s: TillSession) {
  return s.cash + s.mpesa - s.expected;
}

export interface TillLineItem {
  id: string;
  type: 'Ticket' | 'Parcel';
  ref: string;
  detail: string;
  method: 'Cash' | 'M-Pesa';
  amount: number;
}
export const tillLineItems: TillLineItem[] = [
{
  id: 'l1',
  type: 'Ticket',
  ref: 'TKT-40921',
  detail: 'Nairobi → Mombasa · Seat 4',
  method: 'M-Pesa',
  amount: 1500
},
{
  id: 'l2',
  type: 'Ticket',
  ref: 'TKT-40922',
  detail: 'Nairobi → Kisumu · Seat 9',
  method: 'Cash',
  amount: 1300
},
{
  id: 'l3',
  type: 'Parcel',
  ref: 'PCL-11840',
  detail: 'Documents · 2kg · Mombasa',
  method: 'M-Pesa',
  amount: 450
},
{
  id: 'l4',
  type: 'Ticket',
  ref: 'TKT-40923',
  detail: 'Nairobi → Eldoret · Seat 12',
  method: 'Cash',
  amount: 1200
},
{
  id: 'l5',
  type: 'Parcel',
  ref: 'PCL-11841',
  detail: 'Electronics · 6kg · Kisumu',
  method: 'M-Pesa',
  amount: 1100
}];


// ---- Vehicle seed data (used by Administration fleet setup) ----
export interface Vehicle {
  id: string;
  reg: string;
  model: string;
  capacity: number;
  route: string;
  ntsa: 'ok' | 'soon' | 'expired';
  insurance: 'ok' | 'soon' | 'expired';
  tlb: 'ok' | 'soon' | 'expired';
  nextService: string;
}
export const vehicles: Vehicle[] = [
{
  id: 'v1',
  reg: 'KDA 221X',
  model: 'Scania Marcopolo',
  capacity: 49,
  route: 'Nairobi → Mombasa',
  ntsa: 'expired',
  insurance: 'ok',
  tlb: 'ok',
  nextService: '22 Jul'
},
{
  id: 'v2',
  reg: 'KCB 908M',
  model: 'Isuzu FRR',
  capacity: 33,
  route: 'Nairobi → Kisumu',
  ntsa: 'ok',
  insurance: 'soon',
  tlb: 'ok',
  nextService: '01 Aug'
},
{
  id: 'v3',
  reg: 'KDG 145Q',
  model: 'Yutong ZK',
  capacity: 49,
  route: 'Nairobi → Eldoret',
  ntsa: 'ok',
  insurance: 'ok',
  tlb: 'soon',
  nextService: '18 Jul'
},
{
  id: 'v4',
  reg: 'KBZ 774L',
  model: 'Higer KLQ',
  capacity: 41,
  route: 'Nairobi → Nakuru',
  ntsa: 'ok',
  insurance: 'ok',
  tlb: 'expired',
  nextService: '29 Jul'
}];


export const maintenanceHistory = [
{
  date: '02 Jul',
  title: 'Full service — 60,000 km',
  note: 'Oil, filters, brake pads replaced'
},
{
  date: '14 Jun',
  title: 'Tyre replacement',
  note: '4 rear tyres · Michelin'
},
{
  date: '28 May',
  title: 'NTSA inspection passed',
  note: 'Certificate #NT-88421'
},
{
  date: '10 May',
  title: 'Suspension check',
  note: 'Front bushings replaced'
}];


export const fuelData = Array.from({ length: 8 }, (_, i) => ({
  week: `W${i + 1}`,
  litres: 380 + Math.round(Math.sin(i) * 40 + i * 6)
}));

// ---- Employees ----
export interface Employee {
  id: string;
  name: string;
  role: string;
  branch: string;
  docStatus: 'ok' | 'soon' | 'expired';
  docLabel: string;
  attendance: 'present' | 'leave' | 'absent';
}
export const employees: Employee[] = [
{
  id: 'e1',
  name: 'Grace Wanjiru',
  role: 'Booking Agent',
  branch: 'Nairobi CBD',
  docStatus: 'ok',
  docLabel: 'PSV badge valid',
  attendance: 'present'
},
{
  id: 'e2',
  name: 'John Otieno',
  role: 'Driver',
  branch: 'Kisumu',
  docStatus: 'soon',
  docLabel: 'License exp. 11 days',
  attendance: 'present'
},
{
  id: 'e3',
  name: 'Aisha Noor',
  role: 'Booking Agent',
  branch: 'Mombasa',
  docStatus: 'ok',
  docLabel: 'PSV badge valid',
  attendance: 'leave'
},
{
  id: 'e4',
  name: 'Peter Kamau',
  role: 'Conductor',
  branch: 'Nairobi CBD',
  docStatus: 'expired',
  docLabel: 'PSV badge expired',
  attendance: 'present'
},
{
  id: 'e5',
  name: 'Mary Achieng',
  role: 'Finance Officer',
  branch: 'Nakuru',
  docStatus: 'ok',
  docLabel: 'N/A',
  attendance: 'absent'
}];


// ---- Reports ----
export const reportByBranch = BRANCHES.map((b, i) => ({
  branch: b,
  tickets: 320000 - i * 45000,
  parcels: 120000 - i * 18000
}));

// ---- Conductor manifest ----
export interface ManifestPassenger {
  id: string;
  name: string;
  seat: string;
  boarded: boolean;
}
export const manifest: ManifestPassenger[] = [
{ id: 'p1', name: 'Daniel Mwangi', seat: '4', boarded: true },
{ id: 'p2', name: 'Faith Chebet', seat: '9', boarded: true },
{ id: 'p3', name: 'Samuel Kiptoo', seat: '12', boarded: false },
{ id: 'p4', name: 'Lucy Njeri', seat: '18', boarded: false },
{ id: 'p5', name: 'Brian Omondi', seat: '23', boarded: false },
{ id: 'p6', name: 'Naomi Wafula', seat: '31', boarded: false }];


export interface ManifestParcel {
  id: string;
  tracking: string;
  desc: string;
  receiver: string;
  handed: boolean;
}
export const manifestParcels: ManifestParcel[] = [
{
  id: 'mp1',
  tracking: 'PCL-11840',
  desc: 'Documents · 2kg',
  receiver: 'A. Hassan',
  handed: false
},
{
  id: 'mp2',
  tracking: 'PCL-11841',
  desc: 'Electronics · 6kg',
  receiver: 'R. Owino',
  handed: false
},
{
  id: 'mp3',
  tracking: 'PCL-11855',
  desc: 'Clothing · 4kg',
  receiver: 'T. Mutua',
  handed: false
}];


// ---- Access & Roles ----
export interface StaffAccess {
  id: string;
  name: string;
  role: string;
  perms: Record<string, boolean>;
}
export const MODULE_PERMS = ['Ticketing', 'Parcels', 'HR', 'Finance', 'Reports'];
export const staffAccess: StaffAccess[] = [
{
  id: 'a1',
  name: 'Grace Wanjiru',
  role: 'Booking Agent',
  perms: {
    Ticketing: true,
    Parcels: true,
    HR: false,
    Finance: false,
    Reports: false
  }
},
{
  id: 'a2',
  name: 'Mary Achieng',
  role: 'Finance Officer',
  perms: {
    Ticketing: false,
    Parcels: false,
    HR: false,
    Finance: true,
    Reports: true
  }
},
{
  id: 'a4',
  name: 'Esther Muthoni',
  role: 'HR Officer',
  perms: {
    Ticketing: false,
    Parcels: false,
    HR: true,
    Finance: false,
    Reports: false
  }
},
{
  id: 'a5',
  name: 'Admin Root',
  role: 'Super Admin',
  perms: {
    Ticketing: true,
    Parcels: true,
    HR: true,
    Finance: true,
    Reports: true
  }
}];