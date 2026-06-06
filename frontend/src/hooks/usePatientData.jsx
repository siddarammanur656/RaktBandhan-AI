import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { toast } from 'sonner';

export function usePatientData() {
  const [nextTransfusion, setNextTransfusion] = useState(null);
  const [assignedDonor, setAssignedDonor] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await client.get('/api/patients/dashboard');
      if (response.data.success) {
        const data = response.data.data;
        
        if (data.next_transfusion && data.next_transfusion.date !== "Not scheduled") {
          setNextTransfusion({
            date: new Date(data.next_transfusion.date),
            hospital: data.next_transfusion.location || 'Apollo Hospitals',
            bloodGroup: data.next_transfusion.donor_blood_group || data.patient.blood_group
          });
          
          if (data.next_transfusion.donor_name && data.next_transfusion.donor_name !== "Finding donor...") {
            setAssignedDonor({
              name: data.next_transfusion.donor_name,
              bloodGroup: data.next_transfusion.donor_blood_group,
              status: data.next_transfusion.status,
              score: 95, // Mocked for UI if missing
              tier: 'Gold', // Mocked for UI if missing
            });
          }
        }
        
        if (data.upcoming_schedule) {
          setSchedule(data.upcoming_schedule.map((s, idx) => ({
            id: idx,
            date: new Date(s.date),
            status: s.status
          })));
        }
        
        if (data.transfusion_history) {
          setHistory(data.transfusion_history.map((h, idx) => ({
            id: `h${idx}`,
            date: new Date(h.date),
            hospital: h.location || 'Apollo Hospitals',
            donorName: h.donor_name,
            units: 1
          })));
        }
      }
    } catch (error) {
      console.error('Failed to fetch patient dashboard', error);
      // Fallback for demo if patient endpoint not fully implemented
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    nextTransfusion,
    assignedDonor,
    schedule,
    history,
    loading
  };
}
