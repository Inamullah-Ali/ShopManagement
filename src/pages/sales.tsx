import { DatePicker } from "@/components/datepicker";
import { AddSaleDialogue } from "@/components/dialogue/addsaleDialogue";
import SaleTable from "@/components/tables/saletable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSalesStore } from "@/store/salesstore";
import { useAuthStore } from "@/store/authstore";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Sales() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const allSales = useSalesStore((state) => state.sales);
  const loadSalesByShop = useSalesStore((state) => state.loadSalesByShop);
  const addSale = useSalesStore((state) => state.addSale);

  useEffect(() => {
    if (currentUser?.firebaseUid) {
      loadSalesByShop(currentUser.firebaseUid);
    }
  }, [currentUser?.firebaseUid, loadSalesByShop]);

  const sales = currentUser?.firebaseUid ? allSales.filter((s) => s.shopId === currentUser.firebaseUid) : [];
  const [selectedDate, setSelectedDate] = useState<Date>();

  const filteredSales = useMemo(() => {
    if (!selectedDate) return sales;

    const selected = format(selectedDate, "yyyy-MM-dd");

    return sales.filter((sale) => sale.date === selected);
  }, [sales, selectedDate]);

  const { transactionCount, totalSalesAmount } = useMemo(
    () => ({
      transactionCount: sales.length,
      totalSalesAmount: sales.reduce(
        (sum, sale) => sum + Number(sale.totalPayment || 0),
        0,
      ),
    }),
    [sales],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 justify-between w-full">
            <div>
              <CardTitle className="font-bold">Sales</CardTitle>
              <CardDescription>
                Transaction: {transactionCount} | Total: PKR{" "}
                {totalSalesAmount.toFixed(2)}
              </CardDescription>
            </div>
            <div className="flex justify-start lg:justify-end sm:hidden">
              <AddSaleDialogue
                onComplete={addSale}
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
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <DatePicker date={selectedDate} onDateChange={setSelectedDate} />
            <div className="hidden justify-start lg:justify-end sm:flex">
              <AddSaleDialogue onComplete={addSale} />
            </div>
          </div>
        </CardHeader>
      </Card>
      <SaleTable data={filteredSales} />
    </div>
  );
}
