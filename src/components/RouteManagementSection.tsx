import React, { useMemo, useState, Fragment } from 'react';
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, MapPinIcon, PlusIcon, RouteIcon, Trash2Icon } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from './ui/primitives';
export function RouteManagementSection() {
  const {
    stations,
    routes,
    addRoute
  } = useAuth();
  const activeStations = useMemo(() => stations.filter((station) => station.status === 'Active'), [stations]);
  const [origin, setOrigin] = useState('Nairobi CBD');
  const [destination, setDestination] = useState('Mombasa');
  const [stopInput, setStopInput] = useState('');
  const [intermediateStops, setIntermediateStops] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const sequence = [origin, ...intermediateStops, destination];
  const addIntermediateStop = () => {
    const nextStop = stopInput.trim();
    if (!nextStop) return;
    const isDuplicate = sequence.some((stop) => stop.toLocaleLowerCase() === nextStop.toLocaleLowerCase());
    if (isDuplicate) {
      setError('Each service stop can appear only once on a route.');
      return;
    }
    setIntermediateStops((current) => [...current, nextStop]);
    setStopInput('');
    setError('');
  };
  const moveStop = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= intermediateStops.length) return;
    setIntermediateStops((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };
  const createRoute = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedStops = sequence.map((stop) => stop.trim().toLocaleLowerCase());
    if (!origin || !destination) {
      setError('Select both a departure station and a destination station.');
      return;
    }
    if (origin === destination) {
      setError('Departure and destination stations must be different.');
      return;
    }
    if (new Set(normalizedStops).size !== normalizedStops.length) {
      setError('Every stop on a service route must be unique.');
      return;
    }
    if (routes.some((route) => route.origin === origin && route.destination === destination && route.intermediateStops.join('|') === intermediateStops.join('|'))) {
      setError('This exact service route already exists.');
      return;
    }
    addRoute({
      origin,
      destination,
      intermediateStops
    });
    setSuccess(`${origin} to ${destination} is ready for bus assignment.`);
    setIntermediateStops([]);
    setStopInput('');
    setError('');
  };
  return <section className="space-y-4" aria-labelledby="route-management-heading">
      <div>
        <h2 id="route-management-heading" className="text-lg tracking-wide text-foreground">
          Service routes
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Define the stations and towns a bus can service along each journey.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <Card>
          <CardHeader>
            <CardTitle>Active service routes</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Assigning a bus to a route makes every listed stop available to
              its service.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {routes.map((route) => <article key={route.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm tracking-wide text-foreground">
                      {route.origin}{' '}
                      <ArrowRightIcon className="mx-1 inline h-3.5 w-3.5 text-primary" />{' '}
                      {route.destination}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {route.intermediateStops.length} intermediate service stop
                      {route.intermediateStops.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Badge tone="success">Available for assignment</Badge>
                </div>
                <ol className="mt-4 flex flex-wrap items-center gap-y-2 text-xs" aria-label={`${route.origin} to ${route.destination} stop sequence`}>
                  {[route.origin, ...route.intermediateStops, route.destination].map((stop, index, stops) => <Fragment key={`${stop}-${index}`}>
                      <li className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-primary">
                        <MapPinIcon className="h-3 w-3" aria-hidden="true" />
                        {stop}
                      </li>
                      {index < stops.length - 1 && <ArrowRightIcon className="mx-0.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />}
                    </Fragment>)}
                </ol>
              </article>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create service route</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createRoute} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <Field label="Departure station" htmlFor="route-origin">
                  <Select id="route-origin" value={origin} onChange={(event) => setOrigin(event.target.value)}>
                    {activeStations.map((station) => <option key={station.id} value={station.name}>
                        {station.name}
                      </option>)}
                  </Select>
                </Field>
                <Field label="Destination station" htmlFor="route-destination">
                  <Select id="route-destination" value={destination} onChange={(event) => setDestination(event.target.value)}>
                    {activeStations.map((station) => <option key={station.id} value={station.name}>
                        {station.name}
                      </option>)}
                  </Select>
                </Field>
              </div>

              <div className="rounded-md border border-primary/20 bg-primary/[0.04] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Ordered route sequence
                </p>
                <ol className="mt-3 space-y-2">
                  <RouteEndpoint label="Departure" stop={origin} />
                  {intermediateStops.map((stop, index) => <li key={`${stop}-${index}`} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] text-muted-foreground">
                        {index + 2}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                        {stop}
                      </span>
                      <button type="button" onClick={() => moveStop(index, -1)} disabled={index === 0} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-35" aria-label={`Move ${stop} earlier`}>
                        <ArrowUpIcon className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => moveStop(index, 1)} disabled={index === intermediateStops.length - 1} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-35" aria-label={`Move ${stop} later`}>
                        <ArrowDownIcon className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setIntermediateStops((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded p-1 text-danger hover:bg-danger/10" aria-label={`Remove ${stop}`}>
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </li>)}
                  <RouteEndpoint label="Destination" stop={destination} index={intermediateStops.length + 2} />
                </ol>
              </div>

              <Field label="Intermediate town or station" htmlFor="route-stop">
                <div className="flex gap-2">
                  <Input id="route-stop" value={stopInput} onChange={(event) => setStopInput(event.target.value)} placeholder="e.g. Voi or Nakuru" />
                  <Button type="button" variant="outline" onClick={addIntermediateStop} aria-label="Add intermediate stop">
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </Field>
              <p className="text-xs text-muted-foreground">
                Add existing stations or any town served between the endpoints,
                then use the arrows to set the travel order.
              </p>
              {error && <p role="alert" className="text-sm text-danger">
                  {error}
                </p>}
              <Button type="submit" className="w-full">
                <RouteIcon className="h-4 w-4" /> Create route
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      {success && <Alert tone="primary" className="flex items-center justify-between gap-4">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess('')} className="text-sm text-primary underline underline-offset-2">
            Dismiss
          </button>
        </Alert>}
    </section>;
}
function RouteEndpoint({
  label,
  stop,
  index = 1




}: {label: string;stop: string;index?: number;}) {
  return <li className="flex items-center gap-2 px-1 py-1">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">
        {index}
      </span>
      <span className="text-sm text-foreground">{stop}</span>
      <span className="ml-auto text-xs text-muted-foreground">{label}</span>
    </li>;
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