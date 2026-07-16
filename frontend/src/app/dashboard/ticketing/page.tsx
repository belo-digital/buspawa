'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';

interface Trip {
  id: string;
  route: string;
  vehicleId: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string;
  baseFare: number;
  totalSeats: number;
  bookedSeats: number;
  status: string;
}

interface Seat {
  seatNumber: string;
  status: 'free' | 'held' | 'confirmed';
  heldBy?: string;
}

interface Ticket {
  id: string;
  tripId: string;
  seatNumber: string;
  passengerName: string;
  passengerPhone: string;
  paymentMethod: string;
  fare: number;
  status: string;
  createdAt: string;
  route?: string;
  travelDate?: string;
}

export default function TicketingPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [holdLoading, setHoldLoading] = useState(false);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    passengerName: '',
    passengerPhone: '',
    paymentMethod: 'Cash',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const [error, setError] = useState('');

  const fetchTrips = useCallback(async () => {
    try {
      setLoadingTrips(true);
      const data = await api.get('/fleet/trips');
      setTrips(Array.isArray(data) ? data : data.trips || []);
    } catch {
      setError('Failed to load trips');
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoadingTickets(true);
      const data = await api.get('/tickets?status=booked');
      setTickets(Array.isArray(data) ? data : data.tickets || []);
    } catch {
      // silent
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    fetchTickets();
  }, [fetchTrips, fetchTickets]);

  const openSeatMap = async (trip: Trip) => {
    setSelectedTrip(trip);
    setSelectedSeat(null);
    setShowBookingForm(false);
    setBookingSuccess(false);
    setBookingError('');
    setBookingForm({ passengerName: '', passengerPhone: '', paymentMethod: 'Cash' });
    try {
      setLoadingSeats(true);
      const data = await api.get(`/tickets/seat-map/${trip.id}`);
      setSeats(Array.isArray(data) ? data : data.seats || []);
    } catch {
      setError('Failed to load seat map');
    } finally {
      setLoadingSeats(false);
    }
  };

  const holdSeat = async (seatNumber: string) => {
    if (!selectedTrip) return;
    try {
      setHoldLoading(true);
      await api.post('/tickets/hold', { tripId: selectedTrip.id, seatNumber });
      setSeats((prev) =>
        prev.map((s) => (s.seatNumber === seatNumber ? { ...s, status: 'held' as const } : s))
      );
      setSelectedSeat(seatNumber);
      setShowBookingForm(true);
      setBookingSuccess(false);
      setBookingError('');
    } catch {
      setError('Failed to hold seat. It may already be taken.');
    } finally {
      setHoldLoading(false);
    }
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !selectedSeat) return;
    try {
      setBookingLoading(true);
      setBookingError('');
      await api.post('/tickets/book', {
        tripId: selectedTrip.id,
        seatNumber: selectedSeat,
        passengerName: bookingForm.passengerName,
        passengerPhone: bookingForm.passengerPhone,
        paymentMethod: bookingForm.paymentMethod,
        fare: selectedTrip.baseFare,
      });
      setSeats((prev) =>
        prev.map((s) => (s.seatNumber === selectedSeat ? { ...s, status: 'confirmed' as const } : s))
      );
      setBookingSuccess(true);
      setShowBookingForm(false);
      setSelectedSeat(null);
      fetchTickets();
    } catch (err: any) {
      setBookingError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const seatColor = (status: string) => {
    switch (status) {
      case 'free':
        return 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-500 cursor-pointer';
      case 'held':
        return 'border-amber-400 bg-amber-50 cursor-not-allowed';
      case 'confirmed':
        return 'border-red-400 bg-red-50 cursor-not-allowed';
      default:
        return 'border-border bg-muted';
    }
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-primary/10 text-primary',
      ongoing: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'bg-red-100 text-red-700',
      booked: 'bg-emerald-100 text-emerald-700',
      held: 'bg-amber-100 text-amber-700',
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-muted text-muted-foreground'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const formatTime = (t: string) => {
    try {
      const date = new Date(t);
      return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return t;
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(n);

  // Seat map layout: left (1,2) aisle right (3) for 2+1, or left (1,2) aisle right (3,4) for 2+2
  const buildRows = (seatList: Seat[]) => {
    const sorted = [...seatList].sort((a, b) => {
      const na = parseInt(a.seatNumber.replace(/\D/g, ''), 10);
      const nb = parseInt(b.seatNumber.replace(/\D/g, ''), 10);
      return na - nb;
    });
    const is2x1 = sorted.length <= 33;
    const colsPerSide = is2x1 ? [2, 1] : [2, 2];
    const totalCols = colsPerSide[0] + colsPerSide[1];
    const rows: (Seat | null)[][] = [];
    for (let i = 0; i < sorted.length; i += totalCols) {
      const row: (Seat | null)[] = [];
      for (let j = 0; j < totalCols; j++) {
        row.push(sorted[i + j] || null);
        if (j === colsPerSide[0] - 1) row.push(null); // aisle
      }
      rows.push(row);
    }
    return { rows, is2x1 };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Ticketing</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage trip bookings and seat reservations</p>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 ml-2">&times;</button>
        </div>
      )}

      {/* Seat Map View */}
      {selectedTrip && (
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{selectedTrip.route}</h2>
              <p className="text-xs text-muted-foreground">
                {formatDate(selectedTrip.travelDate)} &middot; {formatTime(selectedTrip.departureTime)}
              </p>
            </div>
            <button
              onClick={() => { setSelectedTrip(null); setShowBookingForm(false); setBookingSuccess(false); }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Back to trips
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6">
            {/* Seat Map */}
            <div className="flex-1">
              <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded border-2 border-emerald-400 bg-emerald-50" /> Free
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded border-2 border-amber-400 bg-amber-50" /> Held
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded border-2 border-red-400 bg-red-50" /> Booked
                </span>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="mb-3 text-center">
                  <span className="inline-block rounded-t-lg bg-primary/10 px-6 py-1 text-xs font-medium text-primary">
                    Driver
                  </span>
                </div>

                {loadingSeats ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  (() => {
                    const { rows } = buildRows(seats);
                    return (
                      <div className="space-y-2">
                        {rows.map((row, ri) => (
                          <div key={ri} className="flex items-center justify-center gap-2">
                            {row.map((seat, ci) => {
                              if (!seat) {
                                return <div key={ci} className="h-10 w-3" />;
                              }
                              const isSelected = selectedSeat === seat.seatNumber;
                              return (
                                <button
                                  key={ci}
                                  disabled={seat.status !== 'free' || holdLoading}
                                  onClick={() => holdSeat(seat.seatNumber)}
                                  className={`relative flex h-10 w-10 items-center justify-center rounded-lg border-2 text-xs font-medium transition-all ${
                                    seatColor(seat.status)
                                  } ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                                  title={`${seat.seatNumber} — ${seat.status}`}
                                >
                                  {seat.seatNumber}
                                  {holdLoading && isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70">
                                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    );
                  })()
                )}
              </div>

              <p className="mt-2 text-center text-xs text-muted-foreground">
                {selectedTrip.totalSeats - selectedTrip.bookedSeats} seats available of {selectedTrip.totalSeats}
              </p>
            </div>

            {/* Booking Form / Info */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <h3 className="font-medium text-foreground">Trip Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium text-foreground">{selectedTrip.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium text-foreground">{formatDate(selectedTrip.travelDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Departure</span>
                    <span className="font-medium text-foreground">{formatTime(selectedTrip.departureTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fare</span>
                    <span className="font-medium text-primary">{formatCurrency(selectedTrip.baseFare)}</span>
                  </div>
                </div>

                {bookingSuccess && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
                    Booking confirmed successfully!
                  </div>
                )}

                {showBookingForm && selectedSeat && (
                  <form onSubmit={submitBooking} className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Book Seat {selectedSeat}</span>
                      <span className="text-sm font-semibold text-primary">{formatCurrency(selectedTrip.baseFare)}</span>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Passenger Name</label>
                      <input
                        type="text"
                        required
                        value={bookingForm.passengerName}
                        onChange={(e) => setBookingForm((p) => ({ ...p, passengerName: e.target.value }))}
                        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="Full name"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={bookingForm.passengerPhone}
                        onChange={(e) => setBookingForm((p) => ({ ...p, passengerPhone: e.target.value }))}
                        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="0700 000 000"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Payment Method</label>
                      <select
                        value={bookingForm.paymentMethod}
                        onChange={(e) => setBookingForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                        className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Cash">Cash</option>
                        <option value="M-Pesa">M-Pesa</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>

                    {bookingError && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-700">{bookingError}</div>
                    )}

                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex h-9 w-full items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {bookingLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trip Cards Grid */}
      {!selectedTrip && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Upcoming Trips</h2>
          {loadingTrips ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : trips.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-12 text-center text-sm text-muted-foreground">
              No upcoming trips found
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => {
                const seatsLeft = trip.totalSeats - trip.bookedSeats;
                return (
                  <button
                    key={trip.id}
                    onClick={() => openSeatMap(trip)}
                    className="rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <h3 className="font-medium text-foreground leading-snug">{trip.route}</h3>
                      {statusBadge(trip.status)}
                    </div>

                    <div className="mb-3 space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <span>{formatDate(trip.travelDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatTime(trip.departureTime)} &rarr; {formatTime(trip.arrivalTime)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-sm font-semibold text-primary">{formatCurrency(trip.baseFare)}</span>
                      <span className={`text-xs font-medium ${seatsLeft <= 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {seatsLeft} seat{seatsLeft !== 1 ? 's' : ''} left
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Recent Bookings Table */}
      {!selectedTrip && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
          </div>
          {loadingTickets ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No bookings yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                    <th className="px-4 py-3">Passenger</th>
                    <th className="px-4 py-3">Seat</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Route</th>
                    <th className="px-4 py-3 hidden md:table-cell">Date</th>
                    <th className="px-4 py-3">Fare</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{ticket.passengerName}</p>
                        <p className="text-xs text-muted-foreground">{ticket.passengerPhone}</p>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{ticket.seatNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{ticket.route || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                        {ticket.travelDate ? formatDate(ticket.travelDate) : formatDate(ticket.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-medium text-primary">{formatCurrency(ticket.fare)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{ticket.paymentMethod}</td>
                      <td className="px-4 py-3">{statusBadge(ticket.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
