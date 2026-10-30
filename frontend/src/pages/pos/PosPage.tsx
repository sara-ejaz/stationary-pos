import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Barcode,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Percent,
  CreditCard,
  RotateCcw,
  BookOpen,
  PenTool,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Printer
} from 'lucide-react';
import { Product, Transaction } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { PaymentModal } from '../../components/pos/PaymentModal';
import { ReceiptModal } from '../../components/pos/ReceiptModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const PosPage: React.FC = () => {
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

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
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery) ||
        (p.type === 'book' && p.isbn.includes(searchQuery));
      return p.status === 'active' && matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Barcode Scanner Input (when Enter is sent by physical scanner)
  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = barcodeInput.trim();
      if (!code) return;

      const product = products.find(
        (p) =>
          p.barcode.toLowerCase() === code.toLowerCase() ||
          (p.type === 'book' && p.isbn.replace(/-/g, '') === code.replace(/-/g, '')) ||
          (p.type === 'stationery' && p.sku.toLowerCase() === code.toLowerCase())
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

  const handleProductCardClick = (product: Product) => {
    const result = addToCart(product, 1);
    if (result.success) {
      toast.success('Added', `${product.name} added to cart.`);
    } else {
      toast.error('Cannot Add', result.message);
    }
  };

  const handleSaleSuccess = (tx: Transaction) => {
    setLastTransaction(tx);
    setIsReceiptOpen(true);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4">
      {/* LEFT: Product Catalog & Fast Scanner Selection (60-65% width) */}
      <div className="flex-1 flex flex-col bg-[#0a2224] border border-[#143d41] rounded-2xl overflow-hidden shadow-xl min-w-0">
        {/* Top Search & Barcode Bar */}
        <div className="p-4 border-b border-[#143d41] bg-[#00272b] flex flex-col sm:flex-row gap-2.5 items-center">
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
              className="w-full bg-[#07181a] border border-[#143d41] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#f2fbfa] font-mono placeholder-[#59787a] focus:outline-none focus:border-[#007f87]"
            />
          </div>

          {/* Text Search */}
          <div className="relative w-full sm:w-1/2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8da5a7]" />
            <input
              type="text"
              placeholder="Search product name, author, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07181a] border border-[#143d41] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#f2fbfa] placeholder-[#59787a] focus:outline-none focus:border-[#007f87]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2 border-b border-[#143d41]/60 flex items-center gap-1.5 overflow-x-auto shrink-0 bg-[#081b1d]">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-[#007f87] text-white shadow-sm'
                : 'bg-[#00272b] text-[#8da5a7] hover:text-[#f2fbfa]'
            }`}
          >
            All Items
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === c.name
                  ? 'bg-[#007f87] text-white shadow-sm'
                  : 'bg-[#00272b] text-[#8da5a7] hover:text-[#f2fbfa]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.quantity <= 0;
            return (
              <div
                key={p.id}
                onClick={() => !isOutOfStock && handleProductCardClick(p)}
                className={`p-3 rounded-xl border transition flex flex-col justify-between text-left select-none ${
                  isOutOfStock
                    ? 'bg-[#081719]/60 border-[#143d41]/30 opacity-50 cursor-not-allowed'
                    : 'bg-[#07181a] border-[#143d41] hover:border-[#007f87] hover:bg-[#003d40]/30 hover:shadow-lg cursor-pointer'
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
                  <h4 className="text-xs font-semibold text-[#f2fbfa] line-clamp-2 leading-snug">
                    {p.name}
                  </h4>
                  <p className="text-[10px] text-[#59787a] mt-0.5 line-clamp-1">{p.barcode}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#143d41]/40 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#d4f1f4]">
                    PKR {p.sellingPrice.toLocaleString()}
                  </span>
                  <div className="p-1 rounded-md bg-[#007f87]/20 text-[#007f87] hover:bg-[#007f87] hover:text-white transition">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Active Cart & Checkout Panel (35-40% width) */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-[#0a2224] border border-[#143d41] rounded-2xl flex flex-col shadow-2xl overflow-hidden shrink-0">
        {/* Cart Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#143d41] bg-[#00272b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#007f87]" />
            <h3 className="text-sm font-bold text-[#f2fbfa]">Current Sale Cart</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#007f87] text-white">
              {totalItemsCount}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-[#8da5a7] hover:text-[#f43f5e] flex items-center gap-1 transition"
              title="Reset Cart"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-[#143d41]/40">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.product.id} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#f2fbfa] truncate">{item.product.name}</p>
                  <p className="text-[10px] text-[#8da5a7]">
                    PKR {item.unitPrice.toLocaleString()} each • Stock: {item.product.quantity}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded bg-[#07181a] border border-[#143d41] text-[#8da5a7] hover:text-[#f2fbfa] flex items-center justify-center transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center font-bold text-[#d4f1f4]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.quantity}
                    className="w-6 h-6 rounded bg-[#07181a] border border-[#143d41] text-[#8da5a7] hover:text-[#f2fbfa] disabled:opacity-40 flex items-center justify-center transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="text-right shrink-0 min-w-16">
                  <p className="font-bold text-[#f2fbfa]">PKR {item.subtotal.toLocaleString()}</p>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[#f43f5e] hover:underline text-[10px]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#59787a] space-y-2">
              <div className="p-3 rounded-full bg-[#143d41]/30">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-[#8da5a7]">Cart is currently empty</p>
              <p className="text-[11px] max-w-xs">
                Scan product barcodes with physical scanner or click items from the left catalog.
              </p>
            </div>
          )}
        </div>

        {/* Cart Bottom Summary & Checkout */}
        <div className="p-4 border-t border-[#143d41] bg-[#07181a] space-y-3 shrink-0">
          {/* Subtotal */}
          <div className="flex justify-between text-xs text-[#8da5a7]">
            <span>Subtotal:</span>
            <span className="font-semibold text-[#f2fbfa]">
              PKR {subtotal.toLocaleString()}
            </span>
          </div>

          {/* Discount Trigger & Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowDiscountInput(!showDiscountInput)}
                className="text-[#007f87] hover:underline flex items-center gap-1 font-medium"
              >
                <Percent className="w-3 h-3" />
                <span>{showDiscountInput ? 'Hide Discount Input' : '+ Apply Discount'}</span>
              </button>
              {discountCalculated > 0 && (
                <span className="font-semibold text-[#10b981]">
                  - PKR {discountCalculated.toLocaleString()}
                </span>
              )}
            </div>

            {showDiscountInput && (
              <div className="flex gap-2 p-2 rounded-lg bg-[#00272b] border border-[#143d41]">
                <div className="flex rounded border border-[#143d41] overflow-hidden text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setDiscount('fixed', discountValue)}
                    className={`px-2 py-1 ${
                      discountType === 'fixed' ? 'bg-[#007f87] text-white' : 'text-[#8da5a7]'
                    }`}
                  >
                    PKR
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscount('percentage', discountValue)}
                    className={`px-2 py-1 ${
                      discountType === 'percentage' ? 'bg-[#007f87] text-white' : 'text-[#8da5a7]'
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
                  className="flex-1 bg-[#07181a] border border-[#143d41] rounded px-2 py-1 text-xs text-[#f2fbfa] focus:outline-none focus:border-[#007f87]"
                />
              </div>
            )}
          </div>

          {/* Final Payable Total */}
          <div className="pt-2 border-t border-[#143d41] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8da5a7]">Total Payable</span>
              <p className="text-xl font-extrabold text-[#d4f1f4] tracking-tight">
                PKR {finalTotal.toLocaleString()}
              </p>
            </div>
            {lastTransaction && (
              <button
                onClick={() => setIsReceiptOpen(true)}
                className="p-2 rounded-lg border border-[#143d41] hover:border-[#007f87] text-[#8da5a7] hover:text-[#d4f1f4] transition"
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
            className="w-full font-bold shadow-lg shadow-[#007f87]/30"
            disabled={cart.length === 0}
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => setIsPaymentOpen(true)}
          >
            Tender & Checkout (PKR {finalTotal.toLocaleString()})
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
