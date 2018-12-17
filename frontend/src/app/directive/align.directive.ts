import { Directive, ElementRef } from '@angular/core';

@Directive({
    selector: '[appVectorAlignCenter]'
})
export class VectorAlignCenterDirective {
    constructor(element: ElementRef) {
        window.setTimeout(() => {
            let bbox = element.nativeElement.getBBox();
            element.nativeElement.setAttribute("dx", String(-bbox.width / 2));
        }, 0);
    }
}