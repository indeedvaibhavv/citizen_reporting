import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ValidationStatusCard, ValidationStatus } from "../components/ValidationStatusCard";
import { RewardToast } from "../components/RewardToast";

// ✅ NEW: Interface for report status from backend
interface ReportStatusResponse {
  report_id: string;
  status: ValidationStatus;
  category: string;
  location: string;
  submitted_at: string;
  verified_at?: string;
  confidence_score: number;
  validation_reason: string;
  reward_coins: number;
  message: string;
}

export default function Status() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ValidationStatus>("validating");
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(10); // ✅ NEW: Store actual reward from backend

  useEffect(() => {
    // ✅ NEW: Get report ID from localStorage
    const reportId = localStorage.getItem("currentReportId");
    
    if (!reportId) {
      console.error("No report ID found");
      // Fallback to old behavior if no report ID
      simulateValidation();
      return;
    }

    // ✅ NEW: Poll backend for real validation status
    const checkStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/report/status/${reportId}`);
        
        if (response.ok) {
          const data: ReportStatusResponse = await response.json();
          
          setStatus(data.status);
          setReason(data.validation_reason);
          
          // If verified, show reward
          if (data.status === "verified" && !showReward) {
            setRewardAmount(data.reward_coins);
            setTimeout(() => {
              setShowReward(true);
              
              // Update user's coins and stats
              const currentCoins = parseInt(localStorage.getItem("userCoins") || "0");
              const currentReports = parseInt(localStorage.getItem("verifiedReports") || "0");
              localStorage.setItem("userCoins", String(currentCoins + data.reward_coins));
              localStorage.setItem("verifiedReports", String(currentReports + 1));
            }, 500);
          }
          
          // Stop polling if status is final
          if (data.status === "verified" || data.status === "rejected") {
            return true; // Signal to stop polling
          }
        } else {
          console.error("Failed to fetch status");
        }
      } catch (error) {
        console.error("Error checking status:", error);
      }
      
      return false; // Continue polling
    };

    // ✅ NEW: Initial check
    checkStatus();

    // ✅ NEW: Poll every 3 seconds until status is final
    const intervalId = setInterval(async () => {
      const shouldStop = await checkStatus();
      if (shouldStop) {
        clearInterval(intervalId);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [showReward]);

  // ✅ FALLBACK: Old simulation function if no backend connection
  const simulateValidation = () => {
    const validationTimer = setTimeout(() => {
      const outcomes: Array<{ status: ValidationStatus; reason: string }> = [
        { status: "verified", reason: "Clear image, relevant issue, location verified" },
        { status: "needs-review", reason: "Image quality requires manual verification" },
        { status: "rejected", reason: "Unable to identify environmental issue" },
      ];

      const random = Math.random();
      let selectedOutcome;
      if (random < 0.7) {
        selectedOutcome = outcomes[0];
      } else if (random < 0.9) {
        selectedOutcome = outcomes[1];
      } else {
        selectedOutcome = outcomes[2];
      }

      setStatus(selectedOutcome.status);
      setReason(selectedOutcome.reason);

      if (selectedOutcome.status === "verified") {
        setTimeout(() => {
          setShowReward(true);
          
          const currentCoins = parseInt(localStorage.getItem("userCoins") || "0");
          const currentReports = parseInt(localStorage.getItem("verifiedReports") || "0");
          localStorage.setItem("userCoins", String(currentCoins + 10));
          localStorage.setItem("verifiedReports", String(currentReports + 1));
        }, 500);
      }
    }, 3000);

    return () => clearTimeout(validationTimer);
  };

  const handleContinue = () => {
    if (status === "verified") {
      navigate("/analytics");
    } else {
      navigate("/");
    }
  };

  const handleRewardComplete = () => {
    setShowReward(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ UPDATED: Use actual reward amount from backend */}
      {showReward && <RewardToast amount={rewardAmount} onComplete={handleRewardComplete} />}

      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Validation Status
          </h1>
          <p className="text-sm text-gray-600">
            AI-assisted preliminary validation
          </p>
        </div>

        {/* Validation Status */}
        <ValidationStatusCard 
          status={status}
          reason={reason}
          onContinue={handleContinue}
        />

        {/* Information Box */}
        {status === "validating" && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">
              What happens during validation?
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Checking image relevance and quality</li>
              <li>• Verifying location accuracy</li>
              <li>• Detecting potential duplicates</li>
              <li>• Assessing report authenticity</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
              Note: AI provides preliminary validation only. Final verification may involve human review.
            </p>
          </div>
        )}

        {status === "verified" && (
          <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <h4 className="font-medium text-emerald-900 mb-2 text-sm">
              What's next?
            </h4>
            <p className="text-sm text-emerald-800">
              Your report is now part of the live environmental intelligence stream. 
              Local authorities and environmental teams can access this data in real-time.
            </p>
          </div>
        )}

        {status === "needs-review" && (
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2 text-sm">
              Additional Review Required
            </h4>
            <p className="text-sm text-amber-800">
              Your report has been flagged for manual verification. 
              You'll be notified once the review is complete. This typically takes 24-48 hours.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}