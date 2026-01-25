export default function GlobalTotal({ globalTotal }: { globalTotal: number }) {
	return (
		<div className="text-sm text-slate-300">
			Total:{" "}
			<span className="text-yellow-400 font-semibold">
				${globalTotal.toFixed(6)}
			</span>
		</div>
	);
}
