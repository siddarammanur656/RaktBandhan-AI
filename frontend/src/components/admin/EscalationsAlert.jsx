import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EscalationsAlert({ count }) {
  if (count === 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-r-lg flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 shadow-sm">
      <div className="flex items-center gap-3 text-red-800">
        <div className="bg-red-100 p-2 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h4 className="font-bold text-red-900">Critical Escalations Required</h4>
          <p className="text-sm mt-1">There are {count} requests that have failed auto-matching and require immediate manual intervention.</p>
        </div>
      </div>
      <Button variant="destructive" size="sm" className="whitespace-nowrap">Review Escalations</Button>
    </div>
  );
}
