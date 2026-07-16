import React from 'react';
import { CheckIcon } from 'lucide-react';
import { ParcelLifecycleEntry } from './parcelTypes';
import { cn } from '../lib/utils';
const STAGES = ['Booked', 'Loaded on Vehicle', 'Arrived at Destination Branch', 'Collected by Recipient'];
export function ParcelScanLifecycle({
  activeStage,
  entries,
  variant = 'staff',
  completed = false





}: {activeStage: number;entries: Partial<ParcelLifecycleEntry>[];variant?: 'staff' | 'customer';completed?: boolean;}) {
  return <ol className={cn('grid grid-cols-4', variant === 'staff' ? 'gap-2' : 'gap-1')} aria-label="Parcel scan lifecycle">
      {STAGES.map((stage, index) => {
      const complete = completed ? index <= activeStage : index < activeStage;
      const active = !completed && index === activeStage;
      const entry = entries[index];
      return <li key={stage} className="relative min-w-0">
            {index < STAGES.length - 1 && <span className={cn('absolute left-[calc(50%+12px)] top-3 h-px w-[calc(100%-24px)]', complete ? 'bg-primary' : 'bg-border')} />}
            <div className={cn('relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-xs', complete ? 'border-primary bg-primary text-primary-foreground' : active ? 'border-primary bg-card text-primary ring-4 ring-primary/10' : 'border-border bg-muted text-muted-foreground')}>
              {complete ? <CheckIcon className="h-3.5 w-3.5" /> : index + 1}
            </div>
            <p className={cn('mt-2 pr-1 text-xs leading-tight', active ? 'text-primary' : complete ? 'text-foreground' : 'text-muted-foreground')}>
              {stage}
            </p>
            {variant === 'staff' && entry?.timestamp && <p className="mt-1 pr-1 text-[11px] leading-snug text-muted-foreground">
                {entry.timestamp}
                <br />
                {entry.staff} · {entry.role}
                <br />
                {entry.location}
              </p>}
          </li>;
    })}
    </ol>;
}