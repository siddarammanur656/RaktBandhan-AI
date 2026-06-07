import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function NextEligibleDate() {
  const daysRemaining = 12;
  const eligibleDate = new Date();
  eligibleDate.setDate(eligibleDate.getDate() + daysRemaining);

  return (
    <Card className="h-full flex flex-col justify-center">
      <CardContent className="p-6">
        <div className="flex items-center gap-5">
          <div className="p-3.5 bg-brand-50 rounded-xl text-brand-600 shadow-sm border border-brand-100">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#71717A]">Next Eligible Date</h3>
            <p className="font-display text-3xl font-bold text-[#09090B] mt-1 tracking-tight">
              {eligibleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-sm text-brand-600 mt-1 font-medium bg-brand-50 w-fit px-2 py-0.5 rounded-md">In {daysRemaining} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
