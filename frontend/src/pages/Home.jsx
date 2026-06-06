import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Coordination on Autopilot
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Ensuring every Thalassemia patient gets blood on time through AI-powered matching and automated outreach.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg" className="bg-red-600 hover:bg-red-700">
          <Link to="/register">Join as Donor</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </div>
  );
}
