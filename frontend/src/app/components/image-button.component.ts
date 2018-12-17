import { Component, Input, HostListener, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-image-button',
    templateUrl: './image-button.component.html',
    styleUrls: ['./image-button.component.scss']
})
export class ImageButtonComponent {
    @ViewChild('imageButton') imageButton: ElementRef;
    @Input('src') src: string;
    @Input('header') header: string;
    @Input('href') href: string;
    @Input('download') download: string;
    @Input('button') button: string;
    @Input('size') size = 200;

    mouseOver = false;

    constructor() { }
}
