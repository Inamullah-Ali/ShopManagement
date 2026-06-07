import StockManagementTable from "@/components/tables/stockmanagmenttable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Download, Funnel, Plus, Search } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useProductStore } from "@/store/addproductstore";
import { useAuthStore } from "@/store/authstore";
import type { StockCategorie } from "@/types/stockcategorie";
import StockReportDialog from "@/components/dialogue/stockreportdialog";

export default function StockManagement() {
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [searchStock, setSearchStock] = useState("");
  const currentUser = useAuthStore((state) => state.currentUser);
  const allProducts = useProductStore((state) => state.products);
  const loadProductsByShop = useProductStore((state) => state.loadProductsByShop);

  useEffect(() => {
    if (currentUser?.firebaseUid) {
      loadProductsByShop(currentUser.firebaseUid);
    }
  }, [currentUser?.firebaseUid, loadProductsByShop]);

  const products = currentUser?.firebaseUid
    ? allProducts.filter((p) => p.shopId === currentUser.firebaseUid)
    : [];

  const normalizeStatus = (status: string): StockCategorie["status"] => {
    if (status === "InStock") {
      return "Healthy";
    }

    if (
      status === "Healthy" ||
      status === "Low Stock" ||
      status === "Out of Stock"
    ) {
      return status;
    }

    return "Out of Stock";
  };

  const filterStock = useMemo(() => {
    const normalizedSearch = searchStock.trim().toLocaleLowerCase();

    const stockRows: StockCategorie[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      image: product.image,
      stockIn: product.stockIn ?? product.stock,
      stockOut: product.stockOut ?? 0,
      currentStock: product.stock,
      status: normalizeStatus(product.status),
      lastUpdate: product.updatedAt ?? "",
    }));

    return stockRows.filter((stock) => {
      const matchesStatus =
        statusFilter === "all-status" ||
        (statusFilter === "healthy" && stock.status === "Healthy") ||
        (statusFilter === "low-stock" && stock.status === "Low Stock") ||
        (statusFilter === "out-of-stock" && stock.status === "Out of Stock");
      const matchesSearch =
        normalizedSearch.length === 0 ||
        stock.name.toLocaleLowerCase().includes(normalizedSearch);
      return matchesStatus && matchesSearch;
    });
  }, [products, searchStock, statusFilter]);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex gap-3 flex-row items-center justify-between">
        <div className="flex gap-3 flex-row items-center">
          <div className="relative w-full max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Search size={16} />
            </span>
            <Input
              value={searchStock}
              onChange={(event) => setSearchStock(event.target.value)}
              placeholder="Search products..."
              className="w-full pl-10"
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
          <StockReportDialog
            trigger={
              <Button
                variant="outline"
                size="icon"
                className="cursor-pointer bg-purple-500 text-white hover:bg-purple-600 hover:text-white"
              >
                <Download size={18} />
              </Button>
            }
          />
        </div>
        <div className="hidden justify-start lg:justify-end sm:flex">
          <StockReportDialog
            trigger={
              <Button className="cursor-pointer bg-purple-500 text-white flex items-center gap-2 hover:bg-purple-600">
                <Download size={16} /> Export Report
              </Button>
            }
          />
        </div>
      </div>
      <StockManagementTable data={filterStock} itemsPerPage={8} />
    </div>
  );
}
