import React, { useState } from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const PurchaseReturnsPage = () => {
  const { purchases, purchaseReturns, processPurchaseReturn } = useStore();
  const { user } = useAuth();
  const toast = useToast();

  const [selectedPO, setSelectedPO] = useState(null);
  const [returnItems, setReturnItems] = useState({});

  const receivedPOs = purchases.filter((p) => p.status === 'received');

  const handleSelectPO = (po) => {
    setSelectedPO(po);
    const initialMap = {};
    po.items.forEach((item) => {
      initialMap[item.productId] = {
        quantity: 0,
        reason: 'Defective consignment from publisher'
      };
    });
    setReturnItems(initialMap);
  };

  const handleQtyChange = (productId, qty, maxQty) => {
    const validQty = Math.max(0, Math.min(qty, maxQty));
    setReturnItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        quantity: validQty
      }
    }));
  };

  const totalRefund = selectedPO
    ? selectedPO.items.reduce((sum, item) => {
        const line = returnItems[item.productId];
        const qty = line ? line.quantity : 0;
        return sum + qty * item.purchasePrice;
      }, 0)
    : 0;

  const totalQtyToReturn = Object.values(returnItems).reduce(
    (s, item) => s + (item.quantity || 0),
    0
  );

  const handleConfirmReturn = () => {
    if (!selectedPO || totalQtyToReturn === 0) {
      toast.error('Selection Required', 'Specify at least 1 item to return to supplier.');
      return;
    }

    const payload = selectedPO.items
      .filter((i) => returnItems[i.productId]?.quantity > 0)
      .map((i) => ({
        productId: i.productId,
        quantity: returnItems[i.productId].quantity,
        reason: returnItems[i.productId].reason
      }));

    const result = processPurchaseReturn(
      selectedPO.referenceNumber,
      payload,
      user?.name || 'Inventory Supervisor'
    );

    if (result) {
      toast.success(
        'Purchase Return Recorded',
        `Return ${result.returnReference} submitted to ${result.supplierName}. Value: PKR ${result.totalRefundAmount.toLocaleString()}`
      );
      setSelectedPO(null);
    }
  };

  const historyColumns = [
    {
      key: 'returnReference',
      header: 'Return Ref',
      sortable: true,
      render: (pr) => <span className="font-mono font-bold text-slate-900">{pr.returnReference}</span>
    },
    {
      key: 'originalPurchaseRef',
      header: 'PO Reference',
      render: (pr) => <span className="font-mono text-xs text-[#007f87] font-semibold">{pr.originalPurchaseRef}</span>
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortable: true,
      render: (pr) => <span className="text-xs text-slate-800 font-medium">{pr.supplierName}</span>
    },
    {
      key: 'items',
      header: 'Items Returned',
      render: (pr) => (
        <div className="text-xs text-slate-600">
          {pr.items.map((i, idx) => (
            <div key={idx}>
              {i.quantity}x {i.productName} ({i.reason})
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'totalRefundAmount',
      header: 'Supplier Credit (PKR)',
      sortable: true,
      render: (pr) => (
        <span className="font-bold text-xs text-emerald-600">
          PKR {(pr.totalRefundAmount || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'timestamp',
      header: 'Date',
      render: (pr) => <span className="text-xs text-slate-400">{pr.timestamp}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-[#007f87]" />
          <span>Purchase Returns & Supplier Consignment Reversal</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Return damaged, misprinted or short-shipped stock back to publishers and wholesale suppliers.
        </p>
      </div>

      {/* Select Received PO */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Select Received Purchase Order to Revert Stock:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {receivedPOs.map((po) => {
            const active = selectedPO?.id === po.id;
            return (
              <div
                key={po.id}
                onClick={() => handleSelectPO(po)}
                className={`p-3 rounded-xl border cursor-pointer transition text-xs ${
                  active
                    ? 'bg-teal-50 border-[#007f87] text-[#007f87]'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold text-slate-900 mb-1">
                  <span>{po.referenceNumber}</span>
                  <Badge variant="success" size="sm">Received</Badge>
                </div>
                <p className="font-medium truncate text-slate-800">{po.supplierName}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Total: PKR {(po.totalAmount || 0).toLocaleString()} • {po.items.length} items
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return Line Items Workspace */}
      {selectedPO && (
        <div className="p-6 rounded-2xl bg-white border border-teal-200 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#007f87]">
                Selected Consignment
              </span>
              <h3 className="text-base font-bold text-slate-900">{selectedPO.referenceNumber}</h3>
              <p className="text-xs text-slate-500">Supplier: {selectedPO.supplierName}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold uppercase">Refund Credit</span>
              <p className="text-base font-bold text-emerald-600">
                PKR {totalRefund.toLocaleString()}
              </p>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="p-2.5">Received Item</th>
                <th className="p-2.5 text-center">Received Qty</th>
                <th className="p-2.5 text-center">Return Qty</th>
                <th className="p-2.5">Return Reason</th>
                <th className="p-2.5 text-right">Credit Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedPO.items.map((item) => {
                const line = returnItems[item.productId] || { quantity: 0, reason: '' };
                const sub = line.quantity * item.purchasePrice;
                return (
                  <tr key={item.productId} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-900 font-medium">
                      {item.productName}
                      <span className="block text-[10px] text-slate-400">
                        Cost: PKR {item.purchasePrice}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={line.quantity}
                        onChange={(e) =>
                          handleQtyChange(item.productId, Number(e.target.value), item.quantity)
                        }
                        className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-slate-900 focus:outline-none focus:border-[#007f87]"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="text"
                        value={line.reason}
                        placeholder="Misprint, damaged in transit..."
                        onChange={(e) =>
                          setReturnItems((prev) => ({
                            ...prev,
                            [item.productId]: { ...prev[item.productId], reason: e.target.value }
                          }))
                        }
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
                      />
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-600">
                      PKR {sub.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setSelectedPO(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={totalQtyToReturn === 0}
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleConfirmReturn}
            >
              Confirm Return to Supplier (PKR {totalRefund.toLocaleString()})
            </Button>
          </div>
        </div>
      )}

      {/* Supplier Return History */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Supplier Returns Ledger</h3>
        <DataTable
          columns={historyColumns}
          data={purchaseReturns}
          searchPlaceholder="Search return ref, supplier..."
          searchKeys={['returnReference', 'supplierName']}
          emptyTitle="No supplier returns recorded"
          emptyDescription="Returns issued to wholesale publishers and suppliers will appear here."
        />
      </div>
    </div>
  );
};
export default PurchaseReturnsPage;
