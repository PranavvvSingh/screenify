"use client";

import { Navbar } from "@/components/layout/navbar";
import Timer from "@/components/quiz/timer";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  const [stopTimer, setStopTimer] = useState(false);
  const router = useRouter();

  const handleTimeUp = () => {
    toast.error("Time's up!", {
      description: "Your quiz has been automatically submitted.",
    });
    setStopTimer(true);
    // TODO: Auto-submit quiz logic here
    setTimeout(() => {
      router.push("/candidate");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <Timer
          numOfQuestions={7}
          stopTimer={stopTimer}
          onTimeUp={handleTimeUp}
          timePerQuestion={135} // ~16 minutes total / 7 questions = 135 seconds per question
        />
      </Navbar>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
