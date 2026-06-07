import { useMemo, useEffect } from "react";
import jsPDF from "jspdf";
import { formatDateTime } from "@/lib/date";
import { Download, DollarSign, Users, Layers, ShoppingCart, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerStore } from "@/store/customerstore";
import { useExpenseStore } from "@/store/expensestore";
import { useProductStore } from "@/store/addproductstore";
import { useSalesStore } from "@/store/salesstore";
import { useSupplierStore } from "@/store/supplierstore";
import { useAuthStore } from "@/store/authstore";

export default function Reports() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const allSales = useSalesStore((state) => state.sales);
  const allProducts = useProductStore((state) => state.products);
  const loadProductsByShop = useProductStore((state) => state.loadProductsByShop);

  // Load products from Firestore when user changes
  useEffect(() => {
    if (currentUser?.firebaseUid) {
      loadProductsByShop(currentUser.firebaseUid);
    }
  }, [currentUser?.firebaseUid, loadProductsByShop]);

  const sales = currentUser?.firebaseUid ? allSales.filter((s) => s.shopId === currentUser.firebaseUid) : [];
  const expenses = useExpenseStore((state) => state.expenses);
  const products = currentUser?.firebaseUid ? allProducts.filter((p) => p.shopId === currentUser.firebaseUid) : [];
  const customers = useCustomerStore((state) => state.customers);
  const suppliers = useSupplierStore((state) => state.suppliers);

  const totalRevenue = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.totalPayment, 0),
    [sales],
  );

  const totalSales = sales.length;
  const totalQuantity = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.quantity, 0),
    [sales],
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.paidamount, 0),
    [expenses],
  );

  const pendingExpenses = useMemo(
    () =>
      expenses.reduce((sum, expense) => sum + (expense.totalamount - expense.paidamount), 0),
    [expenses],
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.status === "Low Stock" || product.stock < 10).length,
    [products],
  );

  const today = useMemo(() => new Date(), []);

  const todaySales = useMemo(
    () =>
      sales
        .filter((sale) => {
          const date = new Date(sale.date);
          return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          );
        })
        .reduce((sum, sale) => sum + sale.totalPayment, 0),
    [sales, today],
  );

  const monthSales = useMemo(
    () =>
      sales
        .filter((sale) => {
          const date = new Date(sale.date);
          return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        })
        .reduce((sum, sale) => sum + sale.totalPayment, 0),
    [sales, today],
  );

  const topSellingProducts = useMemo(() => {
    const aggregated = new Map();

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = products.find((product) => product.id === item.id);
        const name = item.name || product?.name || `Product ${item.id}`;
        const revenue = item.price * item.quantity;
        const existing = aggregated.get(item.id);

        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += revenue;
        } else {
          aggregated.set(item.id, {
            id: item.id,
            name,
            quantity: item.quantity,
            revenue,
          });
        }
      });
    });

    return Array.from(aggregated.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 6);
  }, [sales, products]);

  const handleExportReport = () => {
    const pdf = new jsPDF();
    let yPosition = 20;
    const leftMargin = 16;

    pdf.setFontSize(18);
    pdf.text("Business Report", leftMargin, yPosition);
    yPosition += 14;

    pdf.setFontSize(10);
    pdf.text(`Generated on: ${formatDateTime(new Date())}`, leftMargin, yPosition);
    yPosition += 16;

    pdf.setFontSize(11);
    pdf.text("Summary", leftMargin, yPosition);
    yPosition += 10;

    const summaryRows = [
      ["Total Sales", String(totalSales)],
      ["Total Revenue", `PKR ${totalRevenue.toLocaleString()}`],
      ["Quantity Sold", String(totalQuantity)],
      ["Total Expenses", `PKR ${totalExpenses.toLocaleString()}`],
      ["Pending Expenses", `PKR ${pendingExpenses.toLocaleString()}`],
      ["Products", String(products.length)],
      ["Customers", String(customers.length)],
      ["Suppliers", String(suppliers.length)],
    ];

    summaryRows.forEach(([label, value]) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 32) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(`${label}: ${value}`, leftMargin, yPosition);
      yPosition += 8;
    });

    yPosition += 8;
    pdf.text("Top Selling Products", leftMargin, yPosition);
    yPosition += 10;

    if (topSellingProducts.length === 0) {
      pdf.text("No sales data available.", leftMargin, yPosition);
      yPosition += 8;
    } else {
      topSellingProducts.forEach((item) => {
        if (yPosition > pdf.internal.pageSize.getHeight() - 32) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${item.name} — ${item.quantity} pcs • PKR ${item.revenue.toLocaleString()}`, leftMargin, yPosition);
        yPosition += 8;
      });
    }

    pdf.save(`Business_Report_${formatDateTime(new Date(), "yyyyMMdd_HHmmss")}.pdf`);
  };

  const summaryItems = [
    {
      label: "Total Revenue",
      value: `PKR ${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "All sales revenue",
    },
    {
      label: "Total Expenses",
      value: `PKR ${totalExpenses.toLocaleString()}`,
      icon: ShoppingCart,
      description: "Paid business expenses",
    },
    {
      label: "Low Stock",
      value: String(lowStockProducts),
      icon: Package,
      description: "Products needing restock",
    },
    {
      label: "Customers",
      value: String(customers.length),
      icon: Users,
      description: "Registered customers",
    },
    {
      label: "Suppliers",
      value: String(suppliers.length),
      icon: Layers,
      description: "Supplier accounts",
    },
  ];

  return (
    <div className="flex flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">View business performance and download a consolidated PDF report.</p>
        </div>
        <Button onClick={handleExportReport} variant="outline" className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Business Summary</CardTitle>
            <CardDescription>Quick overview of sales, customers, expenses and stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {summaryItems.map((item) => (
                <div key={item.label} className="rounded-3xl border border-border bg-card px-4 py-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-semibold">{item.value}</p>
                    </div>
                    <div className="rounded-2xl bg-muted p-2 text-muted-foreground">
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Metrics</CardTitle>
            <CardDescription>Today's and monthly performance snapshot.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-card px-4 py-4">
                <p className="text-sm text-muted-foreground">Today&apos;s Sales</p>
                <p className="mt-1 text-xl font-semibold">PKR {todaySales.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl border border-border bg-card px-4 py-4">
                <p className="text-sm text-muted-foreground">This Month&apos;s Sales</p>
                <p className="mt-1 text-xl font-semibold">PKR {monthSales.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl border border-border bg-card px-4 py-4">
                <p className="text-sm text-muted-foreground">Quantity Sold</p>
                <p className="mt-1 text-xl font-semibold">{totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2 xl:pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Most sold products by quantity.</CardDescription>
          </CardHeader>
          <CardContent>
            {topSellingProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellingProducts.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>PKR {item.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No sales data available yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Totals and pending expense amount.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-3xl border border-border bg-card px-4 py-4">
                <p className="text-sm text-muted-foreground">Total Paid Expenses</p>
                <p className="mt-1 text-xl font-semibold">PKR {totalExpenses.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl border border-border bg-card px-4 py-4">
                <p className="text-sm text-muted-foreground">Pending Expense Amount</p>
                <p className="mt-1 text-xl font-semibold">PKR {pendingExpenses.toLocaleString()}</p>
              </div>
              <div className="rounded-3xl border border-border bg-card px-4 py-4">
                <p className="text-sm text-muted-foreground">Number of Expense Records</p>
                <p className="mt-1 text-xl font-semibold">{expenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
