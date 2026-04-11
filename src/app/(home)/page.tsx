import { getAllTrips } from "@/db/trips";
import { Home } from "@/ui/pages/home/home";

export default async function Page() {
	const trips = await getAllTrips();
	return <Home trips={trips} />;
}
