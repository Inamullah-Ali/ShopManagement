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
import { useCustomerStore } from "@/store/customerstore";
import { useAuthStore } from "@/store/authstore";
import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { CustomerFormValues } from "@/types/customer";

type AddCustomerDialogueProps = {
  trigger?: ReactNode;
};

const defaultValues: CustomerFormValues = {
  name: "",
  phoneNumber: "",
  address: "",
  joinDate: "",
  status: "Active",
};

export function AddCustomerDialogue({ trigger }: AddCustomerDialogueProps) {
  const [open, setOpen] = useState(false);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const currentUser = useAuthStore((state) => state.currentUser);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues,
  });

  const closeAndReset = () => {
    reset(defaultValues);
    setOpen(false);
  };

  const onSubmit = async (data: CustomerFormValues) => {
    if (!currentUser?.firebaseUid) {
      alert("Unable to save customer: user not found.");
      return;
    }

    await addCustomer(data, currentUser.firebaseUid);
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
          <Button
            variant="outline"
            className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2 hover:text-white"
          >
            <Plus size={16} /> Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>
              Fill in the details for the new customer.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
              <Input
                placeholder="Enter customer name"
                {...register("name", { required: "Customer name is required" })}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
              <Input
                type="tel"
                placeholder="Enter phone number"
                {...register("phoneNumber", { required: "Phone number is required" })}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Address (Optional)</p>
              <Input placeholder="Enter address" {...register("address")} />
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Join Date</p>
              <Input type="date" {...register("joinDate", { required: "Join date is required" })} />
              {errors.joinDate && (
                <p className="text-sm text-red-500">{errors.joinDate.message}</p>
              )}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                {...register("status")}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
