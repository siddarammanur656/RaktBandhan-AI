import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 w-full animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-64 bg-[#F4F4F5] rounded-lg"></div>
        <div className="h-10 w-32 bg-[#F4F4F5] rounded-lg"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="h-4 w-24 bg-[#E4E4E7] rounded"></div>
                <div className="h-8 w-8 bg-[#F4F4F5] rounded-full"></div>
              </div>
              <div className="h-10 w-20 bg-[#E4E4E7] rounded mb-2"></div>
              <div className="h-3 w-40 bg-[#F4F4F5] rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border shadow-sm mt-8">
        <CardHeader>
          <div className="h-6 w-48 bg-[#E4E4E7] rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-border last:border-0">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-[#E4E4E7] rounded"></div>
                <div className="h-3 w-24 bg-[#F4F4F5] rounded"></div>
              </div>
              <div className="h-8 w-24 bg-[#F4F4F5] rounded-full"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
