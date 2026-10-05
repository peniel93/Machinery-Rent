import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://elqwmsspaelvgngbcdcy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscXdtc3NwYWVsdmduZ2JjZGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MjkwMzcsImV4cCI6MjEwMTAwNTAzN30.2P--Brn8kN0KHdz0i1XbIpsAyQmKmgCkz-vXPZneaT8';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = 
  Boolean(supabaseUrl) && 
  Boolean(supabaseAnonKey) && 
  !supabaseUrl.includes('your-supabase-url') && 
  !supabaseAnonKey.includes('your-supabase-anon-key');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const STORAGE_PREFIX = 'machinery_rent_db_';
const LISTENERS = new Set();

export const notifyListeners = (tableName) => {
  LISTENERS.forEach(fn => fn(tableName));
};

export const subscribeToDb = (fn) => {
  LISTENERS.add(fn);
  return () => LISTENERS.delete(fn);
};

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const isValidUUID = (str) => {
  if (typeof str !== 'string') return false;
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);
};

export const normalizeRowForSupabase = (tableName, row) => {
  if (!row) return row;
  const clone = { ...row };
  
  if (tableName === 'portal_settings') {
    clone.id = Number(clone.id) || 1;
    return clone;
  }
  
  if (!clone.id || !isValidUUID(String(clone.id))) {
    clone.id = generateUUID();
  }
  
  return clone;
};

// Sync table from remote Supabase Cloud DB to local client cache
export const syncFromSupabase = async (tableName, defaultData = []) => {
  if (!supabase) return defaultData;
  const key = STORAGE_PREFIX + tableName;
  const currentStored = localStorage.getItem(key);

  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (!error && Array.isArray(data)) {
      const dataStr = JSON.stringify(data);
      if (data.length > 0) {
        if (currentStored !== dataStr) {
          localStorage.setItem(key, dataStr);
          notifyListeners(tableName);
        }
        return data;
      } else {
        let candidateData = defaultData;
        if (currentStored) {
          try {
            const parsed = JSON.parse(currentStored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              candidateData = parsed;
            }
          } catch {}
        }

        if (Array.isArray(candidateData) && candidateData.length > 0) {
          const normalizedSeed = candidateData.map(item => normalizeRowForSupabase(tableName, item));
          const seedStr = JSON.stringify(normalizedSeed);
          const { error: seedErr } = await supabase.from(tableName).upsert(normalizedSeed);
          if (!seedErr) {
            if (currentStored !== seedStr) {
              localStorage.setItem(key, seedStr);
              notifyListeners(tableName);
            }
            return normalizedSeed;
          } else {
            console.warn(`Supabase auto-seed warning for ${tableName}:`, seedErr.message);
          }
        }

        const defaultStr = JSON.stringify(defaultData);
        if (currentStored !== defaultStr) {
          localStorage.setItem(key, defaultStr);
          notifyListeners(tableName);
        }
        return defaultData;
      }
    } else if (error) {
      console.warn(`Supabase fetch warning for ${tableName}:`, error.message);
    }
  } catch (err) {
    console.warn(`Supabase cloud sync error for ${tableName}:`, err);
  }
  return null;
};

// Initial bulk sync for all core tables
export const syncAllTables = async () => {
  if (!supabase) return;
  const tableDefaults = {
    portal_settings: [{
      id: 1,
      site_title: 'Construction Machinery Rent Portal System',
      logo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=200&auto=format&fit=crop&q=80',
      hero_bg_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=80',
      copyright_text: 'Construction Machinery Rental Organization',
      copyright_year: 2026,
      about_text: 'Providing reliable heavy machinery rental solutions across Ethiopia for construction, road works, and urban infrastructure development.',
      contact_phone: '+251 911 000 111',
      contact_email: 'info@machineryrent.org',
      church_organization_address: 'Bole Subcity, Woreda 03, Addis Ababa, Ethiopia',
      google_map_embed_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126105.81152062544!2d38.70777174621946!3d8.980603417724128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85cef5ab402d%3A0x8467b6b037a24d49!2sAddis%20Ababa!5e0!3m2!1sen!2set!4v1700000000000!5m2!1sen!2set',
      telegram_url: 'https://t.me',
      whatsapp_url: 'https://wa.me',
      tiktok_url: 'https://tiktok.com',
      facebook_url: 'https://facebook.com',
      instagram_url: 'https://instagram.com',
      twitter_url: 'https://twitter.com',
      youtube_url: 'https://youtube.com',
      updated_at: new Date().toISOString()
    }],
    profiles: [
      { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', username: 'MRA/1001/2026', full_name: 'Main Registrar Admin', role: 'Main Registrar Admin', contact: '+251 900 112 233', email: 'registrar@machineryrent.org', gender: 'Male', address: 'Addis Ababa, Ethiopia', default_password: 'Admin123!', password_hash: 'Admin123!', is_password_changed: true, active_status: true, avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
      { id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', username: 'ACC/2001/2026', full_name: 'Accountant Admin', role: 'Accountant', contact: '+251 911 200 300', email: 'accountant@machineryrent.org', gender: 'Female', address: 'Bole, Addis Ababa', default_password: 'Admin123!', password_hash: 'Admin123!', is_password_changed: true, active_status: true, avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
      { id: 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', username: 'FIN/3001/2026', full_name: 'Finance Executive', role: 'Finance', contact: '+251 911 300 400', email: 'finance@machineryrent.org', gender: 'Male', address: 'Kirkos, Addis Ababa', default_password: 'Admin123!', password_hash: 'Admin123!', is_password_changed: true, active_status: true, avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
      { id: 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', username: 'STM/4001/2026', full_name: 'Store Depot Manager', role: 'Store Manager', contact: '+251 911 400 500', email: 'store@machineryrent.org', gender: 'Male', address: 'Akaki Depot, Addis Ababa', default_password: 'Admin123!', password_hash: 'Admin123!', is_password_changed: true, active_status: true, avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
      { id: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', username: 'MGR/5001/2026', full_name: 'Operations Site Manager', role: 'Manager', contact: '+251 911 500 600', email: 'manager@machineryrent.org', gender: 'Female', address: 'Modjo Site, Oromia', default_password: 'Admin123!', password_hash: 'Admin123!', is_password_changed: true, active_status: true, avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
      { id: 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', username: 'WRK/6001/2026', full_name: 'Lead Site Worker', role: 'Site Worker', contact: '+251 911 600 700', email: 'worker@machineryrent.org', gender: 'Male', address: 'Express Highway Site', default_password: 'Admin123!', password_hash: 'Admin123!', is_password_changed: true, active_status: true, avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80', created_at: new Date().toISOString() },
      { id: 'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', username: 'RPT/7001/2026', full_name: 'Official Reporter', role: 'Reporter', contact: '+251 911 700 800', email: 'reporter@machineryrent.org', gender: 'Female', address: 'Addis Ababa, Ethiopia', default_password: 'Admin123!', password_hash: 'Admin123!', is_password_changed: true, active_status: true, avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', created_at: new Date().toISOString() }
    ]
  };

  const tables = [
    'portal_settings', 'profiles', 'machinery', 'rentals', 
    'financial_records', 'store_inventory', 'worker_shifts', 
    'site_updates', 'reports', 'partner_machinery_requests', 
    'vacancies', 'vacancy_applications', 'gallery_moments'
  ];
  await Promise.allSettled(tables.map(t => syncFromSupabase(t, tableDefaults[t] || [])));
};

// Initialize Supabase Realtime Subscription for instant cross-device updates
if (supabase) {
  try {
    supabase.channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        if (payload.table) {
          syncFromSupabase(payload.table);
        }
      })
      .subscribe();
  } catch (e) {
    console.warn('Realtime subscription error:', e);
  }
}

export const mockDb = {
  getTable: (tableName, defaultData = []) => {
    const key = STORAGE_PREFIX + tableName;
    const stored = localStorage.getItem(key);

    if (!stored) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return Array.isArray(defaultData) ? defaultData : [];
    }
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        localStorage.setItem(key, JSON.stringify(defaultData));
        return Array.isArray(defaultData) ? defaultData : [];
      }
      if (parsed.length === 0 && Array.isArray(defaultData) && defaultData.length > 0) {
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      }
      return parsed;
    } catch {
      return Array.isArray(defaultData) ? defaultData : [];
    }
  },

  setTable: (tableName, data) => {
    const key = STORAGE_PREFIX + tableName;
    localStorage.setItem(key, JSON.stringify(data));
    notifyListeners(tableName);

    if (supabase && Array.isArray(data) && data.length > 0) {
      const normalizedData = data.map(item => normalizeRowForSupabase(tableName, item));
      Promise.resolve(supabase.from(tableName).upsert(normalizedData))
        .then(({ error }) => {
          if (error) console.warn(`Supabase setTable sync warning:`, error.message);
        })
        .catch(err => console.warn(`Supabase setTable sync error:`, err));
    }
  },

  insertRow: (tableName, newRow, defaultData = []) => {
    const current = mockDb.getTable(tableName, defaultData);
    const normalizedRow = normalizeRowForSupabase(tableName, { ...newRow, created_at: new Date().toISOString() });
    const updated = [normalizedRow, ...current];
    
    const key = STORAGE_PREFIX + tableName;
    localStorage.setItem(key, JSON.stringify(updated));
    notifyListeners(tableName);

    // Sync remote Supabase database asynchronously across devices
    if (supabase) {
      Promise.resolve(supabase.from(tableName).upsert([normalizedRow]))
        .then(({ error }) => {
          if (error) {
            console.warn(`Supabase cloud insert/upsert error on ${tableName}:`, error.message);
          }
        })
        .catch(err => console.warn(`Supabase network error on ${tableName}:`, err));
    }

    return normalizedRow;
  },

  updateRow: (tableName, id, updates, defaultData = []) => {
    const current = mockDb.getTable(tableName, defaultData);
    const updated = current.map(item => String(item.id) === String(id) ? { ...item, ...updates } : item);
    
    const key = STORAGE_PREFIX + tableName;
    localStorage.setItem(key, JSON.stringify(updated));
    notifyListeners(tableName);

    const updatedItem = updated.find(item => String(item.id) === String(id));

    // Sync remote Supabase database asynchronously across devices
    if (supabase && updatedItem) {
      const normalizedItem = normalizeRowForSupabase(tableName, updatedItem);
      Promise.resolve(supabase.from(tableName).upsert([normalizedItem]))
        .then(({ error }) => {
          if (error) {
            console.warn(`Supabase cloud upsert error on ${tableName}:`, error.message);
            Promise.resolve(supabase.from(tableName).update(updates).eq('id', normalizedItem.id)).catch(() => {});
          }
        })
        .catch(err => console.warn(`Supabase network error on ${tableName}:`, err));
    }

    return updatedItem;
  },

  deleteRow: (tableName, id, defaultData = []) => {
    const current = mockDb.getTable(tableName, defaultData);
    const updated = current.filter(item => String(item.id) !== String(id));
    
    const key = STORAGE_PREFIX + tableName;
    localStorage.setItem(key, JSON.stringify(updated));
    notifyListeners(tableName);

    // Sync remote Supabase database asynchronously across devices
    if (supabase) {
      Promise.resolve(supabase.from(tableName).delete().eq('id', id))
        .then(({ error }) => {
          if (error) {
            console.warn(`Supabase cloud delete error on ${tableName}:`, error.message);
          }
        })
        .catch(err => console.warn(`Supabase network error on ${tableName}:`, err));
    }
  }
};
