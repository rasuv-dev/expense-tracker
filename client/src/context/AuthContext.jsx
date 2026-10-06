import { createContext, useContext, useEffect, useState } from 'react';
import { authApi, setUnauthorizedHandler } from '../api/client';

// This file stores the logged-in user so ANY component can access it:
//   const { user, login, logout } = useAuth();
const AuthContext = createContext(null);

const TOKEN_KEY = 'expense-tracker-token';
const USER_KEY = 'expense-tracker-user';

// Read the saved user from localStorage (if any) when the app first loads
function readStoredUser() {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  // Save the token + user in state AND in localStorage so a page
  // refresh keeps the user logged in
  function saveSession(data) {
    if (!data?.token || !data?.user) throw new Error('The server returned an incomplete session.');
    setToken(data.token);
    setUser(data.user);
    try {
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch {
      // localStorage may be blocked (private mode) - in-memory session still works
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error(e);
    }
  }

  // If any API call answers 401 (session expired), log the user out automatically
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, []);

  async function login(values) {
    const response = await authApi.login(values);
    saveSession(response.data);
  }

  async function register(values) {
    const response = await authApi.register(values);
    saveSession(response.data);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook so components don't have to write useContext(AuthContext) themselves
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}