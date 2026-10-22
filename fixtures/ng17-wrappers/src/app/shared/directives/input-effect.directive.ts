import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

/** Marca el control con `is-focused` mientras tiene el foco. */
@Directive({
  selector: '[inputEffectDirective]',
  standalone: true,
})
export class InputEffectDirective {
  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
  ) {}

  @HostListener('focusin')
  onFocus(): void {
    // Posible problema (global-dom-query): busca en todo el documento, no solo en este control.
    document.querySelectorAll('.is-focused').forEach((otro) => this.renderer.removeClass(otro, 'is-focused'));
    this.renderer.addClass(this.el.nativeElement, 'is-focused');
    // No es global: la búsqueda se limita al elemento de la directiva.
    this.el.nativeElement.querySelector('input')?.select();
  }

  @HostListener('focusout')
  onBlur(): void {
    this.renderer.removeClass(this.el.nativeElement, 'is-focused');
  }
}
