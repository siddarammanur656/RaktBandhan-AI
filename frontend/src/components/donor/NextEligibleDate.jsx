import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function NextEligibleDate() {
  const daysRemaining = 12;
  const eligibleDate = new Date();
  eligibleDate.setDate(eligibleDate.getDate() + daysRemaining);

  return (
    <Card className="p-6 bg-blue-50 border-blue-100 h-full flex items-center">
      <div className="flex items-center gap-5">
        <div className="p-4 bg-blue-100 rounded-full text-blue-600">
          <Calendar className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-blue-800 uppercase tracking-wide">Next Eligible Date</h3>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {eligibleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <p className="text-sm text-blue-600 mt-1 font-medium">In {daysRemaining} days</p>
        </div>
      </div>
    </Card>
  );
}
