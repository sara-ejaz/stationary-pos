import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(undefined);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [discountType, setDiscountType] = useState('fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState(0);

  const addToCart = (product, quantity = 1) => {
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

      const newItem = {
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

  const updateQuantity = (productId, quantity) => {
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

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setCustomerName('');
    setCustomerPhone('');
    setAmountPaid(0);
  };

  const setDiscount = (type, value) => {
    setDiscountType(type);
    setDiscountValue(Math.max(0, value));
  };

  const setCustomerInfo = (name, phone) => {
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
