export type Supplier = {
  id: number | string;
  name: string;
  contactperson:string;
  phoneNumber: number;
  totalPurchase:number;
  totalDue:number;
  date:string;
  status: "Active" | "InActive";
  shopId?: string;
};

export type SupplierStatus = "Active" | "InActive";

export type SupplierFormValues = {
  name: string;
  contactperson: string;
  phoneNumber: string;
  totalPurchase: string;
  totalDue: string;
  date: string;
  status: SupplierStatus;
};

export type SupplierTableProps = {
  data: Supplier[];
  itemsPerPage?: number;
};