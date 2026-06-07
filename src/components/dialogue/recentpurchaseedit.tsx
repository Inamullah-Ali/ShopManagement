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
import { Input } from "@/components/ui/input";
import { Loader2, PencilLine } from "lucide-react";
import { useState } from "react";
import type { PurchaseHistory } from "@/types/purchasehistory";
import { updatePurchaseService, getPurchaseService } from "@/service/purchase";
import { toast } from "sonner";

type RecentPurchaseEditDialogueProps = {
  purchase: PurchaseHistory;
  onUpdate?: (updatedPurchase: PurchaseHistory) => void;
};

export function RecentPurchaseEditDialogue({ purchase, onUpdate }: RecentPurchaseEditDialogueProps) {
  const [open, setOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState(String(purchase.totalAmount - purchase.totalDue || 0));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalDue = Math.max(purchase.totalAmount - Number(paidAmount || 0), 0);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setPaidAmount(String(purchase.totalAmount - purchase.totalDue || 0));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newTotalDue = Math.max(purchase.totalAmount - Number(paidAmount || 0), 0);
      const newStatus = newTotalDue === 0 ? "Complete" : "Partial";

      if (!purchase.id) {
        throw new Error("Purchase ID not found");
      }

      await updatePurchaseService(String(purchase.id), {
        totalDue: newTotalDue,
        status: newStatus,
      });

      // Fetch the updated purchase from Firestore
      const updatedPurchase = await getPurchaseService(String(purchase.id));
      
      if (updatedPurchase && onUpdate) {
        onUpdate(updatedPurchase);
      }

      toast.success(
        newStatus === "Complete"
          ? "Purchase payment completed successfully."
          : "Payment updated successfully."
      );
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update purchase";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <PencilLine
          size={16}
          className="cursor-pointer text-muted-foreground"
          color="blue"
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Purchase</DialogTitle>
            <DialogDescription>
              Update the payment details for this purchase.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <p className="text-sm font-medium text-muted-foreground">Total Payment</p>
              <p className="text-lg font-bold">PKR {purchase.totalAmount}</p>
            </div>

            <div className="grid gap-2">
              <p className="text-sm font-medium text-muted-foreground">Payment Received</p>
              <Input
                type="number"
                placeholder="Enter payment amount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <p className="text-sm font-medium text-muted-foreground">Remaining Due</p>
              <p className="text-lg font-bold">PKR {totalDue}</p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 cursor-pointer text-white disabled:cursor-not-allowed disabled:opacity-70"
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
        </form>
      </DialogContent>
    </Dialog>
  );
}
