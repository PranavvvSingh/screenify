"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { extractTextFromPDF, isValidPDF, formatFileSize } from "@/lib/pdf-extractor";
import { toast } from "sonner";

interface AddCandidateModalProps {
  roleId: string;
  onSuccess?: () => void;
}

export function AddCandidateModal({ roleId, onSuccess }: AddCandidateModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizLink, setQuizLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form state
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!isValidPDF(file)) {
      setResumeError("Please upload a valid PDF file");
      setResumeFile(null);
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setResumeError("File size must be less than 10MB");
      setResumeFile(null);
      return;
    }

    setResumeError("");
    setResumeFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!candidateName || !candidateEmail || !resumeFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Extract text from PDF
      const { text: resumeText, error: extractionError } = await extractTextFromPDF(resumeFile);

      if (extractionError || !resumeText) {
        throw new Error(extractionError || "Failed to extract text from resume");
      }

      // Send to API
      const response = await fetch(`/api/role/${roleId}/add-candidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateName,
          candidateEmail,
          resumeText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add candidate");
      }

      const data = await response.json();

      // Show success
      setQuizLink(data.quizUrl);
      toast.success("Candidate added successfully");

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!quizLink) return;

    try {
      await navigator.clipboard.writeText(quizLink);
      setCopied(true);
      toast.success("Quiz link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const resetForm = () => {
    setCandidateName("");
    setCandidateEmail("");
    setResumeFile(null);
    setResumeError("");
    setQuizLink(null);
    setCopied(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Reset form when closing
    if (!newOpen) {
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="mt-2 cursor-pointer">
          Add Candidate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Candidate</DialogTitle>
          {!quizLink && (
            <DialogDescription>
              Upload a candidate&apos;s resume to generate a personalized assessment
            </DialogDescription>
          )}
        </DialogHeader>

        {!quizLink ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Candidate Name */}
            <div className="space-y-2 mt-2">
              <Label htmlFor="candidateName">
                Candidate Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="candidateName"
                placeholder="John Doe"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Candidate Email */}
            <div className="space-y-2">
              <Label htmlFor="candidateEmail">
                Candidate Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="candidateEmail"
                type="email"
                placeholder="john.doe@example.com"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume">
                Resume (PDF) <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="cursor-pointer"
                  />
                </div>
                {resumeFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>
                      {resumeFile.name} ({formatFileSize(resumeFile.size)})
                    </span>
                  </div>
                )}
                {resumeError && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{resumeError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="cursor-pointer">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add Candidate
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Success State */}
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Candidate Added Successfully</h3>
                <p className="text-sm text-muted-foreground">
                  Share the quiz link below with {candidateName}
                </p>
              </div>
            </div>

            {/* Quiz Link */}
            <div className="space-y-2">
              <Label>Quiz Link</Label>
              <div className="flex gap-2">
                <Input value={quizLink} readOnly className="font-mono text-sm" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={() => setOpen(false)} className="cursor-pointer">Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
