'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const withAuth = (WrappedComponent) => {
  const ComponentWithAuth = (props) => {
    const router = useRouter();
    const { isLoggedIn } = useAuth();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
      if (!isLoggedIn) {
        router.replace('/auth?mode=login'); // Use `replace` to prevent back navigation
      } else {
        setCheckingAuth(false);
      }
    }, [router, isLoggedIn]);

    if (checkingAuth) {
      return null; // Don't render the page until auth is verified
    }

    return <WrappedComponent {...props} />;
  };

  ComponentWithAuth.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return ComponentWithAuth;
};

export default withAuth;
