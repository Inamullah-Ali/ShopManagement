import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Customer } from "@/types/customer";
import { useCustomerStore } from "@/store/customerstore";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type DeleteCustomerDialogueProps = {
  customer: Customer;
};

export function DeleteCustomerDialogue({ customer }: DeleteCustomerDialogueProps) {
  const [open, setOpen] = useState(false);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);

  const handleDelete = () => {
    deleteCustomer(customer.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="cursor-pointer text-red-600 hover:text-red-700 bg-transparent"
          aria-label={`Delete customer ${customer.name}`}
        >
          <Trash2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {customer.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 cursor-pointer text-white"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
