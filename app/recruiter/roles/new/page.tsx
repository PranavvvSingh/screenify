'use client';

import { Card, CardContent } from "@/components/ui/card";
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
  const [fileName, setFileName] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
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
		<div className='max-w-3xl mx-auto space-y-6'>
			<div className='flex items-center gap-4'>
				<Link href='/recruiter'>
					<Button variant='outline'>← Back</Button>
				</Link>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>Create New Role</h1>
				</div>
			</div>

			<Card>
				{/* <CardHeader>
          <CardTitle>Job Description Upload</CardTitle>
          <CardDescription>Upload a PDF file containing the job description</CardDescription>
        </CardHeader> */}
				<CardContent className='space-y-10'>
					<div className='space-y-2'>
						<Label htmlFor='title' className='text-lg font-semibold'>
							Job Title
						</Label>
						<Input
							id='title'
							placeholder='e.g. Senior Full Stack Developer'
							value={jobTitle}
							onChange={(e) => setJobTitle(e.target.value)}
						/>
					</div>

					<PDFUpload
						label='Job Description'
						description='Upload a PDF containing the full job description, requirements, and responsibilities'
						onFileSelected={handleFileSelected}
						maxSizeMB={10}
					/>

					{selectedFile && (
						<div className='text-sm text-muted-foreground'>
							✓ PDF ready: <span className='font-medium'>{fileName}</span>
						</div>
					)}

					<div className='space-y-2'>
						<Label htmlFor='description' className='text-lg font-semibold'>
							Additional Notes (Optional)
						</Label>
						<Textarea
							id='description'
							placeholder='Any additional context or requirements...'
							rows={4}
							value={additionalNotes}
							onChange={(e) => setAdditionalNotes(e.target.value)}
						/>
					</div>

					<div className='flex gap-3'>
						<Button
							size='lg'
							className='flex-1 text-md'
							onClick={handleProcessRequirements}
							disabled={!selectedFile || !jobTitle.trim() || isExtracting}
						>
							{isExtracting ? "Processing..." : "Process & Extract Requirements"}
						</Button>
						<Link href='/recruiter'>
							<Button variant='outline' size='lg'>
								Cancel
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
