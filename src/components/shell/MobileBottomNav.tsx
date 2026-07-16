import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3Icon,
  ClipboardListIcon,
  EllipsisIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ReceiptIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TicketIcon,
  UsersIcon,
  WalletIcon,
  XIcon,
  BoxIcon } from
'lucide-react';
import { ModuleId, NavItem } from '../../lib/rbac';
import { cn } from '../../lib/utils';
const PRIMARY_TAB_LIMIT = 4;
const ICONS: Record<ModuleId, BoxIcon> = {
  home: LayoutDashboardIcon,
  dashboard: LayoutDashboardIcon,
  ticketing: TicketIcon,
  parcels: PackageIcon,
  till: WalletIcon,
  conductor: ClipboardListIcon,
  employees: UsersIcon,
  reconciliation: ScaleIcon,
  expenses: ReceiptIcon,
  reports: BarChart3Icon,
  access: ShieldCheckIcon
};
export function MobileBottomNav({ items }: {items: NavItem[];}) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const primaryItems = items.slice(0, PRIMARY_TAB_LIMIT);
  const overflowItems = items.slice(PRIMARY_TAB_LIMIT);
  const moreIsActive = overflowItems.some((item) =>
  location.pathname.startsWith(item.path)
  );
  return (
    <>
      <AnimatePresence>
        {moreOpen &&
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="More navigation options">
          
            <motion.button
            type="button"
            aria-label="Close more navigation"
            className="absolute inset-0 w-full bg-slate-900/35"
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() => setMoreOpen(false)} />
          
            <motion.div
            initial={{
              y: '100%'
            }}
            animate={{
              y: 0
            }}
            exit={{
              y: '100%'
            }}
            transition={{
              duration: 0.2,
              ease: 'easeOut'
            }}
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card px-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl">
            
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base tracking-wide text-foreground">
                  More
                </h2>
                <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close more navigation">
                
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <nav
              id="more-navigation"
              className="grid grid-cols-2 gap-2"
              aria-label="Additional navigation">
              
                {overflowItems.map((item) => {
                const Icon = ICONS[item.module];
                return (
                  <NavLink
                    key={item.module}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                    cn(
                      'flex min-h-20 flex-col justify-between rounded-lg border p-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive ?
                      'border-primary bg-primary/5 text-primary' :
                      'border-border bg-card text-foreground hover:bg-muted'
                    )
                    }>
                    
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span>{item.label}</span>
                    </NavLink>);

              })}
              </nav>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur md:hidden"
        aria-label="Primary navigation">
        
        {primaryItems.map((item) => {
          const Icon = ICONS[item.module];
          return (
            <NavLink
              key={item.module}
              to={item.path}
              className={({ isActive }) =>
              cn(
                'relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[11px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
              }>
              
              {({ isActive }) =>
              <>
                  {isActive &&
                <motion.span
                  layoutId="mobile-nav-active"
                  className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                  transition={{
                    duration: 0.18
                  }} />

                }
                  <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.4 : 2}
                  aria-hidden="true" />
                
                  <span className="w-full truncate text-center">
                    {item.label}
                  </span>
                </>
              }
            </NavLink>);

        })}
        {overflowItems.length > 0 &&
        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          aria-expanded={moreOpen}
          aria-controls="more-navigation"
          className={cn(
            'relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-1 py-1.5 text-[11px] leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            moreIsActive || moreOpen ?
            'text-primary' :
            'text-muted-foreground'
          )}>
          
            {moreIsActive || moreOpen ?
          <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary" /> :
          null}
            <EllipsisIcon
            className="h-5 w-5"
            strokeWidth={moreIsActive || moreOpen ? 2.4 : 2}
            aria-hidden="true" />
          
            <span>More</span>
          </button>
        }
      </nav>
    </>);

}