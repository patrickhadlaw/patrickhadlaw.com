import { Component, Input, ViewChild, ElementRef, HostListener, AfterViewInit, AfterContentChecked } from '@angular/core';

@Component({
    selector: 'app-hero',
    templateUrl: './hero.component.html',
    styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements AfterViewInit, AfterContentChecked {
    @ViewChild('container') container: ElementRef;
    @Input('src') src: string;
    @Input('width') width = '80%';
    @Input('color') color = 'white';

    imageHeight = 0;
    imageWidth = 0;
    smallMode = false;

    constructor() { }

    ngAfterViewInit() { }

    ngAfterContentChecked() {
        this.onResize();
    }

    @HostListener('window:resize')
    onResize() {
        if (this.imageHeight <= 0) {
            this.imageHeight = this.container.nativeElement.offsetHeight;
        }
        if (window.innerWidth < 700) {
            this.smallMode = true;
        } else {
            this.smallMode = false;
        }
    }

}
