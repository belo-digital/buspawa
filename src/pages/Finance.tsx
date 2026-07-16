import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangleIcon, CheckIcon, CheckCircle2Icon, CoinsIcon, FileTextIcon, FlagIcon, LandmarkIcon, PaperclipIcon, ScaleIcon } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Separator, Skeleton } from '../components/ui/primitives';
import { Sheet } from '../components/ui/Modal';
import { CashDeposit } from '../lib/cashDeposits';
import { tillSessions, tillLineItems, variance, TillSession } from '../lib/mockData';
import { formatKES, cn } from '../lib/utils';
import { useAuth } from '../lib/auth';
import { BrandLoader } from '../components/BrandLoader';
const THRESHOLD = 1000;
export function Finance() {
  const {
    role,
    cashDeposits,
    verifyCashDeposit
  } = useAuth();
  const readOnly = role?.readOnly;
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<TillSession | null>(null);
  const [activeDeposit, setActiveDeposit] = useState<CashDeposit | null>(null);
  const [statementAmount, setStatementAmount] = useState('');
  const [verificationNote, setVerificationNote] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 850);
    return () => window.clearTimeout(timer);
  }, []);
  const flagged = tillSessions.filter((session) => Math.abs(variance(session)) > THRESHOLD).length;
  const pendingDeposits = cashDeposits.filter((deposit) => deposit.status === 'Pending verification');
  const pendingValue = pendingDeposits.reduce((total, deposit) => total + deposit.amount, 0);
  const statementValue = Number(statementAmount);
  const isStatementAmountPresent = statementAmount.trim() !== '' && Number.isFinite(statementValue);
  const isMatch = Boolean(activeDeposit && isStatementAmountPresent && statementValue === activeDeposit.amount);
  const activeDepositCurrent = useMemo(() => cashDeposits.find((deposit) => deposit.id === activeDeposit?.id) ?? null, [activeDeposit?.id, cashDeposits]);
  const openDeposit = (deposit: CashDeposit) => {
    setActiveDeposit(deposit);
    setStatementAmount(deposit.statementAmount?.toString() ?? '');
    setVerificationNote('');
  };
  const verifyDeposit = () => {
    if (!activeDepositCurrent || !isMatch) return;
    const verified = verifyCashDeposit(activeDepositCurrent.id, statementValue, 'Mary Achieng');
    if (verified) {
      setVerificationNote('Deposit verified against the bank statement.');
    }
  };
  return <PageContainer>
      <PageHeader title="Till Reconciliation" subtitle="Agent sessions · 15 July 2026" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Sessions today" value={String(tillSessions.length)} icon={ScaleIcon} />
        <KpiCard label="Combined expected" value={formatKES(tillSessions.reduce((total, session) => total + session.expected, 0))} icon={CoinsIcon} />
        <KpiCard label="Variance flags" value={String(flagged)} delta="Beyond KES 1,000" tone="down" icon={AlertTriangleIcon} />
        <KpiCard label="Pending bank deposits" value={formatKES(pendingValue)} delta={`${pendingDeposits.length} awaiting statement match`} tone="neutral" icon={LandmarkIcon} />
      </div>

      <section aria-labelledby="deposit-reconciliation-heading">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle id="deposit-reconciliation-heading">
                Cash deposit reconciliation
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Review agent-submitted receipts against the banking statement
                before verifying a deposit.
              </p>
            </div>
            <Badge tone="outline">{cashDeposits.length} submissions</Badge>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-5 py-2.5 font-normal">Agent / session</th>
                    <th className="px-5 py-2.5 font-normal">Deposit account</th>
                    <th className="px-5 py-2.5 font-normal text-right">
                      Recorded amount
                    </th>
                    <th className="px-5 py-2.5 font-normal">Receipt</th>
                    <th className="px-5 py-2.5 font-normal">
                      Reference / date
                    </th>
                    <th className="px-5 py-2.5 font-normal">Status</th>
                    <th className="px-5 py-2.5 text-right font-normal">
                      Review
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cashDeposits.map((deposit) => <tr key={deposit.id} className="transition-colors hover:bg-muted/50 focus-within:bg-muted/50">
                      <td className="px-5 py-3">
                        <p className="text-foreground">{deposit.agent}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {deposit.branch} · {deposit.session}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-foreground">{deposit.bankName}</p>
                        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                          {deposit.accountNumber}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-foreground">
                        {formatKES(deposit.amount)}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        <span className="flex min-w-[150px] items-center gap-1.5">
                          <PaperclipIcon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          <span className="truncate">
                            {deposit.receiptName}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-mono text-xs text-foreground">
                          {deposit.bankReference}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {deposit.depositDate}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <DepositBadge status={deposit.status} />
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openDeposit(deposit)} aria-label={`Review bank deposit from ${deposit.agent}`}>
                          Review
                        </Button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agent till sessions</CardTitle>
          {loading && <BrandLoader label="Loading till sessions" />}
        </CardHeader>
        <CardContent className="px-0">
          {loading ? <div className="space-y-2 px-5">
              {Array.from({
            length: 5
          }).map((_, index) => <Skeleton key={index} className="h-11 w-full" />)}
            </div> : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-5 py-2.5 font-normal">Agent</th>
                    <th className="px-5 py-2.5 font-normal">Branch</th>
                    <th className="px-5 py-2.5 font-normal">Shift</th>
                    <th className="px-5 py-2.5 text-right font-normal">
                      Expected
                    </th>
                    <th className="px-5 py-2.5 text-right font-normal">Cash</th>
                    <th className="px-5 py-2.5 text-right font-normal">
                      M-Pesa
                    </th>
                    <th className="px-5 py-2.5 text-right font-normal">
                      Variance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tillSessions.map((session) => {
                const sessionVariance = variance(session);
                const varianceFlagged = Math.abs(sessionVariance) > THRESHOLD;
                return <tr key={session.id} onClick={() => setActiveSession(session)} className="cursor-pointer transition-colors hover:bg-muted/50">
                        <td className="px-5 py-3 text-foreground">
                          {session.agent}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {session.branch}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {session.date} · {session.shift}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-foreground">
                          {formatKES(session.expected)}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                          {formatKES(session.cash)}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                          {formatKES(session.mpesa)}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={cn('tabular-nums', varianceFlagged ? sessionVariance < 0 ? 'text-danger' : 'text-warning' : 'text-success')}>
                            {sessionVariance > 0 ? '+' : ''}
                            {formatKES(sessionVariance)}
                          </span>
                        </td>
                      </tr>;
              })}
                </tbody>
              </table>
            </div>}
        </CardContent>
      </Card>

      <Sheet open={!!activeDepositCurrent} onClose={() => setActiveDeposit(null)} title={activeDepositCurrent ? `${activeDepositCurrent.agent} · bank deposit` : ''}>
        {activeDepositCurrent && <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-foreground">
                  {activeDepositCurrent.branch} · {activeDepositCurrent.session}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted cash deposit
                </p>
              </div>
              <DepositBadge status={activeDepositCurrent.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Agent recorded" value={formatKES(activeDepositCurrent.amount)} />
              <Stat label="Deposit date" value={activeDepositCurrent.depositDate} />
              <Stat label="Bank" value={activeDepositCurrent.bankName} />
              <Stat label="Account" value={activeDepositCurrent.accountNumber} mono />
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">Bank reference</p>
              <p className="mt-1 font-mono text-sm text-foreground">
                {activeDepositCurrent.bankReference}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm text-foreground">
              <FileTextIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">
                {activeDepositCurrent.receiptName}
              </span>
              <Badge tone="outline">Attached</Badge>
            </div>
            <Separator />
            {activeDepositCurrent.status === 'Verified' ? <div className="rounded-md border border-success/30 bg-success/5 p-4">
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" />
                  Verified against banking statement
                </div>
                <p className="mt-2 text-sm text-foreground">
                  Statement amount:{' '}
                  {formatKES(activeDepositCurrent.statementAmount ?? activeDepositCurrent.amount)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeDepositCurrent.verifiedBy} ·{' '}
                  {activeDepositCurrent.verifiedAt}
                </p>
              </div> : <div className="space-y-3">
                <div>
                  <Label htmlFor="statement-amount">
                    Amount found on banking statement
                  </Label>
                  <Input id="statement-amount" type="number" min="0" value={statementAmount} onChange={(event) => {
              setStatementAmount(event.target.value);
              setVerificationNote('');
            }} disabled={readOnly} className="mt-1.5" inputMode="numeric" placeholder="Enter amount from statement" />
                </div>
                {isStatementAmountPresent && <div className={cn('rounded-md border px-3 py-2.5 text-sm', isMatch ? 'border-success/30 bg-success/5 text-success' : 'border-danger/30 bg-danger/5 text-danger')}>
                    {isMatch ? 'Statement amount matches the agent’s recorded deposit.' : `Does not match the recorded ${formatKES(activeDepositCurrent.amount)}.`}
                  </div>}
                {verificationNote && <div role="status" className="rounded-md border border-success/30 bg-success/5 px-3 py-2.5 text-sm text-success">
                    {verificationNote}
                  </div>}
                {!readOnly && <Button className="w-full" disabled={!isMatch} onClick={verifyDeposit}>
                    <CheckIcon className="h-4 w-4" /> Mark verified
                  </Button>}
              </div>}
          </div>}
      </Sheet>

      <Sheet open={!!activeSession} onClose={() => setActiveSession(null)} title={activeSession ? `${activeSession.agent} · session breakdown` : ''}>
        {activeSession && <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Expected" value={formatKES(activeSession.expected)} />
              <Stat label="Collected" value={formatKES(activeSession.cash + activeSession.mpesa)} />
              <Stat label="Cash" value={formatKES(activeSession.cash)} />
              <Stat label="M-Pesa" value={formatKES(activeSession.mpesa)} />
            </div>
            <div className={cn('rounded-md border px-4 py-3 text-sm', Math.abs(variance(activeSession)) > THRESHOLD ? 'border-danger/30 bg-danger/5' : 'border-success/30 bg-success/5')}>
              Variance:{' '}
              <span className="tabular-nums">
                {variance(activeSession) > 0 ? '+' : ''}
                {formatKES(variance(activeSession))}
              </span>
            </div>
            <Separator />
            <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Itemized transactions
            </div>
            <div className="space-y-2">
              {tillLineItems.map((line) => <div key={line.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                  <div>
                    <div className="text-sm text-foreground">
                      {line.ref} ·{' '}
                      <Badge tone={line.type === 'Ticket' ? 'primary' : 'neutral'}>
                        {line.type}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {line.detail} · {line.method}
                    </div>
                  </div>
                  <div className="tabular-nums text-sm text-foreground">
                    {formatKES(line.amount)}
                  </div>
                </div>)}
            </div>
            {!readOnly && <div className="flex gap-2 pt-2">
                <Button className="flex-1">
                  <CheckIcon className="h-4 w-4" /> Approve
                </Button>
                <Button variant="outline" className="flex-1 border-danger/40 text-danger hover:bg-danger/5">
                  <FlagIcon className="h-4 w-4" /> Flag for review
                </Button>
              </div>}
          </div>}
      </Sheet>
    </PageContainer>;
}
function DepositBadge({
  status


}: {status: CashDeposit['status'];}) {
  return <Badge tone={status === 'Verified' ? 'success' : 'warning'}>{status}</Badge>;
}
function Stat({
  label,
  value,
  mono = false




}: {label: string;value: string;mono?: boolean;}) {
  return <div className="rounded-md border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn('mt-1 text-sm text-foreground', mono && 'font-mono text-xs')}>
        {value}
      </div>
    </div>;
}