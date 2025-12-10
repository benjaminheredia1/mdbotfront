import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { authService } from '../services/api';
import { LayoutDashboard, MessageSquareWarning, ThumbsUp, FileText, LogOut, Users } from 'lucide-react';
import './DashboardLayout.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Sistema Hospitalario</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/dashboard/quejas" className={isActive('/dashboard/quejas') ? 'active' : ''}>
            <MessageSquareWarning size={18} /> Quejas
          </Link>
          <Link to="/dashboard/felicitaciones" className={isActive('/dashboard/felicitaciones') ? 'active' : ''}>
            <ThumbsUp size={18} /> Felicitaciones
          </Link>
          <Link to="/dashboard/solicitudes" className={isActive('/dashboard/solicitudes') ? 'active' : ''}>
            <FileText size={18} /> Solicitudes
          </Link>
          <Link to="/dashboard/personas" className={isActive('/dashboard/personas') ? 'active' : ''}>
            <Users size={18} /> Personas
          </Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
