import { Component, Input, HostListener, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-image-button',
  templateUrl: './image-button.component.html',
  styleUrls: ['./image-button.component.scss']
})
export class ImageButtonComponent {
  @ViewChild('imageButton') imageButton: ElementRef;
  @Input() src: string;
  @Input() header: string;
  @Input() href: string;
  @Input() download: string;
  @Input() button: string;
  @Input() size = 200;

  mouseOver = false;

  constructor() { }
}
