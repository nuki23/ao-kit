/** Envoltorio que devuelve el backend en todas las respuestas. */
export interface RespuestaApi<T> {
  data: T;
  meta: {
    total?: number;
    pagina?: number;
  };
}
