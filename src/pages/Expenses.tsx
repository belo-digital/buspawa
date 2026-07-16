import React from 'react';
import { ReceiptIcon, PlusIcon } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '../components/ui/primitives';
import { formatKES } from '../lib/utils';
import { useAuth } from '../lib/auth';
const expenses = [{
  id: 'x1',
  date: '15 Jul',
  category: 'Fuel',
  vendor: 'Total Energies',
  branch: 'Nairobi CBD',
  amount: 128000,
  status: 'paid',
  compliance: false
}, {
  id: 'x2',
  date: '14 Jul',
  category: 'NTSA inspection fee',
  vendor: 'NTSA',
  branch: 'Mombasa',
  amount: 7500,
  status: 'paid',
  compliance: true
}, {
  id: 'x3',
  date: '14 Jul',
  category: 'Insurance premium',
  vendor: 'Jubilee',
  branch: 'All branches',
  amount: 245000,
  status: 'pending',
  compliance: true
}, {
  id: 'x4',
  date: '13 Jul',
  category: 'Maintenance',
  vendor: 'Simba Corp',
  branch: 'Kisumu',
  amount: 54200,
  status: 'paid',
  compliance: false
}, {
  id: 'x5',
  date: '12 Jul',
  category: 'PSV badge renewal',
  vendor: 'NTSA',
  branch: 'Nakuru',
  amount: 3000,
  status: 'overdue',
  compliance: true
}];
export function Expenses() {
  const {
    role
  } = useAuth();
  const statusTone = {
    paid: 'success',
    pending: 'warning',
    overdue: 'danger'
  } as const;
  return <PageContainer>
      <PageHeader title="Expenses" subtitle="Operational & compliance-linked costs" actions={!role?.readOnly && <Button>
              <PlusIcon className="h-4 w-4" /> Record expense
            </Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total expenses (MTD)" value={formatKES(1840000)} icon={ReceiptIcon} />
        <KpiCard label="Compliance-linked" value={formatKES(263500)} delta="14% of total" tone="neutral" />
        <KpiCard label="Pending / overdue" value="2" delta={formatKES(248000)} tone="down" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent expenses</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-muted-foreground border-b border-border">
                  <th className="px-5 py-2.5 font-normal">Date</th>
                  <th className="px-5 py-2.5 font-normal">Category</th>
                  <th className="px-5 py-2.5 font-normal">Vendor</th>
                  <th className="px-5 py-2.5 font-normal">Branch</th>
                  <th className="px-5 py-2.5 font-normal text-right">Amount</th>
                  <th className="px-5 py-2.5 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((x) => <tr key={x.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3 text-muted-foreground">
                      {x.date}
                    </td>
                    <td className="px-5 py-3 text-foreground flex items-center gap-2">
                      {x.category}{' '}
                      {x.compliance && <Badge tone="primary">Compliance</Badge>}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {x.vendor}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {x.branch}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-foreground">
                      {formatKES(x.amount)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={statusTone[x.status as keyof typeof statusTone]}>
                        {x.status}
                      </Badge>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>;
}