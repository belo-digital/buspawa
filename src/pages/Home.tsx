import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheckIcon, MapPinIcon, PackageCheckIcon, PackagePlusIcon, TicketPlusIcon } from 'lucide-react';
import { AgentQuickActionCard } from '../components/AgentQuickActionCard';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components/ui/primitives';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
type ActivityStatus = 'issued' | 'booked' | 'received' | 'ready';
interface AgentActivity {
  reference: string;
  description: string;
  time: string;
  status: ActivityStatus;
}
export function Home() {
  const navigate = useNavigate();
  const {
    branch,
    role,
    assignedStation
  } = useAuth();
  const readOnly = Boolean(role?.readOnly);
  const activity = useMemo(() => getAgentActivity(branch), [branch]);
  const actions = [{
    title: 'New Ticket',
    description: 'Start a counter ticket sale',
    icon: TicketPlusIcon,
    path: '/app/ticketing?new=1',
    emphasis: 'primary' as const
  }, {
    title: 'New Parcel',
    description: 'Book and issue a parcel waybill',
    icon: PackagePlusIcon,
    path: '/app/parcels?view=booking&new=1',
    emphasis: 'standard' as const
  }, {
    title: 'Receive Parcel',
    description: 'Log an inbound parcel after transit',
    icon: PackageCheckIcon,
    path: '/app/parcels?view=handoffs&action=receive',
    emphasis: 'standard' as const
  }, {
    title: 'Release Parcel',
    description: 'Verify and release a ready parcel',
    icon: ClipboardCheckIcon,
    path: '/app/parcels?view=handoffs&action=release',
    emphasis: 'standard' as const
  }];
  return <PageContainer>
      <PageHeader title="Home" subtitle={`Counter workspace · ${branch}`} actions={<Badge tone="primary" className="gap-1.5 px-3 py-1">
            <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {assignedStation ? 'Assigned station' : 'Active station'} · {branch}
          </Badge>} />

      <section aria-labelledby="quick-actions-heading">
        <div className="mb-4">
          <h2 id="quick-actions-heading" className="text-lg tracking-wide text-foreground">
            Start an action
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tickets and parcel handoffs are recorded against {branch}.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => <AgentQuickActionCard key={action.title} title={action.title} description={action.description} icon={action.icon} emphasis={action.emphasis} disabled={readOnly} onClick={() => navigate(action.path)} />)}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]" aria-labelledby="recent-activity-heading">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle id="recent-activity-heading">
                Recent activity
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {branch} counter activity · today
              </p>
            </div>
            <Badge tone="outline">{activity.length} updates</Badge>
          </CardHeader>
          <CardContent className="px-0">
            <div className="divide-y divide-border">
              {activity.map((item) => <div key={item.reference} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', ACTIVITY_DOT[item.status])} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm tracking-wide text-foreground">
                      {item.reference}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <ActivityBadge status={item.status} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </div>)}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit border-primary/20 bg-primary/[0.03]">
          <CardHeader>
            <CardTitle>Today at the counter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CounterStat label="Tickets issued" value="18" />
            <CounterStat label="Parcels booked" value="6" />
            <CounterStat label="Inbound to process" value="2" />
            <div className="border-t border-primary/15 pt-4 text-sm text-muted-foreground">
              Keep parcel labels and recipient verification details ready before
              handoff.
            </div>
          </CardContent>
        </Card>
      </section>
    </PageContainer>;
}
function ActivityBadge({
  status


}: {status: ActivityStatus;}) {
  const tone = status === 'received' ? 'success' : status === 'ready' ? 'primary' : status === 'issued' ? 'primary' : 'neutral';
  const label = status === 'issued' ? 'Ticket issued' : status === 'booked' ? 'Parcel booked' : status === 'received' ? 'Received' : 'Ready to release';
  return <Badge tone={tone}>{label}</Badge>;
}
function CounterStat({
  label,
  value



}: {label: string;value: string;}) {
  return <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-lg tabular-nums text-foreground">{value}</span>
    </div>;
}
const ACTIVITY_DOT: Record<ActivityStatus, string> = {
  issued: 'bg-primary',
  booked: 'bg-muted-foreground',
  received: 'bg-success',
  ready: 'bg-warning'
};
function getAgentActivity(branch: string): AgentActivity[] {
  if (branch === 'Nairobi CBD') {
    return [{
      reference: 'PCL-11840',
      description: 'Documents from Mombasa received at Nairobi CBD',
      time: '07:35',
      status: 'received'
    }, {
      reference: 'TKT-40923',
      description: 'Nairobi → Eldoret · Seat 12 · Cash',
      time: '07:28',
      status: 'issued'
    }, {
      reference: 'PCL-11843',
      description: 'Medical supplies from Kisumu ready for A. Njoroge',
      time: '07:18',
      status: 'ready'
    }, {
      reference: 'PCL-11841',
      description: 'Electronics to Mombasa · 6 kg · M-Pesa',
      time: '06:50',
      status: 'booked'
    }, {
      reference: 'TKT-40922',
      description: 'Nairobi → Kisumu · Seat 9 · Cash',
      time: '06:42',
      status: 'issued'
    }];
  }
  return [{
    reference: 'TKT-40921',
    description: `${branch} counter ticket issued · M-Pesa`,
    time: '07:30',
    status: 'issued'
  }, {
    reference: 'PCL-11844',
    description: `Inbound parcel received at ${branch}`,
    time: '07:12',
    status: 'received'
  }, {
    reference: 'PCL-11845',
    description: 'Parcel booking completed · Express service',
    time: '06:54',
    status: 'booked'
  }, {
    reference: 'PCL-11846',
    description: 'Recipient verification pending release',
    time: '06:31',
    status: 'ready'
  }];
}