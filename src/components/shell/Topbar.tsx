import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  MapPinIcon,
  RepeatIcon,
  SearchIcon } from
'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../../lib/auth';
import { ROLES, RoleId } from '../../lib/rbac';
import { complianceAlerts } from '../../lib/mockData';
import { Avatar, Badge } from '../ui/primitives';
import { cn } from '../../lib/utils';
export function Topbar() {
  const {
    role,
    branch,
    stations,
    canChangeBranch,
    setBranch,
    signOut,
    switchRole
  } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  if (!role) return null;
  const handleSwitch = (nextRole: RoleId) => {
    switchRole(nextRole);
    setUserOpen(false);
    navigate(ROLES[nextRole].landing);
  };
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
      <div className="relative min-w-0">
        {canChangeBranch ?
        <>
            <select
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
            className="h-9 max-w-[180px] appearance-none rounded-md border border-input bg-white py-0 pl-8 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none"
            aria-label="Operating station">
            
              {stations.
            filter((station) => station.status === 'Active').
            map((station) =>
            <option key={station.id} value={station.name}>
                    {station.name}
                  </option>
            )}
            </select>
            <MapPinIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </> :

        <div
          className="flex h-9 max-w-[190px] items-center gap-2 truncate rounded-md border border-primary/25 bg-primary/5 px-3 text-sm text-foreground"
          aria-label={`Assigned station: ${branch}`}>
          
            <MapPinIcon className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{branch}</span>
            <span className="hidden text-xs text-primary sm:inline">
              Assigned
            </span>
          </div>
        }
      </div>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search tickets, parcels, vehicles…"
          className="h-9 w-full rounded-md border border-input bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((open) => !open);
              setUserOpen(false);
            }}
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="View alerts">
            
            <BellIcon className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" />
          </button>
          <AnimatePresence>
            {notifOpen &&
            <motion.div
              initial={{
                opacity: 0,
                y: -6
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -6
              }}
              transition={{
                duration: 0.15
              }}
              className="absolute right-0 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              
                <div className="border-b border-border px-4 py-3 text-sm tracking-wide">
                  Compliance & variance alerts
                </div>
                <div className="max-h-80 divide-y divide-border overflow-y-auto">
                  {complianceAlerts.map((alert) =>
                <div
                  key={alert.id}
                  className="flex items-start gap-3 px-4 py-3">
                  
                      <span
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      alert.severity === 'danger' ?
                      'bg-danger' :
                      'bg-warning'
                    )} />
                  
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">
                          {alert.type} · {alert.vehicle}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alert.detail} · {alert.due}
                        </p>
                      </div>
                    </div>
                )}
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
        <div className="relative">
          <button
            onClick={() => {
              setUserOpen((open) => !open);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-md py-1 pl-1 pr-2 transition-colors hover:bg-muted">
            
            <Avatar name={role.label} />
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm text-foreground">
                {role.id === 'super_admin' ? 'Admin Root' : role.label}
              </p>
              <Badge tone="primary" className="mt-0.5">
                {role.label}
                {role.readOnly ? ' · Read-only' : ''}
              </Badge>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </button>
          <AnimatePresence>
            {userOpen &&
            <motion.div
              initial={{
                opacity: 0,
                y: -6
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -6
              }}
              transition={{
                duration: 0.15
              }}
              className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
              
                <div className="flex items-center gap-1.5 px-4 py-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  <RepeatIcon className="h-3.5 w-3.5" /> Demo: switch role
                </div>
                <div className="max-h-72 overflow-y-auto pb-1">
                  {(Object.keys(ROLES) as RoleId[]).map((roleId) =>
                <button
                  key={roleId}
                  onClick={() => handleSwitch(roleId)}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-muted',
                    role.id === roleId ?
                    'text-primary' :
                    'text-foreground/80'
                  )}>
                  
                      {ROLES[roleId].label}
                      {role.id === roleId &&
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  }
                    </button>
                )}
                </div>
                <div className="border-t border-border">
                  <button
                  onClick={signOut}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-muted">
                  
                    <LogOutIcon className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </header>);

}