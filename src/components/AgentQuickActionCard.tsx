import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { cn } from '../lib/utils';
export interface AgentQuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  disabled?: boolean;
  emphasis?: 'primary' | 'standard';
}
export function AgentQuickActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  disabled = false,
  emphasis = 'standard'
}: AgentQuickActionCardProps) {
  return <button type="button" onClick={onClick} disabled={disabled} className={cn('group flex min-h-[168px] w-full flex-col rounded-lg border p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', emphasis === 'primary' ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90' : 'border-border bg-card hover:border-primary')}>
      <span className={cn('flex h-11 w-11 items-center justify-center rounded-md', emphasis === 'primary' ? 'bg-white/15 text-primary-foreground' : 'bg-primary/10 text-primary')}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="mt-5 flex w-full items-end justify-between gap-3">
        <span>
          <span className="block text-lg tracking-wide">{title}</span>
          <span className={cn('mt-1 block text-sm leading-snug', emphasis === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
            {description}
          </span>
        </span>
        <ArrowRightIcon className={cn('mb-0.5 h-5 w-5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5', emphasis === 'primary' ? 'text-primary-foreground' : 'text-primary')} aria-hidden="true" />
      </span>
    </button>;
}