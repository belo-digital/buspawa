import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { DownloadIcon, TrendingUpIcon, TrendingDownIcon, SigmaIcon } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Card, CardHeader, CardTitle, CardContent, Button, Label, Select, Input } from '../components/ui/primitives';
import { reportByBranch, BRANCHES } from '../lib/mockData';
import { formatKES } from '../lib/utils';
import { useAuth } from '../lib/auth';
export function Reports() {
  const {
    role
  } = useAuth();
  const rows = BRANCHES.map((b, i) => {
    const r = reportByBranch[i];
    return {
      branch: b,
      tickets: r.tickets,
      parcels: r.parcels,
      total: r.tickets + r.parcels
    };
  });
  return <PageContainer>
      <PageHeader title="Financial Reports" subtitle="Revenue & expenses across branches" actions={<Button variant="outline">
            <DownloadIcon className="h-4 w-4" /> Export CSV
          </Button>} />

      {/* Filters */}
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label>From</Label>
            <Input type="date" defaultValue="2026-06-15" />
          </div>
          <div className="space-y-1.5">
            <Label>To</Label>
            <Input type="date" defaultValue="2026-07-15" />
          </div>
          <div className="space-y-1.5">
            <Label>Branch</Label>
            <Select>
              <option>All branches</option>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Module</Label>
            <Select>
              <option>All</option>
              <option>Tickets</option>
              <option>Parcels</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Total revenue" value={formatKES(2261000)} delta="+11% vs last period" tone="up" icon={TrendingUpIcon} />
        <KpiCard label="Total expenses" value={formatKES(1840000)} delta="+3% vs last period" tone="down" icon={TrendingDownIcon} />
        <KpiCard label="Net" value={formatKES(421000)} delta="18.6% margin" tone="neutral" icon={SigmaIcon} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by branch &amp; module</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{
              top: 6,
              right: 8,
              left: -8,
              bottom: 0
            }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 15% 92%)" vertical={false} />
                <XAxis dataKey="branch" tick={{
                fontSize: 11,
                fill: 'hsl(215 12% 45%)'
              }} tickLine={false} axisLine={false} />
                <YAxis tick={{
                fontSize: 11,
                fill: 'hsl(215 12% 45%)'
              }} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip contentStyle={{
                borderRadius: 8,
                border: '1px solid hsl(215 15% 90%)',
                fontSize: 12
              }} formatter={(v: number) => formatKES(v)} />
                <Legend wrapperStyle={{
                fontSize: 12
              }} />
                <Bar dataKey="tickets" name="Tickets" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="parcels" name="Parcels" fill="hsl(215 16% 72%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-muted-foreground border-b border-border">
                  <th className="px-5 py-2.5 font-normal">Branch</th>
                  <th className="px-5 py-2.5 font-normal text-right">
                    Tickets
                  </th>
                  <th className="px-5 py-2.5 font-normal text-right">
                    Parcels
                  </th>
                  <th className="px-5 py-2.5 font-normal text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => <tr key={r.branch} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3 text-foreground">{r.branch}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                      {formatKES(r.tickets)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                      {formatKES(r.parcels)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-foreground">
                      {formatKES(r.total)}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>;
}