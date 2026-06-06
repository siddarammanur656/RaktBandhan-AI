import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';

export default function UpcomingSchedule({ schedule }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <CalendarDays className="h-5 w-5 text-gray-500" />
        <h3 className="text-xl font-semibold text-gray-900">Upcoming Schedule</h3>
      </div>
      
      <div className="space-y-4">
        {schedule.map((session, index) => (
          <div key={session.id} className={`flex items-center justify-between p-3 rounded-lg border ${index === 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex flex-col">
              <span className={`font-medium ${index === 0 ? 'text-red-900' : 'text-gray-900'}`}>
                {session.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-xs text-gray-500 mt-1">Transfusion cycle</span>
            </div>
            {session.status === 'scheduled' ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">Scheduled</Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-200 text-gray-700">Pending</Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
