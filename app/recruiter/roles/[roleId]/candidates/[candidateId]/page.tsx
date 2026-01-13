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

type VerificationStatus = "VERIFIED" | "QUESTIONABLE" | "DISCREPANCY" | null;
type QuizStatus = "IN_PROGRESS" | "SUBMITTED" | "EVALUATED" | "EXPIRED" | "ENDED";
type CandidateStatus = "PENDING" | "SHORTLISTED" | "REJECTED";

interface QuestionDetail {
	questionId: string;
	question: string;
	options: string[];
	correctAnswer: string;
	candidateAnswer: string | null;
	isCorrect: boolean;
	timeTaken: number;
	skill?: string;
}

type VerificationDetail = QuestionDetail;

interface ProctoringEvent {
	type: string;
	timestamp: string;
	details?: string;
}

interface AnomalyIndicator {
	type: string;
	severity: string;
	details: string;
}

interface QuizResult {
	standardScore: number;
	standardCorrect: number;
	standardTotal: number;
	verificationStatus: VerificationStatus;
	verificationCorrect: number;
	verificationTotal: number;
	skillBreakdown: Record<string, number> | null;
	confidenceScore: number;
	anomalyIndicators: AnomalyIndicator[];
	status: QuizStatus;
	startedAt: string;
	submittedAt: string;
	timeTakenSeconds: number;
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
	completed: boolean;
	createdAt: string;
	result: QuizResult | null;
	standardDetails: QuestionDetail[];
	verificationDetails: VerificationDetail[];
	proctoringEvents: {
		tabSwitches: number;
		fullscreenExits: number;
		events: ProctoringEvent[];
	};
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
			alert("Failed to update candidate status. Please try again.");
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
				<div className='flex gap-2'>
					<Button
						variant={quiz.candidateStatus === "SHORTLISTED" ? "default" : "outline"}
						disabled={updatingStatus || quiz.candidateStatus === "SHORTLISTED"}
						onClick={() => updateCandidateStatus("SHORTLISTED")}
						className="border-green-600! text-green-600 hover:bg-transparent! hover:text-green-600!"
					>
						{quiz.candidateStatus === "SHORTLISTED" ? "✓ Shortlisted" : "Shortlist"}
					</Button>
					<Button
						variant={quiz.candidateStatus === "REJECTED" ? "destructive" : "outline"}
						disabled={updatingStatus || quiz.candidateStatus === "REJECTED"}
						onClick={() => updateCandidateStatus("REJECTED")}
						className="border-red-600! text-red-600 hover:bg-transparent! hover:text-red-600!"
					>
						{quiz.candidateStatus === "REJECTED" ? "✗ Rejected" : "Reject"}
					</Button>
				</div>
			</div>

			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Left Column - Main Content */}
				<div className='lg:col-span-2 space-y-6'>
					{/* Assessment Summary */}
					<Card>
						<CardHeader>
							<CardTitle>Assessment Summary</CardTitle>
							<CardDescription>
								{hasResult ? "Quiz performance breakdown" : "Assessment not yet completed"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{hasResult && result ? (
								<div className='space-y-6'>
									<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
										<div className='text-center p-4 bg-muted/50 rounded-lg'>
											<p className='text-3xl font-bold text-primary'>{result.standardScore.toFixed(1)}%</p>
											<p className='text-sm text-muted-foreground mt-1'>Ranking Score</p>
										</div>
										<div className='text-center p-4 bg-muted/50 rounded-lg'>
											<p className='text-3xl font-bold'>
												{result.standardCorrect}/{result.standardTotal}
											</p>
											<p className='text-sm text-muted-foreground mt-1'>Standard Q&apos;s</p>
										</div>
										<div className='text-center p-4 bg-muted/50 rounded-lg'>
											<p className='text-3xl font-bold'>
												{result.verificationCorrect}/{result.verificationTotal}
											</p>
											<p className='text-sm text-muted-foreground mt-1'>Verification Q&apos;s</p>
										</div>
									</div>
									<div className='text-center p-4 bg-muted/50 rounded-lg'>
										<p className='text-2xl font-bold'>
											{formatTime(result.timeTakenSeconds)} <span className='text-gray-500'>out of</span> {quiz.duration} minutes
										</p>
										<p className='text-sm text-muted-foreground mt-1'>Time Taken & Duration</p>
									</div>

									{result.skillBreakdown && Object.keys(result.skillBreakdown).length > 0 && (
										<>
											<Separator />
											<div>
												<p className='text-sm font-medium mb-3'>Skill Breakdown</p>
												<div className='space-y-3'>
													{Object.entries(result.skillBreakdown).map(([skill, score]) => (
														<div key={skill}>
															<div className='flex justify-between text-sm mb-1'>
																<span className='font-medium'>{skill}</span>
																<span className='text-muted-foreground'>{score.toFixed(0)}%</span>
															</div>
															<div className='h-2 bg-muted rounded-full overflow-hidden'>
																<div
																	className='h-full bg-primary rounded-full transition-all'
																	style={{ width: `${score}%` }}
																/>
															</div>
														</div>
													))}
												</div>
											</div>
										</>
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
									{quiz.standardDetails.map((detail, index) => (
										<div key={detail.questionId} className='p-4 rounded-lg border bg-card'>
											<div className='flex items-start gap-3 mb-3'>
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
															const isCorrect = option === detail.correctAnswer;
															const isSelected = option === detail.candidateAnswer;
															const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
															return (
																<div
																	key={optIndex}
																	className={`p-3 rounded border ${
																		isCorrect
																			? "bg-green-50/50 dark:bg-green-950/10 border-green-400/50"
																			: isSelected && !isCorrect
																			? "bg-red-50/50 dark:bg-red-950/10 border-red-400/50"
																			: "bg-muted/30 border-muted"
																	}`}
																>
																	<div className='flex items-center gap-3 text-sm'>
																		<span className='font-semibold text-muted-foreground shrink-0'>{optionLabel}.</span>
																		<span
																			className={
																				isCorrect
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
									))}
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
									{quiz.verificationDetails.map((detail, index) => (
										<div key={detail.questionId} className='p-4 rounded-lg border bg-card'>
											<div className='flex items-start gap-3 mb-3'>
												{detail.isCorrect ? (
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
															const isCorrect = option === detail.correctAnswer;
															const isSelected = option === detail.candidateAnswer;
															const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D
															return (
																<div
																	key={optIndex}
																	className={`p-3 rounded border ${
																		isCorrect
																			? "bg-green-50/50 dark:bg-green-950/10 border-green-400/50"
																			: isSelected && !isCorrect
																			? "bg-red-50/50 dark:bg-red-950/10 border-red-400/50"
																			: "bg-muted/30 border-muted"
																	}`}
																>
																	<div className='flex items-center gap-3 text-sm'>
																		<span className='font-semibold text-muted-foreground shrink-0'>{optionLabel}.</span>
																		<span
																			className={
																				isCorrect
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
									))}
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

					{/* Confidence Score */}
					<Card>
						<CardHeader>
							<CardTitle>Confidence Score</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-center'>
								{hasResult && result ? (
									<>
										<p className='text-5xl font-bold text-primary mb-2'>{result.confidenceScore.toFixed(0)}%</p>
										<p className='text-sm text-muted-foreground'>Based on proctoring events</p>
									</>
								) : (
									<>
										<p className='text-5xl font-bold text-muted-foreground'>-</p>
										<p className='text-sm text-muted-foreground mt-2'>Not yet evaluated</p>
									</>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Proctoring Events */}
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
										<span className='text-sm text-muted-foreground'>Tab Switches</span>
										<span className='font-semibold text-lg'>{quiz.proctoringEvents.tabSwitches}</span>
									</div>
									<div className='flex justify-between items-center'>
										<span className='text-sm text-muted-foreground'>Fullscreen Exits</span>
										<span className='font-semibold text-lg'>{quiz.proctoringEvents.fullscreenExits}</span>
									</div>

									{quiz.proctoringEvents.events.length > 0 && (
										<>
											<Separator className='my-3' />
											<div>
												<p className='text-sm font-medium mb-2'>Event Log</p>
												<div className='space-y-2 max-h-48 overflow-y-auto'>
													{quiz.proctoringEvents.events.map((event, idx) => (
														<div key={idx} className='text-xs p-2 bg-muted/50 rounded border'>
															<div className='flex justify-between items-start gap-2'>
																<span className='font-medium'>{event.type}</span>
																<span className='text-muted-foreground'>
																	{new Date(event.timestamp).toLocaleTimeString()}
																</span>
															</div>
															{event.details && <p className='text-muted-foreground mt-1'>{event.details}</p>}
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

					{/* Quiz Info */}
					<Card>
						<CardHeader>
							<CardTitle>Quiz Information</CardTitle>
						</CardHeader>
						<CardContent className='space-y-3 text-sm'>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Total Questions</span>
								<span className='font-semibold'>{quiz.totalQuestions}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Standard Questions</span>
								<span className='font-semibold'>{quiz.standardQuestionsCount}</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Verification Questions</span>
								<span className='font-semibold'>{quiz.verificationQuestionsCount}</span>
							</div>
							<Separator />
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Duration</span>
								<span className='font-semibold'>{quiz.duration} minutes</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>Status</span>
								<Badge variant={quiz.completed ? "default" : "secondary"}>
									{quiz.completed ? "Completed" : "Pending"}
								</Badge>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
