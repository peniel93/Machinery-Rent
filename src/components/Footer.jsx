import React, { useState, useEffect } from 'react';
import { mockDb, subscribeToDb } from '../lib/supabaseClient';
import { Phone, Mail, MapPin, ChevronUp, ArrowUp, ExternalLink, ChevronRight } from 'lucide-react';

const FooterLinkButton = ({ onClick, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button 
      onClick={onClick} 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        background: 'none', 
        border: 'none', 
        color: hovered ? 'var(--primary-700)' : 'var(--primary-600)', 
        cursor: 'pointer', 
        padding: 0, 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.4rem',
        fontWeight: 600,
        fontSize: '0.875rem',
        textDecoration: hovered ? 'underline' : 'none',
        transform: hovered ? 'translateX(5px)' : 'translateX(0)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <ChevronRight size={15} style={{ color: hovered ? 'var(--primary-700)' : 'var(--primary-500)', transition: 'color 0.2s ease' }} />
      {children}
    </button>
  );
};

const defaultPortalSettings = {
  site_title: 'Construction Machinery Rent Portal System',
  copyright_text: 'Construction Machinery Rental Organization',
  copyright_year: 2026,
  contact_phone: '+251 911 000 111',
  contact_email: 'info@machineryrent.org',
  church_organization_address: 'Bole Subcity, Woreda 03, Addis Ababa, Ethiopia',
  telegram_url: 'https://t.me',
  whatsapp_url: 'https://wa.me',
  tiktok_url: 'https://tiktok.com',
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
  twitter_url: 'https://twitter.com',
  youtube_url: 'https://youtube.com'
};

export const Footer = ({ activeTab, setActiveTab }) => {
  const [settings, setSettings] = useState(defaultPortalSettings);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const syncSettings = () => {
      const fetched = mockDb.getTable('portal_settings', [defaultPortalSettings]);
      if (fetched.length > 0) {
        setSettings(fetched[0]);
      }
    };

    syncSettings();
    const unsubscribe = subscribeToDb(syncSettings);

    const handleScroll = () => {
      if (window.scrollY > 250) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Do not show the footer while users are inside their dashboards
  if (activeTab === 'dashboard') {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleNavClick = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
    scrollToTop();
  };

  const phoneDisplay = settings.contact_phone || defaultPortalSettings.contact_phone;
  const emailDisplay = settings.contact_email || defaultPortalSettings.contact_email;
  const addressDisplay = settings.church_organization_address || defaultPortalSettings.church_organization_address;
  const copyrightTextDisplay = settings.copyright_text || defaultPortalSettings.copyright_text;
  const copyrightYearDisplay = settings.copyright_year || defaultPortalSettings.copyright_year;

  const socialLinks = [
    { 
      name: 'Telegram', 
      url: settings.telegram_url || 'https://t.me', 
      color: '#0088cc',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.48-.01-1.4-.27-2.09-.49-.85-.27-1.53-.42-1.47-.88.03-.24.37-.49 1.02-.75 3.99-1.74 6.66-2.89 8.01-3.45 3.81-1.59 4.6-1.87 5.12-1.88.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.16-.04.24z"/>
        </svg>
      )
    },
    { 
      name: 'WhatsApp', 
      url: settings.whatsapp_url || 'https://wa.me', 
      color: '#25D366',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      )
    },
    { 
      name: 'TikTok', 
      url: settings.tiktok_url || 'https://tiktok.com', 
      color: '#ff0050',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 1.83 6.338 6.338 0 0 0 4.464 10.741 6.34 6.34 0 0 0 6.342-6.34V9.33a8.212 8.212 0 0 0 4.821 1.558V7.44a4.8 4.8 0 0 1-1.004-.754z"/>
        </svg>
      )
    },
    { 
      name: 'Facebook', 
      url: settings.facebook_url || 'https://facebook.com', 
      color: '#1877F2',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: 'Instagram', 
      url: settings.instagram_url || 'https://instagram.com', 
      color: '#E4405F',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    { 
      name: 'Twitter', 
      url: settings.twitter_url || 'https://twitter.com', 
      color: '#1DA1F2',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
        </svg>
      )
    },
    { 
      name: 'YouTube', 
      url: settings.youtube_url || 'https://youtube.com', 
      color: '#FF0000',
      svg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ];

  return (
    <>
      <footer style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 1.5rem 1.5rem 1.5rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {/* About Section */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-600)', marginBottom: '0.75rem' }}>
              {settings.site_title || 'Construction Machinery Rent Portal'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Comprehensive heavy machinery rental management system providing transparent hourly pricing, real-time operating site tracking, and streamlined recruitment.
            </p>
            {/* Social Media Icons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {socialLinks.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-50)',
                    color: s.color,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition-fast)',
                    border: '1px solid var(--border-color)',
                    textDecoration: 'none'
                  }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links Column */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Navigation Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <FooterLinkButton onClick={() => handleNavClick('home')}>
                  Home Page
                </FooterLinkButton>
              </li>
              <li>
                <FooterLinkButton onClick={() => handleNavClick('machineries')}>
                  Rent Equipment & Machineries
                </FooterLinkButton>
              </li>
              <li>
                <FooterLinkButton onClick={() => handleNavClick('vacancies')}>
                  Vacancies & Career Noticeboard
                </FooterLinkButton>
              </li>
              <li>
                <FooterLinkButton onClick={() => handleNavClick('login')}>
                  Portal Staff Login
                </FooterLinkButton>
              </li>
              <li>
                <FooterLinkButton onClick={() => handleNavClick('profile')}>
                  My User Profile
                </FooterLinkButton>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <FooterLinkButton onClick={() => handleNavClick('machineries')}>
                  Equipment Inventory Catalog
                </FooterLinkButton>
              </li>
              <li>
                <FooterLinkButton onClick={() => handleNavClick('vacancies')}>
                  Written Exam & Interview Schedules
                </FooterLinkButton>
              </li>
              <li>
                <FooterLinkButton onClick={() => handleNavClick('machineries')}>
                  Rental Rates & Discount Offers
                </FooterLinkButton>
              </li>
              <li>
                <FooterLinkButton onClick={() => handleNavClick('vacancies')}>
                  Check Application & Exam Results
                </FooterLinkButton>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Contact & Office Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--primary-50)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <Phone size={16} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{phoneDisplay}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'var(--primary-50)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <Mail size={16} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{emailDisplay}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', background: 'var(--primary-50)', padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <MapPin size={16} style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: '3px' }} />
                <span style={{ fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{addressDisplay}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Scroll to Top Bar */}
        <div 
          className="mobile-stack"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '0.875rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © {copyrightYearDisplay} {copyrightTextDisplay}. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span>Construction Machinery Rent Portal</span>
            <button 
              onClick={scrollToTop}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-600)',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.85rem'
              }}
            >
              <ArrowUp size={14} /> Back to Top
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Go To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Scroll smoothly to top"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 999,
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-600)',
            color: '#ffffff',
            border: 'none',
            boxShadow: '0 6px 16px rgba(2, 132, 199, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.08)';
            e.currentTarget.style.backgroundColor = 'var(--primary-700)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.backgroundColor = 'var(--primary-600)';
          }}
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
};
