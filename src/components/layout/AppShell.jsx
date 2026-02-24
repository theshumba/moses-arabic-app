import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function AppShell() {
  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
