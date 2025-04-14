// components/date-picker.jsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({ date, onDateChange, className }) {
  const [isOpen, setIsOpen] = React.useState(false); // Add state to control open

  const handleSelect = (newDate) => {
    console.log("DatePicker: Date Selected", newDate);
    if (onDateChange) {
      onDateChange(newDate instanceof Date ? newDate : undefined);
    }
    setIsOpen(false); // Close popover on select
  };

  const displayDate = date instanceof Date ? date : undefined;

  const handleTriggerClick = (event) => {
    // Optional: If needed, stop propagation *if* it helps, but usually not required.
    // event.stopPropagation();
    console.log("DatePicker: Trigger Clicked!");
    // We are now controlling the open state manually
    // setIsOpen(!isOpen); // Toggle state - Popover component below will use this
  };

  const handleOpenChange = (open) => {
    console.log("DatePicker: Popover onOpenChange triggered:", open);
    setIsOpen(open); // Sync internal state with Popover's state
  };


  return (
    // Control the Popover's open state and listen for changes
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {/* Add the onClick directly here for reliable logging */}
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayDate && "text-muted-foreground",
            className
          )}
          // onClick={handleTriggerClick} // PopoverTrigger handles this when using 'open' prop
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDate ? format(displayDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      {/* Ensure PopoverContent has a high enough z-index */}
      <PopoverContent className="w-auto p-0 z-[100]" align="start"> {/* Increased z-index */}
        <Calendar
          mode="single"
          selected={displayDate}
          onSelect={handleSelect}
          month={displayDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}