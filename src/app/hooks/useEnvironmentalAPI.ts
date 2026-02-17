import { useState, useEffect } from 'react';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AQICurrentResponse {
  city: string;
  aqi: number;
  pm25: number;
  pm10: number;
  timestamp: string;
  severity: string;
  description: string;
}

export interface AQIHistoryPoint {
  time: string;
  aqi: number;
}

export interface CityAQI {
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  severity: string;
}

export interface AIInsight {
  city: string;
  insight: string;
  trend: string;
  rank: number;
  total_cities: number;
  avg_24h: number;
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Hook to fetch current AQI data for a city
 * Auto-refreshes every 5 minutes
 */
export function useCurrentAQI(city: string) {
  const [data, setData] = useState<AQICurrentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${API_BASE_URL}/api/aqi/current?city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch AQI data: ${response.status}`);
        }

        const result = await response.json();
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch AQI');
          console.error('AQI fetch error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [city]);

  return { data, loading, error };
}

/**
 * Hook to fetch AQI history for time-series charts
 */
export function useAQIHistory(city: string, range: '24h' | '7d' = '24h') {
  const [data, setData] = useState<AQIHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${API_BASE_URL}/api/aqi/history?city=${encodeURIComponent(city)}&range=${range}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch history: ${response.status}`);
        }

        const result = await response.json();
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch history');
          console.error('History fetch error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [city, range]);

  return { data, loading, error };
}

/**
 * Hook to fetch all cities AQI data for map and leaderboard
 * Auto-refreshes every 10 minutes
 */
export function useAllCities() {
  const [data, setData] = useState<CityAQI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_BASE_URL}/api/cities`);

        if (!response.ok) {
          throw new Error(`Failed to fetch cities: ${response.status}`);
        }

        const result = await response.json();
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch cities');
          console.error('Cities fetch error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchData, 10 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
}

/**
 * Hook to fetch AI-generated insights about AQI
 */
export function useAIInsights(city: string) {
  const [data, setData] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${API_BASE_URL}/api/insights/aqi?city=${encodeURIComponent(city)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch insights: ${response.status}`);
        }

        const result = await response.json();
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch insights');
          console.error('Insights fetch error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [city]);

  return { data, loading, error };
}

/**
 * Hook to analyze an image with YOLO
 */
export function useImageAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (imageFile: File) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch(`${API_BASE_URL}/api/report/analyze-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Image analysis failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      console.error('Image analysis error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeImage, loading, error };
}

/**
 * Hook to submit a report
 */
export function useSubmitReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReport = async (report: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/report/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`Report submission failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit report';
      setError(errorMessage);
      console.error('Report submission error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitReport, loading, error };
}

/**
 * Hook to check report validation status with polling
 */
export function useReportStatus(reportId: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let intervalId: NodeJS.Timeout;

    async function fetchStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/report/status/${reportId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch status: ${response.status}`);
        }

        const result = await response.json();
        
        if (mounted) {
          setData(result);
          setLoading(false);

          // Stop polling if status is final
          if (result.status === 'verified' || result.status === 'rejected') {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch status');
          console.error('Status fetch error:', err);
        }
      }
    }

    // Initial fetch
    fetchStatus();

    // Poll every 3 seconds
    intervalId = setInterval(fetchStatus, 3000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [reportId]);

  return { data, loading, error };
}