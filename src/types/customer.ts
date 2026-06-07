export type Customer = {
  id: number | string;
  name: string;
  phoneNumber: number;
  address?: string;
  joinDate: string;
  status: CustomerStatus;
  shopId?: string;
};

export type CustomerStatus = "Active" | "Inactive";

export type CustomerFormValues = {
  name: string;
  phoneNumber: string;
  address: string;
  joinDate: string;
  status: CustomerStatus;
};

export type CustomerTableProps = {
  data: Customer[];
  itemsPerPage?: number;
};

export type CreditCustomer = {
  id: number | string;
  name: string;
  phoneNumber: number;
  totalCreditAmount: number;
  totalBill?: number;
  amountPaid: number;
  latestPaidAmount?: number;
  remainingBalance: number;
  lastTransactionDate: string;
  dueDate?: string;
  status: "Paid" | "Partially Paid" | "Unpaid";
};

export type CreditCustomerTableProps = {
  data: CreditCustomer[];
  itemsPerPage?: number;
};