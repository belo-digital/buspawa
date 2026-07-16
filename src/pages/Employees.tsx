import React, { useState } from 'react';
import { UsersIcon } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar, Separator, Progress } from '../components/ui/primitives';
import { Sheet } from '../components/ui/Modal';
import { DocBadge } from '../components/StatusBadge';
import { employees, Employee } from '../lib/mockData';
const ATT_TONE = {
  present: 'success',
  leave: 'warning',
  absent: 'danger'
} as const;
export function Employees() {
  const [active, setActive] = useState<Employee | null>(null);
  return <PageContainer>
      <PageHeader title="Employees" subtitle="Staff directory & compliance" />

      <Card>
        <CardHeader>
          <CardTitle>Staff directory</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-muted-foreground border-b border-border">
                  <th className="px-5 py-2.5 font-normal">Name</th>
                  <th className="px-5 py-2.5 font-normal">Role</th>
                  <th className="px-5 py-2.5 font-normal">Branch</th>
                  <th className="px-5 py-2.5 font-normal">Compliance doc</th>
                  <th className="px-5 py-2.5 font-normal">Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((e) => <tr key={e.id} onClick={() => setActive(e)} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={e.name} className="h-8 w-8 text-xs" />
                        <span className="text-foreground">{e.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="outline">{e.role}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {e.branch}
                    </td>
                    <td className="px-5 py-3">
                      <DocBadge state={e.docStatus} label={e.docLabel} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={ATT_TONE[e.attendance]}>
                        {e.attendance}
                      </Badge>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!active} onClose={() => setActive(null)} title={active ? active.name : ''}>
        {active && <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={active.name} className="h-14 w-14 text-lg" />
              <div>
                <div className="text-lg tracking-wide text-foreground">
                  {active.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {active.role} · {active.branch}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" value="07xx 123 456" />
              <Field label="ID number" value="288••••••" />
              <Field label="Attendance" value={active.attendance} />
              <Field label="Compliance" value={active.docLabel} />
            </div>

            <Separator />
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Leave balance</span>
                <span className="tabular-nums text-foreground">
                  14 / 21 days
                </span>
              </div>
              <Progress value={14 / 21 * 100} />
            </div>

            <Separator />
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Documents
              </div>
              <div className="space-y-2">
                {['PSV badge', 'National ID', 'Employment contract'].map((d) => <div key={d} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                      <span className="text-foreground">{d}</span>
                      <Badge tone="neutral">On file</Badge>
                    </div>)}
              </div>
            </div>

            <Separator />
            <div>
              <div className="mb-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Performance summary
              </div>
              <div className="rounded-md border border-border p-3 text-sm text-muted-foreground">
                On-time rate <span className="text-foreground">96%</span> · Zero
                variance flags this quarter · Commended by branch manager.
              </div>
            </div>
          </div>}
      </Sheet>
    </PageContainer>;
}
function Field({
  label,
  value



}: {label: string;value: string;}) {
  return <div className="rounded-md border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-foreground capitalize">{value}</div>
    </div>;
}