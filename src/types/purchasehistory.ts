import type { PurchaseProduct } from "./purchaseproduct";

export type PurchaseHistory = {
  id: number | string;
  suppliername: string;
  date: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  totalDue: number;
  items?: PurchaseProduct[];
  totalQuantity?: number;
};


export type History = {
  data: PurchaseHistory[];
};