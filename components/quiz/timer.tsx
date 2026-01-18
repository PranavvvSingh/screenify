"use client";

import { formatTime } from "@/lib/utils/format-time";
import { useEffect, useState, useRef } from "react";
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
  const timeUpCalledRef = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp ref updated without causing effect re-runs
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (stopTimer) return;

    const intervalId = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [stopTimer]);

  // Handle time up in a separate effect to avoid setState during render
  useEffect(() => {
    if (time === 0 && !timeUpCalledRef.current && !stopTimer) {
      timeUpCalledRef.current = true;
      onTimeUpRef.current();
    }
  }, [time, stopTimer]);

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
        "flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-0.6 my-3 max-w-xs shadow-sm",
        isCritical && "animate-pulse", // Pulse animation when < 1 minute
        className
      )}
    >
      <TimerIcon className={cn("h-5 w-5 shrink-0", getTimeColor())} />
      <div className="text-center min-w-0">
        <p className={cn("text-2xl font-bold tabular-nums whitespace-nowrap", getTimeColor())}>
          {formatTime(time)}
        </p>
        <p className="text-xs text-muted-foreground whitespace-nowrap">Time Remaining</p>
      </div>
    </div>
  );
};

export default Timer;
