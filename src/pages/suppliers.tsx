import { AddSupplierDialogue } from "@/components/dialogue/addsupplier";
import SupplierTable from "@/components/tables/supliertable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authstore";
import { useSupplierStore } from "@/store/supplierstore";

export default function Suppliers() {
  const [searchSupplier, setSearchSupplier] = useState("");
  const suppliers = useSupplierStore((state) => state.suppliers);
  const loadSuppliersByShop = useSupplierStore((state) => state.loadSuppliersByShop);
  const currentUser = useAuthStore((state) => state.currentUser);

  useEffect(() => {
    if (currentUser?.firebaseUid) {
      loadSuppliersByShop(currentUser.firebaseUid);
    }
  }, [currentUser?.firebaseUid, loadSuppliersByShop]);

  const SearchSuppliers = useMemo(() => {
    const normalizedSearch = searchSupplier.trim().toLocaleLowerCase();

    return suppliers.filter((supplier) => {
      return (
        normalizedSearch.length === 0 ||
        supplier.name.toLocaleLowerCase().includes(normalizedSearch) ||
        supplier.contactperson.toLocaleLowerCase().includes(normalizedSearch) ||
        supplier.phoneNumber.toString().includes(normalizedSearch)
      );
    });
  }, [searchSupplier, suppliers]);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex gap-3 flex-row items-center justify-between">
        <div className="relative w-full max-w-lg">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search size={16} />
          </span>
          <Input 
            value={searchSupplier}
            onChange={(e) => setSearchSupplier(e.target.value)}
            placeholder="Search suppliers..." 
            className="w-full pl-10" 
          />
        </div>
        <div className="flex justify-start lg:justify-end sm:hidden">
          <AddSupplierDialogue
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
          <AddSupplierDialogue />
        </div>
      </div>
      <SupplierTable data={SearchSuppliers} itemsPerPage={10} />
    </div>
  )
}