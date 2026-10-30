import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Package, Users, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Modal } from '../common/Modal';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
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
          (p.type === 'book' && (p.isbn?.includes(q) || p.author?.toLowerCase().includes(q))) ||
          (p.type === 'stationery' && (p.sku?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)))
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

  const handleSelect = (path) => {
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
            className="w-full bg-white border border-slate-300 rounded-lg pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#007f87] focus:ring-2 focus:ring-[#007f87]/20"
            placeholder="Type product name, ISBN, barcode, invoice #, supplier..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results Container */}
        <div className="max-h-80 overflow-y-auto space-y-4 pt-1">
          {query.trim() === '' ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Type a keyword to instantly find products, textbooks, stationery, customer invoices, or suppliers.
            </div>
          ) : (
            <>
              {/* Product Matches */}
              {results.products.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#007f87]" /> Products & Books ({results.products.length})
                  </div>
                  <div className="space-y-1">
                    {results.products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect(p.type === 'book' ? '/catalog/books' : '/catalog/stationery')}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#007f87] hover:bg-teal-50/50 cursor-pointer transition text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="w-4 h-4 text-[#007f87]" />
                          <div>
                            <div className="font-semibold text-slate-900">{p.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Barcode: {p.barcode} • PKR {p.sellingPrice.toLocaleString()} • Qty: {p.quantity}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions Matches */}
              {results.transactions.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#007f87]" /> Sales Invoices ({results.transactions.length})
                  </div>
                  <div className="space-y-1">
                    {results.transactions.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelect('/transactions')}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#007f87] hover:bg-teal-50/50 cursor-pointer transition text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{t.invoiceNumber}</div>
                          <div className="text-[10px] text-slate-500">
                            Customer: {t.customerName || 'Walk-in'} • PKR {t.totalAmount.toLocaleString()} • {t.timestamp}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suppliers Matches */}
              {results.suppliers.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#007f87]" /> Suppliers & Publishers ({results.suppliers.length})
                  </div>
                  <div className="space-y-1">
                    {results.suppliers.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelect('/purchasing/suppliers')}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-[#007f87] hover:bg-teal-50/50 cursor-pointer transition text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">{s.companyName}</div>
                          <div className="text-[10px] text-slate-500">
                            {s.contactPerson} • {s.phone} • {s.city}
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.products.length === 0 &&
                results.transactions.length === 0 &&
                results.suppliers.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No matching records found for "{query}".
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
export default GlobalSearchModal;
