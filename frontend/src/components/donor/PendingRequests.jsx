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
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <div className="text-6xl mb-4">🩸</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">No active requests</h3>
        <p className="text-gray-500">You'll see blood requests here when patients nearby need your specific blood type.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-900">Pending Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((req) => (
          <Card key={req.id} className={`p-5 transition ${req.status === 'confirmed' ? 'border-green-400 bg-green-50' : 'hover:shadow-md'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{req.patientName}</h3>
                <p className="text-gray-500 text-sm">{req.hospital}</p>
              </div>
              {req.status === 'confirmed' ? (
                <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-100">Confirmed</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 hover:bg-red-100">
                  <Heart className="h-3 w-3" /> {req.bloodGroup}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {req.distance}</span>
              <span className="font-medium text-red-600">{req.urgency} Urgency</span>
            </div>
            
            {req.status === 'pending' ? (
              <Button onClick={() => handleViewDetails(req)} className="w-full bg-red-600 hover:bg-red-700">
                View Details
              </Button>
            ) : (
              <Button disabled variant="outline" className="w-full border-green-200 text-green-700 bg-green-100">
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
