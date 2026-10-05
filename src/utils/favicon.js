import { mockDb } from '../lib/supabaseClient';

export const updateFavicon = (logoUrl) => {
  if (!logoUrl) return;
  let link = document.querySelector("link[rel*='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  if (logoUrl.startsWith('data:image/')) {
    const mime = logoUrl.substring(5, logoUrl.indexOf(';'));
    link.type = mime;
  } else if (logoUrl.endsWith('.svg')) {
    link.type = 'image/svg+xml';
  } else if (logoUrl.endsWith('.png')) {
    link.type = 'image/png';
  } else {
    link.removeAttribute('type');
  }
  link.href = logoUrl;
};

export const compressImage = (file, maxDimension = 400, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === 'image/png' || file.type === 'image/svg+xml' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputMime, quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export const syncPortalBranding = () => {
  try {
    const settings = mockDb.getTable('portal_settings', []);
    if (settings && settings.length > 0) {
      const { logo_url, site_title } = settings[0];
      if (logo_url) {
        updateFavicon(logo_url);
      }
      if (site_title) {
        document.title = site_title;
      }
    }
  } catch (err) {
    console.error('Error syncing portal branding:', err);
  }
};

