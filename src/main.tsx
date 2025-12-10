import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Quejas from './pages/Quejas.tsx';
import Felicitaciones from './pages/Felicitaciones.tsx';
import Solicitudes from './pages/Solicitudes.tsx';
import Personas from './pages/Personas.tsx';
import { authService } from './services/api.ts';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = authService.isAuthenticated();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
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
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
