import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollX]'
})
export class ScrollXDirective {
  element: ElementRef;
  totalMove = 0;
  initialTouch = 0;
  touchMove = 0;

  constructor(element: ElementRef) {
    this.element = element;
    this.element.nativeElement.addEventListener('wheel', (event: WheelEvent) => {
      this.onScroll(event.deltaY);
      this.totalMove += event.deltaY;
    });
    this.element.nativeElement.addEventListener('touchstart', (event: TouchEvent) => { this.initialTouch = event.touches[0].pageX });
    this.element.nativeElement.addEventListener('touchend', (event: TouchEvent) => {
      this.totalMove = this.element.nativeElement.scrollLeft;
      this.touchMove = 0;
    });
    this.element.nativeElement.addEventListener('touchmove', (event: TouchEvent) => {
      this.touchMove = this.initialTouch - event.touches[0].pageX;
      this.element.nativeElement.scrollLeft = this.touchMove + this.totalMove;
    });
  }

  onScroll(scroll: number) {
    this.element.nativeElement.scrollLeft -= scroll / 4;
  }
}
