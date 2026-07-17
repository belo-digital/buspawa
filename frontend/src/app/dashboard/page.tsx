'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface FleetStats {
  totalVehicles: number;
  activeVehicles: number;
  maintenanceVehicles: number;
  activeTrips: number;
  upcomingTrips: number;
}

interface TicketStats {
  totalTickets: number;
  todayTickets: number;
  totalRevenue: number;
}

interface ParcelStats {
  total: number;
  inTransit: number;
  delivered: number;
  totalRevenue: number;
}

interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
}

function formatKES(amount: number | undefined | null): string {
  if (amount == null) return 'KES 0';
  return 'KES ' + Number(amount).toLocaleString('en-KE', { maximumFractionDigits: 0 });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fleet, setFleet] = useState<FleetStats | null>(null);
  const [tickets, setTickets] = useState<TicketStats | null>(null);
  const [parcels, setParcels] = useState<ParcelStats | null>(null);
  const [employees, setEmployees] = useState<EmployeeStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        const [fleetData, ticketData, parcelData, employeeData] = await Promise.all([
          api.get('/fleet/stats'),
          api.get('/tickets/stats'),
          api.get('/parcels/stats'),
          api.get('/employees/stats'),
        ]);

        if (!cancelled) {
          setFleet(fleetData);
          setTickets(ticketData);
          setParcels(parcelData);
          setEmployees(employeeData);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const kpis = [
    {
      label: 'Total Revenue',
      value: formatKES(tickets?.totalRevenue),
      sub: formatKES(parcels?.totalRevenue) + ' from parcels',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Tickets Sold',
      value: tickets ? String(tickets.totalTickets) : '--',
      sub: tickets ? `${tickets.todayTickets} today` : '',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
        </svg>
      ),
    },
    {
      label: 'Active Trips',
      value: fleet ? String(fleet.activeTrips) : '--',
      sub: fleet ? `${fleet.upcomingTrips} upcoming` : '',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.75l1.5-6h7.5l1.5 6m-13.5 0h13.5" />
        </svg>
      ),
    },
    {
      label: 'Fleet Size',
      value: fleet ? String(fleet.totalVehicles) : '--',
      sub: fleet ? `${fleet.activeVehicles} active` : '',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H21M3.375 14.25h3.75l1.5-6h7.5l1.5 6m-13.5 0h13.5" />
        </svg>
      ),
    },
  ];

  const recentActivities = [
    { title: 'New ticket sold', description: 'Nairobi → Mombasa, KES 1,500', time: '2 min ago', color: 'bg-primary/10 text-primary' },
    { title: 'Trip completed', description: 'Bus KAV-4521 arrived at Kisumu terminal', time: '8 min ago', color: 'bg-emerald-50 text-emerald-600' },
    { title: 'Parcel delivered', description: 'PKG-8834 collected in Nakuru', time: '15 min ago', color: 'bg-amber-50 text-amber-600' },
    { title: 'Staff check-in', description: 'John Kamau clocked in at Nairobi depot', time: '22 min ago', color: 'bg-sky-50 text-sky-600' },
    { title: 'Fuel expense logged', description: 'KES 12,400 for Bus KAV-1098', time: '35 min ago', color: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {greeting()}, {user?.name?.split(' ')[0] ?? 'there'}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your fleet today.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 shrink-0 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-border bg-card p-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-7 w-28 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">{kpi.icon}</div>
                </div>
                <p className="text-2xl font-semibold tabular-nums text-foreground">{kpi.value}</p>
                {kpi.sub && <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Parcels</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">In Transit</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">{parcels?.inTransit ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Delivered</span>
                <span className="text-sm font-semibold tabular-nums text-emerald-600">{parcels?.delivered ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-sm tabular-nums text-muted-foreground">{parcels?.total ?? 0}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Staff</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Active</span>
                <span className="text-sm font-semibold tabular-nums text-emerald-600">{employees?.active ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">On Leave</span>
                <span className="text-sm font-semibold tabular-nums text-amber-600">{employees?.onLeave ?? 0}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-sm text-muted-foreground">Total Staff</span>
                <span className="text-sm tabular-nums text-muted-foreground">{employees?.total ?? 0}</span>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Fleet Utilization</h3>
          {loading ? (
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums text-foreground">
                  {fleet && fleet.totalVehicles > 0
                    ? Math.round((fleet.activeVehicles / fleet.totalVehicles) * 100)
                    : 0}%
                </span>
                <span className="text-xs text-muted-foreground">of fleet active</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: fleet && fleet.totalVehicles > 0
                      ? `${(fleet.activeVehicles / fleet.totalVehicles) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {fleet?.activeVehicles ?? 0} of {fleet?.totalVehicles ?? 0} vehicles deployed
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-foreground">Recent Activity</h2>
        <div className="space-y-2">
          {recentActivities.map((activity, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${activity.color}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
