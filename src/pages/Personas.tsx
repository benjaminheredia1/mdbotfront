import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { personaService } from '../services/api';
import type { Persona } from '../types';
import { 
  User, 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Shield, 
  Briefcase, 
  MapPin, 
  Building,
  FileText,
  X
} from 'lucide-react';

export default function Personas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [filter, setFilter] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    hcCode: '',
    insurance: '',
    business: '',
    status: '',
    area: '',
  });

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const response = await personaService.getAll();
      setPersonas(response.data);
    } catch (error) {
      console.error('Error al cargar personas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonas = personas.filter(persona => {
    const matchesSearch = persona.nombre.toLowerCase().includes(filter.toLowerCase()) ||
                          persona.hcCode.toLowerCase().includes(filter.toLowerCase()) ||
                          (persona.insurance?.toLowerCase().includes(filter.toLowerCase())) ||
                          (persona.business?.toLowerCase().includes(filter.toLowerCase()));
    return matchesSearch;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        nombre: formData.nombre,
        hcCode: formData.hcCode,
        ...(formData.insurance && { insurance: formData.insurance }),
        ...(formData.business && { business: formData.business }),
        ...(formData.status && { status: formData.status }),
        ...(formData.area && { area: formData.area }),
      };

      if (editingPersona) {
        await personaService.update(editingPersona.id, dataToSend);
      } else {
        await personaService.create(dataToSend);
      }
      loadPersonas();
      resetForm();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      alert(err.response?.data?.message || 'Error al guardar la persona');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta persona?')) return;
    
    try {
      await personaService.delete(id);
      loadPersonas();
    } catch (error) {
      alert('Error al eliminar la persona');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      hcCode: '',
      insurance: '',
      business: '',
      status: '',
      area: '',
    });
    setEditingPersona(null);
    setShowModal(false);
  };

  const openEditModal = (persona: Persona) => {
    setEditingPersona(persona);
    setFormData({
      nombre: persona.nombre,
      hcCode: persona.hcCode,
      insurance: persona.insurance || '',
      business: persona.business || '',
      status: persona.status || '',
      area: persona.area || '',
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-indigo-600 pl-4">
            Gestión de Personas
          </h2>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium text-sm"
          >
            <Plus size={18} /> Nueva Persona
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full bg-white p-2 rounded-lg shadow-sm border border-slate-200">
          <div className="relative group flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, código HC, seguro o empresa..." 
              className="pl-10 pr-4 py-2 bg-transparent focus:outline-none text-sm w-full"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersonas.length > 0 ? filteredPersonas.map((persona) => (
            <div 
              key={persona.id} 
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Card Header */}
              <div className="p-4 bg-gradient-to-r from-indigo-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">
                      {persona.nombre}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <FileText size={12} />
                      <span className="font-mono">{persona.hcCode}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {persona.insurance && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield size={14} className="text-slate-400" />
                    <span>{persona.insurance}</span>
                  </div>
                )}
                {persona.business && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase size={14} className="text-slate-400" />
                    <span>{persona.business}</span>
                  </div>
                )}
                {persona.area && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{persona.area}</span>
                  </div>
                )}
                {persona.status && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building size={14} className="text-slate-400" />
                    <span>{persona.status}</span>
                  </div>
                )}
                {!persona.insurance && !persona.business && !persona.area && !persona.status && (
                  <p className="text-sm text-slate-400 italic">Sin información adicional</p>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-4 pb-4 flex gap-2">
                <button 
                  onClick={() => openEditModal(persona)}
                  className="flex-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Pencil size={14} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(persona.id)}
                  className="flex-1 px-3 py-2 text-sm bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="bg-slate-50 p-4 rounded-full inline-block mb-3">
                <Search size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No se encontraron personas.</p>
              <p className="text-slate-400 text-sm">Intente ajustar los filtros de búsqueda.</p>
            </div>
          )}
        </div>

        <div className="text-right text-xs text-slate-400 pt-4">
          Mostrando {filteredPersonas.length} de {personas.length} registros
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                  <User className="text-indigo-600" size={20} />
                  {editingPersona ? 'Editar Persona' : 'Nueva Persona'}
                </h3>
                <button onClick={resetForm} className="text-slate-400 hover:text-rose-500 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Nombre <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        minLength={3}
                        maxLength={100}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                        placeholder="Nombre completo"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Código HC <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={formData.hcCode}
                        onChange={(e) => setFormData({ ...formData, hcCode: e.target.value })}
                        required
                        minLength={1}
                        maxLength={50}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                        placeholder="HC-000123"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Seguro
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={formData.insurance}
                        onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                        placeholder="Ej. SIS, EsSalud"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Empresa
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={formData.business}
                        onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                        placeholder="Nombre de empresa"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Estado
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                        placeholder="Estado actual"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Área
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                        placeholder="Área de atención"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    {editingPersona ? 'Actualizar' : 'Crear Persona'}
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
