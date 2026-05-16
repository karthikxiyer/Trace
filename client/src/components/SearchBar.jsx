import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SearchBar({ autoFocus, className }) {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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
      autoFocus={autoFocus}
      className={`px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50 placeholder:text-neutral-400 ${className ?? 'w-64'}`}
    />
  );
}
