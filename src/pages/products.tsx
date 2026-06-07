import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Funnel, Plus, Search } from "lucide-react";
import ProductDataTable from "@/components/tables/productdatatable";
import { AddProductDialogue } from "@/components/dialogue/addproductdialogue";
import { useMemo, useState, useEffect } from "react";
import { useProductStore } from "@/store/addproductstore";
import { useAuthStore } from "@/store/authstore";

export default function Products() {
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = useAuthStore((state) => state.currentUser);
  const allProducts = useProductStore((state) => state.products);
  const loadProductsByShop = useProductStore((state) => state.loadProductsByShop);

  // Load products from Firestore when user changes
  useEffect(() => {
    if (currentUser?.firebaseUid) {
      loadProductsByShop(currentUser.firebaseUid);
    }
  }, [currentUser?.firebaseUid, loadProductsByShop]);

  const products = currentUser?.firebaseUid
    ? allProducts.filter((p) => p.shopId === currentUser.firebaseUid)
    : [];

  const getDisplayStatus = (status: (typeof products)[number]["status"]) =>
    status === "InStock" ? "Healthy" : status;

  const filteredProducts = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const displayStatus = getDisplayStatus(product.status);
      const matchesStatus =
        statusFilter === "all-status" ||
        (statusFilter === "healthy" && displayStatus === "Healthy") ||
        (statusFilter === "low-stock" && product.status === "Low Stock") ||
        (statusFilter === "out-of-stock" && product.status === "Out of Stock");
      const matchesSearch =
        normalizedSearchTerm.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [products, searchTerm, statusFilter]);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex gap-3 flex-row items-center justify-between">
        <div className="flex flex-row gap-3 items-center">
          <div className="relative w-full max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Search size={16} />
            </span>
            <Input
              placeholder="Search products..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="hidden sm:block">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all-status">All Stock</SelectItem>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer bg-muted text-muted-foreground hover:bg-muted/80"
                >
                  <Funnel size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter("all-status")}>
                  All Stock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("healthy")}>
                  Healthy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("low-stock")}>
                  Low Stock
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter("out-of-stock")}
                >
                  Out of Stock
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
      <ProductDataTable data={filteredProducts} itemsPerPage={8} />
    </div>
  );
}
