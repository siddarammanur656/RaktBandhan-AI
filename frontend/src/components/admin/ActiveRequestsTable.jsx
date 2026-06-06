import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ActiveRequestsTable({ requests }) {
  const statusColors = {
    Matching: 'bg-blue-100 text-blue-800',
    Confirmed: 'bg-green-100 text-green-800',
    Completed: 'bg-gray-100 text-gray-800',
    Failed: 'bg-red-100 text-red-800'
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Blood</TableHead>
            <TableHead>Hospital</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium text-gray-900">{req.id}</TableCell>
              <TableCell>{req.patient}</TableCell>
              <TableCell className="font-bold text-red-600">{req.bloodGroup}</TableCell>
              <TableCell>{req.hospital}</TableCell>
              <TableCell>
                <Badge variant="outline" className={req.urgency === 'High' ? 'text-red-600 border-red-200 bg-red-50' : 'text-yellow-600 border-yellow-200 bg-yellow-50'}>
                  {req.urgency}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${statusColors[req.status]} hover:${statusColors[req.status]} border-none`}>
                  {req.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
