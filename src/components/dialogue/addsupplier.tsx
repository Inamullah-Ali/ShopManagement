import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authstore";
import { useSupplierStore } from "@/store/supplierstore";
import type { SupplierFormValues } from "@/types/supplier";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";

type AddSupplierDialogueProps = {
  trigger?: ReactNode;
};

const defaultValues: SupplierFormValues = {
  name: "",
  contactperson: "",
  phoneNumber: "",
  totalPurchase: "0",
  totalDue: "0",
  date: "",
  status: "Active",
};

export function AddSupplierDialogue({ trigger }: AddSupplierDialogueProps) {
  const [open, setOpen] = useState(false);
  const addSupplier = useSupplierStore((state) => state.addSupplier);
  const currentUser = useAuthStore((state) => state.currentUser);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({ defaultValues });

  const closeAndReset = () => {
    reset(defaultValues);
    setOpen(false);
  };

  const onSubmit = async (data: SupplierFormValues) => {
    if (!currentUser?.firebaseUid) {
      alert("Unable to save supplier: user not found.");
      return;
    }

    await addSupplier(
      {
        ...data,
        totalPurchase: "0",
        totalDue: "0",
      },
      currentUser.firebaseUid,
    );
    closeAndReset();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset(defaultValues);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2 hover:text-white">
            <Plus size={16} /> Add Supplier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
            <DialogDescription>
              Fill in the details for the new supplier.
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
              <Button variant="outline" className="cursor-pointer" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600 cursor-pointer text-white">
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
