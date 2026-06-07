import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Critical', value: 5, color: '#EF4444' }, // red
  { name: 'Urgent', value: 12, color: '#F59E0B' },  // amber
  { name: 'Normal', value: 35, color: '#10B981' },  // green
];

export default function UrgencyChart() {
  return (
    <Card className="p-6 border border-[#E4E4E7] shadow-sm bg-white rounded-2xl h-full flex flex-col">
      <div className="mb-6">
        <h3 className="font-display text-xl font-semibold text-[#09090B] tracking-tight">Request Urgency</h3>
        <p className="text-sm text-[#71717A] mt-1">Current breakdown of active request priorities.</p>
      </div>
      <div className="w-full" style={{ height: 300, minHeight: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: '1px solid #E4E4E7', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 500 }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
