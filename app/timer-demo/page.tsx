"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Timer from "@/components/quiz/timer";
import { useState } from "react";
import { toast } from "sonner";

export default function TimerDemoPage() {
  const [stopTimer, setStopTimer] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const handleTimeUp = () => {
    toast.error("Time's up!", {
      description: "The quiz has ended due to timeout.",
    });
    setStopTimer(true);
  };

  const resetTimer = () => {
    setTimerKey((prev) => prev + 1);
    setStopTimer(false);
  };

  const pauseTimer = () => {
    setStopTimer(!stopTimer);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Timer Component Demo</h1>
          <p className="text-muted-foreground mt-2">Testing the quiz timer functionality</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>20-Question Quiz Timer</CardTitle>
              <CardDescription>1 minute per question (20 minutes total)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Timer
                  key={timerKey}
                  numOfQuestions={20}
                  stopTimer={stopTimer}
                  onTimeUp={handleTimeUp}
                  timePerQuestion={60}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={pauseTimer} variant="outline" className="flex-1">
                  {stopTimer ? "Resume" : "Pause"}
                </Button>
                <Button onClick={resetTimer} className="flex-1">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10-Question Quiz Timer</CardTitle>
              <CardDescription>45 seconds per question (7.5 minutes total)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Timer
                  key={timerKey + 1000}
                  numOfQuestions={10}
                  stopTimer={stopTimer}
                  onTimeUp={handleTimeUp}
                  timePerQuestion={45}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Timer Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>✓ Countdown timer with MM:SS format</p>
            <p>✓ Color changes based on time remaining (green → yellow → red)</p>
            <p>✓ Auto-calls onTimeUp when timer reaches 0</p>
            <p>✓ Can be paused/resumed with stopTimer prop</p>
            <p>✓ Customizable time per question</p>
            <p>✓ Uses Hugeicons Clock02Icon</p>
            <p>✓ Styled with shadcn/ui components</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
