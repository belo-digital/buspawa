import React from 'react';
import { Badge } from './ui/primitives';
type DocState = 'ok' | 'soon' | 'expired';
const DOC_MAP: Record<DocState, {
  tone: 'success' | 'warning' | 'danger';
  label: string;
}> = {
  ok: {
    tone: 'success',
    label: 'Valid'
  },
  soon: {
    tone: 'warning',
    label: 'Expiring'
  },
  expired: {
    tone: 'danger',
    label: 'Expired'
  }
};
export function DocBadge({
  state,
  label



}: {state: DocState;label: string;}) {
  const m = DOC_MAP[state];
  return <Badge tone={m.tone} title={`${label}: ${m.label}`}>
      {label}
    </Badge>;
}
export function ComplianceBadge({
  state


}: {state: 'compliant' | 'warning' | 'breach';}) {
  const map = {
    compliant: {
      tone: 'success' as const,
      label: 'Compliant'
    },
    warning: {
      tone: 'warning' as const,
      label: 'Watch'
    },
    breach: {
      tone: 'danger' as const,
      label: 'Breach'
    }
  };
  return <Badge tone={map[state].tone}>{map[state].label}</Badge>;
}