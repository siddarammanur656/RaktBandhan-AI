import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export default function DonationHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <Card className="p-6 h-full">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Donation History</h3>
      <div className="space-y-4">
        {history.map((record) => (
          <div key={record.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="mt-1">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{record.hospital}</p>
              <p className="text-sm text-gray-500">For {record.patient}</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-gray-50 text-gray-600">
                {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
