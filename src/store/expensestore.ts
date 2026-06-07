import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Expenses, ExpensePaymentEntry } from "@/types/expense";
import {
  addExpenseService,
  updateExpenseService,
  deleteExpenseService,
  getExpensesByShopService,
} from "@/service/expense";

type ExpenseStore = {
  expenses: Expenses[];

  addExpense: (expense: Omit<Expenses, "id">, shopId: string) => Promise<void>;

  updateExpense: (
    id: string | number,
    updatedExpense: Partial<Expenses>
  ) => Promise<void>;

  deleteExpense: (id: string | number) => Promise<void>;

  recordCreditExpensePayment: (
    id: string | number,
    amount: number,
    date: string
  ) => Promise<void>;

  loadExpensesByShop: (shopId: string) => Promise<void>;
};

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],

      addExpense: async (expense, shopId) => {
        try {
          const { expense: firestoreExpense } = await addExpenseService(
            { ...expense, shopId },
            shopId,
          );

          set((state) => ({
            expenses: [...state.expenses, firestoreExpense],
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to add expense";
          throw new Error(message);
        }
      },

      updateExpense: async (id, updatedExpense) => {
        try {
          await updateExpenseService(String(id), updatedExpense);

          set((state) => ({
            expenses: state.expenses.map((expense) =>
              expense.id === id ? { ...expense, ...updatedExpense } : expense,
            ),
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to update expense";
          throw new Error(message);
        }
      },

      deleteExpense: async (id) => {
        try {
          await deleteExpenseService(String(id));
          set((state) => ({
            expenses: state.expenses.filter(
              (expense) => expense.id !== id,
            ),
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to delete expense";
          throw new Error(message);
        }
      },

      recordCreditExpensePayment: async (id, amount, date) => {
        const paymentAmount = Math.max(Number(amount) || 0, 0);

        if (paymentAmount <= 0) {
          return;
        }

        let updatedExpense: Expenses | undefined;

        set((state) => ({
          expenses: state.expenses.map((expense) => {
            if (expense.id !== id || expense.paymentmethod !== "Credit") {
              return expense;
            }

            const existingPaid = expense.paidamount;
            const totalAmount = expense.totalamount;
            const nextPaid = Math.min(existingPaid + paymentAmount, totalAmount);
            const nextRemaining = Math.max(totalAmount - nextPaid, 0);
            const nextStatus = nextRemaining === 0 ? "Complete" : "Pending";

            const newPaymentEntry: ExpensePaymentEntry = {
              id: `${expense.id}-${Date.now()}`,
              amount: paymentAmount,
              date,
            };

            updatedExpense = {
              ...expense,
              paidamount: nextPaid,
              status: nextStatus,
              creditPayments: [...(expense.creditPayments ?? []), newPaymentEntry],
            };

            return updatedExpense;
          }),
        }));

        if (updatedExpense) {
          try {
            await updateExpenseService(String(id), updatedExpense);
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to record expense payment";
            throw new Error(message);
          }
        }
      },

      loadExpensesByShop: async (shopId) => {
        try {
          const firestoreExpenses = await getExpensesByShopService(shopId);
          set((state) => {
            const existingIds = new Set(state.expenses.map((expense) => String(expense.id)));
            const freshExpenses = firestoreExpenses.filter(
              (expense) => !existingIds.has(String(expense.id)),
            );
            return { expenses: [...state.expenses, ...freshExpenses] };
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to load expenses";
          throw new Error(message);
        }
      },
    }),
    {
      name: "expense-storage",
    }
  )
);