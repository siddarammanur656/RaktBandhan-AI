import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { toast } from 'sonner';

export function useAdminData() {
  const [kpis, setKpis] = useState({
    totalRequests: 0,
    autoFulfilled: 0,
    activeDonors: 0,
    escalations: 0
  });

  const [activeRequests, setActiveRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch Dashboard Stats
      const dashboardRes = await client.get('/api/admin/dashboard');
      if (dashboardRes.data.success) {
        const { today_stats, donor_stats, ai_insights, donors: backendDonors } = dashboardRes.data.data;
        setKpis({
          totalRequests: today_stats.total_requests || 0,
          autoFulfilled: today_stats.auto_fulfilled || 0,
          activeDonors: donor_stats.active_donors || 0,
          escalations: today_stats.escalations || 0
        });
        
        setInsights(ai_insights.map((text, idx) => ({
          id: idx,
          text,
          action: "Review"
        })));
        
        if (backendDonors) {
          setDonors(backendDonors);
        }
      }

      // Fetch Active Requests
      const reqRes = await client.get('/api/requests?limit=10');
      if (reqRes.data.success) {
        setActiveRequests(reqRes.data.data.requests.map(r => ({
          id: r.request_id,
          patient: r.patient_name,
          bloodGroup: r.blood_group,
          hospital: r.city,
          status: r.status,
          urgency: 'Normal', // Default if not provided
          date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : 'Unknown'
        })));
      }
    } catch (error) {
      console.error("Failed to fetch admin data", error);
      toast.error('Could not load admin dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const askCoPilot = async (query) => {
    try {
      const response = await client.post('/api/admin/copilot', { query });
      if (response.data.success) {
        return {
          text: response.data.data.query_interpretation + " " + (response.data.data.suggested_followup || ""),
          data: response.data.data.results.map(r => ({
            region: r.name || 'Unknown',
            rate: r.reason_inactive || 'N/A',
            pending: r.suggested_action || 'N/A'
          }))
        };
      }
    } catch (error) {
      toast.error("Co-Pilot is currently offline or returning an error.");
      return null;
    }
  };

  return { kpis, activeRequests, donors, insights, loading, askCoPilot };
}
