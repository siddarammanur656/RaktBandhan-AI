import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-red-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🩸</span> RaktBandhan AI
          </Link>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-red-200 transition">Login</Link>
            <Link to="/register" className="hover:text-red-200 transition">Register</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
