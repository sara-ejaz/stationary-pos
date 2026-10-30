import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Barcode,
  ShoppingCart,
  Plus,
  Minus,
  Percent,
  RotateCcw,
  ArrowRight,
  Printer
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { ReceiptModal } from '../../components/pos/ReceiptModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const PosPage = () => {
  const { products, categories } = useStore();
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    discountType,
    discountValue,
    setDiscount,
    subtotal,
    discountCalculated,
    finalTotal,
    totalItemsCount
  } = useCart();

  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  const barcodeInputRef = useRef(null);

  // Keep scanner input focused for fast barcode workflow
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Filtered products for visual grid
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode?.includes(searchQuery) ||
        (p.type === 'book' && p.isbn?.includes(searchQuery));
      return p.status === 'active' && matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Barcode Scanner Input (when Enter is sent by physical scanner)
  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = barcodeInput.trim();
      if (!code) return;

      const product = products.find(
        (p) =>
          p.barcode?.toLowerCase() === code.toLowerCase() ||
          (p.type === 'book' && p.isbn?.replace(/-/g, '') === code.replace(/-/g, '')) ||
          (p.type === 'stationery' && p.sku?.toLowerCase() === code.toLowerCase())
      );

      if (product) {
        const result = addToCart(product, 1);
        if (result.success) {
          toast.success('Item Added', `${product.name} (PKR ${product.sellingPrice})`);
        } else {
          toast.error('Stock Limit', result.message);
        }
      } else {
        toast.error('Barcode Not Found', `No item registered with barcode "${code}".`);
      }
      setBarcodeInput('');
    }
  };

  const handleProductCardClick = (product) => {
    const result = addToCart(product, 1);
    if (result.success) {
      toast.success('Added', `${product.name} added to cart.`);
    } else {
      toast.error('Cannot Add', result.message);
    }
  };

  const handleSaleSuccess = (tx) => {
    setLastTransaction(tx);
    setIsReceiptOpen(true);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4">
      {/* LEFT: Product Catalog & Fast Scanner Selection (60-65% width) */}
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs min-w-0">
        {/* Top Search & Barcode Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-2.5 items-center">
          {/* Barcode Scanner Direct Input */}
          <div className="relative w-full sm:w-1/2">
            <Barcode className="w-4 h-4 absolute left-3 top-2.5 text-[#007f87]" />
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode / ISBN (Press Enter)..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeScan}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-[#007f87] focus:ring-1 focus:ring-[#007f87]"
            />
          </div>

          {/* Text Search */}
          <div className="relative w-full sm:w-1/2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name, author, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007f87] focus:ring-1 focus:ring-[#007f87]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0 bg-slate-50/50">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#007f87] text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === c.name
                  ? 'bg-[#007f87] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 bg-slate-50/30">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.quantity <= 0;
            return (
              <div
                key={p.id}
                onClick={() => !isOutOfStock && handleProductCardClick(p)}
                className={`p-3 rounded-xl border transition flex flex-col justify-between text-left select-none ${
                  isOutOfStock
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-[#007f87] hover:shadow-sm cursor-pointer'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#007f87] tracking-wider">
                      {p.type === 'book' ? 'Book' : 'Stationery'}
                    </span>
                    <Badge
                      variant={
                        p.quantity === 0
                          ? 'danger'
                          : p.quantity <= p.minStockThreshold
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    >
                      {p.quantity === 0 ? 'Out' : `${p.quantity} left`}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{p.barcode}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#007f87]">
                    PKR {(p.sellingPrice || 0).toLocaleString()}
                  </span>
                  <div className="p-1 rounded-md bg-teal-50 text-[#007f87] hover:bg-[#007f87] hover:text-white transition">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Active Cart & Checkout Panel (35-40% width) */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-sm overflow-hidden shrink-0">
        {/* Cart Top Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#007f87]" />
            <h3 className="text-sm font-bold text-slate-900">Current Sale Cart</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#007f87] text-white">
              {totalItemsCount}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
              title="Reset Cart"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-slate-100">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.product.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{item.product.name}</p>
                  <p className="text-[10px] text-slate-500">
                    PKR {(item.unitPrice || 0).toLocaleString()} each • Stock: {item.product.quantity}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.quantity}
                    className="w-6 h-6 rounded bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-40 flex items-center justify-center transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right shrink-0 min-w-16">
                  <p className="font-bold text-slate-900">PKR {(item.subtotal || 0).toLocaleString()}</p>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-rose-500 hover:underline text-[10px] cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <div className="p-3 rounded-full bg-slate-100">
                <ShoppingCart className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Cart is currently empty</p>
              <p className="text-[11px] max-w-xs text-slate-400">
                Scan product barcodes with physical scanner or click items from the left catalog.
              </p>
            </div>
          )}
        </div>

        {/* Cart Bottom Summary & Checkout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3 shrink-0">
          {/* Subtotal */}
          <div className="flex justify-between text-xs text-slate-600">
            <span>Subtotal:</span>
            <span className="font-semibold text-slate-900">
              PKR {(subtotal || 0).toLocaleString()}
            </span>
          </div>

          {/* Discount Trigger & Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowDiscountInput(!showDiscountInput)}
                className="text-[#007f87] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Percent className="w-3 h-3" />
                <span>{showDiscountInput ? 'Hide Discount Input' : '+ Apply Discount'}</span>
              </button>
              {discountCalculated > 0 && (
                <span className="font-semibold text-emerald-600">
                  - PKR {discountCalculated.toLocaleString()}
                </span>
              )}
            </div>

            {showDiscountInput && (
              <div className="flex gap-2 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs">
                <div className="flex rounded border border-slate-300 overflow-hidden text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setDiscount('fixed', discountValue)}
                    className={`px-2 py-1 cursor-pointer ${
                      discountType === 'fixed' ? 'bg-[#007f87] text-white' : 'text-slate-600'
                    }`}
                  >
                    PKR
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscount('percentage', discountValue)}
                    className={`px-2 py-1 cursor-pointer ${
                      discountType === 'percentage' ? 'bg-[#007f87] text-white' : 'text-slate-600'
                    }`}
                  >
                    %
                  </button>
                </div>
                <input
                  type="number"
                  min={0}
                  placeholder="Discount value"
                  value={discountValue || ''}
                  onChange={(e) => setDiscount(discountType, Number(e.target.value))}
                  className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
                />
              </div>
            )}
          </div>

          {/* Final Payable Total */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Payable</span>
              <p className="text-xl font-extrabold text-[#007f87] tracking-tight">
                PKR {(finalTotal || 0).toLocaleString()}
              </p>
            </div>
            {lastTransaction && (
              <button
                onClick={() => setIsReceiptOpen(true)}
                className="p-2 rounded-lg border border-slate-200 hover:border-[#007f87] text-slate-600 hover:text-[#007f87] transition cursor-pointer"
                title="Reprint last receipt"
              >
                <Printer className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Checkout Action Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-md shadow-[#007f87]/20"
            disabled={cart.length === 0}
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => setIsPaymentOpen(true)}
          >
            Tender & Checkout (PKR {(finalTotal || 0).toLocaleString()})
          </Button>
        </div>
      </div>

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handleSaleSuccess}
      />

      {/* Receipt Modal (Thermal Printable layout) */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={lastTransaction}
      />
    </div>
  );
};
export default PosPage;
