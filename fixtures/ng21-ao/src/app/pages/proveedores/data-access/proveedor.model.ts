export interface Proveedor {
  id: number;
  nombre: string;
  documento: string;
  ciudad: string;
  correo: string;
  activo: boolean;
}

export type ProveedorPayload = Omit<Proveedor, 'id'>;

/** Respuesta paginada del servidor. */
export interface Pagina<T> {
  items: T[];
  total: number;
}

export interface ConsultaProveedores {
  pagina: number;
  tamano: number;
  q: string;
}
