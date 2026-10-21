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
    this.renderer.addClass(this.el.nativeElement, 'is-focused');
  }

  @HostListener('focusout')
  onBlur(): void {
    this.renderer.removeClass(this.el.nativeElement, 'is-focused');
  }
}
