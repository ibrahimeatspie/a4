"use client";

import { useState, useEffect, useMemo } from "react";
import { Trash2, Edit2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isBefore, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Define the structure of a Todo item
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  dueDate: Date | null;
}

// Define the structure of the weather data
interface WeatherData {
  condition: {
    text: string;
    icon: string;
  };
  temp_c: number;
}

// Component to display the current time and weather
function ClientClock() {
  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Update the time every second
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Fetch weather data once when the component mounts
  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch(
          "http://api.weatherapi.com/v1/current.json?key=7614b3af320142a8a9415016241112&q=Irvine"
        );
        const data = await response.json();
        setWeather(data.current);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }

    fetchWeather();
  }, []);

  // Display loading message if time is not yet set
  if (!time) {
    return (
      <div className="h-[88px] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Render the current time, date, and weather information
  return (
    <>
      <time
        dateTime={time.toISOString()}
        className="text-4xl font-semibold tabular-nums tracking-tight"
        aria-label={`Current time: ${time.toLocaleTimeString()}`}
      >
        {time.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </time>
      <p className="text-center text-sm text-muted-foreground">
        {time.toLocaleDateString([], {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      {weather && (
        <div className="text-center mt-4">
          <p className="text-lg">
            {weather.condition.text}, {weather.temp_c}°C
          </p>
          <Image
            src={`https:${weather.condition.icon}`}
            alt={weather.condition.text}
            width={50}
            height={50}
            className="inline-block"
          />
        </div>
      )}
    </>
  );
}

// Component to manage and display a list of todos
function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | null>(null);

  // Load todos from local storage when the component mounts
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      setTodos(
        JSON.parse(saved, (key, value) =>
          key === "dueDate" ? (value ? new Date(value) : null) : value
        )
      );
    }
  }, []);

  // Save todos to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Add a new todo item
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: newTodo.trim(),
          completed: false,
          dueDate: newDueDate,
        },
      ]);
      setNewTodo("");
      setNewDueDate(null);
    }
  };

  // Toggle the completed status of a todo
  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Delete a todo item
  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // Start editing a todo item
  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditDueDate(todo.dueDate);
  };

  // Save changes to a todo item
  const saveEdit = () => {
    if (editingId !== null) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingId
            ? { ...todo, text: editText, dueDate: editDueDate }
            : todo
        )
      );
      setEditingId(null);
    }
  };

  // Cancel editing a todo item
  const cancelEdit = () => {
    setEditingId(null);
  };

  // Check if a todo is overdue
  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return isBefore(dueDate, new Date()) && !isToday(dueDate);
  };

  // Sort todos by completion status and due date
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      if (!a.completed && !b.completed) {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return isBefore(a.dueDate, b.dueDate) ? -1 : 1;
      }
      return 0;
    });
  }, [todos]);

  // Render the todo list
  return (
    <div className="w-full">
      <form onSubmit={addTodo} className="flex flex-col gap-2 mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px]">
                {newDueDate ? format(newDueDate, "PP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={newDueDate || undefined}
                onSelect={(day) => setNewDueDate(day || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button type="submit">Add Task</Button>
      </form>
      <ul className="space-y-2 max-h-64 overflow-y-auto">
        {sortedTodos.map((todo) => (
          <li
            key={todo.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg hover:bg-muted",
              isOverdue(todo.dueDate) &&
                !todo.completed &&
                "bg-red-100 dark:bg-red-900"
            )}
          >
            {editingId === todo.id ? (
              <>
                <Input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="flex-1"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px]">
                      {editDueDate ? format(editDueDate, "PP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editDueDate || undefined}
                      onSelect={(day) => setEditDueDate(day || null)} // Convert undefined back to null
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button onClick={saveEdit} size="icon" className="h-8 w-8">
                  <Check className="h-4 w-4" />
                </Button>
                <Button onClick={cancelEdit} size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                />
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={cn(
                    "flex-1 cursor-pointer",
                    todo.completed && "line-through text-muted-foreground"
                  )}
                >
                  {todo.text}
                </label>
                {todo.dueDate && (
                  <span
                    className={cn(
                      "text-sm",
                      isOverdue(todo.dueDate) && !todo.completed
                        ? "text-red-500 dark:text-red-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {format(todo.dueDate, "PP")}
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditing(todo)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTodo(todo.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Main component to display the clock and todo list
export default function Clock() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Clock & Todo List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center">
            <ClientClock />
          </div>
          <div className="border-t pt-6">
            <TodoList />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
