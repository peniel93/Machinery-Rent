import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { mockDb, subscribeToDb } from '../../lib/supabaseClient';
import { ExportButtons } from '../../components/ExportButtons';
import { PieChart, Plus, Send, CheckCircle, TrendingUp } from 'lucide-react';

export const FinanceDashboard = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [budgetRecords, setBudgetRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    category: 'Business Operation',
    amount: '',
    reason: '',
    spend_plan: ''
  });

  const loadData = () => {
    const all = mockDb.getTable('financial_records', []);
    setBudgetRecords(all.filter(r => r.record_type === 'budget'));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDb(loadData);
    return () => unsubscribe();
  }, []);

  const handleAddBudget = (e) => {
    e.preventDefault();
    mockDb.insertRow('financial_records', {
      record_type: 'budget',
      category: form.category,
      amount: Number(form.amount),
      reason: `${form.reason} (Spend Plan: ${form.spend_plan})`,
      record_date: new Date().toISOString().split('T')[0],
      created_by: currentUser?.id
    });

    showAlert('Budget allocation recorded successfully!', 'success');
    setModalOpen(false);
    loadData();
  };

  const handleSendReport = () => {
    mockDb.insertRow('reports', {
      sender_id: currentUser?.id,
      sender_role: 'Finance',
      title: 'Finance Budget Allocation & Revenue Report',
      content: `Allocated Budgets Logged: ${budgetRecords.length}. Total Budget Allocated: $${budgetRecords.reduce((a, b) => a + Number(b.amount), 0).toFixed(2)}.`,
      status: 'Pending'
    });

    showAlert('Finance report sent to Main Registrar Inbox!', 'success');
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)' }}>
            Finance Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Record allocation of budget for business operations, spend plans, export documents, and report to Registrar.
          </p>
        </div>

        <div className="mobile-stack mobile-full-width" style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setModalOpen(true)} className="btn-primary mobile-full-width">
            <Plus size={18} /> Allocate Budget
          </button>
          <button onClick={handleSendReport} className="btn-secondary mobile-full-width">
            <Send size={18} /> Send Report to Registrar
          </button>
        </div>
      </div>

      <div className="card-glass" style={{ padding: '1.5rem' }}>
        <ExportButtons 
          title="Finance Budget Allocation Report"
          headers={['record_date', 'category', 'amount', 'reason']}
          rows={budgetRecords}
          filename="finance_budget_records"
        />

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Operation Category</th>
                <th>Allocated Amount ($)</th>
                <th>Reason & Spend Plan</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {budgetRecords.map(b => (
                <tr key={b.id}>
                  <td>{b.record_date}</td>
                  <td><span className="badge badge-info">{b.category}</span></td>
                  <td><strong style={{ color: 'var(--primary-600)' }}>${Number(b.amount).toFixed(2)}</strong></td>
                  <td>{b.reason}</td>
                  <td>
                    <button 
                      onClick={() => {
                        mockDb.deleteRow('financial_records', b.id);
                        loadData();
                        showAlert('Budget allocation record deleted.', 'warning');
                      }} 
                      className="btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Allocate Operational Budget</h3>
            <form onSubmit={handleAddBudget}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input type="text" className="form-control" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Machinery Maintenance & Logistics" />
              </div>

              <div className="form-group">
                <label className="form-label">Allocated Budget Amount ($) *</label>
                <input type="number" className="form-control" required min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea rows={2} className="form-control" required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for budget allocation" />
              </div>

              <div className="form-group">
                <label className="form-label">How Would It Be Spent (Spend Plan) *</label>
                <textarea rows={3} className="form-control" required value={form.spend_plan} onChange={e => setForm({ ...form, spend_plan: e.target.value })} placeholder="Details on spending execution" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Allocation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
