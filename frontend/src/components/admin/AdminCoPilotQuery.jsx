import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Search, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminCoPilotQuery({ onAsk }) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResult(null);

    const res = await onAsk(query);
    setResult(res);
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <Card className="p-6 border-blue-200 bg-blue-50/50 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" /> Natural Language Query
        </h3>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Ask anything about the platform data..." 
            className="flex-1 bg-white border-blue-200 focus-visible:ring-blue-500"
            disabled={isSearching}
          />
          <Button type="submit" disabled={!query.trim() || isSearching} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 transition-transform active:scale-95">
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Analyze
          </Button>
        </form>
      </Card>

      {isSearching && (
        <Card className="p-8 flex flex-col items-center justify-center flex-1 border-dashed border-gray-200 bg-gray-50 text-gray-500 min-h-[300px]">
          <Sparkles className="h-8 w-8 text-blue-400 animate-pulse mb-4" />
          <p>Analyzing platform data across all regions...</p>
        </Card>
      )}

      {!isSearching && result && (
        <Card className="p-6 flex-1 border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis Result</h3>
          <p className="text-gray-700 mb-6 leading-relaxed">{result.text}</p>
          
          <div className="rounded-md border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead>Fulfillment Rate</TableHead>
                  <TableHead className="text-right">Pending Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium text-gray-900">{row.region}</TableCell>
                    <TableCell className="text-red-600 font-semibold">{row.rate}</TableCell>
                    <TableCell className="text-right text-gray-700">{row.pending}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {!isSearching && !result && (
        <div className="flex-1 border border-gray-200 border-dashed bg-gray-50 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-500 min-h-[300px]">
          <Search className="h-10 w-10 mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to analyze</h3>
          <p className="max-w-sm text-sm">Type a question above to generate an instant report. E.g., "Which areas have the lowest auto-fulfillment rate today?"</p>
        </div>
      )}
    </div>
  );
}
