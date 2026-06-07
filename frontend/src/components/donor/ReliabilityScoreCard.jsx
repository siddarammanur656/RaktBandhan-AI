import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import NumberFlow from '@number-flow/react';

export default function ReliabilityScoreCard({ score, tier }) {
  const tierStyles = {
    Gold: 'bg-yellow-400 text-yellow-900',
    Silver: 'bg-gray-300 text-gray-900',
    Bronze: 'bg-orange-300 text-orange-900'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-sm font-medium text-[#71717A]">Reliability Score</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold tracking-tight text-[#09090B]">
                <NumberFlow value={score || 0} />
              </span>
              <span className="text-[#A1A1AA] font-medium">/100</span>
            </div>
            <p className="text-[#71717A] text-xs mt-2">Based on your donation consistency</p>
          </div>
          <Badge className={`${tierStyles[tier] || tierStyles.Bronze} border-0 shadow-sm`}>
            🏆 {tier} Donor
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Progress value={score} className="h-2 flex-1 bg-[#F4F4F5] [&>div]:bg-brand-500" />
        </div>
      </CardContent>
    </Card>
  );
}
