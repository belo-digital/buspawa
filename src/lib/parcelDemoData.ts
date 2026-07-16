import { ParcelRecord } from '../components/parcelTypes';

export const DEMO_PARCELS: ParcelRecord[] = [
{
  tracking: 'PCL-11840',
  senderName: 'Abdi Hassan',
  senderPhone: '0712 555 802',
  receiverName: 'Amina Hassan',
  receiverPhone: '0724 210 641',
  origin: 'Mombasa',
  destination: 'Nairobi CBD',
  categories: ['Express'],
  price: 450,
  paymentMethod: 'M-Pesa',
  issuedAt: '15 Jul 2026 · 06:35',
  agent: 'Aisha Noor',
  description: 'Documents',
  weight: 2,
  activeStage: 1,
  lifecycleEntries: [
  {
    timestamp: '15 Jul 2026 · 06:35',
    staff: 'Aisha Noor',
    role: 'Booking agent',
    location: 'Mombasa'
  },
  {
    timestamp: '15 Jul 2026 · 07:10',
    staff: 'Peter Kamau',
    role: 'Conductor',
    location: 'Mombasa'
  },
  {},
  {}]

},
{
  tracking: 'PCL-11843',
  senderName: 'Caleb Okoth',
  senderPhone: '0710 332 118',
  receiverName: 'Alice Njoroge',
  receiverPhone: '0722 901 765',
  origin: 'Kisumu',
  destination: 'Nairobi CBD',
  categories: ['Express'],
  price: 720,
  paymentMethod: 'Cash',
  issuedAt: '15 Jul 2026 · 06:15',
  agent: 'John Otieno',
  description: 'Medical supplies',
  weight: 4,
  activeStage: 2,
  lifecycleEntries: [
  {
    timestamp: '15 Jul 2026 · 06:15',
    staff: 'John Otieno',
    role: 'Booking agent',
    location: 'Kisumu'
  },
  {
    timestamp: '15 Jul 2026 · 06:40',
    staff: 'Peter Kamau',
    role: 'Conductor',
    location: 'Kisumu'
  },
  {
    timestamp: '15 Jul 2026 · 07:18',
    staff: 'Grace Wanjiru',
    role: 'Booking agent',
    location: 'Nairobi CBD'
  },
  {}]

},
{
  tracking: 'PCL-11841',
  senderName: 'Rose Owino',
  senderPhone: '0704 109 622',
  receiverName: 'Brian Omondi',
  receiverPhone: '0718 884 290',
  origin: 'Nairobi CBD',
  destination: 'Mombasa',
  categories: ['Fragile', 'High-Value'],
  price: 1100,
  paymentMethod: 'M-Pesa',
  issuedAt: '15 Jul 2026 · 06:50',
  agent: 'Grace Wanjiru',
  description: 'Electronics',
  weight: 6,
  activeStage: 1,
  lifecycleEntries: [
  {
    timestamp: '15 Jul 2026 · 06:50',
    staff: 'Grace Wanjiru',
    role: 'Booking agent',
    location: 'Nairobi CBD'
  },
  {
    timestamp: '15 Jul 2026 · 07:20',
    staff: 'Peter Kamau',
    role: 'Conductor',
    location: 'Nairobi CBD'
  },
  {},
  {}]

}];