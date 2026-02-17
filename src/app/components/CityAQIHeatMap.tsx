import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ✅ FIXED: Added proper type
interface CityData {
  name: string;
  aqi: number;
  lat: number;
  lng: number;
  severity: string;
}

// ✅ NEW: Helper function to get color based on AQI
function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "#10b981"; // Green (Good)
  if (aqi <= 100) return "#fbbf24"; // Yellow (Moderate)
  if (aqi <= 150) return "#f97316"; // Orange (Unhealthy for Sensitive)
  if (aqi <= 200) return "#ef4444"; // Red (Unhealthy)
  if (aqi <= 300) return "#a855f7"; // Purple (Very Unhealthy)
  return "#7f1d1d"; // Dark Red (Hazardous)
}

export function CityAQIHeatMap() {
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8000/api/cities")
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cities');
        return res.json();
      })
      .then((data) => {
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">India AQI Heat Map</h3>
        <span className="text-xs text-gray-500">{cities.length} cities</span>
      </div>

      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <p className="text-sm text-red-600">Failed to load map data</p>
          </div>
        ) : (
          <MapContainer 
            center={[23.5, 78.9]} 
            zoom={5} 
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            
            {cities.map((city) => {
              const color = getAQIColor(city.aqi);
              const radius = Math.min(city.aqi / 15, 25); // Scale radius by AQI
              
              return (
                <CircleMarker
                  key={city.name}
                  center={[city.lat, city.lng]}
                  radius={radius}
                  pathOptions={{ 
                    color: color, 
                    fillColor: color,
                    fillOpacity: 0.6,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong className="text-base">{city.name}</strong>
                      <div className="mt-1">
                        <span className="text-gray-600">AQI: </span>
                        <span className="font-bold" style={{ color: color }}>
                          {city.aqi}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {city.severity.replace('-', ' ')}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      {!loading && !error && (
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }}></div>
            <span>Good (0-50)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#fbbf24" }}></div>
            <span>Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f97316" }}></div>
            <span>Unhealthy (101-150)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
            <span>Very Unhealthy (151+)</span>
          </div>
        </div>
      )}
    </Card>
  );
}