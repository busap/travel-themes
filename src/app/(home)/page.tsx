import { getAllTripsFromDb } from "@/utils/trip";
import { Home } from "@/ui/pages/home/home";

export default async function Page() {
	const trips = await getAllTripsFromDb();
	return <Home trips={trips} />;
}
