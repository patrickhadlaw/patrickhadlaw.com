import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chip',
  host: {
    '[style.width]': 'widthString',
    '[style.maxWidth.px]': '800'
  },
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss']
})
export class ChipComponent implements OnInit {
  originalSize = 'normal';
  size = 'normal';
  @Input('size') set sizeInput(size: string) {
    this.originalSize = size;
    this.size = this.originalSize;
  }
  get mini(): boolean {
    return this.size === 'mini';
  }
  get large(): boolean {
    return this.size === 'large';
  }
  get postfix(): string {
    switch (this.size) {
      case 'mini':
      case 'large':
        return ' ' + this.size;
      default:
        return '';
    }
  }
  get imageSize(): number {
    switch (this.size) {
      case 'mini':
        return 0;
      case 'large':
        return 150;
      default:
        return 37.5;
    }
  }
  get widthString(): string {
    switch (this.size) {
      case 'mini':
        return 'auto';
      case 'large':
        return '80%';
      default:
        return '20%';
    }
  }
  @Input() clickSize = '';
  get clickable(): boolean {
    return this.clickSize.length > 0;
  }
  @Input() src = '';
  @Input() header = '';

  width = 0;
  clicked = false;

  constructor() { }

  ngOnInit() {
    this.width = window.innerWidth;
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
    });
    window.addEventListener('click', () => {
      if (!this.clicked) {
        this.size = this.originalSize;
      } else {
        this.clicked = false;
      }
    });
  }

  onClick(event: MouseEvent) {
    if (this.clickSize.length > 0) {
      if (this.size === this.originalSize) {
        this.size = this.clickSize;
      } else {
        this.size = this.originalSize;
      }
    }
    this.clicked = true;
  }
}
