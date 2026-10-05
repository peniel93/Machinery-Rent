import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Key, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const LoginPage = ({ setActiveTab }) => {
  const { login, completePasswordChange } = useAuth();
  const { showAlert } = useAlert();
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  // Password reset step state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const res = login(username, password);

    if (!res.success) {
      showAlert(res.message, 'danger');
      return;
    }

    if (res.requiresPasswordChange) {
      setPendingUser(res.user);
      showAlert(res.message, 'warning');
      return;
    }

    showAlert(`Welcome back, ${res.user.full_name} (${res.user.role})!`, 'success');
    setActiveTab('dashboard');
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showAlert('New password must be at least 6 characters.', 'danger');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Passwords do not match.', 'danger');
      return;
    }

    const res = completePasswordChange(pendingUser.id, newPassword);
    if (res.success) {
      showAlert('Password changed successfully! You are now logged in.', 'success');
      setActiveTab('dashboard');
    } else {
      showAlert(res.message, 'danger');
    }
  };

  // Quick Demo Login Helper
  const quickDemoLogin = (role) => {
    const roleUsernames = {
      'Main Registrar Admin': 'MRA/1001/2026',
      'Accountant': 'ACC/2001/2026',
      'Finance': 'FIN/3001/2026',
      'Store Manager': 'STM/4001/2026',
      'Manager': 'MGR/5001/2026',
      'Site Worker': 'WRK/6001/2026',
      'Reporter': 'RPT/7001/2026'
    };

    const targetUsername = roleUsernames[role] || 'MRA/1001/2026';
    setUsername(targetUsername);
    setPassword('Admin123!');
    
    // Automatically submit
    const res = login(targetUsername, 'Admin123!');
    if (res.success) {
      if (res.requiresPasswordChange) {
        setPendingUser(res.user);
      } else {
        showAlert(`Quick logged in as ${res.user.role}!`, 'success');
        setActiveTab('dashboard');
      }
    } else {
      showAlert(`Could not auto-login as ${role}. Default credentials set to login form.`, 'info');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '3rem auto', paddingBottom: '3rem' }}>
      <div className="card-glass" style={{ padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-100)',
            color: 'var(--primary-600)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Portal Authentication
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Enter your system credentials (Format: Role/4-digit ID/Year)
          </p>
        </div>

        {/* Mandatory Password Change Form for First Login */}
        {pendingUser ? (
          <form onSubmit={handlePasswordChangeSubmit}>
            <div className="alert alert-warning" style={{ marginBottom: '1.25rem' }}>
              <Key size={18} /> First Login Detected: You must change your default password.
            </div>

            <div className="form-group">
              <label className="form-label">{t('newPassword')}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  className="form-control" 
                  required 
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password" 
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('confirmPassword')}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className="form-control" 
                  required 
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password" 
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <CheckCircle size={18} /> Update Password & Proceed
            </button>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. MRA/1001/2026 or email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control" 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              Login to System
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

