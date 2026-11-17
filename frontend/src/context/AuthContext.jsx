import { createContext, useContext, useEffect, useState } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const saveUser = (data) => {
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // check the saved token is still valid (account may have been disabled or deleted)
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    API.get('/auth/me')
      .then((res) => saveUser(res.data))
      .catch((err) => {
        // only log out if the server rejected the token, not when the server is just down
        if (err.response && [401, 403].includes(err.response.status)) logout();
      });
  }, []);

  // one login for everyone - admin, clubs, departments and students
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    saveUser(data.user);
    return data.user;
  };

  return <AuthContext.Provider value={{ user, login, logout, saveUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

// where each role lands after login
export const dashboardPath = (user) => {
  if (!user) return '/login';
  if (user.mustChangePassword) return '/settings';
  if (user.role === 'admin') return '/admin';
  if (user.role === 'student') return '/student';
  return '/dashboard';
};
