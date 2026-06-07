import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Customer, CustomerFormValues } from "@/types/customer";
import {
  addCustomerService,
  updateCustomerService,
  deleteCustomerService,
  getCustomersByShopService,
} from "@/service/customer";

type CustomerStore = {
  customers: Customer[];
  addCustomer: (customer: CustomerFormValues, shopId: string) => Promise<void>;
  updateCustomer: (id: Customer["id"], customer: CustomerFormValues) => Promise<void>;
  deleteCustomer: (id: Customer["id"]) => Promise<void>;
  loadCustomersByShop: (shopId: string) => Promise<void>;
};

const normalizePhoneNumber = (phoneNumber: string) => Number(phoneNumber.replace(/\D/g, ""));

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customers: [],

      addCustomer: async (customer, shopId) => {
        try {
          const newCustomerData = {
            name: customer.name.trim(),
            phoneNumber: normalizePhoneNumber(customer.phoneNumber),
            address: customer.address.trim() || undefined,
            joinDate: customer.joinDate,
            status: customer.status,
            shopId,
          };

          const { customer: firestoreCustomer } = await addCustomerService(
            newCustomerData,
            shopId,
          );

          set((state) => ({
            customers: [...state.customers, firestoreCustomer],
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to add customer";
          throw new Error(message);
        }
      },

      updateCustomer: async (id, customer) => {
        try {
          const updates = {
            name: customer.name.trim(),
            phoneNumber: normalizePhoneNumber(customer.phoneNumber),
            address: customer.address.trim() || undefined,
            joinDate: customer.joinDate,
            status: customer.status,
          };

          await updateCustomerService(String(id), updates);

          set((state) => ({
            customers: state.customers.map((existingCustomer) =>
              existingCustomer.id === id
                ? {
                    ...existingCustomer,
                    ...updates,
                  }
                : existingCustomer,
            ),
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to update customer";
          throw new Error(message);
        }
      },

      deleteCustomer: async (id) => {
        try {
          await deleteCustomerService(String(id));
          set((state) => ({
            customers: state.customers.filter((customer) => customer.id !== id),
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to delete customer";
          throw new Error(message);
        }
      },

      loadCustomersByShop: async (shopId) => {
        try {
          const firestoreCustomers = await getCustomersByShopService(shopId);
          set((state) => {
            const existingIds = new Set(state.customers.map((customer) => String(customer.id)));
            const freshCustomers = firestoreCustomers.filter(
              (customer) => !existingIds.has(String(customer.id)),
            );
            return { customers: [...state.customers, ...freshCustomers] };
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to load customers";
          throw new Error(message);
        }
      },
    }),
    {
      name: "customer-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);