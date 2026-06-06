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
    <div className="glass-card rounded-2xl overflow-hidden border border-white/20 dark:border-white/5">
      <Table>
        <TableHeader className="bg-background/50 backdrop-blur-md">
          <TableRow className="border-border">
            <TableHead className="font-semibold text-foreground/70 py-4 pl-6">ID</TableHead>
            <TableHead className="font-semibold text-foreground/70">Patient</TableHead>
            <TableHead className="font-semibold text-foreground/70">Blood</TableHead>
            <TableHead className="font-semibold text-foreground/70">Hospital</TableHead>
            <TableHead className="font-semibold text-foreground/70">Urgency</TableHead>
            <TableHead className="font-semibold text-foreground/70">Status</TableHead>
            <TableHead className="text-right font-semibold text-foreground/70 pr-6">Actions</TableHead>
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
              <TableRow key={req.id} className="border-border/50 hover:bg-background/40 transition-colors group">
                <TableCell className="font-bold text-foreground pl-6 py-4">{req.id}</TableCell>
                <TableCell className="font-medium text-foreground/90">{req.patient}</TableCell>
                <TableCell>
                  <span className="font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">{req.bloodGroup}</span>
                </TableCell>
                <TableCell className="text-muted-foreground font-medium">{req.hospital}</TableCell>
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
                  <Button variant="ghost" size="sm" className="font-bold text-primary hover:text-primary-foreground hover:bg-primary rounded-xl transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
                    Details <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
