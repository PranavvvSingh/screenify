'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PDFUpload } from "@/components/pdf-upload";
import Link from "next/link";
import { useState } from "react";

export default function NewRolePage() {
  const [jobTitle, setJobTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    // Reset extracted text when new file is selected
    setExtractedText("");
  };

  const handleProcessRequirements = async () => {
    if (!jobTitle.trim()) {
      alert("Please enter a job title");
      return;
    }

    if (!selectedFile) {
      alert("Please upload a job description PDF first");
      return;
    }

    setIsExtracting(true);

    try {
      // Import the extraction function
      const { extractTextFromPDF } = await import('@/lib/pdf-extractor');

      // Extract text from PDF
      const result = await extractTextFromPDF(selectedFile);

      if (result.error) {
        alert(`Error extracting PDF: ${result.error}`);
        return;
      }

      setExtractedText(result.text);
      console.log("PDF extracted successfully:", fileName);
      console.log("Text length:", result.text.length);

      // TODO: Send to API to process with Ollama (Task 9 + Task 10)
      alert(`PDF "${fileName}" extracted successfully!\n\nExtracted ${result.text.length} characters from ${result.numPages} page(s).\n\nOllama API integration coming in Task 9 & 10.`);

    } catch (error) {
      console.error("Error processing PDF:", error);
      alert(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/recruiter">
          <Button variant="outline">← Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create New Role</h1>
          <p className="text-muted-foreground mt-1">Upload a job description to get started</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Description Upload</CardTitle>
          <CardDescription>Upload a PDF file containing the job description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="e.g. Senior Full Stack Developer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>

          <PDFUpload
            label="Job Description (PDF)"
            description="Upload a PDF containing the full job description, requirements, and responsibilities"
            onFileSelected={handleFileSelected}
            maxSizeMB={10}
          />

          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              ✓ PDF ready: <span className="font-medium">{fileName}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Additional Notes (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional context or requirements..."
              rows={4}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleProcessRequirements}
              disabled={!selectedFile || !jobTitle.trim() || isExtracting}
            >
              {isExtracting ? "Processing..." : "Process & Extract Requirements"}
            </Button>
            <Link href="/recruiter">
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. We&apos;ll extract key requirements from your job description</p>
          <p>2. You&apos;ll review and edit the extracted requirements</p>
          <p>3. Generate an invitation link to share with candidates</p>
          <p>4. Candidates take AI-generated quizzes based on the role requirements</p>
        </CardContent>
      </Card>
    </div>
  );
}
