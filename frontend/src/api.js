const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const tokenStorage = {
  getAccess:    ()      => localStorage.getItem('access_token'),
  getRefresh:   ()      => localStorage.getItem('refresh_token'),
  setTokens:    (a, r)  => {
    localStorage.setItem('access_token',  a);
    localStorage.setItem('refresh_token', r);
  },
  clearTokens:  ()      => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  setUser:      (u)     => localStorage.setItem('user', JSON.stringify(u)),
  getUser:      ()      => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  },
};

// ── Decode JWT payload (no verification — server verifies) ──
export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

// ── Auth failure callback (set by App.jsx on mount) ──
let onAuthFailure = () => {};
export const setAuthFailureHandler = (fn) => { onAuthFailure = fn; };

// ── Silent token refresh ──
let refreshPromise = null; // deduplicate concurrent refresh attempts

const silentRefresh = async () => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) throw new Error('No refresh token');

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = await res.json();
    tokenStorage.setTokens(data.access, refreshToken);
    return data.access;
  })().finally(() => { refreshPromise = null; });

  return refreshPromise;
};

// ── Core request function ──
const request = async (method, path, body = null, retry = true) => {
  const accessToken = tokenStorage.getAccess();

  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);

  // ── Silent refresh on 401 ──
  if (res.status === 401 && retry) {
    try {
      await silentRefresh();
      return request(method, path, body, false); // retry once
    } catch {
      tokenStorage.clearTokens();
      onAuthFailure();
      throw new Error('Session expired. Please log in again.');
    }
  }

  // ── Parse response ──
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message = data?.error || data?.detail || JSON.stringify(data) || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
};

// ── Public API surface ──
const api = {
  get:    (path)         => request('GET',    path),
  post:   (path, body)   => request('POST',   path, body),
  patch:  (path, body)   => request('PATCH',  path, body),
  delete: (path)         => request('DELETE', path),
};

export default api;