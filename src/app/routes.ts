import { createBrowserRouter } from "react-router-dom";
import Home from "./screens/Home";
import Report from "./screens/Report";
import Status from "./screens/Status";
import Analytics from "./screens/Analytics";
import Dashboard from "./screens/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Home, // Shows home with login modal
  },
  {
    path: "/signup",
    Component: Home, // Shows home with login modal
  },
  {
    path: "/dashboard",
    Component: Dashboard, // ← NEW: User profile/stats page
  },
  {
    path: "/analytics",
    Component: Analytics,
  },
  {
    path: "/report",
    Component: Report,
  },
  {
    path: "/status",
    Component: Status,
  },
]);