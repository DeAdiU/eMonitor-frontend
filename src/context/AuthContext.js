'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token =localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const login = async (email,password) => {
    try{
        const response= await axios.post('http://127.0.0.1:8000/api/login/', { "username": email, "password":password });
        const token = response.data.access
        const refresh = response.data.refresh
        router.push('/');
        toast('Login successful');
        localStorage.setItem('token', token);
        localStorage.setItem('refresh', refresh);
        setIsLoggedIn(true);
        
    } catch(error){
        if (error.response.data){
        toast.error(error.response.data.detail);
        console.log(error.response.data);
        }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/');
    setIsLoggedIn(false);
  };
   const getToken = () => {
    const token = localStorage.getItem('token');
    return token;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);