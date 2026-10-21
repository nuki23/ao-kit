import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estado' })
export class EstadoPipe implements PipeTransform {
  transform(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}
