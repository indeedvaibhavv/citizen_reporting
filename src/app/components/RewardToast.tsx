import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { motion } from "motion/react";

interface RewardToastProps {
  amount: number;
  onComplete: () => void;
}

export function RewardToast({ amount, onComplete }: RewardToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 0.5,
            repeat: 2,
            ease: "easeInOut"
          }}
        >
          <Coins className="w-6 h-6" />
        </motion.div>
        <span className="font-semibold text-lg">
          +{amount} Coins Earned
        </span>
      </div>
    </motion.div>
  );
}
