import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { mockDb, subscribeToDb } from '../../lib/supabaseClient';
import { ExportButtons } from '../../components/ExportButtons';
import { Calendar, Clock, MapPin, Users, Send, CheckCircle, Plus, Sparkles } from 'lucide-react';

export const ManagerDashboard = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [shifts, setShifts] = useState([]);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);

  // Category filter state
  const [reportCatFilter, setReportCatFilter] = useState('ALL');

  // Shift Scheduler State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [selectedDays, setSelectedDays] = useState(['Monday', 'Tuesday']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const loadData = () => {
    setShifts(mockDb.getTable('worker_shifts', []));
    setReports(mockDb.getTable('reports', []));
    setUsersList(mockDb.getTable('profiles', []));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDb(loadData);
    return () => unsubscribe();
  }, []);

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSaveShift = (e) => {
    e.preventDefault();
    if (!selectedUserId || !siteLocation || selectedDays.length === 0) {
      showAlert('Please select a user, site location, and at least one shift day.', 'danger');
      return;
    }

    mockDb.insertRow('worker_shifts', {
      user_id: selectedUserId,
      site_location: siteLocation,
      shift_days: selectedDays,
      start_time: startTime,
      end_time: endTime,
      assigned_by: currentUser?.id
    });

    const userObj = usersList.find(u => u.id === selectedUserId);
    showAlert(`Shift assigned successfully to ${userObj?.full_name || 'worker'} for ${siteLocation}!`, 'success');
    setShiftModalOpen(false);
    loadData();
  };

  const handleSendConsolidatedReport = () => {
    mockDb.insertRow('reports', {
      sender_id: currentUser?.id,
      sender_role: 'Manager',
      title: 'Consolidated Managerial Operations & Shift Report',
      content: `Total Worker Shifts Assigned: ${shifts.length}. Consolidated reports received from Accountants, Finance, Store Managers, and Site Workers. Overall operations running smoothly.`,
      status: 'Pending'
    });

    showAlert('Consolidated report submitted to Main Registrar!', 'success');
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)' }}>
            Manager Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Schedule worker shifts, assign site locations, consolidate team reports, and communicate with Registrar.
          </p>
        </div>

        <div className="mobile-stack mobile-full-width" style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShiftModalOpen(true)} className="btn-primary mobile-full-width">
            <Plus size={18} /> Schedule Worker Shift
          </button>
          <button onClick={handleSendConsolidatedReport} className="btn-secondary mobile-full-width">
            <Send size={18} /> Send Consolidated Report to Registrar
          </button>
        </div>
      </div>

      {/* Scheduled Worker Shifts */}
      <div className="card-glass" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Worker Shift & Site Assignments</h3>
        <ExportButtons 
          title="Worker Shift Roster"
          headers={['site_location', 'shift_days', 'start_time', 'end_time']}
          rows={shifts}
          filename="worker_shifts_roster"
        />

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Assigned Worker</th>
                <th>Role</th>
                <th>Site Location</th>
                <th>Shift Days</th>
                <th>Working Hours</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map(s => {
                const w = usersList.find(u => u.id === s.user_id);
                return (
                  <tr key={s.id}>
                    <td><strong>{w?.full_name || 'Worker User'}</strong></td>
                    <td><span className="badge badge-info">{w?.role || 'Staff'}</span></td>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} className="text-primary-600" /> {s.site_location}</div></td>
                    <td>{Array.isArray(s.shift_days) ? s.shift_days.join(', ') : s.shift_days}</td>
                    <td>{s.start_time} - {s.end_time}</td>
                    <td>
                      <button 
                        onClick={() => {
                          mockDb.deleteRow('worker_shifts', s.id);
                          loadData();
                          showAlert('Shift assignment removed.', 'info');
                        }} 
                        className="btn-danger btn-sm"
                      >
                        Cancel Shift
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Received Reports Inbox (Categorized & Seen/Unseen Status) */}
      <div className="card-glass" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Team Reports Received</h3>
          <ExportButtons title="Team Reports Received" headers={['sender_role', 'title', 'content', 'status', 'is_seen', 'created_at']} rows={reports} filename="manager_team_reports" />
        </div>

        {/* Sender Category Pills */}
        <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {['ALL', 'Site Worker', 'Store Manager', 'Accountant', 'Finance', 'External Partner'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setReportCatFilter(cat)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                fontSize: '0.78rem',
                fontWeight: reportCatFilter === cat ? 700 : 500,
                backgroundColor: reportCatFilter === cat ? 'var(--primary-700)' : 'var(--bg-surface)',
                color: reportCatFilter === cat ? '#ffffff' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {cat === 'ALL' ? 'All Sender Categories' : cat}
              <span style={{ marginLeft: '4px', opacity: 0.8 }}>
                ({cat === 'ALL' ? reports.length : reports.filter(r => r.sender_role === cat).length})
              </span>
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sender Category</th>
                <th>New / Old Status</th>
                <th>Title</th>
                <th>Content Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports
                .filter(r => reportCatFilter === 'ALL' || r.sender_role === reportCatFilter)
                .map(r => {
                  const isUnseen = !r.is_seen;
                  return (
                    <tr key={r.id} style={{ backgroundColor: isUnseen ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                      <td><span className="badge badge-info" style={{ fontWeight: 700 }}>{r.sender_role}</span></td>
                      <td>
                        {isUnseen ? (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 800 }}>
                            <Sparkles size={12} /> NEW (UNSEEN)
                          </span>
                        ) : (
                          <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle size={12} /> SEEN (OLD)
                          </span>
                        )}
                      </td>
                      <td><strong>{r.title}</strong></td>
                      <td>{r.content}</td>
                      <td><span className={`badge ${r.status === 'Approved' ? 'badge-success' : 'badge-info'}`}>{r.status}</span></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Shift Modal (Multi-day checkboxes, Date/Time pickers, User dropdown) */}
      {shiftModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Schedule Worker Shift & Site</h3>
            <form onSubmit={handleSaveShift}>
              <div className="form-group">
                <label className="form-label">Select Company Worker *</label>
                <select className="form-select" required value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                  <option value="">-- Choose Worker --</option>
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.role} - {u.username})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Site Location *</label>
                <input type="text" className="form-control" required value={siteLocation} onChange={e => setSiteLocation(e.target.value)} placeholder="e.g. Modjo Express Highway Site #2" />
              </div>

              <div className="form-group">
                <label className="form-label">Select Shift Days (Checkboxes) *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.5rem', marginTop: '0.35rem' }}>
                  {daysOfWeek.map(day => (
                    <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input type="time" className="form-control" required value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input type="time" className="form-control" required value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShiftModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Assign & Dispatch Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
