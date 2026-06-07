import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerStore } from "@/store/customerstore";
import { useProductStore } from "@/store/addproductstore";
import { useSalesStore } from "@/store/salesstore";
import { useAuthStore } from "@/store/authstore";
import type { Product } from "@/types/products";
import type {
  CompleteSalePayload,
  SaleDiscountType,
  SaleDraftItem,
  SalePaymentMethod,
} from "@/types/sale";
import { Plus, Search, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useMemo,
  useState,
  type ReactNode,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

type AddSaleDialogueProps = {
  trigger?: ReactNode;
  onComplete?: (sale: CompleteSalePayload) => Promise<void> | void;
};

const paymentMethods: SalePaymentMethod[] = ["Cash", "Online", "Credit"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function AddSaleDialogue({ trigger, onComplete }: AddSaleDialogueProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const getProductsByShop = useProductStore((state) => state.getProductsByShop);
  const products = currentUser?.firebaseUid ? getProductsByShop(currentUser.firebaseUid) : [];
  const customers = useCustomerStore((state) => state.customers);
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const addSaleFromStore = useSalesStore((state) => state.addSale);
  const completeSaleHandler = onComplete ?? addSaleFromStore;

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedProductIndex, setHighlightedProductIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<SaleDraftItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] =
    useState<string>("manual");
  const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod>("Cash");
  const [discountType, setDiscountType] =
    useState<SaleDiscountType>("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [amountPaidNow, setAmountPaidNow] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (normalizedSearchTerm.length === 0) {
      return [];
    }

    return products.filter(
      (product) =>
        product.stock > 0 &&
        product.name.toLowerCase().includes(normalizedSearchTerm),
    );
  }, [products, searchTerm]);

  const getProductStock = (productId: SaleDraftItem["id"]) =>
    products.find((product) => product.id === productId)?.stock ?? 0;

  const showStockLimitToast = (
    productName: string,
    availableQuantity: number,
  ) => {
    toast.error("Insufficient stock", {
      description: `${productName} - only ${availableQuantity} available`,
    });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setHighlightedProductIndex(0);
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (filteredProducts.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedProductIndex((currentIndex) =>
        Math.min(currentIndex + 1, filteredProducts.length - 1),
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedProductIndex((currentIndex) =>
        Math.max(currentIndex - 1, 0),
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedProduct = filteredProducts[highlightedProductIndex];

      if (selectedProduct) {
        addProductToSale(selectedProduct);
      }
    }
  };

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const hasValidationError = selectedItems.some((item) => {
    const availableQuantity = getProductStock(item.id);
    return item.quantity < 1 || item.quantity > availableQuantity;
  });
  const amountPaidInvalid =
    paymentMethod === "Credit" && (Number(amountPaidNow) < 0 || Number(amountPaidNow) > subtotal);
  const missingNameForCredit =
    paymentMethod === "Credit" &&
    selectedCustomerId === "manual" &&
    customerName.trim() === "";
  const parsedDiscountValue = Number(discountValue) || 0;
  const parsedAmountPaidNow = Number(amountPaidNow) || 0;

  const totalDiscount =
    discountType === "percentage"
      ? (subtotal * Math.min(Math.max(parsedDiscountValue, 0), 100)) / 100
      : Math.min(Math.max(parsedDiscountValue, 0), subtotal);

  const billTotal = Math.max(subtotal - totalDiscount, 0);

  const amountPaid = paymentMethod === "Credit" ? Math.max(parsedAmountPaidNow, 0) : billTotal;
  const remainingBalance = Math.max(billTotal - amountPaid, 0);

  const displayDiscountOrRemaining = paymentMethod === "Credit" ? remainingBalance : totalDiscount;
  const displayTotalPayment = paymentMethod === "Credit" ? amountPaid : billTotal;

  const resetForm = () => {
    setSearchTerm("");
    setHighlightedProductIndex(0);
    setSelectedItems([]);
    setCustomerName("");
    setSelectedCustomerId("manual");
    setPaymentMethod("Cash");
    setDiscountType("percentage");
    setDiscountValue("");
    setAmountPaidNow("");
    setDueDate("");
  };

  const handleCustomerSelectionChange = (value: string) => {
    setSelectedCustomerId(value);

    if (value === "manual") {
      return;
    }

    const matchedCustomer = customers.find(
      (customer) => String(customer.id) === value,
    );

    if (matchedCustomer) {
      setCustomerName(matchedCustomer.name);
    }
  };

  const handleDiscountChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Allow only digits and a single decimal point
    let v = event.target.value.replace(/[^0-9.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2) {
      v = parts[0] + "." + parts.slice(1).join("");
    }
    setDiscountValue(v);
  };

  const handleDiscountBlur = () => {
    const n = Number(discountValue) || 0;
    if (discountType === "percentage") {
      if (n < 0) setDiscountValue("0");
      else if (n > 100) setDiscountValue("100");
    } else {
      if (n < 0) setDiscountValue("0");
    }
  };

  const handleAmountPaidNowChange = (event: ChangeEvent<HTMLInputElement>) => {
    let v = event.target.value.replace(/[^0-9.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2) {
      v = parts[0] + "." + parts.slice(1).join("");
    }
    setAmountPaidNow(v);
  };

  const handleAmountPaidNowBlur = () => {
    const n = Number(amountPaidNow) || 0;
    if (n < 0) setAmountPaidNow("0");
    if (n > subtotal) setAmountPaidNow(String(subtotal));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  };

  const addProductToSale = (product: Product) => {
    setSelectedItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (product.stock <= 0) {
        showStockLimitToast(product.name, 0);
        return currentItems;
      }

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          showStockLimitToast(product.name, product.stock);
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id: product.id,
          name: product.name,
          price: product.sellPrice,
          quantity: 1,
        },
      ];
    });

    setSearchTerm("");
    setHighlightedProductIndex(0);
  };

  const updateQuantityInput = (
    itemId: SaleDraftItem["id"],
    inputValue: string,
  ) => {
    if (inputValue === "") {
      setSelectedItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId ? { ...item, quantity: 0 } : item,
        ),
      );
      return;
    }

    const parsedQuantity = Number(inputValue);
    if (Number.isNaN(parsedQuantity)) {
      return;
    }

    const nextQuantity = Math.max(Math.floor(parsedQuantity), 0);

    setSelectedItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: nextQuantity } : item,
      ),
    );
  };

  const finalizeQuantityInput = (itemId: SaleDraftItem["id"]) => {
    setSelectedItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: Math.max(item.quantity, 1),
            }
          : item,
      ),
    );
  };

  const removeItem = (itemId: SaleDraftItem["id"]) => {
    setSelectedItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  };

  const handleCompleteSale = async () => {
    if (selectedItems.length === 0) {
      return;
    }

    const invalidQuantityItem = selectedItems.find((item) => item.quantity < 1);
    if (invalidQuantityItem) {
      toast.error("Invalid quantity", {
        description: `${invalidQuantityItem.name} - quantity must be at least 1`,
      });
      return;
    }

    const invalidItem = selectedItems.find((item) => {
      const availableQuantity = getProductStock(item.id);
      return item.quantity > availableQuantity;
    });

    if (invalidItem) {
      showStockLimitToast(invalidItem.name, getProductStock(invalidItem.id));
      return;
    }

    const normalizedCustomerName = customerName.trim();
    const selectedCustomer =
      selectedCustomerId === "manual"
        ? undefined
        : customers.find(
            (customer) => String(customer.id) === selectedCustomerId,
          );

    if (paymentMethod === "Credit" && selectedCustomerId === "manual" && !normalizedCustomerName) {
      toast.error("Customer name is required for credit sales");
      return;
    }

    if (paymentMethod === "Credit") {
      const paid = parsedAmountPaidNow;
      if (paid < 0 || paid > billTotal) {
        toast.error("Invalid paid amount");
        return;
      }
    }

    let finalCustomerId = selectedCustomer?.id;

    if (paymentMethod === "Credit" && selectedCustomerId === "manual") {
      if (!currentUser?.firebaseUid) {
        toast.error("Unable to save customer: user not found.");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      await addCustomer(
        {
          name: normalizedCustomerName,
          phoneNumber: "",
          address: "",
          joinDate: today,
          status: "Active",
        },
        currentUser.firebaseUid,
      );

      const allCustomers = useCustomerStore.getState().customers;
      const newCustomer = allCustomers.find(
        (c) => c.name === normalizedCustomerName && c.joinDate === today,
      );
      if (newCustomer) finalCustomerId = newCustomer.id;
    }

    const completeSalePayload: CompleteSalePayload = {
      shopId: currentUser?.firebaseUid || "",
      customerName: normalizedCustomerName,
      customerId: finalCustomerId,
      customerPhoneNumber: selectedCustomer?.phoneNumber,
      paymentMethod,
      items: selectedItems,
      subtotal,
      discountType,
      discountValue: parsedDiscountValue,
      totalDiscount,
      totalPayment: billTotal,
      amountPaidNow: paymentMethod === "Credit" ? parsedAmountPaidNow : undefined,
      dueDate: paymentMethod === "Credit" ? (dueDate.trim() || undefined) : undefined,
    };

    if (!completeSalePayload.shopId) {
      toast.error("Unable to save sale. Please login again and try.");
      return;
    }

    if (!completeSaleHandler) {
      toast.error("Sale save handler is not configured.");
      return;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(completeSaleHandler(completeSalePayload));
      toast.success("Sale completed successfully.");
      handleOpenChange(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save sale.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="flex w-full cursor-pointer items-center gap-2 bg-purple-500 text-white hover:bg-purple-600 hover:text-white"
          >
            <Plus size={16} /> Add Sale
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl" showCloseButton={false}>
        <DialogHeader className="border-b p-0 h-16 flex-row justify-between">
          <div>
            <DialogTitle>Add Sale</DialogTitle>
            <DialogDescription>
              Search products, build the cart, and finalize the sale.
            </DialogDescription>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {selectedItems.length} item
              {selectedItems.length === 1 ? "" : "s"}
            </p>
          </div>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <div className="space-y-2">
            <div className="space-y-2 bg-background">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search products by name"
                  className="pl-9"
                />
                {searchTerm.trim().length > 0 && (
                  <div className="absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-lg border bg-popover shadow-lg">
                    {filteredProducts.length > 0 ? (
                      <div className="max-h-56 overflow-auto py-1">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => addProductToSale(product)}
                            onMouseEnter={() => {
                              const productIndex = filteredProducts.findIndex(
                                (candidate) => candidate.id === product.id,
                              );
                              setHighlightedProductIndex(productIndex);
                            }}
                            className={`flex w-full items-center justify-between gap-4 px-3 py-3 text-left transition-colors hover:bg-muted/60 ${
                              filteredProducts[highlightedProductIndex]?.id ===
                              product.id
                                ? "bg-muted/70"
                                : ""
                            }`}
                          >
                            <div>
                              <p className="font-medium">{product.name}</p>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              Rs {formatCurrency(product.sellPrice)}
                            </p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-6 text-sm text-muted-foreground">
                        No products match your search.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-background">
              <div className="h-40 overflow-hidden rounded-lg border">
                <div className="h-full overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Product Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total Price</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.length > 0 ? (
                        selectedItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell>
                              Rs {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                min="1"
                                value={
                                  item.quantity === 0
                                    ? ""
                                    : String(item.quantity)
                                }
                                onChange={(event) =>
                                  updateQuantityInput(
                                    item.id,
                                    event.target.value,
                                  )
                                }
                                onBlur={() => finalizeQuantityInput(item.id)}
                                className={`h-8 w-14 rounded-md ${
                                  item.quantity > getProductStock(item.id)
                                    ? "border-red-500 focus-visible:ring-1 focus-visible:ring-red-500"
                                    : "focus-visible:ring-1"
                                }`}
                              />
                            </TableCell>
                            <TableCell>
                              Rs {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="size-8 cursor-pointer text-muted-foreground hover:text-destructive"
                              >
                                <X size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-muted-foreground"
                          >
                            No sale items selected yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mt-2 space-y-2">
                <div className="flex flex-row gap-4 sm:flex-row sm:items-center">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select Customer
                    </label>
                    <div className="w-fit min-w-56">
                      <Select
                        value={selectedCustomerId}
                        onValueChange={handleCustomerSelectionChange}
                      >
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Select existing customer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">
                            Select manually
                          </SelectItem>
                          {customers.map((customer) => (
                            <SelectItem
                              key={customer.id}
                              value={String(customer.id)}
                            >
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="w-fit">
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) =>
                        setPaymentMethod(value as SalePaymentMethod)
                      }
                    >
                      <SelectTrigger className="w-full cursor-pointer">
                        <SelectValue placeholder="Select payment method cursor-pointer" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem
                            key={method}
                            value={method}
                            className="cursor-pointer"
                          >
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background border-l pl-4 lg:pl-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Sale Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Review totals before completing the sale.
                </p>
              </div>

              <div className="space-y-3 bg-background">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    Rs {formatCurrency(subtotal)}
                  </span>
                </div>

                {paymentMethod === "Credit" ? (
                  <div className="flex flex-row items-center gap-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount Paid Now</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={amountPaidNow}
                        onChange={handleAmountPaidNowChange}
                        onBlur={handleAmountPaidNowBlur}
                        placeholder="e.g. 250"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Due Date</label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discount Type</label>
                      <Select
                        value={discountType}
                        onValueChange={(value) =>
                          setDiscountType(value as SaleDiscountType)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                          <SelectItem value="fixed">Fixed Amount (Rs)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Discount Value</label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={discountValue}
                        onChange={handleDiscountChange}
                        onBlur={handleDiscountBlur}
                        placeholder={
                          discountType === "percentage" ? "e.g. 10" : "e.g. 250"
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {paymentMethod === "Credit" ? "Remaining Balance" : "Total Discount"}
                  </span>
                  <span className="font-medium text-purple-400">
                    {paymentMethod === "Credit" ? "Rs " : "- Rs "}
                    {formatCurrency(displayDiscountOrRemaining)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-3 text-base">
                  <span className="font-semibold">Total Payment</span>
                  <span className="font-semibold">
                    Rs {formatCurrency(displayTotalPayment)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{paymentMethod}</span>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                
                <Button
                  type="button"
                  onClick={handleCompleteSale}
                  className="cursor-pointer bg-purple-500 text-white hover:bg-purple-600 w-full h-10 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={
                    isSaving ||
                    selectedItems.length === 0 ||
                    hasValidationError ||
                    amountPaidInvalid ||
                    missingNameForCredit
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Complete Sale"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
