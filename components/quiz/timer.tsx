"use client";

import { formatTime } from "@/lib/utils/format-time";
import { useEffect, useState } from "react";
import { RxLapTimer as TimerIcon } from "react-icons/rx";
import { cn } from "@/lib/utils";

interface TimerProps {
  numOfQuestions: number;
  stopTimer: boolean;
  onTimeUp: () => void;
  className?: string;
  timePerQuestion?: number; // seconds per question, default 60 (1 minute)
}

const Timer = ({
  numOfQuestions,
  stopTimer,
  onTimeUp,
  className,
  timePerQuestion = 60,
}: TimerProps) => {
  const initialTime = timePerQuestion * numOfQuestions;
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    if (stopTimer) return;

    const intervalId = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(intervalId);
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [stopTimer, onTimeUp]);

  // Calculate color based on fixed time thresholds
  const getTimeColor = () => {
    const minutes = Math.floor(time / 60);
    if (time < 60) return "text-destructive"; // < 1 minute: red (critical)
    if (minutes < 5) return "text-yellow-500"; // < 5 minutes: yellow (warning)
    return "text-primary"; // >= 5 minutes: primary color
  };

  // Check if time is critical (< 1 minute) for pulse animation
  const isCritical = time < 60;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2",
        isCritical && "animate-pulse", // Pulse animation when < 1 minute
        className
      )}
    >
      <TimerIcon className={cn("h-5 w-5", getTimeColor())} />
      <div className="text-center">
        <p className={cn("text-2xl font-bold tabular-nums", getTimeColor())}>
          {formatTime(time)}
        </p>
        <p className="text-xs text-muted-foreground">Time Remaining</p>
      </div>
    </div>
  );
};

export default Timer;
