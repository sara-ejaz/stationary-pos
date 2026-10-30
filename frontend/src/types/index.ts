// Core TypeScript Definitions for Foji Book Center POS

export type Role = 'Admin' | 'Cashier' | 'Inventory Staff';

export type ProductType = 'book' | 'stationery';

export type ProductStatus = 'active' | 'inactive' | 'obsolete';

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string; // For subcategory support
  status: 'active' | 'inactive';
  productCount?: number;
}

export interface BaseProduct {
  id: string;
  type: ProductType;
  name: string;
  barcode: string;
  category: string;
  purchasePrice: number; // in PKR
  sellingPrice: number;  // in PKR
  quantity: number;
  minStockThreshold: number;
  status: ProductStatus;
  createdAt: string;
}

export interface Book extends BaseProduct {
  type: 'book';
  isbn: string;
  author: string;
  publisher: string;
  edition: string;
  subject: string;
}

export interface StationeryItem extends BaseProduct {
  type: 'stationery';
  sku: string;
  brand: string;
  unitOfMeasure: 'pcs' | 'pack' | 'box' | 'set' | 'dozen';
  supplierReference?: string;
}

export type Product = Book | StationeryItem;

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
  suppliedCategories: string[];
  totalPurchases: number; // in PKR
}

export type PurchaseStatus = 'pending' | 'received' | 'cancelled';

export interface PurchaseItem {
  productId: string;
  productName: string;
  barcode: string;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  referenceNumber: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  totalAmount: number; // in PKR
  status: PurchaseStatus;
  receivedDate?: string;
  notes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number; // individual item discount in PKR
  subtotal: number;
}

export type PaymentMethod = 'Cash' | 'Card' | 'EasyPaisa' | 'JazzCash' | 'Bank Transfer';

export interface TransactionItem {
  productId: string;
  productName: string;
  barcode: string;
  category: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  cashierName: string;
  customerName?: string;
  customerPhone?: string;
  items: TransactionItem[];
  subtotal: number;
  overallDiscount: number;
  taxAmount: number;
  totalAmount: number; // in PKR
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeDue: number;
  status: 'completed' | 'refunded' | 'partially_refunded';
  notes?: string;
}

export type StockMovementType = 'Sale' | 'Purchase' | 'Sales Return' | 'Purchase Return' | 'Damage' | 'Manual Adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityChange: number; // positive or negative
  previousQuantity: number;
  resultingQuantity: number;
  referenceId: string; // e.g. INV-2026-001 or PO-2026-002
  timestamp: string;
  responsibleUser: string;
  reason: string;
}

export interface DamagedOrObsoleteRecord {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  type: 'damaged' | 'obsolete';
  quantity: number;
  reason: string;
  recordedBy: string;
  date: string;
  status: 'written_off' | 'pending_inspection';
}

export interface SalesReturn {
  id: string;
  returnReference: string;
  originalInvoiceNumber: string;
  timestamp: string;
  cashierName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    refundAmount: number;
    condition: 'restockable' | 'damaged';
    reason: string;
  }[];
  totalRefundAmount: number; // in PKR
}

export interface PurchaseReturn {
  id: string;
  returnReference: string;
  originalPurchaseRef: string;
  supplierId: string;
  supplierName: string;
  timestamp: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    purchasePrice: number;
    subtotal: number;
    reason: string;
  }[];
  totalRefundAmount: number;
}

export interface StaffUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  status: 'active' | 'disabled';
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  recordType: 'Product' | 'Category' | 'Sale' | 'Purchase' | 'Stock' | 'Staff' | 'Backup' | 'System';
  recordReference: string;
  timestamp: string;
  details: string;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  address: string;
  phone: string;
  ntn: string;
  currency: string;
  receiptHeader: string;
  receiptFooter: string;
  taxRatePercent: number;
  language: 'en' | 'ur' | 'ar';
}
