import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Feed from './pages/Feed';
import Search from './pages/Search';
import Archive from './pages/Archive';
import Save from './pages/Save';
import ReaderView from './pages/ReaderView';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/save" element={<Save />} />
      <Route path="/reader/:id" element={<ProtectedRoute><ReaderView /></ProtectedRoute>} />
      <Route
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Feed />} />
        <Route path="search" element={<Search />} />
        <Route path="archive" element={<Archive />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
