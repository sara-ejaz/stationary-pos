import { 
  Category, 
  Product, 
  Supplier, 
  PurchaseOrder, 
  Transaction, 
  StockMovement, 
  StaffUser, 
  AuditLog, 
  StoreSettings,
  DamagedOrObsoleteRecord,
  SalesReturn
} from '../../types';

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Textbooks & Academics', description: 'Curriculum, O/A Levels, Matric & College books', status: 'active', productCount: 4 },
  { id: 'cat-2', name: 'General Fiction & Urdu', description: 'Urdu literature, novels, and contemporary titles', status: 'active', productCount: 2 },
  { id: 'cat-3', name: 'Writing Instruments', description: 'Ballpoints, gel pens, fountain pens, markers & highlighters', status: 'active', productCount: 4 },
  { id: 'cat-4', name: 'Notebooks & Registers', description: 'Spiral registers, hardbound ledger notebooks, exam sheets', status: 'active', productCount: 3 },
  { id: 'cat-5', name: 'Art & Craft Supplies', description: 'Acrylic colors, sketchbooks, canvases, brushes', status: 'active', productCount: 2 },
  { id: 'cat-6', name: 'Office & Filing Supplies', description: 'Box files, ring binders, staplers, paperclips', status: 'active', productCount: 2 },
  { id: 'cat-7', name: 'School Essentials', description: 'Geometry boxes, erasers, sharpeners, math instruments', status: 'active', productCount: 2 }
];

export const initialProducts: Product[] = [
  // Books
  {
    id: 'prod-101',
    type: 'book',
    name: 'Oxford Progressive English Book 8',
    barcode: '9780199060450',
    isbn: '978-0-19-906045-0',
    category: 'Textbooks & Academics',
    author: 'Rachel Redford',
    publisher: 'Oxford University Press',
    edition: '3rd Edition',
    subject: 'English Language',
    purchasePrice: 950,
    sellingPrice: 1250,
    quantity: 45,
    minStockThreshold: 10,
    status: 'active',
    createdAt: '2026-01-15'
  },
  {
    id: 'prod-102',
    type: 'book',
    name: 'Cambridge IGCSE Mathematics Extended',
    barcode: '9781108437189',
    isbn: '978-1-108-43718-9',
    category: 'Textbooks & Academics',
    author: 'Karen Morrison, Nick Hamshaw',
    publisher: 'Cambridge University Press',
    edition: '2nd Edition',
    subject: 'Mathematics',
    purchasePrice: 2800,
    sellingPrice: 3450,
    quantity: 8, // Low stock demo
    minStockThreshold: 12,
    status: 'active',
    createdAt: '2026-01-20'
  },
  {
    id: 'prod-103',
    type: 'book',
    name: 'Kulliyat-e-Iqbal (Allama Iqbal)',
    barcode: '9789694160016',
    isbn: '978-969-416-001-6',
    category: 'General Fiction & Urdu',
    author: 'Allama Muhammad Iqbal',
    publisher: 'Iqbal Academy Pakistan',
    edition: 'Deluxe Hardbound',
    subject: 'Urdu Poetry',
    purchasePrice: 1400,
    sellingPrice: 1950,
    quantity: 18,
    minStockThreshold: 5,
    status: 'active',
    createdAt: '2026-01-25'
  },
  {
    id: 'prod-104',
    type: 'book',
    name: 'Punjab Textbook Chemistry 9th Class',
    barcode: '9789695031128',
    isbn: '978-969-503-112-8',
    category: 'Textbooks & Academics',
    author: 'PCTB Board Panel',
    publisher: 'Punjab Curriculum & Textbook Board',
    edition: 'Revised 2025',
    subject: 'Chemistry',
    purchasePrice: 160,
    sellingPrice: 210,
    quantity: 0, // Out of stock demo
    minStockThreshold: 20,
    status: 'active',
    createdAt: '2026-02-01'
  },
  {
    id: 'prod-105',
    type: 'book',
    name: 'Peer-e-Kamil (S.A.W)',
    barcode: '9789693521234',
    isbn: '978-969-35-2123-4',
    category: 'General Fiction & Urdu',
    author: 'Umera Ahmed',
    publisher: 'Ilm-o-Irfan Publishers',
    edition: 'Standard Edition',
    subject: 'Urdu Novel',
    purchasePrice: 850,
    sellingPrice: 1200,
    quantity: 24,
    minStockThreshold: 8,
    status: 'active',
    createdAt: '2026-02-05'
  },
  {
    id: 'prod-106',
    type: 'book',
    name: 'Federal Board Physics for Class 10',
    barcode: '9789690025110',
    isbn: '978-969-00-2511-0',
    category: 'Textbooks & Academics',
    author: 'National Book Foundation',
    publisher: 'National Book Foundation',
    edition: 'National Curriculum Ed.',
    subject: 'Physics',
    purchasePrice: 220,
    sellingPrice: 280,
    quantity: 3, // Low stock demo
    minStockThreshold: 15,
    status: 'active',
    createdAt: '2026-02-10'
  },

  // Stationery
  {
    id: 'prod-201',
    type: 'stationery',
    name: 'Piano Point 0.8mm Ballpoint (Box of 10)',
    barcode: '8964000100124',
    sku: 'STA-PIA-08-BOX',
    brand: 'Piano',
    category: 'Writing Instruments',
    unitOfMeasure: 'box',
    supplierReference: 'SUP-001',
    purchasePrice: 240,
    sellingPrice: 320,
    quantity: 65,
    minStockThreshold: 15,
    status: 'active',
    createdAt: '2026-01-10'
  },
  {
    id: 'prod-202',
    type: 'stationery',
    name: 'Dollar SP-10 Fountain Pen with 6 Cartridges',
    barcode: '8964000210451',
    sku: 'STA-DOL-SP10',
    brand: 'Dollar Industries',
    category: 'Writing Instruments',
    unitOfMeasure: 'pack',
    supplierReference: 'SUP-001',
    purchasePrice: 110,
    sellingPrice: 160,
    quantity: 90,
    minStockThreshold: 20,
    status: 'active',
    createdAt: '2026-01-12'
  },
  {
    id: 'prod-203',
    type: 'stationery',
    name: 'Dux Lead Pencil DX-101 (Pack of 12)',
    barcode: '8964000305527',
    sku: 'STA-DUX-P12',
    brand: 'Dux Stationery',
    category: 'School Essentials',
    unitOfMeasure: 'pack',
    supplierReference: 'SUP-001',
    purchasePrice: 180,
    sellingPrice: 250,
    quantity: 120,
    minStockThreshold: 25,
    status: 'active',
    createdAt: '2026-01-18'
  },
  {
    id: 'prod-204',
    type: 'stationery',
    name: 'Pelikan 4001 Fountain Pen Ink 60ml (Royal Blue)',
    barcode: '4012700301131',
    sku: 'STA-PEL-INK-BL',
    brand: 'Pelikan Germany',
    category: 'Writing Instruments',
    unitOfMeasure: 'pcs',
    supplierReference: 'SUP-002',
    purchasePrice: 750,
    sellingPrice: 990,
    quantity: 14,
    minStockThreshold: 5,
    status: 'active',
    createdAt: '2026-01-22'
  },
  {
    id: 'prod-205',
    type: 'stationery',
    name: 'Deedat Premium Spiral Register A4 300 Pages',
    barcode: '8964000412891',
    sku: 'STA-REG-A4-300',
    brand: 'Deedat Papers',
    category: 'Notebooks & Registers',
    unitOfMeasure: 'pcs',
    supplierReference: 'SUP-003',
    purchasePrice: 380,
    sellingPrice: 520,
    quantity: 4, // Low stock demo
    minStockThreshold: 10,
    status: 'active',
    createdAt: '2026-02-01'
  },
  {
    id: 'prod-206',
    type: 'stationery',
    name: 'Crown Heavy Duty Lever Arch Box File',
    barcode: '8964000523019',
    sku: 'STA-FILE-BOX-HD',
    brand: 'Crown Files',
    category: 'Office & Filing Supplies',
    unitOfMeasure: 'pcs',
    supplierReference: 'SUP-003',
    purchasePrice: 280,
    sellingPrice: 390,
    quantity: 35,
    minStockThreshold: 10,
    status: 'active',
    createdAt: '2026-02-03'
  },
  {
    id: 'prod-207',
    type: 'stationery',
    name: 'Marie Acrylic Color Set 12 Shades x 12ml',
    barcode: '6921235123984',
    sku: 'STA-MARIE-ACR12',
    brand: "Marie's Art",
    category: 'Art & Craft Supplies',
    unitOfMeasure: 'set',
    supplierReference: 'SUP-002',
    purchasePrice: 1100,
    sellingPrice: 1550,
    quantity: 12,
    minStockThreshold: 5,
    status: 'active',
    createdAt: '2026-02-08'
  },
  {
    id: 'prod-208',
    type: 'stationery',
    name: 'Deli Metal Precision Geometry Compass Box',
    barcode: '6935205312014',
    sku: 'STA-DELI-GEO7',
    brand: 'Deli Enterprise',
    category: 'School Essentials',
    unitOfMeasure: 'pcs',
    supplierReference: 'SUP-001',
    purchasePrice: 420,
    sellingPrice: 590,
    quantity: 0, // Out of stock
    minStockThreshold: 10,
    status: 'active',
    createdAt: '2026-02-12'
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    companyName: 'Lahore Paper & Stationery Mart',
    contactPerson: 'Muhammad Tariq',
    phone: '+92 300 4567891',
    email: 'sales@lahorestationery.pk',
    address: 'Urdu Bazar, Lahore, Pakistan',
    status: 'active',
    suppliedCategories: ['Writing Instruments', 'School Essentials', 'Notebooks & Registers'],
    totalPurchases: 285400
  },
  {
    id: 'SUP-002',
    companyName: 'Oxford & International Book Distributors',
    contactPerson: 'Zia-ur-Rehman',
    phone: '+92 321 8765432',
    email: 'orders@oibdistributors.com',
    address: 'G-9 Markaz, Islamabad, Pakistan',
    status: 'active',
    suppliedCategories: ['Textbooks & Academics', 'General Fiction & Urdu', 'Art & Craft Supplies'],
    totalPurchases: 642000
  },
  {
    id: 'SUP-003',
    companyName: 'Shaheen Paper Mills & Register Works',
    contactPerson: 'Khurram Shehzad',
    phone: '+92 333 9123456',
    email: 'shaheenpapers@gmail.com',
    address: 'Circular Road, Rawalpindi, Pakistan',
    status: 'active',
    suppliedCategories: ['Notebooks & Registers', 'Office & Filing Supplies'],
    totalPurchases: 195000
  }
];

export const initialPurchases: PurchaseOrder[] = [
  {
    id: 'PO-2026-001',
    referenceNumber: 'PO-2026-001',
    supplierId: 'SUP-001',
    supplierName: 'Lahore Paper & Stationery Mart',
    purchaseDate: '2026-02-14',
    items: [
      { productId: 'prod-201', productName: 'Piano Point 0.8mm Ballpoint (Box of 10)', barcode: '8964000100124', quantity: 40, purchasePrice: 240, subtotal: 9600 },
      { productId: 'prod-203', productName: 'Dux Lead Pencil DX-101 (Pack of 12)', barcode: '8964000305527', quantity: 50, purchasePrice: 180, subtotal: 9000 }
    ],
    subtotal: 18600,
    tax: 0,
    totalAmount: 18600,
    status: 'received',
    receivedDate: '2026-02-16',
    notes: 'Urgent stock batch received in perfect condition.'
  },
  {
    id: 'PO-2026-002',
    referenceNumber: 'PO-2026-002',
    supplierId: 'SUP-002',
    supplierName: 'Oxford & International Book Distributors',
    purchaseDate: '2026-03-01',
    items: [
      { productId: 'prod-101', productName: 'Oxford Progressive English Book 8', barcode: '9780199060450', quantity: 30, purchasePrice: 950, subtotal: 28500 },
      { productId: 'prod-102', productName: 'Cambridge IGCSE Mathematics Extended', barcode: '9781108437189', quantity: 15, purchasePrice: 2800, subtotal: 42000 }
    ],
    subtotal: 70500,
    tax: 0,
    totalAmount: 70500,
    status: 'received',
    receivedDate: '2026-03-04',
    notes: 'New term textbook delivery.'
  },
  {
    id: 'PO-2026-003',
    referenceNumber: 'PO-2026-003',
    supplierId: 'SUP-003',
    supplierName: 'Shaheen Paper Mills & Register Works',
    purchaseDate: '2026-03-10',
    items: [
      { productId: 'prod-205', productName: 'Deedat Premium Spiral Register A4 300 Pages', barcode: '8964000412891', quantity: 25, purchasePrice: 380, subtotal: 9500 },
      { productId: 'prod-206', productName: 'Crown Heavy Duty Lever Arch Box File', barcode: '8964000523019', quantity: 20, purchasePrice: 280, subtotal: 5600 }
    ],
    subtotal: 15100,
    tax: 0,
    totalAmount: 15100,
    status: 'pending',
    notes: 'Awaiting stock delivery from factory warehouse.'
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'tx-1001',
    invoiceNumber: 'INV-2026-0001',
    timestamp: '2026-03-12 11:30:22',
    cashierName: 'Muhammad Usman (Cashier)',
    customerName: 'Army Public School Student',
    customerPhone: '+92 301 5551234',
    items: [
      { productId: 'prod-101', productName: 'Oxford Progressive English Book 8', barcode: '9780199060450', category: 'Textbooks & Academics', quantity: 1, unitPrice: 1250, discount: 50, subtotal: 1200 },
      { productId: 'prod-201', productName: 'Piano Point 0.8mm Ballpoint (Box of 10)', barcode: '8964000100124', category: 'Writing Instruments', quantity: 1, unitPrice: 320, discount: 0, subtotal: 320 }
    ],
    subtotal: 1570,
    overallDiscount: 50,
    taxAmount: 0,
    totalAmount: 1520,
    paymentMethod: 'Cash',
    amountPaid: 2000,
    changeDue: 480,
    status: 'completed'
  },
  {
    id: 'tx-1002',
    invoiceNumber: 'INV-2026-0002',
    timestamp: '2026-03-12 14:15:10',
    cashierName: 'Muhammad Usman (Cashier)',
    customerName: 'Col. Farrukh Academy',
    customerPhone: '+92 333 4447788',
    items: [
      { productId: 'prod-103', productName: 'Kulliyat-e-Iqbal (Allama Iqbal)', barcode: '9789694160016', category: 'General Fiction & Urdu', quantity: 2, unitPrice: 1950, discount: 100, subtotal: 3800 },
      { productId: 'prod-207', productName: 'Marie Acrylic Color Set 12 Shades x 12ml', barcode: '6921235123984', category: 'Art & Craft Supplies', quantity: 1, unitPrice: 1550, discount: 50, subtotal: 1500 }
    ],
    subtotal: 5450,
    overallDiscount: 150,
    taxAmount: 0,
    totalAmount: 5300,
    paymentMethod: 'Card',
    amountPaid: 5300,
    changeDue: 0,
    status: 'completed'
  },
  {
    id: 'tx-1003',
    invoiceNumber: 'INV-2026-0003',
    timestamp: '2026-03-13 16:40:05',
    cashierName: 'Admin',
    customerName: 'Walk-in Customer',
    items: [
      { productId: 'prod-202', productName: 'Dollar SP-10 Fountain Pen with 6 Cartridges', barcode: '8964000210451', category: 'Writing Instruments', quantity: 2, unitPrice: 160, discount: 0, subtotal: 320 },
      { productId: 'prod-203', productName: 'Dux Lead Pencil DX-101 (Pack of 12)', barcode: '8964000305527', category: 'School Essentials', quantity: 1, unitPrice: 250, discount: 20, subtotal: 230 }
    ],
    subtotal: 570,
    overallDiscount: 20,
    taxAmount: 0,
    totalAmount: 550,
    paymentMethod: 'EasyPaisa',
    amountPaid: 550,
    changeDue: 0,
    status: 'completed'
  }
];

export const initialStockMovements: StockMovement[] = [
  {
    id: 'sm-001',
    productId: 'prod-101',
    productName: 'Oxford Progressive English Book 8',
    type: 'Purchase',
    quantityChange: 30,
    previousQuantity: 16,
    resultingQuantity: 46,
    referenceId: 'PO-2026-002',
    timestamp: '2026-03-04 10:15:00',
    responsibleUser: 'Zahid Khan (Inventory)',
    reason: 'Goods received from OUP distributor'
  },
  {
    id: 'sm-002',
    productId: 'prod-101',
    productName: 'Oxford Progressive English Book 8',
    type: 'Sale',
    quantityChange: -1,
    previousQuantity: 46,
    resultingQuantity: 45,
    referenceId: 'INV-2026-0001',
    timestamp: '2026-03-12 11:30:22',
    responsibleUser: 'Muhammad Usman (Cashier)',
    reason: 'POS Counter Sale'
  },
  {
    id: 'sm-003',
    productId: 'prod-201',
    productName: 'Piano Point 0.8mm Ballpoint (Box of 10)',
    type: 'Sale',
    quantityChange: -1,
    previousQuantity: 66,
    resultingQuantity: 65,
    referenceId: 'INV-2026-0001',
    timestamp: '2026-03-12 11:30:22',
    responsibleUser: 'Muhammad Usman (Cashier)',
    reason: 'POS Counter Sale'
  },
  {
    id: 'sm-004',
    productId: 'prod-205',
    productName: 'Deedat Premium Spiral Register A4 300 Pages',
    type: 'Damage',
    quantityChange: -2,
    previousQuantity: 6,
    resultingQuantity: 4,
    referenceId: 'DAM-2026-01',
    timestamp: '2026-03-10 14:00:00',
    responsibleUser: 'Admin',
    reason: 'Water spill during shop cleaning'
  }
];

export const initialDamagedRecords: DamagedOrObsoleteRecord[] = [
  {
    id: 'dam-01',
    productId: 'prod-205',
    productName: 'Deedat Premium Spiral Register A4 300 Pages',
    barcode: '8964000412891',
    type: 'damaged',
    quantity: 2,
    reason: 'Water damage during store cleaning',
    recordedBy: 'Admin',
    date: '2026-03-10',
    status: 'written_off'
  },
  {
    id: 'obs-01',
    productId: 'prod-106',
    productName: 'Federal Board Physics for Class 10 (Old Edition)',
    barcode: '9789690025110',
    type: 'obsolete',
    quantity: 1,
    reason: 'Syllabus revised by Federal Board 2026',
    recordedBy: 'Zahid Khan (Inventory)',
    date: '2026-03-05',
    status: 'written_off'
  }
];

export const initialSalesReturns: SalesReturn[] = [
  {
    id: 'ret-001',
    returnReference: 'RET-2026-001',
    originalInvoiceNumber: 'INV-2026-0001',
    timestamp: '2026-03-12 15:20:00',
    cashierName: 'Muhammad Usman (Cashier)',
    items: [
      {
        productId: 'prod-201',
        productName: 'Piano Point 0.8mm Ballpoint (Box of 10)',
        quantity: 1,
        unitPrice: 320,
        refundAmount: 320,
        condition: 'restockable',
        reason: 'Customer bought black instead of blue'
      }
    ],
    totalRefundAmount: 320
  }
];

export const initialStaff: StaffUser[] = [
  { id: 'usr-1', username: 'admin', fullName: 'Admin', email: 'admin@gmail.com', role: 'Admin', status: 'active', lastLogin: '2026-03-13 16:15' },
  { id: 'usr-2', username: 'cashier1', fullName: 'Muhammad Usman', email: 'usman@fojibookcenter.com', role: 'Cashier', status: 'active', lastLogin: '2026-03-13 14:02' },
  { id: 'usr-3', username: 'inv_zahid', fullName: 'Zahid Khan', email: 'zahid@fojibookcenter.com', role: 'Inventory Staff', status: 'active', lastLogin: '2026-03-12 09:30' }
];

export const initialAuditLogs: AuditLog[] = [
  { id: 'log-1', user: 'Admin', action: 'CREATED_PRODUCT', recordType: 'Product', recordReference: 'prod-106', timestamp: '2026-02-10 11:20:00', details: 'Added Federal Board Physics for Class 10' },
  { id: 'log-2', user: 'Zahid Khan (Inventory)', action: 'RECEIVE_PURCHASE', recordType: 'Purchase', recordReference: 'PO-2026-002', timestamp: '2026-03-04 10:15:00', details: 'Received 45 items from Oxford Distributors' },
  { id: 'log-3', user: 'Admin', action: 'STOCK_ADJUSTMENT', recordType: 'Stock', recordReference: 'prod-205', timestamp: '2026-03-10 14:00:00', details: 'Marked 2 registers as damaged (spill)' },
  { id: 'log-4', user: 'Muhammad Usman (Cashier)', action: 'COMPLETED_SALE', recordType: 'Sale', recordReference: 'INV-2026-0001', timestamp: '2026-03-12 11:30:22', details: 'POS Cash sale PKR 1,520' },
  { id: 'log-5', user: 'Admin', action: 'BACKUP_CREATED', recordType: 'Backup', recordReference: 'BKP-2026-03-12', timestamp: '2026-03-12 21:00:00', details: 'Routine system backup exported' }
];

export const initialSettings: StoreSettings = {
  storeName: 'Foji Book Center',
  storeTagline: 'Books, School Stationery & Office Supplies',
  address: 'Shop # 4 & 5, Commercial Market, Cantt, Rawalpindi / Lahore',
  phone: '+92 51 2233445 / +92 300 1234567',
  ntn: 'NTN-8472910-3',
  currency: 'PKR',
  receiptHeader: '*** FOJI BOOK CENTER ***\nQuality Books & Stationery Since 1994',
  receiptFooter: 'Thank you for shopping with us!\nExchange within 7 days with original receipt.\nNo return on damaged or opened books.',
  taxRatePercent: 0,
  language: 'en'
};
