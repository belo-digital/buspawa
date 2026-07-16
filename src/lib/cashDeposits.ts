export type DepositStatus = 'Pending verification' | 'Verified';

export interface CashDeposit {
  id: string;
  agent: string;
  branch: string;
  session: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  amount: number;
  depositDate: string;
  bankReference: string;
  receiptName: string;
  status: DepositStatus;
  statementAmount?: number;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface CashDepositDraft {
  amount: number;
  depositDate: string;
  bankReference: string;
  receiptName: string;
}

export const DEPOSIT_BANK_ACCOUNT = {
  bankName: 'KCB Bank',
  accountName: 'BusPawa Operations Collection Account',
  accountNumber: '1102846397'
};

export const INITIAL_CASH_DEPOSITS: CashDeposit[] = [
{
  id: 'dep-001',
  agent: 'Peter Kamau',
  branch: 'Nairobi CBD',
  session: '15 Jul · Morning',
  ...DEPOSIT_BANK_ACCOUNT,
  amount: 22000,
  depositDate: '2026-07-15',
  bankReference: 'KCB-NBO-150726-8241',
  receiptName: 'KCB-deposit-8241.pdf',
  status: 'Pending verification'
},
{
  id: 'dep-002',
  agent: 'Aisha Noor',
  branch: 'Mombasa',
  session: '15 Jul · Morning',
  ...DEPOSIT_BANK_ACCOUNT,
  amount: 26000,
  depositDate: '2026-07-15',
  bankReference: 'KCB-MSA-150726-1189',
  receiptName: 'KCB-deposit-1189.jpg',
  status: 'Verified',
  statementAmount: 26000,
  verifiedBy: 'Mary Achieng',
  verifiedAt: '15 Jul 2026 · 08:10'
},
{
  id: 'dep-003',
  agent: 'John Otieno',
  branch: 'Kisumu',
  session: '15 Jul · Afternoon',
  ...DEPOSIT_BANK_ACCOUNT,
  amount: 18000,
  depositDate: '2026-07-15',
  bankReference: 'KCB-KSM-150726-6410',
  receiptName: 'counter-deposit-6410.pdf',
  status: 'Pending verification'
}];