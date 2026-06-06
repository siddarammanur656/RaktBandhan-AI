import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DonorPoolAnalytics({ donors }) {
  const bloodGroups = donors.reduce((acc, donor) => {
    acc[donor.bloodGroup] = (acc[donor.bloodGroup] || 0) + 1;
    return acc;
  }, {});
  
  const chartData = Object.keys(bloodGroups).map(bg => ({
    name: bg,
    count: bloodGroups[bg]
  }));

  return (
    <div className="space-y-6">
      <Card className="p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Blood Group Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
              <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="count" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-900">Active Donors</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Reliability Score</TableHead>
              <TableHead>Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donors.map((donor) => (
              <TableRow key={donor.id}>
                <TableCell className="font-medium text-gray-500">{donor.id}</TableCell>
                <TableCell className="font-semibold text-gray-900">{donor.name}</TableCell>
                <TableCell className="font-bold text-red-600">{donor.bloodGroup}</TableCell>
                <TableCell>{donor.score}/100</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    donor.tier === 'Gold' ? 'border-yellow-400 text-yellow-700 bg-yellow-50' :
                    donor.tier === 'Silver' ? 'border-gray-400 text-gray-700 bg-gray-50' :
                    'border-orange-400 text-orange-800 bg-orange-50'
                  }>
                    {donor.tier}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
