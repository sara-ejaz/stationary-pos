import React, { useState, useMemo } from 'react';
import { PenTool, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const StationeryPage = () => {
  const { products, categories, suppliers, addProduct, updateProduct, deleteProduct } = useStore();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [brandFilter, setBrandFilter] = useState('all');

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('pcs');
  const [supplierReference, setSupplierReference] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStockThreshold, setMinStockThreshold] = useState(10);
  const [status, setStatus] = useState('active');

  const stationeryList = useMemo(() => {
    return products.filter((p) => p.type === 'stationery');
  }, [products]);

  const uniqueBrands = useMemo(() => {
    const brands = new Set();
    stationeryList.forEach((s) => s.brand && brands.add(s.brand));
    return Array.from(brands);
  }, [stationeryList]);

  const filteredItems = useMemo(() => {
    if (brandFilter === 'all') return stationeryList;
    return stationeryList.filter((s) => s.brand === brandFilter);
  }, [stationeryList, brandFilter]);

  const openCreateModal = () => {
    setEditingItem(null);
    setName('');
    setSku(`STA-${Math.floor(1000 + Math.random() * 9000)}`);
    setBarcode('');
    setBrand('');
    setCategory('Writing Instruments');
    setUnitOfMeasure('pcs');
    setSupplierReference(suppliers[0]?.id || '');
    setPurchasePrice('');
    setSellingPrice('');
    setQuantity(20);
    setMinStockThreshold(10);
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setSku(item.sku);
    setBarcode(item.barcode);
    setBrand(item.brand);
    setCategory(item.category);
    setUnitOfMeasure(item.unitOfMeasure);
    setSupplierReference(item.supplierReference || '');
    setPurchasePrice(item.purchasePrice);
    setSellingPrice(item.sellingPrice);
    setQuantity(item.quantity);
    setMinStockThreshold(item.minStockThreshold);
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!name.trim() || !barcode.trim()) {
      toast.error('Validation Error', 'Product Name and Barcode are required.');
      return;
    }

    const pPrice = Number(purchasePrice) || 0;
    const sPrice = Number(sellingPrice) || 0;
    const qty = Number(quantity) || 0;
    const minThreshold = Number(minStockThreshold) || 5;

    if (editingItem) {
      updateProduct(editingItem.id, {
        name,
        sku,
        barcode,
        brand,
        category,
        unitOfMeasure,
        supplierReference,
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        quantity: qty,
        minStockThreshold: minThreshold,
        status
      });
      toast.success('Stationery Updated', `"${name}" updated successfully.`);
    } else {
      addProduct({
        type: 'stationery',
        name,
        sku,
        barcode,
        brand,
        category,
        unitOfMeasure,
        supplierReference,
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        quantity: qty,
        minStockThreshold: minThreshold,
        status
      });
      toast.success('Stationery Added', `"${name}" added to catalog.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteProduct(deleteConfirmId);
      toast.info('Item Removed', 'Stationery item removed from catalog.');
      setDeleteConfirmId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Stationery Item & Brand',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 line-clamp-1">{item.name}</div>
          <div className="text-[11px] text-slate-500">
            Brand: <span className="text-[#007f87] font-medium">{item.brand || 'Standard'}</span> • UOM:{' '}
            <span className="uppercase text-[10px] bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
              {item.unitOfMeasure}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'barcode',
      header: 'SKU / Barcode',
      render: (item) => (
        <div className="font-mono text-xs">
          <div className="text-slate-900 font-semibold">{item.sku}</div>
          <div className="text-[10px] text-slate-400">{item.barcode}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => <span className="text-xs text-slate-700 font-medium">{item.category}</span>
    },
    {
      key: 'sellingPrice',
      header: 'Retail Price (PKR)',
      sortable: true,
      render: (item) => (
        <div>
          <div className="font-bold text-slate-900">PKR {item.sellingPrice.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Cost: PKR {item.purchasePrice.toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Stock Status',
      sortable: true,
      render: (item) => {
        let badgeVariant = 'success';
        let label = `${item.quantity} ${item.unitOfMeasure}`;

        if (item.quantity === 0) {
          badgeVariant = 'danger';
          label = 'Out of Stock';
        } else if (item.quantity <= item.minStockThreshold) {
          badgeVariant = 'warning';
          label = `Low (${item.quantity} left)`;
        }

        return <Badge variant={badgeVariant} size="sm">{label}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(item);
            }}
            title="Edit Item"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmId(item.id);
            }}
            className="text-rose-600 hover:bg-rose-50"
            title="Delete Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-[#007f87]" />
            <span>Stationery & Office Catalog</span>
          </h2>
          <p className="text-xs text-slate-500">
            Pens, pencils, art supplies, notebooks, files, registers and school stationery.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Add Stationery Item
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-700">Brand Filter:</label>
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
        >
          <option value="all">All Brands</option>
          {uniqueBrands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        searchPlaceholder="Search product name, brand, SKU, barcode..."
        searchKeys={['name', 'brand', 'sku', 'barcode', 'category']}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Stationery Item' : 'Add New Stationery Item'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Product Name"
                placeholder="e.g. Piano Point 0.8mm Ballpoint (Box of 10)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <Input
              label="SKU (Stock Keeping Unit)"
              placeholder="e.g. STA-PIA-08-BOX"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />

            <Input
              label="Barcode / EAN Code"
              placeholder="e.g. 8964000100124"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              required
            />

            <Input
              label="Brand / Manufacturer"
              placeholder="e.g. Piano, Dollar, Pelikan, Dux"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Unit of Measure (UOM)
              </label>
              <select
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#007f87]"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="pack">Pack</option>
                <option value="box">Box</option>
                <option value="set">Set</option>
                <option value="dozen">Dozen</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#007f87]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Supplier Reference
              </label>
              <select
                value={supplierReference}
                onChange={(e) => setSupplierReference(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#007f87]"
              >
                <option value="">None / Open Market</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Purchase Cost Price (PKR)"
              type="number"
              placeholder="e.g. 240"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
            />

            <Input
              label="Selling Retail Price (PKR)"
              type="number"
              placeholder="e.g. 320"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              required
            />

            <Input
              label="Current Stock Quantity"
              type="number"
              placeholder="e.g. 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            <Input
              label="Min Low Stock Threshold"
              type="number"
              placeholder="e.g. 10"
              value={minStockThreshold}
              onChange={(e) => setMinStockThreshold(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {editingItem ? 'Save Changes' : 'Add Item to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message="Are you sure you want to remove this stationery item from the inventory catalog?"
        confirmText="Remove Product"
      />
    </div>
  );
};
export default StationeryPage;
