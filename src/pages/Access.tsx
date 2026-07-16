import React, { useState } from 'react';
import { CheckIcon, MapPinIcon, PencilIcon, PlusIcon, ShieldCheckIcon } from 'lucide-react';
import { AdminFleetSection } from '../components/AdminFleetSection';
import { RouteManagementSection } from '../components/RouteManagementSection';
import { PageContainer, PageHeader } from '../components/shell/PageHeader';
import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Separator } from '../components/ui/primitives';
import { Dialog } from '../components/ui/Modal';
import { MODULE_PERMS, staffAccess } from '../lib/mockData';
import { useAuth } from '../lib/auth';
import { cn } from '../lib/utils';
type StaffAccessRecord = (typeof staffAccess)[number] & {
  station: string;
};
const INITIAL_STAFF: StaffAccessRecord[] = staffAccess.map((staff) => ({
  ...staff,
  station: staff.role === 'Booking Agent' ? staff.name === 'Aisha Noor' ? 'Mombasa' : 'Nairobi CBD' : 'Organisation-wide'
}));
const EMPTY_STATION = {
  name: '',
  town: '',
  code: '',
  status: 'Active' as const,
  operations: 'Tickets · Parcels'
};
export function Access() {
  const {
    stations,
    addStation
  } = useAuth();
  const [staff, setStaff] = useState<StaffAccessRecord[]>(INITIAL_STAFF);
  const [editing, setEditing] = useState<StaffAccessRecord | null>(null);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [draftStation, setDraftStation] = useState('');
  const [stationOpen, setStationOpen] = useState(false);
  const [stationForm, setStationForm] = useState(EMPTY_STATION);
  const [stationError, setStationError] = useState('');
  const [stationSuccess, setStationSuccess] = useState('');
  const openEdit = (member: StaffAccessRecord) => {
    setEditing(member);
    setDraft({
      ...member.perms
    });
    setDraftStation(member.station);
  };
  const saveAccess = () => {
    if (editing) {
      setStaff((current) => current.map((member) => member.id === editing.id ? {
        ...member,
        perms: draft,
        station: member.role === 'Booking Agent' ? draftStation : member.station
      } : member));
    }
    setEditing(null);
  };
  const addNewStation = (event: React.FormEvent) => {
    event.preventDefault();
    const code = stationForm.code.trim().toUpperCase();
    if (!stationForm.name.trim() || !stationForm.town.trim() || !code) {
      setStationError('Station name, town and station code are required.');
      return;
    }
    if (stations.some((station) => station.code.toLowerCase() === code.toLowerCase())) {
      setStationError('This station code is already in use.');
      return;
    }
    addStation({
      name: stationForm.name.trim(),
      town: stationForm.town.trim(),
      code,
      status: stationForm.status,
      operations: stationForm.operations
    });
    setStationSuccess(`${stationForm.name.trim()} is ready for route setup and staff assignment.`);
    setStationForm(EMPTY_STATION);
    setStationError('');
    setStationOpen(false);
  };
  const toggle = (module: string) => setDraft((current) => ({
    ...current,
    [module]: !current[module]
  }));
  return <PageContainer>
      <PageHeader title="Administration" subtitle="Configure operating stations, service routes, fleet and staff access." />
      <Alert tone="primary" className="flex items-center gap-2">
        <ShieldCheckIcon className="h-4 w-4 shrink-0 text-primary" />
        <span>
          Booking agents are assigned to one station only. Their station remains
          locked during ticketing and parcel sales.
        </span>
      </Alert>

      <section className="space-y-4" aria-labelledby="station-management-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="station-management-heading" className="text-lg tracking-wide text-foreground">
              Stations
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Operating locations used for counter sales, service routes and
              staff assignment.
            </p>
          </div>
          <Button onClick={() => {
          setStationError('');
          setStationOpen(true);
        }}>
            <PlusIcon className="h-4 w-4" /> Add station
          </Button>
        </div>
        {stationSuccess && <Alert tone="primary" className="flex items-center justify-between gap-3">
            <span>{stationSuccess}</span>
            <button type="button" onClick={() => setStationSuccess('')} className="text-sm text-primary underline underline-offset-2">
              Dismiss
            </button>
          </Alert>}
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-5 py-2.5 font-normal">Station</th>
                    <th className="px-5 py-2.5 font-normal">Code</th>
                    <th className="px-5 py-2.5 font-normal">Status</th>
                    <th className="px-5 py-2.5 text-right font-normal">
                      Agents
                    </th>
                    <th className="px-5 py-2.5 font-normal">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stations.map((station) => <tr key={station.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-foreground">{station.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {station.town}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {station.code}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={station.status === 'Active' ? 'success' : 'neutral'}>
                          {station.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-foreground">
                        {station.agents}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {station.operations}
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <RouteManagementSection />
      <AdminFleetSection />

      <section className="space-y-4" aria-labelledby="staff-access-heading">
        <div>
          <h2 id="staff-access-heading" className="text-lg tracking-wide text-foreground">
            Staff access
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Permissions determine each role’s visible modules and routes.
          </p>
        </div>
        <Card>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    <th className="px-5 py-2.5 font-normal">Staff member</th>
                    <th className="px-5 py-2.5 font-normal">Role</th>
                    <th className="px-5 py-2.5 font-normal">
                      Assigned station
                    </th>
                    {MODULE_PERMS.map((module) => <th key={module} className="px-3 py-2.5 text-center font-normal">
                        {module}
                      </th>)}
                    <th className="px-5 py-2.5 text-right font-normal">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {staff.map((member) => <tr key={member.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-5 py-3 text-foreground">
                        {member.name}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone="outline">{member.role}</Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {member.station}
                      </td>
                      {MODULE_PERMS.map((module) => <td key={module} className="px-3 py-3 text-center">
                          <span className={cn('inline-flex h-5 w-5 items-center justify-center rounded border', member.perms[module] ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-muted/40')}>
                            {member.perms[module] && <CheckIcon className="h-3.5 w-3.5" />}
                          </span>
                        </td>)}
                      <td className="px-5 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(member)}>
                          <PencilIcon className="h-3.5 w-3.5" /> Edit
                        </Button>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? `Edit access · ${editing.name}` : ''} description={editing?.role}>
        {editing && <div className="space-y-4">
            {editing.role === 'Booking Agent' && <div className="space-y-1.5">
                <Label htmlFor="agent-station">Assigned station</Label>
                <Select id="agent-station" value={draftStation} onChange={(event) => setDraftStation(event.target.value)}>
                  {stations.filter((station) => station.status === 'Active').map((station) => <option key={station.id} value={station.name}>
                        {station.name}
                      </option>)}
                </Select>
                <p className="text-xs text-muted-foreground">
                  This is the only station this booking agent can use after
                  sign-in.
                </p>
              </div>}
            <div className="grid grid-cols-2 gap-2">
              {MODULE_PERMS.map((module) => <button key={module} type="button" onClick={() => toggle(module)} className={cn('flex items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors', draft[module] ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground')}>
                  {module}
                  <span className={cn('relative h-5 w-9 rounded-full transition-colors', draft[module] ? 'bg-primary' : 'bg-muted')}>
                    <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all', draft[module] ? 'left-4' : 'left-0.5')} />
                  </span>
                </button>)}
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={saveAccess}>Save access</Button>
            </div>
          </div>}
      </Dialog>

      <Dialog open={stationOpen} onClose={() => setStationOpen(false)} title="Add station" description="Create an operating station for future route setup, staff assignment and counter sales.">
        <form onSubmit={addNewStation} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Station name" htmlFor="station-name">
              <Input id="station-name" value={stationForm.name} onChange={(event) => setStationForm({
              ...stationForm,
              name: event.target.value
            })} placeholder="e.g. Thika Road" />
            </Field>
            <Field label="Town / location" htmlFor="station-town">
              <Input id="station-town" value={stationForm.town} onChange={(event) => setStationForm({
              ...stationForm,
              town: event.target.value
            })} placeholder="e.g. Nairobi" />
            </Field>
            <Field label="Station code" htmlFor="station-code">
              <Input id="station-code" value={stationForm.code} onChange={(event) => setStationForm({
              ...stationForm,
              code: event.target.value.toUpperCase()
            })} placeholder="e.g. NBO-TRD" />
            </Field>
            <Field label="Status" htmlFor="station-status">
              <Select id="station-status" value={stationForm.status} onChange={(event) => setStationForm({
              ...stationForm,
              status: event.target.value as 'Active' | 'Inactive'
            })}>
                <option>Active</option>
                <option>Inactive</option>
              </Select>
            </Field>
          </div>
          <Field label="Enabled operations" htmlFor="station-operations">
            <Select id="station-operations" value={stationForm.operations} onChange={(event) => setStationForm({
            ...stationForm,
            operations: event.target.value
          })}>
              <option>Tickets · Parcels</option>
              <option>Tickets only</option>
              <option>Parcels only</option>
            </Select>
          </Field>
          {stationError && <p role="alert" className="text-sm text-danger">
              {stationError}
            </p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setStationOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add station</Button>
          </div>
        </form>
      </Dialog>
    </PageContainer>;
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