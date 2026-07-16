import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { ModuleId } from './lib/rbac';
import { AppShell } from './components/shell/AppShell';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Ticketing } from './pages/Ticketing';
import { Parcels } from './pages/Parcels';
import { MyTill } from './pages/MyTill';
import { Finance } from './pages/Finance';
import { Expenses } from './pages/Expenses';
import { Conductor } from './pages/Conductor';
import { Employees } from './pages/Employees';
import { Reports } from './pages/Reports';
import { Access } from './pages/Access';
import { PublicBooking } from './pages/PublicBooking';
// Guards a route by module. If the signed-in role lacks the module,
// bounce them to their own landing page — enforcing RBAC at the route level.
function Guard({
  module,
  children



}: {module: ModuleId;children: React.ReactNode;}) {
  const {
    role
  } = useAuth();
  const location = useLocation();
  if (!role) return <Navigate to="/login" replace state={{
    from: location
  }} />;
  if (!role.modules.includes(module)) return <Navigate to={role.landing} replace />;
  return <>{children}</>;
}
function ConductorRoute() {
  const {
    role
  } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (!role.modules.includes('conductor')) return <Navigate to={role.landing} replace />;
  return <Conductor />;
}
function AppLanding() {
  const {
    role
  } = useAuth();
  return <Navigate to={role?.landing ?? '/login'} replace />;
}
export function App() {
  return <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/book" element={<PublicBooking />} />

          {/* Conductor uses its own full-bleed mobile shell (no sidebar) */}
          <Route path="/app/conductor" element={<ConductorRoute />} />

          {/* All other modules live inside the shared shell */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<AppLanding />} />
            <Route path="home" element={<Guard module="home">
                  <Home />
                </Guard>} />
            <Route path="dashboard" element={<Guard module="dashboard">
                  <Dashboard />
                </Guard>} />
            <Route path="ticketing" element={<Guard module="ticketing">
                  <Ticketing />
                </Guard>} />
            <Route path="parcels" element={<Guard module="parcels">
                  <Parcels />
                </Guard>} />
            <Route path="till" element={<Guard module="till">
                  <MyTill />
                </Guard>} />
            <Route path="finance" element={<Guard module="reconciliation">
                  <Finance />
                </Guard>} />
            <Route path="expenses" element={<Guard module="expenses">
                  <Expenses />
                </Guard>} />
            <Route path="employees" element={<Guard module="employees">
                  <Employees />
                </Guard>} />
            <Route path="reports" element={<Guard module="reports">
                  <Reports />
                </Guard>} />
            <Route path="access" element={<Guard module="access">
                  <Access />
                </Guard>} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>;
}