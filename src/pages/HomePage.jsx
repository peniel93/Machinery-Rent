import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAlert } from '../context/AlertContext';
import { mockDb, subscribeToDb } from '../lib/supabaseClient';
import { 
  Truck, MapPin, Phone, Mail, Award, CheckCircle, Video, Image as ImageIcon, Calendar,
  ChevronLeft, ChevronRight, Tag, Percent, ArrowRight, Send
} from 'lucide-react';

export const HomePage = ({ setActiveTab }) => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();
  const [settings, setSettings] = useState({
    site_title: 'Construction Machinery Rent Portal System',
    hero_bg_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=80',
    about_text: 'Providing reliable heavy machinery rental solutions across Ethiopia for construction, road works, and urban infrastructure development.',
    contact_phone: '+251 911 000 111',
    contact_email: 'info@machineryrent.org',
    church_organization_address: 'Bole Subcity, Woreda 03, Addis Ababa, Ethiopia',
    google_map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126105.81152062544!2d38.70777174621946!3d8.980603417724128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set'
  });

  const [machineries, setMachineries] = useState([]);
  const [discountedMachineries, setDiscountedMachineries] = useState([]);
  const [moments, setMoments] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  const [contactForm, setContactForm] = useState({
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    topic: 'General Machinery Inquiry',
    message: ''
  });

  const handleSendContactMessage = (e) => {
    e.preventDefault();
    if (!contactForm.sender_name || !contactForm.sender_email || !contactForm.message) {
      showAlert('Please fill in your name, email, and message body.', 'danger');
      return;
    }

    mockDb.insertRow('reports', {
      sender_id: 'public-client',
      sender_role: `Public Client (${contactForm.sender_name})`,
      title: `Contact Inquiry: ${contactForm.topic}`,
      content: `From: ${contactForm.sender_name} <${contactForm.sender_email}>\nPhone: ${contactForm.sender_phone || 'N/A'}\nTopic: ${contactForm.topic}\n\nMessage:\n${contactForm.message}`,
      status: 'Pending',
      registrar_comments: ''
    });

    showAlert('Thank you for contacting us! Your inquiry has been submitted directly to our Registrar team.', 'success', 6000);
    setContactForm({
      sender_name: '',
      sender_email: '',
      sender_phone: '',
      topic: 'General Machinery Inquiry',
      message: ''
    });
  };

  useEffect(() => {
    const loadData = () => {
      const fetchedSettings = mockDb.getTable('portal_settings', []);
      if (fetchedSettings.length > 0) setSettings(fetchedSettings[0]);

      const fetchedMachinery = mockDb.getTable('machinery', []);
      setMachineries(fetchedMachinery);

      // Filter featured / discounted machineries for slider (fallback to all if no discounts set)
      const discounted = fetchedMachinery.filter(m => (m.discount_percent || 0) > 0);
      setDiscountedMachineries(discounted.length > 0 ? discounted : fetchedMachinery);

      const fetchedMoments = mockDb.getTable('gallery_moments', []);
      setMoments(fetchedMoments);
    };

    loadData();
    const unsubscribe = subscribeToDb(loadData);
    return () => unsubscribe();
  }, []);

  // Auto-play slider interval
  useEffect(() => {
    if (discountedMachineries.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % discountedMachineries.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [discountedMachineries.length]);

  const handlePrevSlide = () => {
    setActiveSlide(prev => (prev === 0 ? discountedMachineries.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide(prev => (prev + 1) % discountedMachineries.length);
  };

  const currentFeatured = discountedMachineries[activeSlide];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', paddingBottom: '3rem' }}>
      {/* Hero Banner Section */}
      <div 
        style={{
          position: 'relative',
          minHeight: '440px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `linear-gradient(to right, rgba(12, 74, 110, 0.92), rgba(2, 132, 199, 0.7)), url(${settings.hero_bg_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          padding: '3rem 2.5rem',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <span style={{ 
            display: 'inline-block', 
            padding: '0.35rem 0.85rem', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '20px', 
            fontSize: '0.85rem', 
            fontWeight: 700, 
            marginBottom: '1rem',
            backdropFilter: 'blur(8px)'
          }}>
            ⚡ Certified Heavy Equipment Rental Portal
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.25, marginBottom: '1.25rem' }}>
            {t('heroTitle')}
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.95, lineHeight: 1.6, marginBottom: '2rem' }}>
            {settings.about_text}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <button 
              onClick={() => setActiveTab('machineries')} 
              className="btn-primary"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            >
              <Truck size={20} /> {t('exploreMachinery')}
            </button>
            <button 
              onClick={() => setActiveTab('vacancies')} 
              className="btn-secondary"
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', backgroundColor: '#ffffff', color: '#0284c7', border: 'none' }}
            >
              <Calendar size={20} /> {t('applyJob')}
            </button>
          </div>
        </div>
      </div>

      {/* FEATURED DISCOUNTED MACHINERY SLIDER / CAROUSEL */}
      {currentFeatured && (
        <div className="card-glass" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Percent size={16} /> FEATURED DISCOUNT DEALS
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Special rental offers for instant deployment</span>
            </div>
            {/* Slider Controls */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={handlePrevSlide}
                style={{ background: 'var(--primary-100)', border: 'none', color: 'var(--primary-700)', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleNextSlide}
                style={{ background: 'var(--primary-100)', border: 'none', color: 'var(--primary-700)', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'center' }}>
            {/* Left Content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-info">{currentFeatured.type}</span>
                <span className={`badge ${currentFeatured.available_count > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {currentFeatured.available_count} / {currentFeatured.quantity} Available
                </span>
                {currentFeatured.discount_percent > 0 && (
                  <span className="badge" style={{ backgroundColor: '#16a34a', color: '#ffffff', fontWeight: 800 }}>
                    SAVE {currentFeatured.discount_percent}% OFF
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {currentFeatured.name}
              </h2>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {currentFeatured.description || 'Heavy-duty performance equipment fully inspected and serviced for maximum site uptime.'}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unit Plates:</span>
                {currentFeatured.plate_number ? currentFeatured.plate_number.split(',').map((p, idx) => (
                  <code key={idx} style={{ background: 'var(--primary-50)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.825rem' }}>
                    {p.trim()}
                  </code>
                )) : <code>ET-N/A</code>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: currentFeatured.discount_percent > 0 ? 'line-through' : 'none' }}>
                    ${currentFeatured.price_per_hour}/hr regular rate
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--primary-600)' }}>
                    ${(currentFeatured.price_per_hour * (1 - (currentFeatured.discount_percent || 0)/100)).toFixed(2)}
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}> / hr</span>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('machineries')}
                  className="btn-primary"
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Truck size={20} /> Rent Equipment Now <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Right Image Container */}
            <div style={{
              width: '100%',
              height: '260px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}>
              <img 
                src={currentFeatured.image_url} 
                alt={currentFeatured.name} 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 10px 16px rgba(0,0,0,0.18))'
                }}
              />
            </div>
          </div>

          {/* Dots Navigation */}
          {discountedMachineries.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
              {discountedMachineries.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  style={{
                    width: idx === activeSlide ? '24px' : '10px',
                    height: '10px',
                    borderRadius: '5px',
                    backgroundColor: idx === activeSlide ? 'var(--primary-600)' : 'var(--border-color)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPACT E-COMMERCE MACHINERY CATALOG GRID */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              E-Commerce Machinery Inventory Catalog
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Compact equipment catalog with instant rental booking.
            </p>
          </div>
          <button onClick={() => setActiveTab('machineries')} className="btn-secondary">
            View Full Directory ({machineries.length})
          </button>
        </div>

        {/* 4-COLUMN COMPACT E-COMMERCE GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {machineries.map(item => {
            const discountedRate = item.price_per_hour * (1 - (item.discount_percent || 0)/100);

            return (
              <div 
                key={item.id} 
                className="card-glass" 
                style={{ 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  border: '1px solid var(--border-color)',
                  position: 'relative'
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
                  height: '160px',
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

                {/* Compact E-Commerce Product Body */}
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-600)', background: 'var(--primary-50)', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.type}
                    </span>
                    <span className={`badge ${item.available_count > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.725rem' }}>
                      {item.available_count} Left
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </h3>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '3px', alignItems: 'center' }}>
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

                  <div style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        {item.discount_percent > 0 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginRight: '4px' }}>
                            ${item.price_per_hour}
                          </span>
                        )}
                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-700)' }}>
                          ${discountedRate.toFixed(2)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/hr</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab('machineries')}
                      className="btn-primary btn-sm"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '0.5rem' }}
                    >
                      <Truck size={14} /> Rent Machinery
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Moments & Video / Image Gallery */}
      {moments && moments.length > 0 && (
        <div>
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('momentsHeader')}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Latest site updates, operational moments, and video highlights.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem'
          }}>
            {moments.map(m => (
              <div key={m.id} className="card-glass" style={{ padding: '1.1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem', color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.85rem' }}>
                  {m.media_type === 'video' ? <Video size={16} /> : <ImageIcon size={16} />}
                  <span>{m.media_type?.toUpperCase()} MOMENT</span>
                </div>
                {m.media_url && (
                  <img 
                    src={m.media_url} 
                    alt={m.title} 
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.65rem' }} 
                  />
                )}
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{m.title}</h4>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {m.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modern Contact Us & Direct Inquiry Form Section */}
      <div className="card-glass" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            {t('contactUs')} & Direct Inquiry Desk
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Have questions about machinery rental rates, availability, or career applications? Send us a direct inquiry message.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Left Column: Contact Cards & Google Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ padding: '12px', background: 'var(--primary-600)', color: '#ffffff', borderRadius: '12px' }}>
                <Phone size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('phone')}</h4>
                <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-700)', margin: 0 }}>{settings.contact_phone}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ padding: '12px', background: 'var(--primary-600)', color: '#ffffff', borderRadius: '12px' }}>
                <Mail size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('email')}</h4>
                <p style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-700)', margin: 0 }}>{settings.contact_email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--primary-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ padding: '12px', background: 'var(--primary-600)', color: '#ffffff', borderRadius: '12px' }}>
                <MapPin size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{t('address')}</h4>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-700)', margin: 0 }}>{settings.church_organization_address}</p>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '220px', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
              <iframe 
                title="Google Map Location"
                src={settings.google_map_embed_url}
                width="100%" 
                height="100%" 
                style={{ border: 0, height: '100%' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right Column: Interactive Direct Contact Form */}
          <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-700)', marginBottom: '1.25rem' }}>
              Send Direct Inquiry Message
            </h3>
            <form onSubmit={handleSendContactMessage}>
              <div className="form-group">
                <label className="form-label">Your Full Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  placeholder="e.g. Abebe Kebede" 
                  value={contactForm.sender_name} 
                  onChange={e => setContactForm({ ...contactForm, sender_name: e.target.value })} 
                />
              </div>

              <div className="responsive-form-row">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    placeholder="name@company.com" 
                    value={contactForm.sender_email} 
                    onChange={e => setContactForm({ ...contactForm, sender_email: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="+251 911 000 000" 
                    value={contactForm.sender_phone} 
                    onChange={e => setContactForm({ ...contactForm, sender_phone: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Inquiry Subject / Topic *</label>
                <select 
                  className="form-select" 
                  value={contactForm.topic} 
                  onChange={e => setContactForm({ ...contactForm, topic: e.target.value })}
                >
                  <option value="General Machinery Inquiry">General Machinery Rental Inquiry</option>
                  <option value="Rental Rate & Discount Quote">Rental Rate & Discount Quotation</option>
                  <option value="Site Operation & Fleet Support">Site Operation & Fleet Technical Support</option>
                  <option value="Career & Application Status">Career & Application Status</option>
                  <option value="General Feedback & Support">General Feedback & Client Support</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Message *</label>
                <textarea 
                  rows={4} 
                  className="form-control" 
                  required 
                  placeholder="Describe your equipment requirements, project duration, or inquiry details..." 
                  value={contactForm.message} 
                  onChange={e => setContactForm({ ...contactForm, message: e.target.value })} 
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem' }}>
                <Send size={18} /> Send Message to Registrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
