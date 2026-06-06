import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

const mockRequests = [
  { id: 'r1', patientName: 'Aarav Sharma', age: 7, bloodGroup: 'B+', distance: '2.1 km', urgency: 'High', hospital: 'Apollo Hospitals', status: 'pending' },
  { id: 'r2', patientName: 'Kiara Singh', age: 4, bloodGroup: 'B+', distance: '5.4 km', urgency: 'Medium', hospital: 'KIMS', status: 'pending' }
];

const mockHistory = [
  { id: 'h1', date: '2025-10-15', patient: 'Rohan Verma', hospital: 'Apollo Hospitals', status: 'completed' },
  { id: 'h2', date: '2025-05-20', patient: 'Priya Das', hospital: 'Care Hospital', status: 'completed' }
];

export function useDonorData() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [score, setScore] = useState(85);
  const [tier, setTier] = useState('Gold');
  
  useEffect(() => {
    if (!user) return;
    const savedRequests = localStorage.getItem(`rb_donor_requests_${user.user_id}`);
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    } else {
      setRequests(mockRequests);
    }
    setHistory(mockHistory);
  }, [user]);

  const acceptRequest = async (requestId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updated = requests.map(r => r.id === requestId ? { ...r, status: 'confirmed' } : r);
        setRequests(updated);
        localStorage.setItem(`rb_donor_requests_${user?.user_id}`, JSON.stringify(updated));
        setScore(prev => Math.min(100, prev + 5));
        resolve({ success: true });
      }, 500);
    });
  };

  const declineRequest = async (requestId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updated = requests.map(r => r.id === requestId ? { ...r, status: 'declined' } : r);
        setRequests(updated);
        localStorage.setItem(`rb_donor_requests_${user?.user_id}`, JSON.stringify(updated));
        resolve({ success: true });
      }, 300);
    });
  };

  return {
    requests: requests.filter(r => r.status !== 'declined'),
    history,
    score,
    tier,
    acceptRequest,
    declineRequest
  };
}
