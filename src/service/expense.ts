import { db } from "../../lib/firebase"
import type { Expenses } from "@/types/expense"
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

const EXPENSES_COLLECTION = "expenses"

export const addExpenseService = async (
  expense: Omit<Expenses, "id">,
  shopId: string,
): Promise<{ id: string; expense: Expenses }> => {
  try {
    const expenseData = Object.fromEntries(
      Object.entries({ ...expense, shopId }).filter(
        ([, value]) => value !== undefined,
      ),
    )

    const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), expenseData)

    const newExpense: Expenses = {
      ...expense,
      id: docRef.id,
    }

    return { id: docRef.id, expense: newExpense }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to add expense"
    throw new Error(message)
  }
}

export const getExpensesByShopService = async (shopId: string): Promise<Expenses[]> => {
  try {
    const q = query(
      collection(db, EXPENSES_COLLECTION),
      where("shopId", "==", shopId),
    )

    const querySnapshot = await getDocs(q)
    const expenses: Expenses[] = []

    querySnapshot.forEach((docSnapshot) => {
      expenses.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Expenses)
    })

    return expenses
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch expenses"
    throw new Error(message)
  }
}

export const updateExpenseService = async (
  expenseId: string,
  updates: Partial<Expenses>,
): Promise<void> => {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId)
    const updateData = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined),
    )

    await updateDoc(expenseRef, updateData)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update expense"
    throw new Error(message)
  }
}

export const deleteExpenseService = async (expenseId: string): Promise<void> => {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId)
    await deleteDoc(expenseRef)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete expense"
    throw new Error(message)
  }
}

export const getExpenseService = async (expenseId: string): Promise<Expenses | null> => {
  try {
    const expenseRef = doc(db, EXPENSES_COLLECTION, expenseId)
    const snapshot = await getDoc(expenseRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    } as Expenses
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch expense"
    throw new Error(message)
  }
}

export const getAllExpensesService = async (): Promise<Expenses[]> => {
  try {
    const q = query(collection(db, EXPENSES_COLLECTION))
    const querySnapshot = await getDocs(q)
    const expenses: Expenses[] = []

    querySnapshot.forEach((docSnapshot) => {
      expenses.push({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as Expenses)
    })

    return expenses
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch expenses"
    throw new Error(message)
  }
}
