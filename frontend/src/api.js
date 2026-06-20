const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const SESSION_UPDATED_EVENT = 'jobsite:session-updated';
export const SESSION_CLEARED_EVENT = 'jobsite:session-cleared';

let refreshPromise = null;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function apiRequest(path, options = {}) {
  const response = await send(path, options);
  if (response.status === 401 && shouldRecover(path, options)) {
    const session = await refreshSession();
    if (!session) return redirectToLogin();
    return parseResponse(await send(path, options, session.token));
  }
  return parseResponse(response);
}

export function jsonRequest(path, method, body) {
  return apiRequest(path, {
    method,
    body: body == null ? undefined : JSON.stringify(body),
  });
}

export async function restoreSession() {
  return refreshSession();
}

export function storeSession(session) {
  localStorage.setItem('jobsite_token', session.token);
  localStorage.setItem('jobsite_user', JSON.stringify(session.user));
  window.dispatchEvent(new CustomEvent(SESSION_UPDATED_EVENT, { detail: session }));
  return session;
}

export function clearSession() {
  localStorage.removeItem('jobsite_token');
  localStorage.removeItem('jobsite_user');
  window.dispatchEvent(new Event(SESSION_CLEARED_EVENT));
}

async function send(path, options, tokenOverride) {
  const token = tokenOverride ?? localStorage.getItem('jobsite_token');
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}

function shouldRecover(path, options) {
  return options.authRecovery !== false
    && !path.startsWith('/auth/')
    && Boolean(localStorage.getItem('jobsite_user'));
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return storeSession(await response.json());
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function parseResponse(response) {
  if (!response.ok) {
    let message = 'Request failed';
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(message, response.status);
  }
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}

function redirectToLogin() {
  clearSession();
  const from = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?from=${encodeURIComponent(from)}`);
  return new Promise(() => {});
}
