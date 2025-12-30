import DashboardLayout from '../components/DashboardLayout.tsx';
import { useEffect, useState } from 'react';
import { formularioService } from '../services/api.ts';
import { 
  Star, 
  User, 
  Calendar, 
  Clock, 
  Search,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';

// Componente de estrellas para mostrar calificación
const StarRating = ({ rating, maxRating = 5 }: { rating: number; maxRating?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(maxRating)].map((_, index) => (
        <Star
          key={index}
          size={18}
          className={index < rating 
            ? 'fill-amber-400 text-amber-400' 
            : 'fill-slate-200 text-slate-200'
          }
        />
      ))}
      <span className="ml-2 text-sm font-bold text-slate-700">{rating}/{maxRating}</span>
    </div>
  );
};

// Componente de badge para calificación
const CalificacionBadge = ({ calificacion }: { calificacion: number }) => {
  let bgColor = 'bg-slate-100 text-slate-600';
  let label = 'Sin calificar';
  
  if (calificacion >= 5) {
    bgColor = 'bg-emerald-100 text-emerald-700';
    label = 'Excelente';
  } else if (calificacion >= 4) {
    bgColor = 'bg-blue-100 text-blue-700';
    label = 'Muy Bueno';
  } else if (calificacion >= 3) {
    bgColor = 'bg-amber-100 text-amber-700';
    label = 'Bueno';
  } else if (calificacion >= 2) {
    bgColor = 'bg-orange-100 text-orange-700';
    label = 'Regular';
  } else if (calificacion >= 1) {
    bgColor = 'bg-rose-100 text-rose-700';
    label = 'Malo';
  }
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bgColor}`}>
      {label}
    </span>
  );
};

export default function Calificacion() {
  const [formularios, setFormularios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const funcFormularios = async () => {
    try {
      const response = await formularioService.getAll();
      setFormularios(response.data);
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    funcFormularios();
  }, []);

  // Filtrar formularios
  const filteredFormularios = formularios.filter((f: any) => {
    const searchLower = filter.toLowerCase();
    return (
      f.persona?.nombre?.toLowerCase().includes(searchLower) ||
      f.Calificacion?.toString().includes(searchLower)
    );
  });

  // Calcular estadísticas
  const stats = {
    total: formularios.length,
    promedio: formularios.length > 0 
      ? (formularios.reduce((acc: number, f: any) => acc + (f.Calificacion || 0), 0) / formularios.length).toFixed(1)
      : 0,
    excelentes: formularios.filter((f: any) => f.Calificacion >= 5).length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 text-sm">Cargando calificaciones...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-amber-500 pl-4">
              Calificaciones
            </h2>
            <p className="text-slate-500 text-sm mt-1 pl-5">
              Evaluaciones de satisfacción de pacientes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Award className="text-amber-500" size={24} />
            <span className="text-sm font-medium text-slate-600">
              {stats.total} evaluaciones
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <TrendingUp className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Promedio</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-slate-800">{stats.promedio}</p>
                <Star className="fill-amber-400 text-amber-400" size={20} />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Award className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Excelentes</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.excelentes}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre de paciente..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de Calificaciones */}
        <div className="space-y-4">
          {filteredFormularios.length > 0 ? (
            filteredFormularios.map((formulario: any) => (
              <div
                key={formulario.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  {/* Header de la tarjeta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">
                        <User className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {formulario.persona?.nombre || 'Paciente Anónimo'}
                        </h3>
                        <p className="text-xs text-slate-400">
                          HC: {formulario.persona?.hcCode || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <CalificacionBadge calificacion={formulario.Calificacion} />
                  </div>

                  {/* Calificación con estrellas */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Calificación
                    </p>
                    <StarRating rating={formulario.Calificacion} />
                  </div>

                  {/* Footer con fecha */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(formulario.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(formulario.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span className="text-slate-300 font-mono">#{formulario.id}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <Star size={48} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-medium">No se encontraron calificaciones</p>
              <p className="text-slate-400 text-sm">
                {filter ? 'Intente ajustar los filtros de búsqueda' : 'Aún no hay evaluaciones registradas'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-right text-xs text-slate-400 pb-4">
          Mostrando {filteredFormularios.length} de {formularios.length} calificaciones
        </div>
      </div>
    </DashboardLayout>
  );
}