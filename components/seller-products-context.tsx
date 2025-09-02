import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type SellerProduct = {
  id: number;
  name: string;
  price: number;
  promoPrice?: number;
  images: string[];
  description?: string;
  isPromo?: boolean;
  createdAt: Date;
  isSellerProduct: true; // Pour distinguer des produits normaux
};

type SellerProductsContextValue = {
  products: SellerProduct[];
  addProduct: (product: Omit<SellerProduct, "id" | "createdAt" | "isSellerProduct">) => void;
  removeProduct: (id: number) => void;
  updateProduct: (id: number, updates: Partial<SellerProduct>) => void;
};

const SellerProductsContext = createContext<SellerProductsContextValue | undefined>(undefined);

export const SellerProductsProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<SellerProduct[]>([]);

  const addProduct = useCallback((productData: Omit<SellerProduct, "id" | "createdAt" | "isSellerProduct">) => {
    const newProduct: SellerProduct = {
      ...productData,
      id: Date.now(), // ID simple basé sur le timestamp
      createdAt: new Date(),
      isSellerProduct: true,
    };
    setProducts(prev => [newProduct, ...prev]); // Ajouter en premier
  }, []);

  const removeProduct = useCallback((id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  }, []);

  const updateProduct = useCallback((id: number, updates: Partial<SellerProduct>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...updates } : product
      )
    );
  }, []);

  const value = useMemo(
    () => ({ products, addProduct, removeProduct, updateProduct }),
    [products, addProduct, removeProduct, updateProduct]
  );

  return <SellerProductsContext.Provider value={value}>{children}</SellerProductsContext.Provider>;
};

export const useSellerProducts = () => {
  const ctx = useContext(SellerProductsContext);
  if (!ctx) throw new Error("useSellerProducts must be used within SellerProductsProvider");
  return ctx;
};
