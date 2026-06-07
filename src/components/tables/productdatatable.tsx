import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DataTableProps } from "@/types/products";
import { EditProductDialogue } from "../dialogue/editproductdialogue";
import { DeleteProductDialogue } from "../dialogue/deleteproductdialogue";

export default function ProductDataTable({
  data,
  itemsPerPage = 10,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>(
    [],
  );
  const isMobile = useIsMobile();
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const Data = data.slice(startIndex, endIndex);
  const currentPageIds = useMemo(
    () => Data.map((product) => product.id),
    [Data],
  );
  const currentPageSelectedCount = currentPageIds.filter((id) =>
    selectedRowIds.includes(id),
  ).length;
  const isCurrentPageAllSelected =
    currentPageIds.length > 0 &&
    currentPageSelectedCount === currentPageIds.length;
  const isCurrentPagePartiallySelected =
    currentPageSelectedCount > 0 && !isCurrentPageAllSelected;
  const pageNumbers =
    totalPages > 4
      ? [1, 2, 3, "ellipsis", totalPages]
      : Array.from({ length: totalPages }, (_, index) => index + 1);

  const getDisplayStatus = (
    status: DataTableProps["data"][number]["status"],
  ) => (status === "InStock" ? "Healthy" : status);

  const getProductInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P";

  const toggleRowSelection = (rowId: string | number) => {
    setSelectedRowIds((currentSelectedRowIds) =>
      currentSelectedRowIds.includes(rowId)
        ? currentSelectedRowIds.filter((id) => id !== rowId)
        : [...currentSelectedRowIds, rowId],
    );
  };

  const toggleCurrentPageSelection = () => {
    setSelectedRowIds((currentSelectedRowIds) => {
      if (isCurrentPageAllSelected) {
        return currentSelectedRowIds.filter(
          (id) => !currentPageIds.includes(id),
        );
      }

      return Array.from(new Set([...currentSelectedRowIds, ...currentPageIds]));
    });
  };

  return (
    <div className="flex-1">
      <Card className="w-full overflow-hidden p-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      isCurrentPageAllSelected
                        ? true
                        : isCurrentPagePartiallySelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={toggleCurrentPageSelection}
                    aria-label="Select all rows on current page"
                  />
                </TableHead>
                <TableHead className="w-16">Image</TableHead>
                <TableHead className="w-54">Products Name</TableHead>
                <TableHead className="w-24">Price</TableHead>
                <TableHead className="w-24">Stock</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    You don't have any products yet.
                  </TableCell>
                </TableRow>
              ) : (
                Data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRowIds.includes(product.id)}
                        onCheckedChange={() => toggleRowSelection(product.id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell className="w-24">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/40 text-xs font-semibold text-muted-foreground">
                          {getProductInitials(product.name)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Drawer direction={isMobile ? "bottom" : "right"}>
                        <DrawerTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center gap-3 text-left"
                            aria-label={`View details for ${product.name}`}
                          >
                            <div className="cursor-pointer font-bold text-foreground underline-offset-4 hover:underline">
                              {product.name}
                            </div>
                          </button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>{product.name}</DrawerTitle>
                            <DrawerDescription>
                              Product details and stock information
                            </DrawerDescription>
                          </DrawerHeader>

                          <div className="grid gap-3 overflow-y-auto px-4 pb-6 text-sm">
                            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                              <span className="text-muted-foreground">
                                Product ID
                              </span>
                              <span className="text-right font-medium">
                                {product.id}
                              </span>

                              <span className="text-muted-foreground">
                                Name
                              </span>
                              <span className="text-right font-medium">
                                {product.name}
                              </span>

                              <span className="text-muted-foreground">
                                Purchase Price
                              </span>
                              <span className="text-right font-medium">
                                PKR-{product.purchasePrice}
                              </span>

                              <span className="text-muted-foreground">
                                Selling Price
                              </span>
                              <span className="text-right font-medium">
                                PKR-{product.sellPrice}
                              </span>

                              <span className="text-muted-foreground">
                                Stock
                              </span>
                              <span className="text-right font-medium">
                                {product.stock}
                              </span>

                              <span className="text-muted-foreground">
                                Status
                              </span>
                              <span className="text-right">
                                <span
                                  className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-center text-sm font-medium ${
                                    getDisplayStatus(product.status) ===
                                    "Healthy"
                                      ? "bg-green-100 text-green-600"
                                      : product.status === "Low Stock"
                                        ? "bg-amber-100 text-amber-700"
                                        : product.status === "Out of Stock"
                                          ? "bg-red-100 text-red-600"
                                          : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {getDisplayStatus(product.status)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </TableCell>
                    <TableCell>PKR-{product.sellPrice}</TableCell>
                    <TableCell>{product.stock}</TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-center text-sm font-medium ${
                          getDisplayStatus(product.status) === "Healthy"
                            ? "bg-green-100 text-green-600"
                            : product.status === "Low Stock"
                              ? "bg-amber-100 text-amber-700"
                              : product.status === "Out of Stock"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getDisplayStatus(product.status)}
                      </span>
                    </TableCell>

                    <TableCell className="flex justify-center h-full">
                      <div className="flex flex-row gap-3 items-center justify-center h-full pt-3 mr-2">
                        <EditProductDialogue product={product} />
                        <DeleteProductDialogue product={product} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="mt-4 flex flex-row gap-3 justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(endIndex, totalItems)} of {totalItems} products
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="rounded-sm border bg-muted p-1 text-sm cursor-pointer disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {pageNumbers.map((page) => {
              if (page === "ellipsis") {
                return (
                  <span
                    key="ellipsis"
                    className="px-1 text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page as number)}
                  className={`min-w-6 rounded-md border p-1 text-sm transition-colors cursor-pointer ${
                    safeCurrentPage === page
                      ? "border-purple-600 bg-purple-600 text-white"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="rounded-sm border bg-muted p-1 text-sm cursor-pointer disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
