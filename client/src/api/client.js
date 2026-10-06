// This file is the only place that talks to the backend server.
// Every other file just calls these functions instead of using fetch directly.

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

// When a request returns 401 (session expired), we call this function.
// AuthContext sets it to "log the user out".
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

// Read the saved login token from the browser's localStorage
function getToken() {
  try {
    return localStorage.getItem('expense-tracker-token');
  } catch {
    return null;
  }
}

// One helper that ALL api calls use. It adds headers, parses JSON,
// and turns errors into normal JavaScript Error objects.
export async function apiRequest(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('Could not reach the server. Check that the backend is running.');
  }

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  // A 401 while logged in means the token is no longer valid -> force logout
  if (response.status === 401 && auth) unauthorizedHandler?.();

  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || `Request failed (${response.status}).`);
    error.status = response.status;
    error.errors = Array.isArray(payload.errors) ? payload.errors : [];
    throw error;
  }

  return payload;
}

// Grouped endpoints so pages can write:
//   authApi.login(values)  /  transactionApi.list()
export const authApi = {
  login: (values) => apiRequest('/auth/login', { method: 'POST', body: values }),
  register: (values) => apiRequest('/auth/register', { method: 'POST', body: values }),
};

export const transactionApi = {
  list: () => apiRequest('/transactions', { auth: true }),
  get: (id) => apiRequest(`/transactions/${encodeURIComponent(id)}`, { auth: true }),
  create: (values) => apiRequest('/transactions/create', { method: 'POST', body: values, auth: true }),
  update: (id, values) => apiRequest(`/transactions/${encodeURIComponent(id)}`, { method: 'PATCH', body: values, auth: true }),
  remove: (id) => apiRequest(`/transactions/${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }),
};
