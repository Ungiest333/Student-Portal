const DEFAULT_API_URL = process.env.REACT_APP_API_URL || 'https://student-portal-nyv7.onrender.com/api';

export const API_BASE_URL = DEFAULT_API_URL.replace(/\/+$/, '');

export const BASE_URL = API_BASE_URL.replace(/\/api$/, '');

export const buildAssetUrl = (path = '') => {
  if (!path) return '';

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${BASE_URL}/${normalizedPath}`;
};
