import { createContext, useContext, useEffect, useState } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // check the saved token is still valid (account may have been disabled or deleted)
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    API.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      })
      .catch((err) => {
        // only log out if the server rejected the token, not when the server is just down
        if (err.response && [401, 403].includes(err.response.status)) logout();
      });
  }, []);

  const saveLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    return saveLogin(data);
  };

  // student sign up - logs them in straight away
  const register = async (form) => {
    const { data } = await API.post('/auth/register', form);
    return saveLogin(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// where each role lands after login
export const dashboardPath = (user) => {
  if (!user) return '/login';
  if (user.role === 'admin') return '/admin';
  if (user.role === 'student') return '/student';
  return '/dashboard';
};
