"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PDFUpload } from "@/components/pdf-upload";
import { SkillsInput } from "@/components/skills-input";
import Link from "next/link";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const EXPERIENCE_LEVELS = [
	{ value: "", label: "Select level..." },
	{ value: "Entry", label: "Entry (0-1 years)" },
	{ value: "Junior", label: "Junior (1-3 years)" },
	{ value: "Mid", label: "Mid (3-5 years)" },
	{ value: "Senior", label: "Senior (5-8 years)" },
	{ value: "Lead", label: "Lead (8-12 years)" },
	{ value: "Principal", label: "Principal (12+ years)" }
];

export default function NewRolePage() {
	// Form state
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [skills, setSkills] = useState<string[]>([]);
	const [experienceYears, setExperienceYears] = useState<number | "">("");
	const [experienceLevel, setExperienceLevel] = useState("");
	const [totalQuestions, setTotalQuestions] = useState<number>(10);

	// PDF section state
	const [showPdfSection, setShowPdfSection] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isExtracting, setIsExtracting] = useState(false);

	// Validation
	const isFormValid = useMemo(() => {
		return (
			title.trim() !== "" &&
			description.trim() !== "" &&
			skills.length > 0 &&
			experienceYears !== "" &&
			experienceYears >= 0 &&
			experienceYears <= 50 &&
			experienceLevel !== ""
		);
	}, [title, description, skills, experienceYears, experienceLevel]);

	const handleFileSelected = (file: File) => {
		setSelectedFile(file);
	};

	const handleImportPDF = async () => {
		if (!selectedFile) {
			alert("Please select a PDF file first");
			return;
		}

		setIsExtracting(true);

		try {
			const { extractTextFromPDF } = await import("@/lib/pdf-extractor");
			const result = await extractTextFromPDF(selectedFile);

			if (result.error) {
				alert(`Error extracting PDF: ${result.error}`);
				return;
			}

			alert(
				`PDF extracted successfully!\n\nExtracted ${result.text.length} characters from ${result.numPages} page(s).\n\nOllama API integration coming soon to auto-populate the form fields.`
			);

			// TODO: Call Ollama API to parse text and populate form fields
			console.log("Extracted text:", result.text);
		} catch (error) {
			console.error("Error processing PDF:", error);
			alert(`Failed to process PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
		} finally {
			setIsExtracting(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!isFormValid) {
			alert("Please fill in all required fields");
			return;
		}

		const formData = {
			title,
			totalQuestions,
			jd: {
				rawText: "", // Will be populated from PDF extraction in future
				description,
				requirements: {
					skills,
					experience: {
						min: experienceYears,
						max: experienceYears,
						level: experienceLevel
					},
					qualifications: [],
					responsibilities: []
				}
			}
		};

		console.log("Form data:", formData);
		alert("Form is valid! \n\nCheck console for form data.\n\nAPI integration coming next.");
	};

	return (
		<div className='max-w-3xl mx-auto space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Link href='/recruiter'>
					<Button variant='outline'>← Back</Button>
				</Link>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>Create New Job Role</h1>
					<p className='text-muted-foreground mt-1'>Fill in the details below to create a new job role</p>
				</div>
			</div>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardContent className='space-y-10 pt-6'>
						{/* Optional PDF Import Section */}
						<div className='border rounded-lg p-4 bg-card'>
							<button
								type='button'
								onClick={() => setShowPdfSection(!showPdfSection)}
								className='flex items-center justify-between w-full text-left'
							>
								<div>
									<h3 className='text-lg font-semibold'>Or Import from PDF (Optional)</h3>
									<p className='text-sm text-muted-foreground mt-1'>
										Upload a PDF to auto-fill the form fields below (coming soon)
									</p>
								</div>
								{showPdfSection ? (
									<ChevronUp className='w-5 h-5 text-muted-foreground' />
								) : (
									<ChevronDown className='w-5 h-5 text-muted-foreground' />
								)}
							</button>

							{showPdfSection && (
								<div className='mt-4 space-y-4'>
									<PDFUpload
										label=''
										description='Upload a PDF containing the job description'
										onFileSelected={handleFileSelected}
										maxSizeMB={10}
									/>
									{selectedFile && (
										<Button type='button' onClick={handleImportPDF} disabled={isExtracting} className='w-full'>
											{isExtracting ? "Processing..." : "Import from PDF"}
										</Button>
									)}
								</div>
							)}
						</div>

						{/* Job Title */}
						<div className='space-y-2'>
							<Label htmlFor='title' className='text-lg font-semibold'>
								Job Title <span className='text-red-500'>*</span>
							</Label>
							<Input
								id='title'
								placeholder='e.g., Senior Full Stack Developer'
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
								className='h-10'
							/>
						</div>

						{/* Skills */}
						<div className='space-y-2'>
							<Label className='text-lg font-semibold'>
								Required Skills <span className='text-red-500'>*</span>
							</Label>
							<SkillsInput value={skills} onChange={setSkills} />
						</div>

						{/* Experience */}
						<div className='space-y-2'>
							<Label className='text-lg font-semibold'>
								Experience Required <span className='text-red-500'>*</span>
							</Label>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='experience-years' className='text-sm text-muted-foreground'>
										Years
									</Label>
									<Input
										id='experience-years'
										type='number'
										min='0'
										max='50'
										placeholder='5'
										value={experienceYears}
										onChange={(e) => setExperienceYears(e.target.value === "" ? "" : Number(e.target.value))}
										required
										className='h-10'
									/>
								</div>
								<div>
									<Label htmlFor='experience-level' className='text-sm text-muted-foreground'>
										Level
									</Label>
									<Select value={experienceLevel} onValueChange={setExperienceLevel}>
										<SelectTrigger className='w-full'>
											<SelectValue placeholder='Select level...' />
										</SelectTrigger>
										<SelectContent>
											{EXPERIENCE_LEVELS.filter((level) => level.value !== "").map((level) => (
												<SelectItem key={level.value} value={level.value}>
													{level.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>

						{/* Total Questions */}
						<div className='space-y-2'>
							<Label htmlFor='total-questions' className='text-lg font-semibold'>
								Total Quiz Questions
							</Label>
							<p className='text-sm text-muted-foreground'>
								70% will be standard questions (based on JD), 30% will be resume verification questions
							</p>
							<Input
								id='total-questions'
								type='number'
								min='5'
								max='25'
								value={totalQuestions}
								onChange={(e) => setTotalQuestions(Number(e.target.value))}
								className='h-10 max-w-50'
							/>
							<p className='text-xs text-muted-foreground'>
								Range: 5-25 questions (Default: 10)
							</p>
						</div>

						{/* Job Description */}
						<div className='space-y-2'>
							<Label htmlFor='description' className='text-lg font-semibold'>
								Job Description <span className='text-red-500'>*</span>
							</Label>
							<Textarea
								id='description'
								placeholder='Describe the role, responsibilities, and qualifications...'
								rows={10}
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								required
							/>
						</div>

						{/* Form Actions */}
						<div className='flex gap-3'>
							<Button type='submit' size='lg' className='flex-1 text-md' disabled={!isFormValid}>
								Create Role
							</Button>
							<Link href='/recruiter'>
								<Button type='button' variant='outline' size='lg'>
									Cancel
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</form>
		</div>
	);
}
