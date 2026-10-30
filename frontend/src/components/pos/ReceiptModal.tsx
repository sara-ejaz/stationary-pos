import React from 'react';
import { Printer, X, CheckCircle, FileText } from 'lucide-react';
import { Transaction } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Button } from '../common/Button';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  isReprint?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  isReprint = false
}) => {
  const { settings } = useStore();

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Surface */}
      <div className="relative w-full max-w-md bg-[#0a2224] border border-[#143d41] rounded-xl shadow-2xl shadow-black/80 flex flex-col max-h-[90vh] z-10">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#143d41] bg-[#00272b]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#007f87]" />
            <span className="text-sm font-semibold text-[#f2fbfa]">
              {isReprint ? 'Reprint Receipt (Original Record)' : 'Sale Completed Successfully'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8da5a7] hover:text-[#f2fbfa] p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-5 overflow-y-auto flex-1 flex justify-center bg-[#061314]">
          <div
            id="printable-receipt"
            className="w-full max-w-[340px] bg-white text-gray-900 p-5 rounded shadow-md font-mono text-xs border border-gray-200"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-gray-400">
              <h2 className="text-base font-bold tracking-wider text-black">
                {settings.storeName.toUpperCase()}
              </h2>
              <p className="text-[11px] text-gray-700">{settings.storeTagline}</p>
              <p className="text-[10px] text-gray-600 mt-1">{settings.address}</p>
              <p className="text-[10px] text-gray-600">Tel: {settings.phone}</p>
              <p className="text-[10px] text-gray-600 font-bold">NTN: {settings.ntn}</p>
            </div>

            {/* Invoice Info */}
            <div className="py-2.5 border-b border-dashed border-gray-400 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice #:</span>
                <span className="font-bold text-black">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date/Time:</span>
                <span>{transaction.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cashier:</span>
                <span>{transaction.cashierName}</span>
              </div>
              {transaction.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span>{transaction.customerName}</span>
                </div>
              )}
              {isReprint && (
                <div className="text-center text-[10px] font-bold text-amber-800 bg-amber-100 py-0.5 mt-1 rounded">
                  ** DUPLICATE / REPRINT RECEIPT **
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="py-3 border-b border-dashed border-gray-400">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-gray-300 text-gray-600">
                    <th className="text-left pb-1 font-semibold">Item</th>
                    <th className="text-center pb-1 font-semibold">Qty</th>
                    <th className="text-right pb-1 font-semibold">Rate</th>
                    <th className="text-right pb-1 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transaction.items.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-1.5 pr-1">
                        <div className="font-medium text-black line-clamp-2">{item.productName}</div>
                        <div className="text-[9px] text-gray-500">{item.barcode}</div>
                      </td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-right">{item.unitPrice.toLocaleString()}</td>
                      <td className="py-1.5 text-right font-medium text-black">
                        {item.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Totals in PKR */}
            <div className="py-2.5 border-b border-dashed border-gray-400 text-[11px] space-y-1">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>PKR {transaction.subtotal.toLocaleString()}</span>
              </div>
              {transaction.overallDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span>- PKR {transaction.overallDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-black pt-1 border-t border-gray-200">
                <span>FINAL TOTAL:</span>
                <span>PKR {transaction.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700 pt-1">
                <span>Payment Mode:</span>
                <span className="font-semibold text-black">{transaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Amount Paid:</span>
                <span>PKR {transaction.amountPaid.toLocaleString()}</span>
              </div>
              {transaction.changeDue > 0 && (
                <div className="flex justify-between text-blue-800 font-bold">
                  <span>Change Returned:</span>
                  <span>PKR {transaction.changeDue.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="text-center pt-3 text-[10px] text-gray-600 whitespace-pre-line leading-relaxed">
              {settings.receiptFooter}
            </div>

            <div className="text-center pt-2 text-[9px] text-gray-400">
              System: Foji Book Center POS (Enterprise v1.0)
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-[#143d41] bg-[#081b1d] flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Thermal Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};
