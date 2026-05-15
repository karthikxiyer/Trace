import { Outlet, useNavigate } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import SearchBar from '../components/SearchBar';

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900 mr-4">Trace</h1>
        <SearchBar />
        <div className="flex-1" />
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Sign out
        </button>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 flex gap-8">
        <FilterSidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
