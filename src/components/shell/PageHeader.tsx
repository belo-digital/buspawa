import React from 'react';
import { useAuth } from '../../lib/auth';
import { Alert } from '../ui/primitives';
import { EyeIcon } from 'lucide-react';
export function PageHeader({
  title,
  subtitle,
  actions




}: {title: string;subtitle?: string;actions?: React.ReactNode;}) {
  const {
    role
  } = useAuth();
  return <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl tracking-wide text-foreground">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {role?.readOnly && <Alert tone="primary" className="flex items-center gap-2">
          <EyeIcon className="h-4 w-4 text-primary" />
          <span>
            You are signed in as{' '}
            <strong className="tracking-wide">Auditor</strong> — this module is
            read-only. Actions are disabled.
          </span>
        </Alert>}
    </div>;
}
export function PageContainer({
  children


}: {children: React.ReactNode;}) {
  return <div className="mx-auto w-full max-w-[1400px] p-4 sm:p-6 space-y-6">
      {children}
    </div>;
}