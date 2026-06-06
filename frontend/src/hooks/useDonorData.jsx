import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { toast } from 'sonner';

export function useDonorData() {
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(0);
  const [tier, setTier] = useState('Bronze');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await client.get('/api/donors/dashboard');
      if (response.data.success) {
        const { pending_requests, recent_donations, donor } = response.data.data;
        // Map backend keys to frontend keys
        setRequests(pending_requests.map(r => ({
          id: r.request_id,
          patientName: r.patient_name,
          bloodGroup: r.blood_group_needed || r.blood_group,
          distance: `${r.distance_km} km`,
          urgency: r.urgency,
          hospital: r.hospital || 'Unknown',
          status: 'pending'
        })));
        
        setHistory(recent_donations.map(d => ({
          id: d.donation_id,
          date: d.date,
          patient: d.patient_name,
          hospital: d.location || d.hospital,
          status: 'completed'
        })));
        
        setScore(donor.reliability_score || 0);
        setTier(donor.tier || 'Bronze');
      }
    } catch (error) {
      console.error('Failed to fetch donor dashboard', error);
      toast.error('Could not load your dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const acceptRequest = async (requestId) => {
    try {
      const response = await client.post(`/api/donors/requests/${requestId}/accept`);
      if (response.data.success) {
        toast.success('Request accepted successfully!');
        fetchDashboard(); // Refresh data
        return { success: true };
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to accept request');
      return { success: false };
    }
  };

  const declineRequest = async (requestId) => {
    try {
      const response = await client.post(`/api/donors/requests/${requestId}/decline`, { reason: 'Not available' });
      if (response.data.success) {
        toast.info('Request declined.');
        fetchDashboard(); // Refresh data
        return { success: true };
      }
    } catch (error) {
      toast.error('Failed to decline request');
      return { success: false };
    }
  };

  return {
    requests,
    history,
    score,
    tier,
    loading,
    acceptRequest,
    declineRequest
  };
}
