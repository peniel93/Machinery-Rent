import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import { mockDb, subscribeToDb } from '../lib/supabaseClient';
import { Search, Filter, Truck, DollarSign, MapPin, Clock, CheckCircle, X, Building, FileText, PlusCircle } from 'lucide-react';

export const MachineriesPage = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [machineries, setMachineries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  // Rental Request Form Modal state
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [rentForm, setRentForm] = useState({
    organization_name: '',
    site_location: '',
    start_date: '',
    end_date: '',
    total_agreed_hours: 40
  });

  // Partner Organization Machinery Agreement Request Modal State
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    organization_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    machinery_name: '',
    machinery_type: 'Excavator',
    plate_number: '',
    quantity: 1,
    proposed_rate: 120,
    agreement_duration: '6 Months',
    description: '',
    image_url: ''
  });

  const loadData = () => {
    const data = mockDb.getTable('machinery', []);
    setMachineries(data);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDb(loadData);
    return () => unsubscribe();
  }, []);

  const filteredMachinery = machineries.filter(item => {
    if (!item) return false;
    const nameStr = (item.name || '').toLowerCase();
    const plateStr = (item.plate_number || '').toLowerCase();
    const siteStr = (item.operating_sites || '').toLowerCase();
    const priceStr = String(item.price_per_hour || '');
    const query = (searchTerm || '').toLowerCase();

    const matchesSearch = 
      nameStr.includes(query) ||
      plateStr.includes(query) ||
      siteStr.includes(query) ||
      priceStr.includes(query);

    const matchesType = filterType === 'ALL' || item.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleOpenRentModal = (item) => {
    if (item.available_count <= 0) {
      showAlert('This machinery currently has 0 available units for rent.', 'warning');
      return;
    }
    setSelectedItem(item);
    setRentForm({
      organization_name: '',
      site_location: '',
      requester_email: '',
      requester_phone: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7*86400000).toISOString().split('T')[0],
      total_agreed_hours: 40
    });
    setRentModalOpen(true);
  };

  const handleRentSubmit = (e) => {
    e.preventDefault();
    if (!rentForm.organization_name || !rentForm.site_location || !rentForm.start_date || !rentForm.end_date) {
      showAlert('Please fill in all mandatory rental agreement fields.', 'danger');
      return;
    }

    // Calculate revenue = hours * price_per_hour * (1 - discount/100)
    const rawRev = rentForm.total_agreed_hours * selectedItem.price_per_hour;
    const discountAmt = rawRev * ((selectedItem.discount_percent || 0) / 100);
    const finalRev = rawRev - discountAmt;

    // Create rental request record with status 'Pending Approval'
    mockDb.insertRow('rentals', {
      machinery_id: selectedItem.id,
      organization_name: rentForm.organization_name,
      site_location: rentForm.site_location,
      requester_email: rentForm.requester_email || 'client@organization.com',
      requester_phone: rentForm.requester_phone || '+251 911 000 000',
      start_date: rentForm.start_date,
      end_date: rentForm.end_date,
      total_agreed_hours: rentForm.total_agreed_hours,
      hourly_rate: selectedItem.price_per_hour,
      discount_applied: selectedItem.discount_percent || 0,
      calculated_revenue: finalRev,
      status: 'Pending Approval'
    });

    showAlert(`Rental request submitted for ${selectedItem.name}! Your request has been sent to the Main Registrar Admin for review and approval.`, 'success', 8000);
    setRentModalOpen(false);
    loadData();
  };

  const handlePartnerSubmit = (e) => {
    e.preventDefault();
    if (!partnerForm.organization_name || !partnerForm.machinery_name || !partnerForm.proposed_rate) {
      showAlert('Please fill in all mandatory organization agreement fields.', 'danger');
      return;
    }

    mockDb.insertRow('partner_machinery_requests', {
      ...partnerForm,
      quantity: Number(partnerForm.quantity),
      proposed_rate: Number(partnerForm.proposed_rate),
      status: 'Pending',
      is_seen: false,
      image_url: partnerForm.image_url || ''
    });

    showAlert(`Partner machinery agreement request submitted for "${partnerForm.machinery_name}"! It has been sent to the Admin Dashboard for review and approval.`, 'success', 9000);
    setPartnerModalOpen(false);
    setPartnerForm({
      organization_name: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      machinery_name: '',
      machinery_type: 'Excavator',
      plate_number: '',
      quantity: 1,
      proposed_rate: 120,
      agreement_duration: '6 Months',
      description: '',
      image_url: ''
    });
  };

  const handlePartnerImagePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartnerForm(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const typesList = ['ALL', ...new Set(machineries.map(m => m.type))];

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Header & Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Construction Machinery Directory
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Search machinery items by name, plate number, price, operating site, or working hours.
        </p>

        {/* Partner Organization Rental Agreement Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary-700) 0%, var(--primary-900) 100%)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 700, opacity: 0.9 }}>
              <Building size={16} /> Partner Organization Fleet Program
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.25rem 0' }}>
              Want to Rent / List Your Machineries to Our Company?
            </h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, margin: 0 }}>
              Submit your machinery rental agreement proposal. Our Admins review and approve requests to integrate items into our active rental fleet.
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setPartnerModalOpen(true)}
            className="btn-primary"
            style={{ backgroundColor: '#ffffff', color: 'var(--primary-800)', fontWeight: 800, padding: '0.65rem 1.25rem', border: 'none' }}
          >
            <FileText size={18} /> Rent / Post Your Machinery To Us
          </button>
        </div>

        {/* Search Controls */}
        <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
            {!searchTerm && <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />}
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by name, plate, site, price..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: searchTerm ? '0.875rem' : '2.5rem', transition: 'padding-left 0.2s ease' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} className="text-primary-600" />
            <select 
              className="form-select" 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ minWidth: '160px' }}
            >
              {typesList.map(t => (
                <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* E-Commerce Machinery Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredMachinery.map(item => {
          const discountedRate = item.price_per_hour * (1 - (item.discount_percent || 0)/100);

          return (
            <div 
              key={item.id} 
              className="card-glass" 
              style={{ 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'relative',
                border: '1px solid var(--border-color)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              {/* Floating Discount Pill */}
              {item.discount_percent > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  zIndex: 2,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                }}>
                  -{item.discount_percent}% OFF
                </span>
              )}

              {/* Compact Product Image */}
              <div style={{
                width: '100%',
                height: '170px',
                backgroundColor: 'var(--primary-50)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.65rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '100%', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.12))'
                  }} 
                />
              </div>

              {/* Product Body */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '2px 6px', borderRadius: '4px' }}>
                    {item.type}
                  </span>
                  <span className={`badge ${item.available_count > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.725rem' }}>
                    {item.available_count} Left
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </h3>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem', display: 'flex', flexWrap: 'wrap', gap: '3px', alignItems: 'center' }}>
                  <span>Plates:</span>
                  {item.plate_number ? item.plate_number.split(',').slice(0, 2).map((p, idx) => (
                    <code key={idx} style={{ background: 'var(--bg-surface)', padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--border-color)', color: 'var(--primary-700)', fontSize: '0.725rem' }}>
                      {p.trim()}
                    </code>
                  )) : <code>N/A</code>}
                  {item.plate_number && item.plate_number.split(',').length > 2 && (
                    <span style={{ fontSize: '0.7rem' }}>+{item.plate_number.split(',').length - 2} more</span>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.85rem', background: 'var(--primary-50)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <MapPin size={13} className="text-primary-600 flex-shrink-0" />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>Site: {item.operating_sites || 'Warehouse'}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      {item.discount_percent > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: '4px' }}>
                          ${item.price_per_hour}
                        </span>
                      )}
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary-700)' }}>
                        ${discountedRate.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/hr</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleOpenRentModal(item)}
                    className="btn-primary btn-sm"
                    disabled={item.available_count <= 0}
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.5rem', opacity: item.available_count <= 0 ? 0.6 : 1 }}
                  >
                    <Truck size={14} /> {item.available_count > 0 ? t('rentNow') : 'Fully Rented'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rent Dedicated Modal Form */}
      {rentModalOpen && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                Rent Machinery Agreement Form
              </h3>
              <button 
                type="button" 
                onClick={() => setRentModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontWeight: 700 }}>{selectedItem.name}</h4>
              <p style={{ fontSize: '0.875rem' }}>Plate: {selectedItem.plate_number} | Rate: ${selectedItem.price_per_hour}/hr | Discount: {selectedItem.discount_percent}%</p>
            </div>

            <form onSubmit={handleRentSubmit}>
              <div className="form-group">
                <label className="form-label">Renting Organization / Company Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={rentForm.organization_name}
                  onChange={(e) => setRentForm({ ...rentForm, organization_name: e.target.value })}
                  placeholder="e.g. Ethiopian Roads Contracting Corp"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Operating Construction Site Location *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required
                  value={rentForm.site_location}
                  onChange={(e) => setRentForm({ ...rentForm, site_location: e.target.value })}
                  placeholder="e.g. Modjo-Hawassa Highway Project Site #4"
                />
              </div>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Contact Email *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required
                    value={rentForm.requester_email}
                    onChange={(e) => setRentForm({ ...rentForm, requester_email: e.target.value })}
                    placeholder="organization@email.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required
                    value={rentForm.requester_phone}
                    onChange={(e) => setRentForm({ ...rentForm, requester_phone: e.target.value })}
                    placeholder="+251 911 000 000"
                  />
                </div>
              </div>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required
                    value={rentForm.start_date}
                    onChange={(e) => setRentForm({ ...rentForm, start_date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required
                    value={rentForm.end_date}
                    onChange={(e) => setRentForm({ ...rentForm, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Agreed Total Operating Hours *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  required
                  min="1"
                  value={rentForm.total_agreed_hours}
                  onChange={(e) => setRentForm({ ...rentForm, total_agreed_hours: Number(e.target.value) })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setRentModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle size={18} /> Confirm & Save Rental
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Partner Organization Machinery Rental Agreement Proposal Modal */}
      {partnerModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Building className="text-primary-600" size={20} /> Rent / Post Your Machinery To Us
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Submit an organization agreement to list your heavy machinery for rental through our company.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setPartnerModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePartnerSubmit}>
              <div style={{ background: 'var(--primary-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '0.25rem' }}>
                  1. Organization & Contact Details
                </h4>
                <div className="responsive-form-row" style={{ marginTop: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Organization Name *</label>
                    <input type="text" className="form-control" required value={partnerForm.organization_name} onChange={e => setPartnerForm({ ...partnerForm, organization_name: e.target.value })} placeholder="e.g. Ethiopian Construction Corp" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Contact Representative *</label>
                    <input type="text" className="form-control" required value={partnerForm.contact_name} onChange={e => setPartnerForm({ ...partnerForm, contact_name: e.target.value })} placeholder="e.g. Eng. Samuel Girma" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Contact Email *</label>
                    <input type="email" className="form-control" required value={partnerForm.contact_email} onChange={e => setPartnerForm({ ...partnerForm, contact_email: e.target.value })} placeholder="partner@company.com" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Contact Phone *</label>
                    <input type="text" className="form-control" required value={partnerForm.contact_phone} onChange={e => setPartnerForm({ ...partnerForm, contact_phone: e.target.value })} placeholder="+251 911 223 344" />
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-800)', marginBottom: '0.25rem' }}>
                  2. Machinery Specs & Proposed Agreement Terms
                </h4>
                <div className="responsive-form-row" style={{ marginTop: '0.5rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Machinery Name & Model *</label>
                    <input type="text" className="form-control" required value={partnerForm.machinery_name} onChange={e => setPartnerForm({ ...partnerForm, machinery_name: e.target.value })} placeholder="e.g. CAT D9 Bulldozer" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Machinery Type *</label>
                    <select className="form-select" value={partnerForm.machinery_type} onChange={e => setPartnerForm({ ...partnerForm, machinery_type: e.target.value })}>
                      <option value="Excavator">Excavator</option>
                      <option value="Bulldozer">Bulldozer</option>
                      <option value="Crane">Crane</option>
                      <option value="Loader">Loader</option>
                      <option value="Roller">Roller</option>
                      <option value="Dump Truck">Dump Truck</option>
                      <option value="Other Heavy Equipment">Other Heavy Equipment</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Plate / Chassis Number *</label>
                    <input type="text" className="form-control" required value={partnerForm.plate_number} onChange={e => setPartnerForm({ ...partnerForm, plate_number: e.target.value })} placeholder="e.g. ET-88210-AA" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Available Quantity *</label>
                    <input type="number" className="form-control" required min="1" value={partnerForm.quantity} onChange={e => setPartnerForm({ ...partnerForm, quantity: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Proposed Hourly Rate ($/hr) *</label>
                    <input type="number" className="form-control" required min="1" value={partnerForm.proposed_rate} onChange={e => setPartnerForm({ ...partnerForm, proposed_rate: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Proposed Agreement Duration *</label>
                    <input type="text" className="form-control" required value={partnerForm.agreement_duration} onChange={e => setPartnerForm({ ...partnerForm, agreement_duration: e.target.value })} placeholder="e.g. 6 Months / 1 Year" />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Machinery Image (Upload File or URL)</label>
                  <input type="file" accept="image/*" className="form-control" onChange={handlePartnerImagePick} style={{ marginBottom: '0.4rem' }} />
                  <input type="url" className="form-control" value={partnerForm.image_url} onChange={e => setPartnerForm({ ...partnerForm, image_url: e.target.value })} placeholder="Or paste image URL (https://...)" />
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Agreement Terms & Equipment Condition *</label>
                  <textarea rows={3} className="form-control" required value={partnerForm.description} onChange={e => setPartnerForm({ ...partnerForm, description: e.target.value })} placeholder="Specify machinery condition, maintenance responsibility, operator details, and rental agreement terms..." />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setPartnerModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--primary-700)' }}>
                  <CheckCircle size={18} /> Submit Agreement Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
