import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Login from './pages/Login.tsx';
import AuthCallback from './pages/AuthCallback.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Quejas from './pages/Quejas.tsx';
import Felicitaciones from './pages/Felicitaciones.tsx';
import Solicitudes from './pages/Solicitudes.tsx';
import Personas from './pages/Personas.tsx';
import { getCookie } from './services/api.ts';
import Calificacion from './pages/Calificacion.tsx';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Verificar directamente la cookie además del servicio
  const token = getCookie('jwt_token');
  const isLoggedIn = token !== null && token.length > 0;

  console.log('ProtectedRoute - Token exists:', isLoggedIn, 'Token length:', token?.length);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Componente para redirigir si ya está autenticado
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getCookie('jwt_token');
  const isLoggedIn = token !== null && token.length > 0;

  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/quejas",
    element: (
      <ProtectedRoute>
        <Quejas />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/felicitaciones",
    element: (
      <ProtectedRoute>
        <Felicitaciones />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/solicitudes",
    element: (
      <ProtectedRoute>
        <Solicitudes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/personas",
    element: (
      <ProtectedRoute>
        <Personas />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/calificacion",
    element: <Calificacion />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  }
]);

createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
