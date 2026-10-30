import React, { useState } from 'react';
import { UserCheck, Plus, Edit2, Power, Shield, Mail, CheckCircle2, Info } from 'lucide-react';
import { StaffUser, Role } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';

export const StaffPage: React.FC = () => {
  const { staff, addStaff, updateStaff, toggleStaffStatus } = useStore();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('Cashier');
  const [status, setStatus] = useState<'active' | 'disabled'>('active');

  const openCreateModal = () => {
    setEditingStaff(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setRole('Cashier');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (u: StaffUser) => {
    setEditingStaff(u);
    setFullName(u.fullName);
    setUsername(u.username);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
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

  const columns: Column<StaffUser>[] = [
    {
      key: 'fullName',
      header: 'Staff Member',
      sortable: true,
      render: (u) => (
        <div>
          <div className="font-semibold text-[#f2fbfa] flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#007f87]" />
            <span>{u.fullName}</span>
          </div>
          <div className="text-[10px] text-[#59787a] font-mono">@{u.username}</div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email Address',
      render: (u) => (
        <span className="text-xs text-[#8da5a7] flex items-center gap-1">
          <Mail className="w-3 h-3 text-[#59787a]" />
          <span>{u.email}</span>
        </span>
      )
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (u) => (
        <Badge
          variant={
            u.role === 'Admin' ? 'primary' : u.role === 'Cashier' ? 'info' : 'warning'
          }
          size="sm"
        >
          {u.role}
        </Badge>
      )
    },
    {
      key: 'lastLogin',
      header: 'Last Active Session',
      render: (u) => <span className="text-xs text-[#8da5a7]">{u.lastLogin || 'Never'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <Badge variant={u.status === 'active' ? 'success' : 'danger'} size="sm">
          {u.status === 'active' ? 'Active' : 'Disabled'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openEditModal(u)}
            title="Edit Staff Account"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toggleStaffStatus(u.id);
              toast.info(
                'Status Changed',
                `${u.fullName} is now ${u.status === 'active' ? 'Disabled' : 'Active'}.`
              );
            }}
            title={u.status === 'active' ? 'Disable Account' : 'Activate Account'}
          >
            <Power
              className={`w-3.5 h-3.5 ${
                u.status === 'active' ? 'text-[#f43f5e]' : 'text-[#10b981]'
              }`}
            />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Simulation Notice */}
      <div className="p-3.5 rounded-xl bg-[#00272b] border border-[#007f87]/40 flex items-center gap-3 text-xs text-[#d4f1f4]">
        <Info className="w-4 h-4 text-[#007f87] shrink-0" />
        <p>
          <span className="font-bold">Staff Administration (Demo Mode):</span> Account roles and permission toggles are simulated for frontend testing. Production user management and JWT auth will be provided by your Express.js backend.
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#007f87]" />
            <span>Staff Accounts & Role Privileges</span>
          </h2>
          <p className="text-xs text-[#8da5a7]">
            Manage store cashiers, inventory clerks, and administrator access credentials.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Create Staff Account
        </Button>
      </div>

      {/* Staff Table */}
      <DataTable
        columns={columns}
        data={staff}
        searchPlaceholder="Search staff name, username, email..."
        searchKeys={['fullName', 'username', 'email', 'role']}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? 'Edit Staff Profile' : 'Create New Staff Member'}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Muhammad Usman"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Username (Login Handle)"
            placeholder="e.g. usman_cashier"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. usman@fojibookcenter.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">
              Assigned Store Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-[#07181a] border border-[#143d41] rounded-lg px-3 py-2 text-sm text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
            >
              <option value="Admin">Admin (Full administrative & report access)</option>
              <option value="Cashier">Cashier (POS checkout & sales returns)</option>
              <option value="Inventory Staff">Inventory Staff (Stock receiving & suppliers)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-[#07181a] border border-[#143d41] rounded-lg px-3 py-2 text-sm text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
            >
              <option value="active">Active (Permitted to sign in)</option>
              <option value="disabled">Disabled (Suspended)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#143d41]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {editingStaff ? 'Save Changes' : 'Create Staff Profile'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
