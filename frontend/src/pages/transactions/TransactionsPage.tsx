import React, { useState, useMemo } from 'react';
import { Receipt, Eye, Printer, Download, Calendar, Filter, FileText } from 'lucide-react';
import { Transaction } from '../../types';
import { useStore } from '../../context/StoreContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ReceiptModal } from '../../components/pos/ReceiptModal';

export const TransactionsPage: React.FC = () => {
  const { transactions } = useStore();

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [reprintTx, setReprintTx] = useState<Transaction | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchPayment = paymentFilter === 'all' || t.paymentMethod === paymentFilter;
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchPayment && matchStatus;
    });
  }, [transactions, paymentFilter, statusFilter]);

  // Export CSV of transactions
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    const headers = ['Invoice Number', 'Timestamp', 'Cashier', 'Customer', 'Items Count', 'Payment Method', 'Total (PKR)', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.invoiceNumber,
      `"${t.timestamp}"`,
      `"${t.cashierName}"`,
      `"${t.customerName || 'Walk-in'}"`,
      t.items.reduce((s, i) => s + i.quantity, 0),
      t.paymentMethod,
      t.totalAmount,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Foji_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (t) => (
        <span className="font-mono font-bold text-[#f2fbfa]">{t.invoiceNumber}</span>
      )
    },
    {
      key: 'timestamp',
      header: 'Date & Time',
      sortable: true,
      render: (t) => (
        <div className="text-xs text-[#8da5a7]">
          <div>{t.timestamp}</div>
          <div className="text-[10px] text-[#59787a]">{t.cashierName}</div>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (t) => (
        <span className="text-xs text-[#d4f1f4]">{t.customerName || 'Walk-in Customer'}</span>
      )
    },
    {
      key: 'items',
      header: 'Line Items',
      render: (t) => (
        <span className="text-xs text-[#8da5a7]">
          {t.items.reduce((sum, item) => sum + item.quantity, 0)} items ({t.items.length} lines)
        </span>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Payment Mode',
      sortable: true,
      render: (t) => (
        <span className="text-xs px-2 py-0.5 rounded bg-[#00272b] border border-[#143d41] text-[#f2fbfa]">
          {t.paymentMethod}
        </span>
      )
    },
    {
      key: 'totalAmount',
      header: 'Total Paid (PKR)',
      sortable: true,
      render: (t) => (
        <span className="font-bold text-sm text-[#f2fbfa]">
          PKR {t.totalAmount.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => {
        const variant =
          t.status === 'completed'
            ? 'success'
            : t.status === 'partially_refunded'
            ? 'warning'
            : 'danger';
        const label =
          t.status === 'completed'
            ? 'Completed'
            : t.status === 'partially_refunded'
            ? 'Partially Refunded'
            : 'Refunded';
        return <Badge variant={variant} size="sm">{label}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTx(t);
            }}
            title="View Sale Breakdown"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Printer className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation();
              setReprintTx(t);
            }}
            title="Reprint Receipt"
          >
            Reprint
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Page Header & CSV Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa]">Transaction Ledger & Invoices</h2>
          <p className="text-xs text-[#8da5a7]">
            Permanent historical record of completed retail counter transactions and receipts.
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-[#8da5a7]">
          <Filter className="w-3.5 h-3.5 text-[#007f87]" />
          <span>Payment Mode:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#07181a] border border-[#143d41] rounded-lg px-2.5 py-1 text-xs text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
          >
            <option value="all">All Modes</option>
            <option value="Cash">Cash Tender</option>
            <option value="Card">Card</option>
            <option value="EasyPaisa">EasyPaisa</option>
            <option value="JazzCash">JazzCash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#8da5a7]">
          <span>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#07181a] border border-[#143d41] rounded-lg px-2.5 py-1 text-xs text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="partially_refunded">Partially Refunded</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        searchPlaceholder="Search invoice #, customer name, cashier..."
        searchKeys={['invoiceNumber', 'customerName', 'cashierName']}
      />

      {/* Transaction Details Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Sale Transaction: ${selectedTx.invoiceNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-[#07181a] border border-[#143d41]">
              <div>
                <span className="text-[#59787a] block">Cashier:</span>
                <span className="font-semibold text-[#f2fbfa]">{selectedTx.cashierName}</span>
              </div>
              <div>
                <span className="text-[#59787a] block">Date/Time:</span>
                <span className="text-[#f2fbfa]">{selectedTx.timestamp}</span>
              </div>
              <div>
                <span className="text-[#59787a] block">Payment:</span>
                <span className="font-semibold text-[#007f87]">{selectedTx.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[#59787a] block">Total Amount:</span>
                <span className="font-bold text-[#d4f1f4]">
                  PKR {selectedTx.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {selectedTx.customerName && (
              <div className="p-2.5 rounded-lg bg-[#07181a] border border-[#143d41] flex justify-between">
                <span className="text-[#8da5a7]">Customer:</span>
                <span className="font-semibold text-[#f2fbfa]">{selectedTx.customerName}</span>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-[#8da5a7] mb-2 uppercase text-[11px]">
                Items Purchased
              </h4>
              <table className="w-full text-left border border-[#143d41] rounded-lg overflow-hidden">
                <thead className="bg-[#00272b] text-[#d4f1f4]">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#143d41]">
                  {selectedTx.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#07181a]">
                      <td className="p-2.5 text-[#f2fbfa]">
                        {item.productName}
                        <span className="block text-[10px] text-[#59787a]">{item.barcode}</span>
                      </td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right">PKR {item.unitPrice}</td>
                      <td className="p-2.5 text-right font-semibold text-[#d4f1f4]">
                        PKR {item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#143d41]">
              <Button
                variant="primary"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => {
                  setReprintTx(selectedTx);
                  setSelectedTx(null);
                }}
              >
                Open Thermal Receipt
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTx(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reprint Thermal Receipt Modal (with isReprint={true}) */}
      <ReceiptModal
        isOpen={!!reprintTx}
        onClose={() => setReprintTx(null)}
        transaction={reprintTx}
        isReprint={true}
      />
    </div>
  );
};
