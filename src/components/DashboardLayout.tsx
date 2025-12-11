import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { authService } from '../services/api';
import { 
  LayoutDashboard, 
  MessageSquareWarning, 
  ThumbsUp, 
  FileText, 
  LogOut, 
  Users,
  Activity,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

function NavButton({ active, to, icon, label }: { active: boolean; to: string; icon: ReactNode; label: string }) {
  return (
    <Link 
      to={to}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50 font-medium' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span className={`${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans overflow-hidden">
      
      {/* OVERLAY for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 shadow-2xl flex flex-col`}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-950 shrink-0">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Activity className="text-blue-500" />
            <span>Portal FQS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <NavButton 
            active={isActive('/dashboard')} 
            to="/dashboard"
            icon={<LayoutDashboard size={20} />} 
            label="Gráficos y Resumen" 
          />
          <NavButton 
            active={isActive('/dashboard/quejas')} 
            to="/dashboard/quejas"
            icon={<MessageSquareWarning size={20} />} 
            label="Quejas" 
          />
          <NavButton 
            active={isActive('/dashboard/felicitaciones')} 
            to="/dashboard/felicitaciones"
            icon={<ThumbsUp size={20} />} 
            label="Felicitaciones" 
          />
          <NavButton 
            active={isActive('/dashboard/solicitudes')} 
            to="/dashboard/solicitudes"
            icon={<FileText size={20} />} 
            label="Solicitudes" 
          />
          <NavButton 
            active={isActive('/dashboard/personas')} 
            to="/dashboard/personas"
            icon={<Users size={20} />} 
            label="Personas" 
          />
        </nav>

        <div className="p-4 border-t border-slate-700 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden z-10 shrink-0">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} />
            Portal FQS
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 p-2">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
