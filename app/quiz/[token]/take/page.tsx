"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import Timer from "@/components/quiz/timer";
import { QuizInterface } from "@/components/quiz/quiz-interface";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  type: "STANDARD" | "RESUME_VERIFICATION";
  question: string;
  options: string[];
  correctAnswer: number;
  skill?: string;
}

interface QuizSession {
  quizId: string;
  resultId: string;
  questions: Question[];
  duration: number;
  startedAt: string;
  alreadyStarted: boolean;
}

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stopTimer, setStopTimer] = useState(false);

  useEffect(() => {
    async function startQuiz() {
      try {
        const response = await fetch(`/api/quiz/${token}/start`, {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to start quiz");
          setLoading(false);
          return;
        }

        if (data.success) {
          setQuizSession(data);
        } else {
          setError("Invalid quiz data received");
        }
      } catch (err) {
        console.error("Error starting quiz:", err);
        setError("Failed to connect to the server. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      startQuiz();
    }
  }, [token]);

  const handleTimeUp = async () => {
    toast.error("Time's up!", {
      description: "Your quiz has been automatically submitted.",
    });
    setStopTimer(true);

    // Auto-submit with current answers (handled by parent component)
    // For now, we'll redirect to a timeout page or show a message
    // This will be enhanced when we implement the submission API
    setTimeout(() => {
      router.push(`/quiz/${token}`);
    }, 3000);
  };

  const handleSubmit = async (
    answers: Record<string, { answer: number; timeTaken: number }>
  ) => {
    setSubmitting(true);

    try {
      // TODO: Implement submission API endpoint (Task 20)
      // For now, just log the answers
      console.log("Submitting answers:", answers);

      // Prepare submission data
      const submissionData = {
        quizId: quizSession?.quizId,
        resultId: quizSession?.resultId,
        answers: Object.entries(answers).map(([questionId, data]) => ({
          questionId,
          answer: data.answer,
          timeTaken: data.timeTaken,
        })),
        // Proctoring flags will be added in Task 18
        proctoringFlags: {},
      };

      console.log("Submission data:", submissionData);

      // Show success message
      toast.success("Assessment submitted successfully!", {
        description: "Thank you for completing the assessment.",
      });

      // Redirect to completion page after a short delay
      setTimeout(() => {
        router.push(`/quiz/${token}`);
      }, 2000);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to submit assessment", {
        description: "Please try again.",
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar>
          <Skeleton className="h-16 w-32" />
        </Navbar>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!quizSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar>
        <Timer
          numOfQuestions={quizSession.questions.length}
          stopTimer={stopTimer}
          onTimeUp={handleTimeUp}
          timePerQuestion={Math.floor((quizSession.duration * 60) / quizSession.questions.length)}
        />
      </Navbar>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Technical Assessment
              </h1>
              <p className="text-muted-foreground">
                Question {1} of {quizSession.questions.length}
              </p>
            </div>
          </div>

          {submitting ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-lg font-semibold">Submitting your assessment...</p>
                  <p className="text-sm text-muted-foreground">
                    Please wait while we process your responses
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <QuizInterface
              questions={quizSession.questions}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </main>
    </div>
  );
}
