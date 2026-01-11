"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, FileText, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

interface QuizInfo {
  id: string;
  candidateName: string;
  role: {
    title: string;
    description: string | null;
    requiredSkills: string[];
    preferredSkills: string[];
  };
  questionCount: number;
  estimatedTimeMinutes: number;
}

interface QuizResponse {
  success: boolean;
  quiz?: QuizInfo;
  error?: string;
  completed?: boolean;
  submittedAt?: string;
}

export default function QuizLandingPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    async function fetchQuizInfo() {
      try {
        const response = await fetch(`/api/quiz/${token}`);
        const data: QuizResponse = await response.json();

        if (!response.ok) {
          if (data.completed) {
            setIsCompleted(true);
            setError("This quiz has already been completed.");
          } else {
            setError(data.error || "Failed to load quiz information");
          }
          setLoading(false);
          return;
        }

        if (data.success && data.quiz) {
          setQuizInfo(data.quiz);
        } else {
          setError("Invalid quiz data received");
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Failed to connect to the server. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchQuizInfo();
    }
  }, [token]);

  const handleStartAssessment = () => {
    // TODO: Navigate to quiz interface (will be implemented in Task 17)
    // For now, just log
    console.log("Starting quiz:", quizInfo?.id);
    // router.push(`/quiz/${token}/take`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
        <Card className="w-full max-w-3xl">
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

  if (error || isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              {isCompleted ? "Quiz Already Completed" : "Unable to Load Quiz"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={isCompleted ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {isCompleted ? "Already Submitted" : "Error"}
              </AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            {isCompleted && (
              <div className="mt-6 p-4 bg-accent/50 border border-accent rounded-lg">
                <div className="flex items-center gap-2 text-accent-foreground">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">
                    Thank you for completing this assessment!
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your responses have been submitted to the recruiter. You will
                  be contacted if you are selected for the next round.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!quizInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8 py-6">
        <Card className="w-full max-w-3xl">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Quiz information could not be loaded.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Assessment for {quizInfo.role.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {quizInfo.candidateName}
          </p>
        </div>

        {/* Assessment Overview */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="text-xl font-bold text-foreground">
                    {quizInfo.questionCount}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-xl font-bold text-foreground">
                    {quizInfo.estimatedTimeMinutes} mins
                  </p>
                </div>
              </div>
            </div>

            {/* Role Description - Collapsible */}
            {quizInfo.role.description && (
              <div className="mb-6">
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="w-full text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground">About the Role</h3>
                    {quizInfo.role.description.length > 150 && (
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <span>{showFullDescription ? "Show less" : "Read more"}</span>
                        {showFullDescription ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
                <p className="text-sm text-muted-foreground">
                  {showFullDescription
                    ? quizInfo.role.description
                    : truncateDescription(quizInfo.role.description)}
                </p>
              </div>
            )}

            {/* Skills - Condensed */}
            {(quizInfo.role.requiredSkills.length > 0 || quizInfo.role.preferredSkills.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {quizInfo.role.requiredSkills.slice(0, 8).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {quizInfo.role.preferredSkills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {(quizInfo.role.requiredSkills.length + quizInfo.role.preferredSkills.length > 12) && (
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                    +{quizInfo.role.requiredSkills.length + quizInfo.role.preferredSkills.length - 12} more
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions - Focused */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Before You Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2.5">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <span>Complete all {quizInfo.questionCount} questions within {quizInfo.estimatedTimeMinutes} minutes</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <span>Quiz will run in fullscreen mode. Exiting may be flagged</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <span>You have only one attempt - cannot retake once submitted</span>
              </li>
            </ul>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Ensure you have a stable internet connection and are in a quiet environment before starting.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleStartAssessment}
              size="lg"
              className="w-full cursor-pointer"
            >
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
