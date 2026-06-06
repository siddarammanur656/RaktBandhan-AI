import { Card } from '@/components/ui/card';
import { Activity, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export default function KPICards({ kpis }) {
  const cards = [
    { title: 'Total Requests Today', value: kpis.totalRequests, icon: Activity, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { title: 'Auto-Fulfilled %', value: `${kpis.autoFulfilled}%`, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { title: 'Active Donors', value: kpis.activeDonors, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { title: 'Escalations', value: kpis.escalations, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-600/10', border: 'border-rose-600/20' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((c, i) => (
        <Card key={i} className={`p-6 flex flex-col gap-4 glass-card border-l-4 ${c.border} rounded-2xl`}>
          <div className="flex justify-between items-start w-full">
            <div className={`p-3.5 rounded-2xl ${c.bg} ${c.color} shadow-sm border border-white/20 dark:border-white/5`}>
              <c.icon className="h-7 w-7" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-foreground tracking-tight">{c.value}</p>
            <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mt-2">{c.title}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
