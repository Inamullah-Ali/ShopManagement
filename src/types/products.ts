export type Product = {
  id: number | string;
  shopId: string; // Link to the shop that owns this product
  name: string;
  image: string;
  purchasePrice: number;
  sellPrice: number;
  stock: number;
  status: "Healthy" | "InStock" | "Low Stock" | "Out of Stock";
  sku?: string;
  category?: string;
  brand?: string;
  stockIn?: number;
  stockOut?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductFormData = Omit<
  Product,
  "id" | "stockIn" | "stockOut" | "updatedAt" | "createdAt"
>;

export type DataTableProps = {
  data: Product[];
  itemsPerPage?: number;
};
