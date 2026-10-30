import React, { useState } from 'react';
import { RotateCcw, Search, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';

export const SalesReturnsPage = () => {
  const { transactions, salesReturns, processSalesReturn } = useStore();
  const { user } = useAuth();
  const toast = useToast();

  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearchInvoice = (e) => {
    e.preventDefault();
    const q = (invoiceQuery || '').trim().toLowerCase();
    if (!q) return;

    const tx = transactions.find((t) => t.invoiceNumber?.toLowerCase() === q);
    if (tx) {
      setSelectedTransaction(tx);
      // Initialize return quantities
      const initialMap = {};
      tx.items.forEach((item) => {
        initialMap[item.productId] = {
          quantity: 0,
          condition: 'restockable',
          reason: 'Customer requested exchange'
        };
      });
      setReturnItems(initialMap);
    } else {
      toast.error('Invoice Not Found', `No sale record matching invoice "${invoiceQuery}".`);
      setSelectedTransaction(null);
    }
  };

  const handleQuantityChange = (productId, qty, maxQty) => {
    const validQty = Math.max(0, Math.min(qty, maxQty));
    setReturnItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: validQty
      }
    }));
  };

  const handleConditionChange = (productId, condition) => {
    setReturnItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        condition
      }
    }));
  };

  const handleReasonChange = (productId, reason) => {
    setReturnItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        reason
      }
    }));
  };

  // Calculate refund amount in PKR based on original price
  const totalRefundPKR = selectedTransaction
    ? selectedTransaction.items.reduce((sum, item) => {
        const line = returnItems[item.productId];
        const qty = line ? line.quantity : 0;
        return sum + qty * item.unitPrice;
      }, 0)
    : 0;

  const totalItemsToReturn = Object.values(returnItems).reduce(
    (s, item) => s + (item.quantity || 0),
    0
  );

  const handleConfirmReturn = () => {
    if (!selectedTransaction || totalItemsToReturn === 0) {
      toast.error('No Items Selected', 'Specify at least 1 return quantity.');
      return;
    }

    setIsProcessing(true);

    const formattedPayload = selectedTransaction.items
      .filter((item) => returnItems[item.productId]?.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        quantity: returnItems[item.productId].quantity,
        condition: returnItems[item.productId].condition,
        reason: returnItems[item.productId].reason
      }));

    const result = processSalesReturn({
      originalTransactionId: selectedTransaction.id,
      items: formattedPayload,
      reason: 'Customer Walk-in Return',
      refundAmount: totalRefundPKR,
      processedBy: user?.name || 'Cashier'
    });

    setIsProcessing(false);

    if (result) {
      toast.success(
        'Return Processed',
        `Processed refund of PKR ${totalRefundPKR.toLocaleString()}.`
      );
      setSelectedTransaction(null);
      setReturnItems({});
      setInvoiceQuery('');
    } else {
      toast.error('Return Failed', 'Could not process sales return.');
    }
  };

  const returnHistoryColumns = [
    {
      key: 'returnReference',
      header: 'Return Ref',
      sortable: true,
      render: (r) => (
        <span className="font-mono font-bold text-slate-800">{r.returnReference}</span>
      )
    },
    {
      key: 'originalInvoiceNumber',
      header: 'Original Invoice',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-[#007f87]">{r.originalInvoiceNumber}</span>
      )
    },
    {
      key: 'items',
      header: 'Returned Products',
      render: (r) => (
        <div className="text-xs">
          {r.items.map((i, idx) => (
            <div key={idx} className="text-slate-600">
              {i.quantity}x {i.productName} ({i.condition})
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'totalRefundAmount',
      header: 'Refund Paid (PKR)',
      sortable: true,
      render: (r) => (
        <span className="font-bold text-xs text-emerald-600">
          PKR {(r.totalRefundAmount || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'timestamp',
      header: 'Timestamp & Cashier',
      render: (r) => (
        <div className="text-xs text-slate-600">
          <div>{r.timestamp}</div>
          <div className="text-[10px] text-slate-400">{r.cashierName}</div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-[#007f87]" />
          <span>Sales Returns & Refund Processing</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Process customer textbook or stationery returns with original price validation and restock condition checks.
        </p>
      </div>

      {/* Invoice Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchInvoice} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search original invoice # (e.g. INV-2026-0001)..."
              value={invoiceQuery}
              onChange={(e) => setInvoiceQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:border-[#007f87] focus:bg-white transition-colors"
            />
          </div>
          <Button type="submit" variant="primary" size="md" icon={<Search className="w-4 h-4" />}>
            Lookup Sale
          </Button>
        </form>

        {/* Demo chips */}
        <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
          <span className="text-slate-500">Available Invoices:</span>
          {transactions.slice(0, 3).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setInvoiceQuery(t.invoiceNumber);
                setSelectedTransaction(t);
                const initialMap = {};
                t.items.forEach((item) => {
                  initialMap[item.productId] = {
                    quantity: 0,
                    condition: 'restockable',
                    reason: 'Customer requested exchange'
                  };
                });
                setReturnItems(initialMap);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[#007f87] hover:bg-[#007f87]/10 font-mono text-[11px] transition-colors"
            >
              {t.invoiceNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Original Sale Return Workspace */}
      {selectedTransaction && (
        <div className="p-6 rounded-2xl bg-white border border-[#007f87]/40 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs uppercase font-bold text-[#007f87]">Original Sale Invoice</span>
              <h3 className="text-base font-bold text-slate-900">
                {selectedTransaction.invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500">
                Customer: {selectedTransaction.customerName || 'Walk-in'} • Date:{' '}
                {selectedTransaction.timestamp} • Mode: {selectedTransaction.paymentMethod}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Original Total</span>
              <p className="text-base font-bold text-slate-900">
                PKR {(selectedTransaction.totalAmount || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Returnable Items Selection Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3">Purchased Item</th>
                  <th className="p-3 text-center">Original Qty</th>
                  <th className="p-3 text-center">Return Qty</th>
                  <th className="p-3">Return Condition</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 text-right">Line Refund</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedTransaction.items.map((item) => {
                  const line = returnItems[item.productId] || {
                    quantity: 0,
                    condition: 'restockable',
                    reason: ''
                  };
                  const lineRefund = line.quantity * item.unitPrice;

                  return (
                    <tr key={item.productId} className="hover:bg-slate-50/80">
                      <td className="p-3">
                        <span className="font-semibold text-slate-800 block">{item.productName}</span>
                        <span className="text-[10px] text-slate-400">Rate: PKR {item.unitPrice}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-600">{item.quantity}</td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={item.quantity}
                          value={line.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.productId,
                              Number(e.target.value),
                              item.quantity
                            )
                          }
                          className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-center font-bold text-slate-800 focus:outline-none focus:border-[#007f87]"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={line.condition}
                          onChange={(e) =>
                            handleConditionChange(item.productId, e.target.value)
                          }
                          className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#007f87]"
                        >
                          <option value="restockable">Restockable (Back to Shelf)</option>
                          <option value="damaged">Damaged (Write-off)</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={line.reason}
                          placeholder="Exchange / Defect reason..."
                          onChange={(e) => handleReasonChange(item.productId, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#007f87]"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        PKR {lineRefund.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary & Refund Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-slate-200">
            <div>
              <p className="text-xs text-slate-500">
                Restockable goods automatically restore product shelf stock. Damaged items are routed to damaged tracking.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Refund Due</span>
                <p className="text-lg font-bold text-emerald-600">
                  PKR {totalRefundPKR.toLocaleString()}
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                disabled={totalItemsToReturn === 0}
                isLoading={isProcessing}
                onClick={handleConfirmReturn}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Approve & Refund
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Return History Table */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-800">Completed Sales Returns History</h3>
        <DataTable
          columns={returnHistoryColumns}
          data={salesReturns}
          searchPlaceholder="Search return ref, invoice #, cashier..."
          searchKeys={['returnReference', 'originalInvoiceNumber', 'cashierName']}
          emptyTitle="No sales returns recorded"
          emptyDescription="Customer return logs will be documented here."
        />
      </div>
    </div>
  );
};
