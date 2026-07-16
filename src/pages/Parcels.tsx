import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2Icon, ClipboardCheckIcon, PackageIcon, PrinterIcon, TicketIcon } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Separator } from '../components/ui/primitives';
import { BRANCHES } from '../lib/mockData';
import { TillSummary } from './Ticketing';
import { cn, formatKES } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { ParcelCustomerReceipt } from '../components/ParcelCustomerReceipt';
import { ParcelLabelSticker } from '../components/ParcelLabelSticker';
import { ParcelScanLifecycle } from '../components/ParcelScanLifecycle';
import { ParcelCategory, ParcelDocumentData, ParcelLifecycleStage, ParcelRecord } from '../components/parcelTypes';
import { ParcelOperationsPanel } from '../components/ParcelOperationsPanel';
import { DEMO_PARCELS } from '../lib/parcelDemoData';
const RATE_PER_KG = 90;
const BASE = 150;
const CATEGORIES: ParcelCategory[] = ['Fragile', 'Perishable', 'High-Value', 'Express'];
type ParcelView = 'booking' | 'handoffs';
export function Parcels() {
  const {
    role,
    branch,
    assignedStation
  } = useAuth();
  const [searchParams] = useSearchParams();
  const readOnly = role?.readOnly;
  const requestedView: ParcelView = searchParams.get('view') === 'handoffs' ? 'handoffs' : 'booking';
  const actionParam = searchParams.get('action');
  const requestedAction: 'receive' | 'release' | undefined = actionParam === 'receive' || actionParam === 'release' ? actionParam : undefined;
  const newParcelRequested = searchParams.get('new') === '1';
  const agentName = role?.id === 'booking_agent' ? 'Grace Wanjiru' : 'Counter staff';
  const [view, setView] = useState<ParcelView>(requestedView);
  const [sender, setSender] = useState({
    name: '',
    phone: ''
  });
  const [receiver, setReceiver] = useState({
    name: '',
    phone: ''
  });
  const [description, setDescription] = useState('Documents');
  const [weight, setWeight] = useState(3);
  const [destination, setDestination] = useState(BRANCHES.find((item) => item !== branch) ?? 'Mombasa');
  const [paymentMethod, setPaymentMethod] = useState<ParcelDocumentData['paymentMethod']>('M-Pesa');
  const [categories, setCategories] = useState<ParcelCategory[]>(['Express']);
  const [error, setError] = useState('');
  const [confirmedParcel, setConfirmedParcel] = useState<ParcelRecord | null>(null);
  const [parcelRecords, setParcelRecords] = useState<ParcelRecord[]>(DEMO_PARCELS);
  const price = useMemo(() => BASE + weight * RATE_PER_KG, [weight]);
  const toggleCategory = (category: ParcelCategory) => {
    if (readOnly) return;
    setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  };
  const confirmWaybill = () => {
    if (!sender.name.trim() || !sender.phone.trim() || !receiver.name.trim() || !receiver.phone.trim() || !description.trim()) {
      setError('Complete sender, receiver and parcel details before generating the waybill.');
      return;
    }
    if (sender.phone.replace(/\D/g, '').length < 9 || receiver.phone.replace(/\D/g, '').length < 9) {
      setError('Enter valid sender and receiver phone numbers before generating the waybill.');
      return;
    }
    if (destination === branch) {
      setError('Choose a destination branch different from the origin branch.');
      return;
    }
    const parcel: ParcelRecord = {
      tracking: 'PCL-11842',
      senderName: sender.name.trim(),
      senderPhone: sender.phone.trim(),
      receiverName: receiver.name.trim(),
      receiverPhone: receiver.phone.trim(),
      origin: branch,
      destination,
      categories: categories.length ? categories : ['Express'],
      price,
      paymentMethod,
      issuedAt: '15 Jul 2026 · 07:42',
      agent: agentName,
      description: description.trim(),
      weight,
      activeStage: 0,
      lifecycleEntries: [{
        timestamp: '15 Jul 2026 · 07:42',
        staff: agentName,
        role: 'Booking agent',
        location: branch
      }, {}, {}, {}]
    };
    setConfirmedParcel(parcel);
    setParcelRecords((current) => [parcel, ...current.filter((item) => item.tracking !== parcel.tracking)]);
    setError('');
  };
  const startNewParcel = () => {
    setSender({
      name: '',
      phone: ''
    });
    setReceiver({
      name: '',
      phone: ''
    });
    setDescription('Documents');
    setWeight(3);
    setDestination(BRANCHES.find((item) => item !== branch) ?? 'Mombasa');
    setPaymentMethod('M-Pesa');
    setCategories(['Express']);
    setConfirmedParcel(null);
    setError('');
  };
  useEffect(() => {
    setView(requestedView);
    if (requestedView === 'booking' && newParcelRequested) {
      startNewParcel();
    }
  }, [requestedView, newParcelRequested, branch]);
  const updateParcelStage = (tracking: string, nextStage: ParcelLifecycleStage, entryIndex: number, entry: ParcelRecord['lifecycleEntries'][number]) => {
    const updatedParcel = parcelRecords.find((parcel) => parcel.tracking === tracking);
    if (!updatedParcel) return;
    const lifecycleEntries = updatedParcel.lifecycleEntries.map((item, index) => index === entryIndex ? entry : item);
    const nextParcel: ParcelRecord = {
      ...updatedParcel,
      activeStage: nextStage,
      lifecycleEntries
    };
    setParcelRecords((current) => current.map((parcel) => parcel.tracking === tracking ? nextParcel : parcel));
    setConfirmedParcel((selected) => selected?.tracking === tracking ? nextParcel : selected);
  };
  const receiveParcel = (tracking: string) => {
    const parcel = parcelRecords.find((item) => item.tracking === tracking);
    if (!parcel || readOnly || parcel.destination !== branch || parcel.activeStage !== 1) return;
    updateParcelStage(tracking, 2, 2, {
      timestamp: handoffTimestamp(),
      staff: agentName,
      role: 'Booking agent',
      location: branch
    });
  };
  const releaseParcel = (tracking: string, verification: string) => {
    const parcel = parcelRecords.find((item) => item.tracking === tracking);
    if (!parcel || readOnly || verification.trim().length < 4 || parcel.destination !== branch || parcel.activeStage !== 2) {
      return;
    }
    updateParcelStage(tracking, 3, 3, {
      timestamp: handoffTimestamp(),
      staff: agentName,
      role: 'Booking agent · recipient ID/OTP verified',
      location: branch
    });
  };
  const printDocument = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add('print-target');
    window.print();
    window.setTimeout(() => target.classList.remove('print-target'), 300);
  };
  return <PageContainer>
      <PageHeader title="Parcels" subtitle={`Courier operations · ${branch} counter session`} actions={<div className="hidden rounded-md border border-border p-0.5 sm:flex">
            <a href="#/app/ticketing" className="flex items-center gap-1.5 rounded px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
              <TicketIcon className="h-4 w-4" /> Tickets
            </a>
            <span className="flex items-center gap-1.5 rounded bg-primary/10 px-3 py-1.5 text-sm text-primary">
              <PackageIcon className="h-4 w-4" /> Parcels
            </span>
          </div>} />

      {assignedStation && <div className="rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <span>Assigned station: {branch}</span>
          <span className="text-muted-foreground">
            {' '}
            · bookings and parcel handoffs are recorded here.
          </span>
        </div>}

      <div className="inline-flex rounded-md border border-border p-0.5" aria-label="Parcel workspace">
        {([['booking', 'Book a parcel'], ['handoffs', 'Receive & release']] as const).map(([id, label]) => <button key={id} type="button" onClick={() => setView(id)} className={cn('rounded px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', view === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')} aria-pressed={view === id}>
            {id === 'handoffs' && <ClipboardCheckIcon className="mr-1.5 inline h-4 w-4" />}
            {label}
          </button>)}
      </div>

      {view === 'handoffs' ? <ParcelOperationsPanel parcels={parcelRecords} activeBranch={branch} operatorName={agentName} readOnly={readOnly} initialAction={requestedAction} onReceive={receiveParcel} onRelease={releaseParcel} /> : confirmedParcel ? <section className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-success/25 bg-success/5 px-5 py-4">
            <div className="flex gap-3">
              <CheckCircle2Icon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div>
                <h2 className="text-base tracking-wide text-foreground">
                  Waybill generated
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Customer receipt and parcel label are ready to print.
                  M-Pesa/Card confirmations are simulated.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={startNewParcel}>
              New parcel
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <ParcelCustomerReceipt parcel={confirmedParcel} onPrint={() => printDocument('parcel-customer-receipt')} />
            <ParcelLabelSticker parcel={confirmedParcel} onPrint={() => printDocument('parcel-label-sticker')} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Parcel scan lifecycle · staff view</CardTitle>
            </CardHeader>
            <CardContent>
              <ParcelScanLifecycle activeStage={confirmedParcel.activeStage} entries={confirmedParcel.lifecycleEntries} completed={confirmedParcel.activeStage === 3} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Customer tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground">
                    {confirmedParcel.tracking}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {confirmedParcel.origin} to {confirmedParcel.destination}
                  </p>
                </div>
                <ParcelStatusBadge stage={confirmedParcel.activeStage} />
              </div>
              <ParcelScanLifecycle activeStage={confirmedParcel.activeStage} entries={[]} variant="customer" completed={confirmedParcel.activeStage === 3} />
            </CardContent>
          </Card>
        </section> : <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Sender</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Full name">
                    <Input value={sender.name} onChange={(event) => setSender({
                  ...sender,
                  name: event.target.value
                })} placeholder="Sender name" disabled={readOnly} />
                  </Field>
                  <Field label="Phone">
                    <Input value={sender.phone} onChange={(event) => setSender({
                  ...sender,
                  phone: event.target.value
                })} placeholder="07xx xxx xxx" disabled={readOnly} />
                  </Field>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Receiver</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Field label="Full name">
                    <Input value={receiver.name} onChange={(event) => setReceiver({
                  ...receiver,
                  name: event.target.value
                })} placeholder="Receiver name" disabled={readOnly} />
                  </Field>
                  <Field label="Phone">
                    <Input value={receiver.phone} onChange={(event) => setReceiver({
                  ...receiver,
                  phone: event.target.value
                })} placeholder="07xx xxx xxx" disabled={readOnly} />
                  </Field>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Parcel details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Description" className="sm:col-span-2">
                    <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Documents, electronics" disabled={readOnly} />
                  </Field>
                  <Field label="Weight (kg)">
                    <Input type="number" min={1} value={weight} onChange={(event) => setWeight(Math.max(1, Number(event.target.value) || 1))} disabled={readOnly} />
                  </Field>
                  <Field label="Destination branch">
                    <Select value={destination} onChange={(event) => setDestination(event.target.value)} disabled={readOnly}>
                      {BRANCHES.filter((item) => item !== branch).map((item) => <option key={item}>{item}</option>)}
                    </Select>
                  </Field>
                  <Field label="Payment method">
                    <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as ParcelDocumentData['paymentMethod'])} disabled={readOnly}>
                      <option>Cash</option>
                      <option>M-Pesa</option>
                      <option>Card</option>
                    </Select>
                  </Field>
                  <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                    {paymentMethod === 'Cash' ? 'Cash payment recorded at counter.' : `${paymentMethod} confirmation is simulated.`}
                  </div>
                </div>
                <div>
                  <Label>Handling categories</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => <button key={category} type="button" onClick={() => toggleCategory(category)} disabled={readOnly} className={cn('rounded-full border px-3 py-1 text-xs tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', categories.includes(category) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary')} aria-pressed={categories.includes(category)}>
                        {category}
                      </button>)}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Auto-calculated price
                  </span>
                  <span className="text-xl tabular-nums text-primary">
                    {formatKES(price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Generate documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-dashed border-border p-4">
                  <p className="text-sm text-foreground">
                    Two documents will be prepared after validation.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Customer receipt · QR parcel label
                  </p>
                </div>
                {error && <p role="alert" className="rounded-md border border-danger/25 bg-danger/5 px-3 py-2.5 text-sm text-danger">
                    {error}
                  </p>}
                <Button className="w-full" size="lg" disabled={readOnly} onClick={confirmWaybill}>
                  <PrinterIcon className="h-4 w-4" /> Confirm & Generate Waybill
                </Button>
              </CardContent>
            </Card>
            <TillSummary />
          </div>
        </div>}
    </PageContainer>;
}
function ParcelStatusBadge({
  stage


}: {stage: ParcelLifecycleStage;}) {
  if (stage === 3) return <Badge tone="success">Collected</Badge>;
  if (stage === 2) return <Badge tone="primary">Ready for release</Badge>;
  if (stage === 1) return <Badge tone="warning">In transit</Badge>;
  return <Badge tone="primary">Booked</Badge>;
}
function Field({
  label,
  className,
  children




}: {label: string;className?: string;children: React.ReactNode;}) {
  return <div className={cn('space-y-1.5', className)}>
      <Label>{label}</Label>
      {children}
    </div>;
}
function handoffTimestamp() {
  const time = new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date());
  return `15 Jul 2026 · ${time}`;
}