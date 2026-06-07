import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useProductStore } from "@/store/addproductstore"
import {
  addSaleService,
  updateSaleService,
  deleteSaleService,
  getSalesByShopService,
} from "@/service/sale"

import type {
  CompleteSalePayload,
  CreditPaymentEntry,
  SaleDraftItem,
  SaleRecord,
  SaleSummary,
  SaleDiscountType,
  SalePaymentMethod,
  SaleStatus,
} from "@/types/sale"

const formatSaleDate = () => new Date().toISOString().split("T")[0]

const getSaleStatus = (paymentMethod: SalePaymentMethod): SaleStatus =>
  paymentMethod === "Credit" ? "Partial" : "Complete"

export const calculateSaleSummary = (
  items: SaleDraftItem[],
  discountType: SaleDiscountType,
  discountValue: number,
): SaleSummary => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const normalizedDiscountValue = Number.isFinite(discountValue)
    ? Math.max(discountValue, 0)
    : 0

  const totalDiscount =
    discountType === "percentage"
      ? (subtotal * Math.min(normalizedDiscountValue, 100)) / 100
      : Math.min(normalizedDiscountValue, subtotal)

  const totalPayment = Math.max(subtotal - totalDiscount, 0)

  return {
    subtotal,
    totalDiscount,
    totalPayment,
  }
}

export const buildSaleRecord = (
  payload: CompleteSalePayload,
  overrides?: Partial<Pick<SaleRecord, "id" | "date" | "status">>,
): SaleRecord => {
  const summary = calculateSaleSummary(
    payload.items,
    payload.discountType,
    payload.discountValue,
  )
  const amountPaid = typeof payload.amountPaidNow === "number" ? payload.amountPaidNow : summary.totalPayment
  const remaining = Math.max(summary.totalPayment - (payload.amountPaidNow ?? 0), 0)
  const status =
    overrides?.status ??
    (amountPaid >= summary.totalPayment ? "Complete" : getSaleStatus(payload.paymentMethod))

  return {
    id: overrides?.id ?? Date.now(),
    shopId: payload.shopId,
    customerName: payload.customerName.trim() || "Unknown Customer",
    customerId: payload.customerId,
    customerPhoneNumber: payload.customerPhoneNumber,
    date: overrides?.date ?? formatSaleDate(),
    dueDate: payload.dueDate,
    items: payload.items,
    productSummary: payload.items.map((item) => item.name).join(", "),
    quantity: payload.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: summary.subtotal,
    discountType: payload.discountType,
    discountValue: payload.discountValue,
    totalDiscount: summary.totalDiscount,
    totalPayment: summary.totalPayment,
    amountPaid,
    remainingBalance: remaining,
    creditPayments:
      payload.paymentMethod === "Credit"
        ? [
            {
              id: `${overrides?.id ?? Date.now()}-credit-${Date.now()}`,
              amount: amountPaid,
              date: overrides?.date ?? formatSaleDate(),
              note: "Initial payment",
            } satisfies CreditPaymentEntry,
          ]
        : undefined,
    paymentMethod: payload.paymentMethod,
    status,
  }
}

const initialSales: SaleRecord[] = []

type SaleUpdateInput = Partial<
  Omit<CompleteSalePayload, "items" | "subtotal" | "totalDiscount" | "totalPayment">
> & {
  items?: SaleDraftItem[]
  date?: string
  status?: SaleStatus
}

type SalesStore = {
  sales: SaleRecord[]
  addSale: (sale: CompleteSalePayload) => Promise<void>
  updateSale: (id: SaleRecord["id"], updates: SaleUpdateInput) => Promise<void>
  recordCreditPayment: (
    customer: { id?: SaleRecord["customerId"]; name: string; phoneNumber?: number },
    amount: number,
  ) => Promise<void>
  deleteSale: (id: SaleRecord["id"]) => Promise<void>
  getSales: () => SaleRecord[]
  getSalesByShop: (shopId: string) => SaleRecord[]
  loadSalesByShop: (shopId: string) => Promise<void>
  clearSales: () => void
  getSalesSummary: () => SaleSummary
}

const getSalesSummary = (sales: SaleRecord[]): SaleSummary =>
  sales.reduce(
    (summary, sale) => ({
      subtotal: summary.subtotal + sale.subtotal,
      totalDiscount: summary.totalDiscount + sale.totalDiscount,
      totalPayment: summary.totalPayment + sale.totalPayment,
    }),
    { subtotal: 0, totalDiscount: 0, totalPayment: 0 },
  )

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      sales: initialSales,

      addSale: async (sale) => {
        if (!sale.shopId) {
          throw new Error("Missing shop id when saving sale")
        }

        try {
          const adjustStock = useProductStore.getState().adjustStock
          const normalizedCustomerName = sale.customerName.trim()

          sale.items.forEach((item) => {
            adjustStock(item.id, {
              action: "Sold",
              quantityChange: -item.quantity,
              note: `Sale completed${normalizedCustomerName ? ` for ${normalizedCustomerName}` : ""}`,
            })
          })

          const { sale: firestoreSale } = await addSaleService(sale, sale.shopId)

          set((state) => ({
            sales: [firestoreSale, ...state.sales],
          }))
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to add sale"
          throw new Error(message)
        }
      },

      updateSale: async (id, updates) => {
        try {
          const nextSales = get().sales.map((sale) => {
            if (sale.id !== id) {
              return sale
            }

            const nextItems = updates.items ?? sale.items
            const nextDiscountType = updates.discountType ?? sale.discountType
            const nextDiscountValue =
              typeof updates.discountValue === "number"
                ? updates.discountValue
                : sale.discountValue
            const summary = calculateSaleSummary(
              nextItems,
              nextDiscountType,
              nextDiscountValue,
            )

            return {
              ...sale,
              customerName: updates.customerName?.trim() || sale.customerName,
              date: updates.date ?? sale.date,
              items: nextItems,
              productSummary: nextItems.map((item) => item.name).join(", "),
              quantity: nextItems.reduce((sum, item) => sum + item.quantity, 0),
              discountType: nextDiscountType,
              discountValue: nextDiscountValue,
              subtotal: summary.subtotal,
              totalDiscount: summary.totalDiscount,
              totalPayment: summary.totalPayment,
              paymentMethod: updates.paymentMethod ?? sale.paymentMethod,
              status:
                updates.status ??
                getSaleStatus(updates.paymentMethod ?? sale.paymentMethod),
            }
          })

          const updatedSale = nextSales.find((sale) => sale.id === id)
          if (updatedSale) {
            await updateSaleService(String(id), updatedSale)
          }

          set({ sales: nextSales })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to update sale"
          throw new Error(message)
        }
      },

      recordCreditPayment: async (customer, amount) => {
        const paymentAmount = Math.max(Number(amount) || 0, 0)

        if (paymentAmount <= 0) {
          return
        }

        let updatedSale: SaleRecord | undefined

        set((state) => {
          const targetIndex = [...state.sales]
            .map((sale, index) => ({ sale, index }))
            .filter(({ sale }) => sale.paymentMethod === "Credit")
            .filter(({ sale }) => {
              const matchesId = customer.id !== undefined && sale.customerId === customer.id
              const matchesName = sale.customerName.trim().toLowerCase() === customer.name.trim().toLowerCase()
              const matchesPhone =
                customer.phoneNumber !== undefined && sale.customerPhoneNumber === customer.phoneNumber
              return matchesId || matchesName || matchesPhone
            })
            .sort((left, right) => new Date(right.sale.date).getTime() - new Date(left.sale.date).getTime())
            .find(({ sale }) => (sale.remainingBalance ?? 0) > 0 || (sale.amountPaid ?? 0) > 0)

          if (!targetIndex) {
            return state
          }

          const now = new Date().toISOString()

          const sales = state.sales.map((sale) => {
            if (sale.id !== targetIndex.sale.id) {
              return sale
            }

            const existingPaid = sale.amountPaid ?? 0
            const billTotal = sale.totalPayment
            const nextPaid = Math.min(existingPaid + paymentAmount, billTotal)
            const nextRemaining = Math.max(billTotal - nextPaid, 0)
            const nextStatus = nextRemaining === 0 ? "Complete" : "Partial"

            const nextHistory: CreditPaymentEntry[] = [
              ...(sale.creditPayments ?? []),
              {
                id: `${sale.id}-credit-${Date.now()}`,
                amount: paymentAmount,
                date: now,
                note: "Additional payment",
              },
            ]

            updatedSale = {
              ...sale,
              amountPaid: nextPaid,
              remainingBalance: nextRemaining,
              status: nextStatus,
              creditPayments: nextHistory,
            }

            return updatedSale
          })

          return { sales }
        })

        if (updatedSale) {
          try {
            await updateSaleService(String(updatedSale.id), updatedSale)
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to record credit payment"
            throw new Error(message)
          }
        }
      },

      deleteSale: async (id) => {
        try {
          await deleteSaleService(String(id))
          set((state) => ({
            sales: state.sales.filter((sale) => sale.id !== id),
          }))
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to delete sale"
          throw new Error(message)
        }
      },

      loadSalesByShop: async (shopId) => {
        try {
          const firestoreSales = await getSalesByShopService(shopId)
          set((state) => {
            const existingIds = new Set(state.sales.map((sale) => String(sale.id)))
            const freshSales = firestoreSales.filter(
              (sale) => !existingIds.has(String(sale.id)),
            )
            return { sales: [...state.sales, ...freshSales] }
          })
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to load sales"
          throw new Error(message)
        }
      },

      getSales: () => get().sales,

      getSalesByShop: (shopId: string) => 
        get().sales.filter((sale) => sale.shopId === shopId),

      clearSales: () => set({ sales: [] }),

      getSalesSummary: () => getSalesSummary(get().sales),
    }),
    {
      name: "sales-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)