import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  Category,
  Product,
  Book,
  StationeryItem,
  Supplier,
  PurchaseOrder,
  Transaction,
  StockMovement,
  StaffUser,
  AuditLog,
  StoreSettings,
  DamagedOrObsoleteRecord,
  SalesReturn,
  PurchaseReturn
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialSuppliers,
  initialPurchases,
  initialTransactions,
  initialStockMovements,
  initialDamagedRecords,
  initialSalesReturns,
  initialStaff,
  initialAuditLogs,
  initialSettings
} from '../services/api/mockData';

interface StoreContextType {
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'productCount'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  toggleCategoryStatus: (id: string) => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Book, 'id' | 'createdAt'> | Omit<StationeryItem, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  markProductObsolete: (id: string, reason: string) => void;
  deleteProduct: (id: string) => void;

  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalPurchases'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;

  // Purchases
  purchases: PurchaseOrder[];
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'referenceNumber'>) => PurchaseOrder;
  receivePurchaseOrder: (id: string, receivedBy: string) => boolean;

  // Transactions & Sales
  transactions: Transaction[];
  createTransaction: (sale: Omit<Transaction, 'id' | 'invoiceNumber' | 'timestamp'>) => Transaction;

  // Returns
  salesReturns: SalesReturn[];
  processSalesReturn: (
    invoiceNumber: string,
    itemsToReturn: { productId: string; quantity: number; condition: 'restockable' | 'damaged'; reason: string }[],
    cashierName: string
  ) => SalesReturn | null;
  purchaseReturns: PurchaseReturn[];
  processPurchaseReturn: (
    purchaseRef: string,
    itemsToReturn: { productId: string; quantity: number; reason: string }[],
    user: string
  ) => PurchaseReturn | null;

  // Inventory & Stock adjustments
  stockMovements: StockMovement[];
  damagedRecords: DamagedOrObsoleteRecord[];
  adjustStock: (productId: string, newQuantity: number, reason: string, user: string) => void;
  recordDamage: (productId: string, quantity: number, reason: string, type: 'damaged' | 'obsolete', user: string) => void;

  // Staff
  staff: StaffUser[];
  addStaff: (user: Omit<StaffUser, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<StaffUser>) => void;
  toggleStaffStatus: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (action: string, recordType: AuditLog['recordType'], reference: string, details: string, user?: string) => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;

  // Backup & Restore
  exportBackupData: () => string;
  restoreBackupData: (jsonData: string) => boolean;
  resetDemoData: () => void;
}

const STORAGE_KEY = 'foji_pos_store_v1';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage or fall back to mockData
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_categories`);
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_purchases`);
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_movements`);
    return saved ? JSON.parse(saved) : initialStockMovements;
  });

  const [damagedRecords, setDamagedRecords] = useState<DamagedOrObsoleteRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_damaged`);
    return saved ? JSON.parse(saved) : initialDamagedRecords;
  });

  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sales_returns`);
    return saved ? JSON.parse(saved) : initialSalesReturns;
  });

  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_purchase_returns`);
    return saved ? JSON.parse(saved) : [];
  });

  const [staff, setStaff] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_staff`);
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_categories`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_purchases`, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_movements`, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_damaged`, JSON.stringify(damagedRecords));
  }, [damagedRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sales_returns`, JSON.stringify(salesReturns));
  }, [salesReturns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_purchase_returns`, JSON.stringify(purchaseReturns));
  }, [purchaseReturns]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_staff`, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  // Recalculate category product counts dynamically
  useEffect(() => {
    setCategories((prevCats) =>
      prevCats.map((cat) => ({
        ...cat,
        productCount: products.filter((p) => p.category === cat.name && p.status === 'active').length
      }))
    );
  }, [products]);

  const addAuditLog = useCallback((
    action: string,
    recordType: AuditLog['recordType'],
    reference: string,
    details: string,
    user: string = 'Current Staff'
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user,
      action,
      recordType,
      recordReference: reference,
      timestamp: new Date().toLocaleString('en-GB'),
      details
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, []);

  // Category Actions
  const addCategory = (categoryData: Omit<Category, 'id' | 'productCount'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      productCount: 0
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('CATEGORY_CREATED', 'Category', newCat.name, `Added category: ${newCat.name}`);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addAuditLog('CATEGORY_UPDATED', 'Category', id, `Updated category details for ${id}`);
  };

  const toggleCategoryStatus = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newStatus = c.status === 'active' ? 'inactive' : 'active';
          addAuditLog('CATEGORY_STATUS_TOGGLED', 'Category', c.name, `Changed status to ${newStatus}`);
          return { ...c, status: newStatus };
        }
        return c;
      })
    );
  };

  // Product Actions
  const addProduct = (prodData: Omit<Book, 'id' | 'createdAt'> | Omit<StationeryItem, 'id' | 'createdAt'>): Product => {
    const newProd = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    } as Product;

    setProducts((prev) => [newProd, ...prev]);

    // Initial stock movement if quantity > 0
    if (newProd.quantity > 0) {
      const movement: StockMovement = {
        id: `sm-${Date.now()}`,
        productId: newProd.id,
        productName: newProd.name,
        type: 'Manual Adjustment',
        quantityChange: newProd.quantity,
        previousQuantity: 0,
        resultingQuantity: newProd.quantity,
        referenceId: 'INIT-STOCK',
        timestamp: new Date().toLocaleString('en-GB'),
        responsibleUser: 'Admin Staff',
        reason: 'Initial stock intake upon product catalog creation'
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    addAuditLog('PRODUCT_CREATED', 'Product', newProd.barcode, `Added ${newProd.type}: ${newProd.name} (PKR ${newProd.sellingPrice})`);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates } as Product;
          addAuditLog('PRODUCT_UPDATED', 'Product', updated.barcode, `Updated details for ${updated.name}`);
          return updated;
        }
        return p;
      })
    );
  };

  const markProductObsolete = (id: string, reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          addAuditLog('PRODUCT_MARKED_OBSOLETE', 'Product', p.barcode, `Marked ${p.name} as obsolete: ${reason}`);
          return { ...p, status: 'obsolete' };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        addAuditLog('PRODUCT_DELETED', 'Product', target.barcode, `Deactivated/Removed product ${target.name}`);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  // Supplier Actions
  const addSupplier = (supData: Omit<Supplier, 'id' | 'totalPurchases'>) => {
    const newSup: Supplier = {
      ...supData,
      id: `SUP-${Date.now().toString().slice(-4)}`,
      totalPurchases: 0
    };
    setSuppliers((prev) => [...prev, newSup]);
    addAuditLog('SUPPLIER_CREATED', 'System', newSup.id, `Created supplier ${newSup.companyName}`);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    addAuditLog('SUPPLIER_UPDATED', 'System', id, `Updated supplier ${id}`);
  };

  // Purchase Actions
  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'referenceNumber'>): PurchaseOrder => {
    const refNum = `PO-2026-${String(purchases.length + 1).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: refNum,
      referenceNumber: refNum
    };
    setPurchases((prev) => [newPO, ...prev]);
    addAuditLog('PURCHASE_ORDER_CREATED', 'Purchase', refNum, `Drafted PO for ${newPO.supplierName} (PKR ${newPO.totalAmount})`);
    return newPO;
  };

  const receivePurchaseOrder = (id: string, receivedBy: string): boolean => {
    const po = purchases.find((p) => p.id === id);
    if (!po || po.status === 'received') return false;

    // Update PO status
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: 'received', receivedDate: new Date().toISOString().split('T')[0] }
          : p
      )
    );

    // Update supplier total purchase volume
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === po.supplierId
          ? { ...s, totalPurchases: s.totalPurchases + po.totalAmount }
          : s
      )
    );

    // Increase product quantities and create stock movements
    const timestamp = new Date().toLocaleString('en-GB');
    const newMovements: StockMovement[] = [];

    setProducts((prevProds) =>
      prevProds.map((prod) => {
        const item = po.items.find((i) => i.productId === prod.id);
        if (item) {
          const oldQty = prod.quantity;
          const newQty = oldQty + item.quantity;
          newMovements.push({
            id: `sm-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            type: 'Purchase',
            quantityChange: item.quantity,
            previousQuantity: oldQty,
            resultingQuantity: newQty,
            referenceId: po.referenceNumber,
            timestamp,
            responsibleUser: receivedBy,
            reason: `Stock receipt against PO ${po.referenceNumber} from ${po.supplierName}`
          });
          return { ...prod, quantity: newQty };
        }
        return prod;
      })
    );

    setStockMovements((prev) => [...newMovements, ...prev]);
    addAuditLog('PURCHASE_RECEIVED', 'Purchase', po.referenceNumber, `Stock received and inventoried for PO ${po.referenceNumber}`, receivedBy);
    return true;
  };

  // Point of Sale Transaction Execution
  const createTransaction = (saleData: Omit<Transaction, 'id' | 'invoiceNumber' | 'timestamp'>): Transaction => {
    const nextNum = transactions.length + 1;
    const invNum = `INV-2026-${String(nextNum).padStart(4, '0')}`;
    const timestamp = new Date().toLocaleString('en-GB');

    const newTx: Transaction = {
      ...saleData,
      id: `tx-${Date.now()}`,
      invoiceNumber: invNum,
      timestamp
    };

    // 1. Save Transaction record
    setTransactions((prev) => [newTx, ...prev]);

    // 2. Decrement Product Stock and log stock movements
    const movements: StockMovement[] = [];
    setProducts((prevProds) =>
      prevProds.map((prod) => {
        const item = saleData.items.find((i) => i.productId === prod.id);
        if (item) {
          const oldQty = prod.quantity;
          const newQty = Math.max(0, oldQty - item.quantity);
          movements.push({
            id: `sm-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            type: 'Sale',
            quantityChange: -item.quantity,
            previousQuantity: oldQty,
            resultingQuantity: newQty,
            referenceId: invNum,
            timestamp,
            responsibleUser: saleData.cashierName,
            reason: `POS Sale to ${saleData.customerName || 'Walk-in Customer'}`
          });
          return { ...prod, quantity: newQty };
        }
        return prod;
      })
    );

    setStockMovements((prev) => [...movements, ...prev]);
    addAuditLog('COMPLETED_SALE', 'Sale', invNum, `Sale completed: PKR ${newTx.totalAmount} via ${newTx.paymentMethod}`, saleData.cashierName);

    return newTx;
  };

  // Sales Returns
  const processSalesReturn = (
    invoiceNumber: string,
    itemsToReturn: { productId: string; quantity: number; condition: 'restockable' | 'damaged'; reason: string }[],
    cashierName: string
  ): SalesReturn | null => {
    const originalTx = transactions.find((t) => t.invoiceNumber === invoiceNumber);
    if (!originalTx) return null;

    const timestamp = new Date().toLocaleString('en-GB');
    const returnRef = `RET-2026-${String(salesReturns.length + 1).padStart(3, '0')}`;

    let totalRefund = 0;
    const returnItemsFormatted = itemsToReturn.map((item) => {
      const origItem = originalTx.items.find((i) => i.productId === item.productId);
      const unitPrice = origItem ? origItem.unitPrice : 0;
      const refund = unitPrice * item.quantity;
      totalRefund += refund;

      return {
        productId: item.productId,
        productName: origItem ? origItem.productName : 'Product',
        quantity: item.quantity,
        unitPrice,
        refundAmount: refund,
        condition: item.condition,
        reason: item.reason
      };
    });

    const newReturn: SalesReturn = {
      id: `ret-${Date.now()}`,
      returnReference: returnRef,
      originalInvoiceNumber: invoiceNumber,
      timestamp,
      cashierName,
      items: returnItemsFormatted,
      totalRefundAmount: totalRefund
    };

    setSalesReturns((prev) => [newReturn, ...prev]);

    // Update original transaction status
    setTransactions((prev) =>
      prev.map((t) =>
        t.invoiceNumber === invoiceNumber
          ? { ...t, status: totalRefund >= t.totalAmount ? 'refunded' : 'partially_refunded' }
          : t
      )
    );

    // If restockable, restore product stock
    const newMovements: StockMovement[] = [];
    setProducts((prevProds) =>
      prevProds.map((prod) => {
        const returned = itemsToReturn.find((i) => i.productId === prod.id);
        if (returned && returned.condition === 'restockable') {
          const oldQty = prod.quantity;
          const newQty = oldQty + returned.quantity;
          newMovements.push({
            id: `sm-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            type: 'Sales Return',
            quantityChange: returned.quantity,
            previousQuantity: oldQty,
            resultingQuantity: newQty,
            referenceId: returnRef,
            timestamp,
            responsibleUser: cashierName,
            reason: `Customer return restocked: ${returned.reason}`
          });
          return { ...prod, quantity: newQty };
        }
        return prod;
      })
    );

    // If damaged, log in damaged records
    itemsToReturn.forEach((item) => {
      if (item.condition === 'damaged') {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          const damRecord: DamagedOrObsoleteRecord = {
            id: `dam-${Date.now()}-${item.productId}`,
            productId: prod.id,
            productName: prod.name,
            barcode: prod.barcode,
            type: 'damaged',
            quantity: item.quantity,
            reason: `Returned by customer as damaged: ${item.reason}`,
            recordedBy: cashierName,
            date: new Date().toISOString().split('T')[0],
            status: 'written_off'
          };
          setDamagedRecords((prev) => [damRecord, ...prev]);
        }
      }
    });

    if (newMovements.length > 0) {
      setStockMovements((prev) => [...newMovements, ...prev]);
    }

    addAuditLog('SALES_RETURN_PROCESSED', 'Sale', returnRef, `Processed return for ${invoiceNumber}: Refund PKR ${totalRefund}`, cashierName);
    return newReturn;
  };

  // Purchase Returns
  const processPurchaseReturn = (
    purchaseRef: string,
    itemsToReturn: { productId: string; quantity: number; reason: string }[],
    user: string
  ): PurchaseReturn | null => {
    const po = purchases.find((p) => p.referenceNumber === purchaseRef);
    if (!po) return null;

    const returnRef = `PRET-2026-${String(purchaseReturns.length + 1).padStart(3, '0')}`;
    const timestamp = new Date().toLocaleString('en-GB');

    let totalRefund = 0;
    const itemsFormatted = itemsToReturn.map((item) => {
      const poItem = po.items.find((i) => i.productId === item.productId);
      const cost = poItem ? poItem.purchasePrice : 0;
      const sub = cost * item.quantity;
      totalRefund += sub;

      return {
        productId: item.productId,
        productName: poItem ? poItem.productName : 'Product',
        quantity: item.quantity,
        purchasePrice: cost,
        subtotal: sub,
        reason: item.reason
      };
    });

    const newPR: PurchaseReturn = {
      id: `pret-${Date.now()}`,
      returnReference: returnRef,
      originalPurchaseRef: purchaseRef,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      timestamp,
      items: itemsFormatted,
      totalRefundAmount: totalRefund
    };

    setPurchaseReturns((prev) => [newPR, ...prev]);

    // Deduct stock returned to supplier
    const newMovements: StockMovement[] = [];
    setProducts((prevProds) =>
      prevProds.map((prod) => {
        const item = itemsToReturn.find((i) => i.productId === prod.id);
        if (item) {
          const oldQty = prod.quantity;
          const newQty = Math.max(0, oldQty - item.quantity);
          newMovements.push({
            id: `sm-${Date.now()}-${prod.id}`,
            productId: prod.id,
            productName: prod.name,
            type: 'Purchase Return',
            quantityChange: -item.quantity,
            previousQuantity: oldQty,
            resultingQuantity: newQty,
            referenceId: returnRef,
            timestamp,
            responsibleUser: user,
            reason: `Returned to supplier ${po.supplierName}: ${item.reason}`
          });
          return { ...prod, quantity: newQty };
        }
        return prod;
      })
    );

    setStockMovements((prev) => [...newMovements, ...prev]);
    addAuditLog('PURCHASE_RETURN_PROCESSED', 'Purchase', returnRef, `Returned goods to ${po.supplierName}: PKR ${totalRefund}`, user);
    return newPR;
  };

  // Stock Adjustment
  const adjustStock = (productId: string, newQuantity: number, reason: string, user: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const oldQty = prod.quantity;
    const diff = newQuantity - oldQty;
    const timestamp = new Date().toLocaleString('en-GB');

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQuantity } : p))
    );

    const movement: StockMovement = {
      id: `sm-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      type: 'Manual Adjustment',
      quantityChange: diff,
      previousQuantity: oldQty,
      resultingQuantity: newQuantity,
      referenceId: 'ADJ-MANUAL',
      timestamp,
      responsibleUser: user,
      reason
    };

    setStockMovements((prev) => [movement, ...prev]);
    addAuditLog('STOCK_ADJUSTMENT', 'Stock', prod.barcode, `Stock adjusted from ${oldQty} to ${newQuantity} (${reason})`, user);
  };

  // Damaged Record
  const recordDamage = (productId: string, quantity: number, reason: string, type: 'damaged' | 'obsolete', user: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const actualQtyToDeduct = Math.min(prod.quantity, quantity);
    const oldQty = prod.quantity;
    const newQty = oldQty - actualQtyToDeduct;
    const timestamp = new Date().toLocaleString('en-GB');

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: newQty } : p))
    );

    const damRecord: DamagedOrObsoleteRecord = {
      id: `dam-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      barcode: prod.barcode,
      type,
      quantity: actualQtyToDeduct,
      reason,
      recordedBy: user,
      date: new Date().toISOString().split('T')[0],
      status: 'written_off'
    };
    setDamagedRecords((prev) => [damRecord, ...prev]);

    const movement: StockMovement = {
      id: `sm-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      type: 'Damage',
      quantityChange: -actualQtyToDeduct,
      previousQuantity: oldQty,
      resultingQuantity: newQty,
      referenceId: type === 'damaged' ? 'DAM-LOG' : 'OBS-LOG',
      timestamp,
      responsibleUser: user,
      reason: `${type === 'damaged' ? 'Damaged inventory' : 'Obsolete book'} write-off: ${reason}`
    };
    setStockMovements((prev) => [movement, ...prev]);
    addAuditLog('DAMAGE_RECORDED', 'Stock', prod.barcode, `Recorded ${actualQtyToDeduct} items as ${type}: ${reason}`, user);
  };

  // Staff
  const addStaff = (staffData: Omit<StaffUser, 'id'>) => {
    const newUser: StaffUser = {
      ...staffData,
      id: `usr-${Date.now()}`,
      lastLogin: 'Never'
    };
    setStaff((prev) => [...prev, newUser]);
    addAuditLog('STAFF_CREATED', 'Staff', newUser.username, `Created user account for ${newUser.fullName} (${newUser.role})`);
  };

  const updateStaff = (id: string, updates: Partial<StaffUser>) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    addAuditLog('STAFF_UPDATED', 'Staff', id, `Updated staff profile ${id}`);
  };

  const toggleStaffStatus = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus = s.status === 'active' ? 'disabled' : 'active';
          addAuditLog('STAFF_STATUS_TOGGLED', 'Staff', s.username, `Changed status to ${newStatus}`);
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
  };

  // Settings
  const updateSettings = (updates: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    addAuditLog('SETTINGS_UPDATED', 'System', 'StoreConfig', 'Updated store information and POS settings');
  };

  // Backup & Restore Demo Simulation
  const exportBackupData = (): string => {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      store: settings.storeName,
      data: {
        categories,
        products,
        suppliers,
        purchases,
        transactions,
        stockMovements,
        damagedRecords,
        salesReturns,
        purchaseReturns,
        staff,
        auditLogs,
        settings
      }
    };
    addAuditLog('BACKUP_EXPORTED', 'Backup', `BKP-${Date.now()}`, 'Simulated database backup snapshot downloaded');
    return JSON.stringify(backup, null, 2);
  };

  const restoreBackupData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.data) return false;
      const d = parsed.data;
      if (d.categories) setCategories(d.categories);
      if (d.products) setProducts(d.products);
      if (d.suppliers) setSuppliers(d.suppliers);
      if (d.purchases) setPurchases(d.purchases);
      if (d.transactions) setTransactions(d.transactions);
      if (d.stockMovements) setStockMovements(d.stockMovements);
      if (d.damagedRecords) setDamagedRecords(d.damagedRecords);
      if (d.salesReturns) setSalesReturns(d.salesReturns);
      if (d.purchaseReturns) setPurchaseReturns(d.purchaseReturns);
      if (d.staff) setStaff(d.staff);
      if (d.settings) setSettings(d.settings);

      addAuditLog('BACKUP_RESTORED', 'Backup', 'RESTORE_SIMULATION', 'Restored system snapshot from JSON archive');
      return true;
    } catch (e) {
      console.error('Failed to restore backup:', e);
      return false;
    }
  };

  const resetDemoData = () => {
    setCategories(initialCategories);
    setProducts(initialProducts);
    setSuppliers(initialSuppliers);
    setPurchases(initialPurchases);
    setTransactions(initialTransactions);
    setStockMovements(initialStockMovements);
    setDamagedRecords(initialDamagedRecords);
    setSalesReturns(initialSalesReturns);
    setPurchaseReturns([]);
    setStaff(initialStaff);
    setAuditLogs(initialAuditLogs);
    setSettings(initialSettings);
    localStorage.clear();
    addAuditLog('DEMO_RESET', 'System', 'RESET_ALL', 'Reset all demo data to pristine default catalog');
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        addCategory,
        updateCategory,
        toggleCategoryStatus,

        products,
        addProduct,
        updateProduct,
        markProductObsolete,
        deleteProduct,

        suppliers,
        addSupplier,
        updateSupplier,

        purchases,
        createPurchaseOrder,
        receivePurchaseOrder,

        transactions,
        createTransaction,

        salesReturns,
        processSalesReturn,
        purchaseReturns,
        processPurchaseReturn,

        stockMovements,
        damagedRecords,
        adjustStock,
        recordDamage,

        staff,
        addStaff,
        updateStaff,
        toggleStaffStatus,

        auditLogs,
        addAuditLog,

        settings,
        updateSettings,

        exportBackupData,
        restoreBackupData,
        resetDemoData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
