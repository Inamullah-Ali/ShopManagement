import { ChevronLeft, ChevronRight} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import type { Supplier, SupplierTableProps } from "@/types/supplier";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { EditSupplierDialogue } from "../dialogue/editsupplier";
import { DeleteSupplierDialogue } from "../dialogue/deletesupplier";
import { Button } from "../ui/button";


export default function SupplierTable({ data, itemsPerPage = 10 }: SupplierTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
   const isMobile = useIsMobile();

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const Data = data.slice(startIndex, endIndex);
  const currentPageIds = useMemo(() => Data.map((supplier) => supplier.id), [Data]);
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
  const closeSupplierDrawer = () => {
    setSelectedSupplier(null);
  };

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
                  <TableHead>Shop Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      You don't have any suppliers yet.
                    </TableCell>
                  </TableRow>
                ) :(
                Data.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRowIds.includes(supplier.id)}
                        onCheckedChange={() => toggleRowSelection(supplier.id)}
                        aria-label={`Select ${supplier.name}`}
                      />
                    </TableCell>
                    <TableCell>
                        <Drawer
                          direction={isMobile ? "bottom" : "right"}
                          open={selectedSupplier?.id === supplier.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              closeSupplierDrawer();
                            }
                          }}>
                          <DrawerTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-auto p-0 font-medium text-foreground hover:bg-transparent hover:underline cursor-pointer"
                              aria-label={`View details for ${supplier.name}`}
                              onClick={() => setSelectedSupplier(supplier)}
                            >
                              {supplier.name}
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>{supplier.name}</DrawerTitle>
                              <DrawerDescription>
                                Supplier details and account summary
                              </DrawerDescription>
                            </DrawerHeader>

                            <div className="grid gap-3 overflow-y-auto px-4 pb-6 text-sm">
                              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                                <span className="text-muted-foreground">Supplier ID</span>
                                <span className="text-right font-medium">{supplier.id}</span>

                                <span className="text-muted-foreground">Name</span>
                                <span className="text-right font-medium">{supplier.name}</span>

                                <span className="text-muted-foreground">Phone Number</span>
                                <span className="text-right font-medium">{supplier.phoneNumber}</span>

                                <span className="text-muted-foreground">Total Purchase</span>
                                <span className="text-right font-medium">PKR-{supplier.totalPurchase}</span>

                                <span className="text-muted-foreground">Total Due</span>
                                <span className="text-right font-medium">PKR-{supplier.totalDue}</span>

                                <span className="text-muted-foreground">Date</span>
                                <span className="text-right font-medium">{supplier.date}</span>
                              </div>
                            </div>
                          </DrawerContent>
                        </Drawer>
                    </TableCell>
                    <TableCell>{supplier.contactperson}</TableCell>
                    <TableCell>{supplier.phoneNumber}</TableCell>
                    <TableCell>{supplier.date}</TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-center text-sm font-medium ${
                          supplier.status === "Active"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </TableCell>

                      <TableCell className="align-middle">
                      <div className="flex flex-wrap justify-center">
                        <EditSupplierDialogue supplier={supplier} />
                        <DeleteSupplierDialogue supplier={supplier} />
                      </div>
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
            {totalItems} suppliers
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