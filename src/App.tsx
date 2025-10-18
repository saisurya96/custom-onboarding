import { Outlet, NavLink } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b flex gap-4">
        <NavLink to="/" className={({ isActive }) => isActive ? 'font-semibold' : ''}>Onboarding</NavLink>
        <NavLink to="/admin" className={({ isActive }) => isActive ? 'font-semibold' : ''}>Admin</NavLink>
        <NavLink to="/data" className={({ isActive }) => isActive ? 'font-semibold' : ''}>Data</NavLink>
      </header>
      <main className="p-4 flex-1">
        <Outlet />
      </main>
    </div>
  );
}


