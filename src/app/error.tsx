"use client";

import Link from "next/link";
import { useEffect } from "react";
import { getHomeRoute } from "@/utils/route";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
			<h1 className="text-3xl font-bold">Something went wrong</h1>
			<p className="max-w-md text-base opacity-70">
				An unexpected error occurred while loading this page.
			</p>
			<div className="flex gap-3">
				<button
					onClick={reset}
					className="rounded border border-current px-4 py-2 text-sm hover:opacity-80"
				>
					Try again
				</button>
				<Link
					href={getHomeRoute()}
					className="rounded bg-foreground px-4 py-2 text-sm text-background hover:opacity-80"
				>
					Go home
				</Link>
			</div>
		</main>
	);
}
