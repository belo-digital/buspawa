import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as jsPDF from 'jspdf';

export interface ParcelReceipt {
  trackingCode: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  origin: string;
  destination: string;
  description: string;
  weight: number;
  fare: number;
  paymentMethod: string;
  serviceLevel: string;
  createdAt: Date;
}

export interface ParcelSticker {
  trackingCode: string;
  origin: string;
  destination: string;
  senderName: string;
  receiverName: string;
  description: string;
  weight: number;
  qrCodeDataUrl: string;
}

@Injectable()
export class ParcelDocumentsService {
  async generateQRCode(data: string): Promise<string> {
    return QRCode.toDataURL(data, { width: 200, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
  }

  async generateReceipt(parcel: ParcelReceipt): Promise<Buffer> {
    const doc = new jsPDF.default({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BUSPAWA', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Parcel Customer Receipt', 105, 28, { align: 'center' });

    doc.setDrawColor(20, 100, 100);
    doc.line(20, 32, 190, 32);

    doc.setFontSize(9);
    let y = 42;
    const left = 20;
    const right = 110;

    const rows: [string, string][] = [
      ['Tracking Code:', parcel.trackingCode],
      ['Date:', parcel.createdAt.toLocaleDateString('en-KE')],
      ['Sender:', parcel.senderName],
      ['Sender Phone:', parcel.senderPhone || 'N/A'],
      ['Receiver:', parcel.receiverName],
      ['Receiver Phone:', parcel.receiverPhone || 'N/A'],
      ['Route:', `${parcel.origin} → ${parcel.destination}`],
      ['Description:', parcel.description],
      ['Weight:', `${parcel.weight} kg`],
      ['Service Level:', parcel.serviceLevel],
      ['Payment:', parcel.paymentMethod],
    ];

    for (const [label, value] of rows) {
      doc.setFont('helvetica', 'bold');
      doc.text(label, left, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, right, y);
      y += 7;
    }

    y += 3;
    doc.setDrawColor(20, 100, 100);
    doc.line(20, y, 190, y);
    y += 8;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`KES ${parcel.fare.toLocaleString()}`, 105, y, { align: 'center' });
    y += 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for using BusPawa!', 105, y, { align: 'center' });
    y += 5;
    doc.text('Retain this receipt for collection.', 105, y, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
  }

  async generateSticker(parcel: ParcelSticker): Promise<Buffer> {
    const doc = new jsPDF.default({ orientation: 'landscape', unit: 'mm', format: [100, 70] });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('BUSPAWA PARCEL', 50, 8, { align: 'center' });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(parcel.trackingCode, 50, 14, { align: 'center' });

    doc.setDrawColor(0);
    doc.line(5, 17, 95, 17);

    const qrCodeDataUrl = parcel.qrCodeDataUrl;
    if (qrCodeDataUrl) {
      const qrBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.addImage(qrBuffer as any, 'PNG', 60, 20, 35, 35);
    }

    let y = 23;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', 5, y);
    doc.setFont('helvetica', 'normal');
    doc.text(parcel.senderName, 18, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('TO:', 5, y);
    doc.setFont('helvetica', 'normal');
    doc.text(parcel.receiverName, 18, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('ROUTE:', 5, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${parcel.origin} → ${parcel.destination}`, 18, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM:', 5, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${parcel.description} (${parcel.weight}kg)`, 18, y);

    return Buffer.from(doc.output('arraybuffer'));
  }
}
