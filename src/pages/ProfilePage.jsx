import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { User, Mail, Phone, MapPin, Upload, CheckCircle, Shield } from 'lucide-react';

export const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { showAlert } = useAlert();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [contact, setContact] = useState(currentUser?.contact || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');

  if (!currentUser) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({
      full_name: fullName,
      contact: contact,
      email: email,
      address: address,
      avatar_url: avatarUrl
    });

    showAlert('Profile information updated successfully!', 'success');
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="card-glass" style={{ padding: '2.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
              alt="Avatar" 
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-500)' }} 
            />
            <label 
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'var(--primary-600)',
                color: '#fff',
                borderRadius: '50%',
                padding: '8px',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)'
              }}
              title="Upload new profile picture"
            >
              <Upload size={16} />
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          </div>

          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentUser.full_name}</h2>
            <p style={{ color: 'var(--primary-600)', fontWeight: 700, fontSize: '0.95rem' }}>
              Role: {currentUser.role}
            </p>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Username: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.username}</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />
          </div>

          <div className="responsive-form-row">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input 
                type="text" 
                className="form-control" 
                value={contact}
                onChange={e => setContact(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Address / Location</label>
            <input 
              type="text" 
              className="form-control" 
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary">
              <CheckCircle size={18} /> Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
