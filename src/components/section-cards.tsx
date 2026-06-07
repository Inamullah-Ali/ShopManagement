"use client"

import { useMemo, useEffect } from "react"
import { useCustomerStore } from "@/store/customerstore"
import { useExpenseStore } from "@/store/expensestore"
import { useProductStore } from "@/store/addproductstore"
import { useSalesStore } from "@/store/salesstore"
import { useAuthStore } from "@/store/authstore"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Boxes,
  Package,
  ShoppingBag,
  ShoppingCart,
  TrendingDownIcon,
  TrendingUpIcon,
  Wallet,
} from "lucide-react"

const formatCurrency = (value: number) => `PKR ${value.toLocaleString()}`

export function SectionCards() {
  const currentUser = useAuthStore((state) => state.currentUser)
  const allProducts = useProductStore((state) => state.products)
  const loadProductsByShop = useProductStore((state) => state.loadProductsByShop)
  const allSales = useSalesStore((state) => state.sales)
  const expenses = useExpenseStore((state) => state.expenses)
  const customers = useCustomerStore((state) => state.customers)

  // Load products from Firestore when user changes
  useEffect(() => {
    if (currentUser?.firebaseUid) {
      loadProductsByShop(currentUser.firebaseUid)
    }
  }, [currentUser?.firebaseUid, loadProductsByShop])
  
  const products = currentUser?.firebaseUid ? allProducts.filter((p) => p.shopId === currentUser.firebaseUid) : []
  const sales = currentUser?.firebaseUid ? allSales.filter((s) => s.shopId === currentUser.firebaseUid) : []

  const totalStockValue = useMemo(
    () => products.reduce((sum, product) => sum + product.purchasePrice * product.stock, 0),
    [products],
  )

  const totalStockItems = useMemo(
    () => products.reduce((sum, product) => sum + product.stock, 0),
    [products],
  )

  const totalSalesThisMonth = useMemo(() => {
    const now = new Date()
    return sales
      .filter((sale) => {
        const saleDate = new Date(sale.date)
        return (
          saleDate.getFullYear() === now.getFullYear() &&
          saleDate.getMonth() === now.getMonth()
        )
      })
      .reduce((sum, sale) => sum + sale.totalPayment, 0)
  }, [sales])

  // Previous month sales total (for percentage change)
  const previousSalesThisMonth = useMemo(() => {
    const now = new Date()
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return sales
      .filter((sale) => {
        const saleDate = new Date(sale.date)
        return (
          saleDate.getFullYear() === prev.getFullYear() &&
          saleDate.getMonth() === prev.getMonth()
        )
      })
      .reduce((sum, sale) => sum + sale.totalPayment, 0)
  }, [sales])

  const productsAddedThisMonth = useMemo(() => {
    const now = new Date()
    return products.filter((p) => {
      if (!p.createdAt) return false
      const d = new Date(p.createdAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  }, [products])

  const productsAddedPreviousMonth = useMemo(() => {
    const now = new Date()
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return products.filter((p) => {
      if (!p.createdAt) return false
      const d = new Date(p.createdAt)
      return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth()
    }).length
  }, [products])

  const stockItemsAddedThisMonth = useMemo(() => {
    const now = new Date()
    return products
      .filter((p) => {
        if (!p.createdAt) return false
        const d = new Date(p.createdAt)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      .reduce((sum, p) => sum + (p.stock ?? 0), 0)
  }, [products])

  const stockItemsAddedPreviousMonth = useMemo(() => {
    const now = new Date()
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return products
      .filter((p) => {
        if (!p.createdAt) return false
        const d = new Date(p.createdAt)
        return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth()
      })
      .reduce((sum, p) => sum + (p.stock ?? 0), 0)
  }, [products])

  const stockValueAddedThisMonth = useMemo(() => {
    const now = new Date()
    return products
      .filter((p) => {
        if (!p.createdAt) return false
        const d = new Date(p.createdAt)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      .reduce((sum, p) => sum + (p.purchasePrice ?? 0) * (p.stock ?? 0), 0)
  }, [products])

  const stockValueAddedPreviousMonth = useMemo(() => {
    const now = new Date()
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return products
      .filter((p) => {
        if (!p.createdAt) return false
        const d = new Date(p.createdAt)
        return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth()
      })
      .reduce((sum, p) => sum + (p.purchasePrice ?? 0) * (p.stock ?? 0), 0)
  }, [products])

  const customersThisMonth = useMemo(() => {
    const now = new Date()
    return customers.filter((c) => {
      const d = new Date(c.joinDate)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    }).length
  }, [customers])

  const customersPreviousMonth = useMemo(() => {
    const now = new Date()
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return customers.filter((c) => {
      const d = new Date(c.joinDate)
      return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth()
    }).length
  }, [customers])

  function percentChange(current: number, previous: number) {
    if (previous === 0) {
      if (current === 0) return 0
      return 100
    }

    return ((current - previous) / Math.abs(previous)) * 100
  }

  function formatPercent(n: number) {
    const rounded = Math.round(n * 10) / 10
    return `${rounded > 0 ? "+" : ""}${rounded}%`
  }

  const cards = useMemo(
    () => {
      const prodChange = percentChange(productsAddedThisMonth, productsAddedPreviousMonth)
      const prodTrend = prodChange >= 0 ? "up" : "down"

      const stockValueChange = percentChange(stockValueAddedThisMonth, stockValueAddedPreviousMonth)
      const stockValueTrend = stockValueChange >= 0 ? "up" : "down"

      const stockItemsChange = percentChange(stockItemsAddedThisMonth, stockItemsAddedPreviousMonth)
      const stockItemsTrend = stockItemsChange >= 0 ? "up" : "down"

      const customerChange = percentChange(customersThisMonth, customersPreviousMonth)
      const customerTrend = customerChange >= 0 ? "up" : "down"

      const salesChange = percentChange(totalSalesThisMonth, previousSalesThisMonth)
      const salesTrend = salesChange >= 0 ? "up" : "down"

      return [
        {
          title: "Total Products",
          value: products.length.toLocaleString(),
          change: formatPercent(prodChange),
          trend: prodTrend,
          icon: <Package className="size-7" />,
          iconClassName: "bg-violet-100 text-violet-600",
          bgClassName: "bg-violet-100",
        },
        {
          title: "Total Stock Value",
          value: formatCurrency(totalStockValue),
          change: formatPercent(stockValueChange),
          trend: stockValueTrend,
          icon: <Boxes className="size-7" />,
          iconClassName: "bg-emerald-100 text-emerald-600",
          bgClassName: "bg-emerald-100",
        },
        {
          title: "Total Stock Items",
          value: totalStockItems.toLocaleString(),
          change: formatPercent(stockItemsChange),
          trend: stockItemsTrend,
          icon: <ShoppingBag className="size-7" />,
          iconClassName: "bg-sky-100 text-sky-600",
          bgClassName: "bg-sky-100",
        },
        {
          title: "Customers",
          value: customers.length.toLocaleString(),
          change: formatPercent(customerChange),
          trend: customerTrend,
          icon: <ShoppingCart className="size-7" />,
          iconClassName: "bg-amber-100 text-amber-600",
          bgClassName: "bg-amber-100",
        },
        {
          title: "Sales This Month",
          value: formatCurrency(totalSalesThisMonth),
          change: formatPercent(salesChange),
          trend: salesTrend,
          icon: <Wallet className="size-7" />,
          iconClassName: "bg-rose-100 text-rose-600",
          bgClassName: "bg-rose-100",
        },
      ]
    },
    [
      products.length,
      totalStockValue,
      totalStockItems,
      sales.length,
      totalSalesThisMonth,
      expenses.length,
      productsAddedThisMonth,
      productsAddedPreviousMonth,
      stockItemsAddedThisMonth,
      stockItemsAddedPreviousMonth,
      stockValueAddedThisMonth,
      stockValueAddedPreviousMonth,
      customersThisMonth,
      customersPreviousMonth,
      previousSalesThisMonth,
    ],
  )
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3 @5xl/main:grid-cols-5 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => {
        const isUp = card.trend === "up"

        return (
          <Card key={card.title} className={`@container/card ${card.bgClassName}`}>
            <CardHeader>
              <div className="flex flex-row items-center justify-between gap-2">
                <div>
                  <CardDescription>{card.title}</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {card.value}
                  </CardTitle>
                </div>
                <div className={`flex items-center gap-2 rounded-md p-2 ${card.iconClassName}`}>
                  {card.icon}
                </div>
              </div>
            </CardHeader>
              <CardAction className="px-4 lg:px-4">
                <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? "text-green-500" : "text-red-500"}`}>
                  {isUp ? (
                    <TrendingUpIcon className="size-4" />
                  ) : (
                    <TrendingDownIcon className="size-4" />
                  )}
                  {card.change} from last month
                </div>
              </CardAction>
          </Card>
        )
      })}
    </div>
  )
}