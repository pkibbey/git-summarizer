import React from "react";
import { AnalyzeClient } from "../client";

export default function Page({ params }: { params: { repo: string } }) {
	// Server wrapper: params.repo will be the encoded repo rest (e.g. pkibbey%2Fprojects-radar)
	// The client component reads params via `useParams()` so no prop passing required.
	return <AnalyzeClient />;
}
