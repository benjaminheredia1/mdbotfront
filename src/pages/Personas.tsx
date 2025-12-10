import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { personaService } from '../services/api';
import type { Persona } from '../types';
import { User, Pencil, Trash2, Plus, Building, Shield, Briefcase, MapPin } from 'lucide-react';
import './Personas.css';

export default function Personas() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  
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
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar la persona');
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
        <div>Cargando...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="personas-container">
        <div className="page-header">
          <h1>Gestión de Personas</h1>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> Nueva Persona
          </button>
        </div>

        <div className="personas-grid">
          {personas.map((persona) => (
            <div key={persona.id} className="persona-card">
              <div className="persona-header">
                <span className="persona-name">
                  <User size={18} /> {persona.nombre}
                </span>
                <span className="persona-code">{persona.hcCode}</span>
              </div>
              
              <div className="persona-body">
                {persona.insurance && (
                  <p className="persona-info">
                    <Shield size={16} /> {persona.insurance}
                  </p>
                )}
                {persona.business && (
                  <p className="persona-info">
                    <Briefcase size={16} /> {persona.business}
                  </p>
                )}
                {persona.area && (
                  <p className="persona-info">
                    <MapPin size={16} /> {persona.area}
                  </p>
                )}
                {persona.status && (
                  <p className="persona-info">
                    <Building size={16} /> {persona.status}
                  </p>
                )}
              </div>

              <div className="persona-actions">
                <button className="btn-edit" onClick={() => openEditModal(persona)}>
                  <Pencil size={16} /> Editar
                </button>
                <button className="btn-delete" onClick={() => handleDelete(persona.id)}>
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingPersona ? 'Editar Persona' : 'Nueva Persona'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </div>

                <div className="form-group">
                  <label>Código HC *</label>
                  <input
                    type="text"
                    value={formData.hcCode}
                    onChange={(e) => setFormData({ ...formData, hcCode: e.target.value })}
                    required
                    minLength={1}
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label>Seguro</label>
                  <input
                    type="text"
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Empresa</label>
                  <input
                    type="text"
                    value={formData.business}
                    onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Área</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingPersona ? 'Actualizar' : 'Crear'}
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
