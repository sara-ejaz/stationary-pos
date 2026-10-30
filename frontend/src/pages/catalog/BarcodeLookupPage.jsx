import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Barcode, Search, AlertCircle, ShoppingCart, Edit3, BookOpen, PenTool } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const BarcodeLookupPage = () => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [matchedProduct, setMatchedProduct] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDuplicateDetected, setIsDuplicateDetected] = useState(false);

  const inputRef = useRef(null);
  const { products } = useStore();
  const { addToCart } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  // Focus input automatically on mount for fast scanning
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleLookup = (codeToSearch) => {
    const trimmed = (codeToSearch || '').trim();
    if (!trimmed) return;

    setHasSearched(true);

    // Exact barcode match first
    const exactMatches = products.filter(
      (p) =>
        p.barcode?.toLowerCase() === trimmed.toLowerCase() ||
        (p.type === 'book' && p.isbn?.replace(/-/g, '') === trimmed.replace(/-/g, '')) ||
        (p.type === 'stationery' && p.sku?.toLowerCase() === trimmed.toLowerCase())
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

  const handleKeyDown = (e) => {
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
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Barcode className="w-6 h-6 text-[#007f87]" />
          <span>Barcode & Product Lookup Terminal</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan any physical book or stationery item with your barcode scanner or enter ISBN / SKU manually.
        </p>
      </div>

      {/* Scanner Input Panel */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          Scan Barcode or Type Code
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Barcode className="w-5 h-5 absolute left-3.5 top-3 text-[#007f87]" />
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-4 py-3 text-base text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-[#007f87] focus:ring-2 focus:ring-[#007f87]/20"
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
          <span className="text-slate-500">Test Demo Scans:</span>
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
              className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-[#007f87] hover:border-[#007f87] transition font-mono text-[11px] cursor-pointer"
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duplicate Barcode Warning Alert */}
      {isDuplicateDetected && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">Duplicate Barcode Warning</p>
            <p className="text-amber-700 mt-0.5">
              Multiple catalog records share this barcode! Please review product codes in inventory to prevent cashier confusion.
            </p>
          </div>
        </div>
      )}

      {/* Lookup Result Card */}
      {matchedProduct && (
        <div className="p-6 rounded-2xl bg-white border border-teal-200 shadow-md space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-[#007f87] flex items-center justify-center shrink-0">
                {matchedProduct.type === 'book' ? (
                  <BookOpen className="w-6 h-6" />
                ) : (
                  <PenTool className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{matchedProduct.name}</h3>
                  <Badge variant={matchedProduct.type === 'book' ? 'primary' : 'info'} size="sm">
                    {matchedProduct.type === 'book' ? 'Textbook' : 'Stationery'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Category: <span className="text-[#007f87] font-semibold">{matchedProduct.category}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-[#007f87]">
                PKR {matchedProduct.sellingPrice?.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500">
                Cost: PKR {matchedProduct.purchasePrice?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Scanned Barcode:</span>
              <span className="font-mono font-semibold text-slate-900">{matchedProduct.barcode}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">
                {matchedProduct.type === 'book' ? 'ISBN Code:' : 'SKU Reference:'}
              </span>
              <span className="font-mono font-semibold text-[#007f87]">
                {matchedProduct.type === 'book' ? matchedProduct.isbn : matchedProduct.sku}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Available Stock:</span>
              <span
                className={`font-bold text-sm ${
                  matchedProduct.quantity === 0
                    ? 'text-rose-600'
                    : matchedProduct.quantity <= matchedProduct.minStockThreshold
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {matchedProduct.quantity}{' '}
                {matchedProduct.type === 'stationery' ? matchedProduct.unitOfMeasure : 'units'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Item Status:</span>
              <span className="capitalize font-semibold text-emerald-600">
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
        <div className="p-8 rounded-2xl bg-white border border-rose-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Barcode Not Found in Catalog</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
              No product matches barcode <span className="font-mono text-rose-600 font-bold">"{barcodeInput}"</span>. You can register it as a new book or stationery product now.
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
export default BarcodeLookupPage;
