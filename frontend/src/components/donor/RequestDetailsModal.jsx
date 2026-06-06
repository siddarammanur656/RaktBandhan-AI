import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, Clock, Hospital } from 'lucide-react';
import { useState } from 'react';

export default function RequestDetailsModal({ request, open, onOpenChange, onAccept, onDecline }) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  if (!request) return null;

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAccept(request.id);
    setIsAccepting(false);
    onOpenChange(false);
  };

  const handleDecline = async () => {
    setIsDeclining(true);
    await onDecline(request.id);
    setIsDeclining(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Urgent Blood Request</DialogTitle>
          <DialogDescription>
            A patient nearby urgently needs your help.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{request.patientName}, {request.age}yo</h3>
              <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                <Hospital className="h-4 w-4" /> {request.hospital}
              </div>
            </div>
            <div className="bg-red-100 text-red-700 p-2 rounded-lg text-xl font-bold flex items-center gap-1">
              <Heart className="h-5 w-5" /> {request.bloodGroup}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="secondary" className="flex items-center gap-1 bg-gray-100">
              <MapPin className="h-3 w-3" /> {request.distance} away
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 text-red-600 border-red-200 bg-red-50">
              <Clock className="h-3 w-3" /> {request.urgency} Urgency
            </Badge>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-start">
          <Button onClick={handleAccept} disabled={isAccepting || isDeclining} className="flex-1 bg-red-600 hover:bg-red-700">
            {isAccepting ? 'Accepting...' : 'Accept Request'}
          </Button>
          <Button onClick={handleDecline} disabled={isAccepting || isDeclining} variant="outline" className="flex-1">
            {isDeclining ? 'Declining...' : 'Decline'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
