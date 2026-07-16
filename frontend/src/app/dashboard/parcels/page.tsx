'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

type Parcel = {
  id: string;
  trackingCode: string;
  description: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  origin: string;
  destination: string;
  actualWeight: number;
  fare: number;
  paymentMethod: string;
  serviceLevel: string;
  status: string;
  createdAt: string;
};

type ScanEvent = {
  scanType: string;
  scannedByName: string;
  location: string;
  scannedAt: string;
};

type Tab = 'book' | 'track';

const STATUS_STYLES: Record<string, string> = {
  created: 'bg-blue-100 text-blue-700',
  in_transit: 'bg-yellow-100 text-yellow-700',
  arrived: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  returned: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  created: 'Created',
  in_transit: 'In Transit',
  arrived: 'Arrived',
  delivered: 'Delivered',
  returned: 'Returned',
};

export default function ParcelsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('book');
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loadingParcels, setLoadingParcels] = useState(true);

  const [description, setDescription] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [fragile, setFragile] = useState(false);
  const [perishable, setPerishable] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [serviceLevel, setServiceLevel] = useState('standard');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedParcel, setBookedParcel] = useState<Parcel | null>(null);

  const [trackingCode, setTrackingCode] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [trackedParcel, setTrackedParcel] = useState<Parcel | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanEvent[]>([]);
  const [trackingError, setTrackingError] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);

  const fetchParcels = useCallback(async () => {
    setLoadingParcels(true);
    try {
      const data = await api.get('/parcels');
      setParcels(data);
    } catch {
    } finally {
      setLoadingParcels(false);
    }
  }, []);

  useEffect(() => {
    fetchParcels();
  }, [fetchParcels]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);
    try {
      const payload = {
        description,
        senderName,
        senderPhone,
        receiverName,
        receiverPhone,
        origin,
        destination,
        actualWeight: parseFloat(weight),
        fragile,
        perishable,
        paymentMethod,
        serviceLevel,
      };
      const result = await api.post('/parcels', payload);
      setBookedParcel(result);
      fetchParcels();
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Failed to book parcel');
    } finally {
      setBookingLoading(false);
    }
  };

  const resetBookForm = () => {
    setDescription('');
    setSenderName('');
    setSenderPhone('');
    setReceiverName('');
    setReceiverPhone('');
    setOrigin('');
    setDestination('');
    setWeight('');
    setFragile(false);
    setPerishable(false);
    setPaymentMethod('cash');
    setServiceLevel('standard');
    setBookedParcel(null);
    setBookingError('');
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setTrackingError('');
    setTrackingLoading(true);
    setTrackedParcel(null);
    setScanHistory([]);
    try {
      const parcel = await api.get(`/parcels/${trackingCode.trim()}`);
      setTrackedParcel(parcel);
      try {
        const history = await api.get(`/parcels/${trackingCode.trim()}/scan-history`);
        setScanHistory(history);
      } catch {
      }
    } catch (err: any) {
      setTrackingError(err.response?.data?.message || 'Parcel not found');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Parcels</h1>
        <p className="text-sm text-muted-foreground mt-1">Book, track, and manage parcel shipments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
        <button
          onClick={() => { setActiveTab('book'); resetBookForm(); }}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'book'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Book Parcel
        </button>
        <button
          onClick={() => setActiveTab('track')}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'track'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Track Parcel
        </button>
      </div>

      {/* Book Parcel Tab */}
      {activeTab === 'book' && (
        <div className="rounded-xl border border-border bg-card p-4 md:p-6">
          {bookedParcel ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Parcel Booked Successfully</h2>
              <p className="text-sm text-muted-foreground mb-4">Your tracking code is:</p>
              <p className="text-3xl font-bold text-primary mb-6 tracking-wider">{bookedParcel.trackingCode}</p>

              <div className="mx-auto max-w-md text-left rounded-lg border border-border bg-background p-4 mb-6 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description</span>
                  <span className="font-medium text-foreground">{bookedParcel.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-medium text-foreground">{bookedParcel.senderName} ({bookedParcel.senderPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium text-foreground">{bookedParcel.receiverName} ({bookedParcel.receiverPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="font-medium text-foreground">{bookedParcel.origin} → {bookedParcel.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium text-foreground">{bookedParcel.actualWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fare</span>
                  <span className="font-medium text-foreground">KES {bookedParcel.fare?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-foreground capitalize">{bookedParcel.serviceLevel}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Print Receipt
                </button>
                <button
                  onClick={resetBookForm}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Book Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-5">
              {bookingError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{bookingError}</div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Electronics, Documents..."
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Sender full name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Sender Phone</label>
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="0712345678"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Receiver Name</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Receiver full name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Receiver Phone</label>
                  <input
                    type="tel"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="0712345678"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Origin</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Nairobi"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Mombasa"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="cash">Cash</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Service Level</label>
                  <select
                    value={serviceLevel}
                    onChange={(e) => setServiceLevel(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fragile}
                    onChange={(e) => setFragile(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                  />
                  Fragile
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perishable}
                    onChange={(e) => setPerishable(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                  />
                  Perishable
                </label>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors sm:w-auto sm:px-8"
              >
                {bookingLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  'Book Parcel'
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Track Parcel Tab */}
      {activeTab === 'track' && (
        <div className="space-y-4">
          <form onSubmit={handleTrack} className="rounded-xl border border-border bg-card p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:flex-1"
                placeholder="Enter tracking code (e.g. TRK-001234)"
              />
              <button
                type="submit"
                disabled={trackingLoading || !trackingCode.trim()}
                className="flex h-10 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors px-6"
              >
                {trackingLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  'Track'
                )}
              </button>
            </div>
          </form>

          {trackingError && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{trackingError}</div>
            </div>
          )}

          {trackedParcel && (
            <div className="rounded-xl border border-border bg-card p-4 md:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Tracking Code</p>
                  <p className="text-lg font-bold text-primary tracking-wide">{trackedParcel.trackingCode}</p>
                </div>
                <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[trackedParcel.status] || 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABELS[trackedParcel.status] || trackedParcel.status}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Package Details</h3>
                  <div className="rounded-lg border border-border p-3 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description</span>
                      <span className="font-medium text-foreground">{trackedParcel.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight</span>
                      <span className="font-medium text-foreground">{trackedParcel.actualWeight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route</span>
                      <span className="font-medium text-foreground">{trackedParcel.origin} → {trackedParcel.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fare</span>
                      <span className="font-medium text-foreground">KES {trackedParcel.fare?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium text-foreground capitalize">{trackedParcel.serviceLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-medium text-foreground capitalize">{trackedParcel.paymentMethod?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booked</span>
                      <span className="font-medium text-foreground">{new Date(trackedParcel.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Sender & Receiver</h3>
                  <div className="rounded-lg border border-border p-3 text-sm space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Sender</p>
                      <p className="font-medium text-foreground">{trackedParcel.senderName}</p>
                      <p className="text-muted-foreground">{trackedParcel.senderPhone}</p>
                    </div>
                    <div className="border-t border-border pt-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Receiver</p>
                      <p className="font-medium text-foreground">{trackedParcel.receiverName}</p>
                      <p className="text-muted-foreground">{trackedParcel.receiverPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {scanHistory.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Scan History</h3>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Type</th>
                            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Scanned By</th>
                            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Location</th>
                            <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scanHistory.map((scan, idx) => (
                            <tr key={idx} className="border-b border-border last:border-0">
                              <td className="px-3 py-2.5 font-medium text-foreground">{scan.scanType}</td>
                              <td className="px-3 py-2.5 text-foreground">{scan.scannedByName}</td>
                              <td className="px-3 py-2.5 text-foreground">{scan.location}</td>
                              <td className="px-3 py-2.5 text-muted-foreground">{new Date(scan.scannedAt).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* All Parcels Table */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">All Parcels</h2>
        </div>
        {loadingParcels ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : parcels.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No parcels found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Tracking Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Sender</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Receiver</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Weight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Fare</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((parcel) => (
                  <tr
                    key={parcel.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveTab('track');
                      setTrackingCode(parcel.trackingCode);
                      setSearchCode(parcel.trackingCode);
                    }}
                  >
                    <td className="px-4 py-3 font-medium text-primary">{parcel.trackingCode}</td>
                    <td className="px-4 py-3 text-foreground max-w-[180px] truncate">{parcel.description}</td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">{parcel.origin} → {parcel.destination}</td>
                    <td className="px-4 py-3 text-foreground hidden md:table-cell">{parcel.senderName}</td>
                    <td className="px-4 py-3 text-foreground hidden md:table-cell">{parcel.receiverName}</td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">{parcel.actualWeight} kg</td>
                    <td className="px-4 py-3 text-foreground whitespace-nowrap hidden lg:table-cell">KES {parcel.fare?.toFixed(2)}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground capitalize">
                        {parcel.serviceLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[parcel.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[parcel.status] || parcel.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap hidden lg:table-cell">
                      {new Date(parcel.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
