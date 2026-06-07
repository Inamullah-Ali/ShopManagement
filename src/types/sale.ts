import type { Product } from "@/types/products"

export type SalePaymentMethod = "Cash" | "Online" | "Credit"
export type SaleDiscountType = "percentage" | "fixed"
export type SaleStatus = "Complete" | "Partial"

export type SaleDraftItem = {
  id: Product["id"]
  name: string
  price: number
  quantity: number
}

export type CreditPaymentEntry = {
  id: number | string
  amount: number
  date: string
  note?: string
}

export type CompleteSalePayload = {
  shopId: string;
  customerName: string
  customerId?: number | string
  customerPhoneNumber?: number
  paymentMethod: SalePaymentMethod
  items: SaleDraftItem[]
  discountType: SaleDiscountType
  discountValue: number
  subtotal: number
  totalDiscount: number
  totalPayment: number
  amountPaidNow?: number
  dueDate?: string
}

export type SaleRecord = {
  id: number | string
  shopId: string;
  customerName: string
  customerId?: number | string
  customerPhoneNumber?: number
  date: string
  dueDate?: string
  items: SaleDraftItem[]
  productSummary: string
  quantity: number
  subtotal: number
  discountType: SaleDiscountType
  discountValue: number
  totalDiscount: number
  totalPayment: number
  amountPaid?: number
  remainingBalance?: number
  creditPayments?: CreditPaymentEntry[]
  paymentMethod: SalePaymentMethod
  status: SaleStatus
}

export type SaleSummary = {
  subtotal: number
  totalDiscount: number
  totalPayment: number
}

export type SaleTableProps = {
  data: SaleRecord[]
}