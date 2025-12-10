import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { felicitacionService } from '../services/api';
import type { Felicitacion } from '../types';
import { MapPin, User, Pencil, Trash2, Plus, ThumbsUp } from 'lucide-react';
import './Felicitaciones.css';

export default function Felicitaciones() {
  const [felicitaciones, setFelicitaciones] = useState<Felicitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFelicitacion, setEditingFelicitacion] = useState<Felicitacion | null>(null);
  
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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar la felicitación');
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

  const openEditModal = (felicitacion: Felicitacion) => {
    setEditingFelicitacion(felicitacion);
    setFormData({
      descripcion: felicitacion.descripcion,
      area_medica: felicitacion.area_medica,
      id_persona: felicitacion.id_persona,
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div>Cargando...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="felicitaciones-container">
        <div className="page-header">
          <h1>Gestión de Felicitaciones</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nueva Felicitación
          </button>
        </div>

        <div className="felicitaciones-grid">
          {felicitaciones.map((felicitacion) => (
            <div key={felicitacion.id} className="felicitacion-card">
              <div className="felicitacion-header">
                <span className="badge-success"><ThumbsUp size={16} /> Felicitación</span>
                <span className="felicitacion-date">
                  {new Date(felicitacion.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="felicitacion-body">
                <p className="felicitacion-area"><MapPin size={16} /> {felicitacion.area_medica}</p>
                <p className="felicitacion-description">{felicitacion.descripcion}</p>
                {felicitacion.persona && (
                  <p className="felicitacion-persona">
                    <User size={16} /> {felicitacion.persona.nombre} - {felicitacion.persona.hcCode}
                  </p>
                )}
              </div>

              <div className="felicitacion-actions">
                <button className="btn-edit" onClick={() => openEditModal(felicitacion)}>
                  <Pencil size={16} /> Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(felicitacion.id)}>
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingFelicitacion ? 'Editar Felicitación' : 'Nueva Felicitación'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    minLength={10}
                    maxLength={500}
                    rows={4}
                  />
                </div>

                <div className="form-group">
                  <label>Área Médica</label>
                  <input
                    type="text"
                    value={formData.area_medica}
                    onChange={(e) => setFormData({ ...formData, area_medica: e.target.value })}
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </div>

                {!editingFelicitacion && (
                  <div className="form-group">
                    <label>Persona (ID)</label>
                    <input
                      type="number"
                      value={formData.id_persona}
                      onChange={(e) => setFormData({ ...formData, id_persona: parseInt(e.target.value) })}
                      required
                      min={1}
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingFelicitacion ? 'Actualizar' : 'Crear'}
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
