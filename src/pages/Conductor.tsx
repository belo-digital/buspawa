import React, { useState } from 'react';
import { CheckCircle2Icon, CheckIcon, QrCodeIcon, ScanLineIcon, UsersIcon, PackageIcon } from 'lucide-react';
import { Button, Badge, Input } from '../components/ui/primitives';
import { manifest, manifestParcels } from '../lib/mockData';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
const SECONDARY_LOGO_URL = "/secondary-logo.svg";
type ScanPhase = 'ready' | 'action' | 'verify' | 'success';
const SCAN_STAGES = [{
  action: 'Confirm Loaded on Vehicle',
  status: 'Loaded on vehicle'
}, {
  action: 'Confirm Received at Branch',
  status: 'Arrived at destination branch'
}, {
  action: 'Confirm Collected by Recipient',
  status: 'Collected by recipient'
}];
export function Conductor() {
  const {
    signOut
  } = useAuth();
  const [tab, setTab] = useState<'passengers' | 'parcels'>('passengers');
  const [passengers, setPassengers] = useState(manifest);
  const [scanPhase, setScanPhase] = useState<ScanPhase>('ready');
  const [scanStage, setScanStage] = useState(0);
  const [verification, setVerification] = useState('');
  const [lastStatus, setLastStatus] = useState('');
  const currentParcel = manifestParcels[0];
  const action = SCAN_STAGES[scanStage];
  const boarded = passengers.filter((passenger) => passenger.boarded).length;
  const toggleBoarding = (id: string) => setPassengers((current) => current.map((passenger) => passenger.id === id ? {
    ...passenger,
    boarded: !passenger.boarded
  } : passenger));
  const simulateScan = () => {
    setVerification('');
    setScanPhase('action');
  };
  const confirmScanAction = () => {
    if (scanStage === 2) {
      setScanPhase('verify');
      return;
    }
    finishScan();
  };
  const finishScan = () => {
    setLastStatus(action.status);
    setScanPhase('success');
    window.setTimeout(() => {
      setScanPhase('ready');
      setScanStage((current) => current === SCAN_STAGES.length - 1 ? 0 : current + 1);
      setVerification('');
    }, 1500);
  };
  return <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-primary px-4 py-4 text-primary-foreground">
        <div className="flex items-center justify-between gap-3">
          <img src={SECONDARY_LOGO_URL} alt="BusPawa" className="h-auto w-[122px]" />
          <button onClick={signOut} className="rounded-md bg-white/15 px-2.5 py-1 text-xs">
            Sign out
          </button>
        </div>
        <p className="mt-3 text-[15px] tracking-wide">Nairobi → Mombasa</p>
        <p className="mt-1 text-sm text-primary-foreground/80">
          Trip 08:00 · KDA 221X · Conductor P. Kamau
        </p>
      </header>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Boarded</span>
          <span className="tabular-nums text-foreground">
            {boarded} / {passengers.length}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{
          width: `${boarded / passengers.length * 100}%`
        }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 px-4">
        {([['passengers', 'Passengers', UsersIcon], ['parcels', 'Parcel scan', PackageIcon]] as const).map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setTab(id)} className={cn('flex items-center justify-center gap-2 rounded-md py-3 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', tab === id ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground')}>
            <Icon className="h-4 w-4" />
            {label}
          </button>)}
      </div>

      <main className="flex-1 p-4">
        {tab === 'passengers' ? <section className="space-y-2" aria-label="Passenger manifest">
            {passengers.map((passenger) => <button key={passenger.id} type="button" onClick={() => toggleBoarding(passenger.id)} className={cn('flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors active:scale-[0.99]', passenger.boarded ? 'border-success/30 bg-success/5' : 'border-border bg-card')}>
                <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-sm tabular-nums', passenger.boarded ? 'bg-success text-white' : 'bg-muted text-foreground')}>
                  {passenger.boarded ? <CheckIcon className="h-5 w-5" /> : passenger.seat}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-foreground">
                    {passenger.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Seat {passenger.seat}
                  </p>
                </div>
                {passenger.boarded ? <Badge tone="success">Boarded</Badge> : <span className="text-sm text-primary">Tap to board</span>}
              </button>)}
          </section> : <ParcelScanAction phase={scanPhase} tracking={currentParcel.tracking} receiver={currentParcel.receiver} actionLabel={action.action} status={lastStatus} verification={verification} onVerificationChange={setVerification} onScan={simulateScan} onConfirm={confirmScanAction} onFinish={finishScan} />}
      </main>
    </div>;
}
function ParcelScanAction({
  phase,
  tracking,
  receiver,
  actionLabel,
  status,
  verification,
  onVerificationChange,
  onScan,
  onConfirm,
  onFinish











}: {phase: ScanPhase;tracking: string;receiver: string;actionLabel: string;status: string;verification: string;onVerificationChange: (value: string) => void;onScan: () => void;onConfirm: () => void;onFinish: () => void;}) {
  return <section className="space-y-4" aria-label="Parcel QR scan action">
      {phase === 'success' ? <div className="rounded-lg border border-success/30 bg-success/5 px-5 py-10 text-center" role="status">
          <CheckCircle2Icon className="mx-auto h-12 w-12 text-success" />
          <h2 className="mt-4 text-xl tracking-wide text-foreground">
            Scan confirmed
          </h2>
          <p className="mt-2 text-lg tracking-[0.06em] text-foreground">
            {tracking}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{status}</p>
          <p className="mt-5 text-xs text-muted-foreground">
            Preparing for the next parcel…
          </p>
        </div> : <>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex aspect-[4/3] items-center justify-center rounded-md border-2 border-dashed border-primary/45 bg-muted/40">
              <div className="text-center">
                <ScanLineIcon className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-3 text-sm text-foreground">
                  Camera viewfinder
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Center the parcel QR inside this area
                </p>
              </div>
            </div>
          </div>
          {phase === 'ready' ? <Button size="lg" className="w-full" onClick={onScan}>
              <QrCodeIcon className="h-4 w-4" /> Scan parcel sticker
            </Button> : phase === 'action' ? <div className="space-y-4">
              <div className="rounded-md border border-primary/25 bg-primary/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Parcel scanned
                </p>
                <p className="mt-1 text-lg tracking-[0.07em] text-foreground">
                  {tracking}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Receiver: {receiver}
                </p>
              </div>
              <Button size="lg" className="w-full" onClick={onConfirm}>
                {actionLabel}
              </Button>
              <button type="button" onClick={onScan} className="w-full text-sm text-muted-foreground underline underline-offset-4">
                Scan again
              </button>
            </div> : <div className="space-y-4">
              <div className="rounded-md border border-primary/25 bg-primary/5 px-4 py-3">
                <p className="text-sm text-foreground">
                  Recipient collection verification
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Confirm receiver ID or the OTP before marking this parcel
                  collected.
                </p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="collection-verification" className="text-sm text-muted-foreground">
                  Receiver ID / OTP
                </label>
                <Input id="collection-verification" value={verification} onChange={(event) => onVerificationChange(event.target.value)} placeholder="Enter ID or OTP" className="h-11 text-center tracking-[0.2em]" />
              </div>
              <Button size="lg" className="w-full" disabled={verification.trim().length < 4} onClick={onFinish}>
                Verify & Confirm Collected
              </Button>
            </div>}
        </>}
    </section>;
}