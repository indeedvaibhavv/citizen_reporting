# 🔌 Frontend Integration Guide

Complete guide to integrate the FastAPI backend with your React frontend.

## 📋 Table of Contents

1. [Environment Setup](#environment-setup)
2. [API Service Layer](#api-service-layer)
3. [React Hooks](#react-hooks)
4. [Component Updates](#component-updates)
5. [Error Handling](#error-handling)
6. [TypeScript Types](#typescript-types)

## 🚀 Environment Setup

### 1. Create Environment Configuration

Create `src/config/api.ts`:

```typescript
// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    AQI_CURRENT: '/api/aqi/current',
    AQI_HISTORY: '/api/aqi/history',
    CITIES: '/api/cities',
    ANALYZE_IMAGE: '/api/report/analyze-image',
    SUBMIT_REPORT: '/api/report/submit',
    REPORT_STATUS: '/api/report/status',
    INSIGHTS: '/api/insights/aqi',
  }
};
```

### 2. Add Environment Variable

Create `.env.local` in your frontend root:

```env
VITE_API_URL=http://localhost:8000
```

For production:
```env
VITE_API_URL=https://your-backend-domain.com
```

## 🛠️ API Service Layer

Create `src/services/api.ts`:

```typescript
import { API_CONFIG } from '../config/api';

// Types
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

export interface ImageAnalysisResult {
  detected_category: string;
  confidence: number;
  scores: {
    air: number;
    garbage: number;
    construction: number;
    water: number;
  };
  detected_objects: string[];
  explanation: string;
}

export interface ReportSubmission {
  image_data?: string;
  category: string;
  latitude: number;
  longitude: number;
  location_name: string;
  yolo_result?: ImageAnalysisResult;
  timestamp: string;
}

export interface ReportSubmissionResponse {
  report_id: string;
  status: string;
  validation_status: string;
  estimated_verification_time: number;
  message: string;
}

export interface ReportStatus {
  report_id: string;
  status: string;
  category: string;
  location: string;
  submitted_at: string;
  verified_at?: string;
  confidence_score: number;
  validation_reason: string;
  reward_coins: number;
  message: string;
}

export interface AIInsight {
  city: string;
  insight: string;
  trend: string;
  rank: number;
  total_cities: number;
  avg_24h: number;
}

// API Class
class EnvironmentalAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private async fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
  }

  // 1. Get current AQI
  async getCurrentAQI(city: string): Promise<AQICurrentResponse> {
    return this.fetchJSON<AQICurrentResponse>(
      `${API_CONFIG.ENDPOINTS.AQI_CURRENT}?city=${encodeURIComponent(city)}`
    );
  }

  // 2. Get AQI history
  async getAQIHistory(city: string, range: '24h' | '7d'): Promise<AQIHistoryPoint[]> {
    return this.fetchJSON<AQIHistoryPoint[]>(
      `${API_CONFIG.ENDPOINTS.AQI_HISTORY}?city=${encodeURIComponent(city)}&range=${range}`
    );
  }

  // 3. Get all cities
  async getAllCities(): Promise<CityAQI[]> {
    return this.fetchJSON<CityAQI[]>(API_CONFIG.ENDPOINTS.CITIES);
  }

  // 4. Analyze image
  async analyzeImage(imageFile: File): Promise<ImageAnalysisResult> {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(
      `${this.baseURL}${API_CONFIG.ENDPOINTS.ANALYZE_IMAGE}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Image analysis failed: ${response.status}`);
    }

    return response.json();
  }

  // 5. Submit report
  async submitReport(report: ReportSubmission): Promise<ReportSubmissionResponse> {
    return this.fetchJSON<ReportSubmissionResponse>(
      API_CONFIG.ENDPOINTS.SUBMIT_REPORT,
      {
        method: 'POST',
        body: JSON.stringify(report),
      }
    );
  }

  // 6. Get report status
  async getReportStatus(reportId: string): Promise<ReportStatus> {
    return this.fetchJSON<ReportStatus>(
      `${API_CONFIG.ENDPOINTS.REPORT_STATUS}/${reportId}`
    );
  }

  // 7. Get AI insights
  async getInsights(city: string): Promise<AIInsight> {
    return this.fetchJSON<AIInsight>(
      `${API_CONFIG.ENDPOINTS.INSIGHTS}?city=${encodeURIComponent(city)}`
    );
  }
}

// Export singleton instance
export const api = new EnvironmentalAPI();
```

## 🎣 React Hooks

Create `src/hooks/useEnvironmentalAPI.ts`:

```typescript
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { AQICurrentResponse, CityAQI, AQIHistoryPoint, AIInsight } from '../services/api';

// Hook for current AQI
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
        const result = await api.getCurrentAQI(city);
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch AQI');
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

// Hook for AQI history
export function useAQIHistory(city: string, range: '24h' | '7d') {
  const [data, setData] = useState<AQIHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getAQIHistory(city, range);
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch history');
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

// Hook for all cities
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
        const result = await api.getAllCities();
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch cities');
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

// Hook for AI insights
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
        const result = await api.getInsights(city);
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch insights');
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
```

## 🔄 Component Updates

### 1. Update Home Screen

```typescript
// src/pages/Home.tsx
import { useCurrentAQI } from '../hooks/useEnvironmentalAPI';

export default function Home() {
  const { data: aqiData, loading, error } = useCurrentAQI('Delhi');

  if (loading) return <div>Loading AQI data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!aqiData) return null;

  return (
    <div>
      <h1>{aqiData.city}</h1>
      <div className="aqi-card">
        <span className="aqi-value">{aqiData.aqi}</span>
        <span className="aqi-severity">{aqiData.severity}</span>
      </div>
      <p>{aqiData.description}</p>
    </div>
  );
}
```

### 2. Update Analytics Dashboard

```typescript
// src/pages/Analytics.tsx
import { useAQIHistory, useAllCities, useAIInsights } from '../hooks/useEnvironmentalAPI';

export default function Analytics() {
  const city = 'Delhi';
  const [timeRange, setTimeRange] = useState<'24h' | '7d'>('24h');
  
  const { data: history, loading: historyLoading } = useAQIHistory(city, timeRange);
  const { data: cities, loading: citiesLoading } = useAllCities();
  const { data: insights } = useAIInsights(city);

  return (
    <div>
      {/* Time series chart */}
      {!historyLoading && <AQITimeChart data={history} />}
      
      {/* City map */}
      {!citiesLoading && <CityAQIHeatMap cities={cities} />}
      
      {/* AI Insights */}
      {insights && <AIInsightCard insight={insights.insight} />}
    </div>
  );
}
```

### 3. Update Report Flow

```typescript
// src/pages/ReportIssue.tsx
import { useState } from 'react';
import { api } from '../services/api';

export default function ReportIssue() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [yoloResult, setYoloResult] = useState(null);

  // Step 1: Analyze image
  const handleImageCapture = async (file: File) => {
    setImageFile(file);
    setAnalyzing(true);
    
    try {
      const result = await api.analyzeImage(file);
      setYoloResult(result);
      // Show result to user
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Step 4: Submit report
  const handleSubmit = async () => {
    try {
      const report = {
        category: selectedCategory,
        latitude: location.lat,
        longitude: location.lng,
        location_name: location.name,
        yolo_result: yoloResult,
        timestamp: new Date().toISOString(),
      };

      const response = await api.submitReport(report);
      
      // Navigate to validation status with report ID
      navigate(`/validation/${response.report_id}`);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <div>
      {/* Your existing UI */}
      {analyzing && <div>AI analyzing image...</div>}
      {yoloResult && (
        <div>
          <p>Detected: {yoloResult.detected_category}</p>
          <p>Confidence: {(yoloResult.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}
```

### 4. Update Validation Status

```typescript
// src/pages/ValidationStatus.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

export default function ValidationStatus() {
  const { reportId } = useParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    async function checkStatus() {
      try {
        const result = await api.getReportStatus(reportId!);
        if (mounted) {
          setStatus(result);
          
          // Stop polling if status is final
          if (result.status === 'verified' || result.status === 'rejected') {
            clearInterval(interval);
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }

    // Initial check
    checkStatus();
    
    // Poll every 3 seconds
    interval = setInterval(checkStatus, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [reportId]);

  if (!status) return <div>Loading...</div>;

  return (
    <div>
      <h2>{status.message}</h2>
      {status.status === 'verified' && (
        <div>
          <h3>🎉 +{status.reward_coins} coins!</h3>
          <p>{status.validation_reason}</p>
        </div>
      )}
    </div>
  );
}
```

## 🚨 Error Handling

Create `src/components/ErrorBoundary.tsx`:

```typescript
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📦 Migration Checklist

### Phase 1: Preparation
- [ ] Start backend server
- [ ] Test all endpoints with Postman/test script
- [ ] Create API service layer
- [ ] Create React hooks
- [ ] Update environment config

### Phase 2: Component Migration
- [ ] Update Home screen
- [ ] Update Analytics dashboard
- [ ] Update Report flow
- [ ] Update Validation status
- [ ] Add loading states
- [ ] Add error handling

### Phase 3: Testing
- [ ] Test all screens with real data
- [ ] Test error scenarios (server down, etc.)
- [ ] Test edge cases
- [ ] Verify data refresh/polling

### Phase 4: Cleanup
- [ ] Remove mockData.ts imports
- [ ] Delete mockData.ts file
- [ ] Update documentation
- [ ] Add production config

## 🎨 Loading States

Example loading component:

```typescript
// src/components/Loading.tsx
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
}
```

Usage:
```typescript
if (loading) return <LoadingSpinner />;
```

## ✅ Production Checklist

- [ ] Update API_BASE_URL for production
- [ ] Add API key authentication (if needed)
- [ ] Implement request rate limiting
- [ ] Add request retry logic
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Add analytics events
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Add request timeout handling

## 📚 Additional Resources

- FastAPI Docs: https://fastapi.tiangolo.com/
- React Query (for advanced data fetching): https://tanstack.com/query/
- SWR (alternative): https://swr.vercel.app/

---

**Ready to integrate! 🚀**
