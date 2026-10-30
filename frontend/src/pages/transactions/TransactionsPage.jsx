import React, { useState, useMemo } from 'react';
import { Receipt, Eye, Printer, Download, Filter } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ReceiptModal } from '../../components/pos/ReceiptModal';

export const TransactionsPage = () => {
  const { transactions } = useStore();

  const [selectedTx, setSelectedTx] = useState(null);
  const [reprintTx, setReprintTx] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      sortable: true,
      render: (t) => (
        <span className="font-mono font-bold text-slate-900">{t.invoiceNumber}</span>
      )
    },
    {
      key: 'timestamp',
      header: 'Date & Time',
      sortable: true,
      render: (t) => (
        <div className="text-xs text-slate-600">
          <div>{t.timestamp}</div>
          <div className="text-[10px] text-slate-400">{t.cashierName}</div>
        </div>
      )
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (t) => (
        <span className="text-xs font-medium text-slate-700">{t.customerName || 'Walk-in Customer'}</span>
      )
    },
    {
      key: 'items',
      header: 'Line Items',
      render: (t) => (
        <span className="text-xs text-slate-600">
          {t.items.reduce((sum, item) => sum + item.quantity, 0)} items ({t.items.length} lines)
        </span>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Payment Mode',
      sortable: true,
      render: (t) => (
        <span className="text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
          {t.paymentMethod}
        </span>
      )
    },
    {
      key: 'totalAmount',
      header: 'Total Paid (PKR)',
      sortable: true,
      render: (t) => (
        <span className="font-bold text-sm text-[#007f87]">
          PKR {t.totalAmount.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (t) => (
        <Badge
          variant={
            t.status === 'completed'
              ? 'success'
              : t.status === 'refunded'
              ? 'danger'
              : 'warning'
          }
          size="sm"
        >
          {t.status.toUpperCase()}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTx(t)}
            title="Inspect Invoice Lines"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReprintTx(t)}
            title="Reprint 80mm Receipt"
          >
            <Printer className="w-3.5 h-3.5 text-[#007f87]" />
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
            <Receipt className="w-5 h-5 text-[#007f87]" />
            <span>Sales & Register Transactions Archive</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time cashier checkouts, payment tender audit, and thermal receipt reprints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportCSV}
          >
            Export Invoices CSV
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#007f87]" />
          <span className="text-xs font-semibold text-slate-700">Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
          >
            <option value="all">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Card">Debit / Credit Card</option>
            <option value="EasyPaisa">EasyPaisa</option>
            <option value="JazzCash">JazzCash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="partially_refunded">Partially Refunded</option>
            <option value="refunded">Fully Refunded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        searchPlaceholder="Search by invoice #, cashier, or customer..."
        searchKeys={['invoiceNumber', 'cashierName', 'customerName', 'paymentMethod']}
      />

      {/* Modal: View Transaction Line Items */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Invoice Details: ${selectedTx.invoiceNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <span className="text-slate-500">Timestamp:</span>
                <p className="font-medium text-slate-900">{selectedTx.timestamp}</p>
              </div>
              <div>
                <span className="text-slate-500">Cashier:</span>
                <p className="font-medium text-slate-900">{selectedTx.cashierName}</p>
              </div>
              <div>
                <span className="text-slate-500">Customer:</span>
                <p className="font-medium text-[#007f87]">{selectedTx.customerName || 'Walk-in'}</p>
              </div>
              <div>
                <span className="text-slate-500">Tender Method:</span>
                <p className="font-medium text-slate-900">{selectedTx.paymentMethod}</p>
              </div>
            </div>

            {/* Line items table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[11px] text-slate-700 uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Unit Price</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedTx.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5">
                        <div className="font-medium text-slate-900">{it.product.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{it.product.barcode}</div>
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-800">{it.quantity}</td>
                      <td className="p-2.5 text-right text-slate-600">PKR {it.unitPrice.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">PKR {it.subtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Gross Subtotal:</span>
                <span>PKR {selectedTx.subtotal.toLocaleString()}</span>
              </div>
              {selectedTx.overallDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- PKR {selectedTx.overallDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Final Total Paid:</span>
                <span className="text-[#007f87]">PKR {selectedTx.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="primary"
                size="sm"
                icon={<Printer className="w-4 h-4" />}
                onClick={() => {
                  setReprintTx(selectedTx);
                  setSelectedTx(null);
                }}
              >
                Reprint Thermal Receipt
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedTx(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reprint Receipt Modal */}
      {reprintTx && (
        <ReceiptModal
          isOpen={!!reprintTx}
          onClose={() => setReprintTx(null)}
          transaction={reprintTx}
          isReprint={true}
        />
      )}
    </div>
  );
};
export default TransactionsPage;
