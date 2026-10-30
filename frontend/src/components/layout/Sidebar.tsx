import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  PenTool,
  Barcode,
  Boxes,
  AlertOctagon,
  Truck,
  ShoppingCart,
  RotateCcw,
  Receipt,
  FileBarChart,
  UserCheck,
  Database,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { role } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();

  // Navigation Groups with Role-based constraints
  // Roles: 'Admin' (full), 'Cashier' (POS, Lookup, Sales Returns, Transactions), 'Inventory Staff' (Catalog, Inventory, Purchasing, Reports)
  const navGroups = [
    {
      title: 'Overview',
      items: [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard, allowed: ['Admin', 'Cashier', 'Inventory Staff'] }
      ]
    },
    {
      title: 'Point of Sale',
      items: [
        {
          path: '/pos',
          label: 'POS Counter',
          icon: ShoppingCart,
          allowed: ['Admin', 'Cashier'],
          isPrimaryAction: true,
          badge: totalItemsCount > 0 ? `${totalItemsCount}` : undefined
        }
      ]
    },
    {
      title: 'Catalog',
      items: [
        { path: '/catalog/categories', label: 'Categories', icon: Layers, allowed: ['Admin', 'Inventory Staff'] },
        { path: '/catalog/books', label: 'Books Catalog', icon: BookOpen, allowed: ['Admin', 'Cashier', 'Inventory Staff'] },
        { path: '/catalog/stationery', label: 'Stationery Catalog', icon: PenTool, allowed: ['Admin', 'Cashier', 'Inventory Staff'] },
        { path: '/catalog/barcode-lookup', label: 'Barcode & Lookup', icon: Barcode, allowed: ['Admin', 'Cashier', 'Inventory Staff'] }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { path: '/inventory', label: 'Stock Workspace', icon: Boxes, allowed: ['Admin', 'Inventory Staff'] },
        { path: '/inventory/alerts', label: 'Low Stock & Damage', icon: AlertOctagon, allowed: ['Admin', 'Inventory Staff'] },
        { path: '/inventory/history', label: 'Stock Movements', icon: History, allowed: ['Admin', 'Inventory Staff'] }
      ]
    },
    {
      title: 'Purchasing',
      items: [
        { path: '/purchasing/orders', label: 'Purchase Orders', icon: Truck, allowed: ['Admin', 'Inventory Staff'] },
        { path: '/purchasing/suppliers', label: 'Suppliers Directory', icon: Truck, allowed: ['Admin', 'Inventory Staff'] },
        { path: '/purchasing/returns', label: 'Purchase Returns', icon: RotateCcw, allowed: ['Admin', 'Inventory Staff'] }
      ]
    },
    {
      title: 'Sales & Returns',
      items: [
        { path: '/transactions', label: 'Transactions History', icon: Receipt, allowed: ['Admin', 'Cashier'] },
        { path: '/returns/sales', label: 'Sales Returns & Refunds', icon: RotateCcw, allowed: ['Admin', 'Cashier'] }
      ]
    },
    {
      title: 'Reports',
      items: [
        { path: '/reports/sales', label: 'Sales Reports', icon: FileBarChart, allowed: ['Admin'] },
        { path: '/reports/inventory', label: 'Inventory Valuation', icon: FileBarChart, allowed: ['Admin', 'Inventory Staff'] },
        { path: '/reports/purchases', label: 'Purchase Reports', icon: FileBarChart, allowed: ['Admin'] }
      ]
    },
    {
      title: 'Administration',
      items: [
        { path: '/admin/staff', label: 'Staff Management', icon: UserCheck, allowed: ['Admin'] },
        { path: '/admin/backup', label: 'Backup & Restore', icon: Database, allowed: ['Admin'] },
        { path: '/admin/audit', label: 'Audit Trail', icon: History, allowed: ['Admin'] }
      ]
    },
    {
      title: 'System',
      items: [
        { path: '/settings', label: 'Store Settings', icon: Settings, allowed: ['Admin', 'Inventory Staff', 'Cashier'] }
      ]
    }
  ];

  return (
    <aside
      className={`bg-[#00272b] border-r border-[#143d41] flex flex-col transition-all duration-300 z-40 h-screen sticky top-0 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#143d41] shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#007f87] flex items-center justify-center text-white font-bold text-sm shadow-md shadow-[#007f87]/30 shrink-0">
              FB
            </div>
            <div className="truncate">
              <h2 className="text-sm font-bold text-[#f2fbfa] tracking-tight leading-none">
                FOJI BOOK CENTER
              </h2>
              <p className="text-[10px] text-[#007f87] font-semibold mt-0.5 tracking-wider uppercase">
                POS & Inventory
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-[#007f87] flex items-center justify-center text-white font-bold text-sm mx-auto">
            FB
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="text-[#8da5a7] hover:text-[#f2fbfa] p-1.5 rounded-lg hover:bg-[#003d40] transition hidden lg:block"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group, gIdx) => {
          // Check if any items in group are visible
          return (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold text-[#59787a] uppercase tracking-wider">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isPermitted = item.allowed.includes(role);
                const Icon = item.icon;

                if (!isPermitted) {
                  return (
                    <div
                      key={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#59787a]/60 cursor-not-allowed select-none ${
                        collapsed ? 'justify-center' : ''
                      }`}
                      title={`Requires ${item.allowed.join(' or ')} permission`}
                    >
                      <Icon className="w-4 h-4 shrink-0 opacity-40" />
                      {!collapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{item.label}</span>
                          <Lock className="w-3 h-3 text-[#59787a]/40" />
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        collapsed ? 'justify-center' : ''
                      } ${
                        item.isPrimaryAction && !isActive
                          ? 'bg-[#007f87]/15 text-[#d4f1f4] border border-[#007f87]/40 hover:bg-[#007f87]/25'
                          : isActive
                          ? 'bg-[#007f87] text-white shadow-md shadow-[#007f87]/30 font-semibold'
                          : 'text-[#8da5a7] hover:bg-[#003d40] hover:text-[#f2fbfa]'
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!collapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f43f5e] text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* POS Quick Launcher bottom banner */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-[#003d40] to-[#005f6a] border border-[#007f87]/40 text-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#d4f1f4] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#007f87]" />
            <span>Foji POS Ready</span>
          </div>
          <p className="text-[10px] text-[#8da5a7] mb-2.5">
            Press F2 or click below for instant cashier checkout.
          </p>
          <button
            onClick={() => navigate('/pos')}
            className="w-full py-1.5 rounded-lg bg-[#007f87] hover:bg-[#009aa4] text-white font-medium text-xs shadow-sm transition"
          >
            Launch POS Counter
          </button>
        </div>
      )}
    </aside>
  );
};
