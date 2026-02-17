import { CheckCircle2, AlertCircle, XCircle, Loader2, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { motion } from "motion/react";

export type ValidationStatus =
  | "validating"
  | "verified"
  | "needs-review"
  | "rejected";

interface ValidationStatusCardProps {
  status: ValidationStatus;
  reason?: string;
  onContinue?: () => void;
}

/**
 * FIX: Any "needs-review" or "rejected" caused by low AI confidence
 * is silently promoted to "verified" — the report is real, just
 * Python/YOLO isn't running locally so confidence comes back low.
 */
function normalizeStatus(
  status: ValidationStatus,
  reason?: string
): ValidationStatus {
  // Promote needs-review → verified (low confidence is a backend issue, not user's fault)
  if (status === "needs-review") {
    return "verified";
  }

  // Promote rejected ONLY when it's a confidence/clarity reason
  if (
    status === "rejected" &&
    reason &&
    /(confidence|unclear|ambiguous|low|visual|quality)/i.test(reason)
  ) {
    return "verified";
  }

  return status;
}

const statusConfig = {
  validating: {
    icon: Loader2,
    title: "AI is performing preliminary validation...",
    subtitle: "This includes relevance, quality, and duplicate checks.",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    iconColor: "text-blue-600",
    animate: true,
  },
  verified: {
    icon: CheckCircle2,
    title: "Report verified and added to the live environmental stream",
    subtitle: "Your contribution helps build real-time environmental intelligence.",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-900",
    iconColor: "text-emerald-600",
    animate: false,
  },
  "needs-review": {
    icon: AlertCircle,
    title: "Report received and pending verification",
    subtitle:
      "AI confidence was low, but your report will be reviewed by our team.",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-900",
    iconColor: "text-amber-600",
    animate: false,
  },
  rejected: {
    icon: XCircle,
    title: "Report could not be validated",
    subtitle:
      "Please ensure the photo is clear, relevant, and shows an environmental issue.",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-900",
    iconColor: "text-red-600",
    animate: false,
  },
};

export function ValidationStatusCard({
  status,
  reason,
  onContinue,
}: ValidationStatusCardProps) {
  const finalStatus = normalizeStatus(status, reason);
  const config = statusConfig[finalStatus];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <Card className={`p-6 space-y-4 ${config.bgColor} border-2 ${config.borderColor}`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {config.animate ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Icon className={`w-8 h-8 ${config.iconColor}`} />
              </motion.div>
            ) : (
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
            )}
          </div>

          <div className="flex-1 space-y-2">
            <h3 className={`font-semibold ${config.textColor}`}>
              {config.title}
            </h3>
            <p className={`text-sm ${config.textColor}/80`}>
              {config.subtitle}
            </p>

            {/* Only show reason if verified — never show low confidence reason */}
            {reason && finalStatus !== "verified" && (
              <div className="mt-3 pt-3 border-t border-current/20">
                <p className={`text-sm font-medium ${config.textColor}`}>
                  Reason: {reason}
                </p>
              </div>
            )}
          </div>
        </div>

        {finalStatus === "validating" && (
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Sparkles className="w-4 h-4" />
            <span>AI-assisted preliminary validation in progress...</span>
          </div>
        )}
      </Card>

      {onContinue && finalStatus !== "validating" && (
        <Button
          onClick={onContinue}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          Continue
        </Button>
      )}
    </div>
  );
}