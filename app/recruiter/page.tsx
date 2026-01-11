import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, Clock } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RecruiterDashboard() {
	// Fetch all roles with their quizzes
	const roles = await prisma.jobRole.findMany({
		include: {
			quizzes: {
				include: {
					result: true
				}
			}
		},
		orderBy: {
			createdAt: "desc"
		}
	});

	// Calculate statistics
	const totalRoles = roles.length;
	const totalCandidates = roles.reduce((sum, role) => sum + role.quizzes.length, 0);
	const pendingReviews = roles.reduce(
		(sum, role) => sum + role.quizzes.filter((q) => q.completed && !q.result?.standardScore).length,
		0
	);

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>Dashboard</h1>
					<p className='text-muted-foreground mt-2'>Manage your job roles and candidates</p>
				</div>
				<Link href='/recruiter/roles/new'>
					<Button size='lg' className='cursor-pointer'>
						Add Job Role
					</Button>
				</Link>
			</div>

			<div className='grid gap-6 md:grid-cols-3'>
				<Card>
					<CardHeader>
						<CardTitle>Total Roles</CardTitle>
						<CardDescription>Active job openings</CardDescription>
					</CardHeader>
					<CardContent>
						<p className='text-4xl font-bold text-primary'>{totalRoles}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Total Candidates</CardTitle>
						<CardDescription>Across all roles</CardDescription>
					</CardHeader>
					<CardContent>
						<p className='text-4xl font-bold text-primary'>{totalCandidates}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Pending Reviews</CardTitle>
						<CardDescription>Awaiting evaluation</CardDescription>
					</CardHeader>
					<CardContent>
						<p className='text-4xl font-bold text-primary'>{pendingReviews}</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className='text-2xl'>Recent Roles</CardTitle>
					<CardDescription>Your recently created job roles</CardDescription>
				</CardHeader>
				<CardContent>
					{roles.length === 0 ? (
						<div className='text-center py-8 text-muted-foreground'>
							<p>No roles created yet</p>
							<p className='text-sm mt-2'>Create your first role to get started</p>
						</div>
					) : (
						<div className='space-y-4'>
							{roles.map((role) => {
								const jdData = role.jd as {
									required_skills?: string[];
									preferred_skills?: string[];
									experience?: { min_years?: number; max_years?: number };
								};
								const allSkills = [...(jdData.required_skills || []), ...(jdData.preferred_skills || [])];
								const candidateCount = role.quizzes.length;
								const completedCount = role.quizzes.filter((q) => q.completed).length;

								return (
									<Link key={role.id} href={`/recruiter/roles/${role.id}`}>
										<Card className='hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary'>
											<CardContent className='pt-1'>
												<div className='flex-1 space-y-3'>
													<div>
														<h3 className='text-xl font-semibold text-foreground flex items-center gap-2'>
															<Briefcase className='w-5 h-5 text-primary' />
															{role.title}
														</h3>
														{role.description && (
															<p className='text-sm text-muted-foreground mt-1 line-clamp-2'>{role.description}</p>
														)}
													</div>

													{allSkills.length > 0 && (
														<div className='flex gap-2 flex-wrap'>
															{allSkills.slice(0, 5).map((skill, idx) => (
																<Badge key={idx} variant='secondary' className='text-xs'>
																	{skill}
																</Badge>
															))}
															{allSkills.length > 5 && (
																<Badge variant='outline' className='text-xs'>
																	+{allSkills.length - 5} more
																</Badge>
															)}
														</div>
													)}

													<div className='flex gap-4 text-sm text-muted-foreground'>
														<div className='flex items-center gap-1'>
															<Users className='w-4 h-4' />
															<span>
																{candidateCount} candidate{candidateCount !== 1 ? "s" : ""}
															</span>
														</div>
														<div className='flex items-center gap-1'>
															<Clock className='w-4 h-4' />
															<span>{completedCount} completed</span>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									</Link>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
