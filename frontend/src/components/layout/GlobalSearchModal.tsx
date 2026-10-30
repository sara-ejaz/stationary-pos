import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Package, FileText, Users, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { products, transactions, suppliers } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return { products: [], transactions: [], suppliers: [] };
    const q = query.toLowerCase();

    const matchedProds = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          (p.type === 'book' && (p.isbn.includes(q) || p.author.toLowerCase().includes(q))) ||
          (p.type === 'stationery' && (p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)))
      )
      .slice(0, 5);

    const matchedTxs = transactions
      .filter(
        (t) =>
          t.invoiceNumber.toLowerCase().includes(q) ||
          (t.customerName && t.customerName.toLowerCase().includes(q))
      )
      .slice(0, 3);

    const matchedSups = suppliers
      .filter(
        (s) =>
          s.companyName.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          s.phone.includes(q)
      )
      .slice(0, 3);

    return {
      products: matchedProds,
      transactions: matchedTxs,
      suppliers: matchedSups
    };
  }, [query, products, transactions, suppliers]);

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Search & Quick Lookup" maxWidth="2xl">
      <div className="space-y-4">
        {/* Search input with live icon */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-[#007f87]" />
          <input
            autoFocus
            type="text"
            className="w-full bg-[#07181a] border border-[#143d41] rounded-lg pl-11 pr-4 py-2.5 text-sm text-[#f2fbfa] placeholder-[#59787a] focus:outline-none focus:border-[#007f87] focus:ring-1 focus:ring-[#007f87]"
            placeholder="Type product name, ISBN, barcode, invoice #, supplier..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results Container */}
        <div className="max-h-80 overflow-y-auto space-y-4 pt-1">
          {query.trim() === '' ? (
            <div className="p-4 text-center text-xs text-[#59787a]">
              Type a keyword to instantly find products, textbooks, stationery, customer invoices, or suppliers.
            </div>
          ) : (
            <>
              {/* Product Matches */}
              {results.products.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#8da5a7] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#007f87]" /> Products & Books ({results.products.length})
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(p.type === 'book' ? '/catalog/books' : '/catalog/stationery')}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#07181a] border border-[#143d41]/60 hover:border-[#007f87] hover:bg-[#003d40]/30 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-[#007f87]" />
                          <div>
                            <p className="font-medium text-[#f2fbfa]">{p.name}</p>
                            <p className="text-[10px] text-[#59787a]">
                              Barcode: {p.barcode} • Category: {p.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-[#d4f1f4]">PKR {p.sellingPrice}</span>
                          <p className="text-[10px] text-[#8da5a7]">Stock: {p.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions Matches */}
              {results.transactions.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#8da5a7] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#10b981]" /> Sales Transactions ({results.transactions.length})
                  </div>
                  <div className="space-y-1">
                    {results.transactions.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect('/transactions')}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#07181a] border border-[#143d41]/60 hover:border-[#007f87] hover:bg-[#003d40]/30 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#10b981]" />
                          <div>
                            <p className="font-medium text-[#f2fbfa]">{t.invoiceNumber}</p>
                            <p className="text-[10px] text-[#59787a]">
                              {t.customerName || 'Walk-in Customer'} • {t.timestamp}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-[#d4f1f4]">PKR {t.totalAmount}</span>
                          <p className="text-[10px] text-[#8da5a7]">{t.paymentMethod}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Supplier Matches */}
              {results.suppliers.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#8da5a7] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#f59e0b]" /> Suppliers ({results.suppliers.length})
                  </div>
                  <div className="space-y-1">
                    {results.suppliers.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelect('/purchasing/suppliers')}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#07181a] border border-[#143d41]/60 hover:border-[#007f87] hover:bg-[#003d40]/30 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4 text-[#f59e0b]" />
                          <div>
                            <p className="font-medium text-[#f2fbfa]">{s.companyName}</p>
                            <p className="text-[10px] text-[#59787a]">
                              Contact: {s.contactPerson} • {s.phone}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#59787a]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length === 0 &&
                results.transactions.length === 0 &&
                results.suppliers.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#59787a]">
                    No matches found for "{query}".
                  </div>
                )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="pt-3 border-t border-[#143d41] flex items-center justify-between text-[11px] text-[#59787a]">
          <span>Tip: Press ESC to dismiss</span>
          <div className="flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#143d41] text-[#d4f1f4]">Enter</kbd>
            <span>to open item</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
