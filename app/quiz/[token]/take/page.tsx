"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Timer from "@/components/quiz/timer";
import { QuizInterface } from "@/components/quiz/quiz-interface";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2, Timer as TimerIcon, Mail } from "lucide-react";
import { toast } from "sonner";
import { useProctoring, type ProctoringEvent } from "@/hooks/use-proctoring";
import { FullscreenModal } from "@/components/proctoring-warning";

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
  questions: Question[];
  duration: number; // Duration in seconds
  startedAt: string;
  remainingTime: number; // Remaining time in seconds
  version: number; // Version for optimistic locking
  alreadyStarted: boolean;
  existingAnswers?: Record<string, number>; // Existing answers when resuming
}

export default function QuizTakePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [currentVersion, setCurrentVersion] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stopTimer, setStopTimer] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const isSubmittingRef = useRef(false); // Guard against double submission

  // Fullscreen modal state
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);

  // Handle fullscreen exit - show blocking modal
  const handleFullscreenExit = useCallback(() => {
    setShowFullscreenModal(true);
  }, []);

  // Handle proctoring violation - only show toast in development for testing
  const handleViolation = useCallback((event: ProctoringEvent) => {
    // In production: silently track violations (already sent to server by useProctoring hook)
    // In development: show toast for easier testing/debugging
    if (process.env.NODE_ENV === "development" && event.type !== "FULLSCREEN_EXIT") {
      toast.warning(`[DEV] Violation: ${event.type}`, {
        description: "This toast only shows in development mode.",
      });
    }
  }, []);

  // Initialize proctoring hook
  const { isFullscreen, requestFullscreen, exitFullscreen } = useProctoring({
    quizToken: token,
    enabled: !!quizSession && !submitting,
    onFullscreenExit: handleFullscreenExit,
    onViolation: handleViolation,
  });

  // Handle return to fullscreen from modal
  const handleReturnToFullscreen = useCallback(async () => {
    const success = await requestFullscreen();
    if (success) {
      setShowFullscreenModal(false);
    }
  }, [requestFullscreen]);

  // Close fullscreen modal when fullscreen is restored
  useEffect(() => {
    if (isFullscreen && showFullscreenModal) {
      setShowFullscreenModal(false);
    }
  }, [isFullscreen, showFullscreenModal]);

  useEffect(() => {
    async function startQuiz() {
      try {
        const response = await fetch(`/api/quiz/${token}/start`, {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === "Quiz has timed out") {
            setIsTimedOut(true);
          }
          setError(data.error || "Failed to start quiz");
          setLoading(false);
          return;
        }

        if (data.success) {
          setQuizSession(data);
          setCurrentVersion(data.version);
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

  const handleTimeUp = useCallback(async () => {
    // Guard against double submission
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    toast.error("Time's up!", {
      description: "Your quiz has been automatically submitted.",
    });
    setStopTimer(true);
    setSubmitting(true);

    try {
      // Submit quiz with timeout flag and current version
      // Proctoring data is read from DB by server
      const response = await fetch(`/api/quiz/${token}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timedOut: true,
          version: currentVersion,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Failed to submit quiz:", data.error);
        toast.error("Failed to submit quiz", {
          description: "Please contact support.",
        });
        return;
      }

      // Exit fullscreen mode now that quiz is submitted
      await exitFullscreen();

      // Redirect to completed page with timeout flag
      router.push(`/quiz/${token}/completed?timedOut=true`);
    } catch (error) {
      console.error("Error during auto-submit:", error);
      toast.error("Failed to submit quiz", {
        description: "Please contact support.",
      });
    }
  }, [token, currentVersion, router, exitFullscreen]);

  const handleSubmit = async (version: number) => {
    // Guard against double submission
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setSubmitting(true);
    setStopTimer(true); // Stop the timer during submission
    // Update the current version from QuizInterface
    setCurrentVersion(version);

    try {
      // Note: Individual answers are already saved via the answer API
      // This just marks the quiz as complete and triggers evaluation
      // Proctoring data is read from DB by server
      const response = await fetch(`/api/quiz/${token}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timedOut: false,
          version: version,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit quiz");
      }

      // Exit fullscreen mode now that quiz is submitted
      await exitFullscreen();

      // Show success message
      toast.success("Assessment submitted successfully!", {
        description: "Thank you for completing the assessment.",
      });

      // Redirect to completion page
      setTimeout(() => {
        router.push(`/quiz/${token}/completed`);
      }, 1500);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to submit assessment", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
      setSubmitting(false);
      setStopTimer(false); // Resume timer if submission failed
      isSubmittingRef.current = false; // Allow retry
    }
  };

  const handleQuizEnded = () => {
    // Quiz ended due to version conflict (already submitted elsewhere)
    toast.error("Quiz has ended", {
      description: "Your quiz session has expired or was already submitted.",
    });
    router.push(`/quiz/${token}/completed`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="font-pacifico text-2xl text-gradient-primary pb-1">Screenify</span>
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    // Special UI for timed out quizzes
    if (isTimedOut) {
      return (
        <div className="min-h-screen bg-background relative overflow-hidden">
          {/* Subtle animated background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          </div>

          {/* Navbar */}
          <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
              <span className="font-pacifico text-2xl text-gradient-primary pb-1">Screenify</span>
            </div>
          </nav>

          <div className="relative max-w-2xl mx-auto px-6 py-12 space-y-6">
            {/* Main Status Card */}
            <div className="p-8 rounded-2xl bg-card shadow-soft-lg border border-accent/20 relative overflow-hidden">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full" />

              <div className="text-center relative">
                {/* Animated clock icon */}
                <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center relative">
                  <div className="absolute inset-2 rounded-full bg-card shadow-inner" />
                  <TimerIcon className="h-10 w-10 text-accent relative z-10" />
                </div>

                <h1 className="text-2xl font-bold text-foreground mb-3">
                  Assessment Time Expired
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  The time allocated for this assessment has passed. Unfortunately, the quiz can no longer be started or continued.
                </p>
              </div>
            </div>

            {/* Help Card */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent shrink-0" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Need help?</span> Contact the recruiter directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Generic error UI
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <span className="font-pacifico text-2xl text-gradient-primary pb-1">Screenify</span>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="p-6 rounded-2xl bg-card shadow-soft-md">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  if (!quizSession) {
    return null;
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <span className="font-pacifico text-2xl text-gradient-primary pb-1">Screenify</span>
          </div>
        </nav>
        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium">Submitting your assessment...</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your responses
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="font-pacifico text-2xl text-gradient-primary pb-1">Screenify</span>
            <div className="flex items-center gap-4">
              {/* Fullscreen indicator */}
              {!isFullscreen && (
                <button
                  onClick={requestFullscreen}
                  className="text-xs px-3 py-1.5 bg-warning/10 text-warning rounded-full flex items-center gap-1.5 hover:bg-warning/20 transition-colors"
                >
                  <AlertCircle className="h-3 w-3" />
                  Not in fullscreen
                </button>
              )}
              <Timer
                numOfQuestions={quizSession.questions.length}
                stopTimer={stopTimer}
                onTimeUp={handleTimeUp}
                timePerQuestion={Math.floor(quizSession.remainingTime / quizSession.questions.length)}
              />
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-sm text-muted-foreground mb-6">
            Question {currentQuestionIndex + 1} of {quizSession.questions.length}
          </p>
          <QuizInterface
            questions={quizSession.questions}
            quizToken={token}
            initialVersion={currentVersion}
            initialAnswers={quizSession.existingAnswers}
            onSubmit={handleSubmit}
            onQuestionChange={setCurrentQuestionIndex}
            onQuizEnded={handleQuizEnded}
          />
        </main>
      </div>

      {/* Fullscreen exit blocking modal */}
      <FullscreenModal
        open={showFullscreenModal}
        onRequestFullscreen={handleReturnToFullscreen}
      />
    </>
  );
}
