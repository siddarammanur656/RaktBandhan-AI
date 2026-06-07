import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import RequestDetailsModal from './RequestDetailsModal';
import { toast } from 'sonner';

export default function PendingRequests({ requests, onAccept, onDecline }) {
  const [selectedReq, setSelectedReq] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (req) => {
    setSelectedReq(req);
    setIsModalOpen(true);
  };

  const handleAccept = async (id) => {
    const res = await onAccept(id);
    if (res.success) toast.success('Request accepted! Thank you for helping.');
  };

  const handleDecline = async (id) => {
    const res = await onDecline(id);
    if (res.success) toast.info('Request declined. We will notify other donors.');
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-border shadow-sm">
        <div className="text-6xl mb-6 animate-pulse-slow">🩸</div>
        <h3 className="text-xl font-display font-semibold mb-2 text-[#09090B]">No active requests</h3>
        <p className="text-[#71717A] max-w-md mx-auto">You'll see blood requests here when patients nearby need your specific blood type.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-display font-bold tracking-tight mb-6 text-[#09090B]">Pending Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <Card key={req.id} className={`p-6 ${req.status === 'confirmed' ? 'border-green-200 bg-green-50' : ''}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-[#09090B] tracking-tight">{req.patientName}</h3>
                <p className="text-[#71717A] text-sm mt-0.5">{req.hospital}</p>
              </div>
              {req.status === 'confirmed' ? (
                <Badge variant="active">Confirmed</Badge>
              ) : (
                <Badge variant="default" className="flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-current" /> {req.bloodGroup}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-4 text-sm text-[#52525B] mb-6 font-medium">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[#A1A1AA]" /> {req.distance}</span>
              <span className="font-semibold text-brand-600">{req.urgency} Urgency</span>
            </div>
            
            {req.status === 'pending' ? (
              <Button onClick={() => handleViewDetails(req)} className="w-full">
                View Details
              </Button>
            ) : (
              <Button disabled variant="outline" className="w-full bg-green-50 text-green-700 border-green-200 opacity-100">
                You have accepted this request
              </Button>
            )}
          </Card>
        ))}
      </div>
      
      <RequestDetailsModal 
        request={selectedReq} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </div>
  );
}
