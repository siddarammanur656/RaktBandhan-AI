import { useState } from 'react';

export function useAdminData() {
  const [kpis] = useState({
    totalRequests: 142,
    autoFulfilled: 68,
    activeDonors: 1205,
    escalations: 3
  });

  const [activeRequests] = useState([
    { id: 'REQ-001', patient: 'Aarav Sharma', bloodGroup: 'B+', hospital: 'Apollo Hospitals', status: 'Matching', urgency: 'High', date: '2026-06-06' },
    { id: 'REQ-002', patient: 'Kiara Singh', bloodGroup: 'O-', hospital: 'KIMS', status: 'Confirmed', urgency: 'Medium', date: '2026-06-06' },
    { id: 'REQ-003', patient: 'Rohan Verma', bloodGroup: 'A+', hospital: 'Care Hospital', status: 'Failed', urgency: 'High', date: '2026-06-05' },
    { id: 'REQ-004', patient: 'Priya Das', bloodGroup: 'AB+', hospital: 'Yashoda Hospitals', status: 'Completed', urgency: 'Low', date: '2026-06-05' }
  ]);

  const [donors] = useState([
    { id: 'D-001', name: 'Rahul Kumar', bloodGroup: 'B+', tier: 'Gold', score: 92, lastDonation: '2026-04-10' },
    { id: 'D-002', name: 'Sneha Patel', bloodGroup: 'O-', tier: 'Silver', score: 75, lastDonation: '2025-12-05' },
    { id: 'D-003', name: 'Amit Singh', bloodGroup: 'A+', tier: 'Bronze', score: 45, lastDonation: '2026-01-20' },
    { id: 'D-004', name: 'Neha Gupta', bloodGroup: 'AB+', tier: 'Gold', score: 98, lastDonation: '2026-05-15' }
  ]);

  const [insights] = useState([
    { id: 1, text: "3 requests failed in Madhapur due to no B- donors. Recommend targeted outreach campaign.", action: "Start Campaign" },
    { id: 2, text: "Donor retention dropped by 4% this week. Consider sending personalized thank you notes.", action: "View Report" }
  ]);

  return { kpis, activeRequests, donors, insights };
}
