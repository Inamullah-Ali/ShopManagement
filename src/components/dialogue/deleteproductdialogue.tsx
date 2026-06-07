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
import { Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useProductStore } from "@/store/addproductstore";
import type { Product } from "@/types/products";

type DeleteProductDialogueProps = {
  product: Product;
  trigger?: ReactNode;
};

export function DeleteProductDialogue({
  product,
  trigger,
}: DeleteProductDialogueProps) {
  const [open, setOpen] = useState(false);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  const onDelete = async () => {
    try {
      await deleteProduct(product.id);
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete product";
      alert(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-center h-full">
          {trigger ?? (
            <Trash2
              size={16}
              className="cursor-pointer text-muted-foreground"
              color="red"
            />
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {product.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-600 cursor-pointer text-white"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
