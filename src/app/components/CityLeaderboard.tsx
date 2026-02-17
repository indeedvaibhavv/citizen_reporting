import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

// ✅ FIXED: Added proper type and color function
interface CityData {
  name: string;
  aqi: number;
  lat: number;
  lng: number;
  severity: string;
}

// Helper function to get AQI color
function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-red-900";
}

export function CityLeaderboard() {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // ✅ FIXED: Changed endpoint from /leaderboard to /cities
    fetch("http://localhost:8000/api/cities")
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cities');
        return res.json();
      })
      .then((data) => {
        // ✅ FIXED: Backend already returns sorted by AQI (worst first)
        setCities(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cities:", err);
        setError(err.message);
        setCities([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">City Rankings</h3>
        <div className="text-center text-gray-500 py-8">Loading...</div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold mb-4">City Rankings</h3>
        <div className="text-center text-red-500 py-8">Failed to load data</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">City Rankings</h3>
        <span className="text-xs text-gray-500">By AQI (Worst First)</span>
      </div>

      <div className="space-y-3">
        {cities.map((city, i) => (
          <div 
            key={city.name} 
            className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-400 w-6">
                #{i + 1}
              </span>
              <span className="font-medium">{city.name}</span>
            </div>
            <Badge 
              className={`${getAQIColor(city.aqi)} text-white`}
            >
              {city.aqi}
            </Badge>
          </div>
        ))}
      </div>

      {cities.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No data available
        </div>
      )}
    </Card>
  );
}