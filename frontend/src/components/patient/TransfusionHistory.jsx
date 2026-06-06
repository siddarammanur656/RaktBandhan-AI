import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Droplet } from 'lucide-react';

export default function TransfusionHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-gray-500" />
        <h3 className="text-xl font-semibold text-gray-900">Transfusion History</h3>
      </div>
      
      <div className="space-y-4">
        {history.map((record) => (
          <div key={record.id} className="flex items-start justify-between border-l-2 border-gray-200 pl-4 pb-4 last:pb-0">
            <div>
              <p className="font-medium text-gray-900">
                {record.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-sm text-gray-500 mt-1">{record.hospital}</p>
              <p className="text-sm text-gray-500">Donor: {record.donorName}</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-100">
              <Droplet className="h-3 w-3" /> {record.units} Unit
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
