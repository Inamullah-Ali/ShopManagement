import { db } from "../../lib/firebase"
import type { Supplier } from "@/types/supplier"
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

const SUPPLIERS_COLLECTION = "suppliers"

export const addSupplierService = async (
  supplier: Omit<Supplier, "id">,
  shopId: string,
): Promise<{ id: string; supplier: Supplier }> => {
  try {
    const docRef = await addDoc(collection(db, SUPPLIERS_COLLECTION), {
      ...supplier,
      shopId,
    })

    const newSupplier: Supplier = {
      ...supplier,
      id: docRef.id,
    }

    return { id: docRef.id, supplier: newSupplier }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add supplier"
    throw new Error(message)
  }
}

export const getSuppliersByShopService = async (shopId: string): Promise<Supplier[]> => {
  try {
    const q = query(
      collection(db, SUPPLIERS_COLLECTION),
      where("shopId", "==", shopId),
    )

    const querySnapshot = await getDocs(q)
    const suppliers: Supplier[] = []

    querySnapshot.forEach((docSnapshot) => {
      suppliers.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Supplier)
    })

    return suppliers
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch suppliers"
    throw new Error(message)
  }
}

export const updateSupplierService = async (
  supplierId: string,
  updates: Partial<Supplier>,
): Promise<void> => {
  try {
    const supplierRef = doc(db, SUPPLIERS_COLLECTION, supplierId)
    await updateDoc(supplierRef, updates)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update supplier"
    throw new Error(message)
  }
}

export const deleteSupplierService = async (supplierId: string): Promise<void> => {
  try {
    const supplierRef = doc(db, SUPPLIERS_COLLECTION, supplierId)
    await deleteDoc(supplierRef)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete supplier"
    throw new Error(message)
  }
}

export const getSupplierService = async (supplierId: string): Promise<Supplier | null> => {
  try {
    const supplierRef = doc(db, SUPPLIERS_COLLECTION, supplierId)
    const snapshot = await getDoc(supplierRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Supplier
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch supplier"
    throw new Error(message)
  }
}

export const getAllSuppliersService = async (): Promise<Supplier[]> => {
  try {
    const q = query(collection(db, SUPPLIERS_COLLECTION))
    const querySnapshot = await getDocs(q)
    const suppliers: Supplier[] = []

    querySnapshot.forEach((docSnapshot) => {
      suppliers.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Supplier)
    })

    return suppliers
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch suppliers"
    throw new Error(message)
  }
}
