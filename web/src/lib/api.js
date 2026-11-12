const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function getApiUrl() {
  return API_URL.replace(/\/$/, '');
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('noteapp_token');
}

export function setToken(token) {
  localStorage.setItem('noteapp_token', token);
}

export function clearToken() {
  localStorage.removeItem('noteapp_token');
  localStorage.removeItem('noteapp_user');
}

export function getCachedUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('noteapp_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCachedUser(user) {
  localStorage.setItem('noteapp_user', JSON.stringify(user));
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
