export type EstadoTarea = 'pendiente' | 'en-curso' | 'hecha';

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  categoriaId: string;
  vence: string;
  estado: EstadoTarea;
}

export type TareaPayload = Omit<Tarea, 'id'>;

export interface Categoria {
  id: string;
  nombre: string;
}
