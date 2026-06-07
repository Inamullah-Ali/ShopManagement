export type PurchaseProduct = {
  id: number | string;
  name: string;
  purchasePrice: number | "";
  stockAvailable: number | "";
  quantity: number | "";
  originalQuantity?: number;
  discount: number | "";
  total: number;
};

export type Purchase = {
  data: PurchaseProduct[];
};