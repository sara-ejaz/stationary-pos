import React, { useState } from 'react';
import { Layers, Plus, Edit2, Power, CheckCircle2 } from 'lucide-react';
import { Category } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';

export const CategoriesPage: React.FC = () => {
  const { categories, addCategory, updateCategory, toggleCategoryStatus } = useStore();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setParentId('');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setParentId(cat.parentId || '');
    setStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation Error', 'Category name is required.');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name,
        description,
        parentId: parentId || undefined,
        status
      });
      toast.success('Category Updated', `Category "${name}" updated successfully.`);
    } else {
      addCategory({
        name,
        description,
        parentId: parentId || undefined,
        status
      });
      toast.success('Category Created', `New category "${name}" added to store catalog.`);
    }
    setIsModalOpen(false);
  };

  const columns: Column<Category>[] = [
    {
      key: 'name',
      header: 'Category Name',
      sortable: true,
      render: (cat) => (
        <div>
          <div className="font-semibold text-[#f2fbfa] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#007f87]" />
            <span>{cat.name}</span>
          </div>
          {cat.parentId && (
            <span className="text-[10px] text-[#007f87] bg-[#007f87]/15 px-1.5 py-0.5 rounded mt-0.5 inline-block">
              Subcategory of:{' '}
              {categories.find((c) => c.id === cat.parentId)?.name || 'Parent Category'}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (cat) => (
        <span className="text-xs text-[#8da5a7] line-clamp-1">{cat.description || '—'}</span>
      )
    },
    {
      key: 'productCount',
      header: 'Active Products',
      sortable: true,
      render: (cat) => (
        <Badge variant="primary" size="sm">
          {cat.productCount ?? 0} Products
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (cat) => (
        <Badge variant={cat.status === 'active' ? 'success' : 'neutral'} size="sm">
          {cat.status === 'active' ? 'Active' : 'Inactive / Hidden'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (cat) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(cat);
            }}
            title="Edit Category Details"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleCategoryStatus(cat.id);
              toast.info(
                'Status Toggled',
                `"${cat.name}" is now ${cat.status === 'active' ? 'Inactive' : 'Active'}.`
              );
            }}
            title={cat.status === 'active' ? 'Deactivate Category' : 'Activate Category'}
          >
            <Power
              className={`w-3.5 h-3.5 ${
                cat.status === 'active' ? 'text-[#f43f5e]' : 'text-[#10b981]'
              }`}
            />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa]">Product Category Management</h2>
          <p className="text-xs text-[#8da5a7]">
            Organize stationery items, textbooks, novels, and retail departments.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Create Category
        </Button>
      </div>

      {/* Categories DataTable */}
      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="Search category name or description..."
        searchKeys={['name', 'description']}
      />

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Product Category' : 'Add New Category'}
        description="Categories organize items across POS checkout and inventory classification."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Textbooks & Academics, Writing Instruments"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">
              Parent Category (Optional - for Subcategories)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full bg-[#07181a] border border-[#143d41] rounded-lg px-3.5 py-2 text-sm text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
            >
              <option value="">None (Top-level Category)</option>
              {categories
                .filter((c) => !editingCategory || c.id !== editingCategory.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Provide a brief summary of items included in this department..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#07181a] border border-[#143d41] rounded-lg p-3 text-sm text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">Status</label>
            <div className="flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-[#007f87]"
                />
                <span className="text-[#f2fbfa]">Active (Visible in POS & Catalog)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                  className="text-[#007f87]"
                />
                <span className="text-[#8da5a7]">Inactive (Deactivated)</span>
              </label>
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
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
