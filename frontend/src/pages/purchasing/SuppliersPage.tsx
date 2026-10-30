import React, { useState } from 'react';
import { Truck, Plus, Edit2, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { Supplier } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';

export const SuppliersPage: React.FC = () => {
  const { suppliers, categories, addSupplier, updateSupplier } = useStore();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const openCreateModal = () => {
    setEditingSupplier(null);
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setSelectedCategories([categories[0]?.name || 'Writing Instruments']);
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setCompanyName(sup.companyName);
    setContactPerson(sup.contactPerson);
    setPhone(sup.phone);
    setEmail(sup.email);
    setAddress(sup.address);
    setSelectedCategories(sup.suppliedCategories);
    setStatus(sup.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim() || !phone.trim()) {
      toast.error('Validation Error', 'Company Name and Contact Phone are required.');
      return;
    }

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        companyName,
        contactPerson,
        phone,
        email,
        address,
        suppliedCategories: selectedCategories,
        status
      });
      toast.success('Supplier Updated', `${companyName} updated.`);
    } else {
      addSupplier({
        companyName,
        contactPerson,
        phone,
        email,
        address,
        suppliedCategories: selectedCategories,
        status
      });
      toast.success('Supplier Added', `${companyName} added to directory.`);
    }

    setIsModalOpen(false);
  };

  const toggleCategorySelection = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const columns: Column<Supplier>[] = [
    {
      key: 'companyName',
      header: 'Company & Contact',
      sortable: true,
      render: (sup) => (
        <div>
          <div className="font-semibold text-[#f2fbfa] flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#007f87]" />
            <span>{sup.companyName}</span>
          </div>
          <div className="text-[11px] text-[#8da5a7] mt-0.5">
            Rep: <span className="text-[#d4f1f4]">{sup.contactPerson}</span>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Contact Info',
      render: (sup) => (
        <div className="text-xs space-y-0.5">
          <div className="flex items-center gap-1.5 text-[#f2fbfa]">
            <Phone className="w-3 h-3 text-[#007f87]" />
            <span>{sup.phone}</span>
          </div>
          {sup.email && (
            <div className="flex items-center gap-1.5 text-[#8da5a7]">
              <Mail className="w-3 h-3 text-[#59787a]" />
              <span>{sup.email}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'address',
      header: 'Location / City',
      render: (sup) => (
        <div className="flex items-center gap-1.5 text-xs text-[#8da5a7] line-clamp-1">
          <MapPin className="w-3 h-3 text-[#59787a] shrink-0" />
          <span>{sup.address}</span>
        </div>
      )
    },
    {
      key: 'totalPurchases',
      header: 'Purchase Volume',
      sortable: true,
      render: (sup) => (
        <span className="font-bold text-xs text-[#d4f1f4]">
          PKR {sup.totalPurchases.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (sup) => (
        <Badge variant={sup.status === 'active' ? 'success' : 'neutral'} size="sm">
          {sup.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (sup) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEditModal(sup)}
          title="Edit Supplier"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa]">Wholesale Suppliers & Distributors</h2>
          <p className="text-xs text-[#8da5a7]">
            Directory of textbook publishers, paper mills, and stationery importers.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Add New Supplier
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={suppliers}
        searchPlaceholder="Search company, contact person, city, phone..."
        searchKeys={['companyName', 'contactPerson', 'phone', 'email', 'address']}
      />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier Details' : 'Register New Supplier'}
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company / Firm Name"
              placeholder="e.g. Oxford Book Distributors"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />

            <Input
              label="Contact Representative"
              placeholder="e.g. Muhammad Tariq"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />

            <Input
              label="Phone / Mobile Number"
              placeholder="e.g. +92 300 4567891"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              placeholder="e.g. sales@oxforddist.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="sm:col-span-2">
              <Input
                label="Office / Warehouse Address"
                placeholder="e.g. Urdu Bazar, Lahore / Rawalpindi"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#8da5a7] mb-2">
                Supplied Product Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => {
                  const selected = selectedCategories.includes(c.name);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategorySelection(c.name)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        selected
                          ? 'bg-[#007f87] text-white border-[#009aa4]'
                          : 'bg-[#07181a] border-[#143d41] text-[#8da5a7] hover:border-[#005f6a]'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">Supplier Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#07181a] border border-[#143d41] rounded-lg px-3 py-2 text-sm text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
              >
                <option value="active">Active (Permitted for Purchase Orders)</option>
                <option value="inactive">Inactive / Suspended</option>
              </select>
            </div>
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
              {editingSupplier ? 'Save Supplier' : 'Register Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
