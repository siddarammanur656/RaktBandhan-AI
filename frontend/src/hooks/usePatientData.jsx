import { useState } from 'react';
import { useAuth } from './useAuth';

export function usePatientData() {
  const { user } = useAuth();
  
  const [nextTransfusion] = useState({
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    hospital: 'Apollo Hospitals',
    bloodGroup: 'B+'
  });

  const [assignedDonor] = useState({
    name: 'Rahul Kumar',
    bloodGroup: 'B+',
    distance: '2.1 km',
    score: 92,
    tier: 'Gold',
    status: 'confirmed'
  });

  const [schedule] = useState([
    { id: 1, date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), status: 'scheduled' },
    { id: 2, date: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000), status: 'pending' },
    { id: 3, date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), status: 'pending' }
  ]);

  const [history] = useState([
    { id: 'h1', date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), hospital: 'Apollo Hospitals', units: 1, donorName: 'Priya Das' },
    { id: 'h2', date: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000), hospital: 'Apollo Hospitals', units: 1, donorName: 'Arjun Reddy' }
  ]);

  return {
    nextTransfusion,
    assignedDonor,
    schedule,
    history
  };
}
