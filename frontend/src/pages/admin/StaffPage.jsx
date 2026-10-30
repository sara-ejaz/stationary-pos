import React, { useState } from 'react';
import { UserCheck, Plus, Edit2, Power, Shield, Mail } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';

export const StaffPage = () => {
  const { staff, addStaff, updateStaff, toggleStaffStatus } = useStore();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Cashier');
  const [status, setStatus] = useState('active');

  const openCreateModal = () => {
    setEditingStaff(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setRole('Cashier');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingStaff(u);
    setFullName(u.fullName);
    setUsername(u.username);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim()) {
      toast.error('Validation Error', 'Full Name and Username are mandatory.');
      return;
    }

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        fullName,
        username,
        email,
        role,
        status
      });
      toast.success('Staff Updated', `Account for ${fullName} updated.`);
    } else {
      addStaff({
        fullName,
        username,
        email,
        role,
        status
      });
      toast.success('Staff Created', `Demo staff profile for ${fullName} (${role}) added.`);
    }

    setIsModalOpen(false);
  };

  const columns = [
    {
      key: 'fullName',
      header: 'Staff Member',
      sortable: true,
      render: (u) => (
        <div>
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#007f87]" />
            <span>{u.fullName}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">@{u.username}</div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email Address',
      render: (u) => (
        <span className="text-xs text-slate-600 flex items-center gap-1">
          <Mail className="w-3 h-3 text-slate-400" />
          <span>{u.email}</span>
        </span>
      )
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (u) => {
        let variant = 'neutral';
        if (u.role === 'Admin') variant = 'primary';
        else if (u.role === 'Cashier') variant = 'info';
        else if (u.role === 'Inventory Staff') variant = 'warning';

        return (
          <Badge variant={variant} size="sm">
            {u.role}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      render: (u) => (
        <Badge variant={u.status === 'active' ? 'success' : 'danger'} size="sm">
          {u.status === 'active' ? 'Active' : 'Disabled'}
        </Badge>
      )
    },
    {
      key: 'lastLogin',
      header: 'Recent Activity',
      render: (u) => (
        <span className="text-xs text-slate-500">{u.lastLogin || 'Never logged in'}</span>
      )
    },
    {
      key: 'actions',
      header: 'Manage',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(u)}>
            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              toggleStaffStatus(u.id);
              toast.info('Status Changed', `Status updated for ${u.fullName}.`);
            }}
          >
            <Power
              className={`w-3.5 h-3.5 ${
                u.status === 'active' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#007f87]" />
            <span>Staff Management & Security Access Roles</span>
          </h2>
          <p className="text-xs text-slate-500">
            Define system credentials, POS cashier authorization, and inventory staff access privileges.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
        >
          Add Staff Member
        </Button>
      </div>

      {/* Staff Table */}
      <DataTable
        columns={columns}
        data={staff}
        searchPlaceholder="Search staff by name, username or email..."
        searchKeys={['fullName', 'username', 'email', 'role']}
      />

      {/* Modal: Create/Edit Staff */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? `Edit Staff Member: ${editingStaff.fullName}` : 'Add New Staff Profile'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Full Name"
            placeholder="e.g. Asad Qureshi"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Username (Login Handle)"
            placeholder="e.g. asad_pos"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. asad@fojibookcenter.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Role & Security Privileges</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
            >
              <option value="Admin">Admin (Full Unrestricted Access)</option>
              <option value="Cashier">Cashier (Point of Sale, Sales Returns, Receipts)</option>
              <option value="Inventory Staff">Inventory Staff (Catalog, Stock Audit, Purchasing)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
            >
              <option value="active">Active (Permitted to log in)</option>
              <option value="disabled">Disabled (Temporarily locked)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingStaff ? 'Update Profile' : 'Create Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default StaffPage;
