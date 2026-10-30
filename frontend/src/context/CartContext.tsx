import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { Product, CartItem, PaymentMethod } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  discountType: 'percentage' | 'fixed';
  discountValue: number;
  setDiscount: (type: 'percentage' | 'fixed', value: number) => void;

  customerName: string;
  customerPhone: string;
  setCustomerInfo: (name: string, phone: string) => void;

  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;

  amountPaid: number;
  setAmountPaid: (amount: number) => void;

  // Computed values
  subtotal: number;
  discountCalculated: number;
  finalTotal: number;
  changeDue: number;
  totalItemsCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);

  const addToCart = (product: Product, quantity: number = 1): { success: boolean; message?: string } => {
    if (product.quantity <= 0) {
      return { success: false, message: `${product.name} is out of stock!` };
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > product.quantity) {
        return {
          success: false,
          message: `Cannot exceed available stock of ${product.quantity} items for ${product.name}`
        };
      }

      const updated = [...cart];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        subtotal: newQty * updated[existingIndex].unitPrice - updated[existingIndex].discount
      };
      setCart(updated);
      return { success: true };
    } else {
      if (quantity > product.quantity) {
        return {
          success: false,
          message: `Only ${product.quantity} units available in stock!`
        };
      }

      const newItem: CartItem = {
        product,
        quantity,
        unitPrice: product.sellingPrice,
        discount: 0,
        subtotal: quantity * product.sellingPrice
      };
      setCart((prev) => [...prev, newItem]);
      return { success: true };
    }
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const item = cart.find((i) => i.product.id === productId);
    if (!item) return { success: false, message: 'Item not in cart' };

    if (quantity > item.product.quantity) {
      return {
        success: false,
        message: `Maximum stock limit reached! Available: ${item.product.quantity}`
      };
    }

    setCart((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? {
              ...i,
              quantity,
              subtotal: quantity * i.unitPrice - i.discount
            }
          : i
      )
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setCustomerName('');
    setCustomerPhone('');
    setAmountPaid(0);
  };

  const setDiscount = (type: 'percentage' | 'fixed', value: number) => {
    setDiscountType(type);
    setDiscountValue(Math.max(0, value));
  };

  const setCustomerInfo = (name: string, phone: string) => {
    setCustomerName(name);
    setCustomerPhone(phone);
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [cart]);

  const discountCalculated = useMemo(() => {
    if (discountType === 'percentage') {
      return Math.round((subtotal * Math.min(100, discountValue)) / 100);
    }
    return Math.min(subtotal, discountValue);
  }, [subtotal, discountType, discountValue]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountCalculated);
  }, [subtotal, discountCalculated]);

  const changeDue = useMemo(() => {
    if (paymentMethod === 'Cash' && amountPaid > finalTotal) {
      return amountPaid - finalTotal;
    }
    return 0;
  }, [paymentMethod, amountPaid, finalTotal]);

  const totalItemsCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        discountType,
        discountValue,
        setDiscount,
        customerName,
        customerPhone,
        setCustomerInfo,
        paymentMethod,
        setPaymentMethod,
        amountPaid,
        setAmountPaid,
        subtotal,
        discountCalculated,
        finalTotal,
        changeDue,
        totalItemsCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
