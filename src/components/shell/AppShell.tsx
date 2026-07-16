import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { navForRole } from '../../lib/rbac';
import { MobileBottomNav } from './MobileBottomNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
export function AppShell() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (!role)
    navigate('/login', {
      replace: true
    });
  }, [role, navigate]);
  if (!role) return null;
  const nav = navForRole(role);
  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)} />
      
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav items={nav} />
    </div>);

}