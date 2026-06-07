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
import type { Customer, CustomerFormValues } from "@/types/customer";
import { useCustomerStore } from "@/store/customerstore";
import { PencilLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type EditCustomerDialogueProps = {
  customer: Customer;
};

const createDefaultValues = (customer: Customer): CustomerFormValues => ({
  name: customer.name,
  phoneNumber: customer.phoneNumber.toString(),
  address: customer.address ?? "",
  joinDate: customer.joinDate,
  status: customer.status,
});

export function EditCustomerDialogue({ customer }: EditCustomerDialogueProps) {
  const [open, setOpen] = useState(false);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);
  const defaultValues = useMemo(() => createDefaultValues(customer), [customer]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues,
  });

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

  const onSubmit = (data: CustomerFormValues) => {
    updateCustomer(customer.id, data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        size="icon"
        className="cursor-pointer text-blue-600 hover:text-blue-700 bg-transparent"
        aria-label={`Edit customer ${customer.name}`}
        onClick={() => setOpen(true)}
      >
        <PencilLine size={16} />
      </Button>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update the customer's details.
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
              Update
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
