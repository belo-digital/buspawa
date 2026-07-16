import React from 'react';
import { PrinterIcon } from 'lucide-react';
import { ParcelDocumentData } from './parcelTypes';
import { Badge, Button, Separator } from './ui/primitives';
import { formatKES } from '../lib/utils';
const PRIMARY_LOGO_URL = "/primary-logo.svg";
export function ParcelCustomerReceipt({
  parcel,
  onPrint



}: {parcel: ParcelDocumentData;onPrint: () => void;}) {
  return <section className="space-y-3" aria-labelledby="customer-receipt-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            Document 1
          </p>
          <h2 id="customer-receipt-title" className="mt-1 text-base tracking-wide text-foreground">
            Customer receipt
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onPrint}>
          <PrinterIcon className="h-3.5 w-3.5" /> Print receipt
        </Button>
      </div>
      <article id="parcel-customer-receipt" className="rounded-lg border border-border bg-white p-5 text-foreground shadow-sm" aria-label={`Customer receipt for parcel ${parcel.tracking}`}>
        <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
          <div>
            <img src={PRIMARY_LOGO_URL} alt="BusPawa" className="h-auto w-[122px]" />
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Parcel customer receipt
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Tracking number</p>
            <p className="mt-1 text-lg tracking-[0.08em] text-foreground">
              {parcel.tracking}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-5 py-4 text-sm">
          <ReceiptPerson label="Sender" name={parcel.senderName} phone={parcel.senderPhone} />
          <ReceiptPerson label="Receiver" name={parcel.receiverName} phone={parcel.receiverPhone} />
        </div>

        <div className="flex flex-wrap gap-1.5 border-y border-border py-3">
          {parcel.categories.map((category) => <Badge key={category} tone="primary">
              {category}
            </Badge>)}
          <Badge tone="outline">{parcel.description}</Badge>
          <Badge tone="outline">{parcel.weight} kg</Badge>
        </div>

        <div className="space-y-2 py-4 text-sm">
          <ReceiptRow label="Route" value={`${parcel.origin} → ${parcel.destination}`} />
          <ReceiptRow label="Payment method" value={parcel.paymentMethod} />
          <ReceiptRow label="Issued" value={parcel.issuedAt} />
          <ReceiptRow label="Agent" value={`${parcel.agent} · ${parcel.origin}`} />
        </div>
        <Separator />
        <div className="flex items-end justify-between gap-4 pt-4">
          <p className="text-sm text-muted-foreground">Amount paid</p>
          <p className="text-2xl tabular-nums text-primary">
            {formatKES(parcel.price)}
          </p>
        </div>
      </article>
    </section>;
}
function ReceiptPerson({
  label,
  name,
  phone




}: {label: string;name: string;phone: string;}) {
  return <div>
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{phone}</p>
    </div>;
}
function ReceiptRow({
  label,
  value



}: {label: string;value: string;}) {
  return <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>;
}