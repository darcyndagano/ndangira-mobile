import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { SplashScreen } from "./components/SplashScreen";
import { Home } from "./components/Home";
import { ListingDetail } from "./components/ListingDetail";
import { Auth } from "./components/Auth";
import { OwnerDashboard } from "./components/OwnerDashboard";
import { AgentProfile } from "./components/AgentProfile";
import { Search } from "./components/Search";
import { Favorites } from "./components/Favorites";
import { Profile } from "./components/Profile";
import { AgentReferrals } from "./components/AgentReferrals";
import { PersonalInfo } from "./components/PersonalInfo";
import { Settings } from "./components/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SplashScreen,
  },
  {
    path: "/home",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "search", Component: Search },
      { path: "favorites", Component: Favorites },
      { path: "profile", Component: Profile },
      { path: "listing/:id", Component: ListingDetail },
      { path: "auth", Component: Auth },
      { path: "dashboard", Component: OwnerDashboard },
      { path: "agent", Component: AgentProfile },
      { path: "agent/referrals", Component: AgentReferrals },
      { path: "profile/info", Component: PersonalInfo },
      { path: "settings", Component: Settings },
    ],
  },
]);
