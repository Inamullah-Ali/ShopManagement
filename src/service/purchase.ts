import { db } from "../../lib/firebase"
import type { PurchaseHistory } from "@/types/purchasehistory"
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

const PURCHASES_COLLECTION = "purchase"

export const addPurchaseService = async (
  purchase: PurchaseHistory,
  shopId: string,
): Promise<{ id: string; purchase: PurchaseHistory }> => {
  try {
    const purchaseDate = new Date().toISOString()
    const totalQuantity =
      purchase.totalQuantity ??
      purchase.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ??
      0

    const rawPurchaseData = {
      shopId,
      suppliername: purchase.suppliername,
      date: purchaseDate,
      totalAmount: purchase.totalAmount,
      paymentMethod: purchase.paymentMethod,
      status: purchase.status,
      totalDue: purchase.totalDue,
      items: purchase.items,
      totalQuantity,
    }

    const purchaseData = Object.fromEntries(
      Object.entries(rawPurchaseData).filter(([, value]) => value !== undefined),
    )

    const docRef = await addDoc(collection(db, PURCHASES_COLLECTION), purchaseData)

    const firestorePurchase: PurchaseHistory = {
      ...purchase,
      id: docRef.id,
      date: purchaseDate,
      totalQuantity,
    }

    return { id: docRef.id, purchase: firestorePurchase }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add purchase"
    throw new Error(message)
  }
}

export const getPurchasesByShopService = async (shopId: string): Promise<PurchaseHistory[]> => {
  try {
    const q = query(collection(db, PURCHASES_COLLECTION), where("shopId", "==", shopId))
    const querySnapshot = await getDocs(q)
    const purchases: PurchaseHistory[] = []

    querySnapshot.forEach((docSnapshot) => {
      purchases.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as PurchaseHistory)
    })

    return purchases
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch purchases"
    throw new Error(message)
  }
}

export const updatePurchaseService = async (
  purchaseId: string,
  updates: Partial<PurchaseHistory>,
): Promise<void> => {
  try {
    const purchaseRef = doc(db, PURCHASES_COLLECTION, purchaseId)
    await updateDoc(purchaseRef, updates)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update purchase"
    throw new Error(message)
  }
}

export const deletePurchaseService = async (purchaseId: string): Promise<void> => {
  try {
    const purchaseRef = doc(db, PURCHASES_COLLECTION, purchaseId)
    await deleteDoc(purchaseRef)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete purchase"
    throw new Error(message)
  }
}

export const getPurchaseService = async (purchaseId: string): Promise<PurchaseHistory | null> => {
  try {
    const purchaseRef = doc(db, PURCHASES_COLLECTION, purchaseId)
    const snapshot = await getDoc(purchaseRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as PurchaseHistory
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch purchase"
    throw new Error(message)
  }
}
