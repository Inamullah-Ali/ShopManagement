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
import type { ExpenseTableProps, Expenses } from "@/types/expense";
import { EditExpenseDialogue } from "../dialogue/editexpense";
import { DeleteExpenseDialogue } from "../dialogue/deleteexpense";
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
import { formatDate, formatTime } from "@/lib/date";

export default function ExpenseTable({
  data,
  itemsPerPage = 10,
}: ExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedExpense, setSelectedExpense] = useState<Expenses | null>(null);

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
    () => Data.map((expense) => expense.id),
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

  const closeExpenseDrawer = () => {
    setSelectedExpense(null);
  };

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
                  />
                </TableHead>

                <TableHead>Date</TableHead>

                <TableHead>Expense Name</TableHead>

                <TableHead>Total (PKR)</TableHead>

                <TableHead>Paid (PKR)</TableHead>

                <TableHead>Pending (PKR)</TableHead>

                <TableHead>Payment Method</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {Data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    You don't have any expenses yet.
                  </TableCell>
                </TableRow>
              ) : (
                Data.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRowIds.includes(expense.id)}
                        onCheckedChange={() => toggleRowSelection(expense.id)}
                      />
                    </TableCell>

                    <TableCell>
                      {formatDate(expense.date)}
                    </TableCell>

                    <TableCell>
                      <Drawer
                        direction={isMobile ? "bottom" : "right"}
                        open={selectedExpense?.id === expense.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            closeExpenseDrawer();
                          }
                        }}
                      >
                        <DrawerTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-auto p-0 font-medium text-foreground hover:bg-transparent hover:underline"
                            onClick={() => setSelectedExpense(expense)}
                          >
                            {expense.expensename}
                          </Button>
                        </DrawerTrigger>

                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>{expense.expensename}</DrawerTitle>
                            <DrawerDescription>
                              Expense details and payment summary.
                            </DrawerDescription>
                          </DrawerHeader>

                          <div className="grid gap-3 overflow-y-auto px-4 pb-6 text-sm">
                            <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                              <span className="text-muted-foreground">Expense ID</span>
                              <span className="text-right font-medium">{expense.id}</span>

                              <span className="text-muted-foreground">Date</span>
                              <span className="text-right font-medium">
                                {formatDate(expense.date)}
                              </span>

                              <span className="text-muted-foreground">Category</span>
                              <span className="text-right font-medium">{expense.category}</span>

                              <span className="text-muted-foreground">Total Amount</span>
                              <span className="text-right font-medium">
                                PKR {expense.totalamount.toLocaleString()}
                              </span>

                              <span className="text-muted-foreground">Paid Amount</span>
                              <span className="text-right font-medium">
                                PKR {expense.paidamount.toLocaleString()}
                              </span>

                              <span className="text-muted-foreground">Pending Amount</span>
                              <span className="text-right font-medium">
                                PKR {(expense.totalamount - expense.paidamount).toLocaleString()}
                              </span>

                              <span className="text-muted-foreground">Payment Method</span>
                              <span className="text-right font-medium">{expense.paymentmethod}</span>

                              <span className="text-muted-foreground">Status</span>
                              <span className="text-right font-medium">{expense.status}</span>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Expense Date</p>
                                <p className="text-sm font-medium">
                                  {formatDate(expense.date)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">Paid Amount</p>
                                <p className="text-sm font-semibold">
                                  PKR {expense.paidamount.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {expense.paymentmethod === "Credit" && (
                              <div className="rounded-lg border bg-muted/30 p-3">
                                <p className="text-sm font-semibold mb-3">
                                  Payment History
                                </p>
                                {(expense.creditPayments ?? []).length === 0 ? (
                                  <p className="text-sm text-muted-foreground">
                                    No credit payments have been recorded yet.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {[...(expense.creditPayments ?? [])]
                                      .sort(
                                        (a, b) =>
                                          new Date(b.date).getTime() -
                                          new Date(a.date).getTime(),
                                      )
                                      .map((entry) => (
                                        <div
                                          key={entry.id}
                                          className="flex items-center justify-between rounded-md border bg-background p-3"
                                        >
                                          <div className="text-sm">
                                            <p className="font-medium">
                                              {formatDate(entry.date)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {formatTime(entry.date)}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-semibold">
                                              PKR {entry.amount.toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </DrawerContent>
                      </Drawer>
                    </TableCell>

                    <TableCell>
                      PKR {expense.totalamount.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      PKR {expense.paidamount.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      PKR{" "}
                      {(
                        expense.totalamount - expense.paidamount
                      ).toLocaleString()}
                    </TableCell>

                    <TableCell>{expense.paymentmethod}</TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          expense.status === "Complete"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {expense.status}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <EditExpenseDialogue expense={expense} />

                        <DeleteExpenseDialogue expenseId={expense.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(endIndex, totalItems)} of {totalItems} expenses
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="rounded border bg-muted p-1 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          {pageNumbers.map((page) =>
            page === "ellipsis" ? (
              <span key="ellipsis">...</span>
            ) : (
              <button
                key={page}
                onClick={() => setCurrentPage(page as number)}
                className={`min-w-8 rounded border px-2 py-1 text-sm ${
                  safeCurrentPage === page
                    ? "border-purple-600 bg-purple-600 text-white"
                    : ""
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="rounded border bg-muted p-1 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
