import React from 'react';
import { PrinterIcon, QrCodeIcon } from 'lucide-react';
import { ParcelCategory, ParcelDocumentData } from './parcelTypes';
import { Button } from './ui/primitives';
import { cn } from '../lib/utils';
const CATEGORY_STYLES: Record<ParcelCategory, string> = {
  Fragile: 'border-danger/30 bg-danger/10 text-danger',
  Perishable: 'border-warning/35 bg-warning/10 text-warning',
  'High-Value': 'border-primary/30 bg-primary/10 text-primary',
  Express: 'border-success/30 bg-success/10 text-success'
};
export function ParcelLabelSticker({
  parcel,
  onPrint



}: {parcel: ParcelDocumentData;onPrint: () => void;}) {
  return <section className="space-y-3" aria-labelledby="parcel-label-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Document 2
          </p>
          <h2 id="parcel-label-title" className="mt-1 text-base tracking-wide text-foreground">
            Parcel label / sticker
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onPrint}>
          <PrinterIcon className="h-3.5 w-3.5" /> Print label
        </Button>
      </div>
      <article id="parcel-label-sticker" className="mx-auto max-w-sm rounded-lg border-2 border-foreground bg-white p-4 text-foreground shadow-sm" aria-label={`Parcel label for ${parcel.tracking}`}>
        <div className="flex items-start justify-between gap-4 border-b-2 border-foreground pb-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              BusPawa parcel
            </p>
            <p className="mt-1 text-[28px] leading-none tracking-[0.08em] text-foreground">
              {parcel.tracking}
            </p>
          </div>
          <div className="rounded border border-foreground p-1.5">
            <QrCodeIcon className="h-24 w-24 text-foreground" strokeWidth={2} aria-label="Parcel QR code" />
          </div>
        </div>

        <div className="py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Route
          </p>
          <p className="mt-1 text-lg tracking-wide text-foreground">
            {stationCode(parcel.origin)} → {stationCode(parcel.destination)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {parcel.origin} to {parcel.destination}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 border-y border-border py-3">
          {parcel.categories.map((category) => <span key={category} className={cn('rounded-full border px-2 py-0.5 text-xs tracking-wide', CATEGORY_STYLES[category])}>
              {category}
            </span>)}
        </div>

        <div className="pt-3">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Release to recipient
          </p>
          <p className="mt-1 text-base text-foreground">
            {parcel.receiverName}
          </p>
          <p className="mt-0.5 text-sm tabular-nums text-foreground">
            {parcel.receiverPhone}
          </p>
        </div>
      </article>
    </section>;
}
function stationCode(station: string) {
  return station === 'Nairobi CBD' ? 'NBO' : station.slice(0, 3).toUpperCase();
}