import { db } from "../../lib/firebase"
import type { CompleteSalePayload, SaleRecord } from "@/types/sale"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore"

const SALES_COLLECTION = "sell"

export const addSaleService = async (
  sale: CompleteSalePayload,
  shopId: string,
): Promise<{ id: string; sale: SaleRecord }> => {
  try {
    const saleDate = new Date().toISOString()
    const status = sale.paymentMethod === "Credit" ? "Partial" : "Complete"
    const rawSaleData = {
      shopId,
      customerName: sale.customerName,
      customerId: sale.customerId,
      customerPhoneNumber: sale.customerPhoneNumber,
      paymentMethod: sale.paymentMethod,
      items: sale.items,
      subtotal: sale.subtotal,
      discountType: sale.discountType,
      discountValue: sale.discountValue,
      totalDiscount: sale.totalDiscount,
      totalPayment: sale.totalPayment,
      amountPaidNow: sale.amountPaidNow,
      dueDate: sale.dueDate,
      date: saleDate,
      status: status,
    }
    const saleData = Object.fromEntries(
      Object.entries(rawSaleData).filter(([, value]) => value !== undefined),
    )

    const docRef = await addDoc(collection(db, SALES_COLLECTION), saleData)

    const newSale: SaleRecord = {
      ...sale,
      id: docRef.id,
      date: saleDate,
      status: status,
      productSummary: sale.items.map((item) => item.name).join(", "),
      quantity: sale.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: sale.subtotal,
      totalDiscount: sale.totalDiscount,
      totalPayment: sale.totalPayment,
      amountPaid: sale.amountPaidNow ?? sale.totalPayment,
      remainingBalance:
        sale.totalPayment - (sale.amountPaidNow ?? sale.totalPayment),
    } as SaleRecord

    return { id: docRef.id, sale: newSale }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add sale"
    throw new Error(message)
  }
}

export const getSalesByShopService = async (shopId: string): Promise<SaleRecord[]> => {
  try {
    const q = query(
      collection(db, SALES_COLLECTION),
      where("shopId", "==", shopId),
    )

    const querySnapshot = await getDocs(q)
    const sales: SaleRecord[] = []

    querySnapshot.forEach((docSnapshot) => {
      sales.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as SaleRecord)
    })

    return sales
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch sales"
    throw new Error(message)
  }
}

export const updateSaleService = async (
  saleId: string,
  updates: Partial<SaleRecord>,
): Promise<void> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId)
    await updateDoc(saleRef, updates)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update sale"
    throw new Error(message)
  }
}

export const deleteSaleService = async (saleId: string): Promise<void> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId)
    await deleteDoc(saleRef)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete sale"
    throw new Error(message)
  }
}

export const getSaleService = async (saleId: string): Promise<SaleRecord | null> => {
  try {
    const saleRef = doc(db, SALES_COLLECTION, saleId)
    const snapshot = await getDoc(saleRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as SaleRecord
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch sale"
    throw new Error(message)
  }
}

export const getAllSalesService = async (): Promise<SaleRecord[]> => {
  try {
    const q = query(collection(db, SALES_COLLECTION))
    const querySnapshot = await getDocs(q)
    const sales: SaleRecord[] = []

    querySnapshot.forEach((docSnapshot) => {
      sales.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as SaleRecord)
    })

    return sales
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch sales"
    throw new Error(message)
  }
}
