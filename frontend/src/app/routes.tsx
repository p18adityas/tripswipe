import { createBrowserRouter } from "react-router";
import { Home } from "./screens/Home";
import { Discovery } from "./screens/Discovery";
import { PlaceDetail } from "./screens/PlaceDetail";
import { SelectionSummary } from "./screens/SelectionSummary";
import { ItinerarySetup } from "./screens/ItinerarySetup";
import { GeneratedItinerary } from "./screens/GeneratedItinerary";
import { Trips } from "./screens/Trips";
import { Profile } from "./screens/Profile";
import { SignUp } from "./screens/SignUp";
import { SignIn } from "./screens/SignIn";
import { ProfileSetup } from "./screens/ProfileSetup";
import { AuthSuccess } from "./screens/AuthSuccess";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/trips",
    Component: Trips,
  },
  {
    path: "/trip/:tripId",
    Component: GeneratedItinerary,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/discover/:cityId",
    Component: Discovery,
  },
  {
    path: "/place/:placeId",
    Component: PlaceDetail,
  },
  {
    path: "/summary",
    Component: SelectionSummary,
  },
  {
    path: "/setup",
    Component: ItinerarySetup,
  },
  {
    path: "/itinerary",
    Component: GeneratedItinerary,
  },
  {
    path: "/auth/signup",
    Component: SignUp,
  },
  {
    path: "/auth/signin",
    Component: SignIn,
  },
  {
    path: "/auth/profile-setup",
    Component: ProfileSetup,
  },
  {
    path: "/auth/success",
    Component: AuthSuccess,
  },
]);