import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  XCircle,
  FileWarning,
  Plus,
  CheckCircle2,
  Calendar,
  User
} from 'lucide-react';
import { Product, DamagedOrObsoleteRecord } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';

export const StockAlertsPage: React.FC = () => {
  const { products, damagedRecords, recordDamage, markProductObsolete } = useStore();
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'low' | 'out' | 'damaged' | 'obsolete'>('low');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form State for Recording Damage / Obsolete
  const [selectedProdId, setSelectedProdId] = useState('');
  const [recordType, setRecordType] = useState<'damaged' | 'obsolete'>('damaged');
  const [quantity, setQuantity] = useState(1);
  const [damageReason, setDamageReason] = useState('Water spill / packaging tear');

  // Low Stock Items
  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.quantity > 0 && p.quantity <= p.minStockThreshold);
  }, [products]);

  // Out of Stock Items
  const outOfStockItems = useMemo(() => {
    return products.filter((p) => p.quantity === 0);
  }, [products]);

  // Obsolete Books
  const obsoleteBooks = useMemo(() => {
    return products.filter((p) => p.status === 'obsolete');
  }, [products]);

  const handleSaveDamageRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdId) {
      toast.error('Selection Required', 'Choose a product item.');
      return;
    }

    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    if (quantity > prod.quantity && recordType === 'damaged') {
      toast.error('Invalid Quantity', `Cannot write off more than available stock (${prod.quantity}).`);
      return;
    }

    recordDamage(
      selectedProdId,
      quantity,
      damageReason,
      recordType,
      user?.name || 'Store Supervisor'
    );

    if (recordType === 'obsolete') {
      markProductObsolete(selectedProdId, damageReason);
    }

    toast.success(
      'Record Created',
      `Recorded ${quantity} units as ${recordType}: ${damageReason}`
    );
    setIsRecordModalOpen(false);
  };

  // Columns for Low & Out of Stock tables
  const stockAlertColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-semibold text-[#f2fbfa]">{p.name}</div>
          <div className="text-[10px] text-[#59787a]">{p.barcode} • {p.category}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Available Stock',
      sortable: true,
      render: (p) => (
        <span
          className={`font-bold text-sm ${
            p.quantity === 0 ? 'text-[#f43f5e]' : 'text-[#f59e0b]'
          }`}
        >
          {p.quantity} units
        </span>
      )
    },
    {
      key: 'minStockThreshold',
      header: 'Min Threshold',
      render: (p) => (
        <span className="text-xs text-[#8da5a7]">{p.minStockThreshold} units</span>
      )
    },
    {
      key: 'status',
      header: 'Urgency Status',
      render: (p) => (
        <Badge variant={p.quantity === 0 ? 'danger' : 'warning'} size="sm">
          {p.quantity === 0 ? 'Critical: Out of Stock' : 'Replenish Needed'}
        </Badge>
      )
    }
  ];

  // Columns for Damaged & Obsolete Records
  const damagedColumns: Column<DamagedOrObsoleteRecord>[] = [
    {
      key: 'productName',
      header: 'Product Name',
      sortable: true,
      render: (rec) => (
        <div>
          <div className="font-semibold text-[#f2fbfa]">{rec.productName}</div>
          <div className="text-[10px] text-[#59787a] font-mono">{rec.barcode}</div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (rec) => (
        <Badge variant={rec.type === 'damaged' ? 'danger' : 'neutral'} size="sm">
          {rec.type === 'damaged' ? 'Damaged Good' : 'Obsolete Syllabus'}
        </Badge>
      )
    },
    {
      key: 'quantity',
      header: 'Qty Written Off',
      render: (rec) => (
        <span className="font-bold text-xs text-[#f43f5e]">{rec.quantity} units</span>
      )
    },
    {
      key: 'reason',
      header: 'Justification / Reason',
      render: (rec) => <span className="text-xs text-[#8da5a7]">{rec.reason}</span>
    },
    {
      key: 'recordedBy',
      header: 'Staff & Date',
      render: (rec) => (
        <div className="text-xs text-[#8da5a7]">
          <div className="flex items-center gap-1 text-[#d4f1f4]">
            <User className="w-3 h-3 text-[#007f87]" />
            <span>{rec.recordedBy}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#59787a]">
            <Calendar className="w-3 h-3" />
            <span>{rec.date}</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa]">Stock Discrepancy & Health Center</h2>
          <p className="text-xs text-[#8da5a7]">
            Monitor critical stock deficits, recorded damages, and obsolete book editions.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedProdId(products[0]?.id || '');
            setIsRecordModalOpen(true);
          }}
        >
          Record Damage / Obsolete
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#143d41] pb-2">
        <button
          onClick={() => setActiveTab('low')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'low'
              ? 'bg-[#007f87] text-white shadow-md'
              : 'text-[#8da5a7] hover:bg-[#00272b] hover:text-[#f2fbfa]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Low Stock ({lowStockItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('out')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'out'
              ? 'bg-[#007f87] text-white shadow-md'
              : 'text-[#8da5a7] hover:bg-[#00272b] hover:text-[#f2fbfa]'
          }`}
        >
          <XCircle className="w-3.5 h-3.5 text-[#f43f5e]" />
          <span>Out of Stock ({outOfStockItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('damaged')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'damaged'
              ? 'bg-[#007f87] text-white shadow-md'
              : 'text-[#8da5a7] hover:bg-[#00272b] hover:text-[#f2fbfa]'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-[#f43f5e]" />
          <span>Damaged Log ({damagedRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('obsolete')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'obsolete'
              ? 'bg-[#007f87] text-white shadow-md'
              : 'text-[#8da5a7] hover:bg-[#00272b] hover:text-[#f2fbfa]'
          }`}
        >
          <FileWarning className="w-3.5 h-3.5 text-[#8da5a7]" />
          <span>Obsolete Books ({obsoleteBooks.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'low' && (
        <DataTable
          columns={stockAlertColumns}
          data={lowStockItems}
          searchPlaceholder="Search low stock items..."
          emptyTitle="No low stock items"
          emptyDescription="All products are well above minimum inventory thresholds."
        />
      )}

      {activeTab === 'out' && (
        <DataTable
          columns={stockAlertColumns}
          data={outOfStockItems}
          searchPlaceholder="Search zero stock items..."
          emptyTitle="Zero out-of-stock items"
          emptyDescription="Great job! Every product in your catalog has inventory."
        />
      )}

      {activeTab === 'damaged' && (
        <DataTable
          columns={damagedColumns}
          data={damagedRecords}
          searchPlaceholder="Search damage reports..."
          emptyTitle="No damage records logged"
          emptyDescription="Click 'Record Damage / Obsolete' to file a damaged item report."
        />
      )}

      {activeTab === 'obsolete' && (
        <DataTable
          columns={stockAlertColumns}
          data={obsoleteBooks}
          searchPlaceholder="Search obsolete curriculum books..."
          emptyTitle="No obsolete titles recorded"
          emptyDescription="No textbooks marked as obsolete syllabus editions."
        />
      )}

      {/* Record Damage / Obsolete Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Stock Damage or Obsolete Book"
        description="Deducts stock from active inventory and documents write-off justification."
        maxWidth="md"
      >
        <form onSubmit={handleSaveDamageRecord} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">
              Select Record Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRecordType('damaged')}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${
                  recordType === 'damaged'
                    ? 'bg-[#f43f5e]/20 border-[#f43f5e] text-[#f2fbfa]'
                    : 'bg-[#07181a] border-[#143d41] text-[#8da5a7]'
                }`}
              >
                Damaged Physical Item
              </button>
              <button
                type="button"
                onClick={() => setRecordType('obsolete')}
                className={`py-2 text-xs font-semibold rounded-lg border transition ${
                  recordType === 'obsolete'
                    ? 'bg-[#007f87]/20 border-[#007f87] text-[#d4f1f4]'
                    : 'bg-[#07181a] border-[#143d41] text-[#8da5a7]'
                }`}
              >
                Obsolete Book Syllabus
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">
              Product Item <span className="text-[#f43f5e]">*</span>
            </label>
            <select
              value={selectedProdId}
              onChange={(e) => setSelectedProdId(e.target.value)}
              className="w-full bg-[#07181a] border border-[#143d41] rounded-lg px-3 py-2 text-sm text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity to Write-off"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />

          <Input
            label="Reason / Condition Notes"
            placeholder="e.g. Water damage, binding tear, syllabus superseded by 2026 edition..."
            value={damageReason}
            onChange={(e) => setDamageReason(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#143d41]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="submit"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Record Write-off
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
