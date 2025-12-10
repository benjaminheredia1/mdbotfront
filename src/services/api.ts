import axios from 'axios';

// En producción usa VITE_API_URL, en desarrollo usa el proxy /api
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create  ({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Funciones para manejar cookies
export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

// Interceptor para agregar el token JWT a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = getCookie('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No redirigir si es un error de login/register (el usuario está intentando autenticarse)
    const isAuthEndpoint = error.config?.url?.includes('/usuario/login') || 
                           error.config?.url?.includes('/usuario/create');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      deleteCookie('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Autenticación
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/usuario/login', { email, password });
    if (response.data.token) {
      setCookie('jwt_token', response.data.token);
    }
    return response;
  },
  register: (email: string, password: string, passwordConfirm: string) =>
    api.post('/usuario/create', { email, password, passwordConfirm }),
  logout: () => {
    deleteCookie('jwt_token');
  },
  isAuthenticated: () => {
    return getCookie('jwt_token') !== null;
  },
};

// Usuarios
export const usuarioService = {
  getAll: () => api.get('/usuario/findAll/'),
};

// Quejas
export const quejasService = {
  getAll: () => api.get('/quejas'),
  getById: (id: number) => api.get(`/quejas/${id}`),
  create: (data: { descripcion: string; id_persona: number; area_medica: string }) =>
    api.post('/quejas', data),
  update: (id: number, data: { descripcion?: string; area_medica?: string; estado?: string }) =>
    api.put(`/quejas/${id}`, data),
  delete: (id: number) => api.delete(`/quejas/${id}`),
};

// Felicitaciones
export const felicitacionService = {
  getAll: () => api.get('/felicitacion'),
  getById: (id: number) => api.get(`/felicitacion/${id}`),
  create: (data: { descripcion: string; area_medica: string; id_persona: number }) =>
    api.post('/felicitacion', data),
  update: (id: number, data: { descripcion?: string; area_medica?: string }) =>
    api.put(`/felicitacion/${id}`, data),
  delete: (id: number) => api.delete(`/felicitacion/${id}`),
};

// Solicitudes
export const solicitudService = {
  getAll: () => api.get('/solicitud'),
  getById: (id: number) => api.get(`/solicitud/${id}`),
  create: (data: { descripcion: string; id_persona: number; area: string }) =>
    api.post('/solicitud', data),
  update: (id: number, data: { descripcion?: string; area?: string; estado?: string }) =>
    api.put(`/solicitud/${id}`, data),
  delete: (id: number) => api.delete(`/solicitud/${id}`),
};

// Personas
export const personaService = {
  getAll: () => api.get('/persona'),
  getById: (id: number) => api.get(`/persona/${id}`),
  create: (data: {
    nombre: string;
    hcCode: string;
    insurance?: string;
    business?: string;
    status?: string;
    area?: string;
    id_usuario?: number;
  }) => api.post('/persona', data),
  update: (id: number, data: {
    nombre?: string;
    hcCode?: string;
    insurance?: string;
    business?: string;
    status?: string;
    area?: string;
    id_usuario?: number;
  }) => api.put(`/persona/${id}`, data),
  delete: (id: number) => api.delete(`/persona/${id}`),
};

export default api;
