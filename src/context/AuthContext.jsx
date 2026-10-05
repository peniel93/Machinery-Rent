import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDb } from '../lib/supabaseClient';

const AuthContext = createContext();

const DEFAULT_PROFILES = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    username: 'MRA/1001/2026',
    full_name: 'Main Registrar Admin',
    role: 'Main Registrar Admin',
    contact: '+251 900 112 233',
    email: 'registrar@machineryrent.org',
    gender: 'Male',
    address: 'Addis Ababa, Ethiopia',
    default_password: 'Admin123!',
    password_hash: 'Admin123!',
    is_password_changed: true,
    active_status: true,
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    username: 'ACC/2001/2026',
    full_name: 'Accountant Admin',
    role: 'Accountant',
    contact: '+251 911 200 300',
    email: 'accountant@machineryrent.org',
    gender: 'Female',
    address: 'Bole, Addis Ababa',
    default_password: 'Admin123!',
    password_hash: 'Admin123!',
    is_password_changed: true,
    active_status: true,
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    username: 'FIN/3001/2026',
    full_name: 'Finance Executive',
    role: 'Finance',
    contact: '+251 911 300 400',
    email: 'finance@machineryrent.org',
    gender: 'Male',
    address: 'Kirkos, Addis Ababa',
    default_password: 'Admin123!',
    password_hash: 'Admin123!',
    is_password_changed: true,
    active_status: true,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
    username: 'STM/4001/2026',
    full_name: 'Store Depot Manager',
    role: 'Store Manager',
    contact: '+251 911 400 500',
    email: 'store@machineryrent.org',
    gender: 'Male',
    address: 'Akaki Depot, Addis Ababa',
    default_password: 'Admin123!',
    password_hash: 'Admin123!',
    is_password_changed: true,
    active_status: true,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
    username: 'MGR/5001/2026',
    full_name: 'Operations Site Manager',
    role: 'Manager',
    contact: '+251 911 500 600',
    email: 'manager@machineryrent.org',
    gender: 'Female',
    address: 'Modjo Site, Oromia',
    default_password: 'Admin123!',
    password_hash: 'Admin123!',
    is_password_changed: true,
    active_status: true,
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66',
    username: 'WRK/6001/2026',
    full_name: 'Lead Site Worker',
    role: 'Site Worker',
    contact: '+251 911 600 700',
    email: 'worker@machineryrent.org',
    gender: 'Male',
    address: 'Express Highway Site',
    default_password: 'Admin123!',
    password_hash: 'Admin123!',
    is_password_changed: true,
    active_status: true,
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  },
  {
    id: 'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
    username: 'RPT/7001/2026',
    full_name: 'Official Reporter',
    role: 'Reporter',
    contact: '+251 911 700 800',
    email: 'reporter@machineryrent.org',
    gender: 'Female',
    address: 'Addis Ababa, Ethiopia',
    default_password: 'Admin123!',
    password_hash: 'Admin123!',
    is_password_changed: true,
    active_status: true,
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString()
  }
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('machinery_rent_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Ensure default main admin and role accounts exist in profiles table
  useEffect(() => {
    const profiles = mockDb.getTable('profiles', DEFAULT_PROFILES);
    let updated = Array.isArray(profiles) ? [...profiles] : [];
    let changed = false;

    DEFAULT_PROFILES.forEach(def => {
      const idx = updated.findIndex(p => 
        (p.username && p.username.toLowerCase() === def.username.toLowerCase()) || 
        (p.email && p.email.toLowerCase() === def.email.toLowerCase())
      );
      if (idx === -1) {
        updated.push(def);
        changed = true;
      } else if (!updated[idx].is_password_changed && updated[idx].default_password === def.default_password) {
        updated[idx] = { ...updated[idx], is_password_changed: true, password_hash: def.password_hash };
        changed = true;
      }
    });

    if (changed || updated.length === 0) {
      mockDb.setTable('profiles', updated);
    }
  }, []);

  const login = (usernameOrEmail, password) => {
    const profiles = mockDb.getTable('profiles', DEFAULT_PROFILES);
    const found = profiles.find(p => 
      (p.username && p.username.toLowerCase() === usernameOrEmail.trim().toLowerCase()) ||
      (p.email && p.email.toLowerCase() === usernameOrEmail.trim().toLowerCase())
    );

    if (!found) {
      return { success: false, message: 'User not found. Please check your Username or Email.' };
    }

    if (!found.active_status) {
      return { success: false, message: 'Account deactivated. Please contact the Main Registrar Admin.' };
    }

    // Check default_password or password_hash
    if (password !== found.default_password && password !== found.password_hash) {
      return { success: false, message: 'Invalid password.' };
    }

    // Mandatory password change only if strictly required and no password_hash set
    if (found.is_password_changed === false && !found.password_hash) {
      return { 
        success: true, 
        user: found, 
        requiresPasswordChange: true, 
        message: 'First login detected. Please change your default password to activate access.' 
      };
    }

    const activeUser = { ...found, is_password_changed: true };
    setCurrentUser(activeUser);
    localStorage.setItem('machinery_rent_current_user', JSON.stringify(activeUser));
    return { success: true, user: activeUser, requiresPasswordChange: false };
  };

  const completePasswordChange = (userId, newPassword) => {
    const updated = mockDb.updateRow('profiles', userId, {
      password_hash: newPassword,
      is_password_changed: true
    });
    if (updated) {
      setCurrentUser(updated);
      localStorage.setItem('machinery_rent_current_user', JSON.stringify(updated));
      return { success: true };
    }
    return { success: false, message: 'Failed to update password.' };
  };

  const updateUserProfile = (updatedFields) => {
    if (!currentUser) return;
    const updated = mockDb.updateRow('profiles', currentUser.id, updatedFields);
    if (updated) {
      setCurrentUser(updated);
      localStorage.setItem('machinery_rent_current_user', JSON.stringify(updated));
    }
    return updated;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('machinery_rent_current_user');
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      completePasswordChange, 
      updateUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
