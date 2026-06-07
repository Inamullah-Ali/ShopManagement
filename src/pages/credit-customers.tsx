import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import CreditCustomerTable from "@/components/tables/creditcustomertable";
import type { CreditCustomer } from "@/types/customer";
import { useSalesStore } from "@/store/salesstore";
import { useCustomerStore } from "@/store/customerstore";
import { formatDate } from "@/lib/date";

export default function CreditCustomers() {
  const [searchCreditCustomer, setSearchCreditCustomer] = useState("");
  const sales = useSalesStore((state) => state.sales);
  const customers = useCustomerStore((state) => state.customers);

  const creditCustomersData = useMemo<CreditCustomer[]>(() => {
    const groupedCredits = new Map<
      string,
      {
        id: string | number;
        name: string;
        phoneNumber: number;
        totalBill: number;
        amountPaid: number;
        latestPaidAmount: number;
        lastTransactionDateRaw: string;
        latestPaidDateRaw?: string;
      }
    >();

    sales
      .filter((sale) => sale.paymentMethod === "Credit")
      .forEach((sale) => {
        const customerId = sale.customerId;
        const customerById =
          customerId !== undefined
            ? customers.find((customer) => customer.id === customerId)
            : undefined;
        const fallbackByName = customers.find(
          (customer) =>
            customer.name.trim().toLowerCase() === sale.customerName.trim().toLowerCase(),
        );
        const matchedCustomer = customerById ?? fallbackByName;
        const customerName = sale.customerName.trim() || "Unknown Customer";
        const bucketKey = matchedCustomer
          ? `id:${matchedCustomer.id}`
          : `name:${customerName.toLowerCase()}`;
        const existing = groupedCredits.get(bucketKey);
        const phoneNumber =
          sale.customerPhoneNumber ?? matchedCustomer?.phoneNumber ?? 0;
        const latestDate =
          existing && new Date(existing.lastTransactionDateRaw) > new Date(sale.date)
            ? existing.lastTransactionDateRaw
            : sale.date;
        const latestPaidDate =
          existing?.latestPaidDateRaw && new Date(existing.latestPaidDateRaw) > new Date(sale.date)
            ? existing.latestPaidDateRaw
            : sale.amountPaid && sale.amountPaid > 0
              ? sale.date
              : existing?.latestPaidDateRaw;

        if (existing) {
          existing.totalBill += sale.totalPayment;
          existing.lastTransactionDateRaw = latestDate;
          existing.amountPaid += sale.amountPaid ?? 0;
          if ((sale.amountPaid ?? 0) > 0) {
            existing.latestPaidAmount = sale.amountPaid ?? existing.latestPaidAmount;
            existing.latestPaidDateRaw = latestPaidDate ?? sale.date;
          }
          return;
        }

        groupedCredits.set(bucketKey, {
          id: matchedCustomer?.id ?? bucketKey,
          name: matchedCustomer?.name ?? customerName,
          phoneNumber,
          totalBill: sale.totalPayment,
          amountPaid: sale.amountPaid ?? 0,
          latestPaidAmount: sale.amountPaid ?? 0,
          lastTransactionDateRaw: sale.date,
          latestPaidDateRaw: sale.amountPaid && sale.amountPaid > 0 ? sale.date : undefined,
        });
      });

    return Array.from(groupedCredits.values())
      .map((entry) => ({
        id: entry.id,
        name: entry.name,
        phoneNumber: entry.phoneNumber,
        totalCreditAmount: entry.totalBill,
        totalBill: entry.totalBill,
        amountPaid: entry.amountPaid,
        latestPaidAmount: entry.latestPaidAmount,
        remainingBalance: Math.max(entry.totalBill - entry.amountPaid, 0),
        lastTransactionDate: formatDate(entry.lastTransactionDateRaw),
        dueDate: "-",
        status:
          Math.max(entry.totalBill - entry.amountPaid, 0) === 0
            ? ("Paid" as const)
            : entry.amountPaid > 0
              ? ("Partially Paid" as const)
              : ("Unpaid" as const),
      }))
      .sort((first, second) => second.totalBill - first.totalBill);
  }, [customers, sales]);

  const filteredCreditCustomers = useMemo(() => {
    const normalizedSearch = searchCreditCustomer.trim().toLocaleLowerCase();

    return creditCustomersData.filter((customer) => {
      return (
        normalizedSearch.length === 0 ||
        customer.name.toLocaleLowerCase().includes(normalizedSearch) ||
        customer.phoneNumber.toString().includes(normalizedSearch) ||
        customer.status.toLocaleLowerCase().includes(normalizedSearch)
      );
    });
  }, [searchCreditCustomer, creditCustomersData]);
  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-lg">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search size={16} />
          </span>
          <Input
            value={searchCreditCustomer}
            onChange={(event) => setSearchCreditCustomer(event.target.value)}
            placeholder="Search credit customers..."
            className="w-full pl-10"
          />
        </div>
      </div>

      <CreditCustomerTable data={filteredCreditCustomers} itemsPerPage={8} />
    </div>
  );
}