import { AddProductDialogue } from "@/components/dialogue/addproductdialogue";
import { AddSupplierDialogue } from "@/components/dialogue/addsupplier";
import PurchaseHistoryTable from "@/components/tables/purchasehistorytable";
import PurchaseProductTable from "../components/tables/purchaseproducttable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useProductStore } from "@/store/addproductstore";
import { useSupplierStore } from "@/store/supplierstore";
import { useAuthStore } from "@/store/authstore";
import { addPurchaseService } from "@/service/purchase";
import type { PurchaseHistory } from "@/types/purchasehistory";
import type { PurchaseProduct } from "@/types/purchaseproduct";

const formatToday = () => new Date().toISOString().split("T")[0];
const purchasePageStorageKey = "purchase-page-storage";

type PurchasePageStorageState = {
  productSearch: string;
  supplierSearch: string;
  highlightedSupplierIndex: number;
  isSupplierDropdownOpen: boolean;
  selectedSupplierId: string;
  purchaseDate: string;
  paymentMethod: string;
  paidAmount: string;
  purchaseProducts: PurchaseProduct[];
  recentPurchases: PurchaseHistory[];
};

const readPurchasePageState = (): PurchasePageStorageState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(purchasePageStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const state = JSON.parse(rawValue) as PurchasePageStorageState;

    return {
      ...state,
      purchaseProducts: state.purchaseProducts?.map((product) => ({
        ...product,
        quantity: 0,
        total: 0,
      })) ?? [],
    };
  } catch {
    return null;
  }
};

const buildDefaultPurchaseState = (
  products: ReturnType<typeof useProductStore.getState>["products"],
): PurchasePageStorageState => ({
  productSearch: "",
  supplierSearch: "",
  highlightedSupplierIndex: 0,
  isSupplierDropdownOpen: false,
  selectedSupplierId: "",
  purchaseDate: formatToday(),
  paymentMethod: "cash",
  paidAmount: "0",
  purchaseProducts: createPurchaseRows(products),
  recentPurchases: [],
});

  const createPurchaseRows = (products: ReturnType<typeof useProductStore.getState>["products"]) =>
    products.map((product) => ({
      id: product.id,
      name: product.name,
      purchasePrice: product.purchasePrice,
      stockAvailable: product.stock,
      quantity: 0,
      originalQuantity: product.stock,
      discount: 0,
      total: 0,
    } satisfies PurchaseProduct));

  const getQuantityDelta = (product: PurchaseProduct) =>
    Math.max(Number(product.quantity || 0), 0);

  const computeRowTotal = (product: PurchaseProduct) =>
    Math.max(
      Number(product.purchasePrice || 0) * getQuantityDelta(product) - Number(product.discount || 0),
      0,
    );

export default function Purchases() {
  const products = useProductStore((state) => state.products);
  const updateProduct = useProductStore((state) => state.updateProduct);
  const suppliers = useSupplierStore((state) => state.suppliers);
  const persistedState = readPurchasePageState();
  const defaultState = buildDefaultPurchaseState(products);
  const [productSearch, setProductSearch] = useState(
    persistedState?.productSearch ?? defaultState.productSearch,
  );
  const [supplierSearch, setSupplierSearch] = useState(
    persistedState?.supplierSearch ?? defaultState.supplierSearch,
  );
  const [highlightedSupplierIndex, setHighlightedSupplierIndex] = useState(
    persistedState?.highlightedSupplierIndex ?? defaultState.highlightedSupplierIndex,
  );
  const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(
    persistedState?.isSupplierDropdownOpen ?? defaultState.isSupplierDropdownOpen,
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(
    persistedState?.selectedSupplierId ?? defaultState.selectedSupplierId,
  );
  const [purchaseDate, setPurchaseDate] = useState(
    persistedState?.purchaseDate ?? defaultState.purchaseDate,
  );
  const [paymentMethod, setPaymentMethod] = useState(
    persistedState?.paymentMethod ?? defaultState.paymentMethod,
  );
  const [paidAmount, setPaidAmount] = useState(
    persistedState?.paidAmount ?? defaultState.paidAmount,
  );
  const [purchaseProducts, setPurchaseProducts] = useState<PurchaseProduct[]>(
    persistedState?.purchaseProducts ?? defaultState.purchaseProducts,
  );
  const createPurchaseRow = (product: ReturnType<typeof useProductStore.getState>["products"][number]) => ({
    id: product.id,
    name: product.name,
    purchasePrice: product.purchasePrice,
    stockAvailable: product.stock,
    quantity: 0,
    originalQuantity: product.stock,
    discount: 0,
    total: 0,
  } satisfies PurchaseProduct);

  useEffect(() => {
    setPurchaseProducts((current) => {
      const currentById = new Map(current.map((p) => [p.id, p]));

      const next: PurchaseProduct[] = products.map((prod) => {
        const existing = currentById.get(prod.id);

        if (!existing) {
          return createPurchaseRow(prod);
        }

        const updated: PurchaseProduct = {
          ...existing,
          name: prod.name,
          purchasePrice: prod.purchasePrice,
          stockAvailable: prod.stock,
          originalQuantity: prod.stock,
          total: computeRowTotal({
            ...existing,
            purchasePrice: prod.purchasePrice,
          }),
        };

        return updated;
      });

      return next;
    });
  }, [products]);
  const currentUser = useAuthStore((state) => state.currentUser)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentPurchases, setRecentPurchases] = useState<PurchaseHistory[]>(
    persistedState?.recentPurchases ?? defaultState.recentPurchases,
  );

  useEffect(() => {
    const nextState: PurchasePageStorageState = {
      productSearch,
      supplierSearch,
      highlightedSupplierIndex,
      isSupplierDropdownOpen,
      selectedSupplierId,
      purchaseDate,
      paymentMethod,
      paidAmount,
      purchaseProducts,
      recentPurchases,
    };

    window.localStorage.setItem(purchasePageStorageKey, JSON.stringify(nextState));
  }, [
    highlightedSupplierIndex,
    isSupplierDropdownOpen,
    paidAmount,
    paymentMethod,
    productSearch,
    purchaseDate,
    purchaseProducts,
    recentPurchases,
    selectedSupplierId,
    supplierSearch,
  ]);

  const filteredPurchaseProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

      if (!query) return purchaseProducts;

    return purchaseProducts.filter((purchaseProduct) =>
      purchaseProduct.name.toLowerCase().includes(query),
    );
  }, [productSearch, purchaseProducts]);

  const filteredSuppliers = useMemo(() => {
    const query = supplierSearch.trim().toLowerCase();

    if (!query) {
      return suppliers;
    }

    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(query),
    );
  }, [supplierSearch, suppliers]);

  useEffect(() => {
    setHighlightedSupplierIndex(0);
  }, [supplierSearch]);

  useEffect(() => {
    if (highlightedSupplierIndex >= filteredSuppliers.length) {
      setHighlightedSupplierIndex(0);
    }
  }, [filteredSuppliers.length, highlightedSupplierIndex]);

  const selectedSupplier = suppliers.find(
    (supplier) => String(supplier.id) === selectedSupplierId,
  );

  const subtotal = purchaseProducts.reduce(
    (sum, product) => sum + Number(product.purchasePrice || 0) * getQuantityDelta(product),
    0,
  );
  const totalDiscount = purchaseProducts.reduce((sum, product) => sum + Number(product.discount || 0), 0);
  const totalAmount = purchaseProducts.reduce(
    (sum, product) => sum + computeRowTotal(product),
    0,
  );
  const paidAmountNumber = Number(paidAmount) || 0;
  const dueAmount = Math.max(totalAmount - paidAmountNumber, 0);
  const purchaseStatus = dueAmount === 0 ? "Completed" : "Partial";

  const hasPurchaseChanges = useMemo(() => {
    const productMap = new Map(products.map((product) => [product.id, product]));

    return purchaseProducts.some((item) => {
      const originalProduct = productMap.get(item.id);
      const originalPrice = originalProduct?.purchasePrice ?? item.purchasePrice;
      const originalStockAvailable = originalProduct?.stock ?? item.stockAvailable;

      return (
        Number(item.quantity || 0) > 0 ||
        Number(item.discount || 0) > 0 ||
        Number(item.purchasePrice || 0) !== Number(originalPrice || 0) ||
        Number(item.stockAvailable || 0) !== Number(originalStockAvailable || 0)
      );
    });
  }, [purchaseProducts, products]);

  const updatePurchaseItem = (
    id: PurchaseProduct["id"],
    field: keyof Pick<PurchaseProduct, "purchasePrice" | "stockAvailable" | "quantity" | "discount">,
    value: string,
  ) => {
    let nextValue: number | string = value === "" ? "" : Number(value);

    if (typeof nextValue === "number" && Number.isNaN(nextValue)) {
      nextValue = "";
    }

    setPurchaseProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? {
              ...product,
              [field]: nextValue,
              total: computeRowTotal({ ...product, [field]: nextValue }),
            }
          : product,
      ),
    );
  };

  const deletePurchaseItem = (id: PurchaseProduct["id"]) => {
    setPurchaseProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id),
    );
  };

  const selectSupplier = (supplierId: string | number, supplierName: string) => {
    setSelectedSupplierId(String(supplierId));
    setSupplierSearch(supplierName);
    setHighlightedSupplierIndex(0);
    setIsSupplierDropdownOpen(false);
  };

  const handleSupplierKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (filteredSuppliers.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedSupplierIndex((currentIndex) =>
        Math.min(currentIndex + 1, filteredSuppliers.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedSupplierIndex((currentIndex) => Math.max(currentIndex - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const selectedSupplier = filteredSuppliers[highlightedSupplierIndex];

      if (selectedSupplier) {
        selectSupplier(selectedSupplier.id, selectedSupplier.name);
      }
      setIsSupplierDropdownOpen(false);
    }
  };

  const handleCompletePurchase = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await Promise.all(
        purchaseProducts.map((product) =>
          updateProduct(product.id, {
            stock: Number(product.quantity || 0),
            purchasePrice: Number(product.purchasePrice || 0),
          }),
        ),
      );

      const purchasedItems = purchaseProducts
        .map((product) => ({
          ...product,
          quantity: Number(product.quantity || 0),
        }))
        .filter((product) => product.quantity > 0);

      const totalQuantity = purchasedItems.reduce(
        (sum, product) => sum + Number(product.quantity || 0),
        0,
      );

      const nextPurchase: PurchaseHistory = {
        id: Date.now(),
        suppliername: (selectedSupplier?.name ?? supplierSearch.trim()) || "Unknown Supplier",
        date: purchaseDate || formatToday(),
        totalAmount,
        paymentMethod,
        status: purchaseStatus,
        totalDue: dueAmount,
        items: purchasedItems,
        totalQuantity,
      };

      if (!currentUser?.firebaseUid) {
        throw new Error("Unable to save purchase: user is not authenticated.");
      }

      await Promise.all(
        purchaseProducts.map((product) =>
          updateProduct(product.id, {
            stock:
              Number(product.stockAvailable || 0) + Number(product.quantity || 0),
            purchasePrice: Number(product.purchasePrice || 0),
          }),
        ),
      );

      const { purchase: firestorePurchase } = await addPurchaseService(
        nextPurchase,
        currentUser.firebaseUid,
      );

      setRecentPurchases((currentPurchases) => [firestorePurchase, ...currentPurchases]);
      setPurchaseProducts((currentProducts) =>
        currentProducts.map((item) => ({
          ...item,
          quantity: 0,
          total: 0,
        })),
      );
      toast.success("Purchase completed successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to complete purchase.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePurchaseUpdate = (updatedPurchase: PurchaseHistory) => {
    setRecentPurchases((currentPurchases) =>
      currentPurchases.map((purchase) =>
        purchase.id === updatedPurchase.id ? updatedPurchase : purchase,
      ),
    );
  };

  return (
    <div className="grid w-full min-w-0 grid-cols-1 overflow-x-hidden py-4 sm:px-4 lg:px-6 xl:grid-cols-4">
      <div className="order-2 hidden min-w-0 xl:order-1 xl:col-span-1 xl:block">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Create New Purchase</CardTitle>
            <CardDescription>Create and manage new purchases</CardDescription>
          </CardHeader>
          <CardContent className="">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="text-md font-semibold">Supplier</p>
                <div className="relative">
                  <div className="flex items-center gap-1">
                    <Input
                      placeholder="Search supplier..."
                      value={supplierSearch}
                      onFocus={() => setIsSupplierDropdownOpen(true)}
                      onKeyDown={handleSupplierKeyDown}
                      onChange={(event) => {
                        setSupplierSearch(event.target.value);
                        setSelectedSupplierId("");
                        setHighlightedSupplierIndex(0);
                        setIsSupplierDropdownOpen(true);
                      }}
                      className="w-full rounded-md"
                    />
                    <AddSupplierDialogue
                      trigger={
                        <Button
                          variant="outline"
                          size="icon"
                          className="cursor-pointer"
                        >
                          <Plus size={18} />
                        </Button>
                      }
                    />
                  </div>

                  {isSupplierDropdownOpen && supplierSearch.trim().length > 0 && (
                    <div className="absolute left-0 top-full z-20 mt-2 max-h-44 w-full overflow-auto rounded-md border bg-popover shadow-lg">
                      {filteredSuppliers.length > 0 ? (
                        filteredSuppliers.map((supplier) => (
                          <button
                            key={supplier.id}
                            type="button"
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted ${
                              filteredSuppliers[highlightedSupplierIndex]?.id === supplier.id
                                ? "bg-muted"
                                : ""
                            }`}
                            onMouseEnter={() => {
                              const supplierIndex = filteredSuppliers.findIndex(
                                (candidate) => candidate.id === supplier.id,
                              );
                              setHighlightedSupplierIndex(supplierIndex);
                            }}
                            onClick={() => {
                              selectSupplier(supplier.id, supplier.name);
                            }}
                          >
                            <span className="font-medium">{supplier.name}</span>
                            <span className="text-xs text-muted-foreground">{supplier.status}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-sm text-muted-foreground">
                          No suppliers found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </div>
              <div className="flex flex-col gap-1">
                <p className="text-md font-semibold">Purchase Date</p>
                <Input
                  type="date"
                  value={purchaseDate}
                  onChange={(event) => setPurchaseDate(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-md font-semibold">Payment Method</p>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Payment Method</SelectLabel>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-md font-semibold">Note (Optional)</p>
                <textarea
                  placeholder="Enter note..."
                  className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="order-1 min-w-0 xl:order-2 xl:col-span-3">
        <div className="min-w-0">
          <CardHeader className="min-w-0 gap-2 overflow-hidden">
            <CardTitle>Purchase Summary</CardTitle>
            <div className="flex flex-row gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full min-w-0 md:max-w-lg">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Search size={16} />
                </span>
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  className="w-full pl-10"
                />
              </div>
              <div className="flex justify-start lg:justify-end sm:hidden">
                <AddProductDialogue
                  trigger={
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer bg-purple-500 text-white hover:bg-purple-600 hover:text-white"
                    >
                      <Plus size={18} />
                    </Button>
                  }
                />
              </div>
              <div className="hidden justify-start lg:justify-end sm:flex">
                <AddProductDialogue />
              </div>
            </div>
            <div className="w-full h-full overflow-x-auto">
              <PurchaseProductTable
                data={filteredPurchaseProducts}
                onUpdateItem={updatePurchaseItem}
                onDeleteItem={deletePurchaseItem}
              />
            </div>
            <div className="grid min-w-0 grid-cols-1 gap-2 xl:grid-cols-4">
              <div className="min-w-0 2xl:col-span-3">
                <PurchaseHistoryTable data={recentPurchases} onPurchaseUpdate={handlePurchaseUpdate} />
              </div>
              <div className="min-w-0 xl:hidden">
                <Card className="w-full min-w-0">
                  <CardHeader>
                    <CardTitle>Create New Purchase</CardTitle>
                    <CardDescription>
                      Create and manage new purchases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-md font-semibold">Supplier</p>
                        <div className="relative">
                          <div className="flex items-center gap-1">
                            <Input
                              placeholder="Search supplier..."
                              value={supplierSearch}
                              onFocus={() => setIsSupplierDropdownOpen(true)}
                              onKeyDown={handleSupplierKeyDown}
                              onChange={(event) => {
                                setSupplierSearch(event.target.value);
                                setSelectedSupplierId("");
                                setHighlightedSupplierIndex(0);
                                setIsSupplierDropdownOpen(true);
                              }}
                              className="w-full rounded-md"
                            />
                            <AddSupplierDialogue
                              trigger={
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="cursor-pointer"
                                >
                                  <Plus size={18} />
                                </Button>
                              }
                            />
                          </div>

                          {isSupplierDropdownOpen && supplierSearch.trim().length > 0 && (
                            <div className="absolute left-0 top-full z-20 mt-2 max-h-44 w-full overflow-auto rounded-md border bg-popover shadow-lg">
                              {filteredSuppliers.length > 0 ? (
                                filteredSuppliers.map((supplier) => (
                                  <button
                                    key={supplier.id}
                                    type="button"
                                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted ${
                                      filteredSuppliers[highlightedSupplierIndex]?.id === supplier.id
                                        ? "bg-muted"
                                        : ""
                                    }`}
                                    onMouseEnter={() => {
                                      const supplierIndex = filteredSuppliers.findIndex(
                                        (candidate) => candidate.id === supplier.id,
                                      );
                                      setHighlightedSupplierIndex(supplierIndex);
                                    }}
                                    onClick={() => {
                                      selectSupplier(supplier.id, supplier.name);
                                    }}
                                  >
                                    <span className="font-medium">{supplier.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {supplier.status}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-3 text-sm text-muted-foreground">
                                  No suppliers found.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-md font-semibold">Purchase Date</p>
                        <Input
                          type="date"
                          value={purchaseDate}
                          onChange={(event) => setPurchaseDate(event.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-md font-semibold">Payment Method</p>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Payment Method</SelectLabel>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="credit">Credit</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-md font-semibold">Note (Optional)</p>
                        <textarea
                          placeholder="Enter note..."
                          className="w-full min-h-24 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="min-w-0 2xl:col-span-1">
                <Card className="w-full min-w-0">
                  <CardHeader className="gap-2">
                    <CardTitle className="font-bold">Summary</CardTitle>
                    <div className="flex flex-row justify-between">
                      <p className="text-xs font-semibold text-gray-500">
                        Subtotal
                      </p>
                      <p className="font-bold text-xs">PKR {subtotal}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <p className="text-xs font-semibold text-gray-500">
                        Discount
                      </p>
                      <p className="font-bold text-xs">PKR {totalDiscount}</p>
                    </div>
                    <div className="h-px w-full bg-gray-300" />
                    <div className="flex flex-row justify-between">
                      <p className="text-md font-bold">Total Amount</p>
                      <p className="font-bold text-xs text-purple-500">
                        PKR {totalAmount}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-gray-500">
                        Paid Amount
                      </p>
                      <Input
                        placeholder="Enter paid amount"
                        value={paidAmount}
                        onChange={(event) => setPaidAmount(event.target.value)}
                        className="w-full rounded-sm"
                      />
                    </div>
                    <div className="flex flex-row justify-between">
                      <p className="text-md font-bold">Due Amount</p>
                      <p className="font-bold text-xs">PKR {dueAmount}</p>
                    </div>
                    <div className="flex flex-row justify-between">
                      <p className="text-md font-bold">Status</p>
                      <p className="font-bold text-xs">
                        {purchaseStatus}
                      </p>
                    </div>
                    <Button
                      className="w-full cursor-pointer bg-purple-500 hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-70"
                      onClick={handleCompletePurchase}
                      disabled={isSubmitting || !hasPurchaseChanges}
                    >
                      {isSubmitting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Completing...
                        </span>
                      ) : (
                        "Complete Purchase"
                      )}
                    </Button>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </CardHeader>
        </div>
      </div>
    </div>
  );
}
