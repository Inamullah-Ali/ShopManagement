import { Trash2 } from "lucide-react";
import type { PurchaseProduct } from "@/types/purchaseproduct";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { useRef } from "react";

type PurchaseProductTableProps = {
  data: PurchaseProduct[];
  onUpdateItem: (
    id: PurchaseProduct["id"],
    field: keyof Pick<PurchaseProduct, "purchasePrice" | "stockAvailable" | "quantity" | "discount">,
    value: string,
  ) => void;
  onDeleteItem: (id: PurchaseProduct["id"]) => void;
};

export default function PurchaseProductTable({ data, onUpdateItem, onDeleteItem }: PurchaseProductTableProps) {
  const previousValuesRef = useRef<
    Record<string, string>
  >({});

  const rememberPreviousValue = (
    id: PurchaseProduct["id"],
    field: keyof Pick<PurchaseProduct, "purchasePrice" | "stockAvailable" | "quantity" | "discount">,
    value: PurchaseProduct[keyof Pick<PurchaseProduct, "purchasePrice" | "stockAvailable" | "quantity" | "discount">],
  ) => {
    previousValuesRef.current[`${id}-${field}`] = String(value);
  };

  const restorePreviousValueIfCleared = (
    id: PurchaseProduct["id"],
    field: keyof Pick<PurchaseProduct, "purchasePrice" | "stockAvailable" | "quantity" | "discount">,
    currentValue: string,
  ) => {
    if (currentValue.trim() !== "") {
      return;
    }

    const previousValue = previousValuesRef.current[`${id}-${field}`];

    if (previousValue !== undefined) {
      onUpdateItem(id, field, previousValue);
    }
  };

  return (
    <Card className="min-w-full overflow-hidden p-0">
      <div className="h-62 bg-muted">
        <Table className="h-full">
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Stock Available</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  You don't have any products yet.
                </TableCell>
              </TableRow>
            ) : (
              data.map((purchaseProduct) => {
                const quantityDelta = Math.max(Number(purchaseProduct.quantity || 0), 0);
                const rowTotal = Math.max(
                  Number(purchaseProduct.purchasePrice || 0) * quantityDelta - Number(purchaseProduct.discount || 0),
                  0,
                );

                return (
                  <TableRow key={purchaseProduct.id}>
                    <TableCell className="min-w-30">
                      <div className="flex flex-col">
                        <span className="whitespace-nowrap font-bold">{purchaseProduct.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Input
                        type="text"
                        value={purchaseProduct.purchasePrice}
                        onFocus={() =>
                          rememberPreviousValue(
                            purchaseProduct.id,
                            "purchasePrice",
                            purchaseProduct.purchasePrice,
                          )
                        }
                        onChange={(event) =>
                          onUpdateItem(purchaseProduct.id, "purchasePrice", event.target.value)
                        }
                        onBlur={(event) =>
                          restorePreviousValueIfCleared(
                            purchaseProduct.id,
                            "purchasePrice",
                            event.target.value,
                          )
                        }
                        className="h-8 w-24"
                      />
                    </TableCell>

                    <TableCell className="font-medium text-muted-foreground">
                      {Number(purchaseProduct.stockAvailable || 0)}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          min="0"
                          value={purchaseProduct.quantity}
                          onFocus={() =>
                            rememberPreviousValue(
                              purchaseProduct.id,
                              "quantity",
                              purchaseProduct.quantity,
                            )
                          }
                          onChange={(event) =>
                            onUpdateItem(purchaseProduct.id, "quantity", event.target.value)
                          }
                          onBlur={(event) =>
                            restorePreviousValueIfCleared(
                              purchaseProduct.id,
                              "quantity",
                              event.target.value,
                            )
                          }
                          className="h-8 w-24"
                        />
                        {quantityDelta > 0 && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            +{quantityDelta}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Input
                        type="text"
                        min="0"
                        value={purchaseProduct.discount}
                        onFocus={() =>
                          rememberPreviousValue(
                            purchaseProduct.id,
                            "discount",
                            purchaseProduct.discount,
                          )
                        }
                        onChange={(event) =>
                          onUpdateItem(purchaseProduct.id, "discount", event.target.value)
                        }
                        onBlur={(event) =>
                          restorePreviousValueIfCleared(
                            purchaseProduct.id,
                            "discount",
                            event.target.value,
                          )
                        }
                        className="h-8 w-24"
                      />
                    </TableCell>

                    <TableCell>PKR {rowTotal}</TableCell>

                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteItem(purchaseProduct.id)}
                        className="size-8 cursor-pointer text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
