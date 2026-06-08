'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart on startup
  useEffect(() => {
    const storedCart = localStorage.getItem('sneakverse_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('sneakverse_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleCart = () => setIsOpen(!isOpen);
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Add to cart with support for item variations (size + color)
  const addToCart = (product, qty = 1, size, color) => {
    if (!size) {
      alert('Please select a size');
      return false;
    }
    if (!color) {
      alert('Please select a color');
      return false;
    }

    setCartItems((prevItems) => {
      // Look for exactly the same product, size, and color
      const existItem = prevItems.find(
        (x) =>
          x.product === product._id &&
          x.size === size &&
          x.color.name === color.name
      );

      if (existItem) {
        // Increment quantity, ensuring we don't exceed stock limit
        const updatedQty = Math.min(product.stock, existItem.qty + qty);
        return prevItems.map((x) =>
          x.product === product._id &&
          x.size === size &&
          x.color.name === color.name
            ? { ...x, qty: updatedQty }
            : x
        );
      } else {
        // Add new item variant
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            stock: product.stock,
            size,
            color,
            qty
          }
        ];
      }
    });

    openCart(); // Slide drawer out automatically for smooth feedback
    return true;
  };

  const removeFromCart = (productId, size, colorName) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (x) =>
          !(x.product === productId && x.size === size && x.color.name === colorName)
      )
    );
  };

  const updateQty = (productId, size, colorName, newQty) => {
    setCartItems((prevItems) =>
      prevItems.map((x) =>
        x.product === productId && x.size === size && x.color.name === colorName
          ? { ...x, qty: Math.max(1, Math.min(x.stock, newQty)) }
          : x
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const shippingPrice = cartSubtotal > 200 ? 0 : 15; // Free shipping over $200
  const taxPrice = Number((0.08 * cartSubtotal).toFixed(2)); // 8% sales tax
  const cartTotal = Number((cartSubtotal + shippingPrice + taxPrice).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isOpen,
        toggleCart,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartSubtotal,
        cartItemsCount,
        shippingPrice,
        taxPrice,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
