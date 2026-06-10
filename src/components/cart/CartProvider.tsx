"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MAX_QTY_PER_ITEM } from "@/lib/constants";

export interface CartItem {
  productId: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  price: number;
  image: string;
  /** الستوك المعروف وقت الإضافة — للحد الأقصى في الـ UI، التحقق الحقيقي في الـ checkout */
  stock: number;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  /** false لحد ما السلة تتحمل من localStorage (تجنب hydration mismatch) */
  ready: boolean;
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "orion.cart.v1";

function clampQty(qty: number, stock: number): number {
  return Math.max(1, Math.min(Math.floor(qty), MAX_QTY_PER_ITEM, Math.max(stock, 1)));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // سلة تالفة — نبدأ من جديد
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    return {
      items,
      ready,
      count,
      subtotal,
      addItem: (item, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((i) => i.productId === item.productId);
          if (existing) {
            return prev.map((i) =>
              i.productId === item.productId
                ? { ...i, ...item, qty: clampQty(i.qty + qty, item.stock) }
                : i,
            );
          }
          return [...prev, { ...item, qty: clampQty(qty, item.stock) }];
        }),
      setQty: (productId, qty) =>
        setItems((prev) =>
          prev.map((i) => (i.productId === productId ? { ...i, qty: clampQty(qty, i.stock) } : i)),
        ),
      removeItem: (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId)),
      clearCart: () => setItems([]),
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
