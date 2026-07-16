import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CoinsIcon, RouteIcon, ShieldCheckIcon, FlagIcon, AlertTriangleIcon } from 'lucide-react';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Card, CardHeader, CardTitle, CardContent, Skeleton, Badge, Separator } from '../components/ui/primitives';
import { ComplianceBadge } from '../components/StatusBadge';
import { revenueTrend, branchPerformance, complianceAlerts } from '../lib/mockData';
import { formatKES } from '../lib/utils';
import { BrandLoader } from '../components/BrandLoader';
export function Dashboard() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);
  return <PageContainer>
      <PageHeader title="Overview" subtitle="Cross-branch performance · 15 July 2026" />

      {/* KPIs */}
      {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BrandLoader label="Loading overview" /> Loading overview…
        </div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? Array.from({
        length: 4
      }).map((_, i) => <Card key={i} className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-20" />
            </Card>) : <>
            <KpiCard label="Today's Revenue" value={formatKES(2316000)} delta="+8.2% vs yesterday" tone="up" icon={CoinsIcon} />
            <KpiCard label="Active Trips Now" value="14" delta="3 departing < 1hr" tone="neutral" icon={RouteIcon} />
            <KpiCard label="Fleet Compliance" value="86%" delta="-4% this week" tone="down" icon={ShieldCheckIcon} />
            <KpiCard label="Till Variance Flags" value="2" delta="Pending review" tone="neutral" icon={FlagIcon} />
          </>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue trend */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue trend</CardTitle>
            <Badge tone="outline">Last 30 days</Badge>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend} margin={{
                top: 6,
                right: 8,
                left: -12,
                bottom: 0
              }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 15% 92%)" vertical={false} />
                    <XAxis dataKey="day" tick={{
                  fontSize: 11,
                  fill: 'hsl(215 12% 45%)'
                }} tickLine={false} axisLine={false} interval={5} />
                    <YAxis tick={{
                  fontSize: 11,
                  fill: 'hsl(215 12% 45%)'
                }} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip contentStyle={{
                  borderRadius: 8,
                  border: '1px solid hsl(215 15% 90%)',
                  fontSize: 12
                }} formatter={(v: number) => [formatKES(v), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="hsl(var(--primary))" fillOpacity={0.12} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>}
          </CardContent>
        </Card>

        {/* Compliance alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Compliance alerts</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent className="space-y-0">
            {loading ? <div className="space-y-3">
                {Array.from({
              length: 4
            }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div> : <div className="divide-y divide-border -mx-5">
                {complianceAlerts.map((a) => <div key={a.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="text-sm text-foreground truncate">
                        {a.type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {a.vehicle} · {a.detail}
                      </div>
                    </div>
                    <Badge tone={a.severity === 'danger' ? 'danger' : 'warning'}>
                      {a.due}
                    </Badge>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Branch performance */}
      <Card>
        <CardHeader>
          <CardTitle>Branch performance</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {loading ? <div className="space-y-2 px-5">
              {Array.from({
            length: 5
          }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div> : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-muted-foreground border-b border-border">
                    <th className="px-5 py-2.5 font-normal">Branch</th>
                    <th className="px-5 py-2.5 font-normal text-right">
                      Revenue
                    </th>
                    <th className="px-5 py-2.5 font-normal text-right">
                      Trips
                    </th>
                    <th className="px-5 py-2.5 font-normal">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {branchPerformance.map((b) => <tr key={b.branch} className="hover:bg-muted/50 transition-colors">
                      <td className="px-5 py-3 text-foreground">{b.branch}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-foreground">
                        {formatKES(b.revenue)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                        {b.trips}
                      </td>
                      <td className="px-5 py-3">
                        <ComplianceBadge state={b.compliance} />
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
        </CardContent>
      </Card>
    </PageContainer>;
}