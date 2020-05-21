import { Component, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  @ViewChild('container') container: ElementRef;
  @Input() src: string;
  @Input() width = '80%';
  @Input() color = 'white';

  constructor() { }

}
