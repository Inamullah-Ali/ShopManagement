"use client";

import { useEffect, useState } from "react";
import { PencilLine, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Expenses } from "@/types/expense";
import { useExpenseStore } from "@/store/expensestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  expense: Expenses;
};

export function EditExpenseDialogue({ expense }: Props) {
  const updateExpense = useExpenseStore((state) => state.updateExpense);
  const recordCreditExpensePayment = useExpenseStore(
    (state) => state.recordCreditExpensePayment
  );

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [creditPaymentAmount, setCreditPaymentAmount] = useState(0);

  useEffect(() => {
    if (open) {
      setPaidAmount("");
      setCreditPaymentAmount(0);
    }
  }, [open, expense.id, expense.paidamount]);

  const handleUpdate = async () => {
    setIsSubmitting(true);

    try {
      const total = expense.totalamount;

      if (expense.paymentmethod === "Credit") {
        const paymentAmount = Math.max(Number(creditPaymentAmount) || 0, 0);
        const remaining = total - expense.paidamount;

        if (paymentAmount <= 0) {
          throw new Error("Please enter a credit payment amount.");
        }

        if (paymentAmount > remaining) {
          throw new Error(`Payment cannot exceed remaining balance of PKR ${remaining.toLocaleString()}.`);
        }

        recordCreditExpensePayment(
          expense.id,
          paymentAmount,
          new Date().toISOString()
        );

        toast.success("Payment recorded successfully.");
        setOpen(false);
        return;
      }

      const newPayment = Number(paidAmount || 0);
      const totalPaid = expense.paidamount + newPayment;

      if (newPayment <= 0) {
        throw new Error("Please enter a payment amount.");
      }

      if (totalPaid > total) {
        throw new Error(`Total paid amount cannot exceed total expense of PKR ${total.toLocaleString()}. Current: PKR ${expense.paidamount.toLocaleString()}, Max additional: PKR ${(total - expense.paidamount).toLocaleString()}`);
      }

      const status = totalPaid >= total ? "Complete" : "Pending";

      updateExpense(expense.id, {
        paidamount: totalPaid,
        status,
      });

      toast.success(
        status === "Complete"
          ? "Expense payment completed successfully."
          : "Payment updated successfully."
      );
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update payment";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

const remaining = Math.max(
  expense.totalamount - expense.paidamount,
  0
);
const newPayment = Number(paidAmount || 0);
const totalPaidAfterUpdate = expense.paymentmethod === "Credit" ? expense.paidamount : expense.paidamount + newPayment;
const pendingAmount = Math.max(
  expense.totalamount - totalPaidAfterUpdate,
  0,
);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <PencilLine size={16} color="blue" className="cursor-pointer" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {expense.paymentmethod === "Credit"
              ? "Add Payment"
              : "Update Payment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {expense.paymentmethod === "Credit" ? (
            <>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <Input
                    value={expense.totalamount}
                    readOnly
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <Input
                    value={remaining}
                    readOnly
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>

                <div>
                  <p className="text-sm text-foreground">Amount Paid Now</p>
                  <Input
                    type="number"
                    value={creditPaymentAmount || ""}
                    onChange={(e) =>
                      setCreditPaymentAmount(Number(e.target.value || 0))
                    }
                    placeholder="Enter payment amount"
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Expense Name
                </label>
                <Input value={expense.expensename} disabled className="mt-1" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Total Amount
                </label>
                <Input
                  value={`PKR ${expense.totalamount.toLocaleString()}`}
                  disabled
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">
                  Current Paid Amount
                </label>
                <Input
                  value={`PKR ${expense.paidamount.toLocaleString()}`}
                  disabled
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">
                  Add Payment
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount to add"
                  value={paidAmount || ""}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="rounded-md border p-3 text-sm space-y-2">
            <p>
              Status:
              <strong
                className={
                  pendingAmount <= 0 ? "text-green-600" : "text-orange-600"
                }
              >
                {" "}
                {pendingAmount <= 0 ? "Complete" : "Pending"}
              </strong>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            onClick={handleUpdate}
            className="bg-purple-500 text-white hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
