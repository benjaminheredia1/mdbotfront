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
