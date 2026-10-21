import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Button } from '@acme/ui';
import { ButtonGroupComponent } from './button-group/button-group.component';
import { CardComponent } from './card/card.component';

// Button es standalone (de @acme/ui) y se importa y re-exporta desde un NgModule.
@NgModule({
  declarations: [CardComponent, ButtonGroupComponent],
  imports: [CommonModule, Button],
  exports: [CommonModule, Button, CardComponent, ButtonGroupComponent],
})
export class SharedModule {}
