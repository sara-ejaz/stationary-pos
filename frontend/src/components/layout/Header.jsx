import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Globe,
  User,
  Shield,
  LogOut,
  AlertTriangle,
  PackageCheck,
  Check,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';

export const Header = ({ onOpenSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { products, purchases, settings, updateSettings } = useStore();

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

  const roles = ['Admin', 'Cashier', 'Inventory Staff'];

  const languages = [
    { code: 'en', label: 'English', dir: 'ltr' },
    { code: 'ur', label: 'اردو (Urdu)', dir: 'rtl' },
    { code: 'ar', label: 'العربية (Arabic)', dir: 'rtl' }
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-xs">
      {/* Left: Page Title & Breadcrumbs */}
      <div>
        <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
          {pageTitle}
        </h1>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
          <span>Foji POS</span>
          {pathParts.map((part, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300">/</span>
              <span className="capitalize text-slate-600">{part.replace(/-/g, ' ')}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Center & Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:border-[#007f87] hover:text-slate-900 transition cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[#007f87]" />
          <span>Search catalog, invoices, suppliers...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-slate-200 text-[10px] text-slate-700 font-medium">
            Ctrl K
          </kbd>
        </button>

        {/* Current Role Badge (read-only) */}
        {role && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs">
            <Shield className="w-3.5 h-3.5 text-[#007f87]" />
            <span className="font-semibold text-slate-800">{role}</span>
          </div>
        )}

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowNotifMenu(false);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Language selector"
          >
            <Globe className="w-4 h-4 text-slate-600" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase">
                Display Language
              </div>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    updateSettings({ language: l.code });
                    document.documentElement.dir = l.dir;
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    settings.language === l.code
                      ? 'bg-teal-50 text-[#007f87] font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
              setShowLangMenu(false);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {totalNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f43f5e] animate-pulse" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-semibold text-slate-900">Store Notifications</span>
                <span className="text-[10px] text-[#007f87] font-semibold">
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
                    className="flex items-start gap-2 p-2 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer hover:bg-rose-100 transition"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-900">
                        {outOfStockCount} Products Out of Stock
                      </p>
                      <p className="text-[10px] text-rose-700">
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
                    className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">
                        {lowStockCount} Products Low on Stock
                      </p>
                      <p className="text-[10px] text-amber-700">Below minimum threshold limit.</p>
                    </div>
                  </div>
                )}
                {pendingPOCount > 0 && (
                  <div
                    onClick={() => {
                      navigate('/purchasing/orders');
                      setShowNotifMenu(false);
                    }}
                    className="flex items-start gap-2 p-2 rounded-lg bg-teal-50 border border-teal-200 cursor-pointer hover:bg-teal-100 transition"
                  >
                    <PackageCheck className="w-4 h-4 text-[#007f87] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#003d40]">
                        {pendingPOCount} Purchases Pending
                      </p>
                      <p className="text-[10px] text-teal-700">Awaiting supplier stock receipt.</p>
                    </div>
                  </div>
                )}
                {totalNotifications === 0 && (
                  <p className="text-center py-4 text-slate-400 text-[11px]">
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
              setShowNotifMenu(false);
              setShowLangMenu(false);
            }}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#007f87] transition bg-white cursor-pointer shadow-2xs"
          >
            <div className="w-6 h-6 rounded-full bg-[#007f87] text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
              <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  navigate('/settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-100 transition cursor-pointer"
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition cursor-pointer"
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
export default Header;
