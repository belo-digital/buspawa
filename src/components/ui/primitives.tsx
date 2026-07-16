import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
// ---------- Card ----------
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-border bg-card', className)} {...props} />;
}
export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pt-5 pb-3', className)} {...props} />;
}
export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[15px] tracking-wide text-foreground', className)} {...props} />;
}
export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...props} />;
}
export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 pb-5', className)} {...props} />;
}
// ---------- Button ----------
type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'subtle';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props



}: React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: ButtonVariant;size?: ButtonSize;}) {
  const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-transparent hover:bg-muted text-foreground',
    ghost: 'hover:bg-muted text-foreground',
    danger: 'bg-danger text-white hover:bg-danger/90',
    subtle: 'bg-muted text-foreground hover:bg-muted/70'
  };
  const sizes: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-[15px]',
    icon: 'h-9 w-9'
  };
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-md tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none', variants[variant], sizes[size], className)} {...props} />;
}
// ---------- Input ----------
export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({
  className,
  ...props
}, ref) => <input ref={ref} className={cn('flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:opacity-50', className)} {...props} />);
Input.displayName = 'Input';
// ---------- Label ----------
export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('text-sm text-muted-foreground tracking-wide', className)} {...props} />;
}
// ---------- Select (native, styled) ----------
export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('flex h-9 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)} {...props} />;
}
// ---------- Badge ----------
type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
export function Badge({
  className,
  tone = 'neutral',
  ...props


}: React.HTMLAttributes<HTMLSpanElement> & {tone?: BadgeTone;}) {
  const tones: Record<BadgeTone, string> = {
    neutral: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/15 text-warning',
    danger: 'bg-danger/10 text-danger',
    outline: 'border border-border text-muted-foreground'
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs tracking-wide whitespace-nowrap', tones[tone], className)} {...props} />;
}
// ---------- Separator ----------
export function Separator({
  className,
  orientation = 'horizontal'



}: {className?: string;orientation?: 'horizontal' | 'vertical';}) {
  return <div className={cn('bg-border shrink-0', orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full', className)} />;
}
// ---------- Avatar ----------
export function Avatar({
  name,
  className



}: {name: string;className?: string;}) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  return <div className={cn('flex items-center justify-center rounded-full bg-primary/12 text-primary text-sm select-none', className || 'h-9 w-9')}>
      {initials}
    </div>;
}
// ---------- Progress ----------
export function Progress({
  value,
  className,
  tone = 'primary'




}: {value: number;className?: string;tone?: 'primary' | 'success' | 'warning' | 'danger';}) {
  const tones = {
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger'
  };
  return <div className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div className={cn('h-full rounded-full transition-all duration-300', tones[tone])} style={{
      width: `${Math.min(100, Math.max(0, value))}%`
    }} />
    </div>;
}
// ---------- Skeleton ----------
export function Skeleton({
  className


}: {className?: string;}) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}
// ---------- Alert ----------
export function Alert({
  className,
  tone = 'warning',
  children




}: {className?: string;tone?: 'warning' | 'danger' | 'primary';children: React.ReactNode;}) {
  const tones = {
    warning: 'border-warning/30 bg-warning/10 text-foreground',
    danger: 'border-danger/30 bg-danger/10 text-foreground',
    primary: 'border-primary/30 bg-primary/10 text-foreground'
  };
  return <div className={cn('rounded-md border px-4 py-3 text-sm', tones[tone], className)}>
      {children}
    </div>;
}