import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AIInsightsPanel({ insights }) {
  // Defensive stripping of any mock tags
  const cleanInsights = insights.map(i => ({
    ...i,
    text: i.text.replace(/Local Mock:\s*/gi, '').trim()
  }));

  return (
    <Card className="p-6 border border-[#E4E4E7] shadow-sm bg-white rounded-2xl h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h3 className="font-display text-xl font-bold text-[#09090B] tracking-tight">AI Co-Pilot Insights</h3>
      </div>
      
      <div className="space-y-4 flex-1">
        {cleanInsights.map((insight) => (
          <div key={insight.id} className="bg-[#FAFAFA] p-5 rounded-xl border border-[#E4E4E7] shadow-sm transition hover:shadow-md group">
            <p className="text-[#09090B] mb-5 text-sm leading-relaxed font-medium">{insight.text}</p>
            <Button size="sm" className="w-full sm:w-auto bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 gap-2 font-semibold">
              {insight.action} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
