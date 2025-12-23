import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { felicitacionService } from '../services/api';
import type { Felicitacion } from '../types';
import { 
  MapPin, 
  User, 
  Trash2, 
  Plus, 
  Search, 
  CheckCircle, 
  Calendar, 
  Clock, 
  X,
  FileText
} from 'lucide-react';

export default function Felicitaciones() {
  const [felicitaciones, setFelicitaciones] = useState<Felicitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFelicitacion, setEditingFelicitacion] = useState<Felicitacion | null>(null);
  const [filter, setFilter] = useState('');
  
  const [formData, setFormData] = useState({
    descripcion: '',
    area_medica: '',
    id_persona: 1,
  });

  useEffect(() => {
    loadFelicitaciones();
  }, []);

  const loadFelicitaciones = async () => {
    try {
      const response = await felicitacionService.getAll();
      setFelicitaciones(response.data);
    } catch (error) {
      console.error('Error al cargar felicitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFelicitaciones = felicitaciones.filter(f => {
    const matchesSearch = f.descripcion.toLowerCase().includes(filter.toLowerCase()) ||
                          f.area_medica.toLowerCase().includes(filter.toLowerCase()) ||
                          (f.persona?.nombre?.toLowerCase().includes(filter.toLowerCase()));
    return matchesSearch;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingFelicitacion) {
        await felicitacionService.update(editingFelicitacion.id, {
          descripcion: formData.descripcion,
          area_medica: formData.area_medica,
        });
      } else {
        await felicitacionService.create(formData);
      }
      loadFelicitaciones();
      resetForm();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Error al guardar la felicitación');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta felicitación?')) return;
    
    try {
      await felicitacionService.delete(id);
      loadFelicitaciones();
    } catch (error) {
      alert('Error al eliminar la felicitación');
    }
  };

  const resetForm = () => {
    setFormData({
      descripcion: '',
      area_medica: '',
      id_persona: 1,
    });
    setEditingFelicitacion(null);
    setShowModal(false);
  };



  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-emerald-600 pl-4">
            Gestión de Felicitaciones
          </h2>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
          >
            <Plus size={18} /> Nueva Felicitación
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por descripción, área o paciente..." 
              className="pl-10 pr-4 py-2 bg-transparent focus:outline-none text-sm w-full"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredFelicitaciones.length > 0 ? filteredFelicitaciones.map((felicitacion) => (
            <div 
              key={felicitacion.id} 
              className="bg-white rounded-xl shadow-sm border-l-4 border-l-emerald-500 border-y border-r border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Card Header */}
              <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-gradient-to-r from-white to-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">
                      {felicitacion.persona?.nombre || `Persona ID: ${felicitacion.id_persona}`}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> {felicitacion.persona?.hcCode || 'Sin HC'}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {felicitacion.area_medica}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[140px]">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                    <Calendar size={12} /> {new Date(felicitacion.createdAt).toLocaleDateString()}
                    <Clock size={12} className="ml-1" /> {new Date(felicitacion.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Felicitación
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 pb-5 pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-3">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-600 leading-relaxed text-sm">
                      <span className="font-semibold text-slate-800 block mb-1">Descripción:</span>
                      {felicitacion.descripcion}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-4 flex items-center justify-end gap-2">
             
                  <button 
                    onClick={() => handleDelete(felicitacion.id)}
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
              <p className="text-slate-500 font-medium">No se encontraron felicitaciones.</p>
              <p className="text-slate-400 text-sm">Intente ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </div>

        <div className="text-right text-xs text-slate-400 pt-4">
          Mostrando {filteredFelicitaciones.length} de {felicitaciones.length} registros
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <CheckCircle className="text-emerald-600" size={20} />
                  {editingFelicitacion ? 'Editar Felicitación' : 'Nueva Felicitación'}
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
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm transition-all"
                    placeholder="Describa la felicitación detalladamente..."
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
                      minLength={3}
                      maxLength={100}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                      placeholder="Ej. Emergencias, Consulta Externa..."
                    />
                  </div>
                </div>

                {!editingFelicitacion && (
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
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all"
                      />
                    </div>
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
                    className="px-6 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    {editingFelicitacion ? 'Actualizar' : 'Crear Felicitación'}
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
