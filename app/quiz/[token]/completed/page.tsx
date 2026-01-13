"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface QuizCompletedInfo {
  candidateName: string;
  roleTitle: string;
  questionCount: number;
  submittedAt: string;
  timedOut?: boolean;
}

export default function QuizCompletedPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const timedOut = searchParams.get("timedOut") === "true";

  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState<QuizCompletedInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuizInfo() {
      try {
        const response = await fetch(`/api/quiz/${token}`);
        const data = await response.json();

        if (!response.ok) {
          // If quiz is completed, that's actually what we expect
          if (data.completed) {
            // Quiz is completed - we can't get more info from the regular endpoint
            // For now, show a generic success message
            setQuizInfo({
              candidateName: "Candidate",
              roleTitle: "Role",
              questionCount: 0,
              submittedAt: data.submittedAt || new Date().toISOString(),
              timedOut,
            });
          } else {
            setError(data.error || "Failed to load quiz information");
          }
          setLoading(false);
          return;
        }

        // This shouldn't happen - quiz should be marked as completed
        // But handle it gracefully
        if (data.success && data.quiz) {
          setQuizInfo({
            candidateName: data.quiz.candidateName,
            roleTitle: data.quiz.role.title,
            questionCount: data.quiz.questionCount,
            submittedAt: new Date().toISOString(),
            timedOut,
          });
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchQuizInfo();
    }
  }, [token, timedOut]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <span className="font-pacifico text-2xl text-gradient-primary">Screenify</span>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
          <div className="p-6 rounded-2xl bg-card shadow-soft-md space-y-4">
            <Skeleton className="h-16 w-16 mx-auto rounded-full" />
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
          <div className="p-6 rounded-2xl bg-card shadow-soft-md space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
            <span className="font-pacifico text-2xl text-gradient-primary">Screenify</span>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="p-6 rounded-2xl bg-card shadow-soft-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Error</h1>
            </div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <span className="font-pacifico text-2xl text-gradient-primary">Screenify</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        {/* Success Header Card */}
        <div className="p-8 rounded-2xl bg-card shadow-soft-md border border-success/20">
          <div className="text-center">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              {timedOut ? "Time's Up - Assessment Submitted" : "Assessment Submitted Successfully!"}
            </h1>
            <p className="text-muted-foreground">
              {timedOut
                ? "Your assessment time has expired. Your answers have been automatically submitted."
                : "Thank you for completing the assessment. Your responses have been recorded."}
            </p>
          </div>
        </div>

        {/* What Happens Next Card */}
        <div className="p-6 rounded-2xl bg-card shadow-soft-md">
          <h2 className="text-lg font-semibold text-foreground mb-6">What Happens Next?</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  Your responses are being evaluated
                </p>
                <p className="text-sm text-muted-foreground">
                  Our system is analyzing your answers and calculating your performance metrics.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  Recruiter will review your results
                </p>
                <p className="text-sm text-muted-foreground">
                  The hiring team will review your assessment along with other candidates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  You&apos;ll be contacted for next steps
                </p>
                <p className="text-sm text-muted-foreground">
                  If you are selected to move forward, you will receive an email or call from the recruiter.
                </p>
              </div>
            </div>
          </div>

          {timedOut && (
            <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Note:</span> Your assessment was automatically submitted
                  when the time limit was reached. All answers you provided before the timeout have been recorded.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
