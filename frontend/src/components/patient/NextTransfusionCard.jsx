import { Card } from '@/components/ui/card';
import { Clock, Hospital, Heart, Calendar } from 'lucide-react';

export default function NextTransfusionCard({ data }) {
  if (!data || !data.date || isNaN(data.date)) {
    return (
      <Card className="p-8 glass text-foreground shadow-lg border border-border overflow-hidden relative min-h-[200px] flex flex-col justify-center items-center text-center">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">No Transfusion Scheduled</h2>
        <p className="text-muted-foreground">Your next transfusion schedule has not been set up yet. Please update your profile or contact an admin.</p>
      </Card>
    );
  }

  const daysRemaining = Math.ceil((data.date - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-rose-600 text-primary-foreground shadow-xl border-0 overflow-hidden relative">
      <div className="absolute -right-4 -top-4 opacity-10">
        <Heart className="h-32 w-32" />
      </div>
      
      <div className="relative z-10">
        <h2 className="text-primary-foreground/80 font-bold uppercase tracking-wider text-sm mb-1">Next Transfusion</h2>
        <div className="flex items-end gap-3 mb-6">
          <span className="text-6xl font-extrabold tracking-tighter">{daysRemaining > 0 ? daysRemaining : 0}</span>
          <span className="text-xl text-primary-foreground/90 mb-1.5 font-medium">Days</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <Clock className="h-4 w-4 text-primary-foreground/80" />
            <span className="font-semibold">{data.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <Hospital className="h-4 w-4 text-primary-foreground/80" />
            <span className="font-semibold">{data.hospital}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
