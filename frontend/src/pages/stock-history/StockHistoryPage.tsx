import React, { useState, useMemo } from 'react';
import { History, Filter, Download } from 'lucide-react';
import { StockMovement, StockMovementType } from '../../types';
import { useStore } from '../../context/StoreContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const StockHistoryPage: React.FC = () => {
  const { stockMovements } = useStore();
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredMovements = useMemo(() => {
    if (typeFilter === 'all') return stockMovements;
    return stockMovements.filter((m) => m.type === typeFilter);
  }, [stockMovements, typeFilter]);

  const handleExportCSV = () => {
    if (filteredMovements.length === 0) return;

    const headers = ['Timestamp', 'Product Name', 'Movement Type', 'Qty Change', 'Prev Qty', 'New Qty', 'Reference', 'Staff', 'Reason'];
    const rows = filteredMovements.map((m) => [
      `"${m.timestamp}"`,
      `"${m.productName}"`,
      m.type,
      m.quantityChange,
      m.previousQuantity,
      m.resultingQuantity,
      `"${m.referenceId}"`,
      `"${m.responsibleUser}"`,
      `"${m.reason}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Foji_StockMovements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<StockMovement>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (m) => <span className="text-xs text-[#8da5a7] whitespace-nowrap">{m.timestamp}</span>
    },
    {
      key: 'productName',
      header: 'Product Name',
      sortable: true,
      render: (m) => (
        <div>
          <span className="font-semibold text-xs text-[#f2fbfa] line-clamp-1">{m.productName}</span>
          <span className="font-mono text-[10px] text-[#59787a]">{m.referenceId}</span>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Movement Type',
      sortable: true,
      render: (m) => {
        let variant: 'success' | 'danger' | 'warning' | 'primary' | 'neutral' = 'neutral';
        if (m.type === 'Purchase') variant = 'success';
        else if (m.type === 'Sale') variant = 'primary';
        else if (m.type === 'Damage') variant = 'danger';
        else if (m.type === 'Sales Return') variant = 'warning';
        else if (m.type === 'Purchase Return') variant = 'warning';

        return <Badge variant={variant} size="sm">{m.type}</Badge>;
      }
    },
    {
      key: 'quantityChange',
      header: 'Qty Change',
      sortable: true,
      render: (m) => {
        const isPos = m.quantityChange > 0;
        return (
          <span className={`font-bold text-xs ${isPos ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
            {isPos ? `+${m.quantityChange}` : m.quantityChange}
          </span>
        );
      }
    },
    {
      key: 'resultingQuantity',
      header: 'Stock Flow (Old → New)',
      render: (m) => (
        <span className="text-xs font-mono text-[#8da5a7]">
          {m.previousQuantity} → <span className="text-[#f2fbfa] font-bold">{m.resultingQuantity}</span>
        </span>
      )
    },
    {
      key: 'responsibleUser',
      header: 'Staff User',
      render: (m) => <span className="text-xs text-[#d4f1f4]">{m.responsibleUser}</span>
    },
    {
      key: 'reason',
      header: 'Operational Reason',
      render: (m) => <span className="text-xs text-[#8da5a7] line-clamp-1">{m.reason}</span>
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa] flex items-center gap-2">
            <History className="w-5 h-5 text-[#007f87]" />
            <span>Stock Movement Audit Ledger</span>
          </h2>
          <p className="text-xs text-[#8da5a7]">
            Immutable record of all stock adjustments, sales deductions, purchases, returns, and damages.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
        >
          Export CSV Ledger
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-[#007f87]" />
        <label className="text-xs text-[#8da5a7]">Movement Type:</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#07181a] border border-[#143d41] rounded-lg px-2.5 py-1 text-xs text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
        >
          <option value="all">All Movement Types</option>
          <option value="Sale">Sale (POS Counter)</option>
          <option value="Purchase">Purchase (PO Consignment)</option>
          <option value="Sales Return">Sales Return</option>
          <option value="Purchase Return">Purchase Return</option>
          <option value="Damage">Damage Write-off</option>
          <option value="Manual Adjustment">Manual Adjustment</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredMovements}
        searchPlaceholder="Search product name, reference #, user, reason..."
        searchKeys={['productName', 'referenceId', 'responsibleUser', 'reason']}
      />
    </div>
  );
};
