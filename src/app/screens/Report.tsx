import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { ChevronLeft, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { LiveCameraCapture } from "../components/LiveCameraCapture";
import { LocationConfirmCard } from "../components/LocationConfirmCard";
import { CategorySelector, IssueCategory } from "../components/CategorySelector";
import { useAuth } from "../context/AuthContext";

type Step = 1 | 2 | 3 | 4;

// ✅ NEW: Interface for YOLO analysis result
interface YOLOResult {
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

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const coords = location.state?.coords as GeolocationCoordinates | undefined;

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null); // ✅ NEW: Store file for upload
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | null>(null);
  const [userCoords, setUserCoords] = useState<GeolocationCoordinates | null>(coords || null);
  const [yoloResult, setYoloResult] = useState<YOLOResult | null>(null); // ✅ NEW: Store YOLO result
  const [analyzingImage, setAnalyzingImage] = useState(false); // ✅ NEW: Loading state

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Get user location if not provided
  useEffect(() => {
    if (!userCoords && isAuthenticated) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoords(position.coords);
          },
          (error) => {
            console.error("Geolocation error:", error);
            // Use demo location if geolocation fails
            const demoCoords: GeolocationCoordinates = {
              latitude: 28.6139,
              longitude: 77.2090,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            };
            setUserCoords(demoCoords);
          }
        );
      } else {
        // Use demo location if not supported
        const demoCoords: GeolocationCoordinates = {
          latitude: 28.6139,
          longitude: 77.2090,
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        };
        setUserCoords(demoCoords);
      }
    }
  }, [userCoords, isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (!userCoords) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // ✅ UPDATED: Handle image capture and analyze with backend
  const handleImageCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    
    // Convert base64 to File object for upload
    try {
      const blob = await fetch(imageData).then(r => r.blob());
      const file = new File([blob], "report.jpg", { type: "image/jpeg" });
      setCapturedFile(file);
      
      // ✅ NEW: Analyze image with backend YOLO API
      setAnalyzingImage(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8000/api/report/analyze-image', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        setYoloResult(result);
        console.log("YOLO Analysis Result:", result);
      } else {
        console.error("Image analysis failed");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
    } finally {
      setAnalyzingImage(false);
    }
    
    setCurrentStep(2);
  };

  const handleCategorySelect = (category: IssueCategory) => {
    setSelectedCategory(category);
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedCategory) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    } else {
      navigate("/");
    }
  };

  // ✅ UPDATED: Submit report to backend
  const handleSubmit = async () => {
    try {
      // Prepare report data
      const report = {
        category: selectedCategory,
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
        location_name: `${userCoords.latitude.toFixed(4)}, ${userCoords.longitude.toFixed(4)}`,
        yolo_result: yoloResult,
        timestamp: new Date().toISOString()
      };
      
      // ✅ NEW: Submit to backend
      const response = await fetch('http://localhost:8000/api/report/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log("Report submitted:", result);
        
        // Store report ID for status tracking
        localStorage.setItem("currentReportId", result.report_id);
        
        // Navigate to status screen
        navigate("/status");
      } else {
        console.error("Report submission failed");
        alert("Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    }
  };

  const handleCameraCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="p-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">
              New Report
            </h1>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm
                  ${currentStep > step 
                    ? "bg-emerald-600 text-white" 
                    : currentStep === step 
                    ? "bg-emerald-600 text-white" 
                    : "bg-gray-200 text-gray-500"
                  }
                `}
              >
                {currentStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
              {step < 4 && (
                <div
                  className={`
                    w-12 h-1 mx-1
                    ${currentStep > step ? "bg-emerald-600" : "bg-gray-200"}
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          {currentStep === 1 && (
            <>
              <LiveCameraCapture 
                onCapture={handleImageCapture}
                onCancel={handleCameraCancel}
              />
              
              {/* ✅ NEW: Show analyzing state */}
              {analyzingImage && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">AI Analyzing Image...</p>
                      <p className="text-xs text-blue-700">Detecting environmental indicators</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {currentStep === 2 && (
            <>
              <LocationConfirmCard coords={userCoords} />
              
              {/* ✅ NEW: Show YOLO results if available */}
              {yoloResult && (
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <h4 className="font-semibold text-sm text-blue-900 mb-2">
                    🤖 AI Detection Result
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-blue-700">Category: </span>
                      <span className="font-medium text-blue-900">
                        {yoloResult.detected_category.charAt(0).toUpperCase() + yoloResult.detected_category.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700">Confidence: </span>
                      <span className="font-medium text-blue-900">
                        {(yoloResult.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                      <p className="text-xs text-blue-800">{yoloResult.explanation}</p>
                    </div>
                  </div>
                </Card>
              )}
              
              <Button 
                onClick={handleNext}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Continue
              </Button>
            </>
          )}

          {currentStep === 3 && (
            <>
              <CategorySelector 
                selectedCategory={selectedCategory}
                onSelect={handleCategorySelect}
              />
              
              {/* ✅ NEW: Show AI suggestion if available */}
              {yoloResult && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    💡 AI suggests: <span className="font-medium">{yoloResult.detected_category}</span> ({(yoloResult.confidence * 100).toFixed(0)}% confidence)
                  </p>
                </div>
              )}
              
              <Button 
                onClick={handleNext}
                disabled={!selectedCategory}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                Continue
              </Button>
            </>
          )}

          {currentStep === 4 && (
            <>
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review Your Report
                </h3>

                {/* Image Preview */}
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={capturedImage || ""} 
                    alt="Report preview" 
                    className="w-full h-auto"
                  />
                </div>

                {/* Details */}
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-sm font-medium text-gray-900">
                      📍 {userCoords.latitude.toFixed(6)}, {userCoords.longitude.toFixed(6)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedCategory === "air" && "🏭 Air Pollution"}
                      {selectedCategory === "garbage" && "🗑️ Garbage / Waste"}
                      {selectedCategory === "construction" && "🚧 Construction Dust"}
                      {selectedCategory === "water" && "💧 Water Pollution"}
                    </p>
                  </div>
                  
                  {/* ✅ NEW: Show AI confidence if available */}
                  {yoloResult && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">AI Confidence</p>
                      <p className="text-sm font-medium text-gray-900">
                        {(yoloResult.confidence * 100).toFixed(1)}% - {yoloResult.detected_category}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Timestamp</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>

              <Button 
                onClick={handleSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
              >
                Submit Report
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By submitting, you confirm this is a real-time report with authentic location data.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}