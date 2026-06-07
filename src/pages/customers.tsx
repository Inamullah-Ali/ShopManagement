import CustomerTable from "@/components/tables/customertable";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { AddCustomerDialogue } from "@/components/dialogue/addcustomer";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCustomerStore } from "@/store/customerstore";
import { useAuthStore } from "@/store/authstore";

export default function Customers() {
  const [searchCustomer, setSearchCustomer] = useState("");
  const customers = useCustomerStore((state) => state.customers);
  const loadCustomersByShop = useCustomerStore((state) => state.loadCustomersByShop);
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser?.firebaseUid) {
      loadCustomersByShop(currentUser.firebaseUid);
    }
  }, [currentUser?.firebaseUid, loadCustomersByShop]);

  const SearchCustomers = useMemo(() => {
    const normalizedSearch = searchCustomer.trim().toLocaleLowerCase();

    return customers.filter((customer) => {
      return (
        normalizedSearch.length === 0 ||
        customer.name.toLocaleLowerCase().includes(normalizedSearch) ||
        customer.phoneNumber.toString().includes(normalizedSearch) ||
        (customer.address ?? "").toLocaleLowerCase().includes(normalizedSearch)
      );
    });
  }, [customers, searchCustomer]);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex gap-3 flex-row items-center justify-between">
        <div className="relative w-full max-w-lg">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search size={16} />
          </span>
          <Input
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
            placeholder="Search customers..."
            className="w-full pl-10"
          />
        </div>
        <div className="flex justify-start lg:justify-end sm:hidden">
          <AddCustomerDialogue
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
          <AddCustomerDialogue />
        </div>
      </div>
      <CustomerTable data={SearchCustomers} itemsPerPage={10} />
    </div>
  );
}
