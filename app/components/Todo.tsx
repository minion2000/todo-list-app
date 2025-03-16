"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  TrashIcon,
  PlusIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import clsx from "clsx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  dueDate?: Date;
}

const categories = ["すべて", "仕事", "個人", "買い物", "その他"];
const priorities = [
  { value: "low", label: "低", color: "bg-blue-100 text-blue-800" },
  { value: "medium", label: "中", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "高", color: "bg-red-100 text-red-800" },
];

function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColor = priorities.find(
    (p) => p.value === todo.priority
  )?.color;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={clsx(
        "flex items-center justify-between p-4 mb-4 rounded-lg border transition-colors duration-200",
        todo.completed
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200 hover:border-purple-200"
      )}
    >
      <div className="flex items-center space-x-3 flex-1">
        <button
          onClick={onToggle}
          className={clsx(
            "p-1 rounded-full transition-colors duration-200",
            todo.completed
              ? "text-green-500"
              : "text-gray-400 hover:text-purple-500"
          )}
        >
          <CheckCircleIcon className="h-6 w-6" />
        </button>
        <div className="flex flex-col">
          <span
            className={clsx(
              "text-lg",
              todo.completed ? "text-gray-500 line-through" : "text-gray-700"
            )}
          >
            {todo.text}
          </span>
          <div className="flex gap-2 items-center mt-1">
            <span
              className={clsx(
                "px-2 py-1 rounded-full text-xs font-medium",
                priorityColor
              )}
            >
              {priorities.find((p) => p.value === todo.priority)?.label}
            </span>
            <span className="text-sm text-gray-500">{todo.category}</span>
            {todo.dueDate && (
              <span className="text-sm text-gray-500">
                期限: {format(todo.dueDate, "yyyy/MM/dd", { locale: ja })}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors duration-200"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </motion.div>
  );
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [selectedPriority, setSelectedPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // ダークモードの設定を読み込む
    const isDark = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        priority: selectedPriority,
        category: selectedCategory === "すべて" ? "その他" : selectedCategory,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    ]);
    setNewTodo("");
    setDueDate("");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const filteredTodos = todos.filter((todo) =>
    selectedCategory === "すべて" ? true : todo.category === selectedCategory
  );

  return (
    <div
      className={clsx(
        "min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300",
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-purple-100 to-blue-100"
      )}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className={clsx(
            "rounded-2xl shadow-xl overflow-hidden p-6",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}
        >
          <div className="flex justify-between items-center mb-8">
            <h1
              className={clsx(
                "text-3xl font-bold",
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              My Tasks
            </h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? (
                <SunIcon className="h-6 w-6 text-yellow-500" />
              ) : (
                <MoonIcon className="h-6 w-6 text-gray-500" />
              )}
            </button>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === category
                    ? "bg-purple-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <form onSubmit={addTodo} className="mb-6 space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="タスクを追加..."
                className={clsx(
                  "flex-1 rounded-lg border shadow-sm focus:border-purple-500 focus:ring-purple-500",
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                )}
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                追加
              </button>
            </div>

            <div className="flex gap-4 flex-wrap">
              <select
                value={selectedPriority}
                onChange={(e) =>
                  setSelectedPriority(
                    e.target.value as "low" | "medium" | "high"
                  )
                }
                className={clsx(
                  "rounded-lg border shadow-sm focus:border-purple-500 focus:ring-purple-500",
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                )}
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    優先度: {priority.label}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={clsx(
                  "rounded-lg border shadow-sm focus:border-purple-500 focus:ring-purple-500",
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                )}
              />
            </div>
          </form>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTodos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {filteredTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={() => toggleTodo(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>

          {filteredTodos.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={clsx(
                "text-center py-12",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}
            >
              タスクがありません。新しいタスクを追加してください！
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
