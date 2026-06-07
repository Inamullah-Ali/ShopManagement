import { DatePickerRange } from "@/components/datepickrange";
import { AddExpenseDialogue } from "@/components/dialogue/addexpense";
import { ExpenseChart } from "@/components/expensechart";
import ExpenseTable from "@/components/tables/expensetable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Expenses } from "@/types/expense";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authstore";
import { Calendar, Download, Funnel, Plus, Search, Loader2 } from "lucide-react";
import { useExpenseStore } from "@/store/expensestore";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { formatDate, formatDateTime } from "@/lib/date";

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all-status");
  const [dateRange, setDateRange] = useState<any | undefined>(undefined);
  const [mobilePickerOpen, setMobilePickerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const expenses = useExpenseStore((state) => state.expenses);
  const loadExpensesByShop = useExpenseStore((state) => state.loadExpensesByShop);
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser?.firebaseUid) {
      loadExpensesByShop(currentUser.firebaseUid);
    }
  }, [currentUser?.firebaseUid, loadExpensesByShop]);

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.paidamount,
    0,
  );

  const today = new Date();

  const todayExpense = expenses
    .filter((expense) => {
      const date = new Date(expense.date);

      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + expense.paidamount, 0);

  const weekStart = new Date();
  weekStart.setDate(today.getDate() - 7);

  const weekExpense = expenses
    .filter((expense) => new Date(expense.date) >= weekStart)
    .reduce((sum, expense) => sum + expense.paidamount, 0);

  const monthExpense = expenses
    .filter((expense) => {
      const date = new Date(expense.date);

      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + expense.paidamount, 0);

  const uniqueDays = new Set(
    expenses.map((expense) => new Date(expense.date).toDateString()),
  ).size;

  const averageDailyExpense =
    uniqueDays > 0 ? Math.round(totalExpenses / uniqueDays) : 0;
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const q = searchTerm.trim().toLowerCase();

      if (q) {
        const matchesName = e.expensename.toLowerCase().includes(q);

        if (!matchesName) return false;
      }

      if (statusFilter !== "all-status") {
        if (statusFilter === "complete" && e.status !== "Complete")
          return false;

        if (statusFilter === "pending" && e.status !== "Pending") return false;
      }

      if (dateRange?.from) {
        const expenseDate = new Date(e.date).getTime();

        const from = new Date(dateRange.from);
        from.setHours(0, 0, 0, 0);

        const to = dateRange.to
          ? new Date(dateRange.to)
          : new Date(dateRange.from);

        to.setHours(23, 59, 59, 999);

        if (expenseDate < from.getTime() || expenseDate > to.getTime()) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, searchTerm, statusFilter, dateRange]);

  const handleExportReport = async () => {
    if (filtered.length === 0) {
      toast.error("Table is empty");
      return;
    }

    setIsExporting(true);

    try {
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;

      // Title
      pdf.setFontSize(16);
      pdf.text("Expense Report", margin, yPosition);
      yPosition += 10;

      // Date range info
      pdf.setFontSize(10);
      if (dateRange?.from) {
        const fromDate = formatDate(dateRange.from);
        const toDate = dateRange.to ? formatDate(dateRange.to) : fromDate;
        pdf.text(`Date Range: ${fromDate} to ${toDate}`, margin, yPosition);
      } else {
        pdf.text(`Generated on: ${formatDateTime(new Date())}`, margin, yPosition);
      }
      yPosition += 8;

      // Summary
      const totalAmount = filtered.reduce((sum, e) => sum + e.totalamount, 0);
      const paidAmount = filtered.reduce((sum, e) => sum + e.paidamount, 0);
      const pendingAmount = totalAmount - paidAmount;

      pdf.text(`Total Expenses: ${filtered.length}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Total Amount: PKR ${totalAmount.toLocaleString()}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Paid Amount: PKR ${paidAmount.toLocaleString()}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Pending Amount: PKR ${pendingAmount.toLocaleString()}`, margin, yPosition);
      yPosition += 10;

      // Table
      pdf.setFontSize(9);
      const columns = ["Name", "Category", "Date", "Total", "Paid", "Status"];
      const columnWidths = [
        contentWidth * 0.2,
        contentWidth * 0.15,
        contentWidth * 0.15,
        contentWidth * 0.15,
        contentWidth * 0.15,
        contentWidth * 0.2,
      ];

      // Table header
      pdf.setFillColor(200, 150, 230);
      let xPosition = margin;
      columns.forEach((col, idx) => {
        pdf.text(col, xPosition + 2, yPosition, { maxWidth: columnWidths[idx] - 4 });
        xPosition += columnWidths[idx];
      });
      yPosition += 8;

      // Table rows
      pdf.setFillColor(245, 245, 245);
      filtered.forEach((expense, idx) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 10;
        }

        xPosition = margin;
        const rowData = [
          expense.expensename,
          expense.category,
          formatDate(expense.date),
          `PKR ${expense.totalamount.toLocaleString()}`,
          `PKR ${expense.paidamount.toLocaleString()}`,
          expense.status,
        ];

        if (idx % 2 === 0) {
          pdf.rect(margin, yPosition - 6, contentWidth, 7, "F");
        }

        rowData.forEach((data, colIdx) => {
          pdf.text(data, xPosition + 2, yPosition, { maxWidth: columnWidths[colIdx] - 4 });
          xPosition += columnWidths[colIdx];
        });
        yPosition += 8;
      });

      // Save PDF
      const fileName = `Expense_Report_${formatDateTime(new Date(), "dd_MM_yyyy_HHmmss")}.pdf`;
      pdf.save(fileName);
      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="flex flex-row justify-between gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="font-semibold">Expenses</CardTitle>
            <CardDescription>
              Manage and track your business expenses
            </CardDescription>
          </div>
          <div className="flex gap-2 sm:w-auto flex-row sm:items-center">
            <div className="flex justify-start lg:justify-end sm:hidden">
              <AddExpenseDialogue
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
              <AddExpenseDialogue />
            </div>
            <div className="flex justify-start lg:justify-end sm:hidden">
              <Button
                onClick={handleExportReport}
                variant="outline"
                size="icon"
                className="cursor-pointer bg-purple-500 text-white hover:bg-purple-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
              </Button>
            </div>
            <div className="hidden justify-start lg:justify-end sm:flex">
              <Button
                onClick={handleExportReport}
                variant="outline"
                className="w-full cursor-pointer border border-purple-500 font-bold text-purple-500 hover:bg-gray-100 hover:text-purple-600 sm:w-auto disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download /> Export Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-7">
        <div className="col-span-1 flex flex-col gap-2 xl:col-span-5 w-full">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Search size={16} />
              </span>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search expenses..."
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
                    <SelectItem value="all-status">All</SelectItem>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
                  <DropdownMenuItem
                    onClick={() => setStatusFilter("all-status")}
                  >
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("complete")}>
                    Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="block sm:hidden">
              <Button
                type="button"
                aria-label="Open date picker"
                onClick={() => setMobilePickerOpen(true)}
                className="cursor-pointer bg-muted text-muted-foreground hover:bg-muted/80"
              >
                <Calendar size={18} />
              </Button>
            </div>
            <div className="hidden sm:block w-full md:w-auto">
              <DatePickerRange value={dateRange} onChange={setDateRange} />
            </div>
            <div className="sm:hidden">
              <div className="hidden">
                <div className="sm:hidden absolute left-0 top-full z-50">
                  <DatePickerRange
                    value={dateRange}
                    onChange={setDateRange}
                    open={mobilePickerOpen}
                    onOpenChange={(o) => setMobilePickerOpen(o)}
                    hideTrigger
                  />
                </div>
              </div>
            </div>
          </div>
          <ExpenseTable data={filtered} />
        </div>
        <div className="col-span-1 flex flex-col gap-2 xl:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold">Expense Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium text-slate-500">Total Expenses</p>
                  <p className="font-semibold text-xs">
                    PKR {totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium text-slate-500">Today Expense</p>
                  <p className="font-semibold text-xs">
                    PKR {todayExpense.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium text-slate-500">
                    This Week Expense
                  </p>
                  <p className="font-semibold text-xs">
                    PKR {weekExpense.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-medium text-slate-500">
                    This Month Expense
                  </p>
                  <p className="font-semibold text-xs">
                    PKR {monthExpense.toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold">Average Daily Expense</p>
                  <p className="font-semibold text-xs">
                    PKR {averageDailyExpense.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div>
            <ExpenseChart />
          </div>
        </div>
      </div>
    </div>
  );
}
