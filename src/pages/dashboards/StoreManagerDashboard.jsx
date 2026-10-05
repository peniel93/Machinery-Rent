import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';
import { mockDb, subscribeToDb } from '../../lib/supabaseClient';
import { ExportButtons } from '../../components/ExportButtons';
import { Package, Plus, Send, AlertOctagon, CheckCircle } from 'lucide-react';

export const StoreManagerDashboard = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    item_name: '',
    item_type: 'Spare Part',
    plate_number: '',
    quantity_normal: 5,
    quantity_defective: 0
  });

  const loadData = () => {
    setItems(mockDb.getTable('store_inventory', []));
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDb(loadData);
    return () => unsubscribe();
  }, []);

  const handleAddItem = (e) => {
    e.preventDefault();
    mockDb.insertRow('store_inventory', {
      item_name: form.item_name,
      item_type: form.item_type,
      plate_number: form.plate_number,
      quantity_normal: Number(form.quantity_normal),
      quantity_defective: Number(form.quantity_defective),
      date_added: new Date().toISOString().split('T')[0],
      created_by: currentUser?.id
    });

    showAlert('Store item added to inventory!', 'success');
    setModalOpen(false);
    loadData();
  };

  const handleSendReport = () => {
    mockDb.insertRow('reports', {
      sender_id: currentUser?.id,
      sender_role: 'Store Manager',
      title: 'Store Inventory & Equipment Condition Report',
      content: `Total Store Items Logged: ${items.length}. Total Normal Units: ${items.reduce((a, b) => a + (b.quantity_normal || 0), 0)}, Defective Units: ${items.reduce((a, b) => a + (b.quantity_defective || 0), 0)}.`,
      status: 'Pending'
    });

    showAlert('Store inventory report sent to Main Registrar Inbox!', 'success');
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)' }}>
            Store Manager Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Track store items, normal vs defective machinery parts, export data, and send reports to the Registrar.
          </p>
        </div>

        <div className="mobile-stack mobile-full-width" style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setModalOpen(true)} className="btn-primary mobile-full-width">
            <Plus size={18} /> Add Inventory Item
          </button>
          <button onClick={handleSendReport} className="btn-secondary mobile-full-width">
            <Send size={18} /> Send Report to Registrar
          </button>
        </div>
      </div>

      <div className="card-glass" style={{ padding: '1.5rem' }}>
        <ExportButtons 
          title="Store Inventory Items Report"
          headers={['item_name', 'item_type', 'plate_number', 'quantity_normal', 'quantity_defective', 'date_added']}
          rows={items}
          filename="store_inventory_report"
        />

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Item Type</th>
                <th>Associated Plate #</th>
                <th>Normal Qty</th>
                <th>Defective Qty</th>
                <th>Total Qty</th>
                <th>Date Added</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.item_name}</strong></td>
                  <td><span className="badge badge-info">{item.item_type}</span></td>
                  <td><code>{item.plate_number || 'N/A'}</code></td>
                  <td><span className="badge badge-success">{item.quantity_normal} Normal</span></td>
                  <td><span className={`badge ${item.quantity_defective > 0 ? 'badge-danger' : 'badge-info'}`}>{item.quantity_defective} Defective</span></td>
                  <td><strong>{(item.quantity_normal || 0) + (item.quantity_defective || 0)}</strong></td>
                  <td>{item.date_added}</td>
                  <td>
                    <button 
                      onClick={() => {
                        mockDb.deleteRow('store_inventory', item.id);
                        loadData();
                        showAlert('Inventory item deleted.', 'info');
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>Add Store Inventory Item</h3>
            <form onSubmit={handleAddItem}>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input type="text" className="form-control" required value={form.item_name} onChange={e => setForm({ ...form, item_name: e.target.value })} placeholder="e.g. Hydraulic Pump Assembly" />
              </div>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Item Type *</label>
                  <input type="text" className="form-control" required value={form.item_type} onChange={e => setForm({ ...form, item_type: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Plate Number (If Machinery Part)</label>
                  <input type="text" className="form-control" value={form.plate_number} onChange={e => setForm({ ...form, plate_number: e.target.value })} placeholder="e.g. ET-30241-AA" />
                </div>
              </div>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Normal Quantity *</label>
                  <input type="number" className="form-control" required min="0" value={form.quantity_normal} onChange={e => setForm({ ...form, quantity_normal: e.target.value })} />
                </div>

                <div className="form-group">
                  <label className="form-label">Defective Quantity *</label>
                  <input type="number" className="form-control" required min="0" value={form.quantity_defective} onChange={e => setForm({ ...form, quantity_defective: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
