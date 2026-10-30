import React, { useState, useMemo } from 'react';
import { Sliders, CheckCircle2, Info } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const InventoryPage = () => {
  const { products, categories, adjustStock } = useStore();
  const { user } = useAuth();
  const toast = useToast();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockLevelFilter, setStockLevelFilter] = useState('all');
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [newCount, setNewCount] = useState('');
  const [reason, setReason] = useState('Physical Stock Audit Count');
  const [showConfirm, setShowConfirm] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      let matchStock = true;
      if (stockLevelFilter === 'low') {
        matchStock = p.quantity > 0 && p.quantity <= p.minStockThreshold;
      } else if (stockLevelFilter === 'out') {
        matchStock = p.quantity === 0;
      }
      return matchCat && matchStock;
    });
  }, [products, categoryFilter, stockLevelFilter]);

  const openAdjustModal = (product) => {
    setAdjustingProduct(product);
    setNewCount(product.quantity);
    setReason('Physical Stock Audit Count');
  };

  const handleApplyAdjustment = () => {
    if (!adjustingProduct || newCount === '') return;

    adjustStock(
      adjustingProduct.id,
      Number(newCount),
      reason,
      user?.name || 'Inventory Manager'
    );

    toast.success(
      'Stock Adjusted',
      `Inventory for "${adjustingProduct.name}" updated to ${newCount} units.`
    );

    setShowConfirm(false);
    setAdjustingProduct(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'Product & Department',
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-900 line-clamp-1">{p.name}</div>
          <div className="text-[11px] text-slate-500">
            <span className="text-[#007f87] uppercase text-[10px] font-bold tracking-wider">
              {p.type}
            </span>{' '}
            • {p.category}
          </div>
        </div>
      )
    },
    {
      key: 'barcode',
      header: 'Barcode / Code',
      render: (p) => (
        <span className="font-mono text-xs text-[#007f87] font-semibold">{p.barcode}</span>
      )
    },
    {
      key: 'purchasePrice',
      header: 'Valuation (Cost)',
      sortable: true,
      render: (p) => (
        <span className="text-xs text-slate-600">
          PKR {(p.purchasePrice || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'sellingPrice',
      header: 'Retail Price',
      sortable: true,
      render: (p) => (
        <span className="font-bold text-xs text-slate-900">
          PKR {(p.sellingPrice || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'quantity',
      header: 'Physical Stock',
      sortable: true,
      render: (p) => {
        let variant = 'success';
        let statusText = 'Adequate';

        if (p.quantity === 0) {
          variant = 'danger';
          statusText = 'Out of Stock';
        } else if (p.quantity <= p.minStockThreshold) {
          variant = 'warning';
          statusText = `Low (${p.quantity}/${p.minStockThreshold})`;
        }

        return (
          <div>
            <span className="font-bold text-sm text-slate-900 mr-2">{p.quantity}</span>
            <Badge variant={variant} size="sm">{statusText}</Badge>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Stock Count',
      className: 'text-right',
      render: (p) => (
        <Button
          variant="secondary"
          size="sm"
          icon={<Sliders className="w-3.5 h-3.5" />}
          onClick={() => openAdjustModal(p)}
        >
          Adjust Count
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Simulation Banner */}
      <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center gap-3 text-xs text-[#003d40]">
        <Info className="w-4 h-4 text-[#007f87] shrink-0" />
        <p>
          <span className="font-bold">Inventory Workspace (Demo Mode):</span> Physical counts and adjustments simulate ledger movements in local browser storage, keeping catalog metrics coherent without permanent database persistence.
        </p>
      </div>

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Current Inventory & Stock Audit</h2>
          <p className="text-xs text-slate-500">
            Real-time shelf counts, thresholds, and manual count reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <select
            value={stockLevelFilter}
            onChange={(e) => setStockLevelFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
          >
            <option value="all">All Stock Statuses</option>
            <option value="low">Low Stock Only</option>
            <option value="out">Out of Stock Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search product, barcode, category..."
        searchKeys={['name', 'barcode', 'category']}
      />

      {/* Adjust Count Modal */}
      {adjustingProduct && (
        <Modal
          isOpen={!!adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          title={`Adjust Inventory: ${adjustingProduct.name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Barcode:</span>
                <span className="font-mono text-slate-900 font-semibold">{adjustingProduct.barcode}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Current Recorded Quantity:</span>
                <span className="font-bold text-slate-900">{adjustingProduct.quantity} units</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Minimum Alert Threshold:</span>
                <span className="text-slate-900">{adjustingProduct.minStockThreshold} units</span>
              </div>
            </div>

            <Input
              label="New Physical Audit Count"
              type="number"
              min={0}
              value={newCount}
              onChange={(e) => setNewCount(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Adjustment Reason <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#007f87]"
              >
                <option value="Physical Stock Audit Count">Physical Stock Audit Count</option>
                <option value="Damaged Stock Write-off">Damaged Stock Write-off</option>
                <option value="Supplier Consignment Shortage">Supplier Consignment Shortage</option>
                <option value="Customer Return Without Invoice">Customer Return Without Invoice</option>
                <option value="Correction of Typo Entry">Correction of Typo Entry</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setAdjustingProduct(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={() => setShowConfirm(true)}
              >
                Proceed to Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Step */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleApplyAdjustment}
        title="Confirm Stock Level Change"
        message={`Are you sure you want to update ${adjustingProduct?.name} from ${adjustingProduct?.quantity} to ${newCount} units? This manual adjustment will be logged in the permanent audit ledger.`}
        confirmText="Confirm Count Change"
      />
    </div>
  );
};
export default InventoryPage;
