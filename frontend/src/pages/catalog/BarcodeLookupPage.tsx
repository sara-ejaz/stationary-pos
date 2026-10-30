import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Barcode, Search, AlertCircle, ShoppingCart, Edit3, CheckCircle2, BookOpen, PenTool } from 'lucide-react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const BarcodeLookupPage: React.FC = () => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDuplicateDetected, setIsDuplicateDetected] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { products } = useStore();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  // Focus input automatically on mount for fast scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLookup = (codeToSearch: string) => {
    const trimmed = codeToSearch.trim();
    if (!trimmed) return;

    setHasSearched(true);

    // Exact barcode match first
    const exactMatches = products.filter(
      (p) =>
        p.barcode.toLowerCase() === trimmed.toLowerCase() ||
        (p.type === 'book' && p.isbn.replace(/-/g, '') === trimmed.replace(/-/g, '')) ||
        (p.type === 'stationery' && p.sku.toLowerCase() === trimmed.toLowerCase())
    );

    if (exactMatches.length > 1) {
      setIsDuplicateDetected(true);
      setMatchedProduct(exactMatches[0]);
      return;
    }

    setIsDuplicateDetected(false);

    if (exactMatches.length === 1) {
      setMatchedProduct(exactMatches[0]);
    } else {
      // Partial name search fallback
      const partialMatch = products.find((p) =>
        p.name.toLowerCase().includes(trimmed.toLowerCase())
      );
      setMatchedProduct(partialMatch || null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Physical USB Barcode Scanners simulate typing characters and send Enter (keyCode 13)
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup(barcodeInput);
    }
  };

  const handleQuickAddToCart = () => {
    if (!matchedProduct) return;
    const res = addToCart(matchedProduct, 1);
    if (res.success) {
      toast.success('Added to Cart', `${matchedProduct.name} placed in POS checkout.`);
    } else {
      toast.error('Stock Limit', res.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-[#f2fbfa] flex items-center gap-2">
          <Barcode className="w-6 h-6 text-[#007f87]" />
          <span>Barcode & Product Lookup Terminal</span>
        </h2>
        <p className="text-xs text-[#8da5a7] mt-0.5">
          Scan any physical book or stationery item with your barcode scanner or enter ISBN / SKU manually.
        </p>
      </div>

      {/* Scanner Input Panel */}
      <div className="p-6 rounded-2xl bg-[#0a2224] border border-[#143d41] shadow-xl space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#d4f1f4]">
          Scan Barcode or Type Code
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Barcode className="w-5 h-5 absolute left-3.5 top-3 text-[#007f87]" />
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-[#07181a] border border-[#143d41] rounded-xl pl-12 pr-4 py-3 text-base text-[#f2fbfa] font-mono placeholder-[#59787a] focus:outline-none focus:border-[#007f87] focus:ring-1 focus:ring-[#007f87]"
              placeholder="Aim scanner here or enter 9780199060450 / STA-PIA..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Search className="w-4 h-4" />}
            onClick={() => handleLookup(barcodeInput)}
          >
            Lookup
          </Button>
        </div>

        {/* Quick Demo Scanner Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#8da5a7]">Test Demo Scans:</span>
          {[
            { label: 'Oxford English (Book)', code: '9780199060450' },
            { label: 'Cambridge Math (Book)', code: '9781108437189' },
            { label: 'Piano Ballpoint (Stationery)', code: '8964000100124' },
            { label: 'Pelikan Ink 60ml', code: '4012700301131' },
            { label: 'Non-existent Code', code: '9999999999999' }
          ].map((demo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setBarcodeInput(demo.code);
                handleLookup(demo.code);
              }}
              className="px-2.5 py-1 rounded-lg bg-[#00272b] border border-[#143d41] text-[#8da5a7] hover:text-[#d4f1f4] hover:border-[#007f87] transition font-mono text-[11px]"
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duplicate Barcode Warning Alert */}
      {isDuplicateDetected && (
        <div className="p-4 rounded-xl bg-[#291e0a] border border-[#f59e0b]/40 flex items-start gap-3 text-xs text-[#f2fbfa]">
          <AlertCircle className="w-5 h-5 text-[#f59e0b] shrink-0" />
          <div>
            <p className="font-semibold text-[#f59e0b]">Duplicate Barcode Warning</p>
            <p className="text-[#8da5a7] mt-0.5">
              Multiple catalog records share this barcode! Please review product codes in inventory to prevent cashier confusion.
            </p>
          </div>
        </div>
      )}

      {/* Lookup Result Card */}
      {matchedProduct && (
        <div className="p-6 rounded-2xl bg-[#0a2224] border border-[#007f87]/50 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#143d41]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#007f87]/20 border border-[#007f87]/40 text-[#d4f1f4] flex items-center justify-center shrink-0">
                {matchedProduct.type === 'book' ? (
                  <BookOpen className="w-6 h-6" />
                ) : (
                  <PenTool className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#f2fbfa]">{matchedProduct.name}</h3>
                  <Badge variant={matchedProduct.type === 'book' ? 'primary' : 'info'} size="sm">
                    {matchedProduct.type === 'book' ? 'Textbook' : 'Stationery'}
                  </Badge>
                </div>
                <p className="text-xs text-[#8da5a7] mt-0.5">
                  Category: <span className="text-[#d4f1f4]">{matchedProduct.category}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-[#d4f1f4]">
                PKR {matchedProduct.sellingPrice.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#59787a]">
                Cost: PKR {matchedProduct.purchasePrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-[#07181a] border border-[#143d41]">
              <span className="text-[#59787a] block">Scanned Barcode:</span>
              <span className="font-mono font-semibold text-[#f2fbfa]">{matchedProduct.barcode}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#07181a] border border-[#143d41]">
              <span className="text-[#59787a] block">
                {matchedProduct.type === 'book' ? 'ISBN Code:' : 'SKU Reference:'}
              </span>
              <span className="font-mono font-semibold text-[#d4f1f4]">
                {matchedProduct.type === 'book' ? matchedProduct.isbn : matchedProduct.sku}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#07181a] border border-[#143d41]">
              <span className="text-[#59787a] block">Available Stock:</span>
              <span
                className={`font-bold text-sm ${
                  matchedProduct.quantity === 0
                    ? 'text-[#f43f5e]'
                    : matchedProduct.quantity <= matchedProduct.minStockThreshold
                    ? 'text-[#f59e0b]'
                    : 'text-[#10b981]'
                }`}
              >
                {matchedProduct.quantity}{' '}
                {matchedProduct.type === 'stationery' ? matchedProduct.unitOfMeasure : 'units'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#07181a] border border-[#143d41]">
              <span className="text-[#59787a] block">Item Status:</span>
              <span className="capitalize font-semibold text-[#10b981]">
                {matchedProduct.status}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Edit3 className="w-4 h-4" />}
              onClick={() =>
                navigate(
                  matchedProduct.type === 'book' ? '/catalog/books' : '/catalog/stationery'
                )
              }
            >
              Edit in Catalog
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<ShoppingCart className="w-4 h-4" />}
              onClick={handleQuickAddToCart}
              disabled={matchedProduct.quantity <= 0}
            >
              Add to POS Cart
            </Button>
          </div>
        </div>
      )}

      {/* Unknown Barcode Feedback */}
      {hasSearched && !matchedProduct && (
        <div className="p-8 rounded-2xl bg-[#0a2224] border border-[#f43f5e]/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#f43f5e]/15 text-[#f43f5e] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#f2fbfa]">Barcode Not Found in Catalog</h3>
            <p className="text-xs text-[#8da5a7] max-w-sm mx-auto mt-1">
              No product matches barcode <span className="font-mono text-[#f43f5e]">"{barcodeInput}"</span>. You can register it as a new book or stationery product now.
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="primary" size="sm" onClick={() => navigate('/catalog/books')}>
              Register as New Book
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/catalog/stationery')}>
              Register as Stationery
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
