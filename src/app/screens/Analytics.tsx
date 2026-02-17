import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import { AQITimeChart } from "../components/AQITimeChart";
import { CityAQIHeatMap } from "../components/CityAQIHeatMap";
import { CityLeaderboard } from "../components/CityLeaderboard";
import { AIInsightCard } from "../components/AIInsightCard";

export default function Analytics() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // ✅ UPDATED: Fetch real AI insights from backend
  const [insight, setInsight] = useState<string>("Loading AI insight...");
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    // Fetch AI insights from backend
    fetch("http://localhost:8000/api/insights/aqi?city=Delhi")
      .then(res => res.json())
      .then(data => {
        setInsight(data.insight);
        setInsightLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch insights:", error);
        setInsight("Unable to generate AI insight at this time.");
        setInsightLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  City Environmental Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  Real-time air quality insights
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* ✅ UPDATED: Components now fetch real data internally */}
        <AQITimeChart />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CityAQIHeatMap />
          <CityLeaderboard />
        </div>

        {/* ✅ UPDATED: Real AI insights */}
        <AIInsightCard insight={insight} />
      </div>
    </div>
  );
}