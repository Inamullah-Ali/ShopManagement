import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Supplier, SupplierFormValues } from "@/types/supplier";
import {
  addSupplierService,
  updateSupplierService,
  deleteSupplierService,
  getSuppliersByShopService,
} from "@/service/supplier";

type SupplierStore = {
  suppliers: Supplier[];
  addSupplier: (supplier: SupplierFormValues, shopId: string) => Promise<void>;
  updateSupplier: (id: Supplier["id"], supplier: SupplierFormValues) => Promise<void>;
  deleteSupplier: (id: Supplier["id"]) => Promise<void>;
  loadSuppliersByShop: (shopId: string) => Promise<void>;
};

const normalizeNumber = (value: string) => Number(value.replace(/\D/g, ""));

export const useSupplierStore = create<SupplierStore>()(
  persist(
    (set) => ({
      suppliers: [],

      addSupplier: async (supplier, shopId) => {
        try {
          const newSupplierData = {
            name: supplier.name.trim(),
            contactperson: supplier.contactperson.trim(),
            phoneNumber: normalizeNumber(supplier.phoneNumber),
            totalPurchase: normalizeNumber(supplier.totalPurchase),
            totalDue: normalizeNumber(supplier.totalDue),
            date: supplier.date,
            status: supplier.status,
            shopId,
          };

          const { supplier: firestoreSupplier } = await addSupplierService(
            newSupplierData,
            shopId,
          );

          set((state) => ({
            suppliers: [...state.suppliers, firestoreSupplier],
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to add supplier";
          throw new Error(message);
        }
      },

      updateSupplier: async (id, supplier) => {
        try {
          const updates = {
            name: supplier.name.trim(),
            contactperson: supplier.contactperson.trim(),
            phoneNumber: normalizeNumber(supplier.phoneNumber),
            totalPurchase: normalizeNumber(supplier.totalPurchase),
            totalDue: normalizeNumber(supplier.totalDue),
            date: supplier.date,
            status: supplier.status,
          };

          await updateSupplierService(String(id), updates);

          set((state) => ({
            suppliers: state.suppliers.map((existingSupplier) =>
              existingSupplier.id === id
                ? {
                    ...existingSupplier,
                    ...updates,
                  }
                : existingSupplier,
            ),
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to update supplier";
          throw new Error(message);
        }
      },

      deleteSupplier: async (id) => {
        try {
          await deleteSupplierService(String(id));
          set((state) => ({
            suppliers: state.suppliers.filter((supplier) => supplier.id !== id),
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to delete supplier";
          throw new Error(message);
        }
      },

      loadSuppliersByShop: async (shopId) => {
        try {
          const firestoreSuppliers = await getSuppliersByShopService(shopId);
          set((state) => {
            const existingIds = new Set(state.suppliers.map((supplier) => String(supplier.id)));
            const freshSuppliers = firestoreSuppliers.filter(
              (supplier) => !existingIds.has(String(supplier.id)),
            );
            return { suppliers: [...state.suppliers, ...freshSuppliers] };
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to load suppliers";
          throw new Error(message);
        }
      },
    }),
    {
      name: "supplier-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);