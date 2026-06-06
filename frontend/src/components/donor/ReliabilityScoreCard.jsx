import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ReliabilityScoreCard({ score, tier }) {
  const tierStyles = {
    Gold: 'bg-yellow-400 text-yellow-900',
    Silver: 'bg-gray-300 text-gray-900',
    Bronze: 'bg-orange-300 text-orange-900'
  };

  return (
    <Card className="p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Reliability Score</h3>
          <p className="text-gray-500 text-sm mt-1">Based on your donation consistency</p>
        </div>
        <Badge className={`${tierStyles[tier] || tierStyles.Bronze} px-3 py-1 text-sm rounded-full`}>
          🏆 {tier} Donor
        </Badge>
      </div>
      <div className="flex items-center gap-4 mt-6">
        <Progress value={score} className="h-3 flex-1 bg-gray-100" />
        <span className="font-bold text-lg text-gray-800">{score}/100</span>
      </div>
    </Card>
  );
}
