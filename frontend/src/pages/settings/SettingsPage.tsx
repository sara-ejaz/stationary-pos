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
  LogOut,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const { user, role, switchRole, logout, expireSession } = useAuth();
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
  const [language, setLanguage] = useState<'en' | 'ur' | 'ar'>(settings.language);

  const handleSaveSettings = (e: React.FormEvent) => {
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
        <h2 className="text-xl font-bold text-[#f2fbfa] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#007f87]" />
          <span>Store Configuration & Staff Preferences</span>
        </h2>
        <p className="text-xs text-[#8da5a7] mt-0.5">
          Configure Foji Book Center branches, thermal receipt headers, currency, and multi-language RTL support.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Store Profile Information */}
        <div className="p-6 rounded-2xl bg-[#0a2224] border border-[#143d41] shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#143d41]">
            <Store className="w-5 h-5 text-[#007f87]" />
            <h3 className="text-sm font-semibold text-[#f2fbfa]">Store Identity & Contact Details</h3>
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
              label="Branch Physical Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <Input
              label="Contact Phone Numbers"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="National Tax Number (NTN)"
              value={ntn}
              onChange={(e) => setNtn(e.target.value)}
            />

            <Input
              label="Base POS Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              helperText="Default: PKR (Pakistani Rupee)"
            />
          </div>
        </div>

        {/* Thermal Receipt Preferences */}
        <div className="p-6 rounded-2xl bg-[#0a2224] border border-[#143d41] shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#143d41]">
            <Receipt className="w-5 h-5 text-[#007f87]" />
            <h3 className="text-sm font-semibold text-[#f2fbfa]">Thermal Receipt Display Formatting</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">
                Receipt Header Text (Printed at Top of Slip)
              </label>
              <textarea
                rows={2}
                value={receiptHeader}
                onChange={(e) => setReceiptHeader(e.target.value)}
                className="w-full bg-[#07181a] border border-[#143d41] rounded-lg p-3 text-xs text-[#f2fbfa] font-mono focus:outline-none focus:border-[#007f87]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">
                Receipt Footer Notice & Return Policy (Printed at Bottom of Slip)
              </label>
              <textarea
                rows={3}
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-[#07181a] border border-[#143d41] rounded-lg p-3 text-xs text-[#f2fbfa] font-mono focus:outline-none focus:border-[#007f87]"
              />
            </div>
          </div>
        </div>

        {/* Multi-language & Layout Direction */}
        <div className="p-6 rounded-2xl bg-[#0a2224] border border-[#143d41] shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#143d41]">
            <Globe className="w-5 h-5 text-[#007f87]" />
            <h3 className="text-sm font-semibold text-[#f2fbfa]">
              Regional Languages & Right-to-Left (RTL) Layout
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English (Default LTR)', dir: 'Left-to-Right' },
              { id: 'ur', label: 'اردو (Urdu RTL)', dir: 'Right-to-Left' },
              { id: 'ar', label: 'العربية (Arabic RTL)', dir: 'Right-to-Left' }
            ].map((lang) => {
              const active = language === lang.id;
              return (
                <div
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                    active
                      ? 'bg-[#007f87]/20 border-[#007f87] text-[#d4f1f4]'
                      : 'bg-[#07181a] border-[#143d41] text-[#8da5a7] hover:border-[#005f6a]'
                  }`}
                >
                  <p className="font-semibold text-sm">{lang.label}</p>
                  <p className="text-[10px] text-[#59787a] mt-0.5">{lang.dir}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Session & Testing Controls */}
        <div className="p-6 rounded-2xl bg-[#0a2224] border border-[#143d41] shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#143d41]">
            <User className="w-5 h-5 text-[#007f87]" />
            <h3 className="text-sm font-semibold text-[#f2fbfa]">Active Staff Session & Diagnostics</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <p className="font-semibold text-[#f2fbfa]">{user?.name} (@{user?.username})</p>
              <p className="text-[#8da5a7]">Current Role: <span className="text-[#007f87] font-bold">{role}</span></p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Clock className="w-3.5 h-3.5 text-[#f59e0b]" />}
                onClick={handleSimulateExpiry}
              >
                Simulate Session Expiry
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={<LogOut className="w-3.5 h-3.5" />}
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
          >
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
