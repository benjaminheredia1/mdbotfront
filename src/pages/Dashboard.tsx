import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { quejasService, felicitacionService, solicitudService, webhookService } from '../services/api';
import CountdownBadge from '../components/Clock';
import type { Queja, Felicitacion, Solicitud } from '../types';
import {
  Activity,
  Search,
  AlertCircle,
  CheckCircle,
  FileText,
  Calendar,
  Clock,
  ChevronRight,
  MapPin,
  X,
  ClipboardCheck
} from 'lucide-react';

const COLORS = {
  'Felicitación': '#10B981',
  'Queja': '#EF4444',
  'Solicitud': '#3B82F6'
};

const STATUS_STYLES: Record<string, string> = {
  'PENDIENTE': 'bg-amber-50 text-amber-700 border-amber-200',
  'EN_PROCESO': 'bg-blue-50 text-blue-700 border-blue-200',
  'RESUELTO': 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const TYPE_BORDER_COLORS: Record<string, string> = {
  'Felicitación': 'border-l-emerald-500',
  'Queja': 'border-l-rose-500',
  'Solicitud': 'border-l-blue-500'
};

// Tipo unificado para mostrar en la lista
interface RegistroUnificado {
  id: number;
  tipo: 'Queja' | 'Felicitación' | 'Solicitud';
  descripcion: string;
  area_medica: string;
  estado: string;
  respuesta: string | null;
  id_persona: number;
  createdAt: string;
  persona?: {
    nombre: string;
    hcCode: string;
  };
}


export default function Dashboard() {
  const [quejas, setQuejas] = useState<Queja[]>([]);
  const [felicitaciones, setFelicitaciones] = useState<Felicitacion[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filter, setFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Modal de resolución
  const [closingEntry, setClosingEntry] = useState<RegistroUnificado | null>(null);
  const [resolucion, setResolucion] = useState('');
  const [satisfaccion, setSatisfaccion] = useState('Satisfecho');

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

  // Unificar todos los registros
  const allRecords: RegistroUnificado[] = useMemo(() => {
    const records: RegistroUnificado[] = [];

    quejas.forEach(q => records.push({
      id: q.id,
      tipo: 'Queja',
      descripcion: q.descripcion,
      area_medica: q.area_medica,
      estado: q.estado,
      respuesta: q.respuesta,
      id_persona: q.id_persona,
      createdAt: q.createdAt,
      persona: q.persona
    }));

    felicitaciones.forEach(f => records.push({
      id: f.id,
      tipo: 'Felicitación',
      descripcion: f.descripcion,
      area_medica: f.area_medica,
      estado: 'RESUELTO', // Las felicitaciones no tienen estado
      respuesta: f.Respuesta,
      id_persona: f.id_persona,
      createdAt: f.createdAt,
      persona: f.persona
    }));

    solicitudes.forEach(s => records.push({
      id: s.id,
      tipo: 'Solicitud',
      descripcion: s.descripcion,
      area_medica: s.area_medica,
      estado: s.estado,
      respuesta: s.Respuesta,
      id_persona: s.id_persona,
      createdAt: s.createdAt,
      persona: s.persona
    }));

    // Ordenar por fecha más reciente
    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [quejas, felicitaciones, solicitudes]);

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    return allRecords.filter(record => {
      const matchesSearch = record.descripcion.toLowerCase().includes(filter.toLowerCase()) ||
        record.area_medica.toLowerCase().includes(filter.toLowerCase()) ||
        (record.persona?.nombre?.toLowerCase().includes(filter.toLowerCase()));
      const matchesType = typeFilter === 'Todos' || record.tipo === typeFilter;
      const matchesStatus = statusFilter === 'Todos' || record.estado === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allRecords, filter, typeFilter, statusFilter]);

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
    // Agregar felicitaciones como resueltas
    counts['RESUELTO'] += felicitaciones.length;
    return Object.keys(counts).map(key => ({
      name: key.replace('_', ' '),
      cantidad: counts[key]
    }));
  }, [quejas, solicitudes, felicitaciones]);

  // Manejar cambio de estado
  const handleStatusChangeRequest = (record: RegistroUnificado, newStatus: string) => {
    if (newStatus === 'RESUELTO' && record.tipo !== 'Felicitación') {
      setClosingEntry({ ...record });
      setResolucion('');
      setSatisfaccion('Satisfecho');
    } else {
      updateStatus(record, newStatus);
    }
  };

  const updateStatus = async (record: RegistroUnificado, newStatus: string, respuesta?: string) => {
    try {
      if (record.tipo === 'Queja') {
        if (newStatus === 'RESUELTO' && respuesta) {
          await webhookService.quejaDescripcion(record.id, respuesta);
        }
        await quejasService.update(record.id, {
          estado: newStatus,
          ...(respuesta && { respuesta })
        });
      } else if (record.tipo === 'Solicitud') {
        if (newStatus === 'RESUELTO' && respuesta) {
          await webhookService.solicitudDescripcion(record.id, respuesta);
        }
        await solicitudService.update(record.id, {
          estado: newStatus,
          ...(respuesta && { Respuesta: respuesta })
        });
      }
      await loadData();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleConfirmClose = async () => {
    if (!closingEntry) return;

    if (!resolucion.trim()) {
      alert('Por favor ingrese una descripción de cómo se resolvió el caso.');
      return;
    }

    const respuestaFinal = `${resolucion}\n\nSatisfacción: ${satisfaccion}`;
    await updateStatus(closingEntry, 'RESUELTO', respuestaFinal);
    setClosingEntry(null);
    setResolucion('');
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'Queja': return <AlertCircle size={20} />;
      case 'Felicitación': return <CheckCircle size={20} />;
      case 'Solicitud': return <FileText size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getTypeIconBg = (tipo: string) => {
    switch (tipo) {
      case 'Queja': return 'bg-rose-100 text-rose-600';
      case 'Felicitación': return 'bg-emerald-100 text-emerald-600';
      case 'Solicitud': return 'bg-blue-100 text-blue-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

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
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-4">
            Control de Gestión
          </h2>
          <span className="text-xs text-slate-400 font-mono">LIVE DATA</span>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200/60 flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{stat.name}</p>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl opacity-20" style={{ backgroundColor: stat.color }}>
                <Activity size={28} color={stat.color} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts - Collapsible on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200/60">
            <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">Distribución por Tipo</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {stats.map((stat) => (
                <div key={stat.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }}></div>
                  <span className="text-slate-600">{stat.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200/60">
            <h3 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wider">Estado del Flujo</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusStats} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por descripción, área o paciente..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-600"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="Todos">Todos los Tipos</option>
              <option value="Queja">Quejas</option>
              <option value="Felicitación">Felicitaciones</option>
              <option value="Solicitud">Solicitudes</option>
            </select>
            <select
              className="px-4 py-2 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Todos">Todos los Estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROCESO">En Proceso</option>
              <option value="RESUELTO">Resuelto</option>
            </select>
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">
            Bitácora de Casos ({filteredRecords.length})
          </h3>

          {filteredRecords.length > 0 ? filteredRecords.map((record) => (
            <div
              key={`${record.tipo}-${record.id}`}
              className={`bg-white rounded-xl shadow-sm border-l-4 ${TYPE_BORDER_COLORS[record.tipo]} border-y border-r border-slate-200 overflow-hidden hover:shadow-md transition-shadow`}
            >
              {/* Card Header */}
              <div className="p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-gradient-to-r from-white to-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getTypeIconBg(record.tipo)}`}>
                    {getTypeIcon(record.tipo)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800">
                        {record.persona?.nombre || `ID: ${record.id_persona}`}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${record.tipo === 'Queja' ? 'bg-rose-100 text-rose-700' :
                        record.tipo === 'Felicitación' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                        {record.tipo}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> {record.persona?.hcCode || 'Sin HC'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {record.area_medica}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={12} /> {new Date(record.createdAt).toLocaleDateString()}
                    <Clock size={12} /> {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                    <div className='bg-yellow-500 text-white rounded-full px-2 w-20! h-5 text-center flex items-center justify-center'> <CountdownBadge createdAt={record.createdAt} /> </div> 
                  </div>

                  {record.tipo !== 'Felicitación' ? (
                    <div className="relative">
                      <select
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none transition-all ${STATUS_STYLES[record.estado] || 'bg-slate-100 text-slate-600'}`}
                        value={record.estado}
                        onChange={(e) => handleStatusChangeRequest(record, e.target.value)}
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="RESUELTO">Resuelto</option>
                      </select>
                      <ChevronRight size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completado
                    </span>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4 pb-4 pt-2">
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Descripción: </span>
                  {record.descripcion}
                </p>

                {record.respuesta && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <ClipboardCheck size={12} /> Resolución
                    </p>
                    <p className="text-sm text-slate-600 italic">{record.respuesta}</p>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <Search size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No se encontraron registros.</p>
              <p className="text-slate-400 text-sm">Intente ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </div>

        <div className="text-right text-xs text-slate-400 pb-4">
          Mostrando {filteredRecords.length} de {allRecords.length} registros
        </div>
      </div>

      {/* Modal de Cierre/Resolución */}
      {closingEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <ClipboardCheck className="text-indigo-600" size={20} />
                Cerrar Caso
              </h3>
              <button onClick={() => setClosingEntry(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info del caso */}
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${closingEntry.tipo === 'Queja' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {closingEntry.tipo}
                  </span>
                  <span className="text-sm font-medium text-indigo-900">
                    {closingEntry.persona?.nombre || `ID: ${closingEntry.id_persona}`}
                  </span>
                </div>
                <p className="text-sm text-indigo-700/80 italic line-clamp-3">"{closingEntry.descripcion}"</p>
              </div>

              {/* Campo de resolución */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  ¿Cómo se resolvió este caso? <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={resolucion}
                  onChange={(e) => setResolucion(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm"
                  rows={4}
                  placeholder="Describa las acciones tomadas para resolver este caso..."
                />
              </div>


              {/* Botones */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setClosingEntry(null)}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmClose}
                  className="px-6 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Marcar como Resuelto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
