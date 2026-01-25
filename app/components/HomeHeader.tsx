import Image from "next/image";

interface HomeHeaderProps {
	title?: string;
	description?: string;
}

export function HomeHeader({
	title = "Git Summarizer",
	description = "Analyze commits from any public Git repository",
}: HomeHeaderProps) {
	return (
		<div>
			<Image
				src="/logo.png"
				alt="MultiCam logo"
				width="828"
				height="297"
				className="pb-4 w-60 mx-auto"
			/>
			<p className="text-sm text-slate-300 mb-8 text-center">{description}</p>
		</div>
	);
}
