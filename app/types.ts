export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  dueDate?: Date;
}

export interface Priority {
  value: "low" | "medium" | "high";
  label: string;
  color: string;
}

export const priorities: Priority[] = [
  {
    value: "low",
    label: "低",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  {
    value: "medium",
    label: "中",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  {
    value: "high",
    label: "高",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
];
