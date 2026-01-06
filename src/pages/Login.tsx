import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/api';
import { Activity, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

// Icono de Google SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    // Redirigir al backend para iniciar el flujo OAuth con Google
    const API_URL = import.meta.env.VITE_API_URL || 'https://mdbotback.vercel.app';
    window.location.href = `${API_URL}/auth/google`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering) {
        if (password !== passwordConfirm) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        await authService.register(email, password, passwordConfirm);
        setSuccess('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
        setIsRegistering(false);
        setPassword('');
        setPasswordConfirm('');
      } else {
        await authService.login(email, password);
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      console.error('Error:', err);
      const error = err as { response?: { data?: { message?: string | string[] | object; error?: string } }; message?: string };
      console.error('Response data:', error.response?.data);

      let errorMessage = '';
      const responseData = error.response?.data;

      if (responseData) {
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (typeof responseData.message === 'string') {
          errorMessage = responseData.message;
        } else if (Array.isArray(responseData.message)) {
          errorMessage = responseData.message.join(', ');
        } else if (typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if (responseData.message && typeof responseData.message === 'object') {
          errorMessage = JSON.stringify(responseData.message);
        } else {
          errorMessage = 'Error en la solicitud';
        }
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      } else {
        errorMessage = isRegistering ? 'Error al registrar usuario' : 'Credenciales inválidas';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="usuario@ejemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none text-sm transition-all"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                <CheckCircle size={18} />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </>
              ) : (
                isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Separador */}
          {!isRegistering && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-400">o continúa con</span>
                </div>
              </div>

              {/* Botón de Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm flex items-center justify-center gap-3 shadow-sm hover:shadow"
              >
                <GoogleIcon />
                Continuar con Google
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccess('');
                setPasswordConfirm('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
