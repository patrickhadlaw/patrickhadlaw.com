import { Component, ViewChild, ElementRef, HostListener, Input, AfterViewInit, OnChanges } from '@angular/core';

import { Color } from '../util/color';

@Component({
  selector: 'app-color-bar',
  templateUrl: './color-bar.component.html',
  styleUrls: ['./color-bar.component.scss']
})
export class ColorBarComponent implements OnChanges, AfterViewInit {
  @ViewChild('canvas') canvas: ElementRef;
  @Input() height = 4;
  @Input() animationElements = 100;
  @Input() animationRows = 2;
  @Input() colorA = '#ff0000';
  @Input() colorB = '#ffff00';
  @Input() backgroundColor: string;
  @Input() rectWidth = 40;

  width: number;
  animationData: any[][];
  context: CanvasRenderingContext2D;

  constructor() { }

  ngOnChanges() {
    this.backgroundColor = Color.mix(new Color(this.colorA), new Color(this.colorB), 0.5).toHexString();
  }

  ngAfterViewInit() {
    setTimeout(_ => this.width = this.canvas.nativeElement.offsetWidth);
    this.context = this.canvas.nativeElement.getContext('2d');
    setInterval(() => this.update(), 30);
  }

  generateAnimationElements() {
    this.animationData = [];
    for (let i = 0; i < this.animationRows; i++) {
      for (let j = 0; j < this.animationElements; j++) {
        this.animationData.push([
          Math.round(Math.random() * (this.canvas.nativeElement.offsetWidth - this.rectWidth)),
          Math.floor(i * (this.height / this.animationRows)),
          Math.random() * 2 - 1,
          Color.mix(new Color(this.colorA), new Color(this.colorB), Math.random() * 0.5 + 0.5).toHexString()
        ]);
      }
    }
  }

  scatterAnimationElements() {
    for (let i = 0; i < this.animationRows * this.animationElements; i++) {
      this.animationData[i][0] = Math.round(Math.random() * (this.canvas.nativeElement.offsetWidth - this.rectWidth));
    }
  }

  update() {
    if (this.animationData !== undefined) {
      for (let i = 0; i < this.animationRows * this.animationElements; i++) {
        this.animationData[i][0] += this.animationData[i][2];
        if (this.animationData[i][0] <= 0) {
          this.animationData[i][0] = 0;
          this.animationData[i][2] = -this.animationData[i][2];
        } else if (this.animationData[i][0] >= this.canvas.nativeElement.offsetWidth - this.rectWidth) {
          this.animationData[i][0] = this.canvas.nativeElement.offsetWidth - this.rectWidth;
          this.animationData[i][2] = -this.animationData[i][2];
        }
        this.context.beginPath();
        this.context.rect(this.animationData[i][0], this.animationData[i][1], this.rectWidth, this.height / this.animationRows);
        this.context.fillStyle = this.animationData[i][3];
        this.context.fill();
      }
    } else {
      this.generateAnimationElements();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.width = this.canvas.nativeElement.offsetWidth;
    this.scatterAnimationElements();
  }

}
