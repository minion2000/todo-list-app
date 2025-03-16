"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setTodos([
      ...todos,
      { id: Date.now().toString(), text: newTodo.trim(), completed: false },
    ]);
    setNewTodo("");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
              My Tasks
            </h1>

            <form onSubmit={addTodo} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Task
                </button>
              </div>
            </form>

            <AnimatePresence>
              {todos.map((todo) => (
                <motion.div
                  key={todo.id}
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
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={clsx(
                        "p-1 rounded-full transition-colors duration-200",
                        todo.completed
                          ? "text-green-500"
                          : "text-gray-400 hover:text-purple-500"
                      )}
                    >
                      <CheckCircleIcon className="h-6 w-6" />
                    </button>
                    <span
                      className={clsx(
                        "text-lg",
                        todo.completed
                          ? "text-gray-500 line-through"
                          : "text-gray-700"
                      )}
                    >
                      {todo.text}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors duration-200"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {todos.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                No tasks yet. Add one above!
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
