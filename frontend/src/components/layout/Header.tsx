import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Globe,
  User,
  Shield,
  LogOut,
  ChevronDown,
  AlertTriangle,
  PackageCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { Role } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, switchRole, logout } = useAuth();
  const { products, purchases, settings, updateSettings } = useStore();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Compute breadcrumbs and title
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle =
    pathParts.length === 0
      ? 'Overview Dashboard'
      : pathParts[pathParts.length - 1]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());

  // Count low stock items & pending purchases
  const lowStockCount = products.filter(
    (p) => p.quantity > 0 && p.quantity <= p.minStockThreshold
  ).length;
  const outOfStockCount = products.filter((p) => p.quantity === 0).length;
  const pendingPOCount = purchases.filter((p) => p.status === 'pending').length;
  const totalNotifications = (lowStockCount > 0 ? 1 : 0) + (outOfStockCount > 0 ? 1 : 0) + (pendingPOCount > 0 ? 1 : 0);

  const roles: Role[] = ['Admin', 'Cashier', 'Inventory Staff'];

  const languages = [
    { code: 'en', label: 'English', dir: 'ltr' },
    { code: 'ur', label: 'اردو (Urdu)', dir: 'rtl' },
    { code: 'ar', label: 'العربية (Arabic)', dir: 'rtl' }
  ];

  return (
    <header className="h-16 bg-[#00272b] border-b border-[#143d41] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
      {/* Left: Page Title & Breadcrumbs */}
      <div>
        <h1 className="text-base font-bold text-[#f2fbfa] flex items-center gap-2">
          {pageTitle}
        </h1>
        <div className="flex items-center gap-1.5 text-[11px] text-[#8da5a7] mt-0.5">
          <span>Foji POS</span>
          {pathParts.map((part, idx) => (
            <React.Fragment key={idx}>
              <span className="text-[#59787a]">/</span>
              <span className="capitalize">{part.replace(/-/g, ' ')}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Center & Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#07181a] border border-[#143d41] text-xs text-[#8da5a7] hover:border-[#007f87] hover:text-[#f2fbfa] transition"
        >
          <Search className="w-3.5 h-3.5 text-[#007f87]" />
          <span>Search catalog, invoices, suppliers...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-[#143d41] text-[10px] text-[#d4f1f4]">
            Ctrl K
          </kbd>
        </button>

        {/* Demo Role Switcher Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifMenu(false);
              setShowLangMenu(false);
              setShowProfileMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#003d40] border border-[#007f87]/50 text-xs text-[#d4f1f4] hover:bg-[#005f6a] transition"
            title="Click to switch role in Demo Mode"
          >
            <Shield className="w-3.5 h-3.5 text-[#007f87]" />
            <span className="font-semibold">{role}</span>
            <span className="text-[10px] px-1 rounded bg-[#007f87]/40 text-white uppercase font-bold">
              Demo
            </span>
            <ChevronDown className="w-3 h-3 text-[#8da5a7]" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0a2224] border border-[#143d41] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 border-b border-[#143d41] mb-1">
                <p className="text-[11px] font-semibold text-[#8da5a7]">Switch Demo Role</p>
                <p className="text-[10px] text-[#59787a]">Inspect UI permissions by role</p>
              </div>
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    role === r
                      ? 'bg-[#007f87]/20 text-[#d4f1f4] font-medium'
                      : 'text-[#8da5a7] hover:bg-[#003d40] hover:text-[#f2fbfa]'
                  }`}
                >
                  <span>{r}</span>
                  {role === r && <Check className="w-3.5 h-3.5 text-[#007f87]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowRoleMenu(false);
              setShowNotifMenu(false);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg border border-[#143d41] text-[#8da5a7] hover:text-[#f2fbfa] hover:bg-[#003d40] transition"
            title="Language selector"
          >
            <Globe className="w-4 h-4" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-[#0a2224] border border-[#143d41] rounded-xl shadow-2xl p-1.5 z-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-[#59787a] uppercase">
                Display Language
              </div>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    updateSettings({ language: l.code as any });
                    document.documentElement.dir = l.dir;
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                    settings.language === l.code
                      ? 'bg-[#007f87]/20 text-[#d4f1f4] font-medium'
                      : 'text-[#8da5a7] hover:bg-[#003d40] hover:text-[#f2fbfa]'
                  }`}
                >
                  <span>{l.label}</span>
                  {settings.language === l.code && <Check className="w-3.5 h-3.5 text-[#007f87]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowRoleMenu(false);
              setShowLangMenu(false);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg border border-[#143d41] text-[#8da5a7] hover:text-[#f2fbfa] hover:bg-[#003d40] transition relative"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f43f5e] animate-pulse" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-[#0a2224] border border-[#143d41] rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-[#143d41] mb-2">
                <span className="text-xs font-semibold text-[#f2fbfa]">Store Notifications</span>
                <span className="text-[10px] text-[#007f87] font-medium">
                  {totalNotifications} active
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {outOfStockCount > 0 && (
                  <div
                    onClick={() => {
                      navigate('/inventory/alerts');
                      setShowNotifMenu(false);
                    }}
                    className="flex items-start gap-2 p-2 rounded-lg bg-[#280d14] border border-[#f43f5e]/30 cursor-pointer hover:bg-[#34121a]"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#f43f5e] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#f2fbfa]">
                        {outOfStockCount} Products Out of Stock
                      </p>
                      <p className="text-[10px] text-[#8da5a7]">
                        Items require replenishment from distributors.
                      </p>
                    </div>
                  </div>
                )}
                {lowStockCount > 0 && (
                  <div
                    onClick={() => {
                      navigate('/inventory/alerts');
                      setShowNotifMenu(false);
                    }}
                    className="flex items-start gap-2 p-2 rounded-lg bg-[#291e0a] border border-[#f59e0b]/30 cursor-pointer hover:bg-[#382a0d]"
                  >
                    <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#f2fbfa]">
                        {lowStockCount} Products Low on Stock
                      </p>
                      <p className="text-[10px] text-[#8da5a7]">Below minimum threshold limit.</p>
                    </div>
                  </div>
                )}
                {pendingPOCount > 0 && (
                  <div
                    onClick={() => {
                      navigate('/purchasing/orders');
                      setShowNotifMenu(false);
                    }}
                    className="flex items-start gap-2 p-2 rounded-lg bg-[#00272b] border border-[#007f87]/40 cursor-pointer hover:bg-[#003d40]"
                  >
                    <PackageCheck className="w-4 h-4 text-[#007f87] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#f2fbfa]">
                        {pendingPOCount} Purchases Pending
                      </p>
                      <p className="text-[10px] text-[#8da5a7]">Awaiting supplier stock receipt.</p>
                    </div>
                  </div>
                )}
                {totalNotifications === 0 && (
                  <p className="text-center py-4 text-[#59787a] text-[11px]">
                    All stock thresholds are healthy.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowRoleMenu(false);
              setShowNotifMenu(false);
              setShowLangMenu(false);
            }}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-[#143d41] hover:border-[#007f87] transition bg-[#07181a]"
          >
            <div className="w-6 h-6 rounded-full bg-[#007f87] text-white flex items-center justify-center text-xs font-bold">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[#f2fbfa] leading-none">{user?.name}</p>
              <p className="text-[10px] text-[#8da5a7] mt-0.5">{role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8da5a7]" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#0a2224] border border-[#143d41] rounded-xl shadow-2xl p-2 z-50">
              <div className="px-2.5 py-2 border-b border-[#143d41] mb-1">
                <p className="text-xs font-semibold text-[#f2fbfa]">{user?.name}</p>
                <p className="text-[10px] text-[#8da5a7]">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#8da5a7] hover:bg-[#003d40] hover:text-[#f2fbfa] transition"
              >
                <User className="w-3.5 h-3.5 text-[#007f87]" />
                <span>Store & POS Settings</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-[#f43f5e] hover:bg-[#f43f5e]/15 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
