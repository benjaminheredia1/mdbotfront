import { useState, useCallback } from 'react';
import {
  webhookService,
} from '../services/api';
import type {
  WebhookQuejaInput,
  WebhookFelicitacionInput,
  WebhookSolicitudInput,
  WebhookPersonaInput,
  WebhookEstadoInput,
  DashboardStats,
} from '../services/api';

/**
 * Hook personalizado para interactuar con los webhooks de la API
 * Los webhooks son endpoints públicos que no requieren autenticación JWT
 */
export const useWebhook = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wrapper para manejar loading y errores
  const withLoadingAndError = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear queja
  const crearQueja = useCallback(
    (data: WebhookQuejaInput) =>
      withLoadingAndError(() => webhookService.crearQueja(data)),
    [withLoadingAndError]
  );

  // Crear felicitación
  const crearFelicitacion = useCallback(
    (data: WebhookFelicitacionInput) =>
      withLoadingAndError(() => webhookService.crearFelicitacion(data)),
    [withLoadingAndError]
  );

  // Crear solicitud
  const crearSolicitud = useCallback(
    (data: WebhookSolicitudInput) =>
      withLoadingAndError(() => webhookService.crearSolicitud(data)),
    [withLoadingAndError]
  );

  // Crear o actualizar persona
  const crearPersona = useCallback(
    (data: WebhookPersonaInput) =>
      withLoadingAndError(() => webhookService.crearPersona(data)),
    [withLoadingAndError]
  );

  // Buscar persona por hcCode
  const buscarPersonaPorHcCode = useCallback(
    (hcCode: string) =>
      withLoadingAndError(() => webhookService.buscarPersonaPorHcCode(hcCode)),
    [withLoadingAndError]
  );

  // Actualizar estado
  const actualizarEstado = useCallback(
    (data: WebhookEstadoInput) =>
      withLoadingAndError(() => webhookService.actualizarEstado(data)),
    [withLoadingAndError]
  );

  // Obtener dashboard
  const obtenerDashboard = useCallback(
    (): Promise<DashboardStats | null> =>
      withLoadingAndError(() => webhookService.obtenerDashboard()),
    [withLoadingAndError]
  );

  // Limpiar error
  const clearError = useCallback(() => setError(null), []);

  return {
    // Estado
    loading,
    error,
    clearError,
    
    // Métodos
    crearQueja,
    crearFelicitacion,
    crearSolicitud,
    crearPersona,
    buscarPersonaPorHcCode,
    actualizarEstado,
    obtenerDashboard,
  };
};

export default useWebhook;
