import { ChevronLeft, ChevronRight, Loader2, PencilLine } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { useEffect, useMemo, useState } from "react";
import type { CreditCustomer, CreditCustomerTableProps } from "@/types/customer";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDate } from "@/lib/date"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { useSalesStore } from "@/store/salesstore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// transaction history will be derived from sales store per-customer at render time

function formatToday() {
  return formatDate(new Date())
}

function EditCreditDialog({
  customer,
  onSave,
}: {
  customer: CreditCustomer;
  onSave: (updated: CreditCustomer) => void;
}) {
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recordCreditPayment = useSalesStore((s) => s.recordCreditPayment);

  useEffect(() => {
    setPaymentAmount(0);
  }, [customer.id]);

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      const totalBill = customer.totalBill ?? customer.totalCreditAmount;
      const appliedPayment = Math.min(Math.max(paymentAmount, 0), customer.remainingBalance);
      const nextPaidAmount = customer.amountPaid + appliedPayment;
      const remaining = Math.max(totalBill - nextPaidAmount, 0);
      const status = remaining === 0 ? "Paid" : nextPaidAmount > 0 ? "Partially Paid" : "Unpaid";

      const updated: CreditCustomer = {
        ...customer,
        totalCreditAmount: totalBill,
        totalBill,
        amountPaid: nextPaidAmount,
        latestPaidAmount: appliedPayment,
        remainingBalance: remaining,
        lastTransactionDate: formatToday(),
        status,
      };

      onSave(updated);
      
      if (appliedPayment > 0) {
        try {
          recordCreditPayment(
            {
              id: customer.id,
              name: customer.name,
              phoneNumber: customer.phoneNumber,
            },
            appliedPayment,
          );
        } catch {
          // swallow errors to avoid breaking UI; history will appear on next successful save
        }
      }

      toast.success(
        status === "Paid"
          ? "Payment completed successfully."
          : "Payment recorded successfully."
      );
      setOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save payment";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer" variant="ghost" onClick={() => setOpen(true)}>
          <PencilLine size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <div>
            <p className="text-sm text-muted-foreground">Total Bill</p>
            <Input value={customer.totalBill ?? customer.totalCreditAmount} readOnly disabled={isSubmitting} />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <Input value={customer.remainingBalance} readOnly disabled={isSubmitting} />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Amount Paid Now</p>
            <Input
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value || 0))}
              placeholder="Enter payment"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            className="bg-purple-500 hover:bg-purple-600 text-white disabled:cursor-not-allowed disabled:opacity-70" 
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CreditCustomerTable({ data, itemsPerPage = 10 }: CreditCustomerTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CreditCustomer | null>(null);
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
  const [customersData, setCustomersData] = useState<CreditCustomer[]>([]);
  const sales = useSalesStore((s) => s.sales);

  useEffect(() => {
    setCustomersData(data);
  }, [data]);

  const pageData = customersData.slice(startIndex, endIndex);
  const currentPageIds = useMemo(() => pageData.map((customer) => customer.id), [pageData]);
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

  const getCustomerPaymentHistory = (customer: CreditCustomer) =>
    sales
      .filter((sale) => {
        if (sale.paymentMethod !== "Credit") {
          return false;
        }

        const matchesId = sale.customerId !== undefined && sale.customerId === customer.id;
        const matchesName =
          sale.customerName.trim().toLowerCase() === customer.name.trim().toLowerCase();

        return matchesId || matchesName;
      })
      .flatMap((sale) =>
        (sale.creditPayments ?? []).map((payment) => ({
          saleId: sale.id,
          saleDate: sale.date,
          payment,
        })),
      )
      .sort((first, second) => new Date(second.payment.date).getTime() - new Date(first.payment.date).getTime());

  return (
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
                <TableHead>Remaining</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Total Bill</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Last Transaction</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-sm text-muted-foreground">
                    You don't have any credit customers yet.
                  </TableCell>
                </TableRow>
              ) : (
                pageData.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRowIds.includes(customer.id)}
                        onCheckedChange={() => toggleRowSelection(customer.id)}
                        aria-label={`Select ${customer.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-left text-sm font-medium underline-offset-2 hover:underline cursor-pointer"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        {customer.name}
                      </button>
                    </TableCell>
                    <TableCell>{customer.phoneNumber}</TableCell>
                    <TableCell>PKR-{customer.remainingBalance}</TableCell>
                    <TableCell>PKR-{customer.amountPaid}</TableCell>
                    <TableCell>PKR-{customer.totalBill ?? customer.totalCreditAmount}</TableCell>
                    <TableCell>{customer.dueDate ?? "-"}</TableCell>
                    <TableCell>{customer.lastTransactionDate}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          customer.status === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : customer.status === "Partially Paid"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </TableCell>
                    <TableCell className="align-middle item-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Drawer
                          direction={isMobile ? "bottom" : "right"}
                          open={selectedCustomer?.id === customer.id}
                          onOpenChange={(open) => {
                            if (!open) {
                              closeCustomerDrawer();
                            }
                          }}
                        >
                          <DrawerContent>
                            <DrawerHeader>
                              <DrawerTitle>{customer.name}</DrawerTitle>
                              <DrawerDescription>
                                Transaction history and credit summary
                              </DrawerDescription>
                            </DrawerHeader>
                            <div className="grid gap-3 overflow-y-auto px-4 pb-6 text-sm">
                              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                                <span className="text-muted-foreground">Total Bill</span>
                                <span className="text-right font-medium">PKR-{customer.totalBill ?? customer.totalCreditAmount}</span>

                                <span className="text-muted-foreground">Paid</span>
                                <span className="text-right font-medium">PKR-{customer.amountPaid}</span>

                                <span className="text-muted-foreground">Remaining</span>
                                <span className="text-right font-medium">PKR-{customer.remainingBalance}</span>

                                <span className="text-muted-foreground">Last Transaction</span>
                                <span className="text-right font-medium">{customer.lastTransactionDate}</span>
                              </div>

                              <div className="grid gap-3">
                                {(() => {
                                  if (!selectedCustomer) return null;

                                  const paymentHistory = getCustomerPaymentHistory(selectedCustomer);

                                  if (paymentHistory.length === 0) {
                                    return (
                                      <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                                        No payment history for this customer.
                                      </div>
                                    );
                                  }

                                  return paymentHistory.map((entry) => (
                                    <div key={`${entry.saleId}-${entry.payment.id}`} className="rounded-lg border p-3">
                                      <div className="flex items-center justify-between text-sm font-medium">
                                        <span>{formatDate(entry.payment.date || entry.saleDate)}</span>
                                        <span>PKR-{entry.payment.amount}</span>
                                      </div>
                                      <p className="mt-1 text-xs text-muted-foreground">{entry.payment.note || 'Payment received'}</p>
                                    </div>
                                  ));
                                })()}
                              </div>
                            </div>
                          </DrawerContent>
                        </Drawer>

                        {customer.status !== "Paid" ? (
                          <EditCreditDialog
                            customer={customer}
                            onSave={(updated) => {
                              setCustomersData((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
                              if (selectedCustomer?.id === updated.id) {
                                setSelectedCustomer(updated);
                              }
                            }}
                          />
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-row items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} customers
        </p>

        <div className="flex flex-row items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="rounded-sm border bg-muted p-1 text-sm cursor-pointer disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex flex-row items-center gap-2">
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
  );
}