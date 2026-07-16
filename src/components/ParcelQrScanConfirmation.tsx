import React from 'react';
import { CheckCircle2Icon, QrCodeIcon, ScanLineIcon } from 'lucide-react';
import { Button } from './ui/primitives';
export type ParcelQrScanState = 'idle' | 'scanning' | 'confirmed';
interface ParcelQrScanConfirmationProps {
  tracking: string;
  actionLabel: 'receive' | 'release';
  state: ParcelQrScanState;
  disabled?: boolean;
  onStateChange: (state: ParcelQrScanState) => void;
}
export function ParcelQrScanConfirmation({
  tracking,
  actionLabel,
  state,
  disabled = false,
  onStateChange
}: ParcelQrScanConfirmationProps) {
  const actionNoun = actionLabel === 'receive' ? 'receipt' : 'release';
  return <section className="rounded-lg border border-border bg-muted/30 p-4" aria-labelledby={`parcel-qr-${actionLabel}-heading`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <QrCodeIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h4 id={`parcel-qr-${actionLabel}-heading`} className="text-sm tracking-wide text-foreground">
              Scan parcel QR{' '}
              <span className="text-muted-foreground">· Optional</span>
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Use the label to confirm this parcel before {actionNoun}, or
              continue with the manual tracking lookup.
            </p>
          </div>
        </div>
      </div>

      {state === 'scanning' ? <div className="mt-4 space-y-3">
          <div className="relative flex min-h-32 items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-primary/45 bg-card px-4 text-center" role="status" aria-live="polite">
            <span className="absolute inset-x-5 top-1/2 h-px bg-primary/50" aria-hidden="true" />
            <div className="relative">
              <ScanLineIcon className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
              <p className="mt-2 text-sm text-foreground">QR scanner ready</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Center the sticker inside the scan area.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" size="sm" variant="outline" onClick={() => onStateChange('idle')}>
              Cancel scan
            </Button>
            <Button type="button" size="sm" disabled={disabled} onClick={() => onStateChange('confirmed')}>
              <ScanLineIcon className="h-4 w-4" /> Simulate matching scan
            </Button>
          </div>
        </div> : state === 'confirmed' ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-success/30 bg-success/5 px-3 py-2.5" role="status" aria-live="polite">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2Icon className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
            <span>
              QR matched selected parcel <strong>{tracking}</strong>.
            </span>
          </div>
          <button type="button" onClick={() => onStateChange('scanning')} className="text-xs text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Scan again
          </button>
        </div> : <Button type="button" size="sm" variant="outline" className="mt-4" disabled={disabled} onClick={() => onStateChange('scanning')}>
          <QrCodeIcon className="h-4 w-4" /> Scan parcel QR
        </Button>}
    </section>;
}