import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';
import { DataTable } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const BooksPage = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form State
  const [title, setTitle] = useState('');
  const [isbn, setIsbn] = useState('');
  const [barcode, setBarcode] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [edition, setEdition] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minStockThreshold, setMinStockThreshold] = useState(5);
  const [status, setStatus] = useState('active');

  const books = useMemo(() => {
    return products.filter((p) => p.type === 'book');
  }, [products]);

  const filteredBooks = useMemo(() => {
    if (categoryFilter === 'all') return books;
    return books.filter((b) => b.category === categoryFilter);
  }, [books, categoryFilter]);

  const openCreateModal = () => {
    setEditingBook(null);
    setTitle('');
    setIsbn('');
    setBarcode('');
    setAuthor('');
    setPublisher('');
    setEdition('');
    setSubject('');
    setCategory(categories[0]?.name || 'Textbooks & Academics');
    setPurchasePrice('');
    setSellingPrice('');
    setQuantity(10);
    setMinStockThreshold(5);
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBook(b);
    setTitle(b.name);
    setIsbn(b.isbn);
    setBarcode(b.barcode);
    setAuthor(b.author);
    setPublisher(b.publisher);
    setEdition(b.edition);
    setSubject(b.subject);
    setCategory(b.category);
    setPurchasePrice(b.purchasePrice);
    setSellingPrice(b.sellingPrice);
    setQuantity(b.quantity);
    setMinStockThreshold(b.minStockThreshold);
    setStatus(b.status);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!title.trim() || !barcode.trim() || !isbn.trim()) {
      toast.error('Validation Error', 'Book Title, Barcode and ISBN are mandatory.');
      return;
    }

    const pPrice = Number(purchasePrice) || 0;
    const sPrice = Number(sellingPrice) || 0;
    const qty = Number(quantity) || 0;
    const minThreshold = Number(minStockThreshold) || 5;

    if (sPrice < pPrice) {
      toast.warning('Margin Warning', 'Selling price is lower than purchase cost. Please verify.');
    }

    if (editingBook) {
      updateProduct(editingBook.id, {
        name: title,
        isbn,
        barcode,
        author,
        publisher,
        edition,
        subject,
        category,
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        quantity: qty,
        minStockThreshold: minThreshold,
        status
      });
      toast.success('Book Updated', `"${title}" has been updated.`);
    } else {
      addProduct({
        type: 'book',
        name: title,
        isbn,
        barcode,
        author,
        publisher,
        edition,
        subject,
        category,
        purchasePrice: pPrice,
        sellingPrice: sPrice,
        quantity: qty,
        minStockThreshold: minThreshold,
        status
      });
      toast.success('Book Added', `"${title}" added to book catalog.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteConfirmId) {
      deleteProduct(deleteConfirmId);
      toast.info('Book Removed', 'Product has been deactivated/removed from catalog.');
      setDeleteConfirmId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Title & Edition',
      sortable: true,
      render: (b) => (
        <div>
          <div className="font-semibold text-slate-900 line-clamp-1">{b.name}</div>
          <div className="text-[11px] text-slate-500">
            {b.edition ? `${b.edition} • ` : ''}
            {b.author}
          </div>
        </div>
      )
    },
    {
      key: 'isbn',
      header: 'ISBN / Barcode',
      render: (b) => (
        <div className="font-mono text-xs">
          <div className="text-[#007f87] font-semibold">{b.isbn}</div>
          <div className="text-[10px] text-slate-400">{b.barcode}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Subject & Category',
      sortable: true,
      render: (b) => (
        <div>
          <span className="text-xs text-slate-800 font-medium">{b.category}</span>
          <div className="text-[10px] text-slate-500">{b.subject || b.publisher}</div>
        </div>
      )
    },
    {
      key: 'sellingPrice',
      header: 'Price (PKR)',
      sortable: true,
      render: (b) => (
        <div>
          <div className="font-bold text-slate-900">PKR {b.sellingPrice.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500">Cost: PKR {b.purchasePrice.toLocaleString()}</div>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Stock Status',
      sortable: true,
      render: (b) => {
        let badgeVariant = 'success';
        let label = `${b.quantity} in stock`;

        if (b.quantity === 0) {
          badgeVariant = 'danger';
          label = 'Out of Stock';
        } else if (b.quantity <= b.minStockThreshold) {
          badgeVariant = 'warning';
          label = `Low (${b.quantity} left)`;
        }

        return <Badge variant={badgeVariant} size="sm">{label}</Badge>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (b) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(b);
            }}
            title="Edit Book"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirmId(b.id);
            }}
            className="text-rose-600 hover:bg-rose-50"
            title="Delete Book"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#007f87]" />
            <span>Books & Academic Catalog</span>
          </h2>
          <p className="text-xs text-slate-500">
            O/A Levels, Federal & Punjab Boards, Oxford curriculum, literature & Islamic books.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={openCreateModal}>
          Add New Book
        </Button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-700">Category Filter:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#007f87]"
        >
          <option value="all">All Academic & Book Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Books DataTable */}
      <DataTable
        columns={columns}
        data={filteredBooks}
        searchPlaceholder="Search title, ISBN, author, barcode..."
        searchKeys={['name', 'isbn', 'barcode', 'author', 'publisher', 'subject']}
      />

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Book Details' : 'Add New Book to Catalog'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Book Title"
                placeholder="e.g. Oxford Progressive English Book 8"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <Input
              label="ISBN (International Standard Book Number)"
              placeholder="e.g. 978-0-19-906045-0"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
            />

            <Input
              label="Barcode (EAN-13 / Scanner Code)"
              placeholder="e.g. 9780199060450"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              required
            />

            <Input
              label="Author(s)"
              placeholder="e.g. Rachel Redford"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />

            <Input
              label="Publisher"
              placeholder="e.g. Oxford University Press, PCTB"
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />

            <Input
              label="Edition / Version"
              placeholder="e.g. 3rd Edition (2025 Reprint)"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
            />

            <Input
              label="Subject / Domain"
              placeholder="e.g. English Literature, Physics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#007f87]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#007f87]"
              >
                <option value="active">Active (Available for Sale)</option>
                <option value="inactive">Inactive (Temporarily Hidden)</option>
                <option value="obsolete">Obsolete (Old Syllabus)</option>
              </select>
            </div>

            <Input
              label="Purchase Cost Price (PKR)"
              type="number"
              placeholder="e.g. 950"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
            />

            <Input
              label="Selling Retail Price (PKR)"
              type="number"
              placeholder="e.g. 1250"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              required
            />

            <Input
              label="Current Initial Stock Quantity"
              type="number"
              placeholder="e.g. 25"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            <Input
              label="Low Stock Alert Threshold"
              type="number"
              placeholder="e.g. 5"
              value={minStockThreshold}
              onChange={(e) => setMinStockThreshold(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              {editingBook ? 'Save Changes' : 'Add Book to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Confirm Book Removal"
        message="Are you sure you want to remove this book from the active catalog? This will deactivate the product record."
        confirmText="Remove Product"
      />
    </div>
  );
};
export default BooksPage;
