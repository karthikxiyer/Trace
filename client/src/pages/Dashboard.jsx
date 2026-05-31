import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import FilterSidebar from '../components/FilterSidebar';
import MobileFilterBar from '../components/MobileFilterBar';
import SearchBar from '../components/SearchBar';

const SEARCH_CLASS = 'w-full md:w-56 border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] text-white placeholder:text-[rgba(255,255,255,0.4)] focus:ring-[rgba(175,221,229,0.5)]';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[#f0f8f9]">
      <header className="bg-[#003135] sticky top-0 z-20 flex flex-col" style={{ height: '20vh', minHeight: '80px' }}>
        {searchOpen ? (
          <div className="flex items-center gap-3 px-4 h-full">
            <SearchBar autoFocus className={`flex-1 ${SEARCH_CLASS}`} />
            <button
              onClick={() => setSearchOpen(false)}
              className="text-sm text-[#AFDDE5]/70 hover:text-[#AFDDE5] shrink-0 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 flex items-center justify-center px-4">
              <span
                className="font-black tracking-tighter leading-none text-[#AFDDE5] select-none"
                style={{ fontSize: 'clamp(2rem, 14vh, 14vh)' }}
              >
                TRACE
              </span>
            </div>

            <div className="border-t border-[rgba(175,221,229,0.12)] px-4 md:px-6 py-2 flex items-center gap-3">
              <div className="hidden md:block">
                <SearchBar className={`w-52 ${SEARCH_CLASS}`} />
              </div>
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden text-[#AFDDE5]/50 hover:text-[#AFDDE5] transition-colors"
                aria-label="Search"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
              <div className="flex-1" />
              <button
                onClick={handleLogout}
                className="text-xs text-[#AFDDE5]/40 hover:text-[#AFDDE5] transition-colors"
              >
                Sign out
              </button>
            </div>
          </>
        )}
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
