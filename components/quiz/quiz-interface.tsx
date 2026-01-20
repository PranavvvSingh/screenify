"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  type: "STANDARD" | "RESUME_VERIFICATION";
  question: string;
  options: string[];
  correctAnswer: number;
  skill?: string;
}

interface QuizInterfaceProps {
  questions: Question[];
  quizToken: string; // Token for API calls
  initialVersion: number; // Initial version for optimistic locking
  onSubmit: (version: number) => void; // Pass current version to submit handler
  onTimePerQuestionChange?: (questionId: string, time: number) => void;
  onQuestionChange?: (questionIndex: number) => void;
  onQuizEnded?: () => void; // Called when quiz ends (version conflict detected)
}

export function QuizInterface({ questions, quizToken, initialVersion, onSubmit, onTimePerQuestionChange, onQuestionChange, onQuizEnded }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const questionStartTimesRef = useRef<Record<string, number>>({});
  const [questionTimeTaken, setQuestionTimeTaken] = useState<Record<string, number>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Use ref for version to avoid stale closures in async operations
  // This ensures we always read/write the latest version without race conditions
  const versionRef = useRef(initialVersion);

  // Ref to track throttle state per question
  const lastSaveTimeRef = useRef<Record<string, number>>({});
  const THROTTLE_MS = 500; // 500ms throttle window

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Track time when entering a new question
  useEffect(() => {
    const questionId = currentQuestion?.id;
    if (questionId && !questionStartTimesRef.current[questionId]) {
      questionStartTimesRef.current[questionId] = Date.now();
    }

    // Notify parent of question change
    if (onQuestionChange) {
      onQuestionChange(currentQuestionIndex);
    }
  }, [currentQuestionIndex, currentQuestion?.id, onQuestionChange]);


  // Save answer to backend with throttling and optimistic locking
  const saveAnswerToBackend = useCallback(async (questionId: string, answer: number, timeTaken: number) => {
    const now = Date.now();
    const lastSaveTime = lastSaveTimeRef.current[questionId] || 0;

    // Skip if within throttle window
    if (now - lastSaveTime < THROTTLE_MS) {
      return;
    }

    // Update last save time
    lastSaveTimeRef.current[questionId] = now;

    try {
      const response = await fetch(`/api/quiz/${quizToken}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          answer,
          timeTaken,
          version: versionRef.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if quiz has ended (version conflict)
        if (data.quizEnded) {
          console.error("Quiz has ended, answer not saved");
          onQuizEnded?.();
          return;
        }
        console.error("Failed to save answer:", data.error);
      } else if (data.version !== undefined) {
        // Update version ref for next request
        versionRef.current = data.version;
      }
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  }, [quizToken, onQuizEnded]);

  // Calculate time spent on question when leaving it
  const recordTimeForCurrentQuestion = useCallback(() => {
    const questionId = currentQuestion.id;
    if (questionStartTimesRef.current[questionId]) {
      setQuestionTimeTaken((prev) => {
        // Skip if already recorded
        if (prev[questionId]) return prev;

        const timeTaken = Math.floor((Date.now() - questionStartTimesRef.current[questionId]) / 1000);

        if (onTimePerQuestionChange) {
          onTimePerQuestionChange(questionId, timeTaken);
        }

        return { ...prev, [questionId]: timeTaken };
      });
    }
  }, [currentQuestion.id, onTimePerQuestionChange]);

  const handleAnswerChange = useCallback((value: string) => {
    const answerIndex = parseInt(value);

    // Update local state immediately for UI responsiveness (optimistic UI)
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerIndex,
    }));

    // Calculate time taken for this question so far
    const questionId = currentQuestion.id;
    const startTime = questionStartTimesRef.current[questionId];
    const timeTaken = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;

    // Save to backend (throttled - first click saves immediately, subsequent clicks within 500ms are ignored)
    saveAnswerToBackend(questionId, answerIndex, timeTaken);
  }, [currentQuestion.id, saveAnswerToBackend]);

  const handleNext = () => {
    recordTimeForCurrentQuestion();
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    recordTimeForCurrentQuestion();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionNavigate = (index: number) => {
    recordTimeForCurrentQuestion();
    setCurrentQuestionIndex(index);
  };

  const handleSubmitClick = () => {
    if (!allAnswered) {
      return;
    }
    recordTimeForCurrentQuestion();
    setShowSubmitDialog(true);
  };

  const handleConfirmSubmit = () => {
    // Answers are already saved individually via the answer API
    // Pass current version for optimistic locking
    onSubmit(versionRef.current);
  };

  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    const isAnswered = answers[question.id] !== undefined;
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) {
      return "current";
    }
    if (isAnswered) {
      return "answered";
    }
    return "unanswered";
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Question Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-8 rounded-2xl bg-card shadow-soft-md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
            </div>

            <h2 className="text-xl font-semibold text-foreground mb-6">
              {currentQuestion.question}
            </h2>

            <RadioGroup
              value={answers[currentQuestion.id] !== undefined ? answers[currentQuestion.id].toString() : ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                return (
                  <div
                    key={index}
                    onClick={() => handleAnswerChange(index.toString())}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                      isSelected
                        ? "border-accent bg-accent/5 shadow-soft-sm"
                        : "border-border hover:border-accent/30 hover:bg-muted/30"
                    )}
                  >
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-foreground leading-relaxed"
                    >
                      {option}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                  onClick={handleNext}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  disabled={!allAnswered}
                  onClick={handleSubmitClick}
                  className="gap-2"
                >
                  Review Answers
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="p-6 rounded-2xl bg-card shadow-soft-md">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground">
                {answeredCount}/{totalQuestions}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-primary to-accent rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Navigator */}
          <div className="p-6 rounded-2xl bg-card shadow-soft-md">
            <h3 className="text-sm font-semibold text-foreground mb-4">Questions</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigate(index)}
                    className={cn(
                      "aspect-square rounded-lg text-sm font-semibold transition-all",
                      status === "current" && "bg-primary text-primary-foreground shadow-soft-sm",
                      status === "answered" && "bg-success text-white",
                      status === "unanswered" && "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-primary" />
                <span className="text-muted-foreground">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-success" />
                <span className="text-muted-foreground">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-muted" />
                <span className="text-muted-foreground">Unanswered</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            variant="destructive"
            className="w-full shadow-soft-sm"
            onClick={handleSubmitClick}
            disabled={!allAnswered}
          >
            Submit Assessment
          </Button>
          {!allAnswered && (
            <p className="text-xs text-center text-muted-foreground">
              Answer all questions to submit
            </p>
          )}
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered all {totalQuestions} questions. Once submitted, you cannot change your answers.
              Are you sure you want to submit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Review Again</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Yes, Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
