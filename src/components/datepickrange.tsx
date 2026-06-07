"use client";

import * as React from "react";
import { addDays} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { formatDate } from "@/lib/date"

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

type DateRangeProps = {
  value?: DateRange | undefined;
  onChange?: (d: DateRange | undefined) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
};

export function DatePickerRange({
  value,
  onChange,
  open,
  onOpenChange,
  hideTrigger,
}: DateRangeProps) {
  const isMobile = useIsMobile();
  const [internal, setInternal] = React.useState<DateRange | undefined>(
    value ?? {
      from: new Date(new Date().getFullYear(), 0, 20),
      to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
    },
  );

  React.useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  const handleSelect = (d: DateRange | undefined) => {
    if (onChange) onChange(d);
    else setInternal(d);
  };

  const date = internal;

  const trigger = hideTrigger ? (
    <button aria-hidden className="sr-only" />
  ) : (
    <Button
      variant="outline"
      id="date-picker-range"
      className="justify-start px-2.5 font-normal"
    >
      <CalendarIcon />
      {date?.from ? (
        date.to ? (
          <>
            {formatDate(date.from, "LLL dd, y")} - {" "}
            {formatDate(date.to, "LLL dd, y")}
          </>
        ) : (
          formatDate(date.from, "LLL dd, y")
        )
      ) : (
        <span>Pick a date</span>
      )}
    </Button>
  );

  return (
    <Field className="mx-auto w-60">
      {isMobile ? (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent className="w-[calc(100vw-0.5rem)] max-w-none items-center justify-center p-0">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={1}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Popover open={open} onOpenChange={onOpenChange}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleSelect}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>
      )}
    </Field>
  );
}
