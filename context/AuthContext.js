// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext({
  token: null,
  isLoggedIn: false, // Start as false initially
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  // Add a loading state to prevent premature checks
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // On app load, check if token exists in localStorage (single source of truth)
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    router.push('/');
  };

  // Derive isLoggedIn directly from the token state
  const isLoggedIn = !!token;

  // Provide the loading state as well, if needed by components
  const value = { token, isLoggedIn, login, logout, loading };

  // Don't render children until authentication status is determined
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the auth context
export const useAuth = () => useContext(AuthContext);