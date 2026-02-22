import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { 
  User, 
  Award, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  MapPin,
  ChevronLeft,
  FileText,
  Coins
} from "lucide-react";

interface UserReport {
  id: string;
  category: string;
  status: string;
  location: string;
  timestamp: string;
  coins_earned: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [userCoins, setUserCoins] = useState(0);
  const [verifiedReports, setVerifiedReports] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [recentReports, setRecentReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user data from localStorage
  const userName = localStorage.getItem("userName") || "Citizen";
  const userEmail = localStorage.getItem("userEmail") || "";

  useEffect(() => {
    // Load user stats from localStorage
    const coins = parseInt(localStorage.getItem("userCoins") || "0");
    const verified = parseInt(localStorage.getItem("verifiedReports") || "0");
    const pending = parseInt(localStorage.getItem("pendingReports") || "0");
    const total = parseInt(localStorage.getItem("totalReports") || "0");

    setUserCoins(coins);
    setVerifiedReports(verified);
    setPendingReports(pending);
    setTotalReports(total);

    // Try to fetch reports from backend
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    try {
      // Replace with your actual API endpoint
      const response = await fetch('http://localhost:8000/api/user/reports');
      
      if (response.ok) {
        const data = await response.json();
        setRecentReports(data.reports || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      // Mock data for demonstration
      setRecentReports([
        {
          id: "1",
          category: "Garbage",
          status: "verified",
          location: "Mumbai, Maharashtra",
          timestamp: new Date().toISOString(),
          coins_earned: 10
        },
        {
          id: "2",
          category: "Air Pollution",
          status: "pending",
          location: "Delhi, NCR",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          coins_earned: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "garbage": return "🗑️";
      case "air": case "air pollution": return "🏭";
      case "water": case "water pollution": return "💧";
      case "construction": return "🚧";
      default: return "⚠️";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">My Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* User Profile Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
                {userEmail && (
                  <p className="text-sm text-gray-600">{userEmail}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    Environmental Contributor
                  </span>
                </div>
              </div>
            </div>

            {/* Coins Display */}
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Coins className="w-5 h-5 text-amber-500" />
                <span className="text-3xl font-bold text-amber-600">{userCoins}</span>
              </div>
              <p className="text-xs text-gray-600">Reward Coins</p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            title="Total Reports"
            value={totalReports}
            color="bg-blue-50"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            title="Verified Reports"
            value={verifiedReports}
            color="bg-green-50"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-yellow-600" />}
            title="Pending Review"
            value={pendingReports}
            color="bg-yellow-50"
          />
        </div>

        {/* Impact Stats */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Impact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-700">{verifiedReports}</p>
                <p className="text-xs text-gray-600">Issues Reported</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">
                  {new Set(recentReports.map(r => r.location.split(',')[0])).size}
                </p>
                <p className="text-xs text-gray-600">Cities Covered</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Reports */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/report")}
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
            >
              + New Report
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading reports...</p>
            </div>
          ) : recentReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No reports yet</p>
              <Button
                onClick={() => navigate("/report")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Submit Your First Report
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{report.category}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.location}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(report.timestamp).toLocaleDateString()} at{' '}
                        {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {report.coins_earned > 0 && (
                    <div className="flex items-center gap-1 text-amber-600">
                      <Coins className="w-4 h-4" />
                      <span className="font-semibold">+{report.coins_earned}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={() => navigate("/analytics")}
            variant="outline"
            className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            View Analytics
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: {
  icon: React.ReactNode;
  title: string;
  value: number;
  color: string;
}) {
  return (
    <Card className={`p-4 ${color} border-2`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-600">{title}</p>
        </div>
      </div>
    </Card>
  );
}