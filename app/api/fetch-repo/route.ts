import { NextRequest, NextResponse } from "next/server";
import { fetchCommitsFromRepo } from "@/lib/git-service";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { repoUrl, refresh } = body;

		if (!repoUrl || typeof repoUrl !== "string") {
			return NextResponse.json(
				{ error: "Missing or invalid repoUrl" },
				{ status: 400 },
			);
		}

		const result = await fetchCommitsFromRepo(repoUrl, refresh === true);

		return NextResponse.json({
			success: true,
			commits: result.commits,
			totalCommits: result.commits.length,
			wasCached: result.wasCached,
			fetchedAt: result.fetchedAt,
		});
	} catch (error) {
		console.error("Error fetching repo:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to fetch repository",
			},
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	const repoUrl = request.nextUrl.searchParams.get("repoUrl");
	const refresh = request.nextUrl.searchParams.get("refresh") === "true";

	if (!repoUrl) {
		return NextResponse.json(
			{ error: "Missing repoUrl parameter" },
			{ status: 400 },
		);
	}

	try {
		const result = await fetchCommitsFromRepo(repoUrl, refresh);

		return NextResponse.json({
			success: true,
			commits: result.commits,
			totalCommits: result.commits.length,
			wasCached: result.wasCached,
			fetchedAt: result.fetchedAt,
		});
	} catch (error) {
		console.error("Error fetching repo:", error);
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Failed to fetch repository",
			},
			{ status: 500 },
		);
	}
}
