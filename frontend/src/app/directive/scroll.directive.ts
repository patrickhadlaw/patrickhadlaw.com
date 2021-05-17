import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollX]',
  exportAs: 'scrollX'
})
export class ScrollXDirective {
  totalMove = 0;
  initialTouch = 0;
  touchMove = 0;

  constructor(private element: ElementRef) {}

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    this.element.nativeElement.scrollLeft -= event.deltaY / 4;
    this.totalMove += event.deltaY;
    event.preventDefault();
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.initialTouch = event.touches[0].pageX;
  }

  @HostListener('touchend')
  onTouchEnd() {
    this.totalMove = this.element.nativeElement.scrollLeft;
    this.touchMove = 0;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    this.touchMove = this.initialTouch - event.touches[0].pageX;
    this.element.nativeElement.scrollLeft = this.touchMove + this.totalMove;
    event.preventDefault();
  }

  /**
   * Scrolls left by nearest element
   */
  public scrollLeft(): void {
    for (const element of Array.from(this.element.nativeElement.childNodes).reverse() as HTMLElement[]) {
      const rect = element.getBoundingClientRect();
      if (rect != null) {
        const x = rect.left - this.element.nativeElement.getBoundingClientRect().left;
        if (x + rect.width < 0) {
          this.element.nativeElement.scrollLeft += x;
          break;
        }
      }
    }
  }

  /**
   * Scrolls right by nearest element
   */
  public scrollRight(): void {
    for (const element of this.element.nativeElement.childNodes as HTMLElement[]) {
      const rect = element.getBoundingClientRect();
      if (rect != null) {
        const x = rect.left - this.element.nativeElement.getBoundingClientRect().left;
        if (x > 0) {
          this.element.nativeElement.scrollLeft += x;
          break;
        }
      }
    }
  }
}
