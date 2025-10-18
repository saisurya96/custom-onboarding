import { Outlet, NavLink, useNavigate } from 'react-router-dom';

async function apiLogout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
}

export default function App() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b flex gap-4 items-center">
        <NavLink to="/" className={({ isActive }) => isActive ? 'font-semibold' : ''}>Onboarding</NavLink>
        <NavLink to="/admin" className={({ isActive }) => isActive ? 'font-semibold' : ''}>Admin</NavLink>
        <NavLink to="/data" className={({ isActive }) => isActive ? 'font-semibold' : ''}>Data</NavLink>
        <span className="flex-1" />
        <button
          className="px-3 py-1 border rounded"
          onClick={async () => { await apiLogout(); navigate('/'); }}
        >Logout</button>
      </header>
      <main className="p-4 flex-1">
        <Outlet />
      </main>
    </div>
  );
}


