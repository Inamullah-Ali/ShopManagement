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
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { CustomerFormValues } from "@/types/customer";

type AddCustomerDialogueProps = {
  trigger?: ReactNode;
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const defaultValues: CustomerFormValues = {
  name: "",
  phoneNumber: "",
  address: "",
  joinDate: getTodayDate(),
  status: "Active",
};

export function AddCustomerDialogue({ trigger }: AddCustomerDialogueProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast.error("Unable to save customer: user not found.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addCustomer(data, currentUser.firebaseUid);
      toast.success("Customer added successfully.");
      closeAndReset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to add customer.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
              <p className="text-sm font-medium text-muted-foreground">
                Customer Name
              </p>
              <Input
                placeholder="Enter customer name"
                {...register("name", { required: "Customer name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Phone Number
              </p>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="Enter phone number"
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Only numbers are allowed",
                  },
                })}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /\D/g,
                    "",
                  );
                }}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Address (Optional)
              </p>
              <Input placeholder="Enter address" {...register("address")} />
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Join Date
              </p>
              <Input
                type="date"
                {...register("joinDate", { required: "Join date is required" })}
              />
              {errors.joinDate && (
                <p className="text-sm text-red-500">
                  {errors.joinDate.message}
                </p>
              )}
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
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
              <Button
                variant="outline"
                disabled={isSubmitting}
                className="cursor-pointer"
                type="button"
              >
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
                  Adding...
                </span>
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
