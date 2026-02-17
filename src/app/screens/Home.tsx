import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { LoginModal } from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";
import { useCurrentAQI } from "../hooks/useEnvironmentalAPI";
import { getAQIColor, getAQILabel } from "../utils/mockData";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "analytics" | "report" | null
  >(null);

  /* ---------------- FIX #1: react to auth change ---------------- */
  useEffect(() => {
    if (!isAuthenticated) return;

    setShowLoginModal(false);

    if (pendingAction === "analytics") navigate("/analytics");
    if (pendingAction === "report") navigate("/report");

    setPendingAction(null);

    if (
      location.pathname === "/login" ||
      location.pathname === "/signup"
    ) {
      navigate("/");
    }
  }, [isAuthenticated, pendingAction, navigate, location.pathname]);
  /* -------------------------------------------------------------- */

  // Show modal if user directly hits /login or /signup
  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      setShowLoginModal(true);
    }
  }, [location.pathname]);

  const { data: cityData, loading, error } = useCurrentAQI("Delhi");

  const handleProtectedAction = (action: "analytics" | "report") => {
    if (isAuthenticated) {
      navigate(action === "analytics" ? "/analytics" : "/report");
    } else {
      setPendingAction(action);
      setShowLoginModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setPendingAction(null);

    if (
      location.pathname === "/login" ||
      location.pathname === "/signup"
    ) {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading environmental data...</p>
        </div>
      </div>
    );
  }

  if (error || !cityData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {showLoginModal && (
        <LoginModal
          onClose={handleCloseModal}
          onSuccess={() => {}}
        />
      )}

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">🌍</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Earthify</h1>
          </div>

          {!isAuthenticated && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="px-6"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/signup")}
                className="px-6 bg-emerald-600 hover:bg-emerald-700"
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <div className="flex flex-col gap-4">
            <img
              src="/city.jpg"
              alt={cityData.city}
              className="w-full h-64 rounded-lg object-cover border-2 border-gray-200"
            />

            <Button
              onClick={() => handleProtectedAction("analytics")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
            >
              View Full Analytics
            </Button>

            <Button
              onClick={() => handleProtectedAction("report")}
              variant="outline"
              className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 h-12"
            >
              Report an Issue
            </Button>
          </div>

          <Card className="p-6 border-2 border-gray-200">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                📍 <span className="font-semibold">{cityData.city}</span>
              </div>
              <p className="text-sm text-gray-500">
                Last updated:{" "}
                {new Date(cityData.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="border-2 rounded-lg p-4 text-center">
                <p className="text-xs uppercase text-gray-500">AQI</p>
                <p
                  className="text-4xl font-bold"
                  style={{ color: getAQIColor(cityData.aqi) }}
                >
                  {cityData.aqi}
                </p>
              </div>

              <div className="border-2 rounded-lg p-4 text-center">
                <p className="text-xs uppercase text-gray-500">PM 2.5</p>
                <p className="text-4xl font-bold">{Math.round(cityData.pm25)}</p>
              </div>

              <div className="border-2 rounded-lg p-4 text-center">
                <p className="text-xs uppercase text-gray-500">PM 10</p>
                <p className="text-4xl font-bold">{Math.round(cityData.pm10)}</p>
              </div>

              <div className="border-2 rounded-lg p-4 flex items-center justify-center">
                <span
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${getAQIColor(cityData.aqi)}20`,
                    color: getAQIColor(cityData.aqi),
                  }}
                >
                  {getAQILabel(cityData.aqi)}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{cityData.description}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
