"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from "@/components/ui/table";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type VerificationStatus = "VERIFIED" | "QUESTIONABLE" | "DISCREPANCY" | null;
type QuizStatus = "IN_PROGRESS" | "SUBMITTED" | "EVALUATED" | "EXPIRED" | "ENDED";

interface Candidate {
	id: string;
	name: string;
	email: string;
	role: {
		id: string;
		title: string;
	};
	standardScore: number | null;
	verificationStatus: VerificationStatus;
	confidenceScore: number | null;
	status: QuizStatus;
	submittedAt: string | null;
	createdAt: string;
}

interface CandidatesResponse {
	candidates: Candidate[];
	total: number;
}

export default function CandidatesPage() {
	const [candidates, setCandidates] = useState<Candidate[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	// Filters
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [verificationFilter, setVerificationFilter] = useState("ALL");
	const [minScore, setMinScore] = useState("");
	const [maxScore, setMaxScore] = useState("");

	// Sorting
	const [sortBy, setSortBy] = useState<"standardScore" | "submittedAt" | "candidateName">("standardScore");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const fetchCandidates = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				sortBy,
				sortOrder,
				...(statusFilter !== "ALL" && { status: statusFilter }),
				...(verificationFilter !== "ALL" && { verificationStatus: verificationFilter }),
				...(minScore && { minScore }),
				...(maxScore && { maxScore })
			});

			const response = await fetch(`/api/recruiter/candidates?${params.toString()}`);
			if (!response.ok) throw new Error("Failed to fetch candidates");

			const data: CandidatesResponse = await response.json();
			setCandidates(data.candidates);
		} catch (error) {
			console.error("Error fetching candidates:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCandidates();
	}, [statusFilter, verificationFilter, minScore, maxScore, sortBy, sortOrder]);

	const handleSort = (field: "standardScore" | "submittedAt" | "candidateName") => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("desc");
		}
	};

	const getSortIcon = (field: "standardScore" | "submittedAt" | "candidateName") => {
		if (sortBy !== field) return <ArrowUpDown className="w-4 h-4 ml-1" />;
		return sortOrder === "asc" ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
	};

	const getVerificationBadge = (status: VerificationStatus) => {
		if (!status) return <Badge variant="secondary">Pending</Badge>;

		const variants = {
			VERIFIED: { variant: "default" as const, text: "Verified", className: "bg-green-600 hover:bg-green-700" },
			QUESTIONABLE: { variant: "secondary" as const, text: "Questionable", className: "bg-yellow-600 hover:bg-yellow-700" },
			DISCREPANCY: { variant: "destructive" as const, text: "Discrepancy", className: "" }
		};

		const config = variants[status];
		return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>;
	};

	const getStatusBadge = (status: QuizStatus) => {
		const variants = {
			IN_PROGRESS: { variant: "secondary" as const, text: "In Progress" },
			SUBMITTED: { variant: "secondary" as const, text: "Submitted" },
			EVALUATED: { variant: "default" as const, text: "Evaluated" },
			EXPIRED: { variant: "destructive" as const, text: "Expired" },
			ENDED: { variant: "destructive" as const, text: "Ended" }
		};

		const config = variants[status];
		return <Badge variant={config.variant}>{config.text}</Badge>;
	};

	// Filter candidates by search query
	const filteredCandidates = candidates.filter((candidate) => {
		const query = searchQuery.toLowerCase();
		return (
			candidate.name.toLowerCase().includes(query) ||
			candidate.email.toLowerCase().includes(query) ||
			candidate.role.title.toLowerCase().includes(query)
		);
	});

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-foreground">Candidates</h1>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Filters</CardTitle>
					<CardDescription>Filter candidates by status, score, and verification</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<div className="space-y-2">
							<label className="text-sm font-medium">Search</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									placeholder="Name, email, role..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-9"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Status</label>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All Status</SelectItem>
									<SelectItem value="IN_PROGRESS">In Progress</SelectItem>
									<SelectItem value="SUBMITTED">Submitted</SelectItem>
									<SelectItem value="EVALUATED">Evaluated</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Verification</label>
							<Select value={verificationFilter} onValueChange={setVerificationFilter}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALL">All Verification</SelectItem>
									<SelectItem value="VERIFIED">Verified</SelectItem>
									<SelectItem value="QUESTIONABLE">Questionable</SelectItem>
									<SelectItem value="DISCREPANCY">Discrepancy</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Min Score</label>
							<Input
								type="number"
								placeholder="0"
								min="0"
								max="100"
								value={minScore}
								onChange={(e) => setMinScore(e.target.value)}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium">Max Score</label>
							<Input
								type="number"
								placeholder="100"
								min="0"
								max="100"
								value={maxScore}
								onChange={(e) => setMaxScore(e.target.value)}
							/>
						</div>
					</div>

					<div className="flex gap-2 mt-4">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								setStatusFilter("ALL");
								setVerificationFilter("ALL");
								setMinScore("");
								setMaxScore("");
								setSearchQuery("");
							}}
						>
							Clear Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>All Candidates ({filteredCandidates.length})</CardTitle>
					<CardDescription>Click on a candidate to view details</CardDescription>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex flex-col items-center justify-center py-16 space-y-4">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
							<p className="text-base font-medium text-foreground">Loading candidates...</p>
						</div>
					) : filteredCandidates.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<p>No candidates found</p>
							<p className="text-sm mt-2">Try adjusting your filters or create a new quiz</p>
						</div>
					) : (
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											<Button
												variant="ghost"
												size="sm"
												className="font-medium flex items-center"
												onClick={() => handleSort("candidateName")}
											>
												Name
												{getSortIcon("candidateName")}
											</Button>
										</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>
											<Button
												variant="ghost"
												size="sm"
												className="font-medium flex items-center"
												onClick={() => handleSort("standardScore")}
											>
												Ranking Score
												{getSortIcon("standardScore")}
											</Button>
										</TableHead>
										<TableHead>Verification</TableHead>
										<TableHead>Confidence</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>
											<Button
												variant="ghost"
												size="sm"
												className="font-medium flex items-center"
												onClick={() => handleSort("submittedAt")}
											>
												Date
												{getSortIcon("submittedAt")}
											</Button>
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{filteredCandidates.map((candidate) => (
										<TableRow
											key={candidate.id}
											className="cursor-pointer"
											onClick={() => {
												window.location.href = `/recruiter/roles/${candidate.role.id}/candidates/${candidate.id}`;
											}}
										>
											<TableCell className="font-medium">{candidate.name}</TableCell>
											<TableCell className="text-muted-foreground">{candidate.email}</TableCell>
											<TableCell>
												<Badge variant="outline">{candidate.role.title}</Badge>
											</TableCell>
											<TableCell>
												{candidate.standardScore !== null ? (
													<span className="font-semibold text-lg">
														{candidate.standardScore.toFixed(1)}%
													</span>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell>{getVerificationBadge(candidate.verificationStatus)}</TableCell>
											<TableCell>
												{candidate.confidenceScore !== null ? (
													<span className="text-sm">{candidate.confidenceScore.toFixed(0)}%</span>
												) : (
													<span className="text-muted-foreground">-</span>
												)}
											</TableCell>
											<TableCell>{getStatusBadge(candidate.status)}</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{candidate.submittedAt
													? formatDistanceToNow(new Date(candidate.submittedAt), { addSuffix: true })
													: formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
