import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export default function DonationHistory({ history }) {
  if (!history || history.length === 0) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Donation History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((record) => (
            <div key={record.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="mt-1">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#09090B] tracking-tight">{record.hospital}</p>
                <p className="text-sm text-[#71717A]">For {record.patient}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-[#52525B]">
                  {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
