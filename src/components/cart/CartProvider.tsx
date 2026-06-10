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
  /** مفتاح السطر في السلة: productId أو productId:variantId */
  key: string;
  productId: string;
  variantId?: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  /** وصف التركيبة لو المنتج ليه variants — "Size: M · Color: Red" */
  variantLabelEn?: string;
  variantLabelAr?: string;
  price: number;
  image: string;
  /** الستوك المعروف وقت الإضافة — للحد الأقصى في الـ UI، التحقق الحقيقي في الـ checkout */
  stock: number;
  qty: number;
}

export type NewCartItem = Omit<CartItem, "qty" | "key">;

interface CartContextValue {
  items: CartItem[];
  /** false لحد ما السلة تتحمل من localStorage (تجنب hydration mismatch) */
  ready: boolean;
  count: number;
  subtotal: number;
  addItem: (item: NewCartItem, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "orion.cart.v2";

function itemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}:${variantId}` : productId;
}

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
          const key = itemKey(item.productId, item.variantId);
          const existing = prev.find((i) => i.key === key);
          if (existing) {
            return prev.map((i) =>
              i.key === key ? { ...i, ...item, key, qty: clampQty(i.qty + qty, item.stock) } : i,
            );
          }
          return [...prev, { ...item, key, qty: clampQty(qty, item.stock) }];
        }),
      setQty: (key, qty) =>
        setItems((prev) =>
          prev.map((i) => (i.key === key ? { ...i, qty: clampQty(qty, i.stock) } : i)),
        ),
      removeItem: (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
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
