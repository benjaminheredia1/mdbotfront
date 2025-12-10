import DashboardLayout from '../components/DashboardLayout';
import { MessageSquareWarning, ThumbsUp, FileText } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="dashboard-home">
        <h1>Bienvenido al Sistema de Gestión Hospitalaria</h1>
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3><MessageSquareWarning size={24} /> Quejas</h3>
            <p>Gestiona las quejas de los pacientes</p>
          </div>
          <div className="dashboard-card">
            <h3><ThumbsUp size={24} /> Felicitaciones</h3>
            <p>Revisa las felicitaciones recibidas</p>
          </div>
          <div className="dashboard-card">
            <h3><FileText size={24} /> Solicitudes</h3>
            <p>Administra las solicitudes de los pacientes</p>
          </div>
        </div>
        <div className="info-section">
          <h2>Información del Sistema</h2>
          <p>Utiliza el menú lateral para navegar entre las diferentes secciones del sistema.</p>
          <ul>
            <li>Crear, editar y eliminar registros</li>
            <li>Revisar y responder quejas y solicitudes</li>
            <li>Gestionar felicitaciones</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
