"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { useExpenseStore } from "@/store/expensestore";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  expenseId: string | number;
};

export function DeleteExpenseDialogue({
  expenseId,
}: Props) {
  const deleteExpense = useExpenseStore(
    (state) => state.deleteExpense
  );

  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    deleteExpense(expenseId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trash2
          size={16}
          color="red"
          className="cursor-pointer"
        />
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Delete Expense
          </DialogTitle>

          <DialogDescription>
            Are you sure you want to delete this
            expense?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleDelete}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}