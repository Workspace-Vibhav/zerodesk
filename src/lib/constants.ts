export const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Not Started", color: "bg-gray-100 text-gray-700" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "DONE", label: "Done", color: "bg-green-100 text-green-700" },
  { value: "NEEDS_REVIEW", label: "Needs Review", color: "bg-orange-100 text-orange-700" },
] as const;

export type Status = (typeof STATUS_OPTIONS)[number]["value"];
