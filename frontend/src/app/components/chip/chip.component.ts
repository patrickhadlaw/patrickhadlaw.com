import { Component, HostBinding, Input, OnInit } from '@angular/core';

type SizeInput = 'mini' | 'medium' | 'large';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss']
})
export class ChipComponent implements OnInit {

  restoreSize: SizeInput = 'medium';
  chipSize: SizeInput = 'medium';
  width = 0;
  clicked = false;

  get size(): SizeInput {
    return this.chipSize;
  }

  @Input() set size(value: SizeInput) {
    this.restoreSize = value;
    this.chipSize = this.restoreSize;
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
