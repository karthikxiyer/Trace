import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SearchBar() {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Sync input with URL on page load if already on /search
  useEffect(() => {
    if (location.pathname !== '/search') setValue('');
  }, [location.pathname]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (value.trim()) {
        navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      } else if (location.pathname === '/search') {
        navigate('/');
      }
    }, 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <input
      type="search"
      value={value}
      onChange={e => setValue(e.target.value)}
      placeholder="Search links…"
      className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
    />
  );
}
