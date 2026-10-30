import React, { useState } from 'react';
import { Truck, Plus, PackageCheck, Eye, CheckCircle2, Trash2, Calendar } from 'lucide-react';
import { PurchaseOrder, PurchaseItem, PurchaseStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const PurchasesPage: React.FC = () => {
  const { purchases, suppliers, products, createPurchaseOrder, receivePurchaseOrder } = useStore();
  const { user } = useAuth();
  const toast = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [receiveConfirmPO, setReceiveConfirmPO] = useState<PurchaseOrder | null>(null);

  // Create PO Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [orderItems, setOrderItems] = useState<
    { productId: string; quantity: number; purchasePrice: number }[]
  >([]);

  // Item Selector row state
  const [selectedProdId, setSelectedProdId] = useState('');
  const [addItemQty, setAddItemQty] = useState(10);
  const [addItemPrice, setAddItemPrice] = useState(0);

  const handleSelectProduct = (prodId: string) => {
    setSelectedProdId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setAddItemPrice(prod.purchasePrice);
    }
  };

  const handleAddItemToOrder = () => {
    if (!selectedProdId) {
      toast.error('Product Required', 'Please choose a product to add.');
      return;
    }
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    const existingIdx = orderItems.findIndex((i) => i.productId === selectedProdId);
    if (existingIdx > -1) {
      const updated = [...orderItems];
      updated[existingIdx].quantity += addItemQty;
      updated[existingIdx].purchasePrice = addItemPrice;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: selectedProdId,
          quantity: addItemQty,
          purchasePrice: addItemPrice
        }
      ]);
    }
    setSelectedProdId('');
  };

  const handleRemoveOrderItem = (prodId: string) => {
    setOrderItems(orderItems.filter((i) => i.productId !== prodId));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      toast.error('Empty Order', 'Add at least one product item to the purchase order.');
      return;
    }

    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup) {
      toast.error('Supplier Required', 'Select a valid supplier.');
      return;
    }

    const sub = calculateSubtotal();
    const formattedItems: PurchaseItem[] = orderItems.map((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return {
        productId: item.productId,
        productName: p ? p.name : 'Unknown Product',
        barcode: p ? p.barcode : '',
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        subtotal: item.quantity * item.purchasePrice
      };
    });

    const newPO = createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.companyName,
      purchaseDate,
      items: formattedItems,
      subtotal: sub,
      tax: 0,
      totalAmount: sub,
      status: 'pending',
      notes
    });

    toast.success('PO Created', `Purchase order ${newPO.referenceNumber} created as Pending.`);
    setIsCreateOpen(false);
    setOrderItems([]);
    setNotes('');
  };

  const handleConfirmReceive = () => {
    if (receiveConfirmPO) {
      const success = receivePurchaseOrder(
        receiveConfirmPO.id,
        user?.name || 'Authorized Inventory Staff'
      );
      if (success) {
        toast.success(
          'Stock Inventoried',
          `Items from ${receiveConfirmPO.referenceNumber} received and added to inventory!`
        );
      }
      setReceiveConfirmPO(null);
    }
  };

  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'referenceNumber',
      header: 'PO Reference',
      sortable: true,
      render: (po) => (
        <div>
          <span className="font-mono font-bold text-[#f2fbfa]">{po.referenceNumber}</span>
          <div className="text-[10px] text-[#59787a] flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3" />
            <span>{po.purchaseDate}</span>
          </div>
        </div>
      )
    },
    {
      key: 'supplierName',
      header: 'Supplier / Distributor',
      sortable: true,
      render: (po) => (
        <div>
          <span className="font-semibold text-xs text-[#f2fbfa]">{po.supplierName}</span>
          <p className="text-[10px] text-[#8da5a7]">{po.items.length} product lines</p>
        </div>
      )
    },
    {
      key: 'totalAmount',
      header: 'Order Total (PKR)',
      sortable: true,
      render: (po) => (
        <span className="font-bold text-xs text-[#d4f1f4]">
          PKR {po.totalAmount.toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (po) => {
        const variantMap: Record<PurchaseStatus, 'warning' | 'success' | 'danger'> = {
          pending: 'warning',
          received: 'success',
          cancelled: 'danger'
        };
        const labelMap: Record<PurchaseStatus, string> = {
          pending: 'Pending Receipt',
          received: `Received (${po.receivedDate || 'Inventoried'})`,
          cancelled: 'Cancelled'
        };
        return <Badge variant={variantMap[po.status]} size="sm">{labelMap[po.status]}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (po) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedPO(po)}
            title="View PO Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>

          {po.status === 'pending' && (
            <Button
              variant="primary"
              size="sm"
              icon={<PackageCheck className="w-3.5 h-3.5" />}
              onClick={() => setReceiveConfirmPO(po)}
            >
              Receive Stock
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#f2fbfa]">Purchase Orders & Stock Receiving</h2>
          <p className="text-xs text-[#8da5a7]">
            Procure wholesale textbooks and stationery consignments from accredited suppliers.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setOrderItems([]);
            setIsCreateOpen(true);
          }}
        >
          Create Purchase Order
        </Button>
      </div>

      {/* PO Table */}
      <DataTable
        columns={columns}
        data={purchases}
        searchPlaceholder="Search PO #, supplier name, notes..."
        searchKeys={['referenceNumber', 'supplierName', 'notes']}
      />

      {/* Create PO Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Draft New Purchase Consignment"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateOrder} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#8da5a7] mb-1.5">
                Select Supplier <span className="text-[#f43f5e]">*</span>
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-[#07181a] border border-[#143d41] rounded-lg px-3 py-2 text-sm text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName} ({s.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Purchase Order Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>

          {/* Add Product Line to PO */}
          <div className="p-4 rounded-xl bg-[#07181a] border border-[#143d41] space-y-3">
            <span className="text-xs font-semibold text-[#d4f1f4] uppercase tracking-wider block">
              Add Products to Order
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6">
                <label className="block text-xs text-[#8da5a7] mb-1">Product</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full bg-[#0a2224] border border-[#143d41] rounded-lg px-3 py-2 text-xs text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
                >
                  <option value="">-- Select Book or Stationery Item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Barcode: {p.barcode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Qty"
                  type="number"
                  min={1}
                  value={addItemQty}
                  onChange={(e) => setAddItemQty(Number(e.target.value))}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Cost (PKR)"
                  type="number"
                  min={0}
                  value={addItemPrice}
                  onChange={(e) => setAddItemPrice(Number(e.target.value))}
                />
              </div>

              <div className="sm:col-span-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={handleAddItemToOrder}
                >
                  Add Line
                </Button>
              </div>
            </div>

            {/* Added Items Table */}
            {orderItems.length > 0 && (
              <div className="mt-3 border-t border-[#143d41] pt-3">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-[#8da5a7] border-b border-[#143d41]">
                      <th className="py-1">Product</th>
                      <th className="py-1 text-center">Qty</th>
                      <th className="py-1 text-right">Unit Cost</th>
                      <th className="py-1 text-right">Subtotal</th>
                      <th className="py-1 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#143d41]/40">
                    {orderItems.map((item) => {
                      const p = products.find((x) => x.id === item.productId);
                      const sub = item.quantity * item.purchasePrice;
                      return (
                        <tr key={item.productId} className="text-[#f2fbfa]">
                          <td className="py-2">{p?.name}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-right">PKR {item.purchasePrice}</td>
                          <td className="py-2 text-right font-semibold text-[#d4f1f4]">
                            PKR {sub.toLocaleString()}
                          </td>
                          <td className="py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveOrderItem(item.productId)}
                              className="text-[#f43f5e] hover:underline"
                            >
                              <Trash2 className="w-3.5 h-3.5 ml-auto" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes and Total */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:max-w-md">
              <Input
                label="Delivery Notes / Consignment Details"
                placeholder="e.g. Expected delivery via cargo Monday..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="text-right">
              <span className="text-xs text-[#8da5a7]">Total Consignment Value</span>
              <div className="text-xl font-bold text-[#d4f1f4]">
                PKR {calculateSubtotal().toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#143d41]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Submit Purchase Order
            </Button>
          </div>
        </form>
      </Modal>

      {/* PO Detail View Modal */}
      {selectedPO && (
        <Modal
          isOpen={!!selectedPO}
          onClose={() => setSelectedPO(null)}
          title={`Purchase Order: ${selectedPO.referenceNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-[#07181a] border border-[#143d41]">
              <div>
                <span className="text-[#59787a] block">Supplier:</span>
                <span className="font-semibold text-[#f2fbfa]">{selectedPO.supplierName}</span>
              </div>
              <div>
                <span className="text-[#59787a] block">Date:</span>
                <span className="text-[#f2fbfa]">{selectedPO.purchaseDate}</span>
              </div>
              <div>
                <span className="text-[#59787a] block">Status:</span>
                <span className="capitalize font-semibold text-[#007f87]">
                  {selectedPO.status}
                </span>
              </div>
              <div>
                <span className="text-[#59787a] block">Total Amount:</span>
                <span className="font-bold text-[#d4f1f4]">
                  PKR {selectedPO.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#8da5a7] mb-2 uppercase text-[11px]">
                Product Line Items
              </h4>
              <table className="w-full text-left border border-[#143d41] rounded-lg overflow-hidden">
                <thead className="bg-[#00272b] text-[#d4f1f4]">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Cost</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#143d41]">
                  {selectedPO.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#07181a]">
                      <td className="p-2.5 text-[#f2fbfa]">
                        {item.productName}
                        <span className="block text-[10px] text-[#59787a]">{item.barcode}</span>
                      </td>
                      <td className="p-2.5 text-center">{item.quantity}</td>
                      <td className="p-2.5 text-right">PKR {item.purchasePrice}</td>
                      <td className="p-2.5 text-right font-semibold text-[#d4f1f4]">
                        PKR {item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedPO.notes && (
              <div className="p-3 rounded-lg bg-[#07181a] border border-[#143d41]">
                <span className="text-[#59787a] block text-[10px] uppercase font-bold">Notes</span>
                <p className="text-[#8da5a7] mt-0.5">{selectedPO.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedPO(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Receive Stock Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!receiveConfirmPO}
        onClose={() => setReceiveConfirmPO(null)}
        onConfirm={handleConfirmReceive}
        variant="primary"
        title="Confirm Stock Consignment Receipt"
        message={`Are you sure you want to mark ${receiveConfirmPO?.referenceNumber} as Received? This will physically increment the current inventory of all included products and log a stock movement ledger entry.`}
        confirmText="Confirm Stock Receipt"
      />
    </div>
  );
};
