import { PencilLine, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import type { DataTableProps} from "../types/products";


export default function DataTable({ data, itemsPerPage = 10 }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>([]);
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
  const currentPageIds = useMemo(() => Data.map((product) => product.id), [Data]);
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


    return(
          <div className="flex-1 p-6">
        <Card className="w-full p-0">
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
                  <TableHead>Categories</TableHead>
                  <TableHead>Brands</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Data.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRowIds.includes(product.id)}
                        onCheckedChange={() => toggleRowSelection(product.id)}
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded object-cover border">
                          <p>img</p>
                        </div>

                        <div className="flex flex-col">
                          <span className="font-bold">{product.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>PKR-{product.purchasePrice}</TableCell>
                    <TableCell>PKR-{product.sellPrice}</TableCell>
                    <TableCell>{product.stock}</TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-center text-sm font-medium ${
                          product.status === "InStock"
                            ? "bg-green-100 text-green-600"
                            : product.status === "Low Stock"
                              ? "bg-amber-100 text-amber-700"
                              : product.status === "Out of Stock"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.status}
                      </span>
                    </TableCell>

                    <TableCell className="align-middle">
                      <div className="flex flex-row gap-3">
                        <PencilLine
                          size={16}
                          className="cursor-pointer text-muted-foreground"
                          color="blue"
                        />

                        <Trash2
                          size={16}
                          className="cursor-pointer text-muted-foreground"
                          color="red"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
            {totalItems} products
          </p>

          <div className="flex flex-row items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="rounded-sm border bg-muted p-1 text-sm cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
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