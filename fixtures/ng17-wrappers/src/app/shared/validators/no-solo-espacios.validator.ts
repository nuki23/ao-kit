import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Rechaza textos que solo tienen espacios (Validators.required los deja pasar). */
export function noSoloEspacios(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0
      ? { soloEspacios: true }
      : null;
  };
}
