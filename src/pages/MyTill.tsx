import React, { useMemo, useState } from 'react';
import { BanknoteIcon, LandmarkIcon, PackageIcon, PaperclipIcon, SmartphoneIcon, TicketIcon, UploadIcon } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Separator } from '../components/ui/primitives';
import { Dialog } from '../components/ui/Modal';
import { tillLineItems } from '../lib/mockData';
import { DEPOSIT_BANK_ACCOUNT } from '../lib/cashDeposits';
import { formatKES } from '../lib/utils';
import { useAuth } from '../lib/auth';
const CASH_COLLECTED = 40000;
export function MyTill() {
  const {
    role,
    cashDeposits,
    submitCashDeposit
  } = useAuth();
  const [depositOpen, setDepositOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [depositDate, setDepositDate] = useState('2026-07-15');
  const [bankReference, setBankReference] = useState('');
  const [receiptName, setReceiptName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const agentDeposits = useMemo(() => cashDeposits.filter((deposit) => deposit.agent === 'Grace Wanjiru' && deposit.branch === 'Nairobi CBD'), [cashDeposits]);
  const depositedTotal = agentDeposits.reduce((total, deposit) => total + deposit.amount, 0);
  const remainingCash = Math.max(0, CASH_COLLECTED - depositedTotal);
  const resetForm = () => {
    setAmount('');
    setDepositDate('2026-07-15');
    setBankReference('');
    setReceiptName('');
    setError('');
  };
  const closeDeposit = () => {
    setDepositOpen(false);
    resetForm();
  };
  const submitDeposit = (event: React.FormEvent) => {
    event.preventDefault();
    const depositAmount = Number(amount);
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      setError('Enter a deposit amount greater than zero.');
      return;
    }
    if (depositAmount > remainingCash) {
      setError(`The deposit cannot exceed the remaining cash balance of ${formatKES(remainingCash)}.`);
      return;
    }
    if (!depositDate || !bankReference.trim() || !receiptName) {
      setError('Add the deposit date, bank reference and receipt attachment.');
      return;
    }
    submitCashDeposit({
      amount: depositAmount,
      depositDate,
      bankReference: bankReference.trim(),
      receiptName
    });
    setSuccess(`${formatKES(depositAmount)} was submitted to finance for bank statement verification.`);
    closeDeposit();
  };
  return <PageContainer>
      <PageHeader title="My Till" subtitle="Grace Wanjiru · Morning shift · opened 06:12" actions={!role?.readOnly && <Button variant="outline">Close &amp; submit session</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Tickets sold" value="18" icon={TicketIcon} />
        <KpiCard label="Parcels booked" value="6" icon={PackageIcon} />
        <KpiCard label="Cash collected" value={formatKES(CASH_COLLECTED)} icon={BanknoteIcon} />
        <KpiCard label="M-Pesa collected" value={formatKES(44500)} icon={SmartphoneIcon} />
      </div>

      {success && <Alert tone="primary" className="flex items-center justify-between gap-4">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} className="text-sm text-primary underline underline-offset-2">
            Dismiss
          </button>
        </Alert>}

      <section aria-labelledby="cash-deposits-heading">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle id="cash-deposits-heading">
                Cash bank deposits
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Deposit counter cash to the designated account, then attach the
                bank receipt for finance review.
              </p>
            </div>
            <Button onClick={() => {
            setError('');
            setDepositOpen(true);
          }} disabled={role?.readOnly || remainingCash === 0}>
              <LandmarkIcon className="h-4 w-4" /> Record bank deposit
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4 rounded-lg border border-primary/20 bg-primary/[0.04] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <LandmarkIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm tracking-wide text-foreground">
                    {DEPOSIT_BANK_ACCOUNT.bankName} ·{' '}
                    {DEPOSIT_BANK_ACCOUNT.accountName}
                  </p>
                  <p className="mt-1 font-mono text-sm text-muted-foreground">
                    Account {DEPOSIT_BANK_ACCOUNT.accountNumber}
                  </p>
                </div>
              </div>
              <div className="md:text-right">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Remaining to deposit
                </p>
                <p className="mt-1 text-xl tabular-nums text-primary">
                  {formatKES(remainingCash)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Cash logged for this session
              </span>
              <span className="tabular-nums text-foreground">
                {formatKES(CASH_COLLECTED)}
              </span>
            </div>
            <Separator />
            {agentDeposits.length === 0 ? <p className="py-2 text-sm text-muted-foreground">
                No bank deposit has been submitted for this till session yet.
              </p> : <div className="divide-y divide-border">
                {agentDeposits.map((deposit) => <div key={deposit.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">
                        {deposit.bankReference} · {formatKES(deposit.amount)}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <PaperclipIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        {deposit.receiptName} · {deposit.depositDate}
                      </p>
                    </div>
                    <DepositBadge status={deposit.status} />
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Session transactions</CardTitle>
          <Badge tone="primary">{tillLineItems.length} of 24 shown</Badge>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-2.5 font-normal">Ref</th>
                  <th className="px-5 py-2.5 font-normal">Type</th>
                  <th className="px-5 py-2.5 font-normal">Detail</th>
                  <th className="px-5 py-2.5 font-normal">Method</th>
                  <th className="px-5 py-2.5 text-right font-normal">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tillLineItems.map((line) => <tr key={line.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3 tabular-nums text-foreground">
                      {line.ref}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={line.type === 'Ticket' ? 'primary' : 'neutral'}>
                        {line.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {line.detail}
                    </td>
                    <td className="px-5 py-3 text-foreground">{line.method}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-foreground">
                      {formatKES(line.amount)}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={depositOpen} onClose={closeDeposit} title="Record bank deposit" description="Use the deposit slip details exactly as recorded by the bank. The receipt name is shared with finance for review.">
        <form onSubmit={submitDeposit} className="space-y-4">
          <div className="rounded-md border border-primary/20 bg-primary/[0.04] p-3 text-sm">
            <p className="text-foreground">
              {DEPOSIT_BANK_ACCOUNT.bankName} ·{' '}
              {DEPOSIT_BANK_ACCOUNT.accountName}
            </p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Account {DEPOSIT_BANK_ACCOUNT.accountNumber}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Amount deposited" htmlFor="deposit-amount">
              <Input id="deposit-amount" type="number" min="1" max={remainingCash} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" inputMode="numeric" />
              <p className="text-xs text-muted-foreground">
                Maximum {formatKES(remainingCash)} from cash collected.
              </p>
            </Field>
            <Field label="Deposit date" htmlFor="deposit-date">
              <Input id="deposit-date" type="date" value={depositDate} onChange={(event) => setDepositDate(event.target.value)} />
            </Field>
          </div>
          <Field label="Bank reference" htmlFor="deposit-reference">
            <Input id="deposit-reference" value={bankReference} onChange={(event) => setBankReference(event.target.value)} placeholder="e.g. KCB-NBO-150726-8241" />
          </Field>
          <Field label="Payment receipt" htmlFor="deposit-receipt">
            <Input id="deposit-receipt" type="file" accept="image/*,.pdf" onChange={(event) => setReceiptName(event.target.files?.[0]?.name ?? '')} className="cursor-pointer py-1.5 file:mr-3 file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:text-primary" />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UploadIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {receiptName ? `${receiptName} attached` : 'PDF or image · file name only in this demo'}
            </p>
          </Field>
          {error && <p role="alert" className="rounded-md border border-danger/25 bg-danger/5 px-3 py-2.5 text-sm text-danger">
              {error}
            </p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeDeposit}>
              Cancel
            </Button>
            <Button type="submit">
              <LandmarkIcon className="h-4 w-4" /> Submit deposit
            </Button>
          </div>
        </form>
      </Dialog>
    </PageContainer>;
}
function DepositBadge({
  status


}: {status: 'Pending verification' | 'Verified';}) {
  return <Badge tone={status === 'Verified' ? 'success' : 'warning'}>{status}</Badge>;
}
function Field({
  label,
  htmlFor,
  children




}: {label: string;htmlFor: string;children: React.ReactNode;}) {
  return <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>;
}