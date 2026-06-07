"use client";

import { useEffect, useState } from "react";
import { PencilLine } from "lucide-react";

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
  const [paidAmount, setPaidAmount] = useState("");
  const [creditPaymentAmount, setCreditPaymentAmount] = useState(0);

  useEffect(() => {
    if (open) {
      setPaidAmount("");
      setCreditPaymentAmount(0);
    }
  }, [open, expense.id, expense.paidamount]);

  const handleUpdate = () => {
    const total = expense.totalamount;

    if (expense.paymentmethod === "Credit") {
      const paymentAmount = Math.max(Number(creditPaymentAmount) || 0, 0);
      const remaining = total - expense.paidamount;

      if (paymentAmount <= 0) {
        alert("Please enter a credit payment amount.");
        return;
      }

      if (paymentAmount > remaining) {
        alert(`Payment cannot exceed remaining balance of PKR ${remaining.toLocaleString()}.`);
        return;
      }

      recordCreditExpensePayment(
        expense.id,
        paymentAmount,
        new Date().toISOString()
      );

      setOpen(false);
      return;
    }

    const newPayment = Number(paidAmount || 0);
    const totalPaid = expense.paidamount + newPayment;

    if (newPayment <= 0) {
      alert("Please enter a payment amount.");
      return;
    }

    if (totalPaid > total) {
      alert(`Total paid amount cannot exceed total expense of PKR ${total.toLocaleString()}. Current: PKR ${expense.paidamount.toLocaleString()}, Max additional: PKR ${(total - expense.paidamount).toLocaleString()}`);
      return;
    }

    const status = totalPaid >= total ? "Complete" : "Pending";

    updateExpense(expense.id, {
      paidamount: totalPaid,
      status,
    });

    setOpen(false);
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
                    className="mt-1"
                  />
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <Input
                    value={remaining}
                    readOnly
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleUpdate}
            className="bg-purple-500 text-white hover:bg-purple-600"
          >
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
