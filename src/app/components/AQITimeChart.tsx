import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { TrendingUp } from "lucide-react";

// ✅ FIXED: Added proper type
interface AQIDataPoint {
  time: string;
  aqi: number;
}

export function AQITimeChart() {
  const [range, setRange] = useState<"24h" | "7d">("24h");
  const [data, setData] = useState<AQIDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(`http://localhost:8000/api/aqi/history?city=Delhi&range=${range}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch AQI history');
        return res.json();
      })
      .then((historyData) => {
        // ✅ FIXED: Handle empty or invalid data
        if (Array.isArray(historyData)) {
          setData(historyData);
        } else {
          setData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching AQI history:", err);
        setError(err.message);
        setData([]);
        setLoading(false);
      });
  }, [range]);

  // Helper function to get AQI color
  const getAQIStrokeColor = (aqi: number): string => {
    if (aqi <= 50) return "#10b981";
    if (aqi <= 100) return "#fbbf24";
    if (aqi <= 150) return "#f97316";
    if (aqi <= 200) return "#ef4444";
    if (aqi <= 300) return "#a855f7";
    return "#7f1d1d";
  };

  // Calculate average AQI for the period
  const avgAQI = data.length > 0 
    ? Math.round(data.reduce((sum, d) => sum + d.aqi, 0) / data.length)
    : 0;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <TrendingUp className="text-emerald-600" />
          <div>
            <h3 className="font-semibold">AQI Trends - Delhi</h3>
            {!loading && data.length > 0 && (
              <p className="text-xs text-gray-500">
                Average: {avgAQI} AQI
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={range === "24h" ? "default" : "outline"}
            onClick={() => setRange("24h")}
            className={range === "24h" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            24h
          </Button>
          <Button 
            size="sm" 
            variant={range === "7d" ? "default" : "outline"}
            onClick={() => setRange("7d")}
            className={range === "7d" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            7d
          </Button>
        </div>
      </div>

      <div className="h-80">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-red-600">Failed to load chart data</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                formatter={(value: number) => [`AQI: ${value}`, '']}
              />
              <Line 
                type="monotone"
                dataKey="aqi" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* AQI Reference Guide */}
      {!loading && !error && data.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Good (0-50)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Moderate (51-100)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Unhealthy (101-150)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Very Unhealthy (151+)</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}