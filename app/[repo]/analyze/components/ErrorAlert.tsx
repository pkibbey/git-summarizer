"use client";

interface ErrorAlertProps {
	message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
	return (
		<div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-2 rounded-md mb-4">
			{message}
		</div>
	);
}
