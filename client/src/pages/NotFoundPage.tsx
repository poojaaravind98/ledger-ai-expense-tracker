import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-2xl font-bold mb-4 shadow-glow-brand">
        404
      </div>
      <h1 className="text-2xl font-extrabold text-white">Page Not Found</h1>
      <p className="text-xs text-gray-400 mt-2 max-w-sm">
        The financial page or report you requested does not exist or has been relocated.
      </p>
      <NavLink to="/dashboard" className="mt-6">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Return to Command Center
        </Button>
      </NavLink>
    </div>
  );
};
