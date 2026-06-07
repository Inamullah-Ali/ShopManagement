import { ChevronLeft, ChevronRight} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import type { Customer, CustomerTableProps } from "@/types/customer";
import { EditCustomerDialogue } from "../dialogue/editcustomer";
import { DeleteCustomerDialogue } from "../dialogue/deletecustomer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";


export default function CustomerTable({ data, itemsPerPage = 10 }: CustomerTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
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
  const currentPageIds = useMemo(() => Data.map((customer) => customer.id), [Data]);
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

  const closeCustomerDrawer = () => {
    setSelectedCustomer(null);
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
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      You don't have any customers yet.
                    </TableCell>
                  </TableRow>
                ) : (
              Data.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRowIds.includes(customer.id)}
                        onCheckedChange={() => toggleRowSelection(customer.id)}
                        aria-label={`Select ${customer.name}`}
                      />
                    </TableCell>
                    <TableCell>
                        <Drawer
                          direction={isMobile ? "bottom" : "right"}
                          open={selectedCustomer?.id === customer.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              closeCustomerDrawer();
                            }
                          }}
                        >
                          <DrawerTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-auto p-0 font-medium text-foreground hover:bg-transparent hover:underline cursor-pointer"
                              onClick={() => setSelectedCustomer(customer)}
                            >
                              {customer.name}
                            </Button>
                          </DrawerTrigger>
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>{customer.name}</DrawerTitle>
                              <DrawerDescription>
                                Customer profile and contact details
                              </DrawerDescription>
                            </DrawerHeader>

                            <div className="grid gap-3 overflow-y-auto px-4 pb-6 text-sm">
                              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                                <span className="text-muted-foreground">Customer ID</span>
                                <span className="text-right font-medium">{customer.id}</span>

                                <span className="text-muted-foreground">Name</span>
                                <span className="text-right font-medium">{customer.name}</span>

                                <span className="text-muted-foreground">Phone Number</span>
                                <span className="text-right font-medium">{customer.phoneNumber}</span>

                                <span className="text-muted-foreground">Address</span>
                                <span className="text-right font-medium">{customer.address ?? "-"}</span>

                                <span className="text-muted-foreground">Join Date</span>
                                <span className="text-right font-medium">{customer.joinDate}</span>

                                <span className="text-muted-foreground">Status</span>
                                <span className="text-right font-medium">{customer.status}</span>
                              </div>
                            </div>
                          </DrawerContent>
                        </Drawer>
                    </TableCell>
                    <TableCell>{customer.phoneNumber}</TableCell>
                    <TableCell>{customer.address ?? "-"}</TableCell>
                    <TableCell>{customer.joinDate}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          customer.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </TableCell>

                    <TableCell className="align-middle item-center">
                      <div className="flex flex-row  items-center justify-center">
                        <EditCustomerDialogue customer={customer} />
                        <DeleteCustomerDialogue customer={customer} />
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
            {totalItems} customers
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