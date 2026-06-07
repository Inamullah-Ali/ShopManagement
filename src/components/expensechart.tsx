"use client";

import { Pie, PieChart, Cell } from "recharts";

import { useExpenseStore } from "@/store/expensestore";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  amount: {
    label: "Amount",
  },
  Rent: {
    label: "Rent",
    color: "#22c55e",
  },
  "Electric Bill": {
    label: "Electric Bill",
    color: "#ef4444",
  },
  "Internet Bill": {
    label: "Internet Bill",
    color: "#eab308",
  },
  "Shop Products": {
    label: "Shop Products",
    color: "#a855f7",
  },
  Other: {
    label: "Other",
    color: "#6b7280",
  },
} satisfies ChartConfig;

export function ExpenseChart() {
  const expenses = useExpenseStore(
    (state) => state.expenses
  );

const rentTotal = expenses
  .filter((e) => e.category === "Rent")
  .reduce((sum, e) => sum + e.paidamount, 0);

const electricTotal = expenses
  .filter((e) => e.category === "Electric Bill")
  .reduce((sum, e) => sum + e.paidamount, 0);

const internetTotal = expenses
  .filter((e) => e.category === "Internet Bill")
  .reduce((sum, e) => sum + e.paidamount, 0);

const shopProductsTotal = expenses
  .filter((e) => e.category === "Shop Products")
  .reduce((sum, e) => sum + e.paidamount, 0);

const otherTotal = expenses
  .filter((e) => e.category === "Other")
  .reduce((sum, e) => sum + e.paidamount, 0);

  const chartData = [
    {
      category: "Rent",
      amount: rentTotal,
      fill: "#22c55e",
    },
    {
      category: "Electric Bill",
      amount: electricTotal,
      fill: "#ef4444",
    },
    {
      category: "Internet Bill",
      amount: internetTotal,
      fill: "#eab308",
    },
    {
      category: "Shop Products",
      amount: shopProductsTotal,
      fill: "#a855f7",
    },
    {
      category: "Other",
      amount: otherTotal,
      fill: "#6b7280",
    },
  ];

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-start pb-0 sm:items-center">
        <CardTitle>
          Expenses by Category
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 pb-4 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex w-full justify-center sm:w-auto">
          <ChartContainer
            config={chartConfig}
            className="w-full max-w-[18rem] sm:flex-1"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent hideLabel />
                }
              />

              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
              >
                {chartData.map((item) => (
                  <Cell
                    key={item.category}
                    fill={item.fill}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="grid w-full gap-3 sm:max-w-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <p>Rent</p>
            </div>
            <p>
              PKR {rentTotal.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <p>Electric Bill</p>
            </div>
            <p>
              PKR{" "}
              {electricTotal.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <p>Internet Bill</p>
            </div>
            <p>
              PKR{" "}
              {internetTotal.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              <p>Shop Products</p>
            </div>
            <p>
              PKR{" "}
              {shopProductsTotal.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-500" />
              <p>Other</p>
            </div>
            <p>
              PKR {otherTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}