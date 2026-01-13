"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PDFUpload } from "@/components/pdf-upload";
import { SkillsInput } from "@/components/skills-input";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

export default function NewRolePage() {
	const router = useRouter();

	// Form state
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [requirements, setRequirements] = useState<string[]>([]);
	const [skills, setSkills] = useState<string[]>([]);
	const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
	const [minExperience, setMinExperience] = useState<number | "">("");
	const [maxExperience, setMaxExperience] = useState<number | "">("");
	const [totalQuestions, setTotalQuestions] = useState<number>(10);

	// PDF section state
	const [showPdfSection, setShowPdfSection] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isExtracting, setIsExtracting] = useState(false);

	// Form submission state
	const [isCreating, setIsCreating] = useState(false);

	// Validation
	const isFormValid = useMemo(() => {
		return (
			title.trim() !== "" &&
			description.trim() !== "" &&
			skills.length > 0 &&
			minExperience !== "" &&
			maxExperience !== "" &&
			minExperience >= 0 &&
			maxExperience >= 0 &&
			minExperience <= maxExperience
		);
	}, [title, description, skills, minExperience, maxExperience]);

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
			// Step 1: Extract text from PDF
			const { extractTextFromPDF } = await import("@/lib/pdf-extractor");
			const result = await extractTextFromPDF(selectedFile);

			if (result.error) {
				alert(`Error extracting PDF: ${result.error}`);
				return;
			}


			// Step 2: Call Ollama API to extract structured requirements
			const response = await fetch("/api/role/extract-jd", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: result.text })
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to extract requirements from JD");
			}

			const { requirements } = await response.json();

			// Step 3: Auto-populate form fields with extracted data
			setTitle(requirements.job_title ?? "");
			setDescription(requirements.description ?? "");
			setRequirements(requirements.requirements ?? []);
			setSkills(requirements.required_skills ?? []);
			setPreferredSkills(requirements.preferred_skills ?? []);

			// Set experience from requirements
			if (requirements.experience?.min_years !== undefined && requirements.experience.min_years !== null) {
				setMinExperience(requirements.experience.min_years);
			}
			if (requirements.experience?.max_years !== undefined && requirements.experience.max_years !== null) {
				setMaxExperience(requirements.experience.max_years);
			}

			console.log("Extracted requirements:", requirements);
		} catch (error) {
			console.error("Error processing PDF:", error);
			alert(`Failed to process PDF: ${error instanceof Error ? error.message : "Unknown error"}`);
		} finally {
			setIsExtracting(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isFormValid) {
			alert("Please fill in all required fields");
			return;
		}

		setIsCreating(true);

		try {
			const roleData = {
				title,
				description,
				totalQuestions,
				requirements: {
					job_title: title,
					description: description,
					requirements: requirements,
					required_skills: skills,
					preferred_skills: preferredSkills,
					experience: {
						min_years: Number(minExperience),
						max_years: Number(maxExperience),
					}
				}
			};

			// Call API to create role
			const response = await fetch("/api/role/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(roleData)
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to create role");
			}

			const { role } = await response.json();

			console.log("Role created successfully");

			// Show success message
			alert(
				`Role created successfully!\n\n` +
				`Title: ${role.title}\n` +
				`Total Questions: ${role.totalQuestions}\n` +
				`Base Questions Generated: ${role.baseQuestionsCount}\n\n` +
				`Redirecting to role overview...`
			);

			// Redirect to role overview page
			router.push(`/recruiter/roles/${role.id}`);
		} catch (error) {
			console.error("Error creating role:", error);
			alert(`Failed to create role: ${error instanceof Error ? error.message : "Unknown error"}`);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className='max-w-3xl mx-auto space-y-6'>
			{/* Header */}
			<div className='flex items-center gap-4'>
				<Link href='/recruiter'>
					<Button variant='ghost' size='icon' className='h-10 w-10 rounded-xl hover:bg-muted'>
						<ArrowLeft className='h-5 w-5' />
					</Button>
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
								value={title ?? ""}
								onChange={(e) => setTitle(e.target.value)}
								required
								className='h-10'
							/>
						</div>

						{/* Job Description */}
						<div className='space-y-2'>
							<Label htmlFor='description' className='text-lg font-semibold'>
								Job Description <span className='text-red-500'>*</span>
							</Label>
							<Textarea
								id='description'
								placeholder='Describe the role, responsibilities, and qualifications...'
								rows={6}
								value={description ?? ""}
								onChange={(e) => setDescription(e.target.value)}
								required
							/>
						</div>

						{/* Requirements/Responsibilities */}
						<div className='space-y-2'>
							<Label htmlFor='requirements' className='text-lg font-semibold'>
								Key Requirements/Responsibilities
							</Label>
							<p className='text-sm text-muted-foreground'>
								Enter each requirement on a new line
							</p>
							<Textarea
								id='requirements'
								placeholder='e.g., Lead development of user-facing features&#10;Collaborate with cross-functional teams&#10;Mentor junior developers'
								rows={5}
								value={requirements.join('\n')}
								onChange={(e) => setRequirements(e.target.value.split('\n').filter(r => r.trim()))}
							/>
						</div>

						{/* Required Skills */}
						<div className='space-y-2'>
							<Label className='text-lg font-semibold'>
								Required Skills <span className='text-red-500'>*</span>
							</Label>
							<SkillsInput value={skills} onChange={setSkills} />
						</div>

						{/* Preferred Skills */}
						<div className='space-y-2'>
							<Label className='text-lg font-semibold'>
								Preferred Skills
							</Label>
							<p className='text-sm text-muted-foreground'>
								Nice-to-have skills that would be a plus
							</p>
							<SkillsInput value={preferredSkills} onChange={setPreferredSkills} />
						</div>

						{/* Experience */}
						<div className='space-y-2'>
							<Label className='text-lg font-semibold'>
								Experience Required <span className='text-red-500'>*</span>
							</Label>
							<p className='text-sm text-muted-foreground'>
								Specify the experience range in years (e.g., 3-5 years)
							</p>
							<div className='grid grid-cols-2 gap-4'>
								<div>
									<Label htmlFor='min-experience' className='text-sm text-muted-foreground'>
										Min Years
									</Label>
									<Input
										id='min-experience'
										type='number'
										min='0'
										max='50'
										placeholder='3'
										value={minExperience ?? ""}
										onChange={(e) => setMinExperience(e.target.value === "" ? "" : Number(e.target.value))}
										required
										className='h-10'
									/>
								</div>
								<div>
									<Label htmlFor='max-experience' className='text-sm text-muted-foreground'>
										Max Years
									</Label>
									<Input
										id='max-experience'
										type='number'
										min='0'
										max='50'
										placeholder='5'
										value={maxExperience ?? ""}
										onChange={(e) => setMaxExperience(e.target.value === "" ? "" : Number(e.target.value))}
										required
										className='h-10'
									/>
								</div>
							</div>
							{minExperience !== "" && maxExperience !== "" && minExperience > maxExperience && (
								<p className='text-sm text-destructive'>
									⚠️ Maximum experience must be greater than or equal to minimum experience
								</p>
							)}
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

						{/* Form Actions */}
						<div className='flex gap-3'>
							<Button type='submit' size='lg' className='flex-1 text-md' disabled={!isFormValid || isCreating}>
								{isCreating ? "Creating Role..." : "Create Role"}
							</Button>
							<Link href='/recruiter'>
								<Button type='button' variant='outline' size='lg' disabled={isCreating}>
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
