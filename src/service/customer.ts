import { db } from "../../lib/firebase"
import type { Customer } from "@/types/customer"
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

const CUSTOMERS_COLLECTION = "customers"

export const addCustomerService = async (
  customer: Omit<Customer, "id">,
  shopId: string,
): Promise<{ id: string; customer: Customer }> => {
  try {
    const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
      ...customer,
      shopId,
    })

    const newCustomer: Customer = {
      ...customer,
      id: docRef.id,
    }

    return { id: docRef.id, customer: newCustomer }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add customer"
    throw new Error(message)
  }
}

export const getCustomersByShopService = async (shopId: string): Promise<Customer[]> => {
  try {
    const q = query(
      collection(db, CUSTOMERS_COLLECTION),
      where("shopId", "==", shopId),
    )

    const querySnapshot = await getDocs(q)
    const customers: Customer[] = []

    querySnapshot.forEach((docSnapshot) => {
      customers.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Customer)
    })

    return customers
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch customers"
    throw new Error(message)
  }
}

export const updateCustomerService = async (
  customerId: string,
  updates: Partial<Customer>,
): Promise<void> => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId)
    await updateDoc(customerRef, updates)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update customer"
    throw new Error(message)
  }
}

export const deleteCustomerService = async (customerId: string): Promise<void> => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId)
    await deleteDoc(customerRef)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete customer"
    throw new Error(message)
  }
}

export const getCustomerService = async (customerId: string): Promise<Customer | null> => {
  try {
    const customerRef = doc(db, CUSTOMERS_COLLECTION, customerId)
    const snapshot = await getDoc(customerRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Customer
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch customer"
    throw new Error(message)
  }
}

export const getAllCustomersService = async (): Promise<Customer[]> => {
  try {
    const q = query(collection(db, CUSTOMERS_COLLECTION))
    const querySnapshot = await getDocs(q)
    const customers: Customer[] = []

    querySnapshot.forEach((docSnapshot) => {
      customers.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Customer)
    })

    return customers
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch customers"
    throw new Error(message)
  }
}
