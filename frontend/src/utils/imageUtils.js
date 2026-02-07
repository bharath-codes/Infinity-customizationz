import { API_BASE_URL } from '../services/api';

// Safe image URL: data: URLs must NOT get encodeURI or query params (causes ERR_INVALID_URL)
export const getImageSrc = (img) => {
  if (!img || typeof img !== 'string') return null;
  if (img.startsWith('data:')) return img;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (img.startsWith('/')) return (API_BASE_URL.replace(/\/api$/, '') || '') + img;
  return null; // product IDs like "m3" are invalid - don't use as image src
};

export const isDataUrl = (img) => img && typeof img === 'string' && img.startsWith('data:');
