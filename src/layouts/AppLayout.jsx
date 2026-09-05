import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import EnvNotice from '../components/common/EnvNotice';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { APP_ROUTES } from '../utils/constants';

export const AppLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast.success('You have been signed out successfully.', 'Goodbye!');
      setShowLogoutModal(false);
      navigate(APP_ROUTES.LOGIN);
    } catch (err) {
      console.error('Logout error:', err);
      toast.error(err.message || 'Failed to sign out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <EnvNotice />

      {/* Main Layout Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogoutClick={() => setShowLogoutModal(true)}
        />

        {/* Content Wrapper */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Top Header */}
          <Header
            onOpenMobileMenu={() => setMobileSidebarOpen(true)}
            onLogoutClick={() => setShowLogoutModal(true)}
          />

          {/* Page Content Outlet */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => !isLoggingOut && setShowLogoutModal(false)}
        title="Sign Out of TeamFlow"
        description="Are you sure you want to end your current session?"
        size="sm"
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            onClick={() => setShowLogoutModal(false)}
            disabled={isLoggingOut}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleLogout}
            isLoading={isLoggingOut}
          >
            Yes, Sign Out
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AppLayout;
