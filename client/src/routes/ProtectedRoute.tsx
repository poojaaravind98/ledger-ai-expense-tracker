import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/common/LoadingSkeleton';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-8">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse mx-auto" />
          <p className="text-xs text-gray-400">Authenticating Ledger session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
