import { Card } from './ui/card';
import { Sparkles, Lightbulb } from 'lucide-react';

interface AIInsightCardProps {
  insight: string;
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  return (
    <Card className="p-6 space-y-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">AI Environmental Insight</h3>
          <p className="text-sm text-gray-600">Data-driven analysis</p>
        </div>
      </div>

      <div className="p-4 bg-white/80 rounded-lg border border-blue-100">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-800 leading-relaxed">
            {insight}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
        <p className="text-xs text-gray-600">
          Generated using real-time environmental data and AI analysis
        </p>
      </div>
    </Card>
  );
}
