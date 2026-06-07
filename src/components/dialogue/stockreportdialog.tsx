import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProductStore } from "@/store/addproductstore";
import { formatDateTime } from "@/lib/date";

type StockReportDialogProps = {
  trigger?: React.ReactNode;
};

export default function StockReportDialog({ trigger }: StockReportDialogProps) {
  const products = useProductStore((s) => s.products);
  const history = useProductStore((s) => (s as any).history as any[]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const filteredEntries = useMemo(() => {
    const s = startDate ? new Date(startDate) : null;
    const e = endDate ? new Date(endDate) : null;

    return history.filter((entry) => {
      const ts = entry.timestamp ? new Date(entry.timestamp) : null;
      if (!ts) return true;
      if (s && e) {
        const start = new Date(s);
        start.setHours(0, 0, 0, 0);
        const end = new Date(e);
        end.setHours(23, 59, 59, 999);
        return ts >= start && ts <= end;
      }
      if (s && !e) {
        const dayStart = new Date(s);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(s);
        dayEnd.setHours(23, 59, 59, 999);
        return ts >= dayStart && ts <= dayEnd;
      }

      return true;
    });
  }, [history, startDate, endDate]);

  const rows = filteredEntries.map((entry) => {
    const product =
      products.find((p) => p.id === entry.productId) ?? (entry.details || {});
    return {
      productName: (product as any).name ?? "",
      quantityChange: entry.quantityChange ?? 0,
      previousStock: entry.prevStock ?? "",
      updatedStock: entry.newStock ?? "",
      stockIn: entry.stockIn ?? (product as any).stockIn ?? "",
      stockOut: entry.stockOut ?? (product as any).stockOut ?? "",
      currentStock: (product as any).stock ?? "",
      status: (product as any).status ?? "",
      createdAt: formatDateTime((product as any).createdAt ?? ""),
      updatedAt: formatDateTime(
        entry.timestamp ?? (product as any).updatedAt ?? "",
      ),
      action: entry.action ?? "",
      details: entry.details ?? {},
    };
  });

  const downloadCsv = (data: any[]) => {
    if (!data || data.length === 0) return;
    const header = Object.keys(data[0]);
    const csv = [
      header.join(","),
      ...data.map((r) =>
        header.map((h) => JSON.stringify((r as any)[h] ?? "")).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadXlsx = async (data: any[]) => {
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(data);

      const columnWidths = Object.keys(data[0] ?? {}).map((key) => {
        const values = data.map((row) => String((row as any)[key] ?? ""));
        const longestValue = [key, ...values].reduce(
          (max, value) => Math.max(max, value.length),
          0,
        );

        return {
          wch: Math.min(Math.max(longestValue + 2, 12), 60),
        };
      });

      ws["!cols"] = columnWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stock Report");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stock-report.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // fallback to CSV
      downloadCsv(data);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="cursor-pointer bg-purple-500 text-white flex items-center gap-2 hover:bg-purple-600">
            Export Report
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Stock Report</DialogTitle>
          <DialogDescription>
            Generate and download stock reports. Select a date or date range.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex gap-2 items-end">
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-auto max-h-96 rounded border">
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-center">Qty Change</TableHead>
                  <TableHead className="text-center">Previous Stock</TableHead>
                  <TableHead className="text-center">Updated Stock</TableHead>
                  <TableHead className="text-center">Stock In</TableHead>
                  <TableHead className="text-center">Stock Out</TableHead>
                  <TableHead className="text-center">Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i} className="even:bg-muted/10">
                    <TableCell>{r.productName}</TableCell>
                    <TableCell className="text-center">
                      {r.quantityChange}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.previousStock || 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {r.updatedStock}
                    </TableCell>
                    <TableCell className="text-center">{r.stockIn}</TableCell>
                    <TableCell className="text-center">{r.stockOut}</TableCell>
                    <TableCell className="text-center">
                      {r.currentStock}
                    </TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.createdAt}</TableCell>
                    <TableCell>{r.updatedAt}</TableCell>
                    <TableCell>{r.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="mr-2 cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={() => downloadXlsx(rows)}
            className="bg-purple-600 hover:bg-purple-700 cursor-pointer text-white"
          >
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { StockReportDialog };
