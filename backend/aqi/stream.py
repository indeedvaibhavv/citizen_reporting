"""
AQI Data Stream Simulator
Provides realistic, time-varying AQI data for Indian cities.

In production, this would connect to:
- CPCB (Central Pollution Control Board) API
- State pollution control boards
- OpenAQ or similar open data sources

For demo, simulates realistic patterns with:
- Diurnal variation (morning/evening peaks)
- Weekly trends
- Seasonal baselines
- City-specific characteristics
"""

from datetime import datetime, timedelta
import random
import math
from typing import Dict, List

class AQIStreamSimulator:
    """
    Simulates real-time AQI data streams for major Indian cities.
    """
    
    def __init__(self):
        """Initialize with city configurations"""
        
        # Major Indian cities with realistic baseline AQI levels
        self.cities = {
            "Delhi": {
                "lat": 28.6139, "lng": 77.2090,
                "baseline_aqi": 250,  # Typically poor
                "variance": 50,
                "seasonal_factor": 1.3  # Winter pollution spike
            },
            "Mumbai": {
                "lat": 19.0760, "lng": 72.8777,
                "baseline_aqi": 150,  # Moderate
                "variance": 40,
                "seasonal_factor": 1.1
            },
            "Bangalore": {
                "lat": 12.9716, "lng": 77.5946,
                "baseline_aqi": 120,  # Moderate
                "variance": 30,
                "seasonal_factor": 1.05
            },
            "Chennai": {
                "lat": 13.0827, "lng": 80.2707,
                "baseline_aqi": 110,  # Moderate
                "variance": 35,
                "seasonal_factor": 1.1
            },
            "Kolkata": {
                "lat": 22.5726, "lng": 88.3639,
                "baseline_aqi": 180,  # Unhealthy for sensitive
                "variance": 45,
                "seasonal_factor": 1.2
            },
            "Hyderabad": {
                "lat": 17.3850, "lng": 78.4867,
                "baseline_aqi": 130,  # Moderate
                "variance": 35,
                "seasonal_factor": 1.05
            },
            "Pune": {
                "lat": 18.5204, "lng": 73.8567,
                "baseline_aqi": 140,  # Moderate
                "variance": 38,
                "seasonal_factor": 1.1
            },
            "Ahmedabad": {
                "lat": 23.0225, "lng": 72.5714,
                "baseline_aqi": 160,  # Unhealthy for sensitive
                "variance": 42,
                "seasonal_factor": 1.15
            },
            "Lucknow": {
                "lat": 26.8467, "lng": 80.9462,
                "baseline_aqi": 200,  # Unhealthy
                "variance": 48,
                "seasonal_factor": 1.25
            },
            "Jaipur": {
                "lat": 26.9124, "lng": 75.7873,
                "baseline_aqi": 170,  # Unhealthy for sensitive
                "variance": 40,
                "seasonal_factor": 1.2
            }
        }
    
    def get_current(self, city: str) -> Dict:
        """
        Get current AQI data for a city with realistic time-based variation.
        
        Args:
            city: City name (e.g., "Delhi")
            
        Returns:
            Dictionary with current AQI, PM2.5, PM10, severity, etc.
        """
        if city not in self.cities:
            raise ValueError(f"City '{city}' not found. Available cities: {', '.join(self.cities.keys())}")
        
        city_data = self.cities[city]
        current_time = datetime.now()
        
        # Calculate time-varying AQI
        aqi = self._calculate_realistic_aqi(city_data, current_time)
        
        # Derive PM2.5 and PM10 from AQI (approximate relationship)
        pm25 = self._aqi_to_pm25(aqi)
        pm10 = self._aqi_to_pm10(aqi)
        
        # Determine severity level
        severity = self._get_severity(aqi)
        description = self._get_description(aqi)
        
        return {
            "city": city,
            "aqi": int(aqi),
            "pm25": round(pm25, 1),
            "pm10": round(pm10, 1),
            "timestamp": current_time.isoformat(),
            "severity": severity,
            "description": description
        }
    
    def get_history(self, city: str, time_range: str) -> List[Dict]:
        """
        Get historical AQI data for time-series visualization.
        
        Args:
            city: City name
            time_range: "24h" for hourly data, "7d" for daily data
            
        Returns:
            List of time-series data points
        """
        if city not in self.cities:
            raise ValueError(f"City '{city}' not found")
        
        city_data = self.cities[city]
        current_time = datetime.now()
        data_points = []
        
        if time_range == "24h":
            # Hourly data for past 24 hours
            for hours_ago in range(24, -1, -1):
                timestamp = current_time - timedelta(hours=hours_ago)
                aqi = self._calculate_realistic_aqi(city_data, timestamp)
                
                data_points.append({
                    "time": timestamp.strftime("%H:%M"),
                    "aqi": int(aqi)
                })
        
        elif time_range == "7d":
            # Daily average for past 7 days
            for days_ago in range(7, -1, -1):
                timestamp = current_time - timedelta(days=days_ago)
                
                # Average AQI for the day (simulate by using noon time)
                noon_time = timestamp.replace(hour=12, minute=0, second=0)
                aqi = self._calculate_realistic_aqi(city_data, noon_time)
                
                data_points.append({
                    "time": timestamp.strftime("%b %d"),
                    "aqi": int(aqi)
                })
        
        else:
            raise ValueError(f"Invalid time range: {time_range}. Use '24h' or '7d'")
        
        return data_points
    
    def get_all_cities(self) -> List[Dict]:
        """
        Get current AQI for all cities (for map and leaderboard).
        """
        current_time = datetime.now()
        cities_data = []
        
        for city_name, city_config in self.cities.items():
            aqi = self._calculate_realistic_aqi(city_config, current_time)
            severity = self._get_severity(aqi)
            
            cities_data.append({
                "name": city_name,
                "lat": city_config["lat"],
                "lng": city_config["lng"],
                "aqi": int(aqi),
                "severity": severity
            })
        
        # Sort by AQI (worst first)
        cities_data.sort(key=lambda x: x["aqi"], reverse=True)
        
        return cities_data
    
    def get_insights(self, city: str) -> Dict:
        """
        Generate AI-powered insights about AQI trends.
        
        Returns natural language explanation of current conditions and patterns.
        """
        if city not in self.cities:
            raise ValueError(f"City '{city}' not found")
        
        current = self.get_current(city)
        history_24h = self.get_history(city, "24h")
        
        # Calculate trend
        aqi_values = [point["aqi"] for point in history_24h]
        trend = "increasing" if aqi_values[-1] > aqi_values[0] else "decreasing"
        avg_24h = sum(aqi_values) / len(aqi_values)
        
        # Compare to other cities
        all_cities = self.get_all_cities()
        rank = next(i for i, c in enumerate(all_cities, 1) if c["name"] == city)
        
        # Generate insight text
        insight_text = self._generate_insight_text(
            city, current["aqi"], current["severity"], 
            trend, avg_24h, rank, len(all_cities)
        )
        
        return {
            "city": city,
            "insight": insight_text,
            "trend": trend,
            "rank": rank,
            "total_cities": len(all_cities),
            "avg_24h": round(avg_24h, 1)
        }
    
    # ========================================================================
    # PRIVATE HELPER METHODS
    # ========================================================================
    
    def _calculate_realistic_aqi(self, city_data: Dict, timestamp: datetime) -> float:
        """
        Calculate realistic AQI with time-based variation.
        
        Factors:
        - Baseline level (city-specific)
        - Diurnal pattern (morning/evening peaks)
        - Day of week (weekday vs weekend)
        - Random variance
        - Seasonal adjustment
        """
        baseline = city_data["baseline_aqi"]
        variance = city_data["variance"]
        seasonal_factor = city_data["seasonal_factor"]
        
        hour = timestamp.hour
        day_of_week = timestamp.weekday()
        
        # Diurnal pattern: peaks at 8-10 AM and 7-9 PM (traffic hours)
        morning_peak = math.exp(-((hour - 9) ** 2) / 8) * 30
        evening_peak = math.exp(-((hour - 20) ** 2) / 8) * 35
        diurnal_factor = morning_peak + evening_peak
        
        # Weekend effect (20% lower on Sunday)
        weekend_factor = 0.8 if day_of_week == 6 else 1.0
        
        # Random variance (Gaussian noise)
        noise = random.gauss(0, variance * 0.3)
        
        # Combine all factors
        aqi = baseline * seasonal_factor * weekend_factor + diurnal_factor + noise
        
        # Ensure AQI stays in valid range [0, 500]
        return max(0, min(500, aqi))
    
    def _aqi_to_pm25(self, aqi: float) -> float:
        """Convert AQI to approximate PM2.5 concentration (µg/m³)"""
        # Simplified conversion (real conversion uses breakpoint tables)
        if aqi <= 50:
            return aqi * 0.24
        elif aqi <= 100:
            return 12 + (aqi - 50) * 0.56
        elif aqi <= 150:
            return 35.5 + (aqi - 100) * 0.65
        elif aqi <= 200:
            return 55.5 + (aqi - 150) * 0.99
        elif aqi <= 300:
            return 150.5 + (aqi - 200) * 0.99
        else:
            return 250.5 + (aqi - 300) * 1.0
    
    def _aqi_to_pm10(self, aqi: float) -> float:
        """Convert AQI to approximate PM10 concentration (µg/m³)"""
        # PM10 typically 1.5-2x PM2.5
        pm25 = self._aqi_to_pm25(aqi)
        return pm25 * random.uniform(1.5, 2.0)
    
    def _get_severity(self, aqi: float) -> str:
        """Map AQI to severity category"""
        if aqi <= 50:
            return "good"
        elif aqi <= 100:
            return "moderate"
        elif aqi <= 150:
            return "unhealthy-sensitive"
        elif aqi <= 200:
            return "unhealthy"
        elif aqi <= 300:
            return "very-unhealthy"
        else:
            return "hazardous"
    
    def _get_description(self, aqi: float) -> str:
        """Get human-readable description of AQI level"""
        if aqi <= 50:
            return "Air quality is satisfactory, and air pollution poses little or no risk."
        elif aqi <= 100:
            return "Air quality is acceptable. However, there may be a risk for some people."
        elif aqi <= 150:
            return "Members of sensitive groups may experience health effects."
        elif aqi <= 200:
            return "Everyone may begin to experience health effects; sensitive groups at greater risk."
        elif aqi <= 300:
            return "Health alert: everyone may experience serious health effects."
        else:
            return "Health warning of emergency conditions: everyone affected."
    
    def _generate_insight_text(self, city: str, current_aqi: int, severity: str, 
                               trend: str, avg_24h: float, rank: int, total: int) -> str:
        """Generate natural language insight"""
        
        severity_phrases = {
            "good": "enjoying good air quality",
            "moderate": "experiencing moderate air quality",
            "unhealthy-sensitive": "facing unhealthy conditions for sensitive groups",
            "unhealthy": "experiencing unhealthy air quality",
            "very-unhealthy": "dealing with very unhealthy air conditions",
            "hazardous": "facing hazardous air quality"
        }
        
        trend_phrases = {
            "increasing": "worsening over the past 24 hours",
            "decreasing": "improving over the past 24 hours"
        }
        
        insight = f"{city} is currently {severity_phrases.get(severity, 'experiencing varying air quality')} "
        insight += f"with an AQI of {current_aqi}, {trend_phrases[trend]}. "
        insight += f"The 24-hour average stands at {round(avg_24h)}. "
        
        if rank <= 3:
            insight += f"⚠️ {city} ranks #{rank} among the {total} monitored cities for poorest air quality. "
        elif rank > total - 3:
            insight += f"✓ {city} ranks #{rank} among the {total} monitored cities, showing relatively better conditions. "
        
        # Time-specific advice
        hour = datetime.now().hour
        if 7 <= hour <= 10 or 18 <= hour <= 21:
            insight += "Traffic-hour peaks are typical during this time. "
        
        return insight
