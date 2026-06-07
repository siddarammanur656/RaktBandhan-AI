import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

export default function ActiveRequestsTable({ requests }) {
  const statusColors = {
    Matching: 'bg-primary/10 text-primary border-primary/20',
    Confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    Completed: 'bg-muted text-muted-foreground border-border',
    Failed: 'bg-rose-600/10 text-rose-600 border-rose-600/20'
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E4E4E7] shadow-sm w-full">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-brand-50/50">
            <TableRow className="border-[#E4E4E7]">
            <TableHead className="font-semibold text-[#71717A] py-4 pl-6">ID</TableHead>
            <TableHead className="font-semibold text-[#71717A]">Patient</TableHead>
            <TableHead className="font-semibold text-[#71717A]">Blood</TableHead>
            <TableHead className="font-semibold text-[#71717A]">Hospital</TableHead>
            <TableHead className="font-semibold text-[#71717A]">Urgency</TableHead>
            <TableHead className="font-semibold text-[#71717A]">Status</TableHead>
            <TableHead className="text-right font-semibold text-[#71717A] pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground font-medium">
                No active requests found.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((req) => (
              <TableRow key={req.id} className="border-[#E4E4E7] hover:bg-[#F4F4F5]/50 transition-colors group">
                <TableCell className="font-bold text-[#09090B] pl-6 py-4 truncate max-w-[120px]">{req.id}</TableCell>
                <TableCell className="font-medium text-[#09090B]">{req.patient}</TableCell>
                <TableCell>
                  <span className="font-extrabold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">{req.bloodGroup}</span>
                </TableCell>
                <TableCell className="text-[#52525B] font-medium">{req.hospital}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`font-semibold ${req.urgency === 'High' ? 'text-rose-600 border-rose-600/30 bg-rose-600/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'}`}>
                    {req.urgency}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColors[req.status]} font-bold`}>
                    {req.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="font-bold text-brand-600 hover:text-white hover:bg-brand-600 rounded-xl transition-all"
                    onClick={() => alert(`Showing details for request ${req.id}`)}
                  >
                    Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
