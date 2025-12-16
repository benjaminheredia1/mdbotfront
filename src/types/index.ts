export interface Usuario {
  id: number;
  nombre: string;
}

export interface Persona {
  id: number;
  nombre: string;
  hcCode: string;
  insurance?: string;
  business?: string;
  status?: string;
  area?: string;
  id_usuario?: number;
  createdAt: string;
}

export interface Queja {
  id: number;
  descripcion: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';
  area_medica: string;
  respuesta: string | null;
  id_persona: number;
  createdAt: string;
  persona?: Persona;
}

export interface Felicitacion {
  id: number;
  descripcion: string;
  area_medica: string;
  Respuesta: string | null;
  id_persona: number;
  createdAt: string;
  persona?: Persona;
}

export interface Solicitud {
  id: number;
  descripcion: string;
  area_medica: string;
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';
  Respuesta: string | null;
  id_persona: number;
  createdAt: string;
  persona?: Persona;
}

// =============================================
// TIPOS PARA WEBHOOKS
// =============================================

export interface WebhookQueja {
  id: number;
  hcCode: string;
  descripcion: string;
  nombrePaciente?: string;
  habitacion?: string;
  fechaHora?: string;
  estado: 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'CERRADO';
  createdAt: string;
}

export interface WebhookFelicitacion {
  id: number;
  hcCode: string;
  descripcion: string;
  nombrePaciente?: string;
  habitacion?: string;
  fechaHora?: string;
  estado: 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'CERRADO';
  createdAt: string;
}

export interface WebhookSolicitud {
  id: number;
  hcCode: string;
  descripcion: string;
  nombrePaciente?: string;
  habitacion?: string;
  fechaHora?: string;
  estado: 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO' | 'CERRADO';
  createdAt: string;
}

export interface WebhookPersona {
  id: number;
  hcCode: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  habitacion?: string;
  createdAt: string;
  updatedAt: string;
}
