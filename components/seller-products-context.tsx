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
  colors?: string[];
  sizes?: string[];
  backendId?: string; // id renvoyé par l'API
};

type SellerProductsContextValue = {
  products: SellerProduct[];
  addProduct: (product: Omit<SellerProduct, "id" | "createdAt" | "isSellerProduct">) => void;
  removeProduct: (id: number) => void;
  updateProduct: (id: number, updates: Partial<SellerProduct>) => void;
  replaceProducts: (items: SellerProduct[]) => void;
};

// Stockage local pour persister les produits par utilisateur
const STORAGE_KEY = 'seller_products';

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

  const replaceProducts = useCallback((items: SellerProduct[]) => {
    setProducts(items);
  }, []);

  const value = useMemo(
    () => ({ products, addProduct, removeProduct, updateProduct, replaceProducts }),
    [products, addProduct, removeProduct, updateProduct, replaceProducts]
  );

  return <SellerProductsContext.Provider value={value}>{children}</SellerProductsContext.Provider>;
};

export const useSellerProducts = () => {
  const ctx = useContext(SellerProductsContext);
  if (!ctx) throw new Error("useSellerProducts must be used within SellerProductsProvider");
  return ctx;
};
