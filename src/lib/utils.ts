import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKES(amount: number): string {
  return 'KES ' + amount.toLocaleString('en-KE', { maximumFractionDigits: 0 });
}