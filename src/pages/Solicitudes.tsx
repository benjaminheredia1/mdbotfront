import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { solicitudService } from '../services/api';
import type { Solicitud } from '../types';
import { MapPin, User, Pencil, Trash2, Plus } from 'lucide-react';
import './Solicitudes.css';

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSolicitud, setEditingSolicitud] = useState<Solicitud | null>(null);
  
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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar la solicitud');
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

  const getEstadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      PENDIENTE: '#f39c12',
      EN_PROCESO: '#3498db',
      RESUELTO: '#27ae60',
    };
    return colors[estado] || '#95a5a6';
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
      <div className="solicitudes-container">
        <div className="page-header">
          <h1>Gestión de Solicitudes</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nueva Solicitud
          </button>
        </div>

        <div className="solicitudes-grid">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="solicitud-card">
              <div className="solicitud-header">
                <span className="badge" style={{ backgroundColor: getEstadoBadge(solicitud.estado) }}>
                  {solicitud.estado}
                </span>
                <span className="solicitud-date">
                  {new Date(solicitud.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="solicitud-body">
                <p className="solicitud-area"><MapPin size={16} /> {solicitud.area_medica}</p>
                <p className="solicitud-description">{solicitud.descripcion}</p>
                {solicitud.persona && (
                  <p className="solicitud-persona">
                    <User size={16} /> {solicitud.persona.nombre} - {solicitud.persona.hcCode}
                  </p>
                )}
              </div>

              <div className="solicitud-actions">
                <button className="btn-edit" onClick={() => openEditModal(solicitud)}>
                  <Pencil size={16} /> Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(solicitud.id)}>
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingSolicitud ? 'Editar Solicitud' : 'Nueva Solicitud'}</h2>
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
                  <label>Área</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                </div>

                {!editingSolicitud && (
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

                {editingSolicitud && (
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="EN_PROCESO">EN_PROCESO</option>
                      <option value="RESUELTO">RESUELTO</option>
                    </select>
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingSolicitud ? 'Actualizar' : 'Crear'}
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
