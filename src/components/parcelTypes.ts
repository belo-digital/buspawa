export type ParcelCategory = 'Fragile' | 'Perishable' | 'High-Value' | 'Express';

export interface ParcelDocumentData {
  tracking: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  origin: string;
  destination: string;
  categories: ParcelCategory[];
  price: number;
  paymentMethod: 'Cash' | 'M-Pesa' | 'Card';
  issuedAt: string;
  agent: string;
  description: string;
  weight: number;
}

export interface ParcelLifecycleEntry {
  timestamp: string;
  staff: string;
  role: string;
  location: string;
}

export type ParcelLifecycleStage = 0 | 1 | 2 | 3;

export interface ParcelRecord extends ParcelDocumentData {
  activeStage: ParcelLifecycleStage;
  lifecycleEntries: Partial<ParcelLifecycleEntry>[];
}