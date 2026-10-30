import React, { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Building, CheckCircle2 } from 'lucide-react';
import { PaymentMethod } from '../../types';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: any) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    cart,
    subtotal,
    discountCalculated,
    finalTotal,
    customerName,
    customerPhone,
    setCustomerInfo,
    paymentMethod,
    setPaymentMethod,
    amountPaid,
    setAmountPaid,
    clearCart
  } = useCart();

  const { createTransaction } = useStore();
  const { user } = useAuth();
  const toast = useToast();

  const [tenderInput, setTenderInput] = useState<string>(
    amountPaid > 0 ? String(amountPaid) : String(finalTotal)
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep tender input updated when opening
  React.useEffect(() => {
    if (isOpen) {
      setTenderInput(String(finalTotal));
      setAmountPaid(finalTotal);
    }
  }, [isOpen, finalTotal, setAmountPaid]);

  if (!isOpen) return null;

  const currentPaid = parseFloat(tenderInput) || 0;
  const changeDue = Math.max(0, currentPaid - finalTotal);
  const isCashInsufficient = paymentMethod === 'Cash' && currentPaid < finalTotal;

  const handleTenderChange = (val: string) => {
    setTenderInput(val);
    const num = parseFloat(val) || 0;
    setAmountPaid(num);
  };

  const handleQuickCash = (amount: number) => {
    handleTenderChange(String(amount));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty', 'Add items before attempting checkout.');
      return;
    }

    if (isCashInsufficient) {
      toast.error('Insufficient Amount', `Amount paid must be at least PKR ${finalTotal.toLocaleString()}`);
      return;
    }

    setIsProcessing(true);

    // Simulate clean POS processing
    setTimeout(() => {
      const transactionItems = cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        barcode: item.product.barcode,
        category: item.product.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        subtotal: item.subtotal
      }));

      const newTx = createTransaction({
        cashierName: user?.name || 'Cashier Desk',
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || undefined,
        items: transactionItems,
        subtotal,
        overallDiscount: discountCalculated,
        taxAmount: 0,
        totalAmount: finalTotal,
        paymentMethod,
        amountPaid: paymentMethod === 'Cash' ? currentPaid : finalTotal,
        changeDue: paymentMethod === 'Cash' ? changeDue : 0,
        status: 'completed'
      });

      setIsProcessing(false);
      clearCart();
      toast.success('Sale Completed', `Invoice ${newTx.invoiceNumber} recorded successfully!`);
      onClose();
      onSuccess(newTx);
    }, 400);
  };

  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: 'Cash', label: 'Cash Tender', icon: <Banknote className="w-4 h-4" /> },
    { id: 'Card', label: 'Debit / Credit Card', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'EasyPaisa', label: 'EasyPaisa QR / Mobile', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'JazzCash', label: 'JazzCash QR', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'Bank Transfer', label: 'Bank Transfer (IBFT)', icon: <Building className="w-4 h-4" /> }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete POS Checkout" maxWidth="xl">
      <div className="space-y-5">
        {/* Total Banner */}
        <div className="p-4 rounded-xl bg-[#00272b] border border-[#007f87]/50 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8da5a7]">Total Payable Amount</p>
            <h2 className="text-2xl font-bold text-[#d4f1f4]">
              PKR {finalTotal.toLocaleString()}
            </h2>
            {discountCalculated > 0 && (
              <p className="text-xs text-[#10b981] mt-0.5">
                Discount applied: PKR {discountCalculated.toLocaleString()}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-[#8da5a7]">
            <p>{cart.reduce((s, i) => s + i.quantity, 0)} Items</p>
            <p className="text-[#59787a] mt-0.5">Currency: Pakistani Rupee</p>
          </div>
        </div>

        {/* Customer Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Customer Name (Optional)"
            placeholder="e.g. Army Public School Student"
            value={customerName}
            onChange={(e) => setCustomerInfo(e.target.value, customerPhone)}
          />
          <Input
            label="Customer Phone (Optional)"
            placeholder="e.g. 0300 1234567"
            value={customerPhone}
            onChange={(e) => setCustomerInfo(customerName, e.target.value)}
          />
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-medium text-[#8da5a7] mb-2">
            Select Payment Method
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {methods.map((m) => {
              const active = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-medium transition text-left ${
                    active
                      ? 'bg-[#007f87]/20 border-[#007f87] text-[#d4f1f4]'
                      : 'bg-[#07181a] border-[#143d41] text-[#8da5a7] hover:border-[#005f6a]'
                  }`}
                >
                  <span className={active ? 'text-[#007f87]' : 'text-[#59787a]'}>{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Tender Calculation */}
        {paymentMethod === 'Cash' && (
          <div className="p-4 rounded-xl bg-[#07181a] border border-[#143d41] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#8da5a7]">Cash Amount Received (PKR)</label>
              <div className="flex items-center gap-1.5">
                {[finalTotal, Math.ceil(finalTotal / 500) * 500, Math.ceil(finalTotal / 1000) * 1000, 5000].map(
                  (amt, idx) =>
                    amt >= finalTotal ? (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickCash(amt)}
                        className="px-2 py-0.5 text-[11px] rounded bg-[#003d40] border border-[#143d41] text-[#d4f1f4] hover:bg-[#005f6a]"
                      >
                        {amt.toLocaleString()}
                      </button>
                    ) : null
                )}
              </div>
            </div>

            <div className="relative">
              <Input
                type="number"
                value={tenderInput}
                onChange={(e) => handleTenderChange(e.target.value)}
                placeholder="Enter amount paid by customer"
                error={isCashInsufficient ? `Remaining: PKR ${(finalTotal - currentPaid).toLocaleString()}` : undefined}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#143d41] text-sm">
              <span className="text-[#8da5a7]">Change Return Due:</span>
              <span className={`font-bold text-base ${changeDue > 0 ? 'text-[#10b981]' : 'text-[#f2fbfa]'}`}>
                PKR {changeDue.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {paymentMethod !== 'Cash' && (
          <div className="p-3.5 rounded-lg bg-[#003d40]/20 border border-[#007f87]/30 text-xs text-[#d4f1f4]">
            <span className="font-semibold">{paymentMethod} Payment Simulation:</span> Ready for card swipe/tap or digital transfer confirmation.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#143d41]">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
            Back to Cart
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={handleCompleteSale}
            isLoading={isProcessing}
            disabled={isCashInsufficient}
          >
            Confirm & Print Receipt (PKR {finalTotal.toLocaleString()})
          </Button>
        </div>
      </div>
    </Modal>
  );
};
