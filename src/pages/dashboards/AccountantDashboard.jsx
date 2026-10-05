import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { mockDb, subscribeToDb } from '../../lib/supabaseClient';
import { ExportButtons } from '../../components/ExportButtons';
import { DollarSign, Plus, Send, CheckCircle, FileText } from 'lucide-react';

export const AccountantDashboard = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [records, setRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    record_type: 'expense',
    category: 'Operational',
    amount: '',
    reason: '',
    record_date: new Date().toISOString().split('T')[0]
  });

  const loadData = () => {
    setRecords(mockDb.getTable('financial_records', []));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDb(loadData);
    return () => unsubscribe();
  }, []);

  const handleAddRecord = (e) => {
    e.preventDefault();
    mockDb.insertRow('financial_records', {
      record_type: form.record_type,
      category: form.category,
      amount: Number(form.amount),
      reason: form.reason,
      record_date: form.record_date,
      created_by: currentUser?.id
    });

    showAlert('Financial record added successfully!', 'success');
    setModalOpen(false);
    loadData();
  };

  const handleSendReportToRegistrar = () => {
    mockDb.insertRow('reports', {
      sender_id: currentUser?.id,
      sender_role: 'Accountant',
      title: 'Accountant Income & Expense Summary Report',
      content: `Total Financial Records Logged: ${records.length}. Total Expense Amount: $${records.filter(r => r.record_type === 'expense').reduce((a, b) => a + Number(b.amount), 0).toFixed(2)}.`,
      status: 'Pending'
    });

    showAlert('Financial report submitted to Main Registrar Inbox!', 'success');
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)' }}>
            Accountant Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Record revenues collected, company expenses, export records, and send reports to the Registrar.
          </p>
        </div>

        <div className="mobile-stack mobile-full-width" style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setModalOpen(true)} className="btn-primary mobile-full-width">
            <Plus size={18} /> Record Revenue / Expense
          </button>
          <button onClick={handleSendReportToRegistrar} className="btn-secondary mobile-full-width" style={{ borderColor: 'var(--primary-500)' }}>
            <Send size={18} /> Send Report to Registrar
          </button>
        </div>
      </div>

      <div className="card-glass" style={{ padding: '1.5rem' }}>
        <ExportButtons 
          title="Accountant Financial Records"
          headers={['record_type', 'category', 'amount', 'reason', 'record_date']}
          rows={records}
          filename="accountant_financials"
        />

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount ($)</th>
                <th>Reason / Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>{r.record_date}</td>
                  <td>
                    <span className={`badge ${r.record_type === 'revenue' ? 'badge-success' : 'badge-danger'}`}>
                      {r.record_type.toUpperCase()}
                    </span>
                  </td>
                  <td>{r.category}</td>
                  <td><strong>${Number(r.amount).toFixed(2)}</strong></td>
                  <td>{r.reason}</td>
                  <td>
                    <button 
                      onClick={() => {
                        mockDb.deleteRow('financial_records', r.id);
                        loadData();
                        showAlert('Record removed.', 'info');
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Add Revenue / Expense Record</h3>
            <form onSubmit={handleAddRecord}>
              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Record Type *</label>
                  <select className="form-select" value={form.record_type} onChange={e => setForm({ ...form, record_type: e.target.value })}>
                    <option value="expense">Expense</option>
                    <option value="revenue">Revenue</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input type="text" className="form-control" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Fuel, Spare Parts" />
                </div>
              </div>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Amount ($) *</label>
                  <input type="number" className="form-control" required min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input type="date" className="form-control" required value={form.record_date} onChange={e => setForm({ ...form, record_date: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Reason & Description *</label>
                <textarea rows={3} className="form-control" required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
