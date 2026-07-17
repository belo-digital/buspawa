'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

type Parcel = {
  id: string;
  trackingCode: string;
  description: string;
  actualWeight: number;
  origin: string;
  destination: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  fare: number;
  baseFare: number;
  modifierFare: number;
  serviceLevel: string;
  isFragile: boolean;
  isPerishable: boolean;
  isHighValue: boolean;
  declaredValue: number;
  insuranceRate: number;
  insuranceFee: number;
  isDocument: boolean;
  paymentMethod: string;
  status: 'created' | 'in_transit' | 'arrived' | 'delivered' | 'returned';
  createdById: string;
  qrCodeData: string;
  createdAt: string;
  updatedAt: string;
};

type ParcelScanEvent = {
  id: string;
  parcelId: string;
  scanType: 'loaded' | 'received' | 'collected';
  scannedByUserId: string;
  scannedByName: string;
  location: string;
  vehicleReg: string;
  notes: string;
  receiverSignatureUrl: string;
  scannedAt: string;
};

type ParcelStats = {
  total: number;
  inTransit: number;
  delivered: number;
  totalRevenue: number;
};

type Tab = 'book' | 'all';

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
  const [stats, setStats] = useState<ParcelStats | null>(null);
  const [loadingParcels, setLoadingParcels] = useState(true);

  const [description, setDescription] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState('');
  const [isFragile, setIsFragile] = useState(false);
  const [isPerishable, setIsPerishable] = useState(false);
  const [isHighValue, setIsHighValue] = useState(false);
  const [declaredValue, setDeclaredValue] = useState('');
  const [isDocument, setIsDocument] = useState(false);
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [serviceLevel, setServiceLevel] = useState('standard');
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookedParcel, setBookedParcel] = useState<Parcel | null>(null);

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [scanHistory, setScanHistory] = useState<ParcelScanEvent[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchParcels = useCallback(async () => {
    setLoadingParcels(true);
    try {
      const [parcelsData, statsData] = await Promise.all([
        api.get('/parcels'),
        api.get('/parcels/stats'),
      ]);
      setParcels(parcelsData);
      setStats(statsData);
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
      const payload: Record<string, unknown> = {
        description,
        senderName,
        senderPhone,
        receiverName,
        receiverPhone,
        origin,
        destination,
        actualWeight: parseFloat(weight),
        isFragile,
        isPerishable,
        isHighValue,
        isDocument,
        paymentMethod,
        serviceLevel,
      };
      if (declaredValue) payload.declaredValue = parseFloat(declaredValue);
      if (length) payload.length = parseFloat(length);
      if (width) payload.width = parseFloat(width);
      if (height) payload.height = parseFloat(height);
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
    setIsFragile(false);
    setIsPerishable(false);
    setIsHighValue(false);
    setDeclaredValue('');
    setIsDocument(false);
    setLength('');
    setWidth('');
    setHeight('');
    setPaymentMethod('cash');
    setServiceLevel('standard');
    setBookedParcel(null);
    setBookingError('');
  };

  const openParcelDetail = async (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setLoadingDetail(true);
    setScanHistory([]);
    try {
      const history = await api.get(`/parcels/${parcel.trackingCode}/scan-history`);
      setScanHistory(history);
    } catch {
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeParcelDetail = () => {
    setSelectedParcel(null);
    setScanHistory([]);
  };

  const downloadPdf = async (trackingCode: string, endpoint: string, filename: string) => {
    try {
      const token = localStorage.getItem('buspawa_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${API_URL}/parcels/${trackingCode}/${endpoint}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
    }
  };

  const inputClass =
    'flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Parcels</h1>
        <p className="text-sm text-muted-foreground mt-1">Book, track, and manage parcel shipments</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Parcels</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">In Transit</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inTransit}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-foreground mt-1">KES {stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      )}

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
          onClick={() => setActiveTab('all')}
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Parcels
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
                  <span className="font-medium text-foreground">KES {bookedParcel.fare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="font-medium text-foreground">KES {bookedParcel.baseFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modifier</span>
                  <span className="font-medium text-foreground">KES {bookedParcel.modifierFare.toFixed(2)}</span>
                </div>
                {bookedParcel.insuranceFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Insurance ({(bookedParcel.insuranceRate * 100).toFixed(1)}%)</span>
                    <span className="font-medium text-foreground">KES {bookedParcel.insuranceFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-foreground capitalize">{bookedParcel.serviceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium text-foreground capitalize">{bookedParcel.paymentMethod.replace('_', ' ')}</span>
                </div>
                {bookedParcel.isFragile && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flags</span>
                    <span className="font-medium text-foreground text-right">
                      {[
                        bookedParcel.isFragile && 'Fragile',
                        bookedParcel.isPerishable && 'Perishable',
                        bookedParcel.isHighValue && 'High Value',
                        bookedParcel.isDocument && 'Document',
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => downloadPdf(bookedParcel.trackingCode, 'receipt', `receipt-${bookedParcel.trackingCode}.pdf`)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Download Receipt
                </button>
                <button
                  onClick={() => downloadPdf(bookedParcel.trackingCode, 'sticker', `sticker-${bookedParcel.trackingCode}.pdf`)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Download Sticker
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
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={inputClass}
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
                    className={inputClass}
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                  </select>
                </div>
              </div>

              {/* Dimension fields */}
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Length (cm) <span className="text-muted-foreground font-normal">optional</span></label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className={inputClass}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Width (cm) <span className="text-muted-foreground font-normal">optional</span></label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className={inputClass}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Height (cm) <span className="text-muted-foreground font-normal">optional</span></label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className={inputClass}
                    placeholder="0.0"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFragile}
                    onChange={(e) => setIsFragile(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                  />
                  Fragile
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPerishable}
                    onChange={(e) => setIsPerishable(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                  />
                  Perishable
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHighValue}
                    onChange={(e) => setIsHighValue(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                  />
                  High Value
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDocument}
                    onChange={(e) => setIsDocument(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                  />
                  Document
                </label>
              </div>

              {/* Declared value - shown when high value is checked */}
              {isHighValue && (
                <div className="max-w-xs">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Declared Value (KES)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={declaredValue}
                    onChange={(e) => setDeclaredValue(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
              )}

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

      {/* All Parcels Tab */}
      {activeTab === 'all' && (
        <div className="rounded-xl border border-border bg-card">
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Sender</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Receiver</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Origin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Destination</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Weight</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Fare</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.map((parcel) => (
                    <tr
                      key={parcel.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => openParcelDetail(parcel)}
                    >
                      <td className="px-4 py-3 font-medium text-primary">{parcel.trackingCode}</td>
                      <td className="px-4 py-3 text-foreground hidden md:table-cell">{parcel.senderName}</td>
                      <td className="px-4 py-3 text-foreground hidden md:table-cell">{parcel.receiverName}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{parcel.origin}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{parcel.destination}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap hidden lg:table-cell">{parcel.actualWeight} kg</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap hidden lg:table-cell">KES {parcel.fare.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[parcel.status] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABELS[parcel.status] || parcel.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Parcel Detail Modal */}
      {selectedParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeParcelDetail}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-4 md:p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Tracking Code</p>
                <p className="text-lg font-bold text-primary tracking-wide">{selectedParcel.trackingCode}</p>
              </div>
              <button
                onClick={closeParcelDetail}
                className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[selectedParcel.status] || 'bg-gray-100 text-gray-700'}`}>
                {STATUS_LABELS[selectedParcel.status] || selectedParcel.status}
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground capitalize">
                {selectedParcel.serviceLevel}
              </span>
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground capitalize">
                {selectedParcel.paymentMethod.replace('_', ' ')}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Package Details</h3>
                <div className="rounded-lg border border-border p-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description</span>
                    <span className="font-medium text-foreground">{selectedParcel.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight</span>
                    <span className="font-medium text-foreground">{selectedParcel.actualWeight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium text-foreground">{selectedParcel.origin} → {selectedParcel.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Fare</span>
                    <span className="font-medium text-foreground">KES {selectedParcel.baseFare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modifier</span>
                    <span className="font-medium text-foreground">KES {selectedParcel.modifierFare.toFixed(2)}</span>
                  </div>
                  {selectedParcel.insuranceFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Insurance</span>
                      <span className="font-medium text-foreground">KES {selectedParcel.insuranceFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground font-semibold">Total Fare</span>
                    <span className="font-bold text-foreground">KES {selectedParcel.fare.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booked</span>
                    <span className="font-medium text-foreground">{new Date(selectedParcel.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Sender & Receiver</h3>
                <div className="rounded-lg border border-border p-3 text-sm space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Sender</p>
                    <p className="font-medium text-foreground">{selectedParcel.senderName}</p>
                    <p className="text-muted-foreground">{selectedParcel.senderPhone}</p>
                  </div>
                  <div className="border-t border-border pt-2">
                    <p className="text-xs text-muted-foreground mb-0.5">Receiver</p>
                    <p className="font-medium text-foreground">{selectedParcel.receiverName}</p>
                    <p className="text-muted-foreground">{selectedParcel.receiverPhone}</p>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-foreground">Flags</h3>
                <div className="rounded-lg border border-border p-3 text-sm flex flex-wrap gap-2">
                  {selectedParcel.isFragile && <span className="rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">Fragile</span>}
                  {selectedParcel.isPerishable && <span className="rounded-full bg-orange-100 text-orange-700 px-2 py-0.5 text-xs font-medium">Perishable</span>}
                  {selectedParcel.isHighValue && <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-0.5 text-xs font-medium">High Value</span>}
                  {selectedParcel.isDocument && <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium">Document</span>}
                  {!selectedParcel.isFragile && !selectedParcel.isPerishable && !selectedParcel.isHighValue && !selectedParcel.isDocument && (
                    <span className="text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Scan History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Scan History</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadPdf(selectedParcel.trackingCode, 'receipt', `receipt-${selectedParcel.trackingCode}.pdf`)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Receipt
                  </button>
                  <button
                    onClick={() => downloadPdf(selectedParcel.trackingCode, 'sticker', `sticker-${selectedParcel.trackingCode}.pdf`)}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Sticker
                  </button>
                </div>
              </div>
              {loadingDetail ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : scanHistory.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Type</th>
                          <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Scanned By</th>
                          <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Location</th>
                          <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Vehicle</th>
                          <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scanHistory.map((scan) => (
                          <tr key={scan.id} className="border-b border-border last:border-0">
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                scan.scanType === 'loaded' ? 'bg-blue-100 text-blue-700'
                                  : scan.scanType === 'received' ? 'bg-green-100 text-green-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {scan.scanType}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-foreground">{scan.scannedByName}</td>
                            <td className="px-3 py-2.5 text-foreground">{scan.location}</td>
                            <td className="px-3 py-2.5 text-foreground">{scan.vehicleReg || '—'}</td>
                            <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{new Date(scan.scannedAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">No scan history</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
