"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_OPTIONS, Status } from "@/lib/constants";

interface StatusSelectProps {
  value: Status;
  onChange: (value: Status) => void;
  disabled?: boolean;
}

export function StatusSelect({ value, onChange, disabled }: StatusSelectProps) {
  const currentOption = STATUS_OPTIONS.find((opt) => opt.value === value);

  const handleValueChange = (newValue: string | null) => {
    if (newValue && STATUS_OPTIONS.some((opt) => opt.value === newValue)) {
      onChange(newValue as Status);
    }
  };

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Select status">
          <span className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                value === "NOT_STARTED"
                  ? "bg-gray-400"
                  : value === "IN_PROGRESS"
                  ? "bg-blue-500"
                  : value === "DONE"
                  ? "bg-green-500"
                  : "bg-orange-500"
              }`}
            />
            {currentOption?.label || value}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  option.value === "NOT_STARTED"
                    ? "bg-gray-400"
                    : option.value === "IN_PROGRESS"
                    ? "bg-blue-500"
                    : option.value === "DONE"
                    ? "bg-green-500"
                    : "bg-orange-500"
                }`}
              />
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
