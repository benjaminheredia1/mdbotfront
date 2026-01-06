import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { setCookie } from '../services/api';
import { Activity, Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const errorParam = params.get('error');

      if (errorParam) {
        setError('Error en la autenticación con Google');
        setTimeout(() => navigate('/login?error=auth_failed'), 3000);
        return;
      }

      if (token) {
        // Guardar el token en la cookie
        setCookie('jwt_token', token, 7);
        // Redirigir al dashboard
        navigate('/dashboard');
      } else {
        setError('No se recibió el token de autenticación');
        setTimeout(() => navigate('/login?error=no_token'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Activity className="text-blue-500" size={32} />
            <span className="text-white font-bold text-2xl tracking-tight">Portal FQS</span>
          </div>
          <p className="text-slate-400 text-sm">Sistema de Gestión Hospitalaria</p>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {error ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-rose-500" size={32} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Error de Autenticación</h2>
              <p className="text-slate-500 mb-4">{error}</p>
              <p className="text-sm text-slate-400">Redirigiendo al login...</p>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="text-blue-500 animate-spin" size={32} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Autenticando...</h2>
              <p className="text-slate-500">Verificando credenciales de Google</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
