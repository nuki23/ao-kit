export interface Proveedor {
  id: number;
  nombre: string;
  documento: string;
  ciudad: string;
  correo: string;
  activo: boolean;
}

export type ProveedorPayload = Omit<Proveedor, 'id'>;
