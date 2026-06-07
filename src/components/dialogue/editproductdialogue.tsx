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
import { PencilLine, Loader2 } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useProductStore } from "@/store/addproductstore";
import { uploadFile } from "@/service/appwritestorage";
import type { Product, ProductFormData } from "@/types/products";

type EditProductDialogueProps = {
  product: Product;
  trigger?: ReactNode;
};

export function EditProductDialogue({
  product,
  trigger,
}: EditProductDialogueProps) {
  const [open, setOpen] = useState(false);
  const [imageSource, setImageSource] = useState<"url" | "device">("device");
  const [selectedImageName, setSelectedImageName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const updateProduct = useProductStore((state) => state.updateProduct);

  const getDefaultValues = (): ProductFormData => ({
    name: product.name,
    image: product.image,
    purchasePrice: product.purchasePrice,
    sellPrice: product.sellPrice,
    stock: product.stock,
    status: product.status === "InStock" ? "Healthy" : product.status,
    shopId: product.shopId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: getDefaultValues(),
  });

  const clearFormState = () => {
    reset(getDefaultValues());
    setImageSource("device");
    setSelectedImageName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (open) {
      clearFormState();
    }
  }, [open, product]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    let imageUrl = data.image;

    if (imageSource === "device" && selectedFile) {
      try {
        const uploadResult = await uploadFile(selectedFile);
        imageUrl = uploadResult.url;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to upload product image";
        toast.error(message);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await updateProduct(product.id, {
        ...data,
        image: imageUrl,
      });
      toast.success("Product updated successfully.");
      clearFormState();
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update product";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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

    setSelectedFile(file);
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
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setValue("image", "", { shouldDirty: true });
  };

  const useDeviceInput = () => {
    setImageSource("device");
    setSelectedImageName("");
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setValue("image", "", { shouldDirty: true });
    fileInputRef.current?.click();
  };

  const imageValue = watch("image");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="flex h-full items-center justify-center">
          {trigger ?? (
            <PencilLine
              size={16}
              className="cursor-pointer text-muted-foreground"
              color="blue"
            />
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details and save the changes.
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
                    <span className="px-2 text-center text-xs text-muted-foreground">
                      Preview
                    </span>
                  )}
                </div>

                <div className="w-full flex flex-col h-full gap-3">
                  <div className="flex flex-wrap items-center justify-end gap-1">
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
                      <Input
                        placeholder="Image URL"
                        {...register("image", {
                          required: "Image is required",
                        })}
                      />
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
                disabled={isSubmitting}
                className="cursor-pointer"
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
                  Updating...
                </span>
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
