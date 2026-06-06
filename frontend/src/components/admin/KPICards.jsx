import { Card } from '@/components/ui/card';
import { Activity, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export default function KPICards({ kpis }) {
  const cards = [
    { title: 'Total Requests Today', value: kpis.totalRequests, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Auto-Fulfilled %', value: `${kpis.autoFulfilled}%`, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Active Donors', value: kpis.activeDonors, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Escalations', value: kpis.escalations, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => (
        <Card key={i} className="p-4 flex items-center gap-4">
          <div className={`p-3 rounded-lg ${c.bg} ${c.color}`}>
            <c.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{c.title}</p>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
