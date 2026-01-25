"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, AlertTriangle, ArrowLeft, Monitor, Eye, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

type VerificationStatus = "VERIFIED" | "QUESTIONABLE" | "DISCREPANCY" | null;
type QuizStatus = "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "TERMINATED" | "EXPIRED";
type CandidateStatus = "PENDING" | "SHORTLISTED" | "REJECTED";

interface QuestionDetail {
	questionId: string;
	question: string;
	options: string[];
	correctAnswer: number | null;
	candidateAnswer: number | null;
	timeTaken: number;
	skill?: string;
}

type VerificationDetail = QuestionDetail;

interface ProctoringEvent {
	type: string;
	timestamp: string;
	details?: string;
}

interface QuizResult {
	standardScore: number | null;
	standardCorrect: number;
	standardTotal: number;
	verificationStatus: VerificationStatus;
	verificationCorrect: number;
	verificationTotal: number;
	proctoringVerdict: "CLEAN" | "SUSPICIOUS" | "CHEATING";
	proctoringViolationCount: number;
	timeTakenSeconds: number | null;
}

interface QuizDetails {
	id: string;
	candidateName: string;
	candidateEmail: string;
	candidateStatus: CandidateStatus;
	role: {
		id: string;
		title: string;
		description: string;
	};
	duration: number;
	status: QuizStatus;
	createdAt: string;
	startedAt: string | null;
	endedAt: string | null;
	result: QuizResult | null;
	standardDetails: QuestionDetail[];
	verificationDetails: VerificationDetail[];
	proctoringEvents: ProctoringEvent[];
	totalQuestions: number;
	standardQuestionsCount: number;
	verificationQuestionsCount: number;
}

export default function CandidateDetailPage() {
	const params = useParams();
	const router = useRouter();
	const roleId = params.roleId as string;
	const candidateId = params.candidateId as string;

	const [quiz, setQuiz] = useState<QuizDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [updatingStatus, setUpdatingStatus] = useState(false);

	useEffect(() => {
		fetchQuizDetails();
	}, [candidateId]);

	const fetchQuizDetails = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(`/api/recruiter/quiz/${candidateId}`);
			if (!response.ok) {
				throw new Error("Failed to fetch quiz details");
			}
			const data: QuizDetails = await response.json();
			setQuiz(data);
			console.log(data);
		} catch (err) {
			setError("Failed to load candidate details");
			console.error("Error fetching quiz details:", err);
		} finally {
			setLoading(false);
		}
	};

	const updateCandidateStatus = async (status: CandidateStatus) => {
		if (!quiz) return;

		setUpdatingStatus(true);
		try {
			const response = await fetch(`/api/recruiter/quiz/${candidateId}/status`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ status })
			});

			if (!response.ok) {
				throw new Error("Failed to update candidate status");
			}

			const data = await response.json();
			setQuiz({ ...quiz, candidateStatus: data.candidateStatus });
		} catch (err) {
			console.error("Error updating candidate status:", err);
			toast.error("Failed to update candidate status", {
				description: "Please try again",
			});
		} finally {
			setUpdatingStatus(false);
		}
	};

	const getVerificationBadge = (status: VerificationStatus) => {
		if (!status)
			return (
				<Badge variant='secondary' className='text-sm'>
					Pending
				</Badge>
			);

		const variants = {
			VERIFIED: {
				variant: "default" as const,
				text: "✓ Verified",
				className: "bg-green-600 hover:bg-green-700 text-white"
			},
			QUESTIONABLE: {
				variant: "secondary" as const,
				text: "⚠ Questionable",
				className: "bg-yellow-600 hover:bg-yellow-700 text-white"
			},
			DISCREPANCY: {
				variant: "destructive" as const,
				text: "✗ Discrepancy",
				className: ""
			}
		};

		const config = variants[status];
		return (
			<Badge variant={config.variant} className={`text-sm ${config.className}`}>
				{config.text}
			</Badge>
		);
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}m ${secs}s`;
	};

	if (loading) {
		return (
			<div className='space-y-8'>
				<div className='flex flex-col items-center justify-center min-h-[60vh] space-y-4'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
					<p className='text-base font-medium text-foreground'>Loading candidate details...</p>
				</div>
			</div>
		);
	}

	if (error || !quiz) {
		return (
			<div className='space-y-8'>
				<Card>
					<CardContent className='pt-6'>
						<div className='text-center py-12'>
							<AlertTriangle className='w-12 h-12 text-destructive mx-auto mb-4' />
							<p className='text-lg font-semibold mb-2'>Error Loading Details</p>
							<p className='text-muted-foreground mb-4'>{error || "Candidate not found"}</p>
							<Button onClick={() => router.push(`/recruiter/roles/${roleId}`)}>Back to Role</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	const hasResult = quiz.result !== null;
	const result = quiz.result;

	return (
		<div className='space-y-8'>
			{/* Header */}
			<div className='flex items-center justify-between flex-wrap gap-4'>
				<div className='flex items-center gap-4'>
					<Link href={`/recruiter/roles/${roleId}`}>
						<Button variant='ghost' size='icon' className='h-10 w-10 rounded-xl hover:bg-muted'>
							<ArrowLeft className='h-5 w-5' />
						</Button>
					</Link>
					<div>
						<h1 className='text-3xl font-bold text-foreground'>{quiz.candidateName}</h1>
					</div>
				</div>
				{/* Decision Buttons - Unified Toggle Group */}
				<div className='inline-flex items-center rounded-xl border border-border/60 bg-muted/30 p-1 gap-1'>
					<Button
						variant="ghost"
						disabled={updatingStatus}
						onClick={() => updateCandidateStatus("SHORTLISTED")}
						className={`
							h-9 px-4 rounded-lg
							font-medium text-sm
							transition-all duration-200
							${quiz.candidateStatus === "SHORTLISTED"
								? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
								: 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50'
							}
							disabled:opacity-50 disabled:cursor-not-allowed
						`}
					>
						<span className="inline-flex items-center gap-1.5">
							<svg
								className={`w-4 h-4 transition-transform duration-200 ${quiz.candidateStatus === "SHORTLISTED" ? 'scale-100' : 'scale-90'}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
							</svg>
							Shortlist
						</span>
					</Button>

					<Button
						variant="ghost"
						disabled={updatingStatus}
						onClick={() => updateCandidateStatus("REJECTED")}
						className={`
							h-9 px-4 rounded-lg
							font-medium text-sm
							transition-all duration-200
							${quiz.candidateStatus === "REJECTED"
								? 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
								: 'text-muted-foreground hover:text-red-600 hover:bg-red-50'
							}
							disabled:opacity-50 disabled:cursor-not-allowed
						`}
					>
						<span className="inline-flex items-center gap-1.5">
							<svg
								className={`w-4 h-4 transition-transform duration-200 ${quiz.candidateStatus === "REJECTED" ? 'scale-100' : 'scale-90'}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
							</svg>
							Reject
						</span>
					</Button>
				</div>
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Left Column - Main Content */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Assessment Summary */}
					<Card className="overflow-hidden">
						<CardHeader className="pb-4">
							<div className="flex items-start justify-between gap-4">
								<div>
									<CardTitle>Assessment Summary</CardTitle>
									<CardDescription className="mt-1">
										{hasResult ? "Quiz performance breakdown" : "Assessment not yet completed"}
									</CardDescription>
								</div>
								<Badge
									variant={quiz.status === "SUBMITTED" || quiz.status === "TERMINATED" ? "default" : "secondary"}
									className={`shrink-0 px-4 py-1.5 text-sm font-semibold rounded-lg shadow-sm ${
										quiz.status === "SUBMITTED" || quiz.status === "TERMINATED"
											? "bg-emerald-600 hover:bg-emerald-700 text-white"
											: quiz.status === "IN_PROGRESS"
											? "bg-amber-500 hover:bg-amber-600 text-white"
											: quiz.status === "EXPIRED"
											? "bg-slate-500 hover:bg-slate-600 text-white"
											: ""
									}`}
								>
									{quiz.status === "SUBMITTED" || quiz.status === "TERMINATED"
										? "Completed"
										: quiz.status === "IN_PROGRESS"
										? "In Progress"
										: quiz.status === "EXPIRED"
										? "Expired"
										: "Pending"}
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							{hasResult && result && result.standardScore !== null ? (
								<div className='space-y-4'>
									<div className='grid grid-cols-3 gap-3'>
										<div className='text-center p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10'>
											<p className='text-3xl font-bold text-primary tracking-tight'>{result.standardScore.toFixed(1)}%</p>
											<p className='text-xs text-muted-foreground mt-1.5 font-medium'>Ranking Score</p>
										</div>
										<div className='text-center p-4 bg-muted/40 rounded-xl border border-border/50'>
											<p className='text-3xl font-bold tracking-tight'>
												{result.standardCorrect}<span className="text-muted-foreground/60">/{result.standardTotal}</span>
											</p>
											<p className='text-xs text-muted-foreground mt-1.5 font-medium'>Standard Q&apos;s</p>
										</div>
										<div className='text-center p-4 bg-muted/40 rounded-xl border border-border/50'>
											<p className='text-3xl font-bold tracking-tight'>
												{result.verificationCorrect}<span className="text-muted-foreground/60">/{result.verificationTotal}</span>
											</p>
											<p className='text-xs text-muted-foreground mt-1.5 font-medium'>Verification Q&apos;s</p>
										</div>
									</div>
									{result.timeTakenSeconds !== null && (
										<div className='flex items-center justify-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/30'>
											<Clock className="w-5 h-5 text-muted-foreground" />
											<p className='text-lg font-semibold'>
												{formatTime(result.timeTakenSeconds)}
												<span className='text-muted-foreground font-normal mx-2'>of</span>
												{Math.round(quiz.duration / 60)} min
											</p>
										</div>
									)}
								</div>
							) : (
								<div className='text-center py-8 text-muted-foreground'>
									<Clock className='w-12 h-12 mx-auto mb-4 opacity-50' />
									<p>Assessment not yet completed</p>
									<p className='text-sm mt-2'>
										Quiz was created {formatDistanceToNow(new Date(quiz.createdAt), { addSuffix: true })}
									</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Standard Questions */}
					{hasResult && quiz.standardDetails.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Standard Questions</CardTitle>
								<CardDescription>
									Technical assessment questions ({quiz.standardDetails.length} questions)
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{quiz.standardDetails.map((detail, index) => {
										const isUnattempted = detail.candidateAnswer === null;
										const isAnswerCorrect = !isUnattempted && detail.candidateAnswer === detail.correctAnswer;
										return (
											<div key={detail.questionId} className='p-4 rounded-lg border bg-card'>
												<div className='flex items-start gap-3 mb-3'>
													{isUnattempted ? (
														<Clock className='w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5' />
													) : isAnswerCorrect ? (
														<CheckCircle2 className='w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5' />
													) : (
														<XCircle className='w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
													)}
													<div className='flex-1 min-w-0'>
														<div className='flex items-start justify-between gap-2 mb-3'>
															<p className='font-medium'>
																{index + 1}. {detail.question}
															</p>
															{detail.skill && (
																<Badge variant='secondary' className='shrink-0'>
																	{detail.skill}
																</Badge>
															)}
														</div>
														<div className='space-y-2'>
															{detail.options.map((option, optIndex) => {
																const isCorrectOption = optIndex === detail.correctAnswer;
																const isSelected = optIndex === detail.candidateAnswer;
																const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
																return (
																	<div
																		key={optIndex}
																		className={`p-3 rounded border ${
																			isCorrectOption
																				? "bg-green-50/50 dark:bg-green-950/10 border-green-400/50"
																				: isSelected && !isCorrectOption
																				? "bg-red-50/50 dark:bg-red-950/10 border-red-400/50"
																				: "bg-muted/30 border-muted"
																		}`}
																	>
																		<div className='flex items-center gap-3 text-sm'>
																			<span className='font-semibold text-muted-foreground shrink-0'>{optionLabel}.</span>
																			<span
																				className={
																					isCorrectOption
																						? "font-semibold text-green-700 dark:text-green-500"
																						: isSelected
																						? "font-medium text-red-700 dark:text-red-500"
																						: "text-muted-foreground"
																				}
																			>
																				{option}
																			</span>
																		</div>
																	</div>
																);
															})}
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Verification Details */}
					{hasResult && quiz.verificationDetails.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Verification Questions</CardTitle>
								<CardDescription>
									Resume verification questions ({quiz.verificationDetails.length} questions)
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{quiz.verificationDetails.map((detail, index) => {
										const isUnattempted = detail.candidateAnswer === null;
										const isAnswerCorrect = !isUnattempted && detail.candidateAnswer === detail.correctAnswer;
										return (
											<div key={detail.questionId} className='p-4 rounded-lg border bg-card'>
												<div className='flex items-start gap-3 mb-3'>
													{isUnattempted ? (
														<Clock className='w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5' />
													) : isAnswerCorrect ? (
														<CheckCircle2 className='w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5' />
													) : (
														<XCircle className='w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
													)}
													<div className='flex-1 min-w-0'>
														<p className='font-medium mb-3'>
															{index + 1}. {detail.question}
														</p>
														<div className='space-y-2'>
															{detail.options.map((option, optIndex) => {
																const isCorrectOption = optIndex === detail.correctAnswer;
																const isSelected = optIndex === detail.candidateAnswer;
																const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
																return (
																	<div
																		key={optIndex}
																		className={`p-3 rounded border ${
																			isCorrectOption
																				? "bg-green-50/50 dark:bg-green-950/10 border-green-400/50"
																				: isSelected && !isCorrectOption
																				? "bg-red-50/50 dark:bg-red-950/10 border-red-400/50"
																				: "bg-muted/30 border-muted"
																		}`}
																	>
																		<div className='flex items-center gap-3 text-sm'>
																			<span className='font-semibold text-muted-foreground shrink-0'>{optionLabel}.</span>
																			<span
																				className={
																					isCorrectOption
																						? "font-semibold text-green-700 dark:text-green-500"
																						: isSelected
																						? "font-medium text-red-700 dark:text-red-500"
																						: "text-muted-foreground"
																				}
																			>
																				{option}
																			</span>
																		</div>
																	</div>
																);
															})}
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column - Sidebar */}
				<div className='space-y-6'>
					{/* Verification Status */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Eye className='w-5 h-5' />
								Verification Status
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-center'>
								{hasResult && result ? (
									<>
										<div className='mb-4'>{getVerificationBadge(result.verificationStatus)}</div>
										<p className='text-sm text-muted-foreground'>
											{result.verificationCorrect} out of {result.verificationTotal} verification questions answered
											correctly
										</p>
									</>
								) : (
									<p className='text-muted-foreground'>Pending assessment</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Proctoring Flags */}
					<Card>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<Monitor className='w-5 h-5' />
								Proctoring Flags
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-3'>
							{hasResult && result ? (
								<>
									<div className='flex justify-between items-center'>
										<span className='text-sm text-muted-foreground'>Verdict</span>
										<Badge variant={
											result.proctoringVerdict === "CLEAN" ? "secondary" :
											result.proctoringVerdict === "SUSPICIOUS" ? "outline" : "destructive"
										}>
											{result.proctoringVerdict}
										</Badge>
									</div>
									<div className='flex justify-between items-center'>
										<span className='text-sm text-muted-foreground'>Total Violations</span>
										<span className='font-semibold text-lg'>{result.proctoringViolationCount}</span>
									</div>

									{quiz.proctoringEvents.length > 0 && (
										<>
											<Separator className='my-3' />
											<div>
												<p className='text-sm font-medium mb-2'>Event Log</p>
												<div className='space-y-2 max-h-48 overflow-y-auto'>
													{quiz.proctoringEvents.map((event, idx) => (
														<div key={idx} className='text-xs p-2 bg-muted/50 rounded border'>
															<div className='flex justify-between items-start gap-2'>
																<span className='font-medium'>{event.type}</span>
																<span className='text-muted-foreground'>
																	{new Date(event.timestamp).toLocaleTimeString()}
																</span>
															</div>
														</div>
													))}
												</div>
											</div>
										</>
									)}
								</>
							) : (
								<div className='text-center py-4 text-muted-foreground text-sm'>No proctoring data available</div>
							)}
						</CardContent>
					</Card>

				</div>
			</div>
		</div>
	);
}
