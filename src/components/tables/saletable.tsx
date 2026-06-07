import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent } from "../ui/card";
import { useProductStore } from "@/store/addproductstore";
import type { SaleTableProps } from "@/types/sale";

const formatSaleDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return format(date, "dd MMM yyyy, hh:mm a");
};

export default function SaleTable({ data }: SaleTableProps) {
  const products = useProductStore((state) => state.products)

  return (
    <div>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-8 text-center text-muted-foreground"
                  >
                    you dont have any sell
                  </TableCell>
                </TableRow>
              ) : (
                data.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 overflow-hidden rounded border">
                          {(() => {
                            const firstSaleItem = sale.items[0]
                            const firstProduct = firstSaleItem
                              ? products.find(
                                  (product) => String(product.id) === String(firstSaleItem.id),
                                )
                              : undefined

                            return firstProduct?.image ? (
                              <img
                                src={firstProduct.image}
                                alt={sale.items.map((item) => item.name).join(", ") || sale.productSummary}
                                className="h-full w-full rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">
                                No Image
                              </div>
                            )
                          })()}
                        </div>

                        <div className="flex flex-col">
                          <span className="font-bold">
                            {sale.items.length > 0
                              ? sale.items.map((item) => item.name).join(", ")
                              : sale.productSummary}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold">{sale.customerName || "Unknown Customer"}</span>
                    </TableCell>
                    <TableCell>{formatSaleDateTime(sale.date)}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>
                      {sale.paymentMethod === "Credit" ? (
                        <div className="flex flex-col">
                          <span className="font-medium">
                            Rs {sale.totalPayment.toFixed(2)}
                          </span>
                          {(sale.amountPaid ?? 0) < sale.totalPayment && (
                            <span className="text-sm text-muted-foreground">
                              Paid: Rs {(sale.amountPaid ?? 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span>Rs {sale.totalPayment.toFixed(2)}</span>
                      )}
                    </TableCell>

                    <TableCell>{sale.paymentMethod}</TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-center text-sm font-medium ${
                          sale.status === "Complete"
                            ? "bg-green-100 text-green-600"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
