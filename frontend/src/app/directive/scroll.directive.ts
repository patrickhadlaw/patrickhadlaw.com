import { Directive, ElementRef } from '@angular/core';

import { Vector } from '../vector';

@Directive({
    selector: '[scrollX]'
})
export class ScrollXDirective {
    element: ElementRef;
    totalMove: number = 0;
    initialTouch: number = 0;
    touchMove: number = 0;

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