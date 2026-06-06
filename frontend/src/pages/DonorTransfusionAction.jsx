import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import client from '@/api/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function DonorTransfusionAction() {
  const { requestId } = useParams();
  const [searchParams] = useSearchParams();
  const donorId = searchParams.get('donor');
  const navigate = useNavigate();
  
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  useEffect(() => {
    if (!requestId || !donorId) {
      toast.error('Invalid link.');
      navigate('/');
      return;
    }
    
    // Fetch request details
    const fetchRequest = async () => {
      try {
        const response = await client.get(`/api/requests/${requestId}`);
        if (response.data.success) {
          setRequestData(response.data.data);
        } else {
          toast.error('Request not found');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load request details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRequest();
  }, [requestId, donorId, navigate]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await client.get(`/api/requests/accept?request_id=${requestId}&donor_id=${donorId}`);
      toast.success('Thank you! Transfusion confirmed.');
      navigate('/donor-dashboard');
    } catch (err) {
      toast.error('Failed to confirm request.');
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleReason) {
      toast.error('Please provide a new date and a reason.');
      return;
    }
    setActionLoading(true);
    try {
      await client.post(`/api/requests/${requestId}/reschedule`, {
        new_date: rescheduleDate,
        reason: rescheduleReason,
        donor_id: donorId
      });
      toast.success('Reschedule request submitted successfully.');
      navigate('/donor-dashboard');
    } catch (err) {
      toast.error('Failed to reschedule.');
      setActionLoading(false);
    }
  };

  const handleOptOut = async () => {
    if (!window.confirm("Are you sure you want to permanently leave this patient's donor circle? We will try to find a replacement immediately.")) {
      return;
    }
    setActionLoading(true);
    try {
      await client.post(`/api/requests/${requestId}/opt-out`, { donor_id: donorId });
      toast.success('You have been removed from the donor circle.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to opt out.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20">Loading request details...</div>;
  }

  if (!requestData) {
    return <div className="flex justify-center py-20">Request not found or expired.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Manage Donation Request</h1>
      
      <Card className="p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 mb-6 border-b pb-6 border-gray-100">
          <div className="bg-red-50 p-3 rounded-full">
            <Calendar className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Thalassemia Support Circle</h2>
            <p className="text-gray-500 text-sm mt-1">Patient: {requestData.patient_name}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500">Scheduled Date</span>
            <span className="font-semibold">{requestData.created_at ? new Date(requestData.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500">Blood Group</span>
            <span className="font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">{requestData.blood_group}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-gray-500">Status</span>
            <span className="font-semibold capitalize text-blue-600">{requestData.status}</span>
          </div>
        </div>

        {!showReschedule ? (
          <div className="space-y-4">
            <Button onClick={handleAccept} disabled={actionLoading || requestData.status === 'confirmed'} className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg gap-2">
              <CheckCircle className="h-5 w-5" /> I Confirm My Availability
            </Button>
            
            <Button onClick={() => setShowReschedule(true)} disabled={actionLoading || requestData.status === 'confirmed'} variant="outline" className="w-full py-6 text-lg gap-2 border-gray-300">
              <Clock className="h-5 w-5" /> I Need to Reschedule
            </Button>
            
            <div className="pt-6 mt-6 border-t border-gray-100 text-center">
              <button onClick={handleOptOut} disabled={actionLoading} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors">
                <AlertCircle className="h-4 w-4" /> Remove me from this patient's circle
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-6">
              <p className="text-sm text-orange-800">
                Rescheduling will propose a new date. We will verify if the patient can accommodate this change.
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="new-date">Proposed New Date</Label>
              <Input 
                id="new-date" 
                type="date" 
                value={rescheduleDate} 
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="reason">Reason for Rescheduling</Label>
              <Input 
                id="reason" 
                placeholder="Briefly explain why you need to reschedule" 
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button onClick={() => setShowReschedule(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleReschedule} disabled={actionLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Submit Reschedule
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
