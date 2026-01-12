"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  onSubmit: () => void;
  onTimePerQuestionChange?: (questionId: string, time: number) => void;
}

export function QuizInterface({ questions, quizToken, onSubmit, onTimePerQuestionChange }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({});
  const [questionTimeTaken, setQuestionTimeTaken] = useState<Record<string, number>>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  // Track time when entering a new question
  useEffect(() => {
    const questionId = currentQuestion?.id;
    if (questionId && !questionStartTimes[questionId]) {
      setQuestionStartTimes((prev) => ({
        ...prev,
        [questionId]: Date.now(),
      }));
    }
  }, [currentQuestionIndex, currentQuestion?.id, questionStartTimes]);

  // Calculate time spent on question when leaving it
  const recordTimeForCurrentQuestion = () => {
    const questionId = currentQuestion?.id;
    if (questionId && questionStartTimes[questionId] && !questionTimeTaken[questionId]) {
      const timeTaken = Math.floor((Date.now() - questionStartTimes[questionId]) / 1000);
      setQuestionTimeTaken((prev) => ({
        ...prev,
        [questionId]: timeTaken,
      }));

      if (onTimePerQuestionChange) {
        onTimePerQuestionChange(questionId, timeTaken);
      }
    }
  };

  const handleAnswerChange = async (value: string) => {
    const answerIndex = parseInt(value);

    // Update local state immediately for UI responsiveness
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answerIndex,
    }));

    // Calculate time taken for this question so far
    const questionId = currentQuestion.id;
    const timeTaken = questionStartTimes[questionId]
      ? Math.floor((Date.now() - questionStartTimes[questionId]) / 1000)
      : 0;

    // Save answer to database immediately
    try {
      setSavingAnswer(true);
      const response = await fetch(`/api/quiz/${quizToken}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: answerIndex,
          timeTaken,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Failed to save answer:", data.error);
        // Don't show error to user - answer is still in local state
        // They can retry on submit
      }
    } catch (error) {
      console.error("Error saving answer:", error);
      // Don't show error to user - fail silently
    } finally {
      setSavingAnswer(false);
    }
  };

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
    // Just trigger the final submission
    onSubmit();
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

  const getQuestionButtonClass = (status: string) => {
    switch (status) {
      case "current":
        return "border-2 border-primary bg-primary text-primary-foreground";
      case "answered":
        return "border-2 border-green-500 bg-green-500 text-white";
      default:
        return "border border-border hover:bg-accent";
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Question Area */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {currentQuestion.question}
                </h3>
                <RadioGroup
                  value={answers[currentQuestion.id]?.toString()}
                  onValueChange={handleAnswerChange}
                >
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent"
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <Button onClick={handleNext}>Next Question</Button>
                ) : (
                  <Button
                    onClick={handleSubmitClick}
                    disabled={!allAnswered}
                    variant={allAnswered ? "default" : "outline"}
                  >
                    Review Answers
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Answered</span>
                  <span className="font-semibold">
                    {answeredCount}/{totalQuestions}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${(answeredCount / totalQuestions) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Navigator */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Question Navigator</h3>
                <div className="grid grid-cols-4 gap-2">
                  {questions.map((_, index) => {
                    const status = getQuestionStatus(index);
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuestionNavigate(index)}
                        className={cn(
                          "aspect-square rounded text-sm font-semibold transition-colors",
                          getQuestionButtonClass(status)
                        )}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-primary bg-primary"></div>
                    <span className="text-muted-foreground">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-500"></div>
                    <span className="text-muted-foreground">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border border-border"></div>
                    <span className="text-muted-foreground">Not Answered</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            variant="destructive"
            className="w-full"
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
