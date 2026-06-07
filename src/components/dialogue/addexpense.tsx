"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authstore";
import { useExpenseStore } from "@/store/expensestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AddExpenseDialogueProps = {
  trigger?: ReactNode;
};

const expenseSuggestions = [
  "Rent",
  "Electric Bill",
  "Internet Bill",
  "Shop Products",
];

const getCategory = (name: string) => {
  const value = name.trim().toLowerCase();

  if (value === "rent") return "Rent";

  if (value === "electric bill" || value === "electricity bill") {
    return "Electric Bill";
  }

  if (value === "internet bill") {
    return "Internet Bill";
  }

  if (value === "shop product" || value === "shop products") {
    return "Shop Products";
  }

  return "Other";
};

export function AddExpenseDialogue({ trigger }: AddExpenseDialogueProps) {
  const addExpense = useExpenseStore((state) => state.addExpense);
  const currentUser = useAuthStore((state) => state.currentUser);

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expenseName, setExpenseName] = useState("");

  const [totalAmount, setTotalAmount] = useState("");

  const [paidAmount, setPaidAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [paymentMethod, setPaymentMethod] = useState<
    "Cash" | "Card" | "Credit"
  >("Cash");

  const resetForm = () => {
    setExpenseName("");
    setTotalAmount("");
    setPaidAmount("");
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod("Cash");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!currentUser?.firebaseUid) {
        throw new Error("Unable to save expense: user not found.");
      }

      const name = expenseName.trim();
      const total = Number(totalAmount);
      const paid = Number(paidAmount || 0);

      if (!name) {
        throw new Error("Expense name is required.");
      }

      if (!totalAmount || Number.isNaN(total) || total <= 0) {
        throw new Error("Total amount must be greater than zero.");
      }

      if ((paymentMethod === "Cash" || paymentMethod === "Card") && (Number.isNaN(paid) || paid <= 0)) {
        throw new Error("Paid amount is required for Cash or Card payments.");
      }

      if (!Number.isNaN(paid) && paid > total) {
        throw new Error("Paid amount cannot be greater than total amount.");
      }

      const status = paid >= total ? "Complete" : "Pending";

      const creditPayments =
        paymentMethod === "Credit" && paid > 0
          ? [
              {
                id: `${Date.now()}-${Math.random()}`,
                amount: paid,
                date: new Date(paymentDate).toISOString(),
                note: "Initial credit payment",
              },
            ]
          : undefined;

      await addExpense(
        {
          expensename: name,
          totalamount: total,
          paidamount: paid,
          paymentmethod: paymentMethod,
          status,
          date: new Date().toISOString(),
          category: getCategory(name),
          creditPayments,
        },
        currentUser.firebaseUid,
      );

      toast.success("Expense added successfully.");
      resetForm();
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save expense.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="cursor-pointer bg-purple-500 text-white hover:bg-purple-600 hover:text-white"
          >
            <Plus size={16} />
            Add Expense
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>

          <DialogDescription>
            Fill in the details for the new expense.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              list="expense-list"
              placeholder="Expense Name"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              disabled={isSubmitting}
            />

            <datalist id="expense-list">
              {expenseSuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </div>

          <Input
            type="number"
            min={0}
            placeholder="Total Amount"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            disabled={isSubmitting}
          />

          <Input
            type="number"
            min={0}
            placeholder="Paid Amount"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            disabled={isSubmitting}
          />

          {paymentMethod === "Credit" && (
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              disabled={isSubmitting}
            />
          )}

          <Select
            value={paymentMethod}
            onValueChange={(value) =>
              setPaymentMethod(value as "Cash" | "Card" | "Credit")
            }
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>

              <SelectItem value="Card">Card</SelectItem>

              <SelectItem value="Credit">Credit</SelectItem>
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-purple-500 text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
