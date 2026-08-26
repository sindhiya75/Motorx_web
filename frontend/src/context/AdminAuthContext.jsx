import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export function AdminAuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() => {
    try {
      return localStorage.getItem('motorx_admin_token') || null;
    } catch (e) {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('motorx_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (adminToken) {
        localStorage.setItem('motorx_admin_token', adminToken);
      } else {
        localStorage.removeItem('motorx_admin_token');
      }

      if (adminUser) {
        localStorage.setItem('motorx_admin_user', JSON.stringify(adminUser));
      } else {
        localStorage.removeItem('motorx_admin_user');
      }
    } catch (e) {
      console.error('Failed to sync admin auth to localStorage:', e);
    }
  }, [adminToken, adminUser]);

  const loginAdmin = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      const msg = json.message || (json.errors && json.errors[0]?.msg) || 'Admin authentication failed';
      throw new Error(msg);
    }

    setAdminToken(json.token);
    setAdminUser(json.admin);
    return json.admin;
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    setAdminUser(null);
    try {
      localStorage.removeItem('motorx_admin_token');
      localStorage.removeItem('motorx_admin_user');
    } catch (e) {}
  };

  const isAdminAuthenticated = Boolean(adminToken && adminUser);

  return (
    <AdminAuthContext.Provider value={{
      adminToken,
      adminUser,
      isAdminAuthenticated,
      loginAdmin,
      logoutAdmin
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
