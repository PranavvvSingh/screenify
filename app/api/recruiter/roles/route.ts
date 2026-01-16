import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getJobRolesPaginated, type RoleFilters } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: await headers()
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);

		// Parse pagination
		const page = parseInt(searchParams.get("page") || "1", 10);

		// Parse filters
		const filters: RoleFilters = {};

		const search = searchParams.get("search");
		if (search) filters.search = search;

		const sortOrder = searchParams.get("sortOrder");
		if (sortOrder && ["asc", "desc"].includes(sortOrder)) {
			filters.sortOrder = sortOrder as RoleFilters["sortOrder"];
		}

		const result = await getJobRolesPaginated(page, filters);

		return NextResponse.json({
			roles: result.data,
			pagination: {
				page: result.page,
				total: result.total,
				totalPages: result.totalPages
			}
		});
	} catch (error) {
		console.error("Error fetching roles:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
