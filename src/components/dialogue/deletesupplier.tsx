import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Supplier } from "@/types/supplier";
import { useSupplierStore } from "@/store/supplierstore";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type DeleteSupplierDialogueProps = {
  supplier: Supplier;
};

export function DeleteSupplierDialogue({ supplier }: DeleteSupplierDialogueProps) {
  const [open, setOpen] = useState(false);
  const deleteSupplier = useSupplierStore((state) => state.deleteSupplier);

  const handleDelete = () => {
    deleteSupplier(supplier.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        size="icon"
        className="cursor-pointer text-red-600 hover:text-red-700 bg-transparent"
        aria-label={`Delete supplier ${supplier.name}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 size={16} />
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Supplier</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {supplier.name}?
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
