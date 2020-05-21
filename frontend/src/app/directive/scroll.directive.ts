import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollX]'
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
  }
}
