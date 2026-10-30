import React, { useState } from 'react';
import { RotateCcw, Search, CheckCircle2, Truck, Calendar } from 'lucide-react';
import { PurchaseOrder, PurchaseReturn } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const PurchaseReturnsPage: React.FC = () => {
  const { purchases, purchaseReturns, processPurchaseReturn } = useStore();
  const { user } = useAuth();
  const toast = useToast();

  const [poQuery, setPoQuery] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [returnItems, setReturnItems] = useState<
    Record<string, { quantity: number; reason: string }>
  >({});

  const receivedPOs = purchases.filter((p) => p.status === 'received');

  const handleSelectPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setPoQuery(po.referenceNumber);
    const initialMap: Record<string, any> = {};
    po.items.forEach((item) => {
      initialMap[item.productId] = {
        quantity: 0,
        reason: 'Defective consignment from publisher'
      };
    });
    setReturnItems(initialMap);
  };

  const handleQtyChange = (productId: string, qty: number, maxQty: number) => {
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
      setPoQuery('');
    }
  };

  const historyColumns: Column<PurchaseReturn>[] = [
    {
      key: 'returnReference',
      header: 'Return Ref',
      sortable: true,
      render: (pr) => <span className="font-mono font-bold text-[#f2fbfa]">{pr.returnReference}</span>
    },
    {
      key: 'originalPurchaseRef',
      header: 'PO Reference',
      render: (pr) => <span className="font-mono text-xs text-[#007f87]">{pr.originalPurchaseRef}</span>
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      sortable: true,
      render: (pr) => <span className="text-xs text-[#f2fbfa]">{pr.supplierName}</span>
    },
    {
      key: 'items',
      header: 'Items Returned',
      render: (pr) => (
        <div className="text-xs text-[#8da5a7]">
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
        <span className="font-bold text-xs text-[#d4f1f4]">
          PKR {pr.totalRefundAmount.toLocaleString()}
        </span>
      )
    },
    {
      key: 'timestamp',
      header: 'Date',
      render: (pr) => <span className="text-xs text-[#59787a]">{pr.timestamp}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#f2fbfa] flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-[#007f87]" />
          <span>Purchase Returns & Supplier Consignment Reversal</span>
        </h2>
        <p className="text-xs text-[#8da5a7] mt-0.5">
          Return damaged, misprinted or short-shipped stock back to publishers and wholesale suppliers.
        </p>
      </div>

      {/* Select Received PO */}
      <div className="p-5 rounded-2xl bg-[#0a2224] border border-[#143d41] shadow-xl space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4f1f4]">
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
                    ? 'bg-[#007f87]/20 border-[#007f87] text-[#d4f1f4]'
                    : 'bg-[#07181a] border-[#143d41] text-[#8da5a7] hover:border-[#005f6a]'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold text-[#f2fbfa] mb-1">
                  <span>{po.referenceNumber}</span>
                  <Badge variant="success" size="sm">Received</Badge>
                </div>
                <p className="font-medium truncate">{po.supplierName}</p>
                <p className="text-[10px] text-[#59787a] mt-1">
                  Total: PKR {po.totalAmount.toLocaleString()} • {po.items.length} items
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Return Line Items Workspace */}
      {selectedPO && (
        <div className="p-6 rounded-2xl bg-[#0a2224] border border-[#007f87]/50 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#143d41]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#007f87]">
                Selected Consignment
              </span>
              <h3 className="text-base font-bold text-[#f2fbfa]">{selectedPO.referenceNumber}</h3>
              <p className="text-xs text-[#8da5a7]">Supplier: {selectedPO.supplierName}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#8da5a7]">Refund Credit</span>
              <p className="text-base font-bold text-[#10b981]">
                PKR {totalRefund.toLocaleString()}
              </p>
            </div>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#00272b] text-[#d4f1f4]">
              <tr>
                <th className="p-2.5">Received Item</th>
                <th className="p-2.5 text-center">Received Qty</th>
                <th className="p-2.5 text-center">Return Qty</th>
                <th className="p-2.5">Return Reason</th>
                <th className="p-2.5 text-right">Credit Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#143d41]">
              {selectedPO.items.map((item) => {
                const line = returnItems[item.productId] || { quantity: 0, reason: '' };
                const sub = line.quantity * item.purchasePrice;
                return (
                  <tr key={item.productId} className="hover:bg-[#07181a]">
                    <td className="p-2.5 text-[#f2fbfa]">
                      {item.productName}
                      <span className="block text-[10px] text-[#59787a]">
                        Cost: PKR {item.purchasePrice}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-bold text-[#8da5a7]">{item.quantity}</td>
                    <td className="p-2.5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={line.quantity}
                        onChange={(e) =>
                          handleQtyChange(item.productId, Number(e.target.value), item.quantity)
                        }
                        className="w-16 bg-[#07181a] border border-[#143d41] rounded px-2 py-1 text-center font-bold text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
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
                        className="w-full bg-[#07181a] border border-[#143d41] rounded px-2 py-1 text-xs text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
                      />
                    </td>
                    <td className="p-2.5 text-right font-bold text-[#10b981]">
                      PKR {sub.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between pt-3 border-t border-[#143d41]">
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
        <h3 className="text-sm font-semibold text-[#f2fbfa]">Supplier Returns Ledger</h3>
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
