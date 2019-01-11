import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
    selector: '[alignTextFitWidth]'
})
export class VectorTextFitWidthDirective implements OnChanges {
    @Input('alignTextFitWidth') width: number;
    @Input('x') x: number;
    @Input('y') y: number;
    element: ElementRef;
    constructor(element: ElementRef) {
        this.element = element;
        this.update();
    }

    ngOnChanges() {
        this.update();
    }

    public update() {
        // window.setTimeout(() => {
            let bbox = this.element.nativeElement.getBBox();
            let scale = this.width / bbox.width;
            // if (scale < 1) {
                this.element.nativeElement.style.transform = 'translate(' + (1-scale)*this.x + 'px, ' + (1-scale)*this.y + 'px) scale(' + scale + ')';
            // }
        // }, 0);
    }
}