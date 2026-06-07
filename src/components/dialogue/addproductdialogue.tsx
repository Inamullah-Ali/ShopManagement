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
import { Plus } from "lucide-react";
import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useProductStore } from "@/store/addproductstore";
import { useAuthStore } from "@/store/authstore";
import type { Product, ProductFormData } from "@/types/products";

type AddProductDialogueProps = {
  trigger?: ReactNode;
};

const defaultProductFormValues: ProductFormData = {
  name: "",
  image: "",
  purchasePrice: "" as unknown as number,
  sellPrice: "" as unknown as number,
  stock: "" as unknown as number,
  status: "Healthy",
};

export function AddProductDialogue({ trigger }: AddProductDialogueProps) {
  const [open, setOpen] = useState(false);
  const [imageSource, setImageSource] = useState<"url" | "device">("device");
  const [selectedImageName, setSelectedImageName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addProduct = useProductStore((state) => state.addProduct);
  const currentUser = useAuthStore((state) => state.currentUser);

  const getStatusFromStock = (stock: number): Product["status"] => {
    if (stock === 0) {
      return "Out of Stock";
    }

    if (stock >= 10) {
      return "Healthy";
    }

    return "Low Stock";
  };

  const clearFormState = () => {
    reset(defaultProductFormValues);
    setImageSource("device");
    setSelectedImageName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: defaultProductFormValues,
  });

  const closeAndResetForm = () => {
    clearFormState();
    setOpen(false);
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!currentUser || !currentUser.firebaseUid) {
      alert("You must be logged in to add a product");
      return;
    }

    const productData = {
      ...data,
      status: getStatusFromStock(data.stock),
    };

    try {
      await addProduct(productData, currentUser.firebaseUid);
      closeAndResetForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to add product";
      alert(message);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      clearFormState();
    }
  };

  const handleDeviceImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImageName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result === "string") {
        setValue("image", result, { shouldValidate: true, shouldDirty: true });
      }
    };

    reader.readAsDataURL(file);
  };

  const useUrlInput = () => {
    setImageSource("url");
    setSelectedImageName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setValue("image", "", { shouldDirty: true });
  };

  const useDeviceInput = () => {
    setImageSource("device");
    setSelectedImageName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setValue("image", "", { shouldDirty: true });
    fileInputRef.current?.click();
  };

  const imageValue = watch("image");
  const productInitials =
    watch("name")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="cursor-pointer bg-purple-500 hover:bg-purple-600 text-white hover:text-white"
          >
            <Plus size={16} />
            Add Products
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              Fill in the details for the new product.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">
                Product Name
              </p>
              <div>
                <Input
                  placeholder="Enter Product Name"
                  {...register("name", {
                    required: "Product name is required",
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-start gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/40">
                  {imageValue ? (
                    <img
                      src={imageValue}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {productInitials}
                    </span>
                  )}
                </div>

                <div className="w-full flex flex-col h-full gap-3">
                  <div className="flex flex-wrap items-center gap-1 justify-end">
                    <Button
                      type="button"
                      variant={imageSource === "device" ? "default" : "outline"}
                      className={
                        imageSource === "device"
                          ? "bg-purple-300 text-black cursor-pointer hover:bg-purple-400 border-2 border-purple-300 hover:text-black"
                          : "cursor-pointer"
                      }
                      onClick={useDeviceInput}
                    >
                      Upload from device
                    </Button>
                    <Button
                      type="button"
                      variant={imageSource === "url" ? "default" : "outline"}
                      className={
                        imageSource === "url"
                          ? "bg-purple-300 text-black cursor-pointer hover:bg-purple-400 border-2 border-purple-300 hover:text-black"
                          : "cursor-pointer"
                      }
                      onClick={useUrlInput}
                    >
                      Add URL
                    </Button>
                  </div>
                  <div className="min-w-0 flex-1">
                    {imageSource === "url" ? (
                      <Input placeholder="Image URL" {...register("image")} />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleDeviceImageChange}
                          className="hidden"
                        />
                        <Input
                          readOnly
                          value={selectedImageName || "No image selected"}
                          placeholder="No image selected"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {selectedImageName
                            ? "Reselect image"
                            : "Choose image"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {errors.image && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.image.message}
                </p>
              )}
            </div>

            <div className="flex flex-row justify-between gap-2">
              <div className="grid w-full gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Purchase Price
                </p>
                <div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter Product Purchase Price"
                    {...register("purchasePrice", {
                      required: true,
                      setValueAs: (value) => {
                        const digits = String(value).replace(/\D/g, "");
                        return digits === "" ? undefined : Number(digits);
                      },
                    })}
                    onInput={(event) => {
                      event.currentTarget.value =
                        event.currentTarget.value.replace(/\D/g, "");
                    }}
                  />
                </div>
              </div>

              <div className="grid w-full gap-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Sell Price
                </p>
                <div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter Product Sell Price"
                    {...register("sellPrice", {
                      required: true,
                      setValueAs: (value) => {
                        const digits = String(value).replace(/\D/g, "");
                        return digits === "" ? undefined : Number(digits);
                      },
                    })}
                    onInput={(event) => {
                      event.currentTarget.value =
                        event.currentTarget.value.replace(/\D/g, "");
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1">
              <p className="text-sm font-medium text-muted-foreground">Stock</p>
              <div>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter Product Stock"
                  {...register("stock", {
                    required: true,
                    setValueAs: (value) => {
                      const digits = String(value).replace(/\D/g, "");
                      return digits === "" ? undefined : Number(digits);
                    },
                  })}
                  onInput={(event) => {
                    event.currentTarget.value =
                      event.currentTarget.value.replace(/\D/g, "");
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white cursor-pointer"
            >
              Add Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
