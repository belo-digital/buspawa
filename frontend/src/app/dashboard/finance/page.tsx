'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

interface TillSession {
  id: string;
  agentId: string;
  branch: string;
  sessionDate: string;
  shift: string;
  expected: number;
  cashReceived: number;
  mpesaReceived: number;
  variance: number;
  status: 'open' | 'closed' | 'reconciled';
  closedAt: string | null;
  agent?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

interface TillLineItem {
  id: string;
  tillSessionId: string;
  type: string;
  reference: string;
  detail: string;
  method: string;
  amount: number;
}

interface CashDeposit {
  id: string;
  agentId: string;
  branch: string;
  tillSessionRef: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  depositDate: string;
  bankReference: string;
  receiptName: string;
  statementAmount: number | null;
  status: 'Pending verification' | 'Verified' | 'Mismatch';
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FinanceSummary {
  todayExpected: number;
  todayCash: number;
  todayMpesa: number;
  avgVariance: number;
  pendingDeposits: number;
}

export default function FinancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Till' | 'Deposits' | 'Summary'>('Till');

  const [currentSession, setCurrentSession] = useState<TillSession | null>(null);
  const [tillItems, setTillItems] = useState<TillLineItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  const [showOpenTillForm, setShowOpenTillForm] = useState(false);
  const [openTillForm, setOpenTillForm] = useState({
    branch: '',
    shift: 'Morning',
    expected: '',
  });
  const [openingTill, setOpeningTill] = useState(false);

  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState({
    type: '',
    ref: '',
    detail: '',
    method: 'Cash',
    amount: '',
  });
  const [addingItem, setAddingItem] = useState(false);

  const [closingTill, setClosingTill] = useState(false);

  const [deposits, setDeposits] = useState<CashDeposit[]>([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositForm, setDepositForm] = useState({
    branch: '',
    tillSessionRef: '',
    bankName: '',
    accountNumber: '',
    amount: '',
    depositDate: '',
    bankReference: '',
    receiptName: '',
  });
  const [submittingDeposit, setSubmittingDeposit] = useState(false);

  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    fetchSessions();
    fetchDeposits();
    fetchSummary();
  }, []);

  useEffect(() => {
    if (currentSession) {
      fetchTillItems(currentSession.id);
    }
  }, [currentSession]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await api.get('/finance/till/sessions');
      const openSession = data.find((s: TillSession) => s.status === 'open');
      setCurrentSession(openSession || null);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchTillItems = async (sessionId: string) => {
    setLoadingItems(true);
    try {
      const data = await api.get(`/finance/till/${sessionId}/items`);
      setTillItems(data);
    } catch (error) {
      console.error('Error fetching till items:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchDeposits = async () => {
    setLoadingDeposits(true);
    try {
      const data = await api.get('/finance/deposits');
      setDeposits(data);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoadingDeposits(false);
    }
  };

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const data = await api.get('/finance/summary');
      setSummary(data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleOpenTill = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpeningTill(true);
    try {
      const newSession = await api.post('/finance/till/open', {
        agentId: user?.id,
        branch: openTillForm.branch,
        shift: openTillForm.shift,
        expected: parseFloat(openTillForm.expected),
      });
      setShowOpenTillForm(false);
      setOpenTillForm({ branch: '', shift: 'Morning', expected: '' });
      setCurrentSession(newSession);
    } catch (error) {
      console.error('Error opening till:', error);
      alert('Failed to open till. Please try again.');
    } finally {
      setOpeningTill(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;
    setAddingItem(true);
    try {
      const newItem = await api.post(`/finance/till/${currentSession.id}/items`, {
        type: itemForm.type,
        ref: itemForm.ref,
        detail: itemForm.detail,
        method: itemForm.method,
        amount: parseFloat(itemForm.amount),
      });
      setTillItems((prev) => [...prev, newItem]);
      setItemForm({ type: '', ref: '', detail: '', method: 'Cash', amount: '' });
      setShowItemForm(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setAddingItem(false);
    }
  };

  const handleCloseTill = async () => {
    if (!currentSession) return;
    if (!window.confirm('Are you sure you want to close this till session?')) return;
    setClosingTill(true);
    try {
      const updated = await api.patch(`/finance/till/${currentSession.id}/close`);
      setCurrentSession(updated);
      setTillItems([]);
    } catch (error) {
      console.error('Error closing till:', error);
      alert('Failed to close till. Please try again.');
    } finally {
      setClosingTill(false);
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingDeposit(true);
    try {
      await api.post('/finance/deposits', {
        agentId: user?.id,
        branch: depositForm.branch,
        tillSessionRef: depositForm.tillSessionRef,
        bankName: depositForm.bankName,
        accountNumber: depositForm.accountNumber,
        amount: parseFloat(depositForm.amount),
        depositDate: depositForm.depositDate,
        bankReference: depositForm.bankReference,
        receiptName: depositForm.receiptName,
      });
      setShowDepositForm(false);
      setDepositForm({
        branch: '',
        tillSessionRef: '',
        bankName: '',
        accountNumber: '',
        amount: '',
        depositDate: '',
        bankReference: '',
        receiptName: '',
      });
      await fetchDeposits();
    } catch (error) {
      console.error('Error submitting deposit:', error);
      alert('Failed to submit deposit. Please try again.');
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending verification':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Verified':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'Mismatch':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const tabs = ['Till', 'Deposits', 'Summary'] as const;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Finance Management</h1>
          <p className="text-muted-foreground mt-1">Manage till operations, deposits, and financial summaries</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Till' && (
          <div className="space-y-6">
            {loadingSessions ? (
              <div className="text-center py-12 text-muted-foreground">Loading sessions...</div>
            ) : currentSession ? (
              <>
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Current Open Session</h2>
                      <p className="text-sm text-muted-foreground">
                        {currentSession.branch} &bull; {currentSession.shift} Shift &bull; Opened {formatDate(currentSession.sessionDate)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowItemForm(true)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                      >
                        Add Item
                      </button>
                      <button
                        onClick={handleCloseTill}
                        disabled={closingTill}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {closingTill ? 'Closing...' : 'Close Till'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground mb-1">Expected</p>
                      <p className="text-xl font-bold text-foreground">{formatCurrency(currentSession.expected)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground mb-1">Cash Received</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(currentSession.cashReceived)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground mb-1">M-Pesa Received</p>
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(currentSession.mpesaReceived)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground mb-1">Variance</p>
                      <p className={`text-xl font-bold ${currentSession.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(Math.abs(currentSession.variance))}
                        {currentSession.variance < 0 ? ' (Short)' : currentSession.variance > 0 ? ' (Over)' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Line Items</h2>
                  {loadingItems ? (
                    <div className="text-center py-8 text-muted-foreground">Loading items...</div>
                  ) : tillItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No items recorded yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Detail</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tillItems.map((item) => (
                            <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                              <td className="py-3 px-4 text-foreground">{item.type}</td>
                              <td className="py-3 px-4 text-foreground font-mono text-sm">{item.reference}</td>
                              <td className="py-3 px-4 text-foreground">{item.detail}</td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  item.method === 'Cash'
                                    ? 'bg-green-100 text-green-800'
                                    : item.method === 'Mpesa'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.method}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-medium text-foreground">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">No Active Till Session</h2>
                <p className="text-muted-foreground mb-6">Open a new till session to start recording transactions</p>
                <button
                  onClick={() => setShowOpenTillForm(true)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Open Till
                </button>
              </div>
            )}

            {showOpenTillForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="rounded-xl border border-border bg-card p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-foreground">Open Till Session</h2>
                    <button onClick={() => setShowOpenTillForm(false)} className="text-muted-foreground hover:text-foreground">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleOpenTill} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Branch</label>
                      <input
                        type="text"
                        value={openTillForm.branch}
                        onChange={(e) => setOpenTillForm({ ...openTillForm, branch: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter branch name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Shift</label>
                      <select
                        value={openTillForm.shift}
                        onChange={(e) => setOpenTillForm({ ...openTillForm, shift: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Night">Night</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Expected Amount (KES)</label>
                      <input
                        type="number"
                        value={openTillForm.expected}
                        onChange={(e) => setOpenTillForm({ ...openTillForm, expected: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowOpenTillForm(false)}
                        className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={openingTill}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {openingTill ? 'Opening...' : 'Open Till'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showItemForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="rounded-xl border border-border bg-card p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-foreground">Add Line Item</h2>
                    <button onClick={() => setShowItemForm(false)} className="text-muted-foreground hover:text-foreground">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                      <input
                        type="text"
                        value={itemForm.type}
                        onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Fare, Fuel, Expense"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Reference</label>
                      <input
                        type="text"
                        value={itemForm.ref}
                        onChange={(e) => setItemForm({ ...itemForm, ref: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g. Receipt no., Route"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Detail</label>
                      <input
                        type="text"
                        value={itemForm.detail}
                        onChange={(e) => setItemForm({ ...itemForm, detail: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Brief description"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Method</label>
                      <select
                        value={itemForm.method}
                        onChange={(e) => setItemForm({ ...itemForm, method: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      >
                        <option value="Cash">Cash</option>
                        <option value="Mpesa">Mpesa</option>
                        <option value="Card">Card</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Amount (KES)</label>
                      <input
                        type="number"
                        value={itemForm.amount}
                        onChange={(e) => setItemForm({ ...itemForm, amount: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowItemForm(false)}
                        className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addingItem}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {addingItem ? 'Adding...' : 'Add Item'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Deposits' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowDepositForm(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Submit Deposit
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Deposits</h2>
              {loadingDeposits ? (
                <div className="text-center py-8 text-muted-foreground">Loading deposits...</div>
              ) : deposits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No deposits recorded</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Agent</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bank</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Account</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Reference</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.map((deposit) => (
                        <tr key={deposit.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4 text-foreground text-sm">{formatDate(deposit.depositDate)}</td>
                          <td className="py-3 px-4 text-foreground text-sm">{deposit.agentId}</td>
                          <td className="py-3 px-4 text-foreground">{deposit.bankName}</td>
                          <td className="py-3 px-4 text-foreground font-mono text-sm">{deposit.accountNumber}</td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">{formatCurrency(deposit.amount)}</td>
                          <td className="py-3 px-4 text-foreground font-mono text-sm">{deposit.bankReference}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                              {deposit.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {showDepositForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="rounded-xl border border-border bg-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-foreground">Submit Deposit</h2>
                    <button onClick={() => setShowDepositForm(false)} className="text-muted-foreground hover:text-foreground">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleSubmitDeposit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Branch</label>
                        <input
                          type="text"
                          value={depositForm.branch}
                          onChange={(e) => setDepositForm({ ...depositForm, branch: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter branch"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Till Session Reference</label>
                        <input
                          type="text"
                          value={depositForm.tillSessionRef}
                          onChange={(e) => setDepositForm({ ...depositForm, tillSessionRef: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={depositForm.bankName}
                          onChange={(e) => setDepositForm({ ...depositForm, bankName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="e.g. KCB, Equity"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Account Number</label>
                        <input
                          type="text"
                          value={depositForm.accountNumber}
                          onChange={(e) => setDepositForm({ ...depositForm, accountNumber: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Enter account number"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Amount (KES)</label>
                        <input
                          type="number"
                          value={depositForm.amount}
                          onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Deposit Date</label>
                        <input
                          type="date"
                          value={depositForm.depositDate}
                          onChange={(e) => setDepositForm({ ...depositForm, depositDate: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Bank Reference</label>
                      <input
                        type="text"
                        value={depositForm.bankReference}
                        onChange={(e) => setDepositForm({ ...depositForm, bankReference: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter bank reference number"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Receipt Name</label>
                      <input
                        type="text"
                        value={depositForm.receiptName}
                        onChange={(e) => setDepositForm({ ...depositForm, receiptName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Name on receipt"
                        required
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowDepositForm(false)}
                        className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingDeposit}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        {submittingDeposit ? 'Submitting...' : 'Submit Deposit'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Summary' && (
          <div className="space-y-6">
            {loadingSummary ? (
              <div className="text-center py-12 text-muted-foreground">Loading summary...</div>
            ) : summary ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground mb-2">Today Expected</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(summary.todayExpected)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground mb-2">Today Cash</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.todayCash)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground mb-2">Today M-Pesa</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.todayMpesa)}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground mb-2">Avg Variance</p>
                  <p className={`text-2xl font-bold ${summary.avgVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(summary.avgVariance))}
                    {summary.avgVariance < 0 ? ' (Short)' : summary.avgVariance > 0 ? ' (Over)' : ''}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <p className="text-sm text-muted-foreground mb-2">Pending Deposits</p>
                  <p className="text-2xl font-bold text-yellow-600">{summary.pendingDeposits}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">No summary data available</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
