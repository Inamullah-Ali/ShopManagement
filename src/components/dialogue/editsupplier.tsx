import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSupplierStore } from "@/store/supplierstore";
import type { Supplier, SupplierFormValues } from "@/types/supplier";
import { Loader2, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type EditSupplierDialogueProps = {
  supplier: Supplier;
};

const buildDefaultValues = (supplier: Supplier): SupplierFormValues => ({
  name: supplier.name,
  contactperson: supplier.contactperson,
  phoneNumber: supplier.phoneNumber.toString(),
  totalPurchase: supplier.totalPurchase.toString(),
  totalDue: supplier.totalDue.toString(),
  date: supplier.date,
  status: supplier.status,
});

export function EditSupplierDialogue({ supplier }: EditSupplierDialogueProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateSupplier = useSupplierStore((state) => state.updateSupplier);
  const defaultValues = useMemo(() => buildDefaultValues(supplier), [supplier]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({ defaultValues });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [defaultValues, open, reset]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(defaultValues);
    }
  };

  const onSubmit = async (data: SupplierFormValues) => {
    setIsSubmitting(true);

    try {
      await updateSupplier(supplier.id, data);
      toast.success("Supplier updated successfully.");
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update supplier.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        size="icon"
        className="cursor-pointer text-blue-600 hover:text-blue-700 bg-transparent"
        aria-label={`Edit supplier ${supplier.name}`}
        onClick={() => setOpen(true)}
      >
        <PencilLine size={16} />
      </Button>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update the details for the supplier.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Supplier Name</p>
              <Input placeholder="Enter supplier name" {...register("name", { required: "Supplier name is required" })} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
              <Input placeholder="Enter contact person" {...register("contactperson", { required: "Contact person is required" })} />
              {errors.contactperson && <p className="text-sm text-red-500">{errors.contactperson.message}</p>}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
              <Input type="tel" placeholder="Enter phone number" {...register("phoneNumber", { required: "Phone number is required" })} />
              {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Total Purchase</p>
              <Input type="number" placeholder="Enter total purchase" {...register("totalPurchase", { required: "Total purchase is required" })} />
              {errors.totalPurchase && <p className="text-sm text-red-500">{errors.totalPurchase.message}</p>}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Total Due</p>
              <Input type="number" placeholder="Enter total due" {...register("totalDue", { required: "Total due is required" })} />
              {errors.totalDue && <p className="text-sm text-red-500">{errors.totalDue.message}</p>}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <Input type="date" {...register("date", { required: "Date is required" })} />
              {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <select className="h-10 rounded-md border bg-background px-3 text-sm" {...register("status")}>
                <option value="Active">Active</option>
                <option value="InActive">InActive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting} className="cursor-pointer" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-500 hover:bg-purple-600 cursor-pointer text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                "Update"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
