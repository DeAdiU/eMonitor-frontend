'use client'; // This makes sure it's only rendered on the client side

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const AuthWrapper = ({ children }) => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && <Navbar />}
      {children}
    </>
  );
};

export default AuthWrapper;
