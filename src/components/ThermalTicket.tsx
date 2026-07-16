import React from 'react';
import { PrinterIcon, QrCodeIcon } from 'lucide-react';
import { formatKES } from '../lib/utils';
const PRIMARY_LOGO_URL = "/primary-logo.svg";
export interface ThermalTicketData {
  reference: string;
  route: string;
  departureDate: string;
  departureTime: string;
  seat: string;
  vehicle: string;
  passengerName: string;
  passengerPhone: string;
  passengerId?: string;
  ticketClass: 'Regular' | 'VIP';
  fare: number;
  paymentMethod: string;
  issuedAt: string;
  agent: string;
  branch: string;
}
export function ThermalTicket({
  ticket,
  showPrintButton = true



}: {ticket: ThermalTicketData;showPrintButton?: boolean;}) {
  return <div className="space-y-3">
      <article id="thermal-ticket" className="thermal-ticket mx-auto bg-white text-black shadow-sm" aria-label={`Passenger ticket ${ticket.reference}`}>
        <header className="border-b border-black pb-2 text-center">
          <img src={PRIMARY_LOGO_URL} alt="BusPawa" className="mx-auto h-auto w-[38mm]" />
          <p className="mt-1 text-[9px] font-semibold tracking-[0.16em]">
            PASSENGER TICKET
          </p>
          <p className="mt-1 text-[8px]">Booking ref. {ticket.reference}</p>
        </header>

        <div className="mt-2 grid grid-cols-[1fr_18mm] gap-2 border-b border-black pb-2">
          <div className="grid grid-cols-2 border border-black text-[8px]">
            <TicketCell label="Departure date" value={ticket.departureDate} />
            <TicketCell label="Departure time" value={ticket.departureTime} borderLeft />
            <TicketCell label="Seat no." value={ticket.seat} borderTop />
            <TicketCell label="Vehicle" value={ticket.vehicle} borderLeft borderTop />
          </div>
          <div className="flex items-center justify-center border border-black p-1">
            <QrCodeIcon className="h-[15mm] w-[15mm]" strokeWidth={1.75} aria-label="Ticket QR code" />
          </div>
        </div>

        <section className="border-b border-black py-2 text-center">
          <p className="text-[8px] font-semibold uppercase tracking-[0.12em]">
            Route
          </p>
          <p className="mt-1 text-[12px] font-bold leading-tight">
            {ticket.route}
          </p>
        </section>

        <section className="border-b border-black text-[8px]">
          <ReceiptRow label="Passenger" value={ticket.passengerName} />
          <ReceiptRow label="Phone" value={ticket.passengerPhone} />
          <ReceiptRow label="ID" value={ticket.passengerId || 'Not provided'} />
          <ReceiptRow label="Class" value={ticket.ticketClass} />
          <ReceiptRow label="Fare" value={formatKES(ticket.fare)} strong />
          <ReceiptRow label="Payment" value={ticket.paymentMethod} />
        </section>

        <section className="border-b border-black py-2 text-[8px]">
          <div className="flex justify-between gap-3">
            <span>Issued</span>
            <span>{ticket.issuedAt}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>Agent</span>
            <span>{ticket.agent}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>Branch</span>
            <span>{ticket.branch}</span>
          </div>
        </section>

        <footer className="pt-2 text-center text-[7px] leading-relaxed">
          <p className="font-semibold">
            Present this ticket for scan and check-in.
          </p>
          <p className="mt-1">
            Keep this coupon until your journey is complete.
          </p>
          <p className="mt-2">Terms apply · buspawa.co.ke</p>
        </footer>
      </article>

      {showPrintButton && <button type="button" onClick={() => window.print()} className="no-print flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <PrinterIcon className="h-4 w-4" /> Print ticket
        </button>}
    </div>;
}
function TicketCell({
  label,
  value,
  borderLeft = false,
  borderTop = false





}: {label: string;value: string;borderLeft?: boolean;borderTop?: boolean;}) {
  return <div className={`${borderLeft ? 'border-l border-black' : ''} ${borderTop ? 'border-t border-black' : ''} min-h-[13mm] p-1.5`}>
      <p className="uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-[10px] font-bold leading-tight">{value}</p>
    </div>;
}
function ReceiptRow({
  label,
  value,
  strong = false




}: {label: string;value: string;strong?: boolean;}) {
  return <div className="flex min-h-6 items-center justify-between gap-3 border-b border-black px-1.5 py-1 last:border-b-0">
      <span>{label}</span>
      <span className={strong ? 'font-bold' : ''}>{value}</span>
    </div>;
}