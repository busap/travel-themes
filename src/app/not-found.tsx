import Link from "next/link";
import { getHomeRoute } from "@/utils/route";

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
			<h1 className="text-3xl font-bold">404 — Trip not found</h1>
			<p className="max-w-md text-base opacity-70">
				This page doesn&apos;t exist or the trip you&apos;re looking for
				has moved.
			</p>
			<Link
				href={getHomeRoute()}
				className="rounded bg-foreground px-4 py-2 text-sm text-background hover:opacity-80"
			>
				Back to all trips
			</Link>
		</main>
	);
}
