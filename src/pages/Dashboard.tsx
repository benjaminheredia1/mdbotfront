import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { quejasService, felicitacionService, solicitudService } from '../services/api';
import type { Queja, Felicitacion, Solicitud } from '../types';
import './Dashboard.css';

export default function Dashboard() {
  const [quejasData, setQuejasData] = useState<{ name: string; value: number }[]>([]);
  const [felicitacionesData, setFelicitacionesData] = useState<{ name: string; value: number }[]>([]);
  const [solicitudesData, setSolicitudesData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [quejasRes, felicitacionesRes, solicitudesRes] = await Promise.all([
        quejasService.getAll(),
        felicitacionService.getAll(),
        solicitudService.getAll(),
      ]);

      // Procesar quejas por estado
      const quejas: Queja[] = quejasRes.data;
      const quejasCount = quejas.reduce((acc: Record<string, number>, q) => {
        acc[q.estado] = (acc[q.estado] || 0) + 1;
        return acc;
      }, {});
      setQuejasData(Object.entries(quejasCount).map(([name, value]) => ({ name, value })));

      // Procesar felicitaciones por área médica
      const felicitaciones: Felicitacion[] = felicitacionesRes.data;
      const felicitacionesCount = felicitaciones.reduce((acc: Record<string, number>, f) => {
        acc[f.area_medica] = (acc[f.area_medica] || 0) + 1;
        return acc;
      }, {});
      setFelicitacionesData(Object.entries(felicitacionesCount).map(([name, value]) => ({ name, value })));

      // Procesar solicitudes por estado
      const solicitudes: Solicitud[] = solicitudesRes.data;
      const solicitudesCount = solicitudes.reduce((acc: Record<string, number>, s) => {
        acc[s.estado] = (acc[s.estado] || 0) + 1;
        return acc;
      }, {});
      setSolicitudesData(Object.entries(solicitudesCount).map(([name, value]) => ({ name, value })));

    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-home">
          <p>Cargando datos...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-home">
        <h1 className="dashboard-title">DASHBOARD</h1>

        <div className="charts-container">
          <div className="chart-wrapper">
            <h3 className="chart-title">QUEJAS POR ESTADO</h3>
            {quejasData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={quejasData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Cantidad" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No hay datos de quejas</p>
            )}
          </div>

          <div className="chart-wrapper">
            <h3 className="chart-title">FELICITACIONES POR ÁREA</h3>
            {felicitacionesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={felicitacionesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Cantidad" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No hay datos de felicitaciones</p>
            )}
          </div>

          <div className="chart-wrapper chart-full">
            <h3 className="chart-title">SOLICITUDES POR ESTADO</h3>
            {solicitudesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={solicitudesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Cantidad" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="no-data">No hay datos de solicitudes</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
