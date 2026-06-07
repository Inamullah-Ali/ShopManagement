import type { Product, ProductFormData } from "@/types/products";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addProductService, updateProductService, deleteProductService, getProductsByShopService } from "@/service/product";

export type ProductHistoryEntry = {
  id: string | number;
  productId: Product["id"];
  action: string;
  prevStock?: number | null;
  newStock?: number;
  quantityChange?: number;
  stockIn?: number;
  stockOut?: number;
  timestamp: string; // ISO
  details?: any;
};

const getStatusFromStock = (stock: number): Product["status"] => {
  if (stock === 0) return "Out of Stock";
  if (stock >= 10) return "Healthy";
  return "Low Stock";
};

interface ProductStore {
  products: Product[];
  history: ProductHistoryEntry[];

  addProduct: (product: ProductFormData, shopId: string) => Promise<void>;
  updateProduct: (id: Product["id"], updatedData: Partial<Product>) => Promise<void>;
  adjustStock: (
    id: Product["id"],
    opts: { action: string; quantityChange: number; note?: string },
  ) => void;
  deleteProduct: (id: Product["id"]) => Promise<void>;
  clearProducts: () => void;
  getProductsByShop: (shopId: string) => Product[];
  loadProductsByShop: (shopId: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      history: [],

      addProduct: async (product, shopId) => {
        try {
          const createdAt = new Date().toISOString();
          const newProduct: Product = {
            ...product,
            id: Date.now(),
            shopId,
            stockIn: product.stock,
            stockOut: 0,
            createdAt,
            updatedAt: createdAt,
          };

          const { id: firestoreId } = await addProductService(
            {
              name: product.name,
              image: product.image,
              purchasePrice: product.purchasePrice,
              sellPrice: product.sellPrice,
              stock: product.stock,
              status: product.status,
              shopId,
            },
            shopId
          );

          const productWithId: Product = {
            ...newProduct,
            id: firestoreId,
          };

          const entry: ProductHistoryEntry = {
            id: `${firestoreId}-created-${Date.now()}`,
            productId: firestoreId,
            action: "Created",
            prevStock: null,
            newStock: product.stock,
            quantityChange: product.stock,
            stockIn: product.stock,
            stockOut: 0,
            timestamp: createdAt,
            details: productWithId,
          };

          set((state) => ({
            products: [...state.products, productWithId],
            history: [...state.history, entry],
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to add product";
          throw new Error(message);
        }
      },

      // update product metadata only for decreases/neutral edits.
      // If stock is increased here, record it as a real stock movement in the report.
      updateProduct: async (id, updatedData) => {
        try {
          const now = new Date().toISOString();
          const existingProduct = get().products.find(
            (product) => product.id === id,
          );

          if (!existingProduct) {
            return;
          }

          const nextStock =
            typeof updatedData.stock === "number"
              ? updatedData.stock
              : existingProduct.stock;
          const stockDelta = nextStock - existingProduct.stock;

          const productUpdate = {
            ...updatedData,
            stock: nextStock,
            stockIn:
              stockDelta > 0
                ? (existingProduct.stockIn ?? existingProduct.stock) + stockDelta
                : (existingProduct.stockIn ?? existingProduct.stock),
            stockOut: existingProduct.stockOut ?? 0,
            status: getStatusFromStock(nextStock),
            updatedAt: now,
          };

          await updateProductService(String(id), productUpdate);

          set((state) => {
            const products = state.products.map((product) =>
              product.id === id
                ? {
                    ...product,
                    ...productUpdate,
                  }
                : product,
            );

            if (stockDelta <= 0) {
              return { products };
            }

            const entry: ProductHistoryEntry = {
              id: `${id}-edited-increase-${Date.now()}`,
              productId: id,
              action: "Stock Increased",
              prevStock: existingProduct.stock,
              newStock: nextStock,
              quantityChange: stockDelta,
              stockIn: stockDelta,
              stockOut: 0,
              timestamp: now,
              details: {
                note: "Quantity increased during product edit",
              },
            };

            return {
              products,
              history: [...state.history, entry],
            };
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to update product";
          throw new Error(message);
        }
      },

      // Use this method to record real stock changes (stock in/out/sold)
      adjustStock: (id, opts) =>
        set((state) => {
          const now = new Date().toISOString();
          const prev = state.products.find((p) => p.id === id);
          const prevStock = prev?.stock ?? 0;
          const newStock = prevStock + opts.quantityChange;

          const products = state.products.map((product) =>
            product.id === id
              ? {
                  ...product,
                  stock: newStock,
                  stockIn:
                    (product.stockIn ?? 0) + Math.max(opts.quantityChange, 0),
                  stockOut:
                    (product.stockOut ?? 0) + Math.max(-opts.quantityChange, 0),
                  status: getStatusFromStock(newStock),
                  updatedAt: now,
                }
              : product,
          );

          const entry: ProductHistoryEntry = {
            id: `${id}-move-${Date.now()}`,
            productId: id,
            action: opts.action,
            prevStock: prevStock,
            newStock: newStock,
            quantityChange: opts.quantityChange,
            stockIn: Math.max(opts.quantityChange, 0),
            stockOut: Math.max(-opts.quantityChange, 0),
            timestamp: now,
            details: { note: opts.note } as any,
          };

          return {
            products,
            history: [...state.history, entry],
          };
        }),

      deleteProduct: async (id) => {
        try {
          await deleteProductService(String(id));
          set((state) => ({
            products: state.products.filter((product) => product.id !== id),
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to delete product";
          throw new Error(message);
        }
      },

      clearProducts: () => set({ products: [], history: [] }),

      getProductsByShop: (shopId: string) =>
        get().products.filter((product) => product.shopId === shopId),

      loadProductsByShop: async (shopId: string) => {
        try {
          const firestoreProducts = await getProductsByShopService(shopId);
          set((state) => {
            // Merge with existing local products, avoiding duplicates
            const existingIds = new Set(state.products.map((p) => p.id));
            const newProducts = firestoreProducts.filter(
              (p) => !existingIds.has(p.id),
            );
            return {
              products: [...state.products, ...newProducts],
            };
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to load products";
          throw new Error(message);
        }
      },
    }),
    {
      name: "products-storage",
    },
  ),
);
