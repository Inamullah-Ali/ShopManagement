"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSalesStore } from "@/store/salesstore"

const chartConfig = {
  currentRevenue: {
    label: "Current Sales",
    color: "#7C3AED",
  },
  previousRevenue: {
    label: "Previous Sales",
    color: "#FCA5A5",
  },
} satisfies ChartConfig

type ChartFilter = "week" | "month" | "quarter"

type SalesChartPoint = {
  label: string
  currentRevenue: number
  previousRevenue: number
}

const filterLabels: Record<ChartFilter, string> = {
  week: "This Week",
  month: "This Month",
  quarter: "Last 3 Months",
}

function buildWeekSalesData(sales: Array<{ date: string; totalPayment: number }>) {
  const today = new Date()
  const currentWeekDates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - index))
    return date
  })
  const previousWeekDates = currentWeekDates.map((date) => {
    const previous = new Date(date)
    previous.setDate(date.getDate() - 7)
    return previous
  })

  const points: SalesChartPoint[] = currentWeekDates.map((date) => ({
    label: date.toLocaleDateString("default", { weekday: "short" }),
    currentRevenue: 0,
    previousRevenue: 0,
  }))

  const currentKeys = new Map(currentWeekDates.map((date, index) => [date.toISOString().slice(0, 10), index]))
  const previousKeys = new Map(previousWeekDates.map((date, index) => [date.toISOString().slice(0, 10), index]))

  sales.forEach((sale) => {
    const saleDate = new Date(sale.date)
    const key = saleDate.toISOString().slice(0, 10)
    const currentIndex = currentKeys.get(key)
    const previousIndex = previousKeys.get(key)

    if (typeof currentIndex === "number") {
      points[currentIndex].currentRevenue += sale.totalPayment
    }

    if (typeof previousIndex === "number") {
      points[previousIndex].previousRevenue += sale.totalPayment
    }
  })

  return points
}

function buildMonthSalesData(sales: Array<{ date: string; totalPayment: number }>) {
  const now = new Date()
  const currentMonthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthKey = `${previousMonthDate.getFullYear()}-${previousMonthDate.getMonth()}`

  const points: SalesChartPoint[] = Array.from({ length: currentMonthDays }, (_, index) => ({
    label: String(index + 1),
    currentRevenue: 0,
    previousRevenue: 0,
  }))

  sales.forEach((sale) => {
    const saleDate = new Date(sale.date)
    const monthKey = `${saleDate.getFullYear()}-${saleDate.getMonth()}`
    const dayIndex = saleDate.getDate() - 1

    if (monthKey === currentMonthKey && dayIndex >= 0 && dayIndex < points.length) {
      points[dayIndex].currentRevenue += sale.totalPayment
    }

    if (monthKey === previousMonthKey && dayIndex >= 0 && dayIndex < points.length) {
      points[dayIndex].previousRevenue += sale.totalPayment
    }
  })

  return points
}

function buildQuarterSalesData(sales: Array<{ date: string; totalPayment: number }>) {
  const now = new Date()
  const currentMonths = Array.from({ length: 3 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (2 - index), 1)
    return {
      key: `${month.getFullYear()}-${month.getMonth()}`,
      label: month.toLocaleString("default", { month: "short" }),
    }
  })
  const previousMonths = currentMonths.map((month) => {
    const [year, monthIndex] = month.key.split("-").map(Number)
    const date = new Date(year, monthIndex - 3, 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: month.label,
    }
  })

  const points: SalesChartPoint[] = currentMonths.map(({ label }) => ({
    label,
    currentRevenue: 0,
    previousRevenue: 0,
  }))

  const currentMonthMap = new Map(currentMonths.map((month, index) => [month.key, index]))
  const previousMonthMap = new Map(previousMonths.map((month, index) => [month.key, index]))

  sales.forEach((sale) => {
    const saleDate = new Date(sale.date)
    const key = `${saleDate.getFullYear()}-${saleDate.getMonth()}`
    const currentIndex = currentMonthMap.get(key)
    const previousIndex = previousMonthMap.get(key)

    if (typeof currentIndex === "number") {
      points[currentIndex].currentRevenue += sale.totalPayment
    }

    if (typeof previousIndex === "number") {
      points[previousIndex].previousRevenue += sale.totalPayment
    }
  })

  return points
}

export function ChartAreaGradient() {
  const sales = useSalesStore((state) => state.sales)
  const [filter, setFilter] = React.useState<ChartFilter>("week")

  const chartData = React.useMemo(() => {
    switch (filter) {
      case "month":
        return buildMonthSalesData(sales)
      case "quarter":
        return buildQuarterSalesData(sales)
      default:
        return buildWeekSalesData(sales)
    }
  }, [filter, sales])

  const description = React.useMemo(() => {
    switch (filter) {
      case "month":
        return "Showing daily sales for the current month"
      case "quarter":
        return "Showing monthly sales for the last 3 months"
      default:
        return "Showing daily sales for the current week"
    }
  }, [filter])

  return (
    <Card className=" overflow-hidden h-92">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(value) => setFilter(value as ChartFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Time range</SelectLabel>
                <SelectItem value="week">{filterLabels.week}</SelectItem>
                <SelectItem value="month">{filterLabels.month}</SelectItem>
                <SelectItem value="quarter">{filterLabels.quarter}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-68">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              interval={0}
              tickFormatter={(value) => String(value).slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillCurrentRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-currentRevenue)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-currentRevenue)" stopOpacity={0.12} />
              </linearGradient>
              <linearGradient id="fillPreviousRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-previousRevenue)" stopOpacity={0.6} />
                <stop offset="95%" stopColor="var(--color-previousRevenue)" stopOpacity={0.12} />
              </linearGradient>
            </defs>
            <Area
              dataKey="previousRevenue"
              type="natural"
              fill="url(#fillPreviousRevenue)"
              fillOpacity={0.4}
              stroke="var(--color-previousRevenue)"
              strokeWidth={1.5}
            />
            <Area
              dataKey="currentRevenue"
              type="natural"
              fill="url(#fillCurrentRevenue)"
              fillOpacity={0.4}
              stroke="var(--color-currentRevenue)"
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
