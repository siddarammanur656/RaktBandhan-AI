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
        <Link to="/register">
          <Button size="lg" className="bg-red-600 hover:bg-red-700">
            Join as Donor
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="outline" size="lg">
            Login
          </Button>
        </Link>
      </div>
    </div>
  );
}
