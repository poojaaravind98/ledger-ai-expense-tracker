import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ExpenseFormModal } from '../expenses/ExpenseFormModal';
import { ReceiptUploadModal } from '../receipts/ReceiptUploadModal';

export const AppLayout: React.FC = () => {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0B0F19] text-gray-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Quick Add Expense Modal */}
      <ExpenseFormModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      {/* Global Receipt Upload Modal */}
      <ReceiptUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};
