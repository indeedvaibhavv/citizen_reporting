// Mock API Data for Indian Cities

export interface CityData {
  name: string;
  state: string;
  lat: number;
  lng: number;
  aqi: number;
  pm25: number;
  pm10: number;
}

export const INDIAN_CITIES: CityData[] = [
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090, aqi: 287, pm25: 185, pm10: 245 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777, aqi: 142, pm25: 78, pm10: 110 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946, aqi: 98, pm25: 52, pm10: 75 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, aqi: 178, pm25: 95, pm10: 135 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, aqi: 112, pm25: 65, pm10: 88 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867, aqi: 125, pm25: 70, pm10: 95 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, aqi: 135, pm25: 75, pm10: 100 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, aqi: 156, pm25: 85, pm10: 115 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, aqi: 198, pm25: 110, pm10: 150 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, aqi: 215, pm25: 125, pm10: 165 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319, aqi: 245, pm25: 145, pm10: 195 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882, aqi: 132, pm25: 72, pm10: 98 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577, aqi: 148, pm25: 82, pm10: 108 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126, aqi: 165, pm25: 90, pm10: 120 },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794, aqi: 172, pm25: 95, pm10: 128 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, aqi: 225, pm25: 135, pm10: 175 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, aqi: 95, pm25: 48, pm10: 68 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366, aqi: 65, pm25: 32, pm10: 45 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245, aqi: 118, pm25: 65, pm10: 88 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322, aqi: 145, pm25: 80, pm10: 105 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734, aqi: 55, pm25: 28, pm10: 38 },
  { name: "Srinagar", state: "Jammu & Kashmir", lat: 34.0837, lng: 74.7973, aqi: 78, pm25: 40, pm10: 55 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096, aqi: 138, pm25: 75, pm10: 102 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296, aqi: 152, pm25: 85, pm10: 112 },
];

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "#10b981"; // Green - Good
  if (aqi <= 100) return "#fbbf24"; // Yellow - Moderate
  if (aqi <= 200) return "#f97316"; // Orange - Poor
  return "#ef4444"; // Red - Severe
}

export function getAQILabel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  return "Severe";
}

// Generate historical data for AQI trends
export function generateHistoricalData(days: number = 7): Array<{ time: string; aqi: number }> {
  const data = [];
  const now = new Date();
  
  if (days === 1) {
    // 24 hours data (hourly)
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      data.push({
        time: `${hour}:00`,
        aqi: Math.floor(200 + Math.random() * 100 + Math.sin(hour / 24 * Math.PI * 2) * 50),
      });
    }
  } else {
    // 7 days data (daily)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      data.push({
        time: date.toLocaleDateString('en-US', { weekday: 'short' }),
        aqi: Math.floor(180 + Math.random() * 120),
      });
    }
  }
  
  return data;
}

// Generate AI insight based on data
export function generateAIInsight(city: string, aqi: number): string {
  const insights = {
    severe: [
      `⚠️ Air quality in ${city} is in the severe category. Primary contributors include vehicular emissions and construction dust. Residents are advised to limit outdoor activities and use air purifiers indoors.`,
      `⚠️ ${city} is experiencing hazardous air quality levels. Industrial emissions and stubble burning in nearby regions are major factors. Children and elderly should avoid outdoor exposure.`,
    ],
    poor: [
      `🔶 ${city}'s air quality has deteriorated to poor levels. Increased traffic congestion and weather patterns are trapping pollutants. Consider wearing N95 masks when outdoors.`,
      `🔶 Air quality in ${city} is concerning. A combination of vehicular pollution and dust is affecting visibility and health. Monitor AQI levels throughout the day.`,
    ],
    moderate: [
      `💡 ${city} shows moderate air quality. While generally acceptable, sensitive individuals should consider reducing prolonged outdoor exertion during peak hours.`,
      `💡 Air quality in ${city} is at moderate levels. Wind patterns are helping disperse pollutants, but continued monitoring is recommended.`,
    ],
    good: [
      `✅ Excellent air quality in ${city} today! Clean air conditions are favorable for outdoor activities. This improvement is due to favorable wind speeds and reduced emissions.`,
      `✅ ${city} enjoys good air quality. Low pollution levels make it ideal for outdoor exercise and activities. Keep up the environmental efforts!`,
    ],
  };

  let category: keyof typeof insights;
  if (aqi > 200) category = 'severe';
  else if (aqi > 100) category = 'poor';
  else if (aqi > 50) category = 'moderate';
  else category = 'good';

  const categoryInsights = insights[category];
  return categoryInsights[Math.floor(Math.random() * categoryInsights.length)];
}

// Get city stats (simulated API response)
export function getCityStats(cityName: string = "Delhi"): CityData {
  return INDIAN_CITIES.find(c => c.name === cityName) || INDIAN_CITIES[0];
}

// Get leaderboard (sorted by AQI, higher = worse)
export function getCityLeaderboard(): CityData[] {
  return [...INDIAN_CITIES].sort((a, b) => b.aqi - a.aqi);
}
