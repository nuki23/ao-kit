import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CardComponent } from './components/card/card.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { FieldErrorComponent } from './components/field-error/field-error.component';
import { FieldComponent } from './components/field/field.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { MaterialModule } from './material.module';
import { EstadoPipe } from './pipes/estado.pipe';

@NgModule({
  declarations: [
    FieldComponent,
    FieldErrorComponent,
    CardComponent,
    ConfirmDialogComponent,
    AutofocusDirective,
    EstadoPipe,
  ],
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FieldComponent,
    CardComponent,
    ConfirmDialogComponent,
    AutofocusDirective,
    EstadoPipe,
  ],
  entryComponents: [ConfirmDialogComponent],
})
export class SharedModule {}
