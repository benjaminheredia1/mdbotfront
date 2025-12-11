import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { quejasService } from '../services/api';
import type { Queja } from '../types';
import { 
  MapPin, 
  User, 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  AlertCircle, 
  Calendar, 
  Clock, 
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  'PENDIENTE': 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100',
  'EN_PROCESO': 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100',
  'RESUELTO': 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100',
};

export default function Quejas() {
  const [quejas, setQuejas] = useState<Queja[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQueja, setEditingQueja] = useState<Queja | null>(null);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  
  const [formData, setFormData] = useState({
    descripcion: '',
    area_medica: '',
    id_persona: 1,
    estado: 'PENDIENTE',
  });

  useEffect(() => {
    loadQuejas();
  }, []);

  const loadQuejas = async () => {
    try {
      const response = await quejasService.getAll();
      setQuejas(response.data);
    } catch (error) {
      console.error('Error al cargar quejas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuejas = quejas.filter(queja => {
    const matchesSearch = queja.descripcion.toLowerCase().includes(filter.toLowerCase()) ||
                          queja.area_medica.toLowerCase().includes(filter.toLowerCase()) ||
                          (queja.persona?.nombre?.toLowerCase().includes(filter.toLowerCase()));
    const matchesStatus = statusFilter === 'Todos' || queja.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingQueja) {
        await quejasService.update(editingQueja.id, {
          descripcion: formData.descripcion,
          area_medica: formData.area_medica,
          estado: formData.estado,
        });
      } else {
        await quejasService.create({
          descripcion: formData.descripcion,
          id_persona: formData.id_persona,
          area_medica: formData.area_medica,
        });
      }
      loadQuejas();
      resetForm();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Error al guardar la queja');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta queja?')) return;
    
    try {
      await quejasService.delete(id);
      loadQuejas();
    } catch (error) {
      alert('Error al eliminar la queja');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await quejasService.update(id, { estado: newStatus });
      loadQuejas();
    } catch (error) {
      alert('Error al actualizar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      area_medica: '',
      id_persona: 1,
      estado: 'PENDIENTE',
    });
    setEditingQueja(null);
    setShowModal(false);
  };

  const openEditModal = (queja: Queja) => {
    setEditingQueja(queja);
    setFormData({
      descripcion: queja.descripcion,
      area_medica: queja.area_medica,
      id_persona: queja.id_persona,
      estado: queja.estado,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-rose-600 pl-4">
            Gestión de Quejas
          </h2>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
          >
            <Plus size={18} /> Nueva Queja
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={18} />
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
            className="px-4 py-2 bg-transparent focus:outline-none text-sm font-medium text-slate-600 cursor-pointer hover:text-rose-600 transition-colors"
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
          {filteredQuejas.length > 0 ? filteredQuejas.map((queja) => (
            <div 
              key={queja.id} 
              className="bg-white rounded-xl shadow-sm border-l-4 border-l-rose-500 border-y border-r border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Card Header */}
              <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gradient-to-r from-white to-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-rose-100 text-rose-600">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">
                      {queja.persona?.nombre || `Persona ID: ${queja.id_persona}`}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> {queja.persona?.hcCode || 'Sin HC'}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {queja.area_medica}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[140px]">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Calendar size={12} /> {new Date(queja.createdAt).toLocaleDateString()}
                    <Clock size={12} className="ml-1" /> {new Date(queja.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="relative">
                    <select 
                      className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:ring-2 focus:ring-offset-1 focus:outline-none transition-all ${STATUS_STYLES[queja.estado] || 'bg-slate-100 text-slate-600'}`}
                      value={queja.estado}
                      onChange={(e) => handleStatusChange(queja.id, e.target.value)}
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
                      {queja.descripcion}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-4 flex items-center justify-end gap-2">
                  <button 
                    onClick={() => openEditModal(queja)}
                    className="px-4 py-2 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(queja.id)}
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
              <p className="text-slate-500 font-medium">No se encontraron quejas.</p>
              <p className="text-slate-400 text-sm">Intente ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </div>

        <div className="text-right text-xs text-slate-400 pt-4">
          Mostrando {filteredQuejas.length} de {quejas.length} registros
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <AlertCircle className="text-rose-600" size={20} />
                  {editingQueja ? 'Editar Queja' : 'Nueva Queja'}
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
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none resize-none text-sm transition-all"
                    placeholder="Describa la queja detalladamente..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Área Médica <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.area_medica}
                      onChange={(e) => setFormData({ ...formData, area_medica: e.target.value })}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm transition-all"
                      placeholder="Ej. Emergencias, Consulta Externa..."
                    />
                  </div>
                </div>

                {!editingQueja && (
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
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm transition-all"
                      />
                    </div>
                  </div>
                )}

                {editingQueja && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm transition-all"
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
                    className="px-6 py-2 text-sm bg-rose-600 text-white hover:bg-rose-700 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    {editingQueja ? 'Actualizar' : 'Crear Queja'}
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
