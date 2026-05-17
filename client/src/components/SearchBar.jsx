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
      className={`px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 ${
        className ?? 'w-64 border border-[rgba(0,49,53,0.12)] bg-[#fefefe] text-[#003135] placeholder:text-[#0FA4AF]/50 focus:ring-[#0FA4AF]'
      }`}
    />
  );
}
