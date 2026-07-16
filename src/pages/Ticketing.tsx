import React, { useEffect, useMemo, useState, Children } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, BanknoteIcon, CheckCircle2Icon, CreditCardIcon, PrinterIcon, SmartphoneIcon, TicketIcon } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Separator } from '../components/ui/primitives';
import { BRANCHES, buildSeats, SeatStatus, TicketClass, TICKET_CLASS_DETAILS, trips } from '../lib/mockData';
import { cn, formatKES } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { Dialog } from '../components/ui/Modal';
import { ThermalTicket, ThermalTicketData } from '../components/ThermalTicket';
type BookingStep = 'details' | 'time' | 'seats' | 'traveller' | 'payment';
type PaymentMethod = 'mpesa' | 'cash' | 'card';
const STEPS: {
  id: BookingStep;
  label: string;
}[] = [{
  id: 'details',
  label: 'Journey'
}, {
  id: 'time',
  label: 'Departure'
}, {
  id: 'seats',
  label: 'Seats'
}, {
  id: 'traveller',
  label: 'Traveller'
}, {
  id: 'payment',
  label: 'Payment'
}];
const SEAT_STYLES: Record<SeatStatus | 'selected', string> = {
  available: 'border-border bg-white text-foreground/70 hover:border-primary hover:text-primary',
  booked: 'cursor-not-allowed border-border bg-muted text-muted-foreground/50',
  held: 'cursor-not-allowed border-warning/40 bg-warning/15 text-warning',
  selected: 'border-primary bg-primary text-primary-foreground'
};
export function Ticketing() {
  const {
    role,
    branch
  } = useAuth();
  const [searchParams] = useSearchParams();
  const readOnly = role?.readOnly;
  const autoStart = searchParams.get('new') === '1';
  const [flowOpen, setFlowOpen] = useState(false);
  const [step, setStep] = useState<BookingStep>('details');
  const [destination, setDestination] = useState('Mombasa');
  const [travelDate, setTravelDate] = useState('2026-07-15');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [ticketClass, setTicketClass] = useState<TicketClass>('Regular');
  const [tripId, setTripId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [traveller, setTraveller] = useState({
    name: '',
    phone: ''
  });
  const [payment, setPayment] = useState<PaymentMethod>('mpesa');
  const [paymentState, setPaymentState] = useState<'idle' | 'processing'>('idle');
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<ThermalTicketData | null>(null);
  const paidTravellers = adults + children;
  const availableTrips = useMemo(() => trips.filter((trip) => trip.route.startsWith(branch.split(' ')[0]) && trip.route.includes(destination.split(' ')[0])), [branch, destination]);
  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === tripId) ?? null, [tripId]);
  const farePerTraveller = selectedTrip ? Math.round(selectedTrip.fare * TICKET_CLASS_DETAILS[ticketClass].multiplier) : 0;
  const bookingTotal = farePerTraveller * paidTravellers;
  const seatCount = selectedTrip?.layout === '2+1' ? 33 : 40;
  const seats = useMemo(() => buildSeats(seatCount), [seatCount]);
  const beginBooking = () => {
    resetBooking();
    setFlowOpen(true);
  };
  const resetBooking = () => {
    setStep('details');
    setDestination(BRANCHES.find((item) => item !== branch) ?? 'Mombasa');
    setTravelDate('2026-07-15');
    setAdults(1);
    setChildren(0);
    setTicketClass('Regular');
    setTripId(null);
    setSelectedSeats([]);
    setTraveller({
      name: '',
      phone: ''
    });
    setPayment('mpesa');
    setPaymentState('idle');
    setError('');
  };
  useEffect(() => {
    if (!autoStart || readOnly) return;
    resetBooking();
    setFlowOpen(true);
  }, [autoStart, branch, readOnly]);
  const continueDetails = () => {
    if (destination === branch) {
      setError('Choose a destination different from the active station.');
      return;
    }
    if (paidTravellers < 1) {
      setError('Add at least one paid traveller to continue.');
      return;
    }
    if (availableTrips.length === 0) {
      setError(`No scheduled departures are available from ${branch} to ${destination} on this date.`);
      return;
    }
    if (!availableTrips.some((trip) => trip.availableSeats >= paidTravellers)) {
      setError(`No departure on this route has ${paidTravellers} seats available together.`);
      return;
    }
    setError('');
    setStep('time');
  };
  const chooseTrip = (id: string) => {
    setTripId(id);
    setSelectedSeats([]);
    setError('');
    setStep('seats');
  };
  const toggleSeat = (seatId: string, status: SeatStatus) => {
    if (status !== 'available' || readOnly) return;
    setSelectedSeats((current) => {
      if (current.includes(seatId)) return current.filter((item) => item !== seatId);
      if (current.length >= paidTravellers) return current;
      return [...current, seatId];
    });
    setError('');
  };
  const continueSeats = () => {
    if (selectedSeats.length !== paidTravellers) {
      setError(`Choose ${paidTravellers} available seat${paidTravellers === 1 ? '' : 's'} for this booking.`);
      return;
    }
    setError('');
    setStep('traveller');
  };
  const continueTraveller = () => {
    if (!traveller.name.trim() || traveller.phone.replace(/\D/g, '').length < 9) {
      setError('Enter the booking traveller’s full name and a valid phone number.');
      return;
    }
    setError('');
    setStep('payment');
  };
  const processPayment = () => {
    if (!selectedTrip) return;
    setPaymentState('processing');
    const paymentLabel = payment === 'mpesa' ? 'M-Pesa (simulated)' : payment === 'card' ? 'Card (simulated)' : 'Cash';
    window.setTimeout(() => {
      setReceipt({
        reference: `BP-${selectedTrip.id.toUpperCase()}-${selectedSeats.join('-')}-150726`,
        route: selectedTrip.route,
        departureDate: formatTicketDate(travelDate),
        departureTime: selectedTrip.time,
        seat: selectedSeats.join(', '),
        vehicle: selectedTrip.vehicle,
        passengerName: traveller.name.trim(),
        passengerPhone: traveller.phone.trim(),
        ticketClass,
        fare: bookingTotal,
        paymentMethod: paymentLabel,
        issuedAt: '15 Jul 2026 · 07:42',
        agent: role?.id === 'booking_agent' ? 'Grace Wanjiru' : 'Counter staff',
        branch
      });
      setPaymentState('idle');
      window.setTimeout(() => window.print(), 250);
    }, payment === 'cash' ? 450 : 1200);
  };
  const closeReceipt = () => {
    setReceipt(null);
    setFlowOpen(false);
    resetBooking();
  };
  return <PageContainer>
      <PageHeader title="Ticketing" subtitle={`Counter sales · ${branch}`} />

      {!flowOpen ? <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="min-h-[300px]">
            <CardContent className="flex min-h-[300px] items-center justify-center px-5">
              <Button size="lg" onClick={beginBooking} disabled={readOnly}>
                New ticket <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          <div className="lg:sticky lg:top-20 lg:self-start">
            <TillSummary />
          </div>
        </div> : <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="min-w-0">
            <BookingProgress step={step} />
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{
            opacity: 0,
            y: 8
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -6
          }} transition={{
            duration: 0.18
          }}>
                {step === 'details' && <Card>
                    <CardHeader>
                      <CardTitle>Journey details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="counter-from">From</Label>
                          <div id="counter-from" className="flex h-9 items-center rounded-md border border-primary/25 bg-primary/5 px-3 text-sm text-foreground">
                            {branch}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="counter-destination">To</Label>
                          <Select id="counter-destination" value={destination} onChange={(event) => {
                      setDestination(event.target.value);
                      setTripId(null);
                      setError('');
                    }} disabled={readOnly}>
                            {BRANCHES.filter((item) => item !== branch).map((item) => <option key={item}>{item}</option>)}
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="counter-date">Travel date</Label>
                          <Input id="counter-date" type="date" value={travelDate} min="2026-07-15" onChange={(event) => setTravelDate(event.target.value)} disabled={readOnly} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Travel class</Label>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {(Object.keys(TICKET_CLASS_DETAILS) as TicketClass[]).map((option) => <button key={option} type="button" disabled={readOnly} onClick={() => {
                      setTicketClass(option);
                      setSelectedSeats([]);
                    }} className={cn('rounded-md border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', ticketClass === option ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary')} aria-pressed={ticketClass === option}>
                              <span className="block text-sm text-foreground">
                                {option}
                              </span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {TICKET_CLASS_DETAILS[option].description} ·{' '}
                                {option === 'VIP' ? '+35%' : 'Base fare'}
                              </span>
                            </button>)}
                        </div>
                      </div>
                      <div className="divide-y divide-border rounded-lg border border-border">
                        <TravellerCounter label="Adults" detail="Age 13+ · fare and seat" value={adults} min={1} onChange={setAdults} disabled={readOnly} />
                        <TravellerCounter label="Children" detail="Age 5–12 · fare and seat" value={children} onChange={setChildren} disabled={readOnly} />
                      </div>
                      {error && <InlineError message={error} />}
                      <div className="flex justify-between border-t border-border pt-5">
                        <Button variant="outline" onClick={() => {
                    setFlowOpen(false);
                    resetBooking();
                  }}>
                          Cancel
                        </Button>
                        <Button size="lg" onClick={continueDetails} disabled={readOnly}>
                          View available times{' '}
                          <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>}

                {step === 'time' && <section className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl tracking-wide text-foreground">
                          Available departures
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {branch} to {destination} ·{' '}
                          {formatTicketDate(travelDate)} · {ticketClass}
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => setStep('details')}>
                        <ArrowLeftIcon className="h-4 w-4" /> Edit journey
                      </Button>
                    </div>
                    {availableTrips.map((trip) => <button key={trip.id} type="button" onClick={() => chooseTrip(trip.id)} disabled={readOnly || trip.availableSeats < paidTravellers} className="grid w-full grid-cols-1 gap-4 rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                        <div>
                          <p className="text-lg tracking-wide text-foreground">
                            {trip.route}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {trip.vehicle} · {trip.layout} ·{' '}
                            {trip.availableSeats} seats available
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-muted-foreground">Departs</p>
                          <p className="mt-1 text-base text-foreground">
                            {trip.time}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <span className="text-lg tabular-nums text-primary">
                            {formatKES(Math.round(trip.fare * TICKET_CLASS_DETAILS[ticketClass].multiplier))}{' '}
                            × {paidTravellers}
                          </span>
                          <ArrowRightIcon className="h-4 w-4 text-primary" />
                        </div>
                      </button>)}
                  </section>}

                {step === 'seats' && selectedTrip && <Card>
                    <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle>Select seats</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedTrip.route} · {selectedTrip.time} ·{' '}
                          {ticketClass} · choose {paidTravellers} seat
                          {paidTravellers === 1 ? '' : 's'}.
                        </p>
                      </div>
                      <Badge tone={selectedSeats.length === paidTravellers ? 'success' : 'primary'}>
                        {selectedSeats.length} / {paidTravellers} selected
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <Legend className="border-border bg-white" label="Available" />
                        <Legend className="border-primary bg-primary" label="Selected" />
                        <Legend className="border-border bg-muted" label="Unavailable" />
                      </div>
                      <SeatMap seats={seats} layout={selectedTrip.layout} selectedSeats={selectedSeats} onSelect={toggleSeat} />
                      {error && <InlineError message={error} />}
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep('time')}>
                          <ArrowLeftIcon className="h-4 w-4" /> Back
                        </Button>
                        <Button size="lg" onClick={continueSeats} disabled={readOnly}>
                          Traveller details{' '}
                          <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>}

                {step === 'traveller' && selectedTrip && <Card>
                    <CardHeader>
                      <CardTitle>Booking traveller</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
                        The ticket message will be sent to this phone number
                        after payment.
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor="traveller-name">Full name</Label>
                          <Input id="traveller-name" value={traveller.name} onChange={(event) => {
                      setTraveller({
                        ...traveller,
                        name: event.target.value
                      });
                      setError('');
                    }} placeholder="e.g. Daniel Mwangi" disabled={readOnly} />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="traveller-phone">Phone number</Label>
                          <Input id="traveller-phone" value={traveller.phone} onChange={(event) => {
                      setTraveller({
                        ...traveller,
                        phone: event.target.value
                      });
                      setError('');
                    }} placeholder="07xx xxx xxx" inputMode="tel" disabled={readOnly} />
                        </div>
                      </div>
                      <BookingSummary trip={selectedTrip} ticketClass={ticketClass} seats={selectedSeats} travellers={paidTravellers} total={bookingTotal} />
                      {error && <InlineError message={error} />}
                      <div className="flex justify-between">
                        <Button variant="outline" onClick={() => setStep('seats')}>
                          <ArrowLeftIcon className="h-4 w-4" /> Back
                        </Button>
                        <Button size="lg" onClick={continueTraveller} disabled={readOnly}>
                          Choose payment <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>}

                {step === 'payment' && selectedTrip && <Card>
                    <CardHeader>
                      <CardTitle>Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {([['cash', 'Cash', BanknoteIcon], ['mpesa', 'M-Pesa', SmartphoneIcon], ['card', 'Card', CreditCardIcon]] as const).map(([id, label, Icon]) => <button key={id} type="button" disabled={readOnly || paymentState === 'processing'} onClick={() => setPayment(id)} className={cn('flex items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', payment === id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground')}>
                            <Icon className="h-5 w-5" />
                            {label}
                          </button>)}
                      </div>
                      <div className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                        {payment === 'cash' ? 'Record the cash received at the counter before issuing the ticket.' : `${payment === 'mpesa' ? 'M-Pesa' : 'Card'} confirmation is simulated in this prototype. No real payment is collected.`}
                      </div>
                      <BookingSummary trip={selectedTrip} ticketClass={ticketClass} seats={selectedSeats} travellers={paidTravellers} total={bookingTotal} />
                      <div className="flex justify-between">
                        <Button variant="outline" disabled={paymentState === 'processing'} onClick={() => setStep('traveller')}>
                          <ArrowLeftIcon className="h-4 w-4" /> Back
                        </Button>
                        <Button size="lg" disabled={readOnly || paymentState === 'processing'} onClick={processPayment}>
                          {paymentState === 'processing' ? 'Processing payment…' : `Process ${formatKES(bookingTotal)}`}
                          {paymentState !== 'processing' && <PrinterIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>}
              </motion.div>
            </AnimatePresence>
          </section>
          <div className="lg:sticky lg:top-20 lg:self-start">
            <TillSummary />
          </div>
        </div>}

      <Dialog open={Boolean(receipt)} onClose={closeReceipt} title="Ticket issued" description="The thermal receipt was sent to print and the ticket SMS has been sent." className="max-w-xl">
        {receipt && <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-md border border-success/30 bg-success/5 px-4 py-3 text-sm text-foreground">
              <CheckCircle2Icon className="h-5 w-5 shrink-0 text-success" />
              <span>
                Receipt printed automatically · SMS sent to{' '}
                {receipt.passengerPhone}
              </span>
            </div>
            <div className="max-h-[58vh] overflow-y-auto rounded-md bg-muted/40 p-4">
              <ThermalTicket ticket={receipt} />
            </div>
            <Button variant="outline" className="w-full" onClick={closeReceipt}>
              Close & new ticket
            </Button>
          </div>}
      </Dialog>
    </PageContainer>;
}
function BookingProgress({
  step


}: {step: BookingStep;}) {
  const current = STEPS.findIndex((item) => item.id === step);
  return <ol className="mb-6 grid grid-cols-5 gap-1" aria-label="Counter ticket progress">
      {STEPS.map((item, index) => <li key={item.id}>
          <div className={cn('h-1 rounded-full', index <= current ? 'bg-primary' : 'bg-border')} />
          <span className={cn('mt-2 block truncate text-xs', index === current ? 'text-primary' : 'text-muted-foreground')}>
            {item.label}
          </span>
        </li>)}
    </ol>;
}
function TravellerCounter({
  label,
  detail,
  value,
  min = 0,
  onChange,
  disabled







}: {label: string;detail: string;value: number;min?: number;onChange: (value: number) => void;disabled?: boolean;}) {
  return <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={disabled || value <= min} className="flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-muted disabled:opacity-40" aria-label={`Reduce ${label}`}>
          −
        </button>
        <span className="w-5 text-center tabular-nums text-foreground">
          {value}
        </span>
        <button type="button" onClick={() => onChange(value + 1)} disabled={disabled} className="flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-muted disabled:opacity-40" aria-label={`Add ${label}`}>
          +
        </button>
      </div>
    </div>;
}
function SeatMap({
  seats,
  layout,
  selectedSeats,
  onSelect








}: {seats: {id: string;status: SeatStatus;}[];layout: '2+2' | '2+1';selectedSeats: string[];onSelect: (seatId: string, status: SeatStatus) => void;}) {
  const perRow = layout === '2+1' ? 3 : 4;
  const leftColumns = layout === '2+1' ? 1 : 2;
  const rows = chunkSeats(seats, perRow);
  return <div className="mx-auto max-w-sm rounded-lg border border-border bg-muted/30 p-4">
      <div className="mb-5 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Front · Driver
      </div>
      <div className="space-y-2">
        {rows.map((row, index) => <div key={index} className="flex items-center justify-center gap-2">
            <span className="w-4 text-right text-xs tabular-nums text-muted-foreground">
              {index + 1}
            </span>
            <div className="flex gap-1.5">
              {row.slice(0, leftColumns).map((seat) => <SeatButton key={seat.id} seat={seat} selected={selectedSeats.includes(seat.id)} onClick={() => onSelect(seat.id, seat.status)} />)}
            </div>
            <span className="w-5" />
            <div className="flex gap-1.5">
              {row.slice(leftColumns).map((seat) => <SeatButton key={seat.id} seat={seat} selected={selectedSeats.includes(seat.id)} onClick={() => onSelect(seat.id, seat.status)} />)}
            </div>
          </div>)}
      </div>
    </div>;
}
function SeatButton({
  seat,
  selected,
  onClick







}: {seat: {id: string;status: SeatStatus;};selected: boolean;onClick: () => void;}) {
  const unavailable = seat.status !== 'available';
  return <button type="button" onClick={onClick} disabled={unavailable} aria-label={`Seat ${seat.id}, ${selected ? 'selected' : seat.status}`} className={cn('h-9 w-9 rounded-md border text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected ? SEAT_STYLES.selected : SEAT_STYLES[seat.status])}>
      {seat.id}
    </button>;
}
function BookingSummary({
  trip,
  ticketClass,
  seats,
  travellers,
  total






}: {trip: (typeof trips)[number];ticketClass: TicketClass;seats: string[];travellers: number;total: number;}) {
  return <div className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-foreground">{trip.route}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {trip.time} · {trip.vehicle} · {travellers} traveller
            {travellers === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge tone="primary">{ticketClass}</Badge>
          <Badge tone="outline">Seats {seats.join(', ')}</Badge>
        </div>
      </div>
      <Separator className="my-3" />
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Total fare</span>
        <span className="text-lg tabular-nums text-primary">
          {formatKES(total)}
        </span>
      </div>
    </div>;
}
function Legend({
  className,
  label



}: {className: string;label: string;}) {
  return <span className="flex items-center gap-1.5">
      <span className={cn('h-3 w-3 rounded border', className)} />
      {label}
    </span>;
}
function InlineError({
  message


}: {message: string;}) {
  return <p role="alert" className="rounded-md border border-danger/25 bg-danger/5 px-3 py-2.5 text-sm text-danger">
      {message}
    </p>;
}
function chunkSeats<T>(items: T[], size: number): T[][] {
  return Array.from({
    length: Math.ceil(items.length / size)
  }, (_, index) => items.slice(index * size, index * size + size));
}
function formatTicketDate(value: string) {
  const [year, month, day] = value.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return year && month && day ? `${day} ${months[Number(month) - 1]} ${year}` : value;
}
export function TillSummary() {
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Running till</CardTitle>
        <Badge tone="primary">Session open</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Counter session · tickets & parcels
        </p>
        <Separator />
        <TillRow label="Tickets sold" value="18" />
        <TillRow label="Parcels booked" value="6" />
        <Separator />
        <TillRow label="Cash total" value={formatKES(40000)} />
        <TillRow label="M-Pesa total" value={formatKES(44500)} />
        <Separator />
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm tracking-wide text-foreground">
            Expected total
          </span>
          <span className="text-lg tabular-nums text-primary">
            {formatKES(84500)}
          </span>
        </div>
      </CardContent>
    </Card>;
}
function TillRow({
  label,
  value



}: {label: string;value: string;}) {
  return <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums text-foreground">{value}</span>
    </div>;
}