import { NextRequest, NextResponse } from "next/server";
import {
	createPrompt,
	deletePrompt,
	getAllPrompts,
	getPrompt,
	initializePrompts,
	updatePrompt,
} from "@/lib/prompts-store";

export async function GET(request: NextRequest) {
	try {
		// Ensure defaults are initialized
		await initializePrompts();

		const searchParams = request.nextUrl.searchParams;
		const id = searchParams.get("id");

		if (id) {
			// Get specific prompt
			const prompt = await getPrompt(id);
			if (!prompt) {
				return NextResponse.json(
					{ error: "Prompt not found" },
					{ status: 404 },
				);
			}
			return NextResponse.json(prompt);
		} else {
			// Get all prompts
			const prompts = await getAllPrompts();
			// Return in a format compatible with the client
			return NextResponse.json({ prompts });
		}
	} catch (error) {
		console.error("Error fetching prompts:", error);
		return NextResponse.json(
			{ error: "Failed to fetch prompts" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			name,
			description,
			summaryPrompt,
			decisionsPrompt,
			insightsPrompt,
		} = body;

		if (!name || !summaryPrompt || !decisionsPrompt || !insightsPrompt) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const prompt = await createPrompt(
			name,
			description,
			summaryPrompt,
			decisionsPrompt,
			insightsPrompt,
		);

		return NextResponse.json(prompt, { status: 201 });
	} catch (error) {
		console.error("Error creating prompt:", error);
		return NextResponse.json(
			{ error: "Failed to create prompt" },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "Missing prompt ID" }, { status: 400 });
		}

		const body = await request.json();
		const prompt = await updatePrompt(id, body);

		if (!prompt) {
			return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
		}

		return NextResponse.json(prompt);
	} catch (error) {
		console.error("Error updating prompt:", error);
		return NextResponse.json(
			{ error: "Failed to update prompt" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "Missing prompt ID" }, { status: 400 });
		}

		const deleted = await deletePrompt(id);

		if (!deleted) {
			return NextResponse.json(
				{ error: "Prompt not found or cannot be deleted" },
				{ status: 404 },
			);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting prompt:", error);
		return NextResponse.json(
			{ error: "Failed to delete prompt" },
			{ status: 500 },
		);
	}
}
