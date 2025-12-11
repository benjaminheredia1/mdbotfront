import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { quejasService, felicitacionService, solicitudService } from '../services/api';
import type { Queja, Felicitacion, Solicitud } from '../types';
import { Activity } from 'lucide-react';

const COLORS = {
  'Felicitación': '#10B981',
  'Queja': '#EF4444',
  'Solicitud': '#3B82F6'
};

export default function Dashboard() {
  const [quejas, setQuejas] = useState<Queja[]>([]);
  const [felicitaciones, setFelicitaciones] = useState<Felicitacion[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
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
      setQuejas(Array.isArray(quejasRes.data) ? quejasRes.data : []);
      setFelicitaciones(Array.isArray(felicitacionesRes.data) ? felicitacionesRes.data : []);
      setSolicitudes(Array.isArray(solicitudesRes.data) ? solicitudesRes.data : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => [
    { name: 'Felicitaciones', value: felicitaciones.length, color: COLORS['Felicitación'] },
    { name: 'Quejas', value: quejas.length, color: COLORS['Queja'] },
    { name: 'Solicitudes', value: solicitudes.length, color: COLORS['Solicitud'] },
  ], [quejas, felicitaciones, solicitudes]);

  const statusStats = useMemo(() => {
    const allItems = [...quejas, ...solicitudes];
    const counts: Record<string, number> = { 'PENDIENTE': 0, 'EN_PROCESO': 0, 'RESUELTO': 0 };
    allItems.forEach(item => {
      if (counts[item.estado] !== undefined) counts[item.estado]++;
    });
    return Object.keys(counts).map(key => ({
      name: key.replace('_', ' '),
      cantidad: counts[key]
    }));
  }, [quejas, solicitudes]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-4">
            Control de Gestión
          </h2>
          <span className="text-xs text-slate-400 font-mono">LIVE DATA</span>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60 flex items-center justify-between hover:shadow-md transition-shadow cursor-default">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{stat.name}</p>
                <p className="text-4xl font-bold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
              </div>
              <div className="p-4 rounded-2xl opacity-10" style={{ backgroundColor: stat.color }}>
                <Activity size={32} color={stat.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
            <h3 className="text-sm font-semibold text-slate-600 mb-6 uppercase tracking-wider">Distribución por Tipo</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/60">
            <h3 className="text-sm font-semibold text-slate-600 mb-6 uppercase tracking-wider">Estado del Flujo (WIP)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusStats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip 
                     cursor={{fill: '#f1f5f9'}}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
