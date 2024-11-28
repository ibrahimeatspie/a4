"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    // Load todos from localStorage on initial render
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("todos");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [newTodo, setNewTodo] = useState("");

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        { id: Date.now(), text: newTodo.trim(), completed: false },
      ]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="w-full">
      <form onSubmit={addTodo} className="flex gap-2 mb-4">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <Button type="submit">Add</Button>
      </form>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
          >
            <Checkbox
              id={`todo-${todo.id}`}
              checked={todo.completed}
              onCheckedChange={() => toggleTodo(todo.id)}
            />
            <label
              htmlFor={`todo-${todo.id}`}
              className={`flex-1 cursor-pointer ${
                todo.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {todo.text}
            </label>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTodo(todo.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete todo</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
