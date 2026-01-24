"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Clock,
	FileText,
	AlertCircle,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	ArrowRight,
	Calendar,
	Timer,
	RotateCcw,
	Mail
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface QuizInfo {
	id: string;
	candidateName: string;
	expiresAt: string | null;
	role: {
		title: string;
		description: string | null;
		requiredSkills: string[];
		preferredSkills: string[];
	};
	questionCount: number;
	estimatedTimeMinutes: number;
}

interface QuizResponse {
	success: boolean;
	quiz?: QuizInfo;
	error?: string;
	completed?: boolean;
	submittedAt?: string;
	timedOut?: boolean;
}

export default function QuizLandingPage() {
	const params = useParams();
	const router = useRouter();
	const token = params.token as string;

	const [loading, setLoading] = useState(true);
	const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isCompleted, setIsCompleted] = useState(false);
	const [isTimedOut, setIsTimedOut] = useState(false);
	const [showFullDescription, setShowFullDescription] = useState(false);

	useEffect(() => {
		async function fetchQuizInfo() {
			try {
				const response = await fetch(`/api/quiz/${token}`);
				const data: QuizResponse = await response.json();

				if (!response.ok) {
					if (data.completed) {
						setIsCompleted(true);
						setError("This quiz has already been completed.");
					} else if (data.timedOut) {
						setIsTimedOut(true);
						setError("Quiz has timed out");
					} else {
						setError(data.error || "Failed to load quiz information");
					}
					setLoading(false);
					return;
				}

				if (data.success && data.quiz) {
					setQuizInfo(data.quiz);
				} else {
					setError("Invalid quiz data received");
				}
			} catch (err) {
				console.error("Error fetching quiz:", err);
				setError("Failed to connect to the server. Please try again.");
			} finally {
				setLoading(false);
			}
		}

		if (token) {
			fetchQuizInfo();
		}
	}, [token]);

	const handleStartAssessment = async () => {
		// Request fullscreen before navigating
		try {
			const elem = document.documentElement;

			// Try to enter fullscreen
			if (elem.requestFullscreen) {
				await elem.requestFullscreen();
			} else {
				// Fallback for older browsers
				const elemAny = elem as HTMLElement & {
					webkitRequestFullscreen?: () => Promise<void>;
					msRequestFullscreen?: () => Promise<void>;
				};
				if (elemAny.webkitRequestFullscreen) {
					await elemAny.webkitRequestFullscreen();
				} else if (elemAny.msRequestFullscreen) {
					await elemAny.msRequestFullscreen();
				}
			}
		} catch (error) {
			// Fullscreen request failed - show warning but continue
			console.warn("Failed to enter fullscreen:", error);
			toast.warning("Fullscreen mode unavailable", {
				description: "The quiz will continue without fullscreen. Your activity will still be monitored."
			});
		}

		// Navigate to quiz taking interface regardless of fullscreen success
		router.push(`/quiz/${token}/take`);
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-background'>
				{/* Navbar */}
				<nav className='sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border'>
					<div className='max-w-6xl mx-auto px-6 h-16 flex items-center'>
						<span className='font-pacifico text-2xl text-gradient-primary pb-1'>Screenify</span>
					</div>
				</nav>
				<div className='max-w-3xl mx-auto px-6 py-12 space-y-6'>
					<Skeleton className='h-8 w-3/4' />
					<Skeleton className='h-4 w-1/2' />
					<div className='p-6 rounded-2xl bg-card shadow-soft-md space-y-4'>
						<Skeleton className='h-20 w-full' />
						<Skeleton className='h-20 w-full' />
					</div>
				</div>
			</div>
		);
	}

	if (isTimedOut) {
		return (
			<div className='min-h-screen bg-background relative overflow-hidden'>
				{/* Subtle animated background */}
				<div className='absolute inset-0 overflow-hidden pointer-events-none'>
					<div
						className='absolute top-1/4 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse'
						style={{ animationDuration: "4s" }}
					/>
					<div
						className='absolute bottom-1/4 -right-32 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse'
						style={{ animationDuration: "6s", animationDelay: "2s" }}
					/>
				</div>

				{/* Navbar */}
				<nav className='sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border'>
					<div className='max-w-6xl mx-auto px-6 h-16 flex items-center'>
						<span className='font-pacifico text-2xl text-gradient-primary pb-1'>Screenify</span>
					</div>
				</nav>

				<div className='relative max-w-2xl mx-auto px-6 py-12 space-y-6'>
					{/* Main Status Card */}
					<div className='p-8 rounded-2xl bg-card shadow-soft-lg border border-accent/20 relative overflow-hidden'>
						{/* Decorative corner accent */}
						<div className='absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full' />

						<div className='text-center relative'>
							{/* Animated clock icon */}
							<div className='mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center relative'>
								<div className='absolute inset-2 rounded-full bg-card shadow-inner' />
								<Timer className='h-10 w-10 text-accent relative z-10' />
							</div>

							<h1 className='text-2xl font-bold text-foreground mb-3'>Assessment Time Expired</h1>
							<p className='text-muted-foreground max-w-md mx-auto leading-relaxed'>
								The time allocated for this assessment has passed. Unfortunately, the quiz can no longer be started or
								continued.
							</p>
						</div>
					</div>

					{/* Next Steps Card */}

					<div className='p-4 rounded-xl bg-muted/50 border border-border'>
						<div className='flex items-start gap-3'>
							<Mail className='h-5 w-5 text-accent shrink-0 mt-0.5' />
							<p className='text-sm text-muted-foreground'>
								<span className='font-medium text-foreground'>Need help?</span> Contact the recruiter directly using the
								email address they provided when sending you the assessment link.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || isCompleted) {
		return (
			<div className='min-h-screen bg-background'>
				{/* Navbar */}
				<nav className='sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border'>
					<div className='max-w-6xl mx-auto px-6 h-16 flex items-center'>
						<span className='font-pacifico text-2xl text-gradient-primary pb-1'>Screenify</span>
					</div>
				</nav>
				<div className='max-w-2xl mx-auto px-6 py-12 space-y-6'>
					{/* Status Header Card */}
					<div
						className={`p-8 rounded-2xl bg-card shadow-soft-md border ${
							isCompleted ? "border-success/20" : "border-destructive/20"
						}`}
					>
						<div className='text-center'>
							<div
								className={`mx-auto mb-6 h-20 w-20 rounded-full ${
									isCompleted ? "bg-success/10" : "bg-destructive/10"
								} flex items-center justify-center`}
							>
								{isCompleted ? (
									<CheckCircle className='h-12 w-12 text-success' />
								) : (
									<AlertCircle className='h-12 w-12 text-destructive' />
								)}
							</div>
							<h1 className='text-2xl font-bold text-foreground mb-3'>
								{isCompleted ? "Assessment Already Submitted" : "Unable to Load Assessment"}
							</h1>
							<p className='text-muted-foreground max-w-md mx-auto'>
								{isCompleted
									? "Your responses have been submitted successfully. The recruiter will review your assessment and contact you if you are selected for the next round."
									: error}
							</p>
						</div>
					</div>

					{/* Additional Info Card */}
					<div className='p-6 rounded-2xl bg-card shadow-soft-md'>
						<h2 className='text-lg font-semibold text-foreground mb-6'>
							{isCompleted ? "What Happens Next?" : "What You Can Do"}
						</h2>

						{isCompleted ? (
							<div className='space-y-6'>
								<div className='flex items-start gap-4'>
									<div className='shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold'>
										1
									</div>
									<div>
										<p className='font-medium text-foreground mb-1'>Your responses are being evaluated</p>
										<p className='text-sm text-muted-foreground'>
											Our system is analyzing your answers and calculating your performance metrics.
										</p>
									</div>
								</div>

								<div className='flex items-start gap-4'>
									<div className='shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold'>
										2
									</div>
									<div>
										<p className='font-medium text-foreground mb-1'>Recruiter will review your results</p>
										<p className='text-sm text-muted-foreground'>
											The hiring team will review your assessment along with other candidates.
										</p>
									</div>
								</div>

								<div className='flex items-start gap-4'>
									<div className='shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold'>
										3
									</div>
									<div>
										<p className='font-medium text-foreground mb-1'>You&apos;ll be contacted for next steps</p>
										<p className='text-sm text-muted-foreground'>
											If selected to move forward, you will receive an email or call from the recruiter.
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className='space-y-6'>
								<div className='flex items-start gap-4'>
									<div className='shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold'>
										1
									</div>
									<div>
										<p className='font-medium text-foreground mb-1'>Verify your link</p>
										<p className='text-sm text-muted-foreground'>
											Make sure you&apos;re using the correct assessment link provided by the recruiter.
										</p>
									</div>
								</div>

								<div className='flex items-start gap-4'>
									<div className='shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold'>
										2
									</div>
									<div>
										<p className='font-medium text-foreground mb-1'>Contact the recruiter</p>
										<p className='text-sm text-muted-foreground'>
											If the issue persists, reach out to the recruiter who sent you this assessment link.
										</p>
									</div>
								</div>

								<div className='flex items-start gap-4'>
									<div className='shrink-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold'>
										3
									</div>
									<div>
										<p className='font-medium text-foreground mb-1'>Request a new link</p>
										<p className='text-sm text-muted-foreground'>
											The recruiter may be able to generate a new assessment link for you if needed.
										</p>
									</div>
								</div>
							</div>
						)}

						<div className='mt-6 p-4 rounded-xl bg-muted/50 border border-border'>
							<div className='flex items-start gap-3'>
								<AlertCircle className='h-5 w-5 text-accent shrink-0 mt-0.5' />
								<p className='text-sm text-muted-foreground'>
									{isCompleted
										? "You can safely close this page. No further action is required from your end."
										: "If you believe this is an error, please contact the recruiter directly for assistance."}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!quizInfo) {
		return (
			<div className='min-h-screen bg-background'>
				{/* Navbar */}
				<nav className='sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border'>
					<div className='max-w-6xl mx-auto px-6 h-16 flex items-center'>
						<span className='font-pacifico text-2xl text-gradient-primary pb-1'>Screenify</span>
					</div>
				</nav>
				<div className='max-w-6xl mx-auto px-6 py-12 flex justify-center'>
					<div className='w-full max-w-md p-8 rounded-2xl bg-card shadow-soft-md text-center'>
						<div className='mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6'>
							<AlertCircle className='h-8 w-8 text-destructive' />
						</div>
						<h1 className='text-2xl font-semibold text-primary mb-3'>Unable to Load Quiz</h1>
						<p className='text-muted-foreground'>
							Quiz information could not be loaded. Please check your link or try again later.
						</p>
					</div>
				</div>
			</div>
		);
	}

	const truncateDescription = (text: string, maxLength: number = 150) => {
		if (text.length <= maxLength) return text;
		return text.slice(0, maxLength) + "...";
	};

	return (
		<div className='min-h-screen bg-background'>
			{/* Navbar */}
			<nav className='sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border'>
				<div className='max-w-6xl mx-auto px-6 h-16 flex items-center'>
					<span className='font-pacifico text-2xl text-gradient-primary pb-1'>Screenify</span>
				</div>
			</nav>

			<div className='max-w-3xl mx-auto px-6 py-12 space-y-6'>
				{/* Header */}
				<div>
					<h1 className='text-2xl font-bold text-foreground'>Assessment for {quizInfo.role.title}</h1>
					<p className='text-muted-foreground mt-1'>Welcome, {quizInfo.candidateName}</p>
				</div>

				{/* Assessment Overview Card */}
				<div className='p-6 rounded-2xl bg-card shadow-soft-md'>
					<div className='grid grid-cols-2 gap-6 mb-6'>
						<div className='flex items-center gap-4'>
							<div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center'>
								<FileText className='h-6 w-6 text-primary' />
							</div>
							<div>
								<p className='text-sm text-muted-foreground'>Questions</p>
								<p className='text-2xl font-bold text-foreground'>{quizInfo.questionCount}</p>
							</div>
						</div>
						<div className='flex items-center gap-4'>
							<div className='h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center'>
								<Clock className='h-6 w-6 text-accent' />
							</div>
							<div>
								<p className='text-sm text-muted-foreground'>Duration</p>
								<p className='text-2xl font-bold text-foreground'>{quizInfo.estimatedTimeMinutes} mins</p>
							</div>
						</div>
					</div>

					{/* Expiry Notice */}
					{quizInfo.expiresAt && (
						<div className='flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border mb-6'>
							<Calendar className='h-5 w-5 text-muted-foreground shrink-0' />
							<p className='text-sm text-muted-foreground'>
								This link expires on{" "}
								<span className='font-medium text-foreground'>
									{format(new Date(quizInfo.expiresAt), "MMM d, yyyy 'at' h:mm a")}
								</span>
							</p>
						</div>
					)}

					{/* Role Description - Collapsible */}
					{quizInfo.role.description && (
						<div className='mb-6'>
							<button onClick={() => setShowFullDescription(!showFullDescription)} className='w-full text-left'>
								<div className='flex items-center justify-between mb-2'>
									<h3 className='text-sm font-semibold text-foreground'>About the Role</h3>
									{quizInfo.role.description.length > 150 && (
										<div className='flex items-center gap-1 text-sm text-accent'>
											<span>{showFullDescription ? "Show less" : "Read more"}</span>
											{showFullDescription ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
										</div>
									)}
								</div>
							</button>
							<p className='text-sm text-muted-foreground leading-relaxed'>
								{showFullDescription ? quizInfo.role.description : truncateDescription(quizInfo.role.description)}
							</p>
						</div>
					)}

					{/* Skills */}
					{(quizInfo.role.requiredSkills.length > 0 || quizInfo.role.preferredSkills.length > 0) && (
						<div className='flex flex-wrap gap-2'>
							{quizInfo.role.requiredSkills.slice(0, 8).map((skill, index) => (
								<span key={index} className='px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium'>
									{skill}
								</span>
							))}
							{quizInfo.role.preferredSkills.slice(0, 4).map((skill, index) => (
								<span key={index} className='px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm'>
									{skill}
								</span>
							))}
							{quizInfo.role.requiredSkills.length + quizInfo.role.preferredSkills.length > 12 && (
								<span className='px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm'>
									+{quizInfo.role.requiredSkills.length + quizInfo.role.preferredSkills.length - 12} more
								</span>
							)}
						</div>
					)}
				</div>

				{/* Instructions Card */}
				<div className='p-6 rounded-2xl bg-card shadow-soft-md'>
					<h2 className='text-lg font-semibold text-foreground mb-4'>Before You Start</h2>

					<ul className='space-y-4 mb-6'>
						<li className='flex items-start gap-3'>
							<div className='shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold'>
								1
							</div>
							<span className='text-muted-foreground pt-0.5'>
								Complete all {quizInfo.questionCount} questions within {quizInfo.estimatedTimeMinutes} minutes
							</span>
						</li>
						<li className='flex items-start gap-3'>
							<div className='shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold'>
								2
							</div>
							<span className='text-muted-foreground pt-0.5'>
								Quiz will run in fullscreen mode. Exiting may be flagged
							</span>
						</li>
						<li className='flex items-start gap-3'>
							<div className='shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold'>
								3
							</div>
							<span className='text-muted-foreground pt-0.5'>
								You have only one attempt - cannot retake once submitted
							</span>
						</li>
					</ul>

					<div className='p-4 rounded-xl bg-muted/50 border border-border mb-6'>
						<div className='flex items-start gap-3'>
							<AlertCircle className='h-5 w-5 text-accent shrink-0 mt-0.5' />
							<p className='text-sm text-muted-foreground'>
								Ensure you have a stable internet connection and are in a quiet environment before starting.
							</p>
						</div>
					</div>

					<Button
						onClick={handleStartAssessment}
						size='lg'
						className='w-full h-12 text-base font-medium shadow-soft-md hover:shadow-soft-lg transition-shadow cursor-pointer'
					>
						Start Assessment
						<ArrowRight className='ml-2 h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	);
}
