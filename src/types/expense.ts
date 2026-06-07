export type ExpenseCategory =
  | "Rent"
  | "Electric Bill"
  | "Internet Bill"
  | "Shop Products"
  | "Other";

export type ExpensePaymentEntry = {
  id: number | string;
  amount: number;
  date: string;
  note?: string;
};

export type Expenses = {
  id: number | string;
  expensename: string;
  date: string;
  totalamount: number;
  paidamount: number;
  paymentmethod: "Cash" | "Card" | "Credit";
  status: "Complete" | "Pending";
  category: ExpenseCategory;
  creditPayments?: ExpensePaymentEntry[];
  shopId?: string;
};

export type ExpenseTableProps = {
  data: Expenses[];
  itemsPerPage?: number;
};
