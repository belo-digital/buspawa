import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboardIcon, TicketIcon, PackageIcon, WalletIcon, UsersIcon, ScaleIcon, ReceiptIcon, BarChart3Icon, ShieldCheckIcon, ClipboardListIcon, ChevronLeftIcon, BoxIcon } from 'lucide-react';
import { navForRole, ModuleId, Role } from '../../lib/rbac';
import { cn } from '../../lib/utils';
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
export function Sidebar({
  role,
  collapsed,
  onToggle




}: {role: Role;collapsed: boolean;onToggle: () => void;}) {
  const nav = navForRole(role);
  const groups = nav.reduce<Record<string, typeof nav>>((acc, item) => {
    ;
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});
  return <aside className={cn('hidden md:flex flex-col border-r border-border bg-card transition-[width] duration-200 shrink-0', collapsed ? 'w-[68px]' : 'w-60')}>
      <div className="flex h-16 items-center px-4 border-b border-border">
        {collapsed ? <img src="/favicon.svg" alt="BusPawa" className="h-8 w-8" /> : <img src="/primary-logo.svg" alt="BusPawa" className="h-auto w-[142px]" />}
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        {Object.entries(groups).map(([group, items]) => <div key={group} className="mb-1">
            {!collapsed && <div className="px-4 pt-3 pb-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70">
                {group}
              </div>}
            {items.map((item) => {
          const Icon = ICONS[item.module];
          return <NavLink key={item.module} to={item.path} title={collapsed ? item.label : undefined} className={({
            isActive
          }) => cn('relative flex items-center gap-3 px-4 py-2 text-sm tracking-wide transition-colors duration-150', collapsed && 'justify-center px-0', isActive ? 'text-primary' : 'text-foreground/70 hover:text-foreground hover:bg-muted/60')}>
                  {({
              isActive
            }) => <>
                      {isActive && <motion.span layoutId="nav-active" className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r bg-primary" transition={{
                duration: 0.18
              }} />}
                      {isActive && <span className="absolute inset-0 bg-primary/[0.06]" />}
                      <Icon className="relative h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                      {!collapsed && <span className="relative">{item.label}</span>}
                    </>}
                </NavLink>;
        })}
          </div>)}
      </nav>

      <div className="border-t border-border p-2">
        <button onClick={onToggle} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">
          <ChevronLeftIcon className={cn('h-4 w-4 transition-transform duration-200', collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>;
}