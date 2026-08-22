import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, LogOut, User, Bell } from 'lucide-react';
import { Button } from '../common/Button';

interface NavbarProps {
  onOpenQuickAdd?: () => void;
  onOpenUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAdd, onOpenUpload }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-[#0B0F19]/80 backdrop-blur-md border-b border-gray-800/80">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>AI Engine Active</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onOpenUpload && (
          <Button variant="outline" size="sm" onClick={onOpenUpload}>
            Scan Receipt
          </Button>
        )}
        {onOpenQuickAdd && (
          <Button variant="primary" size="sm" onClick={onOpenQuickAdd}>
            + Add Expense
          </Button>
        )}

        <div className="h-5 w-px bg-gray-800 mx-1" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 pl-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-600/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-gray-400 leading-tight">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Logout"
            className="p-2 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-gray-800/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
