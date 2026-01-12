"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  Timer,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data
const mockQuizInfo = {
  candidateName: "Alex Johnson",
  role: {
    title: "Senior Frontend Engineer",
    description: "We are looking for a Senior Frontend Engineer to join our team and help build the next generation of our web platform. You will work closely with designers and backend engineers to deliver exceptional user experiences.",
    requiredSkills: ["React", "TypeScript", "CSS", "Testing", "Performance"],
    preferredSkills: ["Next.js", "GraphQL", "Design Systems"],
  },
  questionCount: 15,
  estimatedTimeMinutes: 30,
};

const mockQuestions = [
  {
    id: "1",
    question: "What is the primary purpose of React's useCallback hook?",
    options: [
      "To memoize callback functions and prevent unnecessary re-renders",
      "To create new callback functions on every render",
      "To handle asynchronous operations in React",
      "To manage component lifecycle events"
    ],
  },
  {
    id: "2",
    question: "In TypeScript, what does the 'readonly' modifier do when applied to a property?",
    options: [
      "Makes the property optional",
      "Prevents the property from being reassigned after initialization",
      "Makes the property private",
      "Allows the property to be null"
    ],
  },
  {
    id: "3",
    question: "Which CSS property is used to create a flexible container that can wrap its children?",
    options: [
      "display: block",
      "display: inline",
      "display: flex with flex-wrap: wrap",
      "display: grid"
    ],
  },
];

type ViewMode = "landing" | "quiz";

function QuizLandingPreview({ onStart }: { onStart: () => void }) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dev-preview" className="font-pacifico text-2xl text-gradient-primary">
            Screenify
          </Link>
          <div className="text-sm text-muted-foreground">
            Assessment Portal
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Assessment for {mockQuizInfo.role.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {mockQuizInfo.candidateName}
          </p>
        </div>

        {/* Assessment Overview Card */}
        <div className="p-6 rounded-2xl bg-card shadow-soft-md">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockQuizInfo.questionCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold text-foreground">
                  {mockQuizInfo.estimatedTimeMinutes} mins
                </p>
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="mb-6">
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">About the Role</h3>
                <div className="flex items-center gap-1 text-sm text-accent">
                  <span>{showFullDescription ? "Show less" : "Read more"}</span>
                  {showFullDescription ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {showFullDescription
                ? mockQuizInfo.role.description
                : mockQuizInfo.role.description.slice(0, 150) + "..."}
            </p>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {mockQuizInfo.role.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
            {mockQuizInfo.role.preferredSkills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Instructions Card */}
        <div className="p-6 rounded-2xl bg-card shadow-soft-md">
          <h2 className="text-lg font-semibold text-foreground mb-4">Before You Start</h2>

          <ul className="space-y-4 mb-6">
            <li className="flex items-start gap-3">
              <div className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="text-muted-foreground pt-0.5">
                Complete all {mockQuizInfo.questionCount} questions within {mockQuizInfo.estimatedTimeMinutes} minutes
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                2
              </div>
              <span className="text-muted-foreground pt-0.5">
                Quiz will run in fullscreen mode. Exiting may be flagged
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-muted-foreground pt-0.5">
                You have only one attempt - cannot retake once submitted
              </span>
            </li>
          </ul>

          <div className="p-4 rounded-xl bg-muted/50 border border-border mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Ensure you have a stable internet connection and are in a quiet environment before starting.
              </p>
            </div>
          </div>

          <Button
            onClick={onStart}
            size="lg"
            className="w-full h-12 text-base font-medium shadow-soft-md hover:shadow-soft-lg transition-shadow"
          >
            Start Assessment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuizTakingPreview({ onBack }: { onBack: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const currentQuestion = mockQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / mockQuestions.length) * 100);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: parseInt(value),
    }));
  };

  const getQuestionStatus = (index: number) => {
    const question = mockQuestions[index];
    if (index === currentIndex) return "current";
    if (answers[question.id] !== undefined) return "answered";
    return "unanswered";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar with Timer */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dev-preview" className="font-pacifico text-2xl text-gradient-primary">
            Screenify
          </Link>

          {/* Timer */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card shadow-soft-sm border border-border">
            <Timer className="h-5 w-5 text-success" />
            <span className="font-mono text-lg font-semibold text-foreground">28:45</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Question Card */}
            <div className="p-8 rounded-2xl bg-card shadow-soft-md">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>Question {currentIndex + 1} of {mockQuestions.length}</span>
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-6">
                {currentQuestion.question}
              </h2>

              <RadioGroup
                value={answers[currentQuestion.id]?.toString()}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestion.id] === index;
                  return (
                    <div
                      key={index}
                      onClick={() => handleAnswer(index.toString())}
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
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentIndex < mockQuestions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentIndex(currentIndex + 1)}
                    className="gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    disabled={answeredCount < mockQuestions.length}
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
                  {answeredCount}/{mockQuestions.length}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question Navigator */}
            <div className="p-6 rounded-2xl bg-card shadow-soft-md">
              <h3 className="text-sm font-semibold text-foreground mb-4">Questions</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {mockQuestions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
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
              disabled={answeredCount < mockQuestions.length}
            >
              Submit Assessment
            </Button>
            {answeredCount < mockQuestions.length && (
              <p className="text-xs text-center text-muted-foreground">
                Answer all questions to submit
              </p>
            )}

            {/* Back to landing (dev only) */}
            <button
              onClick={onBack}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
            >
              ← Back to quiz landing preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizPreviewPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("landing");

  return (
    <>
      {viewMode === "landing" ? (
        <QuizLandingPreview onStart={() => setViewMode("quiz")} />
      ) : (
        <QuizTakingPreview onBack={() => setViewMode("landing")} />
      )}

      {/* Dev Preview Banner */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-foreground text-background text-sm shadow-lg">
          <span>Quiz Preview Mode</span>
          <Link
            href="/dev-preview"
            className="px-3 py-1 rounded-full bg-background/20 hover:bg-background/30 transition-colors"
          >
            Exit Preview
          </Link>
        </div>
      </div>
    </>
  );
}
