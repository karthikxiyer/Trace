import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import MobileFilterBar from '../components/MobileFilterBar';
import SearchBar from '../components/SearchBar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-20">
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4 max-w-5xl mx-auto px-6 py-3">
          <span className="text-sm font-semibold tracking-tight text-neutral-900 mr-2">Trace</span>
          <SearchBar />
          <div className="flex-1" />
          <button
            onClick={handleLogout}
            className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          {searchOpen ? (
            <div className="flex items-center gap-3 px-4 py-3">
              <SearchBar autoFocus className="flex-1" />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-sm text-neutral-500 shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-semibold tracking-tight text-neutral-900">Trace</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="text-neutral-500 hover:text-neutral-800 transition-colors"
                  aria-label="Search"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <MobileFilterBar />

      <div className="max-w-5xl mx-auto px-4 py-6 md:flex md:gap-10">
        <div className="hidden md:block">
          <FilterSidebar />
        </div>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
