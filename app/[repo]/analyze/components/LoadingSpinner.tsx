"use client";

export function LoadingSpinner() {
	return (
		<div className="min-h-80 bg-slate-900 text-white flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
				<p>Loading commits...</p>
			</div>
		</div>
	);
}
