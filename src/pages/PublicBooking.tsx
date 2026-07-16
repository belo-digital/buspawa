import React, { useMemo, useState, Children } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { ArrowLeftIcon, ArrowRightIcon, BusIcon, CalendarDaysIcon, CheckCircle2Icon, ChevronRightIcon, CircleAlertIcon, Clock3Icon, CreditCardIcon, DownloadIcon, MapPinIcon, MinusIcon, PhoneIcon, PlusIcon, ShieldCheckIcon, SmartphoneIcon, TicketIcon, UsersIcon } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Separator } from '../components/ui/primitives';
import { BRANCHES, buildSeats, TicketClass, TICKET_CLASS_DETAILS, trips } from '../lib/mockData';
import { cn, formatKES } from '../lib/utils';
const PRIMARY_LOGO_URL = "/primary-logo.svg";
type BookingStep = 'search' | 'trips' | 'travellers' | 'seats' | 'review' | 'complete';
type PaymentMethod = 'mpesa' | 'card';
const STEPS: {
  id: BookingStep;
  label: string;
}[] = [{
  id: 'search',
  label: 'Search'
}, {
  id: 'trips',
  label: 'Trip'
}, {
  id: 'travellers',
  label: 'Travellers'
}, {
  id: 'seats',
  label: 'Seats'
}, {
  id: 'review',
  label: 'Pay'
}];
export function PublicBooking() {
  const [step, setStep] = useState<BookingStep>('search');
  const [origin, setOrigin] = useState('Nairobi CBD');
  const [destination, setDestination] = useState('Mombasa');
  const [date, setDate] = useState('2026-07-15');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [ticketClass, setTicketClass] = useState<TicketClass>('Regular');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [contact, setContact] = useState({
    name: '',
    phone: '2547'
  });
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'error'>('idle');
  const [error, setError] = useState('');
  const selectedTrip = useMemo(() => trips.find((trip) => trip.id === selectedTripId) ?? null, [selectedTripId]);
  const chargeableTravellers = adults + children;
  const infantPolicyError = infants > adults ? 'Each child under 5 must share an adult’s seat. Add an adult or reduce the number of children under 5.' : '';
  const farePerTraveller = selectedTrip ? Math.round(selectedTrip.fare * TICKET_CLASS_DETAILS[ticketClass].multiplier) : 0;
  const total = farePerTraveller * chargeableTravellers;
  const seatCount = selectedTrip?.layout === '2+1' ? 33 : 40;
  const seats = useMemo(() => buildSeats(seatCount), [seatCount]);
  const availableTrips = trips.filter((trip) => trip.route.startsWith(origin.split(' ')[0]) && trip.route.includes(destination.split(' ')[0]));
  const searchTrips = (event: React.FormEvent) => {
    event.preventDefault();
    if (origin === destination) {
      setError('Choose two different stations to continue.');
      return;
    }
    setError('');
    setStep('trips');
  };
  const chooseTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setSelectedSeats([]);
    setStep('travellers');
  };
  const continueTravellers = () => {
    if (infantPolicyError) {
      setError(infantPolicyError);
      return;
    }
    if (adults + children < 1) {
      setError('Add at least one fare-paying traveller.');
      return;
    }
    setError('');
    setSelectedSeats([]);
    setStep('seats');
  };
  const toggleSeat = (seatId: string, status: string) => {
    if (status !== 'available') return;
    setSelectedSeats((current) => {
      if (current.includes(seatId)) return current.filter((seat) => seat !== seatId);
      if (current.length >= chargeableTravellers) return current;
      return [...current, seatId];
    });
  };
  const continueSeats = () => {
    if (selectedSeats.length !== chargeableTravellers) {
      setError(`Choose ${chargeableTravellers} seat${chargeableTravellers === 1 ? '' : 's'} for adults and children aged 5+. `);
      return;
    }
    setError('');
    setStep('review');
  };
  const confirmPayment = () => {
    if (!contact.name.trim() || contact.phone.replace(/\D/g, '').length < 12) {
      setError('Enter the lead traveller’s name and a valid M-Pesa phone number.');
      setPaymentState('error');
      return;
    }
    setError('');
    setPaymentState('processing');
    window.setTimeout(() => {
      setPaymentState('idle');
      setStep('complete');
    }, 1400);
  };
  const startOver = () => {
    setStep('search');
    setSelectedTripId(null);
    setSelectedSeats([]);
    setAdults(1);
    setChildren(0);
    setInfants(0);
    setTicketClass('Regular');
    setContact({
      name: '',
      phone: '2547'
    });
    setPaymentState('idle');
    setError('');
  };
  const downloadReceiptPdf = () => {
    if (!selectedTrip) return;
    const receiptId = `BP-WEB-${selectedTrip.id.toUpperCase()}-150726`;
    const document = new jsPDF({
      unit: 'mm',
      format: 'a5'
    });
    document.setProperties({
      title: `BusPawa receipt ${receiptId}`,
      subject: 'Passenger booking receipt'
    });
    document.setFillColor(20, 100, 100);
    document.rect(0, 0, 148, 28, 'F');
    document.setTextColor(255, 255, 255);
    document.setFont('helvetica', 'bold');
    document.setFontSize(20);
    document.text('BusPawa', 14, 15);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.text('PASSENGER BOOKING RECEIPT', 14, 21);
    document.setTextColor(31, 41, 55);
    document.setFontSize(8);
    document.text('BOOKING REFERENCE', 14, 40);
    document.setFont('helvetica', 'bold');
    document.setFontSize(13);
    document.text(receiptId, 14, 47);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.text(`Paid via ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card'} (simulated)`, 14, 54);
    const rows = [['Passenger', contact.name], ['Phone', `+${contact.phone}`], ['Route', selectedTrip.route], ['Class', ticketClass], ['Departure', `${formatTravelDate(date)} · ${selectedTrip.time}`], ['Arrival', selectedTrip.arrivalTime ?? '—'], ['Seats', selectedSeats.join(', ')]];
    let y = 68;
    rows.forEach(([label, value]) => {
      document.setDrawColor(226, 232, 240);
      document.line(14, y - 5, 134, y - 5);
      document.setTextColor(100, 116, 139);
      document.setFontSize(8);
      document.text(label, 14, y);
      document.setTextColor(31, 41, 55);
      document.setFontSize(9);
      document.text(value, 134, y, {
        align: 'right'
      });
      y += 11;
    });
    document.setFillColor(240, 253, 250);
    document.roundedRect(14, y + 3, 120, 20, 2, 2, 'F');
    document.setTextColor(20, 100, 100);
    document.setFont('helvetica', 'normal');
    document.setFontSize(9);
    document.text('TOTAL PAID', 20, y + 12);
    document.setFont('helvetica', 'bold');
    document.setFontSize(16);
    document.text(formatKES(total), 128, y + 14, {
      align: 'right'
    });
    document.setTextColor(100, 116, 139);
    document.setFont('helvetica', 'normal');
    document.setFontSize(8);
    document.text('Keep this receipt until your journey is complete.', 14, y + 33);
    document.setFontSize(7);
    document.text('System by Belo Digitla', 74, y + 40, {
      align: 'center'
    });
    document.save(`buspawa-receipt-${receiptId}.pdf`);
  };
  return <div className="min-h-full w-full bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/book" className="flex items-center" aria-label="BusPawa passenger booking home">
            <img src={PRIMARY_LOGO_URL} alt="BusPawa" className="h-auto w-[134px]" />
          </Link>
          <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Staff sign in <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="mb-8 max-w-2xl">
          <Badge tone="primary">Passenger booking</Badge>
          <h1 className="mt-3 text-3xl tracking-wide text-foreground sm:text-4xl">
            Plan your journey with confidence.
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Find a departure, choose your seats and pay securely. Your ticket is
            sent to your phone after payment.
          </p>
        </section>

        <ProgressTracker step={step} />

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -8
        }} transition={{
          duration: 0.2
        }}>
            {step === 'search' && <Card className="mx-auto max-w-4xl">
                <CardHeader>
                  <CardTitle>Where would you like to go?</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={searchTrips} className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="origin">From</Label>
                        <Select id="origin" value={origin} onChange={(event) => setOrigin(event.target.value)}>
                          {BRANCHES.map((branch) => <option key={branch}>{branch}</option>)}
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="destination">To</Label>
                        <Select id="destination" value={destination} onChange={(event) => setDestination(event.target.value)}>
                          {BRANCHES.filter((branch) => branch !== origin).map((branch) => <option key={branch}>{branch}</option>)}
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="travel-date">Travel date</Label>
                        <Input id="travel-date" type="date" value={date} min="2026-07-15" onChange={(event) => setDate(event.target.value)} required />
                      </div>
                    </div>
                    {error && <InlineError message={error} />}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheckIcon className="h-4 w-4 text-primary" />{' '}
                        Seat availability updates before payment.
                      </p>
                      <Button type="submit" size="lg">
                        Find buses <ArrowRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>}

            {step === 'trips' && <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl tracking-wide text-foreground">
                      Available buses
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {origin} to {destination} · {formatTravelDate(date)}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setStep('search')}>
                    <ArrowLeftIcon className="h-4 w-4" /> Edit search
                  </Button>
                </div>
                {availableTrips.length > 0 ? availableTrips.map((trip) => <button key={trip.id} type="button" onClick={() => chooseTrip(trip.id)} className="group grid w-full grid-cols-1 gap-4 rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[1fr_auto_auto] sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg tracking-wide text-foreground">
                            {trip.route}
                          </span>
                          <Badge tone="success">
                            {trip.availableSeats} seats left
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {trip.vehicle} · {trip.layout} comfort seating
                        </p>
                      </div>
                      <div className="flex items-center gap-5 text-sm">
                        <div>
                          <p className="text-muted-foreground">Departs</p>
                          <p className="text-base text-foreground">
                            {trip.time}
                          </p>
                        </div>
                        <div className="border-l border-border pl-5">
                          <p className="text-muted-foreground">Arrives</p>
                          <p className="text-base text-foreground">
                            {trip.arrivalTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <span className="text-lg tabular-nums text-primary">
                          {formatKES(trip.fare)}
                        </span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowRightIcon className="h-4 w-4" />
                        </span>
                      </div>
                    </button>) : <Card>
                    <CardContent className="py-8 text-center">
                      <BusIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                      <h3 className="mt-3 text-base text-foreground">
                        No scheduled buses found
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Try a different date or route, or check again later.
                      </p>
                    </CardContent>
                  </Card>}
              </section>}

            {step === 'travellers' && selectedTrip && <Card className="mx-auto max-w-3xl">
                <CardHeader>
                  <CardTitle>Who is travelling?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label>Travel class</Label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {(Object.keys(TICKET_CLASS_DETAILS) as TicketClass[]).map((option) => <button key={option} type="button" onClick={() => {
                    setTicketClass(option);
                    setSelectedSeats([]);
                    setError('');
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
                  <div className="rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    <strong>Fare policy:</strong> children under 5 travel free
                    on an adult’s lap. Children aged 5 and above require their
                    own seat and fare.
                  </div>
                  <div className="divide-y divide-border rounded-lg border border-border">
                    <TravellerCounter label="Adults" detail="Age 13+ · seat and fare" value={adults} onChange={setAdults} min={1} />
                    <TravellerCounter label="Children" detail="Age 5–12 · seat and fare" value={children} onChange={setChildren} />
                    <TravellerCounter label="Children under 5" detail="Free · shares an adult’s seat" value={infants} onChange={setInfants} />
                  </div>
                  {(infantPolicyError || error) && <InlineError message={infantPolicyError || error} />}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button variant="outline" onClick={() => setStep('trips')}>
                      <ArrowLeftIcon className="h-4 w-4" /> Back
                    </Button>
                    <Button size="lg" onClick={continueTravellers} disabled={Boolean(infantPolicyError)}>
                      Choose {chargeableTravellers} seat
                      {chargeableTravellers === 1 ? '' : 's'}{' '}
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>}

            {step === 'seats' && selectedTrip && <Card className="mx-auto max-w-3xl">
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Select your seats</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedTrip.route} · {ticketClass} · choose{' '}
                      {chargeableTravellers} seat
                      {chargeableTravellers === 1 ? '' : 's'}.
                    </p>
                  </div>
                  <Badge tone={selectedSeats.length === chargeableTravellers ? 'success' : 'primary'}>
                    {selectedSeats.length} / {chargeableTravellers} selected
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <Legend className="border-border bg-white" label="Available" />
                    <Legend className="border-primary bg-primary" label="Selected" />
                    <Legend className="border-border bg-muted" label="Booked" />
                  </div>
                  <div className="mx-auto max-w-sm rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-5 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Front · Driver
                    </div>
                    <div className="space-y-2">
                      {chunkSeats(seats, selectedTrip.layout === '2+1' ? 3 : 4).map((row, index) => <div key={index} className="flex items-center justify-center gap-2">
                          <span className="w-4 text-right text-xs text-muted-foreground">
                            {index + 1}
                          </span>
                          <div className="flex gap-1.5">
                            {row.slice(0, selectedTrip.layout === '2+1' ? 1 : 2).map((seat) => <PublicSeat key={seat.id} seat={seat} selected={selectedSeats.includes(seat.id)} onClick={() => toggleSeat(seat.id, seat.status)} />)}
                          </div>
                          <span className="w-5" />
                          <div className="flex gap-1.5">
                            {row.slice(selectedTrip.layout === '2+1' ? 1 : 2).map((seat) => <PublicSeat key={seat.id} seat={seat} selected={selectedSeats.includes(seat.id)} onClick={() => toggleSeat(seat.id, seat.status)} />)}
                          </div>
                        </div>)}
                    </div>
                  </div>
                  {error && <InlineError message={error} />}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button variant="outline" onClick={() => setStep('travellers')}>
                      <ArrowLeftIcon className="h-4 w-4" /> Back
                    </Button>
                    <Button size="lg" onClick={continueSeats}>
                      Review booking <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>}

            {step === 'review' && selectedTrip && <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
                <Card>
                  <CardHeader>
                    <CardTitle>Confirm and pay</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="lead-name">Lead traveller name</Label>
                        <Input id="lead-name" value={contact.name} onChange={(event) => setContact({
                      ...contact,
                      name: event.target.value
                    })} placeholder="Full name" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Mobile number</Label>
                        <Input id="phone" inputMode="numeric" value={contact.phone} onChange={(event) => setContact({
                      ...contact,
                      phone: event.target.value.replace(/\D/g, '')
                    })} placeholder="2547XXXXXXXX" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Payment method</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {([['mpesa', 'M-Pesa', SmartphoneIcon], ['card', 'Card', CreditCardIcon]] as const).map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setPaymentMethod(id)} className={cn('flex items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', paymentMethod === id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground')}>
                            <Icon className="h-5 w-5" />
                            <span>{label}</span>
                          </button>)}
                      </div>
                    </div>
                    <div className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                      {paymentMethod === 'mpesa' ? <>
                          A simulated M-Pesa prompt will be sent to{' '}
                          <strong className="text-foreground">
                            +{contact.phone || 'your phone'}
                          </strong>
                          . No real payment is collected.
                        </> : <>
                          Card payment confirmation is simulated in this
                          prototype. No card details or real payment are
                          collected.
                        </>}
                    </div>
                    {error && <InlineError message={error} />}
                    <div className="flex flex-wrap justify-between gap-3">
                      <Button variant="outline" disabled={paymentState === 'processing'} onClick={() => setStep('seats')}>
                        <ArrowLeftIcon className="h-4 w-4" /> Back
                      </Button>
                      <Button size="lg" disabled={paymentState === 'processing'} onClick={confirmPayment}>
                        {paymentState === 'processing' ? 'Confirming payment…' : `Pay ${formatKES(total)}`}{' '}
                        {paymentState !== 'processing' && <ArrowRightIcon className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <BookingSummary trip={selectedTrip} date={date} ticketClass={ticketClass} adults={adults} children={children} infants={infants} seats={selectedSeats} total={total} />
              </div>}

            {step === 'complete' && selectedTrip && <Card className="mx-auto max-w-3xl overflow-hidden">
                <div className="border-b border-success/20 bg-success/10 px-5 py-6 text-center">
                  <CheckCircle2Icon className="mx-auto h-10 w-10 text-success" />
                  <h2 className="mt-3 text-2xl tracking-wide text-foreground">
                    Booking confirmed
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your ticket confirmation has been sent to +{contact.phone}.
                  </p>
                </div>
                <CardContent className="space-y-5 pt-5">
                  <div className="rounded-lg border border-border p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                          Booking reference
                        </p>
                        <p className="mt-1 text-lg tracking-wide text-foreground">
                          BP-WEB-{selectedTrip.id.toUpperCase()}-150726
                        </p>
                      </div>
                      <Badge tone="success">
                        Paid · {paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card'}
                      </Badge>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
                      <ReceiptItem label="Route" value={selectedTrip.route} />
                      <ReceiptItem label="Class" value={ticketClass} />
                      <ReceiptItem label="Departure" value={`${formatTravelDate(date)} · ${selectedTrip.time}`} />
                      <ReceiptItem label="Arrival" value={selectedTrip.arrivalTime ?? '—'} />
                      <ReceiptItem label="Seats" value={selectedSeats.join(', ')} />
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total paid
                      </span>
                      <span className="text-xl tabular-nums text-primary">
                        {formatKES(total)}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Button variant="outline" size="lg" onClick={downloadReceiptPdf}>
                      <DownloadIcon className="h-4 w-4" /> Download PDF receipt
                    </Button>
                    <Button size="lg" onClick={startOver}>
                      <TicketIcon className="h-4 w-4" /> Book another trip
                    </Button>
                  </div>
                </CardContent>
              </Card>}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>;
}
function ProgressTracker({
  step


}: {step: BookingStep;}) {
  const currentIndex = step === 'complete' ? STEPS.length : Math.max(0, STEPS.findIndex((item) => item.id === step));
  return <ol className="mb-7 grid grid-cols-5 gap-1" aria-label="Booking progress">
      {STEPS.map((item, index) => <li key={item.id} className="min-w-0">
          <div className={cn('h-1 rounded-full', index <= currentIndex ? 'bg-primary' : 'bg-border')} />
          <span className={cn('mt-2 block truncate text-xs', index === currentIndex ? 'text-primary' : 'text-muted-foreground')}>
            {item.label}
          </span>
        </li>)}
    </ol>;
}
function TravellerCounter({
  label,
  detail,
  value,
  onChange,
  min = 0






}: {label: string;detail: string;value: number;onChange: (value: number) => void;min?: number;}) {
  return <div className="flex items-center justify-between gap-4 px-4 py-4">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40" aria-label={`Reduce ${label}`}>
          <MinusIcon className="h-4 w-4" />
        </button>
        <span className="w-5 text-center tabular-nums text-foreground" aria-live="polite">
          {value}
        </span>
        <button type="button" onClick={() => onChange(value + 1)} className="flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted" aria-label={`Add ${label}`}>
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
    </div>;
}
function PublicSeat({
  seat,
  selected,
  onClick







}: {seat: {id: string;status: string;};selected: boolean;onClick: () => void;}) {
  const unavailable = seat.status !== 'available';
  return <button type="button" disabled={unavailable} onClick={onClick} aria-label={`Seat ${seat.id}, ${selected ? 'selected' : seat.status}`} className={cn('h-9 w-9 rounded-md border text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected ? 'border-primary bg-primary text-primary-foreground' : unavailable ? 'cursor-not-allowed border-border bg-muted text-muted-foreground/50' : 'border-border bg-white text-foreground hover:border-primary hover:text-primary')}>
      {seat.id}
    </button>;
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
function BookingSummary({
  trip,
  date,
  ticketClass,
  adults,
  children,
  infants,
  seats,
  total









}: {trip: (typeof trips)[number];date: string;ticketClass: TicketClass;adults: number;children: number;infants: number;seats: string[];total: number;}) {
  return <Card className="h-fit">
      <CardHeader>
        <CardTitle>Trip summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <MapPinIcon className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-foreground">{trip.route}</p>
            <p className="text-muted-foreground">{formatTravelDate(date)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock3Icon className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-foreground">
              {trip.time} – {trip.arrivalTime ?? '—'}
            </p>
            <p className="text-muted-foreground">{trip.vehicle}</p>
          </div>
        </div>
        <div className="rounded-md bg-primary/5 px-3 py-2 text-sm text-primary">
          {ticketClass} class · {TICKET_CLASS_DETAILS[ticketClass].description}
        </div>
        <div className="flex items-start gap-2">
          <UsersIcon className="mt-0.5 h-4 w-4 text-primary" />
          <p className="text-muted-foreground">
            {adults} adult{adults === 1 ? '' : 's'} · {children} child
            {children === 1 ? '' : 'ren'} aged 5+
            {infants > 0 ? ` · ${infants} under 5 free` : ''}
          </p>
        </div>
        {seats.length > 0 && <div className="rounded-md bg-muted px-3 py-2 text-muted-foreground">
            Seats <span className="text-foreground">{seats.join(', ')}</span>
          </div>}
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total</span>
          <span className="text-lg tabular-nums text-primary">
            {formatKES(total)}
          </span>
        </div>
      </CardContent>
    </Card>;
}
function ReceiptItem({
  label,
  value



}: {label: string;value: string;}) {
  return <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>;
}
function InlineError({
  message


}: {message: string;}) {
  return <p role="alert" className="flex items-center gap-2 rounded-md border border-danger/25 bg-danger/5 px-3 py-2.5 text-sm text-danger">
      <CircleAlertIcon className="h-4 w-4 shrink-0" />
      {message}
    </p>;
}
function chunkSeats<T>(items: T[], size: number): T[][] {
  return Array.from({
    length: Math.ceil(items.length / size)
  }, (_, index) => items.slice(index * size, index * size + size));
}
function formatTravelDate(value: string) {
  const [year, month, day] = value.split('-');
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return year && month && day ? `${day} ${names[Number(month) - 1]} ${year}` : value;
}