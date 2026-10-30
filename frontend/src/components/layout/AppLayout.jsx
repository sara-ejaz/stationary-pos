import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalSearchModal } from './GlobalSearchModal';

export const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'F2') {
        e.preventDefault();
        navigate('/pos');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-[#f8fafb] text-[#0f172a]">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden bg-[#f8fafb]">
        <Header onOpenSearch={() => setIsSearchOpen(true)} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Search & Lookup Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
export default AppLayout;
