'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // Load user details & wishlist on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('sneakverse_user');
    const storedToken = localStorage.getItem('sneakverse_token');
    const storedWishlist = localStorage.getItem('sneakverse_wishlist');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist));
    }
    setLoading(false);
  }, []);

  // Sync wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('sneakverse_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin
      });
      setToken(data.token);
      localStorage.setItem('sneakverse_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin
      }));
      localStorage.setItem('sneakverse_token', data.token);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin
      });
      setToken(data.token);
      localStorage.setItem('sneakverse_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin
      }));
      localStorage.setItem('sneakverse_token', data.token);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sneakverse_user');
    localStorage.removeItem('sneakverse_token');
  };

  // Update Profile handler
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin
      });
      setToken(data.token);
      localStorage.setItem('sneakverse_user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin
      }));
      localStorage.setItem('sneakverse_token', data.token);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Wishlist toggle handler
  const toggleWishlist = (product) => {
    const isExist = wishlist.find((item) => item._id === product._id);
    if (isExist) {
      setWishlist(wishlist.filter((item) => item._id !== product._id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        wishlist,
        login,
        register,
        logout,
        updateProfile,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
