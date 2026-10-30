import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, Smartphone, Building, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

export const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
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

  const [tenderInput, setTenderInput] = useState(
    amountPaid > 0 ? String(amountPaid) : String(finalTotal)
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTenderInput(String(finalTotal));
      setAmountPaid(finalTotal);
    }
  }, [isOpen, finalTotal, setAmountPaid]);

  if (!isOpen) return null;

  const currentPaid = parseFloat(tenderInput) || 0;
  const changeDue = Math.max(0, currentPaid - finalTotal);
  const isCashInsufficient = paymentMethod === 'Cash' && currentPaid < finalTotal;

  const handleTenderChange = (val) => {
    setTenderInput(val);
    const num = parseFloat(val) || 0;
    setAmountPaid(num);
  };

  const handleQuickCash = (amount) => {
    handleTenderChange(String(amount));
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.error('Cart Empty', 'Please add products before checking out.');
      return;
    }

    if (isCashInsufficient) {
      toast.warning('Tender Incomplete', 'Amount tendered must meet or exceed total bill.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      const newTx = createTransaction({
        items: cart,
        subtotal,
        overallDiscount: discountCalculated,
        totalAmount: finalTotal,
        paymentMethod,
        amountPaid: currentPaid,
        changeDue: paymentMethod === 'Cash' ? changeDue : 0,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        cashierName: user?.name || 'Cashier Desk 1'
      });

      clearCart();
      toast.success('Sale Completed', `Invoice ${newTx.invoiceNumber} recorded successfully!`);
      onClose();
      onSuccess(newTx);
    }, 400);
  };

  const methods = [
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
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Payable Amount</p>
            <h2 className="text-2xl font-bold text-[#007f87]">
              PKR {finalTotal.toLocaleString()}
            </h2>
            {discountCalculated > 0 && (
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                Discount applied: PKR {discountCalculated.toLocaleString()}
              </p>
            )}
          </div>
          <div className="text-right text-xs text-slate-600">
            <p className="font-semibold text-slate-800">{cart.reduce((s, i) => s + i.quantity, 0)} Items</p>
            <p className="text-slate-500 mt-0.5">Currency: Pakistani Rupee</p>
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
          <label className="block text-xs font-semibold text-slate-700 mb-2">
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
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-medium transition text-left cursor-pointer ${
                    active
                      ? 'bg-teal-50 border-[#007f87] text-[#007f87] font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className={active ? 'text-[#007f87]' : 'text-slate-400'}>{m.icon}</span>
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Tender Calculation */}
        {paymentMethod === 'Cash' && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Cash Amount Received (PKR)</label>
              <div className="flex items-center gap-1.5">
                {[finalTotal, Math.ceil(finalTotal / 500) * 500, Math.ceil(finalTotal / 1000) * 1000, 5000].map(
                  (amt, idx) =>
                    amt >= finalTotal ? (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickCash(amt)}
                        className="px-2 py-0.5 text-[11px] rounded bg-white border border-slate-300 text-slate-700 hover:border-[#007f87] hover:text-[#007f87] font-medium transition cursor-pointer"
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

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-sm">
              <span className="text-slate-600 font-medium">Change Return Due:</span>
              <span className={`font-bold text-base ${changeDue > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                PKR {changeDue.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {paymentMethod !== 'Cash' && (
          <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-xs text-[#005f6a]">
            <span className="font-semibold">{paymentMethod} Payment Simulation:</span> Ready for card swipe/tap or digital transfer confirmation.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
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
export default PaymentModal;
