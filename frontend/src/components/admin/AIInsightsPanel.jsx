import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AIInsightsPanel({ insights }) {
  return (
    <Card className="p-6 border-blue-200 bg-blue-50/30 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">AI Co-Pilot Insights</h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm transition hover:shadow-md">
            <p className="text-gray-700 mb-4 text-sm leading-relaxed">{insight.text}</p>
            <Button size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2">
              {insight.action} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
