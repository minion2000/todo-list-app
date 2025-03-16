"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  TrashIcon,
  PlusIcon,
  MoonIcon,
  SunIcon,
  PencilIcon,
  XMarkIcon,
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
import { TodoItem, priorities } from "../types";
import { DragOverlay } from "./DragOverlay";
import { animations } from "../animations";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  category: string;
  dueDate?: Date;
}

const defaultCategories = ["すべて", "仕事", "個人", "買い物", "その他"];

function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  isDragOverlay = false,
}: {
  todo: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (updatedTodo: TodoItem) => void;
  isDragOverlay?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);
  const [editedCategory, setEditedCategory] = useState(todo.category);
  const [editedPriority, setEditedPriority] = useState(todo.priority);
  const [editedDueDate, setEditedDueDate] = useState(
    todo.dueDate ? format(todo.dueDate, "yyyy-MM-dd") : ""
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    transition: {
      duration: 200,
      easing: "ease",
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative" as const,
  };

  const priorityColor = priorities.find(
    (p) => p.value === todo.priority
  )?.color;
  const dragHandleClass = "flex-1 cursor-grab active:cursor-grabbing";

  const handleSave = () => {
    onEdit({
      ...todo,
      text: editedText,
      category: editedCategory,
      priority: editedPriority,
      dueDate: editedDueDate ? new Date(editedDueDate) : todo.dueDate,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(todo.text);
    setEditedCategory(todo.category);
    setEditedPriority(todo.priority);
    setEditedDueDate(todo.dueDate ? format(todo.dueDate, "yyyy-MM-dd") : "");
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout="position"
      initial={false}
      animate={isDragging ? animations.drag.active : animations.drag.initial}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
      className={clsx(
        "group flex items-center justify-between p-4 mb-4 rounded-lg border transition-all duration-200 relative",
        isDragging &&
          "ring-2 ring-purple-500 ring-opacity-50 shadow-lg backdrop-blur-sm",
        todo.completed
          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
          : "bg-white border-gray-200 hover:border-purple-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-purple-700"
      )}
    >
      {isDragging && <DragOverlay />}

      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.9 }}
        className={clsx(
          "p-2 rounded-full transition-colors duration-200 mr-3 shrink-0",
          todo.completed
            ? "text-green-500 dark:text-green-400"
            : "text-gray-400 hover:text-purple-500 dark:text-gray-500 dark:hover:text-purple-400"
        )}
      >
        <CheckCircleIcon className="h-6 w-6" />
      </motion.button>

      {isEditing ? (
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="タスクを入力"
          />
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="カテゴリー"
            />
            <select
              value={editedPriority}
              onChange={(e) => setEditedPriority(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={editedDueDate}
              onChange={(e) => setEditedDueDate(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className={dragHandleClass} {...attributes} {...listeners}>
          <div className="flex flex-col">
            <span
              className={clsx(
                "text-lg",
                todo.completed
                  ? "text-gray-500 line-through dark:text-gray-400"
                  : "text-gray-700 dark:text-gray-200"
              )}
            >
              {todo.text}
            </span>
            <div className="flex gap-2 items-center mt-1 flex-wrap">
              <span
                className={clsx(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  priorityColor
                )}
              >
                {priorities.find((p) => p.value === todo.priority)?.label}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {todo.category}
              </span>
              {todo.dueDate && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  期限: {format(todo.dueDate, "yyyy/MM/dd", { locale: ja })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0 ml-3">
        {!isEditing && (
          <motion.button
            onClick={() => setIsEditing(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-gray-400 hover:text-purple-500 rounded-full hover:bg-purple-50 transition-colors duration-200 dark:text-gray-500 dark:hover:text-purple-400 dark:hover:bg-purple-900/20"
          >
            <PencilIcon className="h-5 w-5" />
          </motion.button>
        )}
        <motion.button
          onClick={onDelete}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors duration-200 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20"
        >
          <TrashIcon className="h-5 w-5" />
        </motion.button>
      </div>
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
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // ダークモードと保存されたカテゴリーを読み込む
    const isDark = localStorage.getItem("darkMode") === "true";
    const savedCategories = localStorage.getItem("categories");
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
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

  const addCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;

    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));
    setNewCategory("");
    setIsAddingCategory(false);
  };

  const removeCategory = (category: string) => {
    if (category === "すべて" || category === "その他") return;

    const updatedCategories = categories.filter((c) => c !== category);
    setCategories(updatedCategories);
    localStorage.setItem("categories", JSON.stringify(updatedCategories));

    if (selectedCategory === category) {
      setSelectedCategory("すべて");
    }

    // カテゴリーが削除された場合、関連するTodoのカテゴリーを「その他」に変更
    setTodos(
      todos.map((todo) =>
        todo.category === category ? { ...todo, category: "その他" } : todo
      )
    );
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

  const handleDragStart = (event: any) => {
    const { active } = event;
    setDragOverId(active.id);
  };

  const handleDragOver = (event: any) => {
    const { over } = event;
    setDragOverId(over?.id || null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setDragOverId(null);

    if (active && over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const editTodo = (updatedTodo: TodoItem) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
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
              タスク管理
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

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2
                className={clsx(
                  "text-lg font-medium",
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                )}
              >
                カテゴリー
              </h2>
              <button
                onClick={() => setIsAddingCategory(true)}
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                + 新しいカテゴリー
              </button>
            </div>

            <AnimatePresence>
              {isAddingCategory && (
                <motion.form
                  {...animations.fadeIn}
                  onSubmit={addCategory}
                  className="flex gap-2 mb-4"
                >
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="新しいカテゴリー名"
                    className={clsx(
                      "flex-1 rounded-lg border shadow-sm focus:border-purple-500 focus:ring-purple-500",
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    )}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    追加
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center">
                  <button
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
                  {category !== "すべて" && category !== "その他" && (
                    <button
                      onClick={() => removeCategory(category)}
                      className="ml-1 p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={addTodo} className="mb-6 space-y-4">
            <div className="flex gap-4 flex-wrap sm:flex-nowrap">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="新しいタスクを入力..."
                className={clsx(
                  "flex-1 rounded-lg border shadow-sm focus:border-purple-500 focus:ring-purple-500",
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                )}
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 whitespace-nowrap"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                タスクを追加
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
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTodos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <motion.div layout>
                <AnimatePresence mode="popLayout" initial={false}>
                  {filteredTodos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      layout
                      initial={false}
                      exit={animations.delete.exit}
                      animate={
                        todo.completed
                          ? {
                              backgroundColor: [
                                "transparent",
                                "rgba(34, 197, 94, 0.2)",
                                "transparent",
                              ],
                              transition: { duration: 0.5 },
                            }
                          : undefined
                      }
                    >
                      <SortableTodoItem
                        todo={todo}
                        onToggle={() => toggleTodo(todo.id)}
                        onDelete={() => deleteTodo(todo.id)}
                        onEdit={editTodo}
                      />
                      {dragOverId === todo.id && (
                        <motion.div
                          className="h-1 bg-purple-500 rounded-full mx-4 mb-4"
                          layoutId="dragIndicator"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </SortableContext>
          </DndContext>

          {filteredTodos.length === 0 && (
            <motion.div
              {...animations.fadeIn}
              className={clsx(
                "text-center py-12",
                isDarkMode ? "text-gray-400" : "text-gray-500"
              )}
            >
              {selectedCategory === "すべて"
                ? "タスクがありません。新しいタスクを追加してください！"
                : `${selectedCategory}カテゴリーにはタスクがありません。`}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
