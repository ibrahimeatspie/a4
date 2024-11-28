"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TodoList } from "../components/todo-list";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time
    setTime(new Date());

    // Update time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Clock & Todo List</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center">
          {time ? (
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
              <p className="mt-2 text-center text-sm text-muted-foreground">
                {time.toLocaleDateString([], {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </>
          ) : (
            <div className="h-[88px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}
        </div>
        <div className="border-t pt-6">
          <TodoList />
        </div>
      </CardContent>
    </Card>
  );
}
