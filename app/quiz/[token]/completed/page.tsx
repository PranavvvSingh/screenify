"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Header */}
        <Card className="border-green-500/50">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <CardTitle className="text-2xl">
              {timedOut ? "Time's Up - Assessment Submitted" : "Assessment Submitted Successfully!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {timedOut
                ? "Your assessment time has expired. Your answers have been automatically submitted."
                : "Thank you for completing the assessment. Your responses have been recorded."}
            </p>
          </CardContent>
        </Card>

        {/* Quiz Details Card */}
        {quizInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Candidate</p>
                  <p className="font-medium">{quizInfo.candidateName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Role</p>
                  <p className="font-medium">{quizInfo.roleTitle}</p>
                </div>
                {quizInfo.questionCount > 0 && (
                  <div>
                    <p className="text-muted-foreground">Questions</p>
                    <p className="font-medium">{quizInfo.questionCount}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Submitted At</p>
                  <p className="font-medium">
                    {new Date(quizInfo.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Your responses are being evaluated
                  </p>
                  <p>
                    Our system is analyzing your answers and calculating your performance metrics.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Recruiter will review your results
                  </p>
                  <p>
                    The hiring team will review your assessment along with other candidates.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    You&apos;ll be contacted for next steps
                  </p>
                  <p>
                    If you are selected to move forward, you will receive an email or call from the recruiter.
                  </p>
                </div>
              </div>
            </div>

            {timedOut && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <span className="font-semibold">Note:</span> Your assessment was automatically submitted
                  when the time limit was reached. All answers you provided before the timeout have been recorded.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Closing Message */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-foreground">
                Thank you for your time and effort!
              </p>
              <p className="text-xs text-muted-foreground">
                You may now close this window. This assessment cannot be retaken.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
