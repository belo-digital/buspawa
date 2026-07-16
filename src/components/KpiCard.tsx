import React from 'react';
import { ArrowUpRightIcon, ArrowDownRightIcon, BoxIcon } from 'lucide-react';
import { Card } from './ui/primitives';
import { cn } from '../lib/utils';
export function KpiCard({
  label,
  value,
  delta,
  tone = 'neutral',
  icon: Icon






}: {label: string;value: string;delta?: string;tone?: 'up' | 'down' | 'neutral';icon?: BoxIcon;}) {
  return <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm tracking-wide text-muted-foreground">
          {label}
        </span>
        {Icon && <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/8 text-primary">
            <Icon className="h-4 w-4" />
          </span>}
      </div>
      <div className="mt-3 text-[26px] leading-none tracking-wide text-foreground tabular-nums">
        {value}
      </div>
      {delta && <div className={cn('mt-2 flex items-center gap-1 text-xs', tone === 'up' && 'text-success', tone === 'down' && 'text-danger', tone === 'neutral' && 'text-muted-foreground')}>
          {tone === 'up' && <ArrowUpRightIcon className="h-3.5 w-3.5" />}
          {tone === 'down' && <ArrowDownRightIcon className="h-3.5 w-3.5" />}
          <span>{delta}</span>
        </div>}
    </Card>;
}