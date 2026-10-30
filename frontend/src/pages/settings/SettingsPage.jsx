import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Store,
  Receipt,
  Globe,
  User,
  Shield,
  Save,
  Clock,
  LogOut
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const SettingsPage = () => {
  const { settings, updateSettings } = useStore();
  const { user, role, expireSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Local Form State
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeTagline, setStoreTagline] = useState(settings.storeTagline);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [ntn, setNtn] = useState(settings.ntn);
  const [currency, setCurrency] = useState(settings.currency);
  const [taxRatePercent, setTaxRatePercent] = useState(settings.taxRatePercent);
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [language, setLanguage] = useState(settings.language);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({
      storeName,
      storeTagline,
      address,
      phone,
      ntn,
      currency,
      taxRatePercent,
      receiptHeader,
      receiptFooter,
      language
    });

    // Update document direction for Urdu/Arabic RTL support
    if (language === 'ur' || language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }

    toast.success('Settings Saved', 'Store information and POS thermal receipt layout updated.');
  };

  const handleSimulateExpiry = () => {
    expireSession();
    navigate('/session-expired');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#007f87]" />
          <span>Store Configuration & Staff Preferences</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure Foji Book Center branches, thermal receipt headers, currency, and multi-language RTL support.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Store Profile Information */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Store className="w-5 h-5 text-[#007f87]" />
            <h3 className="text-sm font-semibold text-slate-900">Store Identity & Contact Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Store Commercial Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />

            <Input
              label="Tagline / Department Scope"
              value={storeTagline}
              onChange={(e) => setStoreTagline(e.target.value)}
            />

            <Input
              label="Physical Address / Outlet Location"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />

            <Input
              label="Contact Phone / WhatsApp Support"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Input
              label="National Tax Number (NTN / STRN)"
              value={ntn}
              onChange={(e) => setNtn(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Currency Symbol"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                required
              />
              <Input
                label="General Sales Tax (%)"
                type="number"
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Thermal Receipt Configuration */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Receipt className="w-5 h-5 text-[#007f87]" />
            <h3 className="text-sm font-semibold text-slate-900">Thermal Receipt Layout & Disclaimers</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt Header Custom Message
              </label>
              <textarea
                rows={2}
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Receipt Footer Terms & Return Policy
              </label>
              <textarea
                rows={2}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
              />
            </div>
          </div>
        </div>

        {/* Language & RTL Settings */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Globe className="w-5 h-5 text-[#007f87]" />
            <h3 className="text-sm font-semibold text-slate-900">Regional Localization & Direction</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Display Language (LTR / RTL Support)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: 'en', label: 'English (LTR standard)', dir: 'ltr' },
                { code: 'ur', label: 'اردو - Urdu (RTL localized)', dir: 'rtl' },
                { code: 'ar', label: 'العربية - Arabic (RTL)', dir: 'rtl' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`p-3 rounded-xl border text-xs font-medium text-left transition ${
                    language === lang.code
                      ? 'bg-teal-50 border-[#007f87] text-[#007f87] shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{lang.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Direction: {lang.dir.toUpperCase()}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button variant="primary" size="md" type="submit" icon={<Save className="w-4 h-4" />}>
            Save Store Configuration
          </Button>
        </div>
      </form>

      {/* Active Session & Security Controls */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <Shield className="w-5 h-5 text-[#007f87]" />
          <h3 className="text-sm font-semibold text-slate-900">Active Session & Security</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 block">Authenticated User:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{user?.name || user?.username || 'Authenticated Staff'}</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#007f87]/10 text-[#007f87] border border-[#007f87]/20">
                {role || 'Staff'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Security permissions are managed by the administrator.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-700 block">Counter Lockout:</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Lock this terminal immediately when leaving the counter.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Clock className="w-4 h-4 text-amber-600" />}
              onClick={handleSimulateExpiry}
            >
              Lock Terminal Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
