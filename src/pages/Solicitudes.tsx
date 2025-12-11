import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { solicitudService } from '../services/api';
import type { Solicitud } from '../types';
import { 
  MapPin, 
  User, 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Clock, 
  ChevronRight,
  X
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  'PENDIENTE': 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100',
  'EN_PROCESO': 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100',
  'RESUELTO': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100',
};

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSolicitud, setEditingSolicitud] = useState<Solicitud | null>(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  const [formData, setFormData] = useState({
    descripcion: '',
    area: '',
    id_persona: 1,
    estado: 'PENDIENTE',
  });

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = async () => {
    try {
      const response = await solicitudService.getAll();
      setSolicitudes(response.data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSolicitudes = solicitudes.filter(solicitud => {
    const matchesSearch = solicitud.descripcion.toLowerCase().includes(filter.toLowerCase()) ||
                          solicitud.area_medica.toLowerCase().includes(filter.toLowerCase()) ||
                          (solicitud.persona?.nombre?.toLowerCase().includes(filter.toLowerCase()));
    const matchesStatus = statusFilter === 'Todos' || solicitud.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingSolicitud) {
        await solicitudService.update(editingSolicitud.id, {
          descripcion: formData.descripcion,
          area: formData.area,
          estado: formData.estado,
        });
      } else {
        await solicitudService.create({
          descripcion: formData.descripcion,
          id_persona: formData.id_persona,
          area: formData.area,
        });
      }
      loadSolicitudes();
      resetForm();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Error al guardar la solicitud');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;
    
    try {
      await solicitudService.delete(id);
      loadSolicitudes();
    } catch (error) {
      alert('Error al eliminar la solicitud');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await solicitudService.update(id, { estado: newStatus });
      loadSolicitudes();
    } catch (error) {
      alert('Error al actualizar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      area: '',
      id_persona: 1,
      estado: 'PENDIENTE',
    });
    setEditingSolicitud(null);
    setShowModal(false);
  };

  const openEditModal = (solicitud: Solicitud) => {
    setEditingSolicitud(solicitud);
    setFormData({
      descripcion: solicitud.descripcion,
      area: solicitud.area_medica,
      id_persona: solicitud.id_persona,
      estado: solicitud.estado,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-4">
            Gestión de Solicitudes
          </h2>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
          >
            <Plus size={18} /> Nueva Solicitud
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descripción, área o paciente..." 
              className="pl-10 pr-4 py-2 bg-transparent focus:outline-none text-sm w-full"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block self-center"></div>
          <select 
            className="px-4 py-2 bg-transparent focus:outline-none text-sm font-medium text-slate-600 cursor-pointer hover:text-blue-600 transition-colors"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todos">Todos los Estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROCESO">En Proceso</option>
            <option value="RESUELTO">Resuelto</option>
          </select>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredSolicitudes.length > 0 ? filteredSolicitudes.map((solicitud) => (
            <div 
              key={solicitud.id} 
              className="bg-white rounded-xl shadow-sm border-l-4 border-l-blue-500 border-y border-r border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Card Header */}
              <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gradient-to-r from-white to-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">
                      {solicitud.persona?.nombre || `Persona ID: ${solicitud.id_persona}`}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> {solicitud.persona?.hcCode || 'Sin HC'}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {solicitud.area_medica}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[140px]">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Calendar size={12} /> {new Date(solicitud.createdAt).toLocaleDateString()}
                    <Clock size={12} className="ml-1" /> {new Date(solicitud.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="relative">
                    <select 
                      className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:ring-2 focus:ring-offset-1 focus:outline-none transition-all ${STATUS_STYLES[solicitud.estado] || 'bg-slate-100 text-slate-600'}`}
                      value={solicitud.estado}
                      onChange={(e) => handleStatusChange(solicitud.id, e.target.value)}
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="RESUELTO">Resuelto</option>
                    </select>
                    <ChevronRight size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 pb-5 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-3">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-600 leading-relaxed text-sm">
                      <span className="font-semibold text-slate-800 block mb-1">Descripción:</span>
                      {solicitud.descripcion}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-4 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => openEditModal(solicitud)}
                    className="px-4 py-2 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(solicitud.id)}
                    className="px-4 py-2 text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="bg-slate-50 p-4 rounded-full inline-block mb-3">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No se encontraron solicitudes.</p>
              <p className="text-slate-400 text-sm">Intente ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </div>

        <div className="text-right text-xs text-slate-400 pt-4">
          Mostrando {filteredSolicitudes.length} de {solicitudes.length} registros
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <FileText className="text-blue-600" size={20} />
                  {editingSolicitud ? 'Editar Solicitud' : 'Nueva Solicitud'}
                </h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Descripción <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    minLength={10}
                    maxLength={500}
                    rows={4}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm transition-all"
                    placeholder="Describa la solicitud detalladamente..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Área <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                      placeholder="Ej. Laboratorio, Farmacia..."
                    />
                  </div>
                </div>

                {!editingSolicitud && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      ID de Persona <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="number"
                        value={formData.id_persona}
                        onChange={(e) => setFormData({ ...formData, id_persona: parseInt(e.target.value) })}
                        required
                        min={1}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                )}

                {editingSolicitud && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="RESUELTO">Resuelto</option>
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    {editingSolicitud ? 'Actualizar' : 'Crear Solicitud'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
