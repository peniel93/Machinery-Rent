import React, { useState, useEffect, Component } from 'react';
import { syncPortalBranding } from './utils/favicon';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

import { BootstrapAlert } from './components/BootstrapAlert';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { MachineriesPage } from './pages/MachineriesPage';
import { VacanciesPage } from './pages/VacanciesPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';

import { MainRegistrarDashboard } from './pages/dashboards/MainRegistrarDashboard';
import { AccountantDashboard } from './pages/dashboards/AccountantDashboard';
import { FinanceDashboard } from './pages/dashboards/FinanceDashboard';
import { StoreManagerDashboard } from './pages/dashboards/StoreManagerDashboard';
import { ManagerDashboard } from './pages/dashboards/ManagerDashboard';
import { SiteWorkerDashboard } from './pages/dashboards/SiteWorkerDashboard';

import { syncAllTables, subscribeToDb } from './lib/supabaseClient';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Portal ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2.5rem', maxWidth: '650px', margin: '3rem auto', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '0.75rem', fontSize: '1.4rem', fontWeight: 800 }}>Dashboard Display Error Caught</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
            A temporary component rendering error was intercepted. Click reset below to recover the dashboard view.
          </p>
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.85rem', borderRadius: '8px', fontSize: '0.78rem', textAlign: 'left', marginBottom: '1.25rem', overflowX: 'auto', fontFamily: 'monospace' }}>
            {this.state.error?.toString()}
          </div>
          <button 
            type="button"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="btn-primary"
            style={{ margin: '0 auto' }}
          >
            Reset Dashboard View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { currentUser } = useAuth();

  useEffect(() => {
    syncPortalBranding();
    syncAllTables();

    // Re-sync with Supabase cloud whenever window regains focus across devices
    const handleFocus = () => {
      syncAllTables();
      syncPortalBranding();
    };
    window.addEventListener('focus', handleFocus);

    // Subscribe to live database updates across all devices & tabs
    const unsubscribe = subscribeToDb((tableName) => {
      if (tableName === 'portal_settings') {
        syncPortalBranding();
      }
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      unsubscribe();
    };
  }, []);

  const renderDashboardByRole = () => {
    if (!currentUser) return <LoginPage setActiveTab={setActiveTab} />;

    switch (currentUser.role) {
      case 'Main Registrar Admin':
        return <MainRegistrarDashboard />;
      case 'Accountant':
        return <AccountantDashboard />;
      case 'Finance':
        return <FinanceDashboard />;
      case 'Store Manager':
        return <StoreManagerDashboard />;
      case 'Manager':
        return <ManagerDashboard />;
      case 'Site Worker':
        return <SiteWorkerDashboard />;
      case 'Reporter':
        return <AccountantDashboard />;
      default:
        return <MainRegistrarDashboard />;
    }
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} />;
      case 'machineries':
        return <MachineriesPage />;
      case 'vacancies':
        return <VacanciesPage />;
      case 'login':
        return <LoginPage setActiveTab={setActiveTab} />;
      case 'profile':
        return <ProfilePage />;
      case 'dashboard':
        return renderDashboardByRole();
      default:
        return <HomePage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <BootstrapAlert />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '1.75rem 1.5rem', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <ErrorBoundary>
          {renderMainContent()}
        </ErrorBoundary>
      </main>
      <Footer activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AlertProvider>
              <AppContent />
            </AlertProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
