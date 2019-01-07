import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
    selector: '[alignTextFitWidth]'
})
export class VectorTextFitWidthDirective implements OnChanges {
    @Input('alignTextFitWidth') width: number;
    element: ElementRef;
    constructor(element: ElementRef) {
        this.element = element;
        this.update();
    }

    ngOnChanges() {
        this.update();
    }

    public update() {
        window.setTimeout(() => {
            let bbox = this.element.nativeElement.getBBox();
            let scale = this.width / bbox.width;
            let x = parseFloat(this.element.nativeElement.getAttribute('x'));
            let y = parseFloat(this.element.nativeElement.getAttribute('y'));
            if (scale < 1) {
                this.element.nativeElement.style.transform = 'scale(' + scale + ')';
            }
        }, 0);
    }
}