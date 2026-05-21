import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex gap-6">
        <Link to="/dashboard" className="font-semibold hover:underline">Dashboard</Link>
        <Link to="/projects" className="hover:underline">Projects</Link>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm">{user?.email}</span>
        <button onClick={handleLogout} className="text-sm bg-white text-indigo-600 px-3 py-1 rounded hover:bg-indigo-50">
          Logout
        </button>
      </div>
    </nav>
  );
}
