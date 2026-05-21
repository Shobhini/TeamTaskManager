import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import AppShell from './AppShell';
import type { ReactNode } from 'react';

interface DecodedToken {
  exp: number;
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (decoded.exp * 1000 < Date.now()) {
      logout();
      return <Navigate to="/login" replace />;
    }
  } catch {
    logout();
    return <Navigate to="/login" replace />;
  }
  return <AppShell>{children}</AppShell>;
}
