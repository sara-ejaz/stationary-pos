import React, { useState, useMemo } from 'react';
import { History, Shield, Eye, Filter, Lock } from 'lucide-react';
import { AuditLog } from '../../types';
import { useStore } from '../../context/StoreContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const AuditPage: React.FC = () => {
  const { auditLogs } = useStore();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = useMemo(() => {
    if (typeFilter === 'all') return auditLogs;
    return auditLogs.filter((l) => l.recordType === typeFilter);
  }, [auditLogs, typeFilter]);

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (log) => (
        <span className="text-xs text-[#8da5a7] whitespace-nowrap">{log.timestamp}</span>
      )
    },
    {
      key: 'user',
      header: 'Authorized User',
      sortable: true,
      render: (log) => <span className="font-semibold text-xs text-[#f2fbfa]">{log.user}</span>
    },
    {
      key: 'action',
      header: 'Action Executed',
      sortable: true,
      render: (log) => (
        <span className="font-mono text-xs text-[#007f87] font-semibold">{log.action}</span>
      )
    },
    {
      key: 'recordType',
      header: 'Domain Entity',
      sortable: true,
      render: (log) => (
        <Badge
          variant={
            log.recordType === 'Sale'
              ? 'success'
              : log.recordType === 'Product'
              ? 'primary'
              : log.recordType === 'Purchase'
              ? 'info'
              : 'neutral'
          }
          size="sm"
        >
          {log.recordType}
        </Badge>
      )
    },
    {
      key: 'recordReference',
      header: 'Reference ID',
      render: (log) => (
        <span className="font-mono text-xs text-[#d4f1f4]">{log.recordReference}</span>
      )
    },
    {
      key: 'details',
      header: 'Activity Details',
      render: (log) => (
        <span className="text-xs text-[#8da5a7] line-clamp-1">{log.details}</span>
      )
    },
    {
      key: 'actions',
      header: 'View',
      className: 'text-right',
      render: (log) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
          <Eye className="w-3.5 h-3.5" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa] flex items-center gap-2">
            <History className="w-5 h-5 text-[#007f87]" />
            <span>Immutable System Audit Trail</span>
          </h2>
          <p className="text-xs text-[#8da5a7]">
            Read-only chronological ledger of all stock modifications, cashier checkouts, and staff operations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#8da5a7] px-3 py-1.5 rounded-lg bg-[#07181a] border border-[#143d41]">
          <Lock className="w-3.5 h-3.5 text-[#007f87]" />
          <span>Tamper-evident Audit Ledger (Read Only)</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-[#007f87]" />
        <label className="text-xs text-[#8da5a7]">Entity Filter:</label>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#07181a] border border-[#143d41] rounded-lg px-2.5 py-1 text-xs text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
        >
          <option value="all">All Operations</option>
          <option value="Product">Product Catalog</option>
          <option value="Category">Category Hierarchy</option>
          <option value="Sale">POS Sales</option>
          <option value="Purchase">Purchasing Consignments</option>
          <option value="Stock">Stock Adjustments</option>
          <option value="Staff">Staff Management</option>
          <option value="Backup">Backup & Recovery</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        searchPlaceholder="Search audit action, user, reference..."
        searchKeys={['action', 'user', 'recordReference', 'details']}
      />

      {/* Audit Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Entry Details"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#07181a] border border-[#143d41] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#59787a]">Log ID:</span>
                <span className="font-mono text-[#f2fbfa]">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#59787a]">Timestamp:</span>
                <span className="text-[#f2fbfa]">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#59787a]">User:</span>
                <span className="font-semibold text-[#d4f1f4]">{selectedLog.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#59787a]">Action:</span>
                <span className="font-mono font-bold text-[#007f87]">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#59787a]">Reference:</span>
                <span className="font-mono text-[#f2fbfa]">{selectedLog.recordReference}</span>
              </div>
            </div>

            <div>
              <span className="block text-[#8da5a7] font-semibold mb-1 uppercase text-[10px]">
                Operational Context & Details:
              </span>
              <div className="p-3 rounded-lg bg-[#07181a] border border-[#143d41] text-[#f2fbfa] leading-relaxed">
                {selectedLog.details}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
