import { Component, HostBinding, Input, OnInit } from '@angular/core';

type SizeInput = 'mini' | 'medium' | 'large';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss']
})
export class ChipComponent implements OnInit {

  restoreSize: SizeInput = 'medium';
  size: SizeInput = 'medium';
  width = 0;
  clicked = false;

  @Input('size') set sizeInput(size: SizeInput) {
    this.restoreSize = size;
    this.size = this.restoreSize;
  }
  @Input() clickSize?: SizeInput;
  @Input() src = '';
  @Input() header = '';

  @HostBinding('style.width') get hostWidth(): string {
    return this.size === 'mini' ? 'unset' : '100%';
  }

  get imageSize(): number {
    switch (this.size) {
      case 'mini':
        return 0;
      case 'medium':
        return 75;
      default:
        return 150;
    }
  }

  get showImage(): boolean {
    return this.src.length > 0 && this.size !== 'mini' && this.width > 800;
  }

  get clickable(): boolean {
    return this.clickSize != null;
  }

  constructor() { }

  ngOnInit() {
    this.width = window.innerWidth;
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
    });
    window.addEventListener('click', () => {
      if (!this.clicked) {
        this.size = this.restoreSize;
      } else {
        this.clicked = false;
      }
    });
  }

  onClick(event: MouseEvent) {
    if (this.clickSize != null) {
      if (this.size === this.restoreSize) {
        this.size = this.clickSize;
      } else {
        this.size = this.restoreSize;
      }
    }
    this.clicked = true;
  }
}
