import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import type { CategoriesTableProps } from "@/types/stockcategorie";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateTime } from "@/lib/date";


export default function StockManagementTable({ data, itemsPerPage = 10 }: CategoriesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>([]);
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
  const currentPageIds = useMemo(() => Data.map((categorieStock) => categorieStock.id), [Data]);
  const currentPageSelectedCount = currentPageIds.filter((id) => selectedRowIds.includes(id)).length;
  const isCurrentPageAllSelected = currentPageIds.length > 0 && currentPageSelectedCount === currentPageIds.length;
  const isCurrentPagePartiallySelected = currentPageSelectedCount > 0 && !isCurrentPageAllSelected;
  const pageNumbers =
    totalPages > 4
      ? [1, 2, 3, "ellipsis", totalPages]
      : Array.from({ length: totalPages }, (_, index) => index + 1);

  const toggleRowSelection = (rowId: string | number) => {
    setSelectedRowIds((currentSelectedRowIds) =>
      currentSelectedRowIds.includes(rowId)
        ? currentSelectedRowIds.filter((id) => id !== rowId)
        : [...currentSelectedRowIds, rowId]
    );
  };

  const toggleCurrentPageSelection = () => {
    setSelectedRowIds((currentSelectedRowIds) => {
      if (isCurrentPageAllSelected) {
        return currentSelectedRowIds.filter((id) => !currentPageIds.includes(id));
      }

      return Array.from(new Set([...currentSelectedRowIds, ...currentPageIds]));
    });
  };

  const formatLastUpdated = (value: string) => {
    if (!value) {
      return "--";
    }

    return formatDateTime(value);
  };

  const getStatusClassName = (status: CategoriesTableProps["data"][number]["status"]) => {
    if (status === "Healthy") {
      return "bg-green-100 text-green-600";
    }

    if (status === "Low Stock") {
      return "bg-amber-100 text-amber-700";
    }

    if (status === "Out of Stock") {
      return "bg-red-100 text-red-600";
    }

    return "bg-gray-100 text-gray-600";
  };

  const getProductInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "P";


    return(
          <div className="flex-1">
        <Card className="w-full overflow-hidden p-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isCurrentPageAllSelected ? true : isCurrentPagePartiallySelected ? "indeterminate" : false}
                      onCheckedChange={toggleCurrentPageSelection}
                      aria-label="Select all rows on current page"
                    />
                  </TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Stock In</TableHead>
                  <TableHead>Stock Out</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      You don't have any Stock yet.
                    </TableCell>
                  </TableRow>
                ) : (
                Data.map((categorieStock) => (
                  <TableRow key={categorieStock.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRowIds.includes(categorieStock.id)}
                        onCheckedChange={() => toggleRowSelection(categorieStock.id)}
                        aria-label={`Select ${categorieStock.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted/40">
                          {categorieStock.image ? (
                            <img
                              src={categorieStock.image}
                              alt={categorieStock.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                              {getProductInitials(categorieStock.name)}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="font-bold">{categorieStock.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{categorieStock.stockIn}</TableCell>
                    <TableCell>{categorieStock.stockOut}</TableCell>
                    <TableCell>{categorieStock.currentStock}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-center text-sm font-medium ${getStatusClassName(categorieStock.status)}`}
                      >
                        {categorieStock.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatLastUpdated(categorieStock.lastUpdate)}</TableCell>
                    <TableCell className="text-center justify-center items-center ">
                      <Drawer direction={isMobile ? "bottom" : "right"}>
                        <DrawerTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center justify-center w-full"
                            aria-label={`View details for ${categorieStock.name}`}
                          >
                            <Eye size={18} className="cursor-pointer text-blue-500 hover:text-blue-700" />
                          </button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>{categorieStock.name}</DrawerTitle>
                            <DrawerDescription>
                              Live stock details for this product.
                            </DrawerDescription>
                          </DrawerHeader>

                          <div className="grid gap-4 overflow-y-auto px-4 pb-6 text-sm">
                            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                              {categorieStock.image ? (
                                <img
                                  src={categorieStock.image}
                                  alt={categorieStock.name}
                                  className="h-16 w-16 rounded-md border object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted/40 text-sm font-semibold text-muted-foreground">
                                  {getProductInitials(categorieStock.name)}
                                </div>
                              )}
                              <div className="grid gap-1">
                                <p className="font-medium">{categorieStock.name}</p>
                                <p className="text-muted-foreground">
                                  Current stock and stock movement summary
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                              <span className="text-muted-foreground">Product ID</span>
                              <span className="text-right font-medium">{categorieStock.id}</span>

                              <span className="text-muted-foreground">Stock In</span>
                              <span className="text-right font-medium">{categorieStock.stockIn}</span>

                              <span className="text-muted-foreground">Stock Out</span>
                              <span className="text-right font-medium">{categorieStock.stockOut}</span>

                              <span className="text-muted-foreground">Current Stock</span>
                              <span className="text-right font-medium">{categorieStock.currentStock}</span>

                              <span className="text-muted-foreground">Status</span>
                              <span className="text-right">
                                <span
                                  className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-sm font-medium ${getStatusClassName(categorieStock.status)}`}
                                >
                                  {categorieStock.status}
                                </span>
                              </span>

                              <span className="text-muted-foreground">Last Updated</span>
                              <span className="text-right font-medium">
                                {formatLastUpdated(categorieStock.lastUpdate)}
                              </span>
                            </div>
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="mt-4 flex gap-3 flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems} products
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
                    <span key="ellipsis" className="px-1 text-sm text-muted-foreground">
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
    )}