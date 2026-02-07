import { API_BASE_URL } from '../services/api';

// /images/ = static assets in frontend public folder (served by frontend/Vercel)
// /uploads/ = user uploads on backend (served by backend/Render)
const getBaseForPath = (path) => {
  if (path.startsWith('/uploads/')) return API_BASE_URL.replace(/\/api$/, '') || '';
  return typeof window !== 'undefined' ? window.location.origin : '';
};

// Safe image URL: data: URLs must NOT get encodeURI or query params (causes ERR_INVALID_URL)
export const getImageSrc = (img) => {
  if (!img || typeof img !== 'string') return null;
  if (img.startsWith('data:')) return img;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('/')) return getBaseForPath(img) + img;
  return null; // product IDs like "m3" are invalid - don't use as image src
};

export const isDataUrl = (img) => img && typeof img === 'string' && img.startsWith('data:');
