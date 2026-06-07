import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', requests: 12, fulfilled: 10 },
  { name: 'Tue', requests: 19, fulfilled: 15 },
  { name: 'Wed', requests: 15, fulfilled: 14 },
  { name: 'Thu', requests: 22, fulfilled: 20 },
  { name: 'Fri', requests: 28, fulfilled: 25 },
  { name: 'Sat', requests: 35, fulfilled: 32 },
  { name: 'Sun', requests: 20, fulfilled: 19 },
];

export default function OverviewChart() {
  return (
    <Card className="p-6 border border-[#E4E4E7] shadow-sm bg-white rounded-2xl h-full flex flex-col">
      <div className="mb-6">
        <h3 className="font-display text-xl font-semibold text-[#09090B] tracking-tight">Requests Volume (7 Days)</h3>
        <p className="text-sm text-[#71717A] mt-1">Comparison of total requests versus auto-fulfilled requests.</p>
      </div>
      <div className="w-full" style={{ height: 300, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorFulfilled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A1A1AA', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A1A1AA', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 500 }}
            />
            <Area type="monotone" dataKey="requests" name="Total Requests" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
            <Area type="monotone" dataKey="fulfilled" name="Auto-Fulfilled" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorFulfilled)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
