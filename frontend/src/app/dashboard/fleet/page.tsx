'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface Vehicle {
  id: string;
  registration: string;
  make: string;
  model: string;
  capacity: number;
  layout: string;
  homeStation: string;
  driverName: string;
  conductorName: string;
  nextServiceDate: string;
  insuranceExpiry: string;
  ntsaExpiry: string;
  tlbExpiry: string;
  status: string;
}

interface Trip {
  id: string;
  route: string;
  vehicleId: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  totalSeats: number;
  bookedSeats: number;
  status: string;
}

interface ComplianceAlert {
  vehicleId: string;
  registration: string;
  type: string;
  message: string;
  expiryDate: string;
  daysRemaining: number;
}

const VEHICLE_STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  maintenance: 'bg-amber-100 text-amber-700',
  retired: 'bg-gray-100 text-gray-600',
};

const TRIP_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  boarding: 'bg-yellow-100 text-yellow-700',
  departed: 'bg-orange-100 text-orange-700',
  in_transit: 'bg-yellow-100 text-yellow-700',
  arrived: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

function StatusBadge({ status, colorMap }: { status: string; colorMap: Record<string, string> }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <svg className="mb-3 h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'trips'>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [newVehicle, setNewVehicle] = useState({
    registration: '',
    make: '',
    model: '',
    capacity: '',
    layout: '2+2',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [vehiclesData, tripsData, complianceData] = await Promise.all([
        api.get('/fleet/vehicles'),
        api.get('/fleet/trips'),
        api.get('/fleet/compliance'),
      ]);
      setVehicles(vehiclesData);
      setTrips(tripsData);
      setComplianceAlerts(complianceData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/fleet/vehicles', {
        ...newVehicle,
        capacity: Number(newVehicle.capacity),
      });
      setShowAddModal(false);
      setNewVehicle({ registration: '', make: '', model: '', capacity: '', layout: '2+2' });
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Fleet Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage vehicles, trips, and compliance</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {complianceAlerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
            <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Compliance Alerts
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {complianceAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`rounded-lg border p-3 text-sm ${
                  alert.daysRemaining <= 30
                    ? 'border-red-200 bg-red-50'
                    : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{alert.registration}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    alert.daysRemaining <= 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {alert.daysRemaining}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 rounded-lg border border-border bg-muted p-1 w-fit">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'vehicles'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Vehicles
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'trips'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Trips
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'vehicles' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Vehicle
            </button>
          </div>

          {vehicles.length === 0 ? (
            <EmptyState message="No vehicles registered yet" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-lg font-semibold text-foreground">{vehicle.registration}</p>
                      <p className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model}</p>
                    </div>
                    <StatusBadge status={vehicle.status} colorMap={VEHICLE_STATUS_COLORS} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      <span>Driver: {vehicle.driverName || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      <span>Conductor: {vehicle.conductorName || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span>{vehicle.homeStation || '—'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                      </svg>
                      <span>{vehicle.capacity} seats · {vehicle.layout}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Service</p>
                      <p className={`text-xs font-medium ${vehicle.nextServiceDate && new Date(vehicle.nextServiceDate) < new Date(Date.now() + 30 * 86400000) ? 'text-amber-600' : 'text-foreground'}`}>
                        {vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Insurance</p>
                      <p className={`text-xs font-medium ${vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date(Date.now() + 30 * 86400000) ? 'text-amber-600' : 'text-foreground'}`}>
                        {vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">NTSA</p>
                      <p className={`text-xs font-medium ${vehicle.ntsaExpiry && new Date(vehicle.ntsaExpiry) < new Date(Date.now() + 30 * 86400000) ? 'text-amber-600' : 'text-foreground'}`}>
                        {vehicle.ntsaExpiry ? new Date(vehicle.ntsaExpiry).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {trips.length === 0 ? (
            <EmptyState message="No trips scheduled" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Route</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Departure</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Seats</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{trip.route}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(trip.travelDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{trip.departureTime}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="font-medium text-foreground">{trip.bookedSeats}</span>
                        <span className="text-muted-foreground">/{trip.totalSeats}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={trip.status} colorMap={TRIP_STATUS_COLORS} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add Vehicle</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Registration</label>
                <input
                  type="text"
                  value={newVehicle.registration}
                  onChange={(e) => setNewVehicle({ ...newVehicle, registration: e.target.value })}
                  required
                  placeholder="e.g. KBA 123X"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Make</label>
                  <input
                    type="text"
                    value={newVehicle.make}
                    onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })}
                    required
                    placeholder="e.g. Toyota"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Model</label>
                  <input
                    type="text"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    required
                    placeholder="e.g. Coaster"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Capacity</label>
                  <input
                    type="number"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({ ...newVehicle, capacity: e.target.value })}
                    required
                    min="1"
                    placeholder="e.g. 49"
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Layout</label>
                  <select
                    value={newVehicle.layout}
                    onChange={(e) => setNewVehicle({ ...newVehicle, layout: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="2+2">2+2</option>
                    <option value="2+1">2+1</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Add Vehicle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
