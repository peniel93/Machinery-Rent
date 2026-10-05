import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { mockDb, subscribeToDb } from '../../lib/supabaseClient';
import { MapPin, Clock, Activity, Send, CheckCircle, Plus } from 'lucide-react';

export const SiteWorkerDashboard = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [myShifts, setMyShifts] = useState([]);
  const [sitePartners, setSitePartners] = useState([]);
  const [machineries, setMachineries] = useState([]);
  const [siteUpdates, setSiteUpdates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    machinery_id: '',
    hours_logged: 8,
    machinery_health: 'Excellent',
    condition_notes: ''
  });

  const loadData = () => {
    const allShifts = mockDb.getTable('worker_shifts', []);
    const userShifts = allShifts.filter(s => s.user_id === currentUser?.id);
    setMyShifts(userShifts);

    const allUsers = mockDb.getTable('profiles', []);
    // Partners on same site
    const mySites = userShifts.map(s => s.site_location);
    const partners = allShifts
      .filter(s => mySites.includes(s.site_location) && s.user_id !== currentUser?.id)
      .map(s => {
        const u = allUsers.find(usr => usr.id === s.user_id);
        return { ...s, user_name: u?.full_name, user_role: u?.role };
      });
    setSitePartners(partners);

    const m = mockDb.getTable('machinery', []);
    setMachineries(m);

    setSiteUpdates(mockDb.getTable('site_updates', []));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDb(loadData);
    return () => unsubscribe();
  }, []);

  const handleSendSiteUpdate = (e) => {
    e.preventDefault();
    if (!updateForm.machinery_id) {
      showAlert('Please select a machinery item to report on.', 'danger');
      return;
    }

    mockDb.insertRow('site_updates', {
      site_worker_id: currentUser?.id,
      machinery_id: updateForm.machinery_id,
      hours_logged: Number(updateForm.hours_logged),
      machinery_health: updateForm.machinery_health,
      condition_notes: updateForm.condition_notes,
      created_at: new Date().toISOString()
    });

    // Also send report to Manager & Main Registrar
    const mac = machineries.find(m => m.id === updateForm.machinery_id);
    mockDb.insertRow('reports', {
      sender_id: currentUser?.id,
      sender_role: 'Site Worker',
      title: `Site Machinery Health Report - ${mac?.name || 'Equipment'}`,
      content: `Logged Hours: ${updateForm.hours_logged} hrs. Machinery Health: ${updateForm.machinery_health}. Notes: ${updateForm.condition_notes}`,
      status: 'Pending'
    });

    showAlert('Site condition update & health report submitted to Manager & Registrar!', 'success');
    setModalOpen(false);
    loadData();
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)' }}>
            Site Worker Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            View assigned shifts & partners, log machinery health, working hours, and report site conditions.
          </p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn-primary mobile-full-width">
          <Plus size={18} /> Log Machinery Condition Update
        </button>
      </div>

      {/* Assigned Shift & Shift Partners Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin className="text-primary-600" size={18} /> My Assigned Shifts & Sites
          </h3>
          {myShifts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No shift assigned yet by Manager.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myShifts.map(s => (
                <div key={s.id} style={{ background: 'var(--primary-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--primary-800)' }}>{s.site_location}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Days: {Array.isArray(s.shift_days) ? s.shift_days.join(', ') : s.shift_days} ({s.start_time} - {s.end_time})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock className="text-primary-600" size={18} /> Shift Partners at My Site
          </h3>
          {sitePartners.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No other workers assigned to your site shift yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sitePartners.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span><strong>{p.user_name}</strong> ({p.user_role})</span>
                  <span className="badge badge-info">{p.site_location}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submitted Machinery Condition Updates Log */}
      <div className="card-glass" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Submitted Machinery Health & Hours Log</h3>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date Logged</th>
                <th>Machinery</th>
                <th>Hours Logged</th>
                <th>Health Condition</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {siteUpdates.map(u => {
                const mac = machineries.find(m => m.id === u.machinery_id);
                return (
                  <tr key={u.id}>
                    <td>{new Date(u.created_at).toLocaleString()}</td>
                    <td><strong>{mac?.name || 'Equipment'}</strong> ({mac?.plate_number})</td>
                    <td>{u.hours_logged} hrs</td>
                    <td><span className="badge badge-success">{u.machinery_health}</span></td>
                    <td>{u.condition_notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Condition Update Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Log Machinery Condition Update</h3>
            <form onSubmit={handleSendSiteUpdate}>
              <div className="form-group">
                <label className="form-label">Select Machinery *</label>
                <select className="form-select" required value={updateForm.machinery_id} onChange={e => setUpdateForm({ ...updateForm, machinery_id: e.target.value })}>
                  <option value="">-- Choose Machinery --</option>
                  {machineries.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.plate_number})</option>
                  ))}
                </select>
              </div>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Working Hours Logged Today *</label>
                  <input type="number" className="form-control" required min="0" value={updateForm.hours_logged} onChange={e => setUpdateForm({ ...updateForm, hours_logged: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Machinery Health Condition *</label>
                  <select className="form-select" value={updateForm.machinery_health} onChange={e => setUpdateForm({ ...updateForm, machinery_health: e.target.value })}>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair / Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Condition Notes & Remarks *</label>
                <textarea rows={3} className="form-control" required value={updateForm.condition_notes} onChange={e => setUpdateForm({ ...updateForm, condition_notes: e.target.value })} placeholder="State hydraulic pressure, engine performance, site terrain condition..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary"><Send size={18} /> Submit Condition Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
