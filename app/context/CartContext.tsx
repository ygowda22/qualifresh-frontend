"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { CART_KEY } from "../lib/cartSync";

export type Cart = Record<string, number>;

interface CartContextType {
  cart: Cart;
  setCart: (c: Cart) => void;
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCartState] = useState<Cart>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const cartRef  = useRef(cart);
  cartRef.current = cart;
  const ownWrite = useRef(false);

  // Cross-tab sync and cartSync.ts dispatches
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === CART_KEY && !ownWrite.current) {
        try { setCartState(e.newValue ? JSON.parse(e.newValue) : {}); } catch {}
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  function persist(updated: Cart) {
    ownWrite.current = true;
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent("storage", { key: CART_KEY, newValue: JSON.stringify(updated) }));
    ownWrite.current = false;
  }

  const setCart = useCallback((c: Cart) => { setCartState(c); persist(c); }, []);

  const addToCart = useCallback((id: string) => {
    const updated = { ...cartRef.current, [id]: (cartRef.current[id] || 0) + 1 };
    setCartState(updated);
    persist(updated);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    const u = { ...cartRef.current };
    if ((u[id] || 0) > 1) u[id]--; else delete u[id];
    setCartState(u);
    persist(u);
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
