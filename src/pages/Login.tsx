import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/api';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    } catch (err: any) {
      console.error('Error:', err);
      console.error('Response data:', err.response?.data);
      
      let errorMessage = '';
      const responseData = err.response?.data;
      
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
      } else if (err.message && typeof err.message === 'string') {
        errorMessage = err.message;
      } else {
        errorMessage = isRegistering ? 'Error al registrar usuario' : 'Credenciales inválidas';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Sistema Hospitalario</h1>
        <h2>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="passwordConfirm">Confirmar Contraseña</label>
              <input
                type="password"
                id="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Procesando...' : isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>

        <button
          className="btn-link"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setSuccess('');
            setPasswordConfirm('');
          }}
        >
          {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  );
}
