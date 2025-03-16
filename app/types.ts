export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  dueDate?: Date;
}

export const priorities = [
  {
    value: "low" as const,
    label: "低",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    value: "medium" as const,
    label: "中",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  {
    value: "high" as const,
    label: "高",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
];
