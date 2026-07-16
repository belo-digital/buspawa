import React, { useEffect, useMemo, useState } from 'react';
import { type FormEvent } from 'react';
import { ClipboardCheckIcon, KeyRoundIcon, MapPinIcon, PackageCheckIcon, SearchIcon } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Separator } from './ui/primitives';
import { ParcelQrScanConfirmation, ParcelQrScanState } from './ParcelQrScanConfirmation';
import { ParcelScanLifecycle } from './ParcelScanLifecycle';
import { ParcelRecord } from './parcelTypes';
type ParcelHandoffAction = 'receive' | 'release';
interface ParcelOperationsPanelProps {
  parcels: ParcelRecord[];
  activeBranch: string;
  operatorName: string;
  readOnly?: boolean;
  initialAction?: ParcelHandoffAction;
  onReceive: (tracking: string) => void;
  onRelease: (tracking: string, verification: string) => void;
}
export function ParcelOperationsPanel({
  parcels,
  activeBranch,
  operatorName,
  readOnly = false,
  initialAction,
  onReceive,
  onRelease
}: ParcelOperationsPanelProps) {
  const [trackingQuery, setTrackingQuery] = useState('');
  const [selectedTracking, setSelectedTracking] = useState<string | null>(null);
  const [verification, setVerification] = useState('');
  const [qrScanState, setQrScanState] = useState<ParcelQrScanState>('idle');
  const [notice, setNotice] = useState('');
  const selectedParcel = useMemo(() => parcels.find((parcel) => parcel.tracking === selectedTracking) ?? null, [parcels, selectedTracking]);
  const incomingParcels = useMemo(() => parcels.filter((parcel) => parcel.destination === activeBranch), [activeBranch, parcels]);
  const selectionParcels = useMemo(() => initialAction === 'release' ? incomingParcels.filter((parcel) => parcel.activeStage === 2) : incomingParcels, [incomingParcels, initialAction]);
  const matchingParcels = useMemo(() => selectionParcels.filter((parcel) => parcelMatchesQuery(parcel, trackingQuery)), [selectionParcels, trackingQuery]);
  useEffect(() => {
    if (!initialAction) return;
    const match = incomingParcels.find((parcel) => initialAction === 'receive' ? parcel.activeStage === 1 : parcel.activeStage === 2);
    if (!match) return;
    setTrackingQuery('');
    setSelectedTracking(match.tracking);
    resetActionState();
  }, [incomingParcels, initialAction]);
  const resetActionState = () => {
    setVerification('');
    setQrScanState('idle');
    setNotice('');
  };
  const searchParcel = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const exactMatch = selectionParcels.find((parcel) => parcelMatchesExactly(parcel, trackingQuery));
    const selectedMatch = exactMatch ?? matchingParcels[0];
    if (!selectedMatch) {
      setSelectedTracking(null);
      setVerification('');
      setQrScanState('idle');
      setNotice('No parcel matches that ID, recipient name, or phone number. Check the details and try again.');
      return;
    }
    selectParcel(selectedMatch.tracking);
    setNotice(matchingParcels.length > 1 && !exactMatch ? `${matchingParcels.length} matching parcels found. Choose another result from the list if needed.` : '');
  };
  const selectParcel = (tracking: string) => {
    setSelectedTracking(tracking);
    resetActionState();
  };
  const receiveParcel = () => {
    if (!selectedParcel || !canCompleteReceipt) return;
    onReceive(selectedParcel.tracking);
    setQrScanState('idle');
    setNotice(`Receipt logged at ${activeBranch} by ${operatorName}.`);
  };
  const releaseParcel = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedParcel || !canRelease || verification.trim().length < 4 || qrScanState === 'scanning') return;
    onRelease(selectedParcel.tracking, verification.trim());
    setVerification('');
    setQrScanState('idle');
    setNotice('Recipient release has been recorded.');
  };
  const branchMatches = selectedParcel?.destination === activeBranch;
  const canReceive = Boolean(selectedParcel && branchMatches && selectedParcel.activeStage === 1 && !readOnly);
  const canRelease = Boolean(selectedParcel && branchMatches && selectedParcel.activeStage === 2 && !readOnly);
  const canCompleteReceipt = canReceive && qrScanState !== 'scanning';
  return <section className="space-y-6" aria-labelledby="parcel-operations-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="parcel-operations-heading" className="text-xl tracking-wide text-foreground">
            Parcel handoffs
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Receive transit parcels and release verified parcels at{' '}
            {activeBranch}.
          </p>
        </div>
        <Badge tone="primary">Operating branch · {activeBranch}</Badge>
      </div>

      <Card>
        <CardContent className="pt-5">
          <form onSubmit={searchParcel} className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Label htmlFor="parcel-tracking-lookup">
                Parcel ID, recipient name, or phone
              </Label>
              <Input id="parcel-tracking-lookup" value={trackingQuery} onChange={(event) => setTrackingQuery(event.target.value)} placeholder="e.g. PCL-11843, Alice Njoroge, or 0722 901 765" autoComplete="off" />
            </div>
            <Button type="submit" className="sm:mb-0.5 sm:self-end">
              <SearchIcon className="h-4 w-4" /> Find parcel
            </Button>
          </form>
          {notice && <p role="status" className="mt-4 rounded-md border border-primary/25 bg-primary/5 px-3 py-2.5 text-sm text-foreground">
              {notice}
            </p>}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>
              {initialAction === 'release' ? 'Ready to release at this branch' : 'Expected at this branch'}
            </CardTitle>
            {initialAction === 'release' && <p className="mt-1 text-sm text-muted-foreground">
                Choose a parcel below, or search by its ID or recipient details.
              </p>}
          </CardHeader>
          <CardContent>
            {matchingParcels.length ? <div className="divide-y divide-border">
                {matchingParcels.map((parcel) => <button key={parcel.tracking} type="button" onClick={() => selectParcel(parcel.tracking)} className="flex w-full items-center justify-between gap-4 py-3 text-left transition-colors first:pt-0 last:pb-0 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-pressed={selectedParcel?.tracking === parcel.tracking}>
                    <div className="min-w-0">
                      <p className="text-sm tracking-wide text-foreground">
                        {parcel.tracking}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {parcel.receiverName} · {parcel.receiverPhone}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {parcel.origin} → {parcel.destination}
                      </p>
                    </div>
                    <StatusBadge stage={parcel.activeStage} />
                  </button>)}
              </div> : <p className="text-sm text-muted-foreground">
                {trackingQuery.trim() ? 'No parcels at this branch match that search.' : initialAction === 'release' ? `No parcels are ready for release at ${activeBranch}.` : `No inbound parcels are currently assigned to ${activeBranch}.`}
              </p>}
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardHeader>
            <CardTitle>Branch control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="flex gap-2">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Receipt can only be recorded at the parcel’s destination branch.
            </p>
            <p className="flex gap-2">
              <KeyRoundIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Recipient release requires an ID or OTP check.
            </p>
          </CardContent>
        </Card>
      </div>

      {selectedParcel && <article className="space-y-6" aria-labelledby="selected-parcel-heading">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Parcel record
                </p>
                <CardTitle id="selected-parcel-heading" className="mt-1 text-lg">
                  {selectedParcel.tracking}
                </CardTitle>
              </div>
              <StatusBadge stage={selectedParcel.activeStage} />
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <RecordDetail label="Route" value={`${selectedParcel.origin} → ${selectedParcel.destination}`} />
                <RecordDetail label="Parcel" value={`${selectedParcel.description} · ${selectedParcel.weight} kg`} />
                <RecordDetail label="Sender" value={`${selectedParcel.senderName} · ${selectedParcel.senderPhone}`} />
                <RecordDetail label="Recipient" value={`${selectedParcel.receiverName} · ${selectedParcel.receiverPhone}`} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedParcel.categories.map((category) => <Badge key={category} tone="outline">
                    {category}
                  </Badge>)}
              </div>
              <Separator />
              <ParcelScanLifecycle activeStage={selectedParcel.activeStage} entries={selectedParcel.lifecycleEntries} completed={selectedParcel.activeStage === 3} />
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-foreground">Customer tracking</p>
                  <StatusBadge stage={selectedParcel.activeStage} />
                </div>
                <ParcelScanLifecycle activeStage={selectedParcel.activeStage} entries={[]} variant="customer" completed={selectedParcel.activeStage === 3} />
              </div>
            </CardContent>
          </Card>

          {!branchMatches ? <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-4 text-sm text-foreground">
              This parcel is addressed to{' '}
              <strong>{selectedParcel.destination}</strong>. Handoff actions are
              unavailable while the active branch is {activeBranch}.
            </div> : selectedParcel.activeStage === 1 ? <Card>
              <CardHeader>
                <CardTitle>Destination branch receipt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <PackageCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p>
                    Confirm the parcel has been received after transit. This
                    makes it ready for recipient release.
                  </p>
                </div>
                <ParcelQrScanConfirmation tracking={selectedParcel.tracking} actionLabel="receive" state={qrScanState} disabled={readOnly} onStateChange={setQrScanState} />
                <div className="flex justify-end">
                  <Button disabled={!canCompleteReceipt} onClick={receiveParcel}>
                    <PackageCheckIcon className="h-4 w-4" /> Mark received at{' '}
                    {activeBranch}
                  </Button>
                </div>
              </CardContent>
            </Card> : selectedParcel.activeStage === 2 ? <Card>
              <CardHeader>
                <CardTitle>Recipient release</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={releaseParcel} className="space-y-4">
                  <div className="rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    Verify the recipient’s ID or OTP before releasing this
                    parcel to {selectedParcel.receiverName}.
                  </div>
                  <ParcelQrScanConfirmation tracking={selectedParcel.tracking} actionLabel="release" state={qrScanState} disabled={readOnly} onStateChange={setQrScanState} />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div className="space-y-1.5">
                      <Label htmlFor="recipient-verification">
                        Recipient ID / OTP
                      </Label>
                      <Input id="recipient-verification" value={verification} onChange={(event) => setVerification(event.target.value)} placeholder="Enter ID number or OTP" aria-describedby="recipient-verification-help" />
                      <p id="recipient-verification-help" className="text-xs text-muted-foreground">
                        Enter at least 4 characters to confirm recipient
                        release.
                      </p>
                    </div>
                    <Button type="submit" disabled={!canRelease || verification.trim().length < 4 || qrScanState === 'scanning'}>
                      <ClipboardCheckIcon className="h-4 w-4" /> Verify &
                      release parcel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card> : selectedParcel.activeStage === 3 ? <div className="flex gap-3 rounded-lg border border-success/30 bg-success/5 px-4 py-4 text-sm text-foreground">
              <ClipboardCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <p>
                This parcel was collected by the recipient. Its completed
                handoff record is locked from further changes.
              </p>
            </div> : <div className="rounded-lg border border-border bg-muted/40 px-4 py-4 text-sm text-muted-foreground">
              This parcel is booked and awaiting loading onto a vehicle.
              Destination receipt becomes available after the transit handoff is
              recorded.
            </div>}
        </article>}
    </section>;
}
function StatusBadge({
  stage


}: {stage: ParcelRecord['activeStage'];}) {
  if (stage === 3) return <Badge tone="success">Collected</Badge>;
  if (stage === 2) return <Badge tone="primary">Ready for release</Badge>;
  if (stage === 1) return <Badge tone="warning">In transit</Badge>;
  return <Badge tone="neutral">Booked</Badge>;
}
function RecordDetail({
  label,
  value



}: {label: string;value: string;}) {
  return <div>
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>;
}
function parcelMatchesQuery(parcel: ParcelRecord, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  const queryDigits = digitsOnly(query);
  return parcel.tracking.toLowerCase().includes(normalizedQuery) || parcel.receiverName.toLowerCase().includes(normalizedQuery) || queryDigits.length > 0 && digitsOnly(parcel.receiverPhone).includes(queryDigits);
}
function parcelMatchesExactly(parcel: ParcelRecord, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const queryDigits = digitsOnly(query);
  return parcel.tracking.toLowerCase() === normalizedQuery || parcel.receiverName.toLowerCase() === normalizedQuery || queryDigits.length > 0 && digitsOnly(parcel.receiverPhone) === queryDigits;
}
function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}