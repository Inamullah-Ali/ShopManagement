export type StockCategorie = {
  id: number | string;
  name: string;
  image: string;
  stockIn: number;
  stockOut: number;
  currentStock: number;
  lastUpdate: string;
  status: "Healthy" | "Low Stock" | "Out of Stock";
};

export type CategoriesTableProps = {
  data: StockCategorie[];
  itemsPerPage?: number;
};