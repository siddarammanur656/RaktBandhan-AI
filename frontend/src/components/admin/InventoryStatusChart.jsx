import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'O+', units: 45 },
  { name: 'O-', units: 12 },
  { name: 'A+', units: 38 },
  { name: 'A-', units: 8 },
  { name: 'B+', units: 52 },
  { name: 'B-', units: 14 },
  { name: 'AB+', units: 18 },
  { name: 'AB-', units: 4 },
];

export default function InventoryStatusChart() {
  return (
    <Card className="p-6 border border-[#E4E4E7] shadow-sm bg-white rounded-2xl h-full flex flex-col">
      <div className="mb-6">
        <h3 className="font-display text-xl font-semibold text-[#09090B] tracking-tight">Blood Inventory Overview</h3>
        <p className="text-sm text-[#71717A] mt-1">Available units across the network by blood type.</p>
      </div>
      <div className="w-full" style={{ height: 300, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A1A1AA', fontSize: 12 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A1A1AA', fontSize: 12 }} />
            <Tooltip 
              cursor={{ fill: '#F3F4F6' }}
              contentStyle={{ borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 500, color: '#09090B' }}
            />
            <Bar dataKey="units" name="Units Available" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
