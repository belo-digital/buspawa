import React, { useMemo, useState } from 'react';
import { BusFrontIcon, CheckCircle2Icon, PlusIcon } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from './ui/primitives';
import { Dialog } from './ui/Modal';
const EMPTY_BUS = {
  reg: '',
  make: '',
  model: '',
  capacity: '49',
  routeId: '',
  homeStation: 'Nairobi CBD',
  driver: '',
  conductor: '',
  nextService: '',
  insuranceExpiry: '',
  ntsaExpiry: '',
  tlbExpiry: ''
};
export function AdminFleetSection() {
  const {
    stations,
    routes,
    fleet,
    addFleetBus
  } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_BUS);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const routesById = useMemo(() => new Map(routes.map((route) => [route.id, route])), [routes]);
  const routeName = (routeId: string) => {
    const route = routesById.get(routeId);
    return route ? `${route.origin} → ${route.destination}` : 'Unassigned route';
  };
  const update = <K extends keyof typeof EMPTY_BUS,>(key: K, value: (typeof EMPTY_BUS)[K]) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };
  const openRegistration = () => {
    setError('');
    setForm({
      ...EMPTY_BUS,
      routeId: routes[0]?.id ?? '',
      homeStation: stations[0]?.name ?? ''
    });
    setOpen(true);
  };
  const registerBus = (event: React.FormEvent) => {
    event.preventDefault();
    const capacity = Number(form.capacity);
    if (!form.reg.trim() || !form.make.trim() || !form.model.trim() || !form.routeId || !form.homeStation || !form.nextService || !form.insuranceExpiry || !form.ntsaExpiry || !form.tlbExpiry) {
      setError('Complete the bus identity, route assignment, service and compliance fields.');
      return;
    }
    if (!Number.isInteger(capacity) || capacity < 8 || capacity > 80) {
      setError('Passenger capacity must be a whole number between 8 and 80.');
      return;
    }
    if (fleet.some((bus) => bus.reg.toLocaleLowerCase() === form.reg.trim().toLocaleLowerCase())) {
      setError('A bus with this registration number is already in the fleet.');
      return;
    }
    addFleetBus({
      reg: form.reg.trim().toUpperCase(),
      make: form.make.trim(),
      model: form.model.trim(),
      capacity,
      routeId: form.routeId,
      homeStation: form.homeStation,
      driver: form.driver.trim() || 'Unassigned',
      conductor: form.conductor.trim() || 'Unassigned',
      nextService: form.nextService,
      insuranceExpiry: form.insuranceExpiry,
      ntsaExpiry: form.ntsaExpiry,
      tlbExpiry: form.tlbExpiry
    });
    setSuccess(`${form.reg.trim().toUpperCase()} was registered and assigned to ${routeName(form.routeId)}.`);
    setOpen(false);
    setForm(EMPTY_BUS);
    setError('');
  };
  return <section className="space-y-4" aria-labelledby="fleet-setup-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="fleet-setup-heading" className="text-lg tracking-wide text-foreground">
            Fleet setup
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Register buses and assign each one to an approved service route.
          </p>
        </div>
        <Button onClick={openRegistration} disabled={routes.length === 0}>
          <PlusIcon className="h-4 w-4" /> Register bus
        </Button>
      </div>
      {success && <Alert tone="primary" className="flex items-center justify-between gap-4">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} className="text-sm text-primary underline underline-offset-2">
            Dismiss
          </button>
        </Alert>}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Registered buses</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              A route assignment authorises a bus to service all stops in its
              sequence.
            </p>
          </div>
          <Badge tone="outline">{fleet.length} buses</Badge>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  <th className="px-5 py-2.5 font-normal">Registration</th>
                  <th className="px-5 py-2.5 font-normal">Vehicle</th>
                  <th className="px-5 py-2.5 text-right font-normal">Seats</th>
                  <th className="px-5 py-2.5 font-normal">Home station</th>
                  <th className="px-5 py-2.5 font-normal">Service route</th>
                  <th className="px-5 py-2.5 font-normal">Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fleet.map((bus) => <tr key={bus.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-5 py-3 text-foreground">{bus.reg}</td>
                    <td className="px-5 py-3">
                      <p className="text-foreground">
                        {bus.make} {bus.model}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Driver · {bus.driver}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-foreground">
                      {bus.capacity}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {bus.homeStation}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-foreground">
                        {routeName(bus.routeId)}
                      </p>
                      <p className="mt-0.5 max-w-[220px] truncate text-xs text-muted-foreground">
                        {routesById.get(bus.routeId)?.intermediateStops.join(' · ') || 'No intermediate stops'}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="success">
                        <CheckCircle2Icon className="h-3 w-3" /> Documents
                        recorded
                      </Badge>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} title="Register a bus" description="Assign the bus to a service route so it can serve every stop listed on that route." className="max-w-3xl">
        <form onSubmit={registerBus} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Registration number" htmlFor="bus-reg">
              <Input id="bus-reg" value={form.reg} onChange={(event) => update('reg', event.target.value)} placeholder="e.g. KDM 234P" />
            </Field>
            <Field label="Make" htmlFor="bus-make">
              <Input id="bus-make" value={form.make} onChange={(event) => update('make', event.target.value)} placeholder="e.g. Scania" />
            </Field>
            <Field label="Model" htmlFor="bus-model">
              <Input id="bus-model" value={form.model} onChange={(event) => update('model', event.target.value)} placeholder="e.g. Marcopolo G7" />
            </Field>
            <Field label="Passenger seats" htmlFor="bus-capacity">
              <Input id="bus-capacity" type="number" min="8" max="80" value={form.capacity} onChange={(event) => update('capacity', event.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Primary service route" htmlFor="bus-route">
              <Select id="bus-route" value={form.routeId} onChange={(event) => update('routeId', event.target.value)}>
                {routes.map((route) => <option key={route.id} value={route.id}>
                    {route.origin} → {route.destination} ·{' '}
                    {route.intermediateStops.length} stops
                  </option>)}
              </Select>
            </Field>
            <Field label="Home station" htmlFor="bus-station">
              <Select id="bus-station" value={form.homeStation} onChange={(event) => update('homeStation', event.target.value)}>
                {stations.filter((station) => station.status === 'Active').map((station) => <option key={station.id} value={station.name}>
                      {station.name}
                    </option>)}
              </Select>
            </Field>
            <Field label="Assigned driver" htmlFor="bus-driver">
              <Input id="bus-driver" value={form.driver} onChange={(event) => update('driver', event.target.value)} placeholder="Optional" />
            </Field>
            <Field label="Assigned conductor" htmlFor="bus-conductor">
              <Input id="bus-conductor" value={form.conductor} onChange={(event) => update('conductor', event.target.value)} placeholder="Optional" />
            </Field>
          </div>
          <div>
            <p className="mb-3 text-sm tracking-wide text-foreground">
              Service and compliance dates
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Next service" htmlFor="bus-service">
                <Input id="bus-service" type="date" value={form.nextService} onChange={(event) => update('nextService', event.target.value)} />
              </Field>
              <Field label="Insurance expiry" htmlFor="bus-insurance">
                <Input id="bus-insurance" type="date" value={form.insuranceExpiry} onChange={(event) => update('insuranceExpiry', event.target.value)} />
              </Field>
              <Field label="NTSA expiry" htmlFor="bus-ntsa">
                <Input id="bus-ntsa" type="date" value={form.ntsaExpiry} onChange={(event) => update('ntsaExpiry', event.target.value)} />
              </Field>
              <Field label="TLB licence expiry" htmlFor="bus-tlb">
                <Input id="bus-tlb" type="date" value={form.tlbExpiry} onChange={(event) => update('tlbExpiry', event.target.value)} />
              </Field>
            </div>
          </div>
          {error && <p role="alert" className="text-sm text-danger">
              {error}
            </p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <BusFrontIcon className="h-4 w-4" /> Register bus
            </Button>
          </div>
        </form>
      </Dialog>
    </section>;
}
function Field({
  label,
  htmlFor,
  children




}: {label: string;htmlFor: string;children: React.ReactNode;}) {
  return <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>;
}