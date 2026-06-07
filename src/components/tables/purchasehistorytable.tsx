import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Card, CardContent } from "../ui/card";
import { RecentPurchaseEditDialogue } from "@/components/dialogue/recentpurchaseedit";

import type { History } from "@/types/purchasehistory";
import type { PurchaseHistory } from "@/types/purchasehistory";

export default function PurchaseHistoryTable({ data, onPurchaseUpdate }: History & { onPurchaseUpdate?: (purchase: PurchaseHistory) => void }) {
  return (
    <Card className="min-w-full overflow-hidden p-0">
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <p className="font-semibold">Recent Purchase</p>
      </div>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableCell>Supplier</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total & Remaining</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell className="text-right">Action</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                  No recent purchases yet.
                </TableCell>
              </TableRow>
            ) : (
              data.map((purchaseHistory) => (
                <TableRow key={purchaseHistory.id}>
                  <TableCell className="whitespace-nowrap font-bold">
                    {purchaseHistory.suppliername}
                  </TableCell>

                  <TableCell>{purchaseHistory.date}</TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span>PKR {purchaseHistory.totalAmount}</span>

                      {purchaseHistory.totalDue > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Due: PKR {purchaseHistory.totalDue}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>{purchaseHistory.paymentMethod}</TableCell>

                  <TableCell>{purchaseHistory.status}</TableCell>
                  <TableCell className="text-right">
                    {purchaseHistory.status === "Partial" ? (
                      <RecentPurchaseEditDialogue 
                        purchase={purchaseHistory}
                        onUpdate={onPurchaseUpdate}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}