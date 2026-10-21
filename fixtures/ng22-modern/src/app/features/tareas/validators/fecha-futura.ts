import { SchemaPath, validate } from '@angular/forms/signals';

/** Validador propio de Signal Forms: la fecha (yyyy-mm-dd) no puede ser anterior a hoy. */
export function fechaFutura(path: SchemaPath<string>, message = 'La fecha no puede estar en el pasado'): void {
  validate(path, ({ value }) => {
    const fecha = value();
    if (!fecha) {
      return null;
    }
    const hoy = new Date().toISOString().slice(0, 10);
    return fecha < hoy ? { kind: 'fechaFutura', message } : null;
  });
}
