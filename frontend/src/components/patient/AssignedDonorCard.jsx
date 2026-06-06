import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, MessageCircle } from 'lucide-react';

export default function AssignedDonorCard({ donor }) {
  if (!donor) return null;

  return (
    <Card className="p-6 border-green-200 bg-green-50/30">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-medium text-green-800 uppercase tracking-wider mb-1">Assigned Donor</h3>
          <p className="text-xl font-bold text-gray-900">{donor.name}</p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Badge variant="outline" className="flex items-center gap-1 bg-white border-gray-200 text-gray-700">
          <Heart className="h-3 w-3 text-red-500" /> {donor.bloodGroup}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1 bg-white border-gray-200 text-gray-700">
          <MapPin className="h-3 w-3 text-gray-400" /> {donor.distance}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1 bg-white border-yellow-200 text-yellow-800">
          🏆 {donor.tier}
        </Badge>
      </div>

      <Button className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
        <MessageCircle className="h-4 w-4" /> Message Donor
      </Button>
    </Card>
  );
}
