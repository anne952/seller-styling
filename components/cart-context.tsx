import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type CartItem = {
	 id: number;
	 name: string;
	 price: number;
	 image?: any;
	 size?: string | null;
	 color?: string | null;
	 quantity: number;
};

type CartContextValue = {
	 items: CartItem[];
	 addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
	 removeFromCart: (id: number, options?: { size?: string | null; color?: string | null }) => void;
	 increment: (id: number, options?: { size?: string | null; color?: string | null }) => void;
	 decrement: (id: number, options?: { size?: string | null; color?: string | null }) => void;
	 clearCart: () => void;
	 totalPrice: number;
	 totalCount: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
	 const [items, setItems] = useState<CartItem[]>([]);

	 const findIndex = useCallback(
		 (id: number, size?: string | null, color?: string | null) =>
			 items.findIndex(
				 (it) => it.id === id && (it.size ?? null) === (size ?? null) && (it.color ?? null) === (color ?? null)
			 ),
		 [items]
	 );

	 const addToCart: CartContextValue["addToCart"] = useCallback(
		 ({ id, name, price, image, size = null, color = null, quantity = 1 }) => {
			 setItems((prev) => {
				 const idx = prev.findIndex(
					 (it) => it.id === id && (it.size ?? null) === (size ?? null) && (it.color ?? null) === (color ?? null)
				 );
				 if (idx !== -1) {
					 const next = [...prev];
					 next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
					 return next;
				 }
				 return [...prev, { id, name, price, image, size, color, quantity }];
			 });
		 },
		 []
	 );

	 const removeFromCart: CartContextValue["removeFromCart"] = useCallback((id, opts) => {
		 const { size = null, color = null } = opts ?? {};
		 setItems((prev) => prev.filter((it) => !(it.id === id && (it.size ?? null) === (size ?? null) && (it.color ?? null) === (color ?? null))));
	 }, []);

	 const increment: CartContextValue["increment"] = useCallback((id, opts) => {
		 const { size = null, color = null } = opts ?? {};
		 setItems((prev) => {
			 const idx = prev.findIndex((it) => it.id === id && (it.size ?? null) === (size ?? null) && (it.color ?? null) === (color ?? null));
			 if (idx === -1) return prev;
			 const next = [...prev];
			 next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
			 return next;
		 });
	 }, []);

	 const decrement: CartContextValue["decrement"] = useCallback((id, opts) => {
		 const { size = null, color = null } = opts ?? {};
		 setItems((prev) => {
			 const idx = prev.findIndex((it) => it.id === id && (it.size ?? null) === (size ?? null) && (it.color ?? null) === (color ?? null));
			 if (idx === -1) return prev;
			 const next = [...prev];
			 const newQty = next[idx].quantity - 1;
			 if (newQty <= 0) {
				 return prev.filter((_, i) => i !== idx);
			 }
			 next[idx] = { ...next[idx], quantity: newQty };
			 return next;
		 });
	 }, []);

	 const clearCart = useCallback(() => setItems([]), []);

	 const totalPrice = useMemo(() => items.reduce((sum, it) => sum + it.price * it.quantity, 0), [items]);
	 const totalCount = useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items]);

	 const value = useMemo(
		 () => ({ items, addToCart, removeFromCart, increment, decrement, clearCart, totalPrice, totalCount }),
		 [items, addToCart, removeFromCart, increment, decrement, clearCart, totalPrice, totalCount]
	 );

	 return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
	 const ctx = useContext(CartContext);
	 if (!ctx) throw new Error("useCart must be used within CartProvider");
	 return ctx;
};


