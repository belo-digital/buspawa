'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  salary: number;
  employmentStatus: string;
  dateJoined: string;
}

interface EmployeeDocument {
  id: string;
  documentType: string;
  documentNumber: string;
  expiryDate: string;
}

interface ComplianceResult {
  compliant: boolean;
  missingDocuments: string[];
}

interface ExpiringDocument {
  employeeName: string;
  employeeId: string;
  documentType: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
}

const ROLES = [
  { value: 'driver', label: 'Driver' },
  { value: 'conductor', label: 'Conductor' },
  { value: 'booking_agent', label: 'Booking Agent' },
  { value: 'hr_officer', label: 'HR Officer' },
  { value: 'finance_officer', label: 'Finance Officer' },
  { value: 'auditor', label: 'Auditor' },
] as const;

const ROLE_FILTERS = ['All', 'Drivers', 'Conductors', 'Agents'] as const;

const DOCUMENT_TYPES = [
  { value: 'psv_badge', label: 'PSV Badge' },
  { value: 'driving_license_d1', label: 'Driving License D1' },
  { value: 'driving_license_d2', label: 'Driving License D2' },
  { value: 'driving_license_d3', label: 'Driving License D3' },
  { value: 'ntsa_medical_certificate', label: 'NTSA Medical Certificate' },
  { value: 'certificate_of_good_conduct', label: 'Certificate of Good Conduct' },
] as const;

const ROLE_BADGE_MAP: Record<string, string> = {
  driver: 'Drivers',
  conductor: 'Conductors',
  booking_agent: 'Agents',
  hr_officer: 'HR',
  finance_officer: 'Finance',
  auditor: 'Audit',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-700',
};

const DOC_STATUS_COLORS: Record<string, string> = {
  valid: 'bg-emerald-100 text-emerald-700',
  expiring_soon: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-red-100 text-red-700',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount);
}

type Tab = 'staff' | 'compliance';

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('staff');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<ExpiringDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddDocForm, setShowAddDocForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [employeeDocs, setEmployeeDocs] = useState<EmployeeDocument[]>([]);
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null);
  const [docsLoading, setDocsLoading] = useState(false);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'driver',
    branch: '',
    salary: '',
  });

  const [newDocument, setNewDocument] = useState({
    documentType: 'psv_badge',
    documentNumber: '',
    expiryDate: '',
  });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/employees');
      setEmployees(data);
    } catch {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpiringDocs = useCallback(async () => {
    try {
      const data = await api.get('/employees/expiring-documents');
      setExpiringDocs(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
    fetchExpiringDocs();
  }, [fetchEmployees, fetchExpiringDocs]);

  const fetchEmployeeDetails = async (emp: Employee) => {
    setSelectedEmployee(emp);
    setDocsLoading(true);
    try {
      const [docs, comp] = await Promise.all([
        api.get(`/employees/${emp.id}/documents`),
        api.get(`/employees/${emp.id}/compliance`),
      ]);
      setEmployeeDocs(docs);
      setCompliance(comp);
    } catch {
      // silent
    } finally {
      setDocsLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/employees', {
        ...newEmployee,
        salary: Number(newEmployee.salary),
      });
      setShowAddForm(false);
      setNewEmployee({ name: '', email: '', phone: '', role: 'driver', branch: '', salary: '' });
      fetchEmployees();
    } catch {
      setError('Failed to create employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    setSubmitting(true);
    try {
      await api.post(`/employees/${selectedEmployee.id}/documents`, newDocument);
      setShowAddDocForm(false);
      setNewDocument({ documentType: 'psv_badge', documentNumber: '', expiryDate: '' });
      // Refresh details
      const [docs, comp] = await Promise.all([
        api.get(`/employees/${selectedEmployee.id}/documents`),
        api.get(`/employees/${selectedEmployee.id}/compliance`),
      ]);
      setEmployeeDocs(docs);
      setCompliance(comp);
    } catch {
      setError('Failed to add document');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesRole =
      roleFilter === 'All' ||
      (roleFilter === 'Drivers' && emp.role === 'driver') ||
      (roleFilter === 'Conductors' && emp.role === 'conductor') ||
      (roleFilter === 'Agents' && emp.role === 'booking_agent');
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.phone.includes(q) ||
      emp.branch.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage staff and compliance documents</p>
        </div>
        {activeTab === 'staff' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Employee
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {([
          { key: 'staff' as Tab, label: 'Staff List' },
          { key: 'compliance' as Tab, label: 'Compliance' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-medium hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Staff List Tab */}
      {activeTab === 'staff' && (
        <>
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {ROLE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setRoleFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    roleFilter === f
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative flex-1 sm:max-w-xs">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="mt-3 text-sm text-muted-foreground">No employees found</p>
            </div>
          ) : (
            <>
              {/* Mobile: Card grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:hidden">
                {filteredEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => fetchEmployeeDetails(emp)}
                    className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                        {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_COLORS[emp.employmentStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {emp.employmentStatus}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="font-semibold text-foreground text-sm">{emp.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{emp.role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {emp.branch}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      {emp.phone}
                    </div>
                  </button>
                ))}
              </div>

              {/* Desktop: Table */}
              <div className="hidden lg:block rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Branch</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Phone</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Salary</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr
                        key={emp.id}
                        onClick={() => fetchEmployeeDetails(emp)}
                        className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-primary/5"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                              {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{emp.name}</p>
                              <p className="text-xs text-muted-foreground">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">{emp.role.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3 text-muted-foreground">{emp.branch}</td>
                        <td className="px-4 py-3 text-muted-foreground">{emp.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground">{formatCurrency(emp.salary)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[emp.employmentStatus] || 'bg-gray-100 text-gray-600'}`}>
                            {emp.employmentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : expiringDocs.length === 0 ? (
            <div className="rounded-xl border border-border bg-card py-16 text-center">
              <svg className="mx-auto h-12 w-12 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-3 text-sm font-medium text-foreground">All documents are up to date</p>
              <p className="text-xs text-muted-foreground mt-1">No expiring or expired documents found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/20"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${DOC_STATUS_COLORS[doc.status] || 'bg-gray-100 text-gray-600'}`}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doc.employeeName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {DOCUMENT_TYPES.find((d) => d.value === doc.documentType)?.label || doc.documentType.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pl-11 sm:pl-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Expires</p>
                        <p className="text-sm font-medium text-foreground">{formatDate(doc.expiryDate)}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${DOC_STATUS_COLORS[doc.status]}`}>
                        {doc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Employee Detail Slide-over */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setSelectedEmployee(null); setEmployeeDocs([]); setCompliance(null); }} />
          <div className="relative w-full max-w-lg overflow-y-auto bg-background shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Employee Details</h2>
              <button
                onClick={() => { setSelectedEmployee(null); setEmployeeDocs([]); setCompliance(null); }}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold">
                  {selectedEmployee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{selectedEmployee.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{selectedEmployee.role.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Email', value: selectedEmployee.email },
                  { label: 'Phone', value: selectedEmployee.phone },
                  { label: 'Branch', value: selectedEmployee.branch },
                  { label: 'Salary', value: formatCurrency(selectedEmployee.salary) },
                  { label: 'Status', value: selectedEmployee.employmentStatus },
                  { label: 'Joined', value: formatDate(selectedEmployee.dateJoined) },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Compliance Status */}
              {docsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
                </div>
              ) : compliance && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Compliance Status</h3>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${compliance.compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {compliance.compliant ? 'Compliant' : 'Non-Compliant'}
                    </span>
                  </div>
                  {!compliance.compliant && compliance.missingDocuments.length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-medium text-red-700 mb-1.5">Missing documents:</p>
                      <ul className="space-y-1">
                        {compliance.missingDocuments.map((doc) => (
                          <li key={doc} className="flex items-center gap-1.5 text-xs text-red-600">
                            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                            </svg>
                            {doc.replace(/_/g, ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Documents */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Documents</h3>
                  <button
                    onClick={() => setShowAddDocForm(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add
                  </button>
                </div>

                {docsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-primary border-t-transparent" />
                  </div>
                ) : employeeDocs.length === 0 ? (
                  <div className="rounded-lg border border-border bg-muted/50 py-6 text-center">
                    <p className="text-sm text-muted-foreground">No documents on file</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {employeeDocs.map((doc) => (
                      <div key={doc.id} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {DOCUMENT_TYPES.find((d) => d.value === doc.documentType)?.label || doc.documentType.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">No. {doc.documentNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Expires</p>
                            <p className="text-sm font-medium text-foreground">{formatDate(doc.expiryDate)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddForm(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-background shadow-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Add Employee</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="John Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="john@buspawa.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Branch</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.branch}
                    onChange={(e) => setNewEmployee({ ...newEmployee, branch: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Nairobi"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Monthly Salary (KES)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="50000"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocForm && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddDocForm(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-background shadow-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Add Document</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{selectedEmployee.name}</p>
              </div>
              <button
                onClick={() => setShowAddDocForm(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddDocument} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Document Type</label>
                <select
                  value={newDocument.documentType}
                  onChange={(e) => setNewDocument({ ...newDocument, documentType: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {DOCUMENT_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Document Number</label>
                <input
                  type="text"
                  required
                  value={newDocument.documentNumber}
                  onChange={(e) => setNewDocument({ ...newDocument, documentNumber: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g. DL-12345678"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={newDocument.expiryDate}
                  onChange={(e) => setNewDocument({ ...newDocument, expiryDate: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocForm(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
