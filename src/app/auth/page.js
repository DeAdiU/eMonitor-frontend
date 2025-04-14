'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from './login-form';
import RegisterForm from './register-form';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authMode, setAuthMode] = useState('login'); // Default to login

  useEffect(() => {
    // Get the mode from URL query parameter
    const mode = searchParams.get('mode');
    if (mode === 'register' || mode === 'login') {
      setAuthMode(mode);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center py-2 px-4">
      <div className="w-full max-w-3xl">
        
        {/* Toggle buttons */}
        {/* <div className="flex border-b border-gray-300 mb-6">
          <button
            className={`px-4 py-2 w-1/2 text-center ${
              authMode === 'login'
                ? 'border-b-2 border-blue-500 text-blue-500 font-medium'
                : 'text-gray-500'
            }`}
            onClick={() => router.push('/auth?mode=login')}
          >
            Login
          </button>
          <button
            className={`px-4 py-2 w-1/2 text-center ${
              authMode === 'register'
                ? 'border-b-2 border-blue-500 text-blue-500 font-medium'
                : 'text-gray-500'
            }`}
            onClick={() => router.push('/auth?mode=register')}
          >
            Register
          </button>
        </div> */}

        {/* Conditional rendering based on authMode */}
        {authMode === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}