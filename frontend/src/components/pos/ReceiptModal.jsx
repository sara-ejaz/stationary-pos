import React from 'react';
import { Printer, X, FileText } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Button } from '../common/Button';

export const ReceiptModal = ({
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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Surface */}
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col max-h-[90vh] z-10">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#007f87]" />
            <span className="text-sm font-semibold text-slate-900">
              {isReprint ? 'Reprint Receipt (Original Record)' : 'Sale Completed Successfully'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-5 overflow-y-auto flex-1 flex justify-center bg-slate-100">
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
                <span>INVOICE #:</span>
                <span className="font-bold">{transaction.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE/TIME:</span>
                <span>{transaction.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span>{transaction.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span>{transaction.customerName || 'Walk-in Counter Sale'}</span>
              </div>
              {transaction.customerPhone && (
                <div className="flex justify-between">
                  <span>PHONE:</span>
                  <span>{transaction.customerPhone}</span>
                </div>
              )}
            </div>

            {/* Receipt Header Notice */}
            {settings.receiptHeader && (
              <div className="py-1 text-center italic text-[10px] border-b border-dashed border-gray-300 text-gray-600">
                {settings.receiptHeader}
              </div>
            )}

            {/* Line Items */}
            <div className="py-2.5 border-b border-dashed border-gray-400">
              <div className="flex justify-between font-bold border-b border-gray-300 pb-1 mb-1 text-[11px]">
                <span className="w-1/2">ITEM / CODE</span>
                <span className="w-1/6 text-center">QTY</span>
                <span className="w-1/3 text-right">TOTAL</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {transaction.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="w-1/2 pr-1">
                      <div className="font-semibold leading-tight line-clamp-1">{item.product.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {item.product.barcode} @ {item.unitPrice}
                      </div>
                    </div>
                    <div className="w-1/6 text-center">{item.quantity}</div>
                    <div className="w-1/3 text-right font-medium">
                      PKR {item.subtotal.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Summary */}
            <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>PKR {transaction.subtotal.toLocaleString()}</span>
              </div>
              {transaction.overallDiscount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>DISCOUNT APPLIED:</span>
                  <span>- PKR {transaction.overallDiscount.toLocaleString()}</span>
                </div>
              )}
              {transaction.taxAmount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>GST / TAX:</span>
                  <span>PKR {transaction.taxAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-300">
                <span>GRAND TOTAL:</span>
                <span>PKR {transaction.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>PAYMENT METHOD:</span>
                <span>{transaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>AMOUNT TENDERED:</span>
                <span>PKR {transaction.amountPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>CHANGE RETURNED:</span>
                <span>PKR {transaction.changeDue.toLocaleString()}</span>
              </div>
            </div>

            {/* Barcode representation */}
            <div className="py-3 text-center border-b border-dashed border-gray-400">
              <div className="font-mono tracking-widest text-lg font-bold">
                ||| | || |||| || | || |||||
              </div>
              <p className="text-[10px] font-mono text-gray-600 mt-0.5">{transaction.invoiceNumber}</p>
            </div>

            {/* Footer Disclaimer */}
            <div className="pt-3 text-center text-[10px] text-gray-600 space-y-1 leading-snug">
              <p className="font-semibold">{settings.receiptFooter}</p>
              <p>Items exchangeable within 3 days with original cash memo.</p>
              <p className="italic">Software by Foji Book POS & Retail System</p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="md" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Thermal Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ReceiptModal;
