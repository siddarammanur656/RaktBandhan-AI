import { Card } from '@/components/ui/card';
import { Clock, Hospital, Heart } from 'lucide-react';

export default function NextTransfusionCard({ data }) {
  const daysRemaining = Math.ceil((data.date - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="p-6 bg-red-600 text-white shadow-lg border-0 overflow-hidden relative">
      <div className="absolute -right-4 -top-4 opacity-10">
        <Heart className="h-32 w-32" />
      </div>
      
      <div className="relative z-10">
        <h2 className="text-red-100 font-medium uppercase tracking-wider text-sm mb-1">Next Transfusion</h2>
        <div className="flex items-end gap-3 mb-6">
          <span className="text-5xl font-bold">{daysRemaining}</span>
          <span className="text-xl text-red-100 mb-1">Days</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-red-700/50 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4 text-red-200" />
            <span className="font-medium">{data.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 bg-red-700/50 px-3 py-2 rounded-lg">
            <Hospital className="h-4 w-4 text-red-200" />
            <span className="font-medium">{data.hospital}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
