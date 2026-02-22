import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { LoginModal } from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";
import { getAQIColor, getAQILabel } from "../utils/mockData";
import { getCityImage } from "../../services/unsplashService";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

// Extended list of Indian cities
const CITIES = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", 
  "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kanpur", "Nagpur",
  "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara"
];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<"analytics" | "report" | null>(null);
  
  // City state
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [cityImage, setCityImage] = useState<string>('');
  const [cityData, setCityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

  const currentCity = CITIES[currentCityIndex];

  /* ---------------- Search filtering ---------------- */
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = CITIES.filter(city =>
        city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowDropdown(true);
    } else {
      setFilteredCities([]);
      setShowDropdown(false);
    }
  }, [searchQuery]);

  /* ---------------- Auth effects ---------------- */
  useEffect(() => {
    if (!isAuthenticated) return;

    setShowLoginModal(false);

    if (pendingAction === "analytics") navigate("/analytics");
    if (pendingAction === "report") navigate("/report");

    setPendingAction(null);

    if (location.pathname === "/login" || location.pathname === "/signup") {
      navigate("/");
    }
  }, [isAuthenticated, pendingAction, navigate, location.pathname]);

  useEffect(() => {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      setShowLoginModal(true);
    }
  }, [location.pathname]);

  /* ---------------- Fetch city data ---------------- */
  useEffect(() => {
    const fetchCityData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/current/${currentCity}`);
        if (response.ok) {
          const data = await response.json();
          setCityData(data);
        } else {
          // Fallback mock data
          setCityData({
            city: currentCity,
            aqi: Math.floor(Math.random() * 300) + 50,
            pm25: Math.floor(Math.random() * 200) + 50,
            pm10: Math.floor(Math.random() * 400) + 100,
            timestamp: new Date().toISOString(),
            description: "Real-time environmental monitoring for " + currentCity,
          });
        }
      } catch (error) {
        console.error("Error fetching city data:", error);
        setCityData({
          city: currentCity,
          aqi: Math.floor(Math.random() * 300) + 50,
          pm25: Math.floor(Math.random() * 200) + 50,
          pm10: Math.floor(Math.random() * 400) + 100,
          timestamp: new Date().toISOString(),
          description: "Real-time environmental monitoring for " + currentCity,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCityData();
  }, [currentCity]);

  /* ---------------- Load city image ---------------- */
  useEffect(() => {
    if (currentCity) {
      setCityImage('');
      getCityImage(currentCity).then(setCityImage);
    }
  }, [currentCity]);

  /* ---------------- Carousel controls ---------------- */
  const nextCity = () => {
    setCurrentCityIndex((prev) => (prev + 1) % CITIES.length);
  };

  const prevCity = () => {
    setCurrentCityIndex((prev) => (prev - 1 + CITIES.length) % CITIES.length);
  };

  /* ---------------- Search handlers ---------------- */
  const handleCitySelect = (city: string) => {
    const index = CITIES.indexOf(city);
    if (index !== -1) {
      setCurrentCityIndex(index);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  /* ---------------- Other handlers ---------------- */
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

    if (location.pathname === "/login" || location.pathname === "/signup") {
      navigate("/");
    }
  };

  if (loading && !cityData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading environmental data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {showLoginModal && (
        <LoginModal onClose={handleCloseModal} onSuccess={() => {}} />
      )}

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">🌍</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Prithvi Pulse</h1>
          </div>

          {/* City Search Bar */}
          <div className="relative flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowDropdown(true)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Dropdown */}
            {showDropdown && filteredCities.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📍</span>
                      <span className="font-medium">{city}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {showDropdown && searchQuery && filteredCities.length === 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4 z-50">
                <p className="text-sm text-gray-500 text-center">No cities found</p>
              </div>
            )}
          </div>

          {!isAuthenticated && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/login")} className="px-6">
                Login
              </Button>
              <Button onClick={() => navigate("/signup")} className="px-6 bg-emerald-600 hover:bg-emerald-700">
                Sign Up
              </Button>
            </div>
          )}
        </div>

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          <div className="flex flex-col gap-4">
            {/* City Image Carousel */}
            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 group">
              {cityImage ? (
                <img
                  src={cityImage}
                  alt={currentCity}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                    <span className="text-gray-500 text-sm">Loading image...</span>
                  </div>
                </div>
              )}

              {/* Navigation arrows */}
              <button
                onClick={prevCity}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous city"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={nextCity}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next city"
              >
                <ChevronRight size={24} />
              </button>

              {/* City name overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <h2 className="text-white text-2xl font-bold drop-shadow-lg">
                  {currentCity}
                </h2>
              </div>

              {/* City indicator dots */}
              <div className="absolute top-4 right-4 flex gap-1">
                {CITIES.slice(0, 7).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentCityIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

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
                📍 <span className="font-semibold">{currentCity}</span>
              </div>
              <p className="text-sm text-gray-500">
                Last updated: {cityData ? new Date(cityData.timestamp).toLocaleTimeString() : 'N/A'}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="border-2 rounded-lg p-4 text-center">
                <p className="text-xs uppercase text-gray-500">AQI</p>
                <p
                  className="text-4xl font-bold"
                  style={{ color: cityData ? getAQIColor(cityData.aqi) : '#000' }}
                >
                  {cityData?.aqi || 'N/A'}
                </p>
              </div>

              <div className="border-2 rounded-lg p-4 text-center">
                <p className="text-xs uppercase text-gray-500">PM 2.5</p>
                <p className="text-4xl font-bold">{cityData ? Math.round(cityData.pm25) : 'N/A'}</p>
              </div>

              <div className="border-2 rounded-lg p-4 text-center">
                <p className="text-xs uppercase text-gray-500">PM 10</p>
                <p className="text-4xl font-bold">{cityData ? Math.round(cityData.pm10) : 'N/A'}</p>
              </div>

              <div className="border-2 rounded-lg p-4 flex items-center justify-center">
                <span
                  className="px-4 py-2 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: cityData ? `${getAQIColor(cityData.aqi)}20` : '#f0f0f0',
                    color: cityData ? getAQIColor(cityData.aqi) : '#000',
                  }}
                >
                  {cityData ? getAQILabel(cityData.aqi) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                {cityData?.description || `Real-time environmental monitoring for ${currentCity}`}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}