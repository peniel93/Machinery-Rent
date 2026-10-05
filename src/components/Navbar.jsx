import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { mockDb, subscribeToDb } from '../lib/supabaseClient';
import { 
  Sun, Moon, Globe, Menu, X, User, LogOut, 
  LayoutDashboard, Truck, Briefcase, Home, ShieldCheck 
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    site_title: 'Construction Machinery Rent Portal',
    logo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=200&auto=format&fit=crop&q=80'
  });

  useEffect(() => {
    const loadSettings = () => {
      const fetched = mockDb.getTable('portal_settings', []);
      if (fetched.length > 0) {
        setSettings(fetched[0]);
      }
    };

    loadSettings();
    const unsubscribe = subscribeToDb(loadSettings);
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { id: 'home', label: t('home'), icon: <Home size={18} /> },
    { id: 'machineries', label: t('machineries'), icon: <Truck size={18} /> },
    { id: 'vacancies', label: t('vacancies'), icon: <Briefcase size={18} /> }
  ];

  if (currentUser) {
    navLinks.push({ id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard size={18} /> });
    navLinks.push({ id: 'profile', label: t('profile'), icon: <User size={18} /> });
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 900,
      backgroundColor: 'var(--navbar-bg)',
      borderBottom: '1px solid var(--border-color)',
      backdropFilter: 'blur(12px)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Top Header Row: Logo, Title, User Session & Controls */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        {/* Brand Logo & Title */}
        <div 
          onClick={() => setActiveTab('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}
        >
          <img 
            src={settings.logo_url} 
            alt="Logo" 
            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '2px solid var(--primary-500)', flexShrink: 0 }} 
          />
          <div>
            <h1 style={{ fontSize: 'clamp(0.85rem, 3.5vw, 1.05rem)', fontWeight: 800, color: 'var(--primary-600)', lineHeight: 1.2, margin: 0 }}>
              {settings.site_title}
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} className="text-primary-500" /> Authorized Machinery Portal
            </span>
          </div>
        </div>

        {/* Desktop Main Navigation Links */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="md-flex">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === link.id ? 'var(--primary-600)' : 'var(--text-primary)',
                fontWeight: activeTab === link.id ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                fontSize: '0.925rem',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: activeTab === link.id ? 'var(--primary-100)' : 'transparent',
                transition: 'var(--transition-fast)'
              }}
            >
              {link.icon} {link.label}
            </button>
          ))}
        </div>

        {/* Utility Controls: Lang, Theme, Login / Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {/* Amharic / English Toggle */}
          <button 
            type="button"
            onClick={toggleLanguage}
            className="btn-secondary btn-sm"
            title="Translate Page"
            style={{ borderRadius: '20px', padding: '3px 8px', fontSize: '0.78rem' }}
          >
            <Globe size={14} />
            <span style={{ fontWeight: 700 }}>{language === 'en' ? 'አማርኛ' : 'EN'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button 
            type="button"
            onClick={toggleTheme}
            className="btn-secondary btn-sm"
            title="Toggle Theme"
            style={{ borderRadius: '50%', padding: '6px' }}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} className="text-yellow-400" />}
          </button>

          {/* User Session Button */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '3px 8px',
                  borderRadius: '20px',
                  border: '1px solid var(--primary-300)',
                  backgroundColor: 'var(--primary-50)',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                  alt="Avatar" 
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                  {currentUser.role}
                </span>
              </button>
              <button 
                onClick={logout} 
                className="btn-secondary btn-sm" 
                title={t('logout')}
                style={{ color: '#dc2626', padding: '5px' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setActiveTab('login')}
              className="btn-primary btn-sm"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem' }}
            >
              <User size={14} /> {t('login')}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Permanently Visible Horizontal Top Navigation Row */}
      <div 
        className="mobile-nav-bar md-none"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.4rem 0.75rem',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-color)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {navLinks.map(link => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === link.id ? 'var(--primary-700)' : 'var(--text-primary)',
              fontWeight: activeTab === link.id ? 800 : 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: activeTab === link.id ? 'var(--primary-100)' : 'transparent',
              flexShrink: 0,
              transition: 'var(--transition-fast)'
            }}
          >
            {link.icon} {link.label}
          </button>
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-flex { display: flex !important; }
          .md-none { display: none !important; }
        }
      `}</style>
    </nav>
  );
};
