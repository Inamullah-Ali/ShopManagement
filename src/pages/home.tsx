import { useMemo, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { SectionCards } from "@/components/section-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Package, ShoppingCart, User, Users } from "lucide-react"
import { AddSaleDialogue } from "@/components/dialogue/addsaleDialogue"
import { useCustomerStore } from "@/store/customerstore"
import { useExpenseStore } from "@/store/expensestore"
import { useProductStore } from "@/store/addproductstore"
import { useSalesStore } from "@/store/salesstore"
import { useAuthStore } from "@/store/authstore"
import { ChartAreaGradient } from "@/components/chart-area-interactive"
import type { PurchaseHistory } from "@/types/purchasehistory"

const purchasePageStorageKey = "purchase-page-storage"

const readPurchasePageState = () => {
  if (typeof window === "undefined") {
    return null
  }

  const rawValue = window.localStorage.getItem(purchasePageStorageKey)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as { recentPurchases?: PurchaseHistory[] }
  } catch {
    return null
  }
}

const formatCurrency = (value: number) => `PKR ${value.toLocaleString()}`

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return format(date, "dd MMM yyyy")
}

export default function Home() {
  const navigate = useNavigate()
  const currentUser = useAuthStore((state) => state.currentUser)
  const allProducts = useProductStore((state) => state.products)
  const loadProductsByShop = useProductStore((state) => state.loadProductsByShop)
  const allSales = useSalesStore((state) => state.sales)
  const loadSalesByShop = useSalesStore((state) => state.loadSalesByShop)
  const addSale = useSalesStore((state) => state.addSale)
  const expenses = useExpenseStore((state) => state.expenses)
  const loadExpensesByShop = useExpenseStore((state) => state.loadExpensesByShop)
  const customers = useCustomerStore((state) => state.customers)
  const loadCustomersByShop = useCustomerStore((state) => state.loadCustomersByShop)

  // Load Firestore data for the active shop
  useEffect(() => {
    if (!currentUser?.firebaseUid) {
      return
    }

    loadProductsByShop(currentUser.firebaseUid)
    loadSalesByShop(currentUser.firebaseUid)
    loadExpensesByShop(currentUser.firebaseUid)
    loadCustomersByShop(currentUser.firebaseUid)
  }, [
    currentUser?.firebaseUid,
    loadProductsByShop,
    loadSalesByShop,
    loadExpensesByShop,
    loadCustomersByShop,
  ])

  const products = currentUser?.firebaseUid ? allProducts.filter((p) => p.shopId === currentUser.firebaseUid) : []
  const sales = currentUser?.firebaseUid ? allSales.filter((s) => s.shopId === currentUser.firebaseUid) : []

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.status === "Low Stock" || product.stock < 10),
    [products],
  )

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [sales],
  )

  const [recentPurchaseHistory, setRecentPurchaseHistory] = useState<PurchaseHistory[]>([])

  const recentPurchaseItems = useMemo(() => {
    const storedHistory = recentPurchaseHistory
      .flatMap((purchase) =>
        purchase.items?.map((item) => {
          const product = allProducts.find((p) => String(p.id) === String(item.id));

          return {
            id: `${purchase.id}-${item.id}`,
            name: item.name,
            quantity: Number(item.quantity || 0),
            price: typeof item.purchasePrice === "number" ? item.purchasePrice : 0,
            image: product?.image ?? undefined,
            suppliername: purchase.suppliername,
            date: purchase.date,
          }
        }) || [],
      )
      .filter((item) => item.quantity > 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 9)

    if (storedHistory.length > 0) {
      return storedHistory
    }

    return recentPurchaseHistory
      .slice(0, 9)
      .map((purchase) => ({
        id: purchase.id,
        name: purchase.suppliername,
        quantity: purchase.totalQuantity ?? 0,
        price: purchase.totalAmount,
        image: undefined,
        suppliername: purchase.suppliername,
        date: purchase.date,
      }))
  }, [recentPurchaseHistory])

  useEffect(() => {
    const state = readPurchasePageState()
    setRecentPurchaseHistory(state?.recentPurchases ?? [])
  }, [])

  const topSellProducts = useMemo(() => {
    const totals = new Map<
      string | number,
      { id: string | number; name: string; quantity: number; price: number; image?: string }
    >()

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = totals.get(item.id)
        const product = products.find((product) => product.id === item.id)
        const price = product?.sellPrice ?? item.price

        if (existing) {
          existing.quantity += item.quantity
        } else {
          totals.set(item.id, {
            id: item.id,
            name: item.name || product?.name || `Product ${item.id}`,
            quantity: item.quantity,
            price,
            image: product?.image,
          })
        }
      })
    })

    return Array.from(totals.values())
      .filter((item) => item.quantity > 10)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 9)
  }, [sales, products])

  const normalizeDateString = (dateValue: string) =>
    new Date(dateValue).toISOString().slice(0, 10)

  const todaySalesTotal = useMemo(
    () =>
      sales
        .filter((sale) => normalizeDateString(sale.date) === today)
        .reduce((sum, sale) => sum + sale.totalPayment, 0),
    [sales, today],
  )

  const todayProfit = useMemo(
    () =>
      sales
        .filter((sale) => normalizeDateString(sale.date) === today)
        .reduce((total, sale) => {
          return (
            total +
            sale.items.reduce((itemTotal, item) => {
              const product = products.find((product) => product.id === item.id)
              const purchasePrice = product?.purchasePrice ?? 0
              return itemTotal + (item.price - purchasePrice) * item.quantity
            }, 0)
          )
        }, 0),
    [sales, products, today],
  )

  const todayExpensesTotal = useMemo(
    () =>
      expenses
        .filter((expense) => normalizeDateString(expense.date) === today)
        .reduce((sum, expense) => sum + expense.totalamount, 0),
    [expenses, today],
  )

  const thisWeekSalesTotal = useMemo(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    return sales
      .filter((sale) => new Date(sale.date) >= weekAgo)
      .reduce((sum, sale) => sum + sale.totalPayment, 0)
  }, [sales])

  const averageSale = useMemo(
    () => (sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.totalPayment, 0) / sales.length : 0),
    [sales],
  )

  const pendingPayments = useMemo(
    () => sales.reduce((sum, sale) => sum + (sale.remainingBalance ?? 0), 0),
    [sales],
  )

  const currentMonthExpenses = useMemo(() => {
    const now = new Date()
    return expenses
      .filter((expense) => {
        const expenseDate = new Date(expense.date)
        return (
          expenseDate.getFullYear() === now.getFullYear() &&
          expenseDate.getMonth() === now.getMonth()
        )
      })
      .reduce((sum, expense) => sum + expense.totalamount, 0)
  }, [expenses])

  const salesDetails = [
    {
      id: 1,
      label: "Today Sales",
      value: formatCurrency(todaySalesTotal),
    },
    {
      id: 2,
      label: "Today Profit",
      value: formatCurrency(todayProfit),
    },
    {
      id: 3,
      label: "Today Expenses",
      value: formatCurrency(todayExpensesTotal),
    },
    {
      id: 4,
      label: "This Week",
      value: formatCurrency(thisWeekSalesTotal),
    },
    {
      id: 5,
      label: "Customers",
      value: customers.length.toLocaleString(),
    },
    {
      id: 6,
      label: "Average Sale",
      value: formatCurrency(averageSale),
    },
  ]

  const bottomStats = [
    {
      id: 1,
      label: "Pending Payments",
      value: formatCurrency(pendingPayments),
    },
    {
      id: 2,
      label: "Expenses (Month)",
      value: formatCurrency(currentMonthExpenses),
    },
  ]

  const quickActions = [
    {
      id: 1,
      title: "Add Product",
      icon: Package,
      route: "/products",
      tileClassName: "bg-sky-100 text-sky-600",
      iconClassName: "bg-sky-200 text-sky-700",
    },
    {
      id: 2,
      title: "Add Purchase",
      icon: ShoppingCart,
      route: "/purchase",
      tileClassName: "bg-emerald-100 text-emerald-600",
      iconClassName: "bg-emerald-200 text-emerald-700",
    },
    {
      id: 3,
      title: "Add Customer",
      icon: Users,
      route: "/customers",
      tileClassName: "bg-amber-100 text-amber-600",
      iconClassName: "bg-amber-200 text-amber-700",
    },
    {
      id: 4,
      title: "Add Supplier",
      icon: User,
      route: "/suppliers",
      tileClassName: "bg-rose-100 text-rose-600",
      iconClassName: "bg-rose-200 text-rose-700",
    },
    {
      id: 6,
      title: "Add Expense",
      icon: ShoppingCart,
      route: "/expenses",
      tileClassName: "bg-green-100 text-green-600",
      iconClassName: "bg-green-200 text-green-700",
    },
    {
      id: 5,
      title: "View Reports",
      icon: Package,
      route: "/reports",
      tileClassName: "bg-violet-100 text-violet-600",
      iconClassName: "bg-violet-200 text-violet-700",
    },
  ]

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Top Cards */}
          <SectionCards />

          {/* Charts + Side Cards */}
          <div className="grid grid-cols-1 gap-3 px-4 sm:px-6 xl:grid-cols-17">
            {/* Main Chart */}
            <div className="xl:col-span-9">
              <ChartAreaGradient />
            </div>

            {/* Low Stock */}
            <div className="xl:col-span-4">
              <Card className="flex h-92 flex-col">
                <CardHeader>
                  <CardTitle className="font-bold">Low Stock Alert</CardTitle>
                  <CardDescription className="text-sm">
                    {lowStockProducts.length} products are low in stock
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div className="flex max-h-full flex-col gap-2 pr-2 overflow-y-auto">
                    {lowStockProducts.length > 0 ? (
                      lowStockProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="overflow-hidden shrink-0 w-10 h-10 rounded-md bg-gray-200">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                No Image
                              </div>
                            )}
                          </div>

                            <p className="text-sm font-medium truncate">
                              {product.name}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <p className="text-xs tracking-wide text-red-500">
                              Low Stock:
                            </p>

                            <div className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-red-600 rounded-full bg-rose-200">
                              {product.stock}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No low stock products found.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* POS + Sell Summary */}
            <div className="xl:col-span-4 flex flex-col gap-2">
             <AddSaleDialogue onComplete={addSale} />

              <Card className="min-h-80">
                <CardHeader>
                  <CardTitle className="font-bold">Sales Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    {salesDetails.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg p-2"
                      >
                        <p className="text-sm font-bold text-muted-foreground">
                          {item.label}
                        </p>

                        <p className="text-sm font-semibold">
                          {item.value}
                        </p>
                      </div>
                    ))}
                    <div className="h-0.5 w-full bg-gray-300" />

                    <div className="grid grid-cols-2 gap-3">
                      {bottomStats.map((item) => (
                        <div key={item.id} className="rounded-xl p-2">
                          <p className="text-xs font-bold text-muted-foreground">
                            {item.label}
                          </p>

                          <p className="mt-1 text-base font-bold">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 gap-3 px-4 sm:px-6 xl:grid-cols-17">
            <Card className="h-full max-h-92 xl:col-span-9 xl:-mt-24">
              <CardHeader>
                <CardTitle className="font-bold">Recent Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-30">Products</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>{sale.customerName || "Unknown"}</TableCell>
                        <TableCell>{formatDate(sale.date)}</TableCell>
                        <TableCell
                          className="max-w-30 truncate whitespace-nowrap"
                          title={sale.productSummary}
                        >
                          {sale.productSummary}
                        </TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>{formatCurrency(sale.totalPayment)}</TableCell>
                        <TableCell className="text-center align-middle">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-2.5 py-1.5 text-center text-sm font-medium ${
                              sale.status === "Complete"
                                ? "bg-green-100 text-green-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {sale.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="xl:col-span-4 xl:-mt-24">
              <Card className="min-h-115">
                <CardHeader>
                  <CardTitle className="font-bold">Recent Purchases</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div className="flex max-h-120 flex-col gap-2 pr-2 overflow-y-auto">
                    {recentPurchaseItems.length > 0 ? (
                      recentPurchaseItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="overflow-hidden shrink-0 w-10 h-10 rounded-md bg-gray-200">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {item.name}
                              </p>

                              <p className="text-xs font-bold text-muted-foreground">
                                {item.quantity} Purchased
                              </p>
                            </div>
                          </div>

                          <div className="font-bold shrink-0 whitespace-nowrap">
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No recent purchase data available.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="xl:col-span-4 xl:-mt-2">
              <Card className="h-full min-h-90">
                <CardHeader>
                  <CardTitle className="font-bold">Top Sell</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div className="flex max-h-95 flex-col gap-2 pr-2 overflow-y-auto">
                    {topSellProducts.length > 0 ? (
                      topSellProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="overflow-hidden shrink-0 w-10 h-10 rounded-md bg-gray-200">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col min-w-0">
                              <p className="text-sm font-semibold truncate">
                                {product.name}
                              </p>

                              <p className="text-xs font-bold text-muted-foreground">
                                {product.quantity} Sold
                              </p>
                            </div>
                          </div>

                          <div className="font-bold shrink-0 whitespace-nowrap">
                            {formatCurrency(product.price)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No product has more than 10 sales yet.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="items-center justify-center sm:px-2 w-full md:w-full md:px-6 xl:px-2 xl:max-w-167.5 xl:-mt-27 xl:ml-4 px-4">
            <Card className="w-full p-0">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {quickActions.map((item) => {
                    const Icon = item.icon

                    return (
                      <div
                        key={item.id}
                        className={`flex min-h-20 flex-col items-center gap-2 rounded-md px-2 py-3 text-center cursor-pointer ${item.tileClassName}`}
                        onClick={() => item.route && navigate(item.route)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            item.route && navigate(item.route)
                          }
                        }}
                      >
                        <div className={`flex items-center justify-center rounded-md`}>
                          <Icon size={24} color="currentColor" />
                        </div>
                        <p className="text-xs font-semibold">{item.title}</p>
                      </div>
                    )
                  })}
                </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
