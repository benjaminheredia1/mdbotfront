import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { quejasService } from '../services/api';
import type { Queja } from '../types';
import { MapPin, User, Pencil, Trash2, Plus } from 'lucide-react';
import './Quejas.css';

export default function Quejas() {
  const [quejas, setQuejas] = useState<Queja[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQueja, setEditingQueja] = useState<Queja | null>(null);
  
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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar la queja');
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
      <div className="quejas-container">
        <div className="page-header">
          <h1>Gestión de Quejas</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nueva Queja
          </button>
        </div>

        <div className="quejas-grid">
          {quejas.map((queja) => (
            <div key={queja.id} className="queja-card">
              <div className="queja-header">
                <span className="badge" style={{ backgroundColor: getEstadoBadge(queja.estado) }}>
                  {queja.estado}
                </span>
                <span className="queja-date">
                  {new Date(queja.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="queja-body">
                <p className="queja-area"><MapPin size={16} /> {queja.area_medica}</p>
                <p className="queja-description">{queja.descripcion}</p>
                {queja.persona && (
                  <p className="queja-persona">
                    <User size={16} /> {queja.persona.nombre} - {queja.persona.hcCode}
                  </p>
                )}
              </div>

              <div className="queja-actions">
                <button className="btn-edit" onClick={() => openEditModal(queja)}>
                  <Pencil size={16} /> Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(queja.id)}>
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingQueja ? 'Editar Queja' : 'Nueva Queja'}</h2>
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
                  />
                </div>

                {!editingQueja && (
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

                {editingQueja && (
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
                    {editingQueja ? 'Actualizar' : 'Crear'}
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
